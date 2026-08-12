import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import { BadgeCheck, Search, Eye } from 'lucide-react';

export default function SoldPage() {
  const [animals, setAnimals] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchSoldAnimals = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/animals', {
        params: {
          status: 'SOLD',
          search,
          type: typeFilter,
          page,
          limit: 10,
        },
      });

      if (res.data.success) {
        setAnimals(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching sold animals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSoldAnimals(1);
  }, [search, typeFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-[#1E3F20] flex items-center gap-3">
          <BadgeCheck className="w-7 h-7 text-blue-700" />
          Daftar Hewan Terjual (Sold)
        </h1>
        <p className="text-slate-600 text-sm mt-1">Riwayat seluruh hewan ternak yang telah sukses terjual kepada pembeli</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode, nama, atau ras hewan yang terjual..."
            className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1E3F20]"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-[#F5F5F0] border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-700 font-semibold focus:outline-none focus:border-[#1E3F20]"
        >
          <option value="">Semua Jenis</option>
          <option value="Sapi">Sapi</option>
          <option value="Kambing">Kambing</option>
          <option value="Domba">Domba</option>
        </select>
      </div>

      {/* Table Data */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 space-y-4 shadow-sm">
        {loading ? (
          <LoadingSpinner text="Memuat daftar hewan terjual..." />
        ) : animals.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm text-slate-700">
                <thead className="bg-[#F5F5F0] text-slate-700 uppercase text-[11px] tracking-wider border-b border-slate-200 font-bold">
                  <tr>
                    <th className="px-4 py-3.5">Kode & Nama</th>
                    <th className="px-4 py-3.5">Jenis / Ras</th>
                    <th className="px-4 py-3.5">Berat saat Jual</th>
                    <th className="px-4 py-3.5">Pembeli</th>
                    <th className="px-4 py-3.5">Tanggal Terjual</th>
                    <th className="px-4 py-3.5 text-right">Harga Jual</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-4 py-3.5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {animals.map((animal) => (
                    <tr key={animal.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5">
                        <span className="font-mono font-bold text-blue-700 block">{animal.code}</span>
                        <span className="text-slate-900 font-bold">{animal.name}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-800 block">{animal.type}</span>
                        <span className="text-xs text-slate-500">{animal.breed}</span>
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900">{animal.weight} kg</td>
                      <td className="px-4 py-3.5 font-bold text-[#1E3F20]">
                        {animal.sale?.buyer?.name || '-'}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-500 font-semibold">
                        {animal.sale?.saleDate ? new Date(animal.sale.saleDate).toLocaleDateString('id-ID') : '-'}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-extrabold text-blue-700">
                        {animal.sale?.sellingPrice ? `Rp ${animal.sale.sellingPrice.toLocaleString('id-ID')}` : '-'}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <StatusBadge status={animal.status} />
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <Link
                          to={`/animals/${animal.id}`}
                          title="Detail Profile"
                          className="p-1.5 bg-[#F5F5F0] hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-300 transition-colors inline-flex items-center gap-1 text-xs font-semibold"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(p) => fetchSoldAnimals(p)}
            />
          </>
        ) : (
          <EmptyState title="Belum Ada Hewan Terjual" message="Tidak ada data hewan berstatus SOLD saat ini." />
        )}
      </div>
    </div>
  );
}
