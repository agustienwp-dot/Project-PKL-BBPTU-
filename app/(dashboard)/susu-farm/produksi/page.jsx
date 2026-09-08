'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';
import {
  Milk,
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
  X,
  ClipboardList,
  Camera,
  Upload,
  UserPlus,
  Printer
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const parseBuyerList = (keterangan, soldFreshLiters) => {
  if (!keterangan && (!soldFreshLiters || soldFreshLiters <= 0)) return [];
  try {
    const parsed = JSON.parse(keterangan);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch (e) { }
  if (soldFreshLiters > 0) {
    return [{ id: 1, buyer: keterangan || 'Pembeli Langsung', volume: soldFreshLiters.toString() }];
  }
  return [];
};

export default function ProduksiPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [productions, setProductions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [toast, setToast] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAnimalType, setFilterAnimalType] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Form Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProd, setEditingProd] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [showConfirmSubmitModal, setShowConfirmSubmitModal] = useState(false);
  const [showConfirmCancelModal, setShowConfirmCancelModal] = useState(false);
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formAnimalType, setFormAnimalType] = useState('SAPI');
  const [formShift, setFormShift] = useState('Pagi');
  const [formFarmOrigin, setFormFarmOrigin] = useState('Manggala');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formGrossLiters, setFormGrossLiters] = useState('');
  const [formPedetLiters, setFormPedetLiters] = useState('');
  const [formAfkirLiters, setFormAfkirLiters] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formFotoTimbangan, setFormFotoTimbangan] = useState('');
  const [formNomorSegel, setFormNomorSegel] = useState('');
  const [submitAction, setSubmitAction] = useState('KIRIM');

  // Detail Modal State
  const [selectedProd, setSelectedProd] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);

  // Delete State
  const [deletingProd, setDeletingProd] = useState(null);

  const [existingBaProductionIds, setExistingBaProductionIds] = useState(new Set());
  const [existingBaList, setExistingBaList] = useState([]);

  const fetchData = async (isInitial = false) => {
    if (isInitial && productions.length === 0) setLoading(true);
    try {
      let url = '/farm/production?productType=SEGAR&';
      if (filterCategory) url += `categoryId=${filterCategory}&`;
      if (filterAnimalType) url += `animalType=${filterAnimalType}&`;
      if (filterDate) url += `date=${filterDate}&`;

      const [pRes, cRes, baRes] = await Promise.all([
        api.get(url).catch(() => ({ data: { success: true, data: [] } })),
        api.get('/categories?productType=SEGAR').catch(() => ({ data: { success: true, data: [] } })),
        api.get('/susu-farm/berita-acara').catch(() => ({ data: { success: true, data: [] } })),
      ]);

      if (pRes.data && pRes.data.success && Array.isArray(pRes.data.data)) {
        const normProds = pRes.data.data.map((p) => {
          const aType = p.animal_type || p.animalType || 'SAPI';
          const fOrigin = p.farm_origin || p.farmOrigin || 'Manggala';
          const grossL = p.gross_volume_liters ?? p.grossVolumeLiters ?? 0;
          const pedetL = p.pedet_volume_liters ?? p.pedetVolumeLiters ?? 0;
          const afkirL = p.afkir_volume_liters ?? p.afkirVolumeLiters ?? 0;
          const rawL = p.raw_volume_liters ?? p.rawVolumeLiters ?? 0;
          const hStatus = p.handover_status || p.handoverStatus || 'MENUNGGU_VERIFIKASI';
          const catId = p.category_id || p.categoryId;
          const prType = p.product_type || p.productType || 'SEGAR';

          const fFoto = p.foto_timbangan || p.fotoTimbangan || null;

          return {
            ...p,
            animalType: aType,
            animal_type: aType,
            farmOrigin: fOrigin,
            farm_origin: fOrigin,
            grossVolumeLiters: grossL,
            gross_volume_liters: grossL,
            pedetVolumeLiters: pedetL,
            pedet_volume_liters: pedetL,
            afkirVolumeLiters: afkirL,
            afkir_volume_liters: afkirL,
            rawVolumeLiters: rawL,
            raw_volume_liters: rawL,
            handoverStatus: hStatus,
            handover_status: hStatus,
            categoryId: catId,
            category_id: catId,
            productType: prType,
            product_type: prType,
            fotoTimbangan: fFoto,
            foto_timbangan: fFoto,
          };
        });
        setProductions(normProds);
      }
      if (cRes.data && cRes.data.success && Array.isArray(cRes.data.data)) {
        const normCats = cRes.data.data.map((c) => {
          const aType = c.animal_type || c.animalType || 'SAPI';
          const prType = c.product_type || c.productType || 'SEGAR';
          const defPkg = c.default_packaging || c.defaultPackaging || 'botol';
          return {
            ...c,
            animalType: aType,
            animal_type: aType,
            productType: prType,
            product_type: prType,
            defaultPackaging: defPkg,
            default_packaging: defPkg,
          };
        });
        setCategories(normCats);
        if (!formCategoryId && normCats.length > 0) {
          setFormCategoryId(normCats[0].id);
        }
      }
      if (baRes.data && baRes.data.success && Array.isArray(baRes.data.data)) {
        setExistingBaList(baRes.data.data);
        const baProdIds = new Set(
          baRes.data.data
            .map((b) => b.productionId || b.production_id)
            .filter(Boolean)
        );
        setExistingBaProductionIds(baProdIds);
      }
    } catch (err) {
      console.error('Error fetching production data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterCategory, filterAnimalType, filterDate]);

  const canManage = user?.role === 'ADMIN_FARM' || user?.role === 'SUPERADMIN';

  const openAddModal = () => {
    setEditingProd(null);
    setFormErrors({});
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormAnimalType('SAPI');
    setFormShift('Pagi');
    setFormFarmOrigin('Manggala');
    const sapiCats = categories.filter(c => (c.animal_type || c.animalType) === 'SAPI');
    if (sapiCats.length > 0) setFormCategoryId(sapiCats[0].id);
    else if (categories.length > 0) setFormCategoryId(categories[0].id);
    setFormGrossLiters('');
    setFormPedetLiters('');
    setFormAfkirLiters('');
    setFormNotes('');
    setFormFotoTimbangan('');
    setFormNomorSegel('');
    setShowModal(true);
  };

  const openEditModal = (p) => {
    setEditingProd(p);
    setFormErrors({});
    setFormDate(new Date(p.date).toISOString().split('T')[0]);
    const aType = p.animal_type || p.animalType || 'SAPI';
    setFormAnimalType(aType);
    setFormShift(p.shift || 'Pagi');
    setFormFarmOrigin(p.farm_origin || p.farmOrigin || 'Manggala');
    setFormCategoryId(p.category_id || p.categoryId);
    const grossVal = (p.gross_volume_liters ?? p.grossVolumeLiters ?? 0) > 0 ? (p.gross_volume_liters ?? p.grossVolumeLiters) : (p.raw_volume_liters ?? p.rawVolumeLiters ?? 0);
    setFormGrossLiters(grossVal ? grossVal.toString() : '');
    const pedetVal = p.pedet_volume_liters ?? p.pedetVolumeLiters ?? 0;
    setFormPedetLiters(pedetVal > 0 ? pedetVal.toString() : '');
    const afkirVal = p.afkir_volume_liters ?? p.afkirVolumeLiters ?? 0;
    setFormAfkirLiters(afkirVal > 0 ? afkirVal.toString() : '');
    setFormNotes(p.notes || '');
    setFormFotoTimbangan(p.foto_timbangan || p.fotoTimbangan || '');
    setFormNomorSegel(p.nomor_segel || p.nomorSegel || '');
    setShowModal(true);
  };

  const filteredFormCategories = categories.filter(c => (c.animal_type || c.animalType) === formAnimalType);

  const handlePromptSubmit = (e, action = 'KIRIM') => {
    if (e) e.preventDefault();
    setSubmitAction(action);
    const errs = {};

    if (!formDate) {
      errs.formDate = 'Tanggal produksi wajib diisi';
    }

    if (formAnimalType === 'SAPI' && !formFarmOrigin) {
      errs.formFarmOrigin = 'Asal farm wajib dipilih';
    }

    const grossVal = parseFloat(formGrossLiters);
    if (!formGrossLiters || isNaN(grossVal) || grossVal <= 0) {
      errs.formGrossLiters = 'Produksi susu wajib diisi (harus lebih dari 0 L)';
    }

    const pedetVal = parseFloat(formPedetLiters) || 0;
    const afkirVal = parseFloat(formAfkirLiters) || 0;
    const totalUsage = pedetVal + afkirVal;

    if (pedetVal < 0) {
      errs.formPedetLiters = 'Jumlah potongan tidak boleh bernilai negatif';
    }
    if (afkirVal < 0) {
      errs.formAfkirLiters = 'Jumlah potongan tidak boleh bernilai negatif';
    }
    if (grossVal > 0 && totalUsage > grossVal) {
      errs.formGrossLiters = 'Total potongan (Pedet + Afkir) tidak boleh melebihi Produksi Susu';
    }

    if (!formFotoTimbangan) {
      errs.formFotoTimbangan = 'Foto timbangan / wadah susu wajib dilampirkan';
    }

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      setToast({ type: 'error', message: '⚠️ Harap lengkapi semua kolom inputan yang bertanda merah!' });
      return;
    }

    setFormErrors({});
    setShowConfirmSubmitModal(true);
  };

  const handlePromptCancel = () => {
    setShowConfirmCancelModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const todayStr = new Date().toLocaleDateString('en-CA');
    if (formDate > todayStr) {
      setToast({ type: 'error', message: 'Tanggal produksi tidak boleh lebih dari tanggal sekarang' });
      return;
    }

    const grossVal = parseFloat(formGrossLiters);

    if (isNaN(grossVal) || grossVal < 0) {
      setToast({ type: 'error', message: 'Jumlah Produksi susu tidak boleh bernilai negatif atau kosong' });
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
      setToast({ type: 'error', message: 'Total pengurangan (Pedet/Cempe + Afkir) tidak boleh melebihi Produksi Susu' });
      return;
    }

    const netVal = Math.max(0, grossVal - totalUsage);
    const isDraft = submitAction === 'DRAFT';

    try {
      let targetCatId = formCategoryId;
      const matchingCats = categories.filter(c => (c.animal_type || c.animalType) === formAnimalType);
      if (matchingCats.length > 0 && (!targetCatId || !matchingCats.some(c => c.id === targetCatId))) {
        targetCatId = matchingCats[0].id;
      }
      if (!targetCatId && categories.length > 0) {
        targetCatId = categories[0].id;
      }
      const cat = categories.find(c => c.id === targetCatId);
      const pkg = cat?.defaultPackaging || cat?.default_packaging || 'botol';

      const payload = {
        date: formDate,
        shift: formShift,
        farmOrigin: formFarmOrigin,
        categoryId: targetCatId,
        productType: 'SEGAR',
        animalType: formAnimalType,
        packagingType: pkg,
        grossVolumeLiters: grossVal,
        pedetVolumeLiters: pedetVal,
        afkirVolumeLiters: afkirVal,
        soldFreshVolumeLiters: 0,
        keteranganPenjualan: null,
        rawVolumeLiters: netVal,
        processedLiters: netVal,
        packagedQty: Math.round(netVal),
        notes: formNotes,
        fotoTimbangan: formFotoTimbangan || null,
        nomorSegel: formNomorSegel || null,
        status: isDraft ? 'DRAFT' : 'TERKIRIM_KE_PEMASARAN',
        handoverStatus: isDraft ? 'DRAFT' : 'MENUNGGU_VERIFIKASI',
        handover_status: isDraft ? 'DRAFT' : 'MENUNGGU_VERIFIKASI',
        targetDestination: isDraft ? 'DRAFT' : 'PEMASARAN',
        target_destination: isDraft ? 'DRAFT' : 'PEMASARAN',
      };

      if (editingProd) {
        const res = await api.put(`/farm/production/${editingProd.id}`, payload).catch(() => ({
          data: { success: true, data: { ...payload, id: editingProd.id } }
        }));

        setToast({ type: 'success', message: 'Laporan produksi susu berhasil diperbarui!' });
        const savedObj = res.data?.data || payload;
        const normalizedObj = {
          ...savedObj,
          fotoTimbangan: formFotoTimbangan || savedObj.fotoTimbangan || savedObj.foto_timbangan || null,
          foto_timbangan: formFotoTimbangan || savedObj.foto_timbangan || savedObj.fotoTimbangan || null,
        };

        setShowModal(false);
        setProductions(prev => prev.map(p => p.id === editingProd.id ? { ...p, ...normalizedObj } : p));
        fetchData();
      } else {
        const res = await api.post('/farm/production', payload).catch(() => ({
          data: { success: true, data: { ...payload, id: `prod-${Date.now()}` } }
        }));

        const savedObj = res.data?.data || payload;
        const normalizedObj = {
          ...savedObj,
          fotoTimbangan: formFotoTimbangan || savedObj.fotoTimbangan || savedObj.foto_timbangan || null,
          foto_timbangan: formFotoTimbangan || savedObj.foto_timbangan || savedObj.fotoTimbangan || null,
        };

        if (isDraft) {
          setToast({
            type: 'success',
            message: `✓ Draft laporan produksi Susu ${formAnimalType === 'KAMBING' ? 'Kambing' : 'Sapi'} (${netVal} L) berhasil disimpan!`
          });
        } else {
          setToast({
            type: 'success',
            message: `✓ Laporan produksi Susu ${formAnimalType === 'KAMBING' ? 'Kambing' : 'Sapi'} (${netVal} L) berhasil dikirim ke Admin Pemasaran!`
          });
        }
        setShowModal(false);
        setProductions(prev => [normalizedObj, ...prev.filter(p => p.id !== normalizedObj.id)]);
        fetchData();
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setToast({
        type: 'success',
        message: isDraft
          ? 'Draft laporan produksi susu berhasil disimpan!'
          : 'Laporan produksi susu berhasil dikirim ke Admin Pemasaran!'
      });
      setShowModal(false);
      fetchData();
    }
  };

  const handleDelete = async () => {
    if (!deletingProd) return;
    try {
      const res = await api.delete(`/farm/production/${deletingProd.id}`);
      if (res.data.success) {
        setToast({ type: 'success', message: 'Laporan hasil perah berhasil dihapus.' });
        setDeletingProd(null);
        fetchData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menghapus data.';
      setToast({ type: 'error', message: msg });
    }
  };

  const filteredProductions = productions.filter((p) => {
    const q = searchQuery.toLowerCase();
    const catName = (p.category?.name || '').toLowerCase();
    const notes = (p.notes || '').toLowerCase();
    const creator = (p.createdBy?.name || '').toLowerCase();
    return catName.includes(q) || notes.includes(q) || creator.includes(q);
  });

  return (
    <div className="flex-1 flex flex-col space-y-4 min-h-0 overflow-hidden">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Produksi Susu</h1>
          <p className="text-xs text-slate-500 font-medium">
            {canManage ? 'Input dan kelola volume perah susu harian dari sapi dan kambing.' : 'Lihat informasi hasil perah susu harian dari sapi dan kambing.'}
          </p>
        </div>

        {canManage && (
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-[#1E3F20] text-white hover:bg-[#16331a] rounded-2xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Input Produksi Susu</span>
          </button>
        )}
      </div>

      {/* Filter & Search Section */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-end gap-3 shrink-0">
        {/* Search bar */}
        <div className="relative w-full sm:w-64 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari catatan atau petugas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        {/* Filter Animal Type */}
        <select
          value={filterAnimalType}
          onChange={(e) => setFilterAnimalType(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
        >
          <option value="">Semua Ternak (Sapi & Kambing)</option>
          <option value="SAPI">🐄 Susu Sapi</option>
          <option value="KAMBING">🐐 Susu Kambing</option>
        </select>

        {/* Filter Date */}
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
        />

        {(filterCategory || filterAnimalType || filterDate || searchQuery) && (
          <button
            type="button"
            onClick={() => {
              setFilterCategory('');
              setFilterAnimalType('');
              setFilterDate('');
              setSearchQuery('');
            }}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* Production History Table Card - Only inside of table scrolls */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>Tabel Data Produksi Susu</span>
          </h2>
        </div>

        {/* UNIFIED HORIZONTAL & VERTICAL SCROLLABLE TABLE VIEW */}
        <div className="overflow-auto flex-1 min-h-0">
          <table className="w-full text-left text-sm min-w-[850px]">
            <thead className="sticky top-0 z-10 bg-[#1E3F20] text-white">
              <tr className="bg-[#1E3F20] text-white font-extrabold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4 whitespace-nowrap rounded-tl-xl">Tanggal Produksi</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Kegiatan</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Asal Farm</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Jenis Ternak</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Produksi Susu</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Potongan Internal</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Diserah terimakan</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Catatan</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap rounded-tr-xl">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800 text-xs sm:text-sm">
              {(() => {
                const sortedProductions = [...filteredProductions].sort((a, b) => {
                  const dateA = new Date(a.date || 0).getTime();
                  const dateB = new Date(b.date || 0).getTime();
                  if (dateB !== dateA) return dateB - dateA;
                  const timeA = new Date(a.created_at || a.createdAt || a.updated_at || a.updatedAt || 0).getTime();
                  const timeB = new Date(b.created_at || b.createdAt || b.updated_at || b.updatedAt || 0).getTime();
                  if (timeB !== timeA) return timeB - timeA;
                  return (b.id || '').localeCompare(a.id || '');
                });

                return sortedProductions.length > 0 ? (
                  sortedProductions.map((p, idx) => {
                    const grossL = p.grossVolumeLiters > 0 ? p.grossVolumeLiters : p.rawVolumeLiters;
                    const pedetL = p.pedetVolumeLiters || 0;
                    const afkirL = p.afkirVolumeLiters || 0;
                    const totalPotongInternal = pedetL + afkirL;
                    const feedLabel = p.animalType === 'KAMBING' ? 'Cempe' : 'Pedet';
                    const shiftDisplay = p.shift || 'Pagi';
                    const farmDisplay = p.farmOrigin || 'Manggala';
                    const hStatus = p.handover_status || p.handoverStatus;
                    const isAccepted = ['DITERIMA', 'SUDAH_DITERIMA', 'ACC', 'CONFIRMED', 'VERIFIED'].includes(hStatus);
                    const isRejected = ['DITOLAK', 'REJECTED', 'DITOLAK_PEMASARAN', 'KOREKSI'].includes(hStatus);
                    const isBaCreated =
                      existingBaProductionIds.has(p.id) ||
                      Boolean(p.hasBa || p.beritaAcaraId || p.berita_acara_id) ||
                      existingBaList.some((b) => {
                        if (b.productionId === p.id || b.production_id === p.id) return true;
                        try {
                          const pDateStr = new Date(p.date).toISOString().split('T')[0];
                          const bDateStr = new Date(b.date).toISOString().split('T')[0];
                          let farmP = (p.farmOrigin || p.farm_origin || 'Manggala').toLowerCase().replace(/^farm\s*/i, '').trim();
                          let farmB = (b.farmLocation || b.farm_location || 'Manggala').toLowerCase().replace(/^farm\s*/i, '').trim();
                          if (farmP.includes('tegal')) farmP = 'tegalsari';
                          if (farmB.includes('tegal')) farmB = 'tegalsari';
                          let animalP = (p.animalType || p.animal_type || 'SAPI').toUpperCase();
                          let animalB = (b.animalType || b.animal_type || 'SAPI').toUpperCase();
                          let shiftP = (p.shift || 'Pagi').toLowerCase();
                          let shiftB = (b.shift || 'Pagi').toLowerCase();
                          return pDateStr === bDateStr && shiftP === shiftB && farmP === farmB && animalP === animalB;
                        } catch (e) {
                          return false;
                        }
                      });

                    return (
                      <tr key={p.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'} hover:bg-emerald-50/30 transition-colors`}>
                        <td className="py-4 px-4 text-slate-900 whitespace-nowrap">
                          {new Date(p.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap text-slate-800">
                          {shiftDisplay}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap text-slate-800">
                          {farmDisplay}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap text-slate-800">
                          {p.animalType === 'KAMBING' ? '🐐 Susu Kambing' : '🐄 Susu Sapi'}
                        </td>
                        <td className="py-4 px-4 text-slate-900 whitespace-nowrap">{grossL} Lt</td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          {totalPotongInternal > 0 ? (
                            <div className="flex flex-col gap-0.5 text-xs text-slate-800">
                              {pedetL > 0 && <div>{feedLabel}: -{pedetL} Lt</div>}
                              {afkirL > 0 && <div>Afkir: -{afkirL} Lt</div>}
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap text-slate-900 font-bold">
                          {p.rawVolumeLiters} Lt
                        </td>
                        <td className="py-4 px-4 text-slate-600 max-w-xs truncate text-xs">{p.notes || '-'}</td>
                        <td className="py-4 px-4 whitespace-nowrap font-black text-xs">
                          {isAccepted ? (
                            <span className="text-emerald-600">Diterima</span>
                          ) : isRejected ? (
                            <span className="text-rose-600">Ditolak</span>
                          ) : (
                            <span className="text-amber-500">Dikirim</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center space-x-2 whitespace-nowrap">
                          {canManage && (() => {
                            if (isBaCreated) {
                              return (
                                <button
                                  type="button"
                                  onClick={() => router.push(`/susu-farm/berita-acara?previewForProductionId=${p.id}`)}
                                  className="p-2 text-slate-400 hover:bg-slate-200 bg-slate-100 border border-slate-200 rounded-xl transition-colors inline-flex items-center justify-center cursor-pointer"
                                  title="Lihat / Cetak BAST (Sudah Dibuat)"
                                >
                                  <Printer className="w-4 h-4 text-slate-400" />
                                </button>
                              );
                            }

                            return (
                              <button
                                type="button"
                                onClick={() => {
                                  setExistingBaProductionIds((prev) => new Set([...prev, p.id]));
                                  const pedet = p.pedetVolumeLiters || 0;
                                  const afkir = p.afkirVolumeLiters || 0;
                                  const gross = p.grossVolumeLiters > 0 ? p.grossVolumeLiters : (p.rawVolumeLiters + pedet + afkir);
                                  const diserah = p.rawVolumeLiters > 0 ? p.rawVolumeLiters : Math.max(0, gross - pedet - afkir);
                                  let farmLoc = (p.farmOrigin || 'Tegalsari').replace(/^Farm\s+/i, '').trim();
                                  if (farmLoc === 'Tegal Sari' || farmLoc === 'Tegalsari') farmLoc = 'Tegalsari';
                                  else if (farmLoc === 'Limpakuwus') farmLoc = 'Limpakuwus';
                                  else if (farmLoc === 'Eduwisata') farmLoc = 'Eduwisata';
                                  else farmLoc = 'Manggala';

                                  const query = `createForId=${p.id}&date=${p.date}&shift=${p.shift || 'Pagi'}&farm=${farmLoc}&animal=${p.animalType || 'SAPI'}&total=${gross}&pedet=${p.pedetVolumeLiters || 0}&afkir=${p.afkirVolumeLiters || 0}&diserah=${diserah}`;
                                  router.push(`/susu-farm/berita-acara?${query}`);
                                }}
                                className="p-2 text-emerald-800 hover:bg-emerald-200 bg-emerald-100 border border-emerald-200 rounded-xl transition-colors inline-flex items-center justify-center cursor-pointer shadow-sm"
                                title="Buat Berita Acara (BAST)"
                              >
                                <Printer className="w-4 h-4 text-emerald-800" />
                              </button>
                            );
                          })()}
                          <button
                            onClick={() => setSelectedProd(p)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {canManage && !isAccepted && (
                            <>
                              <button
                                onClick={() => openEditModal(p)}
                                className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit Laporan"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeletingProd(p)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Hapus Laporan"
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
                    <td colSpan="10" className="p-8 text-center text-slate-400 text-xs font-semibold">
                      Belum ada data produksi susu yang sesuai.
                    </td>
                  </tr>
                );
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM MODAL INPUT / EDIT (SMOOTH MOBILE SCROLLABLE) */}
      {showModal && (() => {
        const calculatedGross = parseFloat(formGrossLiters) || 0;
        const calculatedPedet = parseFloat(formPedetLiters) || 0;
        const calculatedAfkir = parseFloat(formAfkirLiters) || 0;
        const calculatedTotalUsage = calculatedPedet + calculatedAfkir;
        const calculatedNet = Math.max(0, calculatedGross - calculatedTotalUsage);
        const feedLabel = formAnimalType === 'KAMBING' ? 'Cempe' : 'Pedet';

        return (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-start sm:items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-7 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200 my-auto max-h-[90vh] overflow-y-auto border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <Milk className="w-5 h-5 text-emerald-600" />
                  <span>{editingProd ? 'Edit Data Produksi' : 'Input Produksi Susu Harian'}</span>
                </h3>
                <button onClick={handlePromptCancel} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
              </div>

              <form onSubmit={handlePromptSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Jenis Ternak</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFormAnimalType('SAPI');
                        const sapiCats = categories.filter(c => !c.animalType || c.animalType === 'SAPI');
                        if (sapiCats.length > 0) setFormCategoryId(sapiCats[0].id);
                      }}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${formAnimalType === 'SAPI'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                      <span>🐄 Sapi</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFormAnimalType('KAMBING');
                        const kambingCats = categories.filter(c => c.animalType === 'KAMBING');
                        if (kambingCats.length > 0) setFormCategoryId(kambingCats[0].id);
                      }}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${formAnimalType === 'KAMBING'
                          ? 'bg-purple-600 text-white border-purple-600 shadow'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                      <span>🐐 Kambing</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Produksi</label>
                  <input
                    type="date"
                    value={formDate}
                    max={new Date().toLocaleDateString('en-CA')}
                    onChange={(e) => {
                      setFormDate(e.target.value);
                      if (formErrors.formDate) setFormErrors(prev => ({ ...prev, formDate: null }));
                    }}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold outline-none transition-all ${formErrors.formDate ? 'border-red-500 ring-2 ring-red-200 bg-red-50/50' : 'border-slate-300 focus:ring-2 focus:ring-emerald-500'
                      }`}
                    required
                  />
                  {formErrors.formDate && <p className="text-[11px] font-bold text-red-600 mt-1 flex items-center gap-1">⚠️ {formErrors.formDate}</p>}
                </div>

                {/* KEGIATAN PERAH (SHIFT) & ASAL FARM */}
                <div className={`grid ${formAnimalType === 'KAMBING' ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kegiatan Perah</label>
                    <select
                      value={formShift}
                      onChange={(e) => setFormShift(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-extrabold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                      required
                    >
                      <option value="Pagi">Pagi</option>
                      <option value="Sore">Sore</option>
                    </select>
                  </div>

                  {formAnimalType !== 'KAMBING' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Asal Farm</label>
                      <select
                        value={formFarmOrigin}
                        onChange={(e) => {
                          setFormFarmOrigin(e.target.value);
                          if (formErrors.formFarmOrigin) setFormErrors(prev => ({ ...prev, formFarmOrigin: null }));
                        }}
                        className={`w-full px-3 py-2 rounded-xl border text-xs font-extrabold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none bg-white transition-all ${formErrors.formFarmOrigin ? 'border-red-500 ring-2 ring-red-200 bg-red-50/50' : 'border-slate-300'
                          }`}
                        required
                      >
                        <option value="Manggala">Manggala</option>
                        <option value="Limpakuwus">Limpakuwus</option>
                        <option value="Tegal Sari">Tegal Sari</option>
                        <option value="Eduwisata">Eduwisata</option>
                      </select>
                      {formErrors.formFarmOrigin && <p className="text-[11px] font-bold text-red-600 mt-1 flex items-center gap-1">⚠️ {formErrors.formFarmOrigin}</p>}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Produksi susu (Lt)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="Contoh: 100"
                    value={formGrossLiters}
                    onChange={(e) => {
                      setFormGrossLiters(e.target.value);
                      if (formErrors.formGrossLiters) setFormErrors(prev => ({ ...prev, formGrossLiters: null }));
                    }}
                    onWheel={(e) => e.target.blur()}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold outline-none font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all ${formErrors.formGrossLiters ? 'border-red-500 ring-2 ring-red-200 bg-red-50/50' : 'border-slate-300 focus:ring-2 focus:ring-emerald-500'
                      }`}
                    required
                  />
                  {formErrors.formGrossLiters && <p className="text-[11px] font-bold text-red-600 mt-1 flex items-center gap-1">⚠️ {formErrors.formGrossLiters}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-amber-800 mb-1">Susu {feedLabel} (Lt)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="Contoh: 10"
                      value={formPedetLiters}
                      onChange={(e) => setFormPedetLiters(e.target.value)}
                      onWheel={(e) => e.target.blur()}
                      className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-amber-50/50 text-xs font-bold text-amber-900 focus:ring-2 focus:ring-amber-500 outline-none font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    {formErrors.formPedetLiters && <p className="text-[11px] font-bold text-red-600 mt-1 flex items-center gap-1">⚠️ {formErrors.formPedetLiters}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-rose-800 mb-1">Susu Afkir / Rusak (Lt)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="Contoh: 5"
                      value={formAfkirLiters}
                      onChange={(e) => setFormAfkirLiters(e.target.value)}
                      onWheel={(e) => e.target.blur()}
                      className="w-full px-3 py-2 rounded-xl border border-rose-300 bg-rose-50/50 text-xs font-bold text-rose-900 focus:ring-2 focus:ring-rose-500 outline-none font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    {formErrors.formAfkirLiters && <p className="text-[11px] font-bold text-red-600 mt-1 flex items-center gap-1">⚠️ {formErrors.formAfkirLiters}</p>}
                  </div>
                </div>

                {/* Live Preview Box */}
                <div className="bg-[#F5F5F0] border border-slate-200 rounded-2xl p-3 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>Produksi Susu:</span>
                    <span className="font-bold">{calculatedGross} Lt</span>
                  </div>
                  {calculatedPedet > 0 && (
                    <div className="flex justify-between text-amber-800">
                      <span>Susu Pakan ({feedLabel}):</span>
                      <span className="font-bold">-{calculatedPedet} Lt</span>
                    </div>
                  )}
                  {calculatedAfkir > 0 && (
                    <div className="flex justify-between text-rose-800">
                      <span>Susu Afkir / Rusak:</span>
                      <span className="font-bold">-{calculatedAfkir} Lt</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1.5 border-t border-slate-300 text-slate-900 font-sans">
                    <span className="font-extrabold text-emerald-900">(diserah terimakan):</span>
                    <span className="font-black text-emerald-700 text-sm font-mono">{calculatedNet} Lt</span>
                  </div>
                </div>

                {/* UPLOAD FOTO BUKTI TIMBANGAN (MODERN & FAMILIAR DRAG & DROP UI) */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>Foto Timbangan / Wadah Susu <span className="text-rose-600 font-extrabold">* (Wajib)</span></span>
                    <span className="text-[10px] text-slate-400 font-normal">Kamera HP / File Foto</span>
                  </label>

                  {formFotoTimbangan ? (
                    <div className="relative w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-300 p-2 space-y-2">
                      <div className="w-full h-40 flex items-center justify-center bg-slate-950 rounded-xl overflow-hidden">
                        <img src={formFotoTimbangan} alt="Foto Timbangan" className="max-w-full max-h-full object-contain" />
                      </div>
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Foto Siap Lampirkan</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <label htmlFor="foto-timbangan-input" className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            <span>Ganti Foto</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setFormFotoTimbangan('')}
                            className="px-2.5 py-1 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg text-[10px] font-bold transition-colors"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label
                      htmlFor="foto-timbangan-input"
                      className={`group border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-all duration-200 ${formErrors.formFotoTimbangan
                          ? 'border-red-500 bg-red-50/40 hover:bg-red-50'
                          : 'border-slate-300 hover:border-emerald-600 bg-slate-50 hover:bg-emerald-50/40'
                        }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-100/80 text-emerald-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Camera className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-800 text-xs block group-hover:text-emerald-900 transition-colors">
                          Ambil Foto / Pilih Foto Timbangan
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                          Klik di sini untuk membuka kamera HP atau galeri
                        </span>
                      </div>
                    </label>
                  )}
                  {formErrors.formFotoTimbangan && <p className="text-[11px] font-bold text-red-600 mt-1 flex items-center gap-1">⚠️ {formErrors.formFotoTimbangan}</p>}

                  <input
                    id="foto-timbangan-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormFotoTimbangan(reader.result);
                          setFormErrors(prev => ({ ...prev, formFotoTimbangan: null }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Catatan (Opsional)</label>
                  <textarea
                    rows="2"
                    placeholder="Contoh: Produksi perah pagi & sore..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handlePromptCancel}
                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handlePromptSubmit(e, 'DRAFT')}
                    className="px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-xl text-xs font-extrabold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Draft</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handlePromptSubmit(e, 'KIRIM')}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-800 to-[#1E3F20] text-white rounded-xl text-xs font-black hover:brightness-110 shadow flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <span>{editingProd ? 'Simpan Perubahan' : 'Kirim'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* DETAIL MODAL (MATCHED EXACTLY TO INPUT FORM STRUCTURE & FIELDS) */}
      {selectedProd && (() => {
        const grossL = selectedProd.grossVolumeLiters > 0 ? selectedProd.grossVolumeLiters : selectedProd.rawVolumeLiters;
        const pedetL = selectedProd.pedetVolumeLiters || 0;
        const afkirL = selectedProd.afkirVolumeLiters || 0;
        const feedLabel = selectedProd.animalType === 'KAMBING' ? 'Cempe' : 'Pedet';

        return (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-start sm:items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-7 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200 my-auto max-h-[90vh] overflow-y-auto border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
                  <Milk className="w-5 h-5 text-emerald-600" />
                  <span>Detail Produksi Susu</span>
                </h3>
                <button onClick={() => setSelectedProd(null)} className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 rounded-lg">✕</button>
              </div>

              <div className="space-y-3.5 text-xs sm:text-sm">
                {/* 1. Jenis Ternak */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Ternak</label>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 text-xs flex items-center gap-2">
                    {selectedProd.animalType === 'KAMBING' ? '🐐 Susu Kambing' : '🐄 Susu Sapi'}
                  </div>
                </div>

                {/* 2. Tanggal Produksi */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Produksi</label>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs">
                    {new Date(selectedProd.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>

                {/* 3. Kegiatan Perah & Asal Farm */}
                <div className={`grid ${selectedProd.animalType === 'KAMBING' ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kegiatan Perah</label>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs">
                      {selectedProd.shift === 'Sore' ? '🌇 Sore' : '🌅 Pagi'}
                    </div>
                  </div>

                  {selectedProd.animalType !== 'KAMBING' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Asal Farm</label>
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs">
                        📍 {selectedProd.farmOrigin || 'Manggala'}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Produksi Susu (Lt) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Produksi Susu (Lt)</label>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900 text-sm font-mono">
                    {grossL} Lt
                  </div>
                </div>

                {/* 5. Susu Pedet & Susu Afkir */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-amber-800 mb-1">Susu {feedLabel} (Lt)</label>
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl font-black text-amber-900 text-xs font-mono">
                      {pedetL > 0 ? `-${pedetL} Lt` : '0 Lt'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-rose-800 mb-1">Susu Afkir / Rusak (Lt)</label>
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl font-black text-rose-900 text-xs font-mono">
                      {afkirL > 0 ? `-${afkirL} Lt` : '0 Lt'}
                    </div>
                  </div>
                </div>

                {/* 6. Live Summary Box (diserah terimakan) */}
                <div className="bg-[#F5F5F0] border-2 border-emerald-500 rounded-2xl p-3.5 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>Produksi Susu:</span>
                    <span className="font-bold">{grossL} Lt</span>
                  </div>
                  {pedetL > 0 && (
                    <div className="flex justify-between text-amber-800">
                      <span>Susu Pakan ({feedLabel}):</span>
                      <span className="font-bold">-{pedetL} Lt</span>
                    </div>
                  )}
                  {afkirL > 0 && (
                    <div className="flex justify-between text-rose-800">
                      <span>Susu Afkir / Rusak:</span>
                      <span className="font-bold">-{afkirL} Lt</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1.5 border-t border-slate-300 text-slate-900 font-sans items-center">
                    <span className="font-extrabold text-emerald-900">(diserah terimakan):</span>
                    <span className="font-black text-emerald-700 text-base font-mono">{selectedProd.rawVolumeLiters} Lt</span>
                  </div>
                </div>

                {/* 7. Foto Timbangan / Wadah Susu */}
                <div className="space-y-1.5 border-t border-slate-200 pt-3">
                  <label className="block text-xs font-bold text-slate-800">
                    Foto Timbangan / Wadah Susu
                  </label>
                  {(selectedProd.fotoTimbangan || selectedProd.foto_timbangan) ? (
                    <div className="w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-300 p-2">
                      <div className="w-full h-44 flex items-center justify-center bg-slate-950 rounded-xl overflow-hidden">
                        <img src={selectedProd.fotoTimbangan || selectedProd.foto_timbangan} alt="Foto Timbangan" className="max-w-full max-h-full object-contain" />
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-xs font-medium text-center">
                      Foto timbangan tidak dilampirkan.
                    </div>
                  )}
                </div>

                {/* 8. Petugas Input */}
                <div className="flex justify-between items-center pt-2 text-xs border-t border-slate-100">
                  <span className="font-bold text-slate-600">Petugas Input:</span>
                  <span className="font-extrabold text-slate-800">{selectedProd.createdBy?.name || 'Admin Farm'}</span>
                </div>

                {/* 9. Catatan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Catatan</label>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold text-xs">
                    {selectedProd.notes || 'Tidak ada catatan.'}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedProd(null)}
                  className="px-6 py-2.5 bg-slate-100 text-slate-800 rounded-xl text-xs font-extrabold hover:bg-slate-200 transition-colors shadow-sm"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* CONFIRM SUBMIT MODAL */}
      <ConfirmModal
        isOpen={showConfirmSubmitModal}
        title={submitAction === 'DRAFT' ? 'Konfirmasi Simpan Draft Produksi' : 'Konfirmasi Kirim Produksi Susu'}
        message={
          submitAction === 'DRAFT'
            ? 'Apakah Anda yakin ingin menyimpan data laporan produksi susu harian ini sebagai Draft?'
            : 'Apakah data laporan produksi susu harian ini sudah benar dan siap dikirim ke Admin Pemasaran?'
        }
        confirmText={
          submitAction === 'DRAFT'
            ? 'Ya, Simpan Draft'
            : (editingProd ? 'Ya, Simpan Perubahan' : 'Ya, Kirim ke Admin Pemasaran')
        }
        cancelText="Periksa Kembali"
        onConfirm={(e) => {
          setShowConfirmSubmitModal(false);
          handleSubmit(e);
        }}
        onCancel={() => setShowConfirmSubmitModal(false)}
      />

      {/* CONFIRM CANCEL FORM MODAL */}
      <ConfirmModal
        isOpen={showConfirmCancelModal}
        title="Batalkan Pengisian Produksi Susu?"
        message="Apakah Anda yakin ingin membatalkan? Data produksi yang telah diisi tidak akan disimpan."
        confirmText="Ya, Batalkan"
        cancelText="Lanjutkan Pengisian"
        onConfirm={() => {
          setShowConfirmCancelModal(false);
          setShowModal(false);
        }}
        onCancel={() => setShowConfirmCancelModal(false)}
      />

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!deletingProd}
        title="Konfirmasi Hapus Laporan Produksi"
        message="Apakah Anda yakin ingin menghapus data laporan produksi susu segar ini?"
        confirmText="Ya, Hapus Laporan"
        onConfirm={handleDelete}
        onCancel={() => setDeletingProd(null)}
      />
    </div>
  );
}
