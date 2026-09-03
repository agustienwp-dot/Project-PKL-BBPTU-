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
  const [chartFilter, setChartFilter] = useState('7'); // '7' or '30'
  const [toast, setToast] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      if (res.data.success) {
        setStatsData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => fetchDashboardData(), 5000);
    const handleFocus = () => fetchDashboardData();
    window.addEventListener('focus', handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

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

        {/* NOTIFICATION & ACCOUNT BADGE */}
        <div className="flex items-center gap-2.5">
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
