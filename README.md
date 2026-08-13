# 🚜 FarmStock Pro - Sistem Manajemen Ternak & Penjualan Hewan (Unified Next.js Fullstack)

Sistem aplikasi web manajemen stok ternak, pemantauan kapasitas kandang, dan pencatatan transaksi penjualan hewan berbasis **Next.js 14 App Router (React + API Routes)** dan **Prisma ORM + Tailwind CSS** yang disatukan ke dalam satu kesatuan project terpadu (Single Repository).

---

## 🌟 Fitur Utama Aplikasi

- **Autentikasi & Authorization JWT**: Multi-role (`ADMIN` & `STAFF`).
- **Data Hewan Ternak**: Kode unik hewan, ras, jenis (Sapi, Kambing, Domba), gender, riwayat berat badan, dan riwayat perpindahan kandang.
- **Kandang & Stok Real-time**: Kapasitas kandang, jumlah stok hewan `AVAILABLE`, slot tersisa, dan visual progress bar pengisian.
- **Transaksi Penjualan Atomic**: Mutasi status hewan otomatis dari `AVAILABLE` ke `SOLD`, pencatatan data pembeli, harga jual, dan pencetakan Invoice/Struk resmi.
- **Laporan Analitik & Omzet**: Total omzet, rata-rata harga jual per ekor, kontribusi omzet per jenis hewan, dan filter periode (Hari ini, Minggu ini, Bulan ini, Tahun ini, Custom range).

---

## 🛠️ Teknologi & Stack

* **Framework**: Next.js 14 (App Router & API Routes)
* **Frontend**: React 18, Tailwind CSS, Lucide React Icons
* **Backend & Database**: Next.js Server Side API Routes, Prisma ORM, SQLite
* **Keamanan**: JWT (JSON Web Token) & bcryptjs

---

## ⚙️ Panduan Menjalankan Aplikasi

### 1. Install Dependensi
Jalankan perintah ini di root direktori project:
```bash
npm install
```

### 2. Setup Database & Seed Data
```bash
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

### 3. Menjalankan Mode Development
```bash
npm run dev
```
Buka browser di `http://localhost:3000`.

### 4. Menjalankan Mode Production
```bash
npm run build
npm start
```

---

## 🔑 Kredensial Pengujian Bawaan

| Role | Email | Password | Hak Akses |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@farm.com` | `admin123` | Akses penuh seluruh modul & kelola user |
| **STAFF** | `staff@farm.com` | `staff123` | Kelola operasional hewan, kandang, penjualan |

---

## 📦 Ukuran Proyek
- Proyek ini dirancang efisien dengan ukuran total source code **< 15 MB** (sesuai `.gitignore`).
