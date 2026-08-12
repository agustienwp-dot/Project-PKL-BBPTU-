import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { ShoppingCart, Plus, Eye } from 'lucide-react';

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await api.get('/sales');
      if (res.data.success) {
        setSales(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching sales:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#1E3F20] flex items-center gap-3">
            <ShoppingCart className="w-7 h-7 text-[#1E3F20]" />
            Riwayat Transaksi Penjualan
          </h1>
          <p className="text-slate-600 text-sm mt-1">Seluruh data transaksi penjualan hewan ternak yang telah diproses</p>
        </div>

        <Link
          to="/sales/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E3F20] hover:bg-[#2b592e] text-white font-bold rounded-xl text-sm shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Transaksi Penjualan Baru</span>
        </Link>
      </div>

      {/* Table Sales */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 space-y-4 shadow-sm">
        {loading ? (
          <LoadingSpinner text="Memuat riwayat penjualan..." />
        ) : sales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm text-slate-700">
              <thead className="bg-[#F5F5F0] text-slate-700 uppercase text-[11px] tracking-wider border-b border-slate-200 font-bold">
                <tr>
                  <th className="px-4 py-3.5">Hewan Terjual</th>
                  <th className="px-4 py-3.5">Pembeli</th>
                  <th className="px-4 py-3.5">Tanggal Transaksi</th>
                  <th className="px-4 py-3.5">Berat saat Jual</th>
                  <th className="px-4 py-3.5">Metode Bayar</th>
                  <th className="px-4 py-3.5 text-right">Harga Penjualan</th>
                  <th className="px-4 py-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-bold text-[#1E3F20] block">{sale.animal?.code}</span>
                      <span className="text-slate-900 font-bold">{sale.animal?.name} ({sale.animal?.breed})</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-slate-900 block">{sale.buyer?.name}</span>
                      <span className="text-xs text-slate-500">{sale.buyer?.phone}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 text-xs font-semibold">
                      {new Date(sale.saleDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900">{sale.weightAtSale} kg</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 bg-[#F5F5F0] border border-slate-300 rounded font-mono text-xs text-slate-800 font-semibold">
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-black text-[#1E3F20] text-base">
                      Rp {sale.sellingPrice?.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Link
                        to={`/sales/${sale.id}`}
                        className="p-1.5 bg-[#F5F5F0] hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold inline-flex items-center gap-1 border border-slate-300"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Invoice</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Belum Ada Transaksi Penjualan" message="Belum ada transaksi penjualan hewan yang dicatat." />
        )}
      </div>
    </div>
  );
}
