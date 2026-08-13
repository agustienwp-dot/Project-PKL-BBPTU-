'use client';

import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import { Package, Plus, ShoppingBag, Truck, History, AlertCircle } from 'lucide-react';

export default function AlatPage() {
  const [loading, setLoading] = useState(true);
  const [equipments, setEquipments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [toast, setToast] = useState(null);

  // Form New Equipment Modal
  const [showEqModal, setShowEqModal] = useState(false);
  const [eqName, setEqName] = useState('');
  const [eqCategory, setEqCategory] = useState('Kemasan');
  const [eqInitStock, setEqInitStock] = useState('100');
  const [eqUnit, setEqUnit] = useState('pcs');

  // Form Transaction Modal
  const [showTxModal, setShowTxModal] = useState(false);
  const [selectedEqId, setSelectedEqId] = useState('');
  const [txType, setTxType] = useState('PEMBELIAN');
  const [txQty, setTxQty] = useState('');
  const [txDestOrSupplier, setTxDestOrSupplier] = useState('');
  const [txNotes, setTxNotes] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/alat');
      if (res.data.success) {
        setEquipments(res.data.data.equipments || []);
        setTransactions(res.data.data.recentTransactions || []);
      }
    } catch (err) {
      console.error('Error fetching equipment data:', err);
      setToast({ type: 'error', message: 'Gagal memuat data stok alat.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateEquipment = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/alat', {
        actionType: 'CREATE_EQUIPMENT',
        name: eqName,
        category: eqCategory,
        initialStock: eqInitStock,
        unit: eqUnit,
      });

      if (res.data.success) {
        setToast({ type: 'success', message: `Alat "${eqName}" berhasil ditambahkan!` });
        setShowEqModal(false);
        setEqName('');
        fetchData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menambah alat.';
      setToast({ type: 'error', message: msg });
    }
  };

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/alat', {
        actionType: 'RECORD_TRANSACTION',
        equipmentId: selectedEqId,
        type: txType,
        quantity: txQty,
        destinationOrSupplier: txDestOrSupplier,
        notes: txNotes,
      });

      if (res.data.success) {
        setToast({ type: 'success', message: res.data.message });
        setShowTxModal(false);
        setTxQty('');
        setTxDestOrSupplier('');
        fetchData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal mencatat transaksi alat.';
      setToast({ type: 'error', message: msg });
    }
  };

  if (loading) return <LoadingSpinner text="Memuat Modul Stok Alat & Kemasan..." />;

  return (
    <div className="space-y-8 pb-12">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#1E3F20] flex items-center gap-3">
            <Package className="w-8 h-8 text-[#1E3F20]" />
            Modul 4: Stok Alat & Kemasan (Botol, Cup, Plastik, & Peralatan)
          </h1>
          <p className="text-slate-600 text-xs mt-1">Formulasi Real-time: `sisa_stok_alat = stok_awal + alat_dibeli - alat_didistribusikan` ber-Histori Transaksi Audit</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEqModal(true)}
            className="px-4 py-2.5 bg-[#1E3F20] hover:bg-[#2b592e] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Register Alat / Kemasan Baru</span>
          </button>
          <button
            onClick={() => {
              if (equipments.length > 0) setSelectedEqId(equipments[0].id);
              setShowTxModal(true);
            }}
            className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Catat Transaksi (Beli / Pakai)</span>
          </button>
        </div>
      </div>

      {/* Real-time Inventory Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {equipments.map((eq) => (
          <div key={eq.id} className="bg-white border border-slate-200 p-6 rounded-3xl space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {eq.category}
              </span>
              <button
                onClick={() => {
                  setSelectedEqId(eq.id);
                  setShowTxModal(true);
                }}
                className="text-xs font-bold text-[#1E3F20] hover:underline"
              >
                + Transaksi
              </button>
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900 truncate">{eq.name}</h3>
              <p className="text-2xl md:text-3xl font-black font-mono text-[#1E3F20] mt-1">
                {eq.currentStock.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-500">{eq.unit}</span>
              </p>
            </div>

            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex justify-between font-medium">
              <span>Sisa Stok Real-time</span>
              <span className="font-bold text-emerald-700">Tersedia</span>
            </div>
          </div>
        ))}
      </div>

      {/* Transaction History Log Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <History className="w-5 h-5 text-purple-700" />
          Histori Transaksi Pembelian & Pemakaian Alat (Audit Trail)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-[#F5F5F0] text-slate-700 uppercase text-[11px] tracking-wider border-b border-slate-200 font-bold">
              <tr>
                <th className="px-4 py-3">Tanggal Transaksi</th>
                <th className="px-4 py-3">Nama Alat / Kemasan</th>
                <th className="px-4 py-3">Tipe Transaksi</th>
                <th className="px-4 py-3">Jumlah (Qty)</th>
                <th className="px-4 py-3">Tujuan / Supplier</th>
                <th className="px-4 py-3">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3.5 font-mono text-xs font-semibold text-slate-700">
                    {new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-900">{tx.equipment?.name}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
                      tx.type === 'PEMBELIAN' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {tx.type === 'PEMBELIAN' ? '+ PEMBELIAN (MASUK)' : '- DISTRIBUSI (PAKAI)'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono font-black text-slate-900 text-base">
                    {tx.type === 'PEMBELIAN' ? `+${tx.quantity}` : `-${tx.quantity}`} {tx.equipment?.unit}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-700">{tx.destinationOrSupplier || '-'}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-500 italic">{tx.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form New Equipment */}
      {showEqModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900">Register Alat / Kemasan Baru</h3>
            <form onSubmit={handleCreateEquipment} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Nama Alat / Kemasan</label>
                <input
                  type="text"
                  required
                  value={eqName}
                  onChange={(e) => setEqName(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2.5"
                  placeholder="e.g. Botol Kaca Susu 500ml"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Kategori</label>
                <select
                  value={eqCategory}
                  onChange={(e) => setEqCategory(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2.5 font-bold"
                >
                  <option value="Kemasan">Kemasan (Botol, Cup, Plastik)</option>
                  <option value="Peralatan Perah">Peralatan Perah</option>
                  <option value="Peralatan Olahan">Peralatan Olahan</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Stok Awal</label>
                  <input
                    type="number"
                    required
                    value={eqInitStock}
                    onChange={(e) => setEqInitStock(e.target.value)}
                    className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Satuan Unit</label>
                  <input
                    type="text"
                    required
                    value={eqUnit}
                    onChange={(e) => setEqUnit(e.target.value)}
                    className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2.5 font-bold"
                    placeholder="pcs / unit / set"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEqModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1E3F20] text-white font-bold rounded-xl shadow-md"
                >
                  Simpan Alat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Form Transaction */}
      {showTxModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900">Catat Transaksi Alat / Kemasan</h3>
            <form onSubmit={handleCreateTransaction} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Pilih Alat / Kemasan</label>
                <select
                  value={selectedEqId}
                  onChange={(e) => setSelectedEqId(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                >
                  {equipments.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name} (Stok Terkini: {eq.currentStock} {eq.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Tipe Transaksi</label>
                <select
                  value={txType}
                  onChange={(e) => setTxType(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                >
                  <option value="PEMBELIAN">+ PEMBELIAN (Menambah Stok Alat)</option>
                  <option value="DISTRIBUSI">- DISTRIBUSI / PEMAKAIAN (Mengurangi Stok Alat)</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Jumlah (Qty)</label>
                <input
                  type="number"
                  required
                  value={txQty}
                  onChange={(e) => setTxQty(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-sm"
                  placeholder="e.g. 50"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Tujuan Distribusi / Supplier Pembelian</label>
                <input
                  type="text"
                  value={txDestOrSupplier}
                  onChange={(e) => setTxDestOrSupplier(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2.5"
                  placeholder="e.g. Unit Pengolahan Susu / Supplier CV Kemasan"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Catatan Transaksi</label>
                <textarea
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2.5"
                  rows="2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowTxModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 text-white font-bold rounded-xl shadow-md"
                >
                  Simpan Transaksi Alat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
