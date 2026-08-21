# Implementation Plan - Fitur Baru "Berita Acara" (Admin Pengemasan)

Membuat dan mengintegrasikan fitur **Berita Acara Serah Terima Susu** untuk role `ADMIN_PENGEMASAN` (dan `SUPERADMIN`). Fitur ini mencakup manajemen dokumen Berita Acara Serah Terima Susu Hibah & Pembelian, penyimpanan data di database PostgreSQL/MySQL via Prisma, halaman riwayat `/berita-acara`, dan cetak/export PDF berstandar dokumen resmi A4 sesuai referensi dokumen fisik.

## User Review Required

> [!IMPORTANT]
> 1. **Hak Akses Role**: Menu **Berita Acara** (`/berita-acara`) akan diaktifkan untuk role `ADMIN_PENGEMASAN` dan `SUPERADMIN` (dengan read/write access).
> 2. **Cetak & Export PDF**: Menggunakan arsitektur dokumen HTML/CSS print CSS resmi (`@media print` A4) yang secara instan mendukung *Print to PDF* & *Download PDF* browser tanpa ketergantungan library luar yang berisiko merusak layout. Layout dirancang presisi sesuai dokumen fisik referensi (**BAST SUSU HIBAH.jpeg** & **BAST SUSU(1).jpeg**).
> 3. **Non-destructive Stock Integration**: Fitur Berita Acara adalah modul pencatatan dokumen legal. Pembuatan Berita Acara tidak akan memodifikasi atau menggandakan stok secara otomatis untuk mencegah *double stock deduction/addition*.

## Proposed Changes

### Database Layer (Prisma Schema)

#### [MODIFY] [schema.prisma](file:///e:/PKL/project/Project-PKL-BBPTU-/prisma/schema.prisma)
- Menambahkan model `BeritaAcara` dengan field:
  - `id` (String UUID @id)
  - `nomorBA` (String @unique - misal `BAST/2026/08/001`)
  - `type` (String - `HIBAH` atau `PEMBELIAN`)
  - `date` (DateTime)
  - `period` (String? - misal "Pagi" atau "Sore" untuk Pembelian)
  - `location` (String? - misal "Tegalsari", "Limpakuwus", "Manggala", "Eduwisata" untuk Pembelian)
  - `giverName` (String - Pihak Menyerahkan)
  - `giverTitle` (String? - Jabatan Menyerahkan)
  - `giverDept` (String? - Instansi/Unit Menyerahkan, default: "Tim Kerja Layanan Pemasaran")
  - `receiverName` (String - Pihak Menerima)
  - `receiverTitle` (String? - Jabatan Menerima)
  - `receiverDept` (String? - Instansi/Unit Menerima)
  - `purpose` (String? - Keterangan/Tujuan untuk Hibah)
  - `notes` (String? - Catatan tambahan)
  - `items` (String - JSON Text: list of detail items `{ jumlah, unit, keterangan, jenisSusu, ukuran }`)
  - `createdById` (String? - Relasi ke User)
  - `createdAt` & `updatedAt` (DateTime)

---

### Backend API Layer

#### [NEW] [route.js](file:///e:/PKL/project/Project-PKL-BBPTU-/app/api/berita-acara/route.js)
- `GET /api/berita-acara`: Mengambil daftar riwayat Berita Acara dengan filter pencarian, jenis, dan tanggal.
- `POST /api/berita-acara`: Menyimpan data Berita Acara baru ke database dengan validasi role dan field wajib.

#### [NEW] [route.js](file:///e:/PKL/project/Project-PKL-BBPTU-/app/api/berita-acara/[id]/route.js)
- `GET /api/berita-acara/[id]`: Mengambil detail 1 dokumen Berita Acara.
- `PUT /api/berita-acara/[id]`: Memperbarui data Berita Acara.
- `DELETE /api/berita-acara/[id]`: Menghapus data Berita Acara.

---

### Frontend UI & Layout

#### [MODIFY] [layout.jsx](file:///e:/PKL/project/Project-PKL-BBPTU-/app/(dashboard)/layout.jsx)
- Menambahkan route `'/berita-acara'` ke `isRouteAllowed` untuk `ADMIN_PENGEMASAN` dan `SUPERADMIN`.
- Menambahkan item menu `Berita Acara` pada `navItems` di Sidebar untuk Admin Pengemasan & Superadmin.

#### [NEW] [page.jsx](file:///e:/PKL/project/Project-PKL-BBPTU-/app/(dashboard)/berita-acara/page.jsx)
- Halaman utama `/berita-acara` yang berisi:
  - Header & Subheading ("Buat dan kelola berita acara serah terima susu")
  - Tombol utama **"+ Buat Berita Acara"**
  - Modal Pemilihan Jenis (Card 1: BAST Susu Hibah, Card 2: BAST Pembelian Susu)
  - **Form Jenis 1: BAST Susu Hibah** (Informasi Dokumen, Detail Susu Dinamis, Catatan, Pihak Menyerahkan & Menerima)
  - **Form Jenis 2: BAST Pembelian Susu** (Waktu/Periode, Lokasi, Tanggal, Detail Susu Dinamis dengan Kolom Jenis/Ukuran/Jumlah/Satuan, Pihak Menyerahkan & Menerima)
  - **Tabel Riwayat Berita Acara** (Nomor, Tanggal, Jenis, Pihak, Lokasi, Pembuat, Aksi)
  - Search & Filter bar
  - Loading & Error Toast Handling
  - Modal Preview & Printable Document Layout yang presisi sesuai format surat resmi BAST A4.

---

## Verification Plan

### Automated Tests
- Menjalankan `npx prisma db push` atau `npx prisma generate` untuk mengkonfirmasi integritas schema Prisma.

### Manual Verification
1. **Pengujian Hak Akses**:
   - Login sebagai `ADMIN_PENGEMASAN`: Memastikan menu "Berita Acara" tampil di sidebar dan halaman `/berita-acara` dapat diakses.
   - Login sebagai `ADMIN_FARM`: Memastikan route `/berita-acara` memunculkan 403 Forbidden.
2. **Pengujian Form Jenis 1 (BAST Susu Hibah)**:
   - Pilih "Berita Acara Serah Terima Susu Hibah".
   - Tambah/hapus baris detail susu (Liter + Keterangan).
   - Simpan data $\rightarrow$ Pastikan toast sukses muncul, modal tertutup, dan data tersimpan di database.
3. **Pengujian Form Jenis 2 (BAST Pembelian Susu)**:
   - Pilih "Berita Acara Serah Terima Pembelian Susu".
   - Pilih Waktu (Pagi/Sore), Lokasi (Tegalsari/Limpakuwus/Manggala/Eduwisata), Tanggal.
   - Tambah/hapus baris detail susu (Susu 110 ml, 250 ml, dll).
   - Simpan data $\rightarrow$ Pastikan data tersimpan di database.
4. **Pengujian Export / Print PDF**:
   - Klik aksi "Export PDF / Cetak" pada salah satu dokumen.
   - Verifikasi tampilan dokumen A4 presisi sesuai dokumen fisik referensi (Kop/Judul, Tanggal, Pihak Menyerahkan & Menerima, Tabel Detail, Area Tanda Tangan).
