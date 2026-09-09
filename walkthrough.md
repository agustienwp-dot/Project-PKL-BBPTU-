# Walkthrough - Berita Acara Print Header Alignment Fix

Penyebab terpotongnya bagian atas dokumen (Kop Surat) pada tampilan preview cetak/PDF telah diperbaiki.

## Root Cause Analysis & Solution

1. **Header Layout Desktop (`SISTEM MANAGEMENT STOK SUSU`) Masih Muncul di Cetakan**:
   - **Penyebab**: Class Tailwind `hidden md:flex` pada elemen `<header>` di [`app/(dashboard)/layout.jsx`](file:///e:/PKL/project/Project-PKL-BBPTU-/app/%28dashboard%29/layout.jsx#L292) menerapkan `@media (min-width: 768px) { display: flex; }`. Nilai ini mengesampingkan stylesheet cetak biasa, sehingga header hijau sistem tetap dirender di bagian paling atas kertas A4 saat print. Header ini menutupi Kop Surat dokumen Berita Acara.
   - **Solusi**: 
     - Menambahkan class `print:hidden` secara eksplisit pada komponen `<header>`, `<aside>`, dan mobile header di [`app/(dashboard)/layout.jsx`](file:///e:/PKL/project/Project-PKL-BBPTU-/app/%28dashboard%29/layout.jsx#L292).
     - Memperbarui aturan `@media print` pada [`app/globals.css`](file:///e:/PKL/project/Project-PKL-BBPTU-/app/globals.css) dengan pembersihan margin/padding pada layout wrapper, sehingga dokumen `.printable-document` dimulai langsung di bagian paling atas halaman A4 tanpa ada ruang atau header sistem yang menimpa.

---

## Hasil Verifikasi
- Saat menekan tombol **"Cetak Dokumen"** atau memilih **Save as PDF**, header hijau sistem tidak lagi muncul di atas halaman.
- Kop Surat **BALAI BESAR PEMBIBITAN TERNAK UNGGUL DAN HIJAUAN PAKAN TERNAK BATURRADEN (BBPTUHPT BATURRADEN)** kini langsung tampil utuh, rapi, dan tidak terpotong di bagian atas kertas A4.
