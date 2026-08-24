'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';
import { 
  History, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Milk,
  FileSpreadsheet
} from 'lucide-react';

export default function RiwayatProduksiPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [productions, setProductions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [toast, setToast] = useState(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnimalType, setFilterAnimalType] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Detail Modal
  const [selectedProd, setSelectedProd] = useState(null);

  // Edit Modal State
  const [editingProd, setEditingProd] = useState(null);
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formAnimalType, setFormAnimalType] = useState('SAPI');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formGrossLiters, setFormGrossLiters] = useState('');
  const [formPedetLiters, setFormPedetLiters] = useState('');
  const [formAfkirLiters, setFormAfkirLiters] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Delete State
  const [deletingProd, setDeletingProd] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = '/farm/production?productType=SEGAR&';
      if (filterAnimalType) url += `animalType=${filterAnimalType}&`;
      if (filterDate) url += `date=${filterDate}&`;

      const [pRes, cRes] = await Promise.all([
        api.get(url),
        api.get('/categories?productType=SEGAR'),
      ]);

      if (pRes.data.success) setProductions(pRes.data.data);
      if (cRes.data.success) {
        setCategories(cRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching production history:', err);
      setToast({ type: 'error', message: 'Gagal memuat riwayat produksi.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterAnimalType, filterDate]);

  const canManage = user?.role === 'ADMIN_FARM' || user?.role === 'SUPERADMIN';

  const openEditModal = (p) => {
    setEditingProd(p);
    setFormDate(new Date(p.date).toISOString().split('T')[0]);
    setFormAnimalType(p.animalType || 'SAPI');
    setFormCategoryId(p.categoryId);
    const gross = p.grossVolumeLiters > 0 ? p.grossVolumeLiters.toString() : p.rawVolumeLiters.toString();
    setFormGrossLiters(gross);
    setFormPedetLiters(p.pedetVolumeLiters > 0 ? p.pedetVolumeLiters.toString() : '');
    setFormAfkirLiters(p.afkirVolumeLiters > 0 ? p.afkirVolumeLiters.toString() : '');
    setFormNotes(p.notes || '');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const grossVal = parseFloat(formGrossLiters);
    if (isNaN(grossVal) || grossVal < 0) {
      setToast({ type: 'error', message: 'Jumlah Produksi susu tidak boleh bernilai negatif' });
      return;
    }

    const pedetVal = parseFloat(formPedetLiters) || 0;
    const afkirVal = parseFloat(formAfkirLiters) || 0;
    const totalUsage = pedetVal + afkirVal;

    if (pedetVal < 0 || afkirVal < 0) {
      setToast({ type: 'error', message: 'Jumlah potongan susu tidak boleh bernilai negatif' });
      return;
    }
    if (totalUsage > grossVal) {
      setToast({ type: 'error', message: 'Total potongan tidak boleh melebihi Produksi susu' });
      return;
    }

    const netVal = Math.max(0, grossVal - totalUsage);

    try {
      const cat = categories.find(c => c.id === formCategoryId);
      const pkg = cat?.defaultPackaging || 'botol';

      const res = await api.put(`/farm/production/${editingProd.id}`, {
        date: formDate,
        categoryId: formCategoryId,
        productType: 'SEGAR',
        animalType: formAnimalType,
        packagingType: pkg,
        grossVolumeLiters: grossVal,
        pedetVolumeLiters: pedetVal,
        afkirVolumeLiters: afkirVal,
        rawVolumeLiters: netVal,
        processedLiters: netVal,
        packagedQty: Math.round(netVal),
        notes: formNotes,
      });

      if (res.data.success) {
        setToast({ type: 'success', message: 'Laporan produksi susu berhasil diperbarui!' });
        setEditingProd(null);
        fetchData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal memperbarui data.';
      setToast({ type: 'error', message: msg });
    }
  };

  const handleDelete = async () => {
    if (!deletingProd) return;
    try {
      const res = await api.delete(`/farm/production/${deletingProd.id}`);
      if (res.data.success) {
        setToast({ type: 'success', message: 'Data riwayat produksi berhasil dihapus.' });
        setDeletingProd(null);
        fetchData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menghapus data.';
      setToast({ type: 'error', message: msg });
    }
  };

  // Search & Filter
  const filteredProductions = productions.filter((p) => {
    const q = searchQuery.toLowerCase();
    const catName = (p.category?.name || '').toLowerCase();
    const notes = (p.notes || '').toLowerCase();
    const creator = (p.createdBy?.name || '').toLowerCase();
    return catName.includes(q) || notes.includes(q) || creator.includes(q);
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredProductions.length / itemsPerPage) || 1;
  const paginatedData = filteredProductions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-8 pb-12">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header Section */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold mb-2">
          <History className="w-4 h-4" />
          <span>POV Admin Farm Produksi</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900">Riwayat Produksi Susu Sapi</h1>
        <p className="text-xs text-slate-500 font-medium">Tabel riwayat pencatatan hasil perah susu sapi harian lengkap dengan status dan filter.</p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari catatan atau petugas..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <input
            type="date"
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
          />

          {(filterDate || searchQuery) && (
            <button
              onClick={() => {
                setFilterDate('');
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Production History Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>Riwayat Laporan Perah Susu Sapi ({filteredProductions.length} Entry)</span>
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center"><LoadingSpinner text="Memuat riwayat produksi..." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Tanggal Produksi</th>
                  <th className="py-3.5 px-4">Produk</th>
                  <th className="py-3.5 px-4">Produksi susu (Gross)</th>
                  <th className="py-3.5 px-4">Potongan (Pedet & Afkir)</th>
                  <th className="py-3.5 px-4">Susu siap olah</th>
                  <th className="py-3.5 px-4">Catatan</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedData.length > 0 ? (
                  paginatedData.map((p) => {
                    const grossL = p.grossVolumeLiters > 0 ? p.grossVolumeLiters : p.rawVolumeLiters;
                    const pedetL = p.pedetVolumeLiters || 0;
                    const afkirL = p.afkirVolumeLiters || 0;
                    const totalPotong = pedetL + afkirL;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                          {new Date(p.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-slate-900">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold text-[10px] inline-flex items-center gap-1">
                            🐄 Susu Sapi
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-700">{grossL} Liter</td>
                        <td className="py-3.5 px-4">
                          {totalPotong > 0 ? (
                            <div className="flex flex-col gap-1 text-[11px] font-mono font-bold">
                              {pedetL > 0 && (
                                <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 w-max">
                                  Pedet: -{pedetL} L
                                </span>
                              )}
                              {afkirL > 0 && (
                                <span className="text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 w-max">
                                  Afkir: -{afkirL} L
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 font-mono text-[11px]">- (Utuh)</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-black text-emerald-800 text-sm bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            {p.rawVolumeLiters} Liter
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">{p.notes || '-'}</td>
                        <td className="py-3.5 px-4 text-center space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedProd(p)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                          >
                            Detail
                          </button>
                          {canManage && (
                            <>
                              <button
                                onClick={() => openEditModal(p)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeletingProd(p)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-400">Belum ada riwayat produksi susu yang sesuai.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION CONTROLS */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>Menampilkan halaman {currentPage} dari {totalPages} ({filteredProductions.length} Total)</span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 bg-slate-100 rounded-xl font-extrabold">{currentPage}</span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedProd && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Milk className="w-5 h-5 text-emerald-600" />
                <span>Detail Riwayat Produksi</span>
              </h3>
              <button onClick={() => setSelectedProd(null)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="font-semibold text-slate-500">Tanggal:</span>
                <span className="font-extrabold text-slate-900">
                  {new Date(selectedProd.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="font-semibold text-slate-500">Jenis Produk:</span>
                <span className="font-extrabold text-slate-900">
                  🐄 Susu Sapi
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="font-semibold text-slate-500">Produksi susu (Gross):</span>
                <span className="font-bold text-slate-800">{selectedProd.grossVolumeLiters > 0 ? selectedProd.grossVolumeLiters : selectedProd.rawVolumeLiters} Liter</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="font-semibold text-amber-800">Susu Pedet:</span>
                <span className="font-bold text-amber-900">-{selectedProd.pedetVolumeLiters || 0} Liter</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="font-semibold text-rose-800">Susu Afkir / Rusak:</span>
                <span className="font-bold text-rose-900">-{selectedProd.afkirVolumeLiters || 0} Liter</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                <span className="font-bold text-emerald-900">Susu siap olah:</span>
                <span className="font-black text-emerald-700 text-sm">{selectedProd.rawVolumeLiters} Liter</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="font-semibold text-slate-500">Status:</span>
                <span className="font-bold text-emerald-600">Selesai (Tercatat)</span>
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

      {/* EDIT MODAL */}
      {editingProd && (() => {
        const calculatedGross = parseFloat(formGrossLiters) || 0;
        const calculatedPedet = parseFloat(formPedetLiters) || 0;
        const calculatedAfkir = parseFloat(formAfkirLiters) || 0;
        const calculatedTotalUsage = calculatedPedet + calculatedAfkir;
        const calculatedNet = Math.max(0, calculatedGross - calculatedTotalUsage);

        return (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-blue-600" />
                  <span>Edit Riwayat Produksi Susu Sapi</span>
                </h3>
                <button onClick={() => setEditingProd(null)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Produksi susu (Liter)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formGrossLiters}
                    onChange={(e) => setFormGrossLiters(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-amber-800 mb-1">Susu Pedet (Liter)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="Contoh: 10"
                      value={formPedetLiters}
                      onChange={(e) => setFormPedetLiters(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-amber-50/50 text-xs font-bold text-amber-900 focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-rose-800 mb-1">Susu Afkir / Rusak (L)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="Contoh: 5"
                      value={formAfkirLiters}
                      onChange={(e) => setFormAfkirLiters(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-rose-300 bg-rose-50/50 text-xs font-bold text-rose-900 focus:ring-2 focus:ring-rose-500 outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Live Preview Box */}
                <div className="bg-[#F5F5F0] border border-slate-200 rounded-2xl p-3 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>Produksi susu (Gross):</span>
                    <span className="font-bold">{calculatedGross} Liter</span>
                  </div>
                  {calculatedPedet > 0 && (
                    <div className="flex justify-between text-amber-800">
                      <span>Susu Pakan (Pedet):</span>
                      <span className="font-bold">-{calculatedPedet} Liter</span>
                    </div>
                  )}
                  {calculatedAfkir > 0 && (
                    <div className="flex justify-between text-rose-800">
                      <span>Susu Afkir / Rusak:</span>
                      <span className="font-bold">-{calculatedAfkir} Liter</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1.5 border-t border-slate-300 text-slate-900 font-sans">
                    <span className="font-extrabold text-emerald-900">Susu siap olah:</span>
                    <span className="font-black text-emerald-700 text-sm font-mono">{calculatedNet} Liter</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Catatan</label>
                  <textarea
                    rows="2"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingProd(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1E3F20] text-white rounded-xl text-xs font-bold hover:bg-[#16331a] shadow"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!deletingProd}
        title="Konfirmasi Hapus Laporan Produksi"
        message="Apakah Anda yakin ingin menghapus data laporan produksi ini?"
        confirmText="Ya, Hapus Laporan"
        onConfirm={handleDelete}
        onCancel={() => setDeletingProd(null)}
      />
    </div>
  );
}
