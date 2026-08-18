'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
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
  Filter
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);
  const [chartFilter, setChartFilter] = useState('7'); // '7' or '30'
  const [packagingTab, setPackagingTab] = useState('ALL'); // 'ALL' | 'SAPI' | 'KAMBING'
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
    fetchDashboardData();
  }, [user]);

  if (loading) {
    return <LoadingSpinner text="Memuat Dashboard Admin Farm Produksi..." />;
  }

  const farmStats = statsData?.farm || {};
  const todaySapi = farmStats.todaySapiLiters || 0;
  const todayKambing = farmStats.todayKambingLiters || 0;
  const todayTotalLiters = farmStats.todayTotalLiters || (todaySapi + todayKambing);
  const todayPackagedQty = farmStats.todayPackagedQty || 0;
  const sapiPackagedQty = farmStats.sapiPackagedQty || 0;
  const kambingPackagedQty = farmStats.kambingPackagedQty || 0;

  const sapiPercentage = todayTotalLiters > 0 ? Math.round((todaySapi / todayTotalLiters) * 100) : 0;
  const kambingPercentage = todayTotalLiters > 0 ? Math.round((todayKambing / todayTotalLiters) * 100) : 0;

  const chartData = chartFilter === '30' ? (farmStats.chart30Days || []) : (farmStats.chart7Days || []);
  const maxChartVal = Math.max(...chartData.map(d => d.totalLiters || 0), 10);

  // Format date today (e.g. 13 Agustus 2026)
  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-8 pb-12">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* HEADER GREETING */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">
          Hallo, {user?.name || 'Admin'}!
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          Ringkasan statistik perah & pengemasan susu • {todayFormatted}
        </p>
      </div>

      {/* 1. BAGIAN PALING ATAS - 4 STATISTIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Produksi Hari Ini */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Produksi Hari Ini</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Milk className="w-5 h-5 text-emerald-700" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900">
              {todayTotalLiters.toLocaleString()} <span className="text-sm font-bold text-slate-500">Liter</span>
            </p>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">Total hasil perah hari ini</p>
          </div>
        </div>

        {/* Card 2: Susu Sapi */}
        <div className="bg-white p-6 rounded-3xl border border-emerald-200 bg-emerald-50/20 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Susu Sapi</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">🐄 SAPI</span>
          </div>
          <div>
            <p className="text-3xl font-black text-emerald-700">
              {todaySapi.toLocaleString()} <span className="text-sm font-bold text-slate-500">Liter</span>
            </p>
            <p className="text-[11px] text-slate-500 font-semibold mt-1">{sapiPercentage}% dari produksi hari ini</p>
          </div>
        </div>

        {/* Card 3: Susu Kambing */}
        <div className="bg-white p-6 rounded-3xl border border-purple-200 bg-purple-50/20 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">Susu Kambing</span>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black">🐐 KAMBING</span>
          </div>
          <div>
            <p className="text-3xl font-black text-purple-700">
              {todayKambing.toLocaleString()} <span className="text-sm font-bold text-slate-500">Liter</span>
            </p>
            <p className="text-[11px] text-slate-500 font-semibold mt-1">{kambingPercentage}% dari produksi hari ini</p>
          </div>
        </div>

        {/* Card 4: TOTAL PRODUK DIKEMAS */}
        <div className="bg-white p-6 rounded-3xl border border-amber-200 bg-amber-50/20 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">TOTAL PRODUK DIKEMAS</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Package className="w-5 h-5 text-amber-700" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-amber-600">
              {todayPackagedQty.toLocaleString()} <span className="text-sm font-bold text-slate-500">pcs</span>
            </p>
            <p className="text-[11px] text-slate-600 font-bold mt-1">
              Sapi: {sapiPackagedQty} pcs | Kambing: {kambingPackagedQty} pcs
            </p>
          </div>
        </div>
      </div>

      {/* 2. RINGKASAN PRODUKSI HARI INI & 3. HASIL PENGEMASAN HARI INI (SIDE BY SIDE) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* 2. SECTION: PRODUKSI HARI INI */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Milk className="w-5 h-5 text-emerald-600" />
                <span>Produksi Hari Ini</span>
              </h2>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">{todayFormatted}</p>
            </div>
            <Link href="/produksi" className="text-xs font-bold text-[#1E3F20] hover:underline flex items-center gap-1">
              <span>Lihat Detail</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <div className="flex items-center gap-3">
                <span className="text-xl">🐄</span>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Susu Sapi</h4>
                  <p className="text-[11px] text-slate-500">Hasil perah sapi segar</p>
                </div>
              </div>
              <span className="text-xl font-black text-emerald-700">{todaySapi} Liter</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-50/60 border border-purple-100">
              <div className="flex items-center gap-3">
                <span className="text-xl">🐐</span>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Susu Kambing</h4>
                  <p className="text-[11px] text-slate-500">Hasil perah kambing segar</p>
                </div>
              </div>
              <span className="text-xl font-black text-purple-700">{todayKambing} Liter</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 text-white shadow-sm">
              <span className="font-extrabold text-sm">Total Produksi Hari Ini</span>
              <span className="text-2xl font-black text-emerald-400">{todayTotalLiters} Liter</span>
            </div>
          </div>

          {/* VISUAL RATIO PROGRESS BAR */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-bold text-slate-600">
              <span>Rasio Sapi vs Kambing</span>
              <span>{sapiPercentage}% Sapi / {kambingPercentage}% Kambing</span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div className="bg-emerald-600 h-full transition-all duration-500" style={{ width: `${sapiPercentage}%` }}></div>
              <div className="bg-purple-600 h-full transition-all duration-500" style={{ width: `${kambingPercentage}%` }}></div>
            </div>
          </div>
        </div>

        {/* 3. SECTION: HASIL PENGEMASAN HARI INI WITH TAB [ SEMUA ] [ 🐄 SAPI ] [ 🐐 KAMBING ] */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-600" />
                <span>Hasil Pengemasan Hari Ini</span>
              </h2>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">Produk siap didistribusikan ke pemasaran</p>
            </div>

            {/* TAB SELECTOR: [ Semua ] [ 🐄 Sapi ] [ 🐐 Kambing ] */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl self-start sm:self-auto">
              <button
                onClick={() => setPackagingTab('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  packagingTab === 'ALL'
                    ? 'bg-[#1E3F20] text-white shadow'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setPackagingTab('SAPI')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  packagingTab === 'SAPI'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🐄 Sapi
              </button>
              <button
                onClick={() => setPackagingTab('KAMBING')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  packagingTab === 'KAMBING'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🐐 Kambing
              </button>
            </div>
          </div>

          {/* TAB CONTENT: SEMUA MODE */}
          {packagingTab === 'ALL' && (
            <div className="space-y-4">
              <div className="space-y-2.5">
                {/* Botol */}
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase">Botol</h4>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      Sapi: <span className="font-bold text-emerald-700">{farmStats.sapiBotolQty || 0} pcs</span> | Kambing: <span className="font-bold text-purple-700">{farmStats.kambingBotolQty || 0} pcs</span>
                    </p>
                  </div>
                  <span className="text-xl font-black text-amber-700">{farmStats.todayBotolQty || 0} pcs</span>
                </div>

                {/* Cup */}
                <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase">Cup</h4>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      Sapi: <span className="font-bold text-emerald-700">{farmStats.sapiCupQty || 0} pcs</span> | Kambing: <span className="font-bold text-purple-700">{farmStats.kambingCupQty || 0} pcs</span>
                    </p>
                  </div>
                  <span className="text-xl font-black text-blue-700">{farmStats.todayCupQty || 0} pcs</span>
                </div>

                {/* Plastik Bantal */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase">Plastik Bantal</h4>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      Sapi: <span className="font-bold text-emerald-700">{farmStats.sapiPlastikBantalQty || 0} pcs</span> | Kambing: <span className="font-bold text-purple-700">{farmStats.kambingPlastikBantalQty || 0} pcs</span>
                    </p>
                  </div>
                  <span className="text-xl font-black text-emerald-700">{farmStats.todayPlastikBantalQty || 0} pcs</span>
                </div>
              </div>

              {/* TOTAL KEMASAN CARD */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs">Total Produk Dikemas Hari Ini</span>
                  <span className="text-2xl font-black text-amber-400">{todayPackagedQty} pcs</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-300 border-t border-slate-800 pt-1.5 font-semibold">
                  <span>Sapi: {sapiPackagedQty} pcs</span>
                  <span>Kambing: {kambingPackagedQty} pcs</span>
                  <span>Total: {todayPackagedQty} pcs</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: SAPI MODE */}
          {packagingTab === 'SAPI' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 text-emerald-900 font-extrabold text-xs">
                <span>🐄 Pengemasan Susu Sapi</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100 text-center space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 block uppercase">Botol</span>
                  <p className="text-2xl font-black text-amber-700">{farmStats.sapiBotolQty || 0}</p>
                  <span className="text-[10px] text-slate-400 font-semibold block">pcs</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 text-center space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 block uppercase">Cup</span>
                  <p className="text-2xl font-black text-blue-700">{farmStats.sapiCupQty || 0}</p>
                  <span className="text-[10px] text-slate-400 font-semibold block">pcs</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-center space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 block uppercase">Plastik Bantal</span>
                  <p className="text-2xl font-black text-emerald-700">{farmStats.sapiPlastikBantalQty || 0}</p>
                  <span className="text-[10px] text-slate-400 font-semibold block">pcs</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-900 text-white flex items-center justify-between">
                <span className="font-extrabold text-xs">Total Pengemasan Sapi</span>
                <span className="text-2xl font-black text-emerald-300">{sapiPackagedQty} pcs</span>
              </div>
            </div>
          )}

          {/* TAB CONTENT: KAMBING MODE */}
          {packagingTab === 'KAMBING' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-purple-50 text-purple-900 font-extrabold text-xs">
                <span>🐐 Pengemasan Susu Kambing</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100 text-center space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 block uppercase">Botol</span>
                  <p className="text-2xl font-black text-amber-700">{farmStats.kambingBotolQty || 0}</p>
                  <span className="text-[10px] text-slate-400 font-semibold block">pcs</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 text-center space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 block uppercase">Cup</span>
                  <p className="text-2xl font-black text-blue-700">{farmStats.kambingCupQty || 0}</p>
                  <span className="text-[10px] text-slate-400 font-semibold block">pcs</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-center space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 block uppercase">Plastik Bantal</span>
                  <p className="text-2xl font-black text-emerald-700">{farmStats.kambingPlastikBantalQty || 0}</p>
                  <span className="text-[10px] text-slate-400 font-semibold block">pcs</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-purple-900 text-white flex items-center justify-between">
                <span className="font-extrabold text-xs">Total Pengemasan Kambing</span>
                <span className="text-2xl font-black text-purple-300">{kambingPackagedQty} pcs</span>
              </div>
            </div>
          )}

          <div className="pt-2">
            <Link href="/pengemasan" className="text-xs font-bold text-amber-600 hover:underline flex items-center justify-center gap-1">
              <span>Kelola Seluruh Pengemasan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. GRAFIK PRODUKSI & 5. AKTIVITAS TERAKHIR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 4. SECTION: GRAFIK PRODUKSI */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span>Produksi {chartFilter === '30' ? 'Bulan Ini' : '7 Hari Terakhir'}</span>
              </h2>
              <p className="text-xs text-slate-400 font-semibold">
                {chartFilter === '30' ? 'Grafik volume hasil perah susu per tanggal (Tgl 1 - akhir bulan)' : 'Grafik volume hasil perah susu 7 hari terakhir'}
              </p>
            </div>

            {/* FILTER SWITCH: 7 Hari / Bulan Ini */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
              <button
                onClick={() => setChartFilter('7')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  chartFilter === '7'
                    ? 'bg-[#1E3F20] text-white shadow'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                7 Hari
              </button>
              <button
                onClick={() => setChartFilter('30')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  chartFilter === '30'
                    ? 'bg-[#1E3F20] text-white shadow'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bulan Ini
              </button>
            </div>
          </div>

          {/* CLEAN SVG BAR CHART */}
          <div className="space-y-4 pt-2 w-full overflow-hidden">
            <div className={`h-56 flex items-end justify-between px-1 w-full max-w-full ${
              chartFilter === '30' ? 'gap-0.5 sm:gap-1' : 'gap-2 md:gap-3'
            }`}>
              {chartData.map((d, index) => {
                const heightPercent = maxChartVal > 0 ? Math.round((d.totalLiters / maxChartVal) * 100) : 0;
                return (
                  <div key={index} className="flex-1 min-w-0 flex flex-col items-center gap-1 h-full justify-end group relative">
                    <span className="opacity-0 group-hover:opacity-100 text-[9px] font-black text-emerald-900 transition-opacity bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded-md shadow pointer-events-none whitespace-nowrap z-20 absolute -top-7">
                      {d.formattedDate || d.dateStr}: {d.totalLiters} L
                    </span>
                    <div
                      className="w-full bg-gradient-to-t from-[#1E3F20] to-emerald-500 rounded-t-sm sm:rounded-t-md group-hover:brightness-110 transition-all shadow-sm min-h-[4px]"
                      style={{ height: `${Math.max(heightPercent, 4)}%` }}
                    ></div>
                    <span className={`font-extrabold text-slate-500 w-full text-center ${
                      chartFilter === '30' ? 'text-[8px] sm:text-[9px] leading-none' : 'text-[10px]'
                    }`}>
                      {chartFilter === '30' ? (d.dayNum || d.dateStr?.split('/')[0]) : d.dayName}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pt-3 border-t border-slate-100">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#1E3F20]"></span>
                Total Liter Perah
              </span>
              <span>Tinggi grafik sesuai dengan volume hasil perah</span>
            </div>
          </div>
        </div>

        {/* 5. SECTION: AKTIVITAS TERAKHIR */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span>Aktivitas Terakhir</span>
            </h2>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Realtime</span>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto max-h-[280px] pr-1">
            {farmStats.recentLogs && farmStats.recentLogs.length > 0 ? (
              farmStats.recentLogs.map((log) => {
                const logTime = new Date(log.createdAt).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit'
                });
                return (
                  <div key={log.id} className="flex gap-3 text-xs">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0">
                        <Clock className="w-3.5 h-3.5 text-emerald-700" />
                      </div>
                      <div className="w-0.5 flex-1 bg-slate-100 my-1"></div>
                    </div>
                    <div className="space-y-1 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">{logTime}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold">
                          {log.action}
                        </span>
                      </div>
                      <p className="text-slate-600 font-medium leading-relaxed">
                        {log.details || 'Aktivitas perah/pengemasan berhasil dicatat.'}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs font-semibold">
                Belum ada aktivitas terbaru hari ini.
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <Link
              href="/produksi"
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Kelola Seluruh Laporan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
