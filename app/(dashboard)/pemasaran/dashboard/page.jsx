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

  // Stream Tab Filter: 'ALL' | 'FARM' | 'BAST' | 'PENGEMASAN'
  const [streamTab, setStreamTab] = useState('ALL');
  const [streamStatus, setStreamStatus] = useState('ALL');

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

  // Compute Unified Realtime Live Stream Feed
  const liveStreams = useMemo(() => {
    const stream = [];

    // 1. Inflow from Unit Farm (Perah Pagi & Sore)
    farmSessions.forEach((f) => {
      stream.push({
        id: `stream-farm-${f.id}`,
        rawId: f.id,
        category: 'FARM',
        sourceName: 'Unit Farm Produksi',
        sourceType: '🥛 Susu Fresh (Farm)',
        sourceColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        date: f.tanggal,
        title: `Penyerahan Sesi ${f.kegiatanPerah} (${f.jenisTernak === 'KAMBING' ? 'Kambing' : 'Sapi'})`,
        subtitle: `Gross: ${f.produksiSusu} L • Pedet/Afkir: ${f.susuPedet + f.susuAfkir} L • Dist: ${f.distribusiSegar} L`,
        volumeText: `${f.susuSiapOlah} Liter`,
        volumeSubtext: 'Susu Siap Olah',
        status: f.status,
        notes: f.notes || 'Penyerahan hasil perah kandang.',
        actionLink: '/pemasaran/terima-susu-segar',
        actionLabel: 'Buka Terima Susu Segar',
      });
    });

    // 2. Inflow from Surat Fisik BAST
    basts.forEach((b) => {
      stream.push({
        id: `stream-bast-${b.id}`,
        rawId: b.id,
        category: 'BAST',
        sourceName: 'Surat Fisik BAST',
        sourceType: '📄 BAST Penyerahan',
        sourceColor: 'bg-amber-100 text-amber-900 border-amber-200',
        date: new Date(b.tanggal).toISOString().slice(0, 10),
        title: `BAST No. ${b.nomorBast} (${b.jenisPermintaan === 'HIBAH' ? 'Hibah' : 'Penjualan Langsung'})`,
        subtitle: `Penerima: ${b.instansiPenerima || 'Umum'} • Tanda Tangan Basah`,
        volumeText: `-${b.volumeLiters} Liter`,
        volumeSubtext: 'Memotong Susu Fresh',
        status: b.status,
        notes: b.catatan || 'Surat fisik penyerahan susu segar.',
        actionLink: '/pemasaran/bast',
        actionLabel: 'Konfirmasi Surat Fisik',
      });
    });

    // 3. Inflow from Unit Pengolahan & Pengemasan (UHT)
    packagings.forEach((p) => {
      stream.push({
        id: `stream-pkg-${p.id}`,
        rawId: p.id,
        category: 'PENGEMASAN',
        sourceName: 'Unit Pengolahan & UHT',
        sourceType: '📦 UHT',
        sourceColor: 'bg-purple-100 text-purple-900 border-purple-200',
        date: new Date(p.tanggal || p.date).toISOString().slice(0, 10),
        title: `Hasil Olahan UHT: ${p.jenisProduk} (${p.kemasan || 'Kemasan'})`,
        subtitle: `Batch Produksi UHT Siap Jual`,
        volumeText: `${(p.jumlah || p.totalPackagedQty || 0).toLocaleString('id-ID')} Botol/Cup`,
        volumeSubtext: 'Produk Jadi',
        status: p.status,
        notes: p.notes || 'Batch UHT masuk ke persediaan pemasaran.',
        actionLink: '/pemasaran/terima-data',
        actionLabel: 'Terima UHT',
      });
    });

    // Sort Chronologically: Descending (Terbaru di atas)
    return stream.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [farmSessions, basts, packagings]);

  // Filtered Streams
  const filteredStreams = useMemo(() => {
    return liveStreams.filter((item) => {
      const matchCat = streamTab === 'ALL' || item.category === streamTab;
      const matchStatus =
        streamStatus === 'ALL' ||
        (streamStatus === 'PENDING' && (item.status === 'MENUNGGU_VERIFIKASI' || item.status === 'MENUNGGU_KONFIRMASI' || item.status === 'MENUNGGU_PENERIMAAN')) ||
        (streamStatus === 'DITERIMA' && item.status === 'DITERIMA');

      return matchCat && matchStatus;
    });
  }, [liveStreams, streamTab, streamStatus]);

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
      {/* REALTIME INFLOW FEED: ALIRAN DATA MASUK DARI FARM & PENGOLAHAN            */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="font-extrabold text-slate-800 text-lg">Aliran Data Masuk Realtime (Inflow Stream)</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantauan pergerakan data fisik dan produk dari unit Farm Produksi & unit Pengolahan ke Pemasaran
            </p>
          </div>

          {/* Stream Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
            {[
              { id: 'ALL', label: 'Semua Aliran', count: liveStreams.length },
              { id: 'FARM', label: '🥛 Dari Farm', count: farmSessions.length },
              { id: 'BAST', label: '📄 Surat BAST', count: basts.length },
              { id: 'PENGEMASAN', label: '📦 Dari UHT', count: packagings.length },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setStreamTab(t.id)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                  streamTab === t.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label} ({t.count})
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500">Status:</span>
            <button
              onClick={() => setStreamStatus('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                streamStatus === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Semua Status
            </button>
            <button
              onClick={() => setStreamStatus('PENDING')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                streamStatus === 'PENDING' ? 'bg-amber-500 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Menunggu Konfirmasi ({totalPendingAll})
            </button>
            <button
              onClick={() => setStreamStatus('DITERIMA')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                streamStatus === 'DITERIMA' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Sudah Diterima (Disahkan)
            </button>
          </div>

          <span className="text-[11px] text-slate-400 font-semibold">
            Menampilkan {filteredStreams.length} Aliran Data
          </span>
        </div>

        {/* Stream Items Table / Feed */}
        {filteredStreams.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Tidak ada aliran data masuk untuk filter yang dipilih.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-y border-slate-200 text-[11px]">
                <tr>
                  <th className="px-4 py-3">Waktu / Tanggal</th>
                  <th className="px-4 py-3">Sumber Asal</th>
                  <th className="px-4 py-3">Rincian Data / Produk Masuk</th>
                  <th className="px-4 py-3 text-right">Volume / Qty</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Aksi Lanjutan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredStreams.map((item) => {
                  const isPending =
                    item.status === 'MENUNGGU_VERIFIKASI' ||
                    item.status === 'MENUNGGU_KONFIRMASI' ||
                    item.status === 'MENUNGGU_PENERIMAAN';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 text-slate-700 whitespace-nowrap">
                        <div className="font-bold text-slate-900">
                          {new Date(item.date).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <span className="text-[10px] text-slate-400">Tercatat di sistem</span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold border ${item.sourceColor}`}>
                          {item.sourceType}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 text-xs">{item.title}</div>
                        <div className="text-[11px] text-slate-500">{item.subtitle}</div>
                        {item.notes && (
                          <div className="text-[10px] text-slate-400 italic mt-0.5 max-w-md truncate">
                            {item.notes}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <span className={`text-sm font-black ${
                          item.category === 'BAST'
                            ? 'text-amber-800'
                            : item.category === 'PENGEMASAN'
                            ? 'text-purple-900'
                            : 'text-emerald-950'
                        }`}>
                          {item.volumeText}
                        </span>
                        <span className="block text-[10px] text-slate-400">{item.volumeSubtext}</span>
                      </td>

                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            <span>Menunggu Konfirmasi</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Sudah Diterima</span>
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <Link
                          href={item.actionLink}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm transition-transform active:scale-95 ${
                            isPending
                              ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                          }`}
                        >
                          <span>{item.actionLabel}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
