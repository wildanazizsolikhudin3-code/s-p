const db = require('../config/database');
const { calculateFine } = require('../utils/calculateFine');

const processReturn = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { loan_id, details } = req.body;
    // details = [{ loan_detail_id, return_date? }]

    if (!loan_id || !details || !Array.isArray(details) || details.length === 0) {
      return res.status(400).json({ success: false, message: 'Data pengembalian tidak lengkap.' });
    }

    const [loans] = await connection.query('SELECT * FROM loans WHERE id = ?', [loan_id]);
    if (loans.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Peminjaman tidak ditemukan.' });
    }

    // Get fine per day
    const [settings] = await connection.query(
      "SELECT setting_value FROM settings WHERE setting_key = 'fine_per_day'"
    );
    const finePerDay = parseInt(settings[0]?.setting_value) || 1000;

    let totalFine = 0;
    const returnDate = new Date().toISOString().split('T')[0];

    for (const item of details) {
      const [detail] = await connection.query(
        'SELECT * FROM loan_details WHERE id = ? AND loan_id = ? AND status = "borrowed"',
        [item.loan_detail_id, loan_id]
      );

      if (detail.length === 0) continue;

      const fine = calculateFine(loans[0].due_date, returnDate, finePerDay);
      totalFine += fine;

      await connection.query(
        `UPDATE loan_details SET status = 'returned', return_date = ?, fine = ? WHERE id = ?`,
        [returnDate, fine, item.loan_detail_id]
      );

      await connection.query(
        'UPDATE books SET available = available + ? WHERE id = ?',
        [detail[0].quantity, detail[0].book_id]
      );
    }

    // Check if all details returned
    const [remaining] = await connection.query(
      'SELECT COUNT(*) as count FROM loan_details WHERE loan_id = ? AND status = "borrowed"',
      [loan_id]
    );

    const newStatus = remaining[0].count === 0 ? 'returned' : 'active';
    await connection.query('UPDATE loans SET status = ? WHERE id = ?', [newStatus, loan_id]);

    await connection.commit();

    res.json({
      success: true,
      message: 'Pengembalian berhasil diproses.',
      data: { total_fine: totalFine, status: newStatus }
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal memproses pengembalian.' });
  } finally {
    connection.release();
  }
};

const getPendingReturns = async (req, res) => {
  try {
    const [loans] = await db.query(
      `SELECT l.*, m.full_name as member_name, m.member_code,
        (SELECT COUNT(*) FROM loan_details ld WHERE ld.loan_id = l.id AND ld.status = 'borrowed') as pending_books
       FROM loans l
       JOIN members m ON l.member_id = m.id
       WHERE l.status IN ('active', 'overdue')
       ORDER BY l.due_date ASC`
    );
    res.json({ success: true, data: loans });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data pengembalian.' });
  }
};

module.exports = { processReturn, getPendingReturns };
