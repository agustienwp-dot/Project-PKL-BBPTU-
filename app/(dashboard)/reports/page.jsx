'use client';

import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import { 
  FileText, 
  Printer, 
  Milk, 
  Coffee, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Boxes,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [productType, setProductType] = useState('SEGAR'); // SEGAR or OLAHAN
  const [animalType, setAnimalType] = useState('SAPI'); // SAPI or KAMBING
  const [reportData, setReportData] = useState(null);
  const [toast, setToast] = useState(null);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const fetchReport = async () => {
    try {
      const res = await api.get(`/reports/monthly?month=${month}&year=${year}&productType=${productType}&animalType=${animalType}`);
      if (res.data.success) {
        setReportData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching monthly report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    const interval = setInterval(() => fetchReport(), 5000);
    const handleFocus = () => fetchReport();
    window.addEventListener('focus', handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [month, year, productType, animalType]);

  const handlePrint = () => {
    window.print();
  };

  const exportToExcelMatrix = () => {
    if (!reportData) return;
    const animalLabel = animalType === 'KAMBING' ? 'KAMBING' : animalType === 'ALL' ? 'SAPI & KAMBING' : 'SAPI';
    const titleText = `SERAH TERIMA SUSU MURNI ${animalLabel} BBPTU HPT BATURRADEN`;
    const periodText = `BULAN: ${monthNames[month - 1].toUpperCase()} ${year}`;

    const isKambingOnly = animalType === 'KAMBING';
    const isAll = animalType === 'ALL';

    let tableHTML = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="UTF-8"></head>
      <body>
        <h2 style="text-align:center;">${titleText}</h2>
        <h3 style="text-align:center;">DARI SEKSI PELAYANAN TEKNIK KE SEKSI PEMASARAN - TAHUN ${year}</h3>
        <h4 style="text-align:center;">${periodText}</h4>
        <table border="1" style="border-collapse:collapse; text-align:center;">
          <thead>
            <tr style="background-color:#e2e8f0; font-weight:bold;">
              <th rowspan="3">No</th>
              <th rowspan="3">Tanggal</th>
              <th colspan="${isKambingOnly ? 3 : isAll ? 15 : 12}" style="background-color:#dcfce7;">PENERIMAAN / PRODUKSI</th>
              <th rowspan="2" style="background-color:#cbd5e1;">JUMLAH SUSU</th>
            </tr>
            <tr style="background-color:#f1f5f9; font-weight:bold;">
              ${
                isKambingOnly
                  ? `<th colspan="3" style="background-color:#f3e8ff;">FARM KAMBING</th>`
                  : isAll
                  ? `<th colspan="3" style="background-color:#fef3c7;">FARM TEGALSARI</th><th colspan="3" style="background-color:#e0f2fe;">FARM LIMPAKUWUS</th><th colspan="3" style="background-color:#f3e8ff;">FARM MANGGALA</th><th colspan="3" style="background-color:#dcfce7;">EDUWISATA</th><th colspan="3" style="background-color:#fae8ff;">FARM KAMBING</th>`
                  : `<th colspan="3" style="background-color:#fef3c7;">FARM TEGALSARI</th><th colspan="3" style="background-color:#e0f2fe;">FARM LIMPAKUWUS</th><th colspan="3" style="background-color:#f3e8ff;">FARM MANGGALA</th><th colspan="3" style="background-color:#dcfce7;">EDUWISATA</th>`
              }
            </tr>
            <tr style="background-color:#e2e8f0; font-weight:bold;">
              ${
                isKambingOnly
                  ? `<th>PAGI (Lt)</th><th>SORE (Lt)</th><th>JUMLAH (Lt)</th>`
                  : isAll
                  ? `<th>PAGI (Lt)</th><th>SORE (Lt)</th><th>JUMLAH (Lt)</th><th>PAGI (Lt)</th><th>SORE (Lt)</th><th>JUMLAH (Lt)</th><th>PAGI (Lt)</th><th>SORE (Lt)</th><th>JUMLAH (Lt)</th><th>PAGI (Lt)</th><th>SORE (Lt)</th><th>JUMLAH (Lt)</th><th>PAGI (Lt)</th><th>SORE (Lt)</th><th>JUMLAH (Lt)</th>`
                  : `<th>PAGI (Lt)</th><th>SORE (Lt)</th><th>JUMLAH (Lt)</th><th>PAGI (Lt)</th><th>SORE (Lt)</th><th>JUMLAH (Lt)</th><th>PAGI (Lt)</th><th>SORE (Lt)</th><th>JUMLAH (Lt)</th><th>PAGI (Lt)</th><th>SORE (Lt)</th><th>JUMLAH (Lt)</th>`
              }
              <th style="background-color:#94a3b8;">TOTAL (Lt)</th>
            </tr>
          </thead>
          <tbody>
    `;

    const fmt = (n) => (n > 0 ? n.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '0,0');

    dailyLogs.forEach((log) => {
      const fb = log.farmsBreakdown || {
        tegalsari: { pagi: 0, sore: 0, total: 0 },
        limpakuwus: { pagi: 0, sore: 0, total: 0 },
        manggala: { pagi: 0, sore: 0, total: 0 },
        eduwisata: { pagi: 0, sore: 0, total: 0 },
        kambing: { pagi: 0, sore: 0, total: 0 },
        grandTotal: 0
      };

      if (isKambingOnly) {
        const kb = fb.kambing || { pagi: 0, sore: 0, total: 0 };
        tableHTML += `
          <tr>
            <td>${log.day}</td>
            <td>${log.dateStr}</td>
            <td>${fmt(kb.pagi)}</td><td>${fmt(kb.sore)}</td><td style="background-color:#faf5ff; font-weight:bold;">${fmt(kb.total)}</td>
            <td style="background-color:#f1f5f9; font-weight:bold;">${fmt(log.grossVolumeLiters || kb.total)}</td>
          </tr>
        `;
      } else if (isAll) {
        const kb = fb.kambing || { pagi: 0, sore: 0, total: 0 };
        tableHTML += `
          <tr>
            <td>${log.day}</td>
            <td>${log.dateStr}</td>
            <td>${fmt(fb.tegalsari.pagi)}</td><td>${fmt(fb.tegalsari.sore)}</td><td style="background-color:#fffbeb; font-weight:bold;">${fmt(fb.tegalsari.total)}</td>
            <td>${fmt(fb.limpakuwus.pagi)}</td><td>${fmt(fb.limpakuwus.sore)}</td><td style="background-color:#f0f9ff; font-weight:bold;">${fmt(fb.limpakuwus.total)}</td>
            <td>${fmt(fb.manggala.pagi)}</td><td>${fmt(fb.manggala.sore)}</td><td style="background-color:#faf5ff; font-weight:bold;">${fmt(fb.manggala.total)}</td>
            <td>${fmt(fb.eduwisata.pagi)}</td><td>${fmt(fb.eduwisata.sore)}</td><td style="background-color:#f0fdf4; font-weight:bold;">${fmt(fb.eduwisata.total)}</td>
            <td>${fmt(kb.pagi)}</td><td>${fmt(kb.sore)}</td><td style="background-color:#fae8ff; font-weight:bold;">${fmt(kb.total)}</td>
            <td style="background-color:#f1f5f9; font-weight:bold;">${fmt(fb.grandTotal)}</td>
          </tr>
        `;
      } else {
        tableHTML += `
          <tr>
            <td>${log.day}</td>
            <td>${log.dateStr}</td>
            <td>${fmt(fb.tegalsari.pagi)}</td><td>${fmt(fb.tegalsari.sore)}</td><td style="background-color:#fffbeb; font-weight:bold;">${fmt(fb.tegalsari.total)}</td>
            <td>${fmt(fb.limpakuwus.pagi)}</td><td>${fmt(fb.limpakuwus.sore)}</td><td style="background-color:#f0f9ff; font-weight:bold;">${fmt(fb.limpakuwus.total)}</td>
            <td>${fmt(fb.manggala.pagi)}</td><td>${fmt(fb.manggala.sore)}</td><td style="background-color:#faf5ff; font-weight:bold;">${fmt(fb.manggala.total)}</td>
            <td>${fmt(fb.eduwisata.pagi)}</td><td>${fmt(fb.eduwisata.sore)}</td><td style="background-color:#f0fdf4; font-weight:bold;">${fmt(fb.eduwisata.total)}</td>
            <td style="background-color:#f1f5f9; font-weight:bold;">${fmt(fb.grandTotal)}</td>
          </tr>
        `;
      }
    });

    const fmtMonthly = summary?.farmsMonthlyTotal || {
      tegalsari: { pagi: 0, sore: 0, total: 0 },
      limpakuwus: { pagi: 0, sore: 0, total: 0 },
      manggala: { pagi: 0, sore: 0, total: 0 },
      eduwisata: { pagi: 0, sore: 0, total: 0 },
      kambing: { pagi: 0, sore: 0, total: 0 },
      grandTotal: 0
    };

    if (isKambingOnly) {
      const kb = fmtMonthly.kambing || { pagi: 0, sore: 0, total: 0 };
      tableHTML += `
            </tbody>
            <tfoot>
              <tr style="background-color:#cbd5e1; font-weight:bold;">
                <td colspan="2">TOTAL BULAN INI:</td>
                <td>${fmt(kb.pagi)}</td><td>${fmt(kb.sore)}</td><td style="background-color:#e9d5ff;">${fmt(kb.total)}</td>
                <td style="background-color:#94a3b8;">${fmt(fmtMonthly.grandTotal || kb.total)}</td>
              </tr>
            </tfoot>
          </table>
        </body>
        </html>
      `;
    } else if (isAll) {
      const kb = fmtMonthly.kambing || { pagi: 0, sore: 0, total: 0 };
      tableHTML += `
            </tbody>
            <tfoot>
              <tr style="background-color:#cbd5e1; font-weight:bold;">
                <td colspan="2">TOTAL BULAN INI:</td>
                <td>${fmt(fmtMonthly.tegalsari.pagi)}</td><td>${fmt(fmtMonthly.tegalsari.sore)}</td><td style="background-color:#fde68a;">${fmt(fmtMonthly.tegalsari.total)}</td>
                <td>${fmt(fmtMonthly.limpakuwus.pagi)}</td><td>${fmt(fmtMonthly.limpakuwus.sore)}</td><td style="background-color:#bae6fd;">${fmt(fmtMonthly.limpakuwus.total)}</td>
                <td>${fmt(fmtMonthly.manggala.pagi)}</td><td>${fmt(fmtMonthly.manggala.sore)}</td><td style="background-color:#e9d5ff;">${fmt(fmtMonthly.manggala.total)}</td>
                <td>${fmt(fmtMonthly.eduwisata.pagi)}</td><td>${fmt(fmtMonthly.eduwisata.sore)}</td><td style="background-color:#bbf7d0;">${fmt(fmtMonthly.eduwisata.total)}</td>
                <td>${fmt(kb.pagi)}</td><td>${fmt(kb.sore)}</td><td style="background-color:#f5d0fe;">${fmt(kb.total)}</td>
                <td style="background-color:#94a3b8;">${fmt(fmtMonthly.grandTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </body>
        </html>
      `;
    } else {
      tableHTML += `
            </tbody>
            <tfoot>
              <tr style="background-color:#cbd5e1; font-weight:bold;">
                <td colspan="2">TOTAL BULAN INI:</td>
                <td>${fmt(fmtMonthly.tegalsari.pagi)}</td><td>${fmt(fmtMonthly.tegalsari.sore)}</td><td style="background-color:#fde68a;">${fmt(fmtMonthly.tegalsari.total)}</td>
                <td>${fmt(fmtMonthly.limpakuwus.pagi)}</td><td>${fmt(fmtMonthly.limpakuwus.sore)}</td><td style="background-color:#bae6fd;">${fmt(fmtMonthly.limpakuwus.total)}</td>
                <td>${fmt(fmtMonthly.manggala.pagi)}</td><td>${fmt(fmtMonthly.manggala.sore)}</td><td style="background-color:#e9d5ff;">${fmt(fmtMonthly.manggala.total)}</td>
                <td>${fmt(fmtMonthly.eduwisata.pagi)}</td><td>${fmt(fmtMonthly.eduwisata.sore)}</td><td style="background-color:#bbf7d0;">${fmt(fmtMonthly.eduwisata.total)}</td>
                <td style="background-color:#94a3b8;">${fmt(fmtMonthly.grandTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </body>
        </html>
      `;
    }

    const blob = new Blob([tableHTML], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_Serah_Terima_${animalType}_${monthNames[month - 1]}_${year}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const summary = reportData?.summary || {};
  const dailyLogs = reportData?.dailyLogs || [];

  const isKambingOnly = animalType === 'KAMBING';
  const isAllAnimals = animalType === 'ALL';

  return (
    <div className="space-y-8 pb-12 print:p-0 print:bg-white print:text-black">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header section (Hidden on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Rekapitulasi Stok & Laporan Bulanan</h1>
          <p className="text-xs text-slate-500 font-medium">Pantau akumulasi harian (tanggal 1–31) dan total bulanan produksi & pengeluaran.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToExcelMatrix}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold shadow-md transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-[#1E3F20] text-white hover:bg-[#16331a] rounded-2xl text-xs font-bold shadow-md transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Print Laporan</span>
          </button>
        </div>
      </div>

      {/* Filter Section (Hidden on print) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 print:hidden">
        <select
          value={animalType}
          onChange={(e) => setAnimalType(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm cursor-pointer"
        >
          <option value="SAPI">Susu Sapi</option>
          <option value="KAMBING">Susu Kambing</option>
        </select>

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

      {/* Printable / Display Official Document Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
        <div className="text-center space-y-1.5 border-b border-slate-200 pb-4 print:border-black">
          <h2 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-wide print:text-black">
            SERAH TERIMA SUSU MURNI {isKambingOnly ? 'KAMBING' : isAllAnimals ? 'SAPI & KAMBING' : 'SAPI'} BBPTU HPT BATURRADEN
          </h2>
          <h3 className="text-sm md:text-base font-bold text-slate-700 uppercase tracking-wide print:text-black">
            DARI SEKSI PELAYANAN TEKNIK KE SEKSI PEMASARAN
          </h3>
          <p className="text-xs md:text-sm font-extrabold text-slate-800 uppercase tracking-widest pt-1 print:text-black">
            TAHUN {year}
          </p>
        </div>

        <div className="flex items-center justify-between font-bold text-xs text-slate-800 print:text-black uppercase tracking-wider">
          <div>
            BULAN : <span className="font-black text-emerald-950 print:text-black">{monthNames[month - 1]} {year}</span>
          </div>
        </div>

        {/* OFFICIAL REKAPITULASI TABLE */}
        {loading ? (
          <div className="p-12 text-center"><LoadingSpinner text="Memuat Rekapitulasi Serah Terima Susu..." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-center text-[11px] border-collapse border border-slate-300 print:border-black font-mono">
              <thead>
                {/* Row 1 Header */}
                <tr className="bg-slate-100 text-slate-900 font-extrabold uppercase print:bg-slate-200">
                  <th rowSpan={3} className="border border-slate-300 print:border-black px-2 py-2 w-10 font-sans">No</th>
                  <th rowSpan={3} className="border border-slate-300 print:border-black px-2 py-2 w-24 font-sans">Tanggal</th>
                  <th colSpan={isKambingOnly ? 3 : isAllAnimals ? 15 : 12} className="border border-slate-300 print:border-black px-2 py-1.5 font-sans">PENERIMAAN</th>
                  <th rowSpan={2} className="border border-slate-300 print:border-black px-2 py-1.5 font-sans">JUMLAH</th>
                </tr>

                {/* Row 2 Header */}
                <tr className="bg-slate-100 text-slate-900 font-extrabold uppercase print:bg-slate-200">
                  {isKambingOnly ? (
                    <th colSpan={3} className="border border-slate-300 print:border-black px-2 py-1.5 font-sans bg-purple-100/60">FARM KAMBING</th>
                  ) : isAllAnimals ? (
                    <>
                      <th colSpan={3} className="border border-slate-300 print:border-black px-2 py-1.5 font-sans">FARM TEGALSARI</th>
                      <th colSpan={3} className="border border-slate-300 print:border-black px-2 py-1.5 font-sans">FARM LIMPAKUWUS</th>
                      <th colSpan={3} className="border border-slate-300 print:border-black px-2 py-1.5 font-sans">FARM MANGGALA</th>
                      <th colSpan={3} className="border border-slate-300 print:border-black px-2 py-1.5 font-sans">EDUWISATA</th>
                      <th colSpan={3} className="border border-slate-300 print:border-black px-2 py-1.5 font-sans bg-purple-100/60">FARM KAMBING</th>
                    </>
                  ) : (
                    <>
                      <th colSpan={3} className="border border-slate-300 print:border-black px-2 py-1.5 font-sans">FARM TEGALSARI</th>
                      <th colSpan={3} className="border border-slate-300 print:border-black px-2 py-1.5 font-sans">FARM LIMPAKUWUS</th>
                      <th colSpan={3} className="border border-slate-300 print:border-black px-2 py-1.5 font-sans">FARM MANGGALA</th>
                      <th colSpan={3} className="border border-slate-300 print:border-black px-2 py-1.5 font-sans">EDUWISATA</th>
                    </>
                  )}
                </tr>

                {/* Row 3 Header */}
                <tr className="bg-slate-50 text-slate-800 font-bold uppercase text-[10px] print:bg-slate-100">
                  {isKambingOnly ? (
                    <>
                      <th className="border border-slate-300 print:border-black px-1 py-1 font-sans">PAGI</th>
                      <th className="border border-slate-300 print:border-black px-1 py-1 font-sans">SORE</th>
                      <th className="border border-slate-300 print:border-black px-1 py-1 bg-purple-100/50 print:bg-slate-300 font-sans">JUMLAH</th>
                    </>
                  ) : isAllAnimals ? (
                    <>
                      <th className="border border-slate-300 print:border-black px-1 py-1 font-sans">PAGI</th>
                      <th className="border border-slate-300 print:border-black px-1 py-1 font-sans">SORE</th>
                      <th className="border border-slate-300 print:border-black px-1 py-1 bg-slate-200/60 print:bg-slate-300 font-sans">JUMLAH</th>
                      <th className="border border-slate-300 print:border-black px-1 py-1 font-sans">PAGI</th>
                      <th className="border border-slate-300 print:border-black px-1 py-1 font-sans">SORE</th>
                      <th className="border border-slate-300 print:border-black px-1 py-1 bg-slate-200/60 print:bg-slate-300 font-sans">JUMLAH</th>
                      <th className="border border-slate-300 print:border-black px-1 py-1 font-sans">PAGI</th>
                      <th className="border border-slate-300 print:border-black px-1 py-1 font-sans">SORE</th>
                      <th className="border border-slate-300 print:border-black px-1 py-1 bg-slate-200/60 print:bg-slate-300 font-sans">JUMLAH</th>
                      <th className="border border-slate-300 print:border-black px-1 py-1 font-sans">PAGI</th>
                      <th className="border border-slate-300 print:border-black px-1 py-1 font-sans">SORE</th>
                      <th className="border border-slate-300 print:border-black px-1 py-1 bg-slate-200/60 print:bg-slate-300 font-sans">JUMLAH</th>
                      <th className="border border-slate-300 print:border-black px-1 py-1 font-sans">PAGI</th>
                      <th className="border border-slate-300 print:border-black px-1 py-1 font-sans">SORE</th>
                      <th className="border border-slate-300 print:border-black px-1 py-1 bg-purple-100/50 print:bg-slate-300 font-sans">JUMLAH</th>
                    </>
                  ) : (
                    <>
                      <th className="border border-slate-300 print:border-black px-1 py-1 font-sans">PAGI</th>
                      <th className="border border-slate-300 print:border-black px-1 py-1 font-sans">SORE</th>
                      <th className="border border-slate-300 print:border-black px-1 py-1 bg-slate-200/60 print:bg-slate-300 font-sans">JUMLAH</th>
                      <th className="border border-slate-300 print:border-black px-1 py-1 font-sans">PAGI</th>
                      <th className="border border-slate-300 print:border-black px-1 py-1 font-sans">SORE</th>
                      <th className="border border-slate-300 print:border-black px-1 py-1 bg-slate-200/60 print:bg-slate-300 font-sans">JUMLAH</th>
                      <th className="border border-slate-300 print:border-black px-1 py-1 font-sans">PAGI</th>
                      <th className="border border-slate-300 print:border-black px-1 py-1 font-sans">SORE</th>
                      <th className="border border-slate-300 print:border-black px-1 py-1 bg-slate-200/60 print:bg-slate-300 font-sans">JUMLAH</th>
                      <th className="border border-slate-300 print:border-black px-1 py-1 font-sans">PAGI</th>
                      <th className="border border-slate-300 print:border-black px-1 py-1 font-sans">SORE</th>
                      <th className="border border-slate-300 print:border-black px-1 py-1 bg-slate-200/60 print:bg-slate-300 font-sans">JUMLAH</th>
                    </>
                  )}

                  {/* Total */}
                  <th className="border border-slate-300 print:border-black px-2 py-1 bg-emerald-100 text-emerald-950 font-sans">SUSU TOTAL</th>
                </tr>

                {/* Units Row */}
                <tr className="bg-slate-100/70 text-slate-500 text-[9px] font-mono">
                  <td className="border border-slate-300 print:border-black px-1 py-0.5"></td>
                  <td className="border border-slate-300 print:border-black px-1 py-0.5"></td>
                  {[...Array(isKambingOnly ? 4 : isAllAnimals ? 16 : 13)].map((_, i) => (
                    <td key={i} className="border border-slate-300 print:border-black px-1 py-0.5">( Lt )</td>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 print:divide-black text-slate-800">
                {dailyLogs.map((log) => {
                  const fb = log.farmsBreakdown || {
                    tegalsari: { pagi: 0, sore: 0, total: 0 },
                    limpakuwus: { pagi: 0, sore: 0, total: 0 },
                    manggala: { pagi: 0, sore: 0, total: 0 },
                    eduwisata: { pagi: 0, sore: 0, total: 0 },
                    kambing: { pagi: 0, sore: 0, total: 0 },
                    grandTotal: 0
                  };
                  const kb = fb.kambing || { pagi: 0, sore: 0, total: 0 };

                  const fmt = (n) => (n > 0 ? n.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '0,0');

                  return (
                    <tr key={log.day} className={`hover:bg-amber-50/40 transition-colors ${fb.grandTotal > 0 || kb.total > 0 ? 'bg-emerald-50/10' : ''}`}>
                      <td className="border border-slate-300 print:border-black px-1 py-1 font-sans font-bold">{log.day}</td>
                      <td className="border border-slate-300 print:border-black px-1 py-1 font-sans">{log.dateStr}</td>

                      {isKambingOnly ? (
                        <>
                          <td className="border border-slate-300 print:border-black px-1.5 py-1 text-right">{fmt(kb.pagi)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-1 text-right">{fmt(kb.sore)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-1 text-right font-bold bg-purple-50">{fmt(kb.total)}</td>
                        </>
                      ) : isAllAnimals ? (
                        <>
                          {/* Tegalsari */}
                          <td className="border border-slate-300 print:border-black px-1.5 py-1 text-right">{fmt(fb.tegalsari.pagi)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-1 text-right">{fmt(fb.tegalsari.sore)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-1 text-right font-bold bg-slate-50">{fmt(fb.tegalsari.total)}</td>

                          {/* Limpakuwus */}
                          <td className="border border-slate-300 print:border-black px-1.5 py-1 text-right">{fmt(fb.limpakuwus.pagi)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-1 text-right">{fmt(fb.limpakuwus.sore)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-1 text-right font-bold bg-slate-50">{fmt(fb.limpakuwus.total)}</td>

                          {/* Manggala */}
                          <td className="border border-slate-300 print:border-black px-1.5 py-1 text-right">{fmt(fb.manggala.pagi)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-1 text-right">{fmt(fb.manggala.sore)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-1 text-right font-bold bg-slate-50">{fmt(fb.manggala.total)}</td>

                          {/* Eduwisata */}
                          <td className="border border-slate-300 print:border-black px-1.5 py-1 text-right">{fmt(fb.eduwisata.pagi)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-1 text-right">{fmt(fb.eduwisata.sore)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-1 text-right font-bold bg-slate-50">{fmt(fb.eduwisata.total)}</td>

                          {/* Kambing */}
                          <td className="border border-slate-300 print:border-black px-1.5 py-1 text-right">{fmt(kb.pagi)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-1 text-right">{fmt(kb.sore)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-1 text-right font-bold bg-purple-50">{fmt(kb.total)}</td>
                        </>
                      ) : (
                        <>
                          {/* Tegalsari */}
                          <td className="border border-slate-300 print:border-black px-1.5 py-1 text-right">{fmt(fb.tegalsari.pagi)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-1 text-right">{fmt(fb.tegalsari.sore)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-1 text-right font-bold bg-slate-50">{fmt(fb.tegalsari.total)}</td>

                          {/* Limpakuwus */}
                          <td className="border border-slate-300 print:border-black px-1.5 py-1 text-right">{fmt(fb.limpakuwus.pagi)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-1 text-right">{fmt(fb.limpakuwus.sore)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-1 text-right font-bold bg-slate-50">{fmt(fb.limpakuwus.total)}</td>

                          {/* Manggala */}
                          <td className="border border-slate-300 print:border-black px-1.5 py-1 text-right">{fmt(fb.manggala.pagi)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-1 text-right">{fmt(fb.manggala.sore)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-1 text-right font-bold bg-slate-50">{fmt(fb.manggala.total)}</td>

                          {/* Eduwisata */}
                          <td className="border border-slate-300 print:border-black px-1.5 py-1 text-right">{fmt(fb.eduwisata.pagi)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-1 text-right">{fmt(fb.eduwisata.sore)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-1 text-right font-bold bg-slate-50">{fmt(fb.eduwisata.total)}</td>
                        </>
                      )}

                      {/* Grand Total Day */}
                      <td className="border border-slate-300 print:border-black px-1.5 py-1 text-right font-black text-emerald-800 bg-emerald-50/60">
                        {fmt(isKambingOnly ? (log.grossVolumeLiters || kb.total) : fb.grandTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Table Footer: Accumulation Totals */}
              {(() => {
                const fmt = (n) => (n > 0 ? n.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '0,0');
                const fmtGrand = (n) => (n > 0 ? n.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '0,0');
                const fmtMonthly = summary?.farmsMonthlyTotal || {
                  tegalsari: { pagi: 0, sore: 0, total: 0 },
                  limpakuwus: { pagi: 0, sore: 0, total: 0 },
                  manggala: { pagi: 0, sore: 0, total: 0 },
                  eduwisata: { pagi: 0, sore: 0, total: 0 },
                  kambing: { pagi: 0, sore: 0, total: 0 },
                  grandTotal: 0
                };
                const kbM = fmtMonthly.kambing || { pagi: 0, sore: 0, total: 0 };

                return (
                  <tfoot>
                    <tr className="bg-slate-200 font-extrabold text-slate-900 print:bg-slate-300 border-t-2 border-slate-400">
                      <td colSpan={2} className="border border-slate-300 print:border-black px-2 py-2 font-sans uppercase text-center">TOTAL BULAN INI</td>

                      {isKambingOnly ? (
                        <>
                          <td className="border border-slate-300 print:border-black px-1.5 py-2 text-right">{fmt(kbM.pagi)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-2 text-right">{fmt(kbM.sore)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-2 text-right bg-purple-200 font-black">{fmt(kbM.total)}</td>
                        </>
                      ) : isAllAnimals ? (
                        <>
                          {/* Tegalsari */}
                          <td className="border border-slate-300 print:border-black px-1.5 py-2 text-right">{fmt(fmtMonthly.tegalsari.pagi)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-2 text-right">{fmt(fmtMonthly.tegalsari.sore)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-2 text-right bg-slate-300/80 font-black">{fmt(fmtMonthly.tegalsari.total)}</td>

                          {/* Limpakuwus */}
                          <td className="border border-slate-300 print:border-black px-1.5 py-2 text-right">{fmt(fmtMonthly.limpakuwus.pagi)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-2 text-right">{fmt(fmtMonthly.limpakuwus.sore)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-2 text-right bg-slate-300/80 font-black">{fmt(fmtMonthly.limpakuwus.total)}</td>

                          {/* Manggala */}
                          <td className="border border-slate-300 print:border-black px-1.5 py-2 text-right">{fmt(fmtMonthly.manggala.pagi)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-2 text-right">{fmt(fmtMonthly.manggala.sore)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-2 text-right bg-slate-300/80 font-black">{fmt(fmtMonthly.manggala.total)}</td>

                          {/* Eduwisata */}
                          <td className="border border-slate-300 print:border-black px-1.5 py-2 text-right">{fmt(fmtMonthly.eduwisata.pagi)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-2 text-right">{fmt(fmtMonthly.eduwisata.sore)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-2 text-right bg-slate-300/80 font-black">{fmt(fmtMonthly.eduwisata.total)}</td>

                          {/* Kambing */}
                          <td className="border border-slate-300 print:border-black px-1.5 py-2 text-right">{fmt(kbM.pagi)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-2 text-right">{fmt(kbM.sore)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-2 text-right bg-purple-200 font-black">{fmt(kbM.total)}</td>
                        </>
                      ) : (
                        <>
                          {/* Tegalsari */}
                          <td className="border border-slate-300 print:border-black px-1.5 py-2 text-right">{fmt(fmtMonthly.tegalsari.pagi)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-2 text-right">{fmt(fmtMonthly.tegalsari.sore)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-2 text-right bg-slate-300/80 font-black">{fmt(fmtMonthly.tegalsari.total)}</td>

                          {/* Limpakuwus */}
                          <td className="border border-slate-300 print:border-black px-1.5 py-2 text-right">{fmt(fmtMonthly.limpakuwus.pagi)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-2 text-right">{fmt(fmtMonthly.limpakuwus.sore)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-2 text-right bg-slate-300/80 font-black">{fmt(fmtMonthly.limpakuwus.total)}</td>

                          {/* Manggala */}
                          <td className="border border-slate-300 print:border-black px-1.5 py-2 text-right">{fmt(fmtMonthly.manggala.pagi)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-2 text-right">{fmt(fmtMonthly.manggala.sore)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-2 text-right bg-slate-300/80 font-black">{fmt(fmtMonthly.manggala.total)}</td>

                          {/* Eduwisata */}
                          <td className="border border-slate-300 print:border-black px-1.5 py-2 text-right">{fmt(fmtMonthly.eduwisata.pagi)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-2 text-right">{fmt(fmtMonthly.eduwisata.sore)}</td>
                          <td className="border border-slate-300 print:border-black px-1.5 py-2 text-right bg-slate-300/80 font-black">{fmt(fmtMonthly.eduwisata.total)}</td>
                        </>
                      )}

                      {/* Grand Total */}
                      <td className="border border-slate-300 print:border-black px-2 py-2 text-right font-black text-sm text-emerald-950 bg-emerald-200">
                        {fmtGrand(isKambingOnly ? (fmtMonthly.grandTotal || kbM.total) : fmtMonthly.grandTotal)}
                      </td>
                    </tr>
                  </tfoot>
                );
              })()}
            </table>
          </div>
        )}

        {/* Printable Official Signature Footer */}
        <div className="hidden print:flex justify-between pt-16 text-center text-xs font-bold text-black">
          <div className="space-y-16">
            <p>Seksi Pelayanan Teknik</p>
            <p className="underline font-black">(.......................................)</p>
          </div>
          <div className="space-y-16">
            <p>Seksi Pemasaran</p>
            <p className="underline font-black">(.......................................)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
