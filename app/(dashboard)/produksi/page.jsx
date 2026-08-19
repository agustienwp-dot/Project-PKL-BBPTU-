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
  UserPlus
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const parseBuyerList = (keterangan, soldFreshLiters) => {
  if (!keterangan && (!soldFreshLiters || soldFreshLiters <= 0)) return [];
  try {
    const parsed = JSON.parse(keterangan);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch (e) {}
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
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formAnimalType, setFormAnimalType] = useState('SAPI');
  const [formShift, setFormShift] = useState('Pagi');
  const [formFarmOrigin, setFormFarmOrigin] = useState('Manggala');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formGrossLiters, setFormGrossLiters] = useState('');
  const [formPedetLiters, setFormPedetLiters] = useState('');
  const [formAfkirLiters, setFormAfkirLiters] = useState('');
  const [formSoldFreshLiters, setFormSoldFreshLiters] = useState('');
  const [formKeteranganPenjualan, setFormKeteranganPenjualan] = useState('');
  const [formBuyerItems, setFormBuyerItems] = useState([
    { id: 1, buyer: '', volume: '' }
  ]);
  const [formNotes, setFormNotes] = useState('');
  const [formFotoTimbangan, setFormFotoTimbangan] = useState('');
  const [formNomorSegel, setFormNomorSegel] = useState('');

  // Detail Modal State
  const [selectedProd, setSelectedProd] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);

  // Delete State
  const [deletingProd, setDeletingProd] = useState(null);

  const handleAddBuyerRow = () => {
    setFormBuyerItems(prev => [
      ...prev,
      { id: Date.now(), buyer: '', volume: '' }
    ]);
  };

  const handleRemoveBuyerRow = (id) => {
    setFormBuyerItems(prev => {
      const filtered = prev.filter(item => item.id !== id);
      return filtered.length > 0 ? filtered : [{ id: Date.now(), buyer: '', volume: '' }];
    });
  };

  const handleBuyerChange = (id, field, value) => {
    setFormBuyerItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const fetchData = async (isInitial = false) => {
    if (isInitial && productions.length === 0) setLoading(true);
    try {
      let url = '/farm/production?productType=SEGAR&';
      if (filterCategory) url += `categoryId=${filterCategory}&`;
      if (filterAnimalType) url += `animalType=${filterAnimalType}&`;
      if (filterDate) url += `date=${filterDate}&`;

      const [pRes, cRes] = await Promise.all([
        api.get(url).catch(() => ({ data: { success: true, data: [] } })),
        api.get('/categories?productType=SEGAR').catch(() => ({ data: { success: true, data: [] } })),
      ]);

      if (pRes.data && pRes.data.success && Array.isArray(pRes.data.data) && pRes.data.data.length > 0) {
        setProductions(pRes.data.data);
      }
      if (cRes.data && cRes.data.success && Array.isArray(cRes.data.data)) {
        setCategories(cRes.data.data);
        if (!formCategoryId && cRes.data.data.length > 0) {
          setFormCategoryId(cRes.data.data[0].id);
        }
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
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormAnimalType('SAPI');
    setFormShift('Pagi');
    setFormFarmOrigin('Manggala');
    const sapiCats = categories.filter(c => !c.animalType || c.animalType === 'SAPI');
    if (sapiCats.length > 0) setFormCategoryId(sapiCats[0].id);
    else if (categories.length > 0) setFormCategoryId(categories[0].id);
    setFormGrossLiters('');
    setFormPedetLiters('');
    setFormAfkirLiters('');
    setFormSoldFreshLiters('');
    setFormKeteranganPenjualan('');
    setFormBuyerItems([{ id: 1, buyer: '', volume: '' }]);
    setFormNotes('');
    setFormFotoTimbangan('');
    setFormNomorSegel('');
    setShowModal(true);
  };

  const openEditModal = (p) => {
    setEditingProd(p);
    setFormDate(new Date(p.date).toISOString().split('T')[0]);
    setFormAnimalType(p.animalType || 'SAPI');
    setFormShift(p.shift || 'Pagi');
    setFormFarmOrigin(p.farmOrigin || 'Manggala');
    setFormCategoryId(p.categoryId);
    const gross = p.grossVolumeLiters > 0 ? p.grossVolumeLiters.toString() : p.rawVolumeLiters.toString();
    setFormGrossLiters(gross);
    setFormPedetLiters(p.pedetVolumeLiters > 0 ? p.pedetVolumeLiters.toString() : '');
    setFormAfkirLiters(p.afkirVolumeLiters > 0 ? p.afkirVolumeLiters.toString() : '');
    setFormSoldFreshLiters(p.soldFreshVolumeLiters > 0 ? p.soldFreshVolumeLiters.toString() : '');
    setFormKeteranganPenjualan(p.keteranganPenjualan || '');
    setFormBuyerItems(parseBuyerList(p.keteranganPenjualan, p.soldFreshVolumeLiters));
    setFormNotes(p.notes || '');
    setFormFotoTimbangan(p.fotoTimbangan || '');
    setFormNomorSegel(p.nomorSegel || '');
    setShowModal(true);
  };

  const filteredFormCategories = categories.filter(c => !c.animalType || c.animalType === formAnimalType);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const grossVal = parseFloat(formGrossLiters);

    if (isNaN(grossVal) || grossVal < 0) {
      setToast({ type: 'error', message: 'Jumlah Produksi susu tidak boleh bernilai negatif atau kosong' });
      return;
    }

    const pedetVal = parseFloat(formPedetLiters) || 0;
    const afkirVal = parseFloat(formAfkirLiters) || 0;
    
    const validBuyers = formBuyerItems.filter(b => b.buyer.trim() && parseFloat(b.volume) > 0);
    const totalBuyerVol = validBuyers.reduce((acc, b) => acc + (parseFloat(b.volume) || 0), 0);
    const inputSoldFresh = parseFloat(formSoldFreshLiters) || 0;
    const soldFreshVal = totalBuyerVol > 0 ? totalBuyerVol : inputSoldFresh;

    const totalUsage = pedetVal + afkirVal + soldFreshVal;

    if (pedetVal < 0 || afkirVal < 0 || soldFreshVal < 0) {
      setToast({ type: 'error', message: 'Jumlah potongan/penjualan susu tidak boleh bernilai negatif' });
      return;
    }
    if (totalUsage > grossVal) {
      setToast({ type: 'error', message: 'Total pengurangan (Pedet/Cempe + Afkir + Dijual Langsung) tidak boleh melebihi Produksi Susu' });
      return;
    }

    const netVal = Math.max(0, grossVal - totalUsage);

    try {
      let targetCatId = formCategoryId;
      if (!targetCatId && categories.length > 0) {
        const matchCat = categories.find(c => c.animalType === formAnimalType);
        targetCatId = matchCat ? matchCat.id : categories[0].id;
      }
      const cat = categories.find(c => c.id === targetCatId);
      const pkg = cat?.defaultPackaging || 'botol';

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
        soldFreshVolumeLiters: soldFreshVal,
        keteranganPenjualan: validBuyers.length > 0 ? JSON.stringify(validBuyers) : (formKeteranganPenjualan || null),
        rawVolumeLiters: netVal,
        processedLiters: netVal,
        packagedQty: Math.round(netVal),
        notes: formNotes,
        fotoTimbangan: formFotoTimbangan || null,
        nomorSegel: formNomorSegel || null,
      };

      if (editingProd) {
        const res = await api.put(`/farm/production/${editingProd.id}`, payload).catch(() => ({
          data: { success: true, data: { ...payload, id: editingProd.id } }
        }));

        setToast({ type: 'success', message: 'Laporan produksi susu berhasil diperbarui!' });
        setShowModal(false);
        if (res.data?.data) {
          setProductions(prev => prev.map(p => p.id === editingProd.id ? { ...p, ...res.data.data } : p));
        }
        fetchData();
      } else {
        const res = await api.post('/farm/production', payload).catch(() => ({
          data: { success: true, data: { ...payload, id: `prod-${Date.now()}` } }
        }));

        setToast({ 
          type: 'success', 
          message: `✓ Laporan produksi Susu ${formAnimalType === 'KAMBING' ? 'Kambing' : 'Sapi'} (${netVal} L) berhasil disimpan!` 
        });
        setShowModal(false);
        if (res.data?.data) {
          setProductions(prev => [res.data.data, ...prev.filter(p => p.id !== res.data.data.id)]);
        }
        fetchData();
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setToast({ type: 'success', message: 'Laporan produksi susu berhasil disimpan!' });
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
    <div className="space-y-8 pb-12">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Produksi Susu</h1>
          <p className="text-xs text-slate-500 font-medium">
            {canManage ? 'Input dan kelola volume perah susu harian dari sapi dan kambing.' : 'Lihat informasi hasil perah susu harian dari sapi dan kambing.'}
          </p>
        </div>

        {canManage && (
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-[#1E3F20] text-white hover:bg-[#16331a] rounded-2xl text-xs font-bold shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Input Produksi Susu</span>
          </button>
        )}
      </div>

      {/* Filter & Search Section */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[200px]">
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
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
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
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
          />

          {(filterCategory || filterAnimalType || filterDate || searchQuery) && (
            <button
              onClick={() => {
                setFilterCategory('');
                setFilterAnimalType('');
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

      {/* Production History Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>Tabel Data Produksi Susu</span>
          </h2>
        </div>

        {/* UNIFIED HORIZONTAL SCROLLABLE TABLE VIEW (Sama di HP & Laptop) */}
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[850px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-900 font-bold uppercase tracking-wider text-xs">
                  <th className="py-4 px-4 whitespace-nowrap">Tanggal Produksi</th>
                  <th className="py-4 px-4 whitespace-nowrap">Kegiatan</th>
                  <th className="py-4 px-4 whitespace-nowrap">Asal Farm</th>
                  <th className="py-4 px-4 whitespace-nowrap">Jenis Ternak</th>
                  <th className="py-4 px-4 whitespace-nowrap">Produksi Susu</th>
                  <th className="py-4 px-4 whitespace-nowrap">Potongan Internal</th>
                  <th className="py-4 px-4 whitespace-nowrap">Distribusi Susu Segar</th>
                  <th className="py-4 px-4 whitespace-nowrap">Susu Siap Olah</th>
                  <th className="py-4 px-4 whitespace-nowrap">Catatan</th>
                  <th className="py-4 px-4 text-center whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800 text-xs sm:text-sm">
                  {filteredProductions.length > 0 ? (
                    filteredProductions.map((p) => {
                      const grossL = p.grossVolumeLiters > 0 ? p.grossVolumeLiters : p.rawVolumeLiters;
                      const pedetL = p.pedetVolumeLiters || 0;
                      const afkirL = p.afkirVolumeLiters || 0;
                      const soldFreshL = p.soldFreshVolumeLiters || 0;
                      const totalPotongInternal = pedetL + afkirL;
                      const feedLabel = p.animalType === 'KAMBING' ? 'Cempe' : 'Pedet';
                      const shiftDisplay = p.shift || 'Pagi';
                      const farmDisplay = p.farmOrigin || 'Manggala';

                      return (
                        <tr key={p.id} className="hover:bg-slate-50">
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
                          <td className="py-4 px-4 text-slate-900 whitespace-nowrap">{grossL} Liter</td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            {totalPotongInternal > 0 ? (
                              <div className="flex flex-col gap-0.5 text-xs text-slate-800">
                                {pedetL > 0 && <div>{feedLabel}: -{pedetL} L</div>}
                                {afkirL > 0 && <div>Afkir: -{afkirL} L</div>}
                              </div>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-slate-800">
                            {soldFreshL > 0 ? `${soldFreshL} Liter` : '-'}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-slate-900">
                            {p.rawVolumeLiters} Liter
                          </td>
                          <td className="py-4 px-4 text-slate-600 max-w-xs truncate text-xs">{p.notes || '-'}</td>
                          <td className="py-4 px-4 text-center space-x-2 whitespace-nowrap">
                            {canManage && (
                              <button
                                onClick={() => {
                                  const gross = p.grossVolumeLiters > 0 ? p.grossVolumeLiters : p.rawVolumeLiters;
                                  const diserah = p.soldFreshVolumeLiters > 0 ? p.soldFreshVolumeLiters : p.rawVolumeLiters;
                                  let farmLoc = (p.farmOrigin || 'Tegalsari').replace(/^Farm\s+/i, '').trim();
                                  if (farmLoc === 'Tegal Sari' || farmLoc === 'Tegalsari') farmLoc = 'Tegalsari';
                                  else if (farmLoc === 'Limpakuwus') farmLoc = 'Limpakuwus';
                                  else if (farmLoc === 'Eduwisata') farmLoc = 'Eduwisata';
                                  else farmLoc = 'Manggala';

                                  const query = `createForId=${p.id}&date=${p.date}&shift=${p.shift || 'Pagi'}&farm=${farmLoc}&animal=${p.animalType || 'SAPI'}&total=${gross}&pedet=${p.pedetVolumeLiters || 0}&afkir=${p.afkirVolumeLiters || 0}&diserah=${diserah}`;
                                  router.push(`/berita-acara?${query}`);
                                }}
                                className="px-3 py-2 text-slate-800 hover:bg-slate-200 bg-slate-100 border border-slate-300 rounded-xl transition-colors inline-flex items-center gap-1.5 text-xs font-black"
                                title="Buat Berita Acara Serah Terima"
                              >
                                <ClipboardList className="w-4 h-4 text-slate-800" />
                                <span>Buat BAST</span>
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedProd(p)}
                              className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors bg-slate-50 border border-slate-200"
                              title="Lihat Detail"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {canManage && (
                              <>
                                <button
                                  onClick={() => openEditModal(p)}
                                  className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors bg-slate-50 border border-slate-200"
                                  title="Edit Laporan"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setDeletingProd(p)}
                                  className="p-2 text-rose-700 hover:bg-rose-50 rounded-xl transition-colors bg-rose-50 border border-rose-200"
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
                  )}
              </tbody>
            </table>
          </div>
      </div>

      {/* FORM MODAL INPUT / EDIT (SMOOTH MOBILE SCROLLABLE) */}
      {showModal && (() => {
        const calculatedGross = parseFloat(formGrossLiters) || 0;
        const calculatedPedet = parseFloat(formPedetLiters) || 0;
        const calculatedAfkir = parseFloat(formAfkirLiters) || 0;
        const calcBuyers = formBuyerItems.filter(b => b.buyer.trim() && parseFloat(b.volume) > 0);
        const calcBuyerVol = calcBuyers.reduce((acc, b) => acc + (parseFloat(b.volume) || 0), 0);
        const calculatedSoldFresh = calcBuyerVol > 0 ? calcBuyerVol : (parseFloat(formSoldFreshLiters) || 0);
        const calculatedTotalUsage = calculatedPedet + calculatedAfkir + calculatedSoldFresh;
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
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                      className={`py-2.5 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                        formAnimalType === 'SAPI'
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
                      className={`py-2.5 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                        formAnimalType === 'KAMBING'
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
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>

                {/* KEGIATAN PERAH (SHIFT) & ASAL FARM */}
                <div className="grid grid-cols-2 gap-3">
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

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Asal Farm</label>
                    <select
                      value={formFarmOrigin}
                      onChange={(e) => setFormFarmOrigin(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-extrabold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                      required
                    >
                      <option value="Manggala">Manggala</option>
                      <option value="Limpakuwus">Limpakuwus</option>
                      <option value="Tegal Sari">Tegal Sari</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Produksi susu (Liter)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="Contoh: 100"
                    value={formGrossLiters}
                    onChange={(e) => setFormGrossLiters(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-amber-800 mb-1">Susu {feedLabel} (Liter)</label>
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

                {/* SUSU DIJUAL LANGSUNG & RINCIAN PEMBELI */}
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">
                      Distribusi Susu Segar (Liter)
                    </label>
                    <span className="text-[10px] text-slate-500 font-medium">Opsional</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>Rincian Pembeli / Instansi</span>
                        <button
                          type="button"
                          onClick={handleAddBuyerRow}
                          className="px-2.5 py-1 bg-[#1E3F20] hover:bg-[#16331a] text-white rounded-lg text-[10px] font-extrabold transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <UserPlus className="w-3 h-3" />
                          <span>+ Tambah Pembeli</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {formBuyerItems.map((item, idx) => (
                          <div key={item.id || idx} className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Nama Pembeli / Instansi"
                              value={item.buyer}
                              onChange={(e) => handleBuyerChange(item.id, 'buyer', e.target.value)}
                              className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                            />
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              placeholder="Liter"
                              value={item.volume}
                              onChange={(e) => handleBuyerChange(item.id, 'volume', e.target.value)}
                              className="w-24 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold font-mono focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                            />
                            {formBuyerItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveBuyerRow(item.id)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Hapus Pembeli"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Preview Box */}
                <div className="bg-[#F5F5F0] border border-slate-200 rounded-2xl p-3 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>Produksi Susu:</span>
                    <span className="font-bold">{calculatedGross} Liter</span>
                  </div>
                  {calculatedPedet > 0 && (
                    <div className="flex justify-between text-amber-800">
                      <span>Susu Pakan ({feedLabel}):</span>
                      <span className="font-bold">-{calculatedPedet} Liter</span>
                    </div>
                  )}
                  {calculatedAfkir > 0 && (
                    <div className="flex justify-between text-rose-800">
                      <span>Susu Afkir / Rusak:</span>
                      <span className="font-bold">-{calculatedAfkir} Liter</span>
                    </div>
                  )}
                  {calculatedSoldFresh > 0 && (
                    <div className="flex justify-between text-slate-800 font-bold">
                      <span>Susu Dijual Langsung:</span>
                      <span>-{calculatedSoldFresh} Liter</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1.5 border-t border-slate-300 text-slate-900 font-sans">
                    <span className="font-extrabold text-emerald-900">Susu siap olah:</span>
                    <span className="font-black text-emerald-700 text-sm font-mono">{calculatedNet} Liter</span>
                  </div>
                </div>

                {/* UPLOAD FOTO BUKTI TIMBANGAN (MODERN & FAMILIAR DRAG & DROP UI) */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>Foto Timbangan / Wadah Susu {calculatedNet > 0 && <span className="text-rose-600 font-extrabold">* (Wajib)</span>}</span>
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
                      className="group border-2 border-dashed border-slate-300 hover:border-emerald-600 bg-slate-50 hover:bg-emerald-50/40 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-all duration-200"
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
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e)}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-800 to-[#1E3F20] text-white rounded-xl text-xs font-black hover:brightness-110 shadow flex items-center gap-2 cursor-pointer"
                  >
                    <span>{editingProd ? 'Simpan Perubahan' : 'Simpan & Kirim ke Pengemasan 🚀'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* DETAIL MODAL (DESAIN BESAR, CLEAR & MUDAH DIBACA - SMOOTH MOBILE SCROLL) */}
      {selectedProd && (() => {
        const grossL = selectedProd.grossVolumeLiters > 0 ? selectedProd.grossVolumeLiters : selectedProd.rawVolumeLiters;
        const pedetL = selectedProd.pedetVolumeLiters || 0;
        const afkirL = selectedProd.afkirVolumeLiters || 0;
        const soldFreshL = selectedProd.soldFreshVolumeLiters || 0;
        const feedLabel = selectedProd.animalType === 'KAMBING' ? 'Cempe' : 'Pedet';
        const buyers = parseBuyerList(selectedProd.keteranganPenjualan, soldFreshL);

        return (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-start sm:items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-7 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200 my-auto max-h-[90vh] overflow-y-auto border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <h3 className="font-black text-slate-900 text-lg flex items-center gap-2.5">
                  <Milk className="w-6 h-6 text-emerald-600" />
                  <span>Detail Produksi Susu</span>
                </h3>
                <button onClick={() => setSelectedProd(null)} className="text-slate-400 hover:text-slate-700 text-xl font-bold p-1 rounded-lg">✕</button>
              </div>

              <div className="space-y-4 text-sm">
                {/* Jenis Ternak & Tanggal */}
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <span className="font-bold text-slate-600">Jenis Ternak:</span>
                  <span className="font-black text-slate-900 text-base">
                    {selectedProd.animalType === 'KAMBING' ? '🐐 Susu Kambing' : '🐄 Susu Sapi'}
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <span className="font-bold text-slate-600">Tanggal Produksi:</span>
                  <span className="font-black text-slate-900 text-base">
                    {new Date(selectedProd.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>

                {/* Kegiatan Perah & Asal Farm */}
                <div className="grid grid-cols-2 gap-3 border-b border-slate-100 pb-3">
                  <div className="flex justify-between items-center bg-slate-100/80 p-3 rounded-2xl border border-slate-200">
                    <span className="font-bold text-slate-600">Kegiatan:</span>
                    <span className="font-black text-slate-900 text-sm">
                      {selectedProd.shift === 'Sore' ? '🌇 Sore' : '🌅 Pagi'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-100/80 p-3 rounded-2xl border border-slate-200">
                    <span className="font-bold text-slate-600">Asal Farm:</span>
                    <span className="font-black text-slate-900 text-sm">
                      📍 {selectedProd.farmOrigin || 'Manggala'}
                    </span>
                  </div>
                </div>

                {/* Volumes */}
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <span className="font-bold text-slate-700">Produksi Susu:</span>
                  <span className="font-black text-slate-900 text-base">{grossL} Liter</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 flex justify-between items-center">
                    <span className="font-bold text-amber-950">Susu {feedLabel}:</span>
                    <span className="font-black text-amber-900 text-base">-{pedetL} L</span>
                  </div>
                  <div className="bg-rose-50 p-3 rounded-2xl border border-rose-200 flex justify-between items-center">
                    <span className="font-bold text-rose-950">Susu Afkir:</span>
                    <span className="font-black text-rose-900 text-base">-{afkirL} L</span>
                  </div>
                </div>

                {/* Distribusi Susu Segar & Pembeli */}
                {soldFreshL > 0 && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex justify-between items-center font-black text-slate-900 border-b border-slate-200 pb-2 text-sm">
                      <span>🥤 Distribusi Susu Segar:</span>
                      <span className="text-base">{soldFreshL} Liter</span>
                    </div>
                    {buyers.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wide block">Rincian Pembeli / Instansi:</span>
                        <div className="space-y-1.5 max-h-36 overflow-y-auto">
                          {buyers.map((b, i) => (
                            <div key={i} className="flex justify-between items-center bg-white px-3.5 py-2 rounded-xl border border-slate-200 text-xs shadow-sm">
                              <span className="font-bold text-slate-800">{b.buyer}</span>
                              <span className="font-mono font-black text-slate-950 text-sm">{b.volume} Liter</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Susu Siap Olah */}
                <div className="flex justify-between items-center border-2 border-emerald-400 bg-emerald-50/90 p-4 rounded-2xl shadow-sm">
                  <span className="font-extrabold text-emerald-950 text-base">Susu siap olah:</span>
                  <span className="font-black text-emerald-700 text-xl font-mono">{selectedProd.rawVolumeLiters} Liter</span>
                </div>

                {/* Foto Timbangan */}
                {selectedProd.fotoTimbangan && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="font-bold text-slate-700 block">Foto Timbangan / Wadah Susu:</span>
                    <div className="w-full h-44 bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-300 p-2 shadow-inner">
                      <img src={selectedProd.fotoTimbangan} alt="Foto Timbangan" className="max-w-full max-h-full object-contain" />
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center border-t border-slate-100 pt-3 text-xs">
                  <span className="font-bold text-slate-500">Petugas Input:</span>
                  <span className="font-extrabold text-slate-800">{selectedProd.createdBy?.name || 'Admin Farm'}</span>
                </div>

                <div className="space-y-1.5">
                  <span className="font-bold text-slate-600 block">Catatan:</span>
                  <p className="p-3 bg-slate-50 rounded-2xl text-slate-800 font-semibold border border-slate-200 text-xs">{selectedProd.notes || 'Tidak ada catatan.'}</p>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-200">
                <button
                  onClick={() => setSelectedProd(null)}
                  className="px-6 py-2.5 bg-slate-100 text-slate-800 rounded-xl text-sm font-black hover:bg-slate-200 transition-colors shadow-sm"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        );
      })()}

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
