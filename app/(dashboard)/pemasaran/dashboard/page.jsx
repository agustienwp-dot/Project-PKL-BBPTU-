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
  Truck,
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

  // Unified Real-Time Incoming Data Flow (Keseluruhan Aktivitas Data Masuk ke Admin Pemasaran)
  const realtimeFlowList = useMemo(() => {
    const list = [];

    // 1. Susu Segar Masuk dari Farm (Peternakan)
    farmSessions.forEach((s) => {
      const dateVal = s.tanggal || s.receivedAt || s.createdAt;
      list.push({
        id: `farm-${s.id}`,
        type: 'SUSU_SEGAR',
        categoryLabel: 'Susu Segar Farm',
        title: `Perah ${s.kegiatanPerah || 'Pagi'} - Susu ${s.jenisTernak || 'SAPI'}`,
        volume: `+${(s.susuSiapOlah || s.produksiSusu || 0).toLocaleString('id-ID')} L`,
        secondaryInfo: `Gross: ${(s.produksiSusu || 0).toLocaleString('id-ID')} L • Pedet: ${(s.susuPedet || 0)} L`,
        date: dateVal,
        status: s.status || 'DITERIMA',
        iconType: 'milk',
        link: '/pemasaran/terima-susu-segar',
      });
    });

    // 2. Produk Olahan Masuk dari Unit Pengolahan & Pengemasan
    packagings.forEach((p) => {
      const dateVal = p.tanggal || p.createdAt;
      const qty = parseFloat(p.jumlah) || parseFloat(p.totalPackagedQty) || 0;
      const productName = p.jenisProduk || p.namaProduk || 'Produk Olahan';
      const packagingSize = p.kemasan || p.ukuranKemasan || 'Kemasan Standar';
      list.push({
        id: `pkg-${p.id}`,
        type: 'PRODUK_OLAHAN',
        categoryLabel: 'Produk Olahan',
        title: `${productName}${p.varianRasa ? ` (${p.varianRasa})` : ''}`,
        volume: `+${qty.toLocaleString('id-ID')} pcs`,
        secondaryInfo: `${packagingSize}${p.notes ? ` • ${p.notes}` : ''}`,
        date: dateVal,
        status: p.status || 'TERSEDIA',
        iconType: 'package',
        link: '/pemasaran/terima-data',
      });
    });

    // 3. Dokumen & Permintaan BAST (Distribusi Masuk/Tercatat)
    basts.forEach((b) => {
      const dateVal = b.tanggal || b.createdAt;
      list.push({
        id: `bast-${b.id}`,
        type: 'BAST',
        categoryLabel: 'BAST Alokasi',
        title: `${b.nomorBast || 'BAST'} • ${b.instansiPenerima || 'Distribusi / Hibah'}`,
        volume: `${(b.volumeLiters || 0).toLocaleString('id-ID')} L`,
        secondaryInfo: `Keperluan: ${b.jenisPermintaan || 'PENJUALAN_LANGSUNG'}${b.catatan ? ` • ${b.catatan}` : ''}`,
        date: dateVal,
        status: b.status || 'DITERIMA',
        iconType: 'truck',
        link: '/pemasaran/bast',
      });
    });

    // 4. Notifikasi Sistem Masuk dari Divisi Terkait
    recentNotifs.forEach((n) => {
      list.push({
        id: `notif-${n.id}`,
        type: 'NOTIFIKASI',
        categoryLabel: 'Notifikasi Sistem',
        title: n.title || 'Pemberitahuan Sistem',
        volume: n.type || 'INFO',
        secondaryInfo: n.message || `Dari: ${n.senderName || 'Admin'}`,
        date: n.createdAt,
        status: n.isRead ? 'TERBACA' : 'BARU',
        iconType: 'bell',
        link: n.link || '/pemasaran/terima-data',
      });
    });

    // Urutkan paling baru secara kronologis
    list.sort((a, b) => new Date(b.date) - new Date(a.date));
    return list;
  }, [farmSessions, packagings, basts, recentNotifs]);





  if (loading) {
    return <LoadingSpinner text="Memuat Live Flow Data Masuk Realtime..." />;
  }

  return (
    <div className="space-y-6 w-full pb-10 font-sans">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Page Title */}
      <div className="pt-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
          DASHBOARD
        </h1>
      </div>

      {/* 4 Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/pemasaran/terima-susu-segar"
          className="bg-white p-5 rounded-3xl border border-slate-200/80 hover:border-emerald-500/70 hover:shadow-md transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-100/80 transition-all shrink-0">
            <Milk className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <span className="text-sm font-extrabold text-slate-800 block truncate group-hover:text-emerald-900 transition-colors">
              Terima Susu Segar
            </span>
            <span className="text-xs text-emerald-700 font-medium block truncate">
              Penerimaan sesi perah farm
            </span>
            {pendingFarmCount > 0 && (
              <span className="text-[11px] font-bold text-amber-600 block">
                {pendingFarmCount} Baru
              </span>
            )}
          </div>
        </Link>

        <Link
          href="/pemasaran/bast"
          className="bg-white p-5 rounded-3xl border border-slate-200/80 hover:border-emerald-500/70 hover:shadow-md transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-100/80 transition-all shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <span className="text-sm font-extrabold text-slate-800 block truncate group-hover:text-emerald-900 transition-colors">
              Distribusi Susu Segar
            </span>
            <span className="text-xs text-emerald-700 font-medium block truncate">
              Permintaan & BAST serah terima
            </span>
            {pendingBastCount > 0 && (
              <span className="text-xs font-black text-rose-600 block">
                {pendingBastCount} Pending
              </span>
            )}
          </div>
        </Link>

        <Link
          href="/pemasaran/terima-data"
          className="bg-white p-5 rounded-3xl border border-slate-200/80 hover:border-emerald-500/70 hover:shadow-md transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-100/80 transition-all shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <span className="text-sm font-extrabold text-slate-800 block truncate group-hover:text-emerald-900 transition-colors">
              UHT & Olahan
            </span>
            <span className="text-xs text-emerald-700 font-medium block truncate">
              Susu rasa, original, yogurt, keju
            </span>
            {pendingPkgCount > 0 && (
              <span className="text-[11px] font-bold text-purple-600 block">
                {pendingPkgCount} Batch
              </span>
            )}
          </div>
        </Link>

        <Link
          href="/pemasaran/laporan"
          className="bg-white p-5 rounded-3xl border border-slate-200/80 hover:border-emerald-500/70 hover:shadow-md transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-100/80 transition-all shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <span className="text-sm font-extrabold text-slate-800 block truncate group-hover:text-emerald-900 transition-colors">
              Laporan & Rekapitulasi
            </span>
            <span className="text-xs text-emerald-700 font-medium block truncate">
              Rekapan Fresh & Olahan (27 Kolom)
            </span>
          </div>
        </Link>
      </div>

      {/* 4 Key Integrated Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4 hover:shadow-sm transition-all">
          <div className="p-3.5 rounded-2xl bg-emerald-700 text-white shadow-xs">
            <Milk className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Susu Masuk (Gross)</p>
            <h3 className="text-2xl font-black text-slate-800 mt-0.5">
              {totalProduksiGross.toLocaleString('id-ID')}{' '}
              <span className="text-xs font-semibold text-slate-500">Liter</span>
            </h3>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">Total perah Farm kandang</p>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4 hover:shadow-sm transition-all">
          <div className="p-3.5 rounded-2xl bg-emerald-700 text-white shadow-xs">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Distribusi & Hibah (BAST)</p>
            <h3 className="text-2xl font-black text-slate-800 mt-0.5">
              {totalBastDeduction.toLocaleString('id-ID')}{' '}
              <span className="text-xs font-semibold text-slate-500">Liter</span>
            </h3>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">Penjualan Langsung & Hibah</p>
          </div>
        </div>

        {/* UHT CARD - LIVE SISA STOK & TERJUAL */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4 hover:shadow-sm transition-all">
          <div className="p-3.5 rounded-2xl bg-emerald-700 text-white shadow-xs">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Stok Produk UHT Ready</p>
            <h3 className="text-2xl font-black text-slate-800 mt-0.5">
              {totalUhtSisaStok.toLocaleString('id-ID')}{' '}
              <span className="text-xs font-semibold text-slate-500">pcs</span>
            </h3>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
              Masuk: <strong className="text-emerald-800">{totalUhtMasuk.toLocaleString('id-ID')}</strong> | Terjual: <strong className="text-emerald-800">{totalUhtTerjual.toLocaleString('id-ID')}</strong>
            </p>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4 hover:shadow-sm transition-all">
          <div className="p-3.5 rounded-2xl bg-emerald-700 text-white shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Diterima Pemasaran</p>
            <h3 className="text-2xl font-black text-slate-800 mt-0.5">
              {netSusuFreshTersedia.toLocaleString('id-ID')}{' '}
              <span className="text-xs font-semibold text-slate-500">Liter</span>
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
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
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

            {/* Timeframe Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setChartFilter('7')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  chartFilter === '7'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                7 Hari Terakhir
              </button>
              <button
                type="button"
                onClick={() => setChartFilter('30')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  chartFilter === '30'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bulan Ini (31 Hari)
              </button>
            </div>
          </div>

          {/* Multi-Bar Trend Chart (3 Bar Berdampingan: Hijau, Kuning, Biru) */}
          {(() => {
            // Group by unique date to combine entries (Sapi + Kambing) and eliminate duplicate day labels
            const dailyByDate = {};
            farmDailyList.forEach(d => {
              if (!dailyByDate[d.tanggal]) {
                dailyByDate[d.tanggal] = {
                  tanggal: d.tanggal,
                  totalSusuSiapOlah: 0,
                  totalGross: 0,
                  totalBastDeduction: 0,
                  sisaBersihSiapOlah: 0,
                };
              }
              const siapOlah = d.totalSusuSiapOlah || d.totalGross || 0;
              const bast = d.totalBastDeduction || 0;
              const sisa = d.sisaBersihSiapOlah !== undefined ? d.sisaBersihSiapOlah : Math.max(0, siapOlah - bast);

              dailyByDate[d.tanggal].totalSusuSiapOlah += siapOlah;
              dailyByDate[d.tanggal].totalGross += (d.totalGross || 0);
              dailyByDate[d.tanggal].totalBastDeduction += bast;
              dailyByDate[d.tanggal].sisaBersihSiapOlah += sisa;
            });

            const uniqueSortedDaily = Object.values(dailyByDate).sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
            const displayDaily = chartFilter === '7' ? uniqueSortedDaily.slice(-7) : uniqueSortedDaily;
            const maxVal = Math.max(
              ...displayDaily.map(d => Math.max(d.totalSusuSiapOlah || 0, d.totalBastDeduction || 0, d.sisaBersihSiapOlah || 0)),
              10
            );

            return (
              <div className="space-y-5">
                <div className="h-64 flex items-end justify-between px-2 w-full gap-2 sm:gap-4 border-b border-slate-100 pb-2">
                  {displayDaily.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                      Belum ada data rekapan harian untuk grafik.
                    </div>
                  ) : (
                    displayDaily.map((d, idx) => {
                      const siapOlahVal = d.totalSusuSiapOlah || 0;
                      const bastVal = d.totalBastDeduction || 0;
                      const sisaBersih = d.sisaBersihSiapOlah !== undefined ? d.sisaBersihSiapOlah : Math.max(0, siapOlahVal - bastVal);

                      const siapOlahHeight = maxVal > 0 ? Math.round((siapOlahVal / maxVal) * 100) : 0;
                      const bastHeight = maxVal > 0 ? Math.round((bastVal / maxVal) * 100) : 0;
                      const sisaHeight = maxVal > 0 ? Math.round((Math.max(0, sisaBersih) / maxVal) * 100) : 0;

                      const dateObj = new Date(d.tanggal);
                      const dayLabel = chartFilter === '7' 
                        ? dateObj.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' })
                        : String(dateObj.getDate());

                      return (
                        <div key={d.tanggal || idx} className="flex-1 min-w-0 flex flex-col items-center h-full justify-end group relative">
                          {/* Hover Tooltip */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] p-3 rounded-2xl shadow-xl pointer-events-none whitespace-nowrap z-30 absolute -top-24 left-1/2 transform -translate-x-1/2 space-y-1.5 border border-slate-700">
                            <div className="font-bold text-slate-300 border-b border-slate-700 pb-1">
                              {dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                            <div className="text-emerald-400 font-extrabold flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                              <span>Susu Siap Olah (Masuk): {siapOlahVal.toLocaleString('id-ID')} L</span>
                            </div>
                            <div className="text-amber-400 font-bold flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                              <span>Potongan BAST: {bastVal.toLocaleString('id-ID')} L</span>
                            </div>
                            <div className="text-blue-300 font-bold flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                              <span>Sisa Bersih Siap Olah: {sisaBersih.toLocaleString('id-ID')} L</span>
                            </div>
                          </div>

                          {/* 3 Bars Side by Side: Hijau (Masuk), Kuning (BAST), Biru (Sisa Bersih) */}
                          <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full px-0.5">
                            {/* Bar 1: Susu Siap Olah (Hijau) */}
                            <div
                              className="flex-1 max-w-[18px] sm:max-w-[22px] bg-gradient-to-t from-[#1E3F20] to-emerald-500 rounded-t-lg group-hover:brightness-110 transition-all min-h-[4px] shadow-2xs"
                              style={{ height: `${Math.max(siapOlahHeight, 4)}%` }}
                              title={`Susu Siap Olah: ${siapOlahVal} L`}
                            />
                            {/* Bar 2: Potongan BAST (Amber/Kuning) */}
                            <div
                              className="flex-1 max-w-[18px] sm:max-w-[22px] bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-lg group-hover:brightness-110 transition-all min-h-[4px] shadow-2xs"
                              style={{ height: `${Math.max(bastHeight, 4)}%` }}
                              title={`Potongan BAST: ${bastVal} L`}
                            />
                            {/* Bar 3: Sisa Bersih Siap Olah (Biru) */}
                            <div
                              className="flex-1 max-w-[18px] sm:max-w-[22px] bg-gradient-to-t from-blue-700 to-blue-500 rounded-t-lg group-hover:brightness-110 transition-all min-h-[4px] shadow-2xs"
                              style={{ height: `${Math.max(sisaHeight, 4)}%` }}
                              title={`Sisa Bersih Siap Olah: ${sisaBersih} L`}
                            />
                          </div>

                          {/* X-Axis Date Label */}
                          <span className="font-bold text-slate-600 text-[10px] sm:text-xs truncate w-full text-center leading-none mt-2">
                            {dayLabel}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Legend: 100% synchronized with the 3 bars */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-600 pt-2">
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-md bg-emerald-600 shadow-2xs" />
                      <span className="text-slate-700 font-bold">Susu Siap Olah (Masuk)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-md bg-amber-500 shadow-2xs" />
                      <span className="text-slate-700 font-bold">Potongan BAST (Fisik)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-md bg-blue-600 shadow-2xs" />
                      <span className="text-slate-700 font-bold">Sisa Bersih Siap Olah</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* CARD: AKTIVITAS DATA MASUK (LIVE FLOW DATA) */}
        {/* CARD: AKTIVITAS DATA MASUK (LIVE FLOW DATA KESELURUHAN) */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col">
            {/* Header: Title */}
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-800">Aktivitas Data Masuk</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">aktivitas data terbaru</p>
            </div>

            {/* Scrollable Flow List */}
            <div className="mt-3 space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {realtimeFlowList.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  Belum ada aktivitas data masuk.
                </div>
              ) : (
                realtimeFlowList.slice(0, 25).map((item) => {
                  const dateObj = new Date(item.date);
                  const timeFormatted = !isNaN(dateObj)
                    ? dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                    : '-';

                  const badgeStyles = {
                    SUSU_SEGAR: 'bg-emerald-100 text-emerald-800',
                    PRODUK_OLAHAN: 'bg-blue-100 text-blue-800',
                    BAST: 'bg-amber-100 text-amber-800',
                    NOTIFIKASI: 'bg-rose-100 text-rose-800',
                  };

                  const iconBgStyles = {
                    SUSU_SEGAR: 'bg-emerald-100 text-emerald-800',
                    PRODUK_OLAHAN: 'bg-blue-100 text-blue-800',
                    BAST: 'bg-amber-100 text-amber-800',
                    NOTIFIKASI: 'bg-rose-100 text-rose-800',
                  };

                  const volumeColorStyles = {
                    SUSU_SEGAR: 'text-emerald-700',
                    PRODUK_OLAHAN: 'text-blue-700',
                    BAST: 'text-amber-700',
                    NOTIFIKASI: 'text-slate-700',
                  };

                  return (
                    <Link
                      key={item.id}
                      href={item.link}
                      className="block p-3 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-emerald-50/40 hover:border-emerald-200 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        {/* Icon & Details */}
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${iconBgStyles[item.type] || 'bg-slate-100 text-slate-800'}`}>
                            {item.type === 'SUSU_SEGAR' ? (
                              <Milk className="w-4 h-4" />
                            ) : item.type === 'PRODUK_OLAHAN' ? (
                              <Package className="w-4 h-4" />
                            ) : item.type === 'BAST' ? (
                              <Truck className="w-4 h-4" />
                            ) : (
                              <Bell className="w-4 h-4" />
                            )}
                          </div>

                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${badgeStyles[item.type] || 'bg-slate-100 text-slate-800'}`}>
                                {item.categoryLabel}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {timeFormatted}
                              </span>
                            </div>

                            <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-900 transition-colors">
                              {item.title}
                            </h4>

                            <p className="text-[11px] text-slate-500 truncate">
                              {item.secondaryInfo}
                            </p>
                          </div>
                        </div>

                        {/* Volume & Status */}
                        <div className="text-right shrink-0 flex flex-col items-end gap-1">
                          <span className={`text-xs font-black font-mono ${volumeColorStyles[item.type] || 'text-slate-800'}`}>
                            {item.volume}
                          </span>

                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                              item.status === 'DITERIMA' || item.status === 'TERSEDIA' || item.status === 'BERHASIL'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
        </div>

      </div>
    </div>
  );
}
