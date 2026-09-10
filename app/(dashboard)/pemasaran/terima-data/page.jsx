'use client';

import React, { useState, useEffect, useMemo } from 'react';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import EmptyState from '@/components/EmptyState';
import {
  PackageCheck,
  Package,
  ShoppingCart,
  Milk,
  Layers,
  Search,
  Filter,
  Calendar,
  Sparkles,
  Info,
  Clock,
  RotateCcw,
  CheckCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  X,
  Send,
  FileText,
  User,
  Tag,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Trash2,
  Plus,
  RefreshCw,
  Check,
  Eye,
  Factory,
  Truck,
  Store,
  Building2,
  Compass,
  GraduationCap,
  Users,
  ShieldCheck,
  ArrowUpRight,
  BarChart3,
  SlidersHorizontal,
  ChevronDown,
  Printer,
  Download
} from 'lucide-react';

export default function TerimaProdukOlahanPage() {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [packagings, setPackagings] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);

  // Main View Mode: 'STOK' | 'PENJUALAN'
  const [viewMode, setViewMode] = useState('STOK');

  // Product Category Tab: 'susu_original' | 'susu_rasa' | 'yogurt' | 'keju'
  const [activeTab, setActiveTab] = useState('susu_original');

  // Sub Packaging & Variant Filter
  const [selectedSizeFilter, setSelectedSizeFilter] = useState('ALL');
  const [selectedVariantFilter, setSelectedVariantFilter] = useState('ALL');

  // Time & Status Filters
  const [timeFilter, setTimeFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('asc'); // Default 1 - 31
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination for Stock Table
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Pagination for Sales Table
  const [salesPage, setSalesPage] = useState(1);
  const [salesPageSize, setSalesPageSize] = useState(10);

  // Chart Timeframe Filter: '7' | '30' | 'ALL'
  const [chartTimeframe, setChartTimeframe] = useState('7');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Distribution / Sales Form Modal
  const [preselectedProduct, setPreselectedProduct] = useState(null);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [submittingDistribution, setSubmittingDistribution] = useState(false);
  const [distributionDate, setDistributionDate] = useState(new Date().toISOString().slice(0, 10));
  const [distributionProducts, setDistributionProducts] = useState([
    {
      id: 1,
      tujuan: 'SPPG',
      produk: 'Susu Pasteurisasi',
      ukuran: '250 ml',
      kemasan: 'Botol',
      jumlah: '',
      isCustomTujuan: false,
      customTujuan: '',
    }
  ]);
  const [distributionNotes, setDistributionNotes] = useState('');

  // Milk Requests Modal & State (Permintaan susu segar dari Pengolahan UHT)
  const [milkRequests, setMilkRequests] = useState([]);
  const [showMilkRequestsModal, setShowMilkRequestsModal] = useState(false);
  const [confirmingRequestId, setConfirmingRequestId] = useState(null);
  const [milkReqTab, setMilkReqTab] = useState('ALL'); // 'ALL' | 'PENDING' | 'CONFIRMED'

  // BAST Official Preview Template State
  const [showBastPreviewModal, setShowBastPreviewModal] = useState(false);
  const [selectedBastForPreview, setSelectedBastForPreview] = useState(null);

  // Create Milk Request / Issue BAST Modal State
  const [showCreateMilkRequestModal, setShowCreateMilkRequestModal] = useState(false);
  const [submittingMilkRequest, setSubmittingMilkRequest] = useState(false);
  const [createMilkRequestForm, setCreateMilkRequestForm] = useState({
    tanggal: new Date().toISOString().slice(0, 10),
    sesi: 'PAGI',
    animalType: 'SAPI',
    volumeLiters: '',
    targetOlahan: 'Susu Pasteurisasi Original',
    totalProduksi: '',
    penggunaanCempe: '0',
    afkir: '0',
    lainLain: '-',
    pengirimNama: 'Seksi Pemasaran',
    penerimaNama: 'Unit Pengolahan (UHT)',
    pengirimPetugas: 'Admin Pemasaran',
    penerimaPetugas: 'Petugas Pengolahan UHT',
    catatan: '',
  });

  // Helper for Short Flavor Name
  const getShortFlavorName = (fullName = '') => {
    if (!fullName) return fullName;
    const lower = fullName.toLowerCase();
    if (lower.includes('cokelat')) return 'Cokelat';
    if (lower.includes('stroberi') || lower.includes('strawberry')) return 'Stroberi';
    if (lower.includes('melon')) return 'Melon';
    if (lower.includes('mocca') || lower.includes('kopi')) return 'Mocca';
    if (lower.includes('pisang') || lower.includes('banana')) return 'Pisang';
    return fullName.replace(/^Susu Pasteurisasi\s+/i, '');
  };

  // Helper for Flavor Badge Styling
  const getFlavorBadgeClass = (productName = '') => {
    const lower = productName.toLowerCase();
    if (lower.includes('cokelat') || lower.includes('chocolate')) {
      return 'bg-amber-50 text-amber-900 border-amber-300';
    }
    if (lower.includes('stroberi') || lower.includes('strawberry')) {
      return 'bg-rose-50 text-rose-900 border-rose-300';
    }
    if (lower.includes('melon')) {
      return 'bg-emerald-50 text-emerald-900 border-emerald-300';
    }
    if (lower.includes('mocca') || lower.includes('kopi')) {
      return 'bg-stone-100 text-stone-900 border-stone-300';
    }
    if (lower.includes('original') || lower.includes('plain')) {
      return 'bg-slate-50 text-slate-800 border-slate-300';
    }
    if (lower.includes('yogurt')) {
      return 'bg-purple-50 text-purple-900 border-purple-300';
    }
    if (lower.includes('keju')) {
      return 'bg-amber-50 text-amber-900 border-amber-300';
    }
    return 'bg-emerald-50 text-emerald-900 border-emerald-300';
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [res, salesRes, bastRes, susuReqRes] = await Promise.all([
        api.get('/packaged-products?sortOrder=asc').catch(() => ({ data: { data: [] } })),
        api.get('/milk-sales?sumber=OLAHAN').catch(() => ({ data: { data: [] } })),
        api.get('/bast').catch(() => ({ data: { data: [] } })),
        api.get('/susu/request').catch(() => ({ data: { data: [] } })),
      ]);
      if (res.data?.success) {
        setPackagings(res.data.data || []);
      }
      if (salesRes.data?.success) {
        setSalesHistory(salesRes.data.data || []);
      }

      const bastDocs = (bastRes.data?.success && Array.isArray(bastRes.data.data)) ? bastRes.data.data : [];
      const susuReqs = (susuReqRes.data?.success && Array.isArray(susuReqRes.data.data)) ? susuReqRes.data.data : [];

      const combined = [];
      const seenIds = new Set();
      const seenNos = new Set();

      // 1. Add BASTs related to UHT / Pengolahan / Permintaan Susu
      bastDocs.forEach((b) => {
        const t = (b.type || b.jenisPermintaan || '').toUpperCase();
        const pRole = (b.penerimaRole || '').toUpperCase();
        const pName = (b.penerimaNama || b.receiverName || '').toUpperCase();
        const sRole = (b.penyerahRole || '').toUpperCase();
        const no = b.nomorBast || b.nomorBA || b.nomorBa || '';
        const isUht =
          t === 'PENGOLAHAN_UHT' ||
          t === 'PERMINTAAN_SUSU' ||
          t === 'REQUEST_SUSU' ||
          no.startsWith('BAST-REQ-') ||
          no.startsWith('BA-UHT-') ||
          pRole.includes('UHT') ||
          pRole.includes('PENGOLAHAN') ||
          pName.includes('UHT') ||
          sRole.includes('UHT') ||
          sRole.includes('PENGOLAHAN');

        if (isUht) {
          combined.push(b);
          seenIds.add(b.id);
          if (no) seenNos.add(no);
          const reqMatch = (b.notes || b.catatan || '').match(/REQ-\d{8}-\d{3}/i);
          if (reqMatch) seenNos.add(reqMatch[0]);
        }
      });

      // 2. Add MilkRequests not yet covered
      susuReqs.forEach((r) => {
        const rNo = r.requestNo || '';
        const bNo = r.bastNo || '';
        if (!seenNos.has(rNo) && (!bNo || !seenNos.has(bNo)) && !seenIds.has(r.id)) {
          const isKambing = (r.processingNeeds || '').toLowerCase().includes('kambing');
          const isDone = r.status === 'DISETUJUI' || r.status === 'SIAP_DITERIMA' || r.status === 'DITERIMA' || r.status === 'SELESAI';
          combined.push({
            id: r.id,
            nomorBast: bNo || rNo,
            nomorBa: bNo || rNo,
            nomorBA: bNo || rNo,
            requestNo: rNo,
            tanggal: r.date || r.createdAt,
            date: r.date || r.createdAt,
            volumeLiters: r.volumeLiters,
            diserahterimakan: r.volumeLiters,
            totalProduksi: r.volumeLiters,
            animalType: isKambing ? 'KAMBING' : 'SAPI',
            animalName: isKambing ? 'SUSU KAMBING' : 'SUSU SAPI',
            sumber: isKambing ? 'SUSU_KAMBING' : 'SUSU_SAPI',
            jenisPermintaan: 'PENGOLAHAN_UHT',
            type: 'PERMINTAAN_SUSU',
            status: isDone ? 'DITERIMA' : 'MENUNGGU_KONFIRMASI',
            targetOlahan: r.processingNeeds || 'Produksi Susu Olahan UHT',
            notes: r.notes || '',
            catatan: r.notes || '',
            pengirimNama: 'Seksi Pemasaran',
            penerimaNama: 'Unit Pengolahan (UHT)',
            pengirimPetugas: r.approvedByName || 'Petugas Pemasaran',
            penerimaPetugas: r.createdBy?.name || 'Admin Pengemasan',
          });
          if (rNo) seenNos.add(rNo);
        }
      });

      setMilkRequests(combined);
    } catch (err) {
      console.error('Error fetching data:', err);
      setToast({ type: 'error', message: 'Gagal memuat data produk olahan UHT & penjualan.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const pendingRequestsCount = useMemo(() => {
    return milkRequests.filter((r) => r.status === 'MENUNGGU_KONFIRMASI' || r.status === 'DIKIRIM_KE_FARM' || r.status === 'MENUNGGU_PERSETUJUAN').length;
  }, [milkRequests]);

  const handleConfirmMilkRequest = async (id) => {
    setConfirmingRequestId(id);
    try {
      const res = await api.post(`/bast/${id}/confirm`, {
        catatan: 'Dikonfirmasi & diserahkan oleh Bagian Pemasaran untuk Unit Pengolahan UHT.',
      });
      if (res.data?.success) {
        setToast({ type: 'success', message: 'Permintaan susu segar berhasil disetujui & dialokasikan untuk Pengolahan!' });
        await fetchData();
      }
    } catch (err) {
      console.error('Error confirming milk request with BAST endpoint, trying request approve:', err);
      try {
        const altRes = await api.put(`/susu/request/${id}`, { action: 'APPROVE' });
        if (altRes.data?.success) {
          setToast({ type: 'success', message: 'Permintaan susu segar berhasil disetujui & dialokasikan untuk Pengolahan!' });
          await fetchData();
          return;
        }
      } catch (altErr) {}
      setToast({ type: 'error', message: err.response?.data?.message || 'Gagal mengonfirmasi permintaan susu.' });
    } finally {
      setConfirmingRequestId(null);
    }
  };

  // Helper to parse BAST document details
  const getBastDetails = (bast) => {
    if (!bast) return {};
    let parsed = {};
    if (bast.catatan) {
      try {
        parsed = JSON.parse(bast.catatan);
      } catch (e) {
        parsed = { notes: bast.catatan };
      }
    }

    const isKambing = bast.sumber === 'SUSU_KAMBING' || bast.animalType === 'KAMBING' || (bast.catatan && bast.catatan.toLowerCase().includes('kambing')) || (bast.notes && bast.notes.toLowerCase().includes('kambing'));
    const animalName = isKambing ? 'SUSU KAMBING' : 'SUSU SAPI';
    const vol = parseFloat(bast.volumeLiters || bast.diserahterimakan || bast.totalProduksi) || 0;

    return {
      ...bast,
      nomorBast: bast.nomorBast || bast.nomorBa || bast.nomorBA || bast.requestNo || 'BA-UHT-20260901-008',
      tanggal: bast.tanggal || bast.date || bast.createdAt,
      volumeLiters: vol,
      totalProduksi: parsed.totalProduksi !== undefined ? parsed.totalProduksi : (bast.totalProduksi !== undefined ? bast.totalProduksi : vol),
      diserahterimakan: vol,
      sesi: parsed.sesi || bast.sesi || 'PAGI',
      animalName: parsed.animalName || animalName,
      targetOlahan: parsed.targetOlahan || bast.targetOlahan || bast.processingNeeds || 'Produksi Susu Pasteurisasi & Produk Olahan UHT',
      penggunaanCempe: parsed.penggunaanCempe !== undefined ? parsed.penggunaanCempe : (bast.penggunaanCempe !== undefined ? bast.penggunaanCempe : 0),
      afkir: parsed.afkir !== undefined ? parsed.afkir : (bast.afkir !== undefined ? bast.afkir : 0),
      lainLain: parsed.lainLain !== undefined ? parsed.lainLain : (bast.lainLain !== undefined ? bast.lainLain : '-'),
      pengirimNama: bast.pengirimNama || 'SEKSI PEMASARAN',
      penerimaNama: bast.penerimaNama || 'UNIT PENGOLAHAN (UHT)',
      pengirimPetugas: parsed.pengirimPetugas || bast.pengirimPetugas || bast.approvedByName || 'Petugas Pemasaran',
      penerimaPetugas: parsed.penerimaPetugas || bast.penerimaPetugas || bast.createdBy?.name || 'Petugas Pengolahan UHT',
      notes: parsed.notes || (typeof bast.catatan === 'string' && !bast.catatan.startsWith('{') ? bast.catatan : (bast.notes || '')),
    };
  };

  // Handle Create New Milk Request & Issue BAST
  const handleCreateMilkRequest = async (e) => {
    e.preventDefault();
    const vol = parseFloat(createMilkRequestForm.volumeLiters);
    if (isNaN(vol) || vol <= 0) {
      setToast({ type: 'error', message: 'Volume susu segar (Liter) wajib diisi dan bernilai > 0.' });
      return;
    }

    setSubmittingMilkRequest(true);
    try {
      const dateObj = new Date(createMilkRequestForm.tanggal);
      const dateStr = dateObj.toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const nomorBast = `BA-UHT-${dateStr}-${randomSuffix}`;

      const payload = {
        nomorBast,
        tanggal: createMilkRequestForm.tanggal,
        volumeLiters: vol,
        jenisPermintaan: 'PENGOLAHAN_UHT',
        animalType: createMilkRequestForm.animalType,
        sumber: createMilkRequestForm.animalType === 'KAMBING' ? 'SUSU_KAMBING' : 'SUSU_SAPI',
        instansiPenerima: 'Unit Pengolahan (UHT)',
        pengirimNama: createMilkRequestForm.pengirimNama || 'Seksi Pemasaran',
        pengirimRole: 'ADMIN_PEMASARAN',
        penerimaNama: createMilkRequestForm.penerimaNama || 'Unit Pengolahan (UHT)',
        penerimaRole: 'UNIT_PENGOLAHAN_UHT',
        status: 'DITERIMA', // Otomatis disetujui saat diterbitkan oleh Pemasaran untuk UHT
        catatan: JSON.stringify({
          sesi: createMilkRequestForm.sesi,
          targetOlahan: createMilkRequestForm.targetOlahan,
          totalProduksi: parseFloat(createMilkRequestForm.totalProduksi) || vol,
          penggunaanCempe: parseFloat(createMilkRequestForm.penggunaanCempe) || 0,
          afkir: parseFloat(createMilkRequestForm.afkir) || 0,
          lainLain: createMilkRequestForm.lainLain || '-',
          pengirimPetugas: createMilkRequestForm.pengirimPetugas || 'Petugas Pemasaran',
          penerimaPetugas: createMilkRequestForm.penerimaPetugas || 'Petugas Pengolahan UHT',
          notes: createMilkRequestForm.catatan || '',
        }),
      };

      const res = await api.post('/bast', payload);
      if (res.data?.success) {
        setToast({
          type: 'success',
          message: `Surat BAST ${nomorBast} berhasil diterbitkan dan susu segar dialokasikan ke Pengolahan UHT!`
        });
        setShowCreateMilkRequestModal(false);
        fetchData();

        // Immediately open preview template for the newly created document
        const createdDoc = res.data.data;
        setSelectedBastForPreview({
          ...createdDoc,
          sesi: createMilkRequestForm.sesi,
          targetOlahan: createMilkRequestForm.targetOlahan,
          totalProduksi: parseFloat(createMilkRequestForm.totalProduksi) || vol,
          penggunaanCempe: parseFloat(createMilkRequestForm.penggunaanCempe) || 0,
          afkir: parseFloat(createMilkRequestForm.afkir) || 0,
          lainLain: createMilkRequestForm.lainLain || '-',
          pengirimPetugas: createMilkRequestForm.pengirimPetugas || 'Petugas Pemasaran',
          penerimaPetugas: createMilkRequestForm.penerimaPetugas || 'Petugas Pengolahan UHT',
        });
        setShowBastPreviewModal(true);
      }
    } catch (err) {
      console.error('Error creating milk request / BAST:', err);
      setToast({ type: 'error', message: err.response?.data?.message || 'Gagal menerbitkan Surat BAST.' });
    } finally {
      setSubmittingMilkRequest(false);
    }
  };

  // Map Packagings with realtime sold count & remaining stock
  const packagingsWithStock = useMemo(() => {
    return packagings.map((pkg) => {
      const initialStock = parseFloat(pkg.jumlah || pkg.totalPackagedQty || 0);
      const soldQty = salesHistory
        .filter((s) => {
          if (s.produkRefId) return s.produkRefId === pkg.id;
          return false;
        })
        .reduce((acc, s) => acc + (parseFloat(s.jumlah) || parseFloat(s.quantity) || 0), 0);
      const remainingStock = Math.max(0, initialStock - soldQty);
      return {
        ...pkg,
        initialStock,
        soldQty,
        remainingStock,
      };
    });
  }, [packagings, salesHistory]);

  // List of products with remaining stock available for sale
  const availableProductsForSale = useMemo(() => {
    return packagingsWithStock.filter((p) => p.remainingStock > 0);
  }, [packagingsWithStock]);

  // Groupings for Products: Original vs Rasa vs Yogurt vs Keju
  const susuOriginalItems = useMemo(() => {
    return packagingsWithStock.filter((p) => {
      const name = (p.jenisProduk || '').toLowerCase();
      return name.includes('original') || name.includes('plain');
    });
  }, [packagingsWithStock]);

  const susuRasaItems = useMemo(() => {
    return packagingsWithStock.filter((p) => {
      const name = (p.jenisProduk || '').toLowerCase();
      return name.includes('rasa') || (name.includes('susu') && !name.includes('original') && !name.includes('yogurt') && !name.includes('keju'));
    });
  }, [packagingsWithStock]);

  const yogurtItems = useMemo(() => {
    return packagingsWithStock.filter((p) => {
      const name = (p.jenisProduk || '').toLowerCase();
      return name.includes('yogurt');
    });
  }, [packagingsWithStock]);

  const kejuItems = useMemo(() => {
    return packagingsWithStock.filter((p) => {
      const name = (p.jenisProduk || '').toLowerCase();
      return name.includes('keju');
    });
  }, [packagingsWithStock]);

  // Active Category Items based on Tab
  const currentCategoryItems = useMemo(() => {
    switch (activeTab) {
      case 'susu_original':
        return susuOriginalItems;
      case 'susu_rasa':
        return susuRasaItems;
      case 'yogurt':
        return yogurtItems;
      case 'keju':
        return kejuItems;
      default:
        return susuOriginalItems;
    }
  }, [activeTab, susuOriginalItems, susuRasaItems, yogurtItems, kejuItems]);

  // Extract distinct flavors/variants for active category
  const availableVariants = useMemo(() => {
    const set = new Set();
    currentCategoryItems.forEach((p) => {
      if (p.jenisProduk) set.add(p.jenisProduk);
    });
    return Array.from(set);
  }, [currentCategoryItems]);

  // Packaging Order Helper (Botol 250 ml positioned at the far right / last)
  const getPackagingOrderWeight = (packaging = '') => {
    const p = packaging.toLowerCase().trim();
    if (p.includes('botol') && p.includes('115')) return 1;
    if (p.includes('cup') && p.includes('115')) return 2;
    if (p.includes('bantal') && p.includes('115')) return 3;
    if (p.includes('250')) return 4;
    return 5;
  };

  // Extract distinct packaging sizes for active category
  const availableSizes = useMemo(() => {
    const set = new Set();
    currentCategoryItems.forEach((p) => {
      if (p.kemasan) set.add(p.kemasan);
    });
    return Array.from(set).sort((a, b) => getPackagingOrderWeight(a) - getPackagingOrderWeight(b));
  }, [currentCategoryItems]);

  // Filter Active Category Items by Time, Size, Variant, Status, Search
  const filteredActiveItems = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const d7 = new Date();
    d7.setDate(d7.getDate() - 7);
    const d7Str = d7.toISOString().slice(0, 10);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

    return currentCategoryItems
      .filter((p) => {
        const dStr = new Date(p.tanggal || p.date).toISOString().slice(0, 10);

        // Time filter
        let matchTime = true;
        if (timeFilter === 'TODAY') matchTime = dStr === today;
        else if (timeFilter === '7DAYS') matchTime = dStr >= d7Str;
        else if (timeFilter === 'MONTH') matchTime = dStr >= monthStart && dStr <= monthEnd;
        else if (timeFilter === 'CUSTOM') {
          if (startDate && dStr < startDate) matchTime = false;
          if (endDate && dStr > endDate) matchTime = false;
        }

        // Variant filter (Rasa)
        const matchVariant = selectedVariantFilter === 'ALL' || p.jenisProduk === selectedVariantFilter;

        // Size filter
        const matchSize = selectedSizeFilter === 'ALL' || p.kemasan === selectedSizeFilter;

        // Status filter
        const matchStatus =
          statusFilter === 'ALL' ||
          (statusFilter === 'AVAILABLE' && p.remainingStock > 0) ||
          (statusFilter === 'EMPTY' && p.remainingStock <= 0);

        // Search term
        const matchSearch =
          !searchTerm ||
          p.jenisProduk?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.kemasan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dStr.includes(searchTerm);

        return matchTime && matchVariant && matchSize && matchStatus && matchSearch;
      })
      .sort((a, b) => {
        const cmp = new Date(a.tanggal || a.date) - new Date(b.tanggal || b.date);
        return sortOrder === 'desc' ? -cmp : cmp;
      });
  }, [currentCategoryItems, timeFilter, selectedVariantFilter, selectedSizeFilter, statusFilter, sortOrder, searchTerm, startDate, endDate]);

  // Product Ordering Helper
  const getProductOrderWeight = (name = '') => {
    const n = (name || '').toLowerCase();
    if (n.includes('cokelat')) return 1;
    if ((n.includes('stroberi') || n.includes('strawberry')) && !n.includes('yogurt')) return 2;
    if (n.includes('original')) return 3;
    if (n.includes('yogurt')) return 4;
    if (n.includes('keju')) return 5;
    return 6;
  };

  // Unified single table items with accurate per-series carryover calculation
  const unifiedStockRows = useMemo(() => {
    const skuMap = {};
    filteredActiveItems.forEach((pkg) => {
      const key = `${pkg.jenisProduk || ''}___${pkg.kemasan || ''}`;
      if (!skuMap[key]) skuMap[key] = [];
      skuMap[key].push(pkg);
    });

    const allComputed = [];
    Object.values(skuMap).forEach((items) => {
      const ascItems = [...items].sort((a, b) => new Date(a.tanggal || a.date) - new Date(b.tanggal || b.date));
      let runningPrev = 0;
      ascItems.forEach((pkg) => {
        const sisaKemarin = runningPrev;
        const masukBaru = pkg.initialStock || pkg.jumlah || pkg.totalPackagedQty || 0;
        const totalStok = sisaKemarin + masukBaru;
        const terjual = pkg.soldQty || 0;
        const sisaHariIni = Math.max(0, totalStok - terjual);
        runningPrev = sisaHariIni;

        allComputed.push({
          ...pkg,
          sisaKemarin,
          masukBaru,
          totalStok,
          terjual,
          sisaHariIni,
        });
      });
    });

    return allComputed.sort((a, b) => {
      const dateA = new Date(a.tanggal || a.date).getTime();
      const dateB = new Date(b.tanggal || b.date).getTime();
      const dateCmp = sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      if (dateCmp !== 0) return dateCmp;

      const pWeightA = getProductOrderWeight(a.jenisProduk);
      const pWeightB = getProductOrderWeight(b.jenisProduk);
      if (pWeightA !== pWeightB) return pWeightA - pWeightB;

      const kWeightA = getPackagingOrderWeight(a.kemasan);
      const kWeightB = getPackagingOrderWeight(b.kemasan);
      return kWeightA - kWeightB;
    });
  }, [filteredActiveItems, sortOrder]);

  const unifiedTotalMasuk = useMemo(() => unifiedStockRows.reduce((acc, r) => acc + r.masukBaru, 0), [unifiedStockRows]);
  const unifiedTotalTerjual = useMemo(() => unifiedStockRows.reduce((acc, r) => acc + r.terjual, 0), [unifiedStockRows]);
  const unifiedTotalSisaAkhir = useMemo(() => {
    const seriesLatest = {};
    unifiedStockRows.forEach((r) => {
      const key = `${r.jenisProduk || ''}___${r.kemasan || ''}`;
      if (!seriesLatest[key] || new Date(r.tanggal || r.date) >= new Date(seriesLatest[key].tanggal || seriesLatest[key].date)) {
        seriesLatest[key] = r;
      }
    });
    return Object.values(seriesLatest).reduce((acc, r) => acc + r.sisaHariIni, 0);
  }, [unifiedStockRows]);

  // Metric sums for Active Tab
  const tabTotalQty = useMemo(() => filteredActiveItems.reduce((acc, p) => acc + (p.initialStock || p.jumlah || p.totalPackagedQty || 0), 0), [filteredActiveItems]);
  const tabSoldQty = useMemo(() => filteredActiveItems.reduce((acc, p) => acc + (p.soldQty || 0), 0), [filteredActiveItems]);
  const tabRemainingStock = useMemo(() => Math.max(0, tabTotalQty - tabSoldQty), [tabTotalQty, tabSoldQty]);

  // Raw Milk Requested for Processing
  const totalLitersDiserahkan = useMemo(() => {
    return milkRequests
      .filter((r) => r.status === 'DITERIMA' || r.status === 'DISETUJUI' || r.status === 'SIAP_DITERIMA' || r.status === 'SELESAI')
      .reduce((acc, r) => acc + (parseFloat(r.volumeLiters || r.diserahterimakan) || 0), 0);
  }, [milkRequests]);

  const totalLitersMenunggu = useMemo(() => {
    return milkRequests
      .filter((r) => r.status === 'MENUNGGU_KONFIRMASI' || r.status === 'DIKIRIM_KE_FARM' || r.status === 'MENUNGGU_PERSETUJUAN')
      .reduce((acc, r) => acc + (parseFloat(r.volumeLiters || r.diserahterimakan) || 0), 0);
  }, [milkRequests]);

  // Category stats helper for tabs
  const computeLiveCategoryStats = (items) => {
    const today = new Date().toISOString().slice(0, 10);
    const d7 = new Date();
    d7.setDate(d7.getDate() - 7);
    const d7Str = d7.toISOString().slice(0, 10);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

    const filtered = items.filter((p) => {
      const dStr = new Date(p.tanggal || p.date).toISOString().slice(0, 10);
      let matchTime = true;
      if (timeFilter === 'TODAY') matchTime = dStr === today;
      else if (timeFilter === '7DAYS') matchTime = dStr >= d7Str;
      else if (timeFilter === 'MONTH') matchTime = dStr >= monthStart && dStr <= monthEnd;
      else if (timeFilter === 'CUSTOM') {
        if (startDate && dStr < startDate) matchTime = false;
        if (endDate && dStr > endDate) matchTime = false;
      }
      const matchSearch =
        !searchTerm ||
        p.jenisProduk?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.kemasan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dStr.includes(searchTerm);
      return matchTime && matchSearch;
    });

    let totalMasuk = 0;
    let totalTerjual = 0;
    filtered.forEach((item) => {
      const m = item.initialStock || item.jumlah || item.totalPackagedQty || 0;
      const t = item.soldQty || 0;
      totalMasuk += m;
      totalTerjual += t;
    });
    const totalSisa = Math.max(0, totalMasuk - totalTerjual);

    return {
      batchCount: filtered.length,
      totalMasuk,
      totalTerjual,
      totalSisa,
    };
  };

  const susuOriginalStats = useMemo(() => computeLiveCategoryStats(susuOriginalItems), [susuOriginalItems, timeFilter, startDate, endDate, searchTerm]);
  const susuRasaStats = useMemo(() => computeLiveCategoryStats(susuRasaItems), [susuRasaItems, timeFilter, startDate, endDate, searchTerm]);
  const yogurtStats = useMemo(() => computeLiveCategoryStats(yogurtItems), [yogurtItems, timeFilter, startDate, endDate, searchTerm]);
  const kejuStats = useMemo(() => computeLiveCategoryStats(kejuItems), [kejuItems, timeFilter, startDate, endDate, searchTerm]);

  // Low stock products detection (<= 50 pcs or 0)
  const lowStockItems = useMemo(() => {
    return packagingsWithStock.filter((p) => p.remainingStock <= 50);
  }, [packagingsWithStock]);

  // Distribution Channels Stats (SPPG vs Eduwisata vs Umum)
  const channelStats = useMemo(() => {
    let sppg = 0;
    let eduwisata = 0;
    let umum = 0;
    let total = 0;

    salesHistory.forEach((s) => {
      const qty = parseFloat(s.jumlah) || parseFloat(s.quantity) || 0;
      const buyer = (s.pembeli || '').toLowerCase();
      total += qty;

      if (buyer.includes('sppg')) {
        sppg += qty;
      } else if (buyer.includes('eduwisata')) {
        eduwisata += qty;
      } else {
        umum += qty;
      }
    });

    return {
      sppg,
      eduwisata,
      umum,
      total,
      sppgPct: total > 0 ? Math.round((sppg / total) * 100) : 0,
      eduwisataPct: total > 0 ? Math.round((eduwisata / total) * 100) : 0,
      umumPct: total > 0 ? Math.round((umum / total) * 100) : 0,
    };
  }, [salesHistory]);

  // Timeline / Daily Trend Data for Line Chart
  const chartData = useMemo(() => {
    const map = {};
    salesHistory.forEach((s) => {
      const dStr = new Date(s.tanggal || s.date).toISOString().slice(0, 10);
      const qty = parseFloat(s.jumlah) || parseFloat(s.quantity) || 0;
      if (!map[dStr]) map[dStr] = 0;
      map[dStr] += qty;
    });

    const dates = Object.keys(map).sort();
    let displayDates = dates;

    if (chartTimeframe === '7') {
      displayDates = dates.slice(-7);
    } else if (chartTimeframe === '30') {
      displayDates = dates.slice(-30);
    }

    if (displayDates.length === 0) {
      return [];
    }

    return displayDates.map((d) => ({
      date: d,
      label: new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      value: map[d] || 0,
    }));
  }, [salesHistory, chartTimeframe]);

  // Total sales revenue for processed milk
  const totalSalesRevenue = useMemo(() => salesHistory.reduce((acc, s) => acc + (s.hargaJual || s.totalPrice || 0), 0), [salesHistory]);
  const totalSalesQty = useMemo(() => salesHistory.reduce((acc, s) => acc + (s.jumlah || s.quantity || 0), 0), [salesHistory]);

  // Sorted Sales History
  const sortedSalesHistory = useMemo(() => {
    return [...salesHistory].sort((a, b) => {
      const dateA = new Date(a.tanggal || a.date).getTime();
      const dateB = new Date(b.tanggal || b.date).getTime();
      return dateB - dateA;
    });
  }, [salesHistory]);

  // Stock Table Pagination
  const totalStockPages = Math.ceil(unifiedStockRows.length / pageSize) || 1;
  const paginatedStockRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return unifiedStockRows.slice(start, start + pageSize);
  }, [unifiedStockRows, currentPage, pageSize]);

  // Sales Table Pagination
  const totalSalesPages = Math.ceil(sortedSalesHistory.length / salesPageSize) || 1;
  const paginatedSalesRows = useMemo(() => {
    const start = (salesPage - 1) * salesPageSize;
    return sortedSalesHistory.slice(start, start + salesPageSize);
  }, [sortedSalesHistory, salesPage, salesPageSize]);

  // Computed total pcs for distribution form
  const totalComputedPcs = useMemo(() => {
    return distributionProducts.reduce((acc, item) => {
      const val = parseInt(item.jumlah, 10) || 0;
      return acc + Math.max(0, val);
    }, 0);
  }, [distributionProducts]);

  // Open Sales Form directly
  const handleOpenSaleModal = (product = null) => {
    setPreselectedProduct(product);
    setDistributionDate(product?.tanggal ? new Date(product.tanggal).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));

    let defaultUkuran = '250 ml';
    let defaultKemasan = 'Botol';
    if (product?.kemasan) {
      if (product.kemasan.toLowerCase().includes('115')) defaultUkuran = '115 ml';
      else if (product.kemasan.toLowerCase().includes('250')) defaultUkuran = '250 ml';
      else if (product.kemasan.toLowerCase().includes('200')) defaultUkuran = '200 ml';
      else if (product.kemasan.toLowerCase().includes('100')) defaultUkuran = '100 gram';

      if (product.kemasan.toLowerCase().includes('cup')) defaultKemasan = 'Cup';
      else if (product.kemasan.toLowerCase().includes('bantal')) defaultKemasan = 'Bantal';
      else if (product.kemasan.toLowerCase().includes('pack')) defaultKemasan = 'Pack';
      else defaultKemasan = 'Botol';
    }

    setDistributionProducts([
      {
        id: 1,
        tujuan: 'SPPG',
        produk: product?.jenisProduk || (activeTab === 'susu_original' ? 'Susu Pasteurisasi Original' : 'Susu Pasteurisasi'),
        ukuran: defaultUkuran,
        kemasan: defaultKemasan,
        jumlah: '',
        isCustomTujuan: false,
        customTujuan: '',
      }
    ]);
    setDistributionNotes('');
    setShowSaleModal(true);
  };

  const handleAddDistributionProduct = () => {
    const newId = distributionProducts.length > 0 ? Math.max(...distributionProducts.map(p => p.id)) + 1 : 1;
    setDistributionProducts(prev => [
      ...prev,
      {
        id: newId,
        tujuan: 'SPPG',
        produk: 'Susu Pasteurisasi Original',
        ukuran: '250 ml',
        kemasan: 'Botol',
        jumlah: '',
        isCustomTujuan: false,
        customTujuan: '',
      }
    ]);
  };

  const handleRemoveDistributionProduct = (id) => {
    if (distributionProducts.length <= 1) return;
    setDistributionProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleUpdateDistributionProduct = (id, field, value) => {
    setDistributionProducts(prev =>
      prev.map(item => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Submit Sales Form
  const handleSubmitSale = async (e) => {
    e.preventDefault();

    const invalidItems = distributionProducts.filter(item => !item.jumlah || parseInt(item.jumlah, 10) <= 0);
    if (invalidItems.length > 0) {
      setToast({ type: 'error', message: 'Pastikan semua baris produk memiliki jumlah unit (> 0).' });
      return;
    }

    const emptyDestination = distributionProducts.filter(item => !item.tujuan || !item.tujuan.trim());
    if (emptyDestination.length > 0) {
      setToast({
        type: 'error',
        message: 'Keterangan tujuan penjualan wajib diisi.'
      });
      return;
    }

    setSubmittingDistribution(true);
    try {
      const promises = distributionProducts.map(async (item) => {
        const qty = parseInt(item.jumlah, 10) || 0;
        const matched = packagingsWithStock.find(p => {
          const nameMatches = p.jenisProduk?.toLowerCase().includes(item.produk.toLowerCase());
          const sizeMatches = p.kemasan?.toLowerCase().includes(item.ukuran.toLowerCase()) || p.kemasan?.toLowerCase().includes(item.kemasan.toLowerCase());
          return p.status === 'DITERIMA' && (nameMatches || sizeMatches);
        }) || availableProductsForSale[0] || packagings[0];

        const tujuanText = item.tujuan?.trim() || 'Penjualan Umum';

        return api.post('/milk-sales', {
          tanggal: distributionDate,
          sumber: 'OLAHAN',
          produkRefId: matched?.id || null,
          jumlah: qty,
          pembeli: tujuanText,
          hargaJual: 0,
          kategoriBayar: 'PNBP',
          catatan: `${tujuanText} - ${item.produk} ${item.ukuran} (${item.kemasan})${distributionNotes ? ' • ' + distributionNotes : ''}`,
        });
      });

      await Promise.all(promises);

      setToast({
        type: 'success',
        message: `Data penjualan berhasil disimpan (${totalComputedPcs.toLocaleString('id-ID')} pcs dipotong dari stok)!`
      });
      setShowSaleModal(false);
      fetchData();
    } catch (err) {
      console.error('Error submitting sales:', err);
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Gagal menyimpan data penjualan.'
      });
    } finally {
      setSubmittingDistribution(false);
    }
  };

  // Active filter count and labels for chips
  const activeFilters = useMemo(() => {
    const list = [];
    if (activeTab) {
      const catLabels = {
        susu_original: 'Susu Pasteurisasi Original',
        susu_rasa: 'Susu Pasteurisasi Rasa',
        yogurt: 'Yogurt',
        keju: 'Keju'
      };
      list.push({ key: 'category', label: `Kategori: ${catLabels[activeTab] || activeTab}`, isStatic: true });
    }
    if (selectedVariantFilter !== 'ALL') {
      list.push({ key: 'variant', label: `Rasa: ${getShortFlavorName(selectedVariantFilter)}`, onClear: () => setSelectedVariantFilter('ALL') });
    }
    if (selectedSizeFilter !== 'ALL') {
      list.push({ key: 'size', label: `Kemasan: ${selectedSizeFilter}`, onClear: () => setSelectedSizeFilter('ALL') });
    }
    if (timeFilter !== 'ALL') {
      const timeLabels = {
        TODAY: 'Hari Ini',
        '7DAYS': '7 Hari Terakhir',
        MONTH: 'Bulan Ini',
        CUSTOM: 'Custom Tanggal'
      };
      list.push({ key: 'time', label: `Periode: ${timeLabels[timeFilter] || timeFilter}`, onClear: () => setTimeFilter('ALL') });
    }
    if (statusFilter !== 'ALL') {
      const statusLabels = {
        AVAILABLE: 'Tersedia (>0)',
        EMPTY: 'Habis (0)'
      };
      list.push({ key: 'status', label: `Status: ${statusLabels[statusFilter] || statusFilter}`, onClear: () => setStatusFilter('ALL') });
    }
    if (searchTerm) {
      list.push({ key: 'search', label: `Cari: "${searchTerm}"`, onClear: () => setSearchTerm('') });
    }
    return list;
  }, [activeTab, selectedVariantFilter, selectedSizeFilter, timeFilter, statusFilter, searchTerm]);

  const hasNonDefaultFilters = useMemo(() => {
    return selectedVariantFilter !== 'ALL' || selectedSizeFilter !== 'ALL' || timeFilter !== 'ALL' || statusFilter !== 'ALL' || searchTerm !== '';
  }, [selectedVariantFilter, selectedSizeFilter, timeFilter, statusFilter, searchTerm]);

  const handleResetAllFilters = () => {
    setSelectedVariantFilter('ALL');
    setSelectedSizeFilter('ALL');
    setTimeFilter('ALL');
    setStatusFilter('ALL');
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const getActiveTabTitle = () => {
    switch (activeTab) {
      case 'susu_original':
        return 'Susu Pasteurisasi Original';
      case 'susu_rasa':
        return 'Susu Pasteurisasi Rasa';
      case 'yogurt':
        return 'Yogurt';
      case 'keju':
        return 'Keju';
      default:
        return 'Susu Olahan';
    }
  };

  if (loading && packagings.length === 0) {
    return <LoadingSpinner text="Memuat Data Produk Olahan UHT & Penjualan..." />;
  }

  return (
    <div className="space-y-6 w-full pb-12 font-sans">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Page Title (Tanpa Bar / Kotak) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
          {viewMode === 'PENJUALAN' ? 'RIWAYAT PENJUALAN UHT' : 'PRODUK UHT'}
        </h1>

        {/* Sebelah Kanan: Action Buttons Utama */}
        <div className="flex flex-wrap items-center gap-2.5">
          {viewMode === 'PENJUALAN' ? (
            <button
              onClick={() => setViewMode('STOK')}
              className="inline-flex items-center gap-2 bg-[#1E3F20] hover:bg-[#16331a] text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-300" />
              <span>← Kembali ke Data Stok</span>
            </button>
          ) : (
            <>
              {/* Tombol Hijau Utama: + Input Penjualan */}
              <button
                onClick={() => handleOpenSaleModal()}
                className="inline-flex items-center gap-2 bg-[#1E3F20] hover:bg-[#16331a] text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-emerald-300" />
                <span>+ Input Penjualan</span>
              </button>

              {/* Tombol Outline: Permintaan Susu */}
              <button
                onClick={() => setShowMilkRequestsModal(true)}
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-2xl text-xs font-bold transition-all border border-slate-200 shadow-xs hover:shadow-md active:scale-95 cursor-pointer"
              >
                <Milk className="w-4 h-4 text-amber-600" />
                <span>Permintaan Susu</span>
                {pendingRequestsCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white animate-pulse">
                    {pendingRequestsCount} Baru
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-slate-100 text-slate-600">
                    {milkRequests.length}
                  </span>
                )}
              </button>

              {/* Tombol Outline: Riwayat Penjualan */}
              <button
                onClick={() => setViewMode('PENJUALAN')}
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-2xl text-xs font-bold transition-all border border-slate-200 shadow-xs hover:shadow-md active:scale-95 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4 text-blue-600" />
                <span>Riwayat Penjualan</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-100 text-slate-700">
                  {salesHistory.length}
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. KATEGORI PRODUK MENJADI TABS (PILL TABS HORIZONTAL)                    */}
      {/* ========================================================================= */}
      {viewMode === 'STOK' && (
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Tab 1: Susu Original */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('susu_original');
              setSelectedSizeFilter('ALL');
              setSelectedVariantFilter('ALL');
              setCurrentPage(1);
            }}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
              activeTab === 'susu_original'
                ? 'bg-[#14532D] text-white border-[#14532D] shadow-md ring-2 ring-emerald-600/20'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            Susu Pasteurisasi Original
          </button>

          {/* Tab 2: Susu Rasa */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('susu_rasa');
              setSelectedSizeFilter('ALL');
              setSelectedVariantFilter('ALL');
              setCurrentPage(1);
            }}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
              activeTab === 'susu_rasa'
                ? 'bg-[#14532D] text-white border-[#14532D] shadow-md ring-2 ring-emerald-600/20'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            Susu Pasteurisasi Rasa
          </button>

          {/* Tab 3: Yogurt */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('yogurt');
              setSelectedSizeFilter('ALL');
              setSelectedVariantFilter('ALL');
              setCurrentPage(1);
            }}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
              activeTab === 'yogurt'
                ? 'bg-[#14532D] text-white border-[#14532D] shadow-md ring-2 ring-emerald-600/20'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            Yogurt
          </button>

          {/* Tab 4: Keju */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('keju');
              setSelectedSizeFilter('ALL');
              setSelectedVariantFilter('ALL');
              setCurrentPage(1);
            }}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
              activeTab === 'keju'
                ? 'bg-[#14532D] text-white border-[#14532D] shadow-md ring-2 ring-emerald-600/20'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            Keju
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. KPI CARDS (PRIORITAS INFORMASI) - GRID 2 X 2 / 4-KOLOM RESPONSIVE       */}
      {/* ========================================================================= */}
      {viewMode === 'STOK' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1 — Hijau (Stok Siap Dijual) */}
          <div className="bg-white p-5 rounded-3xl border border-emerald-200/80 shadow-xs flex items-center justify-between relative overflow-hidden group hover:border-emerald-400 transition-all">
            <div className="space-y-1 z-10">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                Stok Siap Dijual
              </span>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {tabRemainingStock.toLocaleString('id-ID')}
                </h3>
                <span className="text-xs font-bold text-slate-500">Pcs</span>
              </div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <PackageCheck className="w-7 h-7 text-emerald-700" />
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-emerald-50/50 pointer-events-none" />
          </div>

          {/* Card 2 — Sudah Terjual */}
          <div className="bg-white p-5 rounded-3xl border border-emerald-200/80 shadow-xs flex items-center justify-between relative overflow-hidden group hover:border-emerald-400 transition-all">
            <div className="space-y-1 z-10">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                Sudah Terjual
              </span>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {tabSoldQty.toLocaleString('id-ID')}
                </h3>
                <span className="text-xs font-bold text-slate-500">Pcs</span>
              </div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ShoppingCart className="w-7 h-7 text-emerald-700" />
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-emerald-50/50 pointer-events-none" />
          </div>

          {/* Card 3 — Total Produksi */}
          <div className="bg-white p-5 rounded-3xl border border-emerald-200/80 shadow-xs flex items-center justify-between relative overflow-hidden group hover:border-emerald-400 transition-all">
            <div className="space-y-1 z-10">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                Total Produksi
              </span>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {tabTotalQty.toLocaleString('id-ID')}
                </h3>
                <span className="text-xs font-bold text-slate-500">Pcs</span>
              </div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Factory className="w-7 h-7 text-emerald-700" />
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-emerald-50/50 pointer-events-none" />
          </div>

          {/* Card 4 — Bahan Baku Digunakan */}
          <div
            onClick={() => setShowMilkRequestsModal(true)}
            className="bg-white p-5 rounded-3xl border border-emerald-200/80 shadow-xs flex items-center justify-between relative overflow-hidden group hover:border-emerald-400 transition-all cursor-pointer"
            title="Klik untuk melihat rincian permintaan susu dari unit pengolahan"
          >
            <div className="space-y-1 z-10">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Bahan Baku Digunakan
                </span>
                {totalLitersMenunggu > 0 && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {totalLitersDiserahkan.toLocaleString('id-ID')}
                </h3>
                <span className="text-xs font-bold text-slate-500">Liter</span>
              </div>
              <div className="pt-1">
                <span className="text-[10px] font-bold text-red-600 block">
                  {totalLitersMenunggu > 0 ? `${totalLitersMenunggu} L Menunggu Diserahkan` : 'Susu segar yang diproses'}
                </span>
              </div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Milk className="w-7 h-7 text-emerald-700" />
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-emerald-50/50 pointer-events-none" />
          </div>
        </div>
      )}



      {/* ========================================================================= */}
      {/* 5. PROGRESS DISTRIBUSI PENJUALAN                                          */}
      {/* ========================================================================= */}
      {viewMode === 'STOK' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-blue-100 text-blue-800">
                <TrendingUp className="w-4 h-4 text-blue-700" />
              </div>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                Distribusi Penjualan ({getActiveTabTitle()})
              </h3>
            </div>
            <span className="text-xs font-black text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Terjual {tabTotalQty > 0 ? ((tabSoldQty / tabTotalQty) * 100).toFixed(0) : 0}%
            </span>
          </div>

          {/* Progress Bar Full Width */}
          <div className="space-y-2">
            <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-200">
              <div
                className="bg-gradient-to-r from-[#14532D] via-[#16A34A] to-[#22C55E] h-full rounded-full transition-all duration-700 shadow-xs"
                style={{
                  width: `${tabTotalQty > 0 ? Math.min(100, (tabSoldQty / tabTotalQty) * 100) : 0}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>0 Pcs</span>
              <span>Target: {tabTotalQty.toLocaleString('id-ID')} Pcs</span>
            </div>
          </div>

          {/* 3 Metrics: Produksi, Terjual, Sisa */}
          <div className="grid grid-cols-3 gap-3 pt-1 border-t border-slate-100">
            <div className="p-3 bg-slate-50 rounded-2xl text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Produksi</span>
              <span className="text-base font-black text-slate-900 block mt-0.5">
                {tabTotalQty.toLocaleString('id-ID')}
              </span>
              <span className="text-[9px] text-slate-500 font-semibold">Pcs</span>
            </div>
            <div className="p-3 bg-blue-50/60 rounded-2xl text-center">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Terjual</span>
              <span className="text-base font-black text-blue-900 block mt-0.5">
                {tabSoldQty.toLocaleString('id-ID')}
              </span>
              <span className="text-[9px] text-blue-600 font-semibold">Pcs</span>
            </div>
            <div className="p-3 bg-emerald-50/60 rounded-2xl text-center">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Sisa Stok</span>
              <span className="text-base font-black text-emerald-950 block mt-0.5">
                {tabRemainingStock.toLocaleString('id-ID')}
              </span>
              <span className="text-[9px] text-emerald-700 font-semibold">Pcs Ready</span>
            </div>
          </div>
        </div>
      )}



      {/* ========================================================================= */}
      {/* 9. FILTER TOOLBAR + CHIPS FILTER AKTIF                                   */}
      {/* ========================================================================= */}
      {viewMode === 'STOK' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3.5">
          {/* Baris Pertama: Search Input + Dropdowns */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Cari Batch / Produk / Catatan..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-2xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all shadow-2xs"
              />
            </div>

            {/* Dropdown Filters Cluster */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Dropdown Varian / Rasa (Muncul jika activeTab === 'susu_rasa') */}
              {activeTab === 'susu_rasa' && availableVariants.length > 1 && (
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-2xl px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-white transition-all">
                  <span className="text-slate-400 text-[11px] font-semibold">Rasa:</span>
                  <select
                    value={selectedVariantFilter}
                    onChange={(e) => {
                      setSelectedVariantFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-800 pr-1"
                  >
                    <option value="ALL">Semua Rasa</option>
                    {availableVariants.map((v) => (
                      <option key={v} value={v}>
                        {getShortFlavorName(v)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Dropdown Kemasan */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-2xl px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-white transition-all">
                <span className="text-slate-400 text-[11px] font-semibold">Kemasan:</span>
                <select
                  value={selectedSizeFilter}
                  onChange={(e) => {
                    setSelectedSizeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-800 pr-1"
                >
                  <option value="ALL">Semua Kemasan ({availableSizes.length})</option>
                  {availableSizes.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dropdown Periode */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-2xl px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-white transition-all">
                <span className="text-slate-400 text-[11px] font-semibold">Periode:</span>
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
                  <option value="CUSTOM">Rentang Tanggal...</option>
                </select>
              </div>

              {/* Dropdown Status */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-2xl px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-white transition-all">
                <span className="text-slate-400 text-[11px] font-semibold">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-800 pr-1"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="AVAILABLE">Tersedia (&gt;0)</option>
                  <option value="EMPTY">Habis (0)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Rentang Tanggal Khusus (Jika timeFilter === 'CUSTOM') */}
          {timeFilter === 'CUSTOM' && (
            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-300 w-fit animate-in fade-in duration-150">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-700">Rentang:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
              />
              <span className="text-xs text-slate-400 font-bold">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
              />
            </div>
          )}

          {/* Baris Kedua: Chips Filter Aktif */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" />
              <span>Filter Aktif:</span>
            </span>

            {activeFilters.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200"
              >
                <span>{chip.label}</span>
                {!chip.isStatic && chip.onClear && (
                  <button
                    type="button"
                    onClick={chip.onClear}
                    className="hover:text-rose-600 p-0.5"
                    title="Hapus filter ini"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}

            {hasNonDefaultFilters && (
              <button
                type="button"
                onClick={handleResetAllFilters}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 underline px-2 py-0.5 transition-colors"
              >
                Reset Semua
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. TABEL BATCH PRODUK MODERN (MODE: STOK)                                */}
      {/* ========================================================================= */}
      {viewMode === 'STOK' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4">
          {/* Header Info Tabel */}
          <div className="p-5 sm:p-6 pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base font-black text-slate-900">
              Daftar Susu Olahan
            </h3>

            {/* Page Size Selector */}
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold self-start sm:self-auto">
              <span>Tampilkan:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option value={10}>10 Baris</option>
                <option value={25}>25 Baris</option>
                <option value={50}>50 Baris</option>
                <option value={100}>Semua</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          {unifiedStockRows.length === 0 ? (
            <div className="p-12 text-center">
              <EmptyState
                title="Tidak Ada Batch Produk Olahan"
                description="Tidak ditemukan batch produk olahan untuk kategori dan filter yang Anda pilih."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#1E3F20] text-white font-extrabold uppercase text-[11px] border-b border-[#2d5e31] sticky top-0 z-10 select-none shadow-2xs" style={{ backgroundColor: '#1E3F20' }}>
                  <tr>
                    <th className="py-3.5 px-3 text-center w-[1%] whitespace-nowrap text-white font-bold">No</th>
                    <th className="py-3.5 px-4 whitespace-nowrap text-white font-bold">Tanggal / Batch</th>
                    <th className="py-3.5 px-4 whitespace-nowrap text-white font-bold">Produk & Varian</th>
                    <th className="py-3.5 px-4 whitespace-nowrap text-white font-bold">Kemasan</th>
                    <th className="py-3.5 px-4 text-right whitespace-nowrap text-white font-bold">Stok Awal</th>
                    <th className="py-3.5 px-4 text-right whitespace-nowrap text-white font-bold">Masuk</th>
                    <th className="py-3.5 px-4 text-right whitespace-nowrap text-white font-bold">Total</th>
                    <th className="py-3.5 px-4 text-right whitespace-nowrap text-white font-bold">Terjual</th>
                    <th className="py-3.5 px-4 text-right whitespace-nowrap font-black text-white">Stok Akhir</th>
                    <th className="py-3.5 px-3 text-center w-[1%] whitespace-nowrap text-white font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {paginatedStockRows.map((pkg, idx) => {
                    const rowNumber = (currentPage - 1) * pageSize + idx + 1;
                    const unitLabel = pkg.kemasan?.toLowerCase().includes('cup')
                      ? 'Cup'
                      : pkg.kemasan?.toLowerCase().includes('bantal')
                      ? 'Bantal'
                      : pkg.kemasan?.toLowerCase().includes('botol')
                      ? 'Botol'
                      : 'Pcs';

                    const isLowStock = pkg.sisaHariIni <= 50 && pkg.sisaHariIni > 0;
                    const isEmptyStock = pkg.sisaHariIni === 0;

                    return (
                      <tr
                        key={pkg.id || idx}
                        className="hover:bg-slate-50/90 transition-colors group"
                      >
                        {/* No */}
                        <td className="py-3.5 px-3 text-center text-slate-400 font-bold w-[1%] whitespace-nowrap">
                          {rowNumber}
                        </td>

                        {/* Tanggal */}
                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                          {new Date(pkg.tanggal || pkg.date).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>

                        {/* Produk / Varian */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex px-2.5 py-1 rounded-xl text-xs font-bold text-slate-800 bg-slate-100/70 border border-slate-200/80">
                            {pkg.jenisProduk}
                          </span>
                        </td>

                        {/* Kemasan */}
                        <td className="py-3.5 px-4 font-semibold text-slate-600 whitespace-nowrap">
                          {pkg.kemasan}
                        </td>

                        {/* Stok Awal */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {pkg.sisaKemarin > 0 ? (
                            <span className="font-semibold text-slate-700 font-mono">
                              {pkg.sisaKemarin.toLocaleString('id-ID')}{' '}
                              <span className="text-[10px] font-normal text-slate-400">{unitLabel}</span>
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* Masuk */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <span className="font-semibold text-slate-800 font-mono">
                            {pkg.masukBaru.toLocaleString('id-ID')}{' '}
                            <span className="text-[10px] font-normal text-slate-400">{unitLabel}</span>
                          </span>
                        </td>

                        {/* Total */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap font-bold text-slate-900 font-mono">
                          {pkg.totalStok.toLocaleString('id-ID')}{' '}
                          <span className="text-[10px] font-normal text-slate-400">{unitLabel}</span>
                        </td>

                        {/* Terjual */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {pkg.terjual > 0 ? (
                            <span className="font-semibold text-slate-700 font-mono">
                              {pkg.terjual.toLocaleString('id-ID')}{' '}
                              <span className="text-[10px] font-normal text-slate-400">{unitLabel}</span>
                            </span>
                          ) : (
                            <span className="text-slate-300">0</span>
                          )}
                        </td>

                        {/* Stok Akhir */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <span className="font-bold text-slate-900 font-mono">
                            {pkg.sisaHariIni.toLocaleString('id-ID')}{' '}
                            <span className="text-[10px] font-normal text-slate-500">{unitLabel}</span>
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-3 text-center whitespace-nowrap w-[1%]">
                          {isEmptyStock ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900">
                              <span className="w-4 h-4 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                                <X className="w-2.5 h-2.5 text-rose-700 stroke-[3]" />
                              </span>
                              <span>Habis</span>
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900">
                              <span className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-2.5 h-2.5 text-amber-700 stroke-[2.5]" />
                              </span>
                              <span>Menipis</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900">
                              <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                <Check className="w-2.5 h-2.5 text-emerald-700 stroke-[3]" />
                              </span>
                              <span>Tersedia</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                {/* Table Footer with Summary */}
                <tfoot className="bg-slate-50 text-slate-800 font-extrabold border-t-2 border-slate-200">
                  <tr>
                    <td colSpan={4} className="py-3.5 px-4 text-center text-xs uppercase tracking-wider text-slate-600">
                      TOTAL KESELURUHAN
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs font-mono text-slate-500">
                      -
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs font-mono text-slate-800">
                      {unifiedTotalMasuk.toLocaleString('id-ID')} Pcs
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs font-mono text-slate-900 font-black">
                      {unifiedTotalMasuk.toLocaleString('id-ID')} Pcs
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs font-mono text-slate-700">
                      {unifiedTotalTerjual.toLocaleString('id-ID')} Pcs
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs font-mono text-slate-900 font-black">
                      {unifiedTotalSisaAkhir.toLocaleString('id-ID')} Pcs
                    </td>
                    <td className="py-3.5 px-3 text-center text-[11px] text-slate-500 font-semibold">
                      Sisa Stok Ready
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Table Pagination Footer */}
          {unifiedStockRows.length > pageSize && (
            <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 font-semibold">
              <span>
                Menampilkan halaman {currentPage} dari {totalStockPages} ({unifiedStockRows.length} total baris)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 bg-[#14532D] text-white rounded-xl font-bold">
                  {currentPage}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalStockPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* GRAFIK PENJUALAN UHT (DI BAGIAN PALING BAWAH)                             */}
      {/* ========================================================================= */}
      {viewMode === 'STOK' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800">
                  <BarChart3 className="w-4 h-4 text-emerald-700" />
                </div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                  Grafik Penjualan UHT
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Tren volume penjualan harian produk olahan UHT
              </p>
            </div>

            {/* Timeframe Filter Buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setChartTimeframe('7')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  chartTimeframe === '7'
                    ? 'bg-[#14532D] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                7 Hari
              </button>
              <button
                type="button"
                onClick={() => setChartTimeframe('30')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  chartTimeframe === '30'
                    ? 'bg-[#14532D] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                30 Hari
              </button>
              <button
                type="button"
                onClick={() => setChartTimeframe('ALL')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  chartTimeframe === 'ALL'
                    ? 'bg-[#14532D] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua
              </button>
            </div>
          </div>

          {/* Interactive SVG Line / Area Chart */}
          <div className="pt-2">
            {chartData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Belum ada rekaman riwayat penjualan olahan untuk divisualisasikan.
              </div>
            ) : (
              (() => {
                const maxVal = Math.max(...chartData.map((d) => d.value), 10);
                const width = 600;
                const height = 180;
                const padding = 25;
                const chartW = width - padding * 2;
                const chartH = height - padding * 2;

                const points = chartData.map((d, i) => {
                  const x = padding + (chartData.length === 1 ? chartW / 2 : (i / (chartData.length - 1)) * chartW);
                  const y = height - padding - (d.value / maxVal) * chartH;
                  return { ...d, x, y };
                });

                const linePath = points.reduce((acc, p, i) => {
                  return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
                }, '');

                const areaPath = points.length > 0
                  ? `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
                  : '';

                return (
                  <div className="space-y-3">
                    <div className="relative w-full h-48">
                      <svg
                        viewBox={`0 0 ${width} ${height}`}
                        className="w-full h-full overflow-visible"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <linearGradient id="chartGreenBlue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22C55E" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Horizontal Grid Guidelines */}
                        <line
                          x1={padding}
                          y1={padding}
                          x2={width - padding}
                          y2={padding}
                          stroke="#E2E8F0"
                          strokeDasharray="4 4"
                        />
                        <line
                          x1={padding}
                          y1={padding + chartH / 2}
                          x2={width - padding}
                          y2={padding + chartH / 2}
                          stroke="#E2E8F0"
                          strokeDasharray="4 4"
                        />
                        <line
                          x1={padding}
                          y1={height - padding}
                          x2={width - padding}
                          y2={height - padding}
                          stroke="#CBD5E1"
                        />

                        {/* Gradient Area Fill */}
                        {areaPath && (
                          <path d={areaPath} fill="url(#chartGreenBlue)" />
                        )}

                        {/* Smooth Line */}
                        {linePath && (
                          <path
                            d={linePath}
                            fill="none"
                            stroke="#16A34A"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )}

                        {/* Interactive Points */}
                        {points.map((p, idx) => (
                          <g
                            key={p.date || idx}
                            onMouseEnter={() => setHoveredPoint(p)}
                            onMouseLeave={() => setHoveredPoint(null)}
                            className="cursor-pointer"
                          >
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r={hoveredPoint?.date === p.date ? 6 : 4}
                              fill={hoveredPoint?.date === p.date ? '#14532D' : '#22C55E'}
                              stroke="#FFFFFF"
                              strokeWidth="2"
                              className="transition-all duration-150"
                            />
                          </g>
                        ))}
                      </svg>

                      {/* Hover Tooltip Overlay */}
                      {hoveredPoint && (
                        <div
                          className="absolute bg-slate-900 text-white text-[10px] px-3 py-1.5 rounded-xl shadow-xl border border-slate-700 pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-2 z-20 whitespace-nowrap"
                          style={{
                            left: `${(hoveredPoint.x / width) * 100}%`,
                            top: `${(hoveredPoint.y / height) * 100}%`,
                          }}
                        >
                          <span className="font-bold text-slate-300 block">{hoveredPoint.label}</span>
                          <span className="text-emerald-400 font-black text-xs">{hoveredPoint.value.toLocaleString('id-ID')} Pcs Terjual</span>
                        </div>
                      )}
                    </div>

                    {/* X-Axis Date Labels */}
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-2">
                      {chartData.length > 0 && <span>{chartData[0].label}</span>}
                      {chartData.length > 2 && (
                        <span>{chartData[Math.floor(chartData.length / 2)].label}</span>
                      )}
                      {chartData.length > 1 && (
                        <span>{chartData[chartData.length - 1].label}</span>
                      )}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: RIWAYAT PENJUALAN PRODUK OLAHAN                                   */}
      {/* ========================================================================= */}
      {viewMode === 'PENJUALAN' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <h2 className="text-base font-black text-slate-900">
              Daftar Transaksi Penjualan Olahan
            </h2>

            <button
              onClick={() => handleOpenSaleModal()}
              className="inline-flex items-center gap-2 bg-[#14532D] hover:bg-[#0f3e22] text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-300" />
              <span>+ Input Penjualan</span>
            </button>
          </div>

          {sortedSalesHistory.length === 0 ? (
            <div className="py-12 text-center">
              <EmptyState
                title="Belum Ada Transaksi Penjualan Olahan"
                description="Belum ada transaksi penjualan yang tercatat dalam sistem."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#1E3F20] text-white font-extrabold uppercase text-[11px] border-b border-[#2d5e31] select-none" style={{ backgroundColor: '#1E3F20' }}>
                  <tr>
                    <th className="py-3 px-3 text-center w-[1%] whitespace-nowrap text-white font-bold">No</th>
                    <th className="py-3 px-4 whitespace-nowrap text-white font-bold">Tanggal</th>
                    <th className="py-3 px-4 whitespace-nowrap text-white font-bold">Produk</th>
                    <th className="py-3 px-4 whitespace-nowrap text-white font-bold">Kemasan</th>
                    <th className="py-3 px-4 whitespace-nowrap text-white font-bold">Ukuran</th>
                    <th className="py-3 px-4 whitespace-nowrap text-white font-bold">Tujuan</th>
                    <th className="py-3 px-4 text-right font-black whitespace-nowrap text-white">Jumlah</th>
                    <th className="py-3 px-4 whitespace-nowrap text-white font-bold">Catatan</th>
                    <th className="py-3 px-4 whitespace-nowrap text-white font-bold">Petugas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {paginatedSalesRows.map((s, idx) => {
                    const rowNum = (salesPage - 1) * salesPageSize + idx + 1;
                    const matchedPkg = packagings.find((p) => p.id === s.produkRefId);
                    const productName = matchedPkg?.jenisProduk || s.productCategory || 'Produk Olahan';
                    const kemasanFull = matchedPkg?.kemasan || '';
                    
                    let kemasanType = 'Botol';
                    let ukuran = '250 ml';
                    if (kemasanFull) {
                      if (kemasanFull.toLowerCase().includes('cup')) kemasanType = 'Cup';
                      else if (kemasanFull.toLowerCase().includes('bantal')) kemasanType = 'Bantal';
                      else if (kemasanFull.toLowerCase().includes('pack')) kemasanType = 'Pack';
                      else kemasanType = 'Botol';

                      if (kemasanFull.toLowerCase().includes('115')) ukuran = '115 ml';
                      else if (kemasanFull.toLowerCase().includes('250')) ukuran = '250 ml';
                      else if (kemasanFull.toLowerCase().includes('130')) ukuran = '130 ml';
                      else if (kemasanFull.toLowerCase().includes('200')) ukuran = '200 ml';
                      else if (kemasanFull.toLowerCase().includes('100')) ukuran = '100 gram';
                    }

                    const tujuan = s.pembeli || 'SPPG';
                    const qty = s.jumlah || s.quantity || 0;

                    return (
                      <tr key={s.id || idx} className="hover:bg-slate-50/90 transition-colors">
                        <td className="py-3.5 px-3 text-center text-slate-400 font-bold w-[1%] whitespace-nowrap">{rowNum}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                          {new Date(s.tanggal || s.date).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                          {productName}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap">{kemasanType}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap">{ukuran}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap">
                          {tujuan}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-slate-900 whitespace-nowrap font-mono">
                          {qty.toLocaleString('id-ID')} <span className="text-[10px] font-normal text-slate-500">{kemasanType}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-xs">
                          {s.catatan || s.notes || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap text-xs">
                          {s.createdBy?.name || 'Admin Pemasaran'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-100 text-slate-900 font-extrabold border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={6} className="py-3.5 px-4 text-center text-xs font-black uppercase tracking-wider">
                      TOTAL KESELURUHAN
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-950 text-xs font-mono">
                      {totalSalesQty.toLocaleString('id-ID')} Pcs
                    </td>
                    <td colSpan={2} className="py-3.5 px-4 text-xs text-slate-500 font-semibold text-left">
                      Total unit produk olahan yang telah disalurkan / terjual
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Sales Table Pagination */}
          {sortedSalesHistory.length > salesPageSize && (
            <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 font-semibold">
              <span>
                Menampilkan halaman {salesPage} dari {totalSalesPages} ({sortedSalesHistory.length} total transaksi)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={salesPage <= 1}
                  onClick={() => setSalesPage(prev => prev - 1)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 bg-[#14532D] text-white rounded-xl font-bold">
                  {salesPage}
                </span>
                <button
                  type="button"
                  disabled={salesPage >= totalSalesPages}
                  onClick={() => setSalesPage(prev => prev + 1)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: INPUT PENJUALAN PRODUK OLAHAN                                      */}
      {/* ========================================================================= */}
      {showSaleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl border border-slate-100 space-y-5 my-8 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                INPUT PENJUALAN PRODUK OLAHAN
              </h3>

              <button
                type="button"
                onClick={() => setShowSaleModal(false)}
                className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
                title="Tutup"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handleSubmitSale} className="space-y-4">
              {/* Tanggal Transaksi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Transaksi</label>
                <input
                  type="date"
                  required
                  value={distributionDate}
                  onChange={(e) => setDistributionDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Header DAFTAR PRODUK + Tambah Baris */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-black tracking-wider uppercase text-emerald-900">
                  DAFTAR PRODUK PENJUALAN:
                </span>
                <button
                  type="button"
                  onClick={handleAddDistributionProduct}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-black transition-all bg-emerald-100 hover:bg-emerald-200 text-emerald-900"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Tambah Produk</span>
                </button>
              </div>

              {/* List of Product Boxes */}
              <div className="space-y-3 max-h-[42vh] overflow-y-auto pr-1">
                {distributionProducts.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl space-y-3 relative transition-all shadow-2xs bg-emerald-50/40 border border-emerald-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-900">
                        Produk #{idx + 1}
                      </span>
                      {distributionProducts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDistributionProduct(item.id)}
                          className="text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus baris ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Tujuan <span className="text-[10px] text-emerald-700 font-normal">(Bisa diedit)</span>
                        </label>
                        <div className="space-y-1.5">
                          <select
                            value={['SPPG', 'Eduwisata', 'Penjualan Umum'].includes(item.tujuan) ? item.tujuan : 'Lain-lain'}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === 'Lain-lain') {
                                handleUpdateDistributionProduct(item.id, 'tujuan', item.customTujuan || '');
                                handleUpdateDistributionProduct(item.id, 'isCustomTujuan', true);
                              } else {
                                handleUpdateDistributionProduct(item.id, 'tujuan', val);
                                handleUpdateDistributionProduct(item.id, 'isCustomTujuan', false);
                              }
                            }}
                            className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600"
                          >
                            <option value="SPPG">SPPG</option>
                            <option value="Eduwisata">Eduwisata</option>
                            <option value="Penjualan Umum">Penjualan Umum</option>
                            <option value="Lain-lain">Lain-lain (Ketik Kustom...)</option>
                          </select>

                          {(!['SPPG', 'Eduwisata', 'Penjualan Umum'].includes(item.tujuan) || item.isCustomTujuan) && (
                            <input
                              type="text"
                              required
                              placeholder="Ketik keterangan tujuan / nama pembeli..."
                              value={item.customTujuan !== undefined ? item.customTujuan : (['SPPG', 'Eduwisata', 'Penjualan Umum'].includes(item.tujuan) ? '' : item.tujuan)}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleUpdateDistributionProduct(item.id, 'customTujuan', val);
                                handleUpdateDistributionProduct(item.id, 'tujuan', val);
                              }}
                              className="w-full p-2 bg-emerald-50/80 border border-emerald-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 placeholder:text-slate-400 placeholder:font-normal animate-in fade-in duration-150"
                              autoFocus
                            />
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Produk</label>
                        <select
                          value={item.produk}
                          onChange={(e) => handleUpdateDistributionProduct(item.id, 'produk', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600"
                        >
                          <option value="Susu Pasteurisasi Rasa Cokelat">Susu Pasteurisasi Rasa Cokelat</option>
                          <option value="Susu Pasteurisasi Rasa Stroberi">Susu Pasteurisasi Rasa Stroberi</option>
                          <option value="Susu Pasteurisasi Original">Susu Pasteurisasi Original</option>
                          <option value="Yogurt Strawberry">Yogurt Strawberry</option>
                          <option value="Keju">Keju</option>
                          <option value="Susu Pasteurisasi">Susu Pasteurisasi (Umum)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Ukuran</label>
                        <select
                          value={item.ukuran}
                          onChange={(e) => handleUpdateDistributionProduct(item.id, 'ukuran', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600"
                        >
                          <option value="115 ml">115 ml</option>
                          <option value="250 ml">250 ml</option>
                          <option value="130 ml">130 ml</option>
                          <option value="200 ml">200 ml</option>
                          <option value="100 gram">100 gram</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Kemasan</label>
                        <select
                          value={item.kemasan}
                          onChange={(e) => handleUpdateDistributionProduct(item.id, 'kemasan', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600"
                        >
                          <option value="Botol">Botol</option>
                          <option value="Cup">Cup</option>
                          <option value="Bantal">Bantal</option>
                          <option value="Pack">Pack</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Jumlah</label>
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            required
                            placeholder="0"
                            value={item.jumlah}
                            onChange={(e) => handleUpdateDistributionProduct(item.id, 'jumlah', e.target.value)}
                            className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 pr-12 focus:ring-2 focus:ring-emerald-600 font-mono"
                          />
                          <span className="absolute right-3 top-2 text-[11px] font-semibold text-slate-400 pointer-events-none">
                            pcs
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Card */}
              <div className="bg-[#14532D] text-white p-4 rounded-2xl flex items-center justify-between font-black shadow-xs">
                <span className="text-xs tracking-wider uppercase">
                  TOTAL PENJUALAN:
                </span>
                <span className="text-emerald-300 text-base font-mono">
                  {totalComputedPcs.toLocaleString('id-ID')} pcs
                </span>
              </div>

              {/* Catatan Tambahan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
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
                  onClick={() => setShowSaleModal(false)}
                  className="px-5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-2xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingDistribution}
                  className="px-6 py-2.5 text-xs font-black text-white bg-[#14532D] hover:bg-[#0f3e22] disabled:opacity-50 rounded-2xl shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
                >
                  {submittingDistribution ? (
                    <span>Menyimpan...</span>
                  ) : (
                    <span>Simpan Data Penjualan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DAFTAR PERMINTAAN SUSU SEGAR MASUK DARI UNIT PENGOLAHAN (UHT)      */}
      {/* ========================================================================= */}
      {showMilkRequestsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-[#14532D] text-white flex items-center justify-between">
              <h3 className="text-base font-black tracking-tight">
                Permintaan Susu Segar Masuk dari Unit Pengolahan (UHT)
              </h3>

              <button
                onClick={() => setShowMilkRequestsModal(false)}
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-black/30 transition-all cursor-pointer"
                title="Tutup"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Filter Bar */}
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:border-slate-400 transition-all">
                  <span className="text-slate-400 text-xs font-medium">Status:</span>
                  <select
                    value={milkReqTab}
                    onChange={(e) => setMilkReqTab(e.target.value)}
                    className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-800 pr-1 text-xs"
                  >
                    <option value="ALL">Semua ({milkRequests.length})</option>
                    <option value="PENDING">Menunggu Persetujuan ({pendingRequestsCount})</option>
                    <option value="CONFIRMED">Disetujui ({milkRequests.filter(r => r.status === 'DITERIMA' || r.status === 'DISETUJUI' || r.status === 'SIAP_DITERIMA' || r.status === 'SELESAI').length})</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 px-3.5 py-1.5 rounded-xl self-start sm:self-auto">
                <span className="text-[11px] text-emerald-800 font-bold">Total Diserahkan:</span>
                <span className="text-emerald-950 font-mono font-black text-xs sm:text-sm">{totalLitersDiserahkan.toLocaleString('id-ID')} Liter</span>
              </div>
            </div>

            {/* Request List */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-3 flex-1">
              {(() => {
                const filteredReqs = milkRequests.filter((r) => {
                  const isPending = r.status === 'MENUNGGU_KONFIRMASI' || r.status === 'DIKIRIM_KE_FARM' || r.status === 'MENUNGGU_PERSETUJUAN';
                  const isConfirmed = r.status === 'DITERIMA' || r.status === 'DISETUJUI' || r.status === 'SIAP_DITERIMA' || r.status === 'SELESAI';
                  if (milkReqTab === 'PENDING') return isPending;
                  if (milkReqTab === 'CONFIRMED') return isConfirmed;
                  return true;
                });

                if (filteredReqs.length === 0) {
                  return (
                    <div className="text-center py-12 space-y-3">
                      <p className="text-xs font-bold text-slate-600">
                        {milkReqTab === 'PENDING'
                          ? 'Tidak ada permintaan susu mentah yang menunggu konfirmasi.'
                          : 'Belum ada data permintaan susu mentah dari Unit Pengolahan.'}
                      </p>
                    </div>
                  );
                }

                return filteredReqs.map((req) => {
                  const details = getBastDetails(req);
                  const isPending = req.status === 'MENUNGGU_KONFIRMASI' || req.status === 'DIKIRIM_KE_FARM' || req.status === 'MENUNGGU_PERSETUJUAN';
                  const dateStr = req.tanggal
                    ? new Date(req.tanggal).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })
                    : (req.date ? new Date(req.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      }) : '-');

                  return (
                    <div
                      key={req.id}
                      className={`p-3.5 sm:px-5 sm:py-3.5 rounded-2xl border transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-3 sm:gap-4 ${
                        isPending
                          ? 'bg-amber-50/40 border-amber-200 shadow-2xs'
                          : 'bg-white border-slate-200/90 hover:border-emerald-300 shadow-2xs'
                      }`}
                    >
                      {/* Info Kiri - Rata & Sejajar Presisi (Lebar Tetap Tiap Kolom) */}
                      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                        <span
                          className="w-[215px] shrink-0 text-center font-mono text-xs font-bold py-1.5 px-2 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 truncate"
                          title={req.nomorBast || req.nomorBa || req.requestNo || 'BA-UHT-20260901-008'}
                        >
                          {req.nomorBast || req.nomorBa || req.requestNo || 'BA-UHT-20260901-008'}
                        </span>
                        <span className="w-[90px] shrink-0 text-center text-xs font-bold text-slate-800">
                          {dateStr}
                        </span>
                        <span className="w-[115px] shrink-0 text-center text-xs font-bold text-slate-700 flex items-center justify-center">
                          {(req.sumber === 'SUSU_KAMBING' || req.animalType === 'KAMBING' || (req.targetOlahan && req.targetOlahan.toLowerCase().includes('kambing'))) ? 'Susu Kambing' : 'Susu Sapi'}
                        </span>
                        {isPending ? (
                          <span className="w-[95px] shrink-0 text-center text-xs font-bold text-amber-600 flex items-center justify-center">
                            Menunggu
                          </span>
                        ) : (
                          <span className="w-[95px] shrink-0 text-center text-xs font-bold text-emerald-700 flex items-center justify-center">
                            Disetujui
                          </span>
                        )}
                      </div>

                      {/* Kotak Aksi Kanan - Simetris & Sejajar Presisi */}
                      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 self-end xl:self-center">
                        <div className="w-28 h-9 px-2 flex items-center justify-center bg-slate-100 text-slate-900 rounded-xl font-mono font-black text-xs sm:text-sm border border-slate-200 shrink-0">
                          <span>{parseFloat(req.volumeLiters || 0).toLocaleString('id-ID')} Liter</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBastForPreview(details);
                            setShowBastPreviewModal(true);
                          }}
                          className="w-9 h-9 flex items-center justify-center bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-300 rounded-xl shadow-2xs transition-all active:scale-95 shrink-0 cursor-pointer"
                          title="Lihat Surat BAST"
                        >
                          <Eye className="w-4 h-4 stroke-[2.2]" />
                        </button>

                        {isPending ? (
                          <button
                            type="button"
                            disabled={confirmingRequestId === req.id}
                            onClick={() => handleConfirmMilkRequest(req.id)}
                            className="w-28 h-9 flex items-center justify-center bg-[#14532D] hover:bg-[#0f3e22] text-white rounded-xl font-bold text-xs transition-all shadow-xs active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer"
                          >
                            {confirmingRequestId === req.id ? 'Memproses...' : 'Setujui'}
                          </button>
                        ) : (
                          <div className="w-28 h-9 hidden xl:block pointer-events-none opacity-0 shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Setiap permintaan yang disetujui otomatis menerbitkan dokumen BAST resmi bertanda tangan.
              </span>
              <button
                type="button"
                onClick={() => setShowMilkRequestsModal(false)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: PREVIEW TEMPLATE RESMI SURAT BAST BBPTUHPT                       */}
      {/* ========================================================================= */}
      {showBastPreviewModal && selectedBastForPreview && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto animate-fadeIn">
          {/* Print Style Injector */}
          <style jsx global>{`
            @media print {
              body * {
                visibility: hidden !important;
              }
              #bast-official-print-area, #bast-official-print-area * {
                visibility: visible !important;
              }
              #bast-official-print-area {
                position: fixed !important;
                left: 0 !important;
                top: 0 !important;
                width: 100vw !important;
                height: auto !important;
                padding: 40px !important;
                margin: 0 !important;
                background: white !important;
                color: black !important;
                box-shadow: none !important;
                border: none !important;
                z-index: 99999 !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}</style>

          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-6">
            {/* Modal Header Bar (Screen Only) */}
            <div className="no-print p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm sm:text-base font-black tracking-tight">
                  Preview Berita Acara Resmi
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#14532D] hover:bg-[#0f3e22] text-white rounded-xl text-xs font-black transition-all shadow-sm active:scale-95 border border-emerald-600/40"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Cetak / Download PDF</span>
                </button>

                <button
                  onClick={() => setShowBastPreviewModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
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
                    BERITA ACARA PERMINTAAN & SERAH TERIMA BAHAN BAKU SUSU SEGAR
                  </h3>
                  <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wide font-serif">
                    UNIT PENGOLAHAN HASIL (UHT) & SEKSI PEMASARAN
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-700 italic font-serif">
                    Dari Seksi Pemasaran Kepada Unit Pengolahan (UHT) & Pengemasan
                  </p>
                  <p className="text-xs font-bold font-mono text-slate-900 pt-1">
                    Nomor: {selectedBastForPreview.nomorBast || selectedBastForPreview.nomorBa || 'BAST-REQ-20260910-001'} {selectedBastForPreview.requestNo ? `(No. Request: ${selectedBastForPreview.requestNo})` : ''}
                  </p>
                </div>

                {/* 3. METADATA BARIS */}
                <div className="text-xs font-serif font-bold text-slate-900 space-y-1.5 pt-2 uppercase">
                  <div className="flex">
                    <span className="w-36">SUMBER BAHAN</span>
                    <span className="mr-2">:</span>
                    <span className="font-semibold font-sans">Gudang Pemasaran / Cold Storage</span>
                  </div>
                  <div className="flex">
                    <span className="w-36">JENIS KOMODITAS</span>
                    <span className="mr-2">:</span>
                    <span className="font-semibold font-sans font-mono">
                      {selectedBastForPreview.animalType === 'KAMBING' || selectedBastForPreview.sumber === 'SUSU_KAMBING' ? 'SUSU SEGAR KAMBING' : 'SUSU SEGAR SAPI'}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-36">TANGGAL</span>
                    <span className="mr-2">:</span>
                    <span className="font-semibold font-sans">
                      {selectedBastForPreview.tanggal
                        ? new Date(selectedBastForPreview.tanggal).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : new Date().toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                    </span>
                  </div>
                </div>

                {/* 4. TABEL RINCIAN PERMINTAAN BAHAN BAKU */}
                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-left border-2 border-black text-xs font-sans border-collapse">
                    <thead>
                      <tr className="border-b-2 border-black bg-slate-50 font-bold text-center">
                        <th className="p-2.5 border-r-2 border-black w-12 text-center">No</th>
                        <th className="p-2.5 border-r-2 border-black text-center">Uraian Bahan Baku</th>
                        <th className="p-2.5 border-r-2 border-black w-36 text-center">Jumlah (Liter)</th>
                        <th className="p-2.5 text-center">Peruntukan Pengolahan</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="min-h-[60px]">
                        <td className="p-3 border-r-2 border-black text-center align-middle font-bold">1</td>
                        <td className="p-3 border-r-2 border-black align-middle font-bold text-black">
                          Susu Segar {selectedBastForPreview.animalType === 'KAMBING' || selectedBastForPreview.sumber === 'SUSU_KAMBING' ? 'Kambing' : 'Sapi'} Bahan Baku
                        </td>
                        <td className="p-3 border-r-2 border-black text-center align-middle font-mono font-bold text-sm">
                          {parseFloat(selectedBastForPreview.volumeLiters || selectedBastForPreview.totalProduksi || 0).toLocaleString('id-ID', { minimumFractionDigits: 1 })} Liter
                        </td>
                        <td className="p-3 align-middle">
                          <span className="font-semibold text-slate-800">
                            {selectedBastForPreview.targetOlahan || selectedBastForPreview.purpose || selectedBastForPreview.processingNeeds || 'Pengolahan Produk Susu UHT / Pasteurisasi'}
                          </span>
                        </td>
                      </tr>
                      {(selectedBastForPreview.notes || selectedBastForPreview.catatan) && (
                        <tr className="border-t-2 border-black bg-slate-50/50">
                          <td colSpan={4} className="p-3 text-xs text-slate-800">
                            <strong>Catatan Permintaan & Serah Terima:</strong> {selectedBastForPreview.notes || selectedBastForPreview.catatan}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 5. TANDA TANGAN DUA PIHAK */}
                <div className="grid grid-cols-2 gap-8 text-center text-xs font-sans pt-8 pb-4">
                  <div className="flex flex-col justify-between h-40">
                    <div>
                      <p className="font-semibold text-slate-800">Yang Menerima / Pemohon,</p>
                      <p className="font-bold uppercase tracking-wide text-slate-950 mt-0.5">
                        {selectedBastForPreview.penerimaNama || 'UNIT PENGOLAHAN (UHT)'}
                      </p>
                    </div>
                    <div className="h-16 flex items-center justify-center">
                      <span className="text-[11px] text-slate-400 italic no-print">( Pemohon Bahan Baku )</span>
                    </div>
                    <p className="font-bold border-t border-slate-400 pt-1 inline-block min-w-[160px]">
                      ( {selectedBastForPreview.penerimaPetugas || 'Petugas Pengolahan UHT'} )
                    </p>
                  </div>

                  <div className="flex flex-col justify-between h-40">
                    <div>
                      <p className="font-semibold text-slate-800">Yang Menyerahkan / Menyetujui,</p>
                      <p className="font-bold uppercase tracking-wide text-slate-950 mt-0.5">
                        {selectedBastForPreview.pengirimNama || 'SEKSI PEMASARAN'}
                      </p>
                    </div>
                    <div className="h-16 flex items-center justify-center">
                      {/* Ruang tanda tangan fisik resmi */}
                    </div>
                    <p className="font-bold border-t border-slate-400 pt-1 inline-block min-w-[160px]">
                      ( {selectedBastForPreview.pengirimPetugas || 'Petugas Pemasaran'} )
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Bar (Screen Only) */}
            <div className="no-print p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 font-medium">
                Nomor Dokumen: <span className="font-mono font-bold text-slate-800">{selectedBastForPreview.nomorBast || 'BA-UHT-20260901-008'}</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBastPreviewModal(false)}
                  className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-2xl transition-colors"
                >
                  Tutup Preview
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#14532D] hover:bg-[#0f3e22] text-white rounded-2xl font-black shadow-md transition-all active:scale-95"
                >
                  <Printer className="w-4 h-4 text-emerald-300" />
                  <span>Cetak / Download PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
