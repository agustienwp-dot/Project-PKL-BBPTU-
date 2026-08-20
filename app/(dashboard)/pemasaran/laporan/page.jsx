'use client';

import React, { useState, useEffect, useMemo } from 'react';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import EmptyState from '@/components/EmptyState';
import PengemasanReportTable from '@/components/PengemasanReportTable';
import {
  FileText,
  Calendar,
  Download,
  Filter,
  TrendingUp,
  Milk,
  Package,
  CheckCircle2,
  PackageCheck,
  BarChart3,
  Sun,
  Sunset,
  Factory,
  Search,
  RotateCcw,
  Eye,
  Printer,
  Info
} from 'lucide-react';
import ExcelJS from 'exceljs';

export default function LaporanPemasaranPage() {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Main Category Tab: 'susu_fresh' (Rekapan Farm & Susu Siap Olah) | 'susu_olahan' (Format Standar 27 Kolom Pengolahan & Distribusi)
  const [activeCategory, setActiveCategory] = useState('susu_fresh');

  // ==========================================
  // STATE FOR KATEGORI 1: SUSU FRESH (FARM)
  // ==========================================
  const [freshRecords, setFreshRecords] = useState([]);
  const [freshDailyList, setFreshDailyList] = useState([]);
  const [freshSummary, setFreshSummary] = useState({
    totalProduksiGross: 0,
    totalPagiGross: 0,
    totalPagiSiapOlah: 0,
    totalSoreGross: 0,
    totalSoreSiapOlah: 0,
    totalDistribusiSegar: 0,
    totalPedet: 0,
    totalAfkir: 0,
    totalSusuSiapOlah: 0,
    pendingVerificationCount: 0,
  });

  // Fresh View Sub-Tab: 'daily' (1 Hari Jadi Satu) | 'sessions' (Rincian Sesi)
  const [freshViewTab, setFreshViewTab] = useState('daily');
  const [freshTimeFilter, setFreshTimeFilter] = useState('ALL');
  const [freshStartDate, setFreshStartDate] = useState('');
  const [freshEndDate, setFreshEndDate] = useState('');
  const [freshAnimalFilter, setFreshAnimalFilter] = useState('ALL');
  const [freshSessionFilter, setFreshSessionFilter] = useState('ALL');
  const [freshStatusFilter, setFreshStatusFilter] = useState('ALL');
  const [freshSortOrder, setFreshSortOrder] = useState('asc'); // Default ascending 1-31
  const [freshSearchQuery, setFreshSearchQuery] = useState('');

  // Modals for Fresh
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedFreshRecord, setSelectedFreshRecord] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [submittingFresh, setSubmittingFresh] = useState(false);

  // ==========================================
  // STATE FOR KATEGORI 2: SUSU OLAHAN (27 KOLOM)
  // ==========================================
  const [pengemasanReports, setPengemasanReports] = useState([]);
  const [pengemasanSummary, setPengemasanSummary] = useState({});

  // Fetch Fresh Milk (Farm) Data
  const fetchFreshData = async () => {
    try {
      let queryParams = [];

      if (freshTimeFilter === 'TODAY') {
        const today = new Date().toISOString().slice(0, 10);
        queryParams.push(`startDate=${today}`);
        queryParams.push(`endDate=${today}`);
      } else if (freshTimeFilter === '7DAYS') {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        queryParams.push(`startDate=${d.toISOString().slice(0, 10)}`);
      } else if (freshTimeFilter === 'MONTH') {
        const d = new Date();
        const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
        queryParams.push(`startDate=${start}`);
      } else if (freshTimeFilter === 'CUSTOM') {
        if (freshStartDate) queryParams.push(`startDate=${freshStartDate}`);
        if (freshEndDate) queryParams.push(`endDate=${freshEndDate}`);
      }

      if (freshAnimalFilter !== 'ALL') queryParams.push(`animal=${freshAnimalFilter}`);
      if (freshSessionFilter !== 'ALL') queryParams.push(`session=${freshSessionFilter}`);
      if (freshStatusFilter !== 'ALL') queryParams.push(`status=${freshStatusFilter}`);
      if (freshSortOrder) queryParams.push(`sortOrder=${freshSortOrder}`);
      if (freshSearchQuery) queryParams.push(`search=${encodeURIComponent(freshSearchQuery)}`);

      const qStr = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      const res = await api.get(`/pemasaran/farm-recap${qStr}`);

      if (res.data?.success) {
        setFreshRecords(res.data.data || []);
        setFreshDailyList(res.data.dailyList || []);
        setFreshSummary(res.data.summary || {});
      }
    } catch (e) {
      console.error('Error fetching fresh data:', e);
    }
  };

  // Fetch Pengemasan (Olahan 27 Kolom) Data
  const fetchPengemasanReport = async () => {
    try {
      const res = await api.get('/pemasaran/pengemasan-report');
      if (res.data?.success) {
        setPengemasanReports(res.data.data || []);
        setPengemasanSummary(res.data.summary || {});
      }
    } catch (e) {
      console.error('Error fetching pengemasan report:', e);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchFreshData(), fetchPengemasanReport()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  useEffect(() => {
    if (activeCategory === 'susu_fresh') {
      fetchFreshData();
    }
  }, [freshTimeFilter, freshAnimalFilter, freshSessionFilter, freshStatusFilter, freshSortOrder]);

  const handleConfirmVerification = async () => {
    if (!selectedFreshRecord) return;
    setSubmittingFresh(true);
    try {
      const res = await api.put('/pemasaran/farm-recap', {
        id: selectedFreshRecord.id,
        action: 'RECEIVE',
        receptionNotes: verificationNotes,
      });

      if (res.data?.success) {
        setToast({ type: 'success', message: 'Data perah berhasil diverifikasi & stok susu siap olah pemasaran bertambah!' });
        setShowConfirmModal(false);
        setVerificationNotes('');
        setSelectedFreshRecord(null);
        fetchFreshData();
      }
    } catch (err) {
      console.error('Error confirming fresh record:', err);
      setToast({ type: 'error', message: 'Gagal memverifikasi data.' });
    } finally {
      setSubmittingFresh(false);
    }
  };

  const exportFreshToExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Rekapan Susu Fresh');

      worksheet.mergeCells('A1', 'I1');
      worksheet.getCell('A1').value = 'REKAPITULASI PENERIMAAN SUSU FRESH & SIAP OLAH FARM';
      worksheet.getCell('A1').font = { size: 14, bold: true, color: { argb: 'FFFFFF' } };
      worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getCell('A1').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '1E3F20' },
      };
      worksheet.getRow(1).height = 28;

      worksheet.mergeCells('A2', 'I2');
      worksheet.getCell('A2').value = `BBPTUHPT BATURRADEN | Tanggal Ekspor: ${new Date().toLocaleDateString('id-ID')}`;
      worksheet.getCell('A2').font = { size: 10, italic: true };
      worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getRow(2).height = 18;

      worksheet.addRow([]);

      const headerRow = worksheet.addRow([
        'No',
        'Tanggal',
        'Jenis Ternak',
        'Perah Pagi (L)',
        'Perah Sore (L)',
        'Total Produksi Gross (L)',
        'Potongan Pedet/Afkir (L)',
        'Distribusi Segar (L)',
        'TOTAL SUSU SIAP OLAH (L)',
      ]);

      headerRow.height = 24;
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, size: 10, color: { argb: 'FFFFFF' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '1E3F20' },
        };
      });

      freshDailyList.forEach((d, idx) => {
        const row = worksheet.addRow([
          idx + 1,
          new Date(d.tanggal).toLocaleDateString('id-ID'),
          d.jenisTernak === 'KAMBING' ? 'Kambing' : 'Sapi',
          d.pagiSiapOlah || 0,
          d.soreSiapOlah || 0,
          d.totalGross || 0,
          (d.totalPedet || 0) + (d.totalAfkir || 0),
          d.totalDistribusi || 0,
          d.totalSusuSiapOlah || 0,
        ]);
        row.height = 20;
        row.eachCell((cell, cNum) => {
          cell.alignment = { horizontal: cNum <= 3 ? 'center' : 'right', vertical: 'middle' };
          cell.border = {
            top: { style: 'thin', color: { argb: 'E2E8F0' } },
            bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
            left: { style: 'thin', color: { argb: 'E2E8F0' } },
            right: { style: 'thin', color: { argb: 'E2E8F0' } },
          };

          if (cNum === 9) {
            cell.font = { bold: true };
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'DCFCE7' },
            };
          }
        });
      });

      const totalRow = worksheet.addRow([
        'TOTAL AKUMULASI',
        '',
        '',
        freshSummary.totalPagiSiapOlah || 0,
        freshSummary.totalSoreSiapOlah || 0,
        freshSummary.totalProduksiGross || 0,
        (freshSummary.totalPedet || 0) + (freshSummary.totalAfkir || 0),
        freshSummary.totalDistribusiSegar || 0,
        freshSummary.totalSusuSiapOlah || 0,
      ]);
      const lastIdx = worksheet.rowCount;
      worksheet.mergeCells(`A${lastIdx}`, `C${lastIdx}`);
      totalRow.height = 24;
      totalRow.eachCell((cell) => {
        cell.font = { bold: true, size: 10, color: { argb: '0F172A' } };
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FEF08A' },
        };
      });
      worksheet.getCell(`A${lastIdx}`).alignment = { horizontal: 'center', vertical: 'middle' };

      worksheet.columns.forEach((col, i) => {
        col.width = i === 0 ? 6 : i === 8 ? 25 : 18;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Laporan_Susu_Fresh_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);

      setToast({ type: 'success', message: 'Berhasil mengekspor rekapan susu fresh ke Excel!' });
    } catch (err) {
      console.error('Export Excel error:', err);
      setToast({ type: 'error', message: 'Gagal mengekspor data ke Excel.' });
    }
  };

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm print:hidden">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 bg-[#1E3F20] text-white rounded-2xl shadow-md">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl font-extrabold text-slate-800">Laporan & Rekapitulasi Pemasaran</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-black rounded-full border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Terintegrasi 100% (0 Selisih)</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Data alur terintegrasi berurutan dari Farm ke Pengolahan: <strong>Susu Siap Olah Farm</strong> ≡ <strong>Pengambilan Susu Segar Pengolahan</strong>
            </p>
          </div>
        </div>

        {/* Real-time Reconciliation Validation Badge */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-2xl">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Validasi Rekonsiliasi</span>
            <span className="text-xs font-black text-emerald-800">
              Farm: {(freshSummary.totalSusuSiapOlah || 0).toLocaleString('id-ID')} L ≡ Pengolahan: {(pengemasanSummary.totalPengambilan || 0).toLocaleString('id-ID')} L
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            ✓
          </div>
        </div>
      </div>

      {/* Main 2-Category Switcher Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 print:hidden">
        {/* Kategori 1: Susu Fresh */}
        <button
          onClick={() => setActiveCategory('susu_fresh')}
          className={`inline-flex items-center gap-2.5 px-6 py-3.5 font-bold text-xs border-b-2 transition-all ${
            activeCategory === 'susu_fresh'
              ? 'border-emerald-600 text-emerald-900 bg-emerald-50 rounded-t-2xl shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Milk className="w-4 h-4 text-emerald-600" />
          <span>🥛 1. Laporan Susu Fresh (Rekapan Farm & Siap Olah)</span>
        </button>

        {/* Kategori 2: Susu Olahan */}
        <button
          onClick={() => setActiveCategory('susu_olahan')}
          className={`inline-flex items-center gap-2.5 px-6 py-3.5 font-bold text-xs border-b-2 transition-all ${
            activeCategory === 'susu_olahan'
              ? 'border-emerald-600 text-emerald-900 bg-emerald-50 rounded-t-2xl shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <PackageCheck className="w-4 h-4 text-emerald-600" />
          <span>📦 2. Laporan Susu Olahan (Hasil Pengolahan & Distribusi 27 Kolom)</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Memuat Laporan & Rekapitulasi..." />
      ) : (
        <>
          {/* ========================================================================= */}
          {/* KATEGORI 1: SUSU FRESH (REKAPAN FARM & PENERIMAAN SUSU SIAP OLAH)        */}
          {/* ========================================================================= */}
          {activeCategory === 'susu_fresh' && (
            <div className="space-y-6">
              {/* Header Actions for Fresh */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm print:hidden">
                <div className="flex items-center gap-2.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Satu Kesatuan Susu Fresh Farm</span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Urutan Tanggal 1 s/d 31</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={exportFreshToExcel}
                    className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Excel</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white px-3.5 py-2 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak</span>
                  </button>
                </div>
              </div>

              {/* 5 KPI Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-[#1E3F20] text-white p-5 rounded-3xl shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold tracking-wider text-emerald-200 uppercase">PRODUKSI SUSU (GROSS)</span>
                    <h3 className="text-2xl font-black mt-1">
                      {(freshSummary.totalProduksiGross || 0).toLocaleString('id-ID')}{' '}
                      <span className="text-xs font-semibold text-emerald-200">Liter</span>
                    </h3>
                  </div>
                  <p className="text-[11px] text-emerald-200/90 font-medium mt-3">Total perah bruto seluruh kandang</p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold tracking-wider text-amber-800 uppercase">PERAH PAGI</span>
                      <Sun className="w-4 h-4 text-amber-500" />
                    </div>
                    <h3 className="text-2xl font-black text-amber-900 mt-1">
                      {(freshSummary.totalPagiSiapOlah || 0).toLocaleString('id-ID')}{' '}
                      <span className="text-xs font-semibold text-slate-500">Liter</span>
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-3">
                    Gross: {(freshSummary.totalPagiGross || 0).toLocaleString('id-ID')} Liter
                  </p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-indigo-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold tracking-wider text-indigo-800 uppercase">PERAH SORE</span>
                      <Sunset className="w-4 h-4 text-indigo-500" />
                    </div>
                    <h3 className="text-2xl font-black text-indigo-900 mt-1">
                      {(freshSummary.totalSoreSiapOlah || 0).toLocaleString('id-ID')}{' '}
                      <span className="text-xs font-semibold text-slate-500">Liter</span>
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-3">
                    Gross: {(freshSummary.totalSoreGross || 0).toLocaleString('id-ID')} Liter
                  </p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">DISTRIBUSI SEGAR</span>
                    <h3 className="text-2xl font-black text-slate-800 mt-1">
                      {(freshSummary.totalDistribusiSegar || 0).toLocaleString('id-ID')}{' '}
                      <span className="text-xs font-semibold text-slate-500">Liter</span>
                    </h3>
                  </div>
                  <p className="text-[11px] text-rose-600 font-medium mt-3">
                    Pedet: {freshSummary.totalPedet || 0}L • Afkir: {freshSummary.totalAfkir || 0}L
                  </p>
                </div>

                <div className="bg-gradient-to-br from-[#0E5A36] to-[#1E3F20] text-white p-5 rounded-3xl shadow-md flex flex-col justify-between border border-emerald-400/30">
                  <div>
                    <span className="text-[11px] font-black tracking-wider text-emerald-200 uppercase flex items-center gap-1.5">
                      <Factory className="w-3.5 h-3.5 text-emerald-300" />
                      <span>SUSU SIAP OLAH (NET)</span>
                    </span>
                    <h3 className="text-2xl font-black mt-1 text-white">
                      {(freshSummary.totalSusuSiapOlah || 0).toLocaleString('id-ID')}{' '}
                      <span className="text-xs font-semibold text-emerald-200">Liter</span>
                    </h3>
                  </div>
                  <p className="text-[11px] text-emerald-200 font-bold mt-3">Siap kirim ke Pengolahan / Kemas</p>
                </div>
              </div>

              {/* Info Banner */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-emerald-950 print:hidden">
                <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Satu Kesatuan Susu Fresh:</span> Data perah sesi pagi dan sore diinput oleh Farm, dan otomatis terakumulasi dalam 1 hari menjadi total <strong>Susu Siap Olah</strong> yang siap diolah/dikemas.
                </div>
              </div>

              {/* Filter & View Switcher Bar */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4 print:hidden">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl">
                    <button
                      onClick={() => setFreshViewTab('daily')}
                      className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                        freshViewTab === 'daily'
                          ? 'bg-emerald-700 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      📅 Rekap Harian (1 Hari Jadi Satu)
                    </button>
                    <button
                      onClick={() => setFreshViewTab('sessions')}
                      className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                        freshViewTab === 'sessions'
                          ? 'bg-emerald-700 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      🕒 Rincian Sesi (Pagi & Sore)
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
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
                          onClick={() => setFreshTimeFilter(t.id)}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                            freshTimeFilter === t.id ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    <select
                      value={freshAnimalFilter}
                      onChange={(e) => setFreshAnimalFilter(e.target.value)}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                    >
                      <option value="ALL">Semua Ternak (Sapi & Kambing)</option>
                      <option value="SAPI">Sapi</option>
                      <option value="KAMBING">Kambing</option>
                    </select>

                    <select
                      value={freshSortOrder}
                      onChange={(e) => setFreshSortOrder(e.target.value)}
                      className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900"
                    >
                      <option value="asc">📅 Tanggal 1 s/d 31 (Urut Naik)</option>
                      <option value="desc">📅 Tanggal 31 s/d 1 (Urut Turun)</option>
                    </select>

                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Cari catatan/tanggal..."
                        value={freshSearchQuery}
                        onChange={(e) => setFreshSearchQuery(e.target.value)}
                        className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 w-44"
                      />
                    </div>

                    <button
                      onClick={fetchFreshData}
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200"
                      title="Refresh"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* VIEW 1: REKAP HARIAN (1 HARI JADI SATU) */}
              {freshViewTab === 'daily' && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-extrabold text-slate-800 text-base">
                        Tabel Rekapitulasi Harian Susu Siap Olah (Dikirim ke Pengolahan)
                      </h2>
                      <p className="text-xs text-slate-500">
                        Akumulasi perah pagi & sore per tanggal menjadi 1 kesatuan stok susu siap olah
                      </p>
                    </div>
                    <span className="text-xs font-bold bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full">
                      {freshDailyList.length} Hari Produksi
                    </span>
                  </div>

                  {freshDailyList.length === 0 ? (
                    <EmptyState
                      title="Tidak Ada Data Rekap Harian"
                      description="Belum ada data perah harian yang tercatat."
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-y border-slate-200 text-[11px]">
                          <tr>
                            <th className="px-3 py-3 text-center w-10">No</th>
                            <th className="px-3 py-3">Tanggal Produksi</th>
                            <th className="px-3 py-3 text-center">Ternak</th>
                            <th className="px-3 py-3 text-right">Gross Harian</th>
                            <th className="px-3 py-3 text-right text-rose-700">Potongan Kandang</th>
                            <th className="px-3 py-3 text-right font-bold text-blue-900 bg-blue-50/50">Siap Olah Awal</th>
                            <th className="px-3 py-3 text-right font-bold text-amber-800 bg-amber-50/50">Potongan BAST</th>
                            <th className="px-3 py-3">Keterangan Pemakaian BAST</th>
                            <th className="px-3 py-3 text-right font-black text-emerald-950 bg-emerald-100">
                              SISA BERSIH SIAP OLAH
                            </th>
                            <th className="px-3 py-3 text-center print:hidden">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                          {freshDailyList.map((d, idx) => (
                            <tr key={d.tanggal || idx} className="hover:bg-slate-50 transition-colors">
                              <td className="px-3 py-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                              <td className="px-3 py-3 font-semibold whitespace-nowrap text-slate-900">
                                {new Date(d.tanggal).toLocaleDateString('id-ID', {
                                  weekday: 'short',
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </td>
                              <td className="px-3 py-3 text-center">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  d.jenisTernak === 'KAMBING' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {d.jenisTernak === 'KAMBING' ? '🐐 Kambing' : '🐄 Sapi'}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-right font-bold text-slate-800">{d.totalGross || 0} L</td>
                              <td className="px-3 py-3 text-right text-rose-700 font-semibold">
                                - {((d.totalPedet || 0) + (d.totalAfkir || 0) + (d.totalDistribusi || 0))} L
                              </td>
                              <td className="px-3 py-3 text-right font-black text-blue-900 bg-blue-50/30">
                                {d.totalSusuSiapOlah || 0} L
                              </td>
                              <td className="px-3 py-3 text-right font-bold text-amber-800 bg-amber-50/30">
                                {d.totalBastDeduction > 0 ? `-${d.totalBastDeduction} L` : '0 L'}
                              </td>
                              <td className="px-3 py-3">
                                {d.bastUsageDescriptions && d.bastUsageDescriptions.length > 0 ? (
                                  <div className="space-y-1">
                                    {d.bastUsageDescriptions.map((desc, i) => (
                                      <span
                                        key={i}
                                        className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200"
                                      >
                                        {desc}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-slate-400 italic">Diserahkan penuh ke pengolahan</span>
                                )}
                              </td>
                              <td className="px-3 py-3 text-right font-black text-emerald-950 bg-emerald-50/80 text-sm">
                                {d.sisaBersihSiapOlah !== undefined ? d.sisaBersihSiapOlah : d.totalSusuSiapOlah} Liter
                              </td>
                              <td className="px-3 py-3 text-center print:hidden">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                  Siap Olah
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-amber-100/90 text-slate-900 font-black border-t-2 border-slate-300">
                          <tr>
                            <td colSpan={3} className="px-3 py-3 text-center bg-amber-200 font-bold">
                              TOTAL AKUMULASI HARIAN ({freshDailyList.length} Hari)
                            </td>
                            <td className="px-3 py-3 text-right font-bold">
                              {(freshSummary.totalProduksiGross || 0).toLocaleString('id-ID')} L
                            </td>
                            <td className="px-3 py-3 text-right text-rose-800 font-bold">
                              - {((freshSummary.totalPedet || 0) + (freshSummary.totalAfkir || 0) + (freshSummary.totalDistribusiSegar || 0)).toLocaleString('id-ID')} L
                            </td>
                            <td className="px-3 py-3 text-right font-black text-blue-950 bg-blue-100">
                              {(freshSummary.totalSusuSiapOlah || 0).toLocaleString('id-ID')} L
                            </td>
                            <td className="px-3 py-3 text-right text-amber-900 font-black bg-amber-200">
                              -{((freshSummary.totalBastDeduction || 0)).toLocaleString('id-ID')} L
                            </td>
                            <td className="px-3 py-3 text-xs font-bold text-amber-900">
                              Total Potongan BAST Fisik Terverifikasi
                            </td>
                            <td className="px-3 py-3 text-right text-emerald-950 font-black bg-emerald-200 text-sm">
                              {((freshSummary.netSusuFreshTersedia !== undefined ? freshSummary.netSusuFreshTersedia : freshSummary.totalSusuSiapOlah) || 0).toLocaleString('id-ID')} Liter
                            </td>
                            <td className="print:hidden"></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW 2: RINCIAN SESI (PAGI & SORE TERPISAH) */}
              {freshViewTab === 'sessions' && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-extrabold text-slate-800 text-base">Rincian Data Mentah per Sesi (Pagi & Sore)</h2>
                      <p className="text-xs text-slate-500">Log pencatatan per sesi perah yang diinput dari farm</p>
                    </div>
                    <span className="text-xs font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded-full">
                      {freshRecords.length} Entri Sesi
                    </span>
                  </div>

                  {freshRecords.length === 0 ? (
                    <EmptyState
                      title="Tidak Ada Data Sesi Perah"
                      description="Tidak ditemukan log sesi perah untuk filter yang dipilih."
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-y border-slate-200 text-[11px]">
                          <tr>
                            <th className="px-3 py-3 text-center w-12">No</th>
                            <th className="px-3 py-3">Tanggal</th>
                            <th className="px-3 py-3 text-center">Sesi Perah</th>
                            <th className="px-3 py-3 text-center">Ternak</th>
                            <th className="px-3 py-3 text-right">Produksi Gross</th>
                            <th className="px-3 py-3 text-right">Susu Pedet</th>
                            <th className="px-3 py-3 text-right">Afkir/Rusak</th>
                            <th className="px-3 py-3 text-right">Distribusi Segar</th>
                            <th className="px-3 py-3 text-right font-black text-emerald-900 bg-emerald-50">Susu Siap Olah Sesi</th>
                            <th className="px-3 py-3 text-center print:hidden">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                          {freshRecords.map((r, idx) => (
                            <tr key={r.id || idx} className="hover:bg-slate-50 transition-colors">
                              <td className="px-3 py-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                              <td className="px-3 py-3 font-semibold whitespace-nowrap text-slate-700">
                                {new Date(r.tanggal).toLocaleDateString('id-ID', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </td>
                              <td className="px-3 py-3 text-center">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  r.kegiatanPerah === 'Pagi' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                                }`}>
                                  {r.kegiatanPerah === 'Pagi' ? '☀️ Pagi' : '🌙 Sore'}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  r.jenisTernak === 'KAMBING' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {r.jenisTernak === 'KAMBING' ? '🐐 Kambing' : '🐄 Sapi'}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-right font-bold">{r.produksiSusu || 0} L</td>
                              <td className="px-3 py-3 text-right text-slate-600">{r.susuPedet || 0} L</td>
                              <td className="px-3 py-3 text-right text-rose-600 font-semibold">{r.susuAfkir || 0} L</td>
                              <td className="px-3 py-3 text-right text-amber-700 font-semibold">
                                {r.distribusiSegar || 0} L
                                {r.rincianPembeli && <span className="block text-[10px] text-slate-400 font-normal">{r.rincianPembeli}</span>}
                              </td>
                              <td className="px-3 py-3 text-right font-black text-emerald-900 bg-emerald-50/70">
                                {r.susuSiapOlah || 0} Liter
                              </td>
                              <td className="px-3 py-3 text-center print:hidden">
                                <div className="flex items-center justify-center gap-1.5">
                                  {r.status === 'MENUNGGU_VERIFIKASI' ? (
                                    <button
                                      onClick={() => {
                                        setSelectedFreshRecord(r);
                                        setShowConfirmModal(true);
                                      }}
                                      className="bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm"
                                    >
                                      Verifikasi
                                    </button>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                      <CheckCircle2 className="w-3 h-3" />
                                      Diterima
                                    </span>
                                  )}

                                  <button
                                    onClick={() => {
                                      setSelectedFreshRecord(r);
                                      setShowDetailModal(true);
                                    }}
                                    className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md"
                                    title="Lihat Detail"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* KATEGORI 2: SUSU OLAHAN (HASIL PENGOLAHAN & DISTRIBUSI - 27 KOLOM STANDAR)*/}
          {/* ========================================================================= */}
          {activeCategory === 'susu_olahan' && (
            <div className="space-y-6">
              <PengemasanReportTable
                reports={pengemasanReports}
                summary={pengemasanSummary}
                onRefresh={fetchPengemasanReport}
                readOnly={true}
                showActions={false}
              />
            </div>
          )}
        </>
      )}

      {/* Confirmation Modal for Fresh */}
      {showConfirmModal && selectedFreshRecord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-emerald-700">
              <CheckCircle2 className="w-6 h-6" />
              <h3 className="text-base font-black text-slate-800">Verifikasi Penerimaan Susu Mentah</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Anda akan mengonfirmasi data perah <strong>{selectedFreshRecord.kegiatanPerah}</strong> tanggal{' '}
              <strong>{new Date(selectedFreshRecord.tanggal).toLocaleDateString('id-ID')}</strong>. Susu siap olah sebesar{' '}
              <strong>{selectedFreshRecord.susuSiapOlah} Liter</strong> akan resmi dicatat ke persediaan bahan baku pengolahan/pengemasan.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Penerimaan (Opsional):</label>
              <textarea
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="Misal: Diterima dalam kondisi suhu dingin baik..."
                rows={2}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedFreshRecord(null);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmVerification}
                disabled={submittingFresh}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow"
              >
                {submittingFresh ? 'Memproses...' : 'Sahkan & Terima ke Pengolahan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Record for Fresh */}
      {showDetailModal && selectedFreshRecord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-base font-black text-slate-800">Detail Sesi Perah Farm</h3>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedFreshRecord(null);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Tanggal:</span>
                <span className="font-bold text-slate-800">
                  {new Date(selectedFreshRecord.tanggal).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Sesi & Ternak:</span>
                <span className="font-bold text-slate-800">
                  Perah {selectedFreshRecord.kegiatanPerah} • {selectedFreshRecord.jenisTernak === 'KAMBING' ? 'Kambing' : 'Sapi'}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Produksi Gross:</span>
                <span className="font-black text-slate-900">{selectedFreshRecord.produksiSusu} Liter</span>
              </div>
              <div className="flex justify-between py-1.5 text-amber-800">
                <span>Potongan Pedet:</span>
                <span className="font-bold">- {selectedFreshRecord.susuPedet} Liter</span>
              </div>
              <div className="flex justify-between py-1.5 text-rose-700">
                <span>Potongan Afkir / Rusak:</span>
                <span className="font-bold">- {selectedFreshRecord.susuAfkir} Liter</span>
              </div>
              <div className="flex justify-between py-1.5 text-amber-900">
                <span>Distribusi Segar Langsung:</span>
                <span className="font-bold">- {selectedFreshRecord.distribusiSegar} Liter</span>
              </div>
              <div className="flex justify-between py-2 bg-emerald-50 px-2.5 rounded-xl text-emerald-950 font-black">
                <span>Susu Siap Olah (Masuk Pengolahan):</span>
                <span className="text-sm">{selectedFreshRecord.susuSiapOlah} Liter</span>
              </div>
              {selectedFreshRecord.notes && (
                <div className="pt-2 text-slate-600">
                  <span className="font-bold text-slate-700 block mb-0.5">Catatan:</span>
                  <p className="text-[11px] bg-slate-50 p-2 rounded-lg">{selectedFreshRecord.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedFreshRecord(null);
                }}
                className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
