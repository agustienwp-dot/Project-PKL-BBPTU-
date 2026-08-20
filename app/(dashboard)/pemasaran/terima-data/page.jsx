'use client';

import React, { useState, useEffect, useMemo } from 'react';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import EmptyState from '@/components/EmptyState';
import {
  PackageCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  Check,
  Milk,
  Layers,
  Search,
  Filter,
  Calendar,
  Sparkles,
  Info,
  Clock,
  RotateCcw,
  CheckCheck
} from 'lucide-react';

export default function TerimaProdukOlahanPage() {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [packagings, setPackagings] = useState([]);

  // Product Category Tab: 'susu_rasa' | 'susu_original' | 'yogurt' | 'keju'
  const [activeTab, setActiveTab] = useState('susu_rasa');

  // Sub Packaging Filter: 'ALL' or specific size
  const [selectedSizeFilter, setSelectedSizeFilter] = useState('ALL');

  // Time & Status Filters
  const [timeFilter, setTimeFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('asc'); // Default 1 - 31
  const [searchTerm, setSearchTerm] = useState('');

  // Confirmation Modal
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [showConfirmPkgModal, setShowConfirmPkgModal] = useState(false);
  const [pkgNotes, setPkgNotes] = useState('');
  const [submittingPkg, setSubmittingPkg] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/packaged-products?sortOrder=asc');
      if (res.data?.success) {
        setPackagings(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching packaged products:', err);
      setToast({ type: 'error', message: 'Gagal memuat data produk olahan UHT.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 1. Groupings for Products: Separated Rasa vs Original vs Yogurt vs Keju
  const susuRasaItems = useMemo(() => {
    return packagings.filter((p) => {
      const name = (p.jenisProduk || '').toLowerCase();
      return name.includes('rasa') || (name.includes('susu') && !name.includes('original') && !name.includes('yogurt') && !name.includes('keju'));
    });
  }, [packagings]);

  const susuOriginalItems = useMemo(() => {
    return packagings.filter((p) => {
      const name = (p.jenisProduk || '').toLowerCase();
      return name.includes('original') || name.includes('plain');
    });
  }, [packagings]);

  const yogurtItems = useMemo(() => {
    return packagings.filter((p) => (p.jenisProduk || '').toLowerCase().includes('yogurt'));
  }, [packagings]);

  const kejuItems = useMemo(() => {
    return packagings.filter((p) => (p.jenisProduk || '').toLowerCase().includes('keju'));
  }, [packagings]);

  // Counts for Tabs
  const pendingRasaCount = susuRasaItems.filter((p) => p.status === 'MENUNGGU_PENERIMAAN').length;
  const pendingOriCount = susuOriginalItems.filter((p) => p.status === 'MENUNGGU_PENERIMAAN').length;
  const pendingYogurtCount = yogurtItems.filter((p) => p.status === 'MENUNGGU_PENERIMAAN').length;
  const pendingKejuCount = kejuItems.filter((p) => p.status === 'MENUNGGU_PENERIMAAN').length;

  // Active dataset according to activeTab
  const rawActiveItems = useMemo(() => {
    if (activeTab === 'susu_rasa') return susuRasaItems;
    if (activeTab === 'susu_original') return susuOriginalItems;
    if (activeTab === 'yogurt') return yogurtItems;
    return kejuItems;
  }, [activeTab, susuRasaItems, susuOriginalItems, yogurtItems, kejuItems]);

  // Helper to extract numeric volume for sorting from smallest to largest
  const getSizeVolume = (sizeStr = '') => {
    const match = sizeStr.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 9999;
  };

  // Unique sizes in current tab sorted from smallest to largest (115ml -> 130ml -> 200ml -> 250ml)
  const availableSizes = useMemo(() => {
    const set = new Set();
    rawActiveItems.forEach((p) => {
      if (p.kemasan) set.add(p.kemasan);
    });
    return Array.from(set).sort((a, b) => getSizeVolume(a) - getSizeVolume(b));
  }, [rawActiveItems]);

  // Filter Active Items with time, search, status, and size
  const filteredActiveItems = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const d7 = new Date();
    d7.setDate(d7.getDate() - 7);
    const d7Str = d7.toISOString().slice(0, 10);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

    return rawActiveItems
      .filter((p) => {
        const dStr = new Date(p.tanggal || p.date).toISOString().slice(0, 10);

        let matchTime = true;
        if (timeFilter === 'TODAY') matchTime = dStr === today;
        else if (timeFilter === '7DAYS') matchTime = dStr >= d7Str;
        else if (timeFilter === 'MONTH') matchTime = dStr >= monthStart && dStr <= monthEnd;
        else if (timeFilter === 'CUSTOM') {
          if (startDate && dStr < startDate) matchTime = false;
          if (endDate && dStr > endDate) matchTime = false;
        }

        const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
        const matchSize = selectedSizeFilter === 'ALL' || p.kemasan === selectedSizeFilter;
        const matchSearch =
          !searchTerm ||
          p.jenisProduk?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.kemasan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dStr.includes(searchTerm);

        return matchTime && matchStatus && matchSize && matchSearch;
      })
      .sort((a, b) => {
        return new Date(a.tanggal || a.date) - new Date(b.tanggal || b.date);
      });
  }, [rawActiveItems, timeFilter, startDate, endDate, statusFilter, selectedSizeFilter, searchTerm]);

  // Group filtered items by Packaging Size for separate distinct tables (sorted smallest to largest)
  const groupedByPackaging = useMemo(() => {
    const groups = {};
    filteredActiveItems.forEach((item) => {
      const sizeKey = item.kemasan || 'Lainnya';
      if (!groups[sizeKey]) groups[sizeKey] = [];
      groups[sizeKey].push(item);
    });

    const sortedEntries = Object.entries(groups).sort(([sizeA], [sizeB]) => {
      return getSizeVolume(sizeA) - getSizeVolume(sizeB);
    });

    return Object.fromEntries(sortedEntries);
  }, [filteredActiveItems]);

  // Tab Summary Metrics
  const tabTotalQty = useMemo(() => {
    return filteredActiveItems.reduce((acc, p) => acc + (p.jumlah || p.totalPackagedQty || 0), 0);
  }, [filteredActiveItems]);

  const tabPendingCount = useMemo(() => {
    return filteredActiveItems.filter((p) => p.status === 'MENUNGGU_PENERIMAAN').length;
  }, [filteredActiveItems]);

  const handleOpenConfirmPkgModal = (pkg) => {
    setSelectedPkg(pkg);
    setPkgNotes(pkg.notes || 'Batch produk olahan telah diterima dan sesuai standar.');
    setShowConfirmPkgModal(true);
  };

  const handleConfirmPkg = async () => {
    if (!selectedPkg) return;
    setSubmittingPkg(true);
    try {
      const res = await api.post(`/packaged-products/${selectedPkg.id}/confirm`, {
        notes: pkgNotes,
      });

      if (res.data?.success) {
        setToast({
          type: 'success',
          message: `Berhasil mengonfirmasi penerimaan ${selectedPkg.jenisProduk} (${selectedPkg.kemasan}) ke persediaan siap jual!`,
        });
        setShowConfirmPkgModal(false);
        setPkgNotes('');
        setSelectedPkg(null);
        fetchData();
      }
    } catch (err) {
      console.error('Error confirming Packaged Product:', err);
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Gagal mengonfirmasi produk olahan.',
      });
    } finally {
      setSubmittingPkg(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Memuat Data Produk Olahan UHT..." />;
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
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-extrabold text-slate-800">UHT (Produk Olahan & Pengemasan)</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-black rounded-full border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Tabel Terpisah per Ukuran Kemasan</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Penerimaan & konfirmasi produk olahan <strong>Susu Rasa</strong>, <strong>Susu Original</strong>, <strong>Yogurt</strong>, dan <strong>Keju</strong> dengan tabel terpisah per ukuran kemasan.
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

      {/* 3 Metric Cards for Current Tab */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Unit Produk (Filter Aktif)
          </span>
          <h3 className="text-2xl font-black text-slate-800 mt-1">
            {tabTotalQty.toLocaleString('id-ID')}{' '}
            <span className="text-xs font-semibold text-slate-400">Botol/Cup</span>
          </h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            {filteredActiveItems.length} Batch terdaftar pada kategori ini
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Menunggu Konfirmasi</span>
          <h3 className="text-2xl font-black text-amber-900 mt-1">
            {tabPendingCount}{' '}
            <span className="text-xs font-semibold text-amber-700">Batch Produk</span>
          </h3>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">Perlu diverifikasi bagian pemasaran</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Sudah Diterima (Siap Jual)</span>
          <h3 className="text-2xl font-black text-emerald-950 mt-1">
            {(tabTotalQty - filteredActiveItems.filter((p) => p.status === 'MENUNGGU_PENERIMAAN').reduce((acc, p) => acc + (p.jumlah || p.totalPackagedQty || 0), 0)).toLocaleString('id-ID')}{' '}
            <span className="text-xs font-semibold text-emerald-700">Botol/Cup</span>
          </h3>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">Tersedia dalam persediaan pemasaran</p>
        </div>
      </div>

      {/* Main 4 Categories Switcher Tabs */}
      <div className="bg-slate-100 p-1.5 rounded-2xl flex flex-wrap items-center gap-1">
        <button
          onClick={() => {
            setActiveTab('susu_rasa');
            setSelectedSizeFilter('ALL');
          }}
          className={`flex-1 min-w-[200px] py-3 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
            activeTab === 'susu_rasa'
              ? 'bg-white text-emerald-900 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Milk className="w-4 h-4 text-emerald-600" />
          <span>🍼 Susu Pasteurisasi Rasa</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
            {susuRasaItems.length} Batch {pendingRasaCount > 0 && `(${pendingRasaCount} Baru)`}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('susu_original');
            setSelectedSizeFilter('ALL');
          }}
          className={`flex-1 min-w-[200px] py-3 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
            activeTab === 'susu_original'
              ? 'bg-white text-blue-900 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Milk className="w-4 h-4 text-blue-600" />
          <span>🥛 Susu Pasteurisasi Original</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800 font-bold">
            {susuOriginalItems.length} Batch {pendingOriCount > 0 && `(${pendingOriCount} Baru)`}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('yogurt');
            setSelectedSizeFilter('ALL');
          }}
          className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
            activeTab === 'yogurt'
              ? 'bg-white text-purple-900 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-purple-600" />
          <span>🍨 Yogurt</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800 font-bold">
            {yogurtItems.length} Batch {pendingYogurtCount > 0 && `(${pendingYogurtCount} Baru)`}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('keju');
            setSelectedSizeFilter('ALL');
          }}
          className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
            activeTab === 'keju'
              ? 'bg-white text-amber-900 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-amber-600" />
          <span>🧀 Keju</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
            {kejuItems.length} Batch {pendingKejuCount > 0 && `(${pendingKejuCount} Baru)`}
          </span>
        </button>
      </div>

      {/* Control Bar: Packaging Size Pills, Time Pills, Sort & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 print:hidden">
        {/* Row 1: Packaging Size Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <span className="text-[11px] font-bold text-slate-500 px-2">Ukuran Kemasan:</span>
            <button
              onClick={() => setSelectedSizeFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                selectedSizeFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Kemasan ({availableSizes.length} Tabel)
            </button>
            {availableSizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSizeFilter(size)}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                  selectedSizeFilter === size
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🏷️ {size}
              </button>
            ))}
          </div>

          {/* Time Pills */}
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
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                  timeFilter === t.id
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Status, Sort, Search, Date Range */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="ALL">Semua Status Batch</option>
              <option value="MENUNGGU_PENERIMAAN">⏳ Menunggu Penerimaan</option>
              <option value="DITERIMA">✓ Sudah Diterima</option>
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2" />
              <input
                type="text"
                placeholder="Cari Batch / Kemasan / Tanggal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 w-44 sm:w-60"
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

          {/* Custom Date Range Picker */}
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
      {/* SEPARATED DISTINCT TABLES FOR EACH PACKAGING SIZE                         */}
      {/* ========================================================================= */}
      {Object.keys(groupedByPackaging).length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center">
          <EmptyState
            title="Tidak Ada Data Produk Olahan"
            description="Tidak ditemukan batch produk olahan untuk kategori dan filter yang dipilih."
          />
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByPackaging).map(([sizeName, items]) => {
            const groupTotalQty = items.reduce((acc, p) => acc + (p.jumlah || p.totalPackagedQty || 0), 0);
            const groupPendingCount = items.filter((p) => p.status === 'MENUNGGU_PENERIMAAN').length;

            return (
              <div
                key={sizeName}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4"
              >
                {/* Table Header Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl ${
                      activeTab === 'susu_rasa'
                        ? 'bg-emerald-100 text-emerald-800'
                        : activeTab === 'susu_original'
                        ? 'bg-blue-100 text-blue-800'
                        : activeTab === 'yogurt'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      <PackageCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
                        <span>Tabel Kemasan: {sizeName}</span>
                        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                          activeTab === 'susu_rasa'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : activeTab === 'susu_original'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : activeTab === 'yogurt'
                            ? 'bg-purple-50 text-purple-800 border border-purple-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {activeTab === 'susu_rasa'
                            ? 'Susu Pasteurisasi Rasa'
                            : activeTab === 'susu_original'
                            ? 'Susu Pasteurisasi Original'
                            : activeTab === 'yogurt'
                            ? 'Yogurt'
                            : 'Keju'}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        {items.length} Batch terdaftar • Total: <strong>{groupTotalQty.toLocaleString('id-ID')} Botol/Cup</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {groupPendingCount > 0 ? (
                      <span className="px-3 py-1 text-xs font-bold bg-amber-100 text-amber-800 rounded-full border border-amber-300">
                        ⏳ {groupPendingCount} Batch Menunggu Konfirmasi
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
                        ✓ Semua Batch Diterima
                      </span>
                    )}
                  </div>
                </div>

                {/* Table for this specific packaging size */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-y border-slate-200 text-[11px]">
                      <tr>
                        <th className="px-4 py-3 text-center w-12">No</th>
                        <th className="px-4 py-3">Tanggal Produksi</th>
                        <th className="px-4 py-3">Jenis Produk</th>
                        <th className="px-4 py-3">Ukuran Kemasan</th>
                        <th className="px-4 py-3 text-right">Jumlah Masuk</th>
                        <th className="px-4 py-3">Catatan Batch Pengolahan</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-center">Aksi Konfirmasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {items.map((pkg, idx) => {
                        const isPending = pkg.status === 'MENUNGGU_PENERIMAAN';
                        return (
                          <tr key={pkg.id || idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3.5 text-center text-slate-400 font-bold">{idx + 1}</td>
                            <td className="px-4 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                              {new Date(pkg.tanggal || pkg.date).toLocaleDateString('id-ID', {
                                weekday: 'short',
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="px-4 py-3.5">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                                activeTab === 'susu_rasa'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : activeTab === 'susu_original'
                                  ? 'bg-blue-100 text-blue-800'
                                  : activeTab === 'yogurt'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {pkg.jenisProduk}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 font-semibold text-slate-700">{pkg.kemasan}</td>
                            <td className="px-4 py-3.5 text-right font-black text-slate-900 text-sm whitespace-nowrap">
                              {(pkg.jumlah || pkg.totalPackagedQty || 0).toLocaleString('id-ID')}{' '}
                              <span className="text-[10px] font-medium text-slate-500">
                                {sizeName.toLowerCase().includes('cup') ? 'Cup' : 'Botol'}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-slate-500 max-w-xs">
                              <span className="text-xs">{pkg.notes || `Batch kemasan ${pkg.kemasan} siap masuk stok.`}</span>
                              {pkg.receivedByName && (
                                <span className="block text-[10px] text-slate-400 mt-0.5">
                                  Diterima oleh: {pkg.receivedByName}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-center whitespace-nowrap">
                              {isPending ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200">
                                  <AlertCircle className="w-3 h-3 text-amber-600" />
                                  <span>Menunggu Penerimaan</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Diterima & Siap Jual</span>
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-center whitespace-nowrap">
                              {isPending ? (
                                <button
                                  onClick={() => handleOpenConfirmPkgModal(pkg)}
                                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-xl text-[11px] font-extrabold shadow-sm transition-transform active:scale-95 flex items-center gap-1 mx-auto"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Konfirmasi Terima</span>
                                </button>
                              ) : (
                                <span className="text-[11px] font-bold text-slate-400 italic">
                                  Sudah Masuk Stok
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>

                    {/* Table Footer Total for this Packaging Size */}
                    <tfoot className="bg-amber-100/90 text-slate-900 font-black border-t-2 border-slate-300">
                      <tr>
                        <td colSpan={4} className="px-4 py-2.5 text-center bg-amber-200">
                          TOTAL KEMASAN {sizeName.toUpperCase()} ({items.length} Hari Produksi)
                        </td>
                        <td className="px-4 py-2.5 text-right font-black text-slate-950 text-sm">
                          {groupTotalQty.toLocaleString('id-ID')}{' '}
                          <span className="text-xs font-semibold text-slate-600">
                            {sizeName.toLowerCase().includes('cup') ? 'Cup' : 'Botol'}
                          </span>
                        </td>
                        <td colSpan={3} className="px-4 py-2.5 text-xs text-slate-600 font-semibold">
                          {groupTotalQty - groupPendingCount} unit siap dijual di pemasaran
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Packaged Product */}
      {showConfirmPkgModal && selectedPkg && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-emerald-700">
              <div className="p-2 bg-emerald-100 rounded-xl">
                <PackageCheck className="w-6 h-6 text-emerald-800" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800">Konfirmasi Terima Produk Olahan</h3>
                <p className="text-xs text-slate-500">Masukkan produk ke persediaan siap jual</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs space-y-2">
              <div className="grid grid-cols-3">
                <span className="text-slate-500">Jenis Produk</span>
                <span className="col-span-2 font-bold text-slate-900">: {selectedPkg.jenisProduk}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-500">Kemasan</span>
                <span className="col-span-2 font-bold text-slate-800">: {selectedPkg.kemasan}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-500">Jumlah Masuk</span>
                <span className="col-span-2 font-black text-emerald-800 text-sm">
                  : {(selectedPkg.jumlah || selectedPkg.totalPackagedQty || 0).toLocaleString('id-ID')} Botol/Cup
                </span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-500">Tanggal Batch</span>
                <span className="col-span-2 font-semibold text-slate-800">
                  : {new Date(selectedPkg.tanggal || selectedPkg.date).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Penerimaan / Kondisi Barang:</label>
              <textarea
                value={pkgNotes}
                onChange={(e) => setPkgNotes(e.target.value)}
                placeholder="Contoh: Kondisi kemasan baik, dingin, tersegel rapi..."
                rows={2}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmPkgModal(false);
                  setSelectedPkg(null);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmPkg}
                disabled={submittingPkg}
                className="px-5 py-2 text-xs font-extrabold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow transition-transform active:scale-95"
              >
                {submittingPkg ? 'Memproses...' : '✓ Konfirmasi Masuk Stok'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
