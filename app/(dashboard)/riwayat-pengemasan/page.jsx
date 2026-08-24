'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';
import { 
  ClipboardList, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  ChevronLeft,
  ChevronRight,
  Package,
  FileSpreadsheet,
  Plus,
  Send,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function RiwayatPengemasanPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [packagings, setPackagings] = useState([]);
  const [toast, setToast] = useState(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Detail Modal & Action State
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [sendingPkg, setSendingPkg] = useState(null);

  // Edit Modal State
  const [editingPkg, setEditingPkg] = useState(null);
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formProductCategory, setFormProductCategory] = useState('Susu');
  const [formProductSubtype, setFormProductSubtype] = useState('Susu UHT');
  const [formOrigin, setFormOrigin] = useState('Sapi');
  const [formVariant, setFormVariant] = useState('Original');
  const [formProcessedAmount, setFormProcessedAmount] = useState('');
  const [formPackagingItems, setFormPackagingItems] = useState([]);
  const [formNotes, setFormNotes] = useState('');

  // Delete State
  const [deletingPkg, setDeletingPkg] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = '/farm/packaging?';
      if (filterCategory) url += `productCategory=${filterCategory}&`;
      if (filterStatus) url += `status=${filterStatus}&`;
      if (filterDate) url += `date=${filterDate}&`;

      const res = await api.get(url);
      if (res.data.success) {
        setPackagings(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching packaging history:', err);
      setToast({ type: 'error', message: 'Gagal memuat riwayat pengemasan.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterCategory, filterStatus, filterDate]);

  const canManage = user?.role === 'ADMIN_FARM' || user?.role === 'SUPERADMIN';

  const computedTotalPcs = formPackagingItems.reduce((acc, item) => {
    const qty = parseInt(item.quantity, 10) || 0;
    return acc + Math.max(0, qty);
  }, 0);

  const openEditModal = (p) => {
    if ((p.status === 'MENUNGGU_PENERIMAAN' || p.status === 'DITERIMA') && user?.role !== 'SUPERADMIN') {
      setToast({ type: 'error', message: 'Data yang sudah dikirim atau diterima tidak dapat diubah.' });
      return;
    }

    setEditingPkg(p);
    setFormDate(new Date(p.date).toISOString().split('T')[0]);
    setFormProductCategory(p.productCategory || 'Susu');
    setFormProductSubtype(p.productSubtype || 'Susu UHT');
    setFormOrigin(p.origin || (p.animalType === 'KAMBING' ? 'Kambing' : 'Sapi'));
    setFormVariant(p.variant || 'Original');
    setFormProcessedAmount((p.processedAmount || p.processedLiters || 0).toString());
    setFormNotes(p.notes || '');

    let items = [];
    if (p.packagingDetails) {
      try {
        const parsed = JSON.parse(p.packagingDetails);
        if (Array.isArray(parsed) && parsed.length > 0) {
          items = parsed.map((item, idx) => ({
            id: Date.now() + idx,
            packagingType: item.packagingType || 'Botol',
            size: item.size || '250 ml',
            quantity: (item.quantity || 0).toString(),
          }));
        }
      } catch (e) {
        console.error('Error parsing packagingDetails:', e);
      }
    }

    if (items.length === 0) {
      if (p.botolQty > 0) items.push({ id: Date.now() + 1, packagingType: 'Botol', size: '250 ml', quantity: p.botolQty.toString() });
      if (p.cupQty > 0) items.push({ id: Date.now() + 2, packagingType: 'Cup', size: '100 ml', quantity: p.cupQty.toString() });
      if (p.plastikBantalQty > 0) items.push({ id: Date.now() + 3, packagingType: 'Plastik Bantal', size: '200 ml', quantity: p.plastikBantalQty.toString() });
    }

    if (items.length === 0) {
      items.push({ id: Date.now(), packagingType: 'Botol', size: '250 ml', quantity: (p.totalPackagedQty || 0).toString() });
    }

    setFormPackagingItems(items);
  };

  const handleAddPackagingItem = () => {
    const isSolid = formProductCategory === 'Keju';
    const defaultSize = isSolid ? '100 gram' : '250 ml';
    setFormPackagingItems(prev => [
      ...prev,
      { id: Date.now(), packagingType: 'Botol', size: defaultSize, quantity: '' }
    ]);
  };

  const handleRemovePackagingItem = (id) => {
    if (formPackagingItems.length <= 1) return;
    setFormPackagingItems(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdatePackagingItem = (id, field, value) => {
    setFormPackagingItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(formProcessedAmount) || 0;
    if (amount < 0) {
      setToast({ type: 'error', message: 'Jumlah bahan diproses tidak boleh bernilai negatif' });
      return;
    }

    const validItems = formPackagingItems.map(i => ({
      packagingType: i.packagingType || 'Botol',
      size: i.size || '',
      quantity: parseInt(i.quantity, 10) || 0,
    }));

    const totalQty = validItems.reduce((acc, curr) => acc + curr.quantity, 0);
    if (totalQty <= 0) {
      setToast({ type: 'error', message: 'Harap masukkan jumlah produk kemasan yang valid (> 0 pcs)' });
      return;
    }

    const isSolid = formProductCategory === 'Keju';
    const unit = isSolid ? 'Kg' : 'Liter';

    try {
      const res = await api.put(`/farm/packaging/${editingPkg.id}`, {
        date: formDate,
        productCategory: formProductCategory,
        productSubtype: formProductCategory === 'Susu' ? formProductSubtype : null,
        origin: formOrigin,
        variant: formVariant,
        animalType: formOrigin === 'Kambing' ? 'KAMBING' : 'SAPI',
        processedAmount: amount,
        processedUnit: unit,
        packagingItems: validItems,
        notes: formNotes,
      });

      if (res.data.success) {
        setToast({ type: 'success', message: 'Data pengemasan berhasil diperbarui!' });
        setEditingPkg(null);
        fetchData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal memperbarui data pengemasan.';
      setToast({ type: 'error', message: msg });
    }
  };

  const handleSendToMarketing = async () => {
    if (!sendingPkg) return;
    try {
      const res = await api.put(`/farm/packaging/${sendingPkg.id}`, { action: 'SEND' });
      if (res.data.success) {
        setToast({ type: 'success', message: 'Produk berhasil dikirim ke Admin Pemasaran!' });
        setSendingPkg(null);
        fetchData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal mengirim produk ke Pemasaran.';
      setToast({ type: 'error', message: msg });
    }
  };

  const handleDelete = async () => {
    if (!deletingPkg) return;
    try {
      const res = await api.delete(`/farm/packaging/${deletingPkg.id}`);
      if (res.data.success) {
        setToast({ type: 'success', message: 'Data riwayat pengemasan berhasil dihapus.' });
        setDeletingPkg(null);
        fetchData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menghapus data.';
      setToast({ type: 'error', message: msg });
    }
  };

  // Search & Filter
  const filteredPackagings = packagings.filter((p) => {
    const q = searchQuery.toLowerCase();
    const cat = (p.productCategory || '').toLowerCase();
    const sub = (p.productSubtype || '').toLowerCase();
    const originStr = (p.origin || p.animalType || '').toLowerCase();
    const varStr = (p.variant || '').toLowerCase();
    const notes = (p.notes || '').toLowerCase();
    const creator = (p.createdBy?.name || '').toLowerCase();
    return cat.includes(q) || sub.includes(q) || originStr.includes(q) || varStr.includes(q) || notes.includes(q) || creator.includes(q);
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredPackagings.length / itemsPerPage) || 1;
  const paginatedData = filteredPackagings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-8 pb-12">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header Section */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold mb-2">
          <ClipboardList className="w-4 h-4" />
          <span>POV Admin Farm Produksi</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900">Riwayat Pengemasan & Pengiriman</h1>
        <p className="text-xs text-slate-500 font-medium">Tabel riwayat pengemasan dan status pengiriman produk ke Admin Pemasaran.</p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari produk, varian, atau catatan..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
          >
            <option value="">Semua Kategori (Susu, Yogurt, Keju)</option>
            <option value="Susu">🥛 Susu</option>
            <option value="Yogurt">🍦 Yogurt</option>
            <option value="Keju">🧀 Keju</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
          >
            <option value="">Semua Status Pengiriman</option>
            <option value="DRAFT">📋 DRAFT</option>
            <option value="MENUNGGU_PENERIMAAN">🟡 Menunggu Penerimaan</option>
            <option value="DITERIMA">🟢 Diterima Pemasaran</option>
            <option value="PERLU_KOREKSI">⚠️ Perlu Koreksi</option>
          </select>

          <input
            type="date"
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
          />

          {(filterCategory || filterStatus || filterDate || searchQuery) && (
            <button
              onClick={() => {
                setFilterCategory('');
                setFilterStatus('');
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

      {/* Packaging Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-600" />
            <span>Tabel Riwayat Pengemasan ({filteredPackagings.length} Entry)</span>
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center"><LoadingSpinner text="Memuat riwayat pengemasan..." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4 whitespace-nowrap">Tanggal</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Produk</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Kategori</th>
                  <th className="py-3.5 px-4 min-w-[160px]">Kemasan & Ukuran</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Jumlah</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Status Transfer</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedData.length > 0 ? (
                  paginatedData.map((p) => {
                    const pCat = p.productCategory || 'Susu';
                    const pSub = p.productSubtype || pCat;
                    const pOri = p.origin || (p.animalType === 'KAMBING' ? 'Kambing' : 'Sapi');
                    const pVar = p.variant || 'Original';

                    let pStatus = p.status;
                    if (!pStatus || pStatus === 'SELESAI') {
                      pStatus = 'DRAFT';
                    }

                    let items = [];
                    if (p.packagingDetails) {
                      try {
                        const parsed = JSON.parse(p.packagingDetails);
                        if (Array.isArray(parsed)) items = parsed;
                      } catch (e) {}
                    }

                    return (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                          {new Date(p.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-extrabold text-slate-900 block">{pSub}</span>
                          <span className="text-[10px] text-slate-500 font-semibold">{pOri} — {pVar}</span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full border font-bold text-[10px] ${
                            pCat === 'Yogurt' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                            pCat === 'Keju' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                            'bg-emerald-100 text-emerald-800 border-emerald-200'
                          }`}>
                            {pCat}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          {items.length > 0 ? (
                            items.map((it, idx) => (
                              <span key={idx} className="block text-slate-700 whitespace-nowrap">
                                {it.packagingType} ({it.size || '-'}) - {it.quantity} pcs
                              </span>
                            ))
                          ) : (
                            <span className="whitespace-nowrap">{p.packagingType || 'Botol'} ({p.totalPackagedQty} pcs)</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 bg-slate-900 text-white rounded-xl font-bold text-xs inline-block whitespace-nowrap">
                            {p.totalPackagedQty} pcs
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {pStatus === 'DRAFT' && (
                            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300 font-bold text-[10px] inline-flex items-center gap-1">
                              📋 DRAFT
                            </span>
                          )}
                          {pStatus === 'MENUNGGU_PENERIMAAN' && (
                            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-extrabold text-[10px] inline-flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Menunggu
                            </span>
                          )}
                          {pStatus === 'DITERIMA' && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold text-[10px] inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Diterima Pemasaran
                            </span>
                          )}
                          {pStatus === 'PERLU_KOREKSI' && (
                            <div className="space-y-1">
                              <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 font-extrabold text-[10px] inline-flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                Perlu Koreksi
                              </span>
                              {p.receptionNotes && (
                                <div className="text-[10px] font-medium text-rose-900 bg-rose-50 border border-rose-200 p-2 rounded-xl max-w-[200px] leading-snug">
                                  <strong className="block font-black text-rose-700 text-[10px]">Catatan Pemasaran:</strong>
                                  "{p.receptionNotes}"
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedPkg(p)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                          >
                            Detail
                          </button>
                          {canManage && (pStatus === 'DRAFT' || pStatus === 'PERLU_KOREKSI') && (
                            <>
                              <button
                                onClick={() => setSendingPkg(p)}
                                className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 shadow-sm"
                                title="Kirim ke Pemasaran"
                              >
                                <Send className="w-3 h-3" />
                                <span>Kirim</span>
                              </button>
                              <button
                                onClick={() => openEditModal(p)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeletingPkg(p)}
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
                    <td colSpan={7} className="py-6 text-center text-slate-400">Belum ada riwayat pengemasan susu yang sesuai.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION CONTROLS */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>Menampilkan halaman {currentPage} dari {totalPages} ({filteredPackagings.length} Total)</span>
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
      {selectedPkg && (() => {
        const pCat = selectedPkg.productCategory || 'Susu';
        const pSub = selectedPkg.productSubtype || pCat;
        const pOri = selectedPkg.origin || (selectedPkg.animalType === 'KAMBING' ? 'Kambing' : 'Sapi');
        const pVar = selectedPkg.variant || 'Original';
        const pAmt = selectedPkg.processedAmount || selectedPkg.processedLiters || 0;
        const pUnit = selectedPkg.processedUnit || (pCat === 'Keju' ? 'Kg' : 'Liter');

        let items = [];
        if (selectedPkg.packagingDetails) {
          try {
            const parsed = JSON.parse(selectedPkg.packagingDetails);
            if (Array.isArray(parsed)) items = parsed;
          } catch (e) {}
        }

        return (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-600" />
                  <span>Detail Riwayat Pengemasan</span>
                </h3>
                <button onClick={() => setSelectedPkg(null)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="font-semibold text-slate-500">Status Transfer:</span>
                  <strong className="text-slate-900 font-black">{selectedPkg.status || 'DRAFT'}</strong>
                </div>

                <div className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="font-semibold text-slate-500">Tanggal Pengemasan:</span>
                  <span className="font-extrabold text-slate-900">
                    {new Date(selectedPkg.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="font-semibold text-slate-500">Kategori / Jenis:</span>
                  <span className="font-extrabold text-slate-900">{pSub} ({pCat})</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="font-semibold text-slate-500">Asal / Varian:</span>
                  <span className="font-extrabold text-slate-900">{pOri} — {pVar}</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="font-semibold text-slate-500">Bahan Diproses:</span>
                  <span className="font-black text-slate-900 text-sm">{pAmt} {pUnit}</span>
                </div>
                
                <div className="p-3 bg-amber-50/60 rounded-2xl space-y-2 border border-amber-200/60">
                  <span className="font-bold text-amber-900 block text-[11px]">Rincian Hasil Kemasan:</span>
                  
                  {items.length > 0 ? (
                    <div className="space-y-1 font-semibold text-slate-700">
                      {items.map((it, idx) => (
                        <div key={idx} className="flex justify-between border-b border-amber-100/60 pb-1">
                          <span>{it.packagingType} ({it.size || '-'})</span>
                          <span className="font-extrabold text-amber-900">{it.quantity} pcs</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1 font-semibold text-slate-700">
                      <span>Total pcs: {selectedPkg.totalPackagedQty}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-extrabold text-slate-900 pt-1.5 border-t border-amber-200">
                    <span>Total Produk Dikirim:</span>
                    <span className="text-amber-800 font-mono text-sm">{selectedPkg.quantitySent || selectedPkg.totalPackagedQty} pcs</span>
                  </div>
                </div>

                {/* AUDIT TRANSFER INFO */}
                {selectedPkg.sentAt && (
                  <div className="p-3 bg-blue-50/60 rounded-xl space-y-1 text-slate-700">
                    <span className="font-bold text-blue-900 block">Riwayat Pengiriman:</span>
                    <div>Dikirim oleh: <strong>{selectedPkg.sentByName || 'Admin Farm'}</strong></div>
                    <div>Waktu kirim: {new Date(selectedPkg.sentAt).toLocaleString('id-ID')}</div>
                  </div>
                )}

                {selectedPkg.receivedAt && (
                  <div className="p-3 bg-emerald-50/60 rounded-xl space-y-1 text-slate-700">
                    <span className="font-bold text-emerald-900 block">Riwayat Penerimaan:</span>
                    <div>Diterima oleh: <strong>{selectedPkg.receivedByName || 'Admin Pemasaran'}</strong></div>
                    <div>Waktu terima: {new Date(selectedPkg.receivedAt).toLocaleString('id-ID')}</div>
                    <div>Jumlah diterima: <strong>{selectedPkg.quantityReceived} pcs</strong></div>
                    <div>Kondisi: <strong>{selectedPkg.condition}</strong></div>
                  </div>
                )}

                {selectedPkg.receptionNotes && (
                  <div className="space-y-1 pt-1">
                    <span className="font-semibold text-rose-600 block">Catatan Pemasaran:</span>
                    <p className="p-3 bg-rose-50 rounded-xl text-rose-900 font-medium border border-rose-200">{selectedPkg.receptionNotes}</p>
                  </div>
                )}
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
        );
      })()}

      {/* EDIT MODAL */}
      {editingPkg && (() => {
        const isSolid = formProductCategory === 'Keju';
        const amountUnit = isSolid ? 'Kg' : 'Liter';
        const sizeOptions = isSolid 
          ? ['50 gram', '100 gram', '250 gram', '500 gram', '1 kg']
          : ['100 ml', '150 ml', '200 ml', '250 ml', '500 ml', '1 Liter'];

        return (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-blue-600" />
                  <span>Edit Riwayat Pengemasan</span>
                </h3>
                <button onClick={() => setEditingPkg(null)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                {editingPkg?.receptionNotes && (
                  <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-2xl space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 font-black text-rose-900">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Alasan Penolakan / Catatan Koreksi Pemasaran:</span>
                    </div>
                    <p className="p-2.5 bg-white rounded-xl text-rose-900 font-extrabold border border-rose-200 text-xs shadow-sm">
                      "{editingPkg.receptionNotes}"
                    </p>
                  </div>
                )}
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
                  <label className="block text-xs font-bold text-slate-800 mb-1">Kategori Produk</label>
                  <select
                    value={formProductCategory}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      setFormProductCategory(newCat);
                      if (newCat === 'Susu') {
                        setFormProductSubtype('Susu UHT');
                        setFormVariant('Original');
                      } else if (newCat === 'Yogurt') {
                        setFormProductSubtype('Yogurt');
                        setFormVariant('Original');
                      } else if (newCat === 'Keju') {
                        setFormProductSubtype('Keju');
                        setFormVariant('Keju Fresh');
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50 focus:ring-2 focus:ring-amber-500 outline-none"
                    required
                  >
                    <option value="Susu">🥛 Susu</option>
                    <option value="Yogurt">🍦 Yogurt</option>
                    <option value="Keju">🧀 Keju</option>
                  </select>
                </div>

                {formProductCategory === 'Susu' && (
                  <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/70 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-emerald-900 mb-1">Jenis Produk Susu</label>
                      <select
                        value={formProductSubtype}
                        onChange={(e) => {
                          const sub = e.target.value;
                          setFormProductSubtype(sub);
                          if (sub === 'Susu Rasa') setFormVariant('Cokelat');
                          else setFormVariant('Original');
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                        required
                      >
                        <option value="Susu UHT">Susu UHT</option>
                        <option value="Susu Pasteurisasi">Susu Pasteurisasi</option>
                        <option value="Susu Rasa">Susu Rasa</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-emerald-900 mb-1">Varian / Rasa</label>
                      {formProductSubtype === 'Susu Rasa' ? (
                        <select
                          value={formVariant}
                          onChange={(e) => setFormVariant(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                          required
                        >
                          <option value="Cokelat">Cokelat</option>
                          <option value="Stroberi">Stroberi</option>
                          <option value="Vanilla">Vanilla</option>
                          <option value="Melon">Melon</option>
                          <option value="Original">Original</option>
                        </select>
                      ) : (
                        <select
                          value={formVariant}
                          onChange={(e) => setFormVariant(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                          required
                        >
                          <option value="Original">Original</option>
                        </select>
                      )}
                    </div>
                  </div>
                )}

                {formProductCategory === 'Yogurt' && (
                  <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200/70 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-purple-900 mb-1">Varian / Rasa Yogurt</label>
                      <select
                        value={formVariant}
                        onChange={(e) => setFormVariant(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-purple-500 outline-none"
                        required
                      >
                        <option value="Original">Original</option>
                        <option value="Strawberry">Strawberry</option>
                        <option value="Mangga">Mangga</option>
                        <option value="Cokelat">Cokelat</option>
                      </select>
                    </div>
                  </div>
                )}

                {formProductCategory === 'Keju' && (
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-amber-900 mb-1">Jenis / Varian Keju</label>
                      <select
                        value={formVariant}
                        onChange={(e) => setFormVariant(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                        required
                      >
                        <option value="Keju Fresh">Keju Fresh</option>
                        <option value="Keju Olahan">Keju Olahan</option>
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jumlah Bahan yang Diproses ({amountUnit})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formProcessedAmount}
                    onChange={(e) => setFormProcessedAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                    required
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-black text-slate-900">
                      Rincian Hasil Kemasan
                    </span>
                    <span className="text-[11px] font-bold text-amber-800">
                      Auto Calculate
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {formPackagingItems.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="col-span-5">
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Jenis Kemasan</label>
                          <select
                            value={item.packagingType}
                            onChange={(e) => handleUpdatePackagingItem(item.id, 'packagingType', e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 outline-none"
                          >
                            <option value="Botol">Botol</option>
                            <option value="Cup">Cup</option>
                            <option value="Plastik Bantal">Plastik Bantal</option>
                            <option value="Plastik Vacuum">Plastik Vacuum</option>
                            <option value="Pouch">Pouch</option>
                          </select>
                        </div>

                        <div className="col-span-4">
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Ukuran</label>
                          <select
                            value={item.size}
                            onChange={(e) => handleUpdatePackagingItem(item.id, 'size', e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 outline-none"
                          >
                            {sizeOptions.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Jumlah</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="pcs"
                            value={item.quantity}
                            onChange={(e) => handleUpdatePackagingItem(item.id, 'quantity', e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 outline-none font-mono"
                            required
                          />
                        </div>

                        <div className="col-span-1 flex justify-center pt-3">
                          <button
                            type="button"
                            onClick={() => handleRemovePackagingItem(item.id)}
                            disabled={formPackagingItems.length <= 1}
                            className="text-rose-500 hover:text-rose-700 disabled:opacity-30 disabled:cursor-not-allowed p-1"
                            title="Hapus kemasan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddPackagingItem}
                    className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 border-dashed rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Tambah Jenis Kemasan</span>
                  </button>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 text-white shadow-sm mt-3">
                    <span className="text-xs font-bold">Total Produk Jadi:</span>
                    <span className="text-sm font-black text-amber-400 font-mono">
                      {computedTotalPcs} pcs
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Catatan</label>
                  <textarea
                    rows="2"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingPkg(null)}
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

      {/* CONFIRMATION DIALOG: KIRIM KE PEMASARAN */}
      {sendingPkg && (
        <ConfirmModal
          isOpen={!!sendingPkg}
          title="Kirim Produk ke Pemasaran?"
          message={`Produk: ${sendingPkg.productSubtype || sendingPkg.productCategory} (${sendingPkg.variant || 'Original'})\nTotal Jumlah: ${sendingPkg.totalPackagedQty} pcs.\n\nSetelah dikirim, data akan masuk ke daftar Penerimaan Produk Admin Pemasaran dan menunggu konfirmasi.`}
          confirmText="Kirim ke Pemasaran"
          onConfirm={handleSendToMarketing}
          onCancel={() => setSendingPkg(null)}
        />
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!deletingPkg}
        title="Konfirmasi Hapus Data Pengemasan"
        message="Apakah Anda yakin ingin menghapus data pengemasan ini?"
        confirmText="Ya, Hapus Pengemasan"
        onConfirm={handleDelete}
        onCancel={() => setDeletingPkg(null)}
      />
    </div>
  );
}
