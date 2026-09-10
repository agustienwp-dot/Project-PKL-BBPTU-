'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import {
  Milk,
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
  Info,
  Eye,
  Printer
} from 'lucide-react';
import BeritaAcaraDocumentSusuFarm from '@/components/susu-farm/BeritaAcaraDocumentSusuFarm';

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

  // BAST Preview Modal State
  const [selectedBaForPreview, setSelectedBaForPreview] = useState(null);
  const [loadingBa, setLoadingBa] = useState(false);

  const handlePreviewBast = async (req) => {
    setLoadingBa(true);
    try {
      // 1. If req already has its attached BAST from API
      if (req.bast && (req.bast.nomorBA || req.bast.nomorBa)) {
        const bNo = req.bast.nomorBA || req.bast.nomorBa;
        const isAppr = req.status === 'DISETUJUI' || req.status === 'DITERIMA' || req.status === 'SIAP_DITERIMA' || req.status === 'SELESAI';
        setSelectedBaForPreview({
          ...req.bast,
          nomorBa: bNo,
          nomorBA: bNo,
          requestNo: req.requestNo,
          type: 'PERMINTAAN_SUSU',
          totalProduksi: req.volumeLiters,
          diserahterimakan: req.volumeLiters,
          volumeLiters: req.volumeLiters,
          purpose: req.processingNeeds,
          processingNeeds: req.processingNeeds,
          priority: req.priority || 'Normal',
          penerimaName: req.createdBy?.name || user?.name || 'Admin Pengemasan',
          penerimaRole: 'Unit Pengolahan Susu (UHT)',
          penyerahName: req.approvedByName || req.bast.penyerahName || 'Tim Kerja Layanan Pemasaran',
          penyerahRole: 'Seksi Pemasaran',
          farmLocation: 'Gudang Pemasaran / Cold Storage',
          animalType: (req.processingNeeds || '').toLowerCase().includes('kambing') ? 'KAMBING' : 'SAPI',
          status: isAppr ? 'DITERIMA' : 'MENUNGGU_KONFIRMASI',
          confirmedByName: req.approvedByName || req.bast.confirmedByName || null,
          notes: req.bast.notes || req.notes || `[Permintaan Susu ${req.requestNo}] Kebutuhan: ${req.processingNeeds}. Prioritas: ${req.priority || 'Normal'}.`
        });
        return;
      }

      // 2. Query /api/bast (unified BAST endpoint)
      let baDoc = null;
      try {
        const res = await api.get(`/bast?type=PERMINTAAN_SUSU&search=${encodeURIComponent(req.requestNo)}`);
        if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          baDoc = res.data.data.find(d => 
            (d.notes && d.notes.includes(req.requestNo)) || 
            (d.nomorBa && (d.nomorBa.includes(req.requestNo) || d.nomorBa === req.bastNo)) ||
            (d.nomorBA && (d.nomorBA.includes(req.requestNo) || d.nomorBA === req.bastNo))
          );
        }
      } catch (err) {
        console.warn('Could not fetch from /api/bast:', err);
      }

      const dObj = new Date(req.date || req.createdAt || Date.now());
      const yyyy = dObj.getFullYear();
      const mm = String(dObj.getMonth() + 1).padStart(2, '0');
      const dd = String(dObj.getDate()).padStart(2, '0');
      const dateCode = `${yyyy}${mm}${dd}`;
      const bastNumber = baDoc?.nomorBA || baDoc?.nomorBa || req.bastNo || `BAST-REQ-${dateCode}-001`;
      const isAppr = req.status === 'DISETUJUI' || req.status === 'DITERIMA' || req.status === 'SIAP_DITERIMA' || req.status === 'SELESAI';

      setSelectedBaForPreview({
        id: baDoc?.id || req.id,
        nomorBa: bastNumber,
        nomorBA: bastNumber,
        requestNo: req.requestNo,
        type: 'PERMINTAAN_SUSU',
        date: req.date || req.createdAt || new Date(),
        shift: 'Pagi',
        farmLocation: 'Gudang Pemasaran / Cold Storage',
        animalType: (req.processingNeeds || '').toLowerCase().includes('kambing') ? 'KAMBING' : 'SAPI',
        unit: 'Liter',
        totalProduksi: req.volumeLiters,
        diserahterimakan: req.volumeLiters,
        volumeLiters: req.volumeLiters,
        purpose: req.processingNeeds,
        processingNeeds: req.processingNeeds,
        priority: req.priority || 'Normal',
        penerimaName: req.createdBy?.name || user?.name || 'Admin Pengemasan',
        penerimaRole: 'Unit Pengolahan Susu (UHT)',
        penyerahName: req.approvedByName || baDoc?.penyerahName || 'Tim Kerja Layanan Pemasaran',
        penyerahRole: 'Seksi Pemasaran',
        status: isAppr ? 'DITERIMA' : 'MENUNGGU_KONFIRMASI',
        confirmedByName: req.approvedByName || baDoc?.confirmedByName || null,
        notes: baDoc?.notes || req.notes || `[Permintaan Susu ${req.requestNo}] Kebutuhan: ${req.processingNeeds}. Prioritas: ${req.priority || 'Normal'}.`
      });
    } catch (e) {
      console.error('Error fetching BAST for request:', e);
      const dObj = new Date(req.date || req.createdAt || Date.now());
      const yyyy = dObj.getFullYear();
      const mm = String(dObj.getMonth() + 1).padStart(2, '0');
      const dd = String(dObj.getDate()).padStart(2, '0');
      const bastNumber = req.bastNo || `BAST-REQ-${yyyy}${mm}${dd}-001`;
      const isAppr = req.status === 'DISETUJUI' || req.status === 'DITERIMA' || req.status === 'SIAP_DITERIMA' || req.status === 'SELESAI';
      setSelectedBaForPreview({
        nomorBa: bastNumber,
        nomorBA: bastNumber,
        requestNo: req.requestNo,
        type: 'PERMINTAAN_SUSU',
        date: req.date || req.createdAt || new Date(),
        shift: 'Pagi',
        farmLocation: 'Gudang Pemasaran / Cold Storage',
        animalType: (req.processingNeeds || '').toLowerCase().includes('kambing') ? 'KAMBING' : 'SAPI',
        unit: 'Liter',
        totalProduksi: req.volumeLiters,
        diserahterimakan: req.volumeLiters,
        volumeLiters: req.volumeLiters,
        purpose: req.processingNeeds,
        processingNeeds: req.processingNeeds,
        priority: req.priority || 'Normal',
        penerimaName: req.createdBy?.name || user?.name || 'Admin Pengemasan',
        penerimaRole: 'Unit Pengolahan Susu (UHT)',
        penyerahName: req.approvedByName || 'Tim Kerja Layanan Pemasaran',
        penyerahRole: 'Seksi Pemasaran',
        status: isAppr ? 'DITERIMA' : 'MENUNGGU_KONFIRMASI',
        confirmedByName: req.approvedByName || null,
        notes: req.notes || `[Permintaan Susu ${req.requestNo}] Kebutuhan: ${req.processingNeeds}. Prioritas: ${req.priority || 'Normal'}.`
      });
    } finally {
      setLoadingBa(false);
    }
  };

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
    <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-hidden">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 py-1 px-1">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">Request Susu Bahan Baku</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Ajukan kebutuhan susu mentah kepada Admin Pemasaran untuk diolah menjadi produk olahan.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1E3F20] hover:bg-[#16331a] text-white text-xs font-bold rounded-2xl transition shadow-sm cursor-pointer shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Request Susu</span>
        </button>
      </div>

      {/* Ready To Receive Alert Banner */}
      {readyToReceiveCount > 0 && (
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm shrink-0">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-teal-500 text-white rounded-xl mt-0.5">
              <Milk className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-teal-900 text-sm">
                Terdapat {readyToReceiveCount} Request Susu Siap Diterima!
              </h3>
              <p className="text-teal-700 text-xs mt-0.5">
                Admin Pemasaran telah menyiapkan susu mentah. Silakan periksa daftar di bawah dan lakukan konfirmasi penerimaan.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 justify-end items-center shrink-0">
        <div className="relative w-full sm:w-72 md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari No. Request..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full md:w-56 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition text-slate-700 font-bold cursor-pointer shrink-0"
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

      {/* Request Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
        {loading ? (
          <div className="py-16">
            <LoadingSpinner text="Memuat request susu..." />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Milk className="w-8 h-8" />
            </div>
            <h3 className="text-slate-800 font-bold text-base">Belum Ada Request Susu</h3>
            <p className="text-slate-500 text-xs max-w-md mx-auto mt-1">
              Klik tombol "+ Buat Request Susu" di atas untuk mengajukan kebutuhan susu mentah ke Admin Pemasaran.
            </p>
          </div>
        ) : (
          <div className="overflow-auto flex-1 min-h-0">
            <table className="w-full text-left border-collapse text-xs relative">
              <thead className="sticky top-0 z-10 bg-[#1E3F20] text-white font-bold uppercase tracking-wider shadow-2xs">
                <tr>
                  <th className="py-3.5 px-4">No. Request</th>
                  <th className="py-3.5 px-4">Tanggal</th>
                  <th className="py-3.5 px-4">Pemohon</th>
                  <th className="py-3.5 px-4">Jumlah Susu</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                      <div>{req.requestNo}</div>
                      {req.bastNo && (
                        <div className="text-[10px] text-emerald-700 font-mono font-medium">
                          {req.bastNo}
                        </div>
                      )}
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
                    <td className="py-3.5 px-4">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handlePreviewBast(req)}
                          disabled={loadingBa}
                          className="w-8 h-8 rounded-full text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 hover:border-emerald-300 transition-all shadow-2xs flex items-center justify-center cursor-pointer active:scale-95"
                          title="Cetak Dokumen BAST Resmi"
                        >
                          <Printer className="w-4 h-4 text-emerald-700" />
                        </button>
                        {req.status === 'SIAP_DITERIMA' && (
                          <button
                            type="button"
                            onClick={() => setConfirmingReq(req)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl shadow-sm transition"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Konfirmasi Penerimaan</span>
                          </button>
                        )}
                      </div>
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
                  <Milk className="w-6 h-6" />
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

      {/* Modal Preview BAST */}
      {selectedBaForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 md:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setSelectedBaForPreview(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
            >
              ✕
            </button>
            <BeritaAcaraDocumentSusuFarm
              ba={selectedBaForPreview}
              onClose={() => setSelectedBaForPreview(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
