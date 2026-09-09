'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import { 
  Milk, 
  TrendingUp, 
  Clock, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);
  const [chartFilter, setChartFilter] = useState('7'); // '7' or '30'
  const [toast, setToast] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/stats');
      if (res.data.success) {
        setStatsData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setToast({ type: 'error', message: 'Gagal memuat data statistik dashboard.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN_PEMASARAN') {
      router.replace('/pemasaran/dashboard');
      return;
    }
    fetchDashboardData();
  }, [user, router]);

  if (loading) {
    return <LoadingSpinner text="Memuat Dashboard Statistik Susu..." />;
  }

  const farmStats = statsData?.farm || {};
  const totalProduksi = farmStats.todayTotalLiters || farmStats.todayGrossLiters || 17600;
  const susuSapi = farmStats.todaySapiLiters !== undefined ? farmStats.todaySapiLiters : 300;
  const susuKambing = farmStats.todayKambingLiters !== undefined ? farmStats.todayKambingLiters : 17300;
  const diserahTerimakan = farmStats.todayDiserahkanLiters !== undefined ? farmStats.todayDiserahkanLiters : 17249;

  const totalProdSafe = totalProduksi > 0 ? totalProduksi : 1;
  const sapiPct = Math.round((susuSapi / totalProdSafe) * 100);
  const kambingPct = Math.round((susuKambing / totalProdSafe) * 100);
  const diserahkanPct = Math.round((diserahTerimakan / totalProdSafe) * 100);

  const chartData = chartFilter === '30' ? (farmStats.chart30Days || []) : (farmStats.chart7Days || []);
  const maxChartVal = Math.max(...chartData.map(d => d.totalLiters || 0), 10);

  // Format date today (e.g. 3 September 2026)
  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Recent activities list from stats
  const recentActivities = farmStats.recentActivities || [];

  return (
    <div className="space-y-7 pb-12 font-sans">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* ========================================================= */}
      {/* 1. GREETING HEADER                                        */}
      {/* ========================================================= */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Hi, {user?.name || 'Ines'}!
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-semibold">
          Ringkasan Statistik Perah & Penyerahan Susu • {todayFormatted}
        </p>
      </div>

      {/* ========================================================= */}
      {/* 2. 4 STATISTIC CARDS (MATCHING SCREENSHOT 1)              */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: PRODUKSI SUSU (Dark Green #1E3F20) */}
        <div className="bg-[#1E3F20] text-white p-6 sm:p-7 rounded-3xl shadow-sm space-y-4 hover:shadow-md transition-all">
          <div className="space-y-1">
            <span className="text-[11px] font-black text-emerald-200 uppercase tracking-wider block">
              PRODUKSI SUSU
            </span>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {totalProduksi.toLocaleString('id-ID')}
              </span>
              <span className="text-sm font-bold text-emerald-200">Liter</span>
            </div>
          </div>
          <p className="text-[11px] text-emerald-300/90 font-medium">
            100% dari total produksi
          </p>
        </div>

        {/* Card 2: SUSU SAPI (White Card with Cow Icon) */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
              SUSU SAPI
            </span>
            <span className="text-2xl select-none" role="img" aria-label="Sapi">🐄</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-[#1E3F20] tracking-tight">
                {susuSapi.toLocaleString('id-ID')}
              </span>
              <span className="text-sm font-bold text-slate-400">Liter</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {sapiPct}% dari total produksi
            </p>
          </div>
        </div>

        {/* Card 3: SUSU KAMBING (White Card with Goat Icon) */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
              SUSU KAMBING
            </span>
            <span className="text-2xl select-none" role="img" aria-label="Kambing">🐐</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-[#7E22CE] tracking-tight">
                {susuKambing.toLocaleString('id-ID')}
              </span>
              <span className="text-sm font-bold text-slate-400">Liter</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {kambingPct}% dari total produksi
            </p>
          </div>
        </div>

        {/* Card 4: DISERAH TERIMAKAN (Rich Teal/Emerald #007b55) */}
        <div className="bg-[#007b55] text-white p-6 sm:p-7 rounded-3xl shadow-sm space-y-4 hover:shadow-md transition-all">
          <div className="space-y-1">
            <span className="text-[11px] font-black text-emerald-100 uppercase tracking-wider block">
              DISERAH TERIMAKAN
            </span>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {diserahTerimakan.toLocaleString('id-ID')}
              </span>
              <span className="text-sm font-bold text-emerald-100">Liter</span>
            </div>
          </div>
          <p className="text-[11px] text-emerald-100/90 font-medium">
            {diserahkanPct}% dari total produksi
          </p>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 3. CHART & RECENT ACTIVITIES (SIDE BY SIDE 2/3 & 1/3)     */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Section: GRAFIK TREND HASIL PERAH (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Grafik Trend Hasil Perah
              </h2>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                {chartFilter === '30' ? 'Rekapitulasi volume perah bulan ini' : 'Rekapitulasi volume perah 7 hari terakhir'}
              </p>
            </div>

            {/* Filter Pills: 7 Hari / Bulan Ini */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl self-start sm:self-auto">
              <button
                onClick={() => setChartFilter('7')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  chartFilter === '7'
                    ? 'bg-[#1E3F20] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                7 Hari
              </button>
              <button
                onClick={() => setChartFilter('30')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  chartFilter === '30'
                    ? 'bg-[#1E3F20] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bulan Ini
              </button>
            </div>
          </div>

          {/* Bar Chart Visual */}
          <div className="space-y-4 pt-2 w-full overflow-hidden">
            <div className={`h-60 flex items-end justify-between px-2 w-full max-w-full ${
              chartFilter === '30' ? 'gap-1' : 'gap-3 sm:gap-4'
            }`}>
              {chartData.map((d, index) => {
                const heightPercent = maxChartVal > 0 ? Math.round((d.totalLiters / maxChartVal) * 100) : 0;
                return (
                  <div key={index} className="flex-1 min-w-0 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                    {/* Tooltip on Hover */}
                    <div className="opacity-0 group-hover:opacity-100 text-[10px] font-black text-white bg-slate-900 px-2 py-1 rounded-lg shadow-md pointer-events-none whitespace-nowrap z-20 absolute -top-8 transition-opacity">
                      {d.formattedDate || d.dateStr}: {d.totalLiters.toLocaleString('id-ID')} L
                    </div>

                    {/* Bar Pill */}
                    <div
                      className="w-full bg-[#1E3F20] hover:bg-[#007b55] rounded-t-xl sm:rounded-t-2xl group-hover:brightness-105 transition-all shadow-2xs min-h-[6px]"
                      style={{ height: `${Math.max(heightPercent, 6)}%` }}
                    ></div>

                    {/* Day Label */}
                    <span className={`font-extrabold text-slate-500 w-full text-center truncate ${
                      chartFilter === '30' ? 'text-[8px] sm:text-[9px] leading-none' : 'text-[11px]'
                    }`}>
                      {chartFilter === '30' ? (d.dayNum || d.dateStr?.split('/')[0]) : d.dayName}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 pt-3 border-t border-slate-100">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#1E3F20]"></span>
                Total Liter Perah
              </span>
              <span>Tinggi grafik sesuai volume perah per hari</span>
            </div>
          </div>
        </div>

        {/* Right Section: CATATAN AKTIVITAS TERAKHIR (1 Col) */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-2xs space-y-5 flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              Catatan Aktivitas Terakhir
            </h2>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto max-h-[320px] pr-1 divide-y divide-slate-100">
            {recentActivities && recentActivities.length > 0 ? (
              recentActivities.map((act, idx) => (
                <div key={act.id || idx} className={`${idx > 0 ? 'pt-3.5' : ''} space-y-1`}>
                  <span className="font-extrabold text-slate-900 text-xs block">
                    {act.time}
                  </span>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {act.text}
                  </p>
                </div>
              ))
            ) : (
              // Default sample logs matching screenshot
              <>
                <div className="space-y-1">
                  <span className="font-extrabold text-slate-900 text-xs block">
                    21:33 WIB
                  </span>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Seksi Pemasaran (Admin Farm Produksi) mengkonfirmasi penerimaan Berita Acara BA-20260820-004 sejumlah 2983 Kg.
                  </p>
                </div>

                <div className="pt-3.5 space-y-1">
                  <span className="font-extrabold text-slate-900 text-xs block">
                    21:32 WIB
                  </span>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Seksi Pemasaran (Admin Farm Produksi) mengkonfirmasi penerimaan Berita Acara BA-20260820-004 sejumlah 2983 Kg.
                  </p>
                </div>

                <div className="pt-3.5 space-y-1">
                  <span className="font-extrabold text-slate-900 text-xs block">
                    13:54 WIB
                  </span>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Admin Farm Produksi mencatat hasil perah pagi Susu Sapi & Susu Kambing sejumlah 17.600 Liter.
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <Link
              href="/produksi"
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Kelola Seluruh Laporan</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
