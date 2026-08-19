'use client';

import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import EmptyState from '@/components/EmptyState';
import {
  FileText,
  Calendar,
  Download,
  Filter,
  TrendingUp,
  Milk,
  Package,
  DollarSign,
  Receipt,
  CheckCircle2
} from 'lucide-react';
import ExcelJS from 'exceljs';

export default function LaporanPemasaranPage() {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [periodFilter, setPeriodFilter] = useState('MONTH'); // ALL / TODAY / WEEK / MONTH / YEAR / CUSTOM
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sumberFilter, setSumberFilter] = useState(''); // '' | 'FRESH' | 'OLAHAN'

  const [reportData, setReportData] = useState({
    summary: {
      totalSalesCount: 0,
      totalVolumeSold: 0,
      totalOmzet: 0,
      totalFreshVolume: 0,
      totalFreshOmzet: 0,
      totalOlahanQty: 0,
      totalOlahanOmzet: 0,
      totalPNBPOmzet: 0,
      totalPiutangOmzet: 0,
      totalSisaPiutang: 0,
    },
    sales: [],
  });

  // Calculate date range based on periodFilter
  const getDateParams = () => {
    if (periodFilter === 'CUSTOM') {
      return { start: startDate, end: endDate };
    }

    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (periodFilter === 'TODAY') {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (periodFilter === 'WEEK') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
      start = new Date(now.setDate(diff));
      start.setHours(0, 0, 0, 0);
      end = new Date();
    } else if (periodFilter === 'MONTH') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else if (periodFilter === 'YEAR') {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    } else {
      // ALL
      return { start: '', end: '' };
    }

    return {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    };
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const { start, end } = getDateParams();
      let queryParams = [];
      if (start) queryParams.push(`startDate=${start}`);
      if (end) queryParams.push(`endDate=${end}`);
      if (sumberFilter) queryParams.push(`sumber=${sumberFilter}`);

      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      const res = await api.get(`/reports/milk${queryString}`);

      if (res.data.success) {
        setReportData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching milk report:', err);
      setToast({ type: 'error', message: 'Gagal memuat laporan penjualan susu.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [periodFilter, sumberFilter]);

  const handleCustomFilterSubmit = (e) => {
    e.preventDefault();
    fetchReport();
  };

  const exportToExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Laporan Penjualan Susu');

      // Title header
      worksheet.mergeCells('A1', 'F1');
      worksheet.getCell('A1').value = 'LAPORAN PENJUALAN SUSU (FARMSTOCK PRO)';
      worksheet.getCell('A1').font = { size: 16, bold: true, color: { argb: '1E3F20' } };
      worksheet.getCell('A1').alignment = { horizontal: 'center' };

      worksheet.mergeCells('A2', 'F2');
      worksheet.getCell('A2').value = `Periode: ${periodFilter} | Dicetak: ${new Date().toLocaleDateString('id-ID')}`;
      worksheet.getCell('A2').font = { size: 11, italic: true };
      worksheet.getCell('A2').alignment = { horizontal: 'center' };

      worksheet.addRow([]); // empty row

      // Summary table
      worksheet.addRow(['RINGKASAN PENJUALAN']);
      worksheet.addRow(['Total Transaksi', reportData.summary.totalSalesCount]);
      worksheet.addRow(['Total Volume/Unit Terjual', reportData.summary.totalVolumeSold]);
      worksheet.addRow(['Total Omzet (Rp)', reportData.summary.totalOmzet]);
      worksheet.addRow(['Omzet PNBP (Rp)', reportData.summary.totalPNBPOmzet]);
      worksheet.addRow(['Omzet Piutang (Rp)', reportData.summary.totalPiutangOmzet]);
      worksheet.addRow(['Sisa Piutang Belum Lunas (Rp)', reportData.summary.totalSisaPiutang]);

      worksheet.addRow([]);

      // Detail Table Header
      const headerRow = worksheet.addRow(['Tanggal', 'Pembeli', 'Sumber', 'Jumlah', 'Total Harga (Rp)', 'Kategori Bayar']);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '1E3F20' },
        };
      });

      // Data Rows
      reportData.sales.forEach((s) => {
        worksheet.addRow([
          new Date(s.tanggal || s.date).toLocaleDateString('id-ID'),
          s.pembeli || '-',
          s.sumber || 'FRESH',
          `${s.jumlah || s.quantity} ${s.sumber === 'FRESH' ? 'Liter' : 'Unit'}`,
          s.hargaJual || s.totalPrice || 0,
          s.kategoriBayar || 'PNBP',
        ]);
      });

      // Auto width columns
      worksheet.columns.forEach((column) => {
        column.width = 20;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Laporan_Penjualan_Susu_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);

      setToast({ type: 'success', message: 'Berhasil mengunduh laporan Excel!' });
    } catch (error) {
      console.error('Error exporting Excel:', error);
      setToast({ type: 'error', message: 'Gagal mengunduh laporan Excel.' });
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-100 text-rose-800 rounded-2xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800">Laporan Penjualan Susu</h1>
            <p className="text-xs text-slate-500">Rekap omzet, breakdown produk, dan ekspor laporan ke format Excel</p>
          </div>
        </div>

        <button
          onClick={exportToExcel}
          className="inline-flex items-center gap-2 bg-[#1E3F20] hover:bg-[#2b592e] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 self-start md:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Excel (.xlsx)</span>
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Period Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
            {['ALL', 'TODAY', 'WEEK', 'MONTH', 'YEAR', 'CUSTOM'].map((period) => (
              <button
                key={period}
                onClick={() => setPeriodFilter(period)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                  periodFilter === period
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {period === 'ALL' && 'Semua'}
                {period === 'TODAY' && 'Hari Ini'}
                {period === 'WEEK' && 'Minggu Ini'}
                {period === 'MONTH' && 'Bulan Ini'}
                {period === 'YEAR' && 'Tahun Ini'}
                {period === 'CUSTOM' && 'Custom'}
              </button>
            ))}
          </div>

          {/* Sumber Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600">Sumber Produk:</label>
            <select
              value={sumberFilter}
              onChange={(e) => setSumberFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Semua (Fresh & Olahan)</option>
              <option value="FRESH">Susu Fresh</option>
              <option value="OLAHAN">Susu Olahan</option>
            </select>
          </div>
        </div>

        {/* Custom Date Inputs */}
        {periodFilter === 'CUSTOM' && (
          <form onSubmit={handleCustomFilterSubmit} className="flex flex-wrap items-end gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Tanggal Mulai</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Tanggal Sampai</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Terapkan Filter
            </button>
          </form>
        )}
      </div>

      {loading ? (
        <LoadingSpinner text="Mengkalkulasi Laporan Penjualan..." />
      ) : (
        <>
          {/* Summary Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Omzet</span>
              <h3 className="text-2xl font-black text-slate-800 mt-1">
                Rp {reportData.summary.totalOmzet.toLocaleString('id-ID')}
              </h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">
                {reportData.summary.totalSalesCount} Transaksi Terpenuhi
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Omzet PNBP (Tunai)</span>
              <h3 className="text-2xl font-black text-emerald-700 mt-1">
                Rp {reportData.summary.totalPNBPOmzet.toLocaleString('id-ID')}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Pembayaran Langsung</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Omzet Piutang</span>
              <h3 className="text-2xl font-black text-amber-700 mt-1">
                Rp {reportData.summary.totalPiutangOmzet.toLocaleString('id-ID')}
              </h3>
              <p className="text-[11px] text-amber-600 font-medium mt-1">
                Sisa Piutang: Rp {reportData.summary.totalSisaPiutang.toLocaleString('id-ID')}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Volume / Unit</span>
              <h3 className="text-2xl font-black text-blue-900 mt-1">
                {reportData.summary.totalVolumeSold.toLocaleString('id-ID')}
              </h3>
              <p className="text-[11px] text-blue-600 font-medium mt-1">
                Fresh: {reportData.summary.totalFreshVolume} L | Olahan: {reportData.summary.totalOlahanQty} U
              </p>
            </div>
          </div>

          {/* Detailed Sales Report Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-slate-800 text-base">Rincian Transaksi Penjualan</h2>
              <span className="text-xs font-semibold text-slate-500">Total: {reportData.sales.length} record</span>
            </div>

            {reportData.sales.length === 0 ? (
              <EmptyState
                title="Tidak Ada Data Penjualan"
                description="Tidak ditemukan transaksi penjualan untuk periode filter ini."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-y border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Tanggal</th>
                      <th className="px-4 py-3">Sumber</th>
                      <th className="px-4 py-3">Pembeli</th>
                      <th className="px-4 py-3">Jumlah</th>
                      <th className="px-4 py-3">Total Harga</th>
                      <th className="px-4 py-3">Kategori Bayar</th>
                      <th className="px-4 py-3">Status Piutang</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {reportData.sales.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 text-slate-600">
                          {new Date(s.tanggal || s.date).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.sumber === 'FRESH' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {s.sumber || 'FRESH'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-800">{s.pembeli}</td>
                        <td className="px-4 py-3">{s.jumlah || s.quantity} {s.sumber === 'FRESH' ? 'Liter' : 'Unit'}</td>
                        <td className="px-4 py-3 font-black text-slate-800">
                          Rp {(s.hargaJual || s.totalPrice || 0).toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.kategoriBayar === 'PNBP' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {s.kategoriBayar}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {s.kategoriBayar === 'PIUTANG' ? (
                            s.piutang?.lunas ? (
                              <span className="text-emerald-700 font-bold">LUNAS</span>
                            ) : (
                              <span className="text-rose-600 font-bold">Sisa: Rp {(s.piutang?.sisaPiutang || 0).toLocaleString('id-ID')}</span>
                            )
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
