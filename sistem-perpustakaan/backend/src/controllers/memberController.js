const db = require('../config/database');
const { generateMemberCode } = require('../utils/generateId');

const getAllMembers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status } = req.query;
    const offset = (page - 1) * limit;

    let where = 'WHERE 1=1';
    const params = [];

    if (search) {
      where += ' AND (full_name LIKE ? OR member_code LIKE ? OR email LIKE ? OR phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) {
      where += ' AND status = ?';
      params.push(status);
    }

    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM members ${where}`, params);
    const total = countResult[0].total;

    const [members] = await db.query(
      `SELECT * FROM members ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({
      success: true,
      data: members,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data anggota.' });
  }
};

const getMemberById = async (req, res) => {
  try {
    const [members] = await db.query('SELECT * FROM members WHERE id = ?', [req.params.id]);
    if (members.length === 0) {
      return res.status(404).json({ success: false, message: 'Anggota tidak ditemukan.' });
    }

    // Get loan history
    const [loans] = await db.query(
      `SELECT l.*, 
        (SELECT COUNT(*) FROM loan_details ld WHERE ld.loan_id = l.id) as book_count
       FROM loans l WHERE l.member_id = ? ORDER BY l.loan_date DESC LIMIT 10`,
      [req.params.id]
    );

    res.json({ success: true, data: { ...members[0], recent_loans: loans } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil detail anggota.' });
  }
};

const createMember = async (req, res) => {
  try {
    const { full_name, email, phone, address, join_date, status } = req.body;
    if (!full_name) {
      return res.status(400).json({ success: false, message: 'Nama lengkap wajib diisi.' });
    }

    const member_code = generateMemberCode();
    const join = join_date || new Date().toISOString().split('T')[0];

    const [result] = await db.query(
      `INSERT INTO members (member_code, full_name, email, phone, address, join_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [member_code, full_name, email || null, phone || null, address || null, join, status || 'active']
    );

    const [newMember] = await db.query('SELECT * FROM members WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Anggota berhasil ditambahkan.', data: newMember[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menambahkan anggota.' });
  }
};

const updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, phone, address, status } = req.body;

    const [existing] = await db.query('SELECT * FROM members WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Anggota tidak ditemukan.' });
    }

    await db.query(
      `UPDATE members SET full_name=?, email=?, phone=?, address=?, status=? WHERE id=?`,
      [full_name, email || null, phone || null, address || null, status || existing[0].status, id]
    );

    const [updated] = await db.query('SELECT * FROM members WHERE id = ?', [id]);
    res.json({ success: true, message: 'Anggota berhasil diperbarui.', data: updated[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui anggota.' });
  }
};

const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;

    const [activeLoans] = await db.query(
      `SELECT id FROM loans WHERE member_id = ? AND status = 'active'`,
      [id]
    );
    if (activeLoans.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Anggota tidak dapat dihapus karena masih memiliki peminjaman aktif.'
      });
    }

    const [result] = await db.query('DELETE FROM members WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Anggota tidak ditemukan.' });
    }
    res.json({ success: true, message: 'Anggota berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menghapus anggota.' });
  }
};

module.exports = { getAllMembers, getMemberById, createMember, updateMember, deleteMember };
