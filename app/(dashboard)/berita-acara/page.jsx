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
        const normBaList = (res.data.data || []).map(b => ({
          ...b,
          animalType: b.animal_type || b.animalType || 'SAPI',
          animal_type: b.animal_type || b.animalType || 'SAPI',
          farmLocation: b.farm_location || b.farmLocation || 'Tegalsari',
          farm_location: b.farm_location || b.farmLocation || 'Tegalsari',
          totalProduksi: b.total_produksi ?? b.totalProduksi ?? 0,
          total_produksi: b.total_produksi ?? b.totalProduksi ?? 0,
          penggunaanPedet: b.penggunaan_pedet ?? b.penggunaanPedet ?? 0,
          penggunaan_pedet: b.penggunaan_pedet ?? b.penggunaanPedet ?? 0,
          lainLain: b.lain_lain ?? b.lainLain ?? 0,
          lain_lain: b.lain_lain ?? b.lainLain ?? 0,
          diserahterimakan: b.diserahterimakan ?? 0,
          nomorBa: b.nomor_ba || b.nomorBa || '',
          nomor_ba: b.nomor_ba || b.nomorBa || '',
          penyerahName: b.penyerah_name || b.penyerahName || 'Seksi Pemeliharaan',
          penyerah_name: b.penyerah_name || b.penyerahName || 'Seksi Pemeliharaan',
          penerimaName: b.penerima_name || b.penerimaName || 'Seksi Pemasaran',
          penerima_name: b.penerima_name || b.penerimaName || 'Seksi Pemasaran',
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
            
            let rawFarm = (p.farm_origin || p.farmOrigin || 'Manggala').replace(/^Farm\s+/i, '').trim();
            if (rawFarm === 'Tegal Sari' || rawFarm === 'Tegalsari') rawFarm = 'Tegalsari';
            else if (rawFarm === 'Limpakuwus') rawFarm = 'Limpakuwus';
            else if (rawFarm === 'Eduwisata') rawFarm = 'Eduwisata';
            else rawFarm = 'Manggala';
            
            setFormFarmLocation(rawFarm);
            setFormAnimalType(p.animal_type || p.animalType || pAnimal || 'SAPI');

            const pedetVal = p.pedet_volume_liters ?? p.pedetVolumeLiters ?? 0;
            const afkirVal = p.afkir_volume_liters ?? p.afkirVolumeLiters ?? 0;
            const rawVal = p.raw_volume_liters ?? p.rawVolumeLiters ?? 0;
            const grossVal = (p.gross_volume_liters ?? p.grossVolumeLiters ?? 0) > 0 
              ? (p.gross_volume_liters ?? p.grossVolumeLiters) 
              : (rawVal + pedetVal + afkirVal);

            setFormTotalProduksi(grossVal > 0 ? grossVal.toString() : '');
            setFormPenggunaanPedet(pedetVal.toString());
            setFormAfkir(afkirVal.toString());
            setFormLainLain('0');

            const diserah = rawVal > 0 ? rawVal : Math.max(0, grossVal - pedetVal - afkirVal);
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
    setFormProductionId(ba.productionId || ba.production_id || '');
    setFormDate(new Date(ba.date).toISOString().split('T')[0]);
    setFormShift(ba.shift || 'Pagi');
    setFormFarmLocation(ba.farm_location || ba.farmLocation || 'Tegalsari');
    setFormAnimalType(ba.animal_type || ba.animalType || 'SAPI');
    setFormUnit(ba.unit || 'Kg');
    setFormTotalProduksi((ba.total_produksi ?? ba.totalProduksi ?? 0).toString());
    setFormPenggunaanPedet((ba.penggunaan_pedet ?? ba.penggunaanPedet ?? 0).toString());
    setFormAfkir((ba.afkir || 0).toString());
    setFormLainLain((ba.lain_lain ?? ba.lainLain ?? 0).toString());
    setFormDiserahterimakan((ba.diserahterimakan || 0).toString());
    setFormPenyerahName(ba.penyerah_name || ba.penyerahName || user?.name || 'Seksi Pemeliharaan');
    setFormPenerimaName(ba.penerima_name || ba.penerimaName || 'Seksi Pemasaran');
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
                  const dateA = new Date(a.date || 0).getTime();
                  const dateB = new Date(b.date || 0).getTime();
                  if (dateB !== dateA) return dateB - dateA;
                  const timeA = new Date(a.created_at || a.createdAt || a.updated_at || a.updatedAt || 0).getTime();
                  const timeB = new Date(b.created_at || b.createdAt || b.updated_at || b.updatedAt || 0).getTime();
                  if (timeB !== timeA) return timeB - timeA;
                  return (b.id || '').localeCompare(a.id || '');
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
                        {(ba.animal_type || ba.animalType) === 'KAMBING' ? (
                          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 border border-purple-200 inline-block">
                            🐐 KAMBING
                          </span>
                        ) : (
                          <>
                            <span className="font-bold text-slate-900 block">{ba.farm_location || ba.farmLocation || 'Tegalsari'}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 inline-block mt-0.5">
                              🐄 SAPI
                            </span>
                          </>
                        )}
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

  // Reset Form
  const resetForm = () => {
    setEditingRecord(null);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormPeriod('Pagi');
    setFormLocation('Tegalsari');
    setGiverName('Tim Kerja Layanan Pemasaran');
    setGiverTitle('Tim Kerja Layanan Pemasaran');
    setGiverDept('Tim Kerja Layanan Pemasaran');
    setReceiverName('');
    setReceiverTitle('');
    setReceiverDept('');
    setPurpose('');
    setFormNotes('');
    setHibahItems([{ quantity: '', notes: 'untuk seragam' }]);
    setPembelianItems([
      { productType: 'Susu', size: '110 ml', quantity: '600', unit: 'botol', notes: '' },
      { productType: 'Susu', size: '250 ml', quantity: '450', unit: 'botol', notes: '' }
    ]);
  };

  // Open Form New
  const handleSelectType = (type) => {
    setSelectedType(type);
    resetForm();
    setShowTypeModal(false);
    setShowFormModal(true);
  };

  // Open Form Edit
  const handleEdit = (rec) => {
    setEditingRecord(rec);
    setSelectedType(rec.type);
    setFormDate(rec.date ? new Date(rec.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    setFormPeriod(rec.period || 'Pagi');
    setFormLocation(rec.location || 'Tegalsari');
    setGiverName(rec.giverName || 'Tim Kerja Layanan Pemasaran');
    setGiverTitle(rec.giverTitle || '');
    setGiverDept(rec.giverDept || 'Tim Kerja Layanan Pemasaran');
    setReceiverName(rec.receiverName || '');
    setReceiverTitle(rec.receiverTitle || '');
    setReceiverDept(rec.receiverDept || '');
    setPurpose(rec.purpose || '');
    setFormNotes(rec.notes || '');

    try {
      const parsedItems = JSON.parse(rec.items || '[]');
      if (rec.type === 'HIBAH') {
        setHibahItems(parsedItems.length > 0 ? parsedItems : [{ quantity: '', notes: '' }]);
      } else {
        setPembelianItems(parsedItems.length > 0 ? parsedItems : [{ productType: 'Susu', size: '250 ml', quantity: '', unit: 'botol', notes: '' }]);
      }
    } catch (e) {
      if (rec.type === 'HIBAH') {
        setHibahItems([{ quantity: '', notes: '' }]);
      } else {
        setPembelianItems([{ productType: 'Susu', size: '250 ml', quantity: '', unit: 'botol', notes: '' }]);
      }
    }

    setShowFormModal(true);
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus Berita Acara ini?')) return;
    try {
      const res = await api.delete(`/berita-acara/${id}`);
      if (res.data.success) {
        setToast({ type: 'success', message: 'Berita Acara berhasil dihapus' });
        fetchData();
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Gagal menghapus Berita Acara' });
    }
  };

  // View PDF Modal
  const handleOpenPdf = (rec) => {
    setViewingRecord(rec);
    setShowPdfModal(true);
  };

  // Print PDF
  const handlePrintPdf = () => {
    window.print();
  };

  // Add Item Rows
  const addHibahRow = () => {
    setHibahItems([...hibahItems, { quantity: '', notes: '' }]);
  };
  const removeHibahRow = (idx) => {
    if (hibahItems.length <= 1) return;
    setHibahItems(hibahItems.filter((_, i) => i !== idx));
  };

  const addPembelianRow = () => {
    setPembelianItems([...pembelianItems, { productType: 'Susu', size: '250 ml', quantity: '', unit: 'botol', notes: '' }]);
  };
  const removePembelianRow = (idx) => {
    if (pembelianItems.length <= 1) return;
    setPembelianItems(pembelianItems.filter((_, i) => i !== idx));
  };

  // Submit Form
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (submitting) return;

    if (!receiverName || !receiverName.trim()) {
      setToast({ type: 'error', message: 'Nama pihak yang menerima wajib diisi.' });
      return;
    }

    if (!giverName || !giverName.trim()) {
      setToast({ type: 'error', message: 'Nama pihak yang menyerahkan wajib diisi.' });
      return;
    }

    const itemsToSave = selectedType === 'HIBAH' ? hibahItems : pembelianItems;
    const validItems = itemsToSave.filter(it => (it.quantity && parseFloat(it.quantity) > 0));

    if (validItems.length === 0) {
      setToast({ type: 'error', message: 'Harap isi minimal 1 item detail susu dengan jumlah > 0.' });
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        type: selectedType,
        date: formDate,
        period: selectedType === 'PEMBELIAN' ? formPeriod : null,
        location: selectedType === 'PEMBELIAN' ? formLocation : null,
        giverName,
        giverTitle,
        giverDept,
        receiverName,
        receiverTitle,
        receiverDept,
        purpose: selectedType === 'HIBAH' ? purpose : null,
        notes: formNotes,
        items: validItems,
      };

      let res;
      if (editingRecord) {
        res = await api.put(`/berita-acara/${editingRecord.id}`, payload);
      } else {
        res = await api.post('/berita-acara', payload);
      }

      if (res.data.success) {
        setToast({
          type: 'success',
          message: editingRecord ? 'Berita acara berhasil diperbarui.' : 'Berita acara berhasil disimpan.',
        });
        setShowFormModal(false);
        resetForm();
        fetchData();
      } else {
        throw new Error(res.data.message || 'Gagal menyimpan Berita Acara');
      }
    } catch (err) {
      console.error('Submit Berita Acara Error:', err);
      setToast({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Gagal menyimpan Berita Acara',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 print:p-0 print:bg-white print:text-black">
      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* HEADER SECTION (Hidden on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#1E3F20] text-white shadow-md">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                Berita Acara
              </h1>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Buat dan kelola berita acara serah terima susu
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowTypeModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#1E3F20] hover:bg-[#16331a] text-white text-xs font-bold shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Berita Acara</span>
        </button>
      </div>

      {/* SEARCH & FILTER BAR (Hidden on print) */}
      <div className="bg-white p-4 md:p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari nomor BAST, pihak, lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-[#1E3F20] outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent outline-none cursor-pointer font-bold"
            >
              <option value="">Semua Jenis</option>
              <option value="HIBAH">BAST Hibah</option>
              <option value="PEMBELIAN">BAST Pembelian</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-transparent outline-none cursor-pointer font-semibold text-xs"
            />
            {filterDate && (
              <button onClick={() => setFilterDate('')} className="text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* RIWAYAT TABLE (Hidden on print) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden print:hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#1E3F20]" />
            <span>Riwayat Berita Acara</span>
          </h2>
          <span className="text-xs font-bold text-slate-400">Total: {records.length} dokumen</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-semibold">
            Memuat daftar berita acara...
          </div>
        ) : records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-5">Nomor BAST</th>
                  <th className="py-3.5 px-5">Tanggal</th>
                  <th className="py-3.5 px-5">Jenis Dokumen</th>
                  <th className="py-3.5 px-5">Pihak Menerima</th>
                  <th className="py-3.5 px-5">Lokasi / Keterangan</th>
                  <th className="py-3.5 px-5">Dibuat Oleh</th>
                  <th className="py-3.5 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {records.map((rec) => {
                  const isHibah = rec.type === 'HIBAH';
                  let parsedItems = [];
                  try {
                    parsedItems = JSON.parse(rec.items || '[]');
                  } catch (e) {}

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5 font-black text-slate-900 font-mono">
                        {rec.nomorBA}
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-slate-600">
                        {new Date(rec.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {rec.period && <span className="ml-1 text-[10px] text-slate-400 font-bold">({rec.period})</span>}
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider ${
                            isHibah
                              ? 'bg-purple-100 text-purple-900 border border-purple-200'
                              : 'bg-blue-100 text-blue-900 border border-blue-200'
                          }`}
                        >
                          {isHibah ? '🎁 HIBAH' : '🛒 PEMBELIAN'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-bold text-slate-800">
                        {rec.receiverName}
                        {rec.receiverDept && <span className="block text-[10px] text-slate-400 font-normal">{rec.receiverDept}</span>}
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-slate-600">
                        {isHibah ? (
                          <span>{rec.purpose || 'Serah Terima Susu Hibah'}</span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-600 inline" />
                            {rec.location}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-slate-500 font-semibold text-[11px]">
                        {rec.createdBy?.name || 'Admin'}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenPdf(rec)}
                            title="Export PDF / Cetak"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs flex items-center gap-1 transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </button>
                          <button
                            onClick={() => handleEdit(rec)}
                            title="Edit"
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(rec.id)}
                            title="Hapus"
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-slate-400 font-medium space-y-2">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-600">Belum ada berita acara.</p>
            <p>Klik tombol "+ Buat Berita Acara" untuk membuat dokumen baru.</p>
          </div>
        )}
      </div>

      {/* 1. SELECTION MODAL: PILIH JENIS BERITA ACARA */}
      {showTypeModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base">Pilih Jenis Berita Acara</h3>
                <p className="text-xs text-slate-500 font-medium">Pilih jenis dokumen serah terima susu yang ingin dibuat</p>
              </div>
              <button onClick={() => setShowTypeModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
            </div>

            <div className="space-y-4">
              {/* Card 1: BAST HIBAH */}
              <button
                onClick={() => handleSelectType('HIBAH')}
                className="w-full text-left p-5 rounded-2xl border-2 border-purple-100 hover:border-purple-500 bg-purple-50/40 hover:bg-purple-50 transition-all space-y-2 group shadow-sm cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow">
                      <Gift className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm group-hover:text-purple-900">
                        1. BERITA ACARA SERAH TERIMA SUSU HIBAH
                      </h4>
                      <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Format Resmi BAST Hibah</span>
                    </div>
                  </div>
                  <span className="text-slate-400 group-hover:text-purple-600 text-lg font-black">→</span>
                </div>
                <p className="text-xs text-slate-600 font-medium pl-11">
                  Buat dokumen berita acara serah terima susu hibah dari Tim Kerja Layanan Pemasaran.
                </p>
              </button>

              {/* Card 2: BAST PEMBELIAN */}
              <button
                onClick={() => handleSelectType('PEMBELIAN')}
                className="w-full text-left p-5 rounded-2xl border-2 border-blue-100 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50 transition-all space-y-2 group shadow-sm cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow">
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm group-hover:text-blue-900">
                        2. BERITA ACARA SERAH TERIMA PEMBELIAN SUSU
                      </h4>
                      <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Format Resmi BAST Pembelian</span>
                    </div>
                  </div>
                  <span className="text-slate-400 group-hover:text-blue-600 text-lg font-black">→</span>
                </div>
                <p className="text-xs text-slate-600 font-medium pl-11">
                  Buat dokumen berita acara serah terima susu hasil pembelian (Tegalsari, Limpakuwus, Manggala, Eduwisata).
                </p>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowTypeModal(false)}
                className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. FORM MODAL: DYNAMIC INPUT FOR HIBAH / PEMBELIAN */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowFormModal(false);
                    if (!editingRecord) setShowTypeModal(true);
                  }}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali</span>
                </button>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {editingRecord ? 'Edit Berita Acara' : selectedType === 'HIBAH' ? '🎁 BAST SUSU HIBAH' : '🛒 BAST PEMBELIAN SUSU'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Lengkapi seluruh informasi dokumen resmi serah terima</p>
                </div>
              </div>
              <button onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              {/* SECTION A: INFORMASI WAKTU & LOKASI (KHUSUS PEMBELIAN) */}
              {selectedType === 'PEMBELIAN' && (
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
                  <label className="block text-xs font-black text-blue-900 uppercase">A. WAKTU & LOKASI PEMBELIAN</label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Tanggal</label>
                      <input
                        type="date"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Waktu / Periode</label>
                      <select
                        value={formPeriod}
                        onChange={(e) => setFormPeriod(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Pagi">Pagi</option>
                        <option value="Sore">Sore</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Lokasi / Sumber</label>
                      <select
                        value={formLocation}
                        onChange={(e) => setFormLocation(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Tegalsari">Tegalsari</option>
                        <option value="Limpakuwus">Limpakuwus</option>
                        <option value="Manggala">Manggala</option>
                        <option value="Eduwisata">Eduwisata</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION A: INFORMASI DOKUMEN (KHUSUS HIBAH) */}
              {selectedType === 'HIBAH' && (
                <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-3">
                  <label className="block text-xs font-black text-purple-900 uppercase">A. INFORMASI DOKUMEN HIBAH</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Tanggal Dokumen</label>
                      <input
                        type="date"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Keterangan Tujuan / Keperluan</label>
                      <input
                        type="text"
                        placeholder="Contoh: untuk seragam"
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION B: PIHAK YANG SERAH TERIMA */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="block text-xs font-black text-slate-900 uppercase">
                  {selectedType === 'HIBAH' ? 'B. PIHAK SERAH TERIMA' : 'B. PIHAK SERAH TERIMA'}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {/* Pihak Menyerahkan */}
                  <div className="space-y-2 p-3 bg-white rounded-xl border border-slate-200">
                    <span className="block text-[11px] font-black text-emerald-800 uppercase border-b pb-1">PIHAK YANG MENYERAHKAN</span>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Nama / Instansi</label>
                      <input
                        type="text"
                        value={giverName}
                        onChange={(e) => setGiverName(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Jabatan (Opsional)</label>
                      <input
                        type="text"
                        value={giverTitle}
                        onChange={(e) => setGiverTitle(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
                        placeholder="Jabatan..."
                      />
                    </div>
                  </div>

                  {/* Pihak Menerima */}
                  <div className="space-y-2 p-3 bg-white rounded-xl border border-slate-200">
                    <span className="block text-[11px] font-black text-blue-800 uppercase border-b pb-1">PIHAK YANG MENERIMA</span>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Nama / Instansi Menerima *</label>
                      <input
                        type="text"
                        placeholder="Contoh: BAG UMUM / PT ..."
                        value={receiverName}
                        onChange={(e) => setReceiverName(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Jabatan Menerima (Opsional)</label>
                      <input
                        type="text"
                        placeholder="Jabatan..."
                        value={receiverTitle}
                        onChange={(e) => setReceiverTitle(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION C: DETAIL ITEM SUSU (DYNAMIC ROWS) */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-amber-900 uppercase">
                    C. DETAIL SUSU SERAH TERIMA
                  </label>
                  <button
                    type="button"
                    onClick={selectedType === 'HIBAH' ? addHibahRow : addPembelianRow}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Baris</span>
                  </button>
                </div>

                {/* DYNAMIC ROWS FOR HIBAH */}
                {selectedType === 'HIBAH' && (
                  <div className="space-y-2">
                    {hibahItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-amber-200">
                        <span className="text-xs font-black text-amber-800 w-5 text-center">{idx + 1}.</span>
                        <div className="w-32">
                          <input
                            type="number"
                            step="any"
                            placeholder="Jumlah (Liter)"
                            value={item.quantity}
                            onChange={(e) => {
                              const updated = [...hibahItems];
                              updated[idx].quantity = e.target.value;
                              setHibahItems(updated);
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold font-mono"
                            required
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-500">Liter</span>
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Keterangan (contoh: untuk seragam, ambil perah tgs 07.05)"
                            value={item.notes}
                            onChange={(e) => {
                              const updated = [...hibahItems];
                              updated[idx].notes = e.target.value;
                              setHibahItems(updated);
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
                          />
                        </div>
                        {hibahItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeHibahRow(idx)}
                            className="p-1 text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* DYNAMIC ROWS FOR PEMBELIAN */}
                {selectedType === 'PEMBELIAN' && (
                  <div className="space-y-2">
                    {pembelianItems.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 bg-white p-2.5 rounded-xl border border-amber-200 items-center">
                        <div className="col-span-3">
                          <input
                            type="text"
                            placeholder="Jenis Susu"
                            value={item.productType}
                            onChange={(e) => {
                              const updated = [...pembelianItems];
                              updated[idx].productType = e.target.value;
                              setPembelianItems(updated);
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
                          />
                        </div>
                        <div className="col-span-3">
                          <select
                            value={item.size}
                            onChange={(e) => {
                              const updated = [...pembelianItems];
                              updated[idx].size = e.target.value;
                              setPembelianItems(updated);
                            }}
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
                          >
                            <option value="110 ml">110 ml</option>
                            <option value="115 ml">115 ml</option>
                            <option value="130 ml">130 ml</option>
                            <option value="200 ml">200 ml</option>
                            <option value="250 ml">250 ml</option>
                            <option value="1 Liter">1 Liter</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            placeholder="Jumlah"
                            value={item.quantity}
                            onChange={(e) => {
                              const updated = [...pembelianItems];
                              updated[idx].quantity = e.target.value;
                              setPembelianItems(updated);
                            }}
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-bold font-mono"
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="text"
                            placeholder="Satuan"
                            value={item.unit}
                            onChange={(e) => {
                              const updated = [...pembelianItems];
                              updated[idx].unit = e.target.value;
                              setPembelianItems(updated);
                            }}
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
                          />
                        </div>
                        <div className="col-span-2 flex items-center justify-end gap-1">
                          {pembelianItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePembelianRow(idx)}
                              className="p-1.5 text-rose-500 hover:text-rose-700"
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

                  {formAnimalType === 'SAPI' && (
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
                  )}
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {formAnimalType === 'KAMBING' ? `Penggunaan Cempe (${formUnit})` : `Penggunaan Pedet (${formUnit})`}
                    </label>
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

            {/* PRINTABLE DOCUMENT BODY (MATCHES PHYSICAL BAST TEMPLATES) */}
            <div className="p-8 sm:p-12 border border-slate-200 rounded-2xl bg-white text-black font-serif space-y-6 print:border-none print:p-6 print:m-0 text-sm leading-relaxed">
              
              {/* TYPE 1: HIBAH PDF LAYOUT */}
              {viewingRecord.type === 'HIBAH' && (
                <div className="space-y-6">
                  {/* Header Title */}
                  <div className="text-center space-y-1 border-b-2 border-black pb-3">
                    <h2 className="font-bold text-base uppercase tracking-wide">
                      BERITA ACARA SERAH TERIMA SUSU HIBAH
                    </h2>
                    <p className="font-bold text-xs uppercase">
                      DARI {viewingRecord.giverName || 'TIM KERJA LAYANAN PEMASARAN'} KE {viewingRecord.receiverName}
                    </p>
                  </div>

                  {/* Document Meta Info */}
                  <div className="text-xs space-y-1 pt-2">
                    <div className="flex">
                      <span className="w-24 font-bold">Tanggal</span>
                      <span className="w-4">:</span>
                      <span>{new Date(viewingRecord.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                    </div>
                    {viewingRecord.purpose && (
                      <div className="flex">
                        <span className="w-24 font-bold">Keperluan</span>
                        <span className="w-4">:</span>
                        <span>{viewingRecord.purpose}</span>
                      </div>
                    )}
                  </div>

                  {/* Items Table */}
                  <div className="pt-2">
                    <table className="w-full border-collapse border border-black text-xs">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-black px-3 py-2 text-center w-12 font-bold">No</th>
                          <th className="border border-black px-3 py-2 text-center font-bold">Jumlah Yang Diterima (Ltr)</th>
                          <th className="border border-black px-3 py-2 text-center font-bold">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          let items = [];
                          try { items = JSON.parse(viewingRecord.items || '[]'); } catch (e) {}
                          if (items.length === 0) return <tr><td colSpan="3" className="border border-black p-2 text-center">Tidak ada data item</td></tr>;
                          return items.map((it, idx) => (
                            <tr key={idx}>
                              <td className="border border-black px-3 py-2 text-center font-bold">{idx + 1}</td>
                              <td className="border border-black px-3 py-2 text-center font-bold font-mono">{it.quantity} Liter</td>
                              <td className="border border-black px-3 py-2">{it.notes || '-'}</td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>

                  {/* Notes */}
                  {viewingRecord.notes && (
                    <div className="text-xs italic pt-1">
                      <span className="font-bold">Catatan:</span> {viewingRecord.notes}
                    </div>
                  )}

                  {/* Signature Section */}
                  <div className="pt-12 text-xs">
                    <div className="grid grid-cols-2 gap-8 text-center">
                      {/* Yang Menerima */}
                      <div className="space-y-16">
                        <div>
                          <p className="font-bold">Yang Menerima</p>
                          {viewingRecord.receiverDept && <p className="text-[11px] font-semibold">{viewingRecord.receiverDept}</p>}
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-slate-800">( {viewingRecord.receiverName} )</p>
                          {viewingRecord.receiverTitle && <p className="text-[10px]">{viewingRecord.receiverTitle}</p>}
                        </div>
                      </div>

                      {/* Yang Menyerahkan */}
                      <div className="space-y-16">
                        <div>
                          <p className="font-bold">Yang Menyerahkan</p>
                          <p className="text-[11px] font-semibold">{viewingRecord.giverDept || 'Tim Kerja Layanan Pemasaran'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-slate-800">( {viewingRecord.giverName} )</p>
                          {viewingRecord.giverTitle && <p className="text-[10px]">{viewingRecord.giverTitle}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TYPE 2: PEMBELIAN PDF LAYOUT */}
              {viewingRecord.type === 'PEMBELIAN' && (
                <div className="space-y-6">
                  {/* Header Title */}
                  <div className="text-center space-y-1 border-b-2 border-black pb-3">
                    <h2 className="font-bold text-base uppercase tracking-wide">
                      BERITA ACARA SERAH TERIMA SUSU
                    </h2>
                    <p className="font-bold text-xs uppercase">
                      SERAH TERIMA SUSU HASIL PEMBELIAN ({viewingRecord.location})
                    </p>
                  </div>

                  {/* Header Info Grid */}
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold pt-1">
                    <div className="space-y-1">
                      <div className="flex">
                        <span className="w-24 font-bold">Waktu</span>
                        <span className="w-4">:</span>
                        <span className="font-bold uppercase">{viewingRecord.period || 'Pagi'}</span>
                      </div>
                      <div className="flex">
                        <span className="w-24 font-bold">Lokasi</span>
                        <span className="w-4">:</span>
                        <span>{viewingRecord.location}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex">
                        <span className="w-24 font-bold">Tanggal</span>
                        <span className="w-4">:</span>
                        <span>{new Date(viewingRecord.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="pt-2">
                    <table className="w-full border-collapse border border-black text-xs">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-black px-3 py-2 text-center w-12 font-bold">No</th>
                          <th className="border border-black px-3 py-2 text-left font-bold">Jenis Susu</th>
                          <th className="border border-black px-3 py-2 text-center font-bold">Ukuran / Kemasan</th>
                          <th className="border border-black px-3 py-2 text-center font-bold">Jumlah</th>
                          <th className="border border-black px-3 py-2 text-center font-bold">Satuan</th>
                          <th className="border border-black px-3 py-2 text-left font-bold">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          let items = [];
                          try { items = JSON.parse(viewingRecord.items || '[]'); } catch (e) {}
                          if (items.length === 0) return <tr><td colSpan="6" className="border border-black p-2 text-center">Tidak ada data detail</td></tr>;
                          return items.map((it, idx) => (
                            <tr key={idx}>
                              <td className="border border-black px-3 py-2 text-center font-bold">{idx + 1}</td>
                              <td className="border border-black px-3 py-2 font-semibold">{it.productType || 'Susu'}</td>
                              <td className="border border-black px-3 py-2 text-center font-semibold">{it.size || '-'}</td>
                              <td className="border border-black px-3 py-2 text-center font-bold font-mono">{it.quantity}</td>
                              <td className="border border-black px-3 py-2 text-center">{it.unit || 'botol'}</td>
                              <td className="border border-black px-3 py-2">{it.notes || '-'}</td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>

                  {/* Notes */}
                  {viewingRecord.notes && (
                    <div className="text-xs italic pt-1">
                      <span className="font-bold">Catatan:</span> {viewingRecord.notes}
                    </div>
                  )}

                  {/* Signature Section */}
                  <div className="pt-12 text-xs">
                    <div className="grid grid-cols-2 gap-8 text-center">
                      {/* Yang Menerima */}
                      <div className="space-y-16">
                        <div>
                          <p className="font-bold">Yang Menerima</p>
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-slate-800">( {viewingRecord.receiverName} )</p>
                          {viewingRecord.receiverTitle && <p className="text-[10px]">{viewingRecord.receiverTitle}</p>}
                        </div>
                      </div>

                      {/* Yang Menyerahkan */}
                      <div className="space-y-16">
                        <div>
                          <p className="font-bold">Yang Menyerahkan</p>
                          <p className="text-[11px] font-semibold">{viewingRecord.giverDept || 'Tim Kerja Layanan Pemasaran'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-slate-800">( {viewingRecord.giverName} )</p>
                          {viewingRecord.giverTitle && <p className="text-[10px]">{viewingRecord.giverTitle}</p>}
                        </div>
                      </div>
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
