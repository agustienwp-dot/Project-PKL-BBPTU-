'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';
import BeritaAcaraDocument from '@/components/BeritaAcaraDocument';
import SignatureCanvas from '@/components/SignatureCanvas';

import {
  ClipboardList,
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  PenTool,
  Send,
  Printer,
  History,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building,
  User,
  ArrowRight,
  Clock,
  Download,
  ShoppingCart,
  Gift,
  MapPin,
  Calendar as CalendarIcon
} from 'lucide-react';

function BeritaAcaraContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const createForId = searchParams.get('createForId');
  const previewForProductionId = searchParams.get('previewForProductionId');
  const previewBaId = searchParams.get('previewBaId');

  const [loading, setLoading] = useState(true);
  const [baList, setBaList] = useState([]);
  const [toast, setToast] = useState(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterDate, setFilterDate] = useState('');

  // Modals State
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [baType, setBaType] = useState('PEMBELIAN'); // 'PEMBELIAN' | 'HIBAH' | 'FARM_HANDOVER'
  const [editingBa, setEditingBa] = useState(null);

  const [previewBa, setPreviewBa] = useState(null);
  const [signingBa, setSigningBa] = useState(null);
  const [auditBa, setAuditBa] = useState(null);
  const [deletingBa, setDeletingBa] = useState(null);

  // Form Fields State
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formShift, setFormShift] = useState('Pagi');
  const [formFarmLocation, setFormFarmLocation] = useState('Tegalsari');

  // Common Pihak Serah Terima
  const [formPenyerahName, setFormPenyerahName] = useState('Tim Kerja Layanan Pemasaran');
  const [formPenyerahJabatan, setFormPenyerahJabatan] = useState('Tim Kerja Layanan Pemasaran');
  const [formPenerimaName, setFormPenerimaName] = useState('');
  const [formPenerimaJabatan, setFormPenerimaJabatan] = useState('');

  // Form Fields - Pembelian Specific
  const [formPembelianItems, setFormPembelianItems] = useState([
    { id: Date.now(), product: 'Susu', size: '110 ml', quantity: 600, unit: 'botol' },
    { id: Date.now() + 1, product: 'Susu', size: '250 ml', quantity: 450, unit: 'botol' },
  ]);

  // Form Fields - Hibah Specific
  const [formKeteranganTujuan, setFormKeteranganTujuan] = useState('');
  const [formHibahItems, setFormHibahItems] = useState([
    { id: Date.now(), quantity: '', unit: 'Liter', purpose: 'untuk seragam' }
  ]);

  // Form Fields - Susu Olahan (Produk Siap Jual) Specific
  const [availablePackagings, setAvailablePackagings] = useState([]);
  const [selectedPackaging, setSelectedPackaging] = useState(null);
  const [formOlahanItems, setFormOlahanItems] = useState([]);

  const [formNotes, setFormNotes] = useState('');

  const canManage = ['ADMIN_FARM', 'ADMIN_PENGEMASAN', 'ADMIN_PEMASARAN', 'SUPERADMIN'].includes(user?.role);

  const fetchPackagings = async () => {
    try {
      const res = await api.get('/farm/packaging');
      if (res.data.success) {
        setAvailablePackagings(res.data.data);
      }
    } catch (e) {
      console.error('Error fetching packagings:', e);
    }
  };

  const fetchBaList = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      let url = '/berita-acara?';
      if (filterType !== 'ALL') url += `type=${filterType}&`;
      if (filterDate) url += `date=${filterDate}&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;

      const res = await api.get(url);
      if (res.data.success) {
        const normBaList = (res.data.data || []).map(b => ({
          ...b,
          type: b.type || (b.nomorBa?.includes('BAST-PB') ? 'PEMBELIAN' : (b.nomorBa?.includes('BAST-HB') ? 'HIBAH' : (b.nomorBa?.includes('BAST-OLAHAN') ? 'SUSU_OLAHAN' : 'SERAH_TERIMA_FARM'))),
          animalType: b.animal_type || b.animalType || 'SAPI',
          farmLocation: b.farm_location || b.farmLocation || b.location || 'Tegalsari',
          totalProduksi: b.total_produksi ?? b.totalProduksi ?? 0,
          diserahterimakan: b.diserahterimakan ?? 0,
          nomorBa: b.nomor_ba || b.nomorBa || '',
          penyerahName: b.penyerah_name || b.giverName || b.penyerahName || 'Tim Kerja Layanan Pemasaran',
          penerimaName: b.penerima_name || b.receiverName || b.penerimaName || '-',
        }));
        setBaList(normBaList);
      }
    } catch (err) {
      console.error('Error fetching Berita Acara list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBaList(true);
    const interval = setInterval(() => fetchBaList(false), 6000);
    return () => clearInterval(interval);
  }, [filterType, filterDate, searchQuery]);

  const openCreateModal = () => {
    if (user?.role === 'ADMIN_PENGEMASAN') {
      selectTypeAndOpenForm('SUSU_OLAHAN');
    } else {
      setEditingBa(null);
      setShowTypeModal(true);
    }
  };

  const selectTypeAndOpenForm = (type) => {
    setShowTypeModal(false);
    setBaType(type);
    setEditingBa(null);
    setSelectedPackaging(null);
    setFormOlahanItems([]);

    setFormDate(new Date().toISOString().split('T')[0]);
    setFormShift('Pagi');
    setFormFarmLocation(type === 'SUSU_OLAHAN' ? 'Pengemasan & Olahan' : 'Tegalsari');

    if (type === 'SUSU_OLAHAN') {
      setFormPenyerahName(user?.name || 'Admin Pengemasan');
      setFormPenyerahJabatan('Tim Pengemasan & Olahan');
      setFormPenerimaName('Seksi Pemasaran');
      setFormPenerimaJabatan('Tim Kerja Layanan Pemasaran');
      fetchPackagings();
    } else {
      setFormPenyerahName('Tim Kerja Layanan Pemasaran');
      setFormPenyerahJabatan('Tim Kerja Layanan Pemasaran');
      setFormPenerimaName('');
      setFormPenerimaJabatan('');
    }
    setFormNotes('');

    if (type === 'PEMBELIAN') {
      setFormPembelianItems([
        { id: Date.now(), product: 'Susu', size: '110 ml', quantity: 600, unit: 'botol' },
        { id: Date.now() + 1, product: 'Susu', size: '250 ml', quantity: 450, unit: 'botol' },
      ]);
    } else if (type === 'HIBAH') {
      setFormKeteranganTujuan('');
      setFormHibahItems([
        { id: Date.now(), quantity: '', unit: 'Liter', purpose: '' }
      ]);
    }

    setShowFormModal(true);
  };

  const handleSelectPackaging = (pkgId) => {
    const pkg = availablePackagings.find(p => p.id === pkgId);
    if (!pkg) {
      setSelectedPackaging(null);
      setFormOlahanItems([]);
      return;
    }
    setSelectedPackaging(pkg);
    let items = [];

    if (pkg.packagingDetails) {
      try {
        const parsed = typeof pkg.packagingDetails === 'string' ? JSON.parse(pkg.packagingDetails) : pkg.packagingDetails;
        if (Array.isArray(parsed)) {
          items = parsed.map(i => ({
            product: i.productCategory || pkg.productCategory || 'Susu Pasteurisasi',
            size: i.packageSize || i.size || '250 ml',
            quantity: parseInt(i.quantity, 10) || 0,
            unit: 'Botol'
          }));
        }
      } catch (e) {}
    }

    if (items.length === 0) {
      if (pkg.botolQty > 0) items.push({ product: pkg.productCategory || 'Susu Pasteurisasi', size: pkg.packageSize || '250 ml', quantity: pkg.botolQty, unit: 'Botol' });
      if (pkg.cupQty > 0) items.push({ product: pkg.productCategory || 'Yogurt', size: '200 ml', quantity: pkg.cupQty, unit: 'Cup' });
      if (pkg.plastikBantalQty > 0) items.push({ product: pkg.productCategory || 'Susu Pasteurisasi', size: '200 ml', quantity: pkg.plastikBantalQty, unit: 'Pack' });
    }

    if (items.length === 0 && pkg.totalPackagedQty > 0) {
      items.push({
        product: pkg.productCategory || 'Susu Pasteurisasi',
        size: pkg.packageSize || '250 ml',
        quantity: pkg.totalPackagedQty,
        unit: 'Botol'
      });
    }

    setFormOlahanItems(items);
  };

  const openEditModal = (ba) => {
    setEditingBa(ba);
    const targetType = ba.type || (ba.nomorBa?.includes('BAST-PB') ? 'PEMBELIAN' : (ba.nomorBa?.includes('BAST-HB') ? 'HIBAH' : 'SERAH_TERIMA_FARM'));
    setBaType(targetType);
    setFormDate(new Date(ba.date || Date.now()).toISOString().split('T')[0]);
    setFormShift(ba.shift || ba.period || 'Pagi');
    setFormFarmLocation(ba.farmLocation || ba.location || 'Tegalsari');
    setFormPenyerahName(ba.penyerahName || ba.giverName || 'Tim Kerja Layanan Pemasaran');
    setFormPenyerahJabatan(ba.giverDept || ba.penyerahName || 'Tim Kerja Layanan Pemasaran');
    setFormPenerimaName(ba.penerimaName || ba.receiverName || '');
    setFormPenerimaJabatan(ba.receiverTitle || '');
    setFormNotes(ba.notes || '');

    if (targetType === 'PEMBELIAN') {
      let parsed = [];
      if (ba.items) {
        try { parsed = typeof ba.items === 'string' ? JSON.parse(ba.items) : ba.items; } catch (e) {}
      }
      if (Array.isArray(parsed) && parsed.length > 0) {
        setFormPembelianItems(parsed.map((item, idx) => ({ id: idx + 1, ...item })));
      } else {
        setFormPembelianItems([
          { id: Date.now(), product: 'Susu', size: '110 ml', quantity: 600, unit: 'botol' },
          { id: Date.now() + 1, product: 'Susu', size: '250 ml', quantity: 450, unit: 'botol' },
        ]);
      }
    } else if (targetType === 'HIBAH') {
      setFormKeteranganTujuan(ba.purpose || '');
      let parsed = [];
      if (ba.items) {
        try { parsed = typeof ba.items === 'string' ? JSON.parse(ba.items) : ba.items; } catch (e) {}
      }
      if (Array.isArray(parsed) && parsed.length > 0) {
        setFormHibahItems(parsed.map((item, idx) => ({ id: idx + 1, ...item })));
      } else {
        setFormHibahItems([
          { id: Date.now(), quantity: ba.diserahterimakan || '', unit: 'Liter', purpose: ba.purpose || '' }
        ]);
      }
    }

    setShowFormModal(true);
  };

  // Pembelian Row Handlers
  const handleAddPembelianRow = () => {
    setFormPembelianItems(prev => [
      ...prev,
      { id: Date.now(), product: 'Susu', size: '250 ml', quantity: '', unit: 'botol' }
    ]);
  };

  const handleUpdatePembelianRow = (id, field, value) => {
    setFormPembelianItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleRemovePembelianRow = (id) => {
    if (formPembelianItems.length <= 1) return;
    setFormPembelianItems(prev => prev.filter(item => item.id !== id));
  };

  // Hibah Row Handlers
  const handleAddHibahRow = () => {
    setFormHibahItems(prev => [
      ...prev,
      { id: Date.now(), quantity: '', unit: 'Liter', purpose: formKeteranganTujuan || '' }
    ]);
  };

  const handleUpdateHibahRow = (id, field, value) => {
    setFormHibahItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleRemoveHibahRow = (id) => {
    if (formHibahItems.length <= 1) return;
    setFormHibahItems(prev => prev.filter(item => item.id !== id));
  };

  const handleFormSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!formPenerimaName.trim()) {
      setToast({ type: 'error', message: 'Pihak Yang Menerima (Nama/Instansi) wajib diisi.' });
      return;
    }

    let itemsPayload = [];
    let totalQtySum = 0;

    if (baType === 'PEMBELIAN') {
      itemsPayload = formPembelianItems.map(i => ({
        product: i.product || 'Susu',
        size: i.size || '250 ml',
        quantity: parseInt(i.quantity, 10) || 0,
        unit: i.unit || 'botol'
      }));
      totalQtySum = itemsPayload.reduce((s, i) => s + i.quantity, 0);
    } else if (baType === 'HIBAH') {
      itemsPayload = formHibahItems.map(i => ({
        quantity: parseFloat(i.quantity) || 0,
        unit: i.unit || 'Liter',
        purpose: i.purpose || formKeteranganTujuan || ''
      }));
      totalQtySum = itemsPayload.reduce((s, i) => s + i.quantity, 0);
    } else if (baType === 'SUSU_OLAHAN') {
      if (!formOlahanItems || formOlahanItems.length === 0) {
        setToast({ type: 'error', message: 'Harap pilih minimal 1 produk hasil pengolahan dari database.' });
        return;
      }
      itemsPayload = formOlahanItems;
      totalQtySum = itemsPayload.reduce((s, i) => s + (i.quantity || 0), 0);
    }

    const payload = {
      type: baType,
      packagingId: selectedPackaging?.id || null,
      date: formDate,
      shift: formShift,
      period: formShift,
      farmLocation: formFarmLocation,
      location: formFarmLocation,
      giverName: formPenyerahName,
      giverDept: formPenyerahJabatan,
      penyerahName: formPenyerahName,
      receiverName: formPenerimaName,
      receiverTitle: formPenerimaJabatan,
      penerimaName: formPenerimaName,
      penerimaRole: formPenerimaJabatan || formPenerimaName,
      purpose: formKeteranganTujuan || null,
      diserahterimakan: totalQtySum,
      notes: formNotes,
      items: itemsPayload,
      status: baType === 'SUSU_OLAHAN' ? 'MENUNGGU_KONFIRMASI_PEMASARAN' : 'SUDAH_DITANDATANGANI',
    };

    try {
      if (editingBa) {
        const res = await api.put(`/berita-acara/${editingBa.id}`, payload);
        if (res.data.success) {
          setToast({ type: 'success', message: res.data.message || `✓ Berita Acara ${editingBa.nomorBa} berhasil diperbarui.` });
        }
      } else {
        const res = await api.post('/berita-acara', payload);
        if (res.data.success) {
          const createdItem = res.data.data;
          setToast({
            type: 'success',
            message: res.data.message || `✓ Berita Acara ${createdItem?.nomorBa || ''} berhasil dikirim ke Admin Pemasaran!`,
          });
        }
      }
      setShowFormModal(false);
      fetchBaList(true);
    } catch (err) {
      console.error('Error saving Berita Acara:', err);
      setToast({ type: 'error', message: err.response?.data?.message || 'Gagal menyimpan Berita Acara.' });
    }
  };

  const handleConfirmBaByPemasaran = async (ba) => {
    try {
      const res = await api.put(`/berita-acara/${ba.id}`, { action: 'CONFIRM_PEMASARAN' });
      if (res.data.success) {
        setToast({ type: 'success', message: 'Berita Acara produk siap jual telah dikonfirmasi oleh Pemasaran!' });
        setPreviewBa(null);
        fetchBaList(true);
      }
    } catch (err) {
      console.error('Error confirming BA:', err);
      setToast({ type: 'error', message: err.response?.data?.message || 'Gagal mengonfirmasi Berita Acara.' });
    }
  };

  const handleOpenPreview = async (ba) => {
    setPreviewBa(ba);
  };

  const handlePrint = async (ba) => {
    setPreviewBa(ba);
    try {
      if (ba?.id) {
        await api.post(`/berita-acara/${ba.id}/print`);
      }
    } catch (e) {}
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleDelete = async () => {
    if (!deletingBa) return;
    try {
      const res = await api.delete(`/berita-acara/${deletingBa.id}`);
      if (res.data.success) {
        setToast({ type: 'success', message: 'Berita Acara berhasil dihapus.' });
        fetchBaList();
      }
    } catch (err) {
      console.error('Error deleting Berita Acara:', err);
      setToast({ type: 'error', message: err.response?.data?.message || 'Gagal menghapus Berita Acara.' });
    } finally {
      setDeletingBa(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 print:p-0 print:m-0">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* HEADER SECTION (Hidden on Print) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#1E3F20] text-white flex items-center justify-center font-black text-xl shadow-md">
            📄
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
              <span>Berita Acara</span>
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Buat dan kelola berita acara serah terima susu
            </p>
          </div>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={openCreateModal}
            className="px-5 py-3 bg-[#1E3F20] hover:bg-[#16331a] text-white rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Berita Acara</span>
          </button>
        )}
      </div>

      {/* SEARCH & FILTERS (Hidden on Print) */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2 bg-slate-100 px-3.5 py-2 rounded-2xl text-xs text-slate-600 flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Cari nomor BAST, pihak, lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-xs font-medium text-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="ALL">Semua Jenis</option>
            <option value="PEMBELIAN">Pembelian</option>
            <option value="HIBAH">Hibah</option>
          </select>

          {/* Date Filter */}
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>
      </div>

      {/* BERITA ACARA TABLE LIST (Hidden on Print) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden print:hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-700" />
            <h2 className="font-black text-slate-900 text-sm">Riwayat Berita Acara</h2>
          </div>
          <span className="text-xs text-slate-400 font-semibold">Total: {baList.length} dokumen</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[850px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-black uppercase text-[11px] border-b border-slate-200">
                <th className="p-4">NOMOR BAST</th>
                <th className="p-4">TANGGAL</th>
                <th className="p-4">JENIS DOKUMEN</th>
                <th className="p-4">PIHAK MENERIMA</th>
                <th className="p-4">LOKASI / KETERANGAN</th>
                <th className="p-4">DIBUAT OLEH</th>
                <th className="p-4 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {baList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 font-semibold">
                    Belum ada dokumen Berita Acara yang ditemukan.
                  </td>
                </tr>
              ) : (
                baList.map((ba) => {
                  const dateObj = new Date(ba.date);
                  const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                  const shiftStr = ba.shift || ba.period ? ` (${ba.shift || ba.period})` : '';

                  const isPembelian = ba.type === 'PEMBELIAN' || (ba.nomorBa && ba.nomorBa.includes('BAST-PB'));
                  const isHibah = ba.type === 'HIBAH' || (ba.nomorBa && ba.nomorBa.includes('BAST-HB'));
                  const isOlahan = ba.type === 'SUSU_OLAHAN' || (ba.nomorBa && ba.nomorBa.includes('BAST-OLAHAN'));

                  return (
                    <tr key={ba.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-900">{ba.nomorBa}</td>
                      <td className="p-4 font-medium text-slate-700">{dateStr}{shiftStr}</td>
                      <td className="p-4">
                        {isOlahan ? (
                          <span className={`px-3 py-1 rounded-full font-bold text-[11px] border inline-flex items-center gap-1 ${
                            ba.status === 'DITERIMA_PEMASARAN'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            📦 HASIL SUSU OLAHAN {ba.status === 'DITERIMA_PEMASARAN' ? '(DITERIMA)' : '(MENUNGGU PEMASARAN)'}
                          </span>
                        ) : isPembelian ? (
                          <span className="px-3 py-1 rounded-full font-bold text-[11px] bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1">
                            🛒 PEMBELIAN
                          </span>
                        ) : isHibah ? (
                          <span className="px-3 py-1 rounded-full font-bold text-[11px] bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1">
                            🎁 HIBAH
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full font-bold text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                            🥛 SERAH TERIMA
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-bold text-slate-800">{ba.penerimaName || ba.receiverName || '-'}</td>
                      <td className="p-4 text-slate-600">
                        {isHibah ? (
                          <span>{ba.purpose || ba.notes || 'untuk seragam'}</span>
                        ) : (
                          <span className="flex items-center gap-1 font-semibold text-slate-700">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{ba.farmLocation || ba.location || 'Pengemasan & Olahan'}</span>
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-500 font-semibold text-[11px]">
                        {ba.createdBy?.role || (ba.penyerahName?.includes('Pemasaran') ? 'ADMIN_PEMASARAN' : 'ADMIN_PENGEMASAN')}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {isOlahan && ba.status === 'MENUNGGU_KONFIRMASI_PEMASARAN' && (user?.role === 'ADMIN_PEMASARAN' || user?.role === 'SUPERADMIN') && (
                            <button
                              type="button"
                              onClick={() => handleConfirmBaByPemasaran(ba)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                              title="Konfirmasi Penerimaan Pemasaran"
                            >
                              Konfirmasi
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handlePrint(ba)}
                            className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg transition-colors"
                            title="Cetak PDF / Print"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(ba)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                            title="Edit Data"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingBa(ba)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                            title="Hapus BAST"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. TYPE SELECTION MODAL (Screenshot 2) */}
      {showTypeModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base">Pilih Jenis Berita Acara</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Pilih jenis dokumen serah terima susu yang ingin dibuat
                </p>
              </div>
              <button
                onClick={() => setShowTypeModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Option: SUSU OLAHAN SIAP JUAL (Khusus Admin Pengemasan) */}
              <div
                onClick={() => selectTypeAndOpenForm('SUSU_OLAHAN')}
                className="p-4 rounded-2xl border-2 border-amber-200 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50 transition-all cursor-pointer flex items-start gap-4 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold text-xl shrink-0 group-hover:scale-105 transition-transform shadow-md">
                  📦
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-slate-900 text-sm">BERITA ACARA HASIL SUSU OLAHAN SIAP JUAL</h4>
                    <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <span className="inline-block text-[10px] font-black uppercase text-amber-700 tracking-wider">
                    DIBUAT OLEH ADMIN PENGEMASAN
                  </span>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Otomatis mengambil data hasil pengemasan produk siap jual (Susu Pasteurisasi & Yogurt) untuk diserahkan ke Admin Pemasaran.
                  </p>
                </div>
              </div>

              {user?.role !== 'ADMIN_PENGEMASAN' && (
                <>
                  {/* Option 1: HIBAH */}
                  <div
                    onClick={() => selectTypeAndOpenForm('HIBAH')}
                    className="p-4 rounded-2xl border-2 border-purple-100 hover:border-purple-500 bg-purple-50/40 hover:bg-purple-50 transition-all cursor-pointer flex items-start gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold text-xl shrink-0 group-hover:scale-105 transition-transform shadow-md">
                      🎁
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-slate-900 text-sm">BERITA ACARA SERAH TERIMA SUSU HIBAH</h4>
                        <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <span className="inline-block text-[10px] font-black uppercase text-purple-600 tracking-wider">
                        FORMAT RESMI BAST HIBAH
                      </span>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        Buat dokumen berita acara serah terima susu hibah dari Tim Kerja Layanan Pemasaran.
                      </p>
                    </div>
                  </div>

                  {/* Option 2: PEMBELIAN */}
                  <div
                    onClick={() => selectTypeAndOpenForm('PEMBELIAN')}
                    className="p-4 rounded-2xl border-2 border-blue-100 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50 transition-all cursor-pointer flex items-start gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shrink-0 group-hover:scale-105 transition-transform shadow-md">
                      🛒
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-slate-900 text-sm">BERITA ACARA SERAH TERIMA PEMBELIAN SUSU</h4>
                        <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <span className="inline-block text-[10px] font-black uppercase text-blue-600 tracking-wider">
                        FORMAT RESMI BAST PEMBELIAN
                      </span>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        Buat dokumen berita acara serah terima susu hasil pembelian (Tegalsari, Limpakuwus, Manggala, Eduwisata).
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowTypeModal(false)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. FORM MODAL: BAST PEMBELIAN (Screenshot 1) & BAST HIBAH (Screenshot 3) */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => { setShowFormModal(false); setShowTypeModal(true); }}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  ← Kembali
                </button>
                <div>
                  <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                    <span>{baType === 'PEMBELIAN' ? '🛒 BAST PEMBELIAN SUSU' : '🎁 BAST SUSU HIBAH'}</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Lengkapi seluruh informasi dokumen resmi serah terima
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFormModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              
              {/* === BAST SUSU OLAHAN FORM SECTIONS === */}
              {baType === 'SUSU_OLAHAN' && (
                <>
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-black text-emerald-900 uppercase">
                        A. PILIH PRODUK HASIL PENGOLAHAN (MULTI-PRODUK DATABASE)
                      </label>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                        {formOlahanItems.length} produk dipilih
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Pilih satu atau beberapa produk olahan dari database untuk dimasukkan ke dalam 1 Berita Acara:
                    </p>
                    
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                      {availablePackagings.length > 0 ? (
                        availablePackagings.map((pkg) => {
                          const isSelected = formOlahanItems.some(i => i.packagingId === pkg.id);
                          const catName = pkg.productCategory || 'Susu Olahan Rasa';
                          const varName = pkg.variant || 'Original';
                          const sizeName = pkg.packageSize || '250 ml';
                          const qty = pkg.totalPackagedQty || 0;

                          return (
                            <div
                              key={pkg.id}
                              onClick={() => {
                                if (isSelected) {
                                  setFormOlahanItems(prev => prev.filter(i => i.packagingId !== pkg.id));
                                } else {
                                  setFormOlahanItems(prev => [
                                    ...prev,
                                    {
                                      packagingId: pkg.id,
                                      product: `${catName} - ${varName}`,
                                      size: sizeName,
                                      quantity: qty,
                                      unit: pkg.packagingType || 'Botol'
                                    }
                                  ]);
                                }
                              }}
                              className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${
                                isSelected
                                  ? 'bg-emerald-100/90 border-emerald-500 shadow-sm font-bold text-emerald-950'
                                  : 'bg-white border-slate-200 hover:bg-slate-50 font-medium text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}} // Handled by div click
                                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                                />
                                <div>
                                  <span className="font-bold text-slate-900">{catName} ({varName})</span>
                                  <span className="text-slate-400 text-[11px] block">{sizeName} • {pkg.packagingType || 'Botol'} • {new Date(pkg.date).toLocaleDateString('id-ID')}</span>
                                </div>
                              </div>
                              <span className="font-mono font-black text-xs text-emerald-800 bg-white px-2 py-1 rounded-lg border border-emerald-200">
                                {qty} pcs
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-slate-400 italic p-3 text-center">
                          Belum ada data pengolahan produk di database.
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* === BAST PEMBELIAN FORM SECTIONS === */}
              {baType === 'PEMBELIAN' && (
                <>
                  {/* SECTION A: WAKTU & LOKASI PEMBELIAN */}
                  <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
                    <label className="block text-xs font-black text-blue-900 uppercase">
                      A. WAKTU & LOKASI PEMBELIAN
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Tanggal</label>
                        <input
                          type="date"
                          value={formDate}
                          onChange={(e) => setFormDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Waktu / Periode</label>
                        <select
                          value={formShift}
                          onChange={(e) => setFormShift(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="Pagi">Pagi</option>
                          <option value="Sore">Sore</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Lokasi / Sumber</label>
                        <select
                          value={formFarmLocation}
                          onChange={(e) => setFormFarmLocation(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="Tegalsari">Tegalsari</option>
                          <option value="Limpakuwus">Limpakuwus</option>
                          <option value="Manggala">Manggala</option>
                          <option value="Eduwisata">Eduwisata</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* === BAST HIBAH FORM SECTIONS === */}
              {baType === 'HIBAH' && (
                <>
                  {/* SECTION A: INFORMASI DOKUMEN HIBAH */}
                  <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-3">
                    <label className="block text-xs font-black text-purple-900 uppercase">
                      A. INFORMASI DOKUMEN HIBAH
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Tanggal Dokumen</label>
                        <input
                          type="date"
                          value={formDate}
                          onChange={(e) => setFormDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Keterangan Tujuan / Keperluan</label>
                        <input
                          type="text"
                          placeholder="Contoh: untuk seragam"
                          value={formKeteranganTujuan}
                          onChange={(e) => setFormKeteranganTujuan(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* SECTION B: PIHAK SERAH TERIMA */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="block text-xs font-black text-slate-900 uppercase">
                  B. PIHAK SERAH TERIMA
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column: Pihak Yang Menyerahkan */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
                    <label className="block text-[11px] font-black text-emerald-700 uppercase">
                      PIHAK YANG MENYERAHKAN
                    </label>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Nama / Instansi</label>
                      <input
                        type="text"
                        value={formPenyerahName}
                        onChange={(e) => setFormPenyerahName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Jabatan (Opsional)</label>
                      <input
                        type="text"
                        value={formPenyerahJabatan}
                        onChange={(e) => setFormPenyerahJabatan(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Right Column: Pihak Yang Menerima */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
                    <label className="block text-[11px] font-black text-blue-700 uppercase">
                      PIHAK YANG MENERIMA
                    </label>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Nama / Instansi Menerima *</label>
                      <input
                        type="text"
                        placeholder="Contoh: Seksi Pemasaran"
                        value={formPenerimaName}
                        onChange={(e) => setFormPenerimaName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Jabatan Menerima (Opsional)</label>
                      <input
                        type="text"
                        placeholder="Jabatan..."
                        value={formPenerimaJabatan}
                        onChange={(e) => setFormPenerimaJabatan(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION C: DETAIL SUSU SERAH TERIMA */}
              <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-amber-900 uppercase">
                    C. DETAIL PRODUK SUSU OLAHAN SERAH TERIMA
                  </label>
                  {baType !== 'SUSU_OLAHAN' && (
                    <button
                      type="button"
                      onClick={baType === 'PEMBELIAN' ? handleAddPembelianRow : handleAddHibahRow}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-[11px] shadow transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Baris</span>
                    </button>
                  )}
                </div>

                {/* SUSU OLAHAN AUTO-POPULATED TABLE */}
                {baType === 'SUSU_OLAHAN' && (
                  <div className="space-y-3">
                    {formOlahanItems.length === 0 ? (
                      <p className="text-xs text-amber-700 italic bg-amber-100/50 p-3 rounded-xl text-center border border-amber-200">
                        Pilih data Hasil Pengemasan di atas untuk memuat rincian produk olahan otomatis.
                      </p>
                    ) : (
                      <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-700 font-bold border-b">
                            <tr>
                              <th className="p-2.5">Produk</th>
                              <th className="p-2.5">Ukuran</th>
                              <th className="p-2.5">Jumlah</th>
                              <th className="p-2.5">Satuan</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {formOlahanItems.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="p-2.5 font-semibold text-slate-800">{item.product}</td>
                                <td className="p-2.5 text-slate-600">{item.size}</td>
                                <td className="p-2.5 font-bold text-amber-700 font-mono">{item.quantity}</td>
                                <td className="p-2.5 text-slate-600">{item.unit || 'Botol'}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-amber-50/60 font-bold border-t border-amber-200">
                            <tr>
                              <td colSpan={2} className="p-2.5 text-amber-900">Total Produk Siap Jual:</td>
                              <td colSpan={2} className="p-2.5 text-amber-900 font-mono text-sm">
                                {formOlahanItems.reduce((sum, i) => sum + (i.quantity || 0), 0)} Botol
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* PEMBELIAN DETAIL ROWS */}
                {baType === 'PEMBELIAN' && (
                  <div className="space-y-2">
                    {formPembelianItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 bg-white p-2.5 rounded-2xl border border-slate-200">
                        <input
                          type="text"
                          value={item.product || 'Susu'}
                          onChange={(e) => handleUpdatePembelianRow(item.id, 'product', e.target.value)}
                          className="w-24 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <select
                          value={item.size || '250 ml'}
                          onChange={(e) => handleUpdatePembelianRow(item.id, 'size', e.target.value)}
                          className="w-28 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                        >
                          <option value="110 ml">110 ml</option>
                          <option value="130 ml">130 ml</option>
                          <option value="200 ml">200 ml</option>
                          <option value="250 ml">250 ml</option>
                          <option value="500 ml">500 ml</option>
                        </select>
                        <input
                          type="number"
                          placeholder="0"
                          value={item.quantity}
                          onChange={(e) => handleUpdatePembelianRow(item.id, 'quantity', e.target.value)}
                          className="w-24 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <select
                          value={item.unit || 'botol'}
                          onChange={(e) => handleUpdatePembelianRow(item.id, 'unit', e.target.value)}
                          className="w-24 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                        >
                          <option value="botol">botol</option>
                          <option value="cup">cup</option>
                          <option value="pack">pack</option>
                          <option value="liter">liter</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleRemovePembelianRow(item.id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                          title="Hapus Baris"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* HIBAH DETAIL ROWS */}
                {baType === 'HIBAH' && (
                  <div className="space-y-2">
                    {formHibahItems.map((item, idx) => (
                      <div key={item.id} className="flex items-center gap-2 bg-white p-2.5 rounded-2xl border border-slate-200">
                        <span className="font-bold text-xs text-slate-400 w-5 text-center">{idx + 1}.</span>
                        <input
                          type="number"
                          step="any"
                          placeholder="Jumlah (liter)"
                          value={item.quantity}
                          onChange={(e) => handleUpdateHibahRow(item.id, 'quantity', e.target.value)}
                          className="w-32 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <span className="text-xs font-bold text-slate-600">Liter</span>
                        <input
                          type="text"
                          placeholder="untuk seragam"
                          value={item.purpose}
                          onChange={(e) => handleUpdateHibahRow(item.id, 'purpose', e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveHibahRow(item.id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                          title="Hapus Baris"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CATATAN TAMBAHAN (OPSIONAL) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="Catatan tambahan..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              {/* FOOTER ACTIONS */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1E3F20] hover:bg-[#16331a] text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer"
                >
                  Simpan Berita Acara
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW / PRINT MODAL */}
      {previewBa && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto print:p-0 print:bg-white print:static print:block">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200 my-8 print:p-0 print:shadow-none print:m-0 print:rounded-none">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#1E3F20]" />
                <span className="font-black text-slate-900 text-base">Preview Berita Acara</span>
                <span className="text-xs font-bold text-slate-500 font-mono">({previewBa.nomorBa})</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrint(previewBa)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#1E3F20] text-white hover:bg-[#16331a] rounded-xl text-xs font-bold shadow transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Dokumen</span>
                </button>
                <button
                  onClick={() => setPreviewBa(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-xl ml-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <BeritaAcaraDocument ba={previewBa} />

            <div className="flex items-center justify-between border-t border-slate-100 pt-3 print:hidden">
              <div>
                {previewBa.status === 'MENUNGGU_KONFIRMASI_PEMASARAN' && (user?.role === 'ADMIN_PEMASARAN' || user?.role === 'SUPERADMIN') && (
                  <button
                    type="button"
                    onClick={() => handleConfirmBaByPemasaran(previewBa)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Konfirmasi Penerimaan Pemasaran</span>
                  </button>
                )}
              </div>
              <button
                onClick={() => setPreviewBa(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!deletingBa}
        title="Konfirmasi Hapus Berita Acara"
        message={`Apakah Anda yakin ingin menghapus Berita Acara ${deletingBa?.nomorBa}?`}
        confirmText="Ya, Hapus"
        onConfirm={handleDelete}
        onCancel={() => setDeletingBa(null)}
      />
    </div>
  );
}

export default function BeritaAcaraPage() {
  return (
    <Suspense fallback={<LoadingSpinner text="Memuat Berita Acara..." />}>
      <BeritaAcaraContent />
    </Suspense>
  );
}
