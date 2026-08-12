import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { 
  Boxes, 
  CheckCircle2, 
  ShoppingCart, 
  XCircle, 
  Building2, 
  TrendingUp, 
  ArrowUpRight,
  ArrowRight,
  RefreshCw,
  Wallet
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashRes, salesRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/sales'),
      ]);

      if (dashRes.data.success) {
        setStats(dashRes.data.data);
      }
      if (salesRes.data.success) {
        setRecentSales(salesRes.data.data.slice(0, 5));
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Gagal memuat data dashboard dari server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner text="Memuat statistik dashboard real-time..." />;
  if (error) return <div className="p-6 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200">{error}</div>;

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#1E3F20]">Dashboard Utama</h1>
          <p className="text-slate-600 text-sm mt-1">Ringkasan stok hewan, kapasitas kandang, dan transaksi penjualan</p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-[#1E3F20] rounded-xl text-xs font-bold transition-colors self-start shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* 6 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 shadow-sm">
          <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl w-fit">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Total Hewan</span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{stats?.totalAnimals || 0}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 shadow-sm">
          <div className="p-2.5 bg-[#1E3F20]/10 text-[#1E3F20] rounded-xl w-fit">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Tersedia (Stok)</span>
            <h3 className="text-2xl font-black text-[#1E3F20] mt-1">{stats?.availableAnimals || 0}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 shadow-sm">
          <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl w-fit">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Terjual</span>
            <h3 className="text-2xl font-black text-blue-700 mt-1">{stats?.soldAnimals || 0}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 shadow-sm">
          <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl w-fit">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Mati</span>
            <h3 className="text-2xl font-black text-rose-700 mt-1">{stats?.deceasedAnimals || 0}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 shadow-sm">
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl w-fit">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Total Kandang</span>
            <h3 className="text-2xl font-black text-amber-700 mt-1">{stats?.totalCages || 0}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 shadow-sm">
          <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl w-fit">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Total Sales</span>
            <h3 className="text-2xl font-black text-emerald-800 mt-1">{stats?.totalSales || 0}</h3>
          </div>
        </div>
      </div>

      {/* Total Omzet Banner */}
      <div className="bg-[#1E3F20] text-white border border-[#2b592e] p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">Total Omzet Penjualan</span>
          <h2 className="text-3xl font-black text-white">
            Rp {(stats?.totalRevenue || 0).toLocaleString('id-ID')}
          </h2>
        </div>
        <Link
          to="/sales/new"
          className="inline-flex items-center gap-2 px-5 py-3 bg-white text-[#1E3F20] hover:bg-slate-100 font-extrabold rounded-xl text-sm shadow-md transition-all self-start md:self-auto"
        >
          <ShoppingCart className="w-4 h-4 text-[#1E3F20]" />
          <span>Catat Penjualan Baru</span>
        </Link>
      </div>

      {/* Main Grid: Stok per Kandang & Penjualan Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Table 1: Stok per Kandang */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#1E3F20] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#1E3F20]" />
              Stok & Kapasitas Kandang
            </h3>
            <Link to="/cages" className="text-xs font-bold text-[#1E3F20] hover:underline flex items-center gap-1">
              <span>Kelola Kandang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-[#F5F5F0] text-slate-700 uppercase text-[11px] tracking-wider border-b border-slate-200 font-bold">
                <tr>
                  <th className="px-4 py-3">Kandang</th>
                  <th className="px-4 py-3">Jenis</th>
                  <th className="px-4 py-3 text-right">Kapasitas</th>
                  <th className="px-4 py-3 text-right">Stok (Tersedia)</th>
                  <th className="px-4 py-3 text-right">Slot Kosong</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats?.cageStockDetails?.length > 0 ? (
                  stats.cageStockDetails.map((cage) => (
                    <tr key={cage.cageId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-900">{cage.cageName}</td>
                      <td className="px-4 py-3.5 text-slate-600">{cage.cageType}</td>
                      <td className="px-4 py-3.5 text-right font-mono font-semibold">{cage.capacity} ekor</td>
                      <td className="px-4 py-3.5 text-right font-mono font-extrabold text-[#1E3F20]">{cage.availableAnimalsCount} ekor</td>
                      <td className="px-4 py-3.5 text-right font-mono text-slate-500">{cage.emptySlots} slot</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-slate-500">Belum ada data kandang</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Visual Chart Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 flex flex-col justify-between shadow-sm">
          <h3 className="text-lg font-bold text-[#1E3F20] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#1E3F20]" />
            Distribusi Stok Hewan
          </h3>

          <div className="space-y-4 my-auto">
            {stats?.cageStockDetails?.map((cage) => {
              const percentage = cage.capacity > 0 ? Math.round((cage.availableAnimalsCount / cage.capacity) * 100) : 0;
              return (
                <div key={cage.cageId} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-800">{cage.cageName}</span>
                    <span className="text-[#1E3F20]">{cage.availableAnimalsCount} / {cage.capacity} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        percentage > 85 ? 'bg-amber-500' : 'bg-[#1E3F20]'
                      }`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-[#F5F5F0] rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between font-semibold">
            <span>Stok hewan dihitung dari status AVAILABLE</span>
            <span className="w-2 h-2 rounded-full bg-[#1E3F20]"></span>
          </div>
        </div>

      </div>

      {/* Section 2: Penjualan Terbaru */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#1E3F20] flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#1E3F20]" />
            Transaksi Penjualan Terbaru
          </h3>
          <Link to="/sales" className="text-xs font-bold text-[#1E3F20] hover:underline flex items-center gap-1">
            <span>Lihat Semua Penjualan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-[#F5F5F0] text-slate-700 uppercase text-[11px] tracking-wider border-b border-slate-200 font-bold">
              <tr>
                <th className="px-4 py-3">Hewan</th>
                <th className="px-4 py-3">Pembeli</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Berat saat Jual</th>
                <th className="px-4 py-3 text-right">Harga Jual</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentSales.length > 0 ? (
                recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-[#1E3F20] block">{sale.animal?.code}</span>
                      <span className="text-xs text-slate-500">{sale.animal?.name} ({sale.animal?.breed})</span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">{sale.buyer?.name}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{new Date(sale.saleDate).toLocaleDateString('id-ID')}</td>
                    <td className="px-4 py-3.5 font-mono font-semibold">{sale.weightAtSale} kg</td>
                    <td className="px-4 py-3.5 text-right font-mono font-extrabold text-[#1E3F20]">
                      Rp {sale.sellingPrice?.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Link
                        to={`/sales/${sale.id}`}
                        className="inline-flex items-center gap-1 text-xs text-[#1E3F20] font-bold hover:bg-[#F5F5F0] px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
                      >
                        <span>Detail</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-slate-500">Belum ada transaksi penjualan</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
