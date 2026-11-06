# Sistem Perpustakaan

Aplikasi manajemen perpustakaan digital full-stack dengan React + Node.js + MySQL.

## Fitur

- **Autentikasi**: Login JWT, role-based access (Admin & Pustakawan)
- **Manajemen Buku**: CRUD, upload cover, stok & ketersediaan
- **Kategori Buku**: Pengelompokan buku
- **Anggota**: Registrasi & manajemen anggota perpustakaan
- **Peminjaman**: Buat peminjaman multi-buku dengan validasi stok
- **Pengembalian**: Proses return + kalkulasi denda otomatis
- **Dashboard**: Statistik, chart, aktivitas terbaru
- **Laporan**: Buku, anggota, dan transaksi
- **Pengaturan**: Konfigurasi denda, batas pinjam, dll
- **Manajemen User** (Admin only)

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts, Lucide React |
| Backend  | Node.js, Express, MySQL2, JWT, bcrypt, Multer |
| Database | MySQL                               |

## Prerequisites

- Node.js 18+
- MySQL 8+
- npm atau yarn

## Instalasi

### 1. Database

```bash
# Buat database
mysql -u root -p < database/perpustakaan.sql

# Atau import manual via phpMyAdmin / MySQL Workbench
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env sesuai konfigurasi MySQL Anda

npm install
npm run seed   # Seed data awal (admin/admin123)
npm run dev    # http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env

npm install
npm run dev    # http://localhost:3000
```

## Default Login

| Username  | Password  | Role       |
|-----------|-----------|------------|
| admin     | admin123  | Admin      |
| librarian | admin123  | Pustakawan |

## Struktur API

```
POST   /api/auth/login
GET    /api/auth/profile
GET    /api/books
POST   /api/books
GET    /api/categories
GET    /api/members
POST   /api/loans
POST   /api/returns
GET    /api/reports/dashboard
GET    /api/settings
...
```

## Catatan

- Pastikan MySQL berjalan sebelum start backend
- Upload cover buku disimpan di `backend/src/uploads/book-covers`
- Frontend proxy ke backend di development mode
