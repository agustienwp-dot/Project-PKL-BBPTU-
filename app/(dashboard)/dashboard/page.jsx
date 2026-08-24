'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import NotificationDropdown from '@/components/NotificationDropdown';
import { 
  Milk, 
  Package, 
  ArrowRight, 
  Activity, 
  TrendingUp, 
  Calendar,
  Layers,
  FileText,
  Clock,
  CheckCircle2,
  Filter,
  Search,
  ChevronRight,
  Sparkles,
  Store,
  Droplets,
  User
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [statsData, setStatsData] = useState(null);
  const [packagingDash, setPackagingDash] = useState(null);
  const [chartFilter, setChartFilter] = useState('7'); // '7' or '30'
  const [toast, setToast] = useState(null);

  const fetchDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get(`/dashboard/stats?t=${Date.now()}`);
      if (res.data?.success) {
        setStatsData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      if (err.response?.status !== 401) {
        setToast({ type: 'error', message: 'Gagal memuat data statistik dashboard.' });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      const interval = setInterval(() => fetchDashboardData(), 5000);
      const handleFocus = () => fetchDashboardData();
      window.addEventListener('focus', handleFocus);
      return () => {
        clearInterval(interval);
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [user]);
  if (loading) {
    return <LoadingSpinner text="Memuat Dashboard..." />;
  }

  // Format date today (e.g. 13 Agustus 2026)
  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // ADMIN PENGEMASAN SPECIFIC DASHBOARD
  if (user?.role === 'ADMIN_PENGEMASAN') {
    const pkgStats = statsData?.packagingStats || {};
    const {
      stokAwalPcs = 0,
      stokAkhirPcs = 0,
      sisaBahanLiters = 0,
      jumlahStokPcs = 0,
      stokBotol115 = 0,
      stokBotol250 = 0,
      stokCup = 0,
      stokPlastikBantal = 0,
      stokYogurt = 0,
      chart7Days = [],
      chart30Days = [],
      recentPackagings = [],
      recentActivities = [],
    } = pkgStats;

    const displayActivities = recentActivities.length > 0 ? recentActivities : recentPackagings.map(act => ({
      id: act.id,
      title: `Hasil pengemasan ${act.productSubtype || act.productCategory}`,
      detail: `Sebanyak ${act.totalPackagedQty || 0} pcs diproduksi`,
      icon: '📦',
      status: act.status || 'DRAFT',
      user: act.createdBy?.name || 'Admin Pengemasan',
      timestamp: act.updatedAt || act.date,
    }));

    const chartData = chartFilter === '30' ? (chart30Days || []) : (chart7Days || []);
    const maxVal = Math.max(...chartData.map((d) => d.totalPackagedPcs || 0), 10);

    return (
      <div className="space-y-8 pb-12">
        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

        {/* 1. HEADER DASHBOARD GREETING */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1E3F20] text-white rounded-full text-xs font-bold mb-2">
              <Package className="w-4 h-4 text-emerald-200" />
              <span>Dashboard Admin Pengemasan</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Hi, Admin Pengemasan!
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Ringkasan aktivitas pengemasan & stok produk • {todayFormatted}</span>
            </p>
          </div>

          <Link
            href="/pengemasan"
            className="flex items-center justify-center gap-2 px-5 py-3 bg-[#1E3F20] text-white hover:bg-[#16331a] rounded-2xl text-xs font-bold shadow-md transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Mulai Pengemasan</span>
          </Link>
        </div>

        {/* 2. SUMMARY CARDS (4 CARDS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: STOK AWAL */}
          <div className="bg-[#1E3F20] text-white p-6 rounded-3xl shadow-sm space-y-3 hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-200 block">STOK AWAL</span>
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                <Package className="w-4 h-4 text-emerald-200" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-white">
                {stokAwalPcs.toLocaleString()} <span className="text-xs font-bold text-emerald-200">pcs</span>
              </p>
              <p className="text-[11px] text-emerald-200 font-semibold mt-1">Stok awal hari ini</p>
            </div>
          </div>

          {/* Card 2: STOK AKHIR */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">STOK AKHIR</span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-emerald-700">
                {stokAkhirPcs.toLocaleString()} <span className="text-xs font-bold text-slate-500">pcs</span>
              </p>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">Stok akhir hari ini</p>
            </div>
          </div>

          {/* Card 3: SISA BAHAN */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">SISA BAHAN</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
                <Milk className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-purple-700">
                {sisaBahanLiters.toLocaleString()} <span className="text-xs font-bold text-slate-500">Liter</span>
              </p>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">Bahan siap digunakan</p>
            </div>
          </div>

          {/* Card 4: JUMLAH STOK */}
          <div className="bg-gradient-to-br from-[#0D5C3A] to-[#084229] text-white p-6 rounded-3xl shadow-sm space-y-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-200 block">JUMLAH STOK</span>
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                <Layers className="w-4 h-4 text-emerald-200" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-amber-300">
                {jumlahStokPcs.toLocaleString()} <span className="text-xs font-bold text-emerald-200">pcs</span>
              </p>
              <p className="text-[11px] text-emerald-200 font-semibold mt-1">Total produk tersedia</p>
            </div>
          </div>
        </div>

        {/* 2.5 STOK RINCIAN PER KEMASAN PRODUK (5 CARDS) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Rincian Stok Produk Siap Edar</span>
            </h2>
            <span className="text-xs text-slate-400 font-semibold">Persediaan Real-time per Jenis Kemasan</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Card 1: BOTOL 115 ML */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500 block">Susu Botol 115ml</span>
                <span className="text-base">🥛</span>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 font-mono">
                  {stokBotol115.toLocaleString()} <span className="text-xs font-bold text-slate-400">pcs</span>
                </p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Ready Botol 115 ml</p>
              </div>
            </div>

            {/* Card 2: BOTOL 250 ML */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500 block">Susu Botol 250ml</span>
                <span className="text-base">🍾</span>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 font-mono">
                  {stokBotol250.toLocaleString()} <span className="text-xs font-bold text-slate-400">pcs</span>
                </p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Ready Botol 250 ml</p>
              </div>
            </div>

            {/* Card 3: SUSU CUP */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500 block">Susu Cup</span>
                <span className="text-base">🍨</span>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 font-mono">
                  {stokCup.toLocaleString()} <span className="text-xs font-bold text-slate-400">pcs</span>
                </p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Ready Susu Cup</p>
              </div>
            </div>

            {/* Card 4: PLASTIK BANTAL */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500 block">Susu Plastik Bantal</span>
                <span className="text-base">🧃</span>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 font-mono">
                  {stokPlastikBantal.toLocaleString()} <span className="text-xs font-bold text-slate-400">pcs</span>
                </p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Ready Plastik Bantal</p>
              </div>
            </div>

            {/* Card 5: YOGURT */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-200 shadow-sm hover:shadow transition-all space-y-2 col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wide text-amber-800 block">Stok Yogurt</span>
                <span className="text-base">🍧</span>
              </div>
              <div>
                <p className="text-2xl font-black text-amber-900 font-mono">
                  {stokYogurt.toLocaleString()} <span className="text-xs font-bold text-amber-700">pcs</span>
                </p>
                <p className="text-[10px] text-amber-700 font-semibold mt-0.5">Total Stok Yogurt</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. MAIN SECTION: GRAFIK & CATATAN AKTIVITAS TERAKHIR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2-COLS: GRAFIK AKTIVITAS PENGEMASAN */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <span>Grafik Aktivitas Pengemasan</span>
                </h2>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Rekapitulasi aktivitas pengemasan produk
                </p>
              </div>

              {/* Filter 7 Hari / Bulan Ini */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
                <button
                  onClick={() => setChartFilter('7')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    chartFilter === '7' ? 'bg-[#1E3F20] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  7 Hari
                </button>
                <button
                  onClick={() => setChartFilter('30')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    chartFilter === '30' ? 'bg-[#1E3F20] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Bulan Ini
                </button>
              </div>
            </div>

            {/* BAR CHART GRAPHIC */}
            <div className="h-64 flex items-end justify-between gap-2 pt-6 px-2 border-b border-slate-100">
              {chartData.length > 0 ? (
                chartData.map((item, idx) => {
                  const val = item.totalPackagedPcs || 0;
                  const pct = Math.min(100, Math.max(8, Math.round((val / maxVal) * 100)));

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative">
                      {/* Tooltip on Hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 bg-slate-900 text-white p-2.5 rounded-xl text-[10px] font-bold shadow-xl z-20 pointer-events-none whitespace-nowrap text-center">
                        <div className="text-slate-300 font-normal">{item.formattedDate || item.label}</div>
                        <div className="text-emerald-400 font-extrabold">Dikemas: {val} pcs</div>
                        <div className="text-amber-300 font-bold">Stok Bertambah: {item.stokAdded || 0} pcs</div>
                      </div>

                      {/* Value Label */}
                      <span className="text-[10px] font-black text-slate-500 group-hover:text-emerald-700 transition-colors">
                        {val > 0 ? `${val}` : ''}
                      </span>

                      {/* Bar Container */}
                      <div
                        style={{ height: `${pct}%` }}
                        className={`w-full rounded-2xl transition-all duration-300 group-hover:scale-105 shadow-sm ${
                          val > 0 ? 'bg-gradient-to-t from-[#1E3F20] to-emerald-500' : 'bg-slate-100'
                        }`}
                      ></div>

                      {/* X Label */}
                      <span className="text-[10px] font-bold text-slate-500 truncate max-w-full group-hover:text-slate-900">
                        {chartFilter === '30' ? item.dayNum : (item.dayName?.slice(0, 3) || item.formattedDate)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 font-medium">
                  Belum ada data aktivitas pengemasan.
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#1E3F20]"></span>
                <span>Jumlah Hasil Pengemasan (pcs)</span>
              </div>
              <span>Tinggi grafik proporsional dengan jumlah produk</span>
            </div>
          </div>

          {/* RIGHT 1-COL: CATATAN AKTIVITAS TERAKHIR */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 flex flex-col justify-between">
            <div>
              <div className="border-b border-slate-100 pb-3 mb-4">
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  <span>Catatan Aktivitas Terakhir</span>
                </h2>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Aktivitas pengemasan terbaru
                </p>
              </div>

              {/* Activity List */}
              <div className="space-y-3.5">
                {displayActivities.length > 0 ? (
                  displayActivities.map((act) => {
                    const st = act.status || 'Berhasil';
                    let icon = act.icon || '📦';
                    let statusLabel = 'Tercatat';
                    let badgeClass = 'bg-emerald-100 text-emerald-900 border border-emerald-200';

                    if (st === 'MENUNGGU_PENERIMAAN') {
                      statusLabel = 'Menunggu Penerimaan';
                      badgeClass = 'bg-amber-100 text-amber-900 border border-amber-200';
                    } else if (st === 'DITERIMA' || st === 'SELESAI' || st === 'Berhasil') {
                      statusLabel = 'Selesai';
                      badgeClass = 'bg-emerald-100 text-emerald-900 border border-emerald-200';
                    }

                    const formattedTime = new Date(act.timestamp || new Date()).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <div key={act.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 hover:bg-slate-100/80 transition-colors">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm">{icon}</span>
                          <span className={`px-2 py-0.5 text-[9px] font-black rounded-md uppercase tracking-wider ${badgeClass}`}>
                            {statusLabel}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 leading-snug">
                          {act.title} — {act.detail}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold">
                          Oleh {act.user || 'Admin Pengemasan'} • {formattedTime}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-xs text-slate-400 font-medium space-y-2">
                    <p className="text-2xl">📋</p>
                    <p>Belum ada aktivitas terbaru hari ini.</p>
                  </div>
                )}
              </div>
            </div>

            <Link
              href="/pengemasan"
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-center rounded-2xl text-xs font-bold transition-colors flex items-center justify-center gap-1 mt-4"
            >
              <span>Kelola Pengemasan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const farmStats = statsData?.farm || {};
  const todaySapi = farmStats.todaySapiLiters || 0;
  const todayKambing = farmStats.todayKambingLiters || 0;
  const todayTotalLiters = farmStats.todayTotalLiters || (todaySapi + todayKambing);

  const todayTotalGross = farmStats.todayGrossLiters || todayTotalLiters || 0;
  const todaySapiGross = farmStats.todaySapiGross || todaySapi || 0;
  const todayKambingGross = farmStats.todayKambingGross || todayKambing || 0;
  const todayRawLiters = farmStats.todayRawLiters || todayTotalGross;

  const sapiPercentage = todayTotalGross > 0 ? Math.round((todaySapiGross / todayTotalGross) * 100) : 0;
  const kambingPercentage = todayTotalGross > 0 ? Math.round((todayKambingGross / todayTotalGross) * 100) : 0;
  const rawPercentage = todayTotalGross > 0 ? Math.round((todayRawLiters / todayTotalGross) * 100) : 0;

  const chartData = chartFilter === '30' ? (farmStats.chart30Days || []) : (farmStats.chart7Days || []);
  const maxChartVal = Math.max(...chartData.map(d => d.totalLiters || 0), 10);

  // Format date today (e.g. 19 Agustus 2026)
  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  return (
    <div className="space-y-6 pb-12 bg-[#F4F7FB] -m-6 p-6 min-h-screen">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* TOP BAR / HEADER */}
      <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black text-slate-900">
                Hi, {user?.name || 'Admin Farm'}!
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              <span>Ringkasan Statistik Perah & Penyerahan Susu • {todayFormatted}</span>
            </p>
          </div>
        </div>

        {/* SEARCH, NOTIFICATION & ACCOUNT BADGE */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2 bg-slate-100/80 border border-slate-200/60 px-3.5 py-2 rounded-2xl text-xs text-slate-500 w-44 md:w-56">
            <span className="font-medium">Cari data farm...</span>
          </div>

          <NotificationDropdown />

          <div className="px-3.5 py-2 rounded-2xl bg-slate-100 border border-slate-200/80 text-slate-800 text-xs font-bold flex items-center gap-2 shadow-sm">
            <span className="text-xs font-extrabold">{user?.name || 'Admin Farm'}</span>
          </div>
        </div>
      </div>

      {/* 1. TOP HORIZONTAL WIDGET CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Produksi Susu */}
        <div className="bg-[#1E3F20] text-white p-5 rounded-3xl shadow-sm flex flex-col justify-between h-36 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider">Produksi Susu</span>
          </div>
          <div>
            <p className="text-2xl font-black text-white">
              {todayTotalGross.toLocaleString()} <span className="text-xs font-semibold text-emerald-200">Liter</span>
            </p>
            <span className="text-[10px] text-emerald-200/90 font-medium block mt-1">100% dari total produksi</span>
          </div>
        </div>

        {/* Card 2: Susu Sapi */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between h-36 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">Susu Sapi</span>
            <span className="text-lg">🐄</span>
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-700">
              {todaySapiGross.toLocaleString()} <span className="text-xs font-semibold text-slate-400">Liter</span>
            </p>
            <span className="text-[10px] text-slate-500 font-medium block mt-1">{sapiPercentage}% dari total produksi</span>
          </div>
        </div>

        {/* Card 3: Susu Kambing */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between h-36 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">Susu Kambing</span>
            <span className="text-lg">🐐</span>
          </div>
          <div>
            <p className="text-2xl font-black text-purple-700">
              {todayKambingGross.toLocaleString()} <span className="text-xs font-semibold text-slate-400">Liter</span>
            </p>
            <span className="text-[10px] text-slate-500 font-medium block mt-1">{kambingPercentage}% dari total produksi</span>
          </div>
        </div>

        {/* Card 4: Diserah terimakan */}
        <div className="bg-gradient-to-tr from-emerald-600 to-teal-700 text-white p-5 rounded-3xl shadow-sm flex flex-col justify-between h-36 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider">Diserah terimakan</span>
          </div>
          <div>
            <p className="text-2xl font-black text-white">
              {todayRawLiters.toLocaleString()} <span className="text-xs font-semibold text-emerald-100">Liter</span>
            </p>
            <span className="text-[10px] text-emerald-100 font-medium block mt-1">{rawPercentage}% dari total produksi</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN DASHBOARD CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: GRAFIK & HASIL PERAH PER FARM */}
        <div className="lg:col-span-8 space-y-6">

          {/* WIDGET 1: GRAFIK TREND PRODUKSI */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  <span>Grafik Trend Hasil Perah</span>
                </h2>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  {chartFilter === '30' ? 'Rekapitulasi volume perah harian bulan ini' : 'Rekapitulasi volume perah 7 hari terakhir'}
                </p>
              </div>

              {/* FILTER PILLS */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
                <button
                  onClick={() => setChartFilter('7')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                    chartFilter === '7'
                      ? 'bg-[#1E3F20] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  7 Hari
                </button>
                <button
                  onClick={() => setChartFilter('30')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                    chartFilter === '30'
                      ? 'bg-[#1E3F20] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Bulan Ini
                </button>
              </div>
            </div>

            {/* CHART DISPLAY */}
            <div className="space-y-4 pt-2">
              <div className={`h-56 flex items-end justify-between px-2 w-full ${
                chartFilter === '30' ? 'gap-1' : 'gap-3'
              }`}>
                {chartData.map((d, index) => {
                  const heightPercent = maxChartVal > 0 ? Math.round((d.totalLiters / maxChartVal) * 100) : 0;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                      <span className="opacity-0 group-hover:opacity-100 text-[10px] font-black text-emerald-950 transition-opacity bg-emerald-100 border border-emerald-300 px-2 py-1 rounded-lg shadow-sm pointer-events-none whitespace-nowrap z-20 absolute -top-8">
                        {d.formattedDate || d.dateStr}: {d.totalLiters} Liter
                      </span>
                      <div
                        className="w-full bg-gradient-to-t from-[#1E3F20] via-emerald-600 to-emerald-400 rounded-t-xl group-hover:brightness-110 transition-all shadow-sm min-h-[6px]"
                        style={{ height: `${Math.max(heightPercent, 5)}%` }}
                      ></div>
                      <span className={`font-bold text-slate-500 w-full text-center ${
                        chartFilter === '30' ? 'text-[9px]' : 'text-[10px]'
                      }`}>
                        {chartFilter === '30' ? (d.dayNum || d.dateStr?.split('/')[0]) : d.dayName}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pt-3 border-t border-slate-100">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#1E3F20]"></span>
                  <span>Volume Hasil Perah (Liter)</span>
                </span>
                <span>Tinggi grafik proporsional dengan volume hasil perah</span>
              </div>
            </div>
          </div>

          {/* WIDGET 2: PEROLEHAN SUSU PER FARM HARI INI */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Perolehan Susu per Farm Hari Ini
                </h2>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Tegalsari, Limpakuwus, Manggala, Eduwisata</p>
              </div>
              <Link href="/reports" className="text-xs font-black text-emerald-800 hover:underline">
                Laporan Resmi
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Farm Tegalsari */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between hover:shadow-sm transition-shadow">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider">FARM TEGALSARI</span>
                  <p className="text-2xl font-black text-slate-900">
                    {(farmStats.farmOriginToday?.tegalsari || 0).toLocaleString()} <span className="text-xs font-bold text-slate-500">Liter</span>
                  </p>
                  <span className="text-[10px] text-slate-500 font-bold block">Perah Pagi & Sore</span>
                </div>
              </div>

              {/* Farm Limpakuwus */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex items-center justify-between hover:shadow-sm transition-shadow">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-blue-900 uppercase tracking-wider">FARM LIMPAKUWUS</span>
                  <p className="text-2xl font-black text-slate-900">
                    {(farmStats.farmOriginToday?.limpakuwus || 0).toLocaleString()} <span className="text-xs font-bold text-slate-500">Liter</span>
                  </p>
                  <span className="text-[10px] text-slate-500 font-bold block">Perah Pagi & Sore</span>
                </div>
              </div>

              {/* Farm Manggala */}
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 flex items-center justify-between hover:shadow-sm transition-shadow">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-purple-900 uppercase tracking-wider">FARM MANGGALA</span>
                  <p className="text-2xl font-black text-slate-900">
                    {(farmStats.farmOriginToday?.manggala || 0).toLocaleString()} <span className="text-xs font-bold text-slate-500">Liter</span>
                  </p>
                  <span className="text-[10px] text-slate-500 font-bold block">Perah Pagi & Sore</span>
                </div>
              </div>

              {/* Eduwisata */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between hover:shadow-sm transition-shadow">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-emerald-900 uppercase tracking-wider">EDUWISATA</span>
                  <p className="text-2xl font-black text-slate-900">
                    {(farmStats.farmOriginToday?.eduwisata || 0).toLocaleString()} <span className="text-xs font-bold text-slate-500">Liter</span>
                  </p>
                  <span className="text-[10px] text-slate-500 font-bold block">Perah Pagi & Sore</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT SIDEBAR COLUMN: LOG AKTIVITAS */}
        <div className="lg:col-span-4 space-y-6">

          {/* WIDGET 4: LOG AKTIVITAS TERAKHIR */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
                <h3 className="text-base font-black text-slate-900">
                  Catatan Aktivitas Terakhir
                </h3>
              </div>

              <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
                {farmStats.recentLogs && farmStats.recentLogs.length > 0 ? (
                  farmStats.recentLogs.map((log) => {
                    const dt = new Date(log.createdAt || log.date || Date.now());
                    const logTime = dt.toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    }).replace('.', ':') + ' WIB';
                    return (
                      <div key={log.id} className="flex gap-3 text-xs border-b border-slate-100/80 pb-3.5 last:border-0 last:pb-0">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-900 text-xs">{logTime}</span>
                          </div>
                          <p className="text-slate-600 text-xs font-medium leading-relaxed">
                            {log.details || 'Pencatatan perah berhasil.'}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-slate-400 text-xs font-semibold">
                    Belum ada aktivitas terbaru hari ini.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <Link
                href="/riwayat-produksi"
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold flex items-center justify-center transition-colors text-center"
              >
                Lihat Seluruh Riwayat Log
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
