'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';
import BeritaAcaraDocument from '@/components/BeritaAcaraDocument';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Search,
  Eye,
  Send,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowLeft,
  ChevronRight,
  Truck,
  Printer
} from 'lucide-react';

export default function PengemasanPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [packagings, setPackagings] = useState([]);
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Bulk Delete State
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Form Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState(1); // 1 = Category Selection, 2 = Form Input
  const [editingPkg, setEditingPkg] = useState(null);
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formProductCategory, setFormProductCategory] = useState('Susu Olahan Rasa'); // "Susu Olahan Rasa", "Yogurt", "Keju"
  const [formProductSubtype, setFormProductSubtype] = useState('Susu Rasa');
  const [formOrigin, setFormOrigin] = useState('Sapi');
  const [formVariant, setFormVariant] = useState('Original');
  const [formProcessedAmount, setFormProcessedAmount] = useState('');
  const [formPackagingItems, setFormPackagingItems] = useState([
    { id: 1, packagingType: 'Botol', size: '250 ml', quantity: '' }
  ]);
  const [formNotes, setFormNotes] = useState('');

  // UHT Product Specific Form State
  const [uhtProductCategory, setUhtProductCategory] = useState('Susu Olahan Rasa'); // 'Susu Olahan Rasa', 'Yogurt', 'Keju'
  const [uhtVariant, setUhtVariant] = useState('Original');
  const [uhtPackagingType, setUhtPackagingType] = useState('Botol');
  const [uhtPackageSize, setUhtPackageSize] = useState('250 ml');
  const [uhtProcessedAmount, setUhtProcessedAmount] = useState('');
  const [uhtTotalProdQty, setUhtTotalProdQty] = useState('');
  const [uhtAfkirQty, setUhtAfkirQty] = useState('');

  // Excel Structure Category Selection ("HASIL_PENGOLAHAN", "DISTRIBUSI")
  const [selectedMainCategory, setSelectedMainCategory] = useState('HASIL_PENGOLAHAN');

  // Form 2: Hasil Pengolahan
  const [susuFlavor, setSusuFlavor] = useState('Original');
  const [susuPasteurisasiPackaging, setSusuPasteurisasiPackaging] = useState('Botol');
  const [susu115, setSusu115] = useState('');
  const [susu130, setSusu130] = useState('');
  const [susu200, setSusu200] = useState('');
  const [susu250, setSusu250] = useState('');
  const [yogurtFlavor, setYogurtFlavor] = useState('Original');
  const [yogurt200, setYogurt200] = useState('');
  const [kejuPackagingType, setKejuPackagingType] = useState('Kemasan Keju');
  const [keju100, setKeju100] = useState('');
  const [keju250, setKeju250] = useState('');

  // Distribusi Sub-Category State ('MENU', 'PENJUALAN', 'HIBAH', 'AFKIR')
  const [distribusiSubCategory, setDistribusiSubCategory] = useState('MENU');

  // Multi-item lists for each Distribusi component
  const [distSalesItems, setDistSalesItems] = useState([
    { id: 1, target: 'SPPG', product: 'Susu', size: '250 ml', packagingType: 'Botol', quantity: '' }
  ]);
  const [distHibahItems, setDistHibahItems] = useState([
    { id: 1, type: 'Internal - Susu', size: '250 ml', quantity: '' }
  ]);
  const [distAfkirItems, setDistAfkirItems] = useState([
    { id: 1, product: 'Susu', size: '250 ml', quantity: '', reason: 'Produk rusak' }
  ]);

  // Sales item handlers
  const handleAddSalesItem = () => {
    setDistSalesItems(prev => [
      ...prev,
      { id: Date.now(), target: 'SPPG', product: 'Susu', size: '250 ml', packagingType: 'Botol', quantity: '' }
    ]);
  };
  const handleRemoveSalesItem = (id) => {
    if (distSalesItems.length <= 1) return;
    setDistSalesItems(prev => prev.filter(item => item.id !== id));
  };
  const handleUpdateSalesItem = (id, field, value) => {
    setDistSalesItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'product' && value === 'Yogurt') {
          updated.size = '200 ml';
        }
        return updated;
      }
      return item;
    }));
  };

  // Hibah item handlers
  const handleAddHibahItem = () => {
    setDistHibahItems(prev => [
      ...prev,
      { id: Date.now(), type: 'Internal - Susu', size: '250 ml', quantity: '' }
    ]);
  };
  const handleRemoveHibahItem = (id) => {
    if (distHibahItems.length <= 1) return;
    setDistHibahItems(prev => prev.filter(item => item.id !== id));
  };
  const handleUpdateHibahItem = (id, field, value) => {
    setDistHibahItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  // Afkir item handlers
  const handleAddAfkirItem = () => {
    setDistAfkirItems(prev => [
      ...prev,
      { id: Date.now(), product: 'Susu', size: '250 ml', quantity: '', reason: 'Produk rusak' }
    ]);
  };
  const handleRemoveAfkirItem = (id) => {
    if (distAfkirItems.length <= 1) return;
    setDistAfkirItems(prev => prev.filter(item => item.id !== id));
  };
  const handleUpdateAfkirItem = (id, field, value) => {
    setDistAfkirItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  // Detail Modal & Send Confirmation Modal
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [sendingPkg, setSendingPkg] = useState(null);
  const [deletingPkg, setDeletingPkg] = useState(null);
  const [previewBa, setPreviewBa] = useState(null);

  // Incoming Milk Receptions & Production Dropdown
  const [incomingProductions, setIncomingProductions] = useState([]);
  const [discrepancyModalItem, setDiscrepancyModalItem] = useState(null);
  const [discrepancyRecLiters, setDiscrepancyRecLiters] = useState('');
  const [discrepancyNotes, setDiscrepancyNotes] = useState('');
  const [previewFoto, setPreviewFoto] = useState(null);

  const [productions, setProductions] = useState([]);
  const [selectedProductionId, setSelectedProductionId] = useState('');

  const fetchIncoming = async () => {
    try {
      const res = await api.get('/farm/production');
      if (res.data?.success) {
        setIncomingProductions(res.data.data.filter(p => (p.rawVolumeLiters || 0) > 0));
      }
    } catch (e) {
      console.error('Error fetching incoming milk productions:', e);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = '/farm/packaging?';
      if (filterCategory) url += `productCategory=${filterCategory}&`;
      if (filterStatus) url += `status=${filterStatus}&`;
      if (filterDate) url += `date=${filterDate}&`;

      const [pkgRes, prodRes] = await Promise.all([
        api.get(url),
        api.get('/farm/production'),
        fetchIncoming(),
      ]);

      if (pkgRes?.data?.success) {
        setPackagings(pkgRes.data.data);
      }
      if (prodRes?.data?.success) {
        setProductions(prodRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching packaging data:', err);
      setToast({ type: 'error', message: 'Gagal memuat data hasil pengemasan.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterCategory, filterStatus, filterDate]);

  const handleAcceptMilk = async (prod) => {
    try {
      const res = await api.put(`/farm/production/${prod.id}/verify`, { action: 'ACCEPT' });
      if (res.data.success) {
        setToast({ type: 'success', message: res.data.message });
        fetchIncoming();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal memverifikasi penerimaan susu.';
      setToast({ type: 'error', message: msg });
    }
  };

  const handleConfirmDiscrepancy = async (e) => {
    e.preventDefault();
    if (!discrepancyModalItem) return;
    try {
      const res = await api.put(`/farm/production/${discrepancyModalItem.id}/verify`, {
        action: 'DISCREPANCY',
        receivedVolumeLiters: discrepancyRecLiters,
        notes: discrepancyNotes,
      });
      if (res.data.success) {
        setToast({ type: 'success', message: res.data.message });
        setDiscrepancyModalItem(null);
        setDiscrepancyRecLiters('');
        setDiscrepancyNotes('');
        fetchIncoming();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal mencatat selisih volume susu.';
      setToast({ type: 'error', message: msg });
    }
  };

  const canManage = user?.role === 'ADMIN_FARM' || user?.role === 'ADMIN_PENGEMASAN' || user?.role === 'SUPERADMIN';

  // Automated total calculation
  const computedTotalPcs = formPackagingItems.reduce((acc, item) => {
    const qty = parseInt(item.quantity, 10) || 0;
    return acc + Math.max(0, qty);
  }, 0);

  const openAddModal = (initialCategory = null) => {
    setEditingPkg(null);
    setFormDate(new Date().toISOString().split('T')[0]);
    setSelectedProductionId('SUSU_OLAHAN');
    setFormProductCategory('Susu');
    setFormProductSubtype('Susu Pasteurisasi');
    setFormOrigin('Sapi');
    setFormVariant('Original');
    setFormProcessedAmount('');
    setFormPackagingItems([
      { id: Date.now(), packagingType: 'Botol', size: '250 ml', quantity: '' }
    ]);
    setFormNotes('');
    setUhtProcessedAmount('');
    setUhtTotalProdQty('');
    setUhtAfkirQty('');

    // Reset Excel Structure fields
    setSelectedMainCategory(initialCategory || 'HASIL_PENGOLAHAN');
    setSusuPasteurisasiPackaging('Botol');
    setSusu115('');
    setSusu130('');
    setSusu200('');
    setSusu250('');
    setYogurt200('');
    setKeju100('');
    setKeju250('');
    // Reset Distribusi fields & item lists
    setDistribusiSubCategory('MENU');
    setDistSalesItems([
      { id: Date.now(), target: 'SPPG', product: 'Susu', size: '250 ml', packagingType: 'Botol', quantity: '' }
    ]);
    setDistHibahItems([
      { id: Date.now() + 1, type: 'Internal - Susu', size: '250 ml', quantity: '' }
    ]);
    setDistAfkirItems([
      { id: Date.now() + 2, product: 'Susu', size: '250 ml', quantity: '', reason: 'Produk rusak' }
    ]);

    if (initialCategory) {
      setModalStep(2);
    } else {
      setModalStep(1); // Step 1: Category Selection
    }
    setShowModal(true);
  };

  const openEditModal = (p) => {
    if (p.status === 'MENUNGGU_PENERIMAAN' && user?.role !== 'SUPERADMIN' && user?.role !== 'ADMIN_PENGEMASAN') {
      setToast({ type: 'error', message: 'Data yang sedang menunggu penerimaan tidak dapat diubah.' });
      return;
    }

    const originVal = p.origin || (p.animalType === 'KAMBING' ? 'Kambing' : 'Sapi');

    setEditingPkg(p);
    setFormDate(new Date(p.date).toISOString().split('T')[0]);
    setSelectedProductionId(p.productionId || 'SUSU_OLAHAN');
    setFormProductCategory(p.productCategory || 'Susu');
    setFormProductSubtype(p.productSubtype === 'Susu UHT' ? 'Susu Pasteurisasi' : (p.productSubtype || 'Susu Pasteurisasi'));
    setFormOrigin(originVal);
    setFormVariant(originVal === 'Kambing' ? '' : (p.variant || 'Original'));
    setFormProcessedAmount((p.processedAmount || p.processedLiters || 0).toString());
    setFormNotes(p.notes || '');

    let items = [];
    if (p.packagingDetails) {
      try {
        const parsed = JSON.parse(p.packagingDetails);
        if (Array.isArray(parsed) && parsed.length > 0) {
          items = parsed.map((item, idx) => ({
            id: Date.now() + idx,
            packagingType: item.packagingType || 'Botol',
            size: item.size || '250 ml',
            quantity: (item.quantity || 0).toString(),
          }));
        }
      } catch (e) {
        console.error('Error parsing packagingDetails:', e);
      }
    }

    if (items.length === 0) {
      if (p.botolQty > 0) items.push({ id: Date.now() + 1, packagingType: 'Botol', size: '250 ml', quantity: p.botolQty.toString() });
      if (p.cupQty > 0) items.push({ id: Date.now() + 2, packagingType: 'Cup', size: '100 ml', quantity: p.cupQty.toString() });
      if (p.plastikBantalQty > 0) items.push({ id: Date.now() + 3, packagingType: 'Plastik Bantal', size: '200 ml', quantity: p.plastikBantalQty.toString() });
    }

    if (items.length === 0) {
      items.push({ id: Date.now(), packagingType: 'Botol', size: '250 ml', quantity: (p.totalPackagedQty || 0).toString() });
    }

    setFormPackagingItems(items);
    setModalStep(2); // Directly open form for editing
    setShowModal(true);
  };

  const handleAddPackagingItem = () => {
    const isSolid = formProductCategory === 'Keju';
    const defaultSize = isSolid ? '100 gram' : '250 ml';
    setFormPackagingItems(prev => [
      ...prev,
      { id: Date.now(), packagingType: 'Botol', size: defaultSize, quantity: '' }
    ]);
  };

  const handleRemovePackagingItem = (id) => {
    if (formPackagingItems.length <= 1) return;
    setFormPackagingItems(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdatePackagingItem = (id, field, value) => {
    setFormPackagingItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleProductionSelect = (val) => {
    setSelectedProductionId(val);
    if (!val) return;

    if (val === 'SUSU_OLAHAN') {
      setFormProductCategory('Susu');
      setFormProductSubtype('Susu Pasteurisasi');
      setFormOrigin('Sapi');
      setFormVariant('Original');
      return;
    }

    const found = productions.find(p => p.id === val);
    if (found) {
      const typeStr = found.animalType === 'KAMBING' ? 'Kambing' : 'Sapi';
      setFormOrigin(typeStr);
      setFormProductCategory('Susu');
      setFormProductSubtype('Susu Pasteurisasi');
      if (typeStr === 'Kambing') {
        setFormVariant('');
      } else {
        setFormVariant('Original');
      }

      // calculate remaining available milk
      const sisa = Math.max(0, found.rawVolumeLiters - (found.processedLiters || 0));
      if (!formProcessedAmount || parseFloat(formProcessedAmount) > sisa) {
        setFormProcessedAmount(sisa > 0 ? sisa.toString() : '');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const todayStr = new Date().toLocaleDateString('en-CA');
    if (formDate > todayStr) {
      setToast({ type: 'error', message: 'Tanggal pengemasan tidak boleh lebih dari tanggal sekarang' });
      return;
    }

    if (!formProductCategory) {
      setToast({ type: 'error', message: 'Kategori produk wajib dipilih' });
      return;
    }

    const amount = parseFloat(formProcessedAmount) || 0;
    if (amount <= 0) {
      setToast({ type: 'error', message: 'Jumlah liter yang dikemas harus lebih besar dari 0' });
      return;
    }

    // Validation against selected production remaining milk
    if (selectedProductionId && selectedProductionId !== 'SUSU_SEGAR' && selectedProductionId !== 'SUSU_OLAHAN') {
      const foundProd = productions.find(p => p.id === selectedProductionId);
      if (foundProd) {
        const oldAmt = editingPkg ? (editingPkg.processedAmount || editingPkg.processedLiters || 0) : 0;
        const availableSisa = Math.max(0, foundProd.rawVolumeLiters - (foundProd.processedLiters || 0) + (editingPkg?.productionId === selectedProductionId ? oldAmt : 0));
        if (amount > availableSisa) {
          setToast({
            type: 'error',
            message: `Jumlah susu yang akan dikemas (${amount} Liter) melebihi stok susu yang tersedia (${availableSisa} Liter).`
          });
          return;
        }
      }
    }

    const validItems = formPackagingItems.map(i => ({
      packagingType: i.packagingType || 'Botol',
      size: i.size || '',
      quantity: parseInt(i.quantity, 10) || 0,
    }));

    const totalQty = validItems.reduce((acc, curr) => acc + curr.quantity, 0);
    if (totalQty <= 0) {
      setToast({ type: 'error', message: 'Harap masukkan jumlah produk kemasan yang valid (> 0 pcs)' });
      return;
    }

    const isSolid = formProductCategory === 'Keju';
    const unit = isSolid ? 'Kg' : 'Liter';

    const targetProductionId = (selectedProductionId === 'SUSU_SEGAR' || selectedProductionId === 'SUSU_OLAHAN')
      ? null
      : selectedProductionId;

    const finalVariant = formOrigin === 'Sapi' ? (formVariant || 'Original') : null;

    const payload = {
      date: formDate,
      productionId: targetProductionId || null,
      productCategory: formProductCategory,
      productSubtype: formProductCategory === 'Susu' ? formProductSubtype : null,
      origin: formOrigin,
      variant: finalVariant,
      animalType: formOrigin === 'Kambing' ? 'KAMBING' : 'SAPI',
      processedAmount: amount,
      processedUnit: unit,
      packagingItems: validItems,
      notes: formNotes,
      status: 'MENUNGGU_PENERIMAAN',
    };

    try {
      if (editingPkg) {
        const res = await api.put(`/farm/packaging/${editingPkg.id}`, payload);
        if (res.data.success) {
          setToast({ type: 'success', message: 'Data pengemasan berhasil diperbarui!' });
          setShowModal(false);
          fetchData();
        }
      } else {
        const res = await api.post('/farm/packaging', payload);
        if (res.data.success) {
          setToast({
            type: 'success',
            message: `Draft pengemasan Susu ${formOrigin} (${totalQty} pcs) berhasil dikirim! Menunggu konfirmasi Admin Pemasaran.`
          });
          setShowModal(false);
          fetchData();
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menyimpan data pengemasan.';
      setToast({ type: 'error', message: msg });
    }
  };

  const handleSendToMarketing = async () => {
    if (!sendingPkg) return;
    try {
      const res = await api.put(`/farm/packaging/${sendingPkg.id}`, { action: 'SEND' });
      if (res.data.success) {
        setToast({ type: 'success', message: 'Produk berhasil dikirim ke Admin Pemasaran!' });
        setSendingPkg(null);
        fetchData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal mengirim produk ke Pemasaran.';
      setToast({ type: 'error', message: msg });
    }
  };

  const handleDelete = async () => {
    if (!deletingPkg) return;
    try {
      const res = await api.delete(`/farm/packaging/${deletingPkg.id}`);
      if (res.data.success) {
        setToast({ type: 'success', message: 'Data pengemasan berhasil dihapus.' });
        setDeletingPkg(null);
        fetchData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menghapus data pengemasan.';
      setToast({ type: 'error', message: msg });
    }
  };

  const handlePrint = async (ba) => {
    setPreviewBa(ba);
    try {
      if (ba?.id) {
        await api.post(`/berita-acara/${ba.id}/print`);
      }
    } catch (e) {}
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleGenerateOrPrintBa = async (pkg) => {
    try {
      let itemsPayload = [];
      if (pkg.packagingDetails) {
        try {
          itemsPayload = typeof pkg.packagingDetails === 'string' ? JSON.parse(pkg.packagingDetails) : pkg.packagingDetails;
        } catch (e) {}
      }

      const res = await api.get('/berita-acara');
      let existingBa = null;
      if (res.data?.success && Array.isArray(res.data.data)) {
        existingBa = res.data.data.find(b => b.packagingId === pkg.id);
      }

      if (existingBa) {
        let existingItems = [];
        if (existingBa.items) {
          try {
            existingItems = typeof existingBa.items === 'string' ? JSON.parse(existingBa.items) : existingBa.items;
          } catch (e) {}
        }
        if ((!Array.isArray(existingItems) || existingItems.length === 0) && itemsPayload.length > 0) {
          existingBa.items = itemsPayload;
        }
        setPreviewBa(existingBa);
        return;
      }

      const newBaPayload = {
        type: 'SUSU_OLAHAN',
        packagingId: pkg.id,
        date: pkg.date,
        diserahterimakan: pkg.totalPackagedQty || 0,
        unit: 'pcs',
        items: itemsPayload,
        penyerahName: user?.name || pkg.createdBy?.name || 'ADMIN_PENGEMASAN',
        penyerahRole: 'Seksi Pengemasan & Olahan',
        penerimaName: 'Seksi Pemasaran',
        penerimaRole: 'Seksi Pemasaran',
        farmLocation: 'Pengemasan & Olahan',
        status: 'TERKIRIM_KE_PEMASARAN',
        notes: pkg.notes || 'Dibuat otomatis dari hasil pengolahan'
      };

      const createRes = await api.post('/berita-acara', newBaPayload);
      if (createRes.data?.success && createRes.data.data) {
        setPreviewBa(createRes.data.data);
        setToast({ type: 'success', message: 'Berita Acara berhasil dibuat & siap dicetak!' });
      } else {
        const fallbackBa = {
          ...newBaPayload,
          nomorBa: `BAST-OLAHAN/${new Date().getFullYear()}/${(pkg.id || '000').slice(-4).toUpperCase()}`,
        };
        setPreviewBa(fallbackBa);
      }
    } catch (err) {
      console.error('Error creating/fetching Berita Acara for packaging:', err);
      let itemsPayload = [];
      if (pkg.packagingDetails) {
        try {
          itemsPayload = typeof pkg.packagingDetails === 'string' ? JSON.parse(pkg.packagingDetails) : pkg.packagingDetails;
        } catch (e) {}
      }
      setPreviewBa({
        type: 'SUSU_OLAHAN',
        nomorBa: `BAST-OLAHAN/${new Date().getFullYear()}/${(pkg.id || '000').slice(-4).toUpperCase()}`,
        date: pkg.date,
        diserahterimakan: pkg.totalPackagedQty || 0,
        unit: 'pcs',
        items: itemsPayload,
        penyerahName: user?.name || pkg.createdBy?.name || 'ADMIN_PENGEMASAN',
        penerimaName: 'Seksi Pemasaran',
        farmLocation: 'Pengemasan & Olahan',
        status: 'TERKIRIM_KE_PEMASARAN'
      });
    }
  };

  const filteredPackagings = packagings.filter((p) => {
    const q = searchQuery.toLowerCase();
    const cat = (p.productCategory || '').toLowerCase();
    const sub = (p.productSubtype || '').toLowerCase();
    const originStr = (p.origin || p.animalType || '').toLowerCase();
    const varStr = (p.variant || '').toLowerCase();
    const notes = (p.notes || '').toLowerCase();
    const creator = (p.createdBy?.name || '').toLowerCase();
    return cat.includes(q) || sub.includes(q) || originStr.includes(q) || varStr.includes(q) || notes.includes(q) || creator.includes(q);
  });

  const isAllSelected = filteredPackagings.length > 0 && selectedIds.length === filteredPackagings.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPackagings.map(p => p.id));
    }
  };

  const handleToggleSelectOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDeleteSubmit = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleting(true);
    let successCount = 0;
    let failCount = 0;

    for (const id of selectedIds) {
      try {
        const res = await api.delete(`/farm/packaging/${id}`);
        if (res.data?.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        failCount++;
      }
    }

    setIsBulkDeleting(false);
    setShowBulkDeleteModal(false);
    setSelectedIds([]);
    fetchData();

    if (failCount === 0) {
      setToast({ type: 'success', message: `Berhasil menghapus ${successCount} data terpilih!` });
    } else {
      setToast({ type: 'warning', message: `Berhasil menghapus ${successCount} data, ${failCount} gagal.` });
    }
  };

  return (
    <>
      <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-hidden print:hidden">
        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 py-1 px-1">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900">Input Hasil Pengolahan Produk</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Pengolahan susu mentah menjadi Susu Olahan Rasa, Yogurt, dan Keju. Stok produk dan bahan terpotong otomatis secara real-time.
            </p>
          </div>

          {canManage && (
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => openAddModal('HASIL_PENGOLAHAN')}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1E3F20] hover:bg-[#16331a] text-white rounded-2xl text-xs font-bold shadow-md transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Input Hasil Pengolahan</span>
              </button>
            </div>
          )}
        </div>



      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* LEFT: Select All & Bulk Actions */}
        <div className="flex items-center gap-3">
          {filteredPackagings.length > 0 && (
            <label className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 text-xs font-bold cursor-pointer transition-colors select-none">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleToggleSelectAll}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
              <span>{isAllSelected ? 'Batal Pilih Semua' : 'Pilih Semua'}</span>
            </label>
          )}

          {selectedIds.length > 0 && canManage && (
            <button
              type="button"
              onClick={() => setShowBulkDeleteModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95 animate-in fade-in"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus ({selectedIds.length}) Data Terpilih</span>
            </button>
          )}
        </div>

        {/* RIGHT: Search & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-72 md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari produk, varian, atau catatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
          >
            <option value="">Semua Kategori (Susu, Yogurt, Keju)</option>
            <option value="Susu">🥛 Susu</option>
            <option value="Yogurt">🍦 Yogurt</option>
            <option value="Keju">🧀 Keju</option>
          </select>

          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
          />

          {(filterCategory || filterStatus || filterDate || searchQuery) && (
            <button
              onClick={() => {
                setFilterCategory('');
                setFilterStatus('');
                setFilterDate('');
                setSearchQuery('');
              }}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Packaging Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
        {loading ? (
          <div className="p-8 text-center"><LoadingSpinner text="Memuat data pengemasan..." /></div>
        ) : (
          <div className="overflow-auto flex-1 min-h-0">
            <table className="w-full text-left text-xs relative">
              <thead className="sticky top-0 z-10 bg-[#1E3F20] text-white font-bold uppercase tracking-wider shadow-2xs">
                <tr>
                  <th className="py-3.5 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                      title="Pilih Semua"
                    />
                  </th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Tanggal</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Kategori</th>
                  <th className="py-3.5 px-4 min-w-[160px]">Kemasan & Ukuran</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Jumlah</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredPackagings.length > 0 ? (
                  filteredPackagings.map((p) => {
                    const isSelected = selectedIds.includes(p.id);
                    const pCat = p.productCategory || 'Susu';

                    let items = [];
                    if (p.packagingDetails) {
                      try {
                        const parsed = JSON.parse(p.packagingDetails);
                        if (Array.isArray(parsed)) items = parsed;
                      } catch (e) { }
                    }

                    // Extract all unique categories contained in this record
                    let categoriesInRecord = [];
                    if (items.length > 0) {
                      const catSet = new Set();
                      items.forEach(it => {
                        if (it.productCategory) catSet.add(it.productCategory);
                      });
                      categoriesInRecord = Array.from(catSet);
                    }
                    if (categoriesInRecord.length === 0) {
                      categoriesInRecord = [pCat];
                    }

                    return (
                      <tr key={p.id} className={isSelected ? 'bg-amber-50/70 hover:bg-amber-100/70' : 'hover:bg-slate-50'}>
                        <td className="py-3.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectOne(p.id)}
                            className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                          {new Date(p.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex flex-wrap items-center gap-1 font-semibold text-slate-900 text-xs">
                            {categoriesInRecord.map((c, idx) => {
                              const cLower = c.toLowerCase();
                              const isYog = cLower.includes('yogurt');
                              const isKj = cLower.includes('keju');
                              const label = isYog ? 'Yogurt' : isKj ? 'Keju' : (c.includes('Pasteurisasi') || c.includes('Rasa') ? c : 'Susu Pasteurisasi');
                              return (
                                <span key={idx} className="text-slate-900">
                                  {label}{idx < categoriesInRecord.length - 1 ? ',' : ''}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          {items.length > 0 ? (
                            items.map((it, idx) => {
                              let typeLabel = it.packagingType || 'Botol';
                              const cat = (it.productCategory || '').toLowerCase();
                              const pkgLower = typeLabel.toLowerCase();

                              if (cat.includes('yogurt') && !pkgLower.includes('yogurt')) {
                                typeLabel = `Yogurt ${typeLabel}`;
                              } else if ((cat.includes('susu') || !it.productCategory) && !pkgLower.includes('susu') && !pkgLower.includes('yogurt') && !pkgLower.includes('keju')) {
                                typeLabel = `Susu ${typeLabel}`;
                              } else if (cat.includes('keju') && !pkgLower.includes('keju')) {
                                typeLabel = `Keju ${typeLabel}`;
                              }

                              return (
                                <span key={idx} className="block text-slate-700 whitespace-nowrap">
                                  {typeLabel} ({it.size || '-'}){it.variant ? ` (${it.variant})` : ''} - <strong className="font-bold text-slate-900">{it.quantity} pcs</strong>
                                </span>
                              );
                            })
                          ) : (
                            <span className="whitespace-nowrap">{p.packagingType || 'Botol'} ({p.totalPackagedQty} pcs)</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-900 text-xs">
                          {p.totalPackagedQty} pcs
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* 🖨️ CETAK / BUAT BERITA ACARA */}
                            <button
                              type="button"
                              onClick={() => handleGenerateOrPrintBa(p)}
                              className="p-1.5 text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
                              title="Cetak Berita Acara"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            {/* 👁️ LIHAT DETAIL */}
                            <button
                              type="button"
                              onClick={() => setSelectedPkg(p)}
                              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Lihat Detail"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* ✏️ EDIT DATA (CRUD) */}
                            {canManage && (
                              <button
                                type="button"
                                onClick={() => openEditModal(p)}
                                className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit Data"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}

                            {/* 🗑️ HAPUS DATA (CRUD) */}
                            {canManage && (
                              <button
                                type="button"
                                onClick={() => setDeletingPkg(p)}
                                className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Hapus Data"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">Belum ada data hasil pengemasan yang diinput.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FORM MODAL INPUT / EDIT PENGOLAHAN */}
      {showModal && (() => {
        // STEP 1: Product Category Selection
        if (modalStep === 1) {
          return (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                      <Package className="w-5 h-5 text-emerald-700" />
                      <span>INPUT HASIL PENGOLAHAN</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Pilih jenis produk hasil pengolahan divisi UHT:
                    </p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 rounded-lg">✕</button>
                </div>

                {/* 3 Product Category Options */}
                <div className="space-y-3 py-1">
                  {/* Option 1: SUSU OLAHAN RASA */}
                  <div
                    onClick={() => {
                      setUhtProductCategory('Susu Olahan Rasa');
                      setUhtVariant('Original');
                      setUhtPackagingType('Botol');
                      setUhtPackageSize('250 ml');
                      setSelectedMainCategory('HASIL_PENGOLAHAN');
                      setModalStep(2);
                    }}
                    className="group p-4 bg-emerald-50/70 hover:bg-emerald-100/90 border-2 border-emerald-200 hover:border-emerald-500 rounded-2xl cursor-pointer transition-all duration-200 shadow-sm hover:shadow flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-sm group-hover:scale-105 transition-transform">
                        🥛
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-emerald-900 flex items-center gap-2">
                          <span>1. SUSU OLAHAN RASA</span>
                        </h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Original, Cokelat, Melon, Strawberry (Botol/Cup/Bantal)
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-transform shrink-0" />
                  </div>

                  {/* Option 2: YOGURT */}
                  <div
                    onClick={() => {
                      setUhtProductCategory('Yogurt');
                      setUhtVariant('Original');
                      setUhtPackagingType('Cup');
                      setUhtPackageSize('200 ml');
                      setSelectedMainCategory('HASIL_PENGOLAHAN');
                      setModalStep(2);
                    }}
                    className="group p-4 bg-purple-50/70 hover:bg-purple-100/90 border-2 border-purple-200 hover:border-purple-500 rounded-2xl cursor-pointer transition-all duration-200 shadow-sm hover:shadow flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-2xl shadow-sm group-hover:scale-105 transition-transform">
                        🍧
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-purple-900 flex items-center gap-2">
                          <span>2. YOGURT</span>
                        </h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Yogurt Original & Varian Rasa (Cup 200ml / Pack)
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform shrink-0" />
                  </div>

                  {/* Option 3: KEJU */}
                  <div
                    onClick={() => {
                      setUhtProductCategory('Keju');
                      setUhtVariant('Keju Fresh');
                      setUhtPackagingType('Kemasan Keju');
                      setUhtPackageSize('100 gram');
                      setSelectedMainCategory('HASIL_PENGOLAHAN');
                      setModalStep(2);
                    }}
                    className="group p-4 bg-amber-50/70 hover:bg-amber-100/90 border-2 border-amber-200 hover:border-amber-500 rounded-2xl cursor-pointer transition-all duration-200 shadow-sm hover:shadow flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-black text-2xl shadow-sm group-hover:scale-105 transition-transform">
                        🧀
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-amber-900 flex items-center gap-2">
                          <span>3. KEJU</span>
                        </h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Keju Fresh & Keju Olahan (100 gram, 250 gram, dll)
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-amber-600 group-hover:translate-x-1 transition-transform shrink-0" />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          );
        }

        // STEP 2: Sub-form for UHT Processing Input
        if (selectedMainCategory === 'HASIL_PENGOLAHAN' && !editingPkg) {
          // If Keju is specifically selected:
          if (uhtProductCategory === 'Keju') {
            const totalProdNum = parseInt(uhtTotalProdQty, 10) || 0;
            const afkirNum = parseInt(uhtAfkirQty || '0', 10) || 0;
            const netHasilNum = Math.max(0, totalProdNum - afkirNum);

            const handleSaveKejuSubmit = async (e) => {
              if (e && e.preventDefault) e.preventDefault();

              if (totalProdNum <= 0) {
                setToast({ type: 'error', message: 'Jumlah produksi keju harus lebih besar dari 0 pcs' });
                return;
              }

              const procAmt = parseFloat(uhtProcessedAmount) || 0;
              if (procAmt <= 0) {
                setToast({ type: 'error', message: 'Jumlah susu/bahan diproses (Kg) harus lebih besar dari 0' });
                return;
              }

              setSubmitting(true);
              try {
                const payload = {
                  date: formDate,
                  productionId: (selectedProductionId && selectedProductionId !== 'SUSU_SEGAR' && selectedProductionId !== 'SUSU_OLAHAN') ? selectedProductionId : null,
                  productCategory: 'Keju',
                  productSubtype: 'Keju',
                  origin: formOrigin || 'Sapi',
                  variant: uhtVariant,
                  animalType: 'SAPI',
                  processedAmount: procAmt,
                  processedUnit: 'Kg',
                  packagingItems: [
                    {
                      packagingType: uhtPackagingType,
                      size: uhtPackageSize,
                      quantity: totalProdNum
                    }
                  ],
                  totalProductionQty: totalProdNum,
                  afkirQty: afkirNum,
                  netQty: netHasilNum,
                  notes: formNotes,
                  status: 'DITERIMA',
                };

                const res = await api.post('/farm/packaging', payload);
                if (res.data?.success) {
                  setToast({
                    type: 'success',
                    message: `Hasil Pengolahan Keju (${uhtVariant}) berhasil disimpan! Total net: +${netHasilNum} pcs.`
                  });
                  setShowModal(false);
                  fetchData();
                }
              } catch (err) {
                const msg = err.response?.data?.message || 'Gagal menyimpan hasil pengolahan keju.';
                setToast({ type: 'error', message: msg });
              } finally {
                setSubmitting(false);
              }
            };

            return (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setModalStep(1)}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Ganti Produk</span>
                      </button>
                      <div>
                        <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                          <span>🧀 INPUT PENGOLAHAN KEJU</span>
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">Form pengolahan keju divisi UHT</p>
                      </div>
                    </div>
                    <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 rounded-lg">✕</button>
                  </div>

                  <form onSubmit={handleSaveKejuSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Pengolahan</label>
                        <input
                          type="date"
                          value={formDate}
                          onChange={(e) => setFormDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Jenis / Varian Keju</label>
                        <select
                          value={uhtVariant}
                          onChange={(e) => setUhtVariant(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white"
                        >
                          <option value="Keju Fresh">Keju Fresh</option>
                          <option value="Keju Olahan">Keju Olahan</option>
                          <option value="Mozzarella">Mozzarella</option>
                          <option value="Cheddar">Cheddar</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Ukuran / Berat</label>
                        <select
                          value={uhtPackageSize}
                          onChange={(e) => setUhtPackageSize(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white"
                        >
                          <option value="100 gram">100 gram</option>
                          <option value="250 gram">250 gram</option>
                          <option value="500 gram">500 gram</option>
                          <option value="1 kg">1 kg</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Bahan Diproses (Kg)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          placeholder="e.g. 50"
                          value={uhtProcessedAmount}
                          onChange={(e) => setUhtProcessedAmount(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold font-mono"
                          required
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-black text-slate-800 mb-1">Jumlah Produksi (Pcs)</label>
                          <input
                            type="number"
                            min="1"
                            placeholder="0"
                            value={uhtTotalProdQty}
                            onChange={(e) => setUhtTotalProdQty(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-black font-mono"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-rose-700 mb-1">Rusak / Afkir (Pcs)</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={uhtAfkirQty}
                            onChange={(e) => setUhtAfkirQty(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-rose-200 text-xs font-black font-mono bg-rose-50"
                          />
                        </div>
                      </div>

                      <div className="p-3 bg-amber-900 text-white rounded-xl flex items-center justify-between">
                        <span className="text-xs font-bold uppercase">Hasil Bersih Siap Edar:</span>
                        <span className="text-base font-black text-amber-300 font-mono">{netHasilNum} pcs</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Pengolahan (Opsional)</label>
                      <textarea
                        rows="2"
                        placeholder="Catatan..."
                        value={formNotes}
                        onChange={(e) => setFormNotes(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                      ></textarea>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveKejuSubmit}
                        disabled={submitting}
                        className="px-5 py-2 bg-[#1E3F20] text-white rounded-xl text-xs font-bold shadow"
                      >
                        {submitting ? 'Menyimpan...' : 'Simpan Hasil Pengolahan'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            );
          }

          // Matrix Layout (Matching Image 2 exactly for Susu, Yogurt, & Keju)
          const totalHasilPengolahan = (parseInt(susu115) || 0) + (parseInt(susu130) || 0) + (parseInt(susu200) || 0) + (parseInt(susu250) || 0) + (parseInt(yogurt200) || 0) + (parseInt(keju100) || 0) + (parseInt(keju250) || 0);

          const handleSaveHasilPengolahanExcel = async (e) => {
            if (e && e.preventDefault) e.preventDefault();
            const q115 = parseInt(susu115, 10) || 0;
            const q130 = parseInt(susu130, 10) || 0;
            const q200 = parseInt(susu200, 10) || 0;
            const q250 = parseInt(susu250, 10) || 0;
            const qYogurt = parseInt(yogurt200, 10) || 0;
            const qKeju100 = parseInt(keju100, 10) || 0;
            const qKeju250 = parseInt(keju250, 10) || 0;

            if (totalHasilPengolahan <= 0) {
              setToast({ type: 'error', message: 'Harap masukkan minimal 1 produk hasil pengolahan (> 0 pcs).' });
              return;
            }

            const items = [];
            if (q115 > 0) items.push({ productCategory: 'Susu Pasteurisasi', variant: susuFlavor, packagingType: susuPasteurisasiPackaging, size: '115 ml', quantity: q115 });
            if (q130 > 0) items.push({ productCategory: 'Susu Pasteurisasi', variant: susuFlavor, packagingType: susuPasteurisasiPackaging, size: '130 ml', quantity: q130 });
            if (q200 > 0) items.push({ productCategory: 'Susu Pasteurisasi', variant: susuFlavor, packagingType: susuPasteurisasiPackaging, size: '200 ml', quantity: q200 });
            if (q250 > 0) items.push({ productCategory: 'Susu Pasteurisasi', variant: susuFlavor, packagingType: susuPasteurisasiPackaging, size: '250 ml', quantity: q250 });
            if (qYogurt > 0) items.push({ productCategory: 'Yogurt', variant: yogurtFlavor, packagingType: 'Botol', size: '200 ml', quantity: qYogurt });
            if (qKeju100 > 0) items.push({ productCategory: 'Keju', variant: 'Original', packagingType: kejuPackagingType, size: '100 gram', quantity: qKeju100 });
            if (qKeju250 > 0) items.push({ productCategory: 'Keju', variant: 'Original', packagingType: kejuPackagingType, size: '250 gram', quantity: qKeju250 });

            const catList = [];
            if (q115 > 0 || q130 > 0 || q200 > 0 || q250 > 0) catList.push('Susu Pasteurisasi');
            if (qYogurt > 0) catList.push('Yogurt');
            if (qKeju100 > 0 || qKeju250 > 0) catList.push('Keju');

            const primaryCat = catList.length > 0 ? catList[0] : 'Susu Pasteurisasi';

            const approxLiters = ((q115 * 0.115) + (q130 * 0.13) + (q200 * 0.2) + (q250 * 0.25) + (qYogurt * 0.2) + (qKeju100 * 1.0) + (qKeju250 * 2.5));

            setSubmitting(true);
            try {
              const payload = {
                date: formDate,
                productCategory: primaryCat,
                productSubtype: primaryCat,
                origin: 'Sapi',
                variant: uhtVariant || 'Original',
                processedAmount: approxLiters > 0 ? parseFloat(approxLiters.toFixed(2)) : 1,
                processedUnit: 'Liter',
                packagingItems: items,
                totalProductionQty: totalHasilPengolahan,
                afkirQty: 0,
                netQty: totalHasilPengolahan,
                notes: formNotes,
                status: 'DITERIMA',
              };

              const res = await api.post('/farm/packaging', payload);
              if (res.data?.success) {
                setToast({
                  type: 'success',
                  message: `Hasil Pengolahan (${totalHasilPengolahan} pcs) berhasil disimpan! Stok produk & bahan otomatis terpotong.`
                });
                setShowModal(false);
                fetchData();
              }
            } catch (err) {
              const msg = err.response?.data?.message || err.response?.data?.detail || 'Gagal menyimpan hasil pengolahan.';
              setToast({ type: 'error', message: msg });
            } finally {
              setSubmitting(false);
            }
          };

          return (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200 my-auto max-h-[88vh] flex flex-col">
                {/* Header (Fixed) */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setModalStep(1)}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Kembali</span>
                    </button>
                    <div>
                      <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                        <span>📦 INPUT HASIL PENGOLAHAN</span>
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">Input hasil pengemasan produk sesuai ukuran</p>
                    </div>
                  </div>
                  <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 rounded-lg">✕</button>
                </div>

                <form onSubmit={handleSaveHasilPengolahanExcel} className="flex flex-col flex-1 overflow-hidden pt-3">
                  {/* Scrollable Form Body */}
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal</label>
                      <input
                        type="date"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                        required
                      />
                    </div>

                    {/* SUSU PASTEURISASI SECTION */}
                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-emerald-200 pb-2">
                        <label className="text-xs font-black text-emerald-900 uppercase">SUSU PASTEURISASI</label>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-slate-600">Varian Rasa:</span>
                            <select
                              value={susuFlavor}
                              onChange={(e) => setSusuFlavor(e.target.value)}
                              className="px-2.5 py-1 rounded-lg border border-emerald-300 text-xs font-bold text-slate-900 bg-white cursor-pointer"
                            >
                              <option value="Original">Original</option>
                              <option value="Cokelat">Cokelat</option>
                              <option value="Melon">Melon</option>
                              <option value="Strawberry">Strawberry</option>
                              <option value="Moka">Moka</option>
                              <option value="Taro">Taro</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-slate-600">Kemasan:</span>
                            <select
                              value={susuPasteurisasiPackaging}
                              onChange={(e) => setSusuPasteurisasiPackaging(e.target.value)}
                              className="px-2.5 py-1 rounded-lg border border-emerald-300 text-xs font-bold text-slate-900 bg-white cursor-pointer"
                            >
                              <option value="Botol">Botol</option>
                              <option value="Cup">Cup</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Ukuran 115 ml</label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={susu115}
                              onChange={(e) => setSusu115(e.target.value)}
                              className="w-full pl-3 pr-12 py-2 rounded-xl border border-slate-300 text-xs font-bold font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                            <span className="absolute right-3 top-2.5 text-xs font-extrabold text-slate-400">pcs</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Ukuran 130 ml</label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={susu130}
                              onChange={(e) => setSusu130(e.target.value)}
                              className="w-full pl-3 pr-12 py-2 rounded-xl border border-slate-300 text-xs font-bold font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                            <span className="absolute right-3 top-2.5 text-xs font-extrabold text-slate-400">pcs</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Ukuran 200 ml</label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={susu200}
                              onChange={(e) => setSusu200(e.target.value)}
                              className="w-full pl-3 pr-12 py-2 rounded-xl border border-slate-300 text-xs font-bold font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                            <span className="absolute right-3 top-2.5 text-xs font-extrabold text-slate-400">pcs</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Ukuran 250 ml</label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={susu250}
                              onChange={(e) => setSusu250(e.target.value)}
                              className="w-full pl-3 pr-12 py-2 rounded-xl border border-slate-300 text-xs font-bold font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                            <span className="absolute right-3 top-2.5 text-xs font-extrabold text-slate-400">pcs</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* YOGURT SECTION */}
                    <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-purple-200 pb-2">
                        <label className="text-xs font-black text-purple-900 uppercase">YOGURT UKURAN 200 ML (BOTOL)</label>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-slate-600">Varian Rasa:</span>
                          <select
                            value={yogurtFlavor}
                            onChange={(e) => setYogurtFlavor(e.target.value)}
                            className="px-2.5 py-1 rounded-lg border border-purple-300 text-xs font-bold text-slate-900 bg-white cursor-pointer"
                          >
                            <option value="Original">Original</option>
                            <option value="Strawberry">Strawberry</option>
                            <option value="Mangga">Mangga</option>
                            <option value="Anggur">Anggur</option>
                            <option value="Blueberry">Blueberry</option>
                            <option value="Lychee">Lychee</option>
                          </select>
                        </div>
                      </div>

                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={yogurt200}
                          onChange={(e) => setYogurt200(e.target.value)}
                          className="w-full pl-3 pr-12 py-2 rounded-xl border border-slate-300 text-xs font-bold font-mono focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                        <span className="absolute right-3 top-2.5 text-xs font-extrabold text-slate-400">pcs</span>
                      </div>
                    </div>

                    {/* KEJU SECTION */}
                    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
                      <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                        <label className="text-xs font-black text-amber-900 uppercase">KEJU</label>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-slate-600">Jenis Kemasan:</span>
                          <select
                            value={kejuPackagingType}
                            onChange={(e) => setKejuPackagingType(e.target.value)}
                            className="px-2.5 py-1 rounded-lg border border-amber-300 text-xs font-bold text-slate-900 bg-white"
                          >
                            <option value="Kemasan Keju">Kemasan Keju</option>
                            <option value="Pack">Pack</option>
                            <option value="Plastik">Plastik</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Ukuran 100 gram</label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={keju100}
                              onChange={(e) => setKeju100(e.target.value)}
                              className="w-full pl-3 pr-12 py-2 rounded-xl border border-slate-300 text-xs font-bold font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                            />
                            <span className="absolute right-3 top-2.5 text-xs font-extrabold text-slate-400">pcs</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Ukuran 250 gram</label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={keju250}
                              onChange={(e) => setKeju250(e.target.value)}
                              className="w-full pl-3 pr-12 py-2 rounded-xl border border-slate-300 text-xs font-bold font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                            />
                            <span className="absolute right-3 top-2.5 text-xs font-extrabold text-slate-400">pcs</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* TOTAL HASIL PENGOLAHAN BANNER */}
                    <div className="p-3.5 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-md">
                      <span className="text-xs font-bold uppercase tracking-wider">TOTAL HASIL PENGOLAHAN (BOTOL / PCS):</span>
                      <span className="text-base font-black text-amber-400 font-mono">
                        {totalHasilPengolahan} pcs
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Pengolahan (Opsional)</label>
                      <textarea
                        rows="2"
                        placeholder="Catatan..."
                        value={formNotes}
                        onChange={(e) => setFormNotes(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                      ></textarea>
                    </div>
                  </div>

                  {/* Footer (Fixed) */}
                  <div className="flex items-center justify-end gap-2 pt-3 mt-2 border-t border-slate-100 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveHasilPengolahanExcel}
                      disabled={submitting}
                      className="px-5 py-2 bg-[#1E3F20] hover:bg-[#16331a] text-white rounded-xl text-xs font-bold shadow disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                    >
                      {submitting ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <span>Simpan Hasil Pengolahan</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          );
        }



        // --- SUB-FORM 3: DISTRIBUSI ---
        if (selectedMainCategory === 'DISTRIBUSI' && !editingPkg) {
          const handleSaveSalesSubmit = async (e) => {
            if (e && e.preventDefault) e.preventDefault();
            if (submitting) return;

            const validItems = distSalesItems.map(i => ({
              ...i,
              quantity: parseInt(i.quantity, 10) || 0
            })).filter(i => i.quantity > 0);

            if (validItems.length === 0) {
              setToast({ type: 'error', message: 'Harap isi minimal 1 produk penjualan dengan jumlah valid (> 0).' });
              return;
            }

            const totalQty = validItems.reduce((acc, i) => acc + i.quantity, 0);
            setSubmitting(true);

            try {
              const res = await api.post('/pemasaran/distribusi', {
                date: formDate,
                salesItems: validItems,
                notes: formNotes,
              });

              if (res.data?.success) {
                setToast({
                  type: 'success',
                  message: res.data.message || `Data Penjualan (${totalQty} pcs) berhasil disimpan!`,
                });
                setShowModal(false);
                fetchData();
              }
            } catch (err) {
              const msg = err.response?.data?.message || 'Gagal menyimpan data penjualan.';
              setToast({ type: 'error', message: msg });
            } finally {
              setSubmitting(false);
            }
          };

          const handleSaveHibahSubmit = async (e) => {
            if (e && e.preventDefault) e.preventDefault();
            if (submitting) return;

            const validItems = distHibahItems.map(i => ({
              ...i,
              quantity: parseInt(i.quantity, 10) || 0
            })).filter(i => i.quantity > 0);

            if (validItems.length === 0) {
              setToast({ type: 'error', message: 'Harap isi minimal 1 produk hibah dengan jumlah valid (> 0).' });
              return;
            }

            const totalQty = validItems.reduce((acc, i) => acc + i.quantity, 0);
            setSubmitting(true);

            try {
              const res = await api.post('/pemasaran/distribusi', {
                date: formDate,
                hibahItems: validItems,
                notes: formNotes,
              });

              if (res.data?.success) {
                setToast({
                  type: 'success',
                  message: res.data.message || `Data Hibah (${totalQty} botol) berhasil disimpan!`,
                });
                setShowModal(false);
                fetchData();
              }
            } catch (err) {
              const msg = err.response?.data?.message || 'Gagal menyimpan data hibah.';
              setToast({ type: 'error', message: msg });
            } finally {
              setSubmitting(false);
            }
          };

          const handleSaveAfkirSubmit = async (e) => {
            if (e && e.preventDefault) e.preventDefault();
            if (submitting) return;

            const validItems = distAfkirItems.map(i => ({
              ...i,
              quantity: parseInt(i.quantity, 10) || 0
            })).filter(i => i.quantity > 0);

            if (validItems.length === 0) {
              setToast({ type: 'error', message: 'Harap isi minimal 1 produk afkir dengan jumlah valid (> 0).' });
              return;
            }

            const totalQty = validItems.reduce((acc, i) => acc + i.quantity, 0);
            setSubmitting(true);

            try {
              const res = await api.post('/pemasaran/distribusi', {
                date: formDate,
                afkirItems: validItems,
                notes: formNotes,
              });

              if (res.data?.success) {
                setToast({
                  type: 'success',
                  message: res.data.message || `Data Produk Rusak/Afkir (${totalQty} botol) berhasil disimpan!`,
                });
                setShowModal(false);
                fetchData();
              }
            } catch (err) {
              const msg = err.response?.data?.message || 'Gagal menyimpan data produk afkir.';
              setToast({ type: 'error', message: msg });
            } finally {
              setSubmitting(false);
            }
          };

          // A. PILIH KOMPONEN DISTRIBUSI (MENU)
          if (distribusiSubCategory === 'MENU') {
            return (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                          <Truck className="w-5 h-5 text-amber-600" />
                          <span>PILIH KOMPONEN DISTRIBUSI</span>
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">Pilih jenis transaksi distribusi yang ingin diinput.</p>
                      </div>
                    </div>
                    <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 rounded-lg">✕</button>
                  </div>

                  <div className="space-y-3 py-2">
                    {/* Option A: PENJUALAN */}
                    <div
                      onClick={() => setDistribusiSubCategory('PENJUALAN')}
                      className="group p-4 bg-emerald-50/60 hover:bg-emerald-100/70 border-2 border-emerald-200 hover:border-emerald-500 rounded-2xl cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-md group-hover:scale-105 transition-transform">
                          🛒
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-emerald-900 flex items-center gap-2">
                            <span>1. PENJUALAN</span>
                          </h4>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Input penjualan produk (Eduwisata, SPPG, & Lain-lain).
                          </p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                            Bisa tambah multiple produk
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-transform shrink-0" />
                    </div>

                    {/* Option B: HIBAH */}
                    <div
                      onClick={() => setDistribusiSubCategory('HIBAH')}
                      className="group p-4 bg-blue-50/60 hover:bg-blue-100/70 border-2 border-blue-200 hover:border-blue-500 rounded-2xl cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl shadow-md group-hover:scale-105 transition-transform">
                          🎁
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-900 flex items-center gap-2">
                            <span>2. HIBAH</span>
                          </h4>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Input hibah produk susu & yogurt (Internal & Eksternal).
                          </p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-md">
                            Bisa tambah multiple produk
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform shrink-0" />
                    </div>

                    {/* Option C: RUSAK / AFKIR */}
                    <div
                      onClick={() => setDistribusiSubCategory('AFKIR')}
                      className="group p-4 bg-rose-50/60 hover:bg-rose-100/70 border-2 border-rose-200 hover:border-rose-500 rounded-2xl cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black text-2xl shadow-md group-hover:scale-105 transition-transform">
                          ⚠️
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-rose-900 flex items-center gap-2">
                            <span>3. PRODUK RUSAK / AFKIR</span>
                          </h4>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Input pencatatan produk rusak, afkir, atau kadaluwarsa.
                          </p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-md">
                            Bisa tambah multiple produk
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-rose-600 group-hover:translate-x-1 transition-transform shrink-0" />
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          // B. FORM 1: PENJUALAN
          if (distribusiSubCategory === 'PENJUALAN') {
            const totalSalesPcs = distSalesItems.reduce((sum, item) => sum + (parseInt(item.quantity, 10) || 0), 0);

            return (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setDistribusiSubCategory('MENU')}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali</span>
                      </button>
                      <div>
                        <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                          <span>🛒 INPUT DISTRIBUSI PENJUALAN</span>
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">Input penjualan Eduwisata, SPPG, dan Lain-lain</p>
                      </div>
                    </div>
                    <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
                  </div>

                  <form onSubmit={handleSaveSalesSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Transaksi</label>
                      <input
                        type="date"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                        required
                      />
                    </div>

                    {/* DYNAMIC ITEM LIST FOR PENJUALAN */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-amber-900 uppercase tracking-wider">DAFTAR PRODUK PENJUALAN:</label>
                        <button
                          type="button"
                          onClick={handleAddSalesItem}
                          className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Tambah Produk</span>
                        </button>
                      </div>

                      {distSalesItems.map((item, index) => (
                        <div key={item.id} className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3 relative">
                          <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                            <span className="text-xs font-extrabold text-amber-900">Produk #{index + 1}</span>
                            {distSalesItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSalesItem(item.id)}
                                className="p-1 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                                title="Hapus Produk"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">Tujuan</label>
                              <select
                                value={item.target}
                                onChange={(e) => handleUpdateSalesItem(item.id, 'target', e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                              >
                                <option value="EDUWISATA">EDUWISATA</option>
                                <option value="SPPG">SPPG</option>
                                <option value="LAIN-LAIN">LAIN-LAIN</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">Produk</label>
                              <select
                                value={item.product}
                                onChange={(e) => handleUpdateSalesItem(item.id, 'product', e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                              >
                                <option value="Susu">Susu Pasteurisasi</option>
                                <option value="Yogurt">Yogurt</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">Ukuran</label>
                              <select
                                value={item.size}
                                onChange={(e) => handleUpdateSalesItem(item.id, 'size', e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                              >
                                {item.product === 'Susu' ? (
                                  <>
                                    <option value="115 ml">115 ml</option>
                                    <option value="130 ml">130 ml</option>
                                    <option value="200 ml">200 ml</option>
                                    <option value="250 ml">250 ml</option>
                                  </>
                                ) : (
                                  <option value="200 ml">200 ml</option>
                                )}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">Kemasan</label>
                              <select
                                value={item.packagingType}
                                onChange={(e) => handleUpdateSalesItem(item.id, 'packagingType', e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                              >
                                <option value="Botol">Botol</option>
                                <option value="Cup">Cup</option>
                              </select>
                            </div>

                            <div className="col-span-2 sm:col-span-2">
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">Jumlah</label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min="1"
                                  placeholder="0"
                                  value={item.quantity}
                                  onChange={(e) => handleUpdateSalesItem(item.id, 'quantity', e.target.value)}
                                  className="w-full pl-3 pr-14 py-1.5 rounded-xl border border-slate-300 text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-amber-500"
                                />
                                <span className="absolute right-3 top-2 text-xs font-extrabold text-slate-400">pcs</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-3.5 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-md">
                      <span className="text-xs font-bold uppercase tracking-wider">TOTAL PENJUALAN:</span>
                      <span className="text-base font-black text-amber-400 font-mono">
                        {totalSalesPcs} pcs
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
                      <textarea
                        rows="2"
                        placeholder="Catatan..."
                        value={formNotes}
                        onChange={(e) => setFormNotes(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                      ></textarea>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveSalesSubmit}
                        disabled={submitting}
                        className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                      >
                        {submitting ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            <span>Menyimpan...</span>
                          </>
                        ) : (
                          <span>Simpan Data Penjualan</span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            );
          }

          // C. FORM 2: HIBAH
          if (distribusiSubCategory === 'HIBAH') {
            const totalHibahBotol = distHibahItems.reduce((sum, item) => sum + (parseInt(item.quantity, 10) || 0), 0);

            return (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setDistribusiSubCategory('MENU')}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali</span>
                      </button>
                      <div>
                        <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                          <span>🎁 INPUT DISTRIBUSI HIBAH</span>
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">Input hibah produk internal & eksternal</p>
                      </div>
                    </div>
                    <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
                  </div>

                  <form onSubmit={handleSaveHibahSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Transaksi</label>
                      <input
                        type="date"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                    </div>

                    {/* DYNAMIC ITEM LIST FOR HIBAH */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-blue-900 uppercase tracking-wider">DAFTAR PRODUK HIBAH:</label>
                        <button
                          type="button"
                          onClick={handleAddHibahItem}
                          className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Tambah Produk</span>
                        </button>
                      </div>

                      {distHibahItems.map((item, index) => (
                        <div key={item.id} className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3 relative">
                          <div className="flex items-center justify-between border-b border-blue-200/80 pb-2">
                            <span className="text-xs font-extrabold text-blue-900">Hibah #{index + 1}</span>
                            {distHibahItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveHibahItem(item.id)}
                                className="p-1 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                                title="Hapus Hibah"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">Jenis Hibah</label>
                              <select
                                value={item.type}
                                onChange={(e) => handleUpdateHibahItem(item.id, 'type', e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                              >
                                <option value="Internal - Susu">Internal - Susu</option>
                                <option value="Internal - Yogurt">Internal - Yogurt</option>
                                <option value="Eksternal - Susu">Eksternal - Susu</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">Ukuran</label>
                              <select
                                value={item.size}
                                onChange={(e) => handleUpdateHibahItem(item.id, 'size', e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                              >
                                <option value="115 ml">115 ml</option>
                                <option value="130 ml">130 ml</option>
                                <option value="200 ml">200 ml</option>
                                <option value="250 ml">250 ml</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">Jumlah</label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min="1"
                                  placeholder="0"
                                  value={item.quantity}
                                  onChange={(e) => handleUpdateHibahItem(item.id, 'quantity', e.target.value)}
                                  className="w-full pl-3 pr-14 py-1.5 rounded-xl border border-slate-300 text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="absolute right-3 top-2 text-xs font-extrabold text-slate-400">botol</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-3.5 bg-blue-900 text-white rounded-2xl flex items-center justify-between shadow-md">
                      <span className="text-xs font-bold uppercase tracking-wider">TOTAL HIBAH:</span>
                      <span className="text-base font-black text-amber-400 font-mono">
                        {totalHibahBotol} botol
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
                      <textarea
                        rows="2"
                        placeholder="Catatan..."
                        value={formNotes}
                        onChange={(e) => setFormNotes(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                      ></textarea>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveHibahSubmit}
                        disabled={submitting}
                        className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                      >
                        {submitting ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            <span>Menyimpan...</span>
                          </>
                        ) : (
                          <span>Simpan Data Hibah</span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            );
          }

          // D. FORM 3: RUSAK / AFKIR
          if (distribusiSubCategory === 'AFKIR') {
            const totalAfkirBotol = distAfkirItems.reduce((sum, item) => sum + (parseInt(item.quantity, 10) || 0), 0);

            return (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setDistribusiSubCategory('MENU')}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali</span>
                      </button>
                      <div>
                        <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                          <span>⚠️ INPUT PRODUK RUSAK / AFKIR</span>
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">Input pencatatan produk rusak, afkir, atau kadaluwarsa</p>
                      </div>
                    </div>
                    <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
                  </div>

                  <form onSubmit={handleSaveAfkirSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Laporan</label>
                      <input
                        type="date"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-rose-500 outline-none"
                        required
                      />
                    </div>

                    {/* DYNAMIC ITEM LIST FOR AFKIR */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-rose-900 uppercase tracking-wider">DAFTAR PRODUK AFKIR:</label>
                        <button
                          type="button"
                          onClick={handleAddAfkirItem}
                          className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Tambah Produk</span>
                        </button>
                      </div>

                      {distAfkirItems.map((item, index) => (
                        <div key={item.id} className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-3 relative">
                          <div className="flex items-center justify-between border-b border-rose-200/80 pb-2">
                            <span className="text-xs font-extrabold text-rose-900">Produk Afkir #{index + 1}</span>
                            {distAfkirItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveAfkirItem(item.id)}
                                className="p-1 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                                title="Hapus Item Afkir"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">Produk</label>
                              <select
                                value={item.product}
                                onChange={(e) => handleUpdateAfkirItem(item.id, 'product', e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                              >
                                <option value="Susu">Susu</option>
                                <option value="Yogurt">Yogurt</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">Ukuran</label>
                              <select
                                value={item.size}
                                onChange={(e) => handleUpdateAfkirItem(item.id, 'size', e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                              >
                                <option value="115 ml">115 ml</option>
                                <option value="130 ml">130 ml</option>
                                <option value="200 ml">200 ml</option>
                                <option value="250 ml">250 ml</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">Jumlah Rusak/Afkir</label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min="1"
                                  placeholder="0"
                                  value={item.quantity}
                                  onChange={(e) => handleUpdateAfkirItem(item.id, 'quantity', e.target.value)}
                                  className="w-full pl-3 pr-14 py-1.5 rounded-xl border border-slate-300 text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-rose-500"
                                />
                                <span className="absolute right-3 top-2 text-xs font-extrabold text-slate-400">botol</span>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">Alasan Kerusakan</label>
                              <input
                                type="text"
                                placeholder="Misal: Pecah / Kadaluwarsa"
                                value={item.reason}
                                onChange={(e) => handleUpdateAfkirItem(item.id, 'reason', e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-3.5 bg-rose-950 text-white rounded-2xl flex items-center justify-between shadow-md">
                      <span className="text-xs font-bold uppercase tracking-wider">TOTAL PRODUK AFKIR:</span>
                      <span className="text-base font-black text-amber-400 font-mono">
                        {totalAfkirBotol} botol
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
                      <textarea
                        rows="2"
                        placeholder="Catatan..."
                        value={formNotes}
                        onChange={(e) => setFormNotes(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-rose-500 outline-none"
                      ></textarea>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveAfkirSubmit}
                        disabled={submitting}
                        className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold shadow disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                      >
                        {submitting ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            <span>Menyimpan...</span>
                          </>
                        ) : (
                          <span>Simpan Data Afkir</span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            );
          }
        }

        // DEFAULT FALLBACK FOR EDITING EXISTING PACKAGING RECORD
        const isSolid = formProductCategory === 'Keju';
        const amountUnit = isSolid ? 'Kg' : 'Liter';
        const sizeOptions = isSolid
          ? ['50 gram', '100 gram', '250 gram', '500 gram', '1 kg']
          : ['100 ml', '115 ml', '130 ml', '200 ml', '250 ml', '500 ml', '1 Liter'];

        return (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-600" />
                  <span>Edit Hasil Pengemasan Produk</span>
                </h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {editingPkg?.receptionNotes && (
                  <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-2xl space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 font-black text-rose-900">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Catatan Koreksi Pemasaran:</span>
                    </div>
                    <p className="p-2.5 bg-white rounded-xl text-rose-900 font-extrabold border border-rose-200 text-xs shadow-sm">
                      "{editingPkg.receptionNotes}"
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={formDate}
                    max={new Date().toLocaleDateString('en-CA')}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jumlah Bahan yang Diproses ({amountUnit})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formProcessedAmount}
                    onChange={(e) => setFormProcessedAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                    required
                  />
                </div>

                {/* FORM PACKAGING ITEMS */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-800">
                    Rincian Hasil Kemasan Produk <span className="text-rose-500">*</span>
                  </label>

                  <div className="space-y-2">
                    {formPackagingItems.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
                        <div className="col-span-5">
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Jenis Kemasan</label>
                          <select
                            value={item.packagingType}
                            onChange={(e) => handleUpdatePackagingItem(item.id, 'packagingType', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white outline-none"
                            required
                          >
                            <option value="Botol">Botol</option>
                            <option value="Cup">Cup</option>
                            <option value="Plastik Bantal">Plastik Bantal</option>
                            <option value="Pouch">Pouch</option>
                            <option value="Pack">Pack</option>
                          </select>
                        </div>

                        <div className="col-span-4">
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Ukuran</label>
                          <select
                            value={item.size}
                            onChange={(e) => handleUpdatePackagingItem(item.id, 'size', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white outline-none"
                          >
                            {sizeOptions.map(sz => (
                              <option key={sz} value={sz}>{sz}</option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Jumlah</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="pcs"
                            value={item.quantity}
                            onChange={(e) => handleUpdatePackagingItem(item.id, 'quantity', e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 outline-none font-mono"
                            required
                          />
                        </div>

                        <div className="col-span-1 flex justify-center pt-3">
                          <button
                            type="button"
                            onClick={() => handleRemovePackagingItem(item.id)}
                            disabled={formPackagingItems.length <= 1}
                            className="text-rose-500 hover:text-rose-700 disabled:opacity-30 disabled:cursor-not-allowed p-1"
                            title="Hapus kemasan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddPackagingItem}
                    className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 border-dashed rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Tambah Jenis Kemasan</span>
                  </button>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 text-white shadow-sm mt-3">
                    <span className="text-xs font-bold">Total Produk Jadi:</span>
                    <span className="text-sm font-black text-amber-400 font-mono">
                      {computedTotalPcs} pcs
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Pengemasan (Opsional)</label>
                  <textarea
                    rows="2"
                    placeholder="Catatan..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1E3F20] text-white rounded-xl text-xs font-bold hover:bg-[#16331a] shadow"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* DETAIL MODAL */}
      {selectedPkg && (() => {
        const pCat = selectedPkg.productCategory || 'Susu';
        const pSub = selectedPkg.productSubtype || pCat;
        const pOri = selectedPkg.origin || (selectedPkg.animalType === 'KAMBING' ? 'Kambing' : 'Sapi');
        const pVar = selectedPkg.variant || 'Original';
        const pAmt = selectedPkg.processedAmount || selectedPkg.processedLiters || 0;
        const pUnit = selectedPkg.processedUnit || (pCat === 'Keju' ? 'Kg' : 'Liter');

        let items = [];
        if (selectedPkg.packagingDetails) {
          try {
            const parsed = JSON.parse(selectedPkg.packagingDetails);
            if (Array.isArray(parsed)) items = parsed;
          } catch (e) { }
        }

        return (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-600" />
                  <span>Detail Hasil Pengemasan</span>
                </h3>
                <button onClick={() => setSelectedPkg(null)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="font-semibold text-slate-500">Status Transfer:</span>
                  <strong className="text-slate-900 font-black">{selectedPkg.status || 'DRAFT'}</strong>
                </div>

                <div className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="font-semibold text-slate-500">Tanggal Pengemasan:</span>
                  <span className="font-extrabold text-slate-900">
                    {new Date(selectedPkg.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="font-semibold text-slate-500">Kategori / Jenis:</span>
                  <span className="font-extrabold text-slate-900">{pSub} ({pCat})</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="font-semibold text-slate-500">Asal / Varian:</span>
                  <span className="font-extrabold text-slate-900">{pOri} — {pVar}</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="font-semibold text-slate-500">Bahan Diproses:</span>
                  <span className="font-black text-slate-900 text-sm">{pAmt} {pUnit}</span>
                </div>

                <div className="p-3 bg-amber-50/60 rounded-2xl space-y-2 border border-amber-200/60">
                  <span className="font-bold text-amber-900 block text-[11px]">Rincian Hasil Kemasan:</span>

                  {items.length > 0 ? (
                    <div className="space-y-1 font-semibold text-slate-700">
                      {items.map((it, idx) => (
                        <div key={idx} className="flex justify-between border-b border-amber-100/60 pb-1">
                          <span>{it.packagingType} ({it.size || '-'})</span>
                          <span className="font-extrabold text-amber-900">{it.quantity} pcs</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1 font-semibold text-slate-700">
                      <span>Total pcs: {selectedPkg.totalPackagedQty}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-extrabold text-slate-900 pt-1.5 border-t border-amber-200">
                    <span>Total Produk Dikirim:</span>
                    <span className="text-amber-800 font-mono text-sm">{selectedPkg.quantitySent || selectedPkg.totalPackagedQty} pcs</span>
                  </div>
                </div>

                {/* AUDIT TRANSFER INFO */}
                {selectedPkg.sentAt && (
                  <div className="p-3 bg-blue-50/60 rounded-xl space-y-1 text-slate-700">
                    <span className="font-bold text-blue-900 block">Riwayat Pengiriman:</span>
                    <div>Dikirim oleh: <strong>{selectedPkg.sentByName || 'Admin Farm'}</strong></div>
                    <div>Waktu kirim: {new Date(selectedPkg.sentAt).toLocaleString('id-ID')}</div>
                  </div>
                )}

                {selectedPkg.receivedAt && (
                  <div className="p-3 bg-emerald-50/60 rounded-xl space-y-1 text-slate-700">
                    <span className="font-bold text-emerald-900 block">Riwayat Penerimaan:</span>
                    <div>Diterima oleh: <strong>{selectedPkg.receivedByName || 'Admin Pemasaran'}</strong></div>
                    <div>Waktu terima: {new Date(selectedPkg.receivedAt).toLocaleString('id-ID')}</div>
                    <div>Jumlah diterima: <strong>{selectedPkg.quantityReceived} pcs</strong></div>
                    <div>Kondisi: <strong>{selectedPkg.condition}</strong></div>
                  </div>
                )}

                {selectedPkg.receptionNotes && (
                  <div className="space-y-1 pt-1">
                    <span className="font-semibold text-rose-600 block">Catatan Pemasaran:</span>
                    <p className="p-3 bg-rose-50 rounded-xl text-rose-900 font-medium border border-rose-200">{selectedPkg.receptionNotes}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedPkg(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* CONFIRMATION DIALOG: KIRIM KE PEMASARAN */}
      {sendingPkg && (
        <ConfirmModal
          isOpen={!!sendingPkg}
          title="Kirim Produk ke Pemasaran?"
          message={`Produk: ${sendingPkg.productSubtype || sendingPkg.productCategory} (${sendingPkg.variant || 'Original'})\nTotal Jumlah: ${sendingPkg.totalPackagedQty} pcs.\n\nSetelah dikirim, data akan masuk ke daftar Penerimaan Produk Admin Pemasaran dan menunggu konfirmasi.`}
          confirmText="Kirim ke Pemasaran"
          onConfirm={handleSendToMarketing}
          onCancel={() => setSendingPkg(null)}
        />
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!deletingPkg}
        title="Konfirmasi Hapus Data Pengemasan"
        message="Apakah Anda yakin ingin menghapus data hasil pengemasan ini?"
        confirmText="Ya, Hapus Pengemasan"
        onConfirm={handleDelete}
        onCancel={() => setDeletingPkg(null)}
      />

      {/* MODAL LAPORKAN SELISIH */}
      {discrepancyModalItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <span>🟠 Laporkan Selisih Volume Susu</span>
              </h3>
              <button onClick={() => setDiscrepancyModalItem(null)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-1 text-amber-950">
              <p className="font-bold">Informasi Kiriman Farm:</p>
              <p>• Asal Farm: <strong>{discrepancyModalItem.farmOrigin}</strong> ({discrepancyModalItem.animalType})</p>
              <p>• Volume Dikirim Farm: <strong className="text-amber-900">{discrepancyModalItem.rawVolumeLiters} Liter</strong></p>
            </div>

            <form onSubmit={handleConfirmDiscrepancy} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Volume Fisik Sebenarnya Diterima (Liter)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  placeholder="Contoh: 95.5"
                  value={discrepancyRecLiters}
                  onChange={(e) => setDiscrepancyRecLiters(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alasan / Catatan Selisih</label>
                <textarea
                  rows="2"
                  required
                  placeholder="Contoh: Terjadi tumpahan wadah saat perjalanan transport..."
                  value={discrepancyNotes}
                  onChange={(e) => setDiscrepancyNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDiscrepancyModalItem(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 shadow"
                >
                  Simpan Laporan Selisih
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PREVIEW FOTO TIMBANGAN */}
      {previewFoto && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 z-50" onClick={() => setPreviewFoto(null)}>
          <div className="bg-white rounded-3xl max-w-lg w-full p-4 space-y-3 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <span>📷 Foto Timbangan / Wadah Fisik</span>
              </h4>
              <button onClick={() => setPreviewFoto(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>
            <div className="w-full h-80 bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center">
              <img src={previewFoto} alt="Foto Timbangan" className="max-w-full max-h-full object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS MULTIPLE (BULK DELETE) */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xl mx-auto">
              🗑️
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900">Hapus Multiple Data ({selectedIds.length} Entry)</h3>
              <p className="text-xs text-slate-500 font-medium">
                Apakah Anda yakin ingin menghapus <strong className="text-slate-800">{selectedIds.length} data pengemasan/pengolahan</strong> yang terpilih? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(false)}
                disabled={isBulkDeleting}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleBulkDeleteSubmit}
                disabled={isBulkDeleting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isBulkDeleting ? 'Menghapus...' : `Ya, Hapus ${selectedIds.length} Data`}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* MODAL PREVIEW & CETAK BERITA ACARA */}
      {previewBa && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 z-50 overflow-y-auto print:p-0 print:bg-white print:static print:block">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col p-6 shadow-2xl animate-in fade-in zoom-in duration-200 print:p-0 print:shadow-none print:m-0 print:rounded-none print:max-h-none overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 shrink-0 print:hidden">
              <h3 className="font-bold text-slate-900 text-base">Preview Berita Acara</h3>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handlePrint(previewBa)}
                  className="px-4 py-1.5 bg-[#00a86b] hover:bg-[#008f5b] text-white rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewBa(null)}
                  className="text-slate-400 hover:text-slate-600 rounded-full cursor-pointer font-normal text-xl leading-none"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto my-4 pr-1 print:overflow-visible print:my-0 print:pr-0">
              <BeritaAcaraDocument ba={previewBa} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
