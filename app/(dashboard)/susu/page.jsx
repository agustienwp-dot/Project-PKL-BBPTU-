'use client';

import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import { Milk, Plus, Calendar, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, Truck, CookingPot, Package } from 'lucide-react';

export default function SusuPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'reception' | 'processing' | 'distribution'
  
  const [summaryData, setSummaryData] = useState(null);
  const [receptions, setReceptions] = useState([]);
  const [processings, setProcessings] = useState([]);
  const [distributions, setDistributions] = useState([]);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [toast, setToast] = useState(null);

  // Form Modals
  const [showReceptionModal, setShowReceptionModal] = useState(false);
  const [rawInLiters, setRawInLiters] = useState('');

  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [rawUsedLiters, setRawUsedLiters] = useState('');
  const [botolOutput, setBotolOutput] = useState('0');
  const [cupOutput, setCupOutput] = useState('0');
  const [bantalOutput, setBantalOutput] = useState('0');

  const [showDistModal, setShowDistModal] = useState(false);
  const [destination, setDestination] = useState('');
  const [botolDist, setBotolDist] = useState('0');
  const [cupDist, setCupDist] = useState('0');
  const [bantalDist, setBantalDist] = useState('0');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, recRes, procRes, distRes] = await Promise.all([
        api.get(`/susu/summary?date=${selectedDate}`),
        api.get('/susu/reception'),
        api.get('/susu/processing'),
        api.get('/susu/distribution'),
      ]);

      if (sumRes.data.success) setSummaryData(sumRes.data.data);
      if (recRes.data.success) setReceptions(recRes.data.data);
      if (procRes.data.success) setProcessings(procRes.data.data);
      if (distRes.data.success) setDistributions(distRes.data.data);
    } catch (err) {
      console.error('Error fetching milk data:', err);
      setToast({ type: 'error', message: 'Gagal memuat data produk susu.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const handleAddReception = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/susu/reception', {
        volumeLiters: rawInLiters,
        date: selectedDate,
      });

      if (res.data.success) {
        setToast({ type: 'success', message: 'Penerimaan susu mentah berhasil dicatat!' });
        setShowReceptionModal(false);
        setRawInLiters('');
        fetchData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menyimpan penerimaan susu.';
      setToast({ type: 'error', message: msg });
    }
  };

  const handleAddProcessing = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/susu/processing', {
        rawMilkUsedLiters: rawUsedLiters,
        botolOutputQty: botolOutput,
        cupOutputQty: cupOutput,
        bantalOutputQty: bantalOutput,
        date: selectedDate,
      });

      if (res.data.success) {
        setToast({ type: 'success', message: 'Pengolahan susu & output 3 jenis kemasan berhasil disimpan!' });
        setShowProcessingModal(false);
        setRawUsedLiters('');
        setBotolOutput('0');
        setCupOutput('0');
        setBantalOutput('0');
        fetchData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal mencatat pengolahan susu.';
      setToast({ type: 'error', message: msg });
    }
  };

  const handleAddDistribution = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/susu/distribution', {
        destination,
        botolQty: botolDist,
        cupQty: cupDist,
        bantalQty: bantalDist,
        date: selectedDate,
      });

      if (res.data.success) {
        setToast({ type: 'success', message: 'Distribusi kemasan susu berhasil disimpan!' });
        setShowDistModal(false);
        setDestination('');
        setBotolDist('0');
        setCupDist('0');
        setBantalDist('0');
        fetchData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal mencatat distribusi.';
      setToast({ type: 'error', message: msg });
    }
  };

  if (loading) return <LoadingSpinner text="Memuat Alur Kompleks Produk Susu (Raw -> Processed -> 3 Packaging -> Distribution)..." />;

  return (
    <div className="space-y-8 pb-12">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#1E3F20] flex items-center gap-3">
            <Milk className="w-8 h-8 text-[#1E3F20]" />
            Modul 3: Produk Susu (Raw In → Olahan 3 Kemasan → Distribusi)
          </h1>
          <p className="text-slate-600 text-xs mt-1">Alur Kompleks: Susu Mentah Diterima, Diolah, Output Botol/Cup/Plastik Bantal, & Laporan Stok Harian</p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Pilih Tanggal:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 shadow-sm"
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        {[
          { id: 'summary', label: 'e. Laporan Ringkasan Stok Susu', icon: RefreshCw },
          { id: 'reception', label: 'a. Susu Diterima (Raw In)', icon: Milk },
          { id: 'processing', label: 'b & c. Susu Diolah & Output Kemasan', icon: CookingPot },
          { id: 'distribution', label: 'd. Distribusi Pemasaran', icon: Truck },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#1E3F20] text-[#1E3F20] bg-white rounded-t-2xl shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB E: LAPORAN / RINGKASAN STOK SUSU HARIAN */}
      {/* ========================================================================= */}
      {activeTab === 'summary' && summaryData && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            <h3 className="text-lg font-black text-[#1E3F20] border-b border-slate-200 pb-3 flex items-center justify-between">
              <span>Laporan Ringkasan Stok Susu Per Hari</span>
              <span className="font-mono text-xs font-bold bg-[#F5F5F0] px-3 py-1 rounded-lg text-slate-800 border border-slate-300">
                {new Date(summaryData.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </h3>

            {/* Susu Mentah Flow Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">1. Alur Susu Mentah (Raw Milk Liter)</h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs font-mono">
                <div className="bg-[#F5F5F0] p-4 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 font-sans font-bold uppercase block">Stok Awal Hari Ini</span>
                  <span className="text-xl font-black text-slate-900">{summaryData.rawMilk?.initialStockLiters} L</span>
                </div>
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-1">
                  <span className="text-[10px] text-emerald-800 font-sans font-bold uppercase block">+ Susu Masuk Hari Ini</span>
                  <span className="text-xl font-black text-emerald-800">+{summaryData.rawMilk?.inTodayLiters} L</span>
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 space-y-1">
                  <span className="text-[10px] text-blue-800 font-sans font-bold uppercase block">= Total Susu Mentah</span>
                  <span className="text-xl font-black text-blue-900">{summaryData.rawMilk?.totalStockAfterInLiters} L</span>
                </div>
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-1">
                  <span className="text-[10px] text-amber-800 font-sans font-bold uppercase block">- Susu Diolah Hari Ini</span>
                  <span className="text-xl font-black text-amber-800">-{summaryData.rawMilk?.processedTodayLiters} L</span>
                </div>
                <div className="bg-[#1E3F20] text-white p-4 rounded-2xl space-y-1 shadow-md">
                  <span className="text-[10px] text-emerald-200 font-sans font-bold uppercase block">= Sisa Mentah Akhir</span>
                  <span className="text-xl font-black text-white">{summaryData.rawMilk?.remainingStockLiters} L</span>
                </div>
              </div>
            </div>

            {/* Output Olahan 3 Jenis Kemasan */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">2. Hasil Olahan & Distribusi (3 Jenis Kemasan)</h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Botol */}
                <div className="bg-[#F5F5F0] p-5 rounded-2xl border border-slate-300 space-y-3 text-xs">
                  <h5 className="font-extrabold text-sm text-slate-900 flex items-center justify-between">
                    <span>Kemasan Botol</span>
                    <Package className="w-4 h-4 text-[#1E3F20]" />
                  </h5>
                  <div className="space-y-1.5 font-mono text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Hasil Olahan Hari Ini:</span>
                      <span className="font-bold text-emerald-800">+{summaryData.packagedOutputToday?.botol} botol</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Didistribusikan Hari Ini:</span>
                      <span className="font-bold text-rose-700">-{summaryData.packagedDistributedToday?.botol} botol</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-300 text-sm">
                      <span className="font-bold font-sans text-slate-900">Sisa Stok Akhir:</span>
                      <span className="font-black text-[#1E3F20]">{summaryData.packagedFinalRemainingStock?.botol} botol</span>
                    </div>
                  </div>
                </div>

                {/* Cup */}
                <div className="bg-[#F5F5F0] p-5 rounded-2xl border border-slate-300 space-y-3 text-xs">
                  <h5 className="font-extrabold text-sm text-slate-900 flex items-center justify-between">
                    <span>Kemasan Cup</span>
                    <Package className="w-4 h-4 text-blue-700" />
                  </h5>
                  <div className="space-y-1.5 font-mono text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Hasil Olahan Hari Ini:</span>
                      <span className="font-bold text-emerald-800">+{summaryData.packagedOutputToday?.cup} cup</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Didistribusikan Hari Ini:</span>
                      <span className="font-bold text-rose-700">-{summaryData.packagedDistributedToday?.cup} cup</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-300 text-sm">
                      <span className="font-bold font-sans text-slate-900">Sisa Stok Akhir:</span>
                      <span className="font-black text-blue-900">{summaryData.packagedFinalRemainingStock?.cup} cup</span>
                    </div>
                  </div>
                </div>

                {/* Plastik Bantal */}
                <div className="bg-[#F5F5F0] p-5 rounded-2xl border border-slate-300 space-y-3 text-xs">
                  <h5 className="font-extrabold text-sm text-slate-900 flex items-center justify-between">
                    <span>Plastik Bantal</span>
                    <Package className="w-4 h-4 text-purple-700" />
                  </h5>
                  <div className="space-y-1.5 font-mono text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Hasil Olahan Hari Ini:</span>
                      <span className="font-bold text-emerald-800">+{summaryData.packagedOutputToday?.bantal} pcs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Didistribusikan Hari Ini:</span>
                      <span className="font-bold text-rose-700">-{summaryData.packagedDistributedToday?.bantal} pcs</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-300 text-sm">
                      <span className="font-bold font-sans text-slate-900">Sisa Stok Akhir:</span>
                      <span className="font-black text-purple-900">{summaryData.packagedFinalRemainingStock?.bantal} pcs</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB A: SUSU DITERIMA (RAW MILK IN) */}
      {/* ========================================================================= */}
      {activeTab === 'reception' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900">Histori Penerimaan Susu Mentah (Raw Milk In)</h3>
            <button
              onClick={() => setShowReceptionModal(true)}
              className="px-4 py-2 bg-[#1E3F20] text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Input Susu Mentah Diterima</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-[#F5F5F0] text-slate-700 uppercase text-[11px] tracking-wider border-b border-slate-200 font-bold">
                <tr>
                  <th className="px-4 py-3">Tanggal Penerimaan</th>
                  <th className="px-4 py-3">Jumlah Volume (Liter)</th>
                  <th className="px-4 py-3">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {receptions.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3.5 font-mono text-xs font-semibold text-slate-700">
                      {new Date(r.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-black text-[#1E3F20] text-base">+{r.volumeLiters} Liter</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{r.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB B & C: SUSU DIOLAH & OUTPUT 3 KEMASAN */}
      {/* ========================================================================= */}
      {activeTab === 'processing' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900">Histori Pengolahan Susu & Production Output</h3>
            <button
              onClick={() => setShowProcessingModal(true)}
              className="px-4 py-2 bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Input Processed Milk Output</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-[#F5F5F0] text-slate-700 uppercase text-[11px] tracking-wider border-b border-slate-200 font-bold">
                <tr>
                  <th className="px-4 py-3">Tanggal Olah</th>
                  <th className="px-4 py-3">Susu Mentah Digunakan</th>
                  <th className="px-4 py-3">Hasil Botol</th>
                  <th className="px-4 py-3">Hasil Cup</th>
                  <th className="px-4 py-3">Hasil Plastik Bantal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {processings.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3.5 font-mono text-xs font-semibold text-slate-700">
                      {new Date(p.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-amber-800">-{p.rawMilkUsedLiters} Liter</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-emerald-800">+{p.botolOutputQty} botol</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-blue-800">+{p.cupOutputQty} cup</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-purple-800">+{p.bantalOutputQty} pcs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB D: DISTRIBUSI KE PEMASARAN */}
      {/* ========================================================================= */}
      {activeTab === 'distribution' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900">Histori Distribusi Pengiriman Susu ke Pemasaran</h3>
            <button
              onClick={() => setShowDistModal(true)}
              className="px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Input Distribusi Pemasaran</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-[#F5F5F0] text-slate-700 uppercase text-[11px] tracking-wider border-b border-slate-200 font-bold">
                <tr>
                  <th className="px-4 py-3">Tanggal Send</th>
                  <th className="px-4 py-3">Tujuan Pengiriman / Agen</th>
                  <th className="px-4 py-3">Botol Dikirim</th>
                  <th className="px-4 py-3">Cup Dikirim</th>
                  <th className="px-4 py-3">Plastik Bantal Dikirim</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {distributions.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3.5 font-mono text-xs font-semibold text-slate-700">
                      {new Date(d.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">{d.destination}</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-rose-700">-{d.botolQty} botol</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-rose-700">-{d.cupQty} cup</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-rose-700">-{d.bantalQty} pcs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Reception */}
      {showReceptionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900">Input Susu Mentah Diterima (Raw In)</h3>
            <form onSubmit={handleAddReception} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Volume Susu Diterima (Liter)</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={rawInLiters}
                  onChange={(e) => setRawInLiters(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-sm"
                  placeholder="e.g. 120"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowReceptionModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1E3F20] text-white font-bold rounded-xl shadow-md"
                >
                  Simpan Susu Mentah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Processing */}
      {showProcessingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900">Input Susu Diolah & Output 3 Kemasan</h3>
            <form onSubmit={handleAddProcessing} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1 text-amber-800">Susu Mentah yang Dimasak/Diolah (Liter)</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={rawUsedLiters}
                  onChange={(e) => setRawUsedLiters(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-sm"
                  placeholder="e.g. 80"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold block mb-1">Hasil Botol</label>
                  <input
                    type="number"
                    value={botolOutput}
                    onChange={(e) => setBotolOutput(e.target.value)}
                    className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Hasil Cup</label>
                  <input
                    type="number"
                    value={cupOutput}
                    onChange={(e) => setCupOutput(e.target.value)}
                    className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Hasil Bantal</label>
                  <input
                    type="number"
                    value={bantalOutput}
                    onChange={(e) => setBantalOutput(e.target.value)}
                    className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowProcessingModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-700 text-white font-bold rounded-xl shadow-md"
                >
                  Simpan Pengolahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Distribution */}
      {showDistModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900">Input Distribusi Pengiriman Susu</h3>
            <form onSubmit={handleAddDistribution} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Tujuan Pemasaran / Agen / Toko</label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2.5"
                  placeholder="e.g. Toko Jaya Susu Boyolali"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold block mb-1">Botol Dikirim</label>
                  <input
                    type="number"
                    value={botolDist}
                    onChange={(e) => setBotolDist(e.target.value)}
                    className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Cup Dikirim</label>
                  <input
                    type="number"
                    value={cupDist}
                    onChange={(e) => setCupDist(e.target.value)}
                    className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Bantal Dikirim</label>
                  <input
                    type="number"
                    value={bantalDist}
                    onChange={(e) => setBantalDist(e.target.value)}
                    className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowDistModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 text-white font-bold rounded-xl shadow-md"
                >
                  Simpan Distribusi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
