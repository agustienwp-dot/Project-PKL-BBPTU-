import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import { Building2, Plus, Edit3, Trash2, Eye, MapPin } from 'lucide-react';

export default function CagesPage() {
  const { user } = useAuth();

  const [cages, setCages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Modal Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCage, setEditingCage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Sapi',
    location: '',
    capacity: '',
    description: '',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState(null);

  const fetchCages = async () => {
    setLoading(true);
    try {
      const res = await api.get('/cages');
      if (res.data.success) {
        setCages(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching cages:', err);
      setToast({ message: 'Gagal memuat data kandang', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCages();
  }, []);

  const openCreateModal = () => {
    setEditingCage(null);
    setFormData({
      name: '',
      type: 'Sapi',
      location: '',
      capacity: '10',
      description: '',
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (cage) => {
    setEditingCage(cage);
    setFormData({
      name: cage.name,
      type: cage.type,
      location: cage.location,
      capacity: cage.capacity,
      description: cage.description || '',
      isActive: cage.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        capacity: parseInt(formData.capacity, 10),
      };

      let res;
      if (editingCage) {
        res = await api.put(`/cages/${editingCage.id}`, payload);
      } else {
        res = await api.post('/cages', payload);
      }

      if (res.data.success) {
        setToast({ message: editingCage ? 'Kandang berhasil diperbarui' : 'Kandang baru berhasil ditambahkan', type: 'success' });
        setModalOpen(false);
        fetchCages();
      }
    } catch (err) {
      console.error('Submit cage error:', err);
      const msg = err.response?.data?.message || 'Gagal menyimpan data kandang';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await api.delete(`/cages/${deleteId}`);
      if (res.data.success) {
        setToast({ message: 'Kandang berhasil dihapus', type: 'success' });
        fetchCages();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menghapus kandang';
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
        title="Hapus Kandang"
        message="Apakah Anda yakin ingin menghapus kandang ini? Hapus hanya berhasil jika kandang sudah kosong."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#1E3F20] flex items-center gap-3">
            <Building2 className="w-7 h-7 text-[#1E3F20]" />
            Manajemen Kandang Ternak
          </h1>
          <p className="text-slate-600 text-sm mt-1">Kelola data lokasi kandang, kapasitas daya tampung, dan monitoring ketersediaan slot</p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E3F20] hover:bg-[#2b592e] text-white font-bold rounded-xl text-sm shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kandang</span>
        </button>
      </div>

      {/* Grid of Cages */}
      {loading ? (
        <LoadingSpinner text="Memuat daftar kandang..." />
      ) : cages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cages.map((cage) => {
            const percentage = cage.capacity > 0 ? Math.round((cage.availableAnimalsCount / cage.capacity) * 100) : 0;
            return (
              <div key={cage.id} className="bg-white border border-slate-200 hover:border-[#1E3F20] p-6 rounded-2xl space-y-4 shadow-sm transition-all flex flex-col justify-between">
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base text-slate-900">{cage.name}</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${cage.isActive ? 'bg-[#1E3F20]/10 text-[#1E3F20] border-[#1E3F20]/30' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                      {cage.isActive ? 'Aktif' : 'Non-Aktif'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#1E3F20]" />
                    <span>{cage.location} • Peruntukan: <strong className="text-slate-900">{cage.type}</strong></span>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{cage.description || 'Tidak ada deskripsi'}</p>

                  {/* Progress Capacity */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-600">Terisi (Stok Available):</span>
                      <span className="text-[#1E3F20] font-extrabold">{cage.availableAnimalsCount} / {cage.capacity} ekor</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          percentage > 85 ? 'bg-amber-500' : 'bg-[#1E3F20]'
                        }`}
                        style={{ width: `${Math.min(100, percentage)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                      <span>Slot Kosong: <strong className="text-slate-800">{cage.emptySlots} ekor</strong></span>
                      <span>{percentage}% Penuh</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                  <Link
                    to={`/cages/${cage.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#F5F5F0] hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Detail & Penghuni</span>
                  </Link>

                  <button
                    onClick={() => openEditModal(cage)}
                    className="p-2 bg-[#F5F5F0] hover:bg-slate-200 text-[#1E3F20] rounded-xl border border-slate-300 transition-colors"
                    title="Edit Kandang"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {user?.role === 'ADMIN' && (
                    <button
                      onClick={() => setDeleteId(cage.id)}
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200 transition-colors"
                      title="Hapus Kandang"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState title="Kandang Kosong" message="Belum ada data kandang yang ditambahkan." />
      )}

      {/* Modal Add / Edit Cage */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-[#1E3F20]">{editingCage ? 'Edit Data Kandang' : 'Tambah Kandang Baru'}</h3>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Nama Kandang *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Kandang A (Sapi Potong)"
                className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#1E3F20]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Jenis Peruntukan *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#1E3F20]"
                >
                  <option value="Sapi">Sapi</option>
                  <option value="Kambing">Kambing</option>
                  <option value="Domba">Domba</option>
                  <option value="Campuran">Campuran</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Kapasitas (Ekor) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder="e.g. 15"
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#1E3F20]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Lokasi Blok *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Blok Utara"
                className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#1E3F20]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Deskripsi</label>
              <textarea
                rows="2"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi spesifikasi atau fungsi kandang"
                className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#1E3F20]"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 accent-[#1E3F20] rounded"
              />
              <label htmlFor="isActive" className="text-xs font-bold text-slate-700">Kandang Status Aktif</label>
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
                {submitting ? 'Menyimpan...' : 'Simpan Kandang'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
