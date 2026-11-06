const db = require('../config/database');

const getAllCategories = async (req, res) => {
  try {
    const [categories] = await db.query(
      `SELECT c.*, COUNT(b.id) as book_count 
       FROM categories c 
       LEFT JOIN books b ON c.id = b.category_id 
       GROUP BY c.id 
       ORDER BY c.name ASC`
    );
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data kategori.' });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Nama kategori wajib diisi.' });
    }

    const [result] = await db.query(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description || null]
    );

    const [newCat] = await db.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Kategori berhasil ditambahkan.', data: newCat[0] });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Nama kategori sudah ada.' });
    }
    res.status(500).json({ success: false, message: 'Gagal menambahkan kategori.' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const [existing] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan.' });
    }

    await db.query('UPDATE categories SET name = ?, description = ? WHERE id = ?', [name, description || null, id]);
    const [updated] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
    res.json({ success: true, message: 'Kategori berhasil diperbarui.', data: updated[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui kategori.' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const [books] = await db.query('SELECT id FROM books WHERE category_id = ?', [id]);
    if (books.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Kategori tidak dapat dihapus karena masih memiliki buku.'
      });
    }

    const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan.' });
    }

    res.json({ success: true, message: 'Kategori berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menghapus kategori.' });
  }
};

module.exports = { getAllCategories, createCategory, updateCategory, deleteCategory };
