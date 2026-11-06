const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
require('dotenv').config();

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username dan password wajib diisi.'
      });
    }

    const [users] = await db.query(
      'SELECT * FROM users WHERE (username = ? OR email = ?) AND is_active = 1',
      [username, username]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah.'
      });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah.'
      });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, full_name: user.full_name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

const getProfile = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, username, email, full_name, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    res.json({ success: true, data: users[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password lama dan baru wajib diisi.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password baru minimal 6 karakter.'
      });
    }

    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Password lama salah.' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);

    res.json({ success: true, message: 'Password berhasil diubah.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

module.exports = { login, getProfile, changePassword };
