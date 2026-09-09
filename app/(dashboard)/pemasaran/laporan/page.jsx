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
  Factory,
  Search,
  Eye,
  Printer,
  Info,
  ShoppingCart,
  Gift,
  AlertCircle,
  Clock,
  Check,
  X
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

  const sapiDailyList = useMemo(() => freshDailyList.filter(d => (d.jenisTernak || 'SAPI').toUpperCase() === 'SAPI'), [freshDailyList]);
  const kambingDailyList = useMemo(() => freshDailyList.filter(d => (d.jenisTernak || '').toUpperCase() === 'KAMBING'), [freshDailyList]);
  const totalSapiNet = useMemo(() => sapiDailyList.reduce((acc, d) => acc + Math.max(0, (d.totalGross || 0) - (d.totalPedet || 0) - (d.totalAfkir || 0)), 0), [sapiDailyList]);
  const totalKambingNet = useMemo(() => kambingDailyList.reduce((acc, d) => acc + Math.max(0, (d.totalGross || 0) - (d.totalPedet || 0) - (d.totalAfkir || 0)), 0), [kambingDailyList]);

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

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            LAPORAN & REKAPITULASI PEMASARAN
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {activeCategory === 'terima_fresh' && (
            <button
              onClick={exportFreshToExcel}
              className="inline-flex items-center gap-1.5 bg-[#14532D] hover:bg-[#1e7240] text-white px-4 py-2.5 rounded-2xl font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-300" />
              <span>Export Excel</span>
            </button>
          )}

          {activeCategory === 'distribusi_segar' && (
            <button
              onClick={exportBastToExcel}
              className="inline-flex items-center gap-1.5 bg-[#14532D] hover:bg-[#1e7240] text-white px-4 py-2.5 rounded-2xl font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-300" />
              <span>Export Excel</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-2xl font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-300" />
            <span>Cetak</span>
          </button>
        </div>
      </div>

      {/* 3 UTAMA KATEGORI NAVIGATION TABS */}
      <div className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/90 flex flex-wrap sm:flex-nowrap gap-1.5 print:hidden shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveCategory('terima_fresh')}
          className={`flex-1 flex items-center justify-center px-5 py-3 rounded-xl font-black text-xs sm:text-sm transition-all duration-150 cursor-pointer ${
            activeCategory === 'terima_fresh'
              ? 'bg-[#14532D] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          <span>1. Terima Susu Segar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('distribusi_segar')}
          className={`flex-1 flex items-center justify-center px-5 py-3 rounded-xl font-black text-xs sm:text-sm transition-all duration-150 cursor-pointer ${
            activeCategory === 'distribusi_segar'
              ? 'bg-[#14532D] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          <span>2. Distribusi Susu Segar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('susu_olahan')}
          className={`flex-1 flex items-center justify-center px-5 py-3 rounded-xl font-black text-xs sm:text-sm transition-all duration-150 cursor-pointer ${
            activeCategory === 'susu_olahan'
              ? 'bg-[#14532D] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          <span>3. Susu Olahan</span>
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


              {/* 3 Summary KPI Cards strictly aligned */}
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
                      {totalFreshGross.toLocaleString('id-ID')}{' '}
                      <span className="text-xs font-bold text-slate-900 font-sans">Liter</span>
                    </h3>
                    <p className="text-[11px] text-slate-700 font-bold">
                      Total perah kandang ({freshCommodity === 'KAMBING' ? 'Kambing' : 'Sapi'})
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
                      {(totalFreshPedet + totalFreshAfkir).toLocaleString('id-ID')}{' '}
                      <span className="text-xs font-bold text-slate-900 font-sans">Liter</span>
                    </h3>
                    <p className="text-[11px] text-rose-600 font-bold">
                      {totalFreshPedet} L {freshCommodity === 'KAMBING' ? 'Cempe' : 'Pedet'} • {totalFreshAfkir} L Afkir
                    </p>
                  </div>
                </div>

                {/* Card 3: Masuk Pengolahan (Net) */}
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
                      {totalFreshNet.toLocaleString('id-ID')}{' '}
                      <span className="text-xs font-bold text-slate-900 font-sans">Liter</span>
                    </h3>
                    <p className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline stroke-[2.5]" />
                      <span>Susu siap olah (100% Pas)</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Filter Bar: Controls on Left, Komoditas Switcher on Right */}
              <div className="bg-white p-3 sm:p-4 rounded-3xl border border-slate-200/80 shadow-xs print:hidden">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Left: Komoditas Ternak Switcher */}
                  <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/90 gap-1 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setFreshCommodity('SAPI')}
                      className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all duration-150 cursor-pointer ${
                        freshCommodity === 'SAPI'
                          ? 'bg-[#14532D] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                      }`}
                    >
                      Susu Sapi Segar
                    </button>

                    <button
                      type="button"
                      onClick={() => setFreshCommodity('KAMBING')}
                      className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all duration-150 cursor-pointer ${
                        freshCommodity === 'KAMBING'
                          ? 'bg-[#14532D] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                      }`}
                    >
                      Susu Kambing Segar
                    </button>
                  </div>

                  {/* Right: Search & Filter Controls */}
                  <div className="flex flex-wrap items-center gap-2.5 ml-auto">
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

                    {/* Dropdown Periode */}
                    <select
                      value={freshTimeFilter}
                      onChange={(e) => setFreshTimeFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-300 rounded-2xl px-3 py-1.5 text-xs font-bold text-slate-800 shadow-2xs hover:bg-white transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      <option value="ALL">Periode</option>
                      <option value="TODAY">Hari Ini</option>
                      <option value="7DAYS">7 Hari Terakhir</option>
                      <option value="MONTH">Bulan Ini</option>
                    </select>

                    {/* Dropdown Status */}
                    <select
                      value={freshStatusFilter}
                      onChange={(e) => setFreshStatusFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-300 rounded-2xl px-3 py-1.5 text-xs font-bold text-slate-800 shadow-2xs hover:bg-white transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      <option value="ALL">Status</option>
                      <option value="DITERIMA">Selesai / Diterima</option>
                      <option value="MENUNGGU_VERIFIKASI">Menunggu Verifikasi</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* TABEL: REKAPITULASI HARIAN */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
                {filteredFreshDailyList.length === 0 ? (
                  <EmptyState
                    title={`Tidak Ada Data Susu ${freshCommodity === 'KAMBING' ? 'Kambing' : 'Sapi'}`}
                    description="Tidak ditemukan data rekapan harian susu segar untuk filter ini."
                  />
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-[#14532D] text-white uppercase font-bold text-[11px] select-none">
                        <tr>
                          <th className="px-3 py-3.5 text-center w-10 text-white font-bold">No</th>
                          <th className="px-3 py-3.5 whitespace-nowrap text-white font-bold">Tanggal</th>
                          <th className="px-3 py-3.5 text-right font-black text-white whitespace-nowrap">Susu Segar Masuk</th>
                          <th className="px-3 py-3.5 text-right text-emerald-100 font-bold whitespace-nowrap">
                            {freshCommodity === 'KAMBING' ? 'Cempe' : 'Pedet'} (L)
                          </th>
                          <th className="px-3 py-3.5 text-right text-emerald-100 font-bold whitespace-nowrap">Susu Afkir (L)</th>
                          <th className="px-3 py-3.5 text-right font-black text-white whitespace-nowrap">Diterima Pemasaran</th>
                          <th className="px-3 py-3.5 text-center font-bold text-white whitespace-nowrap">Kesesuaian</th>
                          <th className="px-3 py-3.5 text-center font-bold text-white whitespace-nowrap">Status</th>
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
                      <tfoot className="bg-slate-50 font-black text-slate-900 border-t-2 border-slate-200">
                        <tr>
                          <td colSpan={2} className="px-3 py-3 text-center bg-slate-100 text-xs uppercase tracking-wider font-black text-slate-800">
                            TOTAL AKUMULASI ({filteredFreshDailyList.length} HARI)
                          </td>
                          <td className="px-3 py-3 text-right font-mono font-black text-slate-900">{totalFreshGross.toLocaleString('id-ID')} L</td>
                          <td className="px-3 py-3 text-right font-mono text-slate-700">
                            {totalFreshPedet.toLocaleString('id-ID')} L
                          </td>
                          <td className="px-3 py-3 text-right font-mono text-rose-700">
                            {totalFreshAfkir.toLocaleString('id-ID')} L
                          </td>
                          <td className="px-3 py-3 text-right font-black font-mono text-slate-900 text-sm">
                            {totalFreshNet.toLocaleString('id-ID')} Liter
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
            </div>
          )}

          {/* ========================================================================= */}
          {/* KATEGORI 2: LAPORAN REKAP DISTRIBUSI SUSU SEGAR (PENJUALAN & HIBAH)       */}
          {/* ========================================================================= */}
          {activeCategory === 'distribusi_segar' && (
            <div className="space-y-6">
              {/* 3 KPI Metric Cards for Distribusi */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Card 1: Penjualan Langsung */}
                <div className="bg-white rounded-3xl p-6 border border-emerald-300 shadow-2xs space-y-3 hover:shadow-xs transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider">
                      1. Penjualan Langsung
                    </span>
                    <div className="p-2.5 bg-[#14532D] text-white rounded-2xl shadow-2xs">
                      <ShoppingCart className="w-4 h-4 text-emerald-300" />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                      {totalDistribusiPenjualan.toLocaleString('id-ID')}{' '}
                      <span className="text-xs font-bold text-slate-900 font-sans">Liter</span>
                    </h3>
                    <p className="text-[11px] text-slate-700 font-bold">
                      Penjualan langsung susu segar
                    </p>
                  </div>
                </div>

                {/* Card 2: Hibah */}
                <div className="bg-white rounded-3xl p-6 border border-emerald-300 shadow-2xs space-y-3 hover:shadow-xs transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider">
                      2. Hibah
                    </span>
                    <div className="p-2.5 bg-[#14532D] text-white rounded-2xl shadow-2xs">
                      <Gift className="w-4 h-4 text-emerald-300" />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                      {totalDistribusiHibah.toLocaleString('id-ID')}{' '}
                      <span className="text-xs font-bold text-slate-900 font-sans">Liter</span>
                    </h3>
                    <p className="text-[11px] text-slate-700 font-bold">
                      Penyaluran hibah susu segar
                    </p>
                  </div>
                </div>

                {/* Card 3: Total Distribusi Susu Segar */}
                <div className="bg-white rounded-3xl p-6 border border-emerald-300 shadow-2xs space-y-3 hover:shadow-xs transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider">
                      3. Total Distribusi Susu Segar
                    </span>
                    <div className="p-2.5 bg-[#14532D] text-white rounded-2xl shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                      {totalDistribusiVolume.toLocaleString('id-ID')}{' '}
                      <span className="text-xs font-bold text-slate-900 font-sans">Liter</span>
                    </h3>
                    <p className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline stroke-[2.5]" />
                      <span>Akumulasi seluruh alokasi susu segar</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-end gap-2.5">
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

                  {/* Dropdown Periode */}
                  <select
                    value={bastTimeFilter}
                    onChange={(e) => setBastTimeFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-2xl px-3 py-1.5 text-xs font-bold text-slate-800 shadow-2xs hover:bg-white transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="ALL">Periode</option>
                    <option value="TODAY">Hari Ini</option>
                    <option value="7DAYS">7 Hari Terakhir</option>
                    <option value="MONTH">Bulan Ini</option>
                  </select>

                  {/* Dropdown Jenis Alokasi */}
                  <select
                    value={bastDemandFilter}
                    onChange={(e) => setBastDemandFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-2xl px-3 py-1.5 text-xs font-bold text-slate-800 shadow-2xs hover:bg-white transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="ALL">Semua Alokasi</option>
                    <option value="PENJUALAN_LANGSUNG">Penjualan Langsung</option>
                    <option value="HIBAH">Hibah</option>
                  </select>

                  {/* Dropdown Ternak */}
                  <select
                    value={bastAnimalFilter}
                    onChange={(e) => setBastAnimalFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-2xl px-3 py-1.5 text-xs font-bold text-slate-800 shadow-2xs hover:bg-white transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="ALL">Jenis Susu</option>
                    <option value="SAPI">Susu Sapi</option>
                    <option value="KAMBING">Susu Kambing</option>
                  </select>
                </div>

                {filteredBastList.length === 0 ? (
                  <EmptyState
                    title="Tidak Ada Data Penyaluran Susu Segar"
                    description="Belum ada data distribusi atau hibah susu segar yang cocok dengan filter."
                  />
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-[#14532D] text-white uppercase font-bold text-[11px] select-none">
                        <tr>
                          <th className="px-3 py-3.5 text-center w-10 text-white font-bold">No</th>
                          <th className="px-3 py-3.5 whitespace-nowrap text-white font-bold">Tanggal Penyaluran</th>
                          <th className="px-3 py-3.5 whitespace-nowrap text-white font-bold">Nomor Dokumen / BAST</th>
                          <th className="px-3 py-3.5 whitespace-nowrap text-white font-bold">Jenis Susu</th>
                          <th className="px-3 py-3.5 whitespace-nowrap text-white font-bold">Jenis Alokasi</th>
                          <th className="px-3 py-3.5 whitespace-nowrap text-white font-bold">Tujuan / Penerima</th>
                          <th className="px-3 py-3.5 text-right font-black text-white whitespace-nowrap">Volume (Liter)</th>
                          <th className="px-3 py-3.5 text-center font-bold text-white whitespace-nowrap">Status Dokumen</th>
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
                                  <span className="font-mono text-slate-800">{b.nomorBast}</span>
                                ) : (
                                  <span className="text-slate-400 font-medium italic">Penjualan Langsung</span>
                                )}
                              </td>
                              <td className="px-3 py-3.5 whitespace-nowrap font-bold text-slate-800">
                                {animal === 'SAPI' ? 'Susu Sapi' : 'Susu Kambing'}
                              </td>
                              <td className="px-3 py-3.5 whitespace-nowrap font-bold text-slate-800">
                                {isHibah ? 'Hibah' : 'Penjualan'}
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
                                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800">
                                    <span className="w-4 h-4 rounded-full bg-emerald-700 flex items-center justify-center shrink-0">
                                      <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />
                                    </span>
                                    <span>Selesai</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800">
                                    <span className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                      <Clock className="w-2.5 h-2.5 text-amber-700 stroke-[2.5]" />
                                    </span>
                                    <span>Menunggu</span>
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-slate-50 font-black text-slate-900 border-t-2 border-slate-200">
                        <tr>
                          <td colSpan={6} className="px-3 py-3 text-center bg-slate-100 uppercase tracking-wider text-xs font-black text-slate-800">
                            TOTAL DISTRIBUSI SUSU SEGAR ({filteredBastList.length} Transaksi)
                          </td>
                          <td className="px-3 py-3 text-right text-slate-900 font-black text-sm font-mono whitespace-nowrap">
                            {totalDistribusiVolume.toLocaleString('id-ID')} Liter
                          </td>
                          <td className="px-3 py-3 text-center text-xs font-bold text-slate-700">
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
              Anda akan mengonfirmasi data perah <strong>{selectedFreshRecord.kegiatanPerah} ({selectedFreshRecord.jenisTernak === 'KAMBING' ? 'Kambing' : 'Sapi'})</strong> tanggal{' '}
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
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
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
                  Perah {selectedFreshRecord.kegiatanPerah} • {selectedFreshRecord.jenisTernak === 'KAMBING' ? 'Susu Kambing' : 'Susu Sapi'}
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
              <div className="flex justify-between py-2 bg-slate-100 px-2.5 rounded-xl text-slate-900 font-black">
                <span>Susu Siap Olah:</span>
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
