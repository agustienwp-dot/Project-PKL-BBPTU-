'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';
import { 
  Package, 
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
  Milk
} from 'lucide-react';

export default function PengemasanPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [packagings, setPackagings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [toast, setToast] = useState(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnimalType, setFilterAnimalType] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formAnimalType, setFormAnimalType] = useState('SAPI');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formProcessedLiters, setFormProcessedLiters] = useState('');
  const [formBotolQty, setFormBotolQty] = useState('0');
  const [formCupQty, setFormCupQty] = useState('0');
  const [formPlastikBantalQty, setFormPlastikBantalQty] = useState('0');
  const [formNotes, setFormNotes] = useState('');

  // Detail Modal
  const [selectedPkg, setSelectedPkg] = useState(null);

  // Delete State
  const [deletingPkg, setDeletingPkg] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = '/farm/packaging?';
      if (filterAnimalType) url += `animalType=${filterAnimalType}&`;
      if (filterDate) url += `date=${filterDate}&`;

      const [pkgRes, catRes] = await Promise.all([
        api.get(url),
        api.get('/categories'),
      ]);

      if (pkgRes.data.success) setPackagings(pkgRes.data.data);
      if (catRes.data.success) {
        setCategories(catRes.data.data);
        if (!formCategoryId && catRes.data.data.length > 0) {
          setFormCategoryId(catRes.data.data[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching packaging data:', err);
      setToast({ type: 'error', message: 'Gagal memuat data pengemasan.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterAnimalType, filterDate]);

  const canManage = user?.role === 'ADMIN_FARM' || user?.role === 'SUPERADMIN';

  // Automatic calculation: Botol + Cup + Plastik Bantal
  const parsedBotol = parseInt(formBotolQty, 10) || 0;
  const parsedCup = parseInt(formCupQty, 10) || 0;
  const parsedPlastikBantal = parseInt(formPlastikBantalQty, 10) || 0;
  const computedTotalKemasan = Math.max(0, parsedBotol) + Math.max(0, parsedCup) + Math.max(0, parsedPlastikBantal);

  const openAddModal = () => {
    setEditingPkg(null);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormAnimalType('SAPI');
    if (categories.length > 0) setFormCategoryId(categories[0].id);
    setFormProcessedLiters('');
    setFormBotolQty('0');
    setFormCupQty('0');
    setFormPlastikBantalQty('0');
    setFormNotes('');
    setShowModal(true);
  };

  const openEditModal = (p) => {
    setEditingPkg(p);
    setFormDate(new Date(p.date).toISOString().split('T')[0]);
    setFormAnimalType(p.animalType || 'SAPI');
    setFormCategoryId(p.categoryId || (categories.length > 0 ? categories[0].id : ''));
    setFormProcessedLiters(p.processedLiters.toString());
    setFormBotolQty(p.botolQty.toString());
    setFormCupQty(p.cupQty.toString());
    setFormPlastikBantalQty(p.plastikBantalQty.toString());
    setFormNotes(p.notes || '');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const liters = parseFloat(formProcessedLiters) || 0;
    const botol = parseInt(formBotolQty, 10) || 0;
    const cup = parseInt(formCupQty, 10) || 0;
    const plastikBantal = parseInt(formPlastikBantalQty, 10) || 0;

    // Non-negative Validation
    if (liters < 0 || botol < 0 || cup < 0 || plastikBantal < 0) {
      setToast({ type: 'error', message: 'Jumlah liter diproses dan kemasan tidak boleh bernilai negatif' });
      return;
    }

    if (computedTotalKemasan <= 0 && liters <= 0) {
      setToast({ type: 'error', message: 'Masukkan minimal jumlah liter diproses atau pcs kemasan yang dikemas' });
      return;
    }

    try {
      if (editingPkg) {
        const res = await api.put(`/farm/packaging/${editingPkg.id}`, {
          date: formDate,
          animalType: formAnimalType,
          categoryId: formCategoryId,
          processedLiters: liters,
          botolQty: botol,
          cupQty: cup,
          plastikBantalQty: plastikBantal,
          notes: formNotes,
        });

        if (res.data.success) {
          setToast({ type: 'success', message: 'Data hasil pengemasan berhasil diperbarui!' });
          setShowModal(false);
          fetchData();
        }
      } else {
        const res = await api.post('/farm/packaging', {
          date: formDate,
          animalType: formAnimalType,
          categoryId: formCategoryId,
          processedLiters: liters,
          botolQty: botol,
          cupQty: cup,
          plastikBantalQty: plastikBantal,
          notes: formNotes,
        });

        if (res.data.success) {
          setToast({ 
            type: 'success', 
            message: `Data pengemasan (${computedTotalKemasan} pcs) berhasil disimpan!` 
          });
          setShowModal(false);
          fetchData();
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menyimpan data pengemasan.';
      setToast({ type: 'error', message: msg });
    }
  };

  const handleDelete = async () => {
    if (!deletingPkg) return;
    try {
      const res = await api.delete(`/farm/packaging/${deletingPkg.id}`);
      if (res.data.success) {
        setToast({ type: 'success', message: 'Data pengemasan berhasil dihapus.' });
        setDeletingPkg(null);
        fetchData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menghapus data pengemasan.';
      setToast({ type: 'error', message: msg });
    }
  };

  const filteredPackagings = packagings.filter((p) => {
    const q = searchQuery.toLowerCase();
    const catName = (p.category?.name || '').toLowerCase();
    const notes = (p.notes || '').toLowerCase();
    const creator = (p.createdBy?.name || '').toLowerCase();
    return catName.includes(q) || notes.includes(q) || creator.includes(q);
  });

  return (
    <div className="space-y-8 pb-12">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold mb-2">
            <Package className="w-4 h-4" />
            <span>{canManage ? 'POV Admin Farm Produksi' : 'Informasi Hasil Pengemasan (Read Only)'}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Pengemasan Susu</h1>
          <p className="text-xs text-slate-500 font-medium">
            {canManage ? 'Catat hasil susu segar yang diproses dan dikemas dalam Botol, Cup, & Plastik Bantal.' : 'Lihat informasi hasil susu segar yang diproses dan dikemas.'}
          </p>
        </div>

        {canManage && (
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-[#1E3F20] text-white hover:bg-[#16331a] rounded-2xl text-xs font-bold shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Input Hasil Pengemasan</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari catatan, varian, atau petugas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <select
            value={filterAnimalType}
            onChange={(e) => setFilterAnimalType(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
          >
            <option value="">Semua Jenis Susu (Sapi & Kambing)</option>
            <option value="SAPI">🐄 Susu Sapi</option>
            <option value="KAMBING">🐐 Susu Kambing</option>
          </select>

          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
          />

          {(filterAnimalType || filterDate || searchQuery) && (
            <button
              onClick={() => {
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

      {/* Packaging History Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-600" />
            <span>Tabel Hasil Pengemasan ({filteredPackagings.length} Entry)</span>
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center"><LoadingSpinner text="Memuat data pengemasan..." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Tanggal</th>
                  <th className="py-3.5 px-4">Jenis Susu</th>
                  <th className="py-3.5 px-4">Liter Diproses</th>
                  <th className="py-3.5 px-4">Botol</th>
                  <th className="py-3.5 px-4">Cup</th>
                  <th className="py-3.5 px-4">Plastik Bantal</th>
                  <th className="py-3.5 px-4">Total Kemasan</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredPackagings.length > 0 ? (
                  filteredPackagings.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {new Date(p.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
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
                      <td className="py-3.5 px-4 font-black text-slate-800">{p.processedLiters} Liter</td>
                      <td className="py-3.5 px-4 font-bold text-amber-700">{p.botolQty} pcs</td>
                      <td className="py-3.5 px-4 font-bold text-blue-700">{p.cupQty} pcs</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-700">{p.plastikBantalQty} pcs</td>
                      <td className="py-3.5 px-4">
                        <span className="px-3 py-1 bg-slate-900 text-white rounded-lg font-black text-xs">
                          {p.totalPackagedQty} pcs
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedPkg(p)}
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
                              title="Edit Pengemasan"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingPkg(p)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Hapus Pengemasan"
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
                    <td colSpan={8} className="py-6 text-center text-slate-400">Belum ada data pengemasan susu yang diinput.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FORM MODAL INPUT / EDIT PENGEMASAN */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-600" />
                <span>{editingPkg ? 'Edit Data Pengemasan' : 'Input Hasil Pengemasan Susu'}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Susu</label>
                  <select
                    value={formAnimalType}
                    onChange={(e) => setFormAnimalType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                    required
                  >
                    <option value="SAPI">🐄 Susu Sapi</option>
                    <option value="KAMBING">🐐 Susu Kambing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Jumlah Liter yang Diproses</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="Contoh: 50"
                  value={formProcessedLiters}
                  onChange={(e) => setFormProcessedLiters(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                  required
                />
              </div>

              {/* 3 JENIS KEMASAN INPUT */}
              <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/60 space-y-3">
                <span className="text-xs font-black text-amber-900 block border-b border-amber-200/60 pb-1.5">
                  Rincian Hasil Kemasan (pcs)
                </span>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Botol (pcs)</label>
                    <input
                      type="number"
                      min="0"
                      value={formBotolQty}
                      onChange={(e) => setFormBotolQty(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Cup (pcs)</label>
                    <input
                      type="number"
                      min="0"
                      value={formCupQty}
                      onChange={(e) => setFormCupQty(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Plastik Bantal</label>
                    <input
                      type="number"
                      min="0"
                      value={formPlastikBantalQty}
                      onChange={(e) => setFormPlastikBantalQty(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                      required
                    />
                  </div>
                </div>

                {/* AUTOMATIC TOTAL DISPLAY */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-amber-200 mt-2">
                  <span className="text-xs font-bold text-slate-700">Perhitungan Total Kemasan:</span>
                  <span className="text-sm font-black text-amber-700">
                    {parsedBotol} + {parsedCup} + {parsedPlastikBantal} = {computedTotalKemasan} pcs
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Pengemasan</label>
                <textarea
                  rows="2"
                  placeholder="Catatan..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
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
                  {editingPkg ? 'Simpan Perubahan' : 'Simpan Pengemasan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedPkg && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-600" />
                <span>Detail Hasil Pengemasan</span>
              </h3>
              <button onClick={() => setSelectedPkg(null)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="font-semibold text-slate-500">Tanggal:</span>
                <span className="font-extrabold text-slate-900">
                  {new Date(selectedPkg.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="font-semibold text-slate-500">Jenis Susu:</span>
                <span className="font-extrabold text-slate-900">
                  {selectedPkg.animalType === 'KAMBING' ? '🐐 Susu Kambing' : '🐄 Susu Sapi'}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="font-semibold text-slate-500">Liter Diproses:</span>
                <span className="font-black text-slate-900 text-sm">{selectedPkg.processedLiters} Liter</span>
              </div>
              
              <div className="p-3 bg-amber-50/50 rounded-xl space-y-1.5 border border-amber-100">
                <span className="font-bold text-amber-900 block text-[11px]">Breakdown Hasil Kemasan:</span>
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Botol:</span>
                  <span className="font-extrabold text-amber-700">{selectedPkg.botolQty} pcs</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Cup:</span>
                  <span className="font-extrabold text-blue-700">{selectedPkg.cupQty} pcs</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Plastik Bantal:</span>
                  <span className="font-extrabold text-emerald-700">{selectedPkg.plastikBantalQty} pcs</span>
                </div>
                <div className="flex justify-between font-extrabold text-slate-900 pt-1 border-t border-amber-200/60">
                  <span>Total Kemasan:</span>
                  <span className="text-amber-800">{selectedPkg.totalPackagedQty} pcs</span>
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <span className="font-semibold text-slate-500 block">Catatan:</span>
                <p className="p-3 bg-slate-50 rounded-xl text-slate-700 font-medium">{selectedPkg.notes || 'Tidak ada catatan.'}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedPkg(null)}
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
        isOpen={!!deletingPkg}
        title="Konfirmasi Hapus Data Pengemasan"
        message="Apakah Anda yakin ingin menghapus data hasil pengemasan ini?"
        confirmText="Ya, Hapus Pengemasan"
        onConfirm={handleDelete}
        onCancel={() => setDeletingPkg(null)}
      />
    </div>
  );
}
