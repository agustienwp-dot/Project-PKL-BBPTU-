'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import {
  ShoppingBag,
  Search,
  Filter,
  Package,
  Layers,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';

export default function ProdukSiapEdarPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [packagings, setPackagings] = useState([]);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'Susu Olahan Rasa', 'Yogurt', 'Keju'
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/farm/packaging?t=' + Date.now());
      if (res.data?.success) {
        setPackagings(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching produk siap edar:', err);
      setToast({ type: 'error', message: 'Gagal memuat persediaan produk siap edar.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && packagings.length === 0) {
    return <LoadingSpinner text="Memuat Produk Siap Edar..." />;
  }

  // Aggregate product stock items grouped by Category + Variant + Size + Packaging
  const productGroupMap = {};

  (packagings || []).forEach(p => {
    const catRaw = p.productCategory || 'Susu Olahan Rasa';
    let catGroup = 'Susu Olahan Rasa';
    const catLower = catRaw.toLowerCase();
    if (catLower.includes('yogurt') || (p.productSubtype || '').toLowerCase().includes('yogurt')) {
      catGroup = 'Yogurt';
    } else if (catLower.includes('keju') || (p.productSubtype || '').toLowerCase().includes('keju')) {
      catGroup = 'Keju';
    }

    const variant = p.variant || 'Original';
    const pkgType = p.packagingType || 'Botol';
    const pkgSize = p.packageSize || '250 ml';
    const key = `${catGroup}__${variant}__${pkgSize}__${pkgType}`;

    if (!productGroupMap[key]) {
      productGroupMap[key] = {
        key,
        category: catGroup,
        variant,
        size: pkgSize,
        packagingType: pkgType,
        totalStock: 0,
        lastUpdated: p.updatedAt || p.date
      };
    }

    productGroupMap[key].totalStock += (p.totalPackagedQty || 0);
    if (new Date(p.updatedAt || p.date) > new Date(productGroupMap[key].lastUpdated)) {
      productGroupMap[key].lastUpdated = p.updatedAt || p.date;
    }
  });

  const productList = Object.values(productGroupMap);

  const filteredProducts = productList.filter(p => {
    if (activeTab !== 'ALL' && p.category !== activeTab) return false;
    const q = searchQuery.toLowerCase();
    return p.category.toLowerCase().includes(q) ||
      p.variant.toLowerCase().includes(q) ||
      p.size.toLowerCase().includes(q) ||
      p.packagingType.toLowerCase().includes(q);
  });

  // Calculate summary counts
  const totalSusuRasaPcs = productList.filter(p => p.category === 'Susu Olahan Rasa').reduce((acc, p) => acc + p.totalStock, 0);
  const totalYogurtPcs = productList.filter(p => p.category === 'Yogurt').reduce((acc, p) => acc + p.totalStock, 0);
  const totalKejuPcs = productList.filter(p => p.category === 'Keju').reduce((acc, p) => acc + p.totalStock, 0);
  const totalAllPcs = totalSusuRasaPcs + totalYogurtPcs + totalKejuPcs;

  return (
    <div className="space-y-8 pb-12">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1E3F20] text-white rounded-full text-xs font-bold mb-2">
            <ShoppingBag className="w-4 h-4 text-emerald-200" />
            <span>Divisi UHT / Pengolahan</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Produk Siap Edar</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Katalog persediaan produk olahan (Susu Olahan Rasa, Yogurt, Keju) yang siap diserahterimakan ke Seksi Pemasaran.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-emerald-700" />
          <span>Refresh Stok</span>
        </button>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1E3F20] text-white p-5 rounded-3xl shadow-sm">
          <span className="text-[11px] font-extrabold text-emerald-200 uppercase tracking-wider block">TOTAL PRODUK SIAP EDAR</span>
          <p className="text-3xl font-black text-amber-300 mt-2 font-mono">
            {totalAllPcs.toLocaleString()} <span className="text-xs text-emerald-200 font-bold">pcs</span>
          </p>
          <span className="text-[10px] text-emerald-200 font-semibold block mt-1">Gabungan seluruh varian</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider block">SUSU OLAHAN RASA</span>
          <p className="text-3xl font-black text-slate-900 mt-2 font-mono">
            {totalSusuRasaPcs.toLocaleString()} <span className="text-xs text-slate-400 font-bold">pcs</span>
          </p>
          <span className="text-[10px] text-slate-400 font-semibold block mt-1">Cokelat, Melon, Strawberry, Original</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-extrabold text-purple-800 uppercase tracking-wider block">YOGURT</span>
          <p className="text-3xl font-black text-slate-900 mt-2 font-mono">
            {totalYogurtPcs.toLocaleString()} <span className="text-xs text-slate-400 font-bold">pcs</span>
          </p>
          <span className="text-[10px] text-slate-400 font-semibold block mt-1">Original & Varian Rasa</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider block">KEJU</span>
          <p className="text-3xl font-black text-slate-900 mt-2 font-mono">
            {totalKejuPcs.toLocaleString()} <span className="text-xs text-slate-400 font-bold">pcs</span>
          </p>
          <span className="text-[10px] text-slate-400 font-semibold block mt-1">Fresh & Olahan Keju</span>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Tab Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'ALL' ? 'bg-[#1E3F20] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Produk ({productList.length})
            </button>
            <button
              onClick={() => setActiveTab('Susu Olahan Rasa')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'Susu Olahan Rasa' ? 'bg-[#1E3F20] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Susu Olahan Rasa
            </button>
            <button
              onClick={() => setActiveTab('Yogurt')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'Yogurt' ? 'bg-[#1E3F20] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Yogurt
            </button>
            <button
              onClick={() => setActiveTab('Keju')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'Keju' ? 'bg-[#1E3F20] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Keju
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari varian, ukuran..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        {/* Table of Products */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <th className="py-3.5 px-4">Kelompok Produk</th>
                <th className="py-3.5 px-4">Varian Rasa / Jenis</th>
                <th className="py-3.5 px-4">Ukuran / Kemasan</th>
                <th className="py-3.5 px-4">Stok Siap Edar</th>
                <th className="py-3.5 px-4">Status Persediaan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((item) => {
                  let statusBadge = <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> TERSEDIA</span>;
                  if (item.totalStock <= 0) {
                    statusBadge = <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-extrabold text-[10px] inline-flex items-center gap-1"><XCircle className="w-3 h-3 text-rose-600" /> HABIS</span>;
                  } else if (item.totalStock < 50) {
                    statusBadge = <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-extrabold text-[10px] inline-flex items-center gap-1"><AlertCircle className="w-3 h-3 text-amber-600" /> MENIPIS</span>;
                  }

                  return (
                    <tr key={item.key} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full font-black text-[10px] uppercase border ${
                          item.category === 'Yogurt' ? 'bg-purple-100 text-purple-900 border-purple-200' :
                          item.category === 'Keju' ? 'bg-amber-100 text-amber-900 border-amber-200' :
                          'bg-emerald-100 text-emerald-900 border-emerald-200'
                        }`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {item.variant}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-700">{item.size}</span>
                        <span className="text-slate-400 text-[11px] block">{item.packagingType}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-black text-sm text-slate-900 whitespace-nowrap">
                        {item.totalStock.toLocaleString()} <span className="text-xs font-bold text-slate-400">pcs</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {statusBadge}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs font-medium">
                    Belum ada produk siap edar pada kategori ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
