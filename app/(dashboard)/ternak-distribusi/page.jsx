'use client';

import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import { 
  Boxes, 
  Sliders, 
  Download, 
  Printer, 
  Plus, 
  Filter, 
  ArrowUpDown, 
  Lock, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  HelpCircle,
  Edit2
} from 'lucide-react';

export default function TernakDistribusiPage() {
  const [loading, setLoading] = useState(true);
  const [animals, setAnimals] = useState([]);
  const [settings, setSettings] = useState({ batas_umur_distribusi: '1.5', batas_umur_afkir: '7.0' });
  const [toast, setToast] = useState(null);

  // Filter & Sorting State
  const [farmFilter, setFarmFilter] = useState('');
  const [sexFilter, setSexFilter] = useState('');
  const [recFilter, setRecFilter] = useState('');
  const [sortByAge, setSortByAge] = useState('asc'); // 'asc' = termuda ke tertua, 'desc' = tertua ke termuda

  // Modal Settings
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [batasDistribusiInput, setBatasDistribusiInput] = useState('1.5');
  const [batasAfkirInput, setBatasAfkirInput] = useState('7.0');

  // Modal Add Animal
  const [showAddModal, setShowAddModal] = useState(false);
  const [farmInput, setFarmInput] = useState('Lpk');
  const [codeInput, setCodeInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [birthDateInput, setBirthDateInput] = useState('2024-08-27');
  const [sexInput, setSexInput] = useState('Betina');

  // Modal Override
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [isOverride, setIsOverride] = useState(false);
  const [overrideValue, setOverrideValue] = useState('Afkir');

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (farmFilter) params.append('farm', farmFilter);
      if (sexFilter) params.append('sex', sexFilter);
      if (recFilter) params.append('recommendation', recFilter);
      if (sortByAge) params.append('sortByAge', sortByAge);

      const res = await api.get(`/ternak-distribusi?${params.toString()}`);
      if (res.data.success) {
        setAnimals(res.data.data);
        if (res.data.settings) {
          setSettings(res.data.settings);
          setBatasDistribusiInput(res.data.settings.batas_umur_distribusi || '1.5');
          setBatasAfkirInput(res.data.settings.batas_umur_afkir || '7.0');
        }
      }
    } catch (err) {
      console.error('Error fetching ternak distribusi:', err);
      setToast({ type: 'error', message: 'Gagal memuat data ternak.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [farmFilter, sexFilter, recFilter, sortByAge]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/settings', {
        batas_umur_distribusi: batasDistribusiInput,
        batas_umur_afkir: batasAfkirInput,
      });

      if (res.data.success) {
        setToast({ type: 'success', message: 'Pengaturan batas umur otomatis berhasil diperbarui!' });
        setShowSettingsModal(false);
        fetchData();
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Gagal menyimpan pengaturan.' });
    }
  };

  const handleAddAnimal = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/ternak-distribusi', {
        farm: farmInput,
        code: codeInput,
        name: nameInput || `Sapi ${codeInput}`,
        birthDate: birthDateInput,
        gender: sexInput,
        type: 'Sapi Perah',
        breed: 'Friesian Holstein',
      });

      if (res.data.success) {
        setToast({ type: 'success', message: `Sapi No. ${codeInput} berhasil ditambahkan!` });
        setShowAddModal(false);
        setCodeInput('');
        setNameInput('');
        fetchData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menambah data sapi.';
      setToast({ type: 'error', message: msg });
    }
  };

  const handleSaveOverride = async (e) => {
    e.preventDefault();
    if (!selectedAnimal) return;

    try {
      const res = await api.put('/ternak-distribusi', {
        id: selectedAnimal.id,
        isManualOverride: isOverride,
        manualRecommendation: isOverride ? overrideValue : null,
      });

      if (res.data.success) {
        setToast({ type: 'success', message: `Rekomendasi No. Sapi ${selectedAnimal.code} berhasil diperbarui!` });
        setShowOverrideModal(false);
        setSelectedAnimal(null);
        fetchData();
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Gagal meng-override rekomendasi.' });
    }
  };

  // Export CSV Excel
  const handleExportExcel = () => {
    const headers = ['No', 'Farm', 'No. Sapi', 'Tanggal Lahir', 'Sex', 'Umur (Th Bln Hr)', 'Keterangan/Rekomendasi', 'Sumber Rekomendasi'];
    const rows = animals.map((a, idx) => [
      idx + 1,
      `"${a.farm}"`,
      `"${a.code}"`,
      `"${a.birthDate ? new Date(a.birthDate).toLocaleDateString('id-ID') : '-'}"`,
      `"${a.gender}"`,
      `"${a.ageFormatted}"`,
      `"${a.recommendation}"`,
      `"${a.sourceLabel}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Data_Ternak_Distribusi_Afkir_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <LoadingSpinner text="Memuat Modul Produk Ternak (Excel DATEDIF)..." />;

  return (
    <div className="space-y-8 pb-12">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#1E3F20] flex items-center gap-3">
            <Boxes className="w-8 h-8 text-[#1E3F20]" />
            Modul 1: Produk Ternak (Distribusi & Afkir)
          </h1>
          <p className="text-slate-600 text-xs mt-1">
            Format Pencatatan Sapi Perah • Umur Presisi Excel DATEDIF (`X Th Y Bln Z Hr`) • Auto Recommendation Threshold
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            <Sliders className="w-4 h-4" />
            <span>Setting Batas Umur</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2.5 bg-[#1E3F20] hover:bg-[#2b592e] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Data Sapi</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV / Excel</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      {/* Threshold Setting Overview Banner */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-[#1E3F20] rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">Aturan Batas Umur Rekomendasi Aktif</h4>
            <p className="text-sm font-extrabold text-slate-900">
              Distribusi (Bibit): <span className="text-emerald-700 font-mono">≤ {settings.batas_umur_distribusi} Tahun</span> • Afkir: <span className="text-rose-700 font-mono">≥ {settings.batas_umur_afkir} Tahun</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowSettingsModal(true)}
          className="text-xs font-bold text-[#1E3F20] hover:underline"
        >
          Ubah Pengaturan Batas Umur →
        </button>
      </div>

      {/* Filter & Sorting Controls */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3 flex-wrap text-xs font-semibold">
          <span className="font-bold uppercase text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#1E3F20]" /> Filter:
          </span>

          {/* Farm Filter */}
          <select
            value={farmFilter}
            onChange={(e) => setFarmFilter(e.target.value)}
            className="bg-[#F5F5F0] border border-slate-300 rounded-xl px-3 py-1.5 font-bold text-slate-800"
          >
            <option value="">Semua Farm</option>
            <option value="Lpk">Farm Lpk</option>
            <option value="LPK">Farm LPK</option>
            <option value="Mgl">Farm Mgl</option>
          </select>

          {/* Sex Filter */}
          <select
            value={sexFilter}
            onChange={(e) => setSexFilter(e.target.value)}
            className="bg-[#F5F5F0] border border-slate-300 rounded-xl px-3 py-1.5 font-bold text-slate-800"
          >
            <option value="">Semua Sex (Jantan/Betina)</option>
            <option value="Betina">Betina</option>
            <option value="Jantan">Jantan</option>
          </select>

          {/* Recommendation Filter */}
          <select
            value={recFilter}
            onChange={(e) => setRecFilter(e.target.value)}
            className="bg-[#F5F5F0] border border-slate-300 rounded-xl px-3 py-1.5 font-bold text-slate-800"
          >
            <option value="">Semua Rekomendasi</option>
            <option value="Distribusi">Distribusi</option>
            <option value="Afkir">Afkir</option>
            <option value="Produktif">Produktif</option>
          </select>
        </div>

        {/* Sorting Control */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-slate-500 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-purple-700" /> Urutkan Umur:
          </span>
          <button
            onClick={() => setSortByAge(sortByAge === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-1.5 bg-[#F5F5F0] hover:bg-slate-200 border border-slate-300 rounded-xl font-bold text-[#1E3F20] transition-colors"
          >
            {sortByAge === 'asc' ? 'Termuda → Tertua (Asc)' : 'Tertua → Termuda (Desc)'}
          </button>
        </div>
      </div>

      {/* Main Excel-Format Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900">
            Tabel Data Ternak Sapi Perah (Distribusi & Afkir)
          </h3>
          <span className="text-xs text-slate-500 font-bold">Total: {animals.length} Data Sapi</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 border-collapse">
            <thead className="bg-[#1E3F20] text-white uppercase text-[11px] tracking-wider border-b border-[#2b592e] font-bold">
              <tr>
                <th className="px-4 py-3.5 text-center w-12">No</th>
                <th className="px-4 py-3.5">Farm</th>
                <th className="px-4 py-3.5">No. Sapi</th>
                <th className="px-4 py-3.5">Tanggal Lahir</th>
                <th className="px-4 py-3.5">Sex</th>
                <th className="px-4 py-3.5">Umur (Th, Bln, Hr)</th>
                <th className="px-4 py-3.5">Keterangan / Rekomendasi</th>
                <th className="px-4 py-3.5 text-center">Sumber & Manual Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {animals.length > 0 ? (
                animals.map((a, index) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    {/* No */}
                    <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-500">{index + 1}</td>
                    
                    {/* Farm */}
                    <td className="px-4 py-3.5 font-bold text-slate-900">{a.farm}</td>

                    {/* No Sapi */}
                    <td className="px-4 py-3.5 font-mono font-bold text-[#1E3F20] text-base">{a.code}</td>

                    {/* Tanggal Lahir */}
                    <td className="px-4 py-3.5 font-mono text-xs font-semibold text-slate-700">
                      {a.birthDate ? new Date(a.birthDate).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                    </td>

                    {/* Sex */}
                    <td className="px-4 py-3.5 font-semibold text-slate-800">{a.gender}</td>

                    {/* Umur (Th, Bln, Hr) */}
                    <td className="px-4 py-3.5 font-mono font-bold text-emerald-900 text-sm">
                      {a.ageFormatted}
                    </td>

                    {/* Keterangan / Rekomendasi */}
                    <td className="px-4 py-3.5">
                      <span className={`px-3 py-1 rounded-xl text-xs font-extrabold uppercase font-mono shadow-sm ${
                        a.recommendation === 'Distribusi' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                        a.recommendation === 'Afkir' ? 'bg-rose-100 text-rose-900 border border-rose-300' :
                        'bg-slate-100 text-slate-800 border border-slate-300'
                      }`}>
                        {a.recommendation}
                      </span>
                    </td>

                    {/* Sumber & Override button */}
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                          a.isManualOverride ? 'bg-purple-50 text-purple-700 border-purple-300' : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {a.sourceLabel}
                        </span>

                        <button
                          onClick={() => {
                            setSelectedAnimal(a);
                            setIsOverride(a.isManualOverride);
                            setOverrideValue(a.manualRecommendation || a.recommendation);
                            setShowOverrideModal(true);
                          }}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-300"
                          title="Override Manual Rekomendasi"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-500 font-semibold">
                    Tidak ada data sapi yang sesuai dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Settings Batas Umur */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#1E3F20]" />
              Pengaturan Batas Umur Otomatis
            </h3>
            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1 text-slate-700">
                  Batas Umur Distribusi / Bibit (Tahun)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={batasDistribusiInput}
                  onChange={(e) => setBatasDistribusiInput(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-3 font-mono font-bold text-sm text-slate-900"
                />
                <p className="text-[11px] text-slate-500 mt-1">Sapi dengan umur ≤ nilai ini direkomendasikan "Distribusi".</p>
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-700">
                  Batas Umur Afkir (Tahun)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={batasAfkirInput}
                  onChange={(e) => setBatasAfkirInput(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-3 font-mono font-bold text-sm text-slate-900"
                />
                <p className="text-[11px] text-slate-500 mt-1">Sapi dengan umur ≥ nilai ini direkomendasikan "Afkir".</p>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1E3F20] text-white font-bold rounded-xl shadow-md"
                >
                  Simpan Pengaturan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Animal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900">Tambah Data Sapi Perah Baru</h3>
            <form onSubmit={handleAddAnimal} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Lokasi Farm / Kandang</label>
                <select
                  value={farmInput}
                  onChange={(e) => setFarmInput(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2.5 font-bold"
                >
                  <option value="Lpk">Farm Lpk</option>
                  <option value="LPK">Farm LPK</option>
                  <option value="Mgl">Farm Mgl</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">No. Sapi (Kode Teks Free-form)</label>
                <input
                  type="text"
                  required
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2.5 font-mono font-bold"
                  placeholder="e.g. 9064 / 2533 UZ / 2303-IM"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Tanggal Lahir (Format: YYYY-MM-DD)</label>
                <input
                  type="date"
                  required
                  value={birthDateInput}
                  onChange={(e) => setBirthDateInput(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2.5 font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Sex (Jenis Kelamin)</label>
                <select
                  value={sexInput}
                  onChange={(e) => setSexInput(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2.5 font-bold"
                >
                  <option value="Betina">Betina</option>
                  <option value="Jantan">Jantan</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1E3F20] text-white font-bold rounded-xl shadow-md"
                >
                  Simpan Sapi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Manual Override */}
      {showOverrideModal && selectedAnimal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900">
              Override Manual Rekomendasi (No. Sapi: {selectedAnimal.code})
            </h3>
            <form onSubmit={handleSaveOverride} className="space-y-4 text-xs">
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-200">
                <input
                  type="checkbox"
                  id="overrideCheck"
                  checked={isOverride}
                  onChange={(e) => setIsOverride(e.target.checked)}
                  className="w-4 h-4 text-purple-700 rounded"
                />
                <label htmlFor="overrideCheck" className="font-bold text-purple-900 cursor-pointer">
                  Aktifkan Override Manual (Abaikan Umur Otomatis)
                </label>
              </div>

              {isOverride && (
                <div>
                  <label className="font-bold block mb-1 text-slate-700">Pilih Rekomendasi Manual</label>
                  <select
                    value={overrideValue}
                    onChange={(e) => setOverrideValue(e.target.value)}
                    className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-3 font-bold text-slate-900"
                  >
                    <option value="Distribusi">Distribusi (Bibit)</option>
                    <option value="Afkir">Afkir (Tidak Produktif / Cidera)</option>
                    <option value="Produktif">Produktif</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-700 text-white font-bold rounded-xl shadow-md"
                >
                  Simpan Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
