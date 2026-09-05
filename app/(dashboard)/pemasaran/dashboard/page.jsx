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
  Sunset,
  Bell,
  ShoppingCart,
  Send,
  Plus,
  ChevronRight
} from 'lucide-react';

export default function DashboardPemasaranPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Raw Datasets from the integrated modules
  const [farmSessions, setFarmSessions] = useState([]);
  const [farmDailyList, setFarmDailyList] = useState([]);
  const [farmSummary, setFarmSummary] = useState({});
  const [basts, setBasts] = useState([]);
  const [packagings, setPackagings] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [recentNotifs, setRecentNotifs] = useState([]);

  const [chartFilter, setChartFilter] = useState('7'); // '7' or '30'

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [farmRes, bastRes, pkgRes, salesRes, notifRes] = await Promise.all([
        api.get('/pemasaran/farm-recap?sortOrder=desc').catch(() => ({ data: { data: [], dailyList: [], summary: {} } })),
        api.get('/bast').catch(() => ({ data: { data: [] } })),
        api.get('/packaged-products?sortOrder=desc').catch(() => ({ data: { data: [] } })),
        api.get('/milk-sales?sumber=OLAHAN').catch(() => ({ data: { data: [] } })),
        api.get('/notifications?limit=6').catch(() => ({ data: { data: [] } })),
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
      if (salesRes.data?.success) {
        setSalesHistory(salesRes.data.data || []);
      }
      if (notifRes.data?.success) {
        setRecentNotifs(notifRes.data.data || []);
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

  // Map Packagings with realtime sold count & remaining stock (matching /pemasaran/terima-data)
  const packagingsWithStock = useMemo(() => {
    return packagings.map((pkg) => {
      const initialStock = parseFloat(pkg.jumlah || pkg.totalPackagedQty || 0);
      const soldQty = salesHistory
        .filter((s) => {
          if (s.produkRefId) return s.produkRefId === pkg.id;
          return false;
        })
        .reduce((acc, s) => acc + (parseFloat(s.jumlah) || parseFloat(s.quantity) || 0), 0);
      const remainingStock = Math.max(0, initialStock - soldQty);
      return {
        ...pkg,
        initialStock,
        soldQty,
        remainingStock,
      };
    });
  }, [packagings, salesHistory]);

  // Groupings for the 4 UHT Categories
  const susuRasaItems = useMemo(() => {
    return packagingsWithStock.filter((p) => {
      const name = (p.jenisProduk || '').toLowerCase();
      return name.includes('rasa') || (name.includes('susu') && !name.includes('original') && !name.includes('yogurt') && !name.includes('keju'));
    });
  }, [packagingsWithStock]);

  const susuOriginalItems = useMemo(() => {
    return packagingsWithStock.filter((p) => {
      const name = (p.jenisProduk || '').toLowerCase();
      return name.includes('original') || name.includes('plain');
    });
  }, [packagingsWithStock]);

  const yogurtItems = useMemo(() => {
    return packagingsWithStock.filter((p) => {
      const name = (p.jenisProduk || '').toLowerCase();
      return name.includes('yogurt');
    });
  }, [packagingsWithStock]);

  const kejuItems = useMemo(() => {
    return packagingsWithStock.filter((p) => {
      const name = (p.jenisProduk || '').toLowerCase();
      return name.includes('keju');
    });
  }, [packagingsWithStock]);

  // UHT Category Stats
  const getCatStats = (items) => {
    const masuk = items.reduce((acc, p) => acc + (p.initialStock || 0), 0);
    const terjual = items.reduce((acc, p) => acc + (p.soldQty || 0), 0);
    const sisa = Math.max(0, masuk - terjual);
    return { masuk, terjual, sisa };
  };

  const susuRasaStats = useMemo(() => getCatStats(susuRasaItems), [susuRasaItems]);
  const susuOriginalStats = useMemo(() => getCatStats(susuOriginalItems), [susuOriginalItems]);
  const yogurtStats = useMemo(() => getCatStats(yogurtItems), [yogurtItems]);
  const kejuStats = useMemo(() => getCatStats(kejuItems), [kejuItems]);

  const totalUhtMasuk = useMemo(() => packagingsWithStock.reduce((acc, p) => acc + p.initialStock, 0), [packagingsWithStock]);
  const totalUhtTerjual = useMemo(() => packagingsWithStock.reduce((acc, p) => acc + p.soldQty, 0), [packagingsWithStock]);
  const totalUhtSisaStok = useMemo(() => Math.max(0, totalUhtMasuk - totalUhtTerjual), [totalUhtMasuk, totalUhtTerjual]);

  // Calculations for KPI Cards
  const totalProduksiGross = farmSummary.totalProduksiGross || 0;
  const totalPedetAfkir = (farmSummary.totalPedet || 0) + (farmSummary.totalAfkir || 0);
  const totalBastDeduction = farmSummary.totalBastDeduction || 0;
  const netSusuFreshTersedia = farmSummary.netSusuFreshTersedia || 0;

  const pendingFarmCount = farmSessions.filter((f) => f.status === 'MENUNGGU_VERIFIKASI').length;
  const pendingBastCount = basts.filter((b) => b.status === 'MENUNGGU_KONFIRMASI' || b.status === 'DIKIRIM_KE_FARM').length;
  const pendingPkgCount = packagings.filter((p) => p.status === 'MENUNGGU_PENERIMAAN').length;

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
              <span className="text-sm font-extrabold text-slate-800 block">Distribusi Susu Segar</span>
              {pendingBastCount > 0 && (
                <span className="px-1.5 py-0.5 text-[9px] font-black bg-rose-500 text-white rounded-full">
                  {pendingBastCount}
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500">Permintaan & BAST serah terima susu segar</span>
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
              <span className="text-sm font-extrabold text-slate-800 block">UHT & Olahan</span>
              {pendingPkgCount > 0 && (
                <span className="px-1.5 py-0.5 text-[9px] font-black bg-purple-600 text-white rounded-full">
                  {pendingPkgCount}
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500">Susu rasa, original, yogurt, keju</span>
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
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Susu Masuk (Gross)</p>
            <h3 className="text-2xl font-black text-slate-800">
              {totalProduksiGross.toLocaleString('id-ID')}{' '}
              <span className="text-xs font-semibold text-slate-500">Liter</span>
            </h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Total perah Farm kandang</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-700">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Distribusi & Hibah (BAST)</p>
            <h3 className="text-2xl font-black text-amber-800">
              {totalBastDeduction.toLocaleString('id-ID')}{' '}
              <span className="text-xs font-semibold text-slate-500">Liter</span>
            </h3>
            <p className="text-[11px] text-amber-600 font-semibold mt-0.5">Penjualan Langsung & Hibah</p>
          </div>
        </div>

        {/* UHT CARD - LIVE SISA STOK & TERJUAL */}
        <div className="bg-white p-5 rounded-2xl border border-purple-200 shadow-sm flex items-center gap-4 bg-gradient-to-br from-purple-50/40 to-white">
          <div className="p-3.5 rounded-2xl bg-purple-700 text-white">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-purple-900 uppercase tracking-wider">Stok Produk UHT Ready</p>
            <h3 className="text-2xl font-black text-purple-950">
              {totalUhtSisaStok.toLocaleString('id-ID')}{' '}
              <span className="text-xs font-semibold text-purple-700">pcs</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
              Masuk: <strong className="text-slate-800">{totalUhtMasuk.toLocaleString('id-ID')}</strong> | Terjual: <strong className="text-emerald-700">{totalUhtTerjual.toLocaleString('id-ID')}</strong>
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-300 shadow-sm flex items-center gap-4 bg-gradient-to-br from-emerald-50/50 to-white">
          <div className="p-3.5 rounded-2xl bg-emerald-700 text-white">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Diterima Pengolahan (Net)</p>
            <h3 className="text-2xl font-black text-emerald-950">
              {netSusuFreshTersedia.toLocaleString('id-ID')}{' '}
              <span className="text-xs font-semibold text-emerald-700">Liter</span>
            </h3>
            <p className="text-[11px] text-emerald-700 font-bold mt-0.5 flex items-center gap-1">
              <span>✓ 0 L Selisih (100% Pas)</span>
            </p>
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

        {/* GRAFIK 2 / CARD: KOMPOSISI & STATUS STOK 4 KATEGORI PRODUK UHT */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-800">
                  <PackageCheck className="w-5 h-5 text-purple-700" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">Stok Produk Olahan / UHT</h3>
                  <p className="text-xs text-slate-500">Live breakdown 4 Kategori Utama</p>
                </div>
              </div>
              <Link
                href="/pemasaran/terima-data"
                className="text-[11px] font-black text-purple-700 hover:text-purple-900 flex items-center gap-1"
              >
                <span>Buka UHT</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {/* 4 Categories Live Breakdown */}
            <div className="space-y-3 pt-3">
              {/* 1. Susu Pasteurisasi Rasa */}
              <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-amber-950 flex items-center gap-1.5">
                    <span>🍫</span>
                    <span>Susu Rasa (Cokelat & Stroberi)</span>
                  </span>
                  <span className="font-mono font-black text-amber-900 text-sm">
                    {susuRasaStats.sisa.toLocaleString('id-ID')} pcs
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                  <span>Masuk: {susuRasaStats.masuk.toLocaleString('id-ID')} pcs</span>
                  <span className="text-emerald-700 font-bold">Terjual: {susuRasaStats.terjual.toLocaleString('id-ID')} pcs</span>
                </div>
              </div>

              {/* 2. Susu Pasteurisasi Original */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span>🥛</span>
                    <span>Susu Pasteurisasi Original</span>
                  </span>
                  <span className="font-mono font-black text-slate-900 text-sm">
                    {susuOriginalStats.sisa.toLocaleString('id-ID')} pcs
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                  <span>Masuk: {susuOriginalStats.masuk.toLocaleString('id-ID')} pcs</span>
                  <span className="text-emerald-700 font-bold">Terjual: {susuOriginalStats.terjual.toLocaleString('id-ID')} pcs</span>
                </div>
              </div>

              {/* 3. Yogurt */}
              <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-200/70 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-purple-950 flex items-center gap-1.5">
                    <span>🍦</span>
                    <span>Yogurt (Plain & Buah)</span>
                  </span>
                  <span className="font-mono font-black text-purple-900 text-sm">
                    {yogurtStats.sisa.toLocaleString('id-ID')} pcs
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                  <span>Masuk: {yogurtStats.masuk.toLocaleString('id-ID')} pcs</span>
                  <span className="text-emerald-700 font-bold">Terjual: {yogurtStats.terjual.toLocaleString('id-ID')} pcs</span>
                </div>
              </div>

              {/* 4. Keju */}
              <div className="p-3 rounded-2xl bg-amber-50/40 border border-amber-200/50 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-amber-900 flex items-center gap-1.5">
                    <span>🧀</span>
                    <span>Keju Olahan & Fresh</span>
                  </span>
                  <span className="font-mono font-black text-amber-800 text-sm">
                    {kejuStats.sisa.toLocaleString('id-ID')} pcs
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                  <span>Masuk: {kejuStats.masuk.toLocaleString('id-ID')} pcs</span>
                  <span className="text-emerald-700 font-bold">Terjual: {kejuStats.terjual.toLocaleString('id-ID')} pcs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Total Summary Footer */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Total Sisa Stok Siap Distribusi:</span>
              <span className="text-xl font-black text-amber-400 font-mono">
                {totalUhtSisaStok.toLocaleString('id-ID')} pcs
              </span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 border-t border-slate-800 pt-1">
              <span>Total Diterima: {totalUhtMasuk.toLocaleString('id-ID')} pcs</span>
              <span className="text-emerald-400 font-bold">Total Terjual: {totalUhtTerjual.toLocaleString('id-ID')} pcs</span>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 6. AKTIVITAS & NOTIFIKASI STOK MASUK TERBARU DARI ADMIN PENGOLAHAN         */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Bell className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">
                Arus Notifikasi & Stok Masuk dari Unit Pengolahan
              </h3>
              <p className="text-xs text-slate-500">
                Riwayat batch produk olahan yang baru ditambahkan ke stok pemasaran
              </p>
            </div>
          </div>

          <Link
            href="/pemasaran/terima-data"
            className="px-4 py-2 bg-[#1E3F20] hover:bg-[#16331a] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow"
          >
            <span>Kelola di Menu UHT</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentNotifs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {recentNotifs.slice(0, 6).map((notif) => {
              let meta = null;
              if (notif.metadata) {
                try {
                  meta = typeof notif.metadata === 'string' ? JSON.parse(notif.metadata) : notif.metadata;
                } catch (e) {}
              }

              return (
                <div
                  key={notif.id}
                  className={`p-4 rounded-2xl border transition-all space-y-2 relative flex flex-col justify-between ${
                    !notif.isRead
                      ? 'bg-emerald-50/50 border-emerald-300 shadow-sm'
                      : 'bg-slate-50/50 border-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 uppercase tracking-wider">
                        {notif.type || 'STOK_MASUK'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(notif.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-slate-900 leading-snug">
                      {notif.title}
                    </h4>

                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-snug">
                      {notif.message}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 font-semibold">
                      Oleh: <strong>{notif.senderName || 'Admin Pengolahan'}</strong>
                    </span>
                    <Link
                      href={notif.link || '/pemasaran/terima-data'}
                      className="font-black text-emerald-800 hover:text-emerald-950 flex items-center gap-0.5"
                    >
                      <span>Lihat Stok</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            Belum ada notifikasi stok masuk baru.
          </div>
        )}
      </div>
    </div>
  );
}
