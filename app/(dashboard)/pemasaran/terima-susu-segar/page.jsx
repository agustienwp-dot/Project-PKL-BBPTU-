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
  Info,
  Check,
  Clock
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
  
  const totalSapiVolume = useMemo(() => sapiDailyList.reduce((acc, d) => acc + Math.max(0, (d.totalGross || 0) - (d.totalPedet || 0) - (d.totalAfkir || 0)), 0), [sapiDailyList]);
  const totalKambingVolume = useMemo(() => kambingDailyList.reduce((acc, d) => acc + Math.max(0, (d.totalGross || 0) - (d.totalPedet || 0) - (d.totalAfkir || 0)), 0), [kambingDailyList]);

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
  const totalDailyGross = useMemo(() => filteredDailyList.reduce((acc, d) => acc + (d.totalGross || 0), 0), [filteredDailyList]);
  const totalDailyPedet = useMemo(() => filteredDailyList.reduce((acc, d) => acc + (d.totalPedet || 0), 0), [filteredDailyList]);
  const totalDailyAfkir = useMemo(() => filteredDailyList.reduce((acc, d) => acc + (d.totalAfkir || 0), 0), [filteredDailyList]);
  const totalDailyBersihSiapOlah = useMemo(() => Math.max(0, totalDailyGross - totalDailyPedet - totalDailyAfkir), [totalDailyGross, totalDailyPedet, totalDailyAfkir]);
  const totalDailyKeluar = useMemo(() => totalDailyPedet + totalDailyAfkir + totalDailyBersihSiapOlah, [totalDailyPedet, totalDailyAfkir, totalDailyBersihSiapOlah]);
  const totalDailySelisih = useMemo(() => totalDailyGross - totalDailyKeluar, [totalDailyGross, totalDailyKeluar]);

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
    <div className="space-y-6 w-full pb-10">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header: Title on Left, Commodity Tabs on Right (Sejajar) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
            TERIMA SUSU SEGAR (FARM)
          </h1>
        </div>

        {/* ========================================================================= */}
        {/* KOMODITAS TERNAK SWITCHER (KOMPAK, RAMPING, SEJAJAR KANAN)                */}
        {/* ========================================================================= */}
        <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/90 gap-1 print:hidden self-start md:self-auto">
          <button
            type="button"
            onClick={() => setCommodityTab('SAPI')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
              commodityTab === 'SAPI'
                ? 'bg-[#14532D] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <span>Susu Sapi Segar</span>
            {pendingSapiCount > 0 && (
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500 text-white">
                {pendingSapiCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setCommodityTab('KAMBING')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
              commodityTab === 'KAMBING'
                ? 'bg-[#14532D] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <span>Susu Kambing Segar</span>
            {pendingKambingCount > 0 && (
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500 text-white">
                {pendingKambingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 3 Summary KPI Cards strictly for the active commodity */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Susu Segar Masuk */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-300 shadow-2xs space-y-3 hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider">
              1. Susu Segar Masuk
            </span>
            <div className="p-2.5 bg-[#14532D] text-white rounded-2xl shadow-2xs">
              <Milk className="w-4 h-4 text-emerald-300" />
            </div>
          </div>
          <div className="space-y-0.5">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
              {totalDailyGross.toLocaleString('id-ID')}{' '}
              <span className="text-xs font-bold text-slate-900 font-sans">Liter</span>
            </h3>
            <p className="text-[11px] text-slate-700 font-bold">
              Total perah kandang ({commodityTab === 'KAMBING' ? 'Kambing' : 'Sapi'})
            </p>
          </div>
        </div>

        {/* Card 2: Potongan Farm */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-300 shadow-2xs space-y-3 hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider">
              2. Potongan Farm
            </span>
            <div className="p-2.5 bg-[#14532D] text-white rounded-2xl shadow-2xs">
              <TrendingDown className="w-4 h-4 text-emerald-300" />
            </div>
          </div>
          <div className="space-y-0.5">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
              {(totalDailyPedet + totalDailyAfkir).toLocaleString('id-ID')}{' '}
              <span className="text-xs font-bold text-slate-900 font-sans">Liter</span>
            </h3>
            <p className="text-[11px] text-rose-600 font-bold">
              {totalDailyPedet} L {commodityTab === 'KAMBING' ? 'Cempe' : 'Pedet'} • {totalDailyAfkir} L Afkir
            </p>
          </div>
        </div>

        {/* Card 3: Diterima Pemasaran (Net) */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-300 shadow-2xs space-y-3 hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider">
              3. Diterima Pemasaran
            </span>
            <div className="p-2.5 bg-[#14532D] text-white rounded-2xl shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            </div>
          </div>
          <div className="space-y-0.5">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
              {totalDailyBersihSiapOlah.toLocaleString('id-ID')}{' '}
              <span className="text-xs font-bold text-slate-900 font-sans">Liter</span>
            </h3>
            <p className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline stroke-[2.5]" />
              <span>Susu siap olah (100% Pas)</span>
            </p>
          </div>
        </div>
      </div>

      {/* Control Bar: Filter Dropdowns, Search & Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* 1. Dropdown Periode Waktu */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-2xl px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-white transition-all">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 text-[11px] font-semibold">Periode:</span>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-800 pr-1"
              >
                <option value="ALL">Semua Periode</option>
                <option value="TODAY">Hari Ini</option>
                <option value="7DAYS">7 Hari Terakhir</option>
                <option value="MONTH">Bulan Ini</option>
                <option value="CUSTOM">Rentang Kustom</option>
              </select>
            </div>

            {/* 2. Dropdown Status */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-2xl px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-white transition-all">
              <span className="text-slate-400 text-[11px] font-semibold">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-800 pr-1"
              >
                <option value="ALL">Semua Status</option>
                <option value="DITERIMA">Selesai / Diterima</option>
                <option value="MENUNGGU_VERIFIKASI">Menunggu Verifikasi</option>
              </select>
            </div>

            {/* 3. Dropdown Sesi (Hanya Muncul di View Sesi) */}
            {viewTab === 'sessions' && (
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-2xl px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-white transition-all">
                <span className="text-slate-400 text-[11px] font-semibold">Sesi:</span>
                <select
                  value={sessionFilter}
                  onChange={(e) => setSessionFilter(e.target.value)}
                  className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-800 pr-1"
                >
                  <option value="ALL">Semua Sesi</option>
                  <option value="Pagi">Sesi Pagi</option>
                  <option value="Sore">Sesi Sore</option>
                </select>
              </div>
            )}

            {/* 4. Search Input Bar */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari tanggal / keterangan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 w-44 sm:w-60 shadow-2xs"
              />
            </div>
          </div>

          {/* Sub-Tabs Navigasi: Rata Kanan pada Filter Bar */}
          <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/90 gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setViewTab('daily')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                viewTab === 'daily'
                  ? 'bg-[#14532D] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Calendar className={`w-3.5 h-3.5 ${viewTab === 'daily' ? 'text-emerald-300' : 'text-slate-400'}`} />
              <span>Data Susu Segar</span>
            </button>

            <button
              type="button"
              onClick={() => setViewTab('sessions')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                viewTab === 'sessions'
                  ? 'bg-[#14532D] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <span>Rincian Sesi Pagi & Sore</span>
            </button>
          </div>
        </div>

        {/* Custom Date Range Picker */}
        {timeFilter === 'CUSTOM' && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-600">Rentang Tanggal:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
            />
            <span className="text-xs text-slate-400 font-bold">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
            />
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: REKAPAN 1 HARI JADI SATU (DENGAN POTONGAN BAST & KETERANGAN)      */}
      {/* ========================================================================= */}
      {viewTab === 'daily' ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-slate-800 text-base">
              {commodityTab === 'KAMBING' ? 'Data Susu Segar (Kambing)' : 'Data Susu Segar (Sapi)'}
            </h2>
          </div>

          {filteredDailyList.length === 0 ? (
            <EmptyState
              title={`Tidak Ada Data Susu ${commodityTab === 'KAMBING' ? 'Kambing' : 'Sapi'}`}
              description="Tidak ditemukan data rekapan harian susu segar untuk filter ini."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#1E3F20] text-white uppercase font-bold border-b border-[#2d5e31] text-[11px] select-none" style={{ backgroundColor: '#1E3F20' }}>
                  <tr>
                    <th className="px-3 py-3.5 text-center w-10 text-white font-bold">No</th>
                    <th className="px-3 py-3.5 whitespace-nowrap text-white font-bold">Tanggal</th>
                    <th className="px-3 py-3.5 text-right font-black text-white whitespace-nowrap">Susu Segar Masuk</th>
                    <th className="px-3 py-3.5 text-right text-white font-bold whitespace-nowrap">
                      {commodityTab === 'KAMBING' ? 'Cempe' : 'Pedet'} (L)
                    </th>
                    <th className="px-3 py-3.5 text-right font-bold text-white whitespace-nowrap">Susu Afkir (L)</th>
                    <th className="px-3 py-3.5 text-right font-black text-white whitespace-nowrap">Diterima Pemasaran</th>
                    <th className="px-3 py-3.5 text-center font-bold text-white whitespace-nowrap">Rekonsiliasi</th>
                    <th className="px-3 py-3.5 text-center text-white font-bold whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {filteredDailyList.map((day, idx) => {
                    const netSiapOlah = Math.max(0, (day.totalGross || 0) - (day.totalPedet || 0) - (day.totalAfkir || 0));

                    return (
                      <tr key={day.tanggal || idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-3.5 text-center text-slate-400 font-bold">{idx + 1}</td>
                        <td className="px-3 py-3.5 font-bold text-slate-800 whitespace-nowrap">
                          {new Date(day.tanggal).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-3 py-3.5 text-right font-bold font-mono text-slate-900">{day.totalGross} L</td>
                        <td className="px-3 py-3.5 text-right font-mono font-bold text-slate-900">
                          {day.totalPedet} L
                        </td>
                        <td className="px-3 py-3.5 text-right font-mono text-slate-900 font-bold">
                          {day.totalAfkir} L
                        </td>
                        <td className="px-3 py-3.5 text-right font-black font-mono text-slate-900 text-sm">
                          {netSiapOlah.toLocaleString('id-ID')} Liter
                        </td>
                        <td className="px-3 py-3.5 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800">
                            <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                              <Check className="w-2.5 h-2.5 text-emerald-700 stroke-[3]" />
                            </span>
                            <span>Pas (0 L)</span>
                          </span>
                        </td>
                        <td className="px-3 py-3.5 text-center whitespace-nowrap">
                          {day.status === 'MENUNGGU_VERIFIKASI' ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800">
                              <span className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                <Clock className="w-2.5 h-2.5 text-amber-700 stroke-[2.5]" />
                              </span>
                              <span>Menunggu</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800">
                              <span className="w-4 h-4 rounded-full bg-emerald-700 flex items-center justify-center shrink-0">
                                <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />
                              </span>
                              <span>Diterima</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                {/* Footer Akumulasi */}
                <tfoot className="bg-slate-50 font-black text-slate-900 border-t-2 border-slate-200">
                  <tr>
                    <td colSpan={2} className="px-3 py-3 text-center bg-slate-100 text-xs uppercase tracking-wider font-black text-slate-800">
                      TOTAL AKUMULASI ({filteredDailyList.length} HARI)
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-black text-slate-900">{totalDailyGross.toLocaleString('id-ID')} L</td>
                    <td className="px-3 py-3 text-right font-mono text-slate-900 font-bold">
                      {totalDailyPedet.toLocaleString('id-ID')} L
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-slate-900 font-bold">
                      {totalDailyAfkir.toLocaleString('id-ID')} L
                    </td>
                    <td className="px-3 py-3 text-right font-black font-mono text-slate-900 text-sm">
                      {totalDailyBersihSiapOlah.toLocaleString('id-ID')} Liter
                    </td>
                    <td className="px-3 py-3 text-center text-slate-800 text-[11px] font-bold">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 text-emerald-700 stroke-[3]" />
                        </span>
                        <span>Pas (0 L)</span>
                      </span>
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
          <div>
            <h2 className="font-extrabold text-slate-800 text-base">
              Daftar Sesi Perah Susu {commodityTab === 'KAMBING' ? 'Kambing' : 'Sapi'} (Pagi & Sore)
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#1E3F20] text-white uppercase font-bold border-b border-[#2d5e31] text-[11px] select-none" style={{ backgroundColor: '#1E3F20' }}>
                <tr>
                  <th className="px-4 py-3.5 text-center w-12 text-white font-bold">No</th>
                  <th className="px-4 py-3.5 whitespace-nowrap text-white font-bold">Tanggal</th>
                  <th className="px-4 py-3.5 text-center whitespace-nowrap text-white font-bold">Sesi</th>
                  <th className="px-4 py-3.5 text-center whitespace-nowrap text-white font-bold">Ternak</th>
                  <th className="px-4 py-3.5 text-right font-black text-white whitespace-nowrap">Susu Segar Masuk (L)</th>
                  <th className="px-4 py-3.5 text-right text-white font-bold whitespace-nowrap">{commodityTab === 'KAMBING' ? 'Cempe (L)' : 'Pedet (L)'}</th>
                  <th className="px-4 py-3.5 text-right font-bold text-white whitespace-nowrap">Afkir (L)</th>
                  <th className="px-4 py-3.5 text-right font-black text-white whitespace-nowrap">Susu Siap Olah</th>
                  <th className="px-4 py-3.5 text-center text-white font-bold whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredSessions.map((r, idx) => (
                  <tr key={r.id || idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 text-center text-slate-400 font-bold">{idx + 1}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-800 whitespace-nowrap">
                      {new Date(r.tanggal).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap font-bold text-slate-800">
                      {r.kegiatanPerah === 'Pagi' ? 'Pagi' : 'Sore'}
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap font-bold text-slate-800">
                      {r.jenisTernak === 'KAMBING' ? 'Susu Kambing' : 'Susu Sapi'}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">{r.produksiSusu} L</td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">{r.susuPedet} L</td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-900 font-bold">{r.susuAfkir} L</td>
                    <td className="px-4 py-3.5 text-right font-mono font-black text-slate-900 text-sm">
                      {r.susuSiapOlah} Liter
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      {r.status === 'MENUNGGU_VERIFIKASI' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <span className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                            <Clock className="w-2.5 h-2.5 text-amber-700 stroke-[2.5]" />
                          </span>
                          <span>Menunggu</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <span className="w-4 h-4 rounded-full bg-emerald-700 flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />
                          </span>
                          <span>Diterima</span>
                        </span>
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
              Konfirmasi data perah <strong>{selectedFresh.kegiatanPerah} ({selectedFresh.jenisTernak === 'KAMBING' ? 'Kambing' : 'Sapi'})</strong> tanggal{' '}
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
