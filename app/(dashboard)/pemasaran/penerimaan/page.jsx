'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';
import { 
  PackageCheck, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Send,
  FileSpreadsheet,
  AlertTriangle,
  History
} from 'lucide-react';

export default function PenerimaanProdukPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [packagings, setPackagings] = useState([]);
  const [toast, setToast] = useState(null);

  // Tabs & Search
  const [activeTab, setActiveTab] = useState('PENDING'); // 'PENDING' or 'HISTORY'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Detail & Action Modal State
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [formQtyReceived, setFormQtyReceived] = useState('');
  const [formCondition, setFormCondition] = useState('Sesuai'); // 'Sesuai', 'Ada Selisih', 'Ada Kerusakan'
  const [formReceptionNotes, setFormReceptionNotes] = useState('');

  // Confirmation dialogs
  const [confirmReceiveModal, setConfirmReceiveModal] = useState(false);
  const [confirmRejectModal, setConfirmRejectModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = '/farm/packaging?';
      if (filterCategory) url += `productCategory=${filterCategory}&`;
      if (filterDate) url += `date=${filterDate}&`;

      const res = await api.get(url);
      if (res.data.success) {
        setPackagings(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching reception data:', err);
      setToast({ type: 'error', message: 'Gagal memuat data penerimaan produk.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterCategory, filterDate]);

  const canManage = user?.role === 'ADMIN_PEMASARAN' || user?.role === 'SUPERADMIN';

  // Summary Metrics
  const pendingCount = packagings.filter(p => p.status === 'MENUNGGU_PENERIMAAN').length;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const acceptedTodayQty = packagings
    .filter(p => p.status === 'DITERIMA' && p.receivedAt && new Date(p.receivedAt).toISOString().split('T')[0] === todayStr)
    .reduce((sum, p) => sum + (p.quantityReceived || p.totalPackagedQty || 0), 0);

  const totalAcceptedQty = packagings
    .filter(p => p.status === 'DITERIMA')
    .reduce((sum, p) => sum + (p.quantityReceived || p.totalPackagedQty || 0), 0);

  const openDetailModal = (p) => {
    setSelectedPkg(p);
    setFormQtyReceived((p.quantitySent || p.totalPackagedQty || 0).toString());
    setFormCondition('Sesuai');
    setFormReceptionNotes(p.receptionNotes || '');
  };

  const handleReceiveSubmit = async () => {
    if (!selectedPkg) return;

    const qRec = parseInt(formQtyReceived, 10) || 0;
    const qSent = selectedPkg.quantitySent || selectedPkg.totalPackagedQty || 0;

    if (qRec < 0) {
      setToast({ type: 'error', message: 'Jumlah diterima tidak boleh negatif' });
      return;
    }

    if ((formCondition !== 'Sesuai' || qRec !== qSent) && !formReceptionNotes.trim()) {
      setToast({ type: 'error', message: 'Mohon isi catatan penjelas untuk selisih atau kerusakan produk' });
      return;
    }

    try {
      const res = await api.put(`/farm/packaging/${selectedPkg.id}`, {
        action: 'RECEIVE',
        quantityReceived: qRec,
        condition: formCondition,
        receptionNotes: formReceptionNotes,
      });

      if (res.data.success) {
        setToast({ 
          type: 'success', 
          message: `Produk (${qRec} pcs) berhasil dikonfirmasi & masuk ke Stok Pemasaran!` 
        });
        setConfirmReceiveModal(false);
        setSelectedPkg(null);
        fetchData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal mengonfirmasi penerimaan produk.';
      setToast({ type: 'error', message: msg });
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedPkg) return;

    if (!formReceptionNotes.trim()) {
      setToast({ type: 'error', message: 'Mohon isi catatan alasan permintaan koreksi' });
      return;
    }

    try {
      const res = await api.put(`/farm/packaging/${selectedPkg.id}`, {
        action: 'REQUEST_CORRECTION',
        receptionNotes: formReceptionNotes,
      });

      if (res.data.success) {
        setToast({ 
          type: 'success', 
          message: 'Permintaan koreksi berhasil dikirim kembali ke Admin Farm' 
        });
        setConfirmRejectModal(false);
        setSelectedPkg(null);
        fetchData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal mengirim permintaan koreksi.';
      setToast({ type: 'error', message: msg });
    }
  };

  // Filter List based on Active Tab
  const tabFiltered = packagings.filter(p => {
    if (activeTab === 'PENDING') {
      return p.status === 'MENUNGGU_PENERIMAAN';
    } else {
      return p.status === 'DITERIMA' || p.status === 'PERLU_KOREKSI';
    }
  });

  const finalFiltered = tabFiltered.filter(p => {
    const q = searchQuery.toLowerCase();
    const cat = (p.productCategory || '').toLowerCase();
    const sub = (p.productSubtype || '').toLowerCase();
    const originStr = (p.origin || p.animalType || '').toLowerCase();
    const varStr = (p.variant || '').toLowerCase();
    const notes = (p.notes || '').toLowerCase();
    const sender = (p.sentByName || p.createdBy?.name || '').toLowerCase();
    return cat.includes(q) || sub.includes(q) || originStr.includes(q) || varStr.includes(q) || notes.includes(q) || sender.includes(q);
  });

  return (
    <div className="space-y-8 pb-12">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold mb-2">
            <PackageCheck className="w-4 h-4" />
            <span>POV Admin Pemasaran</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Penerimaan Produk Dari Farm</h1>
          <p className="text-xs text-slate-500 font-medium">
            Verifikasi dan konfirmasi jumlah hasil pengemasan dari Admin Farm sebelum masuk ke Stok Pemasaran.
          </p>
        </div>
      </div>

      {/* Summary Cards Top Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-5 rounded-3xl shadow-md space-y-1">
          <span className="text-[11px] font-bold text-amber-100 uppercase tracking-wider block">Menunggu Penerimaan</span>
          <p className="text-3xl font-black">{pendingCount} <span className="text-xs font-semibold text-amber-100">Pengiriman</span></p>
          <p className="text-[10px] text-amber-200 font-medium">Perlu verifikasi & konfirmasi</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Diterima Hari Ini</span>
          <p className="text-3xl font-black text-emerald-700">{acceptedTodayQty.toLocaleString()} <span className="text-xs font-semibold text-slate-500">pcs</span></p>
          <p className="text-[10px] text-emerald-600 font-bold">Terverifikasi hari ini</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Diterima</span>
          <p className="text-3xl font-black text-slate-900">{totalAcceptedQty.toLocaleString()} <span className="text-xs font-semibold text-slate-500">pcs</span></p>
          <p className="text-[10px] text-slate-500 font-medium">Total akumulasi diterima</p>
        </div>
      </div>

      {/* Tabs & Filter Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          {/* Tab Switcher */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab('PENDING')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'PENDING' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Menunggu Penerimaan</span>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-extrabold text-[10px]">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('HISTORY')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'HISTORY' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <History className="w-4 h-4 text-emerald-600" />
              <span>Riwayat Penerimaan</span>
            </button>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari produk, pengirim, atau varian..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Semua Kategori</option>
              <option value="Susu">🥛 Susu</option>
              <option value="Yogurt">🍦 Yogurt</option>
              <option value="Keju">🧀 Keju</option>
            </select>

            {(filterCategory || filterDate || searchQuery) && (
              <button
                onClick={() => {
                  setFilterCategory('');
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
      </div>

      {/* Reception Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <span>
              {activeTab === 'PENDING' ? 'Daftar Produk Menunggu Penerimaan' : 'Tabel Riwayat Penerimaan'} ({finalFiltered.length} Entry)
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center"><LoadingSpinner text="Memuat data penerimaan..." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4 whitespace-nowrap">Tgl Pengiriman</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Produk & Varian</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Kategori</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Pengirim (Farm)</th>
                  <th className="py-3.5 px-4 min-w-[160px]">Kemasan & Ukuran</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Jumlah Dikirim</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {finalFiltered.length > 0 ? (
                  finalFiltered.map((p) => {
                    const pCat = p.productCategory || 'Susu';
                    const pSub = p.productSubtype || pCat;
                    const pVar = p.variant || 'Original';
                    const qSent = p.quantitySent || p.totalPackagedQty || 0;
                    const qRec = p.quantityReceived || qSent;

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
                          {p.sentAt ? new Date(p.sentAt).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : new Date(p.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-extrabold text-slate-900 block">{pSub}</span>
                          <span className="text-[10px] text-slate-500 font-semibold">{p.origin || 'Sapi'} — {pVar}</span>
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
                        <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap">
                          {p.sentByName || p.createdBy?.name || 'Admin Farm'}
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
                        <td className="py-3.5 px-4 font-extrabold text-slate-900 whitespace-nowrap">
                          <span className="px-2.5 py-1 bg-slate-900 text-white rounded-xl font-bold text-xs inline-block whitespace-nowrap">
                            {qSent} pcs
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {p.status === 'MENUNGGU_PENERIMAAN' && (
                            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-black text-[10px] inline-flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Menunggu
                            </span>
                          )}
                          {p.status === 'DITERIMA' && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-black text-[10px] inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Diterima ({qRec} pcs)
                            </span>
                          )}
                          {p.status === 'PERLU_KOREKSI' && (
                            <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 font-black text-[10px] inline-flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              Perlu Koreksi
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center space-x-1.5 whitespace-nowrap">
                          {p.status === 'MENUNGGU_PENERIMAAN' ? (
                            <button
                              onClick={() => openDetailModal(p)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition-all flex items-center gap-1.5 mx-auto"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Lihat Detail & Konfirmasi</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => openDetailModal(p)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                            >
                              Lihat Detail
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      {activeTab === 'PENDING' 
                        ? 'Tidak ada produk yang sedang menunggu penerimaan saat ini.' 
                        : 'Belum ada riwayat penerimaan produk.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL LIHAT DETAIL & KONFIRMASI PENERIMAAN */}
      {selectedPkg && (() => {
        const pCat = selectedPkg.productCategory || 'Susu';
        const pSub = selectedPkg.productSubtype || pCat;
        const pOri = selectedPkg.origin || (selectedPkg.animalType === 'KAMBING' ? 'Kambing' : 'Sapi');
        const pVar = selectedPkg.variant || 'Original';
        const pAmt = selectedPkg.processedAmount || selectedPkg.processedLiters || 0;
        const pUnit = selectedPkg.processedUnit || (pCat === 'Keju' ? 'Kg' : 'Liter');
        const qSent = selectedPkg.quantitySent || selectedPkg.totalPackagedQty || 0;
        const isPending = selectedPkg.status === 'MENUNGGU_PENERIMAAN';

        let items = [];
        if (selectedPkg.packagingDetails) {
          try {
            const parsed = JSON.parse(selectedPkg.packagingDetails);
            if (Array.isArray(parsed)) items = parsed;
          } catch (e) {}
        }

        const qRecNum = parseInt(formQtyReceived, 10) || 0;
        const hasDiscrepancy = qRecNum !== qSent;

        return (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <PackageCheck className="w-5 h-5 text-blue-600" />
                  <span>{isPending ? 'Konfirmasi Penerimaan Produk' : 'Detail Riwayat Penerimaan'}</span>
                </h3>
                <button onClick={() => setSelectedPkg(null)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
              </div>

              {/* AUDIT INFORMATION HEADER */}
              <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200/60 space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500">Dikirim Oleh:</span>
                  <span className="font-extrabold text-blue-900">{selectedPkg.sentByName || selectedPkg.createdBy?.name || 'Admin Farm'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500">Tanggal Pengiriman:</span>
                  <span className="font-bold text-slate-900">
                    {selectedPkg.sentAt ? new Date(selectedPkg.sentAt).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500">Tanggal Pengemasan:</span>
                  <span className="font-bold text-slate-900">
                    {new Date(selectedPkg.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* DETAIL PRODUK */}
              <div className="space-y-2 text-xs border-b border-slate-100 pb-3">
                <span className="font-black text-slate-900 text-xs block">DETAIL PRODUK</span>
                
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div><span className="text-slate-400">Kategori:</span> <strong className="text-slate-900">{pCat}</strong></div>
                  <div><span className="text-slate-400">Jenis:</span> <strong className="text-slate-900">{pSub}</strong></div>
                  <div><span className="text-slate-400">Asal:</span> <strong className="text-slate-900">{pOri}</strong></div>
                  <div><span className="text-slate-400">Varian:</span> <strong className="text-slate-900">{pVar}</strong></div>
                  <div><span className="text-slate-400">Bahan Diproses:</span> <strong className="text-slate-900">{pAmt} {pUnit}</strong></div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 mt-2">
                  <span className="font-bold text-slate-700 block text-[11px]">Rincian Kemasan & Ukuran:</span>
                  {items.length > 0 ? (
                    items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-[11px] font-mono">
                        <span>{it.packagingType} ({it.size || '-'})</span>
                        <strong className="text-amber-800">{it.quantity} pcs</strong>
                      </div>
                    ))
                  ) : (
                    <div className="flex justify-between font-mono text-[11px]">
                      <span>{selectedPkg.packagingType || 'Botol'}</span>
                      <strong>{selectedPkg.totalPackagedQty} pcs</strong>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1">
                    <span>Jumlah Total Dikirim:</span>
                    <span className="font-black text-blue-700 font-mono text-sm">{qSent} pcs</span>
                  </div>
                </div>
              </div>

              {/* FORM KONFIRMASI PENERIMAAN (FOR PENDING OR READ ONLY FOR HISTORY) */}
              {isPending && canManage ? (
                <div className="space-y-4">
                  <span className="font-black text-slate-900 text-xs block">KONFIRMASI PENERIMAAN</span>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Jumlah Diterima (pcs)</label>
                    <input
                      type="number"
                      min="0"
                      value={formQtyReceived}
                      onChange={(e) => setFormQtyReceived(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 outline-none font-mono focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kondisi Produk</label>
                    <div className="grid grid-cols-3 gap-2">
                      <label className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        formCondition === 'Sesuai' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}>
                        <input
                          type="radio"
                          name="condition"
                          value="Sesuai"
                          checked={formCondition === 'Sesuai'}
                          onChange={(e) => setFormCondition(e.target.value)}
                          className="hidden"
                        />
                        <span>(✓) Sesuai</span>
                      </label>

                      <label className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        formCondition === 'Ada Selisih' ? 'bg-amber-50 border-amber-500 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}>
                        <input
                          type="radio"
                          name="condition"
                          value="Ada Selisih"
                          checked={formCondition === 'Ada Selisih'}
                          onChange={(e) => setFormCondition(e.target.value)}
                          className="hidden"
                        />
                        <span>(⚠️) Selisih</span>
                      </label>

                      <label className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        formCondition === 'Ada Kerusakan' ? 'bg-rose-50 border-rose-500 text-rose-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}>
                        <input
                          type="radio"
                          name="condition"
                          value="Ada Kerusakan"
                          checked={formCondition === 'Ada Kerusakan'}
                          onChange={(e) => setFormCondition(e.target.value)}
                          className="hidden"
                        />
                        <span>(❌) Rusak</span>
                      </label>
                    </div>
                  </div>

                  {(hasDiscrepancy || formCondition !== 'Sesuai') && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Peringatan Selisih / Kerusakan!</span>
                      </div>
                      <p className="text-[11px]">
                        Jumlah dikirim: <strong>{qSent} pcs</strong> | Jumlah diterima: <strong>{qRecNum} pcs</strong>. Catatan penjelasan wajib diisi.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Catatan Penerimaan {hasDiscrepancy || formCondition !== 'Sesuai' ? <span className="text-rose-500">*</span> : '(Opsional)'}
                    </label>
                    <textarea
                      rows="2"
                      placeholder="Catatan penerimaan..."
                      value={formReceptionNotes}
                      onChange={(e) => setFormReceptionNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                    ></textarea>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setConfirmRejectModal(true)}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors"
                    >
                      [Tolak / Minta Koreksi]
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setConfirmReceiveModal(true)}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>[✓ Terima Produk]</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* READ ONLY HISTORY VIEW */
                <div className="space-y-2 text-xs pt-1">
                  <span className="font-black text-slate-900 text-xs block">STATUS PENERIMAAN</span>
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Status:</span>
                      <strong className="text-emerald-700 font-extrabold">{selectedPkg.status}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Jumlah Diterima:</span>
                      <strong className="text-slate-900 font-bold">{selectedPkg.quantityReceived || qSent} pcs</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Kondisi Produk:</span>
                      <strong className="text-slate-900 font-bold">{selectedPkg.condition || 'Sesuai'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Penerima:</span>
                      <strong className="text-slate-900 font-bold">{selectedPkg.receivedByName || 'Admin Pemasaran'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tanggal Diterima:</span>
                      <strong className="text-slate-900 font-bold">
                        {selectedPkg.receivedAt ? new Date(selectedPkg.receivedAt).toLocaleString('id-ID') : '-'}
                      </strong>
                    </div>
                    {selectedPkg.receptionNotes && (
                      <div className="pt-1.5 border-t border-slate-200">
                        <span className="text-slate-500 block font-semibold">Catatan Pemasaran:</span>
                        <p className="text-slate-700 font-medium">{selectedPkg.receptionNotes}</p>
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
              )}
            </div>
          </div>
        );
      })()}

      {/* CONFIRMATION DIALOG: TERIMA PRODUK */}
      <ConfirmModal
        isOpen={confirmReceiveModal}
        title="Konfirmasi Penerimaan Produk"
        message={`Apakah Anda yakin ingin mengonfirmasi penerimaan ${formQtyReceived} pcs produk ini? Setelah dikonfirmasi, produk akan otomatis masuk ke Stok Pemasaran.`}
        confirmText="Ya, Konfirmasi Terima"
        onConfirm={handleReceiveSubmit}
        onCancel={() => setConfirmReceiveModal(false)}
      />

      {/* CONFIRMATION DIALOG: TOLAK / KOREKSI */}
      <ConfirmModal
        isOpen={confirmRejectModal}
        title="Konfirmasi Minta Koreksi ke Farm"
        message="Apakah Anda yakin ingin menolak & meminta Admin Farm melakukan koreksi data produk ini?"
        confirmText="Ya, Minta Koreksi"
        onConfirm={handleRejectSubmit}
        onCancel={() => setConfirmRejectModal(false)}
      />
    </div>
  );
}
