const bcrypt = require('bcryptjs');
const db = require('../config/database');

const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, username, email, full_name, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data user.' });
  }
};

const createUser = async (req, res) => {
  try {
    const { username, email, password, full_name, role } = req.body;
    if (!username || !email || !password || !full_name) {
      return res.status(400).json({ success: false, message: 'Semua field wajib diisi.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (username, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashed, full_name, role || 'librarian']
    );

    const [newUser] = await db.query(
      'SELECT id, username, email, full_name, role, is_active, created_at FROM users WHERE id = ?',
      [result.insertId]
    );
    res.status(201).json({ success: true, message: 'User berhasil ditambahkan.', data: newUser[0] });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Username atau email sudah digunakan.' });
    }
    res.status(500).json({ success: false, message: 'Gagal menambahkan user.' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, full_name, role, is_active, password } = req.body;

    const [existing] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    let query = 'UPDATE users SET email=?, full_name=?, role=?, is_active=?';
    const params = [email, full_name, role, is_active !== undefined ? is_active : existing[0].is_active];

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      query += ', password=?';
      params.push(hashed);
    }
    query += ' WHERE id=?';
    params.push(id);

    await db.query(query, params);
    const [updated] = await db.query(
      'SELECT id, username, email, full_name, role, is_active, created_at FROM users WHERE id = ?',
      [id]
    );
    res.json({ success: true, message: 'User berhasil diperbarui.', data: updated[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui user.' });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Tidak dapat menghapus akun sendiri.' });
    }

    const [result] = await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }
    res.json({ success: true, message: 'User berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menghapus user.' });
  }
};

module.exports = { getAllUsers, createUser, updateUser, deleteUser };
