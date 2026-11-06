const bcrypt = require('bcryptjs');
const db = require('../config/database');

async function seed() {
  try {
    console.log('Seeding database...');

    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Check if users exist
    const [users] = await db.query('SELECT id FROM users LIMIT 1');
    if (users.length === 0) {
      await db.query(
        `INSERT INTO users (username, email, password, full_name, role) VALUES
         ('admin', 'admin@perpustakaan.com', ?, 'Administrator', 'admin'),
         ('librarian', 'librarian@perpustakaan.com', ?, 'Pustakawan', 'librarian')`,
        [hashedPassword, hashedPassword]
      );
      console.log('✅ Users seeded (username: admin / librarian, password: admin123)');
    }

    // Categories
    const [cats] = await db.query('SELECT id FROM categories LIMIT 1');
    if (cats.length === 0) {
      await db.query(
        `INSERT INTO categories (name, description) VALUES
         ('Fiksi', 'Buku-buku fiksi dan novel'),
         ('Non-Fiksi', 'Buku non-fiksi dan pengetahuan umum'),
         ('Sains', 'Buku sains dan teknologi'),
         ('Sejarah', 'Buku sejarah'),
         ('Anak', 'Buku anak-anak'),
         ('Bisnis', 'Buku bisnis dan ekonomi')`
      );
      console.log('✅ Categories seeded');
    }

    // Settings
    const [settings] = await db.query('SELECT id FROM settings LIMIT 1');
    if (settings.length === 0) {
      await db.query(
        `INSERT INTO settings (setting_key, setting_value, description) VALUES
         ('library_name', 'Perpustakaan Digital', 'Nama perpustakaan'),
         ('max_loan_days', '7', 'Maksimal hari peminjaman'),
         ('fine_per_day', '1000', 'Denda per hari keterlambatan (Rp)'),
         ('max_books_per_loan', '3', 'Maksimal buku per peminjaman'),
         ('max_active_loans', '5', 'Maksimal peminjaman aktif per anggota')`
      );
      console.log('✅ Settings seeded');
    }

    // Sample books
    const [books] = await db.query('SELECT id FROM books LIMIT 1');
    if (books.length === 0) {
      await db.query(
        `INSERT INTO books (isbn, title, author, publisher, publication_year, category_id, stock, available, description) VALUES
         ('978-602-03-1234-5', 'Laskar Pelangi', 'Andrea Hirata', 'Bentang Pustaka', 2005, 1, 5, 5, 'Novel tentang perjuangan anak-anak di Belitung'),
         ('978-602-06-1234-6', 'Bumi Manusia', 'Pramoedya Ananta Toer', 'Hasta Mitra', 1980, 1, 3, 3, 'Novel sejarah Indonesia'),
         ('978-602-03-5678-9', 'Sapiens', 'Yuval Noah Harari', 'Kepustakaan Populer Gramedia', 2017, 2, 4, 4, 'Riwayat singkat umat manusia'),
         ('978-602-03-9012-3', 'Atomic Habits', 'James Clear', 'Gramedia', 2019, 6, 6, 6, 'Cara membentuk kebiasaan baik'),
         ('978-602-03-3456-7', 'Sejarah Indonesia', 'M.C. Ricklefs', 'Serambi', 2008, 4, 2, 2, 'Sejarah modern Indonesia')`
      );
      console.log('✅ Sample books seeded');
    }

    // Sample members
    const [members] = await db.query('SELECT id FROM members LIMIT 1');
    if (members.length === 0) {
      await db.query(
        `INSERT INTO members (member_code, full_name, email, phone, address, join_date, status) VALUES
         ('MBR2400001', 'Budi Santoso', 'budi@email.com', '081234567890', 'Jl. Merdeka No. 10', CURDATE(), 'active'),
         ('MBR2400002', 'Siti Aminah', 'siti@email.com', '081234567891', 'Jl. Sudirman No. 25', CURDATE(), 'active'),
         ('MBR2400003', 'Ahmad Rizki', 'ahmad@email.com', '081234567892', 'Jl. Gatot Subroto No. 5', CURDATE(), 'active')`
      );
      console.log('✅ Sample members seeded');
    }

    console.log('🎉 Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
