'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import {
  Truck,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Package,
  Info
} from 'lucide-react';

export default function RequestSusuPengemasanPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formVolume, setFormVolume] = useState('');
  const [formProcessingNeeds, setFormProcessingNeeds] = useState('Susu Pasteurisasi');
  const [formPriority, setFormPriority] = useState('Normal');
  const [formNotes, setFormNotes] = useState('');

  // Confirm Receipt State
  const [confirmingReq, setConfirmingReq] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let url = '/susu/request?';
      if (filterStatus) url += `status=${filterStatus}&`;
      const res = await api.get(url);
      if (res.data?.success) {
        setRequests(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching milk requests:', err);
      setToast({ type: 'error', message: 'Gagal memuat daftar request susu.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!formVolume || parseFloat(formVolume) <= 0) {
      setToast({ type: 'error', message: 'Masukkan jumlah susu (Liter) yang valid.' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/susu/request', {
        date: formDate,
        volumeLiters: parseFloat(formVolume),
        processingNeeds: formProcessingNeeds,
        priority: formPriority,
        notes: formNotes,
      });

      if (res.data?.success) {
        setToast({ type: 'success', message: res.data.message || 'Request susu berhasil diajukan!' });
        setShowModal(false);
        setFormVolume('');
        setFormNotes('');
        fetchRequests();
      }
    } catch (err) {
      console.error('Create request error:', err);
      const msg = err.response?.data?.message || 'Gagal membuat request susu.';
      setToast({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmReceipt = async (req) => {
    setSubmitting(true);
    try {
      const res = await api.put(`/susu/request/${req.id}`, {
        action: 'CONFIRM_RECEIPT',
        receivedVolumeLiters: req.volumeLiters
      });

      if (res.data?.success) {
        setToast({ type: 'success', message: res.data.message || 'Penerimaan susu bahan baku berhasil dikonfirmasi!' });
        setConfirmingReq(null);
        fetchRequests();
      }
    } catch (err) {
      console.error('Confirm receipt error:', err);
      const msg = err.response?.data?.message || 'Gagal mengonfirmasi penerimaan susu.';
      setToast({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'MENUNGGU_PERSETUJUAN':
        return <span className="text-slate-900 font-semibold">Menunggu Persetujuan</span>;
      case 'DISETUJUI':
        return <span className="text-blue-600 font-semibold">Disetujui (Menunggu Diproses)</span>;
      case 'DIPROSES':
        return <span className="text-purple-600 font-semibold">Sedang Disiapkan / Diproses</span>;
      case 'SIAP_DITERIMA':
        return <span className="text-teal-600 font-semibold animate-pulse">Siap Diterima</span>;
      case 'DITERIMA':
        return <span className="text-emerald-600 font-semibold">Diterima</span>;
      case 'DITOLAK':
        return <span className="text-red-600 font-semibold">Ditolak</span>;
      default:
        return <span className="text-slate-600 font-semibold">{status}</span>;
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      (r.requestNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.processingNeeds || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.notes || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const readyToReceiveCount = requests.filter((r) => r.status === 'SIAP_DITERIMA').length;

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
              <Truck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Request Susu Bahan Baku</h1>
          </div>
          <p className="text-slate-500 text-sm pl-10">
            Ajukan kebutuhan susu mentah kepada Admin Pemasaran untuk diolah menjadi produk olahan.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl transition shadow-sm hover:shadow"
        >
          <Plus className="w-5 h-5" />
          <span>Buat Request Susu</span>
        </button>
      </div>

      {/* Ready To Receive Alert Banner */}
      {readyToReceiveCount > 0 && (
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-teal-500 text-white rounded-xl mt-0.5">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-teal-900 text-base">
                Terdapat {readyToReceiveCount} Request Susu Siap Diterima!
              </h3>
              <p className="text-teal-700 text-sm mt-0.5">
                Admin Pemasaran telah menyiapkan susu mentah. Silakan periksa daftar di bawah dan lakukan konfirmasi penerimaan.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari No. Request / Kebutuhan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full md:w-56 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition text-slate-700 font-medium"
          >
            <option value="">Semua Status</option>
            <option value="MENUNGGU_PERSETUJUAN">Menunggu Persetujuan</option>
            <option value="DISETUJUI">Disetujui</option>
            <option value="DIPROSES">Diproses / Disiapkan</option>
            <option value="SIAP_DITERIMA">Siap Diterima</option>
            <option value="DITERIMA">Diterima</option>
            <option value="DITOLAK">Ditolak</option>
          </select>
        </div>
      </div>

      {/* Request Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16">
            <LoadingSpinner text="Memuat request susu..." />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Truck className="w-8 h-8" />
            </div>
            <h3 className="text-slate-800 font-bold text-lg">Belum Ada Request Susu</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mt-1">
              Klik tombol "+ Buat Request Susu" di atas untuk mengajukan kebutuhan susu mentah ke Admin Pemasaran.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200/80">
                  <th className="py-3.5 px-4">No. Request</th>
                  <th className="py-3.5 px-4">Tanggal</th>
                  <th className="py-3.5 px-4">Pemohon</th>
                  <th className="py-3.5 px-4">Jumlah Susu</th>
                  <th className="py-3.5 px-4">Kebutuhan Pengolahan</th>
                  <th className="py-3.5 px-4">Prioritas</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                      {req.requestNo}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {req.date ? new Date(req.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {req.createdBy?.name || 'Admin Pengemasan'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {req.volumeLiters} Liter
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {req.processingNeeds}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={req.priority === 'Mendesak' ? 'font-bold text-red-600' : 'text-slate-600 font-medium'}>
                        {req.priority || 'Normal'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {req.status === 'SIAP_DITERIMA' ? (
                        <button
                          onClick={() => setConfirmingReq(req)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl shadow-sm transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Konfirmasi Penerimaan</span>
                        </button>
                      ) : req.status === 'DITOLAK' ? (
                        <div className="text-xs text-red-600 font-medium max-w-xs text-right truncate" title={req.rejectionReason}>
                          Alasan: {req.rejectionReason || 'Ditolak'}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          {req.status === 'DITERIMA' ? `Diterima (${req.receivedVolumeLiters || req.volumeLiters} L)` : 'Menunggu Pemasaran'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Buat Request Susu */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-2xl">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Form Request Susu</h2>
                  <p className="text-xs text-slate-500">Isi data permintaan susu mentah ke Admin Pemasaran</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl font-bold transition"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Request</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jumlah Susu (Liter) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    placeholder="Contoh: 100"
                    value={formVolume}
                    onChange={(e) => setFormVolume(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kebutuhan Pengolahan *</label>
                  <select
                    value={formProcessingNeeds}
                    onChange={(e) => setFormProcessingNeeds(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
                  >
                    <option value="Susu Pasteurisasi">Susu Pasteurisasi</option>
                    <option value="Yogurt">Yogurt</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Prioritas *</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Mendesak">Mendesak</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan / Keterangan</label>
                <textarea
                  rows="3"
                  placeholder="Tambahkan catatan khusus untuk Admin Pemasaran..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-slate-600 hover:text-slate-800 text-sm font-medium transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl transition shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Mengirim...' : 'Kirim Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Penerimaan */}
      {confirmingReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-2xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Konfirmasi Penerimaan Susu</h2>
                <p className="text-xs text-slate-500">Konfirmasi bahwa susu mentah sudah diserahterimakan</p>
              </div>
            </div>

            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">No. Request:</span>
                <span className="font-mono font-bold text-slate-800">{confirmingReq.requestNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jumlah Susu:</span>
                <span className="font-bold text-emerald-700">{confirmingReq.volumeLiters} Liter</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kebutuhan:</span>
                <span className="font-medium text-slate-800">{confirmingReq.processingNeeds}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Dengan mengonfirmasi penerimaan ini, susu mentah sejumlah <strong>{confirmingReq.volumeLiters} Liter</strong> tercatat sebagai susu siap olah pada akun Admin Pengemasan.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmingReq(null)}
                className="px-5 py-2.5 text-slate-600 hover:text-slate-800 text-sm font-medium transition"
              >
                Batal
              </button>
              <button
                onClick={() => handleConfirmReceipt(confirmingReq)}
                disabled={submitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition shadow-sm disabled:opacity-50"
              >
                {submitting ? 'Memproses...' : 'Ya, Konfirmasi Diterima'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
