'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import { ArrowLeft, Phone, MapPin, ShoppingBag, Eye } from 'lucide-react';

export default function BuyerDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [buyer, setBuyer] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBuyerDetail = async () => {
    try {
      const res = await api.get(`/buyers/${id}`);
      if (res.data.success) {
        setBuyer(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching buyer detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchBuyerDetail();
  }, [id]);

  if (loading) return <LoadingSpinner text="Memuat riwayat pembeli..." />;
  if (!buyer) return <div className="p-6 bg-white text-slate-500 rounded-2xl">Data pembeli tidak ditemukan</div>;

  const totalSpent = (buyer.sales || []).reduce((acc, curr) => acc + (curr.sellingPrice || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/buyers" className="p-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-600 rounded-xl transition-colors shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#1E3F20]">{buyer.name}</h1>
          <p className="text-slate-600 text-xs mt-0.5">Profil Pelanggan & Riwayat Transaksi</p>
        </div>
      </div>

      {/* Buyer Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Kontak & Alamat</span>
          <div className="space-y-1.5 text-xs font-medium">
            <div className="flex items-center gap-2 text-slate-800">
              <Phone className="w-4 h-4 text-[#1E3F20]" />
              <span className="font-mono font-bold text-slate-900">{buyer.phone}</span>
            </div>
            <div className="flex items-start gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-[#1E3F20] shrink-0 mt-0.5" />
              <span>{buyer.address}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-1 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Pembelian</span>
          <h3 className="text-3xl font-black text-[#1E3F20]">{buyer.sales?.length || 0} <span className="text-sm font-normal text-slate-500">transaksi</span></h3>
          <p className="text-xs text-slate-500">Jumlah hewan ternak yang pernah dibeli</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-1 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Nilai Transaksi</span>
          <h3 className="text-2xl font-black font-mono text-[#1E3F20]">Rp {totalSpent.toLocaleString('id-ID')}</h3>
          <p className="text-xs text-slate-500">Akumulasi pengeluaran transaksi</p>
        </div>
      </div>

      {/* Sales History Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <h3 className="text-lg font-bold text-[#1E3F20] flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-[#1E3F20]" />
          Riwayat Pembelian Hewan
        </h3>

        {buyer.sales?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-[#F5F5F0] text-slate-700 uppercase text-[11px] tracking-wider border-b border-slate-200 font-bold">
                <tr>
                  <th className="px-4 py-3 font-semibold">Hewan Dibeli</th>
                  <th className="px-4 py-3 font-semibold">Tanggal Terjual</th>
                  <th className="px-4 py-3 font-semibold">Berat saat Jual</th>
                  <th className="px-4 py-3 font-semibold">Metode Bayar</th>
                  <th className="px-4 py-3 font-semibold text-right">Harga Jual</th>
                  <th className="px-4 py-3 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {buyer.sales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-bold text-[#1E3F20] block">{s.animal?.code}</span>
                      <span className="text-slate-900 font-bold">{s.animal?.name} ({s.animal?.breed})</span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 font-semibold">
                      {new Date(s.saleDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold">{s.weightAtSale} kg</td>
                    <td className="px-4 py-3.5 font-mono text-xs">{s.paymentMethod}</td>
                    <td className="px-4 py-3.5 text-right font-mono font-extrabold text-[#1E3F20]">
                      Rp {s.sellingPrice?.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Link
                        href={`/sales/${s.id}`}
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
          <EmptyState title="Belum Ada Pembelian" message="Pelanggan ini belum memiliki riwayat pembelian hewan ternak." />
        )}
      </div>
    </div>
  );
}
