'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Eye, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  FileSpreadsheet, 
  AlertTriangle, 
  CheckCircle2,
  DollarSign
} from 'lucide-react';

export default function PenjualanPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState([]);
  const [toast, setToast] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form Modal State
  const [showModal, setShowModal] = useState(false);
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formProductCategory, setFormProductCategory] = useState('');
  const [formProductSubtype, setFormProductSubtype] = useState('');
  const [formOrigin, setFormOrigin] = useState('Sapi');
  const [formVariant, setFormVariant] = useState('Original');
  const [formPackagingType, setFormPackagingType] = useState('Botol');
  const [formSize, setFormSize] = useState('250 ml');
  const [formQuantity, setFormQuantity] = useState('');
  const [formUnitPrice, setFormUnitPrice] = useState('15000');
  const [formNotes, setFormNotes] = useState('');

  const getSizeOptions = (pkgType, productSubtype) => {
    if (formProductCategory === 'Susu Olahan' && (formProductSubtype === 'Keju' || productSubtype === 'Keju')) {
      return ['100 gram', '200 gram', '250 gram', '500 gram', '1 kg'];
    }
    const currentPkg = pkgType || formPackagingType;
    if (currentPkg === 'Cup') {
      return ['100 ml', '150 ml', '200 ml', '250 ml'];
    }
    if (currentPkg === 'Plastik Bantal') {
      return ['200 ml', '250 ml', '500 ml'];
    }
    if (currentPkg === 'Plastik Vacuum') {
      return ['100 gram', '200 gram', '250 gram', '500 gram', '1 kg'];
    }
    if (currentPkg === 'Pouch') {
      return ['150 ml', '200 ml', '250 ml', '500 ml', '1 Liter'];
    }
    return ['100 ml', '200 ml', '250 ml', '330 ml', '500 ml', '1 Liter'];
  };

  // Detail Modal & Confirm Submit & Delete State
  const [selectedSale, setSelectedSale] = useState(null);
  const [confirmSubmitModal, setConfirmSubmitModal] = useState(false);
  const [deletingSale, setDeletingSale] = useState(null);

  // Error Alert State for Stock Shortage
  const [stockError, setStockError] = useState(null);

  const fetchSales = async () => {
    setLoading(true);
    try {
      let url = '/pemasaran/sales?';
      if (filterCategory) url += `productCategory=${filterCategory}&`;
      if (filterDate) url += `date=${filterDate}&`;

      const res = await api.get(url);
      if (res.data.success) {
        setSales(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching sales data:', err);
      setToast({ type: 'error', message: 'Gagal memuat data penjualan.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [filterCategory, filterDate]);

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'new') {
      openAddModal();
    }
  }, [searchParams]);

  const canManage = user?.role === 'ADMIN_PEMASARAN' || user?.role === 'SUPERADMIN';

  // Auto-calculated total price
  const computedQuantity = parseInt(formQuantity, 10) || 0;
  const computedUnitPrice = parseFloat(formUnitPrice) || 0;
  const computedTotalPrice = computedQuantity * computedUnitPrice;

  const openAddModal = () => {
    setStockError(null);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormProductCategory('');
    setFormProductSubtype('');
    setFormOrigin('Sapi');
    setFormVariant('Original');
    setFormPackagingType('Botol');
    setFormSize('250 ml');
    setFormQuantity('');
    setFormUnitPrice('15000');
    setFormNotes('');
    setShowModal(true);
  };

  const handleCreateSubmit = async () => {
    setStockError(null);

    if (!formProductCategory || computedQuantity <= 0) {
      setToast({ type: 'error', message: 'Kategori produk dan Jumlah penjualan (> 0) wajib diisi' });
      return;
    }

    if (formProductCategory === 'Susu Olahan' && !formProductSubtype) {
      setToast({ type: 'error', message: 'Pilihan Susu Olahan wajib dipilih' });
      return;
    }

    if (computedUnitPrice < 0) {
      setToast({ type: 'error', message: 'Harga satuan tidak boleh negatif' });
      return;
    }

    try {
      const fullPackagingDisplay = `${formPackagingType} (${formSize})`;
      const res = await api.post('/pemasaran/sales', {
        date: formDate,
        productCategory: formProductCategory,
        productSubtype: formProductCategory === 'Susu Segar' ? 'Susu Segar' : formProductSubtype,
        origin: formOrigin,
        variant: formProductCategory === 'Susu Segar' ? 'Original' : formVariant,
        packagingType: fullPackagingDisplay,
        quantity: computedQuantity,
        unitPrice: computedUnitPrice,
        notes: formNotes,
      });

      if (res.data.success) {
        setToast({ 
          type: 'success', 
          message: 'Penjualan berhasil disimpan dan stok telah diperbarui.' 
        });
        setConfirmSubmitModal(false);
        setShowModal(false);
        fetchSales();
      }
    } catch (err) {
      setConfirmSubmitModal(false);
      const data = err.response?.data;
      if (data && data.readyStock !== undefined) {
        setStockError({
          message: data.message || 'Stok tidak mencukupi untuk melakukan penjualan.',
          readyStock: data.readyStock,
          requestedQty: data.requestedQty || computedQuantity,
          productInfo: data.productInfo || `${formProductSubtype} (${formVariant}) - ${formPackagingType}`,
        });
        setToast({ type: 'error', message: 'Stok tidak mencukupi untuk melakukan penjualan.' });
      } else {
        const msg = data?.message || 'Gagal menyimpan transaksi penjualan.';
        setToast({ type: 'error', message: msg });
      }
    }
  };

  const handleDelete = async () => {
    if (!deletingSale) return;
    try {
      const res = await api.delete(`/pemasaran/sales/${deletingSale.id}`);
      if (res.data.success) {
        setToast({ type: 'success', message: 'Transaksi penjualan berhasil dihapus & stok dikembalikan.' });
        setDeletingSale(null);
        fetchSales();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menghapus transaksi penjualan.';
      setToast({ type: 'error', message: msg });
    }
  };

  // Search & Filter
  const filteredSales = sales.filter((s) => {
    const q = searchQuery.toLowerCase();
    const trx = (s.transactionId || '').toLowerCase();
    const cat = (s.productCategory || '').toLowerCase();
    const sub = (s.productSubtype || '').toLowerCase();
    const varStr = (s.variant || '').toLowerCase();
    const notes = (s.notes || '').toLowerCase();
    return trx.includes(q) || cat.includes(q) || sub.includes(q) || varStr.includes(q) || notes.includes(q);
  });

  // Pagination
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage) || 1;
  const paginatedData = filteredSales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-8 pb-12">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold mb-2">
            <ShoppingCart className="w-4 h-4" />
            <span>POV Admin Pemasaran</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Transaksi Penjualan Produk</h1>
          <p className="text-xs text-slate-500 font-medium">
            Input penjualan, validasi ketersediaan stok produk, dan pembaruan stok otomatis.
          </p>
        </div>

        {canManage && (
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Penjualan</span>
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
              placeholder="Cari ID Transaksi, produk, varian..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Semua Kategori (Susu Segar & Susu Olahan)</option>
            <option value="Susu Segar">🥛 Susu Segar</option>
            <option value="Susu Olahan">🍶 Susu Olahan</option>
          </select>

          <input
            type="date"
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
          />

          {(filterCategory || filterDate || searchQuery) && (
            <button
              onClick={() => {
                setFilterCategory('');
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

      {/* Sales Transactions Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <span>Tabel Riwayat Penjualan ({filteredSales.length} Transaksi)</span>
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center"><LoadingSpinner text="Memuat data penjualan..." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4 whitespace-nowrap">ID Transaksi</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Tanggal</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Produk & Varian</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Kemasan</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Jumlah</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Harga Satuan</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Total</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedData.length > 0 ? (
                  paginatedData.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-mono font-black text-slate-900 whitespace-nowrap">
                        {s.transactionId}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 whitespace-nowrap">
                        {new Date(s.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-extrabold text-slate-900 block">{s.productSubtype || s.productCategory}</span>
                        <span className="text-[10px] text-slate-500 font-semibold">{s.variant || 'Original'}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap">
                        {s.packagingType}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-slate-900 text-white rounded-xl font-bold text-xs inline-block whitespace-nowrap">
                          {s.quantity} pcs
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                        Rp {s.unitPrice.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3.5 px-4 font-black text-emerald-700 whitespace-nowrap">
                        Rp {s.totalPrice.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-black text-[10px] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedSale(s)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Lihat Detail Transaksi"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canManage && (
                          <button
                            onClick={() => setDeletingSale(s)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Transaksi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">Belum ada transaksi penjualan yang diinput.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION CONTROLS */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>Menampilkan halaman {currentPage} dari {totalPages} ({filteredSales.length} Total)</span>
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

      {/* INPUT PENJUALAN FORM MODAL */}
      {showModal && (() => {
        return (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                  <span>Input Transaksi Penjualan baru</span>
                </h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
              </div>

              {/* STOCK SHORTAGE ERROR ALERT */}
              {stockError && (
                <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl space-y-2 text-xs text-rose-900 animate-shake">
                  <div className="flex items-center gap-2 font-black text-rose-800 text-sm">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>Stok Tidak Mencukupi untuk Penjualan!</span>
                  </div>
                  <p className="font-semibold text-slate-700">
                    Produk: <strong>{stockError.productInfo}</strong>
                  </p>
                  <div className="p-3 bg-white rounded-xl border border-rose-200 space-y-1 font-mono text-xs">
                    <div className="flex justify-between text-emerald-800">
                      <span>Stok Tersedia Ready:</span>
                      <strong className="font-black">{stockError.readyStock} pcs</strong>
                    </div>
                    <div className="flex justify-between text-rose-800">
                      <span>Jumlah Yang Diminta:</span>
                      <strong className="font-black">{stockError.requestedQty} pcs</strong>
                    </div>
                  </div>
                  <p className="text-[11px] font-bold text-rose-700">
                    Mohon sesuaikan jumlah penjualan agar tidak melebihi stok yang tersedia.
                  </p>
                </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); setConfirmSubmitModal(true); }} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Penjualan</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Kategori Produk <span className="text-rose-500">*</span></label>
                  <select
                    value={formProductCategory}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      setFormProductCategory(newCat);
                      setStockError(null);
                      if (newCat === 'Susu Segar') {
                        setFormProductSubtype('Susu Segar');
                        setFormVariant('Original');
                      } else if (newCat === 'Susu Olahan') {
                        setFormProductSubtype('Pasteurisasi');
                        setFormVariant('Original');
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  >
                    <option value="" disabled>Pilih kategori produk</option>
                    <option value="Susu Segar">🥛 Susu Segar</option>
                    <option value="Susu Olahan">🍶 Susu Olahan</option>
                  </select>
                </div>

                {/* CONDITIONAL FIELDS FOR SUSU SEGAR */}
                {formProductCategory === 'Susu Segar' && (
                  <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/70 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-emerald-900 mb-1">Asal Susu</label>
                        <select
                          value={formOrigin}
                          onChange={(e) => { setFormOrigin(e.target.value); setStockError(null); }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-slate-900"
                          required
                        >
                          <option value="Sapi">🐄 Sapi</option>
                          <option value="Kambing">🐐 Kambing</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-emerald-900 mb-1">Jenis Kemasan</label>
                        <select
                          value={formPackagingType}
                          onChange={(e) => {
                            const pType = e.target.value;
                            setFormPackagingType(pType);
                            setStockError(null);
                            const opts = getSizeOptions(pType, formProductSubtype);
                            if (!opts.includes(formSize)) setFormSize(opts[0]);
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-slate-900"
                          required
                        >
                          <option value="Botol">Botol</option>
                          <option value="Cup">Cup</option>
                          <option value="Plastik Bantal">Plastik Bantal</option>
                          <option value="Plastik Vacuum">Plastik Vacuum</option>
                          <option value="Pouch">Pouch</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-emerald-900 mb-1">Ukuran Kemasan</label>
                        <select
                          value={formSize}
                          onChange={(e) => { setFormSize(e.target.value); setStockError(null); }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-slate-900"
                          required
                        >
                          {getSizeOptions(formPackagingType, formProductSubtype).map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* CONDITIONAL FIELDS FOR SUSU OLAHAN */}
                {formProductCategory === 'Susu Olahan' && (
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-amber-900 mb-1">
                        Pilihan Susu Olahan <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formProductSubtype}
                        onChange={(e) => {
                          const sub = e.target.value;
                          setFormProductSubtype(sub);
                          setStockError(null);
                          if (sub === 'Susu Rasa') {
                            setFormVariant('Cokelat');
                          } else if (sub === 'Pasteurisasi') {
                            setFormVariant('Original');
                          } else if (sub === 'Yogurt') {
                            setFormVariant('Original');
                          } else if (sub === 'Keju') {
                            setFormVariant('Keju Fresh');
                          }
                          const opts = getSizeOptions(formPackagingType, sub);
                          if (!opts.includes(formSize)) setFormSize(opts[0]);
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                        required
                      >
                        <option value="Pasteurisasi">🥛 Pasteurisasi</option>
                        <option value="Susu Rasa">🧃 Susu Rasa</option>
                        <option value="Yogurt">🍦 Yogurt</option>
                        <option value="Keju">🧀 Keju</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-amber-900 mb-1">Asal Susu</label>
                        <select
                          value={formOrigin}
                          onChange={(e) => { setFormOrigin(e.target.value); setStockError(null); }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none bg-white text-slate-900"
                          required
                        >
                          <option value="Sapi">🐄 Sapi</option>
                          <option value="Kambing">🐐 Kambing</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-amber-900 mb-1">Varian / Rasa</label>
                        {formProductSubtype === 'Yogurt' ? (
                          <select
                            value={formVariant}
                            onChange={(e) => { setFormVariant(e.target.value); setStockError(null); }}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none bg-white text-slate-900"
                          >
                            <option value="Original">Original</option>
                            <option value="Strawberry">Strawberry</option>
                            <option value="Mangga">Mangga</option>
                            <option value="Cokelat">Cokelat</option>
                          </select>
                        ) : formProductSubtype === 'Keju' ? (
                          <select
                            value={formVariant}
                            onChange={(e) => { setFormVariant(e.target.value); setStockError(null); }}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none bg-white text-slate-900"
                          >
                            <option value="Keju Fresh">Keju Fresh</option>
                            <option value="Keju Olahan">Keju Olahan</option>
                          </select>
                        ) : (
                          <select
                            value={formVariant}
                            onChange={(e) => { setFormVariant(e.target.value); setStockError(null); }}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none bg-white text-slate-900"
                          >
                            <option value="Original">Original</option>
                            <option value="Cokelat">Cokelat</option>
                            <option value="Stroberi">Stroberi</option>
                            <option value="Vanilla">Vanilla</option>
                            <option value="Melon">Melon</option>
                          </select>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-amber-900 mb-1">Jenis Kemasan</label>
                        <select
                          value={formPackagingType}
                          onChange={(e) => {
                            const pType = e.target.value;
                            setFormPackagingType(pType);
                            setStockError(null);
                            const opts = getSizeOptions(pType, formProductSubtype);
                            if (!opts.includes(formSize)) setFormSize(opts[0]);
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none bg-white text-slate-900"
                          required
                        >
                          <option value="Botol">Botol</option>
                          <option value="Cup">Cup</option>
                          <option value="Plastik Bantal">Plastik Bantal</option>
                          <option value="Plastik Vacuum">Plastik Vacuum</option>
                          <option value="Pouch">Pouch</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-amber-900 mb-1">Ukuran Kemasan</label>
                        <select
                          value={formSize}
                          onChange={(e) => { setFormSize(e.target.value); setStockError(null); }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none bg-white text-slate-900"
                          required
                        >
                          {getSizeOptions(formPackagingType, formProductSubtype).map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Jumlah Penjualan (pcs)</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Contoh: 10"
                      value={formQuantity}
                      onChange={(e) => { setFormQuantity(e.target.value); setStockError(null); }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 outline-none font-mono focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Harga Satuan (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      placeholder="15000"
                      value={formUnitPrice}
                      onChange={(e) => setFormUnitPrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 outline-none font-mono focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* AUTOMATIC TOTAL CALCULATOR BOX */}
                <div className="p-3.5 rounded-2xl bg-blue-900 text-white shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-blue-200 uppercase font-bold tracking-wider block">Total Harga Penjualan</span>
                    <span className="text-[11px] text-blue-300 font-mono">
                      {computedQuantity} pcs x Rp {computedUnitPrice.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <span className="text-xl font-black text-amber-400 font-mono">
                    Rp {computedTotalPrice.toLocaleString('id-ID')}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Penjualan (Opsional)</label>
                  <textarea
                    rows="2"
                    placeholder="Contoh: Pembelian grosir agen..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow"
                  >
                    Simpan Transaksi
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* CONFIRMATION MODAL BEFORE SAVING SALE */}
      <ConfirmModal
        isOpen={confirmSubmitModal}
        title="Konfirmasi Simpan Penjualan"
        message={`Apakah Anda yakin ingin menyimpan transaksi penjualan ${computedQuantity} pcs ${formProductSubtype} (${formVariant}) dengan total Rp ${computedTotalPrice.toLocaleString('id-ID')}?\n\nSistem akan melakukan pengecekan stok dan menguranginya secara otomatis.`}
        confirmText="Ya, Simpan Transaksi"
        onConfirm={handleCreateSubmit}
        onCancel={() => setConfirmSubmitModal(false)}
      />

      {/* DETAIL SALE MODAL */}
      {selectedSale && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                <span>Detail Transaksi Penjualan</span>
              </h3>
              <button onClick={() => setSelectedSale(null)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-blue-50/60 rounded-2xl space-y-1">
                <span className="text-[10px] text-slate-500 font-bold block">ID Transaksi:</span>
                <span className="font-mono font-black text-blue-900 text-sm block">{selectedSale.transactionId}</span>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-semibold">Tanggal:</span>
                <strong className="text-slate-900">{new Date(selectedSale.date).toLocaleString('id-ID')}</strong>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-semibold">Produk & Varian:</span>
                <strong className="text-slate-900">{selectedSale.productSubtype || selectedSale.productCategory} ({selectedSale.variant || 'Original'})</strong>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-semibold">Kemasan:</span>
                <strong className="text-slate-900">{selectedSale.packagingType}</strong>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-semibold">Jumlah Terjual:</span>
                <strong className="text-slate-900 font-black">{selectedSale.quantity} pcs</strong>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-semibold">Harga Satuan:</span>
                <strong className="text-slate-900">Rp {selectedSale.unitPrice.toLocaleString('id-ID')}</strong>
              </div>

              <div className="flex justify-between p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <span className="text-emerald-900 font-extrabold">Total Pendapatan:</span>
                <span className="text-emerald-900 font-black text-sm">Rp {selectedSale.totalPrice.toLocaleString('id-ID')}</span>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-semibold">Petugas Input:</span>
                <strong className="text-slate-900">{selectedSale.createdBy?.name || 'Admin Pemasaran'}</strong>
              </div>

              {selectedSale.notes && (
                <div className="pt-1">
                  <span className="text-slate-500 font-semibold block mb-0.5">Catatan:</span>
                  <p className="p-2.5 bg-slate-50 rounded-xl text-slate-800 font-medium">{selectedSale.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedSale(null)}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={!!deletingSale}
        title="Konfirmasi Hapus Transaksi Penjualan"
        message={`Apakah Anda yakin ingin menghapus transaksi ${deletingSale?.transactionId}?\nStok produk sejumlah ${deletingSale?.quantity} pcs akan otomatis dikembalikan.`}
        confirmText="Ya, Hapus Transaksi"
        onConfirm={handleDelete}
        onCancel={() => setDeletingSale(null)}
      />
    </div>
  );
}
