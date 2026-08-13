'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import { Building2, ArrowLeft, Eye, ShoppingCart } from 'lucide-react';

export default function CageDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [cage, setCage] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCageDetail = async () => {
    try {
      const res = await api.get(`/cages/${id}`);
      if (res.data.success) {
        setCage(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching cage detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCageDetail();
  }, [id]);

  if (loading) return <LoadingSpinner text="Memuat detail kandang..." />;
  if (!cage) return <div className="p-6 bg-white text-slate-500 rounded-2xl">Kandang tidak ditemukan</div>;

  const percentage = cage.capacity > 0 ? Math.round((cage.availableAnimalsCount / cage.capacity) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/cages" className="p-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-600 rounded-xl transition-colors shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#1E3F20]">{cage.name}</h1>
          <p className="text-slate-600 text-xs mt-0.5">{cage.location} • Peruntukan Jenis {cage.type}</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-2 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Kapasitas</span>
          <h3 className="text-3xl font-black text-slate-900">{cage.capacity} <span className="text-sm font-normal text-slate-500">ekor</span></h3>
          <p className="text-xs text-slate-500">Kapasitas penampungan maksimal</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-2 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Jumlah Hewan Tersedia (Stok)</span>
          <h3 className="text-3xl font-black text-[#1E3F20]">{cage.availableAnimalsCount} <span className="text-sm font-normal text-slate-500">ekor</span></h3>
          <p className="text-xs text-slate-500">Status hewan AVAILABLE saat ini</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-2 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Slot Kosong Tersisa</span>
          <h3 className="text-3xl font-black text-amber-700">{cage.emptySlots} <span className="text-sm font-normal text-slate-500">slot</span></h3>
          <p className="text-xs text-slate-500">Sisa daya tampung yang belum terisi</p>
        </div>
      </div>

      {/* Capacity Progress Bar */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-2 shadow-sm">
        <div className="flex justify-between text-sm font-bold">
          <span className="text-slate-800">Tingkat Pengisian Kandang</span>
          <span className="text-[#1E3F20]">{percentage}% Penuh</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentage > 85 ? 'bg-amber-500' : 'bg-[#1E3F20]'
            }`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          ></div>
        </div>
      </div>

      {/* Available Animals inside this cage */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <h3 className="text-lg font-bold text-[#1E3F20]">Daftar Hewan Berada di Kandang Ini</h3>

        {cage.availableAnimals?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-[#F5F5F0] text-slate-700 uppercase text-[11px] tracking-wider border-b border-slate-200 font-bold">
                <tr>
                  <th className="px-4 py-3 font-semibold">Kode & Nama</th>
                  <th className="px-4 py-3 font-semibold">Jenis / Ras</th>
                  <th className="px-4 py-3 font-semibold">Gender</th>
                  <th className="px-4 py-3 font-semibold">Berat</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cage.availableAnimals.map((animal) => (
                  <tr key={animal.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-bold text-[#1E3F20] block">{animal.code}</span>
                      <span className="text-slate-900 font-bold">{animal.name}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-slate-900 font-bold block">{animal.type}</span>
                      <span className="text-xs text-slate-500">{animal.breed}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 font-medium">{animal.gender}</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900">{animal.weight} kg</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={animal.status} />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/animals/${animal.id}`}
                          className="p-1.5 bg-[#F5F5F0] hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-300"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </Link>

                        <Link
                          href={`/sales/new?animalId=${animal.id}`}
                          className="p-1.5 bg-[#1E3F20] hover:bg-[#2b592e] text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Jual</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Kandang Masih Kosong" message="Tidak ada hewan ternak berstatus AVAILABLE yang menempati kandang ini." />
        )}
      </div>
    </div>
  );
}
