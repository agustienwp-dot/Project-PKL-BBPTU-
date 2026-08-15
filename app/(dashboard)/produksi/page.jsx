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
  FileSpreadsheet,
  Search,
  Eye,
  X
} from 'lucide-react';

export default function ProduksiPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [productions, setProductions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [toast, setToast] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAnimalType, setFilterAnimalType] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Form Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProd, setEditingProd] = useState(null);
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formAnimalType, setFormAnimalType] = useState('SAPI');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formRawLiters, setFormRawLiters] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Detail Modal State
  const [selectedProd, setSelectedProd] = useState(null);

  // Delete State
  const [deletingProd, setDeletingProd] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = '/farm/production?productType=SEGAR&';
      if (filterCategory) url += `categoryId=${filterCategory}&`;
      if (filterAnimalType) url += `animalType=${filterAnimalType}&`;
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
  }, [filterCategory, filterAnimalType, filterDate]);

  const canManage = user?.role === 'ADMIN_FARM' || user?.role === 'SUPERADMIN';

  const openAddModal = () => {
    setEditingProd(null);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormAnimalType('SAPI');
    const sapiCats = categories.filter(c => !c.animalType || c.animalType === 'SAPI');
    if (sapiCats.length > 0) setFormCategoryId(sapiCats[0].id);
    else if (categories.length > 0) setFormCategoryId(categories[0].id);
    setFormRawLiters('');
    setFormNotes('');
    setShowModal(true);
  };

  const openEditModal = (p) => {
    setEditingProd(p);
    setFormDate(new Date(p.date).toISOString().split('T')[0]);
    setFormAnimalType(p.animalType || 'SAPI');
    setFormCategoryId(p.categoryId);
    setFormRawLiters(p.rawVolumeLiters.toString());
    setFormNotes(p.notes || '');
    setShowModal(true);
  };

  const filteredFormCategories = categories.filter(c => !c.animalType || c.animalType === formAnimalType);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const liters = parseFloat(formRawLiters);

    // Validation
    if (isNaN(liters) || liters < 0) {
      setToast({ type: 'error', message: 'Jumlah liter tidak boleh bernilai negatif atau kosong' });
      return;
    }

    try {
      let targetCatId = formCategoryId;
      if (!targetCatId && categories.length > 0) {
        const matchCat = categories.find(c => c.animalType === formAnimalType);
        targetCatId = matchCat ? matchCat.id : categories[0].id;
      }
      const cat = categories.find(c => c.id === targetCatId);
      const pkg = cat?.defaultPackaging || 'botol';

      if (editingProd) {
        const res = await api.put(`/farm/production/${editingProd.id}`, {
          date: formDate,
          categoryId: targetCatId,
          productType: 'SEGAR',
          animalType: formAnimalType,
          packagingType: pkg,
          rawVolumeLiters: liters,
          processedLiters: liters,
          packagedQty: Math.round(liters),
          notes: formNotes,
        });

        if (res.data.success) {
          setToast({ type: 'success', message: 'Laporan perah susu berhasil diperbarui!' });
          setShowModal(false);
          fetchData();
        }
      } else {
        const res = await api.post('/farm/production', {
          date: formDate,
          categoryId: targetCatId,
          productType: 'SEGAR',
          animalType: formAnimalType,
          packagingType: pkg,
          rawVolumeLiters: liters,
          processedLiters: liters,
          packagedQty: Math.round(liters),
          notes: formNotes,
        });

        if (res.data.success) {
          setToast({ 
            type: 'success', 
            message: `Laporan hasil perah Susu ${formAnimalType === 'KAMBING' ? 'Kambing' : 'Sapi'} (${liters} L) berhasil disimpan!` 
          });
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

  const filteredProductions = productions.filter((p) => {
    const q = searchQuery.toLowerCase();
    const catName = (p.category?.name || '').toLowerCase();
    const notes = (p.notes || '').toLowerCase();
    const creator = (p.createdBy?.name || '').toLowerCase();
    return catName.includes(q) || notes.includes(q) || creator.includes(q);
  });

  return (
    <div className="space-y-8 pb-12">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold mb-2">
            <Milk className="w-4 h-4" />
            <span>{canManage ? 'POV Admin Farm Produksi' : 'Informasi Produksi Susu (Read Only)'}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Produksi Susu</h1>
          <p className="text-xs text-slate-500 font-medium">
            {canManage ? 'Input dan kelola volume perah susu harian dari sapi dan kambing.' : 'Lihat informasi hasil perah susu harian dari sapi dan kambing.'}
          </p>
        </div>

        {canManage && (
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-[#1E3F20] text-white hover:bg-[#16331a] rounded-2xl text-xs font-bold shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Input Produksi Susu</span>
          </button>
        )}
      </div>

      {/* Filter & Search Section */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari varian, catatan, atau petugas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Filter Animal Type */}
          <select
            value={filterAnimalType}
            onChange={(e) => setFilterAnimalType(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="">Semua Ternak (Sapi & Kambing)</option>
            <option value="SAPI">🐄 Susu Sapi</option>
            <option value="KAMBING">🐐 Susu Kambing</option>
          </select>

          {/* Filter Date */}
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
          />

          {(filterCategory || filterAnimalType || filterDate || searchQuery) && (
            <button
              onClick={() => {
                setFilterCategory('');
                setFilterAnimalType('');
                setFilterDate('');
                setSearchQuery('');
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
            <span>Tabel Data Produksi Susu ({filteredProductions.length} Entry)</span>
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center"><LoadingSpinner text="Memuat data produksi susu..." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Tanggal Produksi</th>
                  <th className="py-3.5 px-4">Jenis Ternak</th>
                  <th className="py-3.5 px-4">Jumlah Literan Produksi</th>
                  <th className="py-3.5 px-4">Catatan</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredProductions.length > 0 ? (
                  filteredProductions.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {new Date(p.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-4">
                        {p.animalType === 'KAMBING' ? (
                          <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200 font-extrabold text-[10px] inline-flex items-center gap-1">
                            🐐 Susu Kambing
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold text-[10px] inline-flex items-center gap-1">
                            🐄 Susu Sapi
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-black text-emerald-700 text-sm">{p.rawVolumeLiters} Liter</td>
                      <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">{p.notes || '-'}</td>
                      <td className="py-3.5 px-4 text-center space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedProd(p)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canManage && (
                          <>
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
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">Belum ada data produksi susu yang sesuai.</td>
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
                <span>{editingProd ? 'Edit Data Produksi' : 'Input Produksi Susu Harian'}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Jenis Ternak</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormAnimalType('SAPI');
                      const sapiCats = categories.filter(c => !c.animalType || c.animalType === 'SAPI');
                      if (sapiCats.length > 0) setFormCategoryId(sapiCats[0].id);
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                      formAnimalType === 'SAPI'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>🐄 Sapi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormAnimalType('KAMBING');
                      const kambingCats = categories.filter(c => c.animalType === 'KAMBING');
                      if (kambingCats.length > 0) setFormCategoryId(kambingCats[0].id);
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                      formAnimalType === 'KAMBING'
                        ? 'bg-purple-600 text-white border-purple-600 shadow'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>🐐 Kambing</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Produksi</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Jumlah Produksi dalam Liter</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="Contoh: 80"
                  value={formRawLiters}
                  onChange={(e) => setFormRawLiters(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan (Opsional)</label>
                <textarea
                  rows="2"
                  placeholder="Contoh: Produksi perah pagi & sore..."
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
                  {editingProd ? 'Simpan Perubahan' : 'Simpan Data Produksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedProd && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Milk className="w-5 h-5 text-emerald-600" />
                <span>Detail Produksi Susu</span>
              </h3>
              <button onClick={() => setSelectedProd(null)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="font-semibold text-slate-500">Tanggal Produksi:</span>
                <span className="font-extrabold text-slate-900">
                  {new Date(selectedProd.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="font-semibold text-slate-500">Jenis Ternak:</span>
                <span className="font-extrabold text-slate-900">
                  {selectedProd.animalType === 'KAMBING' ? '🐐 Susu Kambing' : '🐄 Susu Sapi'}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="font-semibold text-slate-500">Jumlah Volume:</span>
                <span className="font-black text-emerald-700 text-sm">{selectedProd.rawVolumeLiters} Liter</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="font-semibold text-slate-500">Kode / Varian:</span>
                <span className="font-bold text-slate-800">{selectedProd.category?.name || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="font-semibold text-slate-500">Petugas Input:</span>
                <span className="font-semibold text-slate-700">{selectedProd.createdBy?.name || 'Admin Farm'}</span>
              </div>
              <div className="space-y-1 pt-1">
                <span className="font-semibold text-slate-500 block">Catatan:</span>
                <p className="p-3 bg-slate-50 rounded-xl text-slate-700 font-medium">{selectedProd.notes || 'Tidak ada catatan.'}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedProd(null)}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!deletingProd}
        title="Konfirmasi Hapus Laporan Produksi"
        message="Apakah Anda yakin ingin menghapus data laporan produksi susu segar ini?"
        confirmText="Ya, Hapus Laporan"
        onConfirm={handleDelete}
        onCancel={() => setDeletingProd(null)}
      />
    </div>
  );
}
