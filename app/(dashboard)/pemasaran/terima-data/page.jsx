'use client';

import React, { useState, useEffect, useMemo } from 'react';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import EmptyState from '@/components/EmptyState';
import {
  PackageCheck,
  Milk,
  Package,
  RefreshCw,
  CheckCircle,
  Clock,
  FileText,
  Printer,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  Gift,
  ShoppingCart,
  Building2,
  Filter,
  Layers,
  ArrowDownRight,
  TrendingDown,
  Info
} from 'lucide-react';

export default function TerimaDataPemasaranPage() {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [productions, setProductions] = useState([]);
  const [packagings, setPackagings] = useState([]);
  const [basts, setBasts] = useState([]);
  const [activeTab, setActiveTab] = useState('susu_fresh'); // 'susu_fresh' | 'bast' | 'susu_rasa' | 'yogurt' | 'keju'
  const [bastFilterType, setBastFilterType] = useState('ALL'); // 'ALL' | 'PENJUALAN_LANGSUNG' | 'HIBAH' | 'KERJASAMA'

  // Modal states for BAST
  const [selectedBast, setSelectedBast] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [confirmNotes, setConfirmNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modal states for Olahan (Packaged Products)
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [showConfirmPkgModal, setShowConfirmPkgModal] = useState(false);
  const [pkgNotes, setPkgNotes] = useState('');
  const [submittingPkg, setSubmittingPkg] = useState(false);

  const handleOpenConfirmPkgModal = (pkg) => {
    setSelectedPkg(pkg);
    setPkgNotes('');
    setShowConfirmPkgModal(true);
  };

  const handleConfirmPkg = async () => {
    if (!selectedPkg) return;
    setSubmittingPkg(true);
    try {
      let res;
      if (selectedPkg.isFarmPkg) {
        res = await api.put(`/farm/packaging/${selectedPkg.id}`, {
          action: 'RECEIVE',
          quantityReceived: selectedPkg.jumlah || selectedPkg.totalPackagedQty,
          condition: 'Sesuai',
          receptionNotes: pkgNotes,
        });
      } else {
        res = await api.post(`/packaged-products/${selectedPkg.id}/confirm`, {
          notes: pkgNotes,
        });
      }

      if (res.data.success) {
        setToast({
          type: 'success',
          message: `Berhasil mengonfirmasi penerimaan ${selectedPkg.jenisProduk} ke stok siap jual!`,
        });
        setShowConfirmPkgModal(false);
        setPkgNotes('');
        setSelectedPkg(null);
        fetchData();
      }
    } catch (err) {
      console.error('Error confirming Packaged Product:', err);
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Gagal mengonfirmasi produk olahan.'
      });
    } finally {
      setSubmittingPkg(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, pkgRes, bastRes, farmPkgRes] = await Promise.all([
        api.get('/milk-production').catch(() => ({ data: { data: [] } })),
        api.get('/packaged-products').catch(() => ({ data: { data: [] } })),
        api.get('/bast').catch(() => ({ data: { data: [] } })),
        api.get('/farm/packaging').catch(() => ({ data: { data: [] } })),
      ]);

      if (prodRes.data.success) {
        setProductions(prodRes.data.data || []);
      }

      const normalPkgList = (pkgRes.data?.data || []).map(p => ({
        ...p,
        isFarmPkg: false,
        productCategory: p.jenisProduk?.includes('Yogurt') ? 'Yogurt' : p.jenisProduk?.includes('Keju') ? 'Keju' : 'Susu',
        productSubtype: p.jenisProduk || 'Susu Olahan',
        origin: 'Sapi',
        variant: 'Original',
        kemasanStr: p.kemasan || 'Botol (250 ml)',
        jumlah: p.jumlah || 0,
        tanggal: p.tanggal || p.createdAt,
      }));

      const farmPkgList = (farmPkgRes.data?.data || []).map(p => {
        let items = [];
        try {
          if (p.packagingDetails) items = JSON.parse(p.packagingDetails);
        } catch (e) {}

        let kemasanStr = `${p.packagingType || 'Botol'} (${p.packageSize || '250 ml'}) - ${p.totalPackagedQty || 0} pcs`;
        if (items.length > 0) {
          kemasanStr = items.map(it => `${it.packagingType || 'Botol'} (${it.size || '250 ml'}) - ${it.quantity || 0} pcs`).join(', ');
        }

        return {
          ...p,
          isFarmPkg: true,
          jenisProduk: p.productSubtype || p.productCategory || 'Susu Olahan',
          productCategory: p.productCategory || 'Susu',
          productSubtype: p.productSubtype || 'Susu Olahan',
          origin: p.origin || 'Sapi',
          variant: p.variant || 'Original',
          kemasanStr: kemasanStr,
          kemasan: kemasanStr,
          jumlah: p.totalPackagedQty || 0,
          tanggal: p.date || p.createdAt,
        };
      });

      setPackagings([...farmPkgList, ...normalPkgList]);

      if (bastRes.data.success) {
        setBasts(bastRes.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching terima data:', err);
      setToast({ type: 'error', message: 'Gagal memuat data dari Admin Farm/Pengemasan.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConfirmBast = async () => {
    if (!selectedBast) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/bast/${selectedBast.id}/confirm`, {
        catatan: confirmNotes,
      });

      if (res.data.success) {
        setToast({ type: 'success', message: 'Berhasil mengonfirmasi serah terima Surat BAST Susu Segar!' });
        setShowConfirmModal(false);
        setConfirmNotes('');
        setSelectedBast(null);
        fetchData();
      }
    } catch (err) {
      console.error('Error confirming BAST:', err);
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Gagal mengonfirmasi Surat BAST.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Groupings for Packagings
  const susuRasaItems = packagings.filter(p => {
    const name = (p.jenisProduk || '').toLowerCase();
    return (name.includes('susu') || !name.includes('yogurt')) && !name.includes('yogurt') && !name.includes('keju');
  });
  const yogurtItems = packagings.filter(p => (p.jenisProduk || '').toLowerCase().includes('yogurt'));
  const kejuItems = packagings.filter(p => (p.jenisProduk || '').toLowerCase().includes('keju'));

  // Notification Counts
  const pendingBastCount = basts.filter(b => b.status === 'MENUNGGU_KONFIRMASI').length;
  const pendingRasaCount = susuRasaItems.filter(p => p.status === 'MENUNGGU_PENERIMAAN').length;
  const pendingYogurtCount = yogurtItems.filter(p => p.status === 'MENUNGGU_PENERIMAAN').length;
  const pendingKejuCount = kejuItems.filter(p => p.status === 'MENUNGGU_PENERIMAAN').length;

  // Calculations for Susu Fresh & BAST Auto-Deductions
  const totalSusuMasuk = useMemo(() => {
    return productions.reduce((acc, p) => acc + (p.kirimKePI || p.rawVolumeLiters || 0), 0);
  }, [productions]);

  const totalBastLiters = useMemo(() => {
    return basts.reduce((acc, b) => acc + (b.volumeLiters || 0), 0);
  }, [basts]);

  const totalBastHibah = useMemo(() => {
    return basts.filter(b => b.jenisPermintaan === 'HIBAH').reduce((acc, b) => acc + (b.volumeLiters || 0), 0);
  }, [basts]);

  const totalBastPenjualan = useMemo(() => {
    return basts.filter(b => b.jenisPermintaan === 'PENJUALAN_LANGSUNG' || !b.jenisPermintaan).reduce((acc, b) => acc + (b.volumeLiters || 0), 0);
  }, [basts]);

  const totalBastKerjasama = useMemo(() => {
    return basts.filter(b => b.jenisPermintaan === 'KERJASAMA' || b.jenisPermintaan === 'DISTRIBUSI_INTERNAL').reduce((acc, b) => acc + (b.volumeLiters || 0), 0);
  }, [basts]);

  const netSusuFreshTersedia = Math.max(0, totalSusuMasuk - totalBastLiters);

  // Map BAST by Date for Row Deductions
  const bastByDate = useMemo(() => {
    const map = {};
    basts.forEach(b => {
      const dStr = new Date(b.tanggal).toISOString().slice(0, 10);
      if (!map[dStr]) map[dStr] = [];
      map[dStr].push(b);
    });
    return map;
  }, [basts]);

  // Filtered BASTs for Tab 2
  const filteredBasts = useMemo(() => {
    if (bastFilterType === 'ALL') return basts;
    return basts.filter(b => b.jenisPermintaan === bastFilterType);
  }, [basts, bastFilterType]);

  if (loading) {
    return <LoadingSpinner text="Memuat Data Penerimaan dari Farm & Pengemasan..." />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800">Terima Data (Farm & Pengemasan)</h1>
            <p className="text-xs text-slate-500">Penerimaan & pengesahan data penyerahan susu segar (Farm), BAST permintaan langsung, dan produk olahan (Pengemasan)</p>
          </div>
        </div>

        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Navigation Tabs (5 Distinct Tabs) */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        {/* TAB 1: SUSU FRESH */}
        <button
          onClick={() => setActiveTab('susu_fresh')}
          className={`inline-flex items-center gap-2 px-5 py-3 font-bold text-xs border-b-2 transition-all ${
            activeTab === 'susu_fresh'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Milk className="w-4 h-4 text-blue-600" />
          <span>🥛 Susu Fresh (Farm) ({productions.length})</span>
        </button>

        {/* TAB 2: SURAT BAST */}
        <button
          onClick={() => setActiveTab('bast')}
          className={`inline-flex items-center gap-2 px-5 py-3 font-bold text-xs border-b-2 transition-all ${
            activeTab === 'bast'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-4 h-4 text-indigo-600" />
          <span>📋 Surat BAST Permintaan ({basts.length})</span>
          {pendingBastCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-black bg-amber-500 text-white rounded-full animate-pulse">
              {pendingBastCount} Baru
            </span>
          )}
        </button>

        {/* TAB 3: SUSU OLAHAN RASA */}
        <button
          onClick={() => setActiveTab('susu_rasa')}
          className={`inline-flex items-center gap-2 px-5 py-3 font-bold text-xs border-b-2 transition-all ${
            activeTab === 'susu_rasa'
              ? 'border-pink-600 text-pink-700 bg-pink-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Milk className="w-4 h-4 text-pink-600" />
          <span>🥤 Susu Olahan Rasa ({susuRasaItems.length})</span>
          {pendingRasaCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-black bg-pink-600 text-white rounded-full animate-pulse">
              {pendingRasaCount} Baru
            </span>
          )}
        </button>

        {/* TAB 4: YOGURT */}
        <button
          onClick={() => setActiveTab('yogurt')}
          className={`inline-flex items-center gap-2 px-5 py-3 font-bold text-xs border-b-2 transition-all ${
            activeTab === 'yogurt'
              ? 'border-purple-600 text-purple-700 bg-purple-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Package className="w-4 h-4 text-purple-600" />
          <span>🍦 Yogurt ({yogurtItems.length})</span>
          {pendingYogurtCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-black bg-purple-600 text-white rounded-full animate-pulse">
              {pendingYogurtCount} Baru
            </span>
          )}
        </button>

        {/* TAB 5: KEJU */}
        <button
          onClick={() => setActiveTab('keju')}
          className={`inline-flex items-center gap-2 px-5 py-3 font-bold text-xs border-b-2 transition-all ${
            activeTab === 'keju'
              ? 'border-amber-600 text-amber-700 bg-amber-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <PackageCheck className="w-4 h-4 text-amber-600" />
          <span>🧀 Keju ({kejuItems.length})</span>
          {pendingKejuCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-black bg-amber-600 text-white rounded-full animate-pulse">
              {pendingKejuCount} Baru
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: SUSU FRESH (FARM) WITH AUTOMATIC BAST DEDUCTION METRICS */}
      {activeTab === 'susu_fresh' && (
        <div className="space-y-6">
          {/* Automatic Deduction Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600">
                <Milk className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Susu Fresh Masuk</p>
                <h3 className="text-2xl font-black text-slate-800">
                  {totalSusuMasuk.toLocaleString('id-ID')} <span className="text-xs font-semibold text-slate-500">Liter</span>
                </h3>
                <p className="text-[11px] text-blue-600 font-medium mt-0.5">Penyerahan dari Farm (Gross)</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-600">
                <TrendingDown className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Potongan BAST Permintaan</p>
                <h3 className="text-2xl font-black text-rose-700">
                  - {totalBastLiters.toLocaleString('id-ID')} <span className="text-xs font-semibold text-slate-500">Liter</span>
                </h3>
                <p className="text-[11px] text-rose-600 font-medium mt-0.5">
                  Hibah ({totalBastHibah} L) • Penjualan ({totalBastPenjualan} L)
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm flex items-center gap-4 bg-gradient-to-br from-emerald-50/40 to-white">
              <div className="p-3.5 rounded-2xl bg-emerald-600 text-white shadow-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Sisa Stok Fresh Bersih</p>
                <h3 className="text-2xl font-black text-emerald-900">
                  {netSusuFreshTersedia.toLocaleString('id-ID')} <span className="text-xs font-semibold text-slate-500">Liter</span>
                </h3>
                <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Siap olah / salur harian</p>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-blue-900">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Otomatisasi Integrasi Stok Susu Fresh & BAST Permintaan:</p>
              <p className="text-blue-800 mt-0.5 leading-relaxed">
                Setiap dokumen <strong>Surat BAST</strong> diterbitkan dari Farm (baik untuk <strong>Susu Hibah CSR</strong>, <strong>Penjualan Susu Langsung</strong>, maupun <strong>Kerjasama Dinas</strong>), volume otomatis mengurangi saldo ketersediaan Susu Fresh pada laporan Pemasaran secara real-time.
              </p>
            </div>
          </div>

          {/* Table Hasil Perah Farm */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-slate-800 text-base">Tabel Penerimaan Susu Fresh dari Farm</h2>
                <p className="text-xs text-slate-500">Data perah harian Sapi & Kambing yang dikirim dari Admin Farm</p>
              </div>
              <span className="text-xs font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                {productions.length} Catatan Perah
              </span>
            </div>

            {productions.length === 0 ? (
              <EmptyState title="Belum Ada Data Perah" description="Admin Farm belum menginput data perah." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-y border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Tanggal</th>
                      <th className="px-4 py-3">Ternak</th>
                      <th className="px-4 py-3">Total Perah</th>
                      <th className="px-4 py-3">Setor Pedet</th>
                      <th className="px-4 py-3">Rusak/Afkir</th>
                      <th className="px-4 py-3">Kirim ke PI</th>
                      <th className="px-4 py-3">Alokasi BAST</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {productions.map((p) => {
                      const dStr = new Date(p.tanggal || p.date).toISOString().slice(0, 10);
                      const relatedBasts = bastByDate[dStr] || [];
                      const bastVolOnDate = relatedBasts.reduce((acc, b) => acc + (b.volumeLiters || 0), 0);
                      const grossVol = p.kirimKePI || p.rawVolumeLiters || 0;

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 font-semibold text-slate-700">
                            {new Date(p.tanggal || p.date).toLocaleDateString('id-ID', {
                              weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
                            })}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-800">
                            {p.animalType === 'KAMBING' ? '🐐 Kambing' : '🐄 Sapi'}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-800">
                            {(p.produksi || p.grossVolumeLiters || 0).toLocaleString('id-ID')} Liter
                          </td>
                          <td className="px-4 py-3 text-amber-600">
                            {(p.setorPedet || p.pedetVolumeLiters || 0).toLocaleString('id-ID')} Liter
                          </td>
                          <td className="px-4 py-3 text-rose-600">
                            {(p.rusakAfkir || p.afkirVolumeLiters || 0).toLocaleString('id-ID')} Liter
                          </td>
                          <td className="px-4 py-3 font-black text-blue-700 bg-blue-50/40">
                            {grossVol.toLocaleString('id-ID')} Liter
                          </td>
                          <td className="px-4 py-3">
                            {bastVolOnDate > 0 ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                                  <ArrowDownRight className="w-3 h-3 text-rose-500" />
                                  <span>-{bastVolOnDate} L (BAST)</span>
                                </span>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {relatedBasts.map(b => b.nomorBast).join(', ')}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                              <CheckCircle className="w-3 h-3" />
                              <span>Tercatat Farm</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SURAT BAST PERMINTAAN (HIBAH, PENJUALAN, KERJASAMA) */}
      {activeTab === 'bast' && (
        <div className="space-y-6">
          {/* BAST Metrics Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Total BAST</span>
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mt-2">{basts.length} <span className="text-xs font-semibold text-slate-400">Surat</span></h3>
              <p className="text-[11px] text-indigo-600 font-bold mt-1">Total {totalBastLiters} Liter</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Susu Hibah CSR</span>
                <div className="p-2 rounded-xl bg-pink-50 text-pink-700">
                  <Gift className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-pink-700 mt-2">{totalBastHibah} <span className="text-xs font-semibold text-slate-400">Liter</span></h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Program bantuan gizi</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Penjualan Langsung</span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <ShoppingCart className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-emerald-700 mt-2">{totalBastPenjualan} <span className="text-xs font-semibold text-slate-400">Liter</span></h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Order beli resmi BAST</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Menunggu Fisik</span>
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-amber-700 mt-2">{pendingBastCount} <span className="text-xs font-semibold text-slate-400">Surat</span></h3>
              <p className="text-[11px] text-amber-600 font-medium mt-1">Perlu pengesahan hardfile</p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-600">Filter Keperluan:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setBastFilterType('ALL')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    bastFilterType === 'ALL'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua ({basts.length})
                </button>
                <button
                  onClick={() => setBastFilterType('PENJUALAN_LANGSUNG')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    bastFilterType === 'PENJUALAN_LANGSUNG'
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  💰 Penjualan Langsung
                </button>
                <button
                  onClick={() => setBastFilterType('HIBAH')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    bastFilterType === 'HIBAH'
                      ? 'bg-pink-700 text-white shadow-sm'
                      : 'bg-pink-50 text-pink-800 hover:bg-pink-100'
                  }`}
                >
                  🎁 Susu Hibah CSR
                </button>
                <button
                  onClick={() => setBastFilterType('KERJASAMA')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    bastFilterType === 'KERJASAMA'
                      ? 'bg-blue-700 text-white shadow-sm'
                      : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                  }`}
                >
                  🏢 Kerjasama / Dinas
                </button>
              </div>
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Menampilkan <strong>{filteredBasts.length}</strong> dokumen BAST
            </span>
          </div>

          {/* Table Surat BAST */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <h2 className="font-extrabold text-slate-800 text-base">Daftar Surat BAST Permintaan Susu Segar (Farm)</h2>
              <p className="text-xs text-slate-500">Verifikasi fisik dokumen BAST penyerahan langsung untuk penjualan, hibah, ataupun dinas</p>
            </div>

            {filteredBasts.length === 0 ? (
              <EmptyState
                title="Belum Ada Catatan BAST"
                description="Tidak ada dokumen BAST pada kategori filter ini."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-y border-slate-200">
                    <tr>
                      <th className="px-4 py-3">NO. BAST HARDFILE</th>
                      <th className="px-4 py-3">TANGGAL PENYERAHAN</th>
                      <th className="px-4 py-3">PENGIRIM (FARM)</th>
                      <th className="px-4 py-3">PENERIMA / INSTANSI</th>
                      <th className="px-4 py-3">KEPERLUAN / PERMINTAAN</th>
                      <th className="px-4 py-3">VOLUME SUSU SEGAR</th>
                      <th className="px-4 py-3">STATUS HARDFILE</th>
                      <th className="px-4 py-3 text-right">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredBasts.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-bold text-blue-900 font-mono">{b.nomorBast}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {new Date(b.tanggal).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-4 py-3 text-slate-800 font-semibold">{b.pengirimNama}</td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-800">{b.instansiPenerima || b.penerimaNama || 'Pemasaran & Pembeli'}</div>
                          <div className="text-[10px] text-slate-400">{b.penerimaRole || 'Pihak Kedua'}</div>
                        </td>
                        <td className="px-4 py-3">
                          {b.jenisPermintaan === 'HIBAH' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-pink-800 bg-pink-100 border border-pink-200 px-2.5 py-0.5 rounded-full">
                              <Gift className="w-3 h-3" />
                              <span>Susu Hibah CSR</span>
                            </span>
                          ) : b.jenisPermintaan === 'KERJASAMA' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-100 border border-blue-200 px-2.5 py-0.5 rounded-full">
                              <Building2 className="w-3 h-3" />
                              <span>Kerjasama Dinas</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                              <ShoppingCart className="w-3 h-3" />
                              <span>Penjualan Langsung</span>
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-black text-blue-700">{b.volumeLiters} Liter</td>
                        <td className="px-4 py-3">
                          {b.status === 'DITERIMA' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                              <CheckCircle className="w-3 h-3" />
                              <span>Hardfile Diterima</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                              <Clock className="w-3 h-3" />
                              <span>Menunggu Hardfile Fisik</span>
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          {b.status !== 'DITERIMA' && (
                            <button
                              onClick={() => {
                                setSelectedBast(b);
                                setShowConfirmModal(true);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all shadow-sm active:scale-95"
                            >
                              Konfirmasi Hardfile Diterima
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedBast(b);
                              setShowPrintModal(true);
                            }}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all inline-flex items-center gap-1"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Detail / Pratinjau Salinan</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SUSU OLAHAN RASA */}
      {activeTab === 'susu_rasa' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-slate-800 text-base">Tabel Hasil Pengemasan — Susu Olahan Rasa</h2>
              <p className="text-xs text-slate-500">Konfirmasi penerimaan varian Susu Olahan Rasa dari Admin Pengemasan</p>
            </div>
            <span className="text-xs font-bold bg-pink-100 text-pink-800 px-3 py-1 rounded-full">
              {susuRasaItems.length} Entry
            </span>
          </div>

          {susuRasaItems.length === 0 ? (
            <EmptyState
              title="Belum Ada Data Susu Rasa"
              description="Admin Pengemasan belum menginput hasil kemasan Susu Rasa."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-y border-slate-200">
                  <tr>
                    <th className="px-4 py-3">TANGGAL</th>
                    <th className="px-4 py-3">PRODUK</th>
                    <th className="px-4 py-3">KATEGORI</th>
                    <th className="px-4 py-3">KEMASAN & UKURAN</th>
                    <th className="px-4 py-3">JUMLAH</th>
                    <th className="px-4 py-3">STATUS</th>
                    <th className="px-4 py-3 text-right">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {susuRasaItems.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-800">
                        {new Date(pkg.tanggal || pkg.createdAt).toLocaleDateString('id-ID', {
                          day: '2-digit', month: '2-digit', year: 'numeric'
                        })}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-extrabold text-slate-900">{pkg.jenisProduk}</div>
                        <div className="text-[11px] text-slate-500 font-semibold">{pkg.origin || 'Sapi'} — {pkg.variant || pkg.productSubtype || 'Original'}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {pkg.productCategory || 'Susu'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 font-medium font-mono text-[11px]">
                        {pkg.kemasanStr || pkg.kemasan}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-900 text-white shadow-sm inline-block">
                          {pkg.jumlah || 0} pcs
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {pkg.status === 'DITERIMA' ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Diterima Pemasaran</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-3 py-1 rounded-full">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Menunggu</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-2">
                        {pkg.status !== 'DITERIMA' && (
                          <button
                            onClick={() => handleOpenConfirmPkgModal(pkg)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all shadow-sm active:scale-95"
                          >
                            Konfirmasi Terima
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenConfirmPkgModal(pkg)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all inline-flex items-center"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: YOGURT */}
      {activeTab === 'yogurt' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-slate-800 text-base">Tabel Hasil Pengemasan — Yogurt</h2>
              <p className="text-xs text-slate-500">Konfirmasi penerimaan varian Yogurt dari Admin Pengemasan</p>
            </div>
            <span className="text-xs font-bold bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
              {yogurtItems.length} Entry
            </span>
          </div>

          {yogurtItems.length === 0 ? (
            <EmptyState
              title="Belum Ada Data Yogurt"
              description="Admin Pengemasan belum menginput hasil kemasan Yogurt."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-y border-slate-200">
                  <tr>
                    <th className="px-4 py-3">TANGGAL</th>
                    <th className="px-4 py-3">PRODUK</th>
                    <th className="px-4 py-3">KATEGORI</th>
                    <th className="px-4 py-3">KEMASAN & UKURAN</th>
                    <th className="px-4 py-3">JUMLAH</th>
                    <th className="px-4 py-3">STATUS</th>
                    <th className="px-4 py-3 text-right">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {yogurtItems.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-800">
                        {new Date(pkg.tanggal || pkg.createdAt).toLocaleDateString('id-ID', {
                          day: '2-digit', month: '2-digit', year: 'numeric'
                        })}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-extrabold text-slate-900">{pkg.jenisProduk}</div>
                        <div className="text-[11px] text-slate-500 font-semibold">{pkg.origin || 'Sapi'} — {pkg.variant || pkg.productSubtype || 'Original'}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                          {pkg.productCategory || 'Yogurt'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 font-medium font-mono text-[11px]">
                        {pkg.kemasanStr || pkg.kemasan}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-900 text-white shadow-sm inline-block">
                          {pkg.jumlah || 0} pcs
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {pkg.status === 'DITERIMA' ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Diterima Pemasaran</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-3 py-1 rounded-full">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Menunggu</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-2">
                        {pkg.status !== 'DITERIMA' && (
                          <button
                            onClick={() => handleOpenConfirmPkgModal(pkg)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all shadow-sm active:scale-95"
                          >
                            Konfirmasi Terima
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenConfirmPkgModal(pkg)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all inline-flex items-center"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: KEJU */}
      {activeTab === 'keju' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-slate-800 text-base">Tabel Hasil Pengemasan — Keju</h2>
              <p className="text-xs text-slate-500">Konfirmasi penerimaan varian Keju dari Admin Pengemasan</p>
            </div>
            <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
              {kejuItems.length} Entry
            </span>
          </div>

          {kejuItems.length === 0 ? (
            <EmptyState
              title="Belum Ada Data Keju"
              description="Admin Pengemasan belum menginput hasil kemasan Keju."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-y border-slate-200">
                  <tr>
                    <th className="px-4 py-3">TANGGAL</th>
                    <th className="px-4 py-3">PRODUK</th>
                    <th className="px-4 py-3">KATEGORI</th>
                    <th className="px-4 py-3">KEMASAN & UKURAN</th>
                    <th className="px-4 py-3">JUMLAH</th>
                    <th className="px-4 py-3">STATUS</th>
                    <th className="px-4 py-3 text-right">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {kejuItems.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-800">
                        {new Date(pkg.tanggal || pkg.createdAt).toLocaleDateString('id-ID', {
                          day: '2-digit', month: '2-digit', year: 'numeric'
                        })}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-extrabold text-slate-900">{pkg.jenisProduk}</div>
                        <div className="text-[11px] text-slate-500 font-semibold">{pkg.origin || 'Sapi'} — {pkg.variant || pkg.productSubtype || 'Original'}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          {pkg.productCategory || 'Keju'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 font-medium font-mono text-[11px]">
                        {pkg.kemasanStr || pkg.kemasan}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-900 text-white shadow-sm inline-block">
                          {pkg.jumlah || 0} pcs
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {pkg.status === 'DITERIMA' ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Diterima Pemasaran</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-3 py-1 rounded-full">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Menunggu</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-2">
                        {pkg.status !== 'DITERIMA' && (
                          <button
                            onClick={() => handleOpenConfirmPkgModal(pkg)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all shadow-sm active:scale-95"
                          >
                            Konfirmasi Terima
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenConfirmPkgModal(pkg)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all inline-flex items-center"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: KONFIRMASI PENERIMAAN BAST HARDFILE */}
      {showConfirmModal && selectedBast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-base">Pengesahan Penerimaan BAST Hardfile</h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 p-3.5 rounded-2xl text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">No. BAST Hardfile:</span>
                <span className="font-mono font-bold text-indigo-900">{selectedBast.nomorBast}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Keperluan / Permintaan:</span>
                <span className="font-bold text-slate-900">
                  {selectedBast.jenisPermintaan === 'HIBAH' ? '🎁 Susu Hibah CSR' : selectedBast.jenisPermintaan === 'KERJASAMA' ? '🏢 Kerjasama / Dinas' : '💰 Penjualan Langsung'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Penerima / Instansi:</span>
                <span className="font-bold text-slate-900">{selectedBast.instansiPenerima || selectedBast.penerimaNama || 'Pemasaran'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Pengirim (Farm):</span>
                <span className="font-bold text-slate-800">{selectedBast.pengirimNama}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Volume Susu Segar:</span>
                <span className="font-black text-indigo-700">{selectedBast.volumeLiters} Liter</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-bold text-slate-700">Catatan Penerimaan Hardfile (Opsional)</label>
              <textarea
                rows="2"
                placeholder="Contoh: Dokumen fisik BAST telah diterima & fisik susu sesuai..."
                value={confirmNotes}
                onChange={(e) => setConfirmNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmBast}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md disabled:opacity-50"
              >
                {submitting ? 'Mengonfirmasi...' : 'Konfirmasi Hardfile Diterima'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: PRATINJAU & CETAK SURAT BAST RESMI */}
      {showPrintModal && selectedBast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 w-full max-w-3xl shadow-2xl border border-slate-200 space-y-6 my-8 print:p-0 print:shadow-none print:border-none">
            {/* Modal Controls (Hidden when printing) */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
              <div className="flex items-center gap-2 text-slate-800 font-extrabold text-lg">
                <FileText className="w-5 h-5 text-indigo-700" />
                <span>Dokumen Berita Acara Serah Terima (BAST)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="bg-[#1E3F20] hover:bg-[#2b592e] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md inline-flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Surat (Print/PDF)</span>
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* SURAT BAST DOCUMENT CONTENT */}
            <div className="p-8 border border-slate-300 rounded-2xl bg-white space-y-6 text-slate-900 font-serif">
              {/* Kop Surat Header */}
              <div className="border-b-4 border-double border-slate-900 pb-4 text-center space-y-1">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-700 font-sans">KEMENTERIAN PERTANIAN</h2>
                <h1 className="text-lg font-black uppercase text-slate-950 font-sans">BALAI BESAR PEMBIBITAN TERNAK UNGGUL DAN HIJAUAN PAKAN TERNAK (BBPTUHPT)</h1>
                <p className="text-[11px] font-sans text-slate-600">Jl. Raya Peternakan No. 1, Baturraden - Jawa Tengah | Telp: (0281) 681023</p>
              </div>

              {/* Document Title */}
              <div className="text-center space-y-1 pt-2">
                <h3 className="text-base font-bold uppercase underline tracking-wider font-sans">BERITA ACARA SERAH TERIMA (BAST) SUSU SEGAR</h3>
                <p className="text-xs font-mono font-semibold text-slate-700 font-sans">Nomor: {selectedBast.nomorBast}</p>
              </div>

              {/* Statement text */}
              <p className="text-xs leading-relaxed text-justify">
                Pada hari ini, <span className="font-bold">{new Date(selectedBast.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>, kami yang bertanda tangan di bawah ini telah melakukan serah terima fisik produk susu segar murni (Fresh Milk) sesuai dengan rincian data sebagai berikut:
              </p>

              {/* Handover Details Table */}
              <table className="w-full text-xs border border-slate-400 border-collapse font-sans">
                <tbody>
                  <tr className="border-b border-slate-300">
                    <td className="p-2.5 font-bold bg-slate-100 w-1/3">Jenis Komoditas</td>
                    <td className="p-2.5 font-semibold">Susu Murni Segar / Susu Mentah (Fresh Milk)</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="p-2.5 font-bold bg-slate-100">Volume Diserahkan</td>
                    <td className="p-2.5 font-black text-sm text-blue-900">{selectedBast.volumeLiters} Liter</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="p-2.5 font-bold bg-slate-100">Keperluan / Permintaan</td>
                    <td className="p-2.5 font-bold text-indigo-900">
                      {selectedBast.jenisPermintaan === 'HIBAH' ? '🎁 Penyaluran Susu Hibah / Program CSR Gizi' : selectedBast.jenisPermintaan === 'KERJASAMA' ? '🏢 Permintaan Kerjasama / Dinas / Universitas' : '💰 Penjualan Susu Langsung'}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="p-2.5 font-bold bg-slate-100">Unit Pengirim (Pihak I)</td>
                    <td className="p-2.5 font-semibold">{selectedBast.pengirimNama} ({selectedBast.pengirimRole})</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="p-2.5 font-bold bg-slate-100">Penerima / Instansi (Pihak II)</td>
                    <td className="p-2.5 font-semibold">{selectedBast.instansiPenerima || selectedBast.penerimaNama || 'Admin Pemasaran & Pembeli'} ({selectedBast.penerimaRole || 'PIHAK_KEDUA'})</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="p-2.5 font-bold bg-slate-100">Status Hardfile</td>
                    <td className="p-2.5 font-bold text-emerald-700">{selectedBast.status}</td>
                  </tr>
                  {selectedBast.catatan && (
                    <tr>
                      <td className="p-2.5 font-bold bg-slate-100">Catatan Khusus</td>
                      <td className="p-2.5 italic text-slate-700">{selectedBast.catatan}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <p className="text-xs leading-relaxed">
                Demikian Berita Acara Serah Terima ini dibuat secara sah dan sebenarnya untuk dipergunakan sebagai bukti fisik serah terima barang operasional di lingkungan BBPTUHPT.
              </p>

              {/* Signature Section */}
              <div className="grid grid-cols-2 gap-8 pt-8 font-sans text-xs">
                <div className="text-center space-y-12">
                  <div>
                    <p className="font-semibold text-slate-600">Pihak Pertama (Pengirim / Farm)</p>
                    <p className="font-bold text-slate-900 mt-0.5">{selectedBast.pengirimNama}</p>
                  </div>
                  <div className="border-b border-slate-900 w-3/4 mx-auto pt-8"></div>
                  <p className="text-[10px] text-slate-500 font-mono">NIP / ID: {selectedBast.pengirimRole}</p>
                </div>

                <div className="text-center space-y-12">
                  <div>
                    <p className="font-semibold text-slate-600">Pihak Kedua (Penerima / Instansi / Pemasaran)</p>
                    <p className="font-bold text-slate-900 mt-0.5">{selectedBast.instansiPenerima || selectedBast.penerimaNama || '(Menunggu Pengesahan)'}</p>
                  </div>
                  <div className="border-b border-slate-900 w-3/4 mx-auto pt-8"></div>
                  <p className="text-[10px] text-slate-500 font-mono">Penerima Resmi</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: KONFIRMASI PENERIMAAN PRODUK OLAHAN */}
      {showConfirmPkgModal && selectedPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-base">Konfirmasi Terima Produk Olahan</h3>
              <button
                onClick={() => setShowConfirmPkgModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-purple-50 border border-purple-200 p-3.5 rounded-2xl text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Jenis Produk Olahan:</span>
                <span className="font-bold text-purple-950">{selectedPkg.jenisProduk}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Ukuran Kemasan:</span>
                <span className="font-bold text-purple-900">{selectedPkg.kemasan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Jumlah Diterima:</span>
                <span className="font-black text-purple-700">{selectedPkg.jumlah} Pcs</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-bold text-slate-700">Catatan Penerimaan (Opsional)</label>
              <textarea
                rows="2"
                placeholder="Contoh: Kondisi kemasan baik & lengkap..."
                value={pkgNotes}
                onChange={(e) => setPkgNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmPkgModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={submittingPkg}
                onClick={handleConfirmPkg}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs shadow-md disabled:opacity-50"
              >
                {submittingPkg ? 'Mengonfirmasi...' : 'Konfirmasi Terima Olahan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
