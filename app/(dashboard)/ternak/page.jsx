'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import StatusBadge from '@/components/StatusBadge';
import { 
  Stethoscope, 
  Boxes, 
  Heart, 
  AlertTriangle, 
  Plus, 
  Calendar, 
  Activity, 
  Syringe, 
  ShieldAlert, 
  TrendingUp,
  Tag,
  Building2,
  Eye,
  ShoppingCart
} from 'lucide-react';

export default function AdminTernakPage() {
  const { user, isAdminTernak, isSuperAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [animals, setAnimals] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [reproRecords, setReproRecords] = useState([]);
  const [feedStock, setFeedStock] = useState({ feeds: [], criticalFeeds: [] });
  const [toast, setToast] = useState(null);

  // Modal Medical Record
  const [showMedModal, setShowMedModal] = useState(false);
  const [selectedAnimalId, setSelectedAnimalId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [vaccineName, setVaccineName] = useState('');
  const [medStatus, setMedStatus] = useState('KARANTINA');

  // Modal Repro Record
  const [showReproModal, setShowReproModal] = useState(false);
  const [reproType, setReproType] = useState('INSEMINASI_BUATAN');
  const [reproStatus, setReproStatus] = useState('SIAP_BUNTING');
  const [bullCode, setBullCode] = useState('');

  // Modal Feed Stock
  const [showFeedModal, setShowFeedModal] = useState(false);
  const [feedName, setFeedName] = useState('');
  const [feedCategory, setFeedCategory] = useState('Hijauan Segar');
  const [feedQty, setFeedQty] = useState('100');
  const [feedMinStock, setFeedMinStock] = useState('50');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aRes, mRes, rRes, fRes] = await Promise.all([
        api.get('/animals?limit=50'),
        api.get('/ternak/medical'),
        api.get('/ternak/reproduction'),
        api.get('/ternak/feed'),
      ]);

      if (aRes.data.success) setAnimals(aRes.data.data);
      if (mRes.data.success) setMedicalRecords(mRes.data.data);
      if (rRes.data.success) setReproRecords(rRes.data.data);
      if (fRes.data.success) setFeedStock(fRes.data.data);
    } catch (err) {
      console.error('Error loading ternak data:', err);
      setToast({ type: 'error', message: 'Gagal memuat data ternak lapangan.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminTernak || isSuperAdmin) {
      fetchData();
    }
  }, [isAdminTernak, isSuperAdmin]);

  if (!isAdminTernak && !isSuperAdmin) {
    return (
      <div className="p-8 bg-white border border-rose-200 rounded-3xl text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-black text-rose-700">Akses Ditolak — Khusus ADMIN KELOLA TERNAK / MANTRI</h2>
        <p className="text-xs text-slate-500">Halaman ini dikhususkan untuk Mantri Lapangan, Pengelolaan Ternak RFID, Medis, & Pakan.</p>
      </div>
    );
  }

  if (loading) return <LoadingSpinner text="Memuat Data Ternak & Rekam Medis Lapangan..." />;

  const handleCreateMedical = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/ternak/medical', {
        animalId: selectedAnimalId,
        diagnosis,
        treatment,
        vaccineName: vaccineName || null,
        veterinarian: user?.name || 'Mantri Ahmad',
        status: medStatus,
      });

      if (res.data.success) {
        setToast({ type: 'success', message: 'Catatan medis ternak berhasil ditambahkan!' });
        setShowMedModal(false);
        setDiagnosis('');
        setTreatment('');
        setVaccineName('');
        fetchData();
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Gagal menambah catatan medis.' });
    }
  };

  const handleCreateRepro = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/ternak/reproduction', {
        animalId: selectedAnimalId,
        type: reproType,
        status: reproStatus,
        bullCode: bullCode || null,
      });

      if (res.data.success) {
        setToast({ type: 'success', message: 'Catatan reproduksi / Inseminasi Buatan berhasil disimpan!' });
        setShowReproModal(false);
        fetchData();
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Gagal menyimpan catatan reproduksi.' });
    }
  };

  const handleCreateFeed = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/ternak/feed', {
        name: feedName,
        category: feedCategory,
        quantityKg: feedQty,
        minStockKg: feedMinStock,
      });

      if (res.data.success) {
        setToast({ type: 'success', message: 'Stok pakan ternak berhasil diperbarui!' });
        setShowFeedModal(false);
        setFeedName('');
        fetchData();
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Gagal memperbarui pakan.' });
    }
  };

  const quarantineAnimalsCount = animals.filter(a => a.quarantineStatus === 'Karantina' || a.quarantineStatus === 'Sakit').length;
  const readyBuntingCount = animals.filter(a => a.reproductionStatus === 'Siap Bunting' || a.reproductionStatus === 'Hamil').length;

  return (
    <div className="space-y-8 pb-12">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-emerald-950 flex items-center gap-3">
            <Stethoscope className="w-8 h-8 text-emerald-700" />
            POV 3: ADMIN KELOLA TERNAK (Mantri & Petugas Lapangan)
          </h1>
          <p className="text-slate-600 text-xs mt-1">Pengelolaan Ternak ber-Ear Tag RFID, Catatan Medis/Vaksin, Inseminasi Buatan (IB), & Stok Pakan Kritis</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/animals/new"
            className="px-4 py-2.5 bg-[#1E3F20] hover:bg-[#2b592e] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Register Ternak Baru</span>
          </Link>
          <button
            onClick={() => setShowFeedModal(true)}
            className="px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Update Stok Pakan</span>
          </button>
        </div>
      </div>

      {/* 4 Status Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-1 shadow-sm border-t-4 border-t-[#1E3F20]">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Populasi Ternak</span>
          <h3 className="text-3xl font-black text-[#1E3F20]">{animals.length} <span className="text-xs font-normal text-slate-500">ekor</span></h3>
          <p className="text-xs text-emerald-700 font-semibold">Tercatat Ear-Tag / RFID Code</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-1 shadow-sm border-t-4 border-t-rose-600">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ternak Sakit / Karantina</span>
          <h3 className="text-3xl font-black text-rose-600">{quarantineAnimalsCount} <span className="text-xs font-normal text-slate-500">ekor</span></h3>
          <p className="text-xs text-rose-700 font-semibold">Ruang Isolasi Medik</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-1 shadow-sm border-t-4 border-t-amber-500">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Stok Pakan Kritis</span>
          <h3 className="text-3xl font-black text-amber-700">{feedStock.criticalCount || 0} <span className="text-xs font-normal text-slate-500">kategori</span></h3>
          <p className="text-xs text-amber-800 font-semibold">Peringatan Minimum Stock Alert</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-1 shadow-sm border-t-4 border-t-purple-600">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sapi Siap Bunting (IB)</span>
          <h3 className="text-3xl font-black text-purple-700">{readyBuntingCount} <span className="text-xs font-normal text-slate-500">ekor</span></h3>
          <p className="text-xs text-purple-800 font-semibold">Program Reproduksi Mantri</p>
        </div>
      </div>

      {/* Visual Cards Master Ternak dengan Ear-Tag RFID */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#1E3F20]" />
            Visual Master Ternak & Identification Tag (RFID / Ear-Tag)
          </h3>
          <span className="text-xs text-slate-500 font-semibold">Total: {animals.length} Ekor Ternak Lapangan</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {animals.map((a) => (
            <div key={a.id} className="bg-[#F5F5F0] border border-slate-300 rounded-2xl p-5 space-y-3 relative hover:shadow-md transition-shadow">
              
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black bg-[#1E3F20] text-white px-2.5 py-1 rounded-lg">
                  {a.earTag || a.code}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  a.quarantineStatus === 'Karantina' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                  a.reproductionStatus === 'Siap Bunting' ? 'bg-purple-100 text-purple-800 border border-purple-300' :
                  'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}>
                  {a.quarantineStatus === 'Karantina' ? 'KARANTINA' : a.reproductionStatus}
                </span>
              </div>

              <div>
                <h4 className="text-base font-black text-slate-900">{a.name}</h4>
                <p className="text-xs text-slate-600 font-medium">{a.type} • Ras {a.breed} ({a.gender})</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-slate-200 font-medium">
                <div>
                  <span className="text-slate-500 text-[10px] block font-bold">Berat Ternak:</span>
                  <span className="font-mono font-black text-[#1E3F20]">{a.weight} kg</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block font-bold">Lokasi Kandang:</span>
                  <span className="truncate block font-bold text-slate-800">{a.cage?.name || 'Kandang Utama'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => {
                    setSelectedAnimalId(a.id);
                    setShowMedModal(true);
                  }}
                  className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <Syringe className="w-3.5 h-3.5" />
                  <span>+ Medis</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedAnimalId(a.id);
                    setShowReproModal(true);
                  }}
                  className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <Heart className="w-3.5 h-3.5" />
                  <span>+ Repro/IB</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Catatan Medis & Stok Pakan Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Catatan Medis Veteriner */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-rose-600" />
            Catatan Medis & Jadwal Vaksinasi Lapangan
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {medicalRecords.map((m) => (
              <div key={m.id} className="p-4 bg-[#F5F5F0] border border-slate-200 rounded-2xl space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-rose-800">{m.animal?.code} ({m.animal?.name})</span>
                  <span className="font-bold text-slate-500">{new Date(m.recordedAt).toLocaleDateString('id-ID')}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Diagnosis: {m.diagnosis}</h4>
                <p className="text-slate-700 font-medium">Pengobatan: {m.treatment}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                  <span>Petugas: {m.veterinarian}</span>
                  <span className="font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded border border-purple-300">
                    Vaksin: {m.vaccineName || 'Vaksin Rutin'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Manajemen Inventoris Pakan & Warning Kritis */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            Manajemen Pakan & Stok Kritis Warning
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {feedStock.feeds?.map((f) => {
              const isCritical = f.quantityKg <= f.minStockKg;
              return (
                <div key={f.id} className={`p-4 rounded-2xl border ${isCritical ? 'bg-amber-50 border-amber-300' : 'bg-[#F5F5F0] border-slate-200'} space-y-2`}>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900 text-sm">{f.name}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isCritical ? 'bg-amber-500 text-white' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isCritical ? 'STOK KRITIS ALERT' : 'AMAN'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Sisa Stok Terkini:</span>
                    <span className="font-mono font-black text-base text-slate-900">{f.quantityKg} {f.unit}</span>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full ${isCritical ? 'bg-amber-600' : 'bg-emerald-600'}`}
                      style={{ width: `${Math.min(100, (f.quantityKg / (f.minStockKg * 2)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Modal Input Medis */}
      {showMedModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900">Catat Rekam Medis / Pengobatan</h3>
            <form onSubmit={handleCreateMedical} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Diagnosis Sakit / Gejala</label>
                <input
                  type="text"
                  required
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2.5"
                  placeholder="e.g. Demam Ringan & Flu PMK"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Tindakan Pengobatan</label>
                <textarea
                  required
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2.5"
                  placeholder="Injeksi Vitamin & Antibiotik"
                  rows="2"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Vaksin Diberikan (Opsional)</label>
                <input
                  type="text"
                  value={vaccineName}
                  onChange={(e) => setVaccineName(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2.5"
                  placeholder="e.g. Vaksin PMK Booster"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowMedModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-700 text-white font-bold rounded-xl shadow-md"
                >
                  Simpan Rekam Medis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Input Repro */}
      {showReproModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900">Catat Inseminasi Buatan (IB) / Reproduksi</h3>
            <form onSubmit={handleCreateRepro} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Jenis Program</label>
                <select
                  value={reproType}
                  onChange={(e) => setReproType(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2.5 font-bold"
                >
                  <option value="INSEMINASI_BUATAN">Inseminasi Buatan (IB / Kawin Suntik)</option>
                  <option value="PENGUMPULAN">Pengumpulan Pejantan</option>
                  <option value="MELAHIRKAN">Laporan Melahirkan / Kelahiran</option>
                </select>
              </div>
              <div>
                <label className="font-bold block mb-1">Status Reproduksi Ternak</label>
                <select
                  value={reproStatus}
                  onChange={(e) => setReproStatus(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2.5 font-bold"
                >
                  <option value="SIAP_BUNTING">Siap Bunting</option>
                  <option value="HAMIL">Hamil / Bunting</option>
                  <option value="MELAHIRKAN">Melahirkan</option>
                </select>
              </div>
              <div>
                <label className="font-bold block mb-1">Kode Pejantan / Semen IB</label>
                <input
                  type="text"
                  value={bullCode}
                  onChange={(e) => setBullCode(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2.5 font-mono"
                  placeholder="e.g. BULL-LIM-99"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowReproModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-700 text-white font-bold rounded-xl shadow-md"
                >
                  Simpan Catatan Reproduksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Input Feed */}
      {showFeedModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900">Update Stok Pakan Ternak</h3>
            <form onSubmit={handleCreateFeed} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Nama Pakan</label>
                <input
                  type="text"
                  required
                  value={feedName}
                  onChange={(e) => setFeedName(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2.5"
                  placeholder="e.g. Konsentrat Sapi Gemuk A1"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Kategori Pakan</label>
                <select
                  value={feedCategory}
                  onChange={(e) => setFeedCategory(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2.5 font-bold"
                >
                  <option value="Hijauan Segar">Hijauan Segar</option>
                  <option value="Konsentrat Tinggi Protein">Konsentrat Tinggi Protein</option>
                  <option value="Suplemen & Mineral Block">Suplemen & Mineral Block</option>
                </select>
              </div>
              <div>
                <label className="font-bold block mb-1">Jumlah Terkini (kg)</label>
                <input
                  type="number"
                  required
                  value={feedQty}
                  onChange={(e) => setFeedQty(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2.5 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowFeedModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-700 text-white font-bold rounded-xl shadow-md"
                >
                  Update Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
