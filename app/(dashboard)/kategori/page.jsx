'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';
import { 
  Layers, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';

export default function KategoriPage() {
  const { user, isSuperAdmin, isAdminFarm } = useAuth();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [toast, setToast] = useState(null);

  // Form Modal State (Add / Edit)
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formUnit, setFormUnit] = useState('botol');
  const [formDesc, setFormDesc] = useState('');

  // Delete State
  const [deletingCategory, setDeletingCategory] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setToast({ type: 'error', message: 'Gagal memuat daftar kategori produk.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormName('');
    setFormCode('');
    setFormUnit('botol');
    setFormDesc('');
    setShowModal(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormCode(cat.code);
    setFormUnit(cat.unit);
    setFormDesc(cat.description || '');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const res = await api.put(`/categories/${editingCategory.id}`, {
          name: formName,
          code: formCode,
          unit: formUnit,
          description: formDesc,
        });

        if (res.data.success) {
          setToast({ type: 'success', message: 'Kategori produk berhasil diperbarui!' });
          setShowModal(false);
          fetchCategories();
        }
      } else {
        const res = await api.post('/categories', {
          name: formName,
          code: formCode,
          unit: formUnit,
          description: formDesc,
        });

        if (res.data.success) {
          setToast({ type: 'success', message: 'Kategori produk baru berhasil ditambahkan!' });
          setShowModal(false);
          fetchCategories();
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menyimpan kategori produk.';
      setToast({ type: 'error', message: msg });
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    try {
      const res = await api.delete(`/categories/${deletingCategory.id}`);
      if (res.data.success) {
        setToast({ type: 'success', message: 'Kategori berhasil dihapus.' });
        setDeletingCategory(null);
        fetchCategories();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menghapus kategori.';
      setToast({ type: 'error', message: msg });
    }
  };

  const canManage = isSuperAdmin || isAdminFarm;

  return (
    <div className="space-y-8 pb-12">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold mb-2">
            <Layers className="w-4 h-4" />
            <span>Master Data Kategori</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Kelola Kategori Produk Susu</h1>
          <p className="text-xs text-slate-500 font-medium">Atur varian kategori produk susu (UHT, Olahan, Produk Lainnya) secara fleksibel.</p>
        </div>

        {canManage && (
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-[#1E3F20] text-white hover:bg-[#16331a] rounded-2xl text-xs font-bold shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kategori Baru</span>
          </button>
        )}
      </div>

      {/* Category Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <span>Daftar Kategori Produk ({categories.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center"><LoadingSpinner text="Memuat data kategori..." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Nama Kategori</th>
                  <th className="py-3.5 px-4">Kode Unik</th>
                  <th className="py-3.5 px-4">Satuan Default</th>
                  <th className="py-3.5 px-4">Deskripsi</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{c.name}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-black text-[11px]">
                        {c.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{c.unit}</td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-sm">{c.description || '-'}</td>
                    <td className="py-3.5 px-4 text-center space-x-2">
                      {canManage ? (
                        <>
                          <button
                            onClick={() => openEditModal(c)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Kategori"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingCategory(c)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Kategori"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Hanya Lihat</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FORM MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                <span>{editingCategory ? 'Edit Kategori Produk' : 'Tambah Kategori Produk Baru'}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kategori</label>
                <input
                  type="text"
                  placeholder="Contoh: Susu Pasteurisasi Rasa Strawberry"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kode Unik</label>
                <input
                  type="text"
                  placeholder="Contoh: STRAWBERRY_250"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Satuan Produk (Kemasan)</label>
                <select
                  value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                >
                  <option value="botol">botol</option>
                  <option value="pcs">pcs</option>
                  <option value="cup">cup</option>
                  <option value="pack">pack</option>
                  <option value="liter">liter</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Produk</label>
                <textarea
                  rows="2"
                  placeholder="Penjelasan singkat mengenai kategori produk ini..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
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
                  {editingCategory ? 'Simpan Perubahan' : 'Tambah Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!deletingCategory}
        title="Konfirmasi Hapus Kategori"
        message={`Apakah Anda yakin ingin menghapus kategori '${deletingCategory?.name}'?`}
        confirmText="Ya, Hapus Kategori"
        onConfirm={handleDelete}
        onCancel={() => setDeletingCategory(null)}
      />
    </div>
  );
}
