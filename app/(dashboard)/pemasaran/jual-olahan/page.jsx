'use client';

import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import EmptyState from '@/components/EmptyState';
import { Package, Plus, ShoppingCart, Calendar, DollarSign, User, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

export default function JualOlahanPemasaranPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const [productsList, setProductsList] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);

  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().slice(0, 10),
    produkRefId: '',
    jumlah: '',
    pembeli: '',
    hargaJual: '',
    kategoriBayar: 'PNBP',
    catatan: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pkgRes, salesRes] = await Promise.all([
        api.get('/packaged-products'),
        api.get('/milk-sales?sumber=OLAHAN'),
      ]);

      const packagings = pkgRes.data.data || [];
      const sales = salesRes.data.data || [];

      // Map stock remaining per product (only for confirmed DITERIMA products)
      const confirmedPackagings = packagings.filter((pkg) => pkg.status === 'DITERIMA');

      const availableProducts = confirmedPackagings.map((pkg) => {
        const soldQty = sales
          .filter((s) => s.produkRefId === pkg.id)
          .reduce((acc, s) => acc + (s.jumlah || s.quantity || 0), 0);
        const remainingStock = Math.max(0, (pkg.jumlah || 0) - soldQty);

        return {
          ...pkg,
          remainingStock,
        };
      });

      setProductsList(availableProducts);
      setSalesHistory(sales);
    } catch (err) {
      console.error('Error loading olahan sales page:', err);
      setToast({ type: 'error', message: 'Gagal memuat data stok & riwayat penjualan susu olahan.' });
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

  const selectedProduct = productsList.find((p) => p.id === formData.produkRefId);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.produkRefId) {
      setToast({ type: 'error', message: 'Pilih produk olahan terlebih dahulu.' });
      return;
    }

    const numJumlah = parseFloat(formData.jumlah);
    const numHargaJual = parseFloat(formData.hargaJual);

    if (!formData.pembeli.trim()) {
      setToast({ type: 'error', message: 'Nama pembeli wajib diisi.' });
      return;
    }
    if (isNaN(numJumlah) || numJumlah <= 0) {
      setToast({ type: 'error', message: 'Jumlah unit harus lebih besar dari 0.' });
      return;
    }
    if (selectedProduct && numJumlah > selectedProduct.remainingStock) {
      setToast({
        type: 'error',
        message: `Stok produk olahan tidak mencukupi. Maksimal: ${selectedProduct.remainingStock} Pcs.`
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
        sumber: 'OLAHAN',
        produkRefId: formData.produkRefId,
        jumlah: numJumlah,
        pembeli: formData.pembeli.trim(),
        hargaJual: numHargaJual,
        kategoriBayar: formData.kategoriBayar,
        catatan: formData.catatan,
      });

      if (res.data.success) {
        setToast({ type: 'success', message: 'Berhasil mencatat transaksi penjualan susu olahan!' });
        setFormData({
          tanggal: new Date().toISOString().slice(0, 10),
          produkRefId: '',
          jumlah: '',
          pembeli: '',
          hargaJual: '',
          kategoriBayar: 'PNBP',
          catatan: '',
        });
        fetchData();
      }
    } catch (err) {
      console.error('Error submitting olahan sale:', err);
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Gagal menyimpan transaksi penjualan.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Memuat Halaman Penjualan Susu Olahan..." />;
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

      {/* Stock Summary Cards Per Category */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-pink-50 border border-pink-200 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] uppercase font-extrabold text-pink-700 tracking-wider block">🥤 Susu Olahan Rasa</span>
          <div className="flex justify-between items-end">
            <span className="text-xl font-black text-pink-950">
              {productsList.filter(p => (p.jenisProduk || '').toLowerCase().includes('susu') && !(p.jenisProduk || '').toLowerCase().includes('yogurt') && !(p.jenisProduk || '').toLowerCase().includes('keju')).reduce((acc, p) => acc + p.remainingStock, 0)} Pcs
            </span>
            <span className="text-[11px] font-bold text-pink-800">250ml & 110ml</span>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] uppercase font-extrabold text-purple-700 tracking-wider block">🍦 Yogurt Segar</span>
          <div className="flex justify-between items-end">
            <span className="text-xl font-black text-purple-950">
              {productsList.filter(p => (p.jenisProduk || '').toLowerCase().includes('yogurt')).reduce((acc, p) => acc + p.remainingStock, 0)} Pcs
            </span>
            <span className="text-[11px] font-bold text-purple-800">250ml & 110ml</span>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] uppercase font-extrabold text-amber-700 tracking-wider block">🧀 Keju</span>
          <div className="flex justify-between items-end">
            <span className="text-xl font-black text-amber-950">
              {productsList.filter(p => (p.jenisProduk || '').toLowerCase().includes('keju')).reduce((acc, p) => acc + p.remainingStock, 0)} Pcs
            </span>
            <span className="text-[11px] font-bold text-amber-800">250ml & 110ml</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Input */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Plus className="w-5 h-5 text-purple-700" />
            <h2 className="font-extrabold text-slate-800 text-base">Input Laporan Penjualan Olahan</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Transaksi</label>
              <input
                type="date"
                name="tanggal"
                value={formData.tanggal}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Produk Olahan</label>
              <select
                name="produkRefId"
                value={formData.produkRefId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-semibold"
              >
                <option value="">-- Pilih Varian Produk --</option>
                {productsList.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.remainingStock <= 0}>
                    {p.jenisProduk} - {p.kemasan} (Sisa Stok: {p.remainingStock} Pcs)
                  </option>
                ))}
              </select>
              {selectedProduct && (
                <div className="mt-1 text-[11px] font-semibold text-purple-700 bg-purple-50 p-2 rounded-lg">
                  Stok Tersedia: {selectedProduct.remainingStock} Pcs
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Pembeli / Instansi</label>
              <input
                type="text"
                name="pembeli"
                placeholder="Contoh: Toko Berkah / Ibu Sinta"
                value={formData.pembeli}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Jumlah (Pcs)</label>
              <input
                type="number"
                name="jumlah"
                placeholder="Contoh: 20"
                value={formData.jumlah}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Total Harga Jual (Rp)</label>
              <input
                type="number"
                name="hargaJual"
                placeholder="Contoh: 300000"
                value={formData.hargaJual}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Pembayaran</label>
              <select
                name="kategoriBayar"
                value={formData.kategoriBayar}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-semibold"
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
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#1E3F20] hover:bg-[#2b592e] text-white py-2.5 rounded-xl font-bold text-xs transition-all shadow-md disabled:opacity-50"
            >
              {submitting ? 'Menyimpan Transaksi...' : 'Simpan Transaksi Olahan'}
            </button>
          </form>
        </div>

        {/* Sales History Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="font-extrabold text-slate-800 text-base">Riwayat Penjualan Olahan</h2>
            <p className="text-xs text-slate-500">Daftar transaksi produk susu olahan yang telah dicatat</p>
          </div>

          {salesHistory.length === 0 ? (
            <EmptyState
              title="Belum Ada Penjualan Olahan"
              description="Gunakan form di sebelah kiri untuk mencatat transaksi penjualan produk olahan."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-y border-slate-200">
                  <tr>
                    <th className="px-3 py-2.5">Tanggal</th>
                    <th className="px-3 py-2.5">Pembeli</th>
                    <th className="px-3 py-2.5">Jumlah</th>
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
                      <td className="px-3 py-2.5 font-semibold text-purple-700">{s.jumlah || s.quantity} Unit</td>
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
