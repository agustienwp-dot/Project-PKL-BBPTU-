'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import {
  Printer,
  Download,
  RefreshCw,
  Package,
  Milk,
  FileSpreadsheet,
  Calendar,
  CheckCircle2,
  Tag
} from 'lucide-react';

export default function LaporanPengolahanPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [reportData, setReportData] = useState(null);
  const [activeView, setActiveView] = useState('PRODUKSI'); // 'PRODUKSI' or 'STOK_BAHAN'
  const [toast, setToast] = useState(null);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/monthly?month=${month}&year=${year}&t=${Date.now()}`);
      if (res.data?.success) {
        setReportData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching processing report:', err);
      setToast({ type: 'error', message: 'Gagal memuat laporan pengolahan.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [month, year]);

  const handlePrint = () => {
    window.print();
  };

  const dailyLogs = reportData?.dailyLogs || [];
  const monthlyTotals = reportData?.monthlyTotals || {};
  const summary = reportData?.summary || {};
  const materialUsage = reportData?.materialUsage || [];

  const fmtNum = (n) => (n > 0 ? n.toLocaleString('id-ID') : '0');

  const handleExportExcel = () => {
    if (!reportData) return;

    const isStok = activeView === 'STOK_BAHAN';
    const titleText = isStok
      ? `LAPORAN PERSEDIAAN SISA STOK BAHAN BAKU & KEMASAN`
      : `REKAPITULASI PENGOLAHAN & PRODUKSI SUSU OLAHAN SIAP JUAL`;
    const periodText = `BULAN: ${monthNames[month - 1].toUpperCase()} ${year}`;

    let tableHTML = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="UTF-8"></head>
      <body>
        <h2 style="text-align:center;">${titleText}</h2>
        <h3 style="text-align:center;">DIVISI UHT / PENGOLAHAN BBPTU HPT BATURRADEN - TAHUN ${year}</h3>
        <h4 style="text-align:center;">${periodText}</h4>
        <table border="1" style="border-collapse:collapse; text-align:center; font-size:11px;">
    `;

    if (isStok) {
      tableHTML += `
        <thead>
          <tr style="background-color:#1E3F20; color:white; font-weight:bold;">
            <th rowspan="2">No</th>
            <th rowspan="2">Tanggal</th>
            <th colspan="${materialUsage.length + 1}" style="background-color:#064e3b;">SISA STOK BAHAN BAKU & KEMASAN (REAL-TIME)</th>
          </tr>
          <tr style="background-color:#e2e8f0; font-weight:bold; color:black;">
            <th>SUSU SEGAR (LTR)</th>
            ${materialUsage.map(m => `<th>${m.name.toUpperCase()} (${(m.unit || 'PCS').toUpperCase()})</th>`).join('')}
          </tr>
        </thead>
        <tbody>
      `;

      dailyLogs.forEach((log) => {
        tableHTML += `
          <tr>
            <td>${log.day}</td>
            <td>${log.dateStr}</td>
            <td style="font-weight:bold; background-color:#eff6ff;">${summary.sisaStokSusuSegar || 0}</td>
            ${materialUsage.map(m => `<td>${m.finalStock || 0}</td>`).join('')}
          </tr>
        `;
      });

      tableHTML += `
        <tr style="font-weight:bold; background-color:#e2e8f0;">
          <td colspan="2">SISA STOK SAAT INI (REAL-TIME)</td>
          <td style="background-color:#bfdbfe;">${summary.sisaStokSusuSegar || 0}</td>
          ${materialUsage.map(m => `<td style="background-color:#fef3c7;">${m.finalStock || 0}</td>`).join('')}
        </tr>
      `;
    } else {
      tableHTML += `
        <thead>
          <tr style="background-color:#1E3F20; color:white; font-weight:bold;">
            <th rowspan="2">No</th>
            <th rowspan="2">Tanggal</th>
            <th colspan="2" style="background-color:#16331a;">BAHAN BAKU SUSU</th>
            <th colspan="6" style="background-color:#0D5C3A;">HASIL PRODUKSI (PCS)</th>
            <th rowspan="2" style="background-color:#084229;">JUMLAH PRODUK (PCS)</th>
          </tr>
          <tr style="background-color:#e2e8f0; font-weight:bold; color:black;">
            <th>SUSU DITERIMA (LTR)</th>
            <th>SUSU DIOLAH (LTR)</th>
            <th>SUSU 115 ML</th>
            <th>SUSU 130 ML</th>
            <th>SUSU 200 ML</th>
            <th>SUSU 250 ML</th>
            <th>YOGURT 200 ML</th>
            <th>KEJU</th>
          </tr>
        </thead>
        <tbody>
      `;

      dailyLogs.forEach((log) => {
        tableHTML += `
          <tr>
            <td>${log.day}</td>
            <td>${log.dateStr}</td>
            <td>${log.susuDiterima || 0}</td>
            <td>${log.susuDiolah || 0}</td>
            <td>${log.susu115 || 0}</td>
            <td>${log.susu130 || 0}</td>
            <td>${log.susu200 || 0}</td>
            <td>${log.susu250 || 0}</td>
            <td>${log.yogurt200 || 0}</td>
            <td>${log.keju || 0}</td>
            <td style="font-weight:bold; background-color:#dcfce7;">${log.totalProduk || 0}</td>
          </tr>
        `;
      });

      tableHTML += `
        <tr style="font-weight:bold; background-color:#e2e8f0;">
          <td colspan="2">JUMLAH TOTAL BULAN INI</td>
          <td>${monthlyTotals.susuDiterima || 0}</td>
          <td>${monthlyTotals.susuDiolah || 0}</td>
          <td>${monthlyTotals.susu115 || 0}</td>
          <td>${monthlyTotals.susu130 || 0}</td>
          <td>${monthlyTotals.susu200 || 0}</td>
          <td>${monthlyTotals.susu250 || 0}</td>
          <td>${monthlyTotals.yogurt200 || 0}</td>
          <td>${monthlyTotals.keju || 0}</td>
          <td style="background-color:#86efac;">${monthlyTotals.totalProduk || 0}</td>
        </tr>
      `;
    }

    tableHTML += `
        </tbody>
      </table>
    </body>
    </html>
    `;

    const blob = new Blob([tableHTML], { type: 'application/vnd.ms-excel;choice=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = isStok
      ? `Laporan_Sisa_Stok_Bahan_${monthNames[month - 1]}_${year}.xls`
      : `Laporan_Produksi_${monthNames[month - 1]}_${year}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-hidden print:p-0 print:h-auto print:overflow-visible">
      {/* LANDSCAPE PRINT STYLING INJECTION */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape !important;
            margin: 5mm 8mm !important;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background-color: #ffffff !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          table {
            font-size: 8.5px !important;
            width: 100% !important;
            table-layout: auto !important;
          }
          th, td {
            padding: 3px 2px !important;
            word-break: normal !important;
            font-size: 8.5px !important;
          }
          .overflow-x-auto, .overflow-auto {
            overflow: visible !important;
          }
        }
      `}</style>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* TOP BAR / HEADER PAGE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 py-1 px-1 print:hidden">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Laporan Pengolahan Susu & Rekapitulasi Produk</h1>
          <p className="text-xs text-slate-500 font-medium">
            Pantau akumulasi harian dan rekapitulasi bulanan pengolahan Susu Olahan Rasa, Yogurt, dan Keju.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1E3F20] text-white hover:bg-[#16331a] rounded-2xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Print Laporan</span>
          </button>
        </div>
      </div>

      {/* FILTER & VIEW TOGGLE (Hidden on print) */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-end gap-4 shrink-0 print:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('PRODUKSI')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeView === 'PRODUKSI' || activeView === 'MATRIX'
              ? 'bg-[#1E3F20] text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            <span>Laporan Produksi</span>
          </button>

          <button
            onClick={() => setActiveView('STOK_BAHAN')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeView === 'STOK_BAHAN'
              ? 'bg-[#1E3F20] text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            <span>Laporan Sisa Stok Bahan Baku & Kemasan</span>
          </button>
        </div>

        {/* Month & Year Selectors */}
        <div className="flex items-center gap-3">
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value, 10))}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm cursor-pointer"
          >
            {monthNames.map((name, idx) => (
              <option key={idx + 1} value={idx + 1}>{name}</option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value, 10))}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm cursor-pointer"
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
        </div>
      </div>

      {/* PRINTABLE OFFICIAL DOCUMENT WRAPPER */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden print:border-none print:shadow-none print:p-0 print:overflow-visible">

        {/* DOCUMENT TITLE HEADER */}
        <div className="text-center space-y-1 border-b border-slate-200 pb-3 shrink-0 print:border-black">
          <h2 className="text-base md:text-lg font-black text-slate-900 uppercase tracking-wide print:text-black">
            {activeView === 'STOK_BAHAN'
              ? 'LAPORAN PERSEDIAAN SISA STOK BAHAN BAKU & KEMASAN (REAL-TIME)'
              : 'SERAH TERIMA SUSU OLAHAN & PRODUK SIAP JUAL BBPTU HPT BATURRADEN'}
          </h2>
          <h3 className="text-xs md:text-sm font-bold text-slate-700 uppercase tracking-wide print:text-black">
            {activeView === 'STOK_BAHAN'
              ? 'SEKSI PENGEMASAN & OLAHAN - BBPTU HPT BATURRADEN'
              : 'DARI SEKSI PENGEMASAN & OLAHAN KE SEKSI PEMASARAN'}
          </h3>
          <p className="text-xs font-extrabold text-slate-800 uppercase tracking-widest pt-0.5 print:text-black">
            TAHUN {year}
          </p>
          <div className="text-xs font-bold text-slate-800 print:text-black uppercase tracking-wider pt-1">
            BULAN : <span className="font-black text-emerald-950 print:text-black">{monthNames[month - 1]} {year}</span>
          </div>
        </div>

        {/* TAB 1: LAPORAN PRODUKSI TABLE */}
        {(activeView === 'PRODUKSI' || activeView === 'MATRIX') && (
          loading ? (
            <div className="p-12 text-center"><LoadingSpinner text="Memuat Laporan Produksi..." /></div>
          ) : (
            <div className="overflow-auto flex-1 min-h-0 mt-3">
              <table className="w-full text-center text-[10px] md:text-[11px] border-collapse border border-slate-300 print:border-black font-mono relative">
                <thead className="sticky top-0 z-10 bg-slate-100 shadow-2xs">
                  {/* Row 1 Header */}
                  <tr className="bg-slate-100 text-slate-900 font-extrabold uppercase print:bg-slate-200">
                    <th rowSpan={3} className="border border-slate-300 print:border-black px-2 py-2 w-10 font-sans">No</th>
                    <th rowSpan={3} className="border border-slate-300 print:border-black px-2 py-2 w-24 font-sans">Tanggal</th>
                    <th colSpan={2} className="border border-slate-300 print:border-black px-2 py-1.5 font-sans bg-blue-50/70 text-blue-950">BAHAN BAKU SUSU</th>
                    <th colSpan={6} className="border border-slate-300 print:border-black px-2 py-1.5 font-sans bg-emerald-50/70 text-emerald-950">HASIL PRODUKSI (PCS)</th>
                    <th rowSpan={2} className="border border-slate-300 print:border-black px-2 py-1.5 font-sans bg-emerald-100 text-emerald-950">JUMLAH PRODUK</th>
                  </tr>

                  {/* Row 2 Header */}
                  <tr className="bg-slate-100 text-slate-900 font-extrabold uppercase print:bg-slate-200 text-[10px]">
                    <th className="border border-slate-300 print:border-black px-2 py-1 font-sans">SUSU DITERIMA</th>
                    <th className="border border-slate-300 print:border-black px-2 py-1 font-sans">SUSU DIOLAH</th>
                    <th className="border border-slate-300 print:border-black px-2 py-1 font-sans">SUSU 115 ML</th>
                    <th className="border border-slate-300 print:border-black px-2 py-1 font-sans">SUSU 130 ML</th>
                    <th className="border border-slate-300 print:border-black px-2 py-1 font-sans">SUSU 200 ML</th>
                    <th className="border border-slate-300 print:border-black px-2 py-1 font-sans">SUSU 250 ML</th>
                    <th className="border border-slate-300 print:border-black px-2 py-1 font-sans bg-purple-50">YOGURT 200 ML</th>
                    <th className="border border-slate-300 print:border-black px-2 py-1 font-sans bg-amber-50">KEJU</th>
                  </tr>

                  {/* Row 3 Units Header */}
                  <tr className="bg-slate-50 text-slate-500 text-[9px] font-mono">
                    <td className="border border-slate-300 print:border-black px-1 py-0.5">( LTR )</td>
                    <td className="border border-slate-300 print:border-black px-1 py-0.5">( LTR )</td>
                    <td className="border border-slate-300 print:border-black px-1 py-0.5">( PCS )</td>
                    <td className="border border-slate-300 print:border-black px-1 py-0.5">( PCS )</td>
                    <td className="border border-slate-300 print:border-black px-1 py-0.5">( PCS )</td>
                    <td className="border border-slate-300 print:border-black px-1 py-0.5">( PCS )</td>
                    <td className="border border-slate-300 print:border-black px-1 py-0.5">( PCS )</td>
                    <td className="border border-slate-300 print:border-black px-1 py-0.5">( PCS )</td>
                    <td className="border border-slate-300 print:border-black px-1 py-0.5 font-sans font-bold bg-emerald-100 text-emerald-950">( PCS )</td>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 print:divide-black text-slate-800">
                  {dailyLogs.map((log) => {
                    const hasActivity = log.susuDiolah > 0 || log.totalProduk > 0 || log.susuDiterima > 0;
                    return (
                      <tr key={log.day} className={`hover:bg-amber-50/40 transition-colors ${hasActivity ? 'bg-emerald-50/15' : ''}`}>
                        <td className="border border-slate-300 print:border-black px-2 py-1 font-sans font-bold">{log.day}</td>
                        <td className="border border-slate-300 print:border-black px-2 py-1 font-sans whitespace-nowrap">{log.dateStr}</td>
                        <td className="border border-slate-300 print:border-black px-2 py-1 text-right text-blue-900 font-bold">{fmtNum(log.susuDiterima)}</td>
                        <td className="border border-slate-300 print:border-black px-2 py-1 text-right text-purple-900 font-bold">{fmtNum(log.susuDiolah)}</td>
                        <td className="border border-slate-300 print:border-black px-2 py-1 text-right">{fmtNum(log.susu115)}</td>
                        <td className="border border-slate-300 print:border-black px-2 py-1 text-right">{fmtNum(log.susu130)}</td>
                        <td className="border border-slate-300 print:border-black px-2 py-1 text-right">{fmtNum(log.susu200)}</td>
                        <td className="border border-slate-300 print:border-black px-2 py-1 text-right">{fmtNum(log.susu250)}</td>
                        <td className="border border-slate-300 print:border-black px-2 py-1 text-right font-bold text-purple-900 bg-purple-50/30">{fmtNum(log.yogurt200)}</td>
                        <td className="border border-slate-300 print:border-black px-2 py-1 text-right font-bold text-amber-900 bg-amber-50/30">{fmtNum(log.keju)}</td>
                        <td className="border border-slate-300 print:border-black px-2 py-1 text-right font-black bg-emerald-50 text-emerald-950">{fmtNum(log.totalProduk)}</td>
                      </tr>
                    );
                  })}
                </tbody>

                {/* FOOTER TOTAL BULAN INI */}
                <tfoot className="sticky bottom-0 z-10 bg-slate-100 shadow-2xs">
                  <tr className="bg-slate-100 font-extrabold text-slate-900 border-t-2 border-slate-400 print:border-black print:bg-slate-200">
                    <td colSpan={2} className="border border-slate-300 print:border-black px-2 py-2 text-center font-sans">
                      JUMLAH TOTAL BULAN INI
                    </td>
                    <td className="border border-slate-300 print:border-black px-2 py-2 text-right text-blue-950 font-black">{fmtNum(monthlyTotals.susuDiterima)}</td>
                    <td className="border border-slate-300 print:border-black px-2 py-2 text-right text-purple-950 font-black">{fmtNum(monthlyTotals.susuDiolah)}</td>
                    <td className="border border-slate-300 print:border-black px-2 py-2 text-right font-black">{fmtNum(monthlyTotals.susu115)}</td>
                    <td className="border border-slate-300 print:border-black px-2 py-2 text-right font-black">{fmtNum(monthlyTotals.susu130)}</td>
                    <td className="border border-slate-300 print:border-black px-2 py-2 text-right font-black">{fmtNum(monthlyTotals.susu200)}</td>
                    <td className="border border-slate-300 print:border-black px-2 py-2 text-right font-black">{fmtNum(monthlyTotals.susu250)}</td>
                    <td className="border border-slate-300 print:border-black px-2 py-2 text-right font-black text-purple-950 bg-purple-100/50">{fmtNum(monthlyTotals.yogurt200)}</td>
                    <td className="border border-slate-300 print:border-black px-2 py-2 text-right font-black text-amber-950 bg-amber-100/50">{fmtNum(monthlyTotals.keju)}</td>
                    <td className="border border-slate-300 print:border-black px-2 py-2 text-right text-emerald-950 bg-emerald-200 font-black text-xs">{fmtNum(monthlyTotals.totalProduk)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )
        )}

        {/* TAB 2: LAPORAN SISA STOK BAHAN BAKU & KEMASAN TABLE */}
        {activeView === 'STOK_BAHAN' && (
          loading ? (
            <div className="p-12 text-center"><LoadingSpinner text="Memuat Laporan Sisa Stok Bahan..." /></div>
          ) : (
            <div className="overflow-auto flex-1 min-h-0 mt-3">
              <table className="w-full text-center text-[10px] md:text-[11px] border-collapse border border-slate-300 print:border-black font-mono relative">
                <thead className="sticky top-0 z-10 bg-slate-100 shadow-2xs">
                  {/* Row 1 Header */}
                  <tr className="bg-slate-100 text-slate-900 font-extrabold uppercase print:bg-slate-200">
                    <th rowSpan={3} className="border border-slate-300 print:border-black px-2 py-2 w-10 font-sans">No</th>
                    <th rowSpan={3} className="border border-slate-300 print:border-black px-2 py-2 w-24 font-sans">Tanggal</th>
                    <th colSpan={materialUsage.length + 1} className="border border-slate-300 print:border-black px-2 py-2 font-sans bg-amber-50/80 text-amber-950 text-xs tracking-wider">
                      SISA STOK BAHAN BAKU & KEMASAN (REAL-TIME)
                    </th>
                  </tr>

                  {/* Row 2 Header */}
                  <tr className="bg-slate-100 text-slate-900 font-extrabold uppercase print:bg-slate-200 text-[10px]">
                    <th className="border border-slate-300 print:border-black px-2 py-1.5 font-sans bg-blue-100/60 text-blue-950">
                      SUSU SEGAR
                    </th>
                    {materialUsage.map((m) => (
                      <th key={m.id} className="border border-slate-300 print:border-black px-2 py-1.5 font-sans bg-amber-100/40 text-slate-900 whitespace-nowrap">
                        {m.name.toUpperCase()}
                      </th>
                    ))}
                  </tr>

                  {/* Row 3 Units Header */}
                  <tr className="bg-slate-50 text-slate-500 text-[9px] font-mono">
                    <td className="border border-slate-300 print:border-black px-1.5 py-1 font-bold text-blue-900 bg-blue-50">( LTR )</td>
                    {materialUsage.map((m) => (
                      <td key={m.id} className="border border-slate-300 print:border-black px-1.5 py-1">
                        ( {(m.unit || 'PCS').toUpperCase()} )
                      </td>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 print:divide-black text-slate-800">
                  {dailyLogs.map((log) => (
                    <tr key={log.day} className="hover:bg-amber-50/40 transition-colors">
                      <td className="border border-slate-300 print:border-black px-2 py-1 font-sans font-bold">{log.day}</td>
                      <td className="border border-slate-300 print:border-black px-2 py-1 font-sans whitespace-nowrap">{log.dateStr}</td>
                      <td className="border border-slate-300 print:border-black px-2 py-1 text-right font-bold text-blue-950 bg-blue-50/30">
                        {fmtNum(summary.sisaStokSusuSegar || 0)}
                      </td>
                      {materialUsage.map((m) => (
                        <td key={m.id} className="border border-slate-300 print:border-black px-2 py-1 text-right text-slate-700 bg-slate-50/30 font-medium">
                          {fmtNum(m.finalStock)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>

                {/* FOOTER TOTAL SISA STOK REAL-TIME */}
                <tfoot className="sticky bottom-0 z-10 bg-slate-100 shadow-2xs">
                  <tr className="bg-slate-100 font-extrabold text-slate-900 border-t-2 border-slate-400 print:border-black print:bg-slate-200">
                    <td colSpan={2} className="border border-slate-300 print:border-black px-2 py-2 text-center font-sans">
                      SISA STOK SAAT INI (REAL-TIME)
                    </td>
                    <td className="border border-slate-300 print:border-black px-2 py-2 text-right text-blue-950 bg-blue-100/60 font-black text-xs">
                      {fmtNum(summary.sisaStokSusuSegar || 0)}
                    </td>
                    {materialUsage.map((m) => (
                      <td key={m.id} className="border border-slate-300 print:border-black px-2 py-2 text-right font-black text-slate-900 bg-amber-100/50 text-xs">
                        {fmtNum(m.finalStock)}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
