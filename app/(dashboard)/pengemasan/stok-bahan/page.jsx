'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import { 
  Boxes, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw,
  Filter,
  Search,
  FileSpreadsheet,
  X
} from 'lucide-react';

export default function StokBahanPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState([]);
  const [movements, setMovements] = useState([]);
  const [summary, setSummary] = useState({ warningCount: 0, amanCount: 0, menipisCount: 0, kritisCount: 0 });
  
  const [activeTab, setActiveTab] = useState('STOK'); // 'STOK' or 'HISTORI'
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);

  // Modal State for Stock Adjustment
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [adjustForm, setAdjustForm] = useState({
    materialId: '',
    adjustmentType: 'Penambahan',
    quantity: '',
    reason: 'Stok fisik baru datang',
    notes: ''
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

  const openAdjustModal = (matId = '') => {
    setAdjustForm({
      materialId: matId || (materials[0]?.id || ''),
      adjustmentType: 'Penambahan',
      quantity: '',
      reason: 'Stok fisik baru datang',
      notes: ''
    });
    setShowAdjustModal(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustForm.materialId) {
      setToast({ type: 'error', message: 'Silakan pilih bahan kemasan' });
      return;
    }
    const numQty = parseFloat(adjustForm.quantity);
    if (isNaN(numQty) || numQty <= 0) {
      setToast({ type: 'error', message: 'Jumlah penyesuaian harus angka > 0' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/pengemasan/stok-bahan/adjust', adjustForm);
      if (res.data?.success) {
        setToast({ type: 'success', message: res.data.message || 'Penyesuaian stok berhasil disimpan!' });
        setShowAdjustModal(false);
        fetchData();
      } else {
        setToast({ type: 'error', message: res.data?.message || 'Gagal menyimpan penyesuaian stok.' });
      }
    } catch (err) {
      console.error('Adjustment submit error:', err);
      setToast({ type: 'error', message: err.response?.data?.message || 'Terjadi kesalahan sistem.' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMaterials = materials.filter(mat => {
    const matchesStatus = filterStatus === 'ALL' || mat.status === filterStatus;
    const matchesSearch = mat.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          mat.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading && materials.length === 0) {
    return <LoadingSpinner text="Memuat Stok Bahan & Kemasan..." />;
  }

  return (
    <div className="space-y-6 pb-12">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* HEADER PAGE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1E3F20] text-white rounded-full text-xs font-bold mb-2">
            <Boxes className="w-4 h-4 text-emerald-200" />
            ADMIN PENGEMASAN
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sisa Stok Bahan & Kemasan</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Pantau ketersediaan bahan kemasan botol, cup, plastik, tutup, dan label untuk pengolahan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData()}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-all text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>

          <button
            onClick={() => openAdjustModal()}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + Penyesuaian Stok
          </button>
        </div>
      </div>

      {/* WARNING BANNER IF LOW STOCK */}
      {summary.warningCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-900 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 font-bold shadow">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-amber-950">⚠️ Perhatian: {summary.warningCount} Bahan Memerlukan Perhatian</h4>
              <p className="text-xs text-amber-800 font-medium mt-0.5">
                {summary.kritisCount > 0 && `${summary.kritisCount} stok kritis `}
                {summary.menipisCount > 0 && `${summary.menipisCount} stok menipis. `}
                Segera lakukan pengadaan agar produksi pengolahan tidak terhambat.
              </p>
            </div>
          </div>

          <button
            onClick={() => setFilterStatus('ALL')}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer"
          >
            Tampilkan Semua
          </button>
        </div>
      )}

      {/* SUMMARY STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-lg">
            📦
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Jenis Bahan</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{summary.totalMaterials || 0} Varian</h3>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-emerald-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
            ✅
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Stok Aman</p>
            <h3 className="text-xl font-black text-emerald-950 mt-0.5">{summary.amanCount || 0} Bahan</h3>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-amber-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg">
            ⚠️
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Stok Menipis</p>
            <h3 className="text-xl font-black text-amber-950 mt-0.5">{summary.menipisCount || 0} Bahan</h3>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-red-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold text-lg">
            🚨
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-red-600">Stok Kritis</p>
            <h3 className="text-xl font-black text-red-950 mt-0.5">{summary.kritisCount || 0} Bahan</h3>
          </div>
        </div>
      </div>

      {/* TABS & FILTERS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('STOK')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'STOK'
                  ? 'bg-[#1E3F20] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              📋 Daftar Stok Bahan
            </button>
            <button
              onClick={() => setActiveTab('HISTORI')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'HISTORI'
                  ? 'bg-[#1E3F20] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              📜 Histori Mutasi Stok ({movements.length})
            </button>
          </div>

          {activeTab === 'STOK' && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari bahan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 w-44 sm:w-60"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">Semua Status</option>
                <option value="Aman">Aman</option>
                <option value="Menipis">Menipis</option>
                <option value="Kritis">Kritis</option>
              </select>
            </div>
          )}
        </div>

        {/* TAB 1: STOK TABLE */}
        {activeTab === 'STOK' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Kode</th>
                  <th className="p-3.5">Nama Bahan</th>
                  <th className="p-3.5">Kategori</th>
                  <th className="p-3.5 text-right">Stok Tersedia</th>
                  <th className="p-3.5">Satuan</th>
                  <th className="p-3.5 text-center">Batas (Menipis / Kritis)</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 font-bold">
                      Tidak ada data bahan kemasan yang sesuai.
                    </td>
                  </tr>
                ) : (
                  filteredMaterials.map((mat) => (
                    <tr key={mat.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">{mat.code}</td>
                      <td className="p-3.5 font-bold text-slate-900">{mat.name}</td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold uppercase">
                          {mat.category}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-black text-sm text-slate-900">
                        {Number(mat.currentStock).toLocaleString('id-ID')}
                      </td>
                      <td className="p-3.5 text-slate-500">{mat.unit || 'pcs'}</td>
                      <td className="p-3.5 text-center text-slate-500">
                        <span className="text-amber-700 font-bold">&lt;= {mat.minimumStock}</span> /{' '}
                        <span className="text-red-700 font-bold">&lt;= {mat.criticalStock}</span>
                      </td>
                      <td className="p-3.5 text-center font-bold text-xs">
                        {mat.status === 'Aman' && (
                          <span className="text-emerald-700">Aman</span>
                        )}
                        {mat.status === 'Menipis' && (
                          <span className="text-amber-700">Menipis</span>
                        )}
                        {mat.status === 'Kritis' && (
                          <span className="text-red-700">Kritis</span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => openAdjustModal(mat.id)}
                          className="text-emerald-700 hover:text-emerald-800 font-bold text-xs transition-colors cursor-pointer"
                        >
                          + Sesuaikan
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: HISTORI MUTASI */}
        {activeTab === 'HISTORI' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Tanggal</th>
                  <th className="p-3.5">Bahan Kemasan</th>
                  <th className="p-3.5 text-center">Jenis Mutasi</th>
                  <th className="p-3.5 text-right">Jumlah</th>
                  <th className="p-3.5 text-center">Stok (Sebelum -&gt; Sesudah)</th>
                  <th className="p-3.5">Sumber</th>
                  <th className="p-3.5">Keterangan</th>
                  <th className="p-3.5">Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 font-bold">
                      Belum ada riwayat mutasi stok bahan.
                    </td>
                  </tr>
                ) : (
                  movements.map((mov) => (
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
                        {mov.material?.name || 'Bahan Kemasan'}
                      </td>
                      <td className="p-3.5 text-center">
                        {mov.type === 'ADDITION' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                            <ArrowUpRight className="w-3 h-3" /> Penambahan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-[10px] font-black uppercase">
                            <ArrowDownRight className="w-3 h-3" /> Pengurangan
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right font-black text-slate-900">
                        {mov.type === 'ADDITION' ? '+' : '-'}{mov.quantity} {mov.material?.unit || 'pcs'}
                      </td>
                      <td className="p-3.5 text-center text-slate-500 font-bold">
                        {mov.previousStock} -&gt; <span className="text-slate-900">{mov.newStock}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-bold text-[10px]">
                          {mov.source}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 max-w-xs truncate">{mov.notes || '-'}</td>
                      <td className="p-3.5 text-slate-500">{mov.createdBy?.name || 'Admin Pengemasan'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL PENYESUAIAN STOK */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base">Form Penyesuaian Stok Bahan</h3>
                <p className="text-xs text-slate-500 font-medium">Koreksi fisik atau penambahan bahan kemasan</p>
              </div>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bahan Kemasan *</label>
                <select
                  value={adjustForm.materialId}
                  onChange={(e) => setAdjustForm({ ...adjustForm, materialId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  {materials.map((mat) => (
                    <option key={mat.id} value={mat.id}>
                      {mat.name} ({mat.code}) - Stok Saat Ini: {mat.currentStock} {mat.unit || 'pcs'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Penyesuaian *</label>
                  <select
                    value={adjustForm.adjustmentType}
                    onChange={(e) => setAdjustForm({ ...adjustForm, adjustmentType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="Penambahan">Penambahan (+)</option>
                    <option value="Pengurangan">Pengurangan (-)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jumlah *</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Contoh: 100"
                    value={adjustForm.quantity}
                    onChange={(e) => setAdjustForm({ ...adjustForm, quantity: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alasan *</label>
                <select
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="Stok fisik baru datang">Stok fisik baru datang</option>
                  <option value="Stok rusak / afkir">Stok rusak / afkir</option>
                  <option value="Pengoreksian hasil opname">Pengoreksian hasil opname</option>
                  <option value="Penggunaan lain-lain">Penggunaan lain-lain</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan / Keterangan (Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan tambahan..."
                  value={adjustForm.notes}
                  onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
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
                  {submitting ? 'Menyimpan...' : 'Simpan Penyesuaian'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
