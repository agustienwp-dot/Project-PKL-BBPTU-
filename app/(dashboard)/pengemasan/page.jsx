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
  FileSpreadsheet,
  Search,
  Eye,
  Send,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';

export default function PengemasanPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [packagings, setPackagings] = useState([]);
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Form Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState(1); // 1 = Category Selection, 2 = Form Input
  const [editingPkg, setEditingPkg] = useState(null);
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formProductCategory, setFormProductCategory] = useState('Susu'); // "Susu", "Yogurt", "Keju"
  const [formProductSubtype, setFormProductSubtype] = useState('Susu Pasteurisasi'); // "Susu Pasteurisasi", "Susu Rasa"
  const [formOrigin, setFormOrigin] = useState('Sapi'); // "Sapi", "Kambing"
  const [formVariant, setFormVariant] = useState('Original');
  const [formProcessedAmount, setFormProcessedAmount] = useState('');
  const [formPackagingItems, setFormPackagingItems] = useState([
    { id: 1, packagingType: 'Botol', size: '250 ml', quantity: '' }
  ]);
  const [formNotes, setFormNotes] = useState('');

  // Excel Structure Category Selection ("PENGAMBILAN_SUSU", "HASIL_PENGOLAHAN", "DISTRIBUSI", "SISA_STOK")
  const [selectedMainCategory, setSelectedMainCategory] = useState('HASIL_PENGOLAHAN');

  // Form 1: Pengambilan Susu Segar
  const [farmTegalsari, setFarmTegalsari] = useState('');
  const [farmLimpakuwus, setFarmLimpakuwus] = useState('');
  const [farmManggala, setFarmManggala] = useState('');

  // Form 2: Hasil Pengolahan
  const [susuPasteurisasiPackaging, setSusuPasteurisasiPackaging] = useState('Botol');
  const [susu115, setSusu115] = useState('');
  const [susu130, setSusu130] = useState('');
  const [susu200, setSusu200] = useState('');
  const [susu250, setSusu250] = useState('');
  const [yogurt200, setYogurt200] = useState('');

  // Form 3: Distribusi
  const [distTujuan, setDistTujuan] = useState('SPPG');
  const [distProduk, setDistProduk] = useState('Susu');
  const [distUkuran, setDistUkuran] = useState('250 ml');
  const [distKemasan, setDistKemasan] = useState('Botol');
  const [distJumlah, setDistJumlah] = useState('');

  const [hibahInternalSusu, setHibahInternalSusu] = useState('');
  const [hibahInternalYogurt, setHibahInternalYogurt] = useState('');
  const [hibahEksternalSusu, setHibahEksternalSusu] = useState('');

  const [afkirProduk, setAfkirProduk] = useState('Susu');
  const [afkirUkuran, setAfkirUkuran] = useState('250 ml');
  const [afkirJumlah, setAfkirJumlah] = useState('');
  const [afkirAlasan, setAfkirAlasan] = useState('Produk rusak');

  // Detail Modal & Send Confirmation Modal
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [sendingPkg, setSendingPkg] = useState(null);
  const [deletingPkg, setDeletingPkg] = useState(null);

  // Incoming Milk Receptions & Production Dropdown
  const [incomingProductions, setIncomingProductions] = useState([]);
  const [discrepancyModalItem, setDiscrepancyModalItem] = useState(null);
  const [discrepancyRecLiters, setDiscrepancyRecLiters] = useState('');
  const [discrepancyNotes, setDiscrepancyNotes] = useState('');
  const [previewFoto, setPreviewFoto] = useState(null);

  const [productions, setProductions] = useState([]);
  const [selectedProductionId, setSelectedProductionId] = useState('');

  const fetchIncoming = async () => {
    try {
      const res = await api.get('/farm/production');
      if (res.data?.success) {
        setIncomingProductions(res.data.data.filter(p => (p.rawVolumeLiters || 0) > 0));
      }
    } catch (e) {
      console.error('Error fetching incoming milk productions:', e);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = '/farm/packaging?';
      if (filterCategory) url += `productCategory=${filterCategory}&`;
      if (filterStatus) url += `status=${filterStatus}&`;
      if (filterDate) url += `date=${filterDate}&`;

      const [pkgRes, prodRes] = await Promise.all([
        api.get(url),
        api.get('/farm/production'),
        fetchIncoming(),
      ]);

      if (pkgRes?.data?.success) {
        setPackagings(pkgRes.data.data);
      }
      if (prodRes?.data?.success) {
        setProductions(prodRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching packaging data:', err);
      setToast({ type: 'error', message: 'Gagal memuat data hasil pengemasan.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterCategory, filterStatus, filterDate]);

  const handleAcceptMilk = async (prod) => {
    try {
      const res = await api.put(`/farm/production/${prod.id}/verify`, { action: 'ACCEPT' });
      if (res.data.success) {
        setToast({ type: 'success', message: res.data.message });
        fetchIncoming();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal memverifikasi penerimaan susu.';
      setToast({ type: 'error', message: msg });
    }
  };

  const handleConfirmDiscrepancy = async (e) => {
    e.preventDefault();
    if (!discrepancyModalItem) return;
    try {
      const res = await api.put(`/farm/production/${discrepancyModalItem.id}/verify`, {
        action: 'DISCREPANCY',
        receivedVolumeLiters: discrepancyRecLiters,
        notes: discrepancyNotes,
      });
      if (res.data.success) {
        setToast({ type: 'success', message: res.data.message });
        setDiscrepancyModalItem(null);
        setDiscrepancyRecLiters('');
        setDiscrepancyNotes('');
        fetchIncoming();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal mencatat selisih volume susu.';
      setToast({ type: 'error', message: msg });
    }
  };

  const canManage = user?.role === 'ADMIN_FARM' || user?.role === 'ADMIN_PENGEMASAN' || user?.role === 'SUPERADMIN';

  // Automated total calculation
  const computedTotalPcs = formPackagingItems.reduce((acc, item) => {
    const qty = parseInt(item.quantity, 10) || 0;
    return acc + Math.max(0, qty);
  }, 0);

  const openAddModal = () => {
    setEditingPkg(null);
    setFormDate(new Date().toISOString().split('T')[0]);
    setSelectedProductionId('SUSU_OLAHAN');
    setFormProductCategory('Susu');
    setFormProductSubtype('Susu Pasteurisasi');
    setFormOrigin('Sapi');
    setFormVariant('Original');
    setFormProcessedAmount('');
    setFormPackagingItems([
      { id: Date.now(), packagingType: 'Botol', size: '250 ml', quantity: '' }
    ]);
    setFormNotes('');

    // Reset Excel Structure fields
    setSelectedMainCategory('HASIL_PENGOLAHAN');
    setFarmTegalsari('');
    setFarmLimpakuwus('');
    setFarmManggala('');
    setSusuPasteurisasiPackaging('Botol');
    setSusu115('');
    setSusu130('');
    setSusu200('');
    setSusu250('');
    setYogurt200('');
    setDistTujuan('SPPG');
    setDistProduk('Susu');
    setDistUkuran('250 ml');
    setDistKemasan('Botol');
    setDistJumlah('');
    setHibahInternalSusu('');
    setHibahInternalYogurt('');
    setHibahEksternalSusu('');
    setAfkirProduk('Susu');
    setAfkirUkuran('250 ml');
    setAfkirJumlah('');
    setAfkirAlasan('Produk rusak');

    setModalStep(1); // Step 1: Category Selection
    setShowModal(true);
  };

  const openEditModal = (p) => {
    if (p.status === 'MENUNGGU_PENERIMAAN' && user?.role !== 'SUPERADMIN' && user?.role !== 'ADMIN_PENGEMASAN') {
      setToast({ type: 'error', message: 'Data yang sedang menunggu penerimaan tidak dapat diubah.' });
      return;
    }

    const originVal = p.origin || (p.animalType === 'KAMBING' ? 'Kambing' : 'Sapi');

    setEditingPkg(p);
    setFormDate(new Date(p.date).toISOString().split('T')[0]);
    setSelectedProductionId(p.productionId || 'SUSU_OLAHAN');
    setFormProductCategory(p.productCategory || 'Susu');
    setFormProductSubtype(p.productSubtype === 'Susu UHT' ? 'Susu Pasteurisasi' : (p.productSubtype || 'Susu Pasteurisasi'));
    setFormOrigin(originVal);
    setFormVariant(originVal === 'Kambing' ? '' : (p.variant || 'Original'));
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
    setModalStep(2); // Directly open form for editing
    setShowModal(true);
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

  const handleProductionSelect = (val) => {
    setSelectedProductionId(val);
    if (!val) return;

    if (val === 'SUSU_OLAHAN') {
      setFormProductCategory('Susu');
      setFormProductSubtype('Susu Pasteurisasi');
      setFormOrigin('Sapi');
      setFormVariant('Original');
      return;
    }

    const found = productions.find(p => p.id === val);
    if (found) {
      const typeStr = found.animalType === 'KAMBING' ? 'Kambing' : 'Sapi';
      setFormOrigin(typeStr);
      setFormProductCategory('Susu');
      setFormProductSubtype('Susu Pasteurisasi');
      if (typeStr === 'Kambing') {
        setFormVariant('');
      } else {
        setFormVariant('Original');
      }

      // calculate remaining available milk
      const sisa = Math.max(0, found.rawVolumeLiters - (found.processedLiters || 0));
      if (!formProcessedAmount || parseFloat(formProcessedAmount) > sisa) {
        setFormProcessedAmount(sisa > 0 ? sisa.toString() : '');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const todayStr = new Date().toLocaleDateString('en-CA');
    if (formDate > todayStr) {
      setToast({ type: 'error', message: 'Tanggal pengemasan tidak boleh lebih dari tanggal sekarang' });
      return;
    }

    if (!formProductCategory) {
      setToast({ type: 'error', message: 'Kategori produk wajib dipilih' });
      return;
    }

    const amount = parseFloat(formProcessedAmount) || 0;
    if (amount <= 0) {
      setToast({ type: 'error', message: 'Jumlah liter yang dikemas harus lebih besar dari 0' });
      return;
    }

    // Validation against selected production remaining milk
    if (selectedProductionId && selectedProductionId !== 'SUSU_SEGAR' && selectedProductionId !== 'SUSU_OLAHAN') {
      const foundProd = productions.find(p => p.id === selectedProductionId);
      if (foundProd) {
        const oldAmt = editingPkg ? (editingPkg.processedAmount || editingPkg.processedLiters || 0) : 0;
        const availableSisa = Math.max(0, foundProd.rawVolumeLiters - (foundProd.processedLiters || 0) + (editingPkg?.productionId === selectedProductionId ? oldAmt : 0));
        if (amount > availableSisa) {
          setToast({
            type: 'error',
            message: `Jumlah susu yang akan dikemas (${amount} Liter) melebihi stok susu yang tersedia (${availableSisa} Liter).`
          });
          return;
        }
      }
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

    const targetProductionId = (selectedProductionId === 'SUSU_SEGAR' || selectedProductionId === 'SUSU_OLAHAN')
      ? null
      : selectedProductionId;

    const finalVariant = formOrigin === 'Sapi' ? (formVariant || 'Original') : null;

    const payload = {
      date: formDate,
      productionId: targetProductionId || null,
      productCategory: formProductCategory,
      productSubtype: formProductCategory === 'Susu' ? formProductSubtype : null,
      origin: formOrigin,
      variant: finalVariant,
      animalType: formOrigin === 'Kambing' ? 'KAMBING' : 'SAPI',
      processedAmount: amount,
      processedUnit: unit,
      packagingItems: validItems,
      notes: formNotes,
      status: 'MENUNGGU_PENERIMAAN',
    };

    try {
      if (editingPkg) {
        const res = await api.put(`/farm/packaging/${editingPkg.id}`, payload);
        if (res.data.success) {
          setToast({ type: 'success', message: 'Data pengemasan berhasil diperbarui!' });
          setShowModal(false);
          fetchData();
        }
      } else {
        const res = await api.post('/farm/packaging', payload);
        if (res.data.success) {
          setToast({
            type: 'success',
            message: `Draft pengemasan Susu ${formOrigin} (${totalQty} pcs) berhasil dikirim! Menunggu konfirmasi Admin Pemasaran.`
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
    const cat = (p.productCategory || '').toLowerCase();
    const sub = (p.productSubtype || '').toLowerCase();
    const originStr = (p.origin || p.animalType || '').toLowerCase();
    const varStr = (p.variant || '').toLowerCase();
    const notes = (p.notes || '').toLowerCase();
    const creator = (p.createdBy?.name || '').toLowerCase();
    return cat.includes(q) || sub.includes(q) || originStr.includes(q) || varStr.includes(q) || notes.includes(q) || creator.includes(q);
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
          <h1 className="text-2xl font-black text-slate-900">Pengemasan Produk</h1>
          <p className="text-xs text-slate-500 font-medium">
            {canManage ? 'Input hasil pengemasan, simpan DRAFT, dan kirim ke Admin Pemasaran untuk konfirmasi penerimaan.' : 'Lihat riwayat hasil pengemasan produk.'}
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

      {/* SECTION: PENERIMAAN SUSU MASUK DARI FARM (1-CLICK ACCEPTANCE) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-extrabold mb-1">
              <span>🥛 Penerimaan Susu Mentah dari Seksi Farm</span>
            </div>
            <h2 className="text-lg font-black text-slate-900">Daftar Kiriman Susu Siap Olah</h2>
            <p className="text-xs text-slate-500 font-medium">
              Verifikasi serah-terima fisik susu dari Seksi Farm ke Seksi Pengemasan (1-Click Verification)
            </p>
          </div>
        </div>

        {incomingProductions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <th className="py-3 px-4">Tanggal Kirim</th>
                  <th className="py-3 px-4">Asal Farm</th>
                  <th className="py-3 px-4">Jenis Susu</th>
                  <th className="py-3 px-4">Volume (Liter)</th>
                  <th className="py-3 px-4">Foto Timbangan / Wadah</th>
                  <th className="py-3 px-4">Nomor Segel</th>
                  <th className="py-3 px-4 text-center">Aksi Verifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {incomingProductions.map((p) => {
                  const status = p.handoverStatus || 'MENUNGGU_VERIFIKASI';
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {new Date(p.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        <span className="text-[10px] text-slate-400 font-semibold block">{p.shift === 'Sore' ? '🌇 Sore' : '🌅 Pagi'}</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs">
                          📍 {p.farmOrigin || 'Manggala'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {p.animalType === 'KAMBING' ? (
                          <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200 font-extrabold text-[10px]">
                            🐐 Susu Kambing
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold text-[10px]">
                            🐄 Susu Sapi
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-black text-emerald-800 text-sm bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-mono">
                          +{p.rawVolumeLiters} Liter
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {p.fotoTimbangan ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={p.fotoTimbangan}
                              alt="Thumbnail Timbangan"
                              className="w-9 h-9 rounded-lg object-cover border border-slate-300 cursor-pointer shadow-sm hover:scale-105 transition-transform"
                              onClick={() => setPreviewFoto(p.fotoTimbangan)}
                            />
                            <button
                              type="button"
                              onClick={() => setPreviewFoto(p.fotoTimbangan)}
                              className="text-[11px] font-bold text-emerald-700 hover:underline"
                            >
                              📷 Lihat Foto
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px] italic">Tidak ada foto</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-mono text-xs">
                        {p.nomorSegel ? (
                          <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-bold">{p.nomorSegel}</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {status === 'MENUNGGU_VERIFIKASI' ? (
                          <div className="flex items-center justify-center gap-2">
                            {/* 1 TOMBOL UTAMA: TERIMA ([X] LITER) */}
                            <button
                              type="button"
                              onClick={() => handleAcceptMilk(p)}
                              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow transition-all flex items-center gap-1.5 active:scale-95"
                            >
                              <span>✓ Terima ({p.rawVolumeLiters} Liter)</span>
                            </button>

                            {/* 1 TOMBOL SEKUNDER / LINK: LAPORKAN SELISIH */}
                            <button
                              type="button"
                              onClick={() => {
                                setDiscrepancyModalItem(p);
                                setDiscrepancyRecLiters(p.rawVolumeLiters.toString());
                                setDiscrepancyNotes('');
                              }}
                              className="text-xs font-bold text-amber-700 hover:text-amber-900 underline px-2 py-1"
                            >
                              Laporkan Selisih
                            </button>
                          </div>
                        ) : status === 'DITERIMA' ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-black text-xs inline-flex items-center gap-1">
                            🟢 Diterima {p.receivedVolumeLiters || p.rawVolumeLiters} L
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-black text-xs inline-flex items-center gap-1">
                            🟠 Ada Selisih (Kirim {p.rawVolumeLiters} L, Diterima {p.receivedVolumeLiters} L)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-slate-400 text-xs font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            Belum ada kiriman susu mentah yang perlu diverifikasi dari Farm.
          </div>
        )}
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
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
          >
            <option value="">Semua Kategori (Susu, Yogurt, Keju)</option>
            <option value="Susu">🥛 Susu</option>
            <option value="Yogurt">🍦 Yogurt</option>
            <option value="Keju">🧀 Keju</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
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
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
          />

          {(filterCategory || filterStatus || filterDate || searchQuery) && (
            <button
              onClick={() => {
                setFilterCategory('');
                setFilterStatus('');
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

      {/* Packaging Table */}
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
                  <th className="py-3.5 px-4 whitespace-nowrap">Tanggal</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Produk</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Kategori</th>
                  <th className="py-3.5 px-4 min-w-[160px]">Kemasan & Ukuran</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Jumlah</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredPackagings.length > 0 ? (
                  filteredPackagings.map((p) => {
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
                      } catch (e) { }
                    }

                    return (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                          {new Date(p.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-extrabold text-slate-900 block">{pSub}</span>
                          <span className="text-[10px] text-slate-500 font-semibold">{pOri === 'Kambing' || !pVar ? pOri : `${pOri} — ${pVar}`}</span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full border font-bold text-[10px] ${pCat === 'Yogurt' ? 'bg-purple-100 text-purple-800 border-purple-200' :
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
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {canManage && (pStatus === 'DRAFT' || pStatus === 'PERLU_KOREKSI') && (
                            <>
                              <button
                                onClick={() => setSendingPkg(p)}
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 shadow-sm"
                                title="Kirim ke Pemasaran"
                              >
                                <Send className="w-3 h-3" />
                                <span>Kirim ke Pemasaran</span>
                              </button>
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
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-400">Belum ada data hasil pengemasan yang diinput.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FORM MODAL INPUT / EDIT PENGEMASAN */}
      {showModal && (() => {
        // STEP 1: Main Category Selection Following Excel Structure
        if (modalStep === 1) {
          return (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                      <Package className="w-5 h-5 text-amber-600" />
                      <span>INPUT DATA</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Pilih jenis data yang ingin diinput.
                    </p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 rounded-lg">✕</button>
                </div>

                {/* 4 Main Category Cards */}
                <div className="space-y-3 py-2">
                  {/* Option 1: PENGAMBILAN SUSU SEGAR (Ltr) */}
                  <div
                    onClick={() => {
                      setSelectedMainCategory('PENGAMBILAN_SUSU');
                      setModalStep(2);
                    }}
                    className="group p-4 bg-blue-50/60 hover:bg-blue-100/70 border-2 border-blue-200 hover:border-blue-500 rounded-2xl cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl shadow-md group-hover:scale-105 transition-transform">
                        🥛
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-900 flex items-center gap-2">
                          <span>1. PENGAMBILAN SUSU SEGAR (Ltr)</span>
                        </h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Input jumlah susu segar dari farm Tegalsari, Limpakuwus, & Manggala.
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-md">
                          Satuan: Liter (Ltr)
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform shrink-0" />
                  </div>

                  {/* Option 2: HASIL PENGOLAHAN */}
                  <div
                    onClick={() => {
                      setSelectedMainCategory('HASIL_PENGOLAHAN');
                      setModalStep(2);
                    }}
                    className="group p-4 bg-emerald-50/60 hover:bg-emerald-100/70 border-2 border-emerald-200 hover:border-emerald-500 rounded-2xl cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-md group-hover:scale-105 transition-transform">
                        📦
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-emerald-900 flex items-center gap-2">
                          <span>2. HASIL PENGOLAHAN</span>
                        </h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Input hasil produk susu pasteurisasi & yogurt yang dikemas.
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                          Satuan: Botol / Cup
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-transform shrink-0" />
                  </div>

                  {/* Option 3: DISTRIBUSI */}
                  <div
                    onClick={() => {
                      setSelectedMainCategory('DISTRIBUSI');
                      setModalStep(2);
                    }}
                    className="group p-4 bg-amber-50/60 hover:bg-amber-100/70 border-2 border-amber-200 hover:border-amber-500 rounded-2xl cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-black text-2xl shadow-md group-hover:scale-105 transition-transform">
                        🚚
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-amber-900">
                          3. DISTRIBUSI
                        </h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Penjualan (Eduwisata, SPPG, Lain-lain), hibah, dan produk rusak/afkir.
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md">
                          Satuan: Botol
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-amber-600 group-hover:translate-x-1 transition-transform shrink-0" />
                  </div>

                  {/* Option 4: SISA STOK */}
                  <div
                    onClick={() => {
                      setSelectedMainCategory('SISA_STOK');
                      setModalStep(2);
                    }}
                    className="group p-4 bg-purple-50/60 hover:bg-purple-100/70 border-2 border-purple-200 hover:border-purple-500 rounded-2xl cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-2xl shadow-md group-hover:scale-105 transition-transform">
                        📊
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-purple-900">
                          4. SISA STOK
                        </h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Rekap dan perhitungan sisa stok produk secara otomatis.
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-bold rounded-md">
                          Satuan: Botol
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform shrink-0" />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          );
        }

        // STEP 2: Sub-forms based on selected category

        // --- SUB-FORM 1: PENGAMBILAN SUSU SEGAR (Ltr) ---
        if (selectedMainCategory === 'PENGAMBILAN_SUSU' && !editingPkg) {
          const totalFarmLiters = (parseFloat(farmTegalsari) || 0) + (parseFloat(farmLimpakuwus) || 0) + (parseFloat(farmManggala) || 0);

          const handleSaveFarmMilk = async (e) => {
            if (e && e.preventDefault) e.preventDefault();
            if (totalFarmLiters <= 0) {
              setToast({ type: 'error', message: 'Harap masukkan jumlah pengambilan susu murni (> 0 Ltr).' });
              return;
            }

            setSubmitting(true);
            try {
              const res = await api.post('/farm/production', {
                date: formDate,
                grossVolumeLiters: totalFarmLiters,
                rawVolumeLiters: totalFarmLiters,
                notes: `Pengambilan Susu Segar: Tegalsari=${farmTegalsari || 0}L, Limpakuwus=${farmLimpakuwus || 0}L, Manggala=${farmManggala || 0}L. ${formNotes}`,
              });

              if (res.data.success) {
                setToast({ type: 'success', message: `Pengambilan Susu Segar (${totalFarmLiters} Ltr) berhasil disimpan!` });
                setShowModal(false);
                fetchData();
              }
            } catch (err) {
              const msg = err.response?.data?.message || 'Gagal menyimpan data pengambilan susu segar.';
              setToast({ type: 'error', message: msg });
            } finally {
              setSubmitting(false);
            }
          };

          return (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setModalStep(1)}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Kembali</span>
                    </button>
                    <div>
                      <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                        <span>🥛 INPUT PENGAMBILAN SUSU SEGAR</span>
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">Input jumlah susu segar dari masing-masing farm</p>
                    </div>
                  </div>
                  <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
                </div>

                <form onSubmit={handleSaveFarmMilk} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal</label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
                    <label className="block text-xs font-black text-blue-900 uppercase tracking-wider">FARM:</label>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">1. Farm Tegalsari</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder="0"
                          value={farmTegalsari}
                          onChange={(e) => setFarmTegalsari(e.target.value)}
                          className="w-full pl-3 pr-12 py-2 rounded-xl border border-slate-300 text-xs font-bold font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <span className="absolute right-3 top-2.5 text-xs font-extrabold text-slate-400">Ltr</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">2. Farm Limpakuwus</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder="0"
                          value={farmLimpakuwus}
                          onChange={(e) => setFarmLimpakuwus(e.target.value)}
                          className="w-full pl-3 pr-12 py-2 rounded-xl border border-slate-300 text-xs font-bold font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <span className="absolute right-3 top-2.5 text-xs font-extrabold text-slate-400">Ltr</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">3. Farm Manggala</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder="0"
                          value={farmManggala}
                          onChange={(e) => setFarmManggala(e.target.value)}
                          className="w-full pl-3 pr-12 py-2 rounded-xl border border-slate-300 text-xs font-bold font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <span className="absolute right-3 top-2.5 text-xs font-extrabold text-slate-400">Ltr</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-blue-900 text-white rounded-2xl flex items-center justify-between shadow-md">
                    <span className="text-xs font-bold uppercase tracking-wider">TOTAL PENGAMBILAN SUSU SEGAR:</span>
                    <span className="text-base font-black text-amber-400 font-mono">
                      {totalFarmLiters} Ltr
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
                    <textarea
                      rows="2"
                      placeholder="Catatan..."
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
                      type="button"
                      onClick={handleSaveFarmMilk}
                      disabled={submitting}
                      className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                    >
                      {submitting ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <span>Simpan Data Pengambilan</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          );
        }

        // --- SUB-FORM 2: HASIL PENGOLAHAN ---
        if (selectedMainCategory === 'HASIL_PENGOLAHAN' && !editingPkg) {
          const totalHasilPengolahan = (parseInt(susu115) || 0) + (parseInt(susu130) || 0) + (parseInt(susu200) || 0) + (parseInt(susu250) || 0) + (parseInt(yogurt200) || 0);

          const handleSaveHasilPengolahanExcel = async (e) => {
            if (e && e.preventDefault) e.preventDefault();
            const q115 = parseInt(susu115, 10) || 0;
            const q130 = parseInt(susu130, 10) || 0;
            const q200 = parseInt(susu200, 10) || 0;
            const q250 = parseInt(susu250, 10) || 0;
            const qYogurt = parseInt(yogurt200, 10) || 0;

            if (totalHasilPengolahan <= 0) {
              setToast({ type: 'error', message: 'Harap masukkan minimal 1 produk hasil pengolahan (> 0 pcs).' });
              return;
            }

            const items = [];
            if (q115 > 0) items.push({ productCategory: 'Susu', packagingType: susuPasteurisasiPackaging, size: '115 ml', quantity: q115 });
            if (q130 > 0) items.push({ productCategory: 'Susu', packagingType: susuPasteurisasiPackaging, size: '130 ml', quantity: q130 });
            if (q200 > 0) items.push({ productCategory: 'Susu', packagingType: susuPasteurisasiPackaging, size: '200 ml', quantity: q200 });
            if (q250 > 0) items.push({ productCategory: 'Susu', packagingType: susuPasteurisasiPackaging, size: '250 ml', quantity: q250 });
            if (qYogurt > 0) items.push({ productCategory: 'Yogurt', packagingType: 'Botol', size: '200 ml', quantity: qYogurt });

            const approxLiters = ((q115 * 0.115) + (q130 * 0.13) + (q200 * 0.2) + (q250 * 0.25) + (qYogurt * 0.2));

            setSubmitting(true);
            try {
              const payload = {
                date: formDate,
                productCategory: 'Susu',
                productSubtype: 'Susu Pasteurisasi',
                origin: 'Sapi',
                variant: 'Original',
                processedAmount: approxLiters > 0 ? parseFloat(approxLiters.toFixed(2)) : 1,
                processedUnit: 'Liter',
                packagingItems: items,
                notes: formNotes,
                status: 'MENUNGGU_PENERIMAAN',
              };

              const res = await api.post('/farm/packaging', payload);
              if (res.data.success) {
                setToast({
                  type: 'success',
                  message: `Hasil Pengolahan (${totalHasilPengolahan} pcs) berhasil disimpan & dikirim ke Admin Pemasaran!`
                });
                setShowModal(false);
                fetchData();
              }
            } catch (err) {
              const msg = err.response?.data?.message || 'Gagal menyimpan hasil pengolahan.';
              setToast({ type: 'error', message: msg });
            } finally {
              setSubmitting(false);
            }
          };

          return (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setModalStep(1)}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Kembali</span>
                    </button>
                    <div>
                      <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                        <span>📦 INPUT HASIL PENGOLAHAN</span>
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">Input hasil pengemasan produk sesuai ukuran</p>
                    </div>
                  </div>
                  <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
                </div>

                <form onSubmit={handleSaveHasilPengolahanExcel} className="space-y-4">
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

                  {/* SUSU PASTEURISASI SECTION */}
                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                      <label className="text-xs font-black text-emerald-900 uppercase">SUSU PASTEURISASI</label>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-600">Jenis Kemasan:</span>
                        <select
                          value={susuPasteurisasiPackaging}
                          onChange={(e) => setSusuPasteurisasiPackaging(e.target.value)}
                          className="px-2.5 py-1 rounded-lg border border-emerald-300 text-xs font-bold text-slate-900 bg-white"
                        >
                          <option value="Botol">Botol</option>
                          <option value="Cup">Cup</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Ukuran 115 ml</label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={susu115}
                            onChange={(e) => setSusu115(e.target.value)}
                            className="w-full pl-3 pr-12 py-2 rounded-xl border border-slate-300 text-xs font-bold font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                          <span className="absolute right-3 top-2.5 text-xs font-extrabold text-slate-400">pcs</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Ukuran 130 ml</label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={susu130}
                            onChange={(e) => setSusu130(e.target.value)}
                            className="w-full pl-3 pr-12 py-2 rounded-xl border border-slate-300 text-xs font-bold font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                          <span className="absolute right-3 top-2.5 text-xs font-extrabold text-slate-400">pcs</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Ukuran 200 ml</label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={susu200}
                            onChange={(e) => setSusu200(e.target.value)}
                            className="w-full pl-3 pr-12 py-2 rounded-xl border border-slate-300 text-xs font-bold font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                          <span className="absolute right-3 top-2.5 text-xs font-extrabold text-slate-400">pcs</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Ukuran 250 ml</label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={susu250}
                            onChange={(e) => setSusu250(e.target.value)}
                            className="w-full pl-3 pr-12 py-2 rounded-xl border border-slate-300 text-xs font-bold font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                          <span className="absolute right-3 top-2.5 text-xs font-extrabold text-slate-400">pcs</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* YOGURT SECTION */}
                  <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-purple-900 uppercase">YOGURT UKURAN 200 ML (Botol)</label>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={yogurt200}
                        onChange={(e) => setYogurt200(e.target.value)}
                        className="w-full pl-3 pr-12 py-2 rounded-xl border border-slate-300 text-xs font-bold font-mono focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-extrabold text-slate-400">pcs</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-md">
                    <span className="text-xs font-bold uppercase tracking-wider">TOTAL HASIL PENGOLAHAN (Botol / pcs):</span>
                    <span className="text-base font-black text-amber-400 font-mono">
                      {totalHasilPengolahan} pcs
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Pengolahan (Opsional)</label>
                    <textarea
                      rows="2"
                      placeholder="Catatan..."
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
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
                      type="button"
                      onClick={handleSaveHasilPengolahanExcel}
                      disabled={submitting}
                      className="px-5 py-2 bg-[#1E3F20] hover:bg-[#16331a] text-white rounded-xl text-xs font-bold shadow disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                    >
                      {submitting ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <span>Simpan Hasil Pengolahan</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          );
        }

        // --- SUB-FORM 3: DISTRIBUSI ---
        if (selectedMainCategory === 'DISTRIBUSI' && !editingPkg) {
          const totalHibah = (parseInt(hibahInternalSusu) || 0) + (parseInt(hibahInternalYogurt) || 0) + (parseInt(hibahEksternalSusu) || 0);

          const handleSaveDistribusiExcel = async (e) => {
            if (e && e.preventDefault) e.preventDefault();
            if (submitting) return;

            const saleQty = parseInt(distJumlah, 10) || 0;
            const hIntSusu = parseInt(hibahInternalSusu, 10) || 0;
            const hIntYogurt = parseInt(hibahInternalYogurt, 10) || 0;
            const hEksSusu = parseInt(hibahEksternalSusu, 10) || 0;
            const afkQty = parseInt(afkirJumlah, 10) || 0;

            const totalDist = saleQty + hIntSusu + hIntYogurt + hEksSusu + afkQty;

            if (totalDist <= 0) {
              setToast({ type: 'error', message: 'Harap isi minimal 1 transaksi distribusi (Penjualan, Hibah, atau Rusak/Afkir) > 0.' });
              return;
            }

            setSubmitting(true);

            try {
              const payload = {
                date: formDate,
                target: distTujuan,
                product: distProduk,
                size: distUkuran,
                packagingType: distKemasan,
                quantity: saleQty,
                internalMilk: hIntSusu,
                internalYogurt: hIntYogurt,
                externalMilk: hEksSusu,
                damagedProduct: afkirProduk,
                damagedSize: afkirUkuran,
                damagedQuantity: afkQty,
                damagedReason: afkirAlasan,
                notes: formNotes,
              };

              console.log("SENDING BATCH DISTRIBUSI PAYLOAD:", payload);

              // 1x single batch API request for maximum responsiveness (< 100ms)
              const res = await api.post('/pemasaran/distribusi', payload);

              if (res.data?.success) {
                // Immediate UI feedback and modal close
                setToast({
                  type: 'success',
                  message: res.data.message || `Data Distribusi (${totalDist} botol) berhasil disimpan & stok diperbarui!`,
                });
                setShowModal(false);
                setSubmitting(false);

                // Asynchronous background refresh without blocking user UI
                fetchData().catch((err) => console.error("Background refresh error:", err));
              } else {
                throw new Error(res.data?.message || 'Gagal mencatat distribusi.');
              }
            } catch (err) {
              console.error("SUBMIT DISTRIBUSI ERROR:", err);
              const msg = err.response?.data?.message || err?.message || 'Gagal mencatat distribusi.';
              setToast({ type: 'error', message: msg });
              setSubmitting(false);
            }
          };

          return (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setModalStep(1)}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Kembali</span>
                    </button>
                    <div>
                      <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                        <span>🚚 INPUT DISTRIBUSI</span>
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">Input penjualan, hibah, dan produk rusak/afkir</p>
                    </div>
                  </div>
                  <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
                </div>

                <form onSubmit={handleSaveDistribusiExcel} className="space-y-4">
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

                  {/* A. PENJUALAN SECTION */}
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
                    <label className="block text-xs font-black text-amber-900 uppercase">A. PENJUALAN (Botol / Cup)</label>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Tujuan Distribusi</label>
                        <select
                          value={distTujuan}
                          onChange={(e) => setDistTujuan(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                        >
                          <option value="EDUWISATA">EDUWISATA</option>
                          <option value="SPPG">SPPG</option>
                          <option value="LAIN-LAIN">LAIN-LAIN</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Produk</label>
                        <select
                          value={distProduk}
                          onChange={(e) => {
                            const p = e.target.value;
                            setDistProduk(p);
                            if (p === 'Yogurt') setDistUkuran('200 ml');
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                        >
                          <option value="Susu">Susu Pasteurisasi</option>
                          <option value="Yogurt">Yogurt</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Ukuran</label>
                        <select
                          value={distUkuran}
                          onChange={(e) => setDistUkuran(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                        >
                          {distProduk === 'Susu' ? (
                            <>
                              <option value="115 ml">115 ml</option>
                              <option value="130 ml">130 ml</option>
                              <option value="200 ml">200 ml</option>
                              <option value="250 ml">250 ml</option>
                            </>
                          ) : (
                            <option value="200 ml">200 ml</option>
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Jumlah</label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={distJumlah}
                            onChange={(e) => setDistJumlah(e.target.value)}
                            className="w-full pl-3 pr-14 py-2 rounded-xl border border-slate-300 text-xs font-bold font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                          />
                          <span className="absolute right-3 top-2.5 text-xs font-extrabold text-slate-400">botol</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* B. HIBAH SECTION */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                      <label className="text-xs font-black text-slate-900 uppercase">B. HIBAH (Botol)</label>
                      <span className="text-xs font-bold text-amber-800 font-mono">
                        Total Hibah: {totalHibah} botol
                      </span>
                    </div>

                    <div className="space-y-2">
                      <strong className="block text-[11px] font-bold text-slate-500 uppercase">INTERNAL:</strong>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Internal - Susu</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0 botol"
                            value={hibahInternalSusu}
                            onChange={(e) => setHibahInternalSusu(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Internal - Yogurt</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0 botol"
                            value={hibahInternalYogurt}
                            onChange={(e) => setHibahInternalYogurt(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold font-mono"
                          />
                        </div>
                      </div>

                      <strong className="block text-[11px] font-bold text-slate-500 uppercase pt-1">EKSTERNAL:</strong>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Eksternal - Susu</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="0 botol"
                          value={hibahEksternalSusu}
                          onChange={(e) => setHibahEksternalSusu(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* C. RUSAK / AFKIR SECTION */}
                  <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-3">
                    <label className="block text-xs font-black text-rose-900 uppercase">C. RUSAK / AFKIR (Botol)</label>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Produk Afkir</label>
                        <select
                          value={afkirProduk}
                          onChange={(e) => setAfkirProduk(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold"
                        >
                          <option value="Susu">Susu</option>
                          <option value="Yogurt">Yogurt</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Ukuran Afkir</label>
                        <select
                          value={afkirUkuran}
                          onChange={(e) => setAfkirUkuran(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold"
                        >
                          <option value="115 ml">115 ml</option>
                          <option value="130 ml">130 ml</option>
                          <option value="200 ml">200 ml</option>
                          <option value="250 ml">250 ml</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Jumlah Rusak / Afkir</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="0 botol"
                          value={afkirJumlah}
                          onChange={(e) => setAfkirJumlah(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Alasan Kerusakan</label>
                        <input
                          type="text"
                          placeholder="Alasan..."
                          value={afkirAlasan}
                          onChange={(e) => setAfkirAlasan(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
                    <textarea
                      rows="2"
                      placeholder="Catatan..."
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
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
                      type="button"
                      onClick={handleSaveDistribusiExcel}
                      disabled={submitting}
                      className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                    >
                      {submitting ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <span>Simpan Data Distribusi</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          );
        }

        // --- SUB-FORM 4: SISA STOK ---
        if (selectedMainCategory === 'SISA_STOK' && !editingPkg) {
          // Compute automatic sisa stok representation from packagings & sales
          let botol115Count = 0;
          let botol250Count = 0;
          let yogurtCount = 0;

          packagings.forEach((p) => {
            if (p.status === 'DITERIMA' || p.status === 'MENUNGGU_PENERIMAAN') {
              let items = [];
              if (p.packagingDetails) {
                try {
                  const parsed = JSON.parse(p.packagingDetails);
                  if (Array.isArray(parsed)) items = parsed;
                } catch (e) {}
              }

              if (items.length > 0) {
                items.forEach((it) => {
                  const cat = (it.productCategory || p.productCategory || '').toLowerCase();
                  const sz = (it.size || '').toLowerCase();
                  const q = parseInt(it.quantity, 10) || 0;

                  if (cat.includes('yogurt')) {
                    yogurtCount += q;
                  } else if (sz.includes('115')) {
                    botol115Count += q;
                  } else if (sz.includes('250')) {
                    botol250Count += q;
                  } else {
                    botol250Count += q;
                  }
                });
              } else {
                botol250Count += p.totalPackagedQty || 0;
              }
            }
          });

          const totalStokBotol = botol115Count + botol250Count + yogurtCount;

          return (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setModalStep(1)}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Kembali</span>
                    </button>
                    <div>
                      <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                        <span>📊 REKAP SISA STOK</span>
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">Perhitungan stok otomatis dari transaksi sistem</p>
                    </div>
                  </div>
                  <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
                </div>

                <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl space-y-1 text-xs text-purple-900">
                  <span className="font-black block">Formula Perhitungan Sisa Stok:</span>
                  <p className="font-mono text-[11px] font-bold">
                    STOK AWAL + HASIL PENGOLAHAN - PENJUALAN - HIBAH - RUSAK/AFKIR = SISA STOK
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-xs text-slate-800 block">1. Susu Ukuran 115 ml</span>
                      <span className="text-[10px] text-slate-500 font-semibold">[ AUTO CALCULATE ]</span>
                    </div>
                    <span className="font-black text-sm font-mono text-slate-900">{botol115Count} botol</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-xs text-slate-800 block">2. Susu Ukuran 250 ml</span>
                      <span className="text-[10px] text-slate-500 font-semibold">[ AUTO CALCULATE ]</span>
                    </div>
                    <span className="font-black text-sm font-mono text-slate-900">{botol250Count} botol</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-xs text-slate-800 block">3. Yogurt 200 ml</span>
                      <span className="text-[10px] text-slate-500 font-semibold">[ AUTO CALCULATE ]</span>
                    </div>
                    <span className="font-black text-sm font-mono text-slate-900">{yogurtCount} botol</span>
                  </div>

                  <div className="p-4 bg-purple-900 text-white rounded-2xl flex justify-between items-center shadow-lg">
                    <div>
                      <span className="font-black text-xs uppercase tracking-wider block">4. JUMLAH STOK (Botol)</span>
                      <span className="text-[10px] text-amber-300 font-semibold">Total Sisa Stok Produk Jadi</span>
                    </div>
                    <span className="text-xl font-black text-amber-400 font-mono">{totalStokBotol} botol</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          );
        }

        // DEFAULT FALLBACK FOR EDITING EXISTING PACKAGING RECORD
        const isSolid = formProductCategory === 'Keju';
        const amountUnit = isSolid ? 'Kg' : 'Liter';
        const sizeOptions = isSolid
          ? ['50 gram', '100 gram', '250 gram', '500 gram', '1 kg']
          : ['100 ml', '115 ml', '130 ml', '200 ml', '250 ml', '500 ml', '1 Liter'];

        return (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-600" />
                  <span>Edit Hasil Pengemasan Produk</span>
                </h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {editingPkg?.receptionNotes && (
                  <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-2xl space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 font-black text-rose-900">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Catatan Koreksi Pemasaran:</span>
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
                    max={new Date().toLocaleDateString('en-CA')}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                    required
                  />
                </div>

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

                {/* FORM PACKAGING ITEMS */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-800">
                    Rincian Hasil Kemasan Produk <span className="text-rose-500">*</span>
                  </label>

                  <div className="space-y-2">
                    {formPackagingItems.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
                        <div className="col-span-5">
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Jenis Kemasan</label>
                          <select
                            value={item.packagingType}
                            onChange={(e) => handleUpdatePackagingItem(item.id, 'packagingType', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white outline-none"
                            required
                          >
                            <option value="Botol">Botol</option>
                            <option value="Cup">Cup</option>
                            <option value="Plastik Bantal">Plastik Bantal</option>
                            <option value="Pouch">Pouch</option>
                            <option value="Pack">Pack</option>
                          </select>
                        </div>

                        <div className="col-span-4">
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Ukuran</label>
                          <select
                            value={item.size}
                            onChange={(e) => handleUpdatePackagingItem(item.id, 'size', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white outline-none"
                          >
                            {sizeOptions.map(sz => (
                              <option key={sz} value={sz}>{sz}</option>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Pengemasan (Opsional)</label>
                  <textarea
                    rows="2"
                    placeholder="Catatan..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
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
          } catch (e) { }
        }

        return (
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
        message="Apakah Anda yakin ingin menghapus data hasil pengemasan ini?"
        confirmText="Ya, Hapus Pengemasan"
        onConfirm={handleDelete}
        onCancel={() => setDeletingPkg(null)}
      />

      {/* MODAL LAPORKAN SELISIH */}
      {discrepancyModalItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <span>🟠 Laporkan Selisih Volume Susu</span>
              </h3>
              <button onClick={() => setDiscrepancyModalItem(null)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-1 text-amber-950">
              <p className="font-bold">Informasi Kiriman Farm:</p>
              <p>• Asal Farm: <strong>{discrepancyModalItem.farmOrigin}</strong> ({discrepancyModalItem.animalType})</p>
              <p>• Volume Dikirim Farm: <strong className="text-amber-900">{discrepancyModalItem.rawVolumeLiters} Liter</strong></p>
            </div>

            <form onSubmit={handleConfirmDiscrepancy} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Volume Fisik Sebenarnya Diterima (Liter)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  placeholder="Contoh: 95.5"
                  value={discrepancyRecLiters}
                  onChange={(e) => setDiscrepancyRecLiters(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alasan / Catatan Selisih</label>
                <textarea
                  rows="2"
                  required
                  placeholder="Contoh: Terjadi tumpahan wadah saat perjalanan transport..."
                  value={discrepancyNotes}
                  onChange={(e) => setDiscrepancyNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDiscrepancyModalItem(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 shadow"
                >
                  Simpan Laporan Selisih
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PREVIEW FOTO TIMBANGAN */}
      {previewFoto && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 z-50" onClick={() => setPreviewFoto(null)}>
          <div className="bg-white rounded-3xl max-w-lg w-full p-4 space-y-3 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <span>📷 Foto Timbangan / Wadah Fisik</span>
              </h4>
              <button onClick={() => setPreviewFoto(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>
            <div className="w-full h-80 bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center">
              <img src={previewFoto} alt="Foto Timbangan" className="max-w-full max-h-full object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
