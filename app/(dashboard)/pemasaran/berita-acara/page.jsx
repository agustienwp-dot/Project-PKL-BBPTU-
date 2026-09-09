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
  Pencil,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Gift,
  Building2,
  Milk,
  Info,
  Archive,
  Calendar,
  Check
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

  // 3. Table View Tab: 'ACTIVE' (Maks. 30 baris) | 'ARCHIVE' (Dokumen ke-31 dst.)
  const [tableTab, setTableTab] = useState('ACTIVE');
  const [archiveMonthFilter, setArchiveMonthFilter] = useState('ALL'); // 'ALL' | 'YYYY-MM'
  const [showArchiveDropdown, setShowArchiveDropdown] = useState(false);
  const archiveDropdownRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (archiveDropdownRef.current && !archiveDropdownRef.current.contains(event.target)) {
        setShowArchiveDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 4. Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submittingCreate, setSubmittingCreate] = useState(false);
  const [showBastPreviewModal, setShowBastPreviewModal] = useState(false);
  const [selectedBastForPreview, setSelectedBastForPreview] = useState(null);

  // 5. Edit Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBast, setEditingBast] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editAnimalType, setEditAnimalType] = useState('SAPI');
  const [editInstansiPenerima, setEditInstansiPenerima] = useState('');
  const [editVolume, setEditVolume] = useState('');
  const [editCatatan, setEditCatatan] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);

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

  // Batas maksimal baris dalam daftar aktif sebelum dialihkan ke arsip
  const MAX_ACTIVE_ROWS = 30;

  // Hibah specific BAST list (since BAST official format is primarily for Hibah)
  const hibahBastList = useMemo(() => {
    return filteredBasts.filter((b) => b.jenisPermintaan === 'HIBAH');
  }, [filteredBasts]);

  // Pemisahan daftar aktif (maksimal 30 baris) dan arsip
  const activeHibahBasts = useMemo(() => {
    return hibahBastList.slice(0, MAX_ACTIVE_ROWS);
  }, [hibahBastList]);

  const archivedHibahBasts = useMemo(() => {
    return hibahBastList.slice(MAX_ACTIVE_ROWS);
  }, [hibahBastList]);

  // Struktur periode arsip yang dikelompokkan per tahun & bulan
  // Ketika 1 tahun selesai, sistem otomatis menyusun dan mengurutkan tahun berikutnya
  const archivePeriodsData = useMemo(() => {
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const monthCounts = {};
    const yearCounts = {};
    const currentYear = new Date().getFullYear();
    const yearsSet = new Set([currentYear]);

    archivedHibahBasts.forEach((b) => {
      if (b.tanggal) {
        const d = new Date(b.tanggal);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const ym = `${y}-${m}`;
        monthCounts[ym] = (monthCounts[ym] || 0) + 1;
        yearCounts[y] = (yearCounts[y] || 0) + 1;
        yearsSet.add(y);
      }
    });

    // Urutkan tahun (tahun terbaru di atas: 2027, 2026, dst.)
    const sortedYears = Array.from(yearsSet).sort((a, b) => b - a);

    const yearGroups = sortedYears.map((y) => {
      const months = [];
      const now = new Date();
      for (let m = 12; m >= 1; m--) {
        const ym = `${y}-${String(m).padStart(2, '0')}`;
        const cnt = monthCounts[ym] || 0;
        const isFuture = y === now.getFullYear() && m > (now.getMonth() + 1);
        if (!isFuture || cnt > 0) {
          months.push({
            value: ym,
            label: `${monthNames[m - 1]} ${y}`,
            monthName: monthNames[m - 1],
            monthNum: m,
            year: y,
            count: cnt,
          });
        }
      }
      return {
        year: y,
        yearValue: `YEAR:${y}`,
        yearLabel: `Tahun ${y}`,
        count: yearCounts[y] || 0,
        months,
      };
    });

    return {
      yearGroups,
      totalArchived: archivedHibahBasts.length,
    };
  }, [archivedHibahBasts]);

  // Helper label filter arsip
  const getArchiveFilterLabel = () => {
    if (archiveMonthFilter === 'ALL') return 'Semua Periode Arsip';
    if (archiveMonthFilter.startsWith('YEAR:')) {
      return `Tahun ${archiveMonthFilter.replace('YEAR:', '')}`;
    }
    for (const yg of archivePeriodsData.yearGroups) {
      const found = yg.months.find((m) => m.value === archiveMonthFilter);
      if (found) return found.label;
    }
    return archiveMonthFilter;
  };

  // Filter arsip: per tahun atau per bulan terpilih.
  // Diurutkan kronologis per tahun agar ketika 1 tahun selesai otomatis lanjut urut tahun berikutnya dari 001
  const filteredArchivedHibahBasts = useMemo(() => {
    let list = archivedHibahBasts;
    if (archiveMonthFilter.startsWith('YEAR:')) {
      const targetYear = parseInt(archiveMonthFilter.replace('YEAR:', ''), 10);
      list = archivedHibahBasts.filter((b) => {
        if (!b.tanggal) return false;
        return new Date(b.tanggal).getFullYear() === targetYear;
      });
    } else if (archiveMonthFilter !== 'ALL') {
      list = archivedHibahBasts.filter((b) => {
        if (!b.tanggal) return false;
        const d = new Date(b.tanggal);
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return ym === archiveMonthFilter;
      });
    }

    // Urutan arsip: urut kronologis (tahun & tanggal awal -> akhir tahun),
    // sehingga ketika 1 tahun selesai otomatis lanjut urut tahun berikutnya dari 001
    return [...list].sort((a, b) => {
      const dateA = new Date(a.tanggal || 0).getTime();
      const dateB = new Date(b.tanggal || 0).getTime();
      if (dateA !== dateB) return dateA - dateB;
      return (a.nomorBast || '').localeCompare(b.nomorBast || '');
    });
  }, [archivedHibahBasts, archiveMonthFilter]);

  const displayedBasts = useMemo(() => {
    return tableTab === 'ACTIVE' ? activeHibahBasts : filteredArchivedHibahBasts;
  }, [tableTab, activeHibahBasts, filteredArchivedHibahBasts]);

  // KPI Calculations (Total volume dokumen yang sedang ditampilkan)
  const displayedTotalVolume = useMemo(() => {
    return displayedBasts.reduce((acc, b) => acc + (b.volumeLiters || 0), 0);
  }, [displayedBasts]);

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

  const handleOpenEditModal = (bast) => {
    setEditingBast(bast);
    const dateStr = bast.tanggal ? new Date(bast.tanggal).toISOString().slice(0, 10) : '';
    setEditDate(dateStr);
    setEditAnimalType(getBastAnimal(bast));
    setEditInstansiPenerima(bast.instansiPenerima || '');
    setEditVolume(bast.volumeLiters != null ? String(bast.volumeLiters) : '');
    setEditCatatan(bast.catatan || '');
    setShowEditModal(true);
  };

  const handleUpdateBAST = async (e) => {
    e.preventDefault();
    if (!editingBast) return;

    const numVol = parseFloat(editVolume);
    if (isNaN(numVol) || numVol <= 0) {
      setToast({ type: 'error', message: 'Volume susu (Liter) wajib bernilai lebih dari 0.' });
      return;
    }

    setSubmittingEdit(true);
    try {
      const res = await api.patch(`/bast/${editingBast.id}`, {
        tanggal: editDate,
        volumeLiters: numVol,
        instansiPenerima: editInstansiPenerima.trim() || 'Instansi / Yayasan Penerima',
        penerimaNama: editInstansiPenerima.trim() || 'Pihak Penerima',
        sumber: editAnimalType === 'KAMBING' ? 'SUSU_KAMBING' : 'SUSU_SAPI',
        catatan: editCatatan.trim(),
      });

      if (res.data?.success) {
        setToast({ type: 'success', message: 'Dokumen Berita Acara berhasil diperbarui!' });
        setShowEditModal(false);
        setEditingBast(null);
        await fetchData();
      } else {
        setToast({ type: 'error', message: res.data?.message || 'Gagal memperbarui Berita Acara.' });
      }
    } catch (err) {
      console.error('Error updating BAST:', err);
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Gagal memperbarui Berita Acara.'
      });
    } finally {
      setSubmittingEdit(false);
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

        <div className="flex items-center gap-3">
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
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-base font-black text-slate-900">
              {tableTab === 'ARCHIVE' ? 'Arsip Dokumen BAST yang Terbit' : 'Daftar Dokumen BAST yang Terbit'}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Box (Sebelah Kiri) */}
            <div className="relative w-48 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nomor / penerima..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
              />
            </div>

            {/* Commodity Dropdown (Styled Custom Pill) */}
            <div className="relative flex items-center bg-slate-50 hover:bg-white border border-slate-300 hover:border-slate-400 rounded-xl px-3 py-1.5 shadow-2xs transition-all focus-within:ring-2 focus-within:ring-emerald-600/30 focus-within:border-emerald-600 print:hidden">
              <select
                value={commodityTab}
                onChange={(e) => setCommodityTab(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer appearance-none pr-5"
              >
                <option value="SAPI">Susu Sapi Segar</option>
                <option value="KAMBING">Susu Kambing Segar</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2.5 top-2.5" />
            </div>

            {/* Tombol Arsip BAST dengan Dropdown Filter Periode (Tahun & Bulan) */}
            <div className="relative" ref={archiveDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setTableTab('ARCHIVE');
                  setShowArchiveDropdown((prev) => !prev);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
                  tableTab === 'ARCHIVE'
                    ? 'bg-[#1E3F20] text-white border-[#1E3F20]'
                    : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-white'
                }`}
              >
                <span>
                  {tableTab === 'ARCHIVE' && archiveMonthFilter !== 'ALL'
                    ? `Arsip: ${getArchiveFilterLabel()}`
                    : `Arsip BAST (${archivedHibahBasts.length})`}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showArchiveDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu Filter Per Periode (Tahun & Bulan) */}
              {showArchiveDropdown && (
                <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3.5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                    <span>Pilih Periode Arsip</span>
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  </div>

                  <div className="max-h-72 overflow-y-auto p-1.5 space-y-1">
                    {/* Semua Periode */}
                    <button
                      type="button"
                      onClick={() => {
                        setTableTab('ARCHIVE');
                        setArchiveMonthFilter('ALL');
                        setShowArchiveDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        archiveMonthFilter === 'ALL'
                          ? 'bg-emerald-50 text-emerald-950 font-black'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {archiveMonthFilter === 'ALL' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        ) : (
                          <span className="w-3.5" />
                        )}
                        <span>Semua Periode Arsip</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono font-bold">
                        {archivedHibahBasts.length}
                      </span>
                    </button>

                    {/* Grouping Per Tahun */}
                    {archivePeriodsData.yearGroups.map((yg) => {
                      const isYearSelected = archiveMonthFilter === yg.yearValue;
                      return (
                        <div key={yg.year} className="pt-1 border-t border-slate-100 first:border-0 first:pt-0">
                          {/* Tombol Pilih Seluruh Tahun */}
                          <button
                            type="button"
                            onClick={() => {
                              setTableTab('ARCHIVE');
                              setArchiveMonthFilter(yg.yearValue);
                              setShowArchiveDropdown(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                              isYearSelected
                                ? 'bg-emerald-100 text-emerald-950'
                                : 'text-slate-800 hover:bg-slate-100'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {isYearSelected ? (
                                <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                              ) : (
                                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              )}
                              <span>📅 Arsip {yg.yearLabel}</span>
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                              yg.count > 0 ? 'bg-amber-100 text-amber-900 font-bold' : 'bg-slate-100 text-slate-400'
                            }`}>
                              {yg.count}
                            </span>
                          </button>

                          {/* List Bulan di bawah Tahun */}
                          <div className="pl-4 pr-1 py-0.5 space-y-0.5">
                            {yg.months.map((m) => {
                              const isMonthSelected = archiveMonthFilter === m.value;
                              return (
                                <button
                                  key={m.value}
                                  type="button"
                                  onClick={() => {
                                    setTableTab('ARCHIVE');
                                    setArchiveMonthFilter(m.value);
                                    setShowArchiveDropdown(false);
                                  }}
                                  className={`w-full flex items-center justify-between px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                    isMonthSelected
                                      ? 'bg-emerald-50 text-emerald-950 font-bold'
                                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                  }`}
                                >
                                  <span className="flex items-center gap-2">
                                    {isMonthSelected ? (
                                      <Check className="w-3 h-3 text-emerald-700 shrink-0" />
                                    ) : (
                                      <span className="w-3" />
                                    )}
                                    <span>{m.monthName}</span>
                                  </span>
                                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                                    m.count > 0 ? 'bg-amber-50 text-amber-800 font-semibold' : 'text-slate-300'
                                  }`}>
                                    {m.count}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bar info ketika di mode Arsip BAST */}
        {tableTab === 'ARCHIVE' && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <div className="flex items-center gap-2 flex-wrap">
              <Archive className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-semibold">
                {archiveMonthFilter === 'ALL' && (
                  <>Menampilkan seluruh dokumen arsip ({filteredArchivedHibahBasts.length} dokumen). Dokumen berurutan otomatis per tahun.</>
                )}
                {archiveMonthFilter.startsWith('YEAR:') && (
                  <>Menampilkan seluruh arsip <strong className="text-slate-900">Tahun {archiveMonthFilter.replace('YEAR:', '')}</strong> ({filteredArchivedHibahBasts.length} dokumen). Urutan nomor berulang dari 001 setiap awal tahun.</>
                )}
                {!archiveMonthFilter.startsWith('YEAR:') && archiveMonthFilter !== 'ALL' && (
                  <>Menampilkan arsip periode <strong className="text-slate-900">{getArchiveFilterLabel()}</strong> ({filteredArchivedHibahBasts.length} dokumen).</>
                )}
              </span>
              {archiveMonthFilter !== 'ALL' && (
                <button
                  onClick={() => setArchiveMonthFilter('ALL')}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold hover:bg-rose-100 transition-colors cursor-pointer ml-1"
                >
                  <X className="w-3 h-3" />
                  <span>Semua Arsip</span>
                </button>
              )}
            </div>
            <button
              onClick={() => setTableTab('ACTIVE')}
              className="font-bold underline text-emerald-800 hover:text-emerald-950 cursor-pointer ml-auto shrink-0"
            >
              &larr; Kembali ke Daftar Utama
            </button>
          </div>
        )}

        {displayedBasts.length === 0 ? (
          <div className="py-12 text-center">
            <EmptyState
              title={
                tableTab === 'ARCHIVE'
                  ? (archiveMonthFilter !== 'ALL' ? 'Tidak Ada Arsip di Periode Ini' : 'Arsip BAST Masih Kosong')
                  : `Belum Ada Dokumen Berita Acara Susu ${commodityTab === 'SAPI' ? 'Sapi' : 'Kambing'}`
              }
              description={
                tableTab === 'ARCHIVE'
                  ? (archiveMonthFilter !== 'ALL'
                      ? `Tidak ada dokumen arsip pada periode ${getArchiveFilterLabel()}. Silakan pilih periode lain atau "Semua Periode Arsip".`
                      : 'Daftar aktif menampung hingga 30 dokumen terbaru. Dokumen ke-31 dan seterusnya akan otomatis masuk ke dalam arsip ini.')
                  : "Belum ada dokumen Berita Acara yang diterbitkan pada periode filter ini. Klik tombol 'Input Berita Acara' di atas untuk membuat dokumen baru."
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[580px] overflow-y-auto rounded-2xl border border-slate-200 shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#1E3F20] text-white font-extrabold uppercase text-[11px] sticky top-0 z-10 shadow-2xs select-none" style={{ backgroundColor: '#1E3F20' }}>
                <tr style={{ backgroundColor: '#1E3F20' }}>
                  <th className="py-3.5 px-3 text-center w-[1%] whitespace-nowrap text-white font-bold" style={{ backgroundColor: '#1E3F20' }}>No</th>
                  <th className="py-3.5 px-4 whitespace-nowrap text-white font-bold" style={{ backgroundColor: '#1E3F20' }}>Nomor BAST</th>
                  <th className="py-3.5 px-4 whitespace-nowrap text-white font-bold" style={{ backgroundColor: '#1E3F20' }}>Tanggal Penyaluran</th>
                  <th className="py-3.5 px-4 whitespace-nowrap text-white font-bold" style={{ backgroundColor: '#1E3F20' }}>Jenis Susu</th>
                  <th className="py-3.5 px-4 whitespace-nowrap text-white font-bold" style={{ backgroundColor: '#1E3F20' }}>Penerima Hibah</th>
                  <th className="py-3.5 px-4 text-right font-black text-white whitespace-nowrap" style={{ backgroundColor: '#1E3F20' }}>Volume Hibah</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap text-white font-bold" style={{ backgroundColor: '#1E3F20' }}>Status Dokumen</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap text-white font-bold" style={{ backgroundColor: '#1E3F20' }}>Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {displayedBasts.map((b, idx) => {
                  const rowNum = idx + 1;
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
                        <span>{b.instansiPenerima || 'Yayasan / Instansi Penerima'}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900 whitespace-nowrap font-mono text-sm">
                        {b.volumeLiters?.toLocaleString('id-ID')} Liter
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {b.status === 'DITERIMA' || isSent ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Selesai</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900">
                            <Clock className="w-4 h-4 text-amber-500" />
                            <span>Menunggu</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBastForPreview(b);
                              setShowBastPreviewModal(true);
                            }}
                            className="p-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 hover:border-emerald-300 transition-colors shadow-2xs cursor-pointer"
                            title="Cetak / Pratinjau Surat BAST"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(b)}
                            className="p-1.5 rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 hover:border-amber-300 transition-colors shadow-2xs cursor-pointer"
                            title="Edit Berita Acara"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBAST(b.id, b.nomorBast)}
                            className="p-1.5 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 hover:border-rose-300 transition-colors shadow-2xs cursor-pointer"
                            title="Hapus Berita Acara"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-100 text-slate-900 font-extrabold border-t-2 border-slate-300 sticky bottom-0 z-10 shadow-2xs">
                <tr>
                  <td colSpan={5} className="py-3.5 px-4 text-left text-xs uppercase tracking-wider bg-slate-100">
                    TOTAL BERITA ACARA SUSU {commodityTab === 'SAPI' ? 'SAPI' : 'KAMBING'}{' '}
                    {tableTab === 'ARCHIVE'
                      ? `(ARSIP${archiveMonthFilter !== 'ALL' ? ` - ${getArchiveFilterLabel()}` : ''})`
                      : ''}
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-slate-900 font-mono text-sm whitespace-nowrap bg-slate-100">
                    {displayedTotalVolume.toLocaleString('id-ID')} Liter
                  </td>
                  <td colSpan={2} className="py-3.5 px-4 text-center text-xs text-slate-400 bg-slate-100">
                    -
                  </td>
                </tr>
              </tfoot>
            </table>
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
      {/* MODAL 2: EDIT BERITA ACARA                                                */}
      {/* ========================================================================= */}
      {showEditModal && editingBast && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 rounded-xl text-amber-800">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Edit Berita Acara Serah Terima (BAST)
                  </h3>
                  <p className="text-xs font-mono text-slate-500">
                    {editingBast.nomorBast}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingBast(null);
                }}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateBAST} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Tanggal Penyaluran */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Penyaluran
                  </label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* Jenis Komoditas Ternak */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Komoditas Ternak
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditAnimalType('SAPI')}
                      className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                        editAnimalType === 'SAPI'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-800 ring-1 ring-emerald-600'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Sapi
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditAnimalType('KAMBING')}
                      className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                        editAnimalType === 'KAMBING'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-800 ring-1 ring-emerald-600'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Kambing
                    </button>
                  </div>
                </div>
              </div>

              {/* Penerima Hibah */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Instansi / Yayasan Penerima
                </label>
                <input
                  type="text"
                  value={editInstansiPenerima}
                  onChange={(e) => setEditInstansiPenerima(e.target.value)}
                  placeholder="Contoh: Posyandu Melati / Panti Asuhan Al-Hikmah"
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Volume Susu (Liter) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Volume Susu (Liter)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    min="0.1"
                    value={editVolume}
                    onChange={(e) => setEditVolume(e.target.value)}
                    placeholder="Contoh: 120"
                    required
                    className="w-full p-2.5 pr-14 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-600"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                    Liter
                  </span>
                </div>
              </div>

              {/* Catatan / Keterangan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan / Keterangan
                </label>
                <textarea
                  value={editCatatan}
                  onChange={(e) => setEditCatatan(e.target.value)}
                  placeholder="Keterangan acara atau keperluan..."
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingBast(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#14532D] hover:bg-[#0f3e22] text-white rounded-xl text-xs font-black transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {submittingEdit ? (
                    <span>Menyimpan...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Simpan Perubahan</span>
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
                      Nomor: {selectedBastForPreview.nomorBast || 'BA-FS-20260907-006'}
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
                  Nomor Dokumen: <span className="font-mono font-bold text-slate-800">{selectedBastForPreview.nomorBast || 'BA-FS-20260907-006'}</span>
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
