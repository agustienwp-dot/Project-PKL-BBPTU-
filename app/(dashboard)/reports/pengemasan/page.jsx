'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import { 
  FileText, 
  Printer, 
  Filter, 
  Calendar, 
  Milk, 
  Package, 
  Download,
  CheckCircle2,
  AlertCircle,
  BarChart3
} from 'lucide-react';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function LaporanPengemasanPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    summary: {
      totalFarmLiters: 0,
      totalHasilPengolahan: 0,
      totalPenjualan: 0,
      totalHibah: 0,
      totalRusakAfkir: 0,
      sisaStokAkhir: 0,
    },
    records: [],
    grandTotals: {},
  });
  const [toast, setToast] = useState(null);

  // Filters
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    try {
      let url = `/reports/packaging?month=${selectedMonth}&year=${selectedYear}`;
      if (isCustomRange && startDate && endDate) {
        url = `/reports/packaging?startDate=${startDate}&endDate=${endDate}`;
      }

      const res = await api.get(url);
      if (res.data.success) {
        setReportData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching packaging report:', err);
      setToast({ type: 'error', message: 'Gagal memuat rekap laporan pengemasan.' });
    } finally {
      setLoading(false);
    }
  };

  const { summary = {}, records = [], grandTotals: gt = {} } = reportData || {};

  useEffect(() => {
    fetchReport();
  }, [selectedMonth, selectedYear, isCustomRange, startDate, endDate]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const periodLabel = isCustomRange
      ? `${startDate}_sd_${endDate}`
      : `${MONTH_NAMES[selectedMonth - 1]}_${selectedYear}`;
    const filename = `Laporan_Pengemasan_${periodLabel}.xls`;

    // Construct HTML string formatted for Microsoft Excel with full styles
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8"/>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Laporan Pengemasan</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 11px; }
          th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: center; }
          th { background-color: #f1f5f9; font-weight: bold; color: #0f172a; }
          .header-title { font-size: 16px; font-weight: bold; text-align: center; margin-bottom: 5px; }
          .header-subtitle { font-size: 12px; text-align: center; color: #475569; margin-bottom: 15px; }
          .bg-blue { background-color: #dbeafe; }
          .bg-emerald { background-color: #d1fae5; }
          .bg-amber { background-color: #fef3c7; }
          .bg-rose { background-color: #ffe4e6; }
          .bg-purple { background-color: #f3e8ff; }
          .bg-total { background-color: #0f172a; color: #ffffff; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header-title">BBPTU SAPI PERAH BATURETTO</div>
        <div class="header-subtitle">REKAP LAPORAN HARIAN PENGEMASAN PRODUK SUSU - PERIODE: ${periodLabel.replace('_', ' ')}</div>
        <table>
          <thead>
            <tr>
              <th rowspan="3">NO</th>
              <th rowspan="3">TANGGAL</th>
              <th colspan="4" class="bg-blue">PENGAMBILAN SUSU SEGAR (Ltr)</th>
              <th colspan="6" class="bg-emerald">HASIL PENGOLAHAN (Botol/Cup)</th>
              <th colspan="8" class="bg-amber">DISTRIBUSI (Botol)</th>
              <th rowspan="3" class="bg-rose">RUSAK / AFKIR (Botol)</th>
              <th colspan="4" class="bg-purple">SISA STOK (Botol)</th>
            </tr>
            <tr>
              <th rowspan="2" class="bg-blue">Tegalsari</th>
              <th rowspan="2" class="bg-blue">Limpakuwus</th>
              <th rowspan="2" class="bg-blue">Manggala</th>
              <th rowspan="2" class="bg-blue">TOTAL</th>
              <th colspan="4" class="bg-emerald">Susu Pasteurisasi</th>
              <th rowspan="2" class="bg-emerald">Yogurt 200ml</th>
              <th rowspan="2" class="bg-emerald">TOTAL</th>
              <th colspan="3" class="bg-amber">PENJUALAN</th>
              <th colspan="4" class="bg-amber">HIBAH</th>
              <th rowspan="2" class="bg-amber">TOTAL DISTRIBUSI</th>
              <th rowspan="2" class="bg-purple">Susu 115ml</th>
              <th rowspan="2" class="bg-purple">Susu 250ml</th>
              <th rowspan="2" class="bg-purple">Yogurt 200ml</th>
              <th rowspan="2" class="bg-purple">JUMLAH STOK</th>
            </tr>
            <tr>
              <th class="bg-emerald">115 ml</th>
              <th class="bg-emerald">130 ml</th>
              <th class="bg-emerald">200 ml</th>
              <th class="bg-emerald">250 ml</th>
              <th class="bg-amber">Eduwisata</th>
              <th class="bg-amber">SPPG</th>
              <th class="bg-amber">Lain-lain</th>
              <th class="bg-amber">Int. Susu</th>
              <th class="bg-amber">Int. Yogurt</th>
              <th class="bg-amber">Eks. Susu</th>
              <th class="bg-amber">TOTAL HIBAH</th>
            </tr>
          </thead>
          <tbody>
    `;

    records.forEach((r, idx) => {
      html += `
        <tr>
          <td>${idx + 1}</td>
          <td>${r.formattedDate}</td>
          <td>${r.farmTegalsari || 0}</td>
          <td>${r.farmLimpakuwus || 0}</td>
          <td>${r.farmManggala || 0}</td>
          <td><b>${r.totalFarmLiters || 0}</b></td>
          <td>${r.susu115 || 0}</td>
          <td>${r.susu130 || 0}</td>
          <td>${r.susu200 || 0}</td>
          <td>${r.susu250 || 0}</td>
          <td>${r.yogurt200 || 0}</td>
          <td><b>${r.totalHasilPengolahan || 0}</b></td>
          <td>${r.saleEduwisata || 0}</td>
          <td>${r.saleSppg || 0}</td>
          <td>${r.saleLain || 0}</td>
          <td>${r.hibahInternalSusu || 0}</td>
          <td>${r.hibahInternalYogurt || 0}</td>
          <td>${r.hibahEksternalSusu || 0}</td>
          <td><b>${r.totalHibah || 0}</b></td>
          <td><b>${r.totalDistribusi || 0}</b></td>
          <td>${r.rusakAfkir || 0}</td>
          <td>${r.stokSusu115 || 0}</td>
          <td>${r.stokSusu250 || 0}</td>
          <td>${r.stokYogurt200 || 0}</td>
          <td><b>${r.totalStokBotol || 0}</b></td>
        </tr>
      `;
    });

    html += `
          <tr class="bg-total">
            <td colspan="2">TOTAL</td>
            <td>${gt.farmTegalsari || 0}</td>
            <td>${gt.farmLimpakuwus || 0}</td>
            <td>${gt.farmManggala || 0}</td>
            <td>${gt.totalFarmLiters || 0}</td>
            <td>${gt.susu115 || 0}</td>
            <td>${gt.susu130 || 0}</td>
            <td>${gt.susu200 || 0}</td>
            <td>${gt.susu250 || 0}</td>
            <td>${gt.yogurt200 || 0}</td>
            <td>${gt.totalHasilPengolahan || 0}</td>
            <td>${gt.saleEduwisata || 0}</td>
            <td>${gt.saleSppg || 0}</td>
            <td>${gt.saleLain || 0}</td>
            <td>${gt.hibahInternalSusu || 0}</td>
            <td>${gt.hibahInternalYogurt || 0}</td>
            <td>${gt.hibahEksternalSusu || 0}</td>
            <td>${gt.totalHibah || 0}</td>
            <td>${gt.totalDistribusi || 0}</td>
            <td>${gt.rusakAfkir || 0}</td>
            <td>${gt.stokSusu115 || 0}</td>
            <td>${gt.stokSusu250 || 0}</td>
            <td>${gt.stokYogurt200 || 0}</td>
            <td>${gt.totalStokBotol || 0}</td>
          </tr>
        </tbody>
      </table>
    </body>
    </html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-12 print:p-0 print:space-y-4">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* HEADER & ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 print:hidden">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-bold mb-2">
            <FileText className="w-4 h-4" />
            <span>Rekap Laporan Harian Otomatis</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Laporan Rekapitulasi Pengemasan</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Rekap harian otomatis pengambilan susu segar, hasil pengolahan, distribusi (penjualan & hibah), afkir, & sisa stok.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1E3F20] hover:bg-[#16331a] text-white rounded-2xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Export PDF</span>
          </button>
        </div>
      </div>

      {/* PRINT HEADER ONLY VISIBLE WHEN PRINTING */}
      <div className="hidden print:block text-center border-b-2 border-slate-900 pb-4 mb-6">
        <h1 className="text-xl font-black uppercase tracking-wider text-slate-900">BBPTU SAPI PERAH BATURETTO</h1>
        <h2 className="text-base font-bold text-slate-700 mt-1">REKAP LAPORAN HARIAN PENGEMASAN & DISTRIBUSI SUSU</h2>
        <p className="text-xs text-slate-500 mt-1">
          Periode: {isCustomRange ? `${startDate} s/d ${endDate}` : `${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`}
        </p>
      </div>

      {/* FILTER CONTROLS */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4 print:hidden">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-black text-slate-800">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>Filter Periode Laporan Rekap</span>
          </div>
          <button
            onClick={() => setIsCustomRange(!isCustomRange)}
            className="text-[11px] font-bold text-blue-600 hover:underline"
          >
            {isCustomRange ? 'Gunakan Filter Bulan/Tahun' : 'Gunakan Rentang Tanggal Custom'}
          </button>
        </div>

        {!isCustomRange ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filter Bulan */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Pilih Bulan</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={idx} value={idx + 1}>
                    📅 {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Tahun */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Pilih Tahun</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
              >
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Dari Tanggal</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Sampai Tanggal</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* RINGKASAN STATISTIK LAPORAN (6 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
        {/* Stat 1: Total Pengambilan Susu */}
        <div className="bg-white p-4 rounded-3xl border border-blue-200 bg-blue-50/20 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">Total Pengambilan</span>
          <p className="text-xl font-black text-blue-700">
            {(summary.totalFarmLiters || 0).toLocaleString()} <span className="text-xs font-bold text-slate-500">Ltr</span>
          </p>
          <p className="text-[10px] text-blue-800 font-semibold">Susu Segar Farm</p>
        </div>

        {/* Stat 2: Total Hasil Pengolahan */}
        <div className="bg-white p-4 rounded-3xl border border-emerald-200 bg-emerald-50/20 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block">Hasil Pengolahan</span>
          <p className="text-xl font-black text-emerald-700">
            {(summary.totalHasilPengolahan || 0).toLocaleString()} <span className="text-xs font-bold text-slate-500">Pcs</span>
          </p>
          <p className="text-[10px] text-emerald-800 font-semibold">Produk Kemasan</p>
        </div>

        {/* Stat 3: Total Penjualan */}
        <div className="bg-white p-4 rounded-3xl border border-amber-200 bg-amber-50/20 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">Total Penjualan</span>
          <p className="text-xl font-black text-amber-700">
            {(summary.totalPenjualan || 0).toLocaleString()} <span className="text-xs font-bold text-slate-500">Botol</span>
          </p>
          <p className="text-[10px] text-amber-800 font-semibold">Terjual Pemasaran</p>
        </div>

        {/* Stat 4: Total Hibah */}
        <div className="bg-white p-4 rounded-3xl border border-purple-200 bg-purple-50/20 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider block">Total Hibah</span>
          <p className="text-xl font-black text-purple-700">
            {(summary.totalHibah || 0).toLocaleString()} <span className="text-xs font-bold text-slate-500">Botol</span>
          </p>
          <p className="text-[10px] text-purple-800 font-semibold">Internal & Eksternal</p>
        </div>

        {/* Stat 5: Total Afkir */}
        <div className="bg-white p-4 rounded-3xl border border-rose-200 bg-rose-50/20 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-rose-900 uppercase tracking-wider block">Rusak / Afkir</span>
          <p className="text-xl font-black text-rose-700">
            {(summary.totalRusakAfkir || 0).toLocaleString()} <span className="text-xs font-bold text-slate-500">Botol</span>
          </p>
          <p className="text-[10px] text-rose-800 font-semibold">Produk Afkir</p>
        </div>

        {/* Stat 6: Sisa Stok Akhir */}
        <div className="bg-slate-900 text-white p-4 rounded-3xl shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Sisa Stok Akhir</span>
          <p className="text-xl font-black text-amber-400">
            {(summary.sisaStokAkhir || 0).toLocaleString()} <span className="text-xs font-bold text-slate-300">Botol</span>
          </p>
          <p className="text-[10px] text-slate-300 font-semibold">Stok Siap Distribusi</p>
        </div>
      </div>

      {/* TABEL REKAP HARIAN OTOMATIS BERDASARKAN EXCEL */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-600" />
              <span>Rekapitulasi Laporan Harian ({records.length} Hari Transaksi)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Format tabel bertingkat otomatis mengikuti struktur Excel referensi.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center"><LoadingSpinner text="Memuat rekap laporan harian..." /></div>
        ) : (
          <div className="overflow-x-auto max-w-full">
            <table className="w-full text-center text-xs border-collapse min-w-[1300px]">
              <thead>
                {/* Row 1 Header Grouping */}
                <tr className="bg-slate-100 text-slate-800 font-extrabold uppercase border-b border-slate-200">
                  <th rowSpan={3} className="py-3 px-3 border-r border-slate-200 w-12 sticky left-0 bg-slate-100 z-20">NO</th>
                  <th rowSpan={3} className="py-3 px-4 border-r border-slate-200 min-w-[120px] sticky left-12 bg-slate-100 z-20 text-left">TANGGAL</th>
                  <th colSpan={4} className="py-2.5 px-3 bg-blue-100 text-blue-900 border-r border-slate-200">
                    A. PENGAMBILAN SUSU SEGAR (Ltr)
                  </th>
                  <th colSpan={6} className="py-2.5 px-3 bg-emerald-100 text-emerald-900 border-r border-slate-200">
                    B. HASIL PENGOLAHAN (Botol/Cup)
                  </th>
                  <th colSpan={8} className="py-2.5 px-3 bg-amber-100 text-amber-900 border-r border-slate-200">
                    C. DISTRIBUSI (Botol)
                  </th>
                  <th rowSpan={3} className="py-3 px-3 bg-rose-100 text-rose-900 border-r border-slate-200 w-24">
                    D. RUSAK / AFKIR (Botol)
                  </th>
                  <th colSpan={4} className="py-2.5 px-3 bg-purple-100 text-purple-900">
                    E. SISA STOK (Botol)
                  </th>
                </tr>

                {/* Row 2 Sub-Headers */}
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                  {/* Pengambilan */}
                  <th rowSpan={2} className="py-2 px-2 border-r border-slate-200 bg-blue-50/70">Tegalsari</th>
                  <th rowSpan={2} className="py-2 px-2 border-r border-slate-200 bg-blue-50/70">Limpakuwus</th>
                  <th rowSpan={2} className="py-2 px-2 border-r border-slate-200 bg-blue-50/70">Manggala</th>
                  <th rowSpan={2} className="py-2 px-2 border-r border-slate-200 bg-blue-100 font-black text-blue-900">TOTAL</th>

                  {/* Hasil Pengolahan */}
                  <th colSpan={4} className="py-1.5 px-2 border-r border-slate-200 bg-emerald-50/70">Susu Pasteurisasi</th>
                  <th rowSpan={2} className="py-2 px-2 border-r border-slate-200 bg-emerald-50/70">Yogurt 200ml</th>
                  <th rowSpan={2} className="py-2 px-2 border-r border-slate-200 bg-emerald-100 font-black text-emerald-900">TOTAL</th>

                  {/* Distribusi */}
                  <th colSpan={3} className="py-1.5 px-2 border-r border-slate-200 bg-amber-50/70">PENJUALAN</th>
                  <th colSpan={4} className="py-1.5 px-2 border-r border-slate-200 bg-amber-50/70">HIBAH</th>
                  <th rowSpan={2} className="py-2 px-2 border-r border-slate-200 bg-amber-100 font-black text-amber-900">TOTAL DISTRIBUSI</th>

                  {/* Sisa Stok */}
                  <th rowSpan={2} className="py-2 px-2 border-r border-slate-200 bg-purple-50/70">Susu 115ml</th>
                  <th rowSpan={2} className="py-2 px-2 border-r border-slate-200 bg-purple-50/70">Susu 250ml</th>
                  <th rowSpan={2} className="py-2 px-2 border-r border-slate-200 bg-purple-50/70">Yogurt 200ml</th>
                  <th rowSpan={2} className="py-2 px-2 bg-purple-100 font-black text-purple-900">JUMLAH STOK</th>
                </tr>

                {/* Row 3 Detail Sizes & Sub-Types */}
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[10px]">
                  {/* Susu Pasteurisasi Sizes */}
                  <th className="py-1.5 px-2 border-r border-slate-200 bg-emerald-50/40">115 ml</th>
                  <th className="py-1.5 px-2 border-r border-slate-200 bg-emerald-50/40">130 ml</th>
                  <th className="py-1.5 px-2 border-r border-slate-200 bg-emerald-50/40">200 ml</th>
                  <th className="py-1.5 px-2 border-r border-slate-200 bg-emerald-50/40">250 ml</th>

                  {/* Penjualan Channels */}
                  <th className="py-1.5 px-2 border-r border-slate-200 bg-amber-50/40">Eduwisata</th>
                  <th className="py-1.5 px-2 border-r border-slate-200 bg-amber-50/40">SPPG</th>
                  <th className="py-1.5 px-2 border-r border-slate-200 bg-amber-50/40">Lain-lain</th>

                  {/* Hibah Types */}
                  <th className="py-1.5 px-2 border-r border-slate-200 bg-amber-50/40">Int. Susu</th>
                  <th className="py-1.5 px-2 border-r border-slate-200 bg-amber-50/40">Int. Yogurt</th>
                  <th className="py-1.5 px-2 border-r border-slate-200 bg-amber-50/40">Eks. Susu</th>
                  <th className="py-1.5 px-2 border-r border-slate-200 bg-amber-100/60 font-bold">TOTAL HIBAH</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                {records.length > 0 ? (
                  records.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 text-center font-bold text-slate-400 border-r border-slate-200 sticky left-0 bg-white group-hover:bg-slate-50">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap text-left border-r border-slate-200 sticky left-12 bg-white group-hover:bg-slate-50">
                        {r.formattedDate}
                      </td>

                      {/* Pengambilan */}
                      <td className="py-3 px-2 border-r border-slate-100">{r.farmTegalsari || 0}</td>
                      <td className="py-3 px-2 border-r border-slate-100">{r.farmLimpakuwus || 0}</td>
                      <td className="py-3 px-2 border-r border-slate-100">{r.farmManggala || 0}</td>
                      <td className="py-3 px-2 border-r border-slate-200 font-bold text-blue-800 bg-blue-50/30">{r.totalFarmLiters || 0}</td>

                      {/* Hasil Pengolahan */}
                      <td className="py-3 px-2 border-r border-slate-100">{r.susu115 || 0}</td>
                      <td className="py-3 px-2 border-r border-slate-100">{r.susu130 || 0}</td>
                      <td className="py-3 px-2 border-r border-slate-100">{r.susu200 || 0}</td>
                      <td className="py-3 px-2 border-r border-slate-100">{r.susu250 || 0}</td>
                      <td className="py-3 px-2 border-r border-slate-100">{r.yogurt200 || 0}</td>
                      <td className="py-3 px-2 border-r border-slate-200 font-bold text-emerald-800 bg-emerald-50/30">{r.totalHasilPengolahan || 0}</td>

                      {/* Distribusi Penjualan */}
                      <td className="py-3 px-2 border-r border-slate-100">{r.saleEduwisata || 0}</td>
                      <td className="py-3 px-2 border-r border-slate-100">{r.saleSppg || 0}</td>
                      <td className="py-3 px-2 border-r border-slate-100">{r.saleLain || 0}</td>

                      {/* Distribusi Hibah */}
                      <td className="py-3 px-2 border-r border-slate-100">{r.hibahInternalSusu || 0}</td>
                      <td className="py-3 px-2 border-r border-slate-100">{r.hibahInternalYogurt || 0}</td>
                      <td className="py-3 px-2 border-r border-slate-100">{r.hibahEksternalSusu || 0}</td>
                      <td className="py-3 px-2 border-r border-slate-100 font-semibold text-amber-800">{r.totalHibah || 0}</td>
                      <td className="py-3 px-2 border-r border-slate-200 font-bold text-amber-900 bg-amber-50/30">{r.totalDistribusi || 0}</td>

                      {/* Rusak / Afkir */}
                      <td className="py-3 px-2 border-r border-slate-200 font-bold text-rose-700 bg-rose-50/20">{r.rusakAfkir || 0}</td>

                      {/* Sisa Stok */}
                      <td className="py-3 px-2 border-r border-slate-100">{r.stokSusu115 || 0}</td>
                      <td className="py-3 px-2 border-r border-slate-100">{r.stokSusu250 || 0}</td>
                      <td className="py-3 px-2 border-r border-slate-100">{r.stokYogurt200 || 0}</td>
                      <td className="py-3 px-2 font-black text-purple-900 bg-purple-50/40">{r.totalStokBotol || 0}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={25} className="py-12 text-center text-slate-400 font-medium">
                      Belum ada transaksi pada periode laporan yang dipilih.
                    </td>
                  </tr>
                )}
              </tbody>

              {/* Bottom Grand Total Row */}
              {records.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-900 text-white font-black text-xs border-t-2 border-slate-800">
                    <td colSpan={2} className="py-4 px-4 text-center tracking-wider uppercase sticky left-0 bg-slate-900 border-r border-slate-800 z-10">
                      TOTAL PERIODE
                    </td>

                    {/* Total Pengambilan */}
                    <td className="py-4 px-2 border-r border-slate-800 text-blue-300">{gt.farmTegalsari || 0}</td>
                    <td className="py-4 px-2 border-r border-slate-800 text-blue-300">{gt.farmLimpakuwus || 0}</td>
                    <td className="py-4 px-2 border-r border-slate-800 text-blue-300">{gt.farmManggala || 0}</td>
                    <td className="py-4 px-2 border-r border-slate-800 text-blue-400 text-sm">{gt.totalFarmLiters || 0}</td>

                    {/* Total Hasil Pengolahan */}
                    <td className="py-4 px-2 border-r border-slate-800 text-emerald-300">{gt.susu115 || 0}</td>
                    <td className="py-4 px-2 border-r border-slate-800 text-emerald-300">{gt.susu130 || 0}</td>
                    <td className="py-4 px-2 border-r border-slate-800 text-emerald-300">{gt.susu200 || 0}</td>
                    <td className="py-4 px-2 border-r border-slate-800 text-emerald-300">{gt.susu250 || 0}</td>
                    <td className="py-4 px-2 border-r border-slate-800 text-emerald-300">{gt.yogurt200 || 0}</td>
                    <td className="py-4 px-2 border-r border-slate-800 text-emerald-400 text-sm">{gt.totalHasilPengolahan || 0}</td>

                    {/* Total Distribusi Penjualan */}
                    <td className="py-4 px-2 border-r border-slate-800 text-amber-300">{gt.saleEduwisata || 0}</td>
                    <td className="py-4 px-2 border-r border-slate-800 text-amber-300">{gt.saleSppg || 0}</td>
                    <td className="py-4 px-2 border-r border-slate-800 text-amber-300">{gt.saleLain || 0}</td>

                    {/* Total Distribusi Hibah */}
                    <td className="py-4 px-2 border-r border-slate-800 text-amber-300">{gt.hibahInternalSusu || 0}</td>
                    <td className="py-4 px-2 border-r border-slate-800 text-amber-300">{gt.hibahInternalYogurt || 0}</td>
                    <td className="py-4 px-2 border-r border-slate-800 text-amber-300">{gt.hibahEksternalSusu || 0}</td>
                    <td className="py-4 px-2 border-r border-slate-800 text-amber-300">{gt.totalHibah || 0}</td>
                    <td className="py-4 px-2 border-r border-slate-800 text-amber-400 text-sm">{gt.totalDistribusi || 0}</td>

                    {/* Total Afkir */}
                    <td className="py-4 px-2 border-r border-slate-800 text-rose-400 text-sm">{gt.rusakAfkir || 0}</td>

                    {/* Final Sisa Stok */}
                    <td className="py-4 px-2 border-r border-slate-800 text-purple-300">{gt.stokSusu115 || 0}</td>
                    <td className="py-4 px-2 border-r border-slate-800 text-purple-300">{gt.stokSusu250 || 0}</td>
                    <td className="py-4 px-2 border-r border-slate-800 text-purple-300">{gt.stokYogurt200 || 0}</td>
                    <td className="py-4 px-2 text-amber-400 text-sm">{gt.totalStokBotol || 0}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>

      {/* FOOTER SIGNATURE ONLY FOR PRINTING */}
      <div className="hidden print:grid grid-cols-2 gap-8 pt-12 text-center text-xs font-semibold text-slate-800">
        <div>
          <p>Mengetahui,</p>
          <p className="font-bold">Kepala Seksi Pelayanan Teknis</p>
          <div className="h-16"></div>
          <p className="font-black underline">( ......................................... )</p>
          <p className="text-[10px] text-slate-500">NIP. .........................................</p>
        </div>
        <div>
          <p>Baturetto, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p className="font-bold">Admin Pengemasan</p>
          <div className="h-16"></div>
          <p className="font-black underline">( {user?.name || 'Admin Pengemasan'} )</p>
          <p className="text-[10px] text-slate-500">NIP / ID. {user?.id?.slice(0, 8) || '................'}</p>
        </div>
      </div>
    </div>
  );
}
