const db = require('../config/database');
const { generateLoanCode } = require('../utils/generateId');

const getAllLoans = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status } = req.query;
    const offset = (page - 1) * limit;

    let where = 'WHERE 1=1';
    const params = [];

    if (search) {
      where += ' AND (l.loan_code LIKE ? OR m.full_name LIKE ? OR m.member_code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) {
      where += ' AND l.status = ?';
      params.push(status);
    }

    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM loans l 
       JOIN members m ON l.member_id = m.id ${where}`,
      params
    );

    const [loans] = await db.query(
      `SELECT l.*, m.full_name as member_name, m.member_code, u.full_name as processed_by
       FROM loans l
       JOIN members m ON l.member_id = m.id
       JOIN users u ON l.user_id = u.id
       ${where}
       ORDER BY l.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({
      success: true,
      data: loans,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data peminjaman.' });
  }
};

const getLoanById = async (req, res) => {
  try {
    const [loans] = await db.query(
      `SELECT l.*, m.full_name as member_name, m.member_code, m.phone as member_phone,
              u.full_name as processed_by
       FROM loans l
       JOIN members m ON l.member_id = m.id
       JOIN users u ON l.user_id = u.id
       WHERE l.id = ?`,
      [req.params.id]
    );

    if (loans.length === 0) {
      return res.status(404).json({ success: false, message: 'Peminjaman tidak ditemukan.' });
    }

    const [details] = await db.query(
      `SELECT ld.*, b.title, b.author, b.isbn, b.cover_image
       FROM loan_details ld
       JOIN books b ON ld.book_id = b.id
       WHERE ld.loan_id = ?`,
      [req.params.id]
    );

    res.json({ success: true, data: { ...loans[0], details } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil detail peminjaman.' });
  }
};

const createLoan = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { member_id, books, due_date, notes } = req.body;
    // books = [{ book_id, quantity }]

    if (!member_id || !books || !Array.isArray(books) || books.length === 0) {
      return res.status(400).json({ success: false, message: 'Data peminjaman tidak lengkap.' });
    }

    // Check member
    const [members] = await connection.query('SELECT * FROM members WHERE id = ? AND status = "active"', [member_id]);
    if (members.length === 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Anggota tidak ditemukan atau tidak aktif.' });
    }

    // Get settings
    const [settings] = await connection.query('SELECT setting_key, setting_value FROM settings');
    const settingsMap = Object.fromEntries(settings.map(s => [s.setting_key, s.setting_value]));
    const maxBooks = parseInt(settingsMap.max_books_per_loan) || 3;
    const maxActive = parseInt(settingsMap.max_active_loans) || 5;
    const maxDays = parseInt(settingsMap.max_loan_days) || 7;

    // Check active loans count
    const [activeLoans] = await connection.query(
      'SELECT COUNT(*) as count FROM loans WHERE member_id = ? AND status = "active"',
      [member_id]
    );
    if (activeLoans[0].count >= maxActive) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: `Anggota sudah mencapai batas maksimal ${maxActive} peminjaman aktif.` });
    }

    // Validate books availability
    let totalQty = 0;
    for (const item of books) {
      totalQty += item.quantity || 1;
      const [book] = await connection.query('SELECT * FROM books WHERE id = ?', [item.book_id]);
      if (book.length === 0) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: `Buku ID ${item.book_id} tidak ditemukan.` });
      }
      if (book[0].available < (item.quantity || 1)) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: `Stok buku "${book[0].title}" tidak mencukupi.` });
      }
    }

    if (totalQty > maxBooks) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: `Maksimal ${maxBooks} buku per peminjaman.` });
    }

    const loan_code = generateLoanCode();
    const loan_date = new Date().toISOString().split('T')[0];
    const calculatedDue = due_date || new Date(Date.now() + maxDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [loanResult] = await connection.query(
      `INSERT INTO loans (loan_code, member_id, user_id, loan_date, due_date, status, notes)
       VALUES (?, ?, ?, ?, ?, 'active', ?)`,
      [loan_code, member_id, req.user.id, loan_date, calculatedDue, notes || null]
    );

    const loanId = loanResult.insertId;

    for (const item of books) {
      const qty = item.quantity || 1;
      await connection.query(
        `INSERT INTO loan_details (loan_id, book_id, quantity, status) VALUES (?, ?, ?, 'borrowed')`,
        [loanId, item.book_id, qty]
      );
      await connection.query(
        'UPDATE books SET available = available - ? WHERE id = ?',
        [qty, item.book_id]
      );
    }

    await connection.commit();

    // Fetch complete data
    const [newLoan] = await db.query(
      `SELECT l.*, m.full_name as member_name FROM loans l JOIN members m ON l.member_id = m.id WHERE l.id = ?`,
      [loanId]
    );

    res.status(201).json({
      success: true,
      message: 'Peminjaman berhasil dibuat.',
      data: newLoan[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal membuat peminjaman.' });
  } finally {
    connection.release();
  }
};

module.exports = { getAllLoans, getLoanById, createLoan };
