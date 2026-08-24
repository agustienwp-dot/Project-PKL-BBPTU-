'use client';

import React, { useState, useEffect, useMemo } from 'react';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import EmptyState from '@/components/EmptyState';
import {
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
  Sparkles,
  Info,
  Milk,
  FileCheck,
  PenTool
} from 'lucide-react';

export default function SuratBastPermintaanPage() {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [basts, setBasts] = useState([]);
  const [farmSummary, setFarmSummary] = useState({});

  // Filter States
  const [demandTypeFilter, setDemandTypeFilter] = useState('ALL'); // 'ALL' | 'PENJUALAN_LANGSUNG' | 'HIBAH' | 'KERJASAMA'
  const [timeFilter, setTimeFilter] = useState('ALL'); // 'ALL' | 'TODAY' | '7DAYS' | 'MONTH' | 'CUSTOM'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('asc'); // Default ascending 1-31
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [selectedBast, setSelectedBast] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [confirmNotes, setConfirmNotes] = useState('');
  const [confirmedPhysical, setConfirmedPhysical] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bastRes, farmRes] = await Promise.all([
        api.get('/bast').catch(() => ({ data: { data: [] } })),
        api.get('/pemasaran/farm-recap').catch(() => ({ data: { summary: {} } })),
      ]);

      if (bastRes.data?.success) {
        setBasts(bastRes.data.data || []);
      }
      if (farmRes.data?.success) {
        setFarmSummary(farmRes.data.summary || {});
      }
    } catch (err) {
      console.error('Error loading BAST data:', err);
      setToast({ type: 'error', message: 'Gagal memuat daftar dokumen BAST.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter Logic
  const filteredBasts = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const d7 = new Date();
    d7.setDate(d7.getDate() - 7);
    const d7Str = d7.toISOString().slice(0, 10);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

    return basts
      .filter((b) => {
        const dStr = new Date(b.tanggal).toISOString().slice(0, 10);

        let matchTime = true;
        if (timeFilter === 'TODAY') matchTime = dStr === today;
        else if (timeFilter === '7DAYS') matchTime = dStr >= d7Str;
        else if (timeFilter === 'MONTH') matchTime = dStr >= monthStart && dStr <= monthEnd;
        else if (timeFilter === 'CUSTOM') {
          if (startDate && dStr < startDate) matchTime = false;
          if (endDate && dStr > endDate) matchTime = false;
        }

        const matchDemand = demandTypeFilter === 'ALL' || b.jenisPermintaan === demandTypeFilter;
        const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
        const matchSearch =
          !searchTerm ||
          b.nomorBast?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.instansiPenerima?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.catatan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dStr.includes(searchTerm);

        return matchTime && matchDemand && matchStatus && matchSearch;
      })
      .sort((a, b) => {
        const cmp = new Date(a.tanggal) - new Date(b.tanggal);
        return sortOrder === 'desc' ? -cmp : cmp;
      });
  }, [basts, demandTypeFilter, timeFilter, startDate, endDate, statusFilter, sortOrder, searchTerm]);

  // KPI Calculations
  const totalVolumeFiltered = useMemo(() => {
    return filteredBasts.reduce((acc, b) => acc + (b.volumeLiters || 0), 0);
  }, [filteredBasts]);

  const verifiedBasts = useMemo(() => {
    return filteredBasts.filter((b) => b.status === 'DITERIMA');
  }, [filteredBasts]);

  const totalVolumeVerified = useMemo(() => {
    return verifiedBasts.reduce((acc, b) => acc + (b.volumeLiters || 0), 0);
  }, [verifiedBasts]);

  const pendingCount = useMemo(() => {
    return filteredBasts.filter((b) => b.status === 'MENUNGGU_KONFIRMASI').length;
  }, [filteredBasts]);

  // Modal Handlers
  const handleOpenConfirmModal = (bast) => {
    setSelectedBast(bast);
    setConfirmNotes(bast.catatan || 'Surat fisik asli telah diterima dengan tanda tangan basah.');
    setConfirmedPhysical(true);
    setShowConfirmModal(true);
  };

  const handleConfirmBAST = async () => {
    if (!selectedBast) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/bast/${selectedBast.id}/confirm`, {
        catatan: `${confirmNotes} [Tanda Tangan Basah Diverifikasi]`,
      });

      if (res.data?.success) {
        setToast({
          type: 'success',
          message: `Surat fisik BAST No. ${selectedBast.nomorBast} berhasil dikonfirmasi diterima & otomatis memotong persediaan susu fresh!`,
        });
        setShowConfirmModal(false);
        setConfirmNotes('');
        setSelectedBast(null);
        fetchData();
      }
    } catch (err) {
      console.error('Error confirming BAST:', err);
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Gagal mengonfirmasi surat fisik BAST.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Memuat Dokumen Surat BAST Permintaan..." />;
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
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-extrabold text-slate-800">Surat BAST Permintaan Susu Segar</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-100 text-blue-900 text-[11px] font-black rounded-full border border-blue-300">
                <PenTool className="w-3 h-3 text-blue-700" />
                <span>Verifikasi Surat Fisik TTD Basah</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-900 text-[11px] font-black rounded-full border border-amber-300">
                <Sparkles className="w-3 h-3 text-amber-700" />
                <span>Otomatis Memotong Susu Fresh</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Surat fisik BAST diterbitkan dan ditandatangani basah oleh <strong>Admin Farm</strong>. Klik tombol <strong>Konfirmasi Terima Surat Fisik</strong> saat hardfile diterima untuk otomatis memotong stok susu segar.
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

      {/* Physical Workflow Notice Banner */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-950 print:hidden">
        <PenTool className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-extrabold text-amber-900">Alur Penerimaan Surat Fisik (Tanda Tangan Basah):</p>
          <p className="text-[11px] leading-relaxed text-amber-900/90">
            Admin Farm membawa / mengirimkan dokumen fisik BAST bermaterai dan bertanda tangan basah ke bagian Pemasaran. Admin Pemasaran memeriksa keabsahan surat fisik, lalu mengklik tombol <span className="font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">✓ Konfirmasi Terima Surat Fisik</span>. Sistem akan mencatat tanggal penerimaan fisik serta langsung memotong kuota Susu Fresh harian sesuai volume yang tertera.
          </p>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Volume Permintaan BAST</span>
          <h3 className="text-2xl font-black text-slate-800 mt-1">
            {totalVolumeFiltered.toLocaleString('id-ID')}{' '}
            <span className="text-xs font-semibold text-slate-400">Liter</span>
          </h3>
          <p className="text-[11px] text-slate-500 font-semibold mt-1">
            {filteredBasts.length} Dokumen BAST terdaftar
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Surat Fisik Diterima & Terpotong</span>
          <h3 className="text-2xl font-black text-amber-900 mt-1">
            {totalVolumeVerified.toLocaleString('id-ID')}{' '}
            <span className="text-xs font-semibold text-amber-700">Liter</span>
          </h3>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">
            {verifiedBasts.length} Dokumen telah disahkan fisik
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm">
          <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">Menunggu Surat Fisik (TTD Basah)</span>
          <h3 className="text-2xl font-black text-rose-900 mt-1">
            {pendingCount}{' '}
            <span className="text-xs font-semibold text-rose-700">Dokumen</span>
          </h3>
          <p className="text-[11px] text-rose-600 font-semibold mt-1">Menunggu kiriman hardfile dari Farm</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Sisa Susu Fresh Siap Olah</span>
          <h3 className="text-2xl font-black text-emerald-950 mt-1">
            {(farmSummary.netSusuFreshTersedia || 0).toLocaleString('id-ID')}{' '}
            <span className="text-xs font-semibold text-emerald-700">Liter</span>
          </h3>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">Net siap dikirim ke pengolahan</p>
        </div>
      </div>

      {/* Control Bar: Demand Filter Pills, Time Pills, Sort & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 print:hidden">
        {/* Row 1: Demand Type Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'ALL', label: 'Semua Permintaan', count: basts.length },
              { id: 'PENJUALAN_LANGSUNG', label: 'Penjualan Langsung', count: basts.filter((b) => b.jenisPermintaan === 'PENJUALAN_LANGSUNG').length },
              { id: 'HIBAH', label: 'Hibah', count: basts.filter((b) => b.jenisPermintaan === 'HIBAH').length },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setDemandTypeFilter(t.id)}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                  demandTypeFilter === t.id
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label} ({t.count})
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
              <option value="ALL">Semua Status Dokumen</option>
              <option value="MENUNGGU_KONFIRMASI">⏳ Menunggu Surat Fisik</option>
              <option value="DITERIMA">✓ Surat Fisik Diterima</option>
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2" />
              <input
                type="text"
                placeholder="Cari BAST / Instansi..."
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

      {/* Main Table for BAST Documents */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-slate-800 text-base">Daftar Dokumen BAST Permintaan</h2>
            <p className="text-xs text-slate-500">
              Konfirmasi penerimaan hardfile fisik asli dengan tanda tangan basah dari unit Farm
            </p>
          </div>
          <span className="text-xs font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded-full">
            {filteredBasts.length} Dokumen
          </span>
        </div>

        {filteredBasts.length === 0 ? (
          <EmptyState
            title="Tidak Ada Dokumen BAST"
            description="Tidak ditemukan dokumen BAST untuk filter yang dipilih."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-y border-slate-200 text-[11px]">
                <tr>
                  <th className="px-4 py-3 text-center w-12">No</th>
                  <th className="px-4 py-3">Nomor BAST</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Jenis Permintaan</th>
                  <th className="px-4 py-3">Instansi / Penerima</th>
                  <th className="px-4 py-3 text-right">Volume (Liter)</th>
                  <th className="px-4 py-3">Keterangan Pemakaian (Dipakai Untuk)</th>
                  <th className="px-4 py-3">Pengirim (Farm)</th>
                  <th className="px-4 py-3 text-center">Status Hardfile</th>
                  <th className="px-4 py-3 text-center">Aksi Konfirmasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredBasts.map((b, idx) => (
                  <tr key={b.id || idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{b.nomorBast}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(b.tanggal).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                        b.jenisPermintaan === 'HIBAH'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {b.jenisPermintaan === 'HIBAH' ? '🎁 Hibah' : '🛒 Penjualan Langsung'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-700">{b.instansiPenerima || 'Umum'}</td>
                    <td className="px-4 py-3 text-right font-black text-slate-900 text-sm">
                      {b.volumeLiters} Liter
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-slate-700 font-semibold">
                          {b.jenisPermintaan === 'HIBAH'
                            ? `Penyaluran Susu Hibah (${b.instansiPenerima})`
                            : `Penjualan Langsung Susu Fresh Mentah (${b.instansiPenerima})`}
                        </span>
                        {b.catatan && (
                          <span className="text-[10px] text-slate-400 italic max-w-xs truncate">
                            {b.catatan}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-medium text-[11px]">
                      {b.pengirimNama || 'Admin Farm Produksi'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {b.status === 'MENUNGGU_KONFIRMASI' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                          <AlertCircle className="w-3 h-3" />
                          Menunggu Surat Fisik
                        </span>
                      ) : (
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            Surat Fisik Diterima
                          </span>
                          <span className="text-[9px] text-slate-400">TTD Basah Sah</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {b.status === 'MENUNGGU_KONFIRMASI' ? (
                          <button
                            onClick={() => handleOpenConfirmModal(b)}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-xl text-[11px] font-extrabold shadow-sm flex items-center gap-1 transition-transform active:scale-95"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>Konfirmasi Terima Surat Fisik</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedBast(b);
                              setShowPrintModal(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200"
                            title="Lihat / Cetak Arsip Format BAST"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Table Footer */}
              <tfoot className="bg-amber-100/80 font-black text-slate-900 border-t-2 border-slate-300">
                <tr>
                  <td colSpan={5} className="px-4 py-2.5 text-center bg-amber-200">
                    TOTAL VOLUME PERMINTAAN ({filteredBasts.length} Dokumen BAST)
                  </td>
                  <td className="px-4 py-2 text-right text-emerald-950 font-black">
                    {totalVolumeFiltered.toLocaleString('id-ID')} Liter
                  </td>
                  <td colSpan={4} className="px-4 py-2 text-xs font-semibold text-slate-600">
                    {totalVolumeVerified.toLocaleString('id-ID')} L surat fisik diterima & memotong Susu Fresh
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Receiving Physical BAST */}
      {showConfirmModal && selectedBast && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-emerald-700">
              <div className="p-2.5 bg-emerald-100 rounded-2xl">
                <FileCheck className="w-6 h-6 text-emerald-800" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800">Konfirmasi Penerimaan Surat Fisik BAST</h3>
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  ✍️ Verifikasi Tanda Tangan Basah Asli
                </span>
              </div>
            </div>

            {/* Document Details Card */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs space-y-2">
              <div className="grid grid-cols-3">
                <span className="text-slate-500">Nomor BAST</span>
                <span className="col-span-2 font-bold text-slate-900">: {selectedBast.nomorBast}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-500">Pengirim (Farm)</span>
                <span className="col-span-2 font-bold text-slate-800">: {selectedBast.pengirimNama || 'Admin Farm Produksi'}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-500">Penerima / Pemohon</span>
                <span className="col-span-2 font-bold text-slate-800">: {selectedBast.instansiPenerima}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-500">Volume Diserahkan</span>
                <span className="col-span-2 font-black text-emerald-800 text-sm">: {selectedBast.volumeLiters} Liter</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-500">Keterangan Pemakaian</span>
                <span className="col-span-2 font-semibold text-slate-800">
                  : {selectedBast.jenisPermintaan === 'HIBAH'
                    ? 'Penyaluran Susu Hibah'
                    : 'Penjualan Langsung Susu Segar'}
                </span>
              </div>
            </div>

            {/* Verification Checkbox */}
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmedPhysical}
                  onChange={(e) => setConfirmedPhysical(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="text-xs text-emerald-950 font-bold leading-relaxed">
                  Saya menyatakan telah menerima dokumen fisik hardfile BAST asli bertanda tangan basah dari Admin Farm, dan memotong kuota Susu Fresh sebesar {selectedBast.volumeLiters} Liter.
                </span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Penerimaan / No. Berkas Arsip:</label>
              <textarea
                value={confirmNotes}
                onChange={(e) => setConfirmNotes(e.target.value)}
                placeholder="Misal: Surat fisik asli telah diterima, diverifikasi tanda tangan basah, dan diarsipkan..."
                rows={2}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedBast(null);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmBAST}
                disabled={submitting || !confirmedPhysical}
                className="px-5 py-2 text-xs font-extrabold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-xl shadow transition-transform active:scale-95"
              >
                {submitting ? 'Memproses...' : '✓ Konfirmasi Terima Surat Fisik'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Preview Modal for BAST */}
      {showPrintModal && selectedBast && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-slate-100 space-y-6 my-8 print:m-0 print:p-0 print:border-none print:shadow-none">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <FileText className="w-5 h-5" />
                <span>Format Resmi Cetak Hardfile BAST</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Dokumen</span>
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 font-bold text-base"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="border border-slate-300 p-8 rounded-2xl bg-slate-50/50 space-y-6 text-slate-800 print:border-none print:p-0">
              <div className="text-center border-b-2 border-slate-900 pb-4">
                <h2 className="text-base font-black uppercase tracking-wider">KEMENTERIAN PERTANIAN</h2>
                <h3 className="text-sm font-bold uppercase">DIREKTORAT JENDERAL PETERNAKAN DAN KESEHATAN HEWAN</h3>
                <h4 className="text-xs font-semibold uppercase">BBPTUHPT BATURRADEN</h4>
                <p className="text-[10px] text-slate-500 mt-1">Jl. Raya Baturraden Km 12, Purwokerto, Jawa Tengah</p>
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-sm font-black underline uppercase tracking-wide">
                  BERITA ACARA SERAH TERIMA (BAST)
                </h3>
                <p className="text-xs font-bold text-slate-600">Nomor: {selectedBast.nomorBast}</p>
              </div>

              <p className="text-xs leading-relaxed text-justify">
                Pada hari ini, tanggal{' '}
                <strong>
                  {new Date(selectedBast.tanggal).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </strong>
                , telah dilakukan serah terima fisik produk <strong>SUSU SAPI MURNI SEGAR (FRESH MILK)</strong> dengan rincian sebagai berikut:
              </p>

              <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">Jenis Permintaan</span>
                  <span className="col-span-2 font-bold">: {selectedBast.jenisPermintaan}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">Penerima / Pemohon</span>
                  <span className="col-span-2 font-bold">: {selectedBast.instansiPenerima}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">Volume Diserahkan</span>
                  <span className="col-span-2 font-black text-emerald-800 text-sm">
                    : {selectedBast.volumeLiters} Liter
                  </span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">Keterangan Pemakaian</span>
                  <span className="col-span-2 font-bold text-slate-800">
                    : {selectedBast.jenisPermintaan === 'HIBAH'
                      ? 'Penyaluran Susu Hibah'
                      : 'Penjualan Langsung Susu Segar'}
                  </span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">Kondisi Barang</span>
                  <span className="col-span-2 font-bold text-slate-800">: Dingin Segar (Sesuai Standar Mutu)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-6 text-center text-xs">
                <div>
                  <p className="text-slate-500">Pihak Pertama (Pengirim / Farm)</p>
                  <div className="h-16 flex items-center justify-center">
                    <span className="text-[10px] text-slate-400 italic">( Tanda Tangan Basah & Cap Asli )</span>
                  </div>
                  <p className="font-bold text-slate-800 border-t border-slate-300 pt-1">
                    {selectedBast.pengirimNama || 'Admin Farm Produksi'}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Pihak Kedua (Penerima / Pemasaran)</p>
                  <div className="h-16 flex items-center justify-center">
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      ✓ Surat Fisik Telah Diterima & Terpotong
                    </span>
                  </div>
                  <p className="font-bold text-slate-800 border-t border-slate-300 pt-1">
                    {selectedBast.penerimaNama || 'Admin Pemasaran'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
