'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { BBPTUHPTLogo, KementanLogo } from '@/components/Logos';
import {
  ArrowRight,
  ClipboardList,
  BarChart3,
  Users,
  ShieldCheck,
  Milk,
  Package,
  ShoppingBag,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Info,
  HelpCircle,
  PhoneCall,
  Menu,
  X
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-emerald-200 selection:text-emerald-900">
      {/* 1. HEADER / NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex items-center gap-1.5">
              <KementanLogo className="w-9 h-9 transition-transform group-hover:scale-105" />
              <BBPTUHPTLogo className="w-9 h-9 transition-transform group-hover:scale-105" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-slate-900 leading-tight">
                BBPTUHPT Baturraden
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 tracking-wider uppercase">
                Sistem Management Stok Susu
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#beranda" className="text-slate-900 hover:text-emerald-700 transition-colors">
              Beranda
            </a>
            <a href="#tentang-kami" className="hover:text-emerald-700 transition-colors">
              Tentang Kami
            </a>
            <a href="#fitur-utama" className="hover:text-emerald-700 transition-colors">
              Fitur Utama
            </a>
            <a href="#manfaat" className="hover:text-emerald-700 transition-colors">
              Manfaat Sistem
            </a>
            <a href="#kontak" className="hover:text-emerald-700 transition-colors">
              Kontak & Panduan
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
            <a
              href="#beranda"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-900"
            >
              Beranda
            </a>
            <a
              href="#tentang-kami"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-600"
            >
              Tentang Kami
            </a>
            <a
              href="#fitur-utama"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-600"
            >
              Fitur Utama
            </a>
            <a
              href="#manfaat"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-600"
            >
              Manfaat Sistem
            </a>
            <div className="pt-2">
              <Link
                href="/login"
                className="w-full text-center py-3 rounded-full bg-[#1E3F20] text-white text-xs font-bold block"
              >
                Masuk / Login
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section id="beranda" className="pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Hero Heading & Subtitle */}
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Kelola Stok Susu Lebih <br className="hidden sm:inline" />
            Mudah dan Teratur
          </h1>

          <p className="text-xs sm:text-base text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Sistem manajemen stok susu BBPTUHPT Baturraden yang membantu melacak produksi,
            penyimpanan, dan distribusi susu secara akurat, cepat, dan teratur.
          </p>

          {/* Primary CTA Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-[#1A1A1A] hover:bg-black text-white font-bold text-xs sm:text-sm shadow-xl hover:shadow-2xl transition-all group transform hover:-translate-y-0.5"
            >
              <span>Masuk ke Halaman Login</span>
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </div>
            </Link>
            {mounted && user && (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs sm:text-sm transition-all"
              >
                <span>Buka Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Hero Metrics / Stats */}
        <div className="mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-slate-100 max-w-5xl mx-auto">
          <div className="space-y-1">
            <p className="text-2xl sm:text-4xl font-black text-slate-900">40%</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Efisiensi Kerja</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-4xl font-black text-slate-900">12k+</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Liter Susu / Bulan</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-4xl font-black text-slate-900">2.5k</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ternak Terdata</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-4xl font-black text-slate-900">99.9%</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Akurasi Data Stok</p>
          </div>
        </div>

        {/* Large Hero Banner Image */}
        <div className="mt-10 max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
          <div className="relative w-full h-[280px] sm:h-[420px] md:h-[540px]">
            <img
              src="/baturraden-cows.png"
              alt="BBPTUHPT Baturraden Pastoral Pasture with Cows"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 3. SECTION PRODUKSI DAN STOK */}
      <section id="fitur-utama" className="py-16 md:py-24 bg-slate-50 border-t border-slate-100 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-12">
          {/* Section Badge & Title */}
          <div className="space-y-3">
            <span className="inline-block px-4 py-1.5 rounded-full text-[11px] font-extrabold tracking-wider uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
              PRODUKSI DAN STOK
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Kelola Stok Susu, Dukung Produksi Lebih Baik
            </h2>
          </div>

          {/* 3 Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-6xl mx-auto">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mb-6 group-hover:bg-[#1E3F20] group-hover:text-white transition-colors">
                <Milk className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Pencatatan Perah</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Mencatat hasil perah harian secara akurat dari setiap kandang harian.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mb-6 group-hover:bg-[#1E3F20] group-hover:text-white transition-colors">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Pemantauan Stok</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Pantau sisa persediaan susu segar & olahan yang siap dikirim/dijual secara real-time.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mb-6 group-hover:bg-[#1E3F20] group-hover:text-white transition-colors">
                <ClipboardList className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Laporan Otomatis</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Rekap data harian & bulanan untuk kemudahan audit dan analisis pengeluaran.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION TENTANG KAMI */}
      <section id="tentang-kami" className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-[#1E3F20]"></span>
            <span>02 Tentang Kami</span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-800 leading-relaxed max-w-3xl mx-auto">
            Selamat datang di Balai Besar Pembibitan Ternak Unggul dan Hijauan Pakan Ternak (BBPTUHPT) Baturraden
            sebagai salah satu dari Unit Pelaksana Teknis (UPT) lingkup Direktorat Jenderal Peternakan dan Kesehatan Hewan
            di bawah Kementerian Pertanian RI.
          </h2>
        </div>
      </section>

      {/* 5. SECTION MANFAAT SISTEM (LIME GREEN CONTAINER) */}
      <section id="manfaat" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-[#D6FF79] rounded-3xl p-8 sm:p-12 md:p-16 text-slate-900 shadow-xl space-y-12">
          {/* Badge & Header */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-slate-900 text-xs font-extrabold shadow-sm">
              <span>03</span>
              <span>Manfaat Sistem</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight max-w-3xl leading-tight">
              Pengelolaan Stok Susu Menjadi Lebih Teratur
            </h2>
          </div>

          {/* Sub Items List */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-slate-900/10 text-xs sm:text-sm font-bold text-slate-900">
            <p>Pencatatan stok dilakukan dalam satu sistem</p>
            <p>Stok Lebih Terpantau</p>
            <p>Data Lebih Teratur</p>
            <p>Laporan Lebih Mudah</p>
          </div>

          {/* Huge Number Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-slate-900/10">
            <div className="space-y-1">
              <p className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight">3</p>
              <p className="text-lg sm:text-xl font-bold text-slate-900">Role Utama</p>
              <p className="text-xs text-slate-800 font-medium">Farm, Pengemasan & Pemasaran</p>
            </div>

            <div className="space-y-1">
              <p className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight">1</p>
              <p className="text-lg sm:text-xl font-bold text-slate-900">Data Terpusat</p>
              <p className="text-xs text-slate-800 font-medium">Integrasi penuh antar unit kerja</p>
            </div>

            <div className="space-y-1">
              <p className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight">24/7</p>
              <p className="text-lg sm:text-xl font-bold text-slate-900">Akses Data Real Time</p>
              <p className="text-xs text-slate-800 font-medium">Pantau dari mana saja kapan saja</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FITUR UNGGULAN & ROLE SYSTEM */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
                <span>04</span>
                <span>Fitur Unggulan</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Solusi Lengkap Manajemen Stok Susu
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4 hover:border-emerald-500 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Milk className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Produksi Perah (Yantek)</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Pencatatan produksi harian perah pagi & sore, pemerataan tangki, dan serah terima ke tim pengemasan.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4 hover:border-emerald-500 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Pengemasan & Olahan</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Manajemen konversi susu murni menjadi susu pasteurisasi, ES Loly, Susu Cup, dan produk olahan lainnya.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4 hover:border-emerald-500 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Penjualan & Distribusi</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Seksi Pemasaran mencatat distribusi susu keluar, penjualan ritel/grosir, dan pencetakan Berita Acara.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4 hover:border-emerald-500 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Berita Acara Digital</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Pembuatan Berita Acara Serah Terima otomatis dengan tanda tangan digital dan keamanan audit trail.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer id="kontak" className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-medium">
          <div className="flex items-center gap-3">
            <BBPTUHPTLogo className="w-8 h-8" />
            <div>
              <p className="text-white font-bold text-sm">BBPTUHPT Baturraden</p>
              <p className="text-slate-500">Direktorat Jenderal Peternakan dan Kesehatan Hewan - Kementerian Pertanian RI</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="text-slate-300 hover:text-white font-semibold">
              Portal Login
            </Link>
            <a href="#tentang-kami" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#fitur-utama" className="hover:text-white transition-colors">
              Terms of Use
            </a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-slate-800 text-center text-slate-500 text-[11px]">
          © {new Date().getFullYear()} BBPTUHPT Baturraden. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
