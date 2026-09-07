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
  Plus,
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
  User,
  Boxes,
  PieChart
} from 'lucide-react';

function Sparkline({ color = '#10B981', bg = 'rgba(16, 185, 129, 0.12)' }) {
  return (
    <svg className="w-20 h-9 overflow-visible" viewBox="0 0 60 25" fill="none">
      <path
        d="M0 20 Q 15 5, 30 15 T 60 5"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M0 20 Q 15 5, 30 15 T 60 5 L 60 25 L 0 25 Z"
        fill={bg}
      />
    </svg>
  );
}

function DonutChart({ susuQty = 0, yogurtQty = 0, kejuQty = 0 }) {
  const [hoveredItem, setHoveredItem] = useState(null);

  const realTotal = susuQty + yogurtQty + kejuQty;
  const total = realTotal || 1;
  const susuPct = (susuQty / total) * 100;
  const yogurtPct = (yogurtQty / total) * 100;
  const kejuPct = (kejuQty / total) * 100;

  const c = 251.32;
  const susuStroke = (susuPct / 100) * c;
  const yogurtStroke = (yogurtPct / 100) * c;
  const kejuStroke = (kejuPct / 100) * c;

  const susuOffset = 0;
  const yogurtOffset = -susuStroke;
  const kejuOffset = -(susuStroke + yogurtStroke);

  return (
    <div className="relative flex flex-col items-center justify-center py-2">
      <div className="relative flex items-center justify-center">
        <svg className="w-48 h-48 -rotate-90 cursor-pointer" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" stroke="#F1F5F9" strokeWidth="12" fill="none" />
          {susuQty > 0 && (
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#10B981"
              strokeWidth={hoveredItem?.name === 'Susu Rasa' ? '15' : '12'}
              strokeDasharray={`${susuStroke} ${c}`}
              strokeDashoffset={susuOffset}
              fill="none"
              strokeLinecap="round"
              className="transition-all duration-300 hover:opacity-90 cursor-pointer"
              onMouseEnter={() => setHoveredItem({ name: 'Susu Rasa', qty: susuQty, pct: susuPct.toFixed(1), badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300' })}
              onMouseLeave={() => setHoveredItem(null)}
            />
          )}
          {yogurtQty > 0 && (
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#F59E0B"
              strokeWidth={hoveredItem?.name === 'Yogurt' ? '15' : '12'}
              strokeDasharray={`${yogurtStroke} ${c}`}
              strokeDashoffset={yogurtOffset}
              fill="none"
              strokeLinecap="round"
              className="transition-all duration-300 hover:opacity-90 cursor-pointer"
              onMouseEnter={() => setHoveredItem({ name: 'Yogurt', qty: yogurtQty, pct: yogurtPct.toFixed(1), badgeBg: 'bg-amber-100 text-amber-900 border-amber-300' })}
              onMouseLeave={() => setHoveredItem(null)}
            />
          )}
          {kejuQty > 0 && (
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#8B5CF6"
              strokeWidth={hoveredItem?.name === 'Keju' ? '15' : '12'}
              strokeDasharray={`${kejuStroke} ${c}`}
              strokeDashoffset={kejuOffset}
              fill="none"
              strokeLinecap="round"
              className="transition-all duration-300 hover:opacity-90 cursor-pointer"
              onMouseEnter={() => setHoveredItem({ name: 'Keju', qty: kejuQty, pct: kejuPct.toFixed(1), badgeBg: 'bg-purple-100 text-purple-900 border-purple-300' })}
              onMouseLeave={() => setHoveredItem(null)}
            />
          )}
        </svg>
        <div className="absolute text-center pointer-events-none px-4">
          {hoveredItem ? (
            <div className="animate-in fade-in zoom-in-95 duration-150">
              <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider inline-block mb-1 shadow-xs ${hoveredItem.badgeBg}`}>
                {hoveredItem.name}
              </span>
              <span className="text-xl font-black text-slate-900 font-mono block">
                {hoveredItem.qty.toLocaleString()} <span className="text-[10px] text-slate-500 font-bold">pcs</span>
              </span>
              <span className="text-[10px] font-extrabold text-slate-500 block mt-0.5">
                {hoveredItem.pct}% dari Total
              </span>
            </div>
          ) : (
            <div>
              <span className="text-2xl font-black text-slate-900 font-mono block">
                {realTotal.toLocaleString()}
              </span>
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
                Total Stok (Pcs)
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [statsData, setStatsData] = useState(null);
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

  if (loading && !statsData) {
    return <LoadingSpinner text="Memuat Dashboard..." />;
  }

  // Format date today (e.g. 13 Agustus 2026)
  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // ADMIN PENGEMASAN / DIVISI UHT SPECIFIC DASHBOARD
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
      stokKeju = 0,
      chart7Days = [],
      chart30Days = [],
      recentPackagings = [],
      recentActivities = [],
    } = pkgStats;

    const displayActivities = recentActivities.length > 0 ? recentActivities : recentPackagings.map(act => ({
      id: act.id,
      title: `Hasil pengolahan ${act.productSubtype || act.productCategory}`,
      detail: `Sebanyak ${act.totalPackagedQty || 0} pcs diproduksi`,
      icon: '📦',
      status: act.status || 'DRAFT',
      user: act.createdBy?.name || 'Divisi UHT',
      timestamp: act.updatedAt || act.date,
    }));

    const chartData = chartFilter === '30' ? (chart30Days || []) : (chart7Days || []);
    const maxVal = Math.max(...chartData.map((d) => d.totalPackagedPcs || 0), 10);

    const totalSusuOlahan = stokBotol115 + stokBotol250 + stokCup + stokPlastikBantal;

    return (
      <div className="space-y-6 pb-12 bg-[#F6F8FA] -m-6 p-6 min-h-screen">
        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

        {/* 1. HEADER DASHBOARD GREETING */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1E3F20] to-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-emerald-900/20">
              🥛
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  Divisi UHT / Pengolahan
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                Dashboard Divisi UHT / Pengolahan
              </h1>
              <p className="text-xs text-slate-500 font-semibold mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Ringkasan hasil pengolahan (Susu Olahan Rasa, Yogurt, Keju) & persediaan stok • {todayFormatted}</span>
              </p>
            </div>
          </div>
        </div>

        {/* 2. TOP GRID: SIAP PRODUKSI (Left 7 cols) & CATATAN AKTIVITAS TERAKHIR (Right 5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 7 COLS: SIAP PRODUKSI */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden group flex flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-500"></div>
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-base">
                    <Milk className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500 block">SIAP PRODUKSI</span>
                    <span className="text-[11px] text-slate-400 font-semibold">Bahan baku susu segar siap diolah</span>
                  </div>
                </div>
                <Sparkline color="#10B981" bg="rgba(16, 185, 129, 0.12)" />
              </div>
              <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4">
                <div>
                  <p className="text-4xl font-black text-emerald-800 font-mono tracking-tight">
                    {sisaBahanLiters.toLocaleString()} <span className="text-sm font-extrabold text-slate-500 font-sans">Liter</span>
                  </p>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Susu siap diproses menjadi Susu Olahan Rasa, Yogurt, & Keju</p>
                </div>
                <span className="px-3.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  Tersedia
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: CATATAN AKTIVITAS TERAKHIR */}
          <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-3">
            <div>
              <div className="border-b border-slate-100 pb-2 mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <span>Catatan Aktivitas Terakhir</span>
                  </h2>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                    Aktivitas pengolahan terbaru
                  </p>
                </div>
              </div>

              {/* Activity List with Scroll */}
              <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                {displayActivities.length > 0 ? (
                  displayActivities.slice(0, 4).map((act) => {
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
                      <div key={act.id} className="p-2 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5 hover:bg-slate-100/80 transition-colors">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs">{icon}</span>
                          <span className={`px-2 py-0.5 text-[8px] font-black rounded-md uppercase tracking-wider ${badgeClass}`}>
                            {statusLabel}
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-800 leading-snug">
                          {act.title} — {act.detail}
                        </p>
                        <p className="text-[9px] text-slate-400 font-semibold">
                          Oleh {act.user || 'Divisi UHT'} • {formattedTime}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-4 text-center text-xs text-slate-400 font-medium space-y-1">
                    <p className="text-xl">📋</p>
                    <p>Belum ada aktivitas terbaru hari ini.</p>
                  </div>
                )}
              </div>
            </div>

            <Link
              href="/pengemasan"
              className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-center rounded-xl text-[11px] font-bold transition-colors flex items-center justify-center gap-1 mt-1"
            >
              <span>Kelola Pengolahan</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>


        {/* 4. MAIN CHARTS SECTION (Grid 12 Cols: Left Trend, Right Donut Chart "Stok Produk Siap Edar") */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 7 COLS: GRAFIK TREND PENGOLAHAN */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <span>Trend Hasil Pengolahan Produk</span>
                </h2>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Rekapitulasi volume pengemasan harian (pcs)
                </p>
              </div>

              {/* Filter 7 Hari / Bulan Ini */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
                <button
                  onClick={() => setChartFilter('7')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    chartFilter === '7' ? 'bg-[#1E3F20] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  7 Hari
                </button>
                <button
                  onClick={() => setChartFilter('30')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    chartFilter === '30' ? 'bg-[#1E3F20] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Bulan Ini
                </button>
              </div>
            </div>

            {/* BAR CHART */}
            <div className="h-60 flex items-end justify-between gap-2 pt-6 px-2 border-b border-slate-100">
              {chartData.length > 0 ? (
                chartData.map((item, idx) => {
                  const val = item.totalPackagedPcs || 0;
                  const pct = Math.min(100, Math.max(8, Math.round((val / maxVal) * 100)));

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative">
                      {/* Tooltip on Hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 bg-slate-900 text-white p-2.5 rounded-xl text-[10px] font-bold shadow-xl z-20 pointer-events-none whitespace-nowrap text-center">
                        <div className="text-slate-300 font-normal">{item.formattedDate || item.label}</div>
                        <div className="text-emerald-400 font-extrabold">Hasil Pengolahan: {val} pcs</div>
                      </div>

                      {/* Value Label */}
                      <span className="text-[10px] font-black text-slate-500 group-hover:text-emerald-700 transition-colors">
                        {val > 0 ? `${val}` : ''}
                      </span>

                      {/* Bar Container */}
                      <div
                        style={{ height: `${pct}%` }}
                        className={`w-full rounded-t-xl transition-all duration-300 group-hover:scale-105 shadow-sm ${
                          val > 0 ? 'bg-gradient-to-t from-[#1E3F20] via-emerald-600 to-emerald-400' : 'bg-slate-100'
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
                  Belum ada data aktivitas pengolahan.
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#1E3F20]"></span>
                <span>Volume Pengemasan (pcs)</span>
              </div>
              <span>Grafik real-time produksi divisi UHT</span>
            </div>
          </div>

          {/* RIGHT 5 COLS: DONUT CHART "STOK PRODUK SIAP EDAR" */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-amber-600" />
                <span>Stok Produk Siap Edar</span>
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Proporsi total persediaan produk olahan (pcs)
              </p>
            </div>

            {/* Donut Chart Visual */}
            <DonutChart
              susuQty={totalSusuOlahan}
              yogurtQty={stokYogurt}
              kejuQty={stokKeju}
            />

            {/* Legend Item Dots */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                <div>
                  <span className="text-[11px] font-extrabold text-slate-700 block">Susu Rasa</span>
                  <span className="text-[10px] text-slate-400 font-mono font-bold">{totalSusuOlahan} pcs</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                <div>
                  <span className="text-[11px] font-extrabold text-slate-700 block">Yogurt</span>
                  <span className="text-[10px] text-slate-400 font-mono font-bold">{stokYogurt} pcs</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0"></span>
                <div>
                  <span className="text-[11px] font-extrabold text-slate-700 block">Keju</span>
                  <span className="text-[10px] text-slate-400 font-mono font-bold">{stokKeju} pcs</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. BOTTOM SECTION: RINCIAN SISA STOK BAHAN (ELEGANT TABLE LIST LAYOUT) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">Rincian Sisa Stok Bahan</h2>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Persediaan bahan dan kemasan yang tersedia</p>
              </div>
            </div>
            <Link
              href="/pengemasan/stok-bahan"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1 transition-colors"
            >
              <span>Lihat Semua Bahan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-600 font-bold">
                  <th className="py-3 px-4 rounded-l-xl">Bahan / Kemasan</th>
                  <th className="py-3 px-4 text-center">Stok</th>
                  <th className="py-3 px-4 text-center">Satuan</th>
                  <th className="py-3 px-4 text-center rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {(pkgStats.materials || []).slice(0, 6).map((mat) => {
                  const mName = mat.name || '';
                  const mLower = mName.toLowerCase();
                  let iconSymbol = '📦';
                  if (mLower.includes('botol')) iconSymbol = '🍾';
                  else if (mLower.includes('cup')) iconSymbol = '🥤';
                  else if (mLower.includes('bantal') || mLower.includes('plastik')) iconSymbol = '🛍️';
                  else if (mLower.includes('label') || mLower.includes('stiker')) iconSymbol = '🏷️';
                  else if (mLower.includes('keju')) iconSymbol = '🧀';

                  return (
                    <tr key={mat.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-3">
                        <span className="text-base shrink-0">{iconSymbol}</span>
                        <span>{mat.name}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-black text-slate-900 text-sm">
                        {Number(mat.currentStock).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-500 font-semibold">
                        {mat.unit || 'pcs'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {mat.status === 'Aman' && (
                          <span className="px-3 py-1 rounded-lg bg-emerald-100/80 text-emerald-800 text-[10px] font-black uppercase tracking-wider border border-emerald-200/60 inline-block">
                            Aman
                          </span>
                        )}
                        {mat.status === 'Menipis' && (
                          <span className="px-3 py-1 rounded-lg bg-amber-100/80 text-amber-900 text-[10px] font-black uppercase tracking-wider border border-amber-200/60 inline-block">
                            Menipis
                          </span>
                        )}
                        {mat.status === 'Kritis' && (
                          <span className="px-3 py-1 rounded-lg bg-rose-100/80 text-rose-800 text-[10px] font-black uppercase tracking-wider border border-rose-200/60 inline-block animate-pulse">
                            Kritis
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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

  return (
    <div className="space-y-6 pb-12 bg-[#F6F8FA] -m-6 p-6 min-h-screen">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* WELCOME HEADER */}
      <div className="px-1 pt-1 pb-1">
        <h1 className="text-xl md:text-2xl font-black text-slate-900">
          Hi, {user?.name || 'Admin Farm'}!
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          <span>Ringkasan Statistik Perah & Penyerahan Susu • {todayFormatted}</span>
        </p>
      </div>

      {/* 1. TOP HORIZONTAL WIDGET CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Produksi Susu */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between h-36 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm font-black text-[#1E3F20] uppercase tracking-wider">Produksi Susu</span>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-black text-[#1E3F20]">
              {todayTotalGross.toLocaleString()} <span className="text-xs md:text-sm font-bold text-[#1E3F20]/80">Liter</span>
            </p>
            <span className="text-[11px] text-[#1E3F20]/90 font-extrabold block mt-1">100% dari total produksi</span>
          </div>
        </div>

        {/* Card 2: Susu Sapi */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm font-black text-[#1E3F20] uppercase tracking-wider">Susu Sapi</span>
            <span className="text-xl">🐄</span>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-black text-[#1E3F20]">
              {todaySapiGross.toLocaleString()} <span className="text-xs md:text-sm font-bold text-[#1E3F20]/80">Liter</span>
            </p>
            <span className="text-[11px] text-[#1E3F20]/90 font-extrabold block mt-1">{sapiPercentage}% dari total produksi</span>
          </div>
        </div>

        {/* Card 3: Susu Kambing */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm font-black text-[#1E3F20] uppercase tracking-wider">Susu Kambing</span>
            <span className="text-xl">🐐</span>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-black text-[#1E3F20]">
              {todayKambingGross.toLocaleString()} <span className="text-xs md:text-sm font-bold text-[#1E3F20]/80">Liter</span>
            </p>
            <span className="text-[11px] text-[#1E3F20]/90 font-extrabold block mt-1">{kambingPercentage}% dari total produksi</span>
          </div>
        </div>

        {/* Card 4: Diserah terimakan */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between h-36 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm font-black text-[#1E3F20] uppercase tracking-wider">Diserah terimakan</span>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-black text-[#1E3F20]">
              {todayRawLiters.toLocaleString()} <span className="text-xs md:text-sm font-bold text-[#1E3F20]/80">Liter</span>
            </p>
            <span className="text-[11px] text-[#1E3F20]/90 font-extrabold block mt-1">{rawPercentage}% dari total produksi</span>
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
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900">
                Perolehan Susu per Farm Hari Ini
              </h2>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">Tegalsari, Limpakuwus, Manggala, Eduwisata</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Farm Tegalsari */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between hover:shadow-sm transition-shadow">
                <div className="space-y-1">
                  <span className="text-xs font-black text-[#1E3F20] uppercase tracking-wider">FARM TEGALSARI</span>
                  <p className="text-2xl font-black text-slate-900">
                    {(farmStats.farmOriginToday?.tegalsari || 0).toLocaleString()} <span className="text-xs font-bold text-slate-500">Liter</span>
                  </p>
                  <span className="text-[10px] text-slate-500 font-bold block">Perah Pagi & Sore</span>
                </div>
              </div>

              {/* Farm Limpakuwus */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between hover:shadow-sm transition-shadow">
                <div className="space-y-1">
                  <span className="text-xs font-black text-[#1E3F20] uppercase tracking-wider">FARM LIMPAKUWUS</span>
                  <p className="text-2xl font-black text-slate-900">
                    {(farmStats.farmOriginToday?.limpakuwus || 0).toLocaleString()} <span className="text-xs font-bold text-slate-500">Liter</span>
                  </p>
                  <span className="text-[10px] text-slate-500 font-bold block">Perah Pagi & Sore</span>
                </div>
              </div>

              {/* Farm Manggala */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between hover:shadow-sm transition-shadow">
                <div className="space-y-1">
                  <span className="text-xs font-black text-[#1E3F20] uppercase tracking-wider">FARM MANGGALA</span>
                  <p className="text-2xl font-black text-slate-900">
                    {(farmStats.farmOriginToday?.manggala || 0).toLocaleString()} <span className="text-xs font-bold text-slate-500">Liter</span>
                  </p>
                  <span className="text-[10px] text-slate-500 font-bold block">Perah Pagi & Sore</span>
                </div>
              </div>

              {/* Eduwisata */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between hover:shadow-sm transition-shadow">
                <div className="space-y-1">
                  <span className="text-xs font-black text-[#1E3F20] uppercase tracking-wider">EDUWISATA</span>
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
