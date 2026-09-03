'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import { 
  FileText, 
  Printer, 
  Download, 
  RefreshCw, 
  Package, 
  Milk, 
  Boxes, 
  FileSpreadsheet,
  Calendar,
  CheckCircle2,
  Table as TableIcon,
  Tag
} from 'lucide-react';

export default function LaporanPengolahanPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  
  const [reportData, setReportData] = useState(null);
  const [activeView, setActiveView] = useState('MATRIX'); // 'MATRIX', 'RECORDS', 'MATERIALS'
  const [toast, setToast] = useState(null);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/pengolahan?month=${month}&year=${year}&t=${Date.now()}`);
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

  const handleExportExcel = () => {
    if (!reportData) return;

    const { dailyLogs = [], monthlyTotals = {} } = reportData;
    const titleText = `REKAPITULASI PENGOLAHAN & PRODUKSI SUSU OLAHAN SIAP JUAL`;
    const periodText = `BULAN: ${monthNames[month - 1].toUpperCase()} ${year}`;

    let tableHTML = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="UTF-8"></head>
      <body>
        <h2 style="text-align:center;">${titleText}</h2>
        <h3 style="text-align:center;">SEKSI PENGEMASAN & OLAHAN KE SEKSI PEMASARAN - TAHUN ${year}</h3>
        <h4 style="text-align:center;">${periodText}</h4>
        <table border="1" style="border-collapse:collapse; text-align:center;">
          <thead>
            <tr style="background-color:#1E3F20; color:white; font-weight:bold;">
              <th rowspan="2">No</th>
              <th rowspan="2">Tanggal</th>
              <th colspan="2" style="background-color:#16331a;">BAHAN BAKU SUSU</th>
              <th colspan="6" style="background-color:#0D5C3A;">HASIL PRODUKSI (PCS)</th>
              <th rowspan="2" style="background-color:#084229;">TOTAL PRODUK JADI</th>
            </tr>
            <tr style="background-color:#e2e8f0; font-weight:bold; color:black;">
              <th>DITERIMA (LTR)</th>
              <th>DIOLEH (LTR)</th>
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
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([tableHTML], { type: 'application/vnd.ms-excel;choice=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rekapitulasi_Pengolahan_${monthNames[month - 1]}_${year}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const dailyLogs = reportData?.dailyLogs || [];
  const monthlyTotals = reportData?.monthlyTotals || {};
  const monthlyVariantBreakdown = reportData?.monthlyVariantBreakdown || {};
  const summary = reportData?.summary || {};
  const records = reportData?.records || [];
  const materialUsage = reportData?.materialUsage || [];

  const fmtNum = (n) => (n > 0 ? n.toLocaleString('id-ID') : '0');

  return (
    <div className="space-y-6 pb-12 print:p-0 print:space-y-4">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* TOP BAR / HEADER PAGE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4 print:hidden">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1E3F20] text-white rounded-full text-xs font-bold mb-2">
            <FileText className="w-4 h-4 text-emerald-200" />
            <span>DIVISI UHT / PENGOLAHAN</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Laporan Pengolahan Susu & Rekapitulasi Produk</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
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
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('MATRIX')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === 'MATRIX'
                ? 'bg-[#1E3F20] text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <TableIcon className="w-4 h-4" />
            <span>Matriks Rekapitulasi (1-31)</span>
          </button>
          <button
            onClick={() => setActiveView('RECORDS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === 'RECORDS'
                ? 'bg-[#1E3F20] text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Rincian Pengolahan ({records.length})</span>
          </button>
          <button
            onClick={() => setActiveView('MATERIALS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === 'MATERIALS'
                ? 'bg-[#1E3F20] text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Sisa Stok Bahan ({materialUsage.length})</span>
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
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
        
        {/* DOCUMENT TITLE HEADER */}
        <div className="text-center space-y-1.5 border-b border-slate-200 pb-4 print:border-black">
          <h2 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-wide print:text-black">
            SERAH TERIMA SUSU OLAHAN & PRODUK SIAP JUAL BBPTU HPT BATURRADEN
          </h2>
          <h3 className="text-sm md:text-base font-bold text-slate-700 uppercase tracking-wide print:text-black">
            DARI SEKSI PENGEMASAN & OLAHAN KE SEKSI PEMASARAN
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

        {/* VIEW 1: OFFICIAL REKAPITULASI MATRIX TABLE */}
        {activeView === 'MATRIX' && (
          loading ? (
            <div className="p-12 text-center"><LoadingSpinner text="Memuat Matriks Rekapitulasi Pengolahan..." /></div>
          ) : (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full text-center text-[11px] border-collapse border border-slate-300 print:border-black font-mono">
                  <thead>
                    {/* Row 1 Header */}
                    <tr className="bg-slate-100 text-slate-900 font-extrabold uppercase print:bg-slate-200">
                      <th rowSpan={3} className="border border-slate-300 print:border-black px-2 py-2 w-10 font-sans">No</th>
                      <th rowSpan={3} className="border border-slate-300 print:border-black px-2 py-2 w-24 font-sans">Tanggal</th>
                      <th colSpan={2} className="border border-slate-300 print:border-black px-2 py-1.5 font-sans bg-blue-50/60">BAHAN BAKU SUSU</th>
                      <th colSpan={6} className="border border-slate-300 print:border-black px-2 py-1.5 font-sans bg-emerald-50/60">HASIL PRODUKSI (PCS)</th>
                      <th rowSpan={2} className="border border-slate-300 print:border-black px-2 py-1.5 font-sans bg-emerald-100">JUMLAH PRODUK</th>
                    </tr>

                    {/* Row 2 Header */}
                    <tr className="bg-slate-100 text-slate-900 font-extrabold uppercase print:bg-slate-200">
                      <th className="border border-slate-300 print:border-black px-2 py-1.5 font-sans">SUSU DITERIMA</th>
                      <th className="border border-slate-300 print:border-black px-2 py-1.5 font-sans">SUSU DIOLEH</th>
                      <th className="border border-slate-300 print:border-black px-2 py-1.5 font-sans">SUSU 115 ML</th>
                      <th className="border border-slate-300 print:border-black px-2 py-1.5 font-sans">SUSU 130 ML</th>
                      <th className="border border-slate-300 print:border-black px-2 py-1.5 font-sans">SUSU 200 ML</th>
                      <th className="border border-slate-300 print:border-black px-2 py-1.5 font-sans">SUSU 250 ML</th>
                      <th className="border border-slate-300 print:border-black px-2 py-1.5 font-sans bg-purple-50">YOGURT 200 ML</th>
                      <th className="border border-slate-300 print:border-black px-2 py-1.5 font-sans bg-amber-50">KEJU</th>
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
                          <td className="border border-slate-300 print:border-black px-1 py-1 font-sans font-bold">{log.day}</td>
                          <td className="border border-slate-300 print:border-black px-1 py-1 font-sans">{log.dateStr}</td>
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
                  <tfoot>
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

              {/* SECTION: RINCIAN PRODUKSI DENGAN VARIAN RASA */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3 print:bg-white print:border-black">
                <h4 className="text-xs font-black text-emerald-900 uppercase flex items-center gap-1.5 print:text-black">
                  <Tag className="w-4 h-4 text-emerald-700 print:hidden" />
                  <span>Rincian Hasil Produksi Menurut Ukuran & Varian Rasa ({monthNames[month - 1]} {year})</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.keys(monthlyVariantBreakdown).length > 0 ? (
                    Object.entries(monthlyVariantBreakdown).map(([name, qty], idx) => (
                      <div key={idx} className="p-3 bg-white rounded-xl border border-emerald-100 shadow-xs flex items-center justify-between print:border-black">
                        <span className="text-xs font-bold text-slate-800 print:text-black">{name}</span>
                        <span className="text-xs font-black text-emerald-700 print:text-black font-mono bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                          {qty} pcs
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-xs text-slate-400 font-bold text-center py-2">
                      Belum ada rincian varian rasa untuk bulan ini.
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION: SISA STOK BAHAN BAKU & KEMASAN */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 print:bg-white print:border-black">
                <h4 className="text-xs font-black text-slate-900 uppercase flex items-center gap-1.5 print:text-black">
                  <Boxes className="w-4 h-4 text-slate-700 print:hidden" />
                  <span>Sisa Stok Bahan Baku & Kemasan (Real-Time)</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-blue-200 shadow-xs space-y-1 print:border-black">
                    <span className="text-[11px] font-bold text-slate-500 block">Sisa Stok Susu Segar</span>
                    <span className="text-sm font-black text-blue-900 font-mono block">
                      {fmtNum(summary.sisaStokSusuSegar || 0)} Liter
                    </span>
                  </div>

                  {materialUsage.map((m) => (
                    <div key={m.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1 print:border-black">
                      <span className="text-[11px] font-bold text-slate-600 block truncate">{m.name}</span>
                      <span className="text-xs font-black text-slate-900 font-mono block">
                        {fmtNum(m.finalStock)} {m.unit || 'pcs'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        )}

        {/* VIEW 2: TRANSAKSI PENGOLAHAN LOGS */}
        {activeView === 'RECORDS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">No</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Produk & Varian</th>
                  <th className="p-3">Ukuran</th>
                  <th className="p-3 text-right">Jumlah Produksi</th>
                  <th className="p-3 text-right">Susu Murni (Bahan)</th>
                  <th className="p-3 text-center">Breakdown Kemasan</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 font-bold">
                      Tidak ada data transaksi pengolahan.
                    </td>
                  </tr>
                ) : (
                  records.map((r, idx) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                        {new Date(r.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">{r.productCategory} {r.productSubtype || ''}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{r.variant || 'Original'} ({r.origin || 'Sapi'})</span>
                      </td>
                      <td className="p-3">{r.packageSize || r.packagingType || 'Botol'}</td>
                      <td className="p-3 text-right font-black text-slate-900 text-sm">
                        {r.totalPackagedQty} pcs
                      </td>
                      <td className="p-3 text-right font-bold text-purple-700">
                        {r.processedAmount} {r.processedUnit || 'Liter'}
                      </td>
                      <td className="p-3 text-center">
                        <div className="inline-flex gap-1 text-[10px]">
                          {r.botolQty > 0 && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-bold">{r.botolQty} Botol</span>}
                          {r.cupQty > 0 && <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded font-bold">{r.cupQty} Cup</span>}
                          {r.plastikBantalQty > 0 && <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded font-bold">{r.plastikBantalQty} Plastik</span>}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black uppercase">
                          Selesai
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW 3: MATERIAL USAGE & SISA STOK REPORT */}
        {activeView === 'MATERIALS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Kode</th>
                  <th className="p-3">Nama Bahan</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3 text-right">Stok Awal</th>
                  <th className="p-3 text-right">Digunakan (Pengolahan)</th>
                  <th className="p-3 text-right">Penyesuaian (+)</th>
                  <th className="p-3 text-right">Sisa Stok Akhir</th>
                  <th className="p-3 text-center">Satuan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {materialUsage.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 font-bold">
                      Tidak ada data bahan kemasan.
                    </td>
                  </tr>
                ) : (
                  materialUsage.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-900">{m.code}</td>
                      <td className="p-3 font-bold text-slate-900">{m.name}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold">
                          {m.category}
                        </span>
                      </td>
                      <td className="p-3 text-right text-slate-500 font-bold">{m.initialStock}</td>
                      <td className="p-3 text-right text-red-600 font-bold">-{m.usedQty}</td>
                      <td className="p-3 text-right text-emerald-600 font-bold">+{m.adjustmentQty}</td>
                      <td className="p-3 text-right font-black text-slate-900 text-sm">{m.finalStock}</td>
                      <td className="p-3 text-center text-slate-500">{m.unit || 'pcs'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
