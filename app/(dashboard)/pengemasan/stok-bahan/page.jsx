'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import { 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter,
  Search,
  FileSpreadsheet,
  X,
  Trash2
} from 'lucide-react';

export default function StokBahanPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState([]);
  const [movements, setMovements] = useState([]);
  const [summary, setSummary] = useState({ warningCount: 0, amanCount: 0, menipisCount: 0, kritisCount: 0 });
  
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedMaterialFilter, setSelectedMaterialFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);


  // Modal State for Stock Addition
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [adjustForm, setAdjustForm] = useState({
    adjustmentType: 'Penambahan',
    reason: 'Penerimaan Stok Baru',
    notes: '',
    items: [
      { materialId: '', quantity: '' }
    ]
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/pengemasan/stok-bahan?t=${Date.now()}`);
      if (res.data?.success) {
        setMaterials(res.data.data.materials || []);
        setMovements(res.data.data.movements || []);
        setSummary(res.data.data.summary || {});
      }
    } catch (err) {
      console.error('Error fetching material stock:', err);
      setToast({ type: 'error', message: 'Gagal memuat data stok bahan.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Target 5 packaging materials specified by user
  const targetDropdownSpecs = [
    { label: 'botol 250ml', match: (m) => (m.code || '').includes('BOT-250') || (m.name || '').toLowerCase().includes('250') },
    { label: 'botol 115ml', match: (m) => (m.code || '').includes('BOT-115') || (m.name || '').toLowerCase().includes('115') },
    { label: 'cup', match: (m) => (m.code || '').includes('CUP-200') || ((m.name || '').toLowerCase().includes('cup') && !(m.name || '').toLowerCase().includes('tutup')) },
    { label: 'plastik bantal', match: (m) => (m.code || '').includes('PLASTIK') || (m.name || '').toLowerCase().includes('plastik') },
    { label: 'label', match: (m) => (m.code || '').includes('LBL') || (m.name || '').toLowerCase().includes('label') }
  ];

  const allowedMaterials = targetDropdownSpecs.map(spec => {
    const found = materials.find(spec.match);
    if (!found) return null;
    return { ...found, displayLabel: spec.label };
  }).filter(Boolean);

  const allowedMaterialIds = new Set(allowedMaterials.map(m => m.id));

  // Compute 3-tier status dynamically:
  // Aman: > 150 pcs | Peringatan: <= 150 pcs & > 100 pcs | Kritis: <= 100 pcs
  let amanCount = 0;
  let menipisCount = 0;
  let kritisCount = 0;

  allowedMaterials.forEach(mat => {
    if (mat.currentStock <= 100) {
      mat.status = 'Kritis';
      kritisCount++;
    } else if (mat.currentStock <= 150) {
      mat.status = 'Peringatan';
      menipisCount++;
    } else {
      mat.status = 'Aman';
      amanCount++;
    }
  });

  const activeSummary = {
    totalMaterials: allowedMaterials.length,
    amanCount,
    menipisCount,
    kritisCount,
    warningCount: menipisCount + kritisCount
  };

  const dropdownMaterials = allowedMaterials;
  const availableCategories = ['ALL', ...Array.from(new Set(allowedMaterials.map(m => m.category).filter(Boolean)))];

  const openAdjustModal = (matId = '') => {
    const validMatId = dropdownMaterials.some(m => m.id === matId)
      ? matId
      : (dropdownMaterials[0]?.id || materials[0]?.id || '');
    setAdjustForm({
      adjustmentType: 'Penambahan',
      reason: 'Penerimaan Stok Baru',
      notes: '',
      items: [
        { materialId: validMatId, quantity: '' }
      ]
    });
    setShowAdjustModal(true);
  };

  const handleAddItemRow = () => {
    const listToUse = dropdownMaterials.length > 0 ? dropdownMaterials : materials;
    const unusedMat = listToUse.find(m => !adjustForm.items.some(it => it.materialId === m.id)) || listToUse[0];
    setAdjustForm(prev => ({
      ...prev,
      items: [...prev.items, { materialId: unusedMat?.id || '', quantity: '' }]
    }));
  };

  const handleRemoveItemRow = (index) => {
    if (adjustForm.items.length <= 1) return;
    setAdjustForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateItemRow = (index, field, value) => {
    setAdjustForm(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustForm.items || adjustForm.items.length === 0) {
      setToast({ type: 'error', message: 'Silakan tambahkan minimal 1 bahan kemasan.' });
      return;
    }

    for (let i = 0; i < adjustForm.items.length; i++) {
      const item = adjustForm.items[i];
      if (!item.materialId) {
        setToast({ type: 'error', message: `Pilih bahan kemasan pada baris ke-${i + 1}.` });
        return;
      }
      const numQty = parseFloat(item.quantity);
      if (isNaN(numQty) || numQty <= 0) {
        setToast({ type: 'error', message: `Jumlah pada baris ke-${i + 1} harus angka > 0.` });
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        adjustmentType: 'Penambahan',
        reason: adjustForm.reason || 'Penerimaan Stok Baru',
        notes: adjustForm.notes || '',
        items: adjustForm.items
      };
      const res = await api.post('/pengemasan/stok-bahan/adjust', payload);
      if (res.data?.success) {
        setToast({ type: 'success', message: res.data.message || 'Penambahan stok berhasil disimpan!' });
        setShowAdjustModal(false);
        fetchData();
      } else {
        setToast({ type: 'error', message: res.data?.message || 'Gagal menyimpan penambahan stok.' });
      }
    } catch (err) {
      console.error('Adjustment submit error:', err);
      setToast({ type: 'error', message: err.response?.data?.message || 'Terjadi kesalahan sistem.' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMaterials = allowedMaterials.filter(mat => {
    const matchesCategory = filterCategory === 'ALL' || (mat.category || '').toLowerCase() === filterCategory.toLowerCase();
    const matchesStatus = filterStatus === 'ALL' || mat.status === filterStatus;
    const matchesSearch = mat.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          mat.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          mat.displayLabel.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const displayMaterials = allowedMaterials.length > 0 ? allowedMaterials : materials;

  const filteredMovements = movements.filter(mov => {
    const isAllowed = displayMaterials.length === 0 || !mov.materialId || allowedMaterialIds.size === 0 || allowedMaterialIds.has(mov.materialId);
    const matchesMaterial = selectedMaterialFilter === 'ALL' || mov.materialId === selectedMaterialFilter;
    const notesStr = (mov.notes || '').toLowerCase();
    const matNameStr = (mov.material?.name || '').toLowerCase();
    const matchesSearch = !searchTerm || notesStr.includes(searchTerm.toLowerCase()) || matNameStr.includes(searchTerm.toLowerCase());
    return isAllowed && matchesMaterial && matchesSearch;
  });


  if (loading && materials.length === 0) {
    return <LoadingSpinner text="Memuat Stok Bahan & Kemasan..." />;
  }

  return (
    <div className="flex-1 flex flex-col gap-4 h-full min-h-0 overflow-hidden pr-1">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* HEADER PAGE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 py-1 px-1">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Sisa Stok Bahan & Kemasan</h1>
          <p className="text-xs text-slate-500 font-medium">
            Pantau ketersediaan bahan kemasan botol, cup, plastik, tutup, dan label untuk pengolahan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openAdjustModal()}
            className="px-4 py-2.5 bg-[#1E3F20] hover:bg-[#16331a] text-white rounded-2xl transition-all text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Tambah Stok
          </button>
        </div>
      </div>

      {/* WARNING BANNER IF LOW STOCK */}
      {activeSummary.warningCount > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-900 flex items-center justify-between gap-4 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 font-bold shadow">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-amber-950">⚠️ Perhatian: {activeSummary.warningCount} Bahan Memerlukan Perhatian</h4>
              <p className="text-[11px] text-amber-800 font-medium">
                {activeSummary.kritisCount > 0 && `${activeSummary.kritisCount} stok kritis `}
                {activeSummary.menipisCount > 0 && `${activeSummary.menipisCount} stok mendekati batas minimal. `}
                Segera lakukan pengadaan agar produksi pengolahan tidak terhambat.
              </p>
            </div>
          </div>

          <button
            onClick={() => { setFilterStatus('ALL'); setFilterCategory('ALL'); }}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer"
          >
            Tampilkan Semua
          </button>
        </div>
      )}

      {/* CARDS INFORMASI STOK KEMASAN SAAT INI */}
      <div className="shrink-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {allowedMaterials.map((mat) => {
            const isSelected = selectedMaterialFilter === mat.id;
            const isCritical = mat.currentStock < 100;

            return (
              <div
                key={mat.id}
                onClick={() => setSelectedMaterialFilter(prev => prev === mat.id ? 'ALL' : mat.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? isCritical
                      ? 'bg-rose-50/70 border-rose-500 ring-2 ring-rose-500/30 shadow-md'
                      : 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md'
                    : isCritical
                      ? 'bg-rose-50/30 border-rose-200 hover:border-rose-400 hover:shadow-sm'
                      : 'bg-white border-slate-200 hover:border-emerald-400 hover:shadow-sm'
                }`}
              >
                <div>
                  <div className="mb-2">
                    <span className="text-base md:text-lg font-black text-slate-900 capitalize tracking-tight line-clamp-1">
                      {mat.displayLabel ? mat.displayLabel : mat.name}
                    </span>
                  </div>

                  <div className="mt-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className={`text-2xl md:text-3xl font-black tracking-tight ${isCritical ? 'text-rose-600' : 'text-[#1E3F20]'}`}>
                        {mat.currentStock.toLocaleString('id-ID')}
                      </span>
                      <span className={`text-sm font-bold ${isCritical ? 'text-rose-600' : 'text-slate-600'}`}>
                        {mat.unit || 'pcs'}
                      </span>
                    </div>
                    {isCritical ? (
                      <p className="text-xs text-rose-600 font-extrabold mt-1">
                        stok kritis
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 font-semibold mt-1">
                        Batas min: {mat.minStock || 100} {mat.unit || 'pcs'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className={`text-xs font-bold ${isCritical ? 'text-rose-400' : 'text-slate-400'}`}>
                    {mat.category || 'Kemasan'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FILTER BAR DENGAN LAYOUT PUTIH (WHITE CONTAINER) */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-end gap-3 shrink-0">
        {/* SEARCH INPUT */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari keterangan/riwayat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 w-44 sm:w-60 shadow-xs"
          />
        </div>

        {/* DROPDOWN FILTER NAMA BAHAN / KEMASAN */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-extrabold text-slate-700 whitespace-nowrap">Bahan Kemasan:</label>
          <select
            value={selectedMaterialFilter}
            onChange={(e) => setSelectedMaterialFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-xs"
          >
            <option value="ALL">Semua Bahan Kemasan</option>
            {allowedMaterials.map((mat) => (
              <option key={mat.id} value={mat.id}>
                {mat.displayLabel ? mat.displayLabel : mat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABEL HISTORI MUTASI STOK BAHAN */}
      <div className="flex-1 flex flex-col min-h-0 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-2">
        <div className="flex-1 overflow-auto min-h-0">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#1E3F20] text-white font-bold uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="p-3.5">Tanggal</th>
                <th className="p-3.5">Nama Bahan</th>
                <th className="p-3.5 text-center">Aktivitas</th>
                <th className="p-3.5 text-right">Jumlah (+/-)</th>
                <th className="p-3.5 text-center">Perubahan Stok</th>
                <th className="p-3.5">Asal Transaksi</th>
                <th className="p-3.5">Catatan</th>
                <th className="p-3.5">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-bold">
                    Belum ada riwayat mutasi stok bahan yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((mov) => {
                  const isAddition = mov.type === 'ADDITION';
                  const matObj = allowedMaterials.find(m => m.id === mov.materialId) || mov.material;

                  return (
                    <tr key={mov.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">
                        {new Date(mov.createdAt).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">
                        {matObj?.name || 'Bahan Kemasan'}
                      </td>
                      <td className="p-3.5 text-center font-extrabold">
                        {isAddition ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700">
                            <ArrowUpRight className="w-3.5 h-3.5" /> Penambahan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-700">
                            <ArrowDownRight className="w-3.5 h-3.5" /> Pengurangan
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right font-black text-slate-900">
                        {isAddition ? '+' : '-'}{mov.quantity} {matObj?.unit || 'pcs'}
                      </td>
                      <td className="p-3.5 text-center text-slate-500 font-bold">
                        {mov.previousStock} ➔ <span className="text-slate-900">{mov.newStock}</span>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-700">
                        {mov.source}
                      </td>
                      <td className="p-3.5 text-slate-600 max-w-xs truncate">{mov.notes || '-'}</td>
                      <td className="p-3.5 text-slate-500">{mov.createdBy?.name || 'Admin Pengemasan'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>



      {/* MODAL TAMBAH STOK */}
      {showAdjustModal && (() => {
        const firstItemMatId = adjustForm.items[0]?.materialId || '';
        const selectedMat = allowedMaterials.find(m => m.id === firstItemMatId);
        const currentStockVal = selectedMat ? selectedMat.currentStock : 0;
        const addedQtyVal = parseFloat(adjustForm.items[0]?.quantity || 0) || 0;
        const estimatedFinalStock = currentStockVal + addedQtyVal;

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
                <div>
                  <h3 className="font-black text-slate-900 text-base">Form Tambah Stok Bahan & Kemasan</h3>
                  <p className="text-xs text-slate-500 font-medium">Input stok fisik bahan/kemasan yang baru masuk secara manual</p>
                </div>
                <button
                  onClick={() => setShowAdjustModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAdjustSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
                {/* PILIH BAHAN & STOK SAAT INI INFO */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-extrabold text-slate-800">Daftar Bahan Kemasan *</label>
                    <button
                      type="button"
                      onClick={handleAddItemRow}
                      className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      + Tambah Baris Bahan
                    </button>
                  </div>

                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {adjustForm.items.map((item, idx) => {
                      const matObj = allowedMaterials.find(m => m.id === item.materialId);
                      const curStock = matObj ? matObj.currentStock : 0;
                      const addQty = parseFloat(item.quantity || 0) || 0;
                      const finalStock = curStock + addQty;

                      return (
                        <div key={idx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-slate-800">Bahan Kemasan #{idx + 1}</span>
                            {adjustForm.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItemRow(idx)}
                                className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition-colors cursor-pointer"
                                title="Hapus Baris"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Pilih Bahan/Kemasan *</label>
                              <select
                                value={item.materialId}
                                onChange={(e) => handleUpdateItemRow(idx, 'materialId', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                                required
                              >
                                <option value="" disabled>-- Pilih Bahan Kemasan --</option>
                                {dropdownMaterials.map((mat) => (
                                  <option key={mat.id} value={mat.id}>
                                    {mat.displayLabel}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Jumlah Tambahan (pcs) *</label>
                              <input
                                type="number"
                                min="1"
                                step="1"
                                placeholder="Jumlah pcs"
                                value={item.quantity}
                                onChange={(e) => handleUpdateItemRow(idx, 'quantity', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                required
                              />
                            </div>
                          </div>

                          {/* INFO STOK SAAT INI & PREVIEW KALKULASI OTOMATIS */}
                          {matObj && (
                            <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 space-y-1 text-xs">
                              <div className="flex justify-between items-center text-slate-600 font-medium">
                                <span>Stok Saat Ini (Read-only):</span>
                                <span className="font-bold text-slate-900">{curStock.toLocaleString('id-ID')} pcs</span>
                              </div>
                              {addQty > 0 && (
                                <div className="flex justify-between items-center text-emerald-800 font-extrabold pt-1 border-t border-slate-100">
                                  <span>Estimasi Stok Akhir:</span>
                                  <span className="font-mono bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                    {curStock.toLocaleString('id-ID')} + {addQty.toLocaleString('id-ID')} ➔ {finalStock.toLocaleString('id-ID')} pcs
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Catatan / Keterangan (Opsional)</label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Restock Supplier A, Penyesuaian fisik, dll."
                    value={adjustForm.notes}
                    onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowAdjustModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Menyimpan...' : 'Simpan Tambah Stok'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
