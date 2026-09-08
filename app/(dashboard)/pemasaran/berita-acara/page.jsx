'use client';

import React, { useState, useEffect, useMemo } from 'react';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import EmptyState from '@/components/EmptyState';
import {
  FileText,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  Search,
  Clock,
  Printer,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Gift,
  Building2,
  Milk,
  Info
} from 'lucide-react';

export default function BeritaAcaraPage() {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [basts, setBasts] = useState([]);
  const [farmDailyList, setFarmDailyList] = useState([]);

  // 1. Commodity Tab: 'SAPI' | 'KAMBING'
  const [commodityTab, setCommodityTab] = useState('SAPI');

  // 2. Search & Sort States
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // Default descending

  // 3. Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 4. Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submittingCreate, setSubmittingCreate] = useState(false);
  const [showBastPreviewModal, setShowBastPreviewModal] = useState(false);
  const [selectedBastForPreview, setSelectedBastForPreview] = useState(null);

  // Form states for new BAST
  const [distributionDate, setDistributionDate] = useState(new Date().toISOString().slice(0, 10));
  const [distributionAnimalType, setDistributionAnimalType] = useState('SAPI');
  const [distributionItems, setDistributionItems] = useState([
    {
      id: 1,
      jenis: 'HIBAH',
      tujuan: 'Yayasan / Sosial',
      customTujuan: '',
      isCustomTujuan: false,
      volume: '',
    }
  ]);
  const [distributionNotes, setDistributionNotes] = useState('');

  // Fetch BAST and farm recap data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [bastRes, farmRes] = await Promise.all([
        api.get('/bast').catch(() => ({ data: { data: [] } })),
        api.get('/pemasaran/farm-recap?sortOrder=asc').catch(() => ({ data: { data: [], dailyList: [] } })),
      ]);

      if (bastRes.data?.success) {
        setBasts(bastRes.data.data || []);
      }
      if (farmRes.data?.success) {
        setFarmDailyList(farmRes.data.dailyList || []);
      }
    } catch (err) {
      console.error('Error loading BAST data:', err);
      setToast({ type: 'error', message: 'Gagal memuat data Berita Acara.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper to determine animal type of a BAST document
  const getBastAnimal = (bast) => {
    if (bast.sumber === 'SUSU_KAMBING' || (bast.catatan && bast.catatan.toLowerCase().includes('kambing'))) {
      return 'KAMBING';
    }
    return 'SAPI';
  };

  // Group BASTs by commodity
  const sapiBasts = useMemo(() => basts.filter((b) => getBastAnimal(b) === 'SAPI'), [basts]);
  const kambingBasts = useMemo(() => basts.filter((b) => getBastAnimal(b) === 'KAMBING'), [basts]);

  const activeCommodityBasts = useMemo(() => {
    return commodityTab === 'SAPI' ? sapiBasts : kambingBasts;
  }, [commodityTab, sapiBasts, kambingBasts]);

  // Filtered BASTs by search & commodity
  const filteredBasts = useMemo(() => {
    return activeCommodityBasts
      .filter((b) => {
        const dStr = new Date(b.tanggal).toISOString().slice(0, 10);
        const matchSearch =
          !searchTerm ||
          b.nomorBast?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.instansiPenerima?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.catatan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dStr.includes(searchTerm);

        return matchSearch;
      })
      .sort((a, b) => {
        const cmp = new Date(a.tanggal) - new Date(b.tanggal);
        return sortOrder === 'desc' ? -cmp : cmp;
      });
  }, [activeCommodityBasts, sortOrder, searchTerm]);

  // Hibah specific BAST list (since BAST official format is primarily for Hibah)
  const hibahBastList = useMemo(() => {
    return filteredBasts.filter((b) => b.jenisPermintaan === 'HIBAH');
  }, [filteredBasts]);

  // Paginated BAST rows
  const paginatedHibahBasts = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return hibahBastList.slice(startIdx, startIdx + pageSize);
  }, [hibahBastList, currentPage, pageSize]);

  const totalPages = Math.ceil(hibahBastList.length / pageSize) || 1;

  // KPI Calculations
  const totalVolumeHibah = useMemo(() => {
    return hibahBastList.reduce((acc, b) => acc + (b.volumeLiters || 0), 0);
  }, [hibahBastList]);

  // Modal Handlers
  const handleOpenCreateModal = () => {
    setDistributionDate(new Date().toISOString().slice(0, 10));
    setDistributionAnimalType(commodityTab);
    setDistributionItems([
      {
        id: 1,
        jenis: 'HIBAH',
        tujuan: 'Penerima Hibah Dinas / Sosial',
        customTujuan: '',
        isCustomTujuan: false,
        volume: '',
      }
    ]);
    setDistributionNotes('');
    setShowCreateModal(true);
  };

  const handleAddDistributionItem = () => {
    const newId = distributionItems.length > 0 ? Math.max(...distributionItems.map(i => i.id)) + 1 : 1;
    setDistributionItems(prev => [
      ...prev,
      {
        id: newId,
        jenis: 'HIBAH',
        tujuan: 'Yayasan / Lembaga',
        customTujuan: '',
        isCustomTujuan: false,
        volume: '',
      }
    ]);
  };

  const handleRemoveDistributionItem = (id) => {
    if (distributionItems.length <= 1) return;
    setDistributionItems(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateDistributionItem = (id, field, value) => {
    setDistributionItems(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        if (field === 'tujuan') {
          const isCustom = value === 'LAINNYA';
          return {
            ...item,
            tujuan: value,
            isCustomTujuan: isCustom,
          };
        }
        return { ...item, [field]: value };
      })
    );
  };

  const handleCreateBAST = async (e) => {
    e.preventDefault();

    const invalidItems = distributionItems.filter(item => !item.volume || parseFloat(item.volume) <= 0);
    if (invalidItems.length > 0) {
      setToast({ type: 'error', message: 'Pastikan seluruh baris tujuan distribusi memiliki volume susu (> 0 Liter).' });
      return;
    }

    setSubmittingCreate(true);
    try {
      let createdDoc = null;

      for (const item of distributionItems) {
        const numVol = parseFloat(item.volume) || 0;
        const finalTujuan = item.isCustomTujuan ? item.customTujuan.trim() : item.tujuan.trim();

        const res = await api.post('/bast', {
          tanggal: distributionDate,
          volumeLiters: numVol,
          animalType: distributionAnimalType,
          sumber: distributionAnimalType === 'KAMBING' ? 'SUSU_KAMBING' : 'SUSU_SAPI',
          jenisPermintaan: 'HIBAH',
          instansiPenerima: finalTujuan || 'Instansi / Yayasan Penerima',
          penerimaPetugas: finalTujuan || 'Pihak Penerima',
          tujuan: finalTujuan,
          catatan: distributionNotes ? `${distributionNotes} (Ternak: ${distributionAnimalType})` : `Susu ${distributionAnimalType}`,
        });

        if (res.data?.success && res.data?.data) {
          createdDoc = res.data.data;
        }
      }

      setToast({
        type: 'success',
        message: 'Berita Acara Serah Terima (BAST) berhasil diterbitkan!'
      });

      setShowCreateModal(false);
      await fetchData();

      if (createdDoc) {
        setSelectedBastForPreview(createdDoc);
        setShowBastPreviewModal(true);
      }
    } catch (err) {
      console.error('Error submitting BAST:', err);
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Gagal menerbitkan Berita Acara.'
      });
    } finally {
      setSubmittingCreate(false);
    }
  };

  const handleDeleteBAST = async (id, nomor) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus Berita Acara ${nomor || ''}? Tindakan ini akan mengembalikan alokasi stok susu.`)) {
      return;
    }

    try {
      const res = await api.delete(`/bast/${id}`);
      if (res.data?.success) {
        setToast({ type: 'success', message: 'Dokumen Berita Acara berhasil dihapus.' });
        fetchData();
      } else {
        setToast({ type: 'error', message: res.data?.message || 'Gagal menghapus dokumen BAST.' });
      }
    } catch (err) {
      console.error('Error deleting BAST:', err);
      setToast({ type: 'error', message: err.response?.data?.message || 'Gagal menghapus dokumen BAST.' });
    }
  };

  if (loading && basts.length === 0) {
    return <LoadingSpinner text="Memuat Dokumen Berita Acara..." />;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
            BERITA ACARA
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Dokumentasi dan arsip resmi Berita Acara Serah Terima (BAST) Susu Segar BBPTUHPT Baturraden
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Commodity Tabs (Matching Standard Clean Shape) */}
          <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/90 gap-1 print:hidden">
            <button
              type="button"
              onClick={() => {
                setCommodityTab('SAPI');
                setCurrentPage(1);
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                commodityTab === 'SAPI'
                  ? 'bg-[#14532D] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <span>Susu Sapi Segar</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCommodityTab('KAMBING');
                setCurrentPage(1);
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                commodityTab === 'KAMBING'
                  ? 'bg-[#14532D] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <span>Susu Kambing Segar</span>
            </button>
          </div>

          {/* Action Button: Input BAST */}
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 bg-[#1E3F20] hover:bg-[#16331a] text-white px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs hover:shadow-md active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-300" />
            <span>Input Berita Acara</span>
          </button>
        </div>
      </div>



      {/* Tabel Dokumen Berita Acara */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#14532D] text-white rounded-2xl shadow-xs">
              <FileCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                Arsip Dokumen Berita Acara Susu {commodityTab === 'SAPI' ? 'Sapi' : 'Kambing'} ({hibahBastList.length} Dokumen)
              </h2>
              <p className="text-xs text-slate-400">
                Daftar surat Berita Acara Serah Terima (BAST) resmi penyaluran hibah dan serah terima balai.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Box */}
            <div className="relative w-48 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nomor / penerima..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Tampilkan:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 shadow-2xs cursor-pointer"
              >
                <option value={10}>10 Baris</option>
                <option value={20}>20 Baris</option>
                <option value={50}>50 Baris</option>
              </select>
            </div>
          </div>
        </div>

        {hibahBastList.length === 0 ? (
          <div className="py-12 text-center">
            <EmptyState
              title={`Belum Ada Dokumen Berita Acara Susu ${commodityTab === 'SAPI' ? 'Sapi' : 'Kambing'}`}
              description="Belum ada dokumen Berita Acara yang diterbitkan pada periode filter ini. Klik tombol 'Input Berita Acara' di atas untuk membuat dokumen baru."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 font-extrabold uppercase text-[11px] border-y border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="py-3.5 px-3 text-center w-[1%] whitespace-nowrap">No</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Nomor BAST</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Tanggal Penyaluran</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Jenis Susu</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Penerima Hibah</th>
                  <th className="py-3.5 px-4 text-right font-black text-amber-950 bg-amber-50/60 whitespace-nowrap">Volume Hibah</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap">Status Dokumen</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap">Surat BAST</th>
                  <th className="py-3.5 px-3 text-center whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedHibahBasts.map((b, idx) => {
                  const rowNum = (currentPage - 1) * pageSize + idx + 1;
                  const animal = getBastAnimal(b);
                  const isSent = b.status === 'DIKIRIM_KE_FARM' || b.status === 'DITERIMA';

                  return (
                    <tr key={b.id || idx} className="hover:bg-slate-50/90 transition-colors">
                      <td className="py-3.5 px-3 text-center text-slate-400 font-bold w-[1%] whitespace-nowrap">{rowNum}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span className="font-mono">{b.nomorBast}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-800">
                        {new Date(b.tanggal).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-800">
                        {animal === 'SAPI' ? 'Susu Sapi' : 'Susu Kambing'}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-900">
                        <span className="inline-flex items-center gap-1.5">
                          <span>🎁</span>
                          <span>{b.instansiPenerima || 'Yayasan / Instansi Penerima'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-amber-950 bg-amber-50/30 whitespace-nowrap font-mono text-sm">
                        {b.volumeLiters?.toLocaleString('id-ID')} <span className="text-xs font-normal text-amber-700">Liter</span>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {b.status === 'DITERIMA' || isSent ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Selesai</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            <span>Menunggu</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBastForPreview(b);
                            setShowBastPreviewModal(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-2xs hover:shadow-sm cursor-pointer"
                          title="Lihat & Cetak Surat BAST Resmi"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Lihat BAST</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleDeleteBAST(b.id, b.nomorBast)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus Berita Acara"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-100 text-slate-900 font-extrabold border-t-2 border-slate-300">
                <tr>
                  <td colSpan={5} className="py-3.5 px-4 text-center text-xs uppercase tracking-wider">
                    TOTAL BERITA ACARA SUSU {commodityTab === 'SAPI' ? 'SAPI' : 'KAMBING'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-amber-950 font-mono text-sm bg-amber-100/70 whitespace-nowrap">
                    {totalVolumeHibah.toLocaleString('id-ID')} Liter
                  </td>
                  <td className="py-3.5 px-4 text-center text-xs font-semibold text-emerald-800">
                    Resmi BAST
                  </td>
                  <td colSpan={2} className="py-3.5 px-4 text-center text-xs text-slate-400">
                    -
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">
              Menampilkan {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, hibahBastList.length)} dari {hibahBastList.length} dokumen BAST
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-bold rounded-lg">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: INPUT BERITA ACARA BARU                                          */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-800">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Input Berita Acara Serah Terima (BAST)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Penerbitan surat resmi serah terima / hibah susu segar
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBAST} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Tanggal BAST */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Penyaluran
                  </label>
                  <input
                    type="date"
                    value={distributionDate}
                    onChange={(e) => setDistributionDate(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* Jenis Ternak */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Komoditas Ternak
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDistributionAnimalType('SAPI')}
                      className={`flex items-center justify-center p-2.5 rounded-xl border text-xs font-black transition-all ${
                        distributionAnimalType === 'SAPI'
                          ? 'bg-[#14532D] text-white shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Susu Sapi
                    </button>
                    <button
                      type="button"
                      onClick={() => setDistributionAnimalType('KAMBING')}
                      className={`flex items-center justify-center p-2.5 rounded-xl border text-xs font-black transition-all ${
                        distributionAnimalType === 'KAMBING'
                          ? 'bg-[#14532D] text-white shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Susu Kambing
                    </button>
                  </div>
                </div>
              </div>

              {/* Daftar Rincian BAST */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pt-1">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Daftar Penyaluran / Penerima:
                  </label>
                  <button
                    type="button"
                    onClick={handleAddDistributionItem}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-black transition-all active:scale-95 shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Tambah Penerima</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-[42vh] overflow-y-auto pr-1">
                  {distributionItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                        <span className="text-xs font-black text-slate-800">
                          Penerima #{idx + 1}
                        </span>
                        {distributionItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveDistributionItem(item.id)}
                            className="text-rose-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                            title="Hapus baris"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Instansi / Lembaga Penerima */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Instansi / Lembaga Penerima
                          </label>
                          <input
                            type="text"
                            placeholder="Contoh: Yayasan Yatim, Tamu Dinas..."
                            value={item.isCustomTujuan ? item.customTujuan : item.tujuan}
                            onChange={(e) => handleUpdateDistributionItem(item.id, 'tujuan', e.target.value)}
                            required
                            className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600"
                          />
                        </div>

                        {/* Volume Liter */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Volume Susu (Liter)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            placeholder="Volume (L)"
                            value={item.volume}
                            onChange={(e) => handleUpdateDistributionItem(item.id, 'volume', e.target.value)}
                            required
                            className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Catatan BAST */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Keterangan / Keperluan
                </label>
                <textarea
                  value={distributionNotes}
                  onChange={(e) => setDistributionNotes(e.target.value)}
                  placeholder="Keterangan acara, nomor surat permohonan, atau catatan lainnya..."
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={submittingCreate}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#14532D] hover:bg-[#0f3e22] text-white rounded-xl text-xs font-black transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {submittingCreate ? (
                    <span>Menerbitkan...</span>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4 text-emerald-300" />
                      <span>Terbitkan & Cetak BAST</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: PREVIEW SURAT BAST RESMI FORMAT CETAK BBPTUHPT                   */}
      {/* ========================================================================= */}
      {showBastPreviewModal && selectedBastForPreview && (() => {
        const previewAnimal = getBastAnimal(selectedBastForPreview);
        const bastDateObj = selectedBastForPreview.tanggal ? new Date(selectedBastForPreview.tanggal) : new Date();
        const bastDateStr = bastDateObj.toISOString().slice(0, 10);
        const formattedDate = bastDateObj.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });

        const matchingDaily = farmDailyList.find(
          (d) =>
            d.tanggal === bastDateStr &&
            (d.jenisTernak || 'SAPI').toUpperCase() === previewAnimal
        );

        const volNum = parseFloat(selectedBastForPreview.volumeLiters || 0);
        const grossNum = matchingDaily?.totalGross || (volNum > 0 ? volNum * 1.05 : 0);
        const pedetNum = matchingDaily?.totalPedet || 0;
        const afkirNum = matchingDaily?.totalAfkir || 0;
        const diserahNum = volNum;

        const isDisetujui = selectedBastForPreview.status === 'DITERIMA';
        const namaPenerima = selectedBastForPreview.instansiPenerima || selectedBastForPreview.tujuan || 'SEKSI PEMASARAN';

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
            <style jsx global>{`
              @media print {
                body * {
                  visibility: hidden !important;
                }
                #bast-official-print-area,
                #bast-official-print-area * {
                  visibility: visible !important;
                }
                #bast-official-print-area {
                  position: fixed !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  margin: 0 !important;
                  padding: 24px !important;
                  border: none !important;
                  box-shadow: none !important;
                  background: white !important;
                  z-index: 999999 !important;
                }
                .no-print {
                  display: none !important;
                }
              }
            `}</style>

            <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-6 animate-in fade-in zoom-in-95 duration-150">
              {/* Modal Header Bar */}
              <div className="no-print p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm sm:text-base font-black tracking-tight">
                    Preview Berita Acara Resmi
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-black ${
                    isDisetujui
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {isDisetujui ? 'Disetujui' : 'Menunggu Konfirmasi'}
                  </span>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#14532D] hover:bg-[#0f3e22] text-white rounded-xl text-xs font-black transition-all shadow-sm active:scale-95 border border-emerald-600/40 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Cetak / Download PDF</span>
                  </button>

                  <button
                    onClick={() => setShowBastPreviewModal(false)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Official Paper Document Area */}
              <div className="p-6 sm:p-10 bg-slate-100 overflow-y-auto max-h-[78vh]">
                <div
                  id="bast-official-print-area"
                  className="bg-white p-8 sm:p-12 border border-slate-300 shadow-md max-w-3xl mx-auto rounded-xl text-slate-950 font-serif space-y-6"
                >
                  {/* 1. KOP SURAT */}
                  <div className="text-center space-y-0.5">
                    <h2 className="text-sm sm:text-base font-black tracking-wide uppercase leading-tight font-serif">
                      BALAI BESAR PEMBIBITAN TERNAK UNGGUL DAN HIJAUAN PAKAN TERNAK BATURRADEN
                    </h2>
                    <h3 className="text-xs sm:text-sm font-black tracking-wider uppercase font-serif">
                      (BBPTUHPT BATURRADEN)
                    </h3>
                  </div>

                  {/* Garis Pembatas Tebal */}
                  <div className="border-b-2 border-black w-full" />

                  {/* 2. JUDUL DOKUMEN */}
                  <div className="text-center space-y-1 pt-1">
                    <h3 className="text-sm sm:text-base font-black uppercase tracking-wider underline underline-offset-4 font-serif">
                      BERITA ACARA SERAH TERIMA
                    </h3>
                    <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wide font-serif">
                      SUSU LAYAK KONSUMSI
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-700 italic font-serif">
                      Dari Seksi Pelayanan Teknik ke Seksi Pemasaran
                    </p>
                    <p className="text-xs font-bold font-mono text-slate-900 pt-1">
                      Nomor: {selectedBastForPreview.nomorBast || 'BA-MG-20260901-008'}
                    </p>
                  </div>

                  {/* 3. METADATA BARIS */}
                  <div className="text-xs font-serif font-bold text-slate-900 space-y-1.5 pt-2 uppercase">
                    <div className="flex">
                      <span className="w-28 sm:w-32">PAGI/SORE</span>
                      <span className="mr-2">:</span>
                      <span>
                        {selectedBastForPreview.sesi || 'PAGI'} / {previewAnimal === 'KAMBING' ? 'SUSU KAMBING' : 'SUSU SAPI'}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-28 sm:w-32">TANGGAL</span>
                      <span className="mr-2">:</span>
                      <span>{formattedDate}</span>
                    </div>
                  </div>

                  {/* 4. TABEL 5 KOLOM KOTAK BORDER HITAM */}
                  <div className="overflow-x-auto pt-2">
                    <table className="w-full text-center border-2 border-black text-xs font-serif border-collapse">
                      <thead>
                        <tr className="border-b-2 border-black bg-slate-50 font-bold">
                          <th className="p-3 border-r-2 border-black w-1/5">
                            Total Produksi<br />
                            <span className="text-[10px] font-normal">( Lt )</span>
                          </th>
                          <th className="p-3 border-r-2 border-black w-1/5">
                            Penggunaan {previewAnimal === 'KAMBING' ? 'Cempe' : 'Pedet'}<br />
                            <span className="text-[10px] font-normal">( Lt )</span>
                          </th>
                          <th className="p-3 border-r-2 border-black w-1/5">
                            Afkir<br />
                            <span className="text-[10px] font-normal">( Lt )</span>
                          </th>
                          <th className="p-3 border-r-2 border-black w-1/5">
                            Lain-lain<br />
                            <span className="text-[10px] font-normal">( Lt )</span>
                          </th>
                          <th className="p-3 w-1/5 font-black">
                            Diserahterimakan<br />
                            <span className="text-[10px] font-normal">( Lt )</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="font-bold text-sm sm:text-base h-24">
                          <td className="p-3 border-r-2 border-black align-middle font-mono font-bold">
                            {grossNum > 0
                              ? grossNum.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
                              : '-'}
                          </td>
                          <td className="p-3 border-r-2 border-black align-middle font-mono">
                            {pedetNum > 0
                              ? pedetNum.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
                              : '-'}
                          </td>
                          <td className="p-3 border-r-2 border-black align-middle font-mono">
                            {afkirNum > 0
                              ? afkirNum.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
                              : '-'}
                          </td>
                          <td className="p-3 border-r-2 border-black align-middle font-mono">
                            {selectedBastForPreview.lainLain || ''}
                          </td>
                          <td className="p-3 align-middle font-mono font-black text-base sm:text-lg bg-slate-50/50">
                            {diserahNum.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 5. TANDA TANGAN DUA PIHAK */}
                  <div className="grid grid-cols-2 gap-8 text-center text-xs font-serif pt-8 pb-4">
                    <div>
                      <p className="font-medium text-slate-800">Yang menerima,</p>
                      <p className="font-bold uppercase tracking-wide text-slate-950 mt-0.5">
                        {namaPenerima}
                      </p>
                      <div className="h-20 sm:h-24 flex items-center justify-center">
                        <span className="text-[10px] text-slate-300 italic no-print">( Tanda Tangan & Cap )</span>
                      </div>
                      <p className="font-bold border-t border-slate-400 pt-1 inline-block min-w-[160px]">
                        ( {selectedBastForPreview.penerimaPetugas || namaPenerima} )
                      </p>
                    </div>

                    <div>
                      <p className="font-medium text-slate-800">Yang menyerahkan,</p>
                      <p className="font-bold uppercase tracking-wide text-slate-950 mt-0.5">
                        SEKSI PEMASARAN
                      </p>
                      <div className="h-20 sm:h-24 flex items-center justify-center">
                        <span className="text-[10px] text-slate-300 italic no-print">( Tanda Tangan & Cap )</span>
                      </div>
                      <p className="font-bold border-t border-slate-400 pt-1 inline-block min-w-[160px]">
                        ( Petugas Pemasaran )
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer Bar */}
              <div className="no-print p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <span className="text-slate-500 font-medium">
                  Nomor Dokumen: <span className="font-mono font-bold text-slate-800">{selectedBastForPreview.nomorBast || 'BA-MG-20260901-008'}</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBastPreviewModal(false)}
                    className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-2xl transition-colors cursor-pointer"
                  >
                    Tutup Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#14532D] hover:bg-[#0f3e22] text-white rounded-2xl font-black shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-emerald-300" />
                    <span>Cetak / Download PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
