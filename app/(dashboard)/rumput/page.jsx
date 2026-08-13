'use client';

import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import { Sprout, Plus, Trash2, Calendar, Scale, Truck, AlertCircle } from 'lucide-react';

export default function RumputPage() {
  const [loading, setLoading] = useState(true);
  const [rumputList, setRumputList] = useState([]);
  const [totalStockKg, setTotalStockKg] = useState(0);
  const [toast, setToast] = useState(null);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [grassType, setGrassType] = useState('Rumput Gajah (Pennisetum purpureum)');
  const [incomingQty, setIncomingQty] = useState('');
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/rumput');
      if (res.data.success) {
        setRumputList(res.data.data);
        setTotalStockKg(res.data.totalStockKg || 0);
      }
    } catch (err) {
      console.error('Error fetching rumput data:', err);
      setToast({ type: 'error', message: 'Gagal memuat data stok rumput.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddRumput = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/rumput', {
        grassType,
        incomingQtyKg: incomingQty,
        supplier,
        notes,
      });

      if (res.data.success) {
        setToast({ type: 'success', message: 'Stok rumput baru berhasil dicatat!' });
        setShowModal(false);
        setIncomingQty('');
        setSupplier('');
        setNotes('');
        fetchData();
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Gagal menambah stok rumput.' });
    }
  };

  if (loading) return <LoadingSpinner text="Memuat Modul Produk Rumput..." />;

  return (
    <div className="space-y-8 pb-12">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#1E3F20] flex items-center gap-3">
            <Sprout className="w-8 h-8 text-[#1E3F20]" />
            Modul 2: Produk Rumput (Pakan Hijauan)
          </h1>
          <p className="text-slate-600 text-xs mt-1">Pencatatan Stok Rumput Gajah, Odot, King Grass, Jumlah Masuk, Tanggal, & Sisa Stok</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-[#1E3F20] hover:bg-[#2b592e] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Stok Rumput</span>
        </button>
      </div>

      {/* Total Stock Summary Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-2 shadow-sm border-l-4 border-l-emerald-600">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Sisa Stok Hijauan Rumput Terkini</span>
        <h3 className="text-3xl md:text-4xl font-black font-mono text-[#1E3F20]">
          {totalStockKg.toLocaleString('id-ID')} <span className="text-sm font-normal text-slate-500">kg</span>
        </h3>
        <p className="text-xs text-slate-500">Tercatat dari riwayat penerimaan rumput segar</p>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
        <h3 className="text-base font-black text-slate-900">Riwayat Masuk & Stok Rumput</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-[#F5F5F0] text-slate-700 uppercase text-[11px] tracking-wider border-b border-slate-200 font-bold">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Jenis Rumput</th>
                <th className="px-4 py-3">Jumlah Masuk (kg)</th>
                <th className="px-4 py-3">Sisa Stok (kg)</th>
                <th className="px-4 py-3">Asal / Supplier / Lahan</th>
                <th className="px-4 py-3">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rumputList.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3.5 font-mono text-xs font-semibold text-slate-700">
                    {new Date(r.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-900">{r.grassType}</td>
                  <td className="px-4 py-3.5 font-mono font-bold text-emerald-800">+{r.incomingQtyKg} kg</td>
                  <td className="px-4 py-3.5 font-mono font-black text-[#1E3F20]">{r.remainingStockKg} kg</td>
                  <td className="px-4 py-3.5 text-xs text-slate-700">{r.supplier || '-'}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-500 italic">{r.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900">Input Stok Rumput Baru</h3>
            <form onSubmit={handleAddRumput} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Jenis Rumput Hijauan</label>
                <select
                  value={grassType}
                  onChange={(e) => setGrassType(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                >
                  <option value="Rumput Gajah (Pennisetum purpureum)">Rumput Gajah (Pennisetum purpureum)</option>
                  <option value="Rumput Odot Segar">Rumput Odot Segar</option>
                  <option value="Rumput King Grass">Rumput King Grass</option>
                  <option value="Rumput Lapangan Segar">Rumput Lapangan Segar</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Jumlah Masuk (kg)</label>
                <input
                  type="number"
                  required
                  step="0.5"
                  value={incomingQty}
                  onChange={(e) => setIncomingQty(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-sm"
                  placeholder="e.g. 250"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Asal Supplier / Lahan Lahan Bank Pakan</label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2.5"
                  placeholder="e.g. Lahan Bank Pakan Desa Sukamaju"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Catatan Tambahan</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2.5"
                  placeholder="Potongan segar pagi hari"
                  rows="2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1E3F20] text-white font-bold rounded-xl shadow-md"
                >
                  Simpan Stok Rumput
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
