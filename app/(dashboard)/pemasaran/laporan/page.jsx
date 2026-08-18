'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import exportExcel from '@/lib/exportExcel';
import { 
  BarChart3, 
  Calendar, 
  FileSpreadsheet, 
  Printer, 
  TrendingUp, 
  TrendingDown, 
  Boxes, 
  Award,
  DollarSign,
  Layers,
  Filter,
  Receipt,
  CheckCircle2
} from 'lucide-react';

export default function LaporanPemasaranPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Year filter for pivot report
  const [pivotYear, setPivotYear] = useState('2026');
  const [pivotData, setPivotData] = useState({ monthlyPivot: [], grandTotal: {} });

  const fetchPivotReport = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/pemasaran/daily-outflow/pivot?year=${pivotYear}`);
      if (res.data.success) {
        setPivotData(res.data.data || { monthlyPivot: [], grandTotal: {} });
      }
    } catch (err) {
      console.error('Error fetching pivot report data:', err);
      setToast({ type: 'error', message: 'Gagal memuat laporan pivot bulanan.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPivotReport();
  }, [pivotYear]);

  // Handle Export Excel for Pivot Report
  const handleExportPivotExcel = () => {
    if (!pivotData.monthlyPivot || pivotData.monthlyPivot.length === 0) {
      setToast({ type: 'error', message: 'Tidak ada data laporan untuk diexport.' });
      return;
    }
    const rows = pivotData.monthlyPivot.map((m) => ({
      'Bulan': m.monthName,
      'SUM of MYPI': m.sumMypi,
      'SUM of HS': m.sumHs,
      'SUM of HT': m.sumHt,
      'SUM of OS': m.sumOs,
      'SUM of JS (piutang)': m.sumJs,
      'SUM of JS PNBP': m.sumJsPnb,
      'SUM of Penambahan piutang': m.sumPenambahanPiutang,
      'SUM of Pengurangan piutang': m.sumPenguranganPiutang,
      'Total Keluar (pcs)': m.totalKeluar,
    }));

    // Add Grand Total
    const gt = pivotData.grandTotal || {};
    rows.push({
      'Bulan': 'GRAND TOTAL',
      'SUM of MYPI': gt.sumMypi || 0,
      'SUM of HS': gt.sumHs || 0,
      'SUM of HT': gt.sumHt || 0,
      'SUM of OS': gt.sumOs || 0,
      'SUM of JS (piutang)': gt.sumJs || 0,
      'SUM of JS PNBP': gt.sumJsPnb || 0,
      'SUM of Penambahan piutang': gt.sumPenambahanPiutang || 0,
      'SUM of Pengurangan piutang': gt.sumPenguranganPiutang || 0,
      'Total Keluar (pcs)': gt.totalKeluar || 0,
    });

    exportExcel(rows, `Laporan_Pivot_Pengeluaran_Susu_${pivotYear}`);
    setToast({ type: 'success', message: 'Laporan pivot bulanan berhasil diexport ke Excel!' });
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const grandTotal = pivotData.grandTotal || {};

  return (
    <div className="space-y-8 pb-12">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold mb-2">
            <BarChart3 className="w-4 h-4" />
            <span>POV Admin Pemasaran</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Laporan</h1>
          <p className="text-xs text-slate-500 font-medium">
            Agregasi total pengeluaran susu bulanan dan rekapitulasi piutang.
          </p>
        </div>

        {/* Action Buttons: Export & Print */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPivotExcel}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold shadow-md transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Cards Top Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-800 to-purple-950 text-white p-5 rounded-3xl shadow-md space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-purple-200 uppercase tracking-wider block">Total Outflow Tahun {pivotYear}</span>
            <TrendingDown className="w-5 h-5 text-purple-300" />
          </div>
          <p className="text-3xl font-black font-mono">{(grandTotal.totalKeluar || 0).toLocaleString('id-ID')} <span className="text-xs font-semibold text-purple-200">pcs</span></p>
          <p className="text-[10px] text-purple-300 font-medium">Akumulasi seluruh kategori susu</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Penambahan Piutang</span>
            <Receipt className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-3xl font-black text-amber-700 font-mono">{(grandTotal.sumPenambahanPiutang || 0).toLocaleString('id-ID')} <span className="text-xs font-semibold text-slate-500">pcs</span></p>
          <p className="text-[10px] text-amber-600 font-bold">Akumulasi piutang baru</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Pengurangan Piutang</span>
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-black text-blue-700 font-mono">{(grandTotal.sumPenguranganPiutang || 0).toLocaleString('id-ID')} <span className="text-xs font-semibold text-slate-500">pcs</span></p>
          <p className="text-[10px] text-blue-600 font-medium">Pelunasan piutang terverifikasi</p>
        </div>
      </div>

      {/* Filter Bar & Table Wrapper */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-700" />
            <h2 className="text-base font-black text-slate-900 uppercase tracking-wider">
              Tabel Rekapitulasi Pivot Bulanan
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Pilihan Tahun:</span>
            <select
              value={pivotYear}
              onChange={(e) => setPivotYear(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none bg-white shadow-sm"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>
        </div>

        {/* TABEL PIVOT REKAPITULASI BULANAN */}
        {loading ? (
          <div className="p-12 text-center"><LoadingSpinner text="Memuat data laporan pivot bulanan..." /></div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[1600px] text-left text-sm font-mono">
              <thead>
                <tr className="bg-slate-900 text-white font-black uppercase text-center text-xs tracking-wider">
                  <th className="py-3.5 px-4 border-r border-slate-800 text-left font-sans whitespace-nowrap">Bulan</th>
                  <th className="py-3.5 px-3.5 border-r border-slate-800 bg-emerald-950 text-emerald-200 whitespace-nowrap">SUM of MYPI</th>
                  <th className="py-3.5 px-3.5 border-r border-slate-800 whitespace-nowrap">SUM of HS</th>
                  <th className="py-3.5 px-3.5 border-r border-slate-800 whitespace-nowrap">SUM of HT</th>
                  <th className="py-3.5 px-3.5 border-r border-slate-800 whitespace-nowrap">SUM of OS</th>
                  <th className="py-3.5 px-3.5 border-r border-slate-800 bg-amber-950 text-amber-200 whitespace-nowrap">SUM of JS (piutang)</th>
                  <th className="py-3.5 px-3.5 border-r border-slate-800 bg-blue-950 text-blue-200 whitespace-nowrap">SUM of JS PNBP</th>
                  <th className="py-3.5 px-3.5 border-r border-slate-800 text-amber-300 whitespace-nowrap">SUM of Penambahan piutang</th>
                  <th className="py-3.5 px-3.5 border-r border-slate-800 text-blue-300 whitespace-nowrap">SUM of Pengurangan piutang</th>
                  <th className="py-3.5 px-3.5 bg-purple-900 text-white font-sans whitespace-nowrap">Total Keluar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-800 text-sm">
                {pivotData.monthlyPivot && pivotData.monthlyPivot.map((m) => (
                  <tr key={m.monthCode} className="hover:bg-slate-50 text-right transition-colors">
                    <td className="py-3.5 px-4 text-left font-sans font-extrabold text-slate-900 border-r border-slate-100 bg-slate-50/50">
                      {m.monthName}
                    </td>
                    <td className="py-3.5 px-3.5 border-r border-slate-100 font-extrabold text-emerald-800">{m.sumMypi.toLocaleString('id-ID')}</td>
                    <td className="py-3.5 px-3.5 border-r border-slate-100">{m.sumHs.toLocaleString('id-ID')}</td>
                    <td className="py-3.5 px-3.5 border-r border-slate-100">{m.sumHt.toLocaleString('id-ID')}</td>
                    <td className="py-3.5 px-3.5 border-r border-slate-100">{m.sumOs.toLocaleString('id-ID')}</td>
                    <td className="py-3.5 px-3.5 border-r border-slate-100 font-extrabold text-amber-800 bg-amber-50/20">{m.sumJs.toLocaleString('id-ID')}</td>
                    <td className="py-3.5 px-3.5 border-r border-slate-100 font-extrabold text-blue-800 bg-blue-50/20">{m.sumJsPnb.toLocaleString('id-ID')}</td>
                    <td className="py-3.5 px-3.5 border-r border-slate-100 text-amber-700 font-extrabold">{m.sumPenambahanPiutang.toLocaleString('id-ID')}</td>
                    <td className="py-3.5 px-3.5 border-r border-slate-100 text-blue-700 font-extrabold">{m.sumPenguranganPiutang.toLocaleString('id-ID')}</td>
                    <td className="py-3.5 px-3.5 font-black text-purple-900 bg-purple-50 text-sm">{m.totalKeluar.toLocaleString('id-ID')}</td>
                  </tr>
                ))}

                {/* GRAND TOTAL ROW */}
                {pivotData.grandTotal && (
                  <tr className="bg-slate-900 text-white font-black text-right text-sm border-t-2 border-slate-900">
                    <td className="py-4 px-4 text-left font-sans text-amber-300 uppercase tracking-wider">
                      GRAND TOTAL ({pivotYear})
                    </td>
                    <td className="py-4 px-3.5 text-emerald-300">{(grandTotal.sumMypi || 0).toLocaleString('id-ID')}</td>
                    <td className="py-4 px-3.5">{(grandTotal.sumHs || 0).toLocaleString('id-ID')}</td>
                    <td className="py-4 px-3.5">{(grandTotal.sumHt || 0).toLocaleString('id-ID')}</td>
                    <td className="py-4 px-3.5">{(grandTotal.sumOs || 0).toLocaleString('id-ID')}</td>
                    <td className="py-4 px-3.5 text-amber-300">{(grandTotal.sumJs || 0).toLocaleString('id-ID')}</td>
                    <td className="py-4 px-3.5 text-blue-300">{(grandTotal.sumJsPnb || 0).toLocaleString('id-ID')}</td>
                    <td className="py-4 px-3.5 text-amber-300">{(grandTotal.sumPenambahanPiutang || 0).toLocaleString('id-ID')}</td>
                    <td className="py-4 px-3.5 text-blue-300">{(grandTotal.sumPenguranganPiutang || 0).toLocaleString('id-ID')}</td>
                    <td className="py-4 px-3.5 text-emerald-400 font-sans text-base font-black">{(grandTotal.totalKeluar || 0).toLocaleString('id-ID')} pcs</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
