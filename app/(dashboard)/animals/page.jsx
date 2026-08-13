'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/services/api';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import Pagination from '@/components/Pagination';
import ConfirmModal from '@/components/ConfirmModal';
import Toast from '@/components/Toast';
import { useAuth } from '@/context/AuthContext';
import { 
  Boxes, 
  Plus, 
  Search, 
  Eye, 
  Edit3, 
  Trash2, 
  ShoppingCart
} from 'lucide-react';

export default function AnimalsPage() {
  const { user } = useAuth();

  const [animals, setAnimals] = useState([]);
  const [cages, setCages] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [cageFilter, setCageFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  // Modal Delete State
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const fetchCages = async () => {
    try {
      const res = await api.get('/cages');
      if (res.data.success) setCages(res.data.data);
    } catch (err) {
      console.error('Failed to fetch cages:', err);
    }
  };

  const fetchAnimals = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        search,
        status: statusFilter,
        type: typeFilter,
        cageId: cageFilter,
        sortBy,
        order,
      };

      const res = await api.get('/animals', { params });
      if (res.data.success) {
        setAnimals(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching animals:', err);
      setToast({ message: 'Gagal mengambil data hewan', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCages();
  }, []);

  useEffect(() => {
    fetchAnimals(1);
  }, [search, statusFilter, typeFilter, cageFilter, sortBy, order]);

  const calculateAge = (birthDate) => {
    if (!birthDate) return '-';
    const birth = new Date(birthDate);
    const now = new Date();
    const diffMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (diffMonths < 1) return '< 1 bulan';
    if (diffMonths < 12) return `${diffMonths} bulan`;
    const years = Math.floor(diffMonths / 12);
    const remMonths = diffMonths % 12;
    return remMonths > 0 ? `${years} thn ${remMonths} bln` : `${years} tahun`;
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await api.delete(`/animals/${deleteId}`);
      if (res.data.success) {
        setToast({ message: 'Hewan berhasil dihapus', type: 'success' });
        fetchAnimals(pagination.page);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menghapus data hewan';
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
        title="Hapus Data Hewan"
        message="Apakah Anda yakin ingin menghapus data hewan ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#1E3F20] flex items-center gap-3">
            <Boxes className="w-7 h-7 text-[#1E3F20]" />
            Manajemen Data Hewan
          </h1>
          <p className="text-slate-600 text-sm mt-1">Kelola data hewan ternak, berat, lokasi kandang, dan status ketersediaan</p>
        </div>

        <Link
          href="/animals/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E3F20] hover:bg-[#2b592e] text-white font-bold rounded-xl text-sm shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Hewan Baru</span>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-3 md:space-y-0 md:flex md:items-center md:gap-4 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode, nama, atau ras hewan..."
            className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl py-2 pl-10 pr-4 text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1E3F20]"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#F5F5F0] border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none focus:border-[#1E3F20]"
          >
            <option value="">Semua Status</option>
            <option value="AVAILABLE">AVAILABLE (Tersedia)</option>
            <option value="SOLD">SOLD (Terjual)</option>
            <option value="DECEASED">DECEASED (Mati)</option>
            <option value="TRANSFERRED">TRANSFERRED (Dipindah)</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#F5F5F0] border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none focus:border-[#1E3F20]"
          >
            <option value="">Semua Jenis</option>
            <option value="Sapi">Sapi</option>
            <option value="Kambing">Kambing</option>
            <option value="Domba">Domba</option>
          </select>

          <select
            value={cageFilter}
            onChange={(e) => setCageFilter(e.target.value)}
            className="bg-[#F5F5F0] border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none focus:border-[#1E3F20] col-span-2 sm:col-span-1"
          >
            <option value="">Semua Kandang</option>
            {cages.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 space-y-4 shadow-sm">
        {loading ? (
          <LoadingSpinner text="Memuat data hewan..." />
        ) : animals.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm text-slate-700">
                <thead className="bg-[#F5F5F0] text-slate-700 uppercase text-[11px] tracking-wider border-b border-slate-200 font-bold">
                  <tr>
                    <th className="px-4 py-3.5">Kode & Nama</th>
                    <th className="px-4 py-3.5">Jenis / Ras</th>
                    <th className="px-4 py-3.5">Gender</th>
                    <th className="px-4 py-3.5">Berat</th>
                    <th className="px-4 py-3.5">Umur</th>
                    <th className="px-4 py-3.5">Kandang</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-4 py-3.5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {animals.map((animal) => (
                    <tr key={animal.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5">
                        <span className="font-mono font-bold text-[#1E3F20] block">{animal.code}</span>
                        <span className="text-slate-900 font-bold">{animal.name}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-800 block">{animal.type}</span>
                        <span className="text-xs text-slate-500">{animal.breed}</span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 font-medium">{animal.gender}</td>
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900">{animal.weight} kg</td>
                      <td className="px-4 py-3.5 text-xs text-slate-500">{calculateAge(animal.birthDate)}</td>
                      <td className="px-4 py-3.5 text-slate-700 text-xs font-semibold">{animal.cage?.name || '-'}</td>
                      <td className="px-4 py-3.5 text-center">
                        <StatusBadge status={animal.status} />
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/animals/${animal.id}`}
                            title="Detail"
                            className="p-1.5 bg-[#F5F5F0] hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-300 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          
                          <Link
                            href={`/animals/${animal.id}/edit`}
                            title="Edit"
                            className="p-1.5 bg-[#F5F5F0] hover:bg-slate-200 text-[#1E3F20] rounded-lg border border-slate-300 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>

                          {animal.status === 'AVAILABLE' && (
                            <Link
                              href={`/sales/new?animalId=${animal.id}`}
                              title="Jual Hewan Ini"
                              className="p-1.5 bg-[#1E3F20] hover:bg-[#2b592e] text-white rounded-lg transition-colors"
                            >
                              <ShoppingCart className="w-4 h-4" />
                            </Link>
                          )}

                          {user?.role === 'ADMIN' && (
                            <button
                              onClick={() => setDeleteId(animal.id)}
                              title="Hapus"
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => fetchAnimals(page)}
            />
          </>
        ) : (
          <EmptyState title="Hewan Tidak Ditemukan" message="Tidak ada data hewan yang sesuai dengan kriteria pencarian Anda." />
        )}
      </div>
    </div>
  );
}
