# Implementation Plan - Revisi Besar Role Admin Pengemasan Menjadi Divisi UHT / Pengolahan

Revisi besar role **Admin Pengemasan** menjadi **Divisi UHT / Pengolahan** untuk mencakup pengolahan susu menjadi 3 jenis produk utama: **Susu Olahan Rasa**, **Yogurt**, dan **Keju**. Seluruh alur (Request Susu -> Input Hasil Pengolahan -> Stok Bahan & BOM -> Produk Siap Edar -> Berita Acara Olahan Multi-Produk -> Laporan Pengolahan -> Export -> Confirmation Pemasaran) diintegrasikan menggunakan satu database sebagai single source of truth dengan atomic DB transactions.

## User Review Required

> [!IMPORTANT]
> **Compatibility & Database Safety**:
> 1. Role internal database tetap `ADMIN_PENGEMASAN` demi menjaga kompatibilitas auth dan relasi existing.
> 2. Pada tampilan UI, role ditampilkan sebagai **"Divisi UHT / Pengolahan"** (Header, Greeting, Sidebar, & Badges).
> 3. Pengurangan stok bahan kemasan dihitung secara otomatis berdasarkan **Total Produksi** (bukan sekadar Hasil Bersih), karena bahan kemasan tetap terpakai walaupun produk kemudian rusak/afkir.
> 4. Transaksi simpan hasil pengolahan dikunci dalam **Atomic Database Transaction** (`prisma.$transaction`). Jika stok bahan tidak mencukupi, transaksi dibatalkan (rollback) dan sistem menampilkan detail kekurangan stok.

---

## Proposed Changes

### 1. Structure & Terminology Refactoring (Phase 1)

#### [MODIFY] [layout.jsx](file:///e:/PKL/project/Project-PKL-BBPTU-/app/%28dashboard%29/layout.jsx)
- Ubah label role badge `ADMIN_PENGEMASAN` menjadi **DIVISI UHT / PENGOLAHAN**.
- Update sidebar navigation untuk `ADMIN_PENGEMASAN`:
  - **DASHBOARD**: Dashboard (`/dashboard`)
  - **PENGOLAHAN**: Request Susu (`/pengemasan/request-susu`), Input Hasil Pengolahan (`/pengemasan`), Sisa Stok Bahan (`/pengemasan/stok-bahan`), Produk Siap Edar (`/pengemasan/produk-siap-edar`), Berita Acara Olahan (`/berita-acara`), Laporan Pengolahan (`/reports/pengolahan`)
  - **LAINNYA**: Profil (`/profil`)
- Daftarkan route `/pengemasan/produk-siap-edar` di array `isRouteAllowed` untuk `ADMIN_PENGEMASAN`.

---

### 2. Dashboard Divisi UHT / Pengolahan (Phase 2 & 8)

#### [MODIFY] [dashboard/page.jsx](file:///e:/PKL/project/Project-PKL-BBPTU-/app/%28dashboard%29/dashboard/page.jsx)
- Update greeting: `"Hi, Admin Pengolahan!"` & Header: `"Dashboard Divisi UHT / Pengolahan"`.
- Update 4 Summary Cards:
  1. **STOK AWAL**: Stok produk siap edar sebelum hari ini.
  2. **PRODUK DIHASILKAN**: Total pcs produk olahan hari ini.
  3. **SIAP PRODUKSI**: Sisa bahan baku (Liter) & ketersediaan bahan.
  4. **JUMLAH STOK**: Total pcs produk siap edar saat ini.
- Update Section **RINCIAN STOK PRODUK SIAP EDAR** per kelompok produk:
  - Susu Olahan Rasa (Original, Cokelat, Melon, Strawberry - Botol 115ml, Botol 250ml, Cup 200ml, Plastik Bantal).
  - Yogurt (Original, Cup/Pack).
  - Keju (Fresh Cheese / Keju Olahan, 100g, 250g).
- Update Section **SISA STOK BAHAN / KEMASAN**: Status AMAN, MENIPIS, KRITIS (dengan warning).
- Update Section **AKTIVITAS PENGOLAHAN TERBARU**: Tanggal, Produk, Jumlah, Status.

#### [MODIFY] [stats/route.js](file:///e:/PKL/project/Project-PKL-BBPTU-/app/api/dashboard/stats/route.js)
- Sesuaikan agregasi `packagingStats` untuk mendukung rekapitulasi real-time stok Susu Rasa, Yogurt, Keju, serta sisa stok bahan baku dan bahan kemasan.

---

### 3. Input Hasil Pengolahan & Validation (Phase 2, 3, 5)

#### [MODIFY] [schema.prisma](file:///e:/PKL/project/Project-PKL-BBPTU-/prisma/schema.prisma)
- Tambahkan field opsional pada `MilkPackaging` jika diperlukan: `afkirQty` (Int, default 0), `netQty` (Int, default 0), `requestId` (String opsional untuk link ke request susu).

#### [MODIFY] [pengemasan/page.jsx](file:///e:/PKL/project/Project-PKL-BBPTU-/app/%28dashboard%29/pengemasan/page.jsx)
- Ubah form menjadi 1-Door Multi-Step Form:
  - **STEP 1**: Pilih Produk Hasil Pengolahan (1. SUSU OLAHAN RASA, 2. YOGURT, 3. KEJU).
  - **STEP 2**: Tampilkan form sesuai produk yang dipilih:
    - *Susu Olahan Rasa*: Tanggal, Sumber Susu / Request Susu, Varian (Original, Cokelat, Melon, Strawberry), Kemasan (Botol, Cup, Plastik Bantal), Ukuran (115 ml, 130 ml, 200 ml, 250 ml), Jumlah Produksi, Jumlah Rusak/Afkir, Hasil Bersih (otomatis), Catatan.
    - *Yogurt*: Tanggal, Sumber Susu, Varian, Kemasan, Ukuran, Jumlah Produksi, Jumlah Rusak/Afkir, Hasil Bersih, Catatan.
    - *Keju*: Tanggal, Sumber Susu, Varian/Jenis Keju, Ukuran/Berat (100g, 250g - konfigurasi fleksibel), Kemasan, Jumlah Produksi, Jumlah Rusak/Afkir, Hasil Bersih, Catatan.
- Tampilkan indikator kalkulasi otomatis Hasil Bersih (`Produksi - Rusak/Afkir`) dan validasi bahwa Rusak/Afkir tidak boleh > Produksi.

#### [MODIFY] [farm/packaging/route.js](file:///e:/PKL/project/Project-PKL-BBPTU-/app/api/farm/packaging/route.js)
- Implementasikan pemotongan bahan kemasan berbasis BOM (Bill of Materials) untuk 3 jenis produk (Susu Rasa, Yogurt, Keju).
- Lakukan pengecekan stok ketersediaan bahan kemasan sebelum eksekusi. Jika stok kurang, return 400 dengan detail kesalahan yang informatif.
- Bungkus seluruh operasi dalam `prisma.$transaction`:
  1. Simpan data pengolahan (`MilkPackaging`).
  2. Potong stok bahan kemasan (`PackagingMaterial`).
  3. Catat histori pergerakan bahan (`MaterialStockMovement` type `DEDUCTION`, source `PENGOLAHAN`).
  4. Potong/update status penggunaan susu mentah (`MilkRequest` / `MilkProduction`).
  5. Catat `SystemLog`.

---

### 4. Modul Produk Siap Edar (Phase 3)

#### [NEW] [pengemasan/produk-siap-edar/page.jsx](file:///e:/PKL/project/Project-PKL-BBPTU-/app/%28dashboard%29/pengemasan/produk-siap-edar/page.jsx)
- Halaman khusus untuk melihat persediaan produk hasil pengolahan yang siap edar.
- Dikelompokkan dalam 3 tab / kategori:
  1. Susu Olahan Rasa
  2. Yogurt
  3. Keju
- Menampilkan detail: Produk, Varian, Ukuran, Kemasan, Total Stok, & Status (TERSEDIA, MENIPIS, HABIS).

---

### 5. Modul Sisa Stok Bahan & Penyesuaian Stok (Phase 4)

#### [MODIFY] [pengemasan/stok-bahan/page.jsx](file:///e:/PKL/project/Project-PKL-BBPTU-/app/%28dashboard%29/pengemasan/stok-bahan/page.jsx)
- Menampilkan sisa stok bahan & kemasan (Botol 115ml, Botol 250ml, Cup 200ml, Plastik Bantal, Tutup Botol, Tutup Cup, Label, Kemasan Keju).
- Tombol `+ Penyesuaian Stok`: Modal form penambahan/pengurangan stok bahan dengan alasan & catatan.
- Tampilkan tabel Histori Pergerakan Bahan (`MaterialStockMovement`).

---

### 6. Berita Acara Olahan Multi-Produk (Phase 6)

#### [MODIFY] [berita-acara/page.jsx](file:///e:/PKL/project/Project-PKL-BBPTU-/app/%28dashboard%29/berita-acara/page.jsx)
- Ganti istilah dari "Berita Acara Serah Terima Susu" menjadi **"Berita Acara Serah Terima Produk Hasil Pengolahan"** ("Berita Acara Olahan").
- Modal `+ Buat Berita Acara` menyediakan pilihan:
  1. Susu Olahan Rasa
  2. Yogurt
  3. Keju
  4. Produk Olahan (Multi-Produk)
- Untuk pilihan **Produk Olahan**, Admin UHT dapat memilih 1 atau lebih item hasil pengolahan dari database dalam 1 Berita Acara tanpa mengetik ulang data.
- Status alur BA: `DRAFT` -> `MENUNGGU_KONFIRMASI_PEMASARAN` -> `DITERIMA_PEMASARAN`.

---

### 7. Laporan Pengolahan & Export (Phase 7 & 9)

#### [MODIFY] [reports/pengolahan/page.jsx](file:///e:/PKL/project/Project-PKL-BBPTU-/app/%28dashboard%29/reports/pengolahan/page.jsx) & [reports/pengolahan/route.js](file:///e:/PKL/project/Project-PKL-BBPTU-/app/api/reports/pengolahan/route.js)
- Ubah konsep "Laporan Pengemasan" menjadi **"Laporan Pengolahan"**.
- Summary Cards: Total Susu Digunakan (Liter), Total Produk Dihasilkan (Pcs), Total Rusak/Afkir (Pcs), Total Produk Siap Edar (Pcs).
- Rekap Hasil Pengolahan: Produk, Varian, Jumlah Produksi, Rusak/Afkir, Hasil Bersih.
- Rekap Per Kelompok Produk: Susu Olahan Rasa, Yogurt, Keju, Total Semua Produk.
- Rekap Bahan Baku & Rekap Bahan Kemasan (Stok Awal, Digunakan, Penyesuaian, Stok Akhir).
- Filter laporan (Tanggal Mulai, Tanggal Akhir, Jenis Produk, Varian, Ukuran, Status).
- Grafik Utama: "Tren Hasil Pengolahan" (7 Hari, 30 Hari, Bulan Ini).
- Export Excel & PDF yang dinamis mengikuti filter.

---

## Verification Plan

### Automated Tests & Type Checks
- Jalankan linting dan build check:
  `npm run build`
- Jalankan script pengujian alur pengolahan:
  `node scratch/test-packaging-flow.js`

### Manual Verification
1. Login sebagai Admin Pengemasan (UHT).
2. Verifikasi tampilan Dashboard UHT, Greeting, & Navigation Bar.
3. Buat Request Susu ke Admin Pemasaran, approve via Pemasaran, lalu terima susu di Admin UHT.
4. Lakukan "+ Input Hasil Pengolahan" untuk Susu Olahan Rasa, Yogurt, dan Keju.
5. Uji skenario stok bahan tidak mencukupi (harus gagal dengan error jelas).
6. Verifikasi penambahan stok di Produk Siap Edar & pengurangan otomatis stok bahan di Sisa Stok Bahan.
7. Lakukan penyesuaian stok di Sisa Stok Bahan dan cek histori transaksi.
8. Buat 1 Berita Acara Olahan yang berisi MULTI-PRODUK (Susu Rasa + Yogurt + Keju) dan konfirmasi penerimaan di Admin Pemasaran.
9. Buka Laporan Pengolahan, uji filter tanggal/produk, dan tes Export PDF & Excel.
