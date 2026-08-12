import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { BarChart3, Filter, DollarSign, TrendingUp, Boxes, ShoppingCart } from 'lucide-react';

export default function ReportsPage() {
  const [stats, setStats] = useState(null);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // Period Filter State
  const [periodFilter, setPeriodFilter] = useState('ALL'); // ALL, TODAY, WEEK, MONTH, YEAR, CUSTOM
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashRes, salesRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/sales'),
      ]);

      if (dashRes.data.success) setStats(dashRes.data.data);
      if (salesRes.data.success) setSales(salesRes.data.data);
    } catch (err) {
      console.error('Error fetching reports data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter Sales by Period
  const filteredSales = sales.filter((sale) => {
    const sDate = new Date(sale.saleDate);
    const now = new Date();

    if (periodFilter === 'TODAY') {
      return sDate.toDateString() === now.toDateString();
    }
    if (periodFilter === 'WEEK') {
      const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
      return sDate >= oneWeekAgo;
    }
    if (periodFilter === 'MONTH') {
      return sDate.getMonth() === now.getMonth() && sDate.getFullYear() === now.getFullYear();
    }
    if (periodFilter === 'YEAR') {
      return sDate.getFullYear() === now.getFullYear();
    }
    if (periodFilter === 'CUSTOM' && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59);
      return sDate >= start && sDate <= end;
    }
    return true;
  });

  const periodRevenue = filteredSales.reduce((acc, curr) => acc + (curr.sellingPrice || 0), 0);
  const avgPrice = filteredSales.length > 0 ? Math.round(periodRevenue / filteredSales.length) : 0;

  // Breakdown by Type
  const salesByType = filteredSales.reduce((acc, curr) => {
    const type = curr.animal?.type || 'Lainnya';
    if (!acc[type]) acc[type] = { count: 0, revenue: 0 };
    acc[type].count += 1;
    acc[type].revenue += curr.sellingPrice || 0;
    return acc;
  }, {});

  if (loading) return <LoadingSpinner text="Memuat data laporan..." />;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-[#1E3F20] flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-[#1E3F20]" />
          Laporan Analitik & Penjualan
        </h1>
        <p className="text-slate-600 text-sm mt-1">Laporan kinerja stok, omzet penjualan, dan distribusi transaksi per periode</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-3 md:space-y-0 md:flex md:items-center md:justify-between shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#1E3F20]" /> Filter Periode:
          </span>
          {[
            { id: 'ALL', label: 'Semua Waktu' },
            { id: 'TODAY', label: 'Hari Ini' },
            { id: 'WEEK', label: 'Minggu Ini' },
            { id: 'MONTH', label: 'Bulan Ini' },
            { id: 'YEAR', label: 'Tahun Ini' },
            { id: 'CUSTOM', label: 'Custom Range' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriodFilter(p.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                periodFilter === p.id
                  ? 'bg-[#1E3F20] text-white shadow-md'
                  : 'bg-[#F5F5F0] text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom Range Selector */}
        {periodFilter === 'CUSTOM' && (
          <div className="flex items-center gap-2 pt-2 md:pt-0">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-[#F5F5F0] border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-semibold"
            />
            <span className="text-slate-500 text-xs">s.d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-[#F5F5F0] border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-semibold"
            />
          </div>
        )}
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Total Stok Ternak</span>
            <Boxes className="w-4 h-4 text-blue-700" />
          </div>
          <h3 className="text-3xl font-black text-slate-900">{stats?.totalAnimals || 0} <span className="text-sm font-normal text-slate-500">ekor</span></h3>
          <p className="text-xs text-[#1E3F20] font-extrabold">{stats?.availableAnimals || 0} ekor status Available</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Transaksi Penjualan</span>
            <ShoppingCart className="w-4 h-4 text-blue-700" />
          </div>
          <h3 className="text-3xl font-black text-blue-700">{filteredSales.length} <span className="text-sm font-normal text-slate-500">transaksi</span></h3>
          <p className="text-xs text-slate-500">Sesuai filter periode aktif</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Total Omzet Periode</span>
            <TrendingUp className="w-4 h-4 text-[#1E3F20]" />
          </div>
          <h3 className="text-2xl font-black font-mono text-[#1E3F20]">Rp {periodRevenue.toLocaleString('id-ID')}</h3>
          <p className="text-xs text-slate-500">Total pendapatan kotor</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Rata-Rata Harga Jual</span>
            <DollarSign className="w-4 h-4 text-amber-700" />
          </div>
          <h3 className="text-2xl font-black font-mono text-amber-700">Rp {avgPrice.toLocaleString('id-ID')}</h3>
          <p className="text-xs text-slate-500">Per ekor hewan terjual</p>
        </div>
      </div>

      {/* Breakdown by Animal Type */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="text-lg font-bold text-[#1E3F20]">Penjualan Berdasarkan Jenis Hewan</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-[#F5F5F0] text-slate-700 uppercase text-[11px] tracking-wider border-b border-slate-200 font-bold">
                <tr>
                  <th className="px-4 py-3">Jenis Hewan</th>
                  <th className="px-4 py-3 text-right">Jumlah Terjual</th>
                  <th className="px-4 py-3 text-right">Total Pendapatan (Rp)</th>
                  <th className="px-4 py-3 text-right">Kontribusi Omzet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.keys(salesByType).length > 0 ? (
                  Object.entries(salesByType).map(([type, data]) => {
                    const percentage = periodRevenue > 0 ? Math.round((data.revenue / periodRevenue) * 100) : 0;
                    return (
                      <tr key={type} className="hover:bg-slate-50">
                        <td className="px-4 py-3.5 font-bold text-slate-900">{type}</td>
                        <td className="px-4 py-3.5 text-right font-mono font-semibold">{data.count} ekor</td>
                        <td className="px-4 py-3.5 text-right font-mono font-extrabold text-[#1E3F20]">
                          Rp {data.revenue.toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-[#1E3F20]">{percentage}%</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-slate-500">Tidak ada transaksi penjualan pada periode ini</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Visual Progress Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="text-lg font-bold text-[#1E3F20]">Visual Kontribusi Omzet</h3>

          <div className="space-y-4">
            {Object.entries(salesByType).map(([type, data]) => {
              const percentage = periodRevenue > 0 ? Math.round((data.revenue / periodRevenue) * 100) : 0;
              return (
                <div key={type} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-800">{type}</span>
                    <span className="text-[#1E3F20]">{percentage}% (Rp {data.revenue.toLocaleString('id-ID')})</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                    <div
                      className="h-full rounded-full bg-[#1E3F20] transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
