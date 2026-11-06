const db = require('../config/database');
const path = require('path');
const fs = require('fs');

const getAllBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category_id, available } = req.query;
    const offset = (page - 1) * limit;

    let where = 'WHERE 1=1';
    const params = [];

    if (search) {
      where += ' AND (b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (category_id) {
      where += ' AND b.category_id = ?';
      params.push(category_id);
    }
    if (available === 'true') {
      where += ' AND b.available > 0';
    }

    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM books b ${where}`,
      params
    );
    const total = countResult[0].total;

    const [books] = await db.query(
      `SELECT b.*, c.name as category_name 
       FROM books b 
       LEFT JOIN categories c ON b.category_id = c.id 
       ${where}
       ORDER BY b.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({
      success: true,
      data: books,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data buku.' });
  }
};

const getBookById = async (req, res) => {
  try {
    const [books] = await db.query(
      `SELECT b.*, c.name as category_name 
       FROM books b 
       LEFT JOIN categories c ON b.category_id = c.id 
       WHERE b.id = ?`,
      [req.params.id]
    );

    if (books.length === 0) {
      return res.status(404).json({ success: false, message: 'Buku tidak ditemukan.' });
    }

    res.json({ success: true, data: books[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil detail buku.' });
  }
};

const createBook = async (req, res) => {
  try {
    const { isbn, title, author, publisher, publication_year, category_id, stock, description } = req.body;
    
    if (!title || !author) {
      return res.status(400).json({ success: false, message: 'Judul dan penulis wajib diisi.' });
    }

    const cover_image = req.file ? req.file.filename : null;
    const available = parseInt(stock) || 0;

    const [result] = await db.query(
      `INSERT INTO books (isbn, title, author, publisher, publication_year, category_id, stock, available, cover_image, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [isbn || null, title, author, publisher || null, publication_year || null, category_id || null, available, available, cover_image, description || null]
    );

    const [newBook] = await db.query(
      `SELECT b.*, c.name as category_name FROM books b LEFT JOIN categories c ON b.category_id = c.id WHERE b.id = ?`,
      [result.insertId]
    );

    res.status(201).json({ success: true, message: 'Buku berhasil ditambahkan.', data: newBook[0] });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'ISBN sudah terdaftar.' });
    }
    res.status(500).json({ success: false, message: 'Gagal menambahkan buku.' });
  }
};

const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { isbn, title, author, publisher, publication_year, category_id, stock, description } = req.body;

    const [existing] = await db.query('SELECT * FROM books WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Buku tidak ditemukan.' });
    }

    let cover_image = existing[0].cover_image;
    if (req.file) {
      // Delete old cover if exists
      if (cover_image) {
        const oldPath = path.join(process.env.UPLOAD_PATH || './src/uploads/book-covers', cover_image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      cover_image = req.file.filename;
    }

    // Adjust available based on stock change
    const stockDiff = (parseInt(stock) || existing[0].stock) - existing[0].stock;
    const newAvailable = Math.max(0, existing[0].available + stockDiff);

    await db.query(
      `UPDATE books SET isbn=?, title=?, author=?, publisher=?, publication_year=?, category_id=?, stock=?, available=?, cover_image=?, description=? WHERE id=?`,
      [isbn || null, title, author, publisher || null, publication_year || null, category_id || null, parseInt(stock) || 0, newAvailable, cover_image, description || null, id]
    );

    const [updated] = await db.query(
      `SELECT b.*, c.name as category_name FROM books b LEFT JOIN categories c ON b.category_id = c.id WHERE b.id = ?`,
      [id]
    );

    res.json({ success: true, message: 'Buku berhasil diperbarui.', data: updated[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui buku.' });
  }
};

const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if book is currently on loan
    const [loans] = await db.query(
      `SELECT ld.id FROM loan_details ld 
       JOIN loans l ON ld.loan_id = l.id 
       WHERE ld.book_id = ? AND ld.status = 'borrowed'`,
      [id]
    );

    if (loans.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Buku tidak dapat dihapus karena masih dipinjam.'
      });
    }

    const [existing] = await db.query('SELECT cover_image FROM books WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Buku tidak ditemukan.' });
    }

    if (existing[0].cover_image) {
      const filePath = path.join(process.env.UPLOAD_PATH || './src/uploads/book-covers', existing[0].cover_image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await db.query('DELETE FROM books WHERE id = ?', [id]);
    res.json({ success: true, message: 'Buku berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menghapus buku.' });
  }
};

module.exports = { getAllBooks, getBookById, createBook, updateBook, deleteBook };
