USE perpustakaan;

-- Default admin (password: admin123)
INSERT INTO users (username, email, password, full_name, role) VALUES
('admin', 'admin@perpustakaan.com', '$2b$10$rQZ8K8Y5Y5Y5Y5Y5Y5Y5YuGqJ8K8Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y', 'Administrator', 'admin'),
('librarian', 'librarian@perpustakaan.com', '$2b$10$rQZ8K8Y5Y5Y5Y5Y5Y5Y5YuGqJ8K8Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y', 'Pustakawan', 'librarian');

-- Note: Replace password hashes with real bcrypt hashes of 'admin123' when seeding

INSERT INTO categories (name, description) VALUES
('Fiksi', 'Buku-buku fiksi dan novel'),
('Non-Fiksi', 'Buku non-fiksi dan pengetahuan umum'),
('Sains', 'Buku sains dan teknologi'),
('Sejarah', 'Buku sejarah'),
('Anak', 'Buku anak-anak'),
('Bisnis', 'Buku bisnis dan ekonomi');

INSERT INTO settings (setting_key, setting_value, description) VALUES
('library_name', 'Perpustakaan Digital', 'Nama perpustakaan'),
('max_loan_days', '7', 'Maksimal hari peminjaman'),
('fine_per_day', '1000', 'Denda per hari keterlambatan (Rp)'),
('max_books_per_loan', '3', 'Maksimal buku per peminjaman'),
('max_active_loans', '5', 'Maksimal peminjaman aktif per anggota');
