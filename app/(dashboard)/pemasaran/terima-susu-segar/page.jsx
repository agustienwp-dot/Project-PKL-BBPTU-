'use client';

import React, { useState, useEffect, useMemo } from 'react';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import EmptyState from '@/components/EmptyState';
import {
  Milk,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  Printer,
  X,
  Filter,
  Layers,
  ArrowDownRight,
  TrendingDown,
  Gift,
  ShoppingCart,
  Building2,
  Calendar,
  Search,
  RotateCcw,
  Sun,
  Sunset,
  Sparkles,
  Info
} from 'lucide-react';

export default function TerimaSusuSegarPage() {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [farmRecaps, setFarmRecaps] = useState([]);
  const [farmDailyList, setFarmDailyList] = useState([]);
  const [summary, setSummary] = useState({});

  // Commodity Tab: 'SAPI' | 'KAMBING'
  const [commodityTab, setCommodityTab] = useState('SAPI');

  // View Sub-Tab: 'daily' (1 Hari Jadi Satu) | 'sessions' (Rincian Sesi Pagi & Sore)
  const [viewTab, setViewTab] = useState('daily');

  // Time & Controls Filters
  const [timeFilter, setTimeFilter] = useState('ALL'); // 'ALL' | 'TODAY' | '7DAYS' | 'MONTH' | 'CUSTOM'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sessionFilter, setSessionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('asc'); // Default ascending 1-31
  const [searchTerm, setSearchTerm] = useState('');

  // Fresh Milk Verification Modal
  const [selectedFresh, setSelectedFresh] = useState(null);
  const [showFreshConfirmModal, setShowFreshConfirmModal] = useState(false);
  const [freshNotes, setFreshNotes] = useState('');
  const [submittingFresh, setSubmittingFresh] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const recapRes = await api.get('/pemasaran/farm-recap?sortOrder=asc').catch(() => ({ data: { data: [], dailyList: [], summary: {} } }));

      if (recapRes.data?.success) {
        setFarmRecaps(recapRes.data.data || []);
        setFarmDailyList(recapRes.data.dailyList || []);
        setSummary(recapRes.data.summary || {});
      }
    } catch (err) {
      console.error('Error loading fresh milk data:', err);
      setToast({ type: 'error', message: 'Gagal memuat data penerimaan susu segar.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Commodity Counts & Quick Aggregates for Tabs
  const sapiDailyList = useMemo(() => farmDailyList.filter(d => (d.jenisTernak || 'SAPI').toUpperCase() === 'SAPI'), [farmDailyList]);
  const kambingDailyList = useMemo(() => farmDailyList.filter(d => (d.jenisTernak || '').toUpperCase() === 'KAMBING'), [farmDailyList]);
  
  const totalSapiVolume = useMemo(() => sapiDailyList.reduce((acc, d) => acc + (d.sisaBersihSiapOlah || d.totalSusuSiapOlah || 0), 0), [sapiDailyList]);
  const totalKambingVolume = useMemo(() => kambingDailyList.reduce((acc, d) => acc + (d.sisaBersihSiapOlah || d.totalSusuSiapOlah || 0), 0), [kambingDailyList]);

  const pendingSapiCount = useMemo(() => farmRecaps.filter(r => (r.jenisTernak || 'SAPI').toUpperCase() === 'SAPI' && r.status === 'MENUNGGU_VERIFIKASI').length, [farmRecaps]);
  const pendingKambingCount = useMemo(() => farmRecaps.filter(r => (r.jenisTernak || '').toUpperCase() === 'KAMBING' && r.status === 'MENUNGGU_VERIFIKASI').length, [farmRecaps]);

  // Filtered Daily Records (1 Hari Jadi Satu dengan Potongan BAST Otomatis & Pemisahan Komoditas)
  const filteredDailyList = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const d7 = new Date();
    d7.setDate(d7.getDate() - 7);
    const d7Str = d7.toISOString().slice(0, 10);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

    return farmDailyList
      .filter((day) => {
        // Filter strictly by active commodity tab
        const dayAnimal = (day.jenisTernak || 'SAPI').toUpperCase();
        if (dayAnimal !== commodityTab) return false;

        const dStr = day.tanggal;
        let matchTime = true;
        if (timeFilter === 'TODAY') matchTime = dStr === today;
        else if (timeFilter === '7DAYS') matchTime = dStr >= d7Str;
        else if (timeFilter === 'MONTH') matchTime = dStr >= monthStart && dStr <= monthEnd;
        else if (timeFilter === 'CUSTOM') {
          if (startDate && dStr < startDate) matchTime = false;
          if (endDate && dStr > endDate) matchTime = false;
        }

        const matchStatus = statusFilter === 'ALL' || day.status === statusFilter;
        const matchSearch =
          !searchTerm ||
          day.tanggal.includes(searchTerm) ||
          day.bastUsageDescriptions?.some((desc) => desc.toLowerCase().includes(searchTerm.toLowerCase()));

        return matchTime && matchStatus && matchSearch;
      })
      .sort((a, b) => {
        const cmp = new Date(a.tanggal) - new Date(b.tanggal);
        return sortOrder === 'desc' ? -cmp : cmp;
      });
  }, [farmDailyList, commodityTab, timeFilter, startDate, endDate, statusFilter, sortOrder, searchTerm]);

  // Filtered Sesi Records (Pemisahan Komoditas)
  const filteredSessions = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const d7 = new Date();
    d7.setDate(d7.getDate() - 7);
    const d7Str = d7.toISOString().slice(0, 10);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

    return farmRecaps
      .filter((r) => {
        // Filter strictly by active commodity tab
        const rAnimal = (r.jenisTernak || 'SAPI').toUpperCase();
        if (rAnimal !== commodityTab) return false;

        const dStr = r.tanggal;
        let matchTime = true;
        if (timeFilter === 'TODAY') matchTime = dStr === today;
        else if (timeFilter === '7DAYS') matchTime = dStr >= d7Str;
        else if (timeFilter === 'MONTH') matchTime = dStr >= monthStart && dStr <= monthEnd;
        else if (timeFilter === 'CUSTOM') {
          if (startDate && dStr < startDate) matchTime = false;
          if (endDate && dStr > endDate) matchTime = false;
        }

        const matchSession = sessionFilter === 'ALL' || r.kegiatanPerah?.toLowerCase() === sessionFilter.toLowerCase();
        const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
        const matchSearch =
          !searchTerm ||
          r.tanggal.includes(searchTerm) ||
          r.rincianPembeli?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.notes?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchTime && matchSession && matchStatus && matchSearch;
      })
      .sort((a, b) => {
        const cmp = new Date(a.tanggal) - new Date(b.tanggal);
        if (cmp !== 0) return sortOrder === 'desc' ? -cmp : cmp;
        return a.kegiatanPerah === 'Pagi' ? -1 : 1;
      });
  }, [farmRecaps, commodityTab, timeFilter, startDate, endDate, sessionFilter, statusFilter, sortOrder, searchTerm]);

  // Aggregated Totals strictly for the active commodity
  const totalDailyGross = useMemo(() => filteredDailyList.reduce((acc, d) => acc + d.totalGross, 0), [filteredDailyList]);
  const totalDailySiapOlahAwal = useMemo(() => filteredDailyList.reduce((acc, d) => acc + d.totalSusuSiapOlah, 0), [filteredDailyList]);
  const totalDailyBastPotongan = useMemo(() => filteredDailyList.reduce((acc, d) => acc + (d.totalBastDeduction || 0), 0), [filteredDailyList]);
  const totalDailyBersihSiapOlah = useMemo(() => filteredDailyList.reduce((acc, d) => acc + (d.sisaBersihSiapOlah || 0), 0), [filteredDailyList]);

  // Fresh Milk Actions
  const handleOpenFreshConfirm = (item) => {
    setSelectedFresh(item);
    setFreshNotes(item.notes || '');
    setShowFreshConfirmModal(true);
  };

  const handleConfirmFresh = async () => {
    if (!selectedFresh) return;
    setSubmittingFresh(true);
    try {
      const res = await api.put('/pemasaran/farm-recap', {
        id: selectedFresh.id,
        action: 'RECEIVE',
        receptionNotes: freshNotes,
      });

      if (res.data?.success) {
        setToast({
          type: 'success',
          message: 'Data sesi perah farm berhasil diverifikasi!',
        });
        setShowFreshConfirmModal(false);
        setFreshNotes('');
        setSelectedFresh(null);
        fetchData();
      }
    } catch (err) {
      console.error('Error confirming fresh milk:', err);
      setToast({ type: 'error', message: 'Gagal memverifikasi data susu fresh.' });
    } finally {
      setSubmittingFresh(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Memuat Data Penerimaan Susu Segar..." />;
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm print:hidden">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 bg-[#1E3F20] text-white rounded-2xl shadow-md">
            <Milk className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-extrabold text-slate-800">Terima Susu Segar (Farm)</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-black rounded-full border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Pemisahan Susu Sapi & Susu Kambing</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Penerimaan & verifikasi penyerahan susu segar per komoditas ternak dengan rincian alokasi dan potongan BAST terpadu
            </p>
          </div>
        </div>

        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* KOMODITAS TERNAK SWITCHER (PEMISAHAN SUSU SAPI VS SUSU KAMBING)           */}
      {/* ========================================================================= */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap sm:flex-nowrap gap-2 print:hidden">
        <button
          onClick={() => setCommodityTab('SAPI')}
          className={`flex-1 flex items-center justify-between p-3.5 rounded-xl font-extrabold text-xs transition-all ${
            commodityTab === 'SAPI'
              ? 'bg-[#1E3F20] text-white shadow-md'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🐄</span>
            <div className="text-left">
              <span className="block text-sm font-black">Susu Sapi Segar</span>
              <span className={`text-[11px] font-semibold ${commodityTab === 'SAPI' ? 'text-emerald-200' : 'text-slate-500'}`}>
                Bovine Fresh Milk
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-base font-black ${commodityTab === 'SAPI' ? 'text-amber-300' : 'text-emerald-800'}`}>
              {totalSapiVolume.toLocaleString('id-ID')} Liter
            </span>
            {pendingSapiCount > 0 && (
              <span className="block text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white mt-0.5">
                {pendingSapiCount} Perlu Verifikasi
              </span>
            )}
          </div>
        </button>

        <button
          onClick={() => setCommodityTab('KAMBING')}
          className={`flex-1 flex items-center justify-between p-3.5 rounded-xl font-extrabold text-xs transition-all ${
            commodityTab === 'KAMBING'
              ? 'bg-amber-900 text-white shadow-md'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🐐</span>
            <div className="text-left">
              <span className="block text-sm font-black">Susu Kambing Segar</span>
              <span className={`text-[11px] font-semibold ${commodityTab === 'KAMBING' ? 'text-amber-200' : 'text-slate-500'}`}>
                Caprine Fresh Milk
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-base font-black ${commodityTab === 'KAMBING' ? 'text-amber-300' : 'text-amber-800'}`}>
              {totalKambingVolume.toLocaleString('id-ID')} Liter
            </span>
            {pendingKambingCount > 0 && (
              <span className="block text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white mt-0.5">
                {pendingKambingCount} Perlu Verifikasi
              </span>
            )}
          </div>
        </button>
      </div>

      {/* 4 Summary KPI Cards strictly for the active commodity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Gross Susu {commodityTab === 'KAMBING' ? 'Kambing' : 'Sapi'}
          </span>
          <h3 className="text-2xl font-black text-slate-800 mt-1">
            {totalDailyGross.toLocaleString('id-ID')} <span className="text-xs font-semibold text-slate-400">Liter</span>
          </h3>
          <p className="text-[11px] text-slate-500 font-semibold mt-1">
            Total perah {commodityTab === 'KAMBING' ? 'kambing' : 'sapi'} dari kandang
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-sm">
          <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
            Siap Olah {commodityTab === 'KAMBING' ? 'Kambing' : 'Sapi'} Awal
          </span>
          <h3 className="text-2xl font-black text-blue-950 mt-1">
            {totalDailySiapOlahAwal.toLocaleString('id-ID')} <span className="text-xs font-semibold text-blue-700">Liter</span>
          </h3>
          <p className="text-[11px] text-blue-600 font-semibold mt-1">
            Gross - {commodityTab === 'KAMBING' ? 'Cempe' : 'Pedet'} - Afkir - Dist
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Alokasi / Potongan BAST</span>
          <h3 className="text-2xl font-black text-amber-900 mt-1">
            {totalDailyBastPotongan.toLocaleString('id-ID')} <span className="text-xs font-semibold text-amber-700">Liter</span>
          </h3>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">
            {commodityTab === 'KAMBING' ? 'Pemakaian BAST khusus kambing' : 'Dipakai BAST Penjualan/Hibah/Riset'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Sisa Bersih Siap Olah</span>
          <h3 className="text-2xl font-black text-emerald-950 mt-1">
            {totalDailyBersihSiapOlah.toLocaleString('id-ID')} <span className="text-xs font-semibold text-emerald-700">Liter</span>
          </h3>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">Net siap diproses unit pengemasan</p>
        </div>
      </div>

      {/* Sub-Tabs: 1 Hari Jadi Satu vs Rincian Sesi */}
      <div className="flex items-center gap-2 border-b border-slate-200 print:hidden">
        <button
          onClick={() => setViewTab('daily')}
          className={`px-5 py-3 font-bold text-xs border-b-2 transition-all flex items-center gap-2 ${
            viewTab === 'daily'
              ? 'border-emerald-700 text-emerald-900 bg-emerald-50 rounded-t-2xl shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span>📅 Rekapan 1 Hari Jadi Satu ({filteredDailyList.length} Hari)</span>
        </button>

        <button
          onClick={() => setViewTab('sessions')}
          className={`px-5 py-3 font-bold text-xs border-b-2 transition-all flex items-center gap-2 ${
            viewTab === 'sessions'
              ? 'border-emerald-700 text-emerald-900 bg-emerald-50 rounded-t-2xl shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Sun className="w-4 h-4 text-amber-600" />
          <span>☀️ Rincian Sesi Pagi & Sore ({filteredSessions.length} Sesi)</span>
        </button>
      </div>

      {/* Control Bar: Time Pills, Dropdowns, Sort & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Time Filter Pills */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'ALL', label: 'Semua' },
              { id: 'TODAY', label: 'Hari Ini' },
              { id: '7DAYS', label: '7 Hari' },
              { id: 'MONTH', label: 'Bulan Ini' },
              { id: 'CUSTOM', label: 'Custom' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeFilter(t.id)}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                  timeFilter === t.id
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500 font-bold flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
              {commodityTab === 'KAMBING' ? '🐐 Susu Kambing' : '🐄 Susu Sapi'}
            </span>
            <span>Ditampilkan: {viewTab === 'daily' ? `${filteredDailyList.length} Hari` : `${filteredSessions.length} Sesi`}</span>
          </div>
        </div>

        {/* Second Row: Dropdowns */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            {viewTab === 'sessions' && (
              <select
                value={sessionFilter}
                onChange={(e) => setSessionFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="ALL">Semua Sesi</option>
                <option value="Pagi">☀️ Sesi Pagi</option>
                <option value="Sore">🌙 Sesi Sore</option>
              </select>
            )}

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="ALL">Semua Status</option>
              <option value="MENUNGGU_VERIFIKASI">Menunggu Verifikasi</option>
              <option value="DITERIMA">Diterima (Disetujui)</option>
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2" />
              <input
                type="text"
                placeholder="Cari tanggal / keterangan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 w-44 sm:w-56"
              />
            </div>

            <button
              onClick={fetchData}
              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
              title="Segarkan Data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Custom Date Range */}
          {timeFilter === 'CUSTOM' && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-600">Rentang:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
              <span className="text-xs text-slate-400">s/d</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: REKAPAN 1 HARI JADI SATU (DENGAN POTONGAN BAST & KETERANGAN)      */}
      {/* ========================================================================= */}
      {viewTab === 'daily' ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <span>{commodityTab === 'KAMBING' ? '🐐 Rekapitulasi Harian Susu Kambing' : '🐄 Rekapitulasi Harian Susu Sapi'}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {filteredDailyList.length} Hari
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Pagi & Sore digabung menjadi 1 hari, otomatis dipotong alokasi BAST dengan keterangan pemakaian
              </p>
            </div>
          </div>

          {filteredDailyList.length === 0 ? (
            <EmptyState
              title={`Tidak Ada Data Susu ${commodityTab === 'KAMBING' ? 'Kambing' : 'Sapi'}`}
              description="Tidak ditemukan data rekapan harian susu segar untuk filter ini."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-y border-slate-200 text-[11px]">
                  <tr>
                    <th className="px-3 py-3 text-center w-10">No</th>
                    <th className="px-3 py-3">Tanggal</th>
                    <th className="px-3 py-3 text-right">Gross Total (L)</th>
                    <th className="px-3 py-3 text-right text-slate-500">
                      Potongan Kandang ({commodityTab === 'KAMBING' ? 'Cempe' : 'Pedet'}/Afkir)
                    </th>
                    <th className="px-3 py-3 text-right font-black text-blue-900 bg-blue-50/50">Siap Olah Awal</th>
                    <th className="px-3 py-3 text-right font-bold text-amber-700 bg-amber-50/50">Potongan BAST (L)</th>
                    <th className="px-3 py-3">Keterangan Pemakaian BAST</th>
                    <th className="px-3 py-3 text-right font-black text-emerald-950 bg-emerald-100">Sisa Siap Olah (Net)</th>
                    <th className="px-3 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {filteredDailyList.map((day, idx) => (
                    <tr key={day.tanggal || idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                      <td className="px-3 py-3 font-bold text-slate-800">
                        {new Date(day.tanggal).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-3 py-3 text-right font-bold">{day.totalGross} L</td>
                      <td className="px-3 py-3 text-right text-slate-500">
                        {day.totalPedet + day.totalAfkir + day.totalDistribusi} L
                      </td>
                      <td className="px-3 py-3 text-right font-black text-blue-900 bg-blue-50/30">
                        {day.totalSusuSiapOlah} L
                      </td>
                      <td className="px-3 py-3 text-right font-bold text-amber-700 bg-amber-50/30">
                        {day.totalBastDeduction > 0 ? `-${day.totalBastDeduction} L` : '0 L'}
                      </td>
                      <td className="px-3 py-3">
                        {day.bastUsageDescriptions && day.bastUsageDescriptions.length > 0 ? (
                          <div className="space-y-1">
                            {day.bastUsageDescriptions.map((desc, i) => (
                              <div
                                key={i}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200"
                              >
                                <Info className="w-3 h-3 text-amber-700 flex-shrink-0" />
                                <span>{desc}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Diserahkan penuh ke unit pengolahan</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right font-black text-emerald-950 bg-emerald-50 text-sm">
                        {day.sisaBersihSiapOlah} Liter
                      </td>
                      <td className="px-3 py-3 text-center">
                        {day.status === 'MENUNGGU_VERIFIKASI' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                            <AlertCircle className="w-3 h-3" />
                            Menunggu
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            Diterima
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>

                {/* Footer Akumulasi */}
                <tfoot className="bg-amber-100/80 font-black text-slate-900 border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={2} className="px-3 py-2.5 text-center bg-amber-200">
                      TOTAL AKUMULASI SUSU {commodityTab === 'KAMBING' ? 'KAMBING' : 'SAPI'} ({filteredDailyList.length} Hari)
                    </td>
                    <td className="px-3 py-2 text-right">{totalDailyGross.toLocaleString('id-ID')} L</td>
                    <td className="px-3 py-2 text-right text-slate-600">
                      {(totalDailyGross - totalDailySiapOlahAwal).toLocaleString('id-ID')} L
                    </td>
                    <td className="px-3 py-2 text-right text-blue-950 font-black bg-blue-100">
                      {totalDailySiapOlahAwal.toLocaleString('id-ID')} L
                    </td>
                    <td className="px-3 py-2 text-right text-amber-900 font-black bg-amber-200">
                      -{totalDailyBastPotongan.toLocaleString('id-ID')} L
                    </td>
                    <td className="px-3 py-2 text-xs font-bold text-amber-900">
                      Total Potongan Pemakaian BAST Fisik
                    </td>
                    <td className="px-3 py-2 text-right font-black bg-emerald-200 text-emerald-950 text-sm">
                      {totalDailyBersihSiapOlah.toLocaleString('id-ID')} Liter
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* VIEW 2: RINCIAN SESI PERAH (PAGI & SORE)                                  */
        /* ========================================================================= */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-slate-800 text-base">
              Daftar Sesi Perah Susu {commodityTab === 'KAMBING' ? 'Kambing' : 'Sapi'} (Pagi & Sore)
            </h2>
            <span className="text-xs font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded-full">
              {filteredSessions.length} Sesi
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-y border-slate-200 text-[11px]">
                <tr>
                  <th className="px-4 py-3 text-center w-12">No</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3 text-center">Sesi</th>
                  <th className="px-4 py-3 text-center">Ternak</th>
                  <th className="px-4 py-3 text-right">Gross (L)</th>
                  <th className="px-4 py-3 text-right text-slate-500">{commodityTab === 'KAMBING' ? 'Cempe (L)' : 'Pedet (L)'}</th>
                  <th className="px-4 py-3 text-right text-rose-600">Afkir (L)</th>
                  <th className="px-4 py-3 text-right text-amber-700">Distribusi (L)</th>
                  <th className="px-4 py-3 text-right font-black text-emerald-950 bg-emerald-50">Susu Siap Olah</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredSessions.map((r, idx) => (
                  <tr key={r.id || idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      {new Date(r.tanggal).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        r.kegiatanPerah === 'Pagi' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {r.kegiatanPerah === 'Pagi' ? '☀️ Pagi' : '🌙 Sore'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        r.jenisTernak === 'KAMBING' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {r.jenisTernak === 'KAMBING' ? '🐐 Susu Kambing' : '🐄 Susu Sapi'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold">{r.produksiSusu} L</td>
                    <td className="px-4 py-3 text-right text-slate-500">{r.susuPedet} L</td>
                    <td className="px-4 py-3 text-right text-rose-600 font-semibold">{r.susuAfkir} L</td>
                    <td className="px-4 py-3 text-right text-amber-700 font-semibold">{r.distribusiSegar} L</td>
                    <td className="px-4 py-3 text-right font-black text-emerald-950 bg-emerald-50/70">
                      {r.susuSiapOlah} Liter
                    </td>
                    <td className="px-4 py-3 text-center">
                      {r.status === 'MENUNGGU_VERIFIKASI' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          <AlertCircle className="w-3 h-3" />
                          Menunggu
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Diterima
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {r.status === 'MENUNGGU_VERIFIKASI' ? (
                        <button
                          onClick={() => handleOpenFreshConfirm(r)}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm"
                        >
                          Verifikasi
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[10px]">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Verification Modal for Fresh Milk */}
      {showFreshConfirmModal && selectedFresh && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-emerald-700">
              <CheckCircle2 className="w-6 h-6" />
              <h3 className="text-base font-black text-slate-800">
                Verifikasi Susu {selectedFresh.jenisTernak === 'KAMBING' ? 'Kambing' : 'Sapi'} Segar
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Konfirmasi data perah <strong>{selectedFresh.kegiatanPerah} ({selectedFresh.jenisTernak === 'KAMBING' ? '🐐 Kambing' : '🐄 Sapi'})</strong> tanggal{' '}
              <strong>{new Date(selectedFresh.tanggal).toLocaleDateString('id-ID')}</strong> sejumlah{' '}
              <strong>{selectedFresh.susuSiapOlah} Liter</strong> susu siap olah.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Verifikasi:</label>
              <textarea
                value={freshNotes}
                onChange={(e) => setFreshNotes(e.target.value)}
                placeholder="Catatan kondisi suhu/kualitas susu..."
                rows={2}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowFreshConfirmModal(false);
                  setSelectedFresh(null);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmFresh}
                disabled={submittingFresh}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow"
              >
                {submittingFresh ? 'Memproses...' : 'Sahkan Penerimaan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
