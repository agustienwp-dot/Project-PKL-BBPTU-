'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';
import { 
  Milk, 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

export default function ProduksiPage() {
  const { user, isAdminFarm } = useAuth();
  const [loading, setLoading] = useState(true);
  const [productions, setProductions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [toast, setToast] = useState(null);

  // Filters
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Form Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProd, setEditingProd] = useState(null);
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formRawLiters, setFormRawLiters] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Delete State
  const [deletingProd, setDeletingProd] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = '/farm/production?productType=SEGAR&';
      if (filterCategory) url += `categoryId=${filterCategory}&`;
      if (filterDate) url += `date=${filterDate}&`;

      const [pRes, cRes] = await Promise.all([
        api.get(url),
        api.get('/categories?productType=SEGAR'),
      ]);

      if (pRes.data.success) setProductions(pRes.data.data);
      if (cRes.data.success) {
        setCategories(cRes.data.data);
        if (!formCategoryId && cRes.data.data.length > 0) {
          setFormCategoryId(cRes.data.data[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching production data:', err);
      setToast({ type: 'error', message: 'Gagal memuat riwayat laporan hasil perah.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterCategory, filterDate]);

  if (!isAdminFarm) {
    return (
      <div className="p-8 bg-white border border-rose-200 rounded-3xl text-center space-y-4 shadow-sm">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-black text-rose-700">Akses Ditolak — Khusus Admin Farm</h2>
        <p className="text-xs text-slate-500">Halaman ini dikhususkan untuk Admin Farm untuk menginput laporan hasil perah susu segar harian.</p>
      </div>
    );
  }

  const openAddModal = () => {
    setEditingProd(null);
    setFormDate(new Date().toISOString().split('T')[0]);
    if (categories.length > 0) setFormCategoryId(categories[0].id);
    setFormRawLiters('');
    setFormNotes('');
    setShowModal(true);
  };

  const openEditModal = (p) => {
    setEditingProd(p);
    setFormDate(new Date(p.date).toISOString().split('T')[0]);
    setFormCategoryId(p.categoryId);
    setFormRawLiters(p.rawVolumeLiters.toString());
    setFormNotes(p.notes || '');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const cat = categories.find(c => c.id === formCategoryId);
      const pkg = cat?.defaultPackaging || 'botol';
      const liters = parseFloat(formRawLiters) || 0;

      if (editingProd) {
        const res = await api.put(`/farm/production/${editingProd.id}`, {
          date: formDate,
          categoryId: formCategoryId,
          productType: 'SEGAR',
          packagingType: pkg,
          rawVolumeLiters: liters,
          processedLiters: liters,
          packagedQty: Math.round(liters),
          notes: formNotes,
        });

        if (res.data.success) {
          setToast({ type: 'success', message: 'Laporan hasil perah berhasil diperbarui!' });
          setShowModal(false);
          fetchData();
        }
      } else {
        const res = await api.post('/farm/production', {
          date: formDate,
          categoryId: formCategoryId,
          productType: 'SEGAR',
          packagingType: pkg,
          rawVolumeLiters: liters,
          processedLiters: liters,
          packagedQty: Math.round(liters),
          notes: formNotes,
        });

        if (res.data.success) {
          setToast({ type: 'success', message: 'Laporan hasil perah susu segar harian berhasil disimpan!' });
          setShowModal(false);
          fetchData();
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menyimpan laporan hasil perah.';
      setToast({ type: 'error', message: msg });
    }
  };

  const handleDelete = async () => {
    if (!deletingProd) return;
    try {
      const res = await api.delete(`/farm/production/${deletingProd.id}`);
      if (res.data.success) {
        setToast({ type: 'success', message: 'Laporan hasil perah berhasil dihapus.' });
        setDeletingProd(null);
        fetchData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menghapus data.';
      setToast({ type: 'error', message: msg });
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold mb-2">
            <Milk className="w-4 h-4" />
            <span>POV Admin Farm</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Laporan Hasil Perah Susu Segar Harian</h1>
          <p className="text-xs text-slate-500 font-medium">Input volume hasil perah susu segar dari farm per harinya.</p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-[#1E3F20] text-white hover:bg-[#16331a] rounded-2xl text-xs font-bold shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Input Hasil Perah Harian</span>
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Filter className="w-4 h-4 text-emerald-700" />
          <span>Filter Laporan:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="">Semua Varian Susu Segar</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
            ))}
          </select>

          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
          />

          {(filterCategory || filterDate) && (
            <button
              onClick={() => {
                setFilterCategory('');
                setFilterDate('');
              }}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Production History Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>Tabel Riwayat Laporan Perah ({productions.length} Entry)</span>
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center"><LoadingSpinner text="Memuat laporan hasil perah..." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Tanggal Perah</th>
                  <th className="py-3.5 px-4">Kode / Jenis Susu Segar</th>
                  <th className="py-3.5 px-4">Hasil Perah (Liter)</th>
                  <th className="py-3.5 px-4">Petugas Input</th>
                  <th className="py-3.5 px-4">Catatan Perah</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {productions.length > 0 ? (
                  productions.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {new Date(p.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                          {p.category?.name || 'Susu Segar'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-black text-emerald-700 text-sm">{p.rawVolumeLiters} Liter</td>
                      <td className="py-3.5 px-4 text-slate-600">{p.createdBy?.name || 'Admin Farm'}</td>
                      <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">{p.notes || '-'}</td>
                      <td className="py-3.5 px-4 text-center space-x-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Laporan"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingProd(p)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Laporan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">Belum ada laporan hasil perah yang diinput.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FORM MODAL INPUT / EDIT */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Milk className="w-5 h-5 text-emerald-600" />
                <span>{editingProd ? 'Edit Laporan Perah' : 'Input Hasil Perah Susu Segar'}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Perah</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kode / Jenis Susu Segar</label>
                <select
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hasil Perah (Liter)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Contoh: 500"
                  value={formRawLiters}
                  onChange={(e) => setFormRawLiters(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Hasil Perah</label>
                <textarea
                  rows="2"
                  placeholder="Catatan..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1E3F20] text-white rounded-xl text-xs font-bold hover:bg-[#16331a] shadow"
                >
                  {editingProd ? 'Simpan Perubahan' : 'Kirim Laporan Perah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!deletingProd}
        title="Konfirmasi Hapus Laporan Perah"
        message="Apakah Anda yakin ingin menghapus data laporan perah susu segar ini?"
        confirmText="Ya, Hapus Laporan"
        onConfirm={handleDelete}
        onCancel={() => setDeletingProd(null)}
      />
    </div>
  );
}
