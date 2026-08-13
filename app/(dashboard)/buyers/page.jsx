'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import Toast from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';
import { useAuth } from '@/context/AuthContext';
import { Users, Plus, Search, Eye, Edit3, Trash2, Phone, MapPin, ShoppingBag } from 'lucide-react';

export default function BuyersPage() {
  const { user } = useAuth();

  const [buyers, setBuyers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Modal Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState(null);

  const fetchBuyers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/buyers', { params: { search } });
      if (res.data.success) {
        setBuyers(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching buyers:', err);
      setToast({ message: 'Gagal memuat data pembeli', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyers();
  }, [search]);

  const openCreateModal = () => {
    setEditingBuyer(null);
    setFormData({ name: '', phone: '', address: '', notes: '' });
    setModalOpen(true);
  };

  const openEditModal = (buyer) => {
    setEditingBuyer(buyer);
    setFormData({
      name: buyer.name,
      phone: buyer.phone,
      address: buyer.address,
      notes: buyer.notes || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let res;
      if (editingBuyer) {
        res = await api.put(`/buyers/${editingBuyer.id}`, formData);
      } else {
        res = await api.post('/buyers', formData);
      }

      if (res.data.success) {
        setToast({ message: editingBuyer ? 'Data pembeli diperbarui' : 'Pembeli baru berhasil ditambahkan', type: 'success' });
        setModalOpen(false);
        fetchBuyers();
      }
    } catch (err) {
      console.error('Submit buyer error:', err);
      const msg = err.response?.data?.message || 'Gagal menyimpan data pembeli';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await api.delete(`/buyers/${deleteId}`);
      if (res.data.success) {
        setToast({ message: 'Data pembeli berhasil dihapus', type: 'success' });
        fetchBuyers();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menghapus data pembeli';
      setToast({ message: msg, type: 'error' });
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
      <ConfirmModal
        isOpen={!!deleteId}
        title="Hapus Data Pembeli"
        message="Apakah Anda yakin ingin menghapus pelanggan ini? Hapus hanya berhasil jika pelanggan belum memiliki transaksi."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#1E3F20] flex items-center gap-3">
            <Users className="w-7 h-7 text-[#1E3F20]" />
            Manajemen Pelanggan Pembeli
          </h1>
          <p className="text-slate-600 text-sm mt-1">Kelola data pembeli hewan ternak & riwayat transaksi pembelian mereka</p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E3F20] hover:bg-[#2b592e] text-white font-bold rounded-xl text-sm shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pembeli Baru</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, telepon, atau alamat pembeli..."
            className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1E3F20]"
          />
        </div>
      </div>

      {/* Grid of Buyers */}
      {loading ? (
        <LoadingSpinner text="Memuat daftar pembeli..." />
      ) : buyers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buyers.map((buyer) => (
            <div key={buyer.id} className="bg-white border border-slate-200 hover:border-[#1E3F20] p-6 rounded-2xl space-y-4 shadow-sm transition-all flex flex-col justify-between">
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">{buyer.name}</h3>
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-[#1E3F20]/10 text-[#1E3F20] font-bold border border-[#1E3F20]/20">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    {buyer._count?.sales || 0} Transaksi
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#1E3F20]" />
                    <span className="font-mono text-slate-900 font-bold">{buyer.phone}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-slate-700 line-clamp-2">{buyer.address}</span>
                  </div>
                </div>

                {buyer.notes && (
                  <p className="text-xs text-slate-600 italic bg-[#F5F5F0] p-2 rounded-lg border border-slate-200">
                    "{buyer.notes}"
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                <Link
                  href={`/buyers/${buyer.id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#F5F5F0] hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Riwayat Transaksi</span>
                </Link>

                <button
                  onClick={() => openEditModal(buyer)}
                  className="p-2 bg-[#F5F5F0] hover:bg-slate-200 text-[#1E3F20] rounded-xl border border-slate-300 transition-colors"
                  title="Edit Data Pembeli"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                {user?.role === 'ADMIN' && (
                  <button
                    onClick={() => setDeleteId(buyer.id)}
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200 transition-colors"
                    title="Hapus Pembeli"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="Pembeli Tidak Ditemukan" message="Belum ada data pembeli yang terdaftar." />
      )}

      {/* Modal Add / Edit Buyer */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-[#1E3F20]">{editingBuyer ? 'Edit Data Pembeli' : 'Tambah Pembeli Baru'}</h3>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Nama Lengkap Pembeli *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. H. Ahmad Syarif"
                className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#1E3F20]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Nomor Telepon / WhatsApp *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. 081234567890"
                className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#1E3F20]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Alamat Lengkap *</label>
              <textarea
                rows="2"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Alamat domisili atau peternakan pembeli"
                className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#1E3F20]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Catatan Tambahan</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Catatan langganan qurban / partai besar"
                className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#1E3F20]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-sm font-bold text-white bg-[#1E3F20] hover:bg-[#2b592e] rounded-xl shadow-md"
              >
                {submitting ? 'Menyimpan...' : 'Simpan Pembeli'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
