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
  Download
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
  const [pemasaranUsers, setPemasaranUsers] = useState([]);
  const [toast, setToast] = useState(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFarm, setFilterFarm] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterDate, setFilterDate] = useState('');

  // Modals State
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingBa, setEditingBa] = useState(null);

  const [previewBa, setPreviewBa] = useState(null);
  const [signingBa, setSigningBa] = useState(null);
  const [auditBa, setAuditBa] = useState(null);
  const [deletingBa, setDeletingBa] = useState(null);

  // Form Fields State
  const [formProductionId, setFormProductionId] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formShift, setFormShift] = useState('Pagi');
  const [formFarmLocation, setFormFarmLocation] = useState('Tegalsari');
  const [formAnimalType, setFormAnimalType] = useState('SAPI');
  const [formUnit, setFormUnit] = useState('Kg');
  const [formTotalProduksi, setFormTotalProduksi] = useState('');
  const [formPenggunaanPedet, setFormPenggunaanPedet] = useState('');
  const [formAfkir, setFormAfkir] = useState('');
  const [formLainLain, setFormLainLain] = useState('');
  const [formDiserahterimakan, setFormDiserahterimakan] = useState('');
  const [formPenyerahName, setFormPenyerahName] = useState(user?.name || 'Seksi Pemeliharaan');
  const [formPenerimaName, setFormPenerimaName] = useState('Seksi Pemasaran');
  const [formPenerimaUserId, setFormPenerimaUserId] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const isFarmAdmin = user?.role === 'ADMIN_FARM' || user?.role === 'SUPERADMIN';
  const isPemasaran = user?.role === 'ADMIN_PEMASARAN';

  const fetchBaList = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      let url = '/berita-acara?';
      if (filterFarm !== 'ALL') url += `farmLocation=${filterFarm}&`;
      if (filterStatus !== 'ALL') url += `status=${filterStatus}&`;
      if (filterDate) url += `date=${filterDate}&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;

      const res = await api.get(url);
      if (res.data.success) {
        setBaList(res.data.data || []);
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
  }, [filterFarm, filterStatus, filterDate, searchQuery]);

  const hasOpenedPreviewRef = React.useRef(false);

  const closePreviewModal = () => {
    setPreviewBa(null);
    if (previewForProductionId || previewBaId) {
      router.replace('/berita-acara');
    }
  };

  // Auto-open BAST Preview modal if redirected from Produksi page with preview query
  useEffect(() => {
    if ((previewForProductionId || previewBaId) && baList.length > 0 && !hasOpenedPreviewRef.current) {
      const match = baList.find(
        (b) =>
          (previewForProductionId && b.productionId === previewForProductionId) ||
          (previewBaId && b.id === previewBaId)
      );
      if (match) {
        hasOpenedPreviewRef.current = true;
        setPreviewBa(match);
      }
    }
  }, [previewForProductionId, previewBaId, baList]);

  // Load production record prefill if redirected from Produksi page
  useEffect(() => {
    if (createForId) {
      setEditingBa(null);
      setFormProductionId(createForId);

      // Immediate prefill from searchParams if available
      const pDate = searchParams.get('date');
      const pShift = searchParams.get('shift');
      const pFarm = searchParams.get('farm');
      const pAnimal = searchParams.get('animal');
      const pTotal = searchParams.get('total');
      const pPedet = searchParams.get('pedet');
      const pAfkir = searchParams.get('afkir');
      const pDiserah = searchParams.get('diserah');

      if (pDate) setFormDate(new Date(pDate).toISOString().split('T')[0]);
      if (pShift) setFormShift(pShift);
      if (pFarm) setFormFarmLocation(pFarm);
      if (pAnimal) setFormAnimalType(pAnimal);
      if (pTotal) setFormTotalProduksi(pTotal);
      if (pPedet) setFormPenggunaanPedet(pPedet);
      if (pAfkir) setFormAfkir(pAfkir);
      if (pDiserah) setFormDiserahterimakan(pDiserah);

      setShowFormModal(true);

      const loadProductionPrefill = async () => {
        try {
          const res = await api.get(`/farm/production/${createForId}`);
          if (res.data.success && res.data.data) {
            const p = res.data.data;
            setFormProductionId(p.id);
            setFormDate(new Date(p.date).toISOString().split('T')[0]);
            setFormShift(p.shift || 'Pagi');
            
            let rawFarm = (p.farmOrigin || 'Manggala').replace(/^Farm\s+/i, '').trim();
            if (rawFarm === 'Tegal Sari' || rawFarm === 'Tegalsari') rawFarm = 'Tegalsari';
            else if (rawFarm === 'Limpakuwus') rawFarm = 'Limpakuwus';
            else if (rawFarm === 'Eduwisata') rawFarm = 'Eduwisata';
            else rawFarm = 'Manggala';
            
            setFormFarmLocation(rawFarm);
            setFormAnimalType(p.animalType || 'SAPI');

            const gross = p.grossVolumeLiters > 0 ? p.grossVolumeLiters : (p.rawVolumeLiters + (p.pedetVolumeLiters || 0) + (p.afkirVolumeLiters || 0));
            setFormTotalProduksi(gross > 0 ? gross.toString() : '');
            setFormPenggunaanPedet((p.pedetVolumeLiters || 0).toString());
            setFormAfkir((p.afkirVolumeLiters || 0).toString());
            setFormLainLain('0');

            const diserah = p.rawVolumeLiters > 0 ? p.rawVolumeLiters : Math.max(0, gross - (p.pedetVolumeLiters || 0) - (p.afkirVolumeLiters || 0));
            setFormDiserahterimakan(diserah > 0 ? diserah.toString() : '');
            setShowFormModal(true);
          }
        } catch (e) {
          console.error('Error loading production prefill:', e);
          setShowFormModal(true);
        }
      };
      loadProductionPrefill();
    }
  }, [createForId, searchParams]);

  // Auto-calculate Jumlah Diserahterimakan (Total Produksi - Pedet - Afkir - Lain-lain)
  useEffect(() => {
    if (!showFormModal) return;
    const tot = parseFloat(formTotalProduksi);
    if (!isNaN(tot) && tot >= 0) {
      const pedet = parseFloat(formPenggunaanPedet) || 0;
      const afk = parseFloat(formAfkir) || 0;
      const lain = parseFloat(formLainLain) || 0;
      const net = Math.max(0, tot - pedet - afk - lain);
      const cleanNet = Math.round(net * 100) / 100;
      setFormDiserahterimakan(cleanNet.toString());
    } else if (formTotalProduksi === '') {
      setFormDiserahterimakan('');
    }
  }, [formTotalProduksi, formPenggunaanPedet, formAfkir, formLainLain, showFormModal]);

  const openCreateModal = () => {
    setEditingBa(null);
    setFormProductionId('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormShift('Pagi');
    setFormFarmLocation('Tegalsari');
    setFormAnimalType('SAPI');
    setFormUnit('Kg');
    setFormTotalProduksi('');
    setFormPenggunaanPedet('0');
    setFormAfkir('0');
    setFormLainLain('0');
    setFormDiserahterimakan('');
    setFormPenyerahName(user?.name || 'Seksi Pemeliharaan');
    setFormPenerimaName('Seksi Pemasaran');
    setFormNotes('');
    setShowFormModal(true);
  };

  const openEditModal = (ba) => {
    if (['TERKIRIM_KE_PEMASARAN', 'DIBACA_PEMASARAN', 'DICETAK'].includes(ba.status)) {
      setToast({ type: 'error', message: 'Dokumen yang sudah dikirim tidak dapat diubah lagi.' });
      return;
    }
    setEditingBa(ba);
    setFormProductionId(ba.productionId || '');
    setFormDate(new Date(ba.date).toISOString().split('T')[0]);
    setFormShift(ba.shift || 'Pagi');
    setFormFarmLocation(ba.farmLocation || 'Tegalsari');
    setFormAnimalType(ba.animalType || 'SAPI');
    setFormUnit(ba.unit || 'Kg');
    setFormTotalProduksi(ba.totalProduksi.toString());
    setFormPenggunaanPedet((ba.penggunaanPedet || 0).toString());
    setFormAfkir((ba.afkir || 0).toString());
    setFormLainLain((ba.lainLain || 0).toString());
    setFormDiserahterimakan((ba.diserahterimakan || 0).toString());
    setFormPenyerahName(ba.penyerahName || user?.name || 'Seksi Pemeliharaan');
    setFormPenerimaName(ba.penerimaName || 'Seksi Pemasaran');
    setFormNotes(ba.notes || '');
    setShowFormModal(true);
  };

  const handleFormSubmit = async (e, actionType = 'KIRIM') => {
    if (e) e.preventDefault();

    let tot = parseFloat(formTotalProduksi || 0);
    const pedet = parseFloat(formPenggunaanPedet || 0);
    const afk = parseFloat(formAfkir || 0);
    const lain = parseFloat(formLainLain || 0);
    const diserah = parseFloat(formDiserahterimakan || 0);

    // Auto calculate Total Produksi if empty or if diserahterimakan is larger
    const calculatedSum = diserah + pedet + afk + lain;
    if (tot <= 0 || diserah > tot || calculatedSum > tot) {
      tot = calculatedSum > 0 ? calculatedSum : diserah;
    }

    // Validation
    if (!formFarmLocation || !formPenyerahName || !formPenerimaName) {
      setToast({ type: 'error', message: 'Harap lengkapi field Lokasi Farm, Penyerah, dan Penerima.' });
      return;
    }
    if (diserah <= 0) {
      setToast({ type: 'error', message: 'Jumlah susu yang diserahterimakan harus lebih dari 0.' });
      return;
    }

    const initialStatus = actionType === 'KIRIM' ? 'TERKIRIM_KE_PEMASARAN' : 'DRAFT';

    const payload = {
      productionId: formProductionId || null,
      date: formDate,
      shift: formShift,
      farmLocation: formFarmLocation,
      animalType: formAnimalType,
      unit: formUnit,
      totalProduksi: tot,
      penggunaanPedet: pedet,
      afkir: afk,
      lainLain: lain,
      diserahterimakan: diserah,
      penyerahName: formPenyerahName,
      penerimaName: formPenerimaName,
      penerimaUserId: formPenerimaUserId || null,
      notes: formNotes,
      status: initialStatus,
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
            message: res.data.message || `✓ Berita Acara ${createdItem?.nomorBa || ''} (${diserah} ${formUnit}) berhasil disimpan!`,
          });
          if (createdItem) {
            setPreviewBa(createdItem);
          }
        }
      }
      setShowFormModal(false);
      fetchBaList(true);
    } catch (err) {
      console.error('Error saving Berita Acara:', err);
      setToast({ type: 'error', message: err.response?.data?.message || 'Gagal menyimpan Berita Acara.' });
    }
  };

  const handleSaveSignature = async (digitalSignature) => {
    if (!signingBa) return;
    try {
      const res = await api.post(`/berita-acara/${signingBa.id}/sign`, { digitalSignature });
      if (res.data.success) {
        setToast({ type: 'success', message: `✓ ${res.data.message}` });
        setSigningBa(null);
        fetchBaList();
        if (previewBa?.id === signingBa.id) {
          setPreviewBa(res.data.data);
        }
      }
    } catch (err) {
      console.error('Error saving digital signature:', err);
      setToast({ type: 'error', message: err.response?.data?.message || 'Gagal menyimpan tanda tangan digital.' });
    }
  };

  const handleSendToPemasaran = async (ba) => {
    try {
      const res = await api.post(`/berita-acara/${ba.id}/send`);
      if (res.data.success) {
        setToast({ type: 'success', message: `✓ Berita Acara ${ba.nomorBa} berhasil dikirim ke Seksi Pemasaran!` });
        fetchBaList();
        if (previewBa?.id === ba.id) setPreviewBa(res.data.data);
      }
    } catch (err) {
      console.error('Error sending Berita Acara:', err);
      setToast({ type: 'error', message: err.response?.data?.message || 'Gagal mengirim Berita Acara.' });
    }
  };

  const handleConfirmPemasaran = async (ba) => {
    try {
      const res = await api.post(`/berita-acara/${ba.id}/confirm`);
      if (res.data.success) {
        setToast({ type: 'success', message: res.data.message });
        fetchBaList();
        if (previewBa?.id === ba.id) setPreviewBa(res.data.data);
      }
    } catch (err) {
      console.error('Error confirming Berita Acara:', err);
      setToast({ type: 'error', message: err.response?.data?.message || 'Gagal mengkonfirmasi Berita Acara.' });
    }
  };

  const handleOpenPreview = async (ba) => {
    setPreviewBa(ba);
    // If Pemasaran opens document for the first time, fetch item details to trigger auto-READ status update
    if (isPemasaran && ba.status === 'TERKIRIM_KE_PEMASARAN') {
      try {
        const res = await api.get(`/berita-acara/${ba.id}`);
        if (res.data.success) {
          setPreviewBa(res.data.data);
          fetchBaList();
        }
      } catch (e) {}
    }
  };

  const handlePrint = async (ba) => {
    try {
      await api.post(`/berita-acara/${ba.id}/print`);
    } catch (e) {}
    window.print();
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

  const handleStatusChange = async (baId, newStatus) => {
    try {
      const res = await api.put(`/berita-acara/${baId}`, { status: newStatus });
      if (res.data.success) {
        setToast({ type: 'success', message: res.data.message || `Status berhasil diubah.` });
        fetchBaList();
        if (previewBa?.id === baId) setPreviewBa(res.data.data);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setToast({ type: 'error', message: err.response?.data?.message || 'Gagal mengubah status.' });
    }
  };

  const getStatusBadge = (ba, isHeader = false) => {
    const status = typeof ba === 'string' ? ba : ba?.status;
    const baseClass = isHeader
      ? 'px-3.5 py-2 rounded-xl font-extrabold text-xs whitespace-nowrap inline-flex items-center gap-1 shadow-sm'
      : 'px-3 py-1 rounded-full font-extrabold text-xs whitespace-nowrap inline-flex items-center gap-1';

    if (status === 'DRAFT') {
      return <span className={`${baseClass} bg-slate-100 text-slate-700 border border-slate-300`}>📝 Draft</span>;
    }
    if (status === 'TERKIRIM_KE_PEMASARAN' || status === 'MENUNGGU_TANDA_TANGAN' || status === 'MENUNGGU_KONFIRMASI' || status === 'MENUNGGU') {
      return <span className={`${baseClass} bg-slate-100 text-slate-700 border border-slate-300`}>⏳ Menunggu</span>;
    }
    return <span className={`${baseClass} bg-emerald-100 text-emerald-800 border border-emerald-300`}>✅ Selesai</span>;
  };

  // Remove blocking full-page loading spinner for instant render

  return (
    <div className="space-y-6 pb-12 print:p-0 print:m-0">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* HEADER SECTION (Hidden on Print) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1E3F20] to-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-md">
            📄
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
              <span>Berita Acara Serah Terima</span>
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Dokumen Resmi Serah Terima Susu Layak Konsumsi dari Seksi Pelayanan Teknik ke Seksi Pemasaran
            </p>
          </div>
        </div>

      </div>

      {/* SEARCH & FILTERS (Hidden on Print) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2 bg-slate-100 px-3.5 py-2 rounded-2xl text-xs text-slate-600 flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Cari Nomor BA, Farm, Nama Penyerah/Penerima..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-xs font-medium text-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Farm Location Filter */}
          <select
            value={filterFarm}
            onChange={(e) => setFilterFarm(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">Semua Farm</option>
            <option value="Tegalsari">Tegalsari</option>
            <option value="Limpakuwus">Limpakuwus</option>
            <option value="Manggala">Manggala</option>
            <option value="Eduwisata">Eduwisata</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="DRAFT">DRAFT</option>
            <option value="TERKIRIM_KE_PEMASARAN">Menunggu Konfirmasi</option>
            <option value="DIBACA_PEMASARAN">Selesai (Dikonfirmasi)</option>
          </select>

          {/* Date Filter */}
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* BERITA ACARA TABLE LIST (Hidden on Print) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden print:hidden">
        {/* UNIFIED HORIZONTAL SCROLLABLE TABLE VIEW (Sama di HP & Laptop) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[850px]">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-extrabold uppercase border-b border-slate-200">
                <th className="p-4 w-12 text-center">No</th>
                <th className="p-4">Nomor BA</th>
                <th className="p-4">Tanggal & Shift</th>
                <th className="p-4">Farm & Ternak</th>
                <th className="p-4 text-right">Diserahterimakan</th>
                <th className="p-4">Pihak Penyerah</th>
                <th className="p-4">Pihak Penerima</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {(() => {
                const sortedBaList = [...baList].sort((a, b) => {
                  const timeA = new Date(a.updatedAt || a.createdAt || a.date || 0).getTime();
                  const timeB = new Date(b.updatedAt || b.createdAt || b.date || 0).getTime();
                  return timeB - timeA;
                });
                if (sortedBaList.length === 0) {
                  return (
                    <tr>
                      <td colSpan={9} className="p-12 text-center text-slate-400 font-semibold">
                        Belum ada dokumen Berita Acara yang ditemukan.
                      </td>
                    </tr>
                  );
                }
                return sortedBaList.map((ba, idx) => {
                  const dateStr = new Date(ba.date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <tr key={ba.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-4 font-mono font-black text-slate-900">{ba.nomorBa}</td>
                      <td className="p-4">
                        <span className="font-bold block text-slate-900">{dateStr}</span>
                        <span className="text-[10px] text-slate-500 font-semibold">{ba.shift}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-900 block">{ba.farmLocation}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 inline-block mt-0.5">
                          {ba.animalType === 'KAMBING' ? '🐐 KAMBING' : '🐄 SAPI'}
                        </span>
                      </td>
                      <td className="p-4 text-right font-black text-emerald-700 text-sm">
                        {ba.diserahterimakan.toLocaleString('id-ID')} <span className="text-xs font-semibold text-slate-500">{ba.unit || 'Liter'}</span>
                      </td>
                      <td className="p-4 font-semibold text-slate-700">{ba.penyerahName}</td>
                      <td className="p-4 font-semibold text-slate-700">{ba.penerimaName}</td>
                      <td className="p-4">{getStatusBadge(ba)}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* PREVIEW BUTTON */}
                          <button
                            type="button"
                            onClick={() => handleOpenPreview(ba)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                            title="Preview Dokumen"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* SEND TO PEMASARAN BUTTON */}
                          {isFarmAdmin && ['DRAFT', 'SUDAH_DITANDATANGANI', 'MENUNGGU_TANDA_TANGAN'].includes(ba.status) && (
                            <button
                              type="button"
                              onClick={() => handleSendToPemasaran(ba)}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-colors"
                              title="Kirim ke Seksi Pemasaran"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}

                          {/* EDIT BUTTON (Draft only) */}
                          {isFarmAdmin && ['DRAFT', 'MENUNGGU_TANDA_TANGAN'].includes(ba.status) && (
                            <button
                              type="button"
                              onClick={() => openEditModal(ba)}
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors"
                              title="Edit Data"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* AUDIT TRAIL LOGS BUTTON */}
                          <button
                            type="button"
                            onClick={() => setAuditBa(ba)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
                            title="Audit Trail Histori"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          {/* DELETE BUTTON (Draft only) */}
                          {isFarmAdmin && ba.status === 'DRAFT' && (
                            <button
                              type="button"
                              onClick={() => setDeletingBa(ba)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                              title="Hapus Draft"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM BUAT / EDIT MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <span>📄 {editingBa ? 'Edit Berita Acara' : 'Buat Berita Acara Serah Terima Baru'}</span>
              </h3>
              <button onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={(e) => handleFormSubmit(e, 'KIRIM')} className="space-y-6">
              {/* SECTION 1: INFORMASI DOKUMEN */}
              <div className="space-y-3">
                <span className="font-extrabold text-xs text-emerald-800 uppercase tracking-wider block border-b border-slate-100 pb-1">
                  1. Informasi Dokumen
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Transaksi</label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Pagi / Sore</label>
                    <select
                      value={formShift}
                      onChange={(e) => setFormShift(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Pagi">Pagi</option>
                      <option value="Sore">Sore</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Farm / Lokasi</label>
                    <select
                      value={formFarmLocation}
                      onChange={(e) => setFormFarmLocation(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Tegalsari">Farm Tegalsari</option>
                      <option value="Limpakuwus">Farm Limpakuwus</option>
                      <option value="Manggala">Farm Manggala</option>
                      <option value="Eduwisata">Eduwisata</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Ternak</label>
                    <select
                      value={formAnimalType}
                      onChange={(e) => setFormAnimalType(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="SAPI">SAPI</option>
                      <option value="KAMBING">KAMBING</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: RINCIAN VOLUME SUSU */}
              <div className="space-y-3">
                <span className="font-extrabold text-xs text-emerald-800 uppercase tracking-wider block border-b border-slate-100 pb-1">
                  2. Data Rincian Volume Susu ({formUnit})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Total Produksi ({formUnit}) *</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formTotalProduksi}
                      onChange={(e) => setFormTotalProduksi(e.target.value)}
                      onWheel={(e) => e.target.blur()}
                      placeholder="Contoh: 700"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Penggunaan Pedet ({formUnit})</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formPenggunaanPedet}
                      onChange={(e) => setFormPenggunaanPedet(e.target.value)}
                      onWheel={(e) => e.target.blur()}
                      placeholder="0"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Susu Afkir ({formUnit})</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formAfkir}
                      onChange={(e) => setFormAfkir(e.target.value)}
                      onWheel={(e) => e.target.blur()}
                      placeholder="0"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Lain-lain ({formUnit})</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formLainLain}
                      onChange={(e) => setFormLainLain(e.target.value)}
                      onWheel={(e) => e.target.blur()}
                      placeholder="0"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>

                  <div className="sm:col-span-2 bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200">
                    <label className="block text-xs font-black text-emerald-900 mb-1">
                      Jumlah Diserahterimakan ke Pemasaran ({formUnit}) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formDiserahterimakan}
                      onChange={(e) => setFormDiserahterimakan(e.target.value)}
                      onWheel={(e) => e.target.blur()}
                      placeholder="Otomatis terhitung"
                      className="w-full px-3.5 py-2 rounded-xl border border-emerald-300 text-sm font-black text-emerald-900 outline-none focus:ring-2 focus:ring-emerald-500 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: PIHAK PENYERAH & PENERIMA */}
              <div className="space-y-3">
                <span className="font-extrabold text-xs text-emerald-800 uppercase tracking-wider block border-b border-slate-100 pb-1">
                  3. Pihak Penyerah & Penerima
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Pihak Penyerah (Seksi Pemeliharaan)</label>
                    <input
                      type="text"
                      value={formPenyerahName}
                      onChange={(e) => setFormPenyerahName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Pihak Penerima (Seksi Pemasaran)</label>
                    <input
                      type="text"
                      value={formPenerimaName}
                      onChange={(e) => setFormPenerimaName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: CATATAN */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Catatan serah terima jika ada..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={(e) => handleFormSubmit(e, 'DRAFT')}
                  className="px-4 py-2.5 bg-slate-200 text-slate-800 rounded-xl text-xs font-bold hover:bg-slate-300"
                >
                  Simpan Draft
                </button>
                <button
                  type="button"
                  onClick={(e) => handleFormSubmit(e, 'KIRIM')}
                  className="px-6 py-2.5 bg-[#1E3F20] text-white rounded-xl text-xs font-black hover:bg-[#16331a] shadow-md cursor-pointer"
                >
                  Simpan & Kirim ke Pemasaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW DOKUMEN MODAL */}
      {previewBa && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto print:p-0 print:bg-white print:fixed-none">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200 my-8 print:p-0 print:shadow-none print:m-0 print:rounded-none">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 print:hidden">
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900 text-base">📄 Preview Berita Acara Resmi</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(previewBa.status, true)}

                {isFarmAdmin && ['DRAFT', 'MENUNGGU_TANDA_TANGAN'].includes(previewBa.status) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSigningBa(previewBa);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-yellow-100 text-yellow-900 hover:bg-yellow-200 rounded-xl text-xs font-bold transition-colors"
                  >
                    <PenTool className="w-4 h-4" />
                    <span>Tanda Tangan Digital</span>
                  </button>
                )}

                {isFarmAdmin && ['DRAFT', 'SUDAH_DITANDATANGANI', 'MENUNGGU_TANDA_TANGAN'].includes(previewBa.status) && (
                  <button
                    type="button"
                    onClick={() => handleSendToPemasaran(previewBa)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-bold shadow transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    <span>Kirim ke Pemasaran</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handlePrint(previewBa)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#1E3F20] text-white hover:bg-[#16331a] rounded-xl text-xs font-bold shadow transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Download PDF</span>
                </button>

                <button onClick={closePreviewModal} className="text-slate-400 hover:text-slate-600 font-bold text-xl ml-2">
                  ✕
                </button>
              </div>
            </div>

            {/* DOCUMENT CANVAS CONTAINER */}
            <div className="overflow-y-auto max-h-[75vh] p-2 bg-slate-100 rounded-2xl print:bg-white print:max-h-none print:p-0">
              <BeritaAcaraDocument ba={previewBa} />
            </div>

            <div className="flex justify-between items-center text-xs text-slate-500 font-medium pt-2 border-t border-slate-100 print:hidden">
              <span>Nomor Dokumen: <strong className="font-mono text-slate-900">{previewBa.nomorBa}</strong></span>
              <button onClick={closePreviewModal} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200">
                Tutup Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIGITAL SIGNATURE MODAL */}
      {signingBa && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <span>✍️ Tanda Tangan Digital Admin Farm</span>
              </h3>
              <button onClick={() => setSigningBa(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">
                ✕
              </button>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <span className="font-extrabold block">Dokumen: {signingBa.nomorBa}</span>
              <span>Pihak Penyerah: <strong>{signingBa.penyerahName}</strong> ({signingBa.farmLocation})</span>
            </div>

            <SignatureCanvas
              onSave={handleSaveSignature}
              onCancel={() => setSigningBa(null)}
              initialImage={signingBa.digitalSignature}
            />
          </div>
        </div>
      )}

      {/* AUDIT TRAIL TIMELINE MODAL */}
      {auditBa && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-600" />
                <span>Audit Trail Histori {auditBa.nomorBa}</span>
              </h3>
              <button onClick={() => setAuditBa(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {auditBa.logs && auditBa.logs.length > 0 ? (
                auditBa.logs.map((log, index) => {
                  const dateStr = new Date(log.createdAt).toLocaleString('id-ID');
                  return (
                    <div key={log.id || index} className="flex gap-3 text-xs border-b border-slate-100 pb-2.5 last:border-0">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-900">{log.actorName}</span>
                          <span className="text-[10px] font-mono text-slate-400">{dateStr}</span>
                        </div>
                        <p className="text-slate-600 text-xs font-medium">{log.notes}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">Belum ada catatan histori.</div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button onClick={() => setAuditBa(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!deletingBa}
        title="Konfirmasi Hapus Draft Berita Acara"
        message={`Apakah Anda yakin ingin menghapus draft Berita Acara ${deletingBa?.nomorBa}?`}
        confirmText="Ya, Hapus Draft"
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
