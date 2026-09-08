'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import {
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  Send,
  UserCheck
} from 'lucide-react';

export default function RequestSusuMasukPemasaranPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Selected Request Modal & Action State
  const [selectedReq, setSelectedReq] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

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
      console.error('Error fetching incoming milk requests:', err);
      setToast({ type: 'error', message: 'Gagal memuat daftar request susu masuk.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  const handleApprove = async (req) => {
    setSubmitting(true);
    try {
      const res = await api.put(`/susu/request/${req.id}`, {
        action: 'APPROVE'
      });

      if (res.data?.success) {
        setToast({ type: 'success', message: res.data.message || 'Request susu berhasil disetujui!' });
        setSelectedReq(null);
        fetchRequests();
      }
    } catch (err) {
      console.error('Approve error:', err);
      const msg = err.response?.data?.message || 'Gagal menyetujui request susu.';
      setToast({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setToast({ type: 'error', message: 'Wajib mengisikan alasan penolakan.' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.put(`/susu/request/${selectedReq.id}`, {
        action: 'REJECT',
        rejectionReason: rejectionReason.trim()
      });

      if (res.data?.success) {
        setToast({ type: 'success', message: res.data.message || 'Request susu telah ditolak.' });
        setShowRejectModal(false);
        setSelectedReq(null);
        setRejectionReason('');
        fetchRequests();
      }
    } catch (err) {
      console.error('Reject error:', err);
      const msg = err.response?.data?.message || 'Gagal menolak request susu.';
      setToast({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDispatch = async (req) => {
    setSubmitting(true);
    try {
      const res = await api.put(`/susu/request/${req.id}`, {
        action: 'DISPATCH'
      });

      if (res.data?.success) {
        setToast({ type: 'success', message: res.data.message || 'Susu berhasil disiapkan & diserahkan ke Admin Pengemasan.' });
        setSelectedReq(null);
        fetchRequests();
      }
    } catch (err) {
      console.error('Dispatch error:', err);
      const msg = err.response?.data?.message || 'Gagal menyerahkan susu.';
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
        return <span className="text-blue-600 font-semibold">Disetujui (Perlu Diserahkan)</span>;
      case 'DIPROSES':
      case 'SIAP_DITERIMA':
        return <span className="text-teal-600 font-semibold">Siap Diterima Pengemasan</span>;
      case 'DITERIMA':
        return <span className="text-emerald-600 font-semibold">Diterima Pengemasan</span>;
      case 'DITOLAK':
        return <span className="text-red-600 font-semibold">Ditolak</span>;
      default:
        return <span className="text-slate-600 font-semibold">{status}</span>;
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      (r.requestNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.createdBy?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.processingNeeds || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const pendingApprovalCount = requests.filter((r) => r.status === 'MENUNGGU_PERSETUJUAN').length;

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/10 text-blue-600 rounded-xl">
              <Truck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Request Susu Masuk</h1>
          </div>
          <p className="text-slate-500 text-sm pl-10">
            Daftar pengajuan kebutuhan susu bahan baku dari Admin Pengemasan.
          </p>
        </div>
        {pendingApprovalCount > 0 && (
          <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>{pendingApprovalCount} request menunggu persetujuan Anda</span>
          </div>
        )}
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 justify-end items-center">
        <div className="relative w-full sm:w-72 md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari No. Request / Pemohon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full md:w-56 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-700 font-medium cursor-pointer shrink-0"
        >
          <option value="">Semua Status</option>
          <option value="MENUNGGU_PERSETUJUAN">Menunggu Persetujuan</option>
          <option value="DISETUJUI">Disetujui</option>
          <option value="SIAP_DITERIMA">Siap Diterima</option>
          <option value="DITERIMA">Diterima</option>
          <option value="DITOLAK">Ditolak</option>
        </select>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16">
            <LoadingSpinner text="Memuat request susu masuk..." />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Truck className="w-8 h-8" />
            </div>
            <h3 className="text-slate-800 font-bold text-lg">Tidak Ada Request Susu Masuk</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mt-1">
              Belum ada permohonan susu mentah yang diajukan oleh Admin Pengemasan.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="sticky top-0 z-10 bg-[#1E3F20] text-white font-bold uppercase tracking-wider">
                <tr>
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
                      <button
                        onClick={() => setSelectedReq(req)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detail & Aksi</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detail & Action */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-2xl">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Detail Request Susu</h2>
                  <p className="text-mono font-semibold text-blue-600 text-sm">{selectedReq.requestNo}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReq(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl font-bold transition"
              >
                &times;
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Pemohon:</span>
                <span className="font-semibold text-slate-800">{selectedReq.createdBy?.name || 'Admin Pengemasan'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tanggal:</span>
                <span className="font-medium text-slate-700">
                  {selectedReq.date ? new Date(selectedReq.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jumlah Susu:</span>
                <span className="font-bold text-blue-700 text-base">{selectedReq.volumeLiters} Liter</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kebutuhan Pengolahan:</span>
                <span className="font-semibold text-slate-800">{selectedReq.processingNeeds}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Prioritas:</span>
                <span className={`font-semibold ${selectedReq.priority === 'Mendesak' ? 'text-red-600' : 'text-slate-700'}`}>
                  {selectedReq.priority || 'Normal'}
                </span>
              </div>
              {selectedReq.notes && (
                <div className="pt-2 border-t border-slate-200/80">
                  <span className="text-slate-500 text-xs block mb-1">Catatan Pemohon:</span>
                  <p className="text-slate-700 italic bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                    "{selectedReq.notes}"
                  </p>
                </div>
              )}
              {selectedReq.rejectionReason && (
                <div className="pt-2 border-t border-slate-200/80">
                  <span className="text-red-500 text-xs block mb-1 font-semibold">Alasan Penolakan:</span>
                  <p className="text-red-700 bg-red-50 p-2.5 rounded-xl border border-red-200 text-xs">
                    "{selectedReq.rejectionReason}"
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-2">
              {selectedReq.status === 'MENUNGGU_PERSETUJUAN' && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={submitting}
                    className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-sm rounded-xl border border-red-200 transition flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Tolak Request</span>
                  </button>
                  <button
                    onClick={() => handleApprove(selectedReq)}
                    disabled={submitting}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Setujui Request</span>
                  </button>
                </div>
              )}

              {selectedReq.status === 'DISETUJUI' && (
                <button
                  onClick={() => handleDispatch(selectedReq)}
                  disabled={submitting}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition shadow-sm flex items-center justify-center gap-2"
                >
                  <Truck className="w-5 h-5" />
                  <span>Siapkan & Serahkan Susu ({selectedReq.volumeLiters} L)</span>
                </button>
              )}

              <button
                onClick={() => setSelectedReq(null)}
                className="w-full py-2.5 text-slate-500 hover:text-slate-700 text-sm font-medium transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tolak Request */}
      {showRejectModal && selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2.5 bg-red-500/10 text-red-600 rounded-2xl">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Tolak Request Susu</h2>
                <p className="text-xs text-slate-500">Memberikan alasan penolakan ke Admin Pengemasan</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Alasan Penolakan *</label>
              <textarea
                rows="3"
                placeholder="Tuliskan alasan penolakan secara jelas..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-5 py-2.5 text-slate-600 hover:text-slate-800 text-sm font-medium transition"
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                disabled={submitting}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition shadow-sm disabled:opacity-50"
              >
                {submitting ? 'Memproses...' : 'Tolak Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
