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
  AlertTriangle, 
  Bell, 
  FileSpreadsheet, 
  Plus, 
  ArrowRight, 
  Calendar, 
  DollarSign, 
  PackageCheck,
  CheckCircle2,
  Clock,
  Eye
} from 'lucide-react';

export default function DashboardPemasaranPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashData, setDashData] = useState(null);
  const [toast, setToast] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pemasaran/dashboard');
      if (res.data.success) {
        setDashData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching pemasaran dashboard:', err);
      setToast({ type: 'error', message: 'Gagal memuat data dashboard pemasaran.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const canManage = user?.role === 'ADMIN_PEMASARAN' || user?.role === 'SUPERADMIN';

  if (loading) {
    return <LoadingSpinner text="Memuat Dashboard Admin Pemasaran..." />;
  }

  const {
    totalReadyStock = 0,
    todaySalesCount = 0,
    todaySalesUnits = 0,
    todaySalesRevenue = 0,
    monthlySalesRevenue = 0,
    lowStockCount = 0,
    pendingNotificationsCount = 0,
    pendingPackagings = [],
    packagingStockMap = { botol: 0, cup: 0, pack: 0 },
    recentTransactions = [],
  } = dashData || {};

  return (
    <div className="space-y-8 pb-12">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold mb-2">
            <Boxes className="w-4 h-4" />
            <span>POV Admin Pemasaran</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Dashboard Admin Pemasaran</h1>
          <p className="text-xs text-slate-500 font-medium">
            Ringkasan statistik stok ready, notifikasi stok masuk, dan transaksi penjualan produk.
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            <Link
              href="/pemasaran/penerimaan"
              className="relative flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-xs font-bold shadow transition-all"
            >
              <Bell className="w-4 h-4" />
              <span>Notifikasi Stok</span>
              {pendingNotificationsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-white text-amber-900 font-extrabold text-[10px]">
                  {pendingNotificationsCount}
                </span>
              )}
            </Link>

            <Link
              href="/pemasaran/penjualan"
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Input Penjualan</span>
            </Link>
          </div>
        )}
      </div>

      {/* NOTIFICATION ALERT BANNER FOR PENDING STOCK */}
      {pendingNotificationsCount > 0 && (
        <div className="p-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-3xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-2xl shrink-0">
              <Bell className="w-6 h-6 text-white animate-bounce" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm">Penambahan Stok Susu Masuk Dari Farm!</h3>
              <p className="text-xs text-amber-100 font-medium">
                Terdapat <strong>{pendingNotificationsCount} pengiriman stok</strong> dari Admin Farm yang menunggu konfirmasi Anda.
              </p>
            </div>
          </div>
          <Link
            href="/pemasaran/penerimaan"
            className="px-4 py-2 bg-white text-amber-900 hover:bg-amber-50 rounded-2xl text-xs font-black transition-all shadow shrink-0 text-center"
          >
            Konfirmasi Stok Sekarang →
          </Link>
        </div>
      )}

      {/* SUMMARY CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stok Ready */}
        <div className="bg-gradient-to-br from-[#1E3F20] to-[#142e16] text-white p-5 rounded-3xl shadow-md space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider block">Total Stok Ready</span>
            <Boxes className="w-5 h-5 text-emerald-300" />
          </div>
          <p className="text-3xl font-black">{totalReadyStock.toLocaleString()} <span className="text-xs font-semibold text-emerald-200">pcs</span></p>
          <p className="text-[10px] text-emerald-300 font-medium">Stok terverifikasi siap jual</p>
        </div>

        {/* Penjualan Hari Ini */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Penjualan Hari Ini</span>
            <ShoppingCart className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-700">Rp {todaySalesRevenue.toLocaleString('id-ID')}</p>
          <div className="flex justify-between text-[11px] text-slate-500 font-semibold pt-1 border-t border-slate-100">
            <span>{todaySalesCount} Transaksi</span>
            <span>{todaySalesUnits} pcs Terjual</span>
          </div>
        </div>

        {/* Total Penjualan Bulan Ini */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Penjualan Bulan Ini</span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">Rp {monthlySalesRevenue.toLocaleString('id-ID')}</p>
          <p className="text-[10px] text-emerald-600 font-bold">Akumulasi pendapatan bulan ini</p>
        </div>

        {/* Stok Rendah Alert */}
        <div className={`p-5 rounded-3xl shadow-sm border space-y-2 ${
          lowStockCount > 0 ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold uppercase tracking-wider block opacity-70">Stok Produk Rendah</span>
            <AlertTriangle className={`w-5 h-5 ${lowStockCount > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
          </div>
          <p className="text-3xl font-black">{lowStockCount} <span className="text-xs font-semibold">Jenis</span></p>
          <p className="text-[10px] font-medium opacity-80">
            {lowStockCount > 0 ? 'Perlu pengemasan ulang (< 20 pcs)' : 'Semua stok aman (> 20 pcs)'}
          </p>
        </div>
      </div>

      {/* QUICK STOCK BREAKDOWN GRID */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Boxes className="w-4 h-4 text-blue-600" />
            <span>Informasi Stok Produk Per Kemasan</span>
          </h2>
          <span className="text-xs font-bold text-slate-400">Real-time Available</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1">
            <span className="text-xs font-bold text-emerald-900 uppercase block">Stok Ready Botol</span>
            <p className="text-2xl font-black text-emerald-700">{(packagingStockMap.botol || 0).toLocaleString()} <span className="text-xs font-bold text-emerald-900">botol</span></p>
          </div>

          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1">
            <span className="text-xs font-bold text-amber-900 uppercase block">Stok Ready Cup</span>
            <p className="text-2xl font-black text-amber-700">{(packagingStockMap.cup || 0).toLocaleString()} <span className="text-xs font-bold text-amber-900">cup</span></p>
          </div>

          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-1">
            <span className="text-xs font-bold text-blue-900 uppercase block">Stok Ready Pack / Bantal</span>
            <p className="text-2xl font-black text-blue-700">{(packagingStockMap.pack || 0).toLocaleString()} <span className="text-xs font-bold text-blue-900">pack</span></p>
          </div>
        </div>
      </div>

      {/* RECENT TRANSACTIONS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <span>Ringkasan Transaksi Penjualan Terbaru</span>
          </h2>

          <Link
            href="/pemasaran/penjualan"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Lihat Semua Transaksi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 whitespace-nowrap">ID Transaksi</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Tanggal</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Produk & Varian</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Jumlah</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Harga Satuan</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Total</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-mono font-black text-slate-900 whitespace-nowrap">
                      {s.transactionId}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 whitespace-nowrap">
                      {new Date(s.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-extrabold text-slate-900 block">{s.productSubtype || s.productCategory}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">{s.variant || 'Original'} — {s.packagingType}</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-slate-900 text-white rounded-xl font-bold text-xs inline-block whitespace-nowrap">
                        {s.quantity} pcs
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                      Rp {s.unitPrice.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4 font-black text-emerald-700 whitespace-nowrap">
                      Rp {s.totalPrice.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-black text-[10px] inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => setSelectedSale(s)}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Lihat Detail Transaksi"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">Belum ada transaksi penjualan yang diinput.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL SALE MODAL */}
      {selectedSale && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                <span>Detail Transaksi Penjualan</span>
              </h3>
              <button onClick={() => setSelectedSale(null)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-blue-50/60 rounded-2xl space-y-1">
                <span className="text-[10px] text-slate-500 font-bold block">ID Transaksi:</span>
                <span className="font-mono font-black text-blue-900 text-sm block">{selectedSale.transactionId}</span>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-semibold">Tanggal:</span>
                <strong className="text-slate-900">{new Date(selectedSale.date).toLocaleString('id-ID')}</strong>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-semibold">Produk:</span>
                <strong className="text-slate-900">{selectedSale.productSubtype || selectedSale.productCategory}</strong>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-semibold">Varian & Kemasan:</span>
                <strong className="text-slate-900">{selectedSale.variant || 'Original'} ({selectedSale.packagingType})</strong>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-semibold">Jumlah Terjual:</span>
                <strong className="text-slate-900 font-black">{selectedSale.quantity} pcs</strong>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-semibold">Harga Satuan:</span>
                <strong className="text-slate-900">Rp {selectedSale.unitPrice.toLocaleString('id-ID')}</strong>
              </div>

              <div className="flex justify-between p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <span className="text-emerald-900 font-extrabold">Total Pendapatan:</span>
                <span className="text-emerald-900 font-black text-sm">Rp {selectedSale.totalPrice.toLocaleString('id-ID')}</span>
              </div>

              {selectedSale.notes && (
                <div className="pt-2">
                  <span className="text-slate-500 font-semibold block mb-0.5">Catatan:</span>
                  <p className="p-2.5 bg-slate-50 rounded-xl text-slate-800 font-medium">{selectedSale.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedSale(null)}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
