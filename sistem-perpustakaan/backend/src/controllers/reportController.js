const db = require('../config/database');

const getDashboardStats = async (req, res) => {
  try {
    const [[books]] = await db.query('SELECT COUNT(*) as total, SUM(available) as available FROM books');
    const [[members]] = await db.query('SELECT COUNT(*) as total FROM members WHERE status = "active"');
    const [[activeLoans]] = await db.query('SELECT COUNT(*) as total FROM loans WHERE status = "active"');
    const [[overdue]] = await db.query('SELECT COUNT(*) as total FROM loans WHERE status = "overdue" OR (status = "active" AND due_date < CURDATE())');
    const [[categories]] = await db.query('SELECT COUNT(*) as total FROM categories');

    // Recent activities
    const [recentLoans] = await db.query(
      `SELECT l.loan_code, l.loan_date, l.status, m.full_name as member_name
       FROM loans l JOIN members m ON l.member_id = m.id
       ORDER BY l.created_at DESC LIMIT 5`
    );

    // Category distribution
    const [categoryStats] = await db.query(
      `SELECT c.name, COUNT(b.id) as count
       FROM categories c LEFT JOIN books b ON c.id = b.category_id
       GROUP BY c.id ORDER BY count DESC`
    );

    // Monthly loans (last 6 months)
    const [monthlyLoans] = await db.query(
      `SELECT DATE_FORMAT(loan_date, '%Y-%m') as month, COUNT(*) as count
       FROM loans
       WHERE loan_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
       GROUP BY month ORDER BY month ASC`
    );

    res.json({
      success: true,
      data: {
        stats: {
          total_books: books.total || 0,
          available_books: books.available || 0,
          total_members: members.total || 0,
          active_loans: activeLoans.total || 0,
          overdue_loans: overdue.total || 0,
          total_categories: categories.total || 0
        },
        recent_loans: recentLoans,
        category_stats: categoryStats,
        monthly_loans: monthlyLoans
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal mengambil statistik.' });
  }
};

const getBookReport = async (req, res) => {
  try {
    const [books] = await db.query(
      `SELECT b.*, c.name as category_name,
        (SELECT COUNT(*) FROM loan_details ld WHERE ld.book_id = b.id) as total_loans
       FROM books b LEFT JOIN categories c ON b.category_id = c.id
       ORDER BY total_loans DESC`
    );
    res.json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil laporan buku.' });
  }
};

const getMemberReport = async (req, res) => {
  try {
    const [members] = await db.query(
      `SELECT m.*,
        (SELECT COUNT(*) FROM loans l WHERE l.member_id = m.id) as total_loans,
        (SELECT COUNT(*) FROM loans l WHERE l.member_id = m.id AND l.status = 'active') as active_loans
       FROM members m ORDER BY total_loans DESC`
    );
    res.json({ success: true, data: members });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil laporan anggota.' });
  }
};

const getTransactionReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    let where = 'WHERE 1=1';
    const params = [];

    if (start_date) {
      where += ' AND l.loan_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      where += ' AND l.loan_date <= ?';
      params.push(end_date);
    }

    const [transactions] = await db.query(
      `SELECT l.*, m.full_name as member_name, m.member_code,
        (SELECT SUM(fine) FROM loan_details ld WHERE ld.loan_id = l.id) as total_fine
       FROM loans l JOIN members m ON l.member_id = m.id
       ${where}
       ORDER BY l.loan_date DESC`,
      params
    );
    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil laporan transaksi.' });
  }
};

module.exports = { getDashboardStats, getBookReport, getMemberReport, getTransactionReport };
