-- Sistem Perpustakaan Database Schema
-- MySQL

CREATE DATABASE IF NOT EXISTS perpustakaan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE perpustakaan;

-- Users (admin, librarian)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'librarian') NOT NULL DEFAULT 'librarian',
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Books
CREATE TABLE books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  isbn VARCHAR(20) UNIQUE,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(150) NOT NULL,
  publisher VARCHAR(150),
  publication_year YEAR,
  category_id INT,
  stock INT NOT NULL DEFAULT 0,
  available INT NOT NULL DEFAULT 0,
  cover_image VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Members
CREATE TABLE members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  member_code VARCHAR(20) NOT NULL UNIQUE,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  join_date DATE NOT NULL,
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Loans (header)
CREATE TABLE loans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  loan_code VARCHAR(20) NOT NULL UNIQUE,
  member_id INT NOT NULL,
  user_id INT NOT NULL,
  loan_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status ENUM('active', 'returned', 'overdue') DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Loan Details
CREATE TABLE loan_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  loan_id INT NOT NULL,
  book_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  return_date DATE,
  fine DECIMAL(10,2) DEFAULT 0,
  status ENUM('borrowed', 'returned') DEFAULT 'borrowed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id)
);

-- Settings
CREATE TABLE settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(50) NOT NULL UNIQUE,
  setting_value TEXT,
  description VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_author ON books(author);
CREATE INDEX idx_members_name ON members(full_name);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_member ON loans(member_id);
