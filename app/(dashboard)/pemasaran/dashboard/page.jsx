'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import {
  Boxes,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  FileSpreadsheet,
  Plus,
  ArrowRight,
  Calendar,
  DollarSign,
  PackageCheck,
  CheckCircle2,
  Clock,
  Milk,
  Receipt,
  FileText,
  Package
} from 'lucide-react';

export default function DashboardPemasaranPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [stats, setStats] = useState({
    totalFreshStock: 0,
    totalOlahanStock: 0,
    todaySalesCount: 0,
    todaySalesOmzet: 0,
    totalPiutangSisa: 0,
    recentSales: [],
    pendingCount: 0
  });

  const loadDashboard = async () => {
    setLoading(true);
    try {
      // Fetch fresh production & olahan stock
      const [prodRes, pkgRes, salesRes, piutangRes] = await Promise.all([
        api.get('/milk-production').catch(() => ({ data: { data: [] } })),
        api.get('/packaged-products').catch(() => ({ data: { data: [] } })),
        api.get('/milk-sales').catch(() => ({ data: { data: [] } })),
        api.get('/piutang?status=belum_lunas').catch(() => ({ data: { data: [] } }))
      ]);

      const productions = prodRes.data.data || [];
      const packagings = pkgRes.data.data || [];
      const sales = salesRes.data.data || [];
      const piutangList = piutangRes.data.data || [];

      // Calculate fresh stock: total kirimKePI - total sold FRESH
      const totalFreshKirim = productions.reduce((acc, p) => acc + (p.kirimKePI || p.rawVolumeLiters || 0), 0);
      const totalFreshSold = sales.filter(s => s.sumber === 'FRESH').reduce((acc, s) => acc + (s.jumlah || s.quantity || 0), 0);
      const availableFresh = Math.max(0, totalFreshKirim - totalFreshSold);

      // Calculate olahan stock: total packaged - total sold OLAHAN
      const totalOlahanProduced = packagings.reduce((acc, p) => acc + (p.jumlah || 0), 0);
      const totalOlahanSold = sales.filter(s => s.sumber === 'OLAHAN').reduce((acc, s) => acc + (s.jumlah || s.quantity || 0), 0);
      const availableOlahan = Math.max(0, totalOlahanProduced - totalOlahanSold);

      // Today sales
      const todayStr = new Date().toISOString().slice(0, 10);
      const todaySales = sales.filter(s => {
        const saleDateStr = new Date(s.tanggal || s.date).toISOString().slice(0, 10);
        return saleDateStr === todayStr;
      });

      const todayOmzet = todaySales.reduce((acc, s) => acc + (s.hargaJual || s.totalPrice || 0), 0);

      // Piutang sisa
      const totalPiutangSisa = piutangList.reduce((acc, p) => acc + (p.sisaPiutang || 0), 0);

      setStats({
        totalFreshStock: availableFresh,
        totalOlahanStock: availableOlahan,
        todaySalesCount: todaySales.length,
        todaySalesOmzet: todayOmzet,
        totalPiutangSisa,
        recentSales: sales.slice(0, 5),
        pendingCount: productions.length + packagings.length
      });

    } catch (err) {
      console.error('Error loading pemasaran dashboard:', err);
      setToast({ type: 'error', message: 'Gagal memuat ringkasan dashboard pemasaran.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Memuat Dashboard Admin Pemasaran..." />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header Banner */}
      <div className="bg-[#1E3F20] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-emerald-200 mb-3 border border-white/10">
              <Boxes className="w-3.5 h-3.5" />
              <span>Modul Admin Pemasaran</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ringkasan Stok & Penjualan Susu
            </h1>
            <p className="text-emerald-100 text-sm mt-1 max-w-xl">
              Kelola pencatatan penjualan susu fresh, susu olahan, monitoring piutang pelanggan, dan laporan omzet harian secara real-time.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/pemasaran/terima-data"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Terima Data</span>
            </Link>
            <Link
              href="/pemasaran/laporan"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
            >
              <FileText className="w-4 h-4" />
              <span>Laporan & Rekapitulasi</span>
            </Link>
          </div>
        </div>

        {/* Decorative Background Icon */}
        <Milk className="absolute -right-8 -bottom-10 w-64 h-64 text-white/5 pointer-events-none" />
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/pemasaran/terima-data"
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-sm font-extrabold text-slate-800 block">Terima Data (Farm & Packaging)</span>
            <span className="text-xs text-slate-500">Konfirmasi data barang perah & olahan masuk</span>
          </div>
        </Link>

        <Link
          href="/pemasaran/piutang"
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <span className="text-sm font-extrabold text-slate-800 block">Kelola Piutang & Pelunasan</span>
            <span className="text-xs text-slate-500">Pantau sisa tagihan & catat pelunasan</span>
          </div>
        </Link>

        <Link
          href="/pemasaran/laporan"
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-sm font-extrabold text-slate-800 block">Laporan & Rekapitulasi</span>
            <span className="text-xs text-slate-500">Cetak rekap harian/bulanan & ekspor Excel</span>
          </div>
        </Link>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600">
            <Milk className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stok Fresh PI</p>
            <h3 className="text-2xl font-black text-slate-800">{stats.totalFreshStock.toLocaleString('id-ID')} <span className="text-xs font-semibold text-slate-500">Liter</span></h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Tersedia untuk dijual</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-purple-50 text-purple-600">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stok Olahan</p>
            <h3 className="text-2xl font-black text-slate-800">{stats.totalOlahanStock.toLocaleString('id-ID')} <span className="text-xs font-semibold text-slate-500">Unit</span></h3>
            <p className="text-[11px] text-purple-600 font-medium mt-0.5">Varian dikemas</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Omzet Hari Ini</p>
            <h3 className="text-xl font-black text-slate-800">Rp {stats.todaySalesOmzet.toLocaleString('id-ID')}</h3>
            <p className="text-[11px] text-blue-600 font-medium mt-0.5">{stats.todaySalesCount} Transaksi Selesai</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-600">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sisa Piutang</p>
            <h3 className="text-xl font-black text-slate-800">Rp {stats.totalPiutangSisa.toLocaleString('id-ID')}</h3>
            <p className="text-[11px] text-amber-600 font-medium mt-0.5">Perlu Pelunasan</p>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-extrabold text-slate-800 text-lg">Transaksi Terbaru</h2>
            <p className="text-xs text-slate-500">5 transaksi penjualan susu terakhir</p>
          </div>
          <Link
            href="/pemasaran/laporan"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats.recentSales.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Belum ada transaksi penjualan susu yang tercatat.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-y border-slate-200">
                <tr>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Sumber</th>
                  <th className="px-4 py-3">Pembeli</th>
                  <th className="px-4 py-3">Jumlah</th>
                  <th className="px-4 py-3">Total Harga</th>
                  <th className="px-4 py-3">Kategori Bayar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {stats.recentSales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(s.tanggal || s.date).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.sumber === 'FRESH' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {s.sumber}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{s.pembeli}</td>
                    <td className="px-4 py-3">{s.jumlah || s.quantity} {s.sumber === 'FRESH' ? 'Liter' : 'Unit'}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">
                      Rp {(s.hargaJual || s.totalPrice || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.kategoriBayar === 'PNBP' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {s.kategoriBayar}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
