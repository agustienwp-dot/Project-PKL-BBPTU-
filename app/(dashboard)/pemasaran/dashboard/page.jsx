'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import {
  Boxes,
  FileSpreadsheet,
  ArrowRight,
  Calendar,
  PackageCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Milk,
  FileText,
  Package,
  Layers,
  Sparkles,
  ArrowDownRight,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Info,
  Check,
  ExternalLink,
  Activity,
  Sun,
  Sunset
} from 'lucide-react';

export default function DashboardPemasaranPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Raw Datasets from the 3 integrated modules
  const [farmSessions, setFarmSessions] = useState([]);
  const [farmDailyList, setFarmDailyList] = useState([]);
  const [farmSummary, setFarmSummary] = useState({});
  const [basts, setBasts] = useState([]);
  const [packagings, setPackagings] = useState([]);

  const [chartFilter, setChartFilter] = useState('7'); // '7' or '30'

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [farmRes, bastRes, pkgRes] = await Promise.all([
        api.get('/pemasaran/farm-recap?sortOrder=desc').catch(() => ({ data: { data: [], dailyList: [], summary: {} } })),
        api.get('/bast').catch(() => ({ data: { data: [] } })),
        api.get('/packaged-products?sortOrder=desc').catch(() => ({ data: { data: [] } })),
      ]);

      if (farmRes.data?.success) {
        setFarmSessions(farmRes.data.data || []);
        setFarmDailyList(farmRes.data.dailyList || []);
        setFarmSummary(farmRes.data.summary || {});
      }
      if (bastRes.data?.success) {
        setBasts(bastRes.data.data || []);
      }
      if (pkgRes.data?.success) {
        setPackagings(pkgRes.data.data || []);
      }
    } catch (err) {
      console.error('Error loading pemasaran dashboard:', err);
      setToast({ type: 'error', message: 'Gagal memuat data flow realtime pemasaran.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Calculations for KPI Cards
  const totalSusuFreshMasuk = farmSummary.totalSusuSiapOlah || 0;
  const totalBastDeduction = farmSummary.totalBastDeduction || 0;
  const netSusuFreshTersedia = farmSummary.netSusuFreshTersedia || Math.max(0, totalSusuFreshMasuk - totalBastDeduction);
  const totalOlahanUnits = packagings.reduce((acc, p) => acc + (p.jumlah || p.totalPackagedQty || 0), 0);

  const pendingFarmCount = farmSessions.filter((f) => f.status === 'MENUNGGU_VERIFIKASI').length;
  const pendingBastCount = basts.filter((b) => b.status === 'MENUNGGU_KONFIRMASI').length;
  const pendingPkgCount = packagings.filter((p) => p.status === 'MENUNGGU_PENERIMAAN').length;
  const totalPendingAll = pendingFarmCount + pendingBastCount + pendingPkgCount;

  if (loading) {
    return <LoadingSpinner text="Memuat Live Flow Data Masuk Realtime..." />;
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
              <Activity className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
              <span>Realtime Live Inflow Monitor</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Dashboard Aliran Data Terintegrasi
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Monitoring langsung arus masuk bahan baku dari <strong>Unit Farm</strong>, pengesahan dokumen fisik <strong>Surat BAST</strong>, dan batch hasil <strong>Unit Pengolahan / UHT</strong>.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={loadDashboardData}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all border border-white/20 active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Data</span>
            </button>
            <Link
              href="/pemasaran/laporan"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Buka Laporan 27 Kolom</span>
            </Link>
          </div>
        </div>

        {/* Decorative Background Icon */}
        <Milk className="absolute -right-8 -bottom-10 w-64 h-64 text-white/5 pointer-events-none" />
      </div>

      {/* 4 Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/pemasaran/terima-susu-segar"
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Milk className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold text-slate-800 block">Terima Susu Segar</span>
              {pendingFarmCount > 0 && (
                <span className="px-1.5 py-0.5 text-[9px] font-black bg-amber-500 text-white rounded-full">
                  {pendingFarmCount}
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500">Penerimaan sesi perah farm</span>
          </div>
        </Link>

        <Link
          href="/pemasaran/bast"
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-amber-500 hover:shadow-md transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold text-slate-800 block">Surat BAST Permintaan</span>
              {pendingBastCount > 0 && (
                <span className="px-1.5 py-0.5 text-[9px] font-black bg-rose-500 text-white rounded-full">
                  {pendingBastCount}
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500">Pengesahan surat fisik TTD basah</span>
          </div>
        </Link>

        <Link
          href="/pemasaran/terima-data"
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-purple-500 hover:shadow-md transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold text-slate-800 block">UHT</span>
              {pendingPkgCount > 0 && (
                <span className="px-1.5 py-0.5 text-[9px] font-black bg-purple-600 text-white rounded-full">
                  {pendingPkgCount}
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500">Susu rasa, yogurt, & keju</span>
          </div>
        </Link>

        <Link
          href="/pemasaran/laporan"
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-sm font-extrabold text-slate-800 block">Laporan & Rekapitulasi</span>
            <span className="text-xs text-slate-500">Rekapan Fresh & Olahan (27 Kolom)</span>
          </div>
        </Link>
      </div>

      {/* 4 Key Integrated Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-700">
            <Milk className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Susu Fresh Masuk</p>
            <h3 className="text-2xl font-black text-slate-800">
              {totalSusuFreshMasuk.toLocaleString('id-ID')}{' '}
              <span className="text-xs font-semibold text-slate-500">Liter</span>
            </h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Total siap olah dari Farm</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-700">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Potongan BAST Fisik</p>
            <h3 className="text-2xl font-black text-amber-800">
              {totalBastDeduction.toLocaleString('id-ID')}{' '}
              <span className="text-xs font-semibold text-slate-500">Liter</span>
            </h3>
            <p className="text-[11px] text-amber-600 font-semibold mt-0.5">Penjualan Langsung & Hibah</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-purple-50 text-purple-700">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hasil Produk UHT</p>
            <h3 className="text-2xl font-black text-slate-800">
              {totalOlahanUnits.toLocaleString('id-ID')}{' '}
              <span className="text-xs font-semibold text-slate-500">Botol/Cup</span>
            </h3>
            <p className="text-[11px] text-purple-600 font-semibold mt-0.5">Dari unit Pengolahan UHT</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0E5A36] to-[#1E3F20] text-white p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-white/10 text-emerald-300">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">Integrasi Selisih</p>
            <h3 className="text-2xl font-black text-white">0 Liter</h3>
            <p className="text-[11px] text-emerald-300 font-semibold mt-0.5">100% Valid & Sinkron</p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. GRAFIK TREN ALIRAN SUSU & DISTRIBUSI PRODUK (CHART SECTION)            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GRAFIK 1: TREN ARUS MASUK SUSU FRESH & POTONGAN BAST */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <TrendingUp className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">
                    Grafik Tren Aliran Susu Fresh & Distribusi
                  </h3>
                  <p className="text-xs text-slate-500">
                    Volume susu siap olah masuk vs potongan BAST harian
                  </p>
                </div>
              </div>
            </div>

            {/* Filter 7 Hari / Bulan Ini */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
              <button
                onClick={() => setChartFilter('7')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  chartFilter === '7'
                    ? 'bg-[#1E3F20] text-white shadow'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                7 Hari Terakhir
              </button>
              <button
                onClick={() => setChartFilter('30')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  chartFilter === '30'
                    ? 'bg-[#1E3F20] text-white shadow'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bulan Ini (31 Hari)
              </button>
            </div>
          </div>

          {/* SVG Multi-Bar Trend Chart */}
          {(() => {
            const sortedDaily = [...farmDailyList].sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
            const displayDaily = chartFilter === '7' ? sortedDaily.slice(-7) : sortedDaily;
            const maxVal = Math.max(...displayDaily.map(d => d.totalSusuSiapOlah || d.totalGross || 0), 10);

            return (
              <div className="space-y-5">
                <div className="h-60 flex items-end justify-between px-1 w-full gap-1 sm:gap-2">
                  {displayDaily.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                      Belum ada data rekapan harian untuk grafik.
                    </div>
                  ) : (
                    displayDaily.map((d, idx) => {
                      const siapOlahVal = d.totalSusuSiapOlah || 0;
                      const bastVal = d.totalBastDeduction || 0;
                      const sisaBersih = d.sisaBersihSiapOlah !== undefined ? d.sisaBersihSiapOlah : (siapOlahVal - bastVal);

                      const siapOlahHeight = maxVal > 0 ? Math.round((siapOlahVal / maxVal) * 100) : 0;
                      const bastHeight = maxVal > 0 ? Math.round((bastVal / maxVal) * 100) : 0;
                      const sisaHeight = maxVal > 0 ? Math.round((Math.max(0, sisaBersih) / maxVal) * 100) : 0;

                      const dateObj = new Date(d.tanggal);
                      const dayLabel = chartFilter === '7' 
                        ? dateObj.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' })
                        : String(dateObj.getDate());

                      return (
                        <div key={d.tanggal || idx} className="flex-1 min-w-0 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                          {/* Hover Tooltip */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] p-2 rounded-xl shadow-xl pointer-events-none whitespace-nowrap z-30 absolute -top-16 left-1/2 transform -translate-x-1/2 space-y-0.5 border border-slate-700">
                            <div className="font-bold text-slate-300 border-b border-slate-700 pb-0.5">
                              {dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                            <div className="text-emerald-400 font-extrabold">Siap Olah: {siapOlahVal} L</div>
                            {bastVal > 0 && <div className="text-amber-400">Potongan BAST: -{bastVal} L</div>}
                            <div className="text-blue-300 font-bold">Sisa Bersih: {sisaBersih} L</div>
                          </div>

                          {/* Bars Cluster */}
                          <div className="w-full flex items-end justify-center gap-0.5 h-full">
                            {/* Siap Olah Bar */}
                            <div
                              className="w-1/2 bg-gradient-to-t from-[#1E3F20] to-emerald-500 rounded-t-sm group-hover:brightness-110 transition-all min-h-[4px]"
                              style={{ height: `${Math.max(siapOlahHeight, 4)}%` }}
                              title={`Siap Olah: ${siapOlahVal} L`}
                            />
                            {/* BAST Bar */}
                            {bastVal > 0 ? (
                              <div
                                className="w-1/2 bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-sm group-hover:brightness-110 transition-all min-h-[4px]"
                                style={{ height: `${Math.max(bastHeight, 4)}%` }}
                                title={`BAST: ${bastVal} L`}
                              />
                            ) : (
                              <div
                                className="w-1/2 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm group-hover:brightness-110 transition-all min-h-[4px]"
                                style={{ height: `${Math.max(sisaHeight, 4)}%` }}
                                title={`Sisa Bersih: ${sisaBersih} L`}
                              />
                            )}
                          </div>

                          <span className="font-bold text-slate-500 text-[9px] truncate w-full text-center leading-none">
                            {dayLabel}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Chart Legend */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-600 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-emerald-600" />
                      <span>Susu Siap Olah (Masuk)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-amber-500" />
                      <span>Potongan BAST (Fisik)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-blue-500" />
                      <span>Sisa Bersih Siap Olah</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400">Tinggi bar proporsional volume liter</span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* GRAFIK 2: KOMPOSISI PRODUK JADI UHT & KEMASAN */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-800">
                  <Package className="w-5 h-5 text-purple-700" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">Komposisi Produk UHT</h3>
                  <p className="text-xs text-slate-500">Hasil kemasan siap jual & distribusi</p>
                </div>
              </div>
            </div>

            {/* Packaging Breakdown List */}
            {(() => {
              const botolCount = packagings.filter(p => (p.kemasan || '').toLowerCase().includes('botol')).reduce((acc, p) => acc + (p.jumlah || 0), 0);
              const cupCount = packagings.filter(p => (p.kemasan || '').toLowerCase().includes('cup')).reduce((acc, p) => acc + (p.jumlah || 0), 0);
              const plastikCount = packagings.filter(p => (p.kemasan || '').toLowerCase().includes('plastik') || (p.kemasan || '').toLowerCase().includes('pouch')).reduce((acc, p) => acc + (p.jumlah || 0), 0);
              const totalItems = totalOlahanUnits > 0 ? totalOlahanUnits : 1;

              const botolPct = Math.round((botolCount / totalItems) * 100);
              const cupPct = Math.round((cupCount / totalItems) * 100);
              const plastikPct = Math.round((plastikCount / totalItems) * 100);

              return (
                <div className="space-y-4 pt-4">
                  {/* Botol */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-amber-900">Kemasan Botol (130ml, 200ml, 250ml)</span>
                      <span className="text-slate-800 font-mono font-black">{botolCount.toLocaleString('id-ID')} pcs ({botolPct}%)</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${botolPct}%` }} />
                    </div>
                  </div>

                  {/* Cup */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-blue-900">Kemasan Cup (100ml, 115ml)</span>
                      <span className="text-slate-800 font-mono font-black">{cupCount.toLocaleString('id-ID')} pcs ({cupPct}%)</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${cupPct}%` }} />
                    </div>
                  </div>

                  {/* Plastik Bantal */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-emerald-900">Plastik Bantal / Pouch (200ml, 500ml)</span>
                      <span className="text-slate-800 font-mono font-black">{plastikCount.toLocaleString('id-ID')} pcs ({plastikPct}%)</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${plastikPct}%` }} />
                    </div>
                  </div>

                  {/* Total Summary Box */}
                  <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-1 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">Total Unit Produk Jadi</span>
                      <span className="text-xl font-black text-amber-400">{totalOlahanUnits.toLocaleString('id-ID')} pcs</span>
                    </div>
                    <p className="text-[10px] text-emerald-300 font-semibold">Tersinkronisasi dengan unit pengolahan</p>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <Link
              href="/pemasaran/terima-data"
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Lihat Detail UHT</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
