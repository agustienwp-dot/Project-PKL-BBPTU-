'use client';

import React, { useState, useEffect, useMemo } from 'react';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import EmptyState from '@/components/EmptyState';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Plus,
  Search,
  RotateCcw,
  Sparkles,
  Milk,
  ShoppingCart,
  Gift,
  Layers,
  Calendar,
  Filter,
  ArrowRight,
  TrendingDown,
  Building2,
  Users,
  Compass,
  Info,
  Clock,
  Package,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Warehouse,
  Trash2
} from 'lucide-react';

export default function DistribusiSusuSegarPage() {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [basts, setBasts] = useState([]);
  const [farmRecaps, setFarmRecaps] = useState([]);
  const [farmDailyList, setFarmDailyList] = useState([]);
  const [farmSummary, setFarmSummary] = useState({});

  // 1. Commodity Tab: 'SAPI' | 'KAMBING'
  const [commodityTab, setCommodityTab] = useState('SAPI');

  const [selectedDayDetail, setSelectedDayDetail] = useState(null);

  // 3. Filter States
  const [demandTypeFilter, setDemandTypeFilter] = useState('ALL'); // 'ALL' | 'PENJUALAN_LANGSUNG' | 'HIBAH'
  const [timeFilter, setTimeFilter] = useState('ALL'); // 'ALL' | 'TODAY' | '7DAYS' | 'MONTH'
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('asc'); // Default ascending 1-31
  const [searchTerm, setSearchTerm] = useState('');

  // 4. Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 5. Chart Timeframe: '7' | '30'
  const [chartTimeframe, setChartTimeframe] = useState('7');

  // 6. Distribution Modal State (Multi-item Penjualan & Hibah Susu Segar)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submittingCreate, setSubmittingCreate] = useState(false);
  const [distributionDate, setDistributionDate] = useState(new Date().toISOString().slice(0, 10));
  const [distributionAnimalType, setDistributionAnimalType] = useState('SAPI');
  const [distributionItems, setDistributionItems] = useState([
    {
      id: 1,
      jenis: 'PENJUALAN_LANGSUNG',
      tujuan: 'SPPG',
      customTujuan: '',
      isCustomTujuan: false,
      volume: '',
    }
  ]);
  const [distributionNotes, setDistributionNotes] = useState('');

  // Fetch Data from both /api/bast and /api/pemasaran/farm-recap
  const fetchData = async () => {
    setLoading(true);
    try {
      const [bastRes, farmRes] = await Promise.all([
        api.get('/bast').catch(() => ({ data: { data: [] } })),
        api.get('/pemasaran/farm-recap?sortOrder=asc').catch(() => ({ data: { data: [], dailyList: [], summary: {} } })),
      ]);

      if (bastRes.data?.success) {
        setBasts(bastRes.data.data || []);
      }
      if (farmRes.data?.success) {
        setFarmRecaps(farmRes.data.data || []);
        setFarmDailyList(farmRes.data.dailyList || []);
        setFarmSummary(farmRes.data.summary || {});
      }
    } catch (err) {
      console.error('Error loading fresh milk distribution data:', err);
      setToast({ type: 'error', message: 'Gagal memuat data distribusi susu segar.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper: determine animal type of a BAST document
  const getBastAnimal = (bast) => {
    if (bast.sumber === 'SUSU_KAMBING' || (bast.catatan && bast.catatan.toLowerCase().includes('kambing'))) {
      return 'KAMBING';
    }
    return 'SAPI';
  };

  // Group BASTs by commodity
  const sapiBasts = useMemo(() => basts.filter((b) => getBastAnimal(b) === 'SAPI'), [basts]);
  const kambingBasts = useMemo(() => basts.filter((b) => getBastAnimal(b) === 'KAMBING'), [basts]);

  // Daily records from farm-recap by commodity
  const sapiDailyList = useMemo(() => farmDailyList.filter((d) => (d.jenisTernak || 'SAPI').toUpperCase() === 'SAPI'), [farmDailyList]);
  const kambingDailyList = useMemo(() => farmDailyList.filter((d) => (d.jenisTernak || '').toUpperCase() === 'KAMBING'), [farmDailyList]);

  // Net received ready for distribution from farm
  const sapiNetSiapOlah = useMemo(() => sapiDailyList.reduce((acc, d) => acc + (d.sisaBersihSiapOlah || 0), 0), [sapiDailyList]);
  const kambingNetSiapOlah = useMemo(() => kambingDailyList.reduce((acc, d) => acc + (d.sisaBersihSiapOlah || 0), 0), [kambingDailyList]);

  // Active commodity BAST list
  const activeCommodityBasts = useMemo(() => {
    return commodityTab === 'SAPI' ? sapiBasts : kambingBasts;
  }, [commodityTab, sapiBasts, kambingBasts]);

  // Active commodity daily list
  const activeCommodityDaily = useMemo(() => {
    return commodityTab === 'SAPI' ? sapiDailyList : kambingDailyList;
  }, [commodityTab, sapiDailyList, kambingDailyList]);

  // Filtered BAST list according to filters
  const filteredBasts = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const d7 = new Date();
    d7.setDate(d7.getDate() - 7);
    const d7Str = d7.toISOString().slice(0, 10);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

    return activeCommodityBasts
      .filter((b) => {
        const dStr = new Date(b.tanggal).toISOString().slice(0, 10);

        let matchTime = true;
        if (timeFilter === 'TODAY') matchTime = dStr === today;
        else if (timeFilter === '7DAYS') matchTime = dStr >= d7Str;
        else if (timeFilter === 'MONTH') matchTime = dStr >= monthStart && dStr <= monthEnd;

        const matchDemand = demandTypeFilter === 'ALL' || b.jenisPermintaan === demandTypeFilter;

        const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
        const matchSearch =
          !searchTerm ||
          b.nomorBast?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.instansiPenerima?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.catatan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (b.jenisPermintaan === 'HIBAH' ? 'hibah' : 'penjualan').includes(searchTerm.toLowerCase()) ||
          dStr.includes(searchTerm);

        return matchTime && matchDemand && matchStatus && matchSearch;
      })
      .sort((a, b) => {
        const cmp = new Date(a.tanggal) - new Date(b.tanggal);
        return sortOrder === 'desc' ? -cmp : cmp;
      });
  }, [activeCommodityBasts, demandTypeFilter, timeFilter, statusFilter, sortOrder, searchTerm]);

  // Filtered Daily List according to time, search, and filters
  const filteredDailyList = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const d7 = new Date();
    d7.setDate(d7.getDate() - 7);
    const d7Str = d7.toISOString().slice(0, 10);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

    return activeCommodityDaily
      .filter((day) => {
        const dStr = day.tanggal;
        let matchTime = true;
        if (timeFilter === 'TODAY') matchTime = dStr === today;
        else if (timeFilter === '7DAYS') matchTime = dStr >= d7Str;
        else if (timeFilter === 'MONTH') matchTime = dStr >= monthStart && dStr <= monthEnd;

        const allocations = day.bastAllocations || [];
        let matchDemand = true;
        if (demandTypeFilter === 'PENJUALAN_LANGSUNG') {
          matchDemand = allocations.some((a) => a.jenisPermintaan !== 'HIBAH');
        } else if (demandTypeFilter === 'HIBAH') {
          matchDemand = allocations.some((a) => a.jenisPermintaan === 'HIBAH');
        }

        const matchSearch =
          !searchTerm ||
          day.tanggal.includes(searchTerm) ||
          day.bastUsageDescriptions?.some((desc) => desc.toLowerCase().includes(searchTerm.toLowerCase()));

        return matchTime && matchDemand && matchSearch;
      })
      .sort((a, b) => {
        const cmp = new Date(a.tanggal) - new Date(b.tanggal);
        return sortOrder === 'desc' ? -cmp : cmp;
      });
  }, [activeCommodityDaily, timeFilter, demandTypeFilter, sortOrder, searchTerm]);

  // KPI Calculations for active commodity
  const currentTotalGross = useMemo(() => {
    return filteredDailyList.reduce((acc, d) => acc + (d.totalGross || 0), 0);
  }, [filteredDailyList]);

  const currentTotalMasukFarm = useMemo(() => {
    return filteredDailyList.reduce((acc, d) => acc + (d.totalSusuSiapOlah || 0), 0);
  }, [filteredDailyList]);

  const currentTotalDistribusi = useMemo(() => {
    return filteredBasts.reduce((acc, b) => acc + (b.volumeLiters || 0), 0);
  }, [filteredBasts]);

  const currentVolumePenjualan = useMemo(() => {
    return filteredBasts
      .filter((b) => b.jenisPermintaan === 'PENJUALAN_LANGSUNG')
      .reduce((acc, b) => acc + (b.volumeLiters || 0), 0);
  }, [filteredBasts]);

  const currentVolumeHibah = useMemo(() => {
    return filteredBasts
      .filter((b) => b.jenisPermintaan === 'HIBAH')
      .reduce((acc, b) => acc + (b.volumeLiters || 0), 0);
  }, [filteredBasts]);

  const currentSisaStokDistribusi = useMemo(() => {
    return filteredDailyList.reduce((acc, d) => acc + (d.sisaBersihSiapOlah || 0), 0);
  }, [filteredDailyList]);



  // Chart Data Preparation (Daily Penjualan vs Hibah)
  const chartData = useMemo(() => {
    const daysLimit = chartTimeframe === '7' ? 7 : 30;
    const now = new Date();
    const dateMap = {};

    for (let i = daysLimit - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dStr = d.toISOString().slice(0, 10);
      dateMap[dStr] = {
        tanggal: dStr,
        label: d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
        penjualan: 0,
        hibah: 0,
      };
    }

    activeCommodityBasts.forEach((b) => {
      const dStr = new Date(b.tanggal).toISOString().slice(0, 10);
      if (dateMap[dStr]) {
        if (b.jenisPermintaan === 'HIBAH') {
          dateMap[dStr].hibah += b.volumeLiters || 0;
        } else {
          dateMap[dStr].penjualan += b.volumeLiters || 0;
        }
      }
    });

    return Object.values(dateMap);
  }, [chartTimeframe, activeCommodityBasts]);

  const maxChartValue = useMemo(() => {
    let max = 50;
    chartData.forEach((d) => {
      if (d.penjualan > max) max = d.penjualan;
      if (d.hibah > max) max = d.hibah;
    });
    return Math.ceil(max * 1.25);
  }, [chartData]);

  // Handle open create modal
  const handleOpenCreateModal = (presetCommodity = commodityTab) => {
    setDistributionDate(new Date().toISOString().slice(0, 10));
    setDistributionAnimalType(presetCommodity);
    setDistributionItems([
      {
        id: 1,
        jenis: 'PENJUALAN_LANGSUNG',
        tujuan: 'SPPG',
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
        jenis: 'PENJUALAN_LANGSUNG',
        tujuan: 'Kantin Eduwisata',
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

  const parseVolume = (vol) => {
    if (!vol) return 0;
    const clean = vol.toString().replace(',', '.');
    return parseFloat(clean) || 0;
  };

  const totalComputedVolume = useMemo(() => {
    return distributionItems.reduce((acc, item) => {
      const v = parseVolume(item.volume);
      return acc + Math.max(0, v);
    }, 0);
  }, [distributionItems]);

  const totalPenjualanVolume = useMemo(() => {
    return distributionItems
      .filter(i => i.jenis !== 'HIBAH')
      .reduce((acc, item) => acc + parseVolume(item.volume), 0);
  }, [distributionItems]);

  const totalHibahVolume = useMemo(() => {
    return distributionItems
      .filter(i => i.jenis === 'HIBAH')
      .reduce((acc, item) => acc + parseVolume(item.volume), 0);
  }, [distributionItems]);

  // Handle Create BAST Distribusi (Mencatat banyak tujuan sekaligus & potong stok harian)
  const handleCreateBAST = async (e) => {
    e.preventDefault();

    const invalidItems = distributionItems.filter(item => !item.volume || parseVolume(item.volume) <= 0);
    if (invalidItems.length > 0) {
      setToast({ type: 'error', message: 'Pastikan seluruh baris tujuan distribusi memiliki volume susu (> 0 Liter).' });
      return;
    }

    const emptyCustom = distributionItems.filter(item => item.isCustomTujuan && !item.customTujuan?.trim());
    if (emptyCustom.length > 0) {
      setToast({ type: 'error', message: 'Tujuan khusus yang diketik manual wajib diisi.' });
      return;
    }

    setSubmittingCreate(true);
    try {
      let createdHibahDoc = null;

      for (const item of distributionItems) {
        const numVol = parseVolume(item.volume);
        const finalTujuan = item.isCustomTujuan ? item.customTujuan.trim() : item.tujuan.trim();
        const jenisText = item.jenis === 'HIBAH' ? 'HIBAH' : 'PENJUALAN_LANGSUNG';

        const res = await api.post('/bast', {
          tanggal: distributionDate,
          volumeLiters: numVol,
          animalType: distributionAnimalType,
          sumber: distributionAnimalType === 'KAMBING' ? 'SUSU_KAMBING' : 'SUSU_SAPI',
          jenisPermintaan: jenisText,
          instansiPenerima: finalTujuan || (jenisText === 'HIBAH' ? 'Penyaluran Hibah' : 'Penjualan Langsung'),
          catatan: distributionNotes
            ? `${finalTujuan} (${jenisText === 'HIBAH' ? 'Hibah' : 'Jual'}) • ${distributionNotes}`
            : `Distribusi Susu ${distributionAnimalType === 'KAMBING' ? 'Kambing' : 'Sapi'} ke ${finalTujuan} (${jenisText === 'HIBAH' ? 'Hibah' : 'Penjualan'})`,
          status: 'DIKIRIM_KE_FARM',
        });

        if (jenisText === 'HIBAH' && res.data?.data) {
          createdHibahDoc = {
            ...res.data.data,
            animalType: distributionAnimalType,
            tujuan: finalTujuan,
          };
        }
      }

      setToast({
        type: 'success',
        message: `Berhasil mencatat ${distributionItems.length} tujuan distribusi (${totalComputedVolume.toLocaleString('id-ID')} Liter susu segar)!`,
      });
      setShowCreateModal(false);
      await fetchData();
    } catch (err) {
      console.error('Error creating BAST distribution:', err);
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Gagal menyimpan data distribusi susu segar.',
      });
    } finally {
      setSubmittingCreate(false);
    }
  };

  // Clear all filters helper
  const handleClearAllFilters = () => {
    setSearchTerm('');
    setDemandTypeFilter('ALL');
    setTimeFilter('ALL');
    setStatusFilter('ALL');
    setSortOrder('asc');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || demandTypeFilter !== 'ALL' || timeFilter !== 'ALL' || statusFilter !== 'ALL';

  if (loading) {
    return <LoadingSpinner text="Memuat Data Distribusi Susu Segar..." />;
  }

  return (
    <div className="space-y-6 w-full pb-14 font-sans">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Page Header: Title, Commodity Switcher & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
            DISTRIBUSI SUSU SEGAR
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Commodity Switcher */}
          <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/90 gap-1 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setCommodityTab('SAPI');
                setCurrentPage(1);
              }}
              className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                commodityTab === 'SAPI'
                  ? 'bg-[#14532D] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <span>Susu Sapi</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCommodityTab('KAMBING');
                setCurrentPage(1);
              }}
              className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                commodityTab === 'KAMBING'
                  ? 'bg-[#14532D] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <span>Susu Kambing</span>
            </button>
          </div>

          <button
            onClick={() => handleOpenCreateModal()}
            className="inline-flex items-center gap-2 bg-[#14532D] hover:bg-[#0f3e22] text-white px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs hover:shadow-md active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-300" />
            <span>Input Distribusi</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. KPI CARDS (GRID 2 X 2 / 4-KOLOM RESPONSIVE)                            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 (Hijau): Masuk dari Farm */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-200/80 shadow-xs space-y-3 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider">
              Masuk dari Farm
            </span>
            <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-2xs">
              <Milk className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-950 font-mono tracking-tight">
              {currentTotalMasukFarm.toLocaleString('id-ID')}{' '}
              <span className="text-xs font-bold text-emerald-700 font-sans">Liter</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Susu segar diterima dari farm hari ini.
            </p>
          </div>
        </div>

        {/* Card 2 (Hijau): Distribusi Penjualan */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-200/80 shadow-xs space-y-3 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider">
              Distribusi Penjualan
            </span>
            <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-2xs">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-950 font-mono tracking-tight">
              {currentVolumePenjualan.toLocaleString('id-ID')}{' '}
              <span className="text-xs font-bold text-emerald-700 font-sans">Liter</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Distribusi penjualan melalui dokumen BAST.
            </p>
          </div>
        </div>

        {/* Card 3 (Hijau): Distribusi Hibah */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-200/80 shadow-xs space-y-3 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider">
              Distribusi Hibah
            </span>
            <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-2xs">
              <Gift className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-950 font-mono tracking-tight">
              {currentVolumeHibah.toLocaleString('id-ID')}{' '}
              <span className="text-xs font-bold text-emerald-700 font-sans">Liter</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Distribusi hibah kepada instansi atau penerima.
            </p>
          </div>
        </div>

        {/* Card 4 (Hijau): Sisa Stok Siap Olah */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-200/80 shadow-xs space-y-3 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider">
              Sisa Stok Siap Olah
            </span>
            <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-2xs">
              <Warehouse className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-950 font-mono tracking-tight">
              {currentSisaStokDistribusi.toLocaleString('id-ID')}{' '}
              <span className="text-xs font-bold text-emerald-700 font-sans">Liter</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Alokasi susu segar siap diambil untuk diolah (UHT/Pasteurisasi).
            </p>
          </div>
        </div>
      </div>


      {/* ========================================================================= */}
      {/* 7. FILTER TOOLBAR MODERN + CHIPS FILTER AKTIF                             */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3.5">
        {/* Baris 1: Search Input & Dropdown Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-2xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all shadow-2xs"
            />
          </div>

          {/* Dropdown Filters Cluster */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Jenis Distribusi */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-2xl px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-white transition-all">
              <span className="text-slate-400 text-[11px] font-semibold">Jenis:</span>
              <select
                value={demandTypeFilter}
                onChange={(e) => {
                  setDemandTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-800 pr-1"
              >
                <option value="ALL">Semua Jenis</option>
                <option value="PENJUALAN_LANGSUNG">Penjualan</option>
                <option value="HIBAH">Hibah</option>
              </select>
            </div>

            {/* Periode */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-2xl px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-white transition-all">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={timeFilter}
                onChange={(e) => {
                  setTimeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-800 pr-1"
              >
                <option value="ALL">Semua Periode</option>
                <option value="TODAY">Hari Ini</option>
                <option value="7DAYS">7 Hari Terakhir</option>
                <option value="MONTH">Bulan Ini</option>
              </select>
            </div>

          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-400 font-semibold text-[11px]">Filter Aktif:</span>

            {searchTerm && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 font-bold border border-slate-200">
                &ldquo;{searchTerm}&rdquo;
                <button onClick={() => setSearchTerm('')} className="hover:text-rose-500">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {demandTypeFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 font-bold border border-slate-300">
                {demandTypeFilter === 'HIBAH' ? 'Hibah' : 'Penjualan'}
                <button onClick={() => setDemandTypeFilter('ALL')} className="hover:text-rose-500">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {timeFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 font-bold border border-slate-300">
                {timeFilter === 'TODAY' ? 'Hari Ini' : timeFilter === '7DAYS' ? '7 Hari' : 'Bulan Ini'}
                <button onClick={() => setTimeFilter('ALL')} className="hover:text-rose-500">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            <button
              onClick={handleClearAllFilters}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline ml-1"
            >
              Reset Semua Filter
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 8. TABEL REKAP ALOKASI & TUJUAN DISTRIBUSI HARIAN                        */}
      {/* ========================================================================= */}

          {/* Tabel Rekap Harian */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Distribusi Penjualan & Hibah
                </h2>
              </div>
            </div>

            {filteredDailyList.length === 0 ? (
              <div className="py-12 text-center">
                <EmptyState
                  title="Tidak Ada Data Alokasi Distribusi"
                  description="Belum ada data distribusi atau penerimaan susu yang tercatat pada rentang waktu ini."
                />
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse bg-white">
                  <thead className="bg-[#1E3F20] text-white font-black uppercase text-[11px] sticky top-0 z-10" style={{ backgroundColor: '#1E3F20' }}>
                    <tr style={{ backgroundColor: '#1E3F20' }}>
                      <th className="py-3.5 px-3 text-center w-[1%] whitespace-nowrap text-white" style={{ backgroundColor: '#1E3F20' }}>No</th>
                      <th className="py-3.5 px-4 whitespace-nowrap text-white" style={{ backgroundColor: '#1E3F20' }}>Tanggal</th>
                      <th className="py-3.5 px-4 text-right font-bold whitespace-nowrap text-white" style={{ backgroundColor: '#1E3F20' }}>Susu Masuk (L)</th>
                      <th className="py-3.5 px-4 text-right font-bold whitespace-nowrap text-white" style={{ backgroundColor: '#1E3F20' }}>Total Penjualan (L)</th>
                      <th className="py-3.5 px-4 text-right font-bold whitespace-nowrap text-white" style={{ backgroundColor: '#1E3F20' }}>Total Hibah (L)</th>
                      <th className="py-3.5 px-4 text-right font-black whitespace-nowrap text-white" style={{ backgroundColor: '#1E3F20' }}>Total Distribusi (L)</th>
                      <th className="py-3.5 px-4 text-right font-black whitespace-nowrap text-white" style={{ backgroundColor: '#1E3F20' }}>Sisa Stok (L)</th>
                      <th className="py-3.5 px-4 text-center whitespace-nowrap text-white" style={{ backgroundColor: '#1E3F20' }}>Detail Distribusi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700 bg-white">
                    {filteredDailyList.map((day, idx) => {
                      const allocations = day.bastAllocations || [];
                      const rowKey = day.tanggal || `day-${idx}`;

                      const penjualanList = allocations.filter((a) => a.jenisPermintaan !== 'HIBAH');
                      const hibahList = allocations.filter((a) => a.jenisPermintaan === 'HIBAH');

                      const totalPenjualan = penjualanList.reduce((acc, a) => acc + (a.volumeLiters || 0), 0);
                      const totalHibah = hibahList.reduce((acc, a) => acc + (a.volumeLiters || 0), 0);
                      const totalDistribusi = day.totalBastDeduction ?? (totalPenjualan + totalHibah);
                      const susuMasuk = day.totalSusuSiapOlah || 0;
                      const sisaStok = day.sisaBersihSiapOlah ?? (susuMasuk - totalDistribusi);

                      return (
                        <tr key={rowKey} className="hover:bg-slate-50/80 transition-colors bg-white">
                          <td className="py-3.5 px-3 text-center text-slate-400 font-bold w-[1%] whitespace-nowrap bg-white">
                            {idx + 1}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap bg-white">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>
                                {new Date(day.tanggal).toLocaleDateString('id-ID', {
                                  weekday: 'short',
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800 whitespace-nowrap bg-white">
                            {susuMasuk.toLocaleString('id-ID')} L
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800 whitespace-nowrap bg-white">
                            {totalPenjualan > 0 ? (
                              <span>{totalPenjualan.toLocaleString('id-ID')} L</span>
                            ) : (
                              <span className="text-slate-400 font-normal">0 L</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800 whitespace-nowrap bg-white">
                            {totalHibah > 0 ? (
                              <span>{totalHibah.toLocaleString('id-ID')} L</span>
                            ) : (
                              <span className="text-slate-400 font-normal">0 L</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap bg-white">
                            {totalDistribusi > 0 ? (
                              <span>{totalDistribusi.toLocaleString('id-ID')} L</span>
                            ) : (
                              <span className="text-slate-400 font-normal">0 L</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap bg-white">
                            {sisaStok.toLocaleString('id-ID')} L
                          </td>
                          <td className="py-3.5 px-4 text-center whitespace-nowrap bg-white">
                            <button
                              type="button"
                              onClick={() => setSelectedDayDetail(day)}
                              className="group inline-flex items-center gap-2 text-xs font-bold text-slate-800 hover:text-black transition-colors cursor-pointer bg-transparent"
                            >
                              <span
                                className="w-7 h-7 rounded-full flex items-center justify-center text-white bg-slate-900 shadow-2xs group-hover:scale-105 transition-transform shrink-0"
                              >
                                <FileText className="w-3.5 h-3.5 text-white" />
                              </span>
                              <span>Rincian</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-white text-slate-900 font-extrabold border-t-2 border-slate-200">
                    <tr className="bg-white">
                      <td colSpan={2} className="py-3.5 px-4 text-left text-xs uppercase tracking-wider bg-white font-black text-slate-900">
                        TOTAL REKAP HARIAN
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900 whitespace-nowrap bg-white">
                        {currentTotalMasukFarm.toLocaleString('id-ID')} L
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900 whitespace-nowrap bg-white">
                        {currentVolumePenjualan.toLocaleString('id-ID')} L
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900 whitespace-nowrap bg-white">
                        {currentVolumeHibah.toLocaleString('id-ID')} L
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900 whitespace-nowrap bg-white">
                        {currentTotalDistribusi.toLocaleString('id-ID')} L
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900 whitespace-nowrap bg-white">
                        {currentSisaStokDistribusi.toLocaleString('id-ID')} L
                      </td>
                      <td className="py-3.5 px-4 text-center text-xs text-slate-400 whitespace-nowrap bg-white">
                        -
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

      {/* ========================================================================= */}
      {/* 9. GRAFIK DISTRIBUSI (AREA/LINE CHART SVG RESPONSIF)                      */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-800 rounded-2xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Tren Distribusi Susu {commodityTab === 'SAPI' ? 'Sapi' : 'Kambing'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Komparasi harian volume Penjualan vs Penyaluran Hibah
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Legend */}
            <div className="flex items-center gap-3 text-xs font-bold mr-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#2563EB]" />
                <span className="text-slate-700">Penjualan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#F97316]" />
                <span className="text-slate-700">Hibah</span>
              </div>
            </div>

            {/* Timeframe selector */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              {[
                { id: '7', label: '7 Hari' },
                { id: '30', label: '30 Hari' },
              ].map((tf) => (
                <button
                  key={tf.id}
                  onClick={() => setChartTimeframe(tf.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    chartTimeframe === tf.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SVG Area Chart */}
        <div className="h-56 w-full pt-2">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Belum ada data grafik untuk periode ini.
            </div>
          ) : (
            <div className="h-full flex flex-col justify-between">
              <svg className="w-full h-44 overflow-visible" viewBox="0 0 700 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F97316" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#F97316" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="30" x2="700" y2="30" stroke="#f1f5f9" strokeDasharray="3 3" />
                <line x1="0" y1="75" x2="700" y2="75" stroke="#f1f5f9" strokeDasharray="3 3" />
                <line x1="0" y1="120" x2="700" y2="120" stroke="#f1f5f9" strokeDasharray="3 3" />

                {/* Penjualan Area & Line */}
                {(() => {
                  const points = chartData.map((d, i) => {
                    const x = (i / Math.max(chartData.length - 1, 1)) * 700;
                    const y = 140 - (d.penjualan / maxChartValue) * 125;
                    return `${x},${y}`;
                  });
                  const pathD = `M 0,140 L ${points.join(' L ')} L 700,140 Z`;
                  const lineD = `M ${points.join(' L ')}`;

                  return (
                    <g>
                      <path d={pathD} fill="url(#blueGradient)" />
                      <path d={lineD} fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
                      {chartData.map((d, i) => {
                        const x = (i / Math.max(chartData.length - 1, 1)) * 700;
                        const y = 140 - (d.penjualan / maxChartValue) * 125;
                        return (
                          <circle
                            key={`p-${i}`}
                            cx={x}
                            cy={y}
                            r="3.5"
                            fill="#FFFFFF"
                            stroke="#2563EB"
                            strokeWidth="2.5"
                          />
                        );
                      })}
                    </g>
                  );
                })()}

                {/* Hibah Area & Line */}
                {(() => {
                  const points = chartData.map((d, i) => {
                    const x = (i / Math.max(chartData.length - 1, 1)) * 700;
                    const y = 140 - (d.hibah / maxChartValue) * 125;
                    return `${x},${y}`;
                  });
                  const pathD = `M 0,140 L ${points.join(' L ')} L 700,140 Z`;
                  const lineD = `M ${points.join(' L ')}`;

                  return (
                    <g>
                      <path d={pathD} fill="url(#orangeGradient)" />
                      <path d={lineD} fill="none" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" />
                      {chartData.map((d, i) => {
                        const x = (i / Math.max(chartData.length - 1, 1)) * 700;
                        const y = 140 - (d.hibah / maxChartValue) * 125;
                        return (
                          <circle
                            key={`h-${i}`}
                            cx={x}
                            cy={y}
                            r="3.5"
                            fill="#FFFFFF"
                            stroke="#F97316"
                            strokeWidth="2.5"
                          />
                        );
                      })}
                    </g>
                  );
                })()}
              </svg>

              {/* X Axis Labels */}
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
                {chartData.map((d, i) => (
                  <span key={i} className={i % 2 === 0 ? 'block' : 'hidden sm:block'}>
                    {d.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 10. MODAL FORM INPUT DISTRIBUSI SUSU SEGAR (PENJUALAN & HIBAH MULTI-ITEM)  */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 p-6 sm:p-7 space-y-5 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
                Input Distribusi Susu Segar
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-all active:scale-95 cursor-pointer"
                title="Tutup"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handleCreateBAST} className="space-y-4">
              {/* Tanggal Transaksi & Komoditas Susu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Transaksi:
                  </label>
                  <input
                    type="date"
                    required
                    value={distributionDate}
                    onChange={(e) => setDistributionDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Komoditas Susu Segar:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDistributionAnimalType('SAPI')}
                      className={`flex items-center justify-center gap-1.5 p-2.5 rounded-2xl border text-xs font-black transition-all ${
                        distributionAnimalType === 'SAPI'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Susu Sapi
                    </button>
                    <button
                      type="button"
                      onClick={() => setDistributionAnimalType('KAMBING')}
                      className={`flex items-center justify-center gap-1.5 p-2.5 rounded-2xl border text-xs font-black transition-all ${
                        distributionAnimalType === 'KAMBING'
                          ? 'bg-amber-50 border-amber-500 text-amber-950 ring-2 ring-amber-500/20 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Susu Kambing
                    </button>
                  </div>
                </div>
              </div>

              {/* Section Header: DAFTAR DISTRIBUSI SUSU SEGAR & + Tambah Tujuan */}
              <div className="flex items-center justify-between pt-1">
                <label className="text-xs font-black text-amber-950 uppercase tracking-wider">
                  DAFTAR DISTRIBUSI SUSU SEGAR:
                </label>
                <button
                  type="button"
                  onClick={handleAddDistributionItem}
                  className="group inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-300 hover:border-amber-400 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors" />
                  <span>Tambah Tujuan</span>
                </button>
              </div>

              {/* Multi-item Cards Container */}
              <div className="space-y-3 max-h-[42vh] overflow-y-auto pr-1">
                {distributionItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-amber-200/80 bg-amber-50/20 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between border-b border-amber-100/90 pb-2">
                      <span className="text-xs font-black text-amber-950">
                        Distribusi #{idx + 1}
                      </span>
                      {distributionItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDistributionItem(item.id)}
                          className="text-rose-400 hover:text-rose-600 p-1 rounded-lg transition-colors"
                          title="Hapus baris"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {/* Jenis Distribusi (Penjualan / Hibah) */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Jenis Distribusi
                        </label>
                        <select
                          value={item.jenis}
                          onChange={(e) => handleUpdateDistributionItem(item.id, 'jenis', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                        >
                          <option value="PENJUALAN_LANGSUNG">Penjualan</option>
                          <option value="HIBAH">Hibah</option>
                        </select>
                      </div>

                      {/* Tujuan / Penerima */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Tujuan / Penerima
                        </label>
                        <select
                          value={item.tujuan}
                          onChange={(e) => handleUpdateDistributionItem(item.id, 'tujuan', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                        >
                          {item.jenis === 'HIBAH' ? (
                            <>
                              <option value="Senam / Apel">Senam / Apel</option>
                              <option value="Dinas / Tamu">Dinas / Tamu</option>
                              <option value="Yayasan Sosial / Panti">Yayasan Sosial / Panti</option>
                              <option value="Kegiatan Edukasi">Kegiatan Edukasi</option>
                              <option value="LAINNYA">Lainnya (Ketik Manual)</option>
                            </>
                          ) : (
                            <>
                              <option value="SPPG">SPPG</option>
                              <option value="Kantin Eduwisata">Kantin Eduwisata</option>
                              <option value="Pembeli Umum">Pembeli Umum</option>
                              <option value="Mitra Peternak">Mitra Peternak</option>
                              <option value="LAINNYA">Lainnya (Ketik Manual)</option>
                            </>
                          )}
                        </select>
                      </div>

                      {/* Jumlah (Liter) */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Jumlah (Liter)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="decimal"
                            required
                            placeholder="0"
                            value={item.volume}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9.,]/g, '');
                              const parts = val.split(/[.,]/);
                              if (parts.length <= 2) {
                                handleUpdateDistributionItem(item.id, 'volume', val);
                              }
                            }}
                            className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-900 pr-12 focus:ring-2 focus:ring-emerald-600 font-mono"
                          />
                          <span className="absolute right-2.5 top-2 text-[11px] font-bold text-slate-400 pointer-events-none">
                            Liter
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Custom Tujuan Text if Selected LAINNYA */}
                    {item.isCustomTujuan && (
                      <div className="pt-1">
                        <input
                          type="text"
                          required
                          placeholder="Ketik nama tujuan / penerima spesifik..."
                          value={item.customTujuan}
                          onChange={(e) => handleUpdateDistributionItem(item.id, 'customTujuan', e.target.value)}
                          className="w-full p-2 bg-white border border-amber-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                    )}

                    {/* Helper text: BAST vs Penjualan */}
                    <div className="pt-0.5 flex items-center justify-between text-[11px]">
                      {item.jenis === 'HIBAH' ? (
                        <span className="text-amber-800 font-semibold">
                          Menerbitkan Surat BAST Resmi
                        </span>
                      ) : (
                        <span className="text-blue-700 font-semibold">
                          Penjualan Langsung (Tanpa Surat BAST)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Distribusi Box */}
              <div className="bg-[#14532D] text-white p-4 rounded-2xl flex items-center justify-between font-black shadow-xs">
                <div>
                  <span className="text-xs tracking-wider uppercase block">
                    TOTAL DISTRIBUSI SUSU SEGAR:
                  </span>
                  <span className="text-[11px] text-emerald-200 font-normal">
                    Penjualan: {totalPenjualanVolume.toLocaleString('id-ID')} L • Hibah: {totalHibahVolume.toLocaleString('id-ID')} L
                  </span>
                </div>
                <span className="text-emerald-300 text-lg font-mono">
                  {totalComputedVolume.toLocaleString('id-ID')} Liter
                </span>
              </div>

              {/* Catatan Tambahan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Tambahan (Opsional)
                </label>
                <textarea
                  placeholder="Catatan..."
                  rows={2}
                  value={distributionNotes}
                  onChange={(e) => setDistributionNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-2xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingCreate}
                  className="px-6 py-2.5 text-xs font-black text-white bg-[#D97706] hover:bg-[#B45309] disabled:opacity-50 rounded-2xl shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
                >
                  {submittingCreate ? (
                    <span>Menyimpan...</span>
                  ) : (
                    <span>Simpan Data Distribusi</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL POP-UP: RINCIAN ALOKASI PENJUALAN & HIBAH (KOTAK DI TENGAH)          */}
      {/* ========================================================================= */}
      {selectedDayDetail && (() => {
        const allocations = selectedDayDetail.bastAllocations || [];
        const penjualanList = allocations.filter((a) => a.jenisPermintaan !== 'HIBAH');
        const hibahList = allocations.filter((a) => a.jenisPermintaan === 'HIBAH');

        const totalPenjualan = penjualanList.reduce((acc, a) => acc + (a.volumeLiters || 0), 0);
        const totalHibah = hibahList.reduce((acc, a) => acc + (a.volumeLiters || 0), 0);
        const totalDistribusi = selectedDayDetail.totalBastDeduction ?? (totalPenjualan + totalHibah);
        const susuMasuk = selectedDayDetail.totalSusuSiapOlah || 0;
        const sisaStok = selectedDayDetail.sisaBersihSiapOlah ?? (susuMasuk - totalDistribusi);

        return (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={() => setSelectedDayDetail(null)}
          >
            <div 
              className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-black px-3 py-1 rounded-xl bg-slate-900 text-white shadow-2xs">
                    {new Date(selectedDayDetail.tanggal).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    Rincian Tujuan Alokasi Penjualan & Hibah
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-600 mr-1">
                    Total Distribusi:{' '}
                    <strong className="text-emerald-600 text-sm font-black">
                      {totalDistribusi.toLocaleString('id-ID')} Liter
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedDayDetail(null)}
                    className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Ringkasan Ringkas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block">Susu Masuk</span>
                  <span className="font-mono font-bold text-slate-900">{susuMasuk.toLocaleString('id-ID')} L</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block">Total Penjualan</span>
                  <span className="font-mono font-bold text-slate-900">{totalPenjualan.toLocaleString('id-ID')} L</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block">Total Hibah</span>
                  <span className="font-mono font-bold text-slate-900">{totalHibah.toLocaleString('id-ID')} L</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block">Sisa Stok</span>
                  <span className="font-mono font-black text-slate-900">{sisaStok.toLocaleString('id-ID')} L</span>
                </div>
              </div>

              {/* 2 Kolom Konten: Penjualan & Hibah */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                {/* Kolom Kiri: Penjualan */}
                <div className="w-full flex flex-col h-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                  <div className="w-full flex items-center justify-between border-b border-slate-200 pb-2.5">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                      Alokasi Penjualan
                    </span>
                    <span className="text-sm font-mono font-black text-emerald-600 text-right shrink-0">
                      {totalPenjualan.toLocaleString('id-ID')} Liter
                    </span>
                  </div>

                  {penjualanList.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center py-8 text-xs text-slate-400 italic text-center">
                      Tidak ada alokasi penjualan pada tanggal ini.
                    </div>
                  ) : (
                    <div className="w-full space-y-2.5 max-h-64 overflow-y-auto pr-1 flex-1">
                      {penjualanList.map((item, pIdx) => (
                        <div
                          key={item.id || pIdx}
                          className="w-full min-h-[64px] flex items-center justify-between gap-4 p-4 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs hover:border-slate-300 transition-colors"
                        >
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <span className="font-bold text-slate-900 block truncate text-xs sm:text-sm">
                              {item.instansiPenerima || 'Penjualan'}
                            </span>
                            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block">
                              Penjualan Langsung
                            </span>
                          </div>
                          <span className="font-mono font-black text-emerald-600 text-sm sm:text-base text-right shrink-0">
                            {item.volumeLiters?.toLocaleString('id-ID')} Liter
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Kolom Kanan: Hibah */}
                <div className="w-full flex flex-col h-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                  <div className="w-full flex items-center justify-between border-b border-slate-200 pb-2.5">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                      Alokasi Hibah
                    </span>
                    <span className="text-sm font-mono font-black text-emerald-600 text-right shrink-0">
                      {totalHibah.toLocaleString('id-ID')} Liter
                    </span>
                  </div>

                  {hibahList.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center py-8 text-xs text-slate-400 italic text-center">
                      Tidak ada alokasi hibah pada tanggal ini.
                    </div>
                  ) : (
                    <div className="w-full space-y-2.5 max-h-64 overflow-y-auto pr-1 flex-1">
                      {hibahList.map((item, hIdx) => (
                        <div
                          key={item.id || hIdx}
                          className="w-full min-h-[64px] flex items-center justify-between gap-4 p-4 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs hover:border-slate-300 transition-colors"
                        >
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <span className="font-bold text-slate-900 block truncate text-xs sm:text-sm">
                              {item.instansiPenerima || 'Penerima Hibah'}
                            </span>
                            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 font-mono block truncate">
                              {item.nomorBast ? `BAST: ${item.nomorBast}` : 'Penyaluran Hibah'}
                            </span>
                          </div>
                          <span className="font-mono font-black text-emerald-600 text-sm sm:text-base text-right shrink-0">
                            {item.volumeLiters?.toLocaleString('id-ID')} Liter
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedDayDetail(null)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
