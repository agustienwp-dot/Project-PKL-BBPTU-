'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ArrowLeft, Printer, CheckCircle2, User, Boxes } from 'lucide-react';

export default function SaleDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSaleDetail = async () => {
    try {
      const res = await api.get(`/sales/${id}`);
      if (res.data.success) {
        setSale(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching sale detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchSaleDetail();
  }, [id]);

  if (loading) return <LoadingSpinner text="Memuat invoice transaksi penjualan..." />;
  if (!sale) return <div className="p-6 bg-white text-slate-500 rounded-2xl">Transaksi penjualan tidak ditemukan</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link href="/sales" className="p-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-600 rounded-xl transition-colors inline-flex items-center gap-2 text-sm font-semibold shadow-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Penjualan</span>
        </Link>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-[#1E3F20] hover:bg-[#2b592e] text-white rounded-xl text-xs font-bold shadow-md transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Struk / Invoice</span>
        </button>
      </div>

      {/* Invoice Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-lg relative overflow-hidden">
        
        {/* Header Invoice */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#1E3F20] font-black text-lg">
              <CheckCircle2 className="w-6 h-6" />
              <span>INVOICE PENJUALAN HEWAN</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">FarmStock Pro • No. Transaksi: <span className="font-mono text-slate-800 font-bold">{sale.id}</span></p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-500 block">Tanggal Transaksi</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {new Date(sale.saleDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Info Grid: Hewan & Pembeli */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Detail Hewan */}
          <div className="bg-[#F5F5F0] p-5 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E3F20] flex items-center gap-2">
              <Boxes className="w-4 h-4" /> Detail Hewan Terjual
            </h4>
            <div className="space-y-1.5 text-xs text-slate-700 font-medium">
              <div className="flex justify-between">
                <span className="text-slate-500">Kode Hewan:</span>
                <span className="font-mono font-bold text-[#1E3F20]">{sale.animal?.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nama / Ras:</span>
                <span className="font-bold text-slate-900">{sale.animal?.name} ({sale.animal?.breed})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jenis Kelamin:</span>
                <span>{sale.animal?.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Berat saat Dijual:</span>
                <span className="font-mono font-bold text-[#1E3F20]">{sale.weightAtSale} kg</span>
              </div>
            </div>
          </div>

          {/* Detail Pembeli */}
          <div className="bg-[#F5F5F0] p-5 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800 flex items-center gap-2">
              <User className="w-4 h-4" /> Identitas Pembeli
            </h4>
            <div className="space-y-1.5 text-xs text-slate-700 font-medium">
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Pembeli:</span>
                <span className="font-bold text-slate-900">{sale.buyer?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Telepon:</span>
                <span className="font-mono">{sale.buyer?.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Alamat:</span>
                <span className="text-right max-w-xs">{sale.buyer?.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="bg-[#F5F5F0] p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-3">
            <span className="text-slate-600 font-medium">Metode Pembayaran</span>
            <span className="font-mono font-bold text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-300">
              {sale.paymentMethod}
            </span>
          </div>

          {sale.notes && (
            <div className="text-xs text-slate-600 border-b border-slate-200 pb-3">
              <span className="text-slate-500 block mb-0.5 font-bold">Catatan Transaksi:</span>
              <p className="text-slate-800 italic">"{sale.notes}"</p>
            </div>
          )}

          <div className="flex justify-between items-center pt-2">
            <span className="text-base font-extrabold text-slate-900">TOTAL HARGA PENJUALAN</span>
            <span className="text-2xl md:text-3xl font-black font-mono text-[#1E3F20]">
              Rp {sale.sellingPrice?.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 pt-4 border-t border-slate-200">
          Terima kasih telah berbertransaksi dengan FarmStock Pro • Dokumen ini diterbitkan oleh sistem resmi peternakan.
        </div>

      </div>
    </div>
  );
}
