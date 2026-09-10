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

function getFarmChartData(rawChartData, chartFilter, todayTotalGross, todaySapiGross, todayKambingGross) {
  const daysName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const now = new Date();
  const currentDay = now.getDate();

  if (chartFilter === '7') {
    if (Array.isArray(rawChartData) && rawChartData.length >= 7) {
      return rawChartData.map((item, idx) => {
        const isCurrent = idx === rawChartData.length - 1 || item.dayNum === currentDay;
        if (isCurrent) {
          const tot = todayTotalGross > 0 ? todayTotalGross : (item.totalLiters || 0);
          const sapi = todaySapiGross > 0 ? todaySapiGross : (item.sapiLiters || 0);
          const kambing = todayKambingGross > 0 ? todayKambingGross : (item.kambingLiters || 0);
          return {
            ...item,
            totalLiters: tot,
            sapiLiters: sapi,
            kambingLiters: kambing,
            isToday: true,
          };
        }
        return {
          ...item,
          totalLiters: item.totalLiters || 0,
          sapiLiters: item.sapiLiters || 0,
          kambingLiters: item.kambingLiters || 0,
          isToday: false,
        };
      });
    }
    const res = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayIdx = d.getDay();
      const isToday = i === 0;
      res.push({
        label: `${daysName[dayIdx]} ${d.getDate()}/${d.getMonth() + 1}`,
        dayName: daysName[dayIdx],
        dayNum: d.getDate(),
        monthNum: d.getMonth() + 1,
        dateStr: `${d.getDate()}/${d.getMonth() + 1}`,
        formattedDate: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        totalLiters: isToday ? todayTotalGross : 0,
        sapiLiters: isToday ? todaySapiGross : 0,
        kambingLiters: isToday ? todayKambingGross : 0,
        isToday: isToday,
      });
    }
    return res;
  } else {
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    if (Array.isArray(rawChartData) && rawChartData.length >= daysInMonth) {
      return rawChartData.map(item => {
        const isCurrent = item.dayNum === currentDay;
        if (isCurrent) {
          const tot = todayTotalGross > 0 ? todayTotalGross : (item.totalLiters || 0);
          const sapi = todaySapiGross > 0 ? todaySapiGross : (item.sapiLiters || 0);
          const kambing = todayKambingGross > 0 ? todayKambingGross : (item.kambingLiters || 0);
          return {
            ...item,
            totalLiters: tot,
            sapiLiters: sapi,
            kambingLiters: kambing,
            isToday: true,
          };
        }
        return {
          ...item,
          totalLiters: item.totalLiters || 0,
          sapiLiters: item.sapiLiters || 0,
          kambingLiters: item.kambingLiters || 0,
          isToday: false,
        };
      });
    }
    const res = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(now.getFullYear(), now.getMonth(), day);
      const dayIdx = d.getDay();
      const isToday = day === currentDay;
      res.push({
        label: `${daysName[dayIdx]} ${day}/${now.getMonth() + 1}`,
        dayName: daysName[dayIdx],
        dayNum: day,
        monthNum: now.getMonth() + 1,
        dateStr: `${day}/${now.getMonth() + 1}`,
        formattedDate: `${day} ${d.toLocaleDateString('id-ID', { month: 'short' })}`,
        totalLiters: isToday ? todayTotalGross : 0,
        sapiLiters: isToday ? todaySapiGross : 0,
        kambingLiters: isToday ? todayKambingGross : 0,
        isToday: isToday,
        isFuture: day > currentDay,
      });
    }
    return res;
  }
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [statsData, setStatsData] = useState(null);
  const [chartFilter, setChartFilter] = useState('30'); // Default: '30' (1 Bulan sesuai tanggal)
  const [activeFarmChartIdx, setActiveFarmChartIdx] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let res;
      try {
        res = await api.get(`/dashboard/stats?t=${Date.now()}`);
      } catch (e1) {
        res = await api.get(`/susu-farm/dashboard/stats?t=${Date.now()}`);
      }
      if (res?.data?.success) {
        setStatsData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
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
      <div className="space-y-6 pb-12 w-full">
        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

        {/* 1. HEADER DASHBOARD GREETING */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Ringkasan hasil pengolahan (Susu Olahan Rasa, Yogurt, Keju) & persediaan stok • {todayFormatted}</span>
            </p>
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
              href="/uht/pengemasan"
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
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${chartFilter === '7' ? 'bg-[#1E3F20] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  7 Hari
                </button>
                <button
                  onClick={() => setChartFilter('30')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${chartFilter === '30' ? 'bg-[#1E3F20] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
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
                        className={`w-full rounded-t-xl transition-all duration-300 group-hover:scale-105 shadow-sm ${val > 0 ? 'bg-gradient-to-t from-[#1E3F20] via-emerald-600 to-emerald-400' : 'bg-slate-100'
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
              href="/uht/stok-bahan"
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
                  return (
                    <tr key={mat.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {mat.name}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-black text-slate-900 text-sm">
                        {Number(mat.currentStock).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-500 font-semibold">
                        {mat.unit || 'pcs'}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-xs">
                        {mat.status === 'Aman' && (
                          <span className="text-emerald-600 font-bold">
                            Aman
                          </span>
                        )}
                        {mat.status === 'Menipis' && (
                          <span className="text-amber-600 font-bold">
                            Menipis
                          </span>
                        )}
                        {mat.status === 'Kritis' && (
                          <span className="text-rose-600 font-bold">
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
  const todaySapiGross = farmStats.todaySapiGross ?? farmStats.todaySapiLiters ?? 0;
  const todayKambingGross = farmStats.todayKambingGross ?? farmStats.todayKambingLiters ?? 0;
  const todayTotalGross = farmStats.todayGrossLiters ?? farmStats.todayTotalLiters ?? (todaySapiGross + todayKambingGross);
  const todaySapiRaw = farmStats.todaySapiRaw || 0;
  const todayKambingRaw = farmStats.todayKambingRaw || 0;

  const sapiPercentage = todayTotalGross > 0 ? Math.round((todaySapiGross / todayTotalGross) * 100) : 0;
  const kambingPercentage = todayTotalGross > 0 ? Math.round((todayKambingGross / todayTotalGross) * 100) : 0;
  const sapiRawPercentage = todaySapiGross > 0 ? Math.round((todaySapiRaw / todaySapiGross) * 100) : 0;
  const kambingRawPercentage = todayKambingGross > 0 ? Math.round((todayKambingRaw / todayKambingGross) * 100) : 0;

  const tegalsariVol = farmStats.farmOriginToday?.tegalsari || 0;
  const limpakuwusVol = farmStats.farmOriginToday?.limpakuwus || 0;
  const manggalaVol = farmStats.farmOriginToday?.manggala || 0;
  const eduwisataVol = farmStats.farmOriginToday?.eduwisata || 0;

  const farmRefTotal = (tegalsariVol + limpakuwusVol + manggalaVol + eduwisataVol) || todayTotalGross || 0;

  const tegalsariPct = farmRefTotal > 0 && tegalsariVol > 0 ? ((tegalsariVol / farmRefTotal) * 100).toFixed(1).replace('.', ',') : '0';
  const limpakuwusPct = farmRefTotal > 0 && limpakuwusVol > 0 ? ((limpakuwusVol / farmRefTotal) * 100).toFixed(1).replace('.', ',') : '0';
  const manggalaPct = farmRefTotal > 0 && manggalaVol > 0 ? ((manggalaVol / farmRefTotal) * 100).toFixed(1).replace('.', ',') : '0';
  const eduwisataPct = farmRefTotal > 0 && eduwisataVol > 0 ? ((eduwisataVol / farmRefTotal) * 100).toFixed(1).replace('.', ',') : '0';

  const rawChartData = chartFilter === '30' ? (farmStats.chart30Days || []) : (farmStats.chart7Days || []);

  const chartData = getFarmChartData(rawChartData, chartFilter, todayTotalGross, todaySapiGross, todayKambingGross);

  const maxChartVal = Math.max(...chartData.map(d => d.totalLiters || 0), 10);

  return (
    <div className="space-y-6 pb-12 bg-[#F6F8FA] -m-6 p-6 flex-1 min-h-0 overflow-y-auto">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* 5. WELCOME & PERIODE HEADER */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">
            Hi, {user?.name || 'Admin Farm'}!
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Ringkasan Statistik Perah & Penyerahan Susu • {todayFormatted} • Hari Ini
          </p>
        </div>
      </div>

      {/* 1. TOP HORIZONTAL WIDGET CARDS ROW (DATA HARI INI - TANPA ICON) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Card 1: Produksi Susu Hari Ini */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between h-36 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1E3F20] to-emerald-500"></div>
          <div>
            <span className="text-xs md:text-sm font-black text-[#1E3F20] uppercase tracking-wider block">Produksi Susu Hari Ini</span>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-black text-[#1E3F20]">
              {todayTotalGross.toLocaleString('id-ID')} <span className="text-xs md:text-sm font-bold text-[#1E3F20]/80">Liter</span>
            </p>
            <span className="text-[11px] text-[#1E3F20]/90 font-extrabold block mt-1">100% dari total produksi</span>
          </div>
        </div>

        {/* Card 2: Susu Sapi Hari Ini */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500"></div>
          <div>
            <span className="text-xs md:text-sm font-black text-[#1E3F20] uppercase tracking-wider block">Susu Sapi Hari Ini</span>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-black text-[#1E3F20]">
              {todaySapiGross.toLocaleString('id-ID')} <span className="text-xs md:text-sm font-bold text-[#1E3F20]/80">Liter</span>
            </p>
            <span className="text-[11px] text-[#1E3F20]/90 font-extrabold block mt-1">{sapiPercentage}% dari total produksi</span>
          </div>
        </div>

        {/* Card 3: Susu Kambing Hari Ini */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500"></div>
          <div>
            <span className="text-xs md:text-sm font-black text-[#1E3F20] uppercase tracking-wider block">Susu Kambing Hari Ini</span>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-black text-[#1E3F20]">
              {todayKambingGross.toLocaleString('id-ID')} <span className="text-xs md:text-sm font-bold text-[#1E3F20]/80">Liter</span>
            </p>
            <span className="text-[11px] text-[#1E3F20]/90 font-extrabold block mt-1">{kambingPercentage}% dari total produksi</span>
          </div>
        </div>

        {/* Card 4: Serah Terima Sapi Hari Ini */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600"></div>
          <div>
            <span className="text-xs md:text-sm font-black text-[#1E3F20] uppercase tracking-wider block">Serah Terima Sapi Hari Ini</span>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-black text-[#1E3F20]">
              {todaySapiRaw.toLocaleString('id-ID')} <span className="text-xs md:text-sm font-bold text-[#1E3F20]/80">Liter</span>
            </p>
            <span className="text-[11px] text-[#1E3F20]/90 font-extrabold block mt-1">{sapiRawPercentage}% dari produksi sapi</span>
          </div>
        </div>

        {/* Card 5: Serah Terima Kambing Hari Ini */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-purple-600"></div>
          <div>
            <span className="text-xs md:text-sm font-black text-[#1E3F20] uppercase tracking-wider block">Serah Terima Kambing Hari Ini</span>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-black text-[#1E3F20]">
              {todayKambingRaw.toLocaleString('id-ID')} <span className="text-xs md:text-sm font-bold text-[#1E3F20]/80">Liter</span>
            </p>
            <span className="text-[11px] text-[#1E3F20]/90 font-extrabold block mt-1">{kambingRawPercentage}% dari produksi kambing</span>
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
                  Grafik Trend Hasil Perah
                </h2>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  {chartFilter === '30' ? 'Rekapitulasi volume perah harian 1 bulan penuh sesuai tanggal kalender' : 'Rekapitulasi volume perah 7 hari terakhir'}
                </p>
              </div>

              {/* FILTER PILLS */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setChartFilter('7')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${chartFilter === '7'
                    ? 'bg-[#1E3F20] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  7 Hari
                </button>
                <button
                  type="button"
                  onClick={() => setChartFilter('30')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${chartFilter === '30'
                    ? 'bg-[#1E3F20] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  1 Bulan
                </button>
              </div>
            </div>

            {/* CHART DISPLAY */}
            <div className="space-y-4 pt-2">
              <div className={`h-60 flex items-end justify-between px-2 w-full border-b border-slate-100 pb-3 ${
                chartFilter === '30' ? 'gap-0.5 sm:gap-1' : 'gap-3 sm:gap-6'
              }`}>
                {chartData.map((d, index) => {
                  const heightPercent = maxChartVal > 0 ? Math.round((d.totalLiters / maxChartVal) * 85) : 0;
                  const isHovered = activeFarmChartIdx === index;
                  const isToday = d.isToday;

                  return (
                    <div 
                      key={index} 
                      className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
                      onMouseEnter={() => setActiveFarmChartIdx(index)}
                      onMouseLeave={() => setActiveFarmChartIdx(null)}
                      onClick={() => setActiveFarmChartIdx(activeFarmChartIdx === index ? null : index)}
                    >
                      {/* Rich Tooltip on Hover / Tap */}
                      <div className={`transition-all duration-200 absolute bottom-[105%] left-1/2 -translate-x-1/2 mb-3 bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl z-30 pointer-events-none whitespace-nowrap border border-slate-700/60 ${
                        isHovered ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:visible'
                      }`}>
                        <div className="text-[11px] font-bold text-slate-300 pb-1.5 border-b border-slate-700/60 mb-2 flex items-center justify-between gap-3">
                          <span>{d.dayName ? `${d.dayName}, ` : ''}{d.formattedDate || d.dateStr}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-black ${
                            isToday ? 'bg-emerald-500/30 text-emerald-300' : 'bg-slate-700/50 text-slate-300'
                          }`}>
                            {isToday ? 'Hari Ini' : (d.isFuture ? 'Akan Datang' : 'Tercatat')}
                          </span>
                        </div>
                        <div className="text-sm font-black text-emerald-400 font-mono">
                          {Number(d.totalLiters || 0).toLocaleString('id-ID')} <span className="text-xs font-semibold text-slate-300 font-sans">Liter</span>
                        </div>
                        <div className="pt-1.5 mt-1.5 border-t border-slate-800 flex items-center gap-3 text-[10px] font-bold text-slate-300">
                          <span>Sapi: {Number(d.sapiLiters || 0).toLocaleString('id-ID')} L</span>
                          <span className="text-slate-600">•</span>
                          <span>Kambing: {Number(d.kambingLiters || 0).toLocaleString('id-ID')} L</span>
                        </div>
                      </div>

                      {/* Bar with constrained width and rounded top (direct flex child of h-full container) */}
                      <div
                        style={{ height: d.totalLiters > 0 ? `${Math.max(heightPercent, 12)}%` : '6px' }}
                        className={`w-full rounded-t-xl transition-all duration-300 group-hover:scale-105 shadow-sm ${
                          chartFilter === '30' ? 'max-w-[12px] sm:max-w-[16px]' : 'max-w-[36px] sm:max-w-[48px]'
                        } ${
                          d.totalLiters > 0
                            ? (isToday
                                ? 'bg-gradient-to-t from-[#1E3F20] via-emerald-600 to-emerald-400 ring-2 ring-emerald-400/50 ring-offset-1'
                                : 'bg-gradient-to-t from-[#1E3F20]/90 via-emerald-600/90 to-emerald-400/90')
                            : 'bg-slate-200/80 hover:bg-slate-300'
                        }`}
                      ></div>

                      {/* X-axis Label (Tanggal 1 s/d 30) */}
                      <span className={`font-bold text-center mt-2 transition-colors ${
                        isToday ? 'text-emerald-700 font-black' : 'text-slate-500 group-hover:text-slate-900'
                      } ${
                        chartFilter === '30' ? 'text-[8px] sm:text-[9px]' : 'text-[11px]'
                      }`}>
                        {chartFilter === '30' ? d.dayNum : d.dayName?.slice(0, 3)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-semibold text-slate-500 pt-1 gap-2">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1E3F20]"></span>
                    <span>Total Volume (Liter)</span>
                  </span>
                  <span className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>Sapi</span>
                    <span className="text-slate-300">•</span>
                    <span>Kambing</span>
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">Sentuh / hover pada batang untuk melihat rincian</span>
              </div>
            </div>
          </div>

          {/* 3. WIDGET 2: PEROLEHAN SUSU PER FARM HARI INI (TANPA ICON) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Perolehan Susu per Farm Hari Ini
                </h2>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Tegalsari, Limpakuwus, Manggala, Eduwisata</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Farm Tegalsari */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between hover:shadow-md transition-all relative overflow-hidden group">
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-emerald-600"></div>
                <div className="space-y-1 pl-1">
                  <span className="text-xs font-black text-[#1E3F20] uppercase tracking-wider block">Farm Tegalsari</span>
                  <p className="text-2xl font-black text-slate-900">
                    {tegalsariVol.toLocaleString('id-ID')} <span className="text-xs font-bold text-slate-500">Liter</span>
                  </p>
                  <span className="text-[11px] text-emerald-800 font-extrabold block">
                    {tegalsariPct}% dari produksi hari ini
                  </span>
                </div>
              </div>

              {/* Farm Limpakuwus */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between hover:shadow-md transition-all relative overflow-hidden group">
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-blue-600"></div>
                <div className="space-y-1 pl-1">
                  <span className="text-xs font-black text-[#1E3F20] uppercase tracking-wider block">Farm Limpakuwus</span>
                  <p className="text-2xl font-black text-slate-900">
                    {limpakuwusVol.toLocaleString('id-ID')} <span className="text-xs font-bold text-slate-500">Liter</span>
                  </p>
                  <span className="text-[11px] text-blue-800 font-extrabold block">
                    {limpakuwusPct}% dari produksi hari ini
                  </span>
                </div>
              </div>

              {/* Farm Manggala */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between hover:shadow-md transition-all relative overflow-hidden group">
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-teal-600"></div>
                <div className="space-y-1 pl-1">
                  <span className="text-xs font-black text-[#1E3F20] uppercase tracking-wider block">Farm Manggala</span>
                  <p className="text-2xl font-black text-slate-900">
                    {manggalaVol.toLocaleString('id-ID')} <span className="text-xs font-bold text-slate-500">Liter</span>
                  </p>
                  <span className="text-[11px] text-teal-800 font-extrabold block">
                    {manggalaPct}% dari produksi hari ini
                  </span>
                </div>
              </div>

              {/* Eduwisata */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between hover:shadow-md transition-all relative overflow-hidden group">
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-purple-600"></div>
                <div className="space-y-1 pl-1">
                  <span className="text-xs font-black text-[#1E3F20] uppercase tracking-wider block">Eduwisata</span>
                  <p className="text-2xl font-black text-slate-900">
                    {eduwisataVol.toLocaleString('id-ID')} <span className="text-xs font-bold text-slate-500">Liter</span>
                  </p>
                  <span className="text-[11px] text-purple-800 font-extrabold block">
                    {eduwisataPct}% dari produksi hari ini
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. RIGHT SIDEBAR COLUMN: CATATAN AKTIVITAS TERAKHIR (TANPA ICON) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Catatan Aktivitas Terakhir
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">
                    Aktivitas operasional real-time terbaru
                  </p>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>

              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {farmStats.recentLogs && farmStats.recentLogs.length > 0 ? (
                  farmStats.recentLogs.map((log) => {
                    const dt = new Date(log.createdAt || log.date || Date.now());
                    const logTime = dt.toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    }).replace('.', ':') + ' WIB';
                    return (
                      <div key={log.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 hover:bg-slate-100/80 transition-colors">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-extrabold text-slate-900 text-xs">{log.title || 'Aktivitas Farm'}</span>
                          <span className="font-mono text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            {logTime}
                          </span>
                        </div>
                        <p className="text-slate-600 text-xs font-medium leading-relaxed">
                          {log.details || 'Pencatatan aktivitas berhasil.'}
                        </p>
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
