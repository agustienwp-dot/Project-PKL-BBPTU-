import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import { CheckCircle2, ShoppingCart, Search, Eye } from 'lucide-react';

export default function AvailablePage() {
  const [animals, setAnimals] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAvailableAnimals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/animals', {
        params: {
          status: 'AVAILABLE',
          search,
          type: typeFilter,
          limit: 50,
        },
      });

      if (res.data.success) {
        setAnimals(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching available animals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableAnimals();
  }, [search, typeFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-[#1E3F20] flex items-center gap-3">
          <CheckCircle2 className="w-7 h-7 text-[#1E3F20]" />
          Stok Hewan Tersedia (Available)
        </h1>
        <p className="text-slate-600 text-sm mt-1">Daftar hewan ternak berstatus AVAILABLE yang siap dijual atau diproses</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode, nama, atau ras hewan tersedia..."
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

      {/* Grid Cards of Available Animals */}
      {loading ? (
        <LoadingSpinner text="Memuat stok hewan tersedia..." />
      ) : animals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {animals.map((animal) => (
            <div key={animal.id} className="bg-white border border-slate-200 hover:border-[#1E3F20] p-5 rounded-2xl space-y-4 shadow-sm transition-all flex flex-col justify-between">
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#1E3F20] text-sm bg-[#1E3F20]/10 px-2.5 py-1 rounded-lg border border-[#1E3F20]/20">
                    {animal.code}
                  </span>
                  <StatusBadge status={animal.status} />
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">{animal.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{animal.type} • Ras {animal.breed} • {animal.gender}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-[#F5F5F0] p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 block">Berat</span>
                    <span className="font-bold text-slate-900">{animal.weight} kg</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Kandang</span>
                    <span className="font-bold text-[#1E3F20]">{animal.cage?.name || '-'}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-slate-500">Estimasi Jual:</span>
                  <span className="font-mono font-extrabold text-[#1E3F20] text-sm">
                    {animal.estimatedSellingPrice ? `Rp ${animal.estimatedSellingPrice.toLocaleString('id-ID')}` : '-'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <Link
                  to={`/animals/${animal.id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#F5F5F0] hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Detail Profile</span>
                </Link>

                <Link
                  to={`/sales/new?animalId=${animal.id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#1E3F20] hover:bg-[#2b592e] text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Jual Hewan Ini</span>
                </Link>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="Stok Hewan Kosong" message="Tidak ada hewan ternak berstatus AVAILABLE saat ini." />
      )}
    </div>
  );
}
