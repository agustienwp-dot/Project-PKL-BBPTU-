'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  Milk, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ChevronRight, 
  X, 
  AlertTriangle,
  FileSpreadsheet,
  Check,
  Filter
} from 'lucide-react';
import api from '@/services/api';
import Toast from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';

export default function NotificationBell({ user, onUpdate }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Selected production for detail modal
  const [selectedProd, setSelectedProd] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Full notifications modal view ("Tampilkan Semua")
  const [showAllModal, setShowAllModal] = useState(false);
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL', 'PENDING', 'CONFIRMED', 'REJECTED'

  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      // Fetch all productions to calculate unread notifications
      const res = await api.get('/farm/production');
      if (res.data.success) {
        setProductions(res.data.data || []);
      }
    } catch (e) {
      console.error('Error fetching notifications:', e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadItems = productions.filter(p => p.status === 'MENUNGGU_KONFIRMASI' || p.status === 'PENDING_PENGEMASAN');
  const unreadCount = unreadItems.length;

  const handleOpenDetail = (p) => {
    setSelectedProd(p);
    setDropdownOpen(false);
  };

  const handleAcceptConfirm = async () => {
    if (!selectedProd) return;
    setSubmittingAction(true);
    try {
      const res = await api.put(`/farm/production/${selectedProd.id}`, {
        status: 'SUDAH_DIKONFIRMASI'
      });
      if (res.data.success) {
        setToast({ 
          type: 'success', 
          message: `Data produksi Susu ${selectedProd.animalType === 'KAMBING' ? 'Kambing' : 'Sapi'} (${selectedProd.rawVolumeLiters} Liter) telah dikonfirmasi! Data kini tersedia di menu Pengemasan.` 
        });
        setShowConfirmModal(false);
        setSelectedProd(null);
        fetchNotifications();
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal mengonfirmasi data produksi.';
      setToast({ type: 'error', message: msg });
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProd) return;
    setSubmittingAction(true);
    try {
      const res = await api.put(`/farm/production/${selectedProd.id}`, {
        status: 'DITOLAK_PENGEMASAN',
        notes: rejectReason ? `[DITOLAK PENGEMASAN]: ${rejectReason}` : selectedProd.notes
      });
      if (res.data.success) {
        setToast({ type: 'success', message: 'Data produksi telah ditolak.' });
        setShowRejectModal(false);
        setRejectReason('');
        setSelectedProd(null);
        fetchNotifications();
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menolak data produksi.';
      setToast({ type: 'error', message: msg });
    } finally {
      setSubmittingAction(false);
    }
  };

  // Filtered productions for "Tampilkan Semua"
  const filteredAllList = productions.filter(p => {
    if (filterTab === 'PENDING') return p.status === 'MENUNGGU_KONFIRMASI' || p.status === 'PENDING_PENGEMASAN';
    if (filterTab === 'CONFIRMED') return p.status === 'SUDAH_DIKONFIRMASI' || p.status === 'SELESAI';
    if (filterTab === 'REJECTED') return p.status === 'DITOLAK_PENGEMASAN';
    return true;
  });

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Bell Trigger Button */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="relative p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center justify-center focus:outline-none"
        title="Notifikasi Konfirmasi Produksi"
      >
        <Bell className="w-5 h-5 text-[#1E3F20]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center border-2 border-white shadow-md animate-pulse font-mono">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Card */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-3xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-4 bg-[#1E3F20] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/10 rounded-xl">
                <Bell className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <h3 className="font-extrabold text-xs text-white">Notifikasi Baru Diterima</h3>
                <p className="text-[10px] text-emerald-200 font-medium">Konfirmasi Hasil Produksi Susu</p>
              </div>
            </div>
            {unreadCount > 0 ? (
              <span className="px-2 py-0.5 bg-rose-500/20 text-rose-200 border border-rose-400/30 rounded-full text-[10px] font-black">
                {unreadCount} Baru
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-white/10 text-emerald-200 rounded-full text-[10px] font-bold">
                Semua Dibaca
              </span>
            )}
          </div>

          {/* List Items */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {productions.length > 0 ? (
              productions.slice(0, 6).map((p) => {
                const isPending = p.status === 'MENUNGGU_KONFIRMASI' || p.status === 'PENDING_PENGEMASAN';
                const isConfirmed = p.status === 'SUDAH_DIKONFIRMASI' || p.status === 'SELESAI';
                const isRejected = p.status === 'DITOLAK_PENGEMASAN';
                const animalLabel = p.animalType === 'KAMBING' ? 'Kambing' : 'Sapi';
                const dateStr = new Date(p.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

                return (
                  <div
                    key={p.id}
                    onClick={() => handleOpenDetail(p)}
                    className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3 ${
                      isPending ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-2xl shrink-0 mt-0.5 ${
                      isPending ? 'bg-amber-100 text-amber-800' :
                      isConfirmed ? 'bg-emerald-100 text-emerald-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      <Milk className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-extrabold text-xs text-slate-900 truncate">
                          📦 Konfirmasi Admin Farm
                        </span>
                        {isPending && (
                          <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0"></span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-600 font-medium leading-snug">
                        Data Produksi Susu {animalLabel} ({p.rawVolumeLiters} Liter) telah diserahkan oleh Admin Farm Produksi.
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[9px] text-slate-400 font-semibold">{dateStr}</span>
                        {isPending && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-extrabold flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" /> Menunggu
                          </span>
                        )}
                        {isConfirmed && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-extrabold flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Dikonfirmasi
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[9px] font-extrabold flex items-center gap-1">
                            <XCircle className="w-2.5 h-2.5" /> Ditolak
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 font-medium">
                Belum ada notifikasi konfirmasi produksi.
              </div>
            )}
          </div>

          {/* Footer "Tampilkan Semua" */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
            <button
              onClick={() => {
                setDropdownOpen(false);
                setShowAllModal(true);
              }}
              className="w-full py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
            >
              <span>Tampilkan Semua Notifikasi</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      )}

      {/* MODAL DETAIL KONFIRMASI PRODUKSI */}
      {selectedProd && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Milk className="w-5 h-5 text-[#1E3F20]" />
                <span>Detail Konfirmasi Produksi</span>
              </h3>
              <button onClick={() => setSelectedProd(null)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl space-y-2 border border-slate-200">
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="font-semibold text-slate-500">ID Produksi:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedProd.id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="font-semibold text-slate-500">Tanggal Produksi:</span>
                  <span className="font-bold text-slate-900">
                    {new Date(selectedProd.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="font-semibold text-slate-500">Jenis Susu:</span>
                  <span className="font-extrabold text-slate-900">
                    Susu {selectedProd.animalType === 'KAMBING' ? 'Kambing' : 'Sapi'} ({selectedProd.productType === 'OLAHAN' ? 'Olahan' : 'Segar'})
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="font-semibold text-slate-500">Jumlah Produksi:</span>
                  <span className="font-black text-[#1E3F20] text-sm font-mono">{selectedProd.rawVolumeLiters} Liter</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="font-semibold text-slate-500">Dikirim Oleh:</span>
                  <span className="font-bold text-slate-900">{selectedProd.createdBy?.name || selectedProd.createdBy?.email || 'Admin Farm Produksi'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500">Status:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    selectedProd.status === 'SUDAH_DIKONFIRMASI' || selectedProd.status === 'SELESAI'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : selectedProd.status === 'DITOLAK_PENGEMASAN'
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {selectedProd.status === 'SUDAH_DIKONFIRMASI' || selectedProd.status === 'SELESAI'
                      ? '✓ Sudah Dikonfirmasi Pengemasan'
                      : selectedProd.status === 'DITOLAK_PENGEMASAN'
                      ? '✕ Ditolak Pengemasan'
                      : '🟡 Menunggu Konfirmasi Pengemasan'}
                  </span>
                </div>
              </div>

              {selectedProd.notes && (
                <div className="space-y-1">
                  <span className="font-bold text-slate-700 block">Catatan Pengirim:</span>
                  <p className="p-3 bg-slate-50 rounded-xl text-slate-700 font-medium border border-slate-200 italic">
                    "{selectedProd.notes}"
                  </p>
                </div>
              )}

              {/* Action Buttons if Pending */}
              {(selectedProd.status === 'MENUNGGU_KONFIRMASI' || selectedProd.status === 'PENDING_PENGEMASAN') ? (
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl text-xs font-bold transition-colors"
                  >
                    Tolak
                  </button>
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    className="px-4 py-2 bg-[#1E3F20] hover:bg-[#16331a] text-white rounded-xl text-xs font-bold shadow transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Terima Konfirmasi</span>
                  </button>
                </div>
              ) : (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setSelectedProd(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200"
                  >
                    Tutup
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION PROMPT DIALOG */}
      {showConfirmModal && (
        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleAcceptConfirm}
          title="Konfirmasi Penerimaan Data Produksi"
          message={`Apakah Anda yakin ingin menerima data produksi Susu ${selectedProd?.animalType === 'KAMBING' ? 'Kambing' : 'Sapi'} (${selectedProd?.rawVolumeLiters} Liter) ini?`}
          confirmText="Terima Konfirmasi"
          cancelText="Batal"
          type="success"
        />
      )}

      {/* REJECT MODAL PROMPT */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
            <h3 className="font-black text-rose-900 text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>Tolak Data Produksi</span>
            </h3>
            <form onSubmit={handleRejectSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alasan Penolakan <span className="text-rose-500">*</span></label>
                <textarea
                  rows="3"
                  placeholder="Misal: Data produksi tidak sesuai, jumlah tidak pas..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-rose-500 outline-none"
                  required
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-3.5 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow"
                >
                  Kirim Penolakan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL NOTIFICATIONS VIEW MODAL ("Tampilkan Semua") */}
      {showAllModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#1E3F20]" />
                <span>Semua Notifikasi Konfirmasi Produksi</span>
              </h3>
              <button onClick={() => setShowAllModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <button
                onClick={() => setFilterTab('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterTab === 'ALL' ? 'bg-[#1E3F20] text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua ({productions.length})
              </button>
              <button
                onClick={() => setFilterTab('PENDING')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterTab === 'PENDING' ? 'bg-amber-500 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Menunggu Konfirmasi ({unreadCount})
              </button>
              <button
                onClick={() => setFilterTab('CONFIRMED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterTab === 'CONFIRMED' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Sudah Dikonfirmasi
              </button>
              <button
                onClick={() => setFilterTab('REJECTED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterTab === 'REJECTED' ? 'bg-rose-600 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Ditolak
              </button>
            </div>

            {/* Table / List View */}
            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredAllList.length > 0 ? (
                filteredAllList.map((p) => {
                  const isPending = p.status === 'MENUNGGU_KONFIRMASI' || p.status === 'PENDING_PENGEMASAN';
                  const isConfirmed = p.status === 'SUDAH_DIKONFIRMASI' || p.status === 'SELESAI';
                  const isRejected = p.status === 'DITOLAK_PENGEMASAN';
                  const animalLabel = p.animalType === 'KAMBING' ? 'Kambing' : 'Sapi';
                  const dateStr = new Date(p.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        setShowAllModal(false);
                        setSelectedProd(p);
                      }}
                      className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 cursor-pointer transition-all flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl shrink-0 ${
                          isPending ? 'bg-amber-100 text-amber-800' :
                          isConfirmed ? 'bg-emerald-100 text-emerald-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          <Milk className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-slate-900">Susu {animalLabel} ({p.rawVolumeLiters} Liter)</span>
                            <span className="text-[10px] font-semibold text-slate-400">• {dateStr}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Dikirim oleh: {p.createdBy?.name || 'Admin Farm Produksi'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          isPending ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          isConfirmed ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {isPending ? '🟡 Menunggu Konfirmasi' : isConfirmed ? '✓ Sudah Dikonfirmasi' : '✕ Ditolak'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 font-medium">
                  Tidak ada notifikasi pada kategori ini.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowAllModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
