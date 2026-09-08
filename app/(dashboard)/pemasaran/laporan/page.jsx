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
  TrendingDown,
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
  Info,
  ShoppingCart,
  Gift,
  AlertCircle,
  Clock
} from 'lucide-react';
import ExcelJS from 'exceljs';

export default function LaporanPemasaranPage() {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Main Category Tab: 'terima_fresh' | 'distribusi_segar' | 'susu_olahan'
  const [activeCategory, setActiveCategory] = useState('terima_fresh');

  // ==========================================
  // STATE FOR KATEGORI 1: TERIMA SUSU SEGAR (FARM)
  // ==========================================
  const [freshRecords, setFreshRecords] = useState([]);
  const [freshDailyList, setFreshDailyList] = useState([]);
  const [freshCommodity, setFreshCommodity] = useState('SAPI'); // 'SAPI' | 'KAMBING'
  const [freshViewTab, setFreshViewTab] = useState('daily'); // 'daily' | 'sessions'
  const [freshTimeFilter, setFreshTimeFilter] = useState('ALL');
  const [freshStartDate, setFreshStartDate] = useState('');
  const [freshEndDate, setFreshEndDate] = useState('');
  const [freshSessionFilter, setFreshSessionFilter] = useState('ALL');
  const [freshStatusFilter, setFreshStatusFilter] = useState('ALL');
  const [freshSortOrder, setFreshSortOrder] = useState('asc');
  const [freshSearchQuery, setFreshSearchQuery] = useState('');

  // Modals for Fresh
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedFreshRecord, setSelectedFreshRecord] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [submittingFresh, setSubmittingFresh] = useState(false);

  // ==========================================
  // STATE FOR KATEGORI 2: DISTRIBUSI SUSU SEGAR (PENJUALAN & HIBAH)
  // ==========================================
  const [bastRecords, setBastRecords] = useState([]);
  const [bastTimeFilter, setBastTimeFilter] = useState('ALL');
  const [bastDemandFilter, setBastDemandFilter] = useState('ALL'); // 'ALL' | 'PENJUALAN_LANGSUNG' | 'HIBAH'
  const [bastAnimalFilter, setBastAnimalFilter] = useState('ALL'); // 'ALL' | 'SAPI' | 'KAMBING'
  const [bastStartDate, setBastStartDate] = useState('');
  const [bastEndDate, setBastEndDate] = useState('');
  const [bastSortOrder, setBastSortOrder] = useState('asc');
  const [bastSearchQuery, setBastSearchQuery] = useState('');

  // ==========================================
  // STATE FOR KATEGORI 3: SUSU OLAHAN (27 KOLOM STANDAR)
  // ==========================================
  const [pengemasanReports, setPengemasanReports] = useState([]);
  const [pengemasanSummary, setPengemasanSummary] = useState({});

  // 1. Fetch Fresh Milk (Farm) Data
  const fetchFreshData = async () => {
    try {
      const res = await api.get('/pemasaran/farm-recap?sortOrder=asc');
      if (res.data?.success) {
        setFreshRecords(res.data.data || []);
        setFreshDailyList(res.data.dailyList || []);
      }
    } catch (e) {
      console.error('Error fetching fresh data:', e);
    }
  };

  // 2. Fetch BAST / Distribusi Data
  const fetchBastData = async () => {
    try {
      const res = await api.get('/bast');
      if (res.data?.success) {
        setBastRecords(res.data.data || []);
      }
    } catch (e) {
      console.error('Error fetching bast data in laporan:', e);
    }
  };

  // 3. Fetch Pengemasan Report
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
      await Promise.all([fetchFreshData(), fetchBastData(), fetchPengemasanReport()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  // Handler Verifikasi Terima Susu Segar
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
        setToast({ type: 'success', message: 'Data perah berhasil diverifikasi!' });
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

  // =========================================================================
  // MEMO & FILTERING KATEGORI 1: TERIMA SUSU SEGAR (FARM)
  // =========================================================================
  const filteredFreshDailyList = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const d7 = new Date();
    d7.setDate(d7.getDate() - 7);
    const d7Str = d7.toISOString().slice(0, 10);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

    return freshDailyList
      .filter((day) => {
        const dayAnimal = (day.jenisTernak || 'SAPI').toUpperCase();
        if (dayAnimal !== freshCommodity) return false;

        const dStr = day.tanggal;
        let matchTime = true;
        if (freshTimeFilter === 'TODAY') matchTime = dStr === today;
        else if (freshTimeFilter === '7DAYS') matchTime = dStr >= d7Str;
        else if (freshTimeFilter === 'MONTH') matchTime = dStr >= monthStart && dStr <= monthEnd;
        else if (freshTimeFilter === 'CUSTOM') {
          if (freshStartDate && dStr < freshStartDate) matchTime = false;
          if (freshEndDate && dStr > freshEndDate) matchTime = false;
        }

        const matchStatus = freshStatusFilter === 'ALL' || day.status === freshStatusFilter;
        const matchSearch =
          !freshSearchQuery ||
          day.tanggal.includes(freshSearchQuery);

        return matchTime && matchStatus && matchSearch;
      })
      .sort((a, b) => {
        const cmp = new Date(a.tanggal) - new Date(b.tanggal);
        return freshSortOrder === 'desc' ? -cmp : cmp;
      });
  }, [freshDailyList, freshCommodity, freshTimeFilter, freshStartDate, freshEndDate, freshStatusFilter, freshSortOrder, freshSearchQuery]);

  const filteredFreshSessions = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const d7 = new Date();
    d7.setDate(d7.getDate() - 7);
    const d7Str = d7.toISOString().slice(0, 10);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

    return freshRecords
      .filter((r) => {
        const rAnimal = (r.jenisTernak || 'SAPI').toUpperCase();
        if (rAnimal !== freshCommodity) return false;

        const dStr = r.tanggal;
        let matchTime = true;
        if (freshTimeFilter === 'TODAY') matchTime = dStr === today;
        else if (freshTimeFilter === '7DAYS') matchTime = dStr >= d7Str;
        else if (freshTimeFilter === 'MONTH') matchTime = dStr >= monthStart && dStr <= monthEnd;
        else if (freshTimeFilter === 'CUSTOM') {
          if (freshStartDate && dStr < freshStartDate) matchTime = false;
          if (freshEndDate && dStr > freshEndDate) matchTime = false;
        }

        const matchSession = freshSessionFilter === 'ALL' || r.kegiatanPerah?.toLowerCase() === freshSessionFilter.toLowerCase();
        const matchStatus = freshStatusFilter === 'ALL' || r.status === freshStatusFilter;
        const matchSearch =
          !freshSearchQuery ||
          r.tanggal.includes(freshSearchQuery) ||
          r.notes?.toLowerCase().includes(freshSearchQuery.toLowerCase());

        return matchTime && matchSession && matchStatus && matchSearch;
      })
      .sort((a, b) => {
        const cmp = new Date(a.tanggal) - new Date(b.tanggal);
        if (cmp !== 0) return freshSortOrder === 'desc' ? -cmp : cmp;
        return a.kegiatanPerah === 'Pagi' ? -1 : 1;
      });
  }, [freshRecords, freshCommodity, freshTimeFilter, freshStartDate, freshEndDate, freshSessionFilter, freshStatusFilter, freshSortOrder, freshSearchQuery]);

  // Aggregated Fresh Totals
  const totalFreshGross = useMemo(() => filteredFreshDailyList.reduce((acc, d) => acc + (d.totalGross || 0), 0), [filteredFreshDailyList]);
  const totalFreshPedet = useMemo(() => filteredFreshDailyList.reduce((acc, d) => acc + (d.totalPedet || 0), 0), [filteredFreshDailyList]);
  const totalFreshAfkir = useMemo(() => filteredFreshDailyList.reduce((acc, d) => acc + (d.totalAfkir || 0), 0), [filteredFreshDailyList]);
  const totalFreshNet = useMemo(() => Math.max(0, totalFreshGross - totalFreshPedet - totalFreshAfkir), [totalFreshGross, totalFreshPedet, totalFreshAfkir]);

  // Export Excel Terima Susu Segar
  const exportFreshToExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Penerimaan Susu Segar');

      worksheet.mergeCells('A1', 'G1');
      worksheet.getCell('A1').value = `LAPORAN PENERIMAAN SUSU SEGAR (${freshCommodity === 'KAMBING' ? 'KAMBING' : 'SAPI'})`;
      worksheet.getCell('A1').font = { size: 14, bold: true, color: { argb: 'FFFFFF' } };
      worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getCell('A1').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '14532D' },
      };
      worksheet.getRow(1).height = 28;

      worksheet.mergeCells('A2', 'G2');
      worksheet.getCell('A2').value = `BBPTUHPT BATURRADEN | Tanggal Ekspor: ${new Date().toLocaleDateString('id-ID')}`;
      worksheet.getCell('A2').font = { size: 10, italic: true };
      worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getRow(2).height = 18;

      worksheet.addRow([]);

      const headerRow = worksheet.addRow([
        'No',
        'Tanggal',
        'Jenis Ternak',
        'Susu Segar Masuk (L)',
        `${freshCommodity === 'KAMBING' ? 'Cempe' : 'Pedet'} (L)`,
        'Susu Afkir (L)',
        'Diterima Pemasaran (Net L)',
      ]);

      headerRow.height = 24;
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, size: 10, color: { argb: 'FFFFFF' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '14532D' },
        };
      });

      filteredFreshDailyList.forEach((d, idx) => {
        const netSiapOlah = Math.max(0, (d.totalGross || 0) - (d.totalPedet || 0) - (d.totalAfkir || 0));
        const row = worksheet.addRow([
          idx + 1,
          new Date(d.tanggal).toLocaleDateString('id-ID'),
          d.jenisTernak === 'KAMBING' ? 'Kambing' : 'Sapi',
          d.totalGross || 0,
          d.totalPedet || 0,
          d.totalAfkir || 0,
          netSiapOlah,
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

          if (cNum === 7) {
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
        totalFreshGross,
        totalFreshPedet,
        totalFreshAfkir,
        totalFreshNet,
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
        col.width = i === 0 ? 6 : i === 6 ? 26 : 18;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Laporan_Penerimaan_Susu_Segar_${freshCommodity}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);

      setToast({ type: 'success', message: 'Berhasil mengekspor rekapan penerimaan susu segar ke Excel!' });
    } catch (err) {
      console.error('Export Excel error:', err);
      setToast({ type: 'error', message: 'Gagal mengekspor data ke Excel.' });
    }
  };

  // =========================================================================
  // MEMO & FILTERING KATEGORI 2: DISTRIBUSI SUSU SEGAR (PENJUALAN & HIBAH)
  // =========================================================================
  const getBastAnimal = (b) => {
    if (b.sumber === 'SUSU_KAMBING' || (b.catatan && b.catatan.toLowerCase().includes('kambing'))) {
      return 'KAMBING';
    }
    return 'SAPI';
  };

  const filteredBastList = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const d7 = new Date();
    d7.setDate(d7.getDate() - 7);
    const d7Str = d7.toISOString().slice(0, 10);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

    return bastRecords
      .filter((b) => {
        const dStr = new Date(b.tanggal).toISOString().slice(0, 10);
        const animal = getBastAnimal(b);

        let matchTime = true;
        if (bastTimeFilter === 'TODAY') matchTime = dStr === today;
        else if (bastTimeFilter === '7DAYS') matchTime = dStr >= d7Str;
        else if (bastTimeFilter === 'MONTH') matchTime = dStr >= monthStart && dStr <= monthEnd;
        else if (bastTimeFilter === 'CUSTOM') {
          if (bastStartDate && dStr < bastStartDate) matchTime = false;
          if (bastEndDate && dStr > bastEndDate) matchTime = false;
        }

        const isHibah = b.jenisPermintaan === 'HIBAH';
        let matchDemand = true;
        if (bastDemandFilter === 'PENJUALAN_LANGSUNG') matchDemand = !isHibah;
        else if (bastDemandFilter === 'HIBAH') matchDemand = isHibah;

        const matchAnimal = bastAnimalFilter === 'ALL' || animal === bastAnimalFilter;

        const matchSearch =
          !bastSearchQuery ||
          b.nomorBast?.toLowerCase().includes(bastSearchQuery.toLowerCase()) ||
          b.instansiPenerima?.toLowerCase().includes(bastSearchQuery.toLowerCase()) ||
          dStr.includes(bastSearchQuery);

        return matchTime && matchDemand && matchAnimal && matchSearch;
      })
      .sort((a, b) => {
        const cmp = new Date(a.tanggal) - new Date(b.tanggal);
        return bastSortOrder === 'desc' ? -cmp : cmp;
      });
  }, [bastRecords, bastTimeFilter, bastDemandFilter, bastAnimalFilter, bastStartDate, bastEndDate, bastSortOrder, bastSearchQuery]);

  const totalDistribusiPenjualan = useMemo(() => filteredBastList.filter((b) => b.jenisPermintaan !== 'HIBAH').reduce((acc, b) => acc + (b.volumeLiters || 0), 0), [filteredBastList]);
  const totalDistribusiHibah = useMemo(() => filteredBastList.filter((b) => b.jenisPermintaan === 'HIBAH').reduce((acc, b) => acc + (b.volumeLiters || 0), 0), [filteredBastList]);
  const totalDistribusiVolume = useMemo(() => totalDistribusiPenjualan + totalDistribusiHibah, [totalDistribusiPenjualan, totalDistribusiHibah]);

  // Export Excel Distribusi Susu Segar
  const exportBastToExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Distribusi Susu Segar');

      worksheet.mergeCells('A1', 'H1');
      worksheet.getCell('A1').value = 'LAPORAN REKAPITULASI DISTRIBUSI SUSU SEGAR (PENJUALAN & HIBAH)';
      worksheet.getCell('A1').font = { size: 14, bold: true, color: { argb: 'FFFFFF' } };
      worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getCell('A1').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '14532D' },
      };
      worksheet.getRow(1).height = 28;

      worksheet.mergeCells('A2', 'H2');
      worksheet.getCell('A2').value = `BBPTUHPT BATURRADEN | Tanggal Ekspor: ${new Date().toLocaleDateString('id-ID')}`;
      worksheet.getCell('A2').font = { size: 10, italic: true };
      worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getRow(2).height = 18;

      worksheet.addRow([]);

      const headerRow = worksheet.addRow([
        'No',
        'Tanggal Penyaluran',
        'Nomor BAST / Dokumen',
        'Jenis Susu',
        'Jenis Alokasi',
        'Volume (Liter)',
        'Tujuan / Penerima',
        'Status Dokumen',
      ]);

      headerRow.height = 24;
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, size: 10, color: { argb: 'FFFFFF' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '14532D' },
        };
      });

      filteredBastList.forEach((b, idx) => {
        const isHibah = b.jenisPermintaan === 'HIBAH';
        const animal = getBastAnimal(b);
        const row = worksheet.addRow([
          idx + 1,
          new Date(b.tanggal).toLocaleDateString('id-ID'),
          isHibah ? b.nomorBast : 'Penjualan Langsung (Tanpa BAST)',
          animal === 'KAMBING' ? 'Susu Kambing' : 'Susu Sapi',
          isHibah ? 'Hibah' : 'Penjualan',
          b.volumeLiters || 0,
          b.instansiPenerima || '-',
          b.status === 'DITERIMA' || b.status === 'DIKIRIM_KE_FARM' ? 'Selesai' : 'Menunggu',
        ]);
        row.height = 20;
        row.eachCell((cell, cNum) => {
          cell.alignment = { horizontal: cNum === 1 || cNum === 2 || cNum === 4 || cNum === 5 || cNum === 8 ? 'center' : cNum === 6 ? 'right' : 'left', vertical: 'middle' };
          cell.border = {
            top: { style: 'thin', color: { argb: 'E2E8F0' } },
            bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
            left: { style: 'thin', color: { argb: 'E2E8F0' } },
            right: { style: 'thin', color: { argb: 'E2E8F0' } },
          };
          if (cNum === 6) {
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
        'TOTAL REKAPITULASI PENYALURAN',
        '',
        '',
        '',
        '',
        totalDistribusiVolume,
        `Penjualan: ${totalDistribusiPenjualan} L • Hibah: ${totalDistribusiHibah} L`,
        '',
      ]);
      const lastIdx = worksheet.rowCount;
      worksheet.mergeCells(`A${lastIdx}`, `E${lastIdx}`);
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
        col.width = i === 0 ? 6 : i === 1 ? 16 : i === 2 ? 30 : i === 5 ? 18 : i === 6 ? 30 : 20;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Laporan_Distribusi_Susu_Segar_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);

      setToast({ type: 'success', message: 'Berhasil mengekspor rekapitulasi distribusi susu segar ke Excel!' });
    } catch (err) {
      console.error('Export BAST Excel error:', err);
      setToast({ type: 'error', message: 'Gagal mengekspor data ke Excel.' });
    }
  };

  return (
    <div className="space-y-6 w-full pb-10 font-sans">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header Banner dengan Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs print:hidden">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-3.5 bg-[#14532D] text-white rounded-2xl shadow-sm shrink-0">
            <BarChart3 className="w-6 h-6 text-emerald-300" />
          </div>
          <div className="space-y-1">
            {/* Breadcrumb */}
            <nav className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-slate-400">
              <span className="text-slate-500">Pemasaran</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-600">Laporan & Rekapitulasi</span>
              <span className="text-slate-300">/</span>
              <span className="text-emerald-900 font-black bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-md">
                {activeCategory === 'terima_fresh'
                  ? '🥛 1. Terima Susu Segar'
                  : activeCategory === 'distribusi_segar'
                  ? '🚚 2. Distribusi Susu Segar'
                  : '📦 3. Susu Olahan (27 Kolom)'}
              </span>
            </nav>

            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Laporan & Rekapitulasi Pemasaran
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-black rounded-full border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Terintegrasi Realtime</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Pusat ekspor dan rekapitulasi data terpadu: Penerimaan susu segar farm, distribusi penjualan/hibah, dan laporan standar pengolahan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeCategory === 'terima_fresh' && (
            <button
              onClick={exportFreshToExcel}
              className="inline-flex items-center gap-1.5 bg-[#14532D] hover:bg-[#1e7240] text-white px-4 py-2.5 rounded-2xl font-bold text-xs transition-all shadow-xs active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Export Excel</span>
            </button>
          )}

          {activeCategory === 'distribusi_segar' && (
            <button
              onClick={exportBastToExcel}
              className="inline-flex items-center gap-1.5 bg-[#14532D] hover:bg-[#1e7240] text-white px-4 py-2.5 rounded-2xl font-bold text-xs transition-all shadow-xs active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Export Excel</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-2xl font-bold text-xs transition-all shadow-xs active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3 UTAMA KATEGORI NAVIGATION TABS                                         */}
      {/* ========================================================================= */}
      <div className="bg-slate-200/70 p-1.5 rounded-2xl border border-slate-300/80 flex flex-wrap sm:flex-nowrap gap-2 print:hidden shadow-xs">
        <button
          onClick={() => setActiveCategory('terima_fresh')}
          className={`flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 ${
            activeCategory === 'terima_fresh'
              ? 'bg-[#14532D] text-white shadow-md ring-2 ring-emerald-600/50'
              : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/80'
          }`}
        >
          <Milk className={`w-4 h-4 ${activeCategory === 'terima_fresh' ? 'text-emerald-300' : 'text-emerald-700'}`} />
          <span>🥛 1. Laporan Terima Susu Segar</span>
        </button>

        <button
          onClick={() => setActiveCategory('distribusi_segar')}
          className={`flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 ${
            activeCategory === 'distribusi_segar'
              ? 'bg-[#14532D] text-white shadow-md ring-2 ring-emerald-600/50'
              : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/80'
          }`}
        >
          <FileText className={`w-4 h-4 ${activeCategory === 'distribusi_segar' ? 'text-emerald-300' : 'text-emerald-700'}`} />
          <span>🚚 2. Laporan Rekap Distribusi Susu Segar</span>
        </button>

        <button
          onClick={() => setActiveCategory('susu_olahan')}
          className={`flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 ${
            activeCategory === 'susu_olahan'
              ? 'bg-[#14532D] text-white shadow-md ring-2 ring-emerald-600/50'
              : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/80'
          }`}
        >
          <PackageCheck className={`w-4 h-4 ${activeCategory === 'susu_olahan' ? 'text-emerald-300' : 'text-emerald-700'}`} />
          <span>📦 3. Laporan Susu Olahan (27 Kolom)</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Memuat Laporan & Rekapitulasi..." />
      ) : (
        <>
          {/* ========================================================================= */}
          {/* KATEGORI 1: LAPORAN TERIMA SUSU SEGAR (FARM)                              */}
          {/* ========================================================================= */}
          {activeCategory === 'terima_fresh' && (
            <div className="space-y-6">
              {/* Commodity Switcher: Sapi vs Kambing */}
              <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap sm:flex-nowrap gap-2 print:hidden">
                <button
                  onClick={() => setFreshCommodity('SAPI')}
                  className={`flex-1 flex items-center justify-between p-3.5 rounded-xl font-extrabold text-xs transition-all ${
                    freshCommodity === 'SAPI'
                      ? 'bg-[#14532D] text-white shadow-md ring-2 ring-emerald-600/30'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🐄</span>
                    <div className="text-left">
                      <span className="block text-sm font-black">Susu Sapi Segar</span>
                      <span className={`text-[11px] font-semibold ${freshCommodity === 'SAPI' ? 'text-emerald-200' : 'text-slate-500'}`}>
                        Bovine Fresh Milk
                      </span>
                    </div>
                  </div>
                  <span className={`text-base font-black font-mono ${freshCommodity === 'SAPI' ? 'text-emerald-200' : 'text-emerald-800'}`}>
                    {freshCommodity === 'SAPI' ? totalFreshNet.toLocaleString('id-ID') : 0} L Net
                  </span>
                </button>

                <button
                  onClick={() => setFreshCommodity('KAMBING')}
                  className={`flex-1 flex items-center justify-between p-3.5 rounded-xl font-extrabold text-xs transition-all ${
                    freshCommodity === 'KAMBING'
                      ? 'bg-[#14532D] text-white shadow-md ring-2 ring-emerald-600/30'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🐐</span>
                    <div className="text-left">
                      <span className="block text-sm font-black">Susu Kambing Segar</span>
                      <span className={`text-[11px] font-semibold ${freshCommodity === 'KAMBING' ? 'text-amber-200' : 'text-slate-500'}`}>
                        Caprine Fresh Milk
                      </span>
                    </div>
                  </div>
                  <span className={`text-base font-black font-mono ${freshCommodity === 'KAMBING' ? 'text-amber-200' : 'text-amber-800'}`}>
                    {freshCommodity === 'KAMBING' ? totalFreshNet.toLocaleString('id-ID') : 0} L Net
                  </span>
                </button>
              </div>

              {/* 3 Summary KPI Cards strictly aligned */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Card 1: Susu Segar Masuk */}
                <div className="bg-white rounded-3xl p-6 border border-emerald-300 shadow-2xs space-y-3 hover:shadow-xs transition-shadow bg-emerald-50/20">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-emerald-900 uppercase tracking-wider">
                      1. Susu Segar Masuk
                    </span>
                    <div className="p-2.5 bg-[#14532D] text-white rounded-2xl shadow-2xs">
                      <Milk className="w-4 h-4 text-emerald-300" />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-2xl sm:text-3xl font-black text-emerald-950 font-mono tracking-tight">
                      {totalFreshGross.toLocaleString('id-ID')}{' '}
                      <span className="text-xs font-bold text-emerald-700 font-sans">Liter</span>
                    </h3>
                    <p className="text-[11px] text-emerald-800 font-medium">
                      Total perah kandang ({freshCommodity === 'KAMBING' ? 'Kambing' : 'Sapi'})
                    </p>
                  </div>
                </div>

                {/* Card 2: Potongan Farm */}
                <div className="bg-white rounded-3xl p-6 border border-rose-200/90 shadow-2xs space-y-3 hover:shadow-xs transition-shadow bg-rose-50/20">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-rose-800 uppercase tracking-wider">
                      2. Potongan Farm
                    </span>
                    <div className="p-2.5 bg-rose-100 text-rose-700 rounded-2xl shadow-2xs">
                      <TrendingDown className="w-4 h-4 text-rose-600" />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-2xl sm:text-3xl font-black text-rose-950 font-mono tracking-tight">
                      {(totalFreshPedet + totalFreshAfkir).toLocaleString('id-ID')}{' '}
                      <span className="text-xs font-bold text-rose-700 font-sans">Liter</span>
                    </h3>
                    <p className="text-[11px] text-rose-700 font-medium">
                      {totalFreshPedet} L {freshCommodity === 'KAMBING' ? 'Cempe' : 'Pedet'} • {totalFreshAfkir} L Afkir
                    </p>
                  </div>
                </div>

                {/* Card 3: Masuk Pengolahan (Net) */}
                <div className="bg-white rounded-3xl p-6 border border-emerald-400 shadow-2xs space-y-3 hover:shadow-xs transition-shadow bg-emerald-50/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-emerald-950 uppercase tracking-wider">
                      3. Masuk Pengolahan (Net)
                    </span>
                    <div className="p-2.5 bg-emerald-700 text-white rounded-2xl shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-2xl sm:text-3xl font-black text-emerald-950 font-mono tracking-tight">
                      {totalFreshNet.toLocaleString('id-ID')}{' '}
                      <span className="text-xs font-bold text-emerald-700 font-sans">Liter</span>
                    </h3>
                    <p className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                      <span>Susu siap olah (100% Pas)</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Sub-Tabs: 1 Hari Jadi Satu vs Rincian Sesi */}
              <div className="bg-slate-200/70 p-1.5 rounded-2xl border border-slate-300/80 flex flex-wrap sm:flex-nowrap gap-2 print:hidden shadow-xs">
                <button
                  onClick={() => setFreshViewTab('daily')}
                  className={`flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 ${
                    freshViewTab === 'daily'
                      ? 'bg-[#14532D] text-white shadow-md ring-2 ring-emerald-600/50'
                      : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/80'
                  }`}
                >
                  <Calendar className={`w-4 h-4 ${freshViewTab === 'daily' ? 'text-emerald-300' : 'text-slate-500'}`} />
                  <span>📅 Rekapan 1 Hari Jadi Satu</span>
                  <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    freshViewTab === 'daily' ? 'bg-emerald-800 text-emerald-100 border border-emerald-600' : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {filteredFreshDailyList.length} Hari
                  </span>
                </button>

                <button
                  onClick={() => setFreshViewTab('sessions')}
                  className={`flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 ${
                    freshViewTab === 'sessions'
                      ? 'bg-[#14532D] text-white shadow-md ring-2 ring-emerald-600/50'
                      : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/80'
                  }`}
                >
                  <Sun className={`w-4 h-4 ${freshViewTab === 'sessions' ? 'text-amber-300' : 'text-amber-600'}`} />
                  <span>☀️ Rincian Sesi Pagi & Sore</span>
                  <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    freshViewTab === 'sessions' ? 'bg-emerald-800 text-emerald-100 border border-emerald-600' : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {filteredFreshSessions.length} Sesi
                  </span>
                </button>
              </div>

              {/* Filter Dropdown Bar for Fresh */}
              <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 print:hidden">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Dropdown Periode */}
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-2xl px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-white transition-all">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-400 text-[11px] font-semibold">Periode:</span>
                      <select
                        value={freshTimeFilter}
                        onChange={(e) => setFreshTimeFilter(e.target.value)}
                        className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-800 pr-1"
                      >
                        <option value="ALL">Semua Periode</option>
                        <option value="TODAY">Hari Ini</option>
                        <option value="7DAYS">7 Hari Terakhir</option>
                        <option value="MONTH">Bulan Ini</option>
                        <option value="CUSTOM">Rentang Kustom</option>
                      </select>
                    </div>

                    {/* Dropdown Status */}
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-2xl px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-white transition-all">
                      <span className="text-slate-400 text-[11px] font-semibold">Status:</span>
                      <select
                        value={freshStatusFilter}
                        onChange={(e) => setFreshStatusFilter(e.target.value)}
                        className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-800 pr-1"
                      >
                        <option value="ALL">Semua Status</option>
                        <option value="DITERIMA">Selesai / Diterima</option>
                        <option value="MENUNGGU_VERIFIKASI">Menunggu Verifikasi</option>
                      </select>
                    </div>

                    {/* Dropdown Sesi (jika view sesi) */}
                    {freshViewTab === 'sessions' && (
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-2xl px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-white transition-all">
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-slate-400 text-[11px] font-semibold">Sesi:</span>
                        <select
                          value={freshSessionFilter}
                          onChange={(e) => setFreshSessionFilter(e.target.value)}
                          className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-800 pr-1"
                        >
                          <option value="ALL">Semua Sesi</option>
                          <option value="Pagi">☀️ Sesi Pagi</option>
                          <option value="Sore">🌙 Sesi Sore</option>
                        </select>
                      </div>
                    )}

                    {/* Search Input */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Cari tanggal / keterangan..."
                        value={freshSearchQuery}
                        onChange={(e) => setFreshSearchQuery(e.target.value)}
                        className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 w-44 sm:w-60 shadow-2xs"
                      />
                    </div>

                    {/* Refresh */}
                    <button
                      onClick={fetchFreshData}
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-2xl border border-slate-300 transition-colors shadow-2xs active:scale-95"
                      title="Segarkan Data"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-xs text-slate-500 font-bold flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
                      {freshCommodity === 'KAMBING' ? '🐐 Susu Kambing' : '🐄 Susu Sapi'}
                    </span>
                    <span>Ditampilkan: {freshViewTab === 'daily' ? `${filteredFreshDailyList.length} Hari` : `${filteredFreshSessions.length} Sesi`}</span>
                  </div>
                </div>

                {freshTimeFilter === 'CUSTOM' && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-600">Rentang Tanggal:</span>
                    <input
                      type="date"
                      value={freshStartDate}
                      onChange={(e) => setFreshStartDate(e.target.value)}
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                    />
                    <span className="text-xs text-slate-400 font-bold">s/d</span>
                    <input
                      type="date"
                      value={freshEndDate}
                      onChange={(e) => setFreshEndDate(e.target.value)}
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                    />
                  </div>
                )}
              </div>

              {/* VIEW 1: REKAP HARIAN (1 HARI JADI SATU) */}
              {freshViewTab === 'daily' && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                        <span>{freshCommodity === 'KAMBING' ? '🐐 Rekapitulasi Harian Susu Kambing' : '🐄 Rekapitulasi Harian Susu Sapi'}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {filteredFreshDailyList.length} Hari
                        </span>
                      </h2>
                      <p className="text-xs text-slate-500">
                        Pencatatan harian penerimaan susu segar dari kandang setelah dikurangi potongan farm.
                      </p>
                    </div>
                  </div>

                  {filteredFreshDailyList.length === 0 ? (
                    <EmptyState
                      title={`Tidak Ada Data Susu ${freshCommodity === 'KAMBING' ? 'Kambing' : 'Sapi'}`}
                      description="Tidak ditemukan data rekapan harian susu segar untuk filter ini."
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-y border-slate-200 text-[11px]">
                          <tr>
                            <th className="px-3 py-3.5 text-center w-10">No</th>
                            <th className="px-3 py-3.5 whitespace-nowrap">Tanggal</th>
                            <th className="px-3 py-3.5 text-right font-black text-slate-900 whitespace-nowrap">Susu Segar Masuk</th>
                            <th className="px-3 py-3.5 text-right text-slate-600 whitespace-nowrap">
                              {freshCommodity === 'KAMBING' ? 'Cempe' : 'Pedet'} (L)
                            </th>
                            <th className="px-3 py-3.5 text-right text-slate-700 whitespace-nowrap">Susu Afkir (L)</th>
                            <th className="px-3 py-3.5 text-right font-black text-emerald-950 bg-emerald-100 whitespace-nowrap">Diterima Pemasaran (Net)</th>
                            <th className="px-3 py-3.5 text-center font-bold text-slate-700 whitespace-nowrap">Kesesuaian</th>
                            <th className="px-3 py-3.5 text-center whitespace-nowrap">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                          {filteredFreshDailyList.map((day, idx) => {
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
                                <td className="px-3 py-3.5 text-right font-mono font-bold text-slate-900">
                                  {day.totalAfkir} L
                                </td>
                                <td className="px-3 py-3.5 text-right font-black font-mono text-emerald-950 bg-emerald-50 text-sm">
                                  {netSiapOlah.toLocaleString('id-ID')} Liter
                                </td>
                                <td className="px-3 py-3.5 text-center whitespace-nowrap">
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>Pas (0 L)</span>
                                  </span>
                                </td>
                                <td className="px-3 py-3.5 text-center whitespace-nowrap">
                                  {day.status === 'MENUNGGU_VERIFIKASI' ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                                      <AlertCircle className="w-3 h-3" />
                                      <span>Menunggu</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                      <CheckCircle2 className="w-3 h-3" />
                                      <span>Diterima</span>
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-emerald-100 font-black text-slate-900 border-t-2 border-slate-300">
                          <tr>
                            <td colSpan={2} className="px-3 py-3 text-center bg-emerald-200 text-xs uppercase tracking-wider">
                              TOTAL AKUMULASI ({filteredFreshDailyList.length} HARI)
                            </td>
                            <td className="px-3 py-3 text-right font-mono font-black">{totalFreshGross.toLocaleString('id-ID')} L</td>
                            <td className="px-3 py-3 text-right font-mono text-slate-700">
                              {totalFreshPedet.toLocaleString('id-ID')} L
                            </td>
                            <td className="px-3 py-3 text-right font-mono text-rose-700">
                              {totalFreshAfkir.toLocaleString('id-ID')} L
                            </td>
                            <td className="px-3 py-3 text-right font-black font-mono bg-emerald-200 text-emerald-950 text-sm">
                              {totalFreshNet.toLocaleString('id-ID')} Liter
                            </td>
                            <td className="px-3 py-3 text-center text-emerald-900 text-[11px] font-bold">
                              ✓ 0 L Selisih
                            </td>
                            <td></td>
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
                    <h2 className="font-extrabold text-slate-800 text-base">
                      Daftar Sesi Perah Susu {freshCommodity === 'KAMBING' ? 'Kambing' : 'Sapi'} (Pagi & Sore)
                    </h2>
                    <span className="text-xs font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded-full">
                      {filteredFreshSessions.length} Sesi
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-y border-slate-200 text-[11px]">
                        <tr>
                          <th className="px-4 py-3.5 text-center w-12">No</th>
                          <th className="px-4 py-3.5 whitespace-nowrap">Tanggal</th>
                          <th className="px-4 py-3.5 text-center whitespace-nowrap">Sesi</th>
                          <th className="px-4 py-3.5 text-center whitespace-nowrap">Ternak</th>
                          <th className="px-4 py-3.5 text-right font-black text-slate-900 whitespace-nowrap">Susu Segar Masuk (L)</th>
                          <th className="px-4 py-3.5 text-right text-slate-500 whitespace-nowrap">{freshCommodity === 'KAMBING' ? 'Cempe (L)' : 'Pedet (L)'}</th>
                          <th className="px-4 py-3.5 text-right text-rose-600 whitespace-nowrap">Afkir (L)</th>
                          <th className="px-4 py-3.5 text-right font-black text-emerald-950 bg-emerald-50 whitespace-nowrap">Susu Siap Olah (Net)</th>
                          <th className="px-4 py-3.5 text-center whitespace-nowrap">Status</th>
                          <th className="px-4 py-3.5 text-center whitespace-nowrap">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                        {filteredFreshSessions.map((r, idx) => (
                          <tr key={r.id || idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3.5 text-center text-slate-400 font-bold">{idx + 1}</td>
                            <td className="px-4 py-3.5 font-bold text-slate-800 whitespace-nowrap">
                              {new Date(r.tanggal).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="px-4 py-3.5 text-center whitespace-nowrap">
                              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                                r.kegiatanPerah === 'Pagi' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                              }`}>
                                {r.kegiatanPerah === 'Pagi' ? '☀️ Pagi' : '🌙 Sore'}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-center whitespace-nowrap">
                              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                                r.jenisTernak === 'KAMBING' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              }`}>
                                {r.jenisTernak === 'KAMBING' ? '🐐 Susu Kambing' : '🐄 Susu Sapi'}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">{r.produksiSusu} L</td>
                            <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">{r.susuPedet} L</td>
                            <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">{r.susuAfkir} L</td>
                            <td className="px-4 py-3.5 text-right font-mono font-black text-emerald-950 bg-emerald-50/70 text-sm">
                              {r.susuSiapOlah} Liter
                            </td>
                            <td className="px-4 py-3.5 text-center whitespace-nowrap">
                              {r.status === 'MENUNGGU_VERIFIKASI' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                                  <AlertCircle className="w-3 h-3" />
                                  <span>Menunggu</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Diterima</span>
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1.5">
                                {r.status === 'MENUNGGU_VERIFIKASI' ? (
                                  <button
                                    onClick={() => {
                                      setSelectedFreshRecord(r);
                                      setShowConfirmModal(true);
                                    }}
                                    className="bg-[#14532D] hover:bg-[#1e7240] text-white px-2.5 py-1 rounded-xl text-[10px] font-bold shadow-2xs active:scale-95 transition-all"
                                  >
                                    Verifikasi
                                  </button>
                                ) : (
                                  <span className="text-slate-400 text-[10px]">-</span>
                                )}

                                <button
                                  onClick={() => {
                                    setSelectedFreshRecord(r);
                                    setShowDetailModal(true);
                                  }}
                                  className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
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
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* KATEGORI 2: LAPORAN REKAP DISTRIBUSI SUSU SEGAR (PENJUALAN & HIBAH)       */}
          {/* ========================================================================= */}
          {activeCategory === 'distribusi_segar' && (
            <div className="space-y-6">
              {/* 3 KPI Metric Cards for Distribusi */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Penjualan (Biru) */}
                <div className="bg-white rounded-3xl p-6 border border-blue-200 shadow-2xs space-y-3 hover:shadow-xs transition-shadow bg-blue-50/20">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-blue-900 uppercase tracking-wider">
                      Penjualan Langsung
                    </span>
                    <div className="p-2.5 bg-blue-100 text-blue-700 rounded-2xl shadow-2xs">
                      <ShoppingCart className="w-4 h-4 text-blue-700" />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-2xl sm:text-3xl font-black text-blue-950 font-mono tracking-tight">
                      {totalDistribusiPenjualan.toLocaleString('id-ID')}{' '}
                      <span className="text-xs font-bold text-blue-700 font-sans">Liter</span>
                    </h3>
                    <p className="text-[11px] text-blue-700 font-medium">
                      Penjualan langsung tanpa dokumen BAST
                    </p>
                  </div>
                </div>

                {/* Hibah (Orange) */}
                <div className="bg-white rounded-3xl p-6 border border-amber-200/90 shadow-2xs space-y-3 hover:shadow-xs transition-shadow bg-amber-50/20">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-amber-900 uppercase tracking-wider">
                      Hibah (Dokumen BAST)
                    </span>
                    <div className="p-2.5 bg-amber-100 text-amber-800 rounded-2xl shadow-2xs">
                      <Gift className="w-4 h-4 text-amber-700" />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-2xl sm:text-3xl font-black text-amber-950 font-mono tracking-tight">
                      {totalDistribusiHibah.toLocaleString('id-ID')}{' '}
                      <span className="text-xs font-bold text-amber-700 font-sans">Liter</span>
                    </h3>
                    <p className="text-[11px] text-amber-700 font-medium">
                      Penyaluran resmi dengan surat BAST
                    </p>
                  </div>
                </div>

                {/* Total Distribusi (Hijau Tua) */}
                <div className="bg-white rounded-3xl p-6 border border-emerald-400 shadow-2xs space-y-3 hover:shadow-xs transition-shadow bg-emerald-50/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-emerald-950 uppercase tracking-wider">
                      Total Distribusi Susu Segar
                    </span>
                    <div className="p-2.5 bg-[#14532D] text-white rounded-2xl shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-2xl sm:text-3xl font-black text-emerald-950 font-mono tracking-tight">
                      {totalDistribusiVolume.toLocaleString('id-ID')}{' '}
                      <span className="text-xs font-bold text-emerald-700 font-sans">Liter</span>
                    </h3>
                    <p className="text-[11px] text-emerald-800 font-medium">
                      Akumulasi seluruh alokasi susu segar
                    </p>
                  </div>
                </div>
              </div>

              {/* Control Bar: Dropdowns & Search */}
              <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 print:hidden">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Dropdown Periode */}
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-2xl px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-white transition-all">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-400 text-[11px] font-semibold">Periode:</span>
                      <select
                        value={bastTimeFilter}
                        onChange={(e) => setBastTimeFilter(e.target.value)}
                        className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-800 pr-1"
                      >
                        <option value="ALL">Semua Periode</option>
                        <option value="TODAY">Hari Ini</option>
                        <option value="7DAYS">7 Hari Terakhir</option>
                        <option value="MONTH">Bulan Ini</option>
                        <option value="CUSTOM">Rentang Kustom</option>
                      </select>
                    </div>

                    {/* Dropdown Jenis Alokasi */}
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-2xl px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-white transition-all">
                      <span className="text-slate-400 text-[11px] font-semibold">Alokasi:</span>
                      <select
                        value={bastDemandFilter}
                        onChange={(e) => setBastDemandFilter(e.target.value)}
                        className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-800 pr-1"
                      >
                        <option value="ALL">Semua Alokasi</option>
                        <option value="PENJUALAN_LANGSUNG">🛒 Penjualan</option>
                        <option value="HIBAH">🎁 Hibah</option>
                      </select>
                    </div>

                    {/* Dropdown Ternak */}
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-2xl px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-white transition-all">
                      <span className="text-slate-400 text-[11px] font-semibold">Komoditas:</span>
                      <select
                        value={bastAnimalFilter}
                        onChange={(e) => setBastAnimalFilter(e.target.value)}
                        className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-800 pr-1"
                      >
                        <option value="ALL">Semua Ternak</option>
                        <option value="SAPI">🐄 Susu Sapi</option>
                        <option value="KAMBING">🐐 Susu Kambing</option>
                      </select>
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Cari nomor BAST / penerima..."
                        value={bastSearchQuery}
                        onChange={(e) => setBastSearchQuery(e.target.value)}
                        className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 w-44 sm:w-60 shadow-2xs"
                      />
                    </div>

                    {/* Refresh */}
                    <button
                      onClick={fetchBastData}
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-2xl border border-slate-300 transition-colors shadow-2xs active:scale-95"
                      title="Segarkan Data"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-xs text-slate-500 font-bold">
                    <span>Ditampilkan: {filteredBastList.length} Transaksi</span>
                  </div>
                </div>

                {bastTimeFilter === 'CUSTOM' && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-600">Rentang Tanggal:</span>
                    <input
                      type="date"
                      value={bastStartDate}
                      onChange={(e) => setBastStartDate(e.target.value)}
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                    />
                    <span className="text-xs text-slate-400 font-bold">s/d</span>
                    <input
                      type="date"
                      value={bastEndDate}
                      onChange={(e) => setBastEndDate(e.target.value)}
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                    />
                  </div>
                )}
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-extrabold text-slate-800 text-base">
                      Rekapitulasi Data Penyaluran Distribusi & Hibah Susu Segar
                    </h2>
                    <p className="text-xs text-slate-500">
                      Rincian volume (liter) penjualan langsung dan bantuan hibah resmi.
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded-full">
                    {filteredBastList.length} Data Penyaluran
                  </span>
                </div>

                {filteredBastList.length === 0 ? (
                  <EmptyState
                    title="Tidak Ada Data Penyaluran Susu Segar"
                    description="Belum ada data distribusi atau hibah susu segar yang cocok dengan filter."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-y border-slate-200 text-[11px]">
                        <tr>
                          <th className="px-3 py-3.5 text-center w-10">No</th>
                          <th className="px-3 py-3.5 whitespace-nowrap">Tanggal Penyaluran</th>
                          <th className="px-3 py-3.5 whitespace-nowrap">Nomor Dokumen / BAST</th>
                          <th className="px-3 py-3.5 whitespace-nowrap">Jenis Susu</th>
                          <th className="px-3 py-3.5 whitespace-nowrap">Jenis Alokasi</th>
                          <th className="px-3 py-3.5 whitespace-nowrap">Tujuan / Penerima</th>
                          <th className="px-3 py-3.5 text-right font-black text-slate-900 whitespace-nowrap">Volume (Liter)</th>
                          <th className="px-3 py-3.5 text-center whitespace-nowrap">Status Dokumen</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                        {filteredBastList.map((b, idx) => {
                          const isHibah = b.jenisPermintaan === 'HIBAH';
                          const animal = getBastAnimal(b);
                          const isSent = b.status === 'DIKIRIM_KE_FARM' || b.status === 'DITERIMA';

                          return (
                            <tr key={b.id || idx} className="hover:bg-slate-50 transition-colors">
                              <td className="px-3 py-3.5 text-center text-slate-400 font-bold">{idx + 1}</td>
                              <td className="px-3 py-3.5 whitespace-nowrap text-slate-700 font-semibold">
                                {new Date(b.tanggal).toLocaleDateString('id-ID', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </td>
                              <td className="px-3 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                                {isHibah ? (
                                  <div className="flex items-center gap-1.5 font-mono text-emerald-800">
                                    <FileText className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                    <span>{b.nomorBast}</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 font-medium italic">Penjualan Langsung</span>
                                )}
                              </td>
                              <td className="px-3 py-3.5 whitespace-nowrap">
                                {animal === 'SAPI' ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    <span>🐮</span> Susu Sapi
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl text-xs font-black bg-amber-50 text-amber-800 border border-amber-200">
                                    <span>🐐</span> Susu Kambing
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-3.5 whitespace-nowrap">
                                {isHibah ? (
                                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                                    🎁 Hibah
                                  </span>
                                ) : (
                                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-900 border border-blue-300">
                                    🛒 Penjualan
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-3.5 text-slate-800 font-bold whitespace-nowrap">
                                {b.instansiPenerima || (isHibah ? 'Yayasan / Instansi Penerima' : 'Kantin / Pembeli')}
                              </td>
                              <td className="px-3 py-3.5 text-right font-black font-mono text-slate-900 text-sm whitespace-nowrap">
                                {(b.volumeLiters || 0).toLocaleString('id-ID')}{' '}
                                <span className="text-xs font-normal text-slate-500">Liter</span>
                              </td>
                              <td className="px-3 py-3.5 text-center whitespace-nowrap">
                                {isSent ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                    <span>Selesai</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                                    <span>Menunggu</span>
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-emerald-100 font-black text-slate-900 border-t-2 border-slate-300">
                        <tr>
                          <td colSpan={6} className="px-3 py-3 text-center bg-emerald-200 uppercase tracking-wider text-xs font-black">
                            TOTAL DISTRIBUSI SUSU SEGAR ({filteredBastList.length} Transaksi)
                          </td>
                          <td className="px-3 py-3 text-right text-emerald-950 font-black text-sm font-mono whitespace-nowrap">
                            {totalDistribusiVolume.toLocaleString('id-ID')} Liter
                          </td>
                          <td className="px-3 py-3 text-center text-xs font-bold text-emerald-900">
                            100% Tercatat
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* KATEGORI 3: LAPORAN SUSU OLAHAN (27 KOLOM STANDAR PENGOLAHAN)             */}
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
              Anda akan mengonfirmasi data perah <strong>{selectedFreshRecord.kegiatanPerah} ({selectedFreshRecord.jenisTernak === 'KAMBING' ? '🐐 Kambing' : '🐄 Sapi'})</strong> tanggal{' '}
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
                className="px-4 py-2 text-xs font-bold text-white bg-[#14532D] hover:bg-[#1e7240] rounded-xl shadow-xs"
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
                <span className="text-slate-500">Sesi & Produk:</span>
                <span className="font-bold text-slate-800">
                  Perah {selectedFreshRecord.kegiatanPerah} • {selectedFreshRecord.jenisTernak === 'KAMBING' ? '🐐 Susu Kambing' : '🐄 Susu Sapi'}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Susu Segar Masuk (Gross):</span>
                <span className="font-black text-slate-900">{selectedFreshRecord.produksiSusu} Liter</span>
              </div>
              <div className="flex justify-between py-1.5 text-amber-800">
                <span>Potongan {selectedFreshRecord.jenisTernak === 'KAMBING' ? 'Cempe' : 'Pedet'}:</span>
                <span className="font-bold">- {selectedFreshRecord.susuPedet} Liter</span>
              </div>
              <div className="flex justify-between py-1.5 text-rose-700">
                <span>Potongan Afkir / Rusak:</span>
                <span className="font-bold">- {selectedFreshRecord.susuAfkir} Liter</span>
              </div>
              <div className="flex justify-between py-2 bg-emerald-50 px-2.5 rounded-xl text-emerald-950 font-black">
                <span>Susu Siap Olah (Net):</span>
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
