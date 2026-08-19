'use client';

import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import EmptyState from '@/components/EmptyState';
import ConfirmModal from '@/components/ConfirmModal';
import { Receipt, CheckCircle, Clock, DollarSign, Filter, Plus, FileText, X } from 'lucide-react';

export default function PiutangPemasaranPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const [statusFilter, setStatusFilter] = useState('belum_lunas'); // 'all' | 'belum_lunas' | 'lunas'
  const [piutangList, setPiutangList] = useState([]);
  const [selectedPiutang, setSelectedPiutang] = useState(null);

  const [pelunasanForm, setPelunasanForm] = useState({
    jumlah: '',
    tanggal: new Date().toISOString().slice(0, 10),
    catatan: '',
  });

  const fetchPiutang = async () => {
    setLoading(true);
    try {
      let url = '/piutang';
      if (statusFilter !== 'all') {
        url += `?status=${statusFilter}`;
      }
      const res = await api.get(url);
      if (res.data.success) {
        setPiutangList(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching piutang:', err);
      setToast({ type: 'error', message: 'Gagal memuat daftar piutang.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPiutang();
  }, [statusFilter]);

  const handleOpenPelunasan = (item) => {
    setSelectedPiutang(item);
    setPelunasanForm({
      jumlah: item.sisaPiutang,
      tanggal: new Date().toISOString().slice(0, 10),
      catatan: '',
    });
  };

  const handleClosePelunasan = () => {
    setSelectedPiutang(null);
  };

  const handlePelunasanSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPiutang) return;

    const numJumlah = parseFloat(pelunasanForm.jumlah);
    if (isNaN(numJumlah) || numJumlah <= 0) {
      setToast({ type: 'error', message: 'Jumlah pelunasan harus bernilai valid (> 0).' });
      return;
    }

    if (numJumlah > selectedPiutang.sisaPiutang + 0.01) {
      setToast({
        type: 'error',
        message: `Jumlah pembayaran melebihi sisa piutang (Rp ${selectedPiutang.sisaPiutang.toLocaleString('id-ID')}).`
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post(`/piutang/${selectedPiutang.id}/pelunasan`, {
        jumlah: numJumlah,
        tanggal: pelunasanForm.tanggal,
        catatan: pelunasanForm.catatan,
      });

      if (res.data.success) {
        setToast({ type: 'success', message: 'Berhasil mencatat pelunasan piutang!' });
        handleClosePelunasan();
        fetchPiutang();
      }
    } catch (err) {
      console.error('Error submitting pelunasan:', err);
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Gagal menyimpan data pelunasan.'
      });
    } finally {
      setSubmitting(false);
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800">Kelola Piutang Penjualan</h1>
            <p className="text-xs text-slate-500">Monitoring piutang pelanggan, sisa tagihan, dan pencatatan cicilan pelunasan</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl self-start sm:self-auto">
          <button
            onClick={() => setStatusFilter('belum_lunas')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              statusFilter === 'belum_lunas'
                ? 'bg-white text-amber-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Belum Lunas
          </button>
          <button
            onClick={() => setStatusFilter('lunas')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              statusFilter === 'lunas'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lunas
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Memuat Data Piutang..." />
      ) : piutangList.length === 0 ? (
        <EmptyState
          title="Tidak Ada Data Piutang"
          description={`Tidak ada piutang dengan status '${statusFilter}'.`}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-y border-slate-200">
                <tr>
                  <th className="px-4 py-3">Tanggal Sale</th>
                  <th className="px-4 py-3">Pembeli</th>
                  <th className="px-4 py-3">Sumber / Detail</th>
                  <th className="px-4 py-3">Jumlah Awal</th>
                  <th className="px-4 py-3">Sisa Piutang</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {piutangList.map((item) => {
                  const sale = item.milkSale || {};
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(sale.tanggal || item.createdAt).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800">{sale.pembeli || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sale.sumber === 'FRESH' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {sale.sumber || 'FRESH'} ({sale.jumlah || sale.quantity} {sale.sumber === 'FRESH' ? 'L' : 'Unit'})
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-700">
                        Rp {(item.jumlahAwal || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 font-black text-rose-600">
                        Rp {(item.sisaPiutang || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3">
                        {item.lunas ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            <span>LUNAS</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" />
                            <span>BELUM LUNAS</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!item.lunas && item.sisaPiutang > 0 && (
                          <button
                            onClick={() => handleOpenPelunasan(item)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all shadow-sm"
                          >
                            Catat Pelunasan
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Catat Pelunasan */}
      {selectedPiutang && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-base">Catat Pelunasan Piutang</h3>
              <button
                onClick={handleClosePelunasan}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-xs space-y-1">
              <div className="flex justify-between font-medium text-slate-600">
                <span>Pembeli:</span>
                <span className="font-bold text-slate-800">{selectedPiutang.milkSale?.pembeli}</span>
              </div>
              <div className="flex justify-between font-medium text-slate-600">
                <span>Sisa Piutang Saat Ini:</span>
                <span className="font-extrabold text-rose-600">
                  Rp {(selectedPiutang.sisaPiutang || 0).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <form onSubmit={handlePelunasanSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tanggal Pembayaran</label>
                <input
                  type="date"
                  value={pelunasanForm.tanggal}
                  onChange={(e) => setPelunasanForm({ ...pelunasanForm, tanggal: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jumlah Dibayarkan (Rp)</label>
                <input
                  type="number"
                  placeholder={`Maksimal ${selectedPiutang.sisaPiutang}`}
                  value={pelunasanForm.jumlah}
                  onChange={(e) => setPelunasanForm({ ...pelunasanForm, jumlah: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan / No. Bukti (Opsional)</label>
                <textarea
                  rows="2"
                  placeholder="Keterangan pembayaran..."
                  value={pelunasanForm.catatan}
                  onChange={(e) => setPelunasanForm({ ...pelunasanForm, catatan: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClosePelunasan}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Pembayaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
