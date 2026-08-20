'use client';

import React, { useState, useMemo } from 'react';
import ExcelJS from 'exceljs';
import {
  Download,
  Printer,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Edit,
  RotateCcw,
  Search,
  Filter,
  Package,
  Milk,
  ChevronDown,
  Info
} from 'lucide-react';
import Toast from '@/components/Toast';

export default function PengemasanReportTable({
  reports = [],
  summary = {},
  loading = false,
  onRefresh,
  onConfirmReceive,
  onRequestCorrection,
  onAddNewReport,
  readOnly = false,
  showActions = true,
}) {
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmNotes, setConfirmNotes] = useState('');
  const [correctionNotes, setCorrectionNotes] = useState('');
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().slice(0, 10),
    farmTgs: 0,
    farmLpk: 0,
    farmMgl: 0,
    susu115ml: 0,
    susu130ml: 0,
    susu200ml: 0,
    susu250ml: 0,
    yogurt200ml: 0,
    eduwisata115ml: 0,
    eduwisata250ml: 0,
    spp115ml: 0,
    spp200ml: 0,
    lainSusu115ml: 0,
    lainSusu250ml: 0,
    lainYogurt200ml: 0,
    hibahInternal115ml: 0,
    hibahEksternal200ml: 0,
    rusakAfkir: 0,
    notes: '',
  });

  const [timeFilter, setTimeFilter] = useState('ALL'); // 'ALL' | 'TODAY' | '7DAYS' | 'MONTH' | 'CUSTOM'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' = Tanggal 1 - 31, 'desc' = Tanggal 31 - 1

  // Filtered and sorted rows (Default: Tanggal 1 s/d 31 dalam 1 bulan)
  const filteredReports = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const d7 = new Date();
    d7.setDate(d7.getDate() - 7);
    const d7Str = d7.toISOString().slice(0, 10);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

    const list = reports.filter((r) => {
      const matchSearch =
        !searchTerm ||
        r.tanggal.includes(searchTerm) ||
        (r.notes && r.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;

      let matchTime = true;
      if (timeFilter === 'TODAY') {
        matchTime = r.tanggal === today;
      } else if (timeFilter === '7DAYS') {
        matchTime = r.tanggal >= d7Str;
      } else if (timeFilter === 'MONTH') {
        matchTime = r.tanggal >= monthStart && r.tanggal <= monthEnd;
      } else if (timeFilter === 'CUSTOM') {
        if (startDate && r.tanggal < startDate) matchTime = false;
        if (endDate && r.tanggal > endDate) matchTime = false;
      }

      return matchSearch && matchStatus && matchTime;
    });

    return list.sort((a, b) => {
      if (sortOrder === 'desc') {
        return new Date(b.tanggal) - new Date(a.tanggal);
      }
      return new Date(a.tanggal) - new Date(b.tanggal);
    });
  }, [reports, searchTerm, statusFilter, sortOrder, timeFilter, startDate, endDate]);

  // Dynamic calculated summary for active filtered rows
  const activeSummary = useMemo(() => {
    return filteredReports.reduce(
      (acc, r) => ({
        farmTgs: acc.farmTgs + (r.farmTgs || 0),
        farmLpk: acc.farmLpk + (r.farmLpk || 0),
        farmMgl: acc.farmMgl + (r.farmMgl || 0),
        totalPengambilan: acc.totalPengambilan + (r.totalPengambilan || 0),
        susu115ml: acc.susu115ml + (r.susu115ml || 0),
        susu130ml: acc.susu130ml + (r.susu130ml || 0),
        susu200ml: acc.susu200ml + (r.susu200ml || 0),
        susu250ml: acc.susu250ml + (r.susu250ml || 0),
        yogurt200ml: acc.yogurt200ml + (r.yogurt200ml || 0),
        totalPengolahan: acc.totalPengolahan + (r.totalPengolahan || 0),
        eduwisata115ml: acc.eduwisata115ml + (r.eduwisata115ml || 0),
        eduwisata250ml: acc.eduwisata250ml + (r.eduwisata250ml || 0),
        spp115ml: acc.spp115ml + (r.spp115ml || 0),
        spp200ml: acc.spp200ml + (r.spp200ml || 0),
        lainSusu115ml: acc.lainSusu115ml + (r.lainSusu115ml || 0),
        lainSusu250ml: acc.lainSusu250ml + (r.lainSusu250ml || 0),
        lainYogurt200ml: acc.lainYogurt200ml + (r.lainYogurt200ml || 0),
        hibahInternal115ml: acc.hibahInternal115ml + (r.hibahInternal115ml || 0),
        hibahEksternal200ml: acc.hibahEksternal200ml + (r.hibahEksternal200ml || 0),
        totalDistribusi: acc.totalDistribusi + (r.totalDistribusi || 0),
        rusakAfkir: acc.rusakAfkir + (r.rusakAfkir || 0),
        sisaSusu115ml: acc.sisaSusu115ml + (r.sisaSusu115ml || 0),
        sisaSusu250ml: acc.sisaSusu250ml + (r.sisaSusu250ml || 0),
        sisaYogurt: acc.sisaYogurt + (r.sisaYogurt || 0),
        jumlahStok: acc.jumlahStok + (r.jumlahStok || 0),
      }),
      {
        farmTgs: 0,
        farmLpk: 0,
        farmMgl: 0,
        totalPengambilan: 0,
        susu115ml: 0,
        susu130ml: 0,
        susu200ml: 0,
        susu250ml: 0,
        yogurt200ml: 0,
        totalPengolahan: 0,
        eduwisata115ml: 0,
        eduwisata250ml: 0,
        spp115ml: 0,
        spp200ml: 0,
        lainSusu115ml: 0,
        lainSusu250ml: 0,
        lainYogurt200ml: 0,
        hibahInternal115ml: 0,
        hibahEksternal200ml: 0,
        totalDistribusi: 0,
        rusakAfkir: 0,
        sisaSusu115ml: 0,
        sisaSusu250ml: 0,
        sisaYogurt: 0,
        jumlahStok: 0,
      }
    );
  }, [filteredReports]);

  // Handle Export to Excel with full Multi-level Header structure
  const exportToExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Rekap Pengemasan & Distribusi');

      // Title rows
      worksheet.mergeCells('A1', 'AA1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'LAPORAN HASIL PENGOLAHAN DAN DISTRIBUSI SUSU';
      titleCell.font = { size: 14, bold: true, color: { argb: 'FFFFFF' } };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '1E3F20' },
      };
      worksheet.getRow(1).height = 30;

      worksheet.mergeCells('A2', 'AA2');
      const subCell = worksheet.getCell('A2');
      subCell.value = `BBPTUHPT BATURRADEN | Tanggal Ekspor: ${new Date().toLocaleDateString('id-ID')}`;
      subCell.font = { size: 10, italic: true };
      subCell.alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getRow(2).height = 20;

      worksheet.addRow([]); // empty row 3

      // Row 4: Level 1 Header
      // NO(A), TANGGAL(B), PENGAMBILAN(C-F), HASIL PENGOLAHAN(G-L), DISTRIBUSI(M-V), RUSAK(W), SISA STOK(X-Z), JUMLAH STOK(AA)
      worksheet.mergeCells('A4', 'A7');
      worksheet.getCell('A4').value = 'NO';

      worksheet.mergeCells('B4', 'B7');
      worksheet.getCell('B4').value = 'TANGGAL';

      worksheet.mergeCells('C4', 'F4');
      worksheet.getCell('C4').value = 'PENGAMBILAN SUSU SEGAR (LITER)';

      worksheet.mergeCells('G4', 'L4');
      worksheet.getCell('G4').value = 'HASIL PENGOLAHAN';

      worksheet.mergeCells('M4', 'V4');
      worksheet.getCell('M4').value = 'DISTRIBUSI';

      worksheet.mergeCells('W4', 'W7');
      worksheet.getCell('W4').value = 'RUSAK/ AFKIR (Botol)';

      worksheet.mergeCells('X4', 'Z4');
      worksheet.getCell('X4').value = 'Sisa Stok (Botol)';

      worksheet.mergeCells('AA4', 'AA7');
      worksheet.getCell('AA4').value = 'Jumlah Stok (botol)';

      // Row 5: Level 2 Header
      // Under Pengambilan
      worksheet.mergeCells('C5', 'C7');
      worksheet.getCell('C5').value = 'FARM TGS';
      worksheet.mergeCells('D5', 'D7');
      worksheet.getCell('D5').value = 'FARM LPK';
      worksheet.mergeCells('E5', 'E7');
      worksheet.getCell('E5').value = 'FARM MGL';
      worksheet.mergeCells('F5', 'F7');
      worksheet.getCell('F5').value = 'TOTAL';

      // Under Hasil Pengolahan
      worksheet.mergeCells('G5', 'J6');
      worksheet.getCell('G5').value = 'Susu Pasturisasi (Botol/Cup)';
      worksheet.mergeCells('K5', 'K7');
      worksheet.getCell('K5').value = 'Yogurt Ukuran 200 ml (Botol)';
      worksheet.mergeCells('L5', 'L7');
      worksheet.getCell('L5').value = 'TOTAL (Botol)';

      // Under Distribusi
      worksheet.mergeCells('M5', 'S5');
      worksheet.getCell('M5').value = 'PENJUALAN (Botol)';
      worksheet.mergeCells('T5', 'U5');
      worksheet.getCell('T5').value = 'HIBAH (Botol)';
      worksheet.mergeCells('V5', 'V7');
      worksheet.getCell('V5').value = 'TOTAL (Botol)';

      // Under Sisa Stok
      worksheet.mergeCells('X5', 'X7');
      worksheet.getCell('X5').value = 'Susu Ukuran 115 ml';
      worksheet.mergeCells('Y5', 'Y7');
      worksheet.getCell('Y5').value = 'Susu Ukuran 250 ml';
      worksheet.mergeCells('Z5', 'Z7');
      worksheet.getCell('Z5').value = 'Yogurt';

      // Row 6: Level 3 Header (under PENJUALAN & HIBAH)
      worksheet.mergeCells('M6', 'N6');
      worksheet.getCell('M6').value = 'EDUWISATA';
      worksheet.mergeCells('O6', 'P6');
      worksheet.getCell('O6').value = 'SPP';
      worksheet.mergeCells('Q6', 'S6');
      worksheet.getCell('Q6').value = 'LAIN-LAIN';
      worksheet.mergeCells('T6', 'T6');
      worksheet.getCell('T6').value = 'INTERNAL';
      worksheet.mergeCells('U6', 'U6');
      worksheet.getCell('U6').value = 'EKSTERNAL';

      // Row 7: Level 4 Sub-headers (Leafs)
      worksheet.getCell('G7').value = 'Ukuran 115 ml';
      worksheet.getCell('H7').value = 'Ukuran 130 ml';
      worksheet.getCell('I7').value = 'Ukuran 200 ml';
      worksheet.getCell('J7').value = 'Ukuran 250 ml';

      worksheet.getCell('M7').value = 'Ukuran 115 ml';
      worksheet.getCell('N7').value = 'Ukuran 250 ml';
      worksheet.getCell('O7').value = 'Ukuran 115 ml';
      worksheet.getCell('P7').value = 'Ukuran 200 ml';
      worksheet.getCell('Q7').value = 'Susu Ukuran 115 ml';
      worksheet.getCell('R7').value = 'Susu Ukuran 250 ml';
      worksheet.getCell('S7').value = 'Yogurt Ukuran 200 ml';
      worksheet.getCell('T7').value = 'Susu Ukuran 115 ml';
      worksheet.getCell('U7').value = 'Susu Ukuran 200 ml';

      // Apply Header Styles (Rows 4 to 7)
      for (let r = 4; r <= 7; r++) {
        const row = worksheet.getRow(r);
        row.height = 24;
        row.eachCell((cell) => {
          cell.font = { bold: true, size: 9, color: { argb: 'FFFFFF' } };
          cell.alignment = {
            horizontal: 'center',
            vertical: 'middle',
            wrapText: true,
          };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '1E3F20' },
          };
          cell.border = {
            top: { style: 'thin', color: { argb: 'CCCCCC' } },
            left: { style: 'thin', color: { argb: 'CCCCCC' } },
            bottom: { style: 'thin', color: { argb: 'CCCCCC' } },
            right: { style: 'thin', color: { argb: 'CCCCCC' } },
          };
        });
      }

      // Add Data Rows
      filteredReports.forEach((item, index) => {
        const dataRow = worksheet.addRow([
          index + 1,
          new Date(item.tanggal).toLocaleDateString('id-ID'),
          item.farmTgs || 0,
          item.farmLpk || 0,
          item.farmMgl || 0,
          item.totalPengambilan || 0,
          item.susu115ml || 0,
          item.susu130ml || 0,
          item.susu200ml || 0,
          item.susu250ml || 0,
          item.yogurt200ml || 0,
          item.totalPengolahan || 0,
          item.eduwisata115ml || 0,
          item.eduwisata250ml || 0,
          item.spp115ml || 0,
          item.spp200ml || 0,
          item.lainSusu115ml || 0,
          item.lainSusu250ml || 0,
          item.lainYogurt200ml || 0,
          item.hibahInternal115ml || 0,
          item.hibahEksternal200ml || 0,
          item.totalDistribusi || 0,
          item.rusakAfkir || 0,
          item.sisaSusu115ml || 0,
          item.sisaSusu250ml || 0,
          item.sisaYogurt || 0,
          item.jumlahStok || 0,
        ]);

        dataRow.height = 20;
        dataRow.eachCell((cell, colNumber) => {
          cell.font = { size: 9 };
          cell.alignment = {
            horizontal: colNumber <= 2 ? 'center' : 'right',
            vertical: 'middle',
          };
          cell.border = {
            top: { style: 'thin', color: { argb: 'E2E8F0' } },
            left: { style: 'thin', color: { argb: 'E2E8F0' } },
            bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
            right: { style: 'thin', color: { argb: 'E2E8F0' } },
          };

          // Highlight Totals
          if ([6, 12, 22, 27].includes(colNumber)) {
            cell.font = { bold: true, size: 9 };
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'F1F5F9' },
            };
          }
        });
      });

      // Total Accumulation Row
      const totalRow = worksheet.addRow([
        'TOTAL AKUMULASI',
        '',
        summary.farmTgs || 0,
        summary.farmLpk || 0,
        summary.farmMgl || 0,
        summary.totalPengambilan || 0,
        summary.susu115ml || 0,
        summary.susu130ml || 0,
        summary.susu200ml || 0,
        summary.susu250ml || 0,
        summary.yogurt200ml || 0,
        summary.totalPengolahan || 0,
        summary.eduwisata115ml || 0,
        summary.eduwisata250ml || 0,
        summary.spp115ml || 0,
        summary.spp200ml || 0,
        summary.lainSusu115ml || 0,
        summary.lainSusu250ml || 0,
        summary.lainYogurt200ml || 0,
        summary.hibahInternal115ml || 0,
        summary.hibahEksternal200ml || 0,
        summary.totalDistribusi || 0,
        summary.rusakAfkir || 0,
        summary.sisaSusu115ml || 0,
        summary.sisaSusu250ml || 0,
        summary.sisaYogurt || 0,
        summary.jumlahStok || 0,
      ]);

      const lastRowIndex = worksheet.rowCount;
      worksheet.mergeCells(`A${lastRowIndex}`, `B${lastRowIndex}`);
      totalRow.height = 24;
      totalRow.eachCell((cell) => {
        cell.font = { bold: true, size: 9, color: { argb: '0F172A' } };
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FEF08A' },
        };
        cell.border = {
          top: { style: 'medium', color: { argb: '000000' } },
          bottom: { style: 'double', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: 'CCCCCC' } },
          right: { style: 'thin', color: { argb: 'CCCCCC' } },
        };
      });
      worksheet.getCell(`A${lastRowIndex}`).alignment = { horizontal: 'center', vertical: 'middle' };

      // Set Column Widths
      worksheet.columns.forEach((column, index) => {
        if (index === 0) column.width = 6;
        else if (index === 1) column.width = 14;
        else column.width = 12;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Laporan_Pengemasan_Distribusi_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);

      setToast({ type: 'success', message: 'Berhasil mengunduh Laporan Excel format standar!' });
    } catch (err) {
      console.error('Export Excel error:', err);
      setToast({ type: 'error', message: 'Gagal mengekspor laporan Excel.' });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (onAddNewReport) {
      const res = await onAddNewReport(formData);
      if (res?.success) {
        setShowAddModal(false);
        setToast({ type: 'success', message: 'Data laporan pengemasan berhasil ditambahkan!' });
      }
    }
  };

  const handleConfirmAction = async () => {
    if (!selectedReport) return;
    if (onConfirmReceive) {
      await onConfirmReceive(selectedReport.id, confirmNotes);
      setShowConfirmModal(false);
      setConfirmNotes('');
      setSelectedReport(null);
    }
  };

  const handleCorrectionAction = async () => {
    if (!selectedReport) return;
    if (onRequestCorrection) {
      await onRequestCorrection(selectedReport.id, correctionNotes);
      setShowCorrectionModal(false);
      setCorrectionNotes('');
      setSelectedReport(null);
    }
  };

  return (
    <div className="space-y-4">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Control Bar (Search, Filters, Export & Actions) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Time Filter Pills matching Susu Fresh style */}
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

          {/* Right Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {!readOnly && onAddNewReport && (
              <button
                onClick={() => {
                  setFormData({
                    tanggal: new Date().toISOString().slice(0, 10),
                    farmTgs: 0,
                    farmLpk: 0,
                    farmMgl: 0,
                    susu115ml: 0,
                    susu130ml: 0,
                    susu200ml: 0,
                    susu250ml: 0,
                    yogurt200ml: 0,
                    eduwisata115ml: 0,
                    eduwisata250ml: 0,
                    spp115ml: 0,
                    spp200ml: 0,
                    lainSusu115ml: 0,
                    lainSusu250ml: 0,
                    lainYogurt200ml: 0,
                    hibahInternal115ml: 0,
                    hibahEksternal200ml: 0,
                    rusakAfkir: 0,
                    notes: '',
                  });
                  setShowAddModal(true);
                }}
                className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Simulasi / Input Laporan</span>
              </button>
            )}

            <button
              onClick={exportToExcel}
              className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>
          </div>
        </div>

        {/* Second Row: Dropdown Filters & Search */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="ALL">Semua Status</option>
              <option value="MENUNGGU_PENERIMAAN">Menunggu Penerimaan</option>
              <option value="DITERIMA">Diterima (Disetujui)</option>
              <option value="PERLU_KOREKSI">Perlu Koreksi</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900"
            >
              <option value="asc">📅 Tanggal 1 s/d 31 (Urut Naik)</option>
              <option value="desc">📅 Tanggal 31 s/d 1 (Urut Turun)</option>
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2" />
              <input
                type="text"
                placeholder="Cari tanggal/catatan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 w-44 sm:w-56"
              />
            </div>

            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                title="Segarkan Data"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
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

      {/* Info Notification Note */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-emerald-950 print:hidden">
        <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Format Standar Laporan Pengemasan & Distribusi (27 Kolom):</span> Kolom <strong>Pengambilan Susu Segar (Liter)</strong> merupakan bahan baku masuk yang <strong>sama persis & terintegrasi dengan data Susu Siap Olah dari Admin Farm</strong> (0 Liter selisih), yang kemudian diproses menjadi hasil olahan (kemasan & yogurt), didistribusikan, hingga sisa stok harian.
        </div>
      </div>

      {/* Main Complex Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[750px] relative">
          <table className="w-full text-center text-[11px] border-collapse min-w-[1750px]">
            {/* 4-Tier Complex Header matching the reference image */}
            <thead className="bg-[#1E3F20] text-white sticky top-0 z-20 font-bold select-none">
              {/* LEVEL 1 HEADER */}
              <tr>
                <th rowSpan={4} className="border border-[#2b592e] px-2.5 py-2 w-10 sticky left-0 bg-[#1E3F20] z-30">
                  NO
                </th>
                <th rowSpan={4} className="border border-[#2b592e] px-3 py-2 w-28 sticky left-10 bg-[#1E3F20] z-30">
                  TANGGAL
                </th>
                <th colSpan={4} className="border border-[#2b592e] px-3 py-2 bg-[#234b26]">
                  PENGAMBILAN SUSU SEGAR (LITER)
                </th>
                <th colSpan={6} className="border border-[#2b592e] px-3 py-2 bg-[#1b431e]">
                  HASIL PENGOLAHAN
                </th>
                <th colSpan={10} className="border border-[#2b592e] px-3 py-2 bg-[#234b26]">
                  DISTRIBUSI
                </th>
                <th rowSpan={4} className="border border-[#2b592e] px-2.5 py-2 w-20 bg-[#1b431e]">
                  RUSAK/ AFKIR (Botol)
                </th>
                <th colSpan={3} className="border border-[#2b592e] px-3 py-2 bg-[#234b26]">
                  Sisa Stok (Botol)
                </th>
                <th rowSpan={4} className="border border-[#2b592e] px-3 py-2 w-24 bg-[#16331a]">
                  Jumlah Stok (botol)
                </th>
                {showActions && (
                  <th rowSpan={4} className="border border-[#2b592e] px-3 py-2 w-28 bg-[#16331a] print:hidden">
                    STATUS / AKSI
                  </th>
                )}
              </tr>

              {/* LEVEL 2 HEADER */}
              <tr>
                {/* Under Pengambilan */}
                <th rowSpan={3} className="border border-[#2b592e] px-2 py-1.5 w-16">
                  FARM TGS
                </th>
                <th rowSpan={3} className="border border-[#2b592e] px-2 py-1.5 w-16">
                  FARM LPK
                </th>
                <th rowSpan={3} className="border border-[#2b592e] px-2 py-1.5 w-16">
                  FARM MGL
                </th>
                <th rowSpan={3} className="border border-[#2b592e] px-2 py-1.5 w-20 bg-[#173e1a]">
                  TOTAL
                </th>

                {/* Under Hasil Pengolahan */}
                <th colSpan={4} rowSpan={2} className="border border-[#2b592e] px-2 py-1.5">
                  Susu Pasturisasi (Botol/Cup)
                </th>
                <th rowSpan={3} className="border border-[#2b592e] px-2 py-1.5 w-24">
                  Yogurt Ukuran 200 ml (Botol)
                </th>
                <th rowSpan={3} className="border border-[#2b592e] px-2 py-1.5 w-20 bg-[#173e1a]">
                  TOTAL (Botol)
                </th>

                {/* Under Distribusi */}
                <th colSpan={7} className="border border-[#2b592e] px-2 py-1.5 bg-[#1b431e]">
                  PENJUALAN (Botol)
                </th>
                <th colSpan={2} className="border border-[#2b592e] px-2 py-1.5 bg-[#234b26]">
                  HIBAH (Botol)
                </th>
                <th rowSpan={3} className="border border-[#2b592e] px-2 py-1.5 w-20 bg-[#173e1a]">
                  TOTAL (Botol)
                </th>

                {/* Under Sisa Stok */}
                <th rowSpan={3} className="border border-[#2b592e] px-2 py-1.5 w-20">
                  Susu Ukuran 115 ml
                </th>
                <th rowSpan={3} className="border border-[#2b592e] px-2 py-1.5 w-20">
                  Susu Ukuran 250 ml
                </th>
                <th rowSpan={3} className="border border-[#2b592e] px-2 py-1.5 w-20">
                  Yogurt
                </th>
              </tr>

              {/* LEVEL 3 HEADER */}
              <tr>
                {/* Under Penjualan */}
                <th colSpan={2} className="border border-[#2b592e] px-2 py-1 bg-[#163819]">
                  EDUWISATA
                </th>
                <th colSpan={2} className="border border-[#2b592e] px-2 py-1 bg-[#163819]">
                  SPP
                </th>
                <th colSpan={3} className="border border-[#2b592e] px-2 py-1 bg-[#163819]">
                  LAIN-LAIN
                </th>

                {/* Under Hibah */}
                <th className="border border-[#2b592e] px-2 py-1 bg-[#1e4822]">INTERNAL</th>
                <th className="border border-[#2b592e] px-2 py-1 bg-[#1e4822]">EKSTERNAL</th>
              </tr>

              {/* LEVEL 4 HEADER (LEAFS) */}
              <tr>
                {/* Under Susu Pasturisasi */}
                <th className="border border-[#2b592e] px-1.5 py-1 w-16 text-[10px]">Ukuran 115 ml</th>
                <th className="border border-[#2b592e] px-1.5 py-1 w-16 text-[10px]">Ukuran 130 ml</th>
                <th className="border border-[#2b592e] px-1.5 py-1 w-16 text-[10px]">Ukuran 200 ml</th>
                <th className="border border-[#2b592e] px-1.5 py-1 w-16 text-[10px]">Ukuran 250 ml</th>

                {/* Under Eduwisata */}
                <th className="border border-[#2b592e] px-1.5 py-1 w-16 text-[10px]">Ukuran 115 ml</th>
                <th className="border border-[#2b592e] px-1.5 py-1 w-16 text-[10px]">Ukuran 250 ml</th>

                {/* Under SPP */}
                <th className="border border-[#2b592e] px-1.5 py-1 w-16 text-[10px]">Ukuran 115 ml</th>
                <th className="border border-[#2b592e] px-1.5 py-1 w-16 text-[10px]">Ukuran 200 ml</th>

                {/* Under Lain-lain */}
                <th className="border border-[#2b592e] px-1.5 py-1 w-16 text-[10px]">Susu Ukuran 115 ml</th>
                <th className="border border-[#2b592e] px-1.5 py-1 w-16 text-[10px]">Susu Ukuran 250 ml</th>
                <th className="border border-[#2b592e] px-1.5 py-1 w-16 text-[10px]">Yogurt Ukuran 200 ml</th>

                {/* Under Hibah */}
                <th className="border border-[#2b592e] px-1.5 py-1 w-16 text-[10px]">Susu Ukuran 115 ml</th>
                <th className="border border-[#2b592e] px-1.5 py-1 w-16 text-[10px]">Susu Ukuran 200 ml</th>
              </tr>
            </thead>

            {/* TABLE BODY */}
            <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={showActions ? 28 : 27} className="py-12 text-center text-slate-400">
                    Tidak ada data laporan pengemasan untuk filter yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredReports.map((row, idx) => (
                  <tr
                    key={row.id || idx}
                    className="hover:bg-slate-50 transition-colors border-b border-slate-200"
                  >
                    {/* Sticky Left: No & Tanggal */}
                    <td className="border-r border-slate-200 px-2 py-2 sticky left-0 bg-white z-10 font-bold text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="border-r border-slate-200 px-2.5 py-2 sticky left-10 bg-white z-10 font-semibold whitespace-nowrap text-slate-700">
                      {new Date(row.tanggal).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Pengambilan Susu Segar */}
                    <td className="border-r border-slate-200 px-2 py-2 text-right">{row.farmTgs || 0}</td>
                    <td className="border-r border-slate-200 px-2 py-2 text-right">{row.farmLpk || 0}</td>
                    <td className="border-r border-slate-200 px-2 py-2 text-right">{row.farmMgl || 0}</td>
                    <td className="border-r border-slate-200 px-2 py-2 text-right font-black bg-blue-50/60 text-blue-900">
                      {row.totalPengambilan || 0}
                    </td>

                    {/* Hasil Pengolahan */}
                    <td className="border-r border-slate-200 px-2 py-2 text-right">{row.susu115ml || 0}</td>
                    <td className="border-r border-slate-200 px-2 py-2 text-right">{row.susu130ml || 0}</td>
                    <td className="border-r border-slate-200 px-2 py-2 text-right">{row.susu200ml || 0}</td>
                    <td className="border-r border-slate-200 px-2 py-2 text-right">{row.susu250ml || 0}</td>
                    <td className="border-r border-slate-200 px-2 py-2 text-right">{row.yogurt200ml || 0}</td>
                    <td className="border-r border-slate-200 px-2 py-2 text-right font-black bg-amber-50/70 text-amber-900">
                      {row.totalPengolahan || 0}
                    </td>

                    {/* Distribusi */}
                    <td className="border-r border-slate-200 px-2 py-2 text-right">{row.eduwisata115ml || 0}</td>
                    <td className="border-r border-slate-200 px-2 py-2 text-right">{row.eduwisata250ml || 0}</td>
                    <td className="border-r border-slate-200 px-2 py-2 text-right">{row.spp115ml || 0}</td>
                    <td className="border-r border-slate-200 px-2 py-2 text-right">{row.spp200ml || 0}</td>
                    <td className="border-r border-slate-200 px-2 py-2 text-right">{row.lainSusu115ml || 0}</td>
                    <td className="border-r border-slate-200 px-2 py-2 text-right">{row.lainSusu250ml || 0}</td>
                    <td className="border-r border-slate-200 px-2 py-2 text-right">{row.lainYogurt200ml || 0}</td>
                    <td className="border-r border-slate-200 px-2 py-2 text-right">{row.hibahInternal115ml || 0}</td>
                    <td className="border-r border-slate-200 px-2 py-2 text-right">{row.hibahEksternal200ml || 0}</td>
                    <td className="border-r border-slate-200 px-2 py-2 text-right font-black bg-rose-50/60 text-rose-900">
                      {row.totalDistribusi || 0}
                    </td>

                    {/* Rusak / Afkir */}
                    <td className="border-r border-slate-200 px-2 py-2 text-right font-bold text-rose-700 bg-rose-50/30">
                      {row.rusakAfkir || 0}
                    </td>

                    {/* Sisa Stok */}
                    <td className="border-r border-slate-200 px-2 py-2 text-right">{row.sisaSusu115ml || 0}</td>
                    <td className="border-r border-slate-200 px-2 py-2 text-right">{row.sisaSusu250ml || 0}</td>
                    <td className="border-r border-slate-200 px-2 py-2 text-right">{row.sisaYogurt || 0}</td>

                    {/* Jumlah Stok */}
                    <td className="border-r border-slate-200 px-2 py-2 text-right font-black text-emerald-900 bg-emerald-50/80">
                      {row.jumlahStok || 0}
                    </td>

                    {/* Actions / Status */}
                    {showActions && (
                      <td className="px-2 py-1.5 whitespace-nowrap print:hidden">
                        {row.status === 'MENUNGGU_PENERIMAAN' ? (
                          <div className="flex items-center gap-1.5 justify-center">
                            <button
                              onClick={() => {
                                setSelectedReport(row);
                                setShowConfirmModal(true);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm"
                            >
                              Terima
                            </button>
                            <button
                              onClick={() => {
                                setSelectedReport(row);
                                setShowCorrectionModal(true);
                              }}
                              className="bg-amber-100 hover:bg-amber-200 text-amber-900 px-2 py-1 rounded-lg text-[10px] font-bold"
                            >
                              Koreksi
                            </button>
                          </div>
                        ) : row.status === 'DITERIMA' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            Diterima
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" />
                            Perlu Koreksi
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>

            {/* TOTAL AKUMULASI FOOTER */}
            <tfoot className="bg-amber-100/80 text-slate-900 font-black border-t-2 border-slate-300 sticky bottom-0 z-20">
              <tr>
                <td colSpan={2} className="border-r border-slate-300 px-3 py-2.5 text-center bg-amber-200 sticky left-0 z-30">
                  TOTAL AKUMULASI ({filteredReports.length} Baris)
                </td>
                <td className="border-r border-slate-300 px-2 py-2 text-right">{(activeSummary.farmTgs || 0).toLocaleString('id-ID')}</td>
                <td className="border-r border-slate-300 px-2 py-2 text-right">{(activeSummary.farmLpk || 0).toLocaleString('id-ID')}</td>
                <td className="border-r border-slate-300 px-2 py-2 text-right">{(activeSummary.farmMgl || 0).toLocaleString('id-ID')}</td>
                <td className="border-r border-slate-300 px-2 py-2 text-right bg-blue-100 text-blue-950 font-black">
                  {(activeSummary.totalPengambilan || 0).toLocaleString('id-ID')}
                </td>

                <td className="border-r border-slate-300 px-2 py-2 text-right">{(activeSummary.susu115ml || 0).toLocaleString('id-ID')}</td>
                <td className="border-r border-slate-300 px-2 py-2 text-right">{(activeSummary.susu130ml || 0).toLocaleString('id-ID')}</td>
                <td className="border-r border-slate-300 px-2 py-2 text-right">{(activeSummary.susu200ml || 0).toLocaleString('id-ID')}</td>
                <td className="border-r border-slate-300 px-2 py-2 text-right">{(activeSummary.susu250ml || 0).toLocaleString('id-ID')}</td>
                <td className="border-r border-slate-300 px-2 py-2 text-right">{(activeSummary.yogurt200ml || 0).toLocaleString('id-ID')}</td>
                <td className="border-r border-slate-300 px-2 py-2 text-right bg-amber-200 text-amber-950 font-black">
                  {(activeSummary.totalPengolahan || 0).toLocaleString('id-ID')}
                </td>

                <td className="border-r border-slate-300 px-2 py-2 text-right">{(activeSummary.eduwisata115ml || 0).toLocaleString('id-ID')}</td>
                <td className="border-r border-slate-300 px-2 py-2 text-right">{(activeSummary.eduwisata250ml || 0).toLocaleString('id-ID')}</td>
                <td className="border-r border-slate-300 px-2 py-2 text-right">{(activeSummary.spp115ml || 0).toLocaleString('id-ID')}</td>
                <td className="border-r border-slate-300 px-2 py-2 text-right">{(activeSummary.spp200ml || 0).toLocaleString('id-ID')}</td>
                <td className="border-r border-slate-300 px-2 py-2 text-right">{(activeSummary.lainSusu115ml || 0).toLocaleString('id-ID')}</td>
                <td className="border-r border-slate-300 px-2 py-2 text-right">{(activeSummary.lainSusu250ml || 0).toLocaleString('id-ID')}</td>
                <td className="border-r border-slate-300 px-2 py-2 text-right">{(activeSummary.lainYogurt200ml || 0).toLocaleString('id-ID')}</td>
                <td className="border-r border-slate-300 px-2 py-2 text-right">{(activeSummary.hibahInternal115ml || 0).toLocaleString('id-ID')}</td>
                <td className="border-r border-slate-300 px-2 py-2 text-right">{(activeSummary.hibahEksternal200ml || 0).toLocaleString('id-ID')}</td>
                <td className="border-r border-slate-300 px-2 py-2 text-right bg-rose-100 text-rose-950 font-black">
                  {(activeSummary.totalDistribusi || 0).toLocaleString('id-ID')}
                </td>

                <td className="border-r border-slate-300 px-2 py-2 text-right text-rose-800 font-black">
                  {(activeSummary.rusakAfkir || 0).toLocaleString('id-ID')}
                </td>

                <td className="border-r border-slate-300 px-2 py-2 text-right">{(activeSummary.sisaSusu115ml || 0).toLocaleString('id-ID')}</td>
                <td className="border-r border-slate-300 px-2 py-2 text-right">{(activeSummary.sisaSusu250ml || 0).toLocaleString('id-ID')}</td>
                <td className="border-r border-slate-300 px-2 py-2 text-right">{(activeSummary.sisaYogurt || 0).toLocaleString('id-ID')}</td>

                <td className="border-r border-slate-300 px-2 py-2 text-right bg-emerald-200 text-emerald-950 font-black">
                  {(activeSummary.jumlahStok || 0).toLocaleString('id-ID')}
                </td>
                {showActions && <td className="print:hidden"></td>}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-emerald-700">
              <CheckCircle2 className="w-6 h-6" />
              <h3 className="text-base font-black text-slate-800">Konfirmasi Penerimaan Hasil Pengemasan</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Anda akan mengesahkan penerimaan laporan pengemasan tanggal{' '}
              <strong>
                {new Date(selectedReport.tanggal).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </strong>
              . Stok sebanyak <strong>{selectedReport.jumlahStok} botol</strong> akan otomatis dicatat ke persediaan siap jual Pemasaran.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Verifikasi (Opsional):</label>
              <textarea
                value={confirmNotes}
                onChange={(e) => setConfirmNotes(e.target.value)}
                placeholder="Misal: Fisik telah diperiksa, botol tersegel rapi..."
                rows={2}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedReport(null);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow"
              >
                Sahkan & Terima ke Stok
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Correction Modal */}
      {showCorrectionModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-black text-slate-800">Minta Koreksi Data Pengemasan</h3>
            </div>

            <p className="text-xs text-slate-600">
              Kirim catatan perbaikan jika terdapat ketidaksesuaian jumlah botol atau selisih data pengambilan/distribusi.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Rincian Perlu Dikoreksi:</label>
              <textarea
                value={correctionNotes}
                onChange={(e) => setCorrectionNotes(e.target.value)}
                placeholder="Misal: Mohon cek kembali hasil pengolahan Susu 250ml selisih 10 botol..."
                rows={3}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowCorrectionModal(false);
                  setSelectedReport(null);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCorrectionAction}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow"
              >
                Kirim Permintaan Koreksi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add / Simulated Batch Input */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-3xl w-full shadow-2xl border border-slate-100 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-800">Input Data Laporan Pengemasan & Distribusi</h3>
                <p className="text-xs text-slate-500">Sesuaikan formulir sesuai 27 kolom standar laporan pengemasan</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {/* Tanggal */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tanggal Laporan</label>
                <input
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  required
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl w-full sm:w-48 text-xs"
                />
              </div>

              {/* Group 1: Pengambilan Susu Segar */}
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-2">
                <h4 className="font-bold text-blue-900 text-xs">1. Pengambilan Susu Segar (Liter)</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-600">Farm TGS (Liter)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.farmTgs}
                      onChange={(e) => setFormData({ ...formData, farmTgs: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600">Farm LPK (Liter)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.farmLpk}
                      onChange={(e) => setFormData({ ...formData, farmLpk: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600">Farm MGL (Liter)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.farmMgl}
                      onChange={(e) => setFormData({ ...formData, farmMgl: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Group 2: Hasil Pengolahan */}
              <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-2">
                <h4 className="font-bold text-amber-900 text-xs">2. Hasil Pengolahan (Botol / Cup)</h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-600">Susu 115 ml</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.susu115ml}
                      onChange={(e) => setFormData({ ...formData, susu115ml: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600">Susu 130 ml</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.susu130ml}
                      onChange={(e) => setFormData({ ...formData, susu130ml: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600">Susu 200 ml</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.susu200ml}
                      onChange={(e) => setFormData({ ...formData, susu200ml: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600">Susu 250 ml</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.susu250ml}
                      onChange={(e) => setFormData({ ...formData, susu250ml: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600">Yogurt 200 ml</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.yogurt200ml}
                      onChange={(e) => setFormData({ ...formData, yogurt200ml: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Group 3: Distribusi Penjualan & Hibah */}
              <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-3">
                <h4 className="font-bold text-purple-900 text-xs">3. Distribusi (Penjualan & Hibah)</h4>

                {/* Eduwisata & SPP */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-600">Eduwisata 115 ml</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.eduwisata115ml}
                      onChange={(e) => setFormData({ ...formData, eduwisata115ml: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600">Eduwisata 250 ml</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.eduwisata250ml}
                      onChange={(e) => setFormData({ ...formData, eduwisata250ml: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600">SPP 115 ml</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.spp115ml}
                      onChange={(e) => setFormData({ ...formData, spp115ml: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600">SPP 200 ml</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.spp200ml}
                      onChange={(e) => setFormData({ ...formData, spp200ml: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                {/* Lain-lain & Hibah */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-purple-100">
                  <div>
                    <label className="block text-[11px] text-slate-600">Lain Susu 115 ml</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.lainSusu115ml}
                      onChange={(e) => setFormData({ ...formData, lainSusu115ml: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600">Lain Susu 250 ml</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.lainSusu250ml}
                      onChange={(e) => setFormData({ ...formData, lainSusu250ml: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600">Lain Yogurt 200 ml</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.lainYogurt200ml}
                      onChange={(e) => setFormData({ ...formData, lainYogurt200ml: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600">Hibah Internal 115 ml</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.hibahInternal115ml}
                      onChange={(e) => setFormData({ ...formData, hibahInternal115ml: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600">Hibah Eksternal 200 ml</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.hibahEksternal200ml}
                      onChange={(e) => setFormData({ ...formData, hibahEksternal200ml: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Group 4: Rusak / Afkir & Catatan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rusak / Afkir (Botol)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.rusakAfkir}
                    onChange={(e) => setFormData({ ...formData, rusakAfkir: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-rose-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Catatan / Keterangan</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Keterangan batch pengemasan..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow"
                >
                  Simpan Data Laporan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
