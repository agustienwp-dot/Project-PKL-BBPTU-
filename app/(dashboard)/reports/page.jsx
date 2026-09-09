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
  CheckCircle2
} from 'lucide-react';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [productType, setProductType] = useState('SEGAR'); // SEGAR or OLAHAN
  const [reportData, setReportData] = useState(null);
  const [toast, setToast] = useState(null);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/monthly?month=${month}&year=${year}&productType=${productType}`);
      if (res.data.success) {
        setReportData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching monthly report:', err);
      setToast({ type: 'error', message: 'Gagal memuat data laporan bulanan.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [month, year, productType]);

  const handlePrint = () => {
    window.print();
  };

  const summary = reportData?.summary || {};
  const dailyLogs = reportData?.dailyLogs || [];

  return (
    <div className="space-y-8 pb-12 print:p-0 print:bg-white print:text-black">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header section (Hidden on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold mb-2">
            <FileText className="w-4 h-4" />
            <span>Akumulasi Laporan Bulanan</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Rekapitulasi Stok & Laporan Bulanan</h1>
          <p className="text-xs text-slate-500 font-medium">Pantau akumulasi harian (tanggal 1–31) dan total bulanan produksi & pengeluaran.</p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-[#1E3F20] text-white hover:bg-[#16331a] rounded-2xl text-xs font-bold shadow-md transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak / Print Laporan</span>
        </button>
      </div>

      {/* Filter Section (Hidden on print) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 print:hidden">
        {/* Product Type Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setProductType('SEGAR')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              productType === 'SEGAR' ? 'bg-[#1E3F20] text-white shadow' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Milk className="w-4 h-4" />
            <span>Laporan Susu Segar</span>
          </button>
          <button
            onClick={() => setProductType('OLAHAN')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              productType === 'OLAHAN' ? 'bg-amber-600 text-white shadow' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>Laporan Susu Olahan (Cup, Pack, Botol)</span>
          </button>
        </div>

        {/* Month & Year Selectors */}
        <div className="flex items-center gap-3">
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value, 10))}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            {monthNames.map((name, idx) => (
              <option key={idx + 1} value={idx + 1}>{name}</option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value, 10))}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
        </div>
      </div>

      {/* Printable Official Document Header */}
      <div className="hidden print:block border-b-2 border-black pb-4 text-center space-y-1">
        <h2 className="text-xl font-bold uppercase tracking-wider">LAPORAN REKAPITULASI MANAGEMENT STOK SUSU</h2>
        <p className="text-sm font-semibold">Periode: {monthNames[month - 1]} {year} • Tipe Produk: {productType === 'SEGAR' ? 'Susu Segar Murni' : 'Susu Olahan (Cup/Pack/Botol)'}</p>
      </div>

      {/* Monthly Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2 print:border-black print:rounded-none">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Raw Susu (Liter)</span>
          <p className="text-2xl font-black text-slate-900">{(summary.totalRawLiters || 0).toLocaleString()} <span className="text-xs font-bold text-slate-500">Liter</span></p>
          <p className="text-[11px] text-slate-400">Total hasil perah bulan ini</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2 print:border-black print:rounded-none">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Susu Diproses</span>
          <p className="text-2xl font-black text-slate-900">{(summary.totalProcessedLiters || 0).toLocaleString()} <span className="text-xs font-bold text-slate-500">Liter</span></p>
          <p className="text-[11px] text-slate-400">Total volume diproses</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2 print:border-black print:rounded-none">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Hasil Dikemas</span>
          <p className="text-2xl font-black text-emerald-700">{(summary.totalPackaged || 0).toLocaleString()} <span className="text-xs font-bold text-slate-500">pcs/botol</span></p>
          <p className="text-[11px] text-slate-400 font-semibold">
            Botol: {summary.packagingProducedTotals?.botol || 0} | Cup: {summary.packagingProducedTotals?.cup || 0} | Pack: {summary.packagingProducedTotals?.pack || 0}
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2 print:border-black print:rounded-none">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Produk Keluar</span>
          <p className="text-2xl font-black text-rose-600">{(summary.totalOutflow || 0).toLocaleString()} <span className="text-xs font-bold text-slate-500">pcs/botol</span></p>
          <p className="text-[11px] text-slate-400 font-semibold">
            Botol: {summary.packagingOutflowTotals?.botol || 0} | Cup: {summary.packagingOutflowTotals?.cup || 0} | Pack: {summary.packagingOutflowTotals?.pack || 0}
          </p>
        </div>
      </div>

      {/* Daily Breakdown Table (Tanggal 1 sd 31) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden print:border-black print:rounded-none">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between print:p-2 print:border-black">
          <h2 className="text-base font-black text-slate-800 flex items-center gap-2 print:text-sm">
            <Calendar className="w-5 h-5 text-emerald-600 print:hidden" />
            <span>Rincian Akumulasi Harian ({monthNames[month - 1]} {year})</span>
          </h2>
          <span className="text-xs font-bold text-slate-400 print:text-[10px]">Tipe: {productType}</span>
        </div>

        {loading ? (
          <div className="p-8 text-center"><LoadingSpinner text="Memuat laporan bulanan..." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs print:text-[10px]">
              <thead className="bg-[#1E3F20] text-white select-none print:bg-gray-100 print:text-black">
                <tr className="border-b border-[#2d5e31] text-white font-bold uppercase tracking-wider print:border-black print:text-black">
                  <th className="py-3 px-4 text-white font-bold print:text-black print:py-1 print:px-2">Tanggal</th>
                  <th className="py-3 px-4 text-white font-bold print:text-black print:py-1 print:px-2">Perah (Liter)</th>
                  <th className="py-3 px-4 text-white font-bold print:text-black print:py-1 print:px-2">Diproses (Liter)</th>
                  <th className="py-3 px-4 text-white font-bold print:text-black print:py-1 print:px-2">Hasil Dikemas</th>
                  <th className="py-3 px-4 text-white font-bold print:text-black print:py-1 print:px-2">Pengeluaran / Terjual</th>
                  {productType === 'OLAHAN' && (
                    <th className="py-3 px-4 text-white font-bold print:text-black print:py-1 print:px-2">Rincian Kemasan (Dikemas / Keluar)</th>
                  )}
                  <th className="py-3 px-4 text-white font-bold print:text-black print:py-1 print:px-2 text-right">Perubahan Stok Hari Ini</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700 print:divide-black">
                {dailyLogs.map((log) => {
                  const netDay = log.packagedQty - log.outflowQty;
                  return (
                    <tr key={log.day} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 print:py-1 print:px-2">
                        {log.day} {monthNames[month - 1]} {year}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800 print:py-1 print:px-2">{log.rawVolumeLiters} L</td>
                      <td className="py-3 px-4 text-slate-600 print:py-1 print:px-2">{log.processedLiters} L</td>
                      <td className="py-3 px-4 font-bold text-emerald-700 print:py-1 print:px-2">
                        {log.packagedQty > 0 ? `+${log.packagedQty}` : '0'}
                      </td>
                      <td className="py-3 px-4 font-bold text-rose-600 print:py-1 print:px-2">
                        {log.outflowQty > 0 ? `-${log.outflowQty}` : '0'}
                      </td>
                      {productType === 'OLAHAN' && (
                        <td className="py-3 px-4 text-slate-500 text-[11px] print:py-1 print:px-2">
                          Botol: +{log.pkgProd.botol || 0}/-{log.pkgOut.botol || 0} | Cup: +{log.pkgProd.cup || 0}/-{log.pkgOut.cup || 0} | Pack: +{log.pkgProd.pack || 0}/-{log.pkgOut.pack || 0}
                        </td>
                      )}
                      <td className="py-3 px-4 text-right font-black print:py-1 print:px-2">
                        <span className={netDay > 0 ? 'text-emerald-700' : netDay < 0 ? 'text-rose-600' : 'text-slate-400'}>
                          {netDay > 0 ? `+${netDay}` : netDay}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Printable Signature Footer */}
      <div className="hidden print:flex justify-between pt-12 text-center text-xs">
        <div className="space-y-12">
          <p>Petugas Admin Farm / Produksi</p>
          <p className="font-bold underline">(.......................................)</p>
        </div>
        <div className="space-y-12">
          <p>Mengetahui, Superadmin / Pengelola</p>
          <p className="font-bold underline">(.......................................)</p>
        </div>
      </div>
    </div>
  );
}
