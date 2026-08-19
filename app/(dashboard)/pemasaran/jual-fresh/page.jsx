'use client';

import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import EmptyState from '@/components/EmptyState';
import { Milk, Plus, ShoppingCart, Calendar, DollarSign, User, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

export default function JualFreshPemasaranPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const [availableStock, setAvailableStock] = useState(0);
  const [salesHistory, setSalesHistory] = useState([]);

  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().slice(0, 10),
    jumlah: '',
    pembeli: '',
    hargaJual: '',
    kategoriBayar: 'PNBP',
    catatan: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, salesRes] = await Promise.all([
        api.get('/milk-production'),
        api.get('/milk-sales?sumber=FRESH'),
      ]);

      const productions = prodRes.data.data || [];
      const sales = salesRes.data.data || [];

      // Calculate total stock kirimKePI
      const totalKirim = productions.reduce((acc, p) => acc + (p.kirimKePI || p.rawVolumeLiters || 0), 0);
      const totalSold = sales.reduce((acc, s) => acc + (s.jumlah || s.quantity || 0), 0);
      const available = Math.max(0, totalKirim - totalSold);

      setAvailableStock(available);
      setSalesHistory(sales);
    } catch (err) {
      console.error('Error loading fresh sales page:', err);
      setToast({ type: 'error', message: 'Gagal memuat data stok & riwayat penjualan susu fresh.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const numJumlah = parseFloat(formData.jumlah);
    const numHargaJual = parseFloat(formData.hargaJual);

    if (!formData.pembeli.trim()) {
      setToast({ type: 'error', message: 'Nama pembeli wajib diisi.' });
      return;
    }
    if (isNaN(numJumlah) || numJumlah <= 0) {
      setToast({ type: 'error', message: 'Jumlah liter harus lebih besar dari 0.' });
      return;
    }
    if (numJumlah > availableStock) {
      setToast({
        type: 'error',
        message: `Stok susu fresh tidak mencukupi. Maksimal: ${availableStock.toFixed(1)} Liter.`
      });
      return;
    }
    if (isNaN(numHargaJual) || numHargaJual < 0) {
      setToast({ type: 'error', message: 'Harga jual harus bernilai valid.' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/milk-sales', {
        tanggal: formData.tanggal,
        sumber: 'FRESH',
        jumlah: numJumlah,
        pembeli: formData.pembeli.trim(),
        hargaJual: numHargaJual,
        kategoriBayar: formData.kategoriBayar,
        catatan: formData.catatan,
      });

      if (res.data.success) {
        setToast({ type: 'success', message: 'Berhasil mencatat transaksi penjualan susu fresh!' });
        setFormData({
          tanggal: new Date().toISOString().slice(0, 10),
          jumlah: '',
          pembeli: '',
          hargaJual: '',
          kategoriBayar: 'PNBP',
          catatan: '',
        });
        fetchData();
      }
    } catch (err) {
      console.error('Error submitting fresh sale:', err);
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Gagal menyimpan transaksi penjualan.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Memuat Halaman Penjualan Susu Fresh..." />;
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

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 text-blue-800 rounded-2xl">
            <Milk className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800">Laporan Penjualan Susu Fresh</h1>
            <p className="text-xs text-slate-500">Menerima & mencatat laporan data penjualan harian susu segar dari unit/petugas penjualan</p>
          </div>
        </div>

        {/* Stock Badge */}
        <div className="bg-blue-50 border border-blue-200 px-5 py-3 rounded-2xl flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider block">Stok Fresh Tersedia</span>
            <span className="text-xl font-black text-blue-950">{availableStock.toLocaleString('id-ID')} Liter</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Input */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Plus className="w-5 h-5 text-emerald-700" />
            <h2 className="font-extrabold text-slate-800 text-base">Input Laporan Penjualan Fresh</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Transaksi</label>
              <div className="relative">
                <input
                  type="date"
                  name="tanggal"
                  value={formData.tanggal}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Pembeli / Instansi</label>
              <input
                type="text"
                name="pembeli"
                placeholder="Contoh: Koperasi Mandiri / Bpk. Ahmad"
                value={formData.pembeli}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Jumlah (Liter)</label>
              <input
                type="number"
                step="0.1"
                name="jumlah"
                placeholder="Contoh: 50"
                value={formData.jumlah}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Maksimal tersedia: {availableStock.toLocaleString('id-ID')} Liter
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Total Harga Jual (Rp)</label>
              <input
                type="number"
                name="hargaJual"
                placeholder="Contoh: 750000"
                value={formData.hargaJual}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Pembayaran</label>
              <select
                name="kategoriBayar"
                value={formData.kategoriBayar}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-semibold"
              >
                <option value="PNBP">PNBP (Tunai / Transfer Langsung)</option>
                <option value="PIUTANG">PIUTANG (Dicatat sebagai utang pelanggan)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Catatan (Opsional)</label>
              <textarea
                name="catatan"
                rows="2"
                placeholder="Keterangan tambahan..."
                value={formData.catatan}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#1E3F20] hover:bg-[#2b592e] text-white py-2.5 rounded-xl font-bold text-xs transition-all shadow-md disabled:opacity-50"
            >
              {submitting ? 'Menyimpan Transaksi...' : 'Simpan Transaksi Jual'}
            </button>
          </form>
        </div>

        {/* Sales History Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="font-extrabold text-slate-800 text-base">Riwayat Penjualan Susu Fresh</h2>
            <p className="text-xs text-slate-500">Daftar transaksi susu murni segar yang telah dicatat</p>
          </div>

          {salesHistory.length === 0 ? (
            <EmptyState
              title="Belum Ada Penjualan Fresh"
              description="Gunakan form di sebelah kiri untuk mencatat transaksi penjualan susu murni fresh."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-y border-slate-200">
                  <tr>
                    <th className="px-3 py-2.5">Tanggal</th>
                    <th className="px-3 py-2.5">Pembeli</th>
                    <th className="px-3 py-2.5">Volume</th>
                    <th className="px-3 py-2.5">Harga Total</th>
                    <th className="px-3 py-2.5">Kategori Bayar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {salesHistory.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-2.5 text-slate-600">
                        {new Date(s.tanggal || s.date).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-3 py-2.5 font-bold text-slate-800">{s.pembeli}</td>
                      <td className="px-3 py-2.5 font-semibold text-blue-700">{s.jumlah || s.quantity} Liter</td>
                      <td className="px-3 py-2.5 font-bold text-slate-800">
                        Rp {(s.hargaJual || s.totalPrice || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.kategoriBayar === 'PNBP' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {s.kategoriBayar}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
