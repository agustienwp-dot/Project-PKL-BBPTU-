'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import { 
  ShieldCheck, 
  Users, 
  Milk, 
  Coffee,
  ShoppingBag, 
  Package, 
  Plus, 
  ArrowRight, 
  Activity, 
  TrendingUp, 
  Boxes, 
  Calendar,
  Layers,
  FileText,
  Truck
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isSuperAdmin, isAdminFarm, isAdminPemasaran } = useAuth();

  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);
  const [activeTab, setActiveTab] = useState(isAdminFarm && !isSuperAdmin ? 'farm' : 'segar'); // 'farm' | 'segar' | 'olahan' | 'superadmin'
  const [categories, setCategories] = useState([]);
  const [toast, setToast] = useState(null);

  // Quick Production Modal (Farm - Simple Milk Production Input)
  const [showProdModal, setShowProdModal] = useState(false);
  const [prodDate, setProdDate] = useState(new Date().toISOString().split('T')[0]);
  const [prodCategoryId, setProdCategoryId] = useState('');
  const [prodRawLiters, setProdRawLiters] = useState('');
  const [prodNotes, setProdNotes] = useState('');

  // Quick Outflow Modal (Pemasaran - Distribution / Outflow)
  const [showOutModal, setShowOutModal] = useState(false);
  const [outDate, setOutDate] = useState(new Date().toISOString().split('T')[0]);
  const [outProductType, setOutProductType] = useState('SEGAR');
  const [outCategoryId, setOutCategoryId] = useState('');
  const [outPackagingType, setOutPackagingType] = useState('botol');
  const [outQuantity, setOutQuantity] = useState('');
  const [outNotes, setOutNotes] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, catRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/categories'),
      ]);

      if (statsRes.data.success) {
        setStatsData(statsRes.data.data);
      }
      if (catRes.data.success) {
        setCategories(catRes.data.data);
        const segarCats = catRes.data.data.filter(c => c.productType === 'SEGAR');
        if (segarCats.length > 0) {
          setProdCategoryId(segarCats[0].id);
          setOutCategoryId(segarCats[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setToast({ type: 'error', message: 'Gagal memuat data statistik.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const segarCategories = categories.filter(c => c.productType === 'SEGAR');
  const filteredOutCategories = categories.filter(c => c.productType === outProductType);

  const handleCreateProduction = async (e) => {
    e.preventDefault();
    try {
      // Find category default packaging
      const cat = categories.find(c => c.id === prodCategoryId);
      const pkg = cat?.defaultPackaging || 'botol';
      const liters = parseFloat(prodRawLiters) || 0;
      
      const res = await api.post('/farm/production', {
        date: prodDate,
        categoryId: prodCategoryId,
        productType: 'SEGAR',
        packagingType: pkg,
        rawVolumeLiters: liters,
        processedLiters: liters,
        packagedQty: Math.round(liters), // simple 1:1 or bottle volume
        notes: prodNotes,
      });

      if (res.data.success) {
        setToast({ type: 'success', message: 'Laporan hasil perah susu segar harian berhasil disimpan!' });
        setShowProdModal(false);
        setProdRawLiters('');
        setProdNotes('');
        fetchDashboardData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menyimpan laporan produksi.';
      setToast({ type: 'error', message: msg });
    }
  };

  const handleCreateOutflow = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/pemasaran/outflow', {
        date: outDate,
        categoryId: outCategoryId,
        productType: outProductType,
        packagingType: outPackagingType,
        quantity: outQuantity,
        notes: outNotes,
      });

      if (res.data.success) {
        setToast({ type: 'success', message: `Distribusi / produk keluar ${outProductType} (${outPackagingType}) berhasil dicatat!` });
        setShowOutModal(false);
        setOutQuantity('');
        setOutNotes('');
        fetchDashboardData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal mencatat pengeluaran stok.';
      setToast({ type: 'error', message: msg });
    }
  };

  if (loading) {
    return <LoadingSpinner text="Memuat Dashboard Sistem Stok Susu..." />;
  }

  const superadminStats = statsData?.superadmin || {};
  const segarStats = statsData?.segar || {};
  const olahanStats = statsData?.olahan || {};
  const farmStats = statsData?.farm || {};

  return (
    <div className="space-y-8 pb-12">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Welcome Banner */}
      <div className="bg-[#1E3F20] text-[#FFFFFF] p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-emerald-200 border border-white/10">
            <Milk className="w-4 h-4 text-emerald-300" />
            <span>Sistem Management Stok Susu • Role: {user?.role}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            Selamat Datang, {user?.name}!
          </h1>
          <p className="text-emerald-100 text-xs md:text-sm max-w-2xl leading-relaxed">
            {isAdminFarm && !isSuperAdmin
              ? 'Laporkan hasil produksi susu segar harian dari farm secara singkat dan akurat.'
              : 'Kelola stok susu segar dan susu olahan yang akan didistribusikan serta pantau akumulasinya.'}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="relative z-10 flex flex-wrap gap-3">
          {isAdminFarm && (
            <button
              onClick={() => setShowProdModal(true)}
              className="flex items-center gap-2 px-5 py-3 bg-white text-[#1E3F20] hover:bg-emerald-50 rounded-2xl font-bold text-xs shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Input Hasil Perah Harian</span>
            </button>
          )}

          {isAdminPemasaran && (
            <button
              onClick={() => setShowOutModal(true)}
              className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-[#FFFFFF] hover:bg-blue-500 rounded-2xl font-bold text-xs shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <Truck className="w-4 h-4" />
              <span>Input Distribusi / Produk Keluar</span>
            </button>
          )}

          <Link
            href="/reports"
            className="flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-2xl font-bold text-xs shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            <FileText className="w-4 h-4" />
            <span>Akumulasi Laporan</span>
          </Link>
        </div>
      </div>

      {/* DASHBOARD TAB SWITCHER */}
      <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {isAdminFarm && (
            <button
              onClick={() => setActiveTab('farm')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'farm'
                  ? 'bg-[#1E3F20] text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Milk className="w-4 h-4" />
              <span>Laporan Hasil Perah Farm</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('segar')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'segar'
                ? 'bg-[#1E3F20] text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Milk className="w-4 h-4" />
            <span>Stok & Distribusi Susu Segar</span>
          </button>

          <button
            onClick={() => setActiveTab('olahan')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'olahan'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>Stok & Distribusi Susu Olahan</span>
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('superadmin')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'superadmin'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Superadmin</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW FOR ADMIN FARM: SIMPLIFIED MILK PRODUCTION REPORTING */}
      {activeTab === 'farm' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Milk className="w-5 h-5 text-emerald-600" />
              <span>Laporan Hasil Perah Susu Segar Harian (Farm)</span>
            </h2>
            <button
              onClick={() => setShowProdModal(true)}
              className="px-3.5 py-2 bg-[#1E3F20] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Laporkan Produksi Perah</span>
            </button>
          </div>

          {/* Simple Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Hasil Perah Hari Ini</span>
              <p className="text-3xl font-black text-emerald-700">{(segarStats.todayLiters || 0).toLocaleString()} <span className="text-sm font-bold text-slate-500">Liter</span></p>
              <p className="text-xs text-slate-400 font-semibold">Tercatat di sistem farm</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Hasil Perah Bulan Ini</span>
              <p className="text-3xl font-black text-slate-900">{(segarStats.monthLiters || 0).toLocaleString()} <span className="text-sm font-bold text-slate-500">Liter</span></p>
              <p className="text-xs text-slate-400 font-semibold">Akumulasi bulan berjalan</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Akumulasi Perah</span>
              <p className="text-3xl font-black text-slate-900">{(segarStats.totalLitersProduced || farmStats.totalLiters || 0).toLocaleString()} <span className="text-sm font-bold text-slate-500">Liter</span></p>
              <p className="text-xs text-slate-400 font-semibold">Seluruh riwayat perah</p>
            </div>
          </div>

          {/* Recent Simple Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Milk className="w-4 h-4 text-emerald-600" />
                <span>Riwayat Laporan Hasil Perah Terbaru</span>
              </h3>
              <Link href="/produksi" className="text-xs font-bold text-[#1E3F20] hover:underline flex items-center gap-1">
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 px-3">Tanggal</th>
                    <th className="pb-3 px-3">Kode / Varian Susu</th>
                    <th className="pb-3 px-3">Jumlah Hasil Perah (Liter)</th>
                    <th className="pb-3 px-3">Petugas Input</th>
                    <th className="pb-3 px-3">Catatan Perah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {segarStats.recentProductions && segarStats.recentProductions.length > 0 ? (
                    segarStats.recentProductions.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 text-slate-600 font-semibold whitespace-nowrap">
                          {new Date(p.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[11px]">
                            {p.category?.name || 'Susu Segar'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-black text-slate-900">{p.rawVolumeLiters} Liter</td>
                        <td className="py-3 px-3 text-slate-600">{p.createdBy?.name || 'Admin Farm'}</td>
                        <td className="py-3 px-3 text-slate-500 max-w-xs truncate">{p.notes || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">Belum ada laporan hasil perah susu segar.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW FOR ADMIN PEMASARAN: STOK & DISTRIBUSI SUSU SEGAR */}
      {activeTab === 'segar' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Milk className="w-5 h-5 text-emerald-600" />
              <span>Kelola Stok & Distribusi Susu Segar (Admin Pemasaran)</span>
            </h2>
            <Link href="/pemasaran?productType=SEGAR" className="text-xs font-bold text-[#1E3F20] hover:underline flex items-center gap-1">
              <span>Halaman Stok Susu Segar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Stok Ready Segar</span>
              <p className="text-3xl font-black text-emerald-700">{(segarStats.totalReadyStock || 0).toLocaleString()} <span className="text-xs font-bold text-slate-500">botol/pcs</span></p>
              <p className="text-[11px] text-slate-400 font-semibold">Tersedia Siap Distribusi</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Produksi Perah Hari Ini</span>
              <p className="text-2xl font-black text-slate-900">{(segarStats.todayLiters || 0).toLocaleString()} <span className="text-xs font-bold text-slate-500">Liter</span></p>
              <p className="text-xs font-bold text-slate-600">{(segarStats.todayPackaged || 0).toLocaleString()} botol dikemas</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Produksi Perah Bulan Ini</span>
              <p className="text-2xl font-black text-slate-900">{(segarStats.monthLiters || 0).toLocaleString()} <span className="text-xs font-bold text-slate-500">Liter</span></p>
              <p className="text-xs font-bold text-slate-600">{(segarStats.monthPackaged || 0).toLocaleString()} botol dikemas</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Distribusi Hari Ini</span>
              <p className="text-3xl font-black text-blue-600">{(segarStats.todayOutflow || 0).toLocaleString()} <span className="text-xs font-bold text-slate-500">botol</span></p>
              <p className="text-[11px] text-slate-400 font-semibold">Bulan Ini: {(segarStats.monthOutflow || 0).toLocaleString()} botol</p>
            </div>
          </div>

          {/* Table Stok Ready per Varian Susu Segar */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Stok Ready Berdasarkan Kategori Susu Segar</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {segarStats.categories && segarStats.categories.length > 0 ? (
                segarStats.categories.map((c) => (
                  <div key={c.id} className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                      <p className="text-[11px] text-slate-500">Total Masuk: {c.packaged} botol | Terdistribusi: {c.outflow} botol</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-emerald-700">{c.ready}</span>
                      <span className="text-xs font-bold text-slate-500 ml-1">botol</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">Belum ada stok varian kategori susu segar.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW FOR ADMIN PEMASARAN: STOK & DISTRIBUSI SUSU OLAHAN */}
      {activeTab === 'olahan' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Coffee className="w-5 h-5 text-amber-600" />
              <span>Kelola Stok & Distribusi Susu Olahan (Admin Pemasaran)</span>
            </h2>
            <Link href="/pemasaran?productType=OLAHAN" className="text-xs font-bold text-[#1E3F20] hover:underline flex items-center gap-1">
              <span>Halaman Stok Susu Olahan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Stok Ready Olahan</span>
              <p className="text-3xl font-black text-amber-600">{(olahanStats.totalReadyStock || 0).toLocaleString()} <span className="text-xs font-bold text-slate-500">pcs</span></p>
              <p className="text-[11px] text-slate-400 font-semibold">Tersedia Siap Distribusi</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-amber-200 bg-amber-50/40 p-5 rounded-3xl space-y-2">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">Stok Ready Kemasan CUP</span>
              <p className="text-3xl font-black text-amber-700">{(olahanStats.packagingTotals?.cup || 0).toLocaleString()} <span className="text-xs font-bold text-amber-900">cup</span></p>
              <p className="text-[11px] text-amber-800">Kemasan Cup 250ml</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-blue-200 bg-blue-50/40 p-5 rounded-3xl space-y-2">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block">Stok Ready Kemasan PACK</span>
              <p className="text-3xl font-black text-blue-700">{(olahanStats.packagingTotals?.pack || 0).toLocaleString()} <span className="text-xs font-bold text-blue-900">pack</span></p>
              <p className="text-[11px] text-blue-800">Kemasan Bantal / Plastik Pack</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-emerald-200 bg-emerald-50/40 p-5 rounded-3xl space-y-2">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">Stok Ready Kemasan BOTOL</span>
              <p className="text-3xl font-black text-emerald-700">{(olahanStats.packagingTotals?.botol || 0).toLocaleString()} <span className="text-xs font-bold text-emerald-900">botol</span></p>
              <p className="text-[11px] text-emerald-800">Kemasan Botol Olahan</p>
            </div>
          </div>

          {/* Table Breakdown Stok Ready per Varian & Kemasan Susu Olahan */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>Breakdown Stok Ready per Jenis Rasa & Kemasan</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {olahanStats.categories && olahanStats.categories.length > 0 ? (
                olahanStats.categories.map((c) => (
                  <div key={c.id} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-2">
                    <div className="flex items-center justify-between border-b border-amber-200/50 pb-2">
                      <h4 className="font-black text-slate-900 text-sm">{c.name}</h4>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-200/60 text-amber-900">
                        {c.ready} {c.defaultPackaging}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 space-y-1">
                      {Object.keys(c.packagingBreakdown).map((pkg) => (
                        <div key={pkg} className="flex justify-between font-semibold">
                          <span className="capitalize">Kemasan {pkg}:</span>
                          <span className="font-bold text-amber-800">{c.packagingBreakdown[pkg].ready} {pkg}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">Belum ada stok varian kategori susu olahan.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW FOR SUPERADMIN OVERVIEW */}
      {isSuperAdmin && activeTab === 'superadmin' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              <span>Ringkasan Teknis Superadmin</span>
            </h2>
            <Link href="/superadmin" className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1">
              <span>Kelola Akun Admin</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total User Admin</span>
              <p className="text-3xl font-black text-purple-700">{superadminStats.totalAdmins || 0}</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Stok Segar Ready</span>
              <p className="text-3xl font-black text-emerald-700">{(superadminStats.totalSegarReady || 0).toLocaleString()} botol</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Stok Olahan Ready</span>
              <p className="text-3xl font-black text-amber-600">{(superadminStats.totalOlahanReady || 0).toLocaleString()} pcs</p>
            </div>
          </div>
        </div>
      )}

      {/* SIMPLE PRODUCTION REPORTING MODAL FOR ADMIN FARM */}
      {showProdModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Milk className="w-5 h-5 text-emerald-600" />
                <span>Lapor Hasil Perah Susu Segar Harian</span>
              </h3>
              <button onClick={() => setShowProdModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>

            <form onSubmit={handleCreateProduction} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Perah</label>
                <input
                  type="date"
                  value={prodDate}
                  onChange={(e) => setProdDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kode / Jenis Susu Segar</label>
                <select
                  value={prodCategoryId}
                  onChange={(e) => setProdCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                >
                  {segarCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hasil Perah Susu Segar (Liter)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Contoh: 500"
                  value={prodRawLiters}
                  onChange={(e) => setProdRawLiters(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Hasil Perah / Peternakan</label>
                <textarea
                  rows="2"
                  placeholder="Contoh: Perah pagi hari dari sektor kandang A..."
                  value={prodNotes}
                  onChange={(e) => setProdNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProdModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1E3F20] text-white rounded-xl text-xs font-bold hover:bg-[#16331a] shadow"
                >
                  Kirim Laporan Perah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OUTFLOW / DISTRIBUTION MODAL FOR ADMIN PEMASARAN */}
      {showOutModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <span>Input Distribusi / Produk Keluar</span>
              </h3>
              <button onClick={() => setShowOutModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>

            <form onSubmit={handleCreateOutflow} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipe Produk</label>
                  <select
                    value={outProductType}
                    onChange={(e) => {
                      setOutProductType(e.target.value);
                      const matching = categories.filter(c => c.productType === e.target.value);
                      if (matching.length > 0) setOutCategoryId(matching[0].id);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  >
                    <option value="SEGAR">Susu Segar</option>
                    <option value="OLAHAN">Susu Olahan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kemasan</label>
                  <select
                    value={outPackagingType}
                    onChange={(e) => setOutPackagingType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  >
                    <option value="botol">Botol</option>
                    <option value="cup">Cup</option>
                    <option value="pack">Pack / Bantal</option>
                    <option value="liter">Liter (Bulk)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Distribusi</label>
                <input
                  type="date"
                  value={outDate}
                  onChange={(e) => setOutDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Varian Kategori Produk</label>
                <select
                  value={outCategoryId}
                  onChange={(e) => setOutCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  {filteredOutCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Jumlah Distribusi ({outPackagingType})</label>
                <input
                  type="number"
                  placeholder="Contoh: 200"
                  value={outQuantity}
                  onChange={(e) => setOutQuantity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan / Tujuan Distribusi</label>
                <textarea
                  rows="2"
                  placeholder="Contoh: Pengiriman ke toko agen..."
                  value={outNotes}
                  onChange={(e) => setOutNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOutModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow"
                >
                  Simpan Distribusi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
