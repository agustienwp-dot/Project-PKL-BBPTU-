'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';
import { 
  ShieldCheck, 
  Users, 
  UserPlus, 
  Lock, 
  Mail, 
  User,
  Edit2, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  Activity,
  Plus
} from 'lucide-react';

export default function SuperadminPage() {
  const { user, isSuperAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [toast, setToast] = useState(null);

  // User Modal State (Add / Edit)
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('ADMIN_FARM');
  const [formIsActive, setFormIsActive] = useState(true);

  // Delete Confirm State
  const [deletingUser, setDeletingUser] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, sRes] = await Promise.all([
        api.get('/superadmin/users'),
        api.get('/dashboard/stats'),
      ]);

      if (uRes.data.success) setUsers(uRes.data.data);
      if (sRes.data.success) setLogs(sRes.data.data.superadmin?.recentLogs || []);
    } catch (err) {
      console.error('Error fetching superadmin data:', err);
      setToast({ type: 'error', message: 'Gagal memuat data manajemen user.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchData();
    }
  }, [isSuperAdmin]);

  if (!isSuperAdmin) {
    return (
      <div className="p-8 bg-white border border-rose-200 rounded-3xl text-center space-y-4 shadow-sm">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-black text-rose-700">Akses Ditolak — Khusus SUPERADMIN</h2>
        <p className="text-xs text-slate-500">Halaman kelola akun admin ini hanya dapat diakses oleh Superadmin / Pengelola Sistem.</p>
      </div>
    );
  }

  if (loading) return <LoadingSpinner text="Memuat Data Manajemen Admin..." />;

  const openAddModal = () => {
    setEditingUser(null);
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('ADMIN_FARM');
    setFormIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setFormName(u.name);
    setFormEmail(u.email);
    setFormPassword('');
    setFormRole(u.role);
    setFormIsActive(u.isActive);
    setShowModal(true);
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Edit User
        const res = await api.put(`/superadmin/users/${editingUser.id}`, {
          name: formName,
          email: formEmail,
          password: formPassword,
          role: formRole,
          isActive: formIsActive,
        });

        if (res.data.success) {
          setToast({ type: 'success', message: `Data akun ${formEmail} berhasil diperbarui!` });
          setShowModal(false);
          fetchData();
        }
      } else {
        // Add User
        const res = await api.post('/superadmin/users', {
          name: formName,
          email: formEmail,
          password: formPassword,
          role: formRole,
        });

        if (res.data.success) {
          setToast({ type: 'success', message: `Akun baru ${formEmail} berhasil dibuat!` });
          setShowModal(false);
          fetchData();
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menyimpan data akun.';
      setToast({ type: 'error', message: msg });
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      const res = await api.delete(`/superadmin/users/${deletingUser.id}`);
      if (res.data.success) {
        setToast({ type: 'success', message: `Akun ${deletingUser.name} berhasil dihapus.` });
        setDeletingUser(null);
        fetchData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menghapus akun.';
      setToast({ type: 'error', message: msg });
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>POV Superadmin</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Manajemen Akun Admin & Hak Akses</h1>
          <p className="text-xs text-slate-500 font-medium">Tambah, ubah, nonaktifkan, atau hapus akun Admin Farm dan Admin Pemasaran.</p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-[#1E3F20] text-white hover:bg-[#16331a] rounded-2xl text-xs font-bold shadow-md transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Akun Admin</span>
        </button>
      </div>

      {/* Admin Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span>Daftar Akun Admin Sistem ({users.length})</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Nama Lengkap</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Role Hak Akses</th>
                <th className="py-3.5 px-4">Status Akun</th>
                <th className="py-3.5 px-4">Tanggal Dibuat</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs">
                      {u.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span>{u.name}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-semibold">{u.email}</td>
                  <td className="py-3.5 px-4">
                    {u.role === 'SUPERADMIN' && (
                      <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-700 font-black text-[10px]">
                        SUPERADMIN
                      </span>
                    )}
                    {u.role === 'ADMIN_FARM' && (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        ADMIN FARM PRODUKSI
                      </span>
                    )}
                    {u.role === 'ADMIN_PEMASARAN' && (
                      <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-bold text-[10px]">
                        ADMIN PEMASARAN
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {u.isActive ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                        Aktif
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px]">
                        Nonaktif
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-3.5 px-4 text-center space-x-2">
                    <button
                      onClick={() => openEditModal(u)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit User"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {u.id !== user.id && (
                      <button
                        onClick={() => setDeletingUser(u)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* USER FORM MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600" />
                <span>{editingUser ? 'Edit Data Akun Admin' : 'Tambah Akun Admin Baru'}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>

            <form onSubmit={handleSubmitUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  placeholder="Contoh: Ahmad Subagyo"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Email</label>
                <input
                  type="email"
                  placeholder="Contoh: ahmad@susu.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {editingUser ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password'}
                </label>
                <input
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
                  required={!editingUser}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role / Hak Akses</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
                  required
                >
                  <option value="ADMIN_FARM">ADMIN FARM PRODUKSI (Input Produksi & Olahan)</option>
                  <option value="ADMIN_PEMASARAN">ADMIN PEMASARAN (Melihat Stok & Input Produk Keluar)</option>
                  <option value="SUPERADMIN">SUPERADMIN (Pengelola Sistem)</option>
                </select>
              </div>

              {editingUser && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
                  />
                  <label htmlFor="isActive" className="text-xs font-bold text-slate-700">Akun Aktif (Bisa Login)</label>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 shadow"
                >
                  {editingUser ? 'Simpan Perubahan' : 'Buat Akun Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!deletingUser}
        title="Konfirmasi Hapus Akun Admin"
        message={`Apakah Anda yakin ingin menghapus akun ${deletingUser?.name} (${deletingUser?.email})? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus Akun"
        onConfirm={handleDeleteUser}
        onCancel={() => setDeletingUser(null)}
      />
    </div>
  );
}
