'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import { 
  BarChart3, 
  Calendar, 
  Download, 
  FileSpreadsheet, 
  Printer, 
  TrendingUp, 
  TrendingDown, 
  Boxes, 
  Award,
  DollarSign,
  Layers,
  Filter
} from 'lucide-react';

export default function LaporanPenjualanPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [toast, setToast] = useState(null);

  // Period Selector
  const [periodType, setPeriodType] = useState('HARIAN'); // "HARIAN" or "BULANAN"
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterMonth, setFilterMonth] = useState((new Date().getMonth() + 1).toString());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());

  const fetchReport = async () => {
    setLoading(true);
    try {
      let url = `/pemasaran/reports?periodType=${periodType}&`;
      if (periodType === 'HARIAN') {
        url += `date=${filterDate}&`;
      } else {
        url += `month=${filterMonth}&year=${filterYear}&`;
      }

      const res = await api.get(url);
      if (res.data.success) {
        setReportData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching sales report:', err);
      setToast({ type: 'error', message: 'Gagal memuat laporan penjualan.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [periodType, filterDate, filterMonth, filterYear]);

  const handleExportExcel = () => {
    if (!reportData || !reportData.tableData || reportData.tableData.length === 0) {
      setToast({ type: 'error', message: 'Tidak ada data penjualan untuk diexport pada periode ini.' });
      return;
    }

    // Build CSV formatted for Excel
    const headers = ['ID Transaksi', 'Tanggal', 'Kategori', 'Produk & Varian', 'Kemasan', 'Jumlah (pcs)', 'Harga Satuan (Rp)', 'Total Penjualan (Rp)', 'Status'];
    const rows = reportData.tableData.map((item) => [
      item.transactionId,
      item.dateFormatted,
      item.productCategory,
      `"${item.productName}"`,
      item.packagingType,
      item.quantity,
      item.unitPrice,
      item.totalPrice,
      item.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const filename = `Laporan_Penjualan_${periodType}_${periodType === 'HARIAN' ? filterDate : `${filterYear}-${filterMonth}`}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToast({ type: 'success', message: `Laporan ${periodType.toLowerCase()} berhasil diexport to CSV/Excel!` });
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const {
    periodLabel = '',
    totalTransactions = 0,
    totalUnitsSold = 0,
    totalRevenue = 0,
    topProduct = null,
    lowestProduct = null,
    productBreakdown = [],
    tableData = [],
  } = reportData || {};

  return (
    <div className="space-y-8 pb-12 print:p-0 print:space-y-4">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold mb-2">
            <BarChart3 className="w-4 h-4" />
            <span>POV Admin Pemasaran</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Laporan Penjualan Produk</h1>
          <p className="text-xs text-slate-500 font-medium">
            Rekap hasil penjualan harian & bulanan, analisa produk terlaris, serta export laporan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold shadow transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel (.xlsx)</span>
          </button>

          <button
            onClick={handlePrintPDF}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold shadow transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      {/* PERIODE SELECTOR BAR */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Periode Laporan:</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setPeriodType('HARIAN')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                periodType === 'HARIAN' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              📅 Harian
            </button>
            <button
              onClick={() => setPeriodType('BULANAN')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                periodType === 'BULANAN' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              📆 Bulanan
            </button>
          </div>

          {periodType === 'HARIAN' ? (
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          ) : (
            <div className="flex items-center gap-2">
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="1">Januari</option>
                <option value="2">Februari</option>
                <option value="3">Maret</option>
                <option value="4">April</option>
                <option value="5">Mei</option>
                <option value="6">Juni</option>
                <option value="7">Juli</option>
                <option value="8">Agustus</option>
                <option value="9">September</option>
                <option value="10">Oktober</option>
                <option value="11">November</option>
                <option value="12">Desember</option>
              </select>

              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center"><LoadingSpinner text="Mengkalkulasi rekap laporan penjualan..." /></div>
      ) : (
        <div className="space-y-6">
          {/* PRINT HEADER TITLE */}
          <div className="hidden print:block border-b pb-3 mb-4">
            <h2 className="text-xl font-black text-slate-900">LAPORAN PENJUALAN PRODUK</h2>
            <p className="text-xs text-slate-600">Periode: {periodLabel}</p>
          </div>

          {/* REKAP METRICS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-[#1E3F20] to-[#122b14] text-white p-5 rounded-3xl shadow-md space-y-2">
              <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider block">Total Pendapatan</span>
              <p className="text-2xl font-black text-amber-400">Rp {totalRevenue.toLocaleString('id-ID')}</p>
              <p className="text-[10px] text-emerald-200 font-medium">Periode {periodLabel}</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Transaksi</span>
              <p className="text-3xl font-black text-slate-900">{totalTransactions} <span className="text-xs font-semibold text-slate-500">Transaksi</span></p>
              <p className="text-[10px] text-slate-500 font-medium">{totalUnitsSold.toLocaleString()} pcs terjual</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center gap-1 text-emerald-600">
                <Award className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Produk Terlaris</span>
              </div>
              {topProduct ? (
                <div>
                  <p className="text-sm font-black text-slate-900 truncate">{topProduct.name}</p>
                  <p className="text-xs font-bold text-emerald-700">{topProduct.units} pcs ({((topProduct.revenue / (totalRevenue || 1)) * 100).toFixed(1)}%)</p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-medium">Belum ada data</p>
              )}
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center gap-1 text-amber-600">
                <TrendingDown className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Produk Terendah</span>
              </div>
              {lowestProduct ? (
                <div>
                  <p className="text-sm font-black text-slate-900 truncate">{lowestProduct.name}</p>
                  <p className="text-xs font-bold text-amber-700">{lowestProduct.units} pcs terjual</p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-medium">Belum ada data</p>
              )}
            </div>
          </div>

          {/* PRODUCT PERFORMANCE BREAKDOWN */}
          {productBreakdown.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>Analisis Performa Penjualan Per Produk</span>
              </h2>

              <div className="space-y-3">
                {productBreakdown.map((p, idx) => {
                  const percent = totalRevenue > 0 ? (p.revenue / totalRevenue) * 100 : 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-800">
                        <span>{p.name}</span>
                        <span>{p.units} pcs — Rp {p.revenue.toLocaleString('id-ID')} ({percent.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(5, percent))}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TABLE REKAP PENJUALAN */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                <span>Tabel Data Rekap Penjualan ({periodLabel})</span>
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4 whitespace-nowrap">ID Transaksi</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Tanggal</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Kategori</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Produk & Varian</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Kemasan</th>
                    <th className="py-3.5 px-4 whitespace-nowrap text-right">Jumlah Terjual</th>
                    <th className="py-3.5 px-4 whitespace-nowrap text-right">Harga Satuan</th>
                    <th className="py-3.5 px-4 whitespace-nowrap text-right">Total Penjualan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {tableData.length > 0 ? (
                    tableData.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-mono font-black text-slate-900 whitespace-nowrap">
                          {row.transactionId}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800 whitespace-nowrap">
                          {row.dateFormatted}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full border font-bold text-[10px] ${
                            row.productCategory === 'Yogurt' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                            row.productCategory === 'Keju' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                            'bg-emerald-100 text-emerald-800 border-emerald-200'
                          }`}>
                            {row.productCategory}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                          {row.productName}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap">
                          {row.packagingType}
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-slate-900 text-right whitespace-nowrap">
                          {row.quantity} pcs
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700 text-right whitespace-nowrap">
                          Rp {row.unitPrice.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3.5 px-4 font-black text-emerald-700 text-right whitespace-nowrap">
                          Rp {row.totalPrice.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        Tidak ada data transaksi penjualan pada periode {periodLabel}.
                      </td>
                    </tr>
                  )}
                </tbody>
                {tableData.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-900 text-white font-black text-xs">
                      <td colSpan={5} className="py-4 px-4 text-right uppercase tracking-wider">
                        TOTAL KESELURUHAN:
                      </td>
                      <td className="py-4 px-4 text-right font-mono font-black text-amber-400">
                        {totalUnitsSold.toLocaleString()} pcs
                      </td>
                      <td className="py-4 px-4"></td>
                      <td className="py-4 px-4 text-right font-mono font-black text-amber-400">
                        Rp {totalRevenue.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
