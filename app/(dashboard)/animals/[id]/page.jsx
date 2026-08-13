'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import api from '@/services/api';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Building2, 
  Scale, 
  History, 
  Plus, 
  ArrowRightLeft, 
  Edit3, 
  HeartPulse,
  UserCheck,
  Boxes
} from 'lucide-react';

export default function AnimalDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const [animal, setAnimal] = useState(null);
  const [cages, setCages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Weight Modal
  const [weightModalOpen, setWeightModalOpen] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [weightNotes, setWeightNotes] = useState('');
  const [savingWeight, setSavingWeight] = useState(false);

  // Move Modal
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [targetCageId, setTargetCageId] = useState('');
  const [moveNotes, setMoveNotes] = useState('');
  const [moving, setMoving] = useState(false);

  const fetchAnimalDetail = async () => {
    try {
      const res = await api.get(`/animals/${id}`);
      if (res.data.success) {
        setAnimal(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching animal detail:', err);
      setToast({ message: 'Gagal memuat detail hewan', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCages = async () => {
    try {
      const res = await api.get('/cages');
      if (res.data.success) setCages(res.data.data);
    } catch (err) {
      console.error('Failed to fetch cages:', err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAnimalDetail();
      fetchCages();
    }
  }, [id]);

  const handleAddWeight = async (e) => {
    e.preventDefault();
    if (!newWeight || parseFloat(newWeight) <= 0) {
      setToast({ message: 'Berat harus angka positif', type: 'error' });
      return;
    }

    setSavingWeight(true);
    try {
      const res = await api.post(`/animals/${id}/weights`, {
        weight: parseFloat(newWeight),
        notes: weightNotes,
      });

      if (res.data.success) {
        setToast({ message: 'Berat hewan berhasil dicatat', type: 'success' });
        setWeightModalOpen(false);
        setNewWeight('');
        setWeightNotes('');
        fetchAnimalDetail();
      }
    } catch (err) {
      console.error('Add weight error:', err);
      const msg = err.response?.data?.message || 'Gagal menambahkan berat';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSavingWeight(false);
    }
  };

  const handleMoveCage = async (e) => {
    e.preventDefault();
    if (!targetCageId) {
      setToast({ message: 'Pilih kandang tujuan', type: 'error' });
      return;
    }

    setMoving(true);
    try {
      const res = await api.post(`/animals/${id}/move`, {
        toCageId: targetCageId,
        notes: moveNotes,
      });

      if (res.data.success) {
        setToast({ message: 'Hewan berhasil dipindahkan ke kandang baru', type: 'success' });
        setMoveModalOpen(false);
        setTargetCageId('');
        setMoveNotes('');
        fetchAnimalDetail();
      }
    } catch (err) {
      console.error('Move cage error:', err);
      const msg = err.response?.data?.message || 'Gagal memindahkan hewan';
      setToast({ message: msg, type: 'error' });
    } finally {
      setMoving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Memuat detail hewan..." />;
  if (!animal) return <div className="p-6 bg-white text-slate-500 rounded-2xl">Data hewan tidak ditemukan</div>;

  return (
    <div className="space-y-8 pb-12">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/animals" className="p-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-600 rounded-xl transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black text-[#1E3F20]">{animal.name}</h1>
              <span className="font-mono text-sm px-2.5 py-0.5 bg-[#1E3F20]/10 border border-[#1E3F20]/20 text-[#1E3F20] rounded-lg font-bold">
                {animal.code}
              </span>
            </div>
            <p className="text-slate-600 text-xs mt-0.5">{animal.type} • Ras {animal.breed}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {animal.status === 'AVAILABLE' && (
            <Link
              href={`/sales/new?animalId=${animal.id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E3F20] hover:bg-[#2b592e] text-white font-bold rounded-xl text-sm shadow-md transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Jual Hewan Ini</span>
            </Link>
          )}

          <Link
            href={`/animals/${animal.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold rounded-xl text-sm transition-colors shadow-sm"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit</span>
          </Link>
        </div>
      </div>

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Identitas & Status Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-[#1E3F20] flex items-center gap-2">
              <Boxes className="w-5 h-5 text-[#1E3F20]" />
              Status & Identitas
            </h3>
            <StatusBadge status={animal.status} />
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Kode Unik:</span>
              <span className="font-mono font-bold text-[#1E3F20]">{animal.code}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Nama Hewan:</span>
              <span className="font-bold text-slate-800">{animal.name}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Jenis / Ras:</span>
              <span className="text-slate-800 font-medium">{animal.type} ({animal.breed})</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Jenis Kelamin:</span>
              <span className="text-slate-800 font-medium">{animal.gender}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Asal Ternak:</span>
              <span className="text-slate-700 font-medium">{animal.origin || '-'}</span>
            </div>
          </div>
        </div>

        {/* Fisik & Kesehatan Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-[#1E3F20] flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#1E3F20]" />
              Kondisi Fisik & Kesehatan
            </h3>
            <button
              onClick={() => setWeightModalOpen(true)}
              className="text-xs font-bold text-[#1E3F20] hover:bg-slate-100 flex items-center gap-1 bg-[#F5F5F0] px-2.5 py-1 rounded-lg border border-slate-300 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Berat</span>
            </button>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Berat Saat Ini:</span>
              <span className="font-mono font-extrabold text-2xl text-[#1E3F20]">{animal.weight} kg</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Kondisi Kesehatan:</span>
              <span className="font-bold text-[#1E3F20] flex items-center gap-1">
                <HeartPulse className="w-4 h-4" />
                {animal.healthStatus || 'Sehat'}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Tanggal Lahir:</span>
              <span className="text-slate-700 font-medium">{animal.birthDate ? new Date(animal.birthDate).toLocaleDateString('id-ID') : '-'}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Tanggal Masuk:</span>
              <span className="text-slate-700 font-medium">{new Date(animal.entryDate).toLocaleDateString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Keuangan & Lokasi Kandang Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-[#1E3F20] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#1E3F20]" />
              Kandang & Keuangan
            </h3>
            {animal.status === 'AVAILABLE' && (
              <button
                onClick={() => setMoveModalOpen(true)}
                className="text-xs font-bold text-[#1E3F20] hover:bg-slate-100 flex items-center gap-1 bg-[#F5F5F0] px-2.5 py-1 rounded-lg border border-slate-300 transition-colors"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Pindah Kandang</span>
              </button>
            )}
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Kandang Saat Ini:</span>
              <span className="font-bold text-[#1E3F20]">{animal.cage?.name || '-'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Harga Beli:</span>
              <span className="font-mono text-slate-800 font-semibold">Rp {animal.purchasePrice?.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Estimasi Jual:</span>
              <span className="font-mono font-bold text-[#1E3F20]">
                {animal.estimatedSellingPrice ? `Rp ${animal.estimatedSellingPrice.toLocaleString('id-ID')}` : '-'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Informative Sale Card if SOLD */}
      {animal.status === 'SOLD' && animal.sale && (
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-base">
            <UserCheck className="w-5 h-5 text-blue-700" />
            Informasi Transaksi Penjualan
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2 text-sm">
            <div>
              <span className="text-xs text-slate-500 block">Pembeli</span>
              <span className="font-bold text-slate-900">{animal.sale.buyer?.name}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Tanggal Terjual</span>
              <span className="font-semibold text-slate-800">{new Date(animal.sale.saleDate).toLocaleDateString('id-ID')}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Harga Jual Akhir</span>
              <span className="font-mono font-bold text-blue-800">Rp {animal.sale.sellingPrice?.toLocaleString('id-ID')}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Metode Bayar</span>
              <span className="font-mono text-slate-700 font-semibold">{animal.sale.paymentMethod}</span>
            </div>
          </div>
        </div>
      )}

      {/* Section: Riwayat Berat & Perpindahan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weight Histories List */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="text-lg font-bold text-[#1E3F20] flex items-center gap-2">
            <History className="w-5 h-5 text-[#1E3F20]" />
            Riwayat Pertumbuhan Berat
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-[#F5F5F0] text-slate-700 uppercase text-[11px] tracking-wider border-b border-slate-200 font-bold">
                <tr>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Berat</th>
                  <th className="px-4 py-3">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {animal.weightHistories?.length > 0 ? (
                  animal.weightHistories.map((wh) => (
                    <tr key={wh.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-xs text-slate-500">{new Date(wh.recordedAt).toLocaleDateString('id-ID')}</td>
                      <td className="px-4 py-3 font-mono font-bold text-[#1E3F20]">{wh.weight} kg</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{wh.notes || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-4 text-slate-500">Belum ada riwayat berat</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Movement Histories List */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="text-lg font-bold text-[#1E3F20] flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-[#1E3F20]" />
            Riwayat Perpindahan Kandang
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-[#F5F5F0] text-slate-700 uppercase text-[11px] tracking-wider border-b border-slate-200 font-bold">
                <tr>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Dari</th>
                  <th className="px-4 py-3">Ke Kandang</th>
                  <th className="px-4 py-3">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {animal.movements?.length > 0 ? (
                  animal.movements.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-xs text-slate-500">{new Date(m.movedAt).toLocaleDateString('id-ID')}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{m.fromCage?.name || '-'}</td>
                      <td className="px-4 py-3 font-bold text-[#1E3F20] text-xs">{m.toCage?.name || '-'}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{m.notes || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-slate-500">Belum ada riwayat perpindahan</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Modal Weight Record */}
      {weightModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <form onSubmit={handleAddWeight} className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-[#1E3F20]">Catat Berat Badan Baru</h3>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Berat Baru (kg) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="e.g. 465.0"
                className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#1E3F20]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Catatan</label>
              <input
                type="text"
                value={weightNotes}
                onChange={(e) => setWeightNotes(e.target.value)}
                placeholder="e.g. Penimbangan bulanan"
                className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#1E3F20]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setWeightModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={savingWeight}
                className="px-4 py-2 text-sm font-bold text-white bg-[#1E3F20] hover:bg-[#2b592e] rounded-xl shadow-md"
              >
                {savingWeight ? 'Menyimpan...' : 'Simpan Berat'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Move Cage */}
      {moveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <form onSubmit={handleMoveCage} className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-[#1E3F20]">Pindahkan Hewan ke Kandang Baru</h3>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Pilih Kandang Tujuan *</label>
              <select
                required
                value={targetCageId}
                onChange={(e) => setTargetCageId(e.target.value)}
                className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#1E3F20]"
              >
                <option value="">-- Pilih Kandang Tujuan --</option>
                {cages.map((c) => (
                  <option key={c.id} value={c.id} disabled={c.id === animal.cageId}>
                    {c.name} ({c.availableAnimalsCount}/{c.capacity} ekor)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Catatan Perpindahan</label>
              <input
                type="text"
                value={moveNotes}
                onChange={(e) => setMoveNotes(e.target.value)}
                placeholder="Alasan pemindahan kandang"
                className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#1E3F20]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMoveModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={moving}
                className="px-4 py-2 text-sm font-bold text-white bg-[#1E3F20] hover:bg-[#2b592e] rounded-xl shadow-md"
              >
                {moving ? 'Memproses...' : 'Pindahkan Hewan'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
