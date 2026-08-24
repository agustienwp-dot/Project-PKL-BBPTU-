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
  const todayGross = farmStats.todayGrossLiters || farmStats.todayTotalLiters || 0;
  const todayPedet = farmStats.todayPedetLiters || 0;
  const todayAfkir = farmStats.todayAfkirLiters || 0;
  const todayPotongan = todayPedet + todayAfkir;
  const todayNet = farmStats.todayTotalLiters || Math.max(0, todayGross - todayPotongan);
  const todayPackagedQty = farmStats.todayPackagedQty || 0;

  const netPercentage = todayGross > 0 ? Math.round((todayNet / todayGross) * 100) : (todayNet > 0 ? 100 : 0);
  const potongPercentage = todayGross > 0 ? Math.round((todayPotongan / todayGross) * 100) : 0;

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
          Ringkasan statistik perah & pengemasan Susu Sapi • {todayFormatted}
        </p>
      </div>

      {/* 1. BAGIAN PALING ATAS - 4 STATISTIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Produksi Hari Ini (Gross) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Produksi Hari Ini (Gross)</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Milk className="w-5 h-5 text-emerald-700" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900">
              {todayGross.toLocaleString()} <span className="text-sm font-bold text-slate-500">Liter</span>
            </p>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">Total hasil perah sapi dari kandang</p>
          </div>
        </div>

        {/* Card 2: Susu Siap Olah (Net) */}
        <div className="bg-white p-6 rounded-3xl border border-emerald-200 bg-emerald-50/20 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Susu Siap Olah</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">🐄 SUSU SAPI</span>
          </div>
          <div>
            <p className="text-3xl font-black text-emerald-700">
              {todayNet.toLocaleString()} <span className="text-sm font-bold text-slate-500">Liter</span>
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">{netPercentage}% siap diproses/dikemas</p>
          </div>
        </div>

        {/* Card 3: Potongan (Pedet & Afkir) */}
        <div className="bg-white p-6 rounded-3xl border border-amber-200 bg-amber-50/20 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Potongan Susu</span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">PEDET & AFKIR</span>
          </div>
          <div>
            <p className="text-3xl font-black text-amber-700">
              {todayPotongan.toLocaleString()} <span className="text-sm font-bold text-slate-500">Liter</span>
            </p>
            <p className="text-[11px] text-slate-600 font-bold mt-1">
              Pedet: {todayPedet} L | Afkir: {todayAfkir} L
            </p>
          </div>
        </div>

        {/* Card 4: TOTAL PRODUK DIKEMAS */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 bg-slate-50/50 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">TOTAL PRODUK DIKEMAS</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Package className="w-5 h-5 text-amber-700" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900">
              {todayPackagedQty.toLocaleString()} <span className="text-sm font-bold text-slate-500">pcs</span>
            </p>
            <p className="text-[11px] text-slate-500 font-bold mt-1">
              Botol: {farmStats.todayBotolQty || 0} | Cup: {farmStats.todayCupQty || 0} | Pack: {farmStats.todayPlastikBantalQty || 0}
            </p>
          </div>
        </div>
      </div>

      {/* 2. RINGKASAN PRODUKSI HARI INI & 3. HASIL PENGEMASAN HARI INI (SIDE BY SIDE) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* 2. SECTION: PRODUKSI SUSU SAPI HARI INI */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Milk className="w-5 h-5 text-emerald-600" />
                <span>Rincian Produksi Susu Sapi</span>
              </h2>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">{todayFormatted}</p>
            </div>
            <Link href="/produksi" className="text-xs font-bold text-[#1E3F20] hover:underline flex items-center gap-1">
              <span>Input / Kelola</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <span className="text-xl">🐄</span>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase">Produksi Gross Perah</h4>
                  <p className="text-[11px] text-slate-500">Total volume susu sapi diperah hari ini</p>
                </div>
              </div>
              <span className="text-lg font-black text-slate-800">{todayGross} Liter</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100">
              <div className="flex items-center gap-3">
                <span className="text-xl">🍼</span>
                <div>
                  <h4 className="font-bold text-amber-950 text-xs uppercase">Susu Pakan Pedet</h4>
                  <p className="text-[11px] text-amber-800">Alokasi pakan untuk anak sapi</p>
                </div>
              </div>
              <span className="text-lg font-black text-amber-800">-{todayPedet} Liter</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100">
              <div className="flex items-center gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <h4 className="font-bold text-rose-950 text-xs uppercase">Susu Afkir / Rusak</h4>
                  <p className="text-[11px] text-rose-800">Susu rusak/tidak layak olah</p>
                </div>
              </div>
              <span className="text-lg font-black text-rose-700">-{todayAfkir} Liter</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 text-white shadow-sm">
              <div>
                <span className="font-extrabold text-sm block">Susu Sapi Siap Olah (Net)</span>
                <span className="text-[10px] text-emerald-300 font-semibold">Siap dikirim ke Pemasaran & Pengolahan</span>
              </div>
              <span className="text-2xl font-black text-emerald-400">{todayNet} Liter</span>
            </div>
          </div>

          {/* VISUAL RATIO PROGRESS BAR */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-bold text-slate-600">
              <span>Efisiensi Susu Siap Olah</span>
              <span>{netPercentage}% Siap Olah • {potongPercentage}% Potongan</span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div className="bg-emerald-600 h-full transition-all duration-500" style={{ width: `${netPercentage}%` }}></div>
              <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${potongPercentage}%` }}></div>
            </div>
          </div>
        </div>

        {/* 3. SECTION: HASIL PENGEMASAN HARI INI */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-600" />
                <span>Hasil Pengemasan Susu Hari Ini</span>
              </h2>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">Produk jadi siap didistribusikan ke pemasaran</p>
            </div>

            <Link href="/pengemasan" className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1">
              <span>Kelola Pengemasan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            <div className="space-y-2.5">
              {/* Botol */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase">Kemasan Botol</h4>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    Ukuran 130 ml, 200 ml, 250 ml
                  </p>
                </div>
                <span className="text-xl font-black text-amber-700">{farmStats.todayBotolQty || 0} pcs</span>
              </div>

              {/* Cup */}
              <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase">Kemasan Cup</h4>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    Ukuran 100 ml, 115 ml
                  </p>
                </div>
                <span className="text-xl font-black text-blue-700">{farmStats.todayCupQty || 0} pcs</span>
              </div>

              {/* Plastik Bantal */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase">Plastik Bantal / Pouch</h4>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    Ukuran 200 ml, 250 ml, 500 ml
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
                <span>Bahan Diproses: {farmStats.todayProcessedLiters || 0} Liter</span>
                <span>Total Siap Jual: {todayPackagedQty} pcs</span>
              </div>
            </div>
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
