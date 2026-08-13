'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/services/api';
import Toast from '@/components/Toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ShoppingCart, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';

export default function NewSalePage() {
  const searchParams = useSearchParams();
  const preSelectedAnimalId = searchParams.get('animalId');
  const router = useRouter();

  const [availableAnimals, setAvailableAnimals] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const [formData, setFormData] = useState({
    animalId: preSelectedAnimalId || '',
    buyerId: '',
    weightAtSale: '',
    sellingPrice: '',
    paymentMethod: 'TRANSFER',
    notes: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [animRes, buyerRes] = await Promise.all([
        api.get('/animals', { params: { status: 'AVAILABLE', limit: 100 } }),
        api.get('/buyers'),
      ]);

      if (animRes.data.success) {
        setAvailableAnimals(animRes.data.data);
        if (preSelectedAnimalId) {
          const selected = animRes.data.data.find((a) => a.id === preSelectedAnimalId);
          if (selected) {
            setFormData((prev) => ({
              ...prev,
              animalId: selected.id,
              weightAtSale: selected.weight || '',
              sellingPrice: selected.estimatedSellingPrice || '',
            }));
          }
        }
      }

      if (buyerRes.data.success) {
        setBuyers(buyerRes.data.data);
        if (buyerRes.data.data.length > 0 && !formData.buyerId) {
          setFormData((prev) => ({ ...prev, buyerId: buyerRes.data.data[0].id }));
        }
      }
    } catch (err) {
      console.error('Error fetching sales form data:', err);
      setToast({ message: 'Gagal memuat data pilihan hewan & pembeli', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAnimalSelect = (e) => {
    const animalId = e.target.value;
    const selected = availableAnimals.find((a) => a.id === animalId);
    setFormData((prev) => ({
      ...prev,
      animalId,
      weightAtSale: selected ? selected.weight : '',
      sellingPrice: selected ? (selected.estimatedSellingPrice || '') : '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.animalId || !formData.buyerId) {
      setToast({ message: 'Pilih hewan dan pembeli wajib diisi', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        weightAtSale: parseFloat(formData.weightAtSale),
        sellingPrice: parseFloat(formData.sellingPrice),
      };

      const res = await api.post('/sales', payload);
      if (res.data.success) {
        setToast({ message: 'Transaksi penjualan berhasil dicatat!', type: 'success' });
        setTimeout(() => {
          router.push(`/sales/${res.data.data.id}`);
        }, 1200);
      }
    } catch (err) {
      console.error('Create sale error:', err);
      const msg = err.response?.data?.message || 'Gagal memproses transaksi penjualan';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Memuat form transaksi penjualan..." />;

  const selectedAnimalObj = availableAnimals.find((a) => a.id === formData.animalId);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/sales" className="p-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-600 rounded-xl transition-colors shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[#1E3F20] flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-[#1E3F20]" />
            Catat Transaksi Penjualan Hewan Baru
          </h1>
          <p className="text-slate-600 text-xs mt-0.5">Sistem akan memutasi status hewan menjadi SOLD secara otomatis</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
        
        {/* Step 1: Pilih Hewan AVAILABLE */}
        <div className="space-y-3">
          <label className="text-sm font-extrabold text-[#1E3F20] block border-b border-slate-200 pb-2">
            1. Pilih Hewan Ternak (Status AVAILABLE) *
          </label>
          
          <select
            required
            value={formData.animalId}
            onChange={handleAnimalSelect}
            className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#1E3F20] font-bold"
          >
            <option value="">-- Pilih Hewan yang Siap Dijual --</option>
            {availableAnimals.map((a) => (
              <option key={a.id} value={a.id}>
                {a.code} - {a.name} ({a.type} {a.breed}, {a.weight} kg) - {a.cage?.name}
              </option>
            ))}
          </select>

          {selectedAnimalObj && (
            <div className="p-4 bg-[#1E3F20]/10 border border-[#1E3F20]/20 rounded-xl text-xs space-y-1 text-slate-800 font-medium">
              <span className="font-bold text-[#1E3F20] text-sm block">Hewan Terpilih: {selectedAnimalObj.code} - {selectedAnimalObj.name}</span>
              <p>Jenis: {selectedAnimalObj.type} | Ras: {selectedAnimalObj.breed} | Gender: {selectedAnimalObj.gender}</p>
              <p>Berat Terakhir: <strong className="text-slate-900">{selectedAnimalObj.weight} kg</strong> | Kandang: <strong className="text-[#1E3F20]">{selectedAnimalObj.cage?.name}</strong></p>
            </div>
          )}
        </div>

        {/* Step 2: Pilih Pembeli */}
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <label className="text-sm font-extrabold text-[#1E3F20]">2. Pilih Pelanggan Pembeli *</label>
            <Link href="/buyers" target="_blank" className="text-xs text-[#1E3F20] hover:underline font-bold">+ Tambah Pembeli Baru</Link>
          </div>

          <select
            required
            value={formData.buyerId}
            onChange={(e) => setFormData({ ...formData, buyerId: e.target.value })}
            className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#1E3F20] font-bold"
          >
            <option value="">-- Pilih Data Pembeli --</option>
            {buyers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.phone}) - {b.address}
              </option>
            ))}
          </select>
        </div>

        {/* Step 3: Nilai Penjualan */}
        <div className="space-y-3">
          <label className="text-sm font-extrabold text-[#1E3F20] block border-b border-slate-200 pb-2">
            3. Rincian Nilai Penjualan & Pembayaran
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Berat Saat Dijual (kg) *</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={formData.weightAtSale}
                onChange={(e) => setFormData({ ...formData, weightAtSale: e.target.value })}
                placeholder="e.g. 450.0"
                className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#1E3F20] font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Harga Penjualan Akhir (Rp) *</label>
              <input
                type="number"
                min="1"
                required
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                placeholder="e.g. 24000000"
                className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-[#1E3F20] focus:outline-none focus:border-[#1E3F20] font-mono font-extrabold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Metode Pembayaran *</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#1E3F20]"
              >
                <option value="TRANSFER">Transfer Bank</option>
                <option value="CASH">Tunai (Cash)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Catatan Transaksi</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Catatan pelunasan / nomor rekening transfer"
              className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#1E3F20]"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Link href="/sales" className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl">
            Batal
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#1E3F20] hover:bg-[#2b592e] text-white font-bold rounded-xl text-sm shadow-md transition-all disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses Penjualan...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Proses Transaksi Penjualan</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
