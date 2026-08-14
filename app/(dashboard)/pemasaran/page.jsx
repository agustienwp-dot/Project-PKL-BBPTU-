'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';
import { 
  ShoppingBag, 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar, 
  Filter, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  TrendingDown,
  Boxes,
  Milk,
  Coffee
} from 'lucide-react';

export default function PemasaranPage() {
  const { user, isAdminPemasaran } = useAuth();
  const searchParams = useSearchParams();
  const initialType = searchParams.get('productType') || 'SEGAR';

  const [loading, setLoading] = useState(true);
  const [productType, setProductType] = useState(initialType); // SEGAR or OLAHAN
  const [stockOverview, setStockOverview] = useState({ totalReadyStock: 0, packagingTotals: {}, categories: [] });
  const [outflows, setOutflows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [toast, setToast] = useState(null);

  // Filters
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Form Modal State (Add / Edit Outflow)
  const [showModal, setShowModal] = useState(false);
  const [editingOutflow, setEditingOutflow] = useState(null);
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formPackagingType, setFormPackagingType] = useState('botol');
  const [formQuantity, setFormQuantity] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Delete State
  const [deletingOutflow, setDeletingOutflow] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      let outflowUrl = `/pemasaran/outflow?productType=${productType}&`;
      if (filterCategory) outflowUrl += `categoryId=${filterCategory}&`;
      if (filterDate) outflowUrl += `date=${filterDate}&`;

      const [sRes, oRes, cRes] = await Promise.all([
        api.get(`/pemasaran/stock?productType=${productType}`),
        api.get(outflowUrl),
        api.get(`/categories?productType=${productType}`),
      ]);

      if (sRes.data.success) setStockOverview(sRes.data.data);
      if (oRes.data.success) setOutflows(oRes.data.data);
      if (cRes.data.success) {
        setCategories(cRes.data.data);
        if (cRes.data.data.length > 0) {
          setFormCategoryId(cRes.data.data[0].id);
          setFormPackagingType(cRes.data.data[0].defaultPackaging || 'botol');
        }
      }
    } catch (err) {
      console.error('Error fetching pemasaran data:', err);
      setToast({ type: 'error', message: 'Gagal memuat data stok dan pengeluaran produk.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlType = searchParams.get('productType');
    if (urlType && urlType !== productType) {
      setProductType(urlType);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchData();
  }, [productType, filterCategory, filterDate]);

  const canManage = user?.role === 'ADMIN_PEMASARAN' || user?.role === 'SUPERADMIN';

  useEffect(() => {
    const actionParam = searchParams.get('action');
    if (actionParam === 'outflow' && canManage) {
      openAddModal();
    }
  }, [searchParams, canManage]);

  const openAddModal = () => {
    setEditingOutflow(null);
    setFormDate(new Date().toISOString().split('T')[0]);
    if (categories.length > 0) {
      setFormCategoryId(categories[0].id);
      setFormPackagingType(categories[0].defaultPackaging || 'botol');
    }
    setFormQuantity('');
    setFormNotes('');
    setShowModal(true);
  };

  const openEditModal = (o) => {
    setEditingOutflow(o);
    setFormDate(new Date(o.date).toISOString().split('T')[0]);
    setFormCategoryId(o.categoryId);
    setFormPackagingType(o.packagingType || 'botol');
    setFormQuantity(o.quantity.toString());
    setFormNotes(o.notes || '');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingOutflow) {
        const res = await api.put(`/pemasaran/outflow/${editingOutflow.id}`, {
          date: formDate,
          categoryId: formCategoryId,
          productType,
          packagingType: formPackagingType,
          quantity: formQuantity,
          notes: formNotes,
        });

        if (res.data.success) {
          setToast({ type: 'success', message: 'Data pengeluaran produk berhasil diperbarui!' });
          setShowModal(false);
          fetchData();
        }
      } else {
        const res = await api.post('/pemasaran/outflow', {
          date: formDate,
          categoryId: formCategoryId,
          productType,
          packagingType: formPackagingType,
          quantity: formQuantity,
          notes: formNotes,
        });

        if (res.data.success) {
          setToast({ type: 'success', message: 'Produk keluar berhasil dicatat & stok otomatis berkurang!' });
          setShowModal(false);
          fetchData();
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menyimpan pengeluaran produk.';
      setToast({ type: 'error', message: msg });
    }
  };

  const handleDelete = async () => {
    if (!deletingOutflow) return;
    try {
      const res = await api.delete(`/pemasaran/outflow/${deletingOutflow.id}`);
      if (res.data.success) {
        setToast({ type: 'success', message: 'Data pengeluaran produk berhasil dihapus.' });
        setDeletingOutflow(null);
        fetchData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menghapus data pengeluaran.';
      setToast({ type: 'error', message: msg });
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold mb-2">
            <ShoppingBag className="w-4 h-4" />
            <span>{canManage ? 'POV Admin Pemasaran' : 'Informasi Stok Pemasaran (Read Only)'}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Manajemen Stok & Pengeluaran {productType === 'SEGAR' ? 'Susu Segar' : 'Susu Olahan'}
          </h1>
          <p className="text-xs text-slate-500 font-medium">Pantau ketersediaan stok ready dan catat pengeluaran produk terjual secara real-time.</p>
        </div>

        {canManage && (
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Input Produk Keluar ({productType})</span>
          </button>
        )}
      </div>

      {/* Product Type Switcher Tab */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm w-fit">
        <button
          onClick={() => { setProductType('SEGAR'); setFilterCategory(''); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            productType === 'SEGAR' ? 'bg-[#1E3F20] text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Milk className="w-4 h-4" />
          <span>Susu Segar Murni</span>
        </button>
        <button
          onClick={() => { setProductType('OLAHAN'); setFilterCategory(''); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            productType === 'OLAHAN' ? 'bg-amber-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Coffee className="w-4 h-4" />
          <span>Susu Olahan (Cup, Pack, Botol)</span>
        </button>
      </div>

      {/* Stock Cards Overview */}
      <div className="space-y-3">
        <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Boxes className="w-4 h-4 text-emerald-600" />
          <span>Kondisi Stok Ready {productType === 'SEGAR' ? 'Susu Segar' : 'Susu Olahan'}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-[#1E3F20] to-[#102613] text-white p-5 rounded-3xl shadow-md space-y-2">
            <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider block">Total Stok Ready</span>
            <p className="text-3xl font-black">{stockOverview.totalReadyStock.toLocaleString()} <span className="text-xs font-normal text-emerald-200">pcs/botol</span></p>
            <p className="text-[10px] text-emerald-300">Siap dipasarkan</p>
          </div>

          {productType === 'OLAHAN' ? (
            <>
              <div className="bg-amber-50 border border-amber-200 p-5 rounded-3xl space-y-2">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">Stok Ready Kemasan CUP</span>
                <p className="text-3xl font-black text-amber-700">{(stockOverview.packagingTotals?.cup || 0).toLocaleString()} <span className="text-xs font-bold text-amber-900">cup</span></p>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-5 rounded-3xl space-y-2">
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block">Stok Ready Kemasan PACK</span>
                <p className="text-3xl font-black text-blue-700">{(stockOverview.packagingTotals?.pack || 0).toLocaleString()} <span className="text-xs font-bold text-blue-900">pack</span></p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-3xl space-y-2">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">Stok Ready Kemasan BOTOL</span>
                <p className="text-3xl font-black text-emerald-700">{(stockOverview.packagingTotals?.botol || 0).toLocaleString()} <span className="text-xs font-bold text-emerald-900">botol</span></p>
              </div>
            </>
          ) : (
            stockOverview.categories.map((c) => (
              <div key={c.category.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">{c.category.name}</span>
                <p className="text-2xl font-black text-emerald-700">{c.readyStock.toLocaleString()} <span className="text-xs font-bold text-slate-500">{c.defaultPackaging}</span></p>
                <div className="flex justify-between text-[11px] text-slate-400 font-semibold pt-1 border-t border-slate-100">
                  <span>Masuk: {c.totalProduced}</span>
                  <span>Keluar: {c.totalOutflow}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Filter Pengeluaran:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Semua Varian Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
          />

          {(filterCategory || filterDate) && (
            <button
              onClick={() => { setFilterCategory(''); setFilterDate(''); }}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Outflow History Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-rose-500" />
            <span>Tabel Riwayat Produk Keluar {productType === 'SEGAR' ? 'Susu Segar' : 'Susu Olahan'} ({outflows.length} Transaksi)</span>
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center"><LoadingSpinner text="Memuat riwayat pengeluaran..." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Tanggal Pengeluaran</th>
                  <th className="py-3.5 px-4">Kategori / Rasa</th>
                  <th className="py-3.5 px-4">Kemasan</th>
                  <th className="py-3.5 px-4">Jumlah Keluar</th>
                  <th className="py-3.5 px-4">Petugas Input</th>
                  <th className="py-3.5 px-4">Catatan / Tujuan</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {outflows.length > 0 ? (
                  outflows.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {new Date(o.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {o.category?.name || 'Susu'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                          o.packagingType === 'cup' ? 'bg-amber-100 text-amber-900' :
                          o.packagingType === 'pack' ? 'bg-blue-100 text-blue-900' : 'bg-emerald-100 text-emerald-900'
                        }`}>
                          {o.packagingType || 'botol'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-black text-rose-600">
                        - {o.quantity} {o.packagingType || 'botol'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{o.createdBy?.name || 'Admin Pemasaran'}</td>
                      <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">{o.notes || '-'}</td>
                      <td className="py-3.5 px-4 text-center space-x-2">
                        {canManage ? (
                          <>
                            <button
                              onClick={() => openEditModal(o)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Pengeluaran"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingOutflow(o)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Hapus Pengeluaran"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <span className="text-slate-400 font-semibold text-[10px]">Read Only</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-400">Belum ada riwayat pengeluaran untuk {productType === 'SEGAR' ? 'Susu Segar' : 'Susu Olahan'}.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FORM MODAL INPUT / EDIT OUTFLOW */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                <span>{editingOutflow ? 'Edit Data Produk Keluar' : `Input Produk Keluar (${productType})`}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Pengeluaran</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Varian Kategori Produk</label>
                <select
                  value={formCategoryId}
                  onChange={(e) => {
                    setFormCategoryId(e.target.value);
                    const selected = categories.find(c => c.id === e.target.value);
                    if (selected) setFormPackagingType(selected.defaultPackaging || 'botol');
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kemasan Produk</label>
                <select
                  value={formPackagingType}
                  onChange={(e) => setFormPackagingType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="botol">Botol</option>
                  <option value="cup">Cup</option>
                  <option value="pack">Pack / Bantal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Jumlah Keluar ({formPackagingType})</label>
                <input
                  type="number"
                  placeholder="Contoh: 150"
                  value={formQuantity}
                  onChange={(e) => setFormQuantity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Validasi otomatis: Tidak bisa mengeluarkan melebihi stok yang ready per kemasan.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan / Tujuan Pengeluaran</label>
                <textarea
                  rows="2"
                  placeholder="Contoh: Penjualan ke agen..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow"
                >
                  {editingOutflow ? 'Simpan Perubahan' : 'Simpan Produk Keluar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!deletingOutflow}
        title="Konfirmasi Hapus Pengeluaran"
        message="Apakah Anda yakin ingin menghapus data pengeluaran produk ini? Jumlah stok ready akan bertambah kembali secara otomatis."
        confirmText="Ya, Hapus Data"
        onConfirm={handleDelete}
        onCancel={() => setDeletingOutflow(null)}
      />
    </div>
  );
}
