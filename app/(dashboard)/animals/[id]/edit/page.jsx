'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import api from '@/services/api';
import Toast from '@/components/Toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

export default function EditAnimalPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const [cages, setCages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'Sapi',
    breed: '',
    gender: 'Jantan',
    birthDate: '',
    weight: '',
    healthStatus: 'Sehat',
    purchasePrice: '',
    estimatedSellingPrice: '',
    status: 'AVAILABLE',
    cageId: '',
    origin: '',
    notes: '',
  });

  const fetchCages = async () => {
    try {
      const res = await api.get('/cages');
      if (res.data.success) setCages(res.data.data);
    } catch (err) {
      console.error('Failed to fetch cages:', err);
    }
  };

  const fetchAnimalDetail = async () => {
    try {
      const res = await api.get(`/animals/${id}`);
      if (res.data.success) {
        const animal = res.data.data;
        setFormData({
          code: animal.code || '',
          name: animal.name || '',
          type: animal.type || 'Sapi',
          breed: animal.breed || '',
          gender: animal.gender || 'Jantan',
          birthDate: animal.birthDate ? new Date(animal.birthDate).toISOString().split('T')[0] : '',
          weight: animal.weight || '',
          healthStatus: animal.healthStatus || 'Sehat',
          purchasePrice: animal.purchasePrice || '',
          estimatedSellingPrice: animal.estimatedSellingPrice || '',
          status: animal.status || 'AVAILABLE',
          cageId: animal.cageId || '',
          origin: animal.origin || '',
          notes: animal.notes || '',
        });
      }
    } catch (err) {
      console.error('Failed to fetch animal details:', err);
      setToast({ message: 'Gagal memuat detail hewan', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCages();
    if (id) fetchAnimalDetail();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        weight: parseFloat(formData.weight),
        purchasePrice: parseFloat(formData.purchasePrice),
        estimatedSellingPrice: formData.estimatedSellingPrice ? parseFloat(formData.estimatedSellingPrice) : null,
      };

      const res = await api.put(`/animals/${id}`, payload);
      if (res.data.success) {
        setToast({ message: 'Data hewan berhasil diperbarui', type: 'success' });
        setTimeout(() => {
          router.push('/animals');
        }, 1200);
      }
    } catch (err) {
      console.error('Submit error:', err);
      const msg = err.response?.data?.message || 'Gagal memperbarui data hewan';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Memuat detail hewan..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/animals" className="p-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-600 rounded-xl transition-colors shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[#1E3F20]">Edit Data Hewan Ternak</h1>
          <p className="text-slate-600 text-xs mt-0.5">Perbarui informasi identitas, fisik, dan status hewan</p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
        
        {/* Section 1: Identitas */}
        <div className="space-y-4">
          <h3 className="text-base font-extrabold text-[#1E3F20] border-b border-slate-200 pb-2">1. Identitas Hewan</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Kode Hewan *</label>
              <input
                type="text"
                name="code"
                required
                disabled
                value={formData.code}
                onChange={handleChange}
                placeholder="e.g. SAPI-001"
                className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1E3F20] opacity-60 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Nama Hewan *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Bima"
                className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1E3F20]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Jenis Hewan *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#1E3F20]"
              >
                <option value="Sapi">Sapi</option>
                <option value="Kambing">Kambing</option>
                <option value="Domba">Domba</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Ras / Breed *</label>
              <input
                type="text"
                name="breed"
                required
                value={formData.breed}
                onChange={handleChange}
                placeholder="e.g. Limosin / Etawa"
                className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1E3F20]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Jenis Kelamin *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#1E3F20]"
              >
                <option value="Jantan">Jantan</option>
                <option value="Betina">Betina</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Tanggal Lahir</label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#1E3F20]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Fisik & Kandang */}
        <div className="space-y-4">
          <h3 className="text-base font-extrabold text-[#1E3F20] border-b border-slate-200 pb-2">2. Fisik & Lokasi Kandang</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Berat Saat Ini (kg) *</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                name="weight"
                required
                value={formData.weight}
                onChange={handleChange}
                placeholder="e.g. 450.5"
                className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1E3F20]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Kondisi Kesehatan</label>
              <input
                type="text"
                name="healthStatus"
                value={formData.healthStatus}
                onChange={handleChange}
                placeholder="e.g. Sehat / Vaksin Lengkap"
                className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1E3F20]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Pilih Kandang *</label>
              <select
                name="cageId"
                required
                value={formData.cageId}
                onChange={handleChange}
                className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#1E3F20]"
              >
                <option value="">-- Pilih Kandang --</option>
                {cages.map((cage) => (
                  <option key={cage.id} value={cage.id}>
                    {cage.name} ({cage.availableAnimalsCount}/{cage.capacity} ekor)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Keuangan & Status */}
        <div className="space-y-4">
          <h3 className="text-base font-extrabold text-[#1E3F20] border-b border-slate-200 pb-2">3. Keuangan & Status</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Harga Beli (Rp) *</label>
              <input
                type="number"
                min="0"
                name="purchasePrice"
                required
                value={formData.purchasePrice}
                onChange={handleChange}
                placeholder="e.g. 15000000"
                className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1E3F20]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Estimasi Harga Jual (Rp)</label>
              <input
                type="number"
                min="0"
                name="estimatedSellingPrice"
                value={formData.estimatedSellingPrice}
                onChange={handleChange}
                placeholder="e.g. 22000000"
                className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1E3F20]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Status Hewan *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-[#1E3F20] font-bold focus:outline-none focus:border-[#1E3F20]"
              >
                <option value="AVAILABLE">AVAILABLE (Tersedia)</option>
                <option value="SOLD">SOLD (Terjual)</option>
                <option value="DECEASED">DECEASED (Mati)</option>
                <option value="TRANSFERRED">TRANSFERRED (Dipindahkan)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Asal-usul & Catatan */}
        <div className="space-y-4">
          <h3 className="text-base font-extrabold text-[#1E3F20] border-b border-slate-200 pb-2">4. Asal Usul & Catatan tambahan</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Asal Hewan / Suplier</label>
              <input
                type="text"
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                placeholder="e.g. Peternakan Boyolali"
                className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1E3F20]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Catatan Tambahan</label>
              <input
                type="text"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Catatan khusus nafsu makan / perawatan"
                className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1E3F20]"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Link
            href="/animals"
            className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl"
          >
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
                <span>Memperbarui...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
