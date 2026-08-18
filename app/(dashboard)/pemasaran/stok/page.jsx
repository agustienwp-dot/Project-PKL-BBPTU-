'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import exportExcel from '@/lib/exportExcel';
import { 
  Boxes, 
  Plus, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Eye, 
  CheckCircle2, 
  Table,
  Receipt,
  History
} from 'lucide-react';

export default function ProdukKeluarPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Active Tab: 'DAILY' (Rekap Harian - Default) or 'HISTORY' (Riwayat Transaksi)
  const [activeTab, setActiveTab] = useState('DAILY');

  // Core Metrics State
  const [summary, setSummary] = useState({
    totalStokSaatIni: 0,
    totalPenambahan: 0,
    totalPengeluaran: 0,
    stokRendahCount: 0,
  });
  const [piutangSummary, setPiutangSummary] = useState({
    penambahanPiutang: 0,
    penguranganPiutang: 0,
    sisaPiutang: 0,
  });
  const [stokList, setStokList] = useState([]);
  const [outflowsList, setOutflowsList] = useState([]);
  const [masterCodes, setMasterCodes] = useState([]);

  // Tab 1 (Rekap Harian) State & Filters
  const [dailyData, setDailyData] = useState([]);
  const [dailySearch, setDailySearch] = useState('');
  const [dailyMonthFilter, setDailyMonthFilter] = useState('');
  const [dailyYearFilter, setDailyYearFilter] = useState('2026');

  // Tab 2 (Riwayat Transaksi) Filters
  const [historySearch, setHistorySearch] = useState('');
  const [historyCodeFilter, setHistoryCodeFilter] = useState('');

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  // Form Modal Input Data Harian State
  const [dailyModalOpen, setDailyModalOpen] = useState(false);
  const [submittingDaily, setSubmittingDaily] = useState(false);
  const [formDaily, setFormDaily] = useState({
    date: new Date().toISOString().split('T')[0],
    mypi: '',
    hs: '',
    ht: '',
    os: '',
    js: '',
    jsPnb: '',
    bs: '',
    jlb: '',
    blb: '',
    penambahanPiutang: '',
    penguranganPiutang: '',
    notes: '',
  });

  // Fetch Core Summary & Outflows
  const fetchCoreData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pemasaran/stok-keluar');
      if (res.data.success) {
        const { summary, piutangSummary, stokKeteranganList, outflowsList, masterCodes } = res.data.data;
        setSummary(summary || {});
        setPiutangSummary(piutangSummary || {});
        setStokList(stokKeteranganList || []);
        setOutflowsList(outflowsList || []);
        setMasterCodes(masterCodes || []);
      }
    } catch (err) {
      console.error('Error fetching core data:', err);
      setToast({ type: 'error', message: 'Gagal memuat data produk keluar.' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch Rekap Harian (Tab 1)
  const fetchDailyData = async () => {
    try {
      let url = '/pemasaran/daily-outflow?';
      if (dailyMonthFilter) url += `month=${dailyMonthFilter}&`;
      if (dailyYearFilter) url += `year=${dailyYearFilter}&`;

      const res = await api.get(url);
      if (res.data.success) {
        setDailyData(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching daily outflow data:', err);
    }
  };

  useEffect(() => {
    fetchCoreData();
  }, []);

  useEffect(() => {
    fetchDailyData();
  }, [dailyMonthFilter, dailyYearFilter]);

  const canManage = user?.role === 'ADMIN_PEMASARAN' || user?.role === 'SUPERADMIN';

  // Live calculation for Form Rekap Harian Modal
  const numMypi = parseInt(formDaily.mypi || 0, 10);
  const numHs = parseInt(formDaily.hs || 0, 10);
  const numHt = parseInt(formDaily.ht || 0, 10);
  const numOs = parseInt(formDaily.os || 0, 10);
  const numJs = parseInt(formDaily.js || 0, 10);
  const numJsPnb = parseInt(formDaily.jsPnb || 0, 10);
  const numBs = parseInt(formDaily.bs || 0, 10);
  const numJlb = parseInt(formDaily.jlb || 0, 10);
  const numBlb = parseInt(formDaily.blb || 0, 10);

  const totalKeluarInput = numMypi + numHs + numHt + numOs + numJs + numJsPnb + numBs + numJlb + numBlb;
  const liveStockAkhir = Math.max(0, summary.totalStokSaatIni - totalKeluarInput);

  const numPenambahanPiutang = parseInt(formDaily.penambahanPiutang || 0, 10);
  const numPenguranganPiutang = parseInt(formDaily.penguranganPiutang || 0, 10);
  const liveSisaPiutang = Math.max(0, numPenambahanPiutang - numPenguranganPiutang);

  // Handle Form Submit Daily Rekap
  const handleDailySubmit = async (e) => {
    e.preventDefault();
    if (!formDaily.date) {
      setToast({ type: 'error', message: 'Tanggal rekap harian wajib diisi.' });
      return;
    }

    setSubmittingDaily(true);
    try {
      const res = await api.post('/pemasaran/daily-outflow', formDaily);
      if (res.data.success) {
        setToast({ type: 'success', message: res.data.message || 'Rekap harian berhasil disimpan!' });
        setDailyModalOpen(false);
        setFormDaily({
          date: new Date().toISOString().split('T')[0],
          mypi: '', hs: '', ht: '', os: '', js: '', jsPnb: '', bs: '', jlb: '', blb: '',
          penambahanPiutang: '', penguranganPiutang: '', notes: ''
        });
        fetchCoreData();
        fetchDailyData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menyimpan rekap harian.';
      setToast({ type: 'error', message: msg });
    } finally {
      setSubmittingDaily(false);
    }
  };

  // Handle Export Excel for Daily Outflow Rekap
  const handleExportDailyExcel = () => {
    if (dailyData.length === 0) {
      setToast({ type: 'error', message: 'Tidak ada data rekap untuk diexport.' });
      return;
    }
    const data = dailyData.map((d) => ({
      'No': d.no,
      'Tgl': d.tgl,
      'Bln': d.bln,
      'Thn': d.thn,
      'MYPI': d.mypi,
      'HS': d.hs,
      'HT': d.ht,
      'OS': d.os,
      'JS (piutang)': d.js,
      'JS PNBP': d.jsPnb,
      'BS (Piutang)': d.bs,
      'JLB': d.jlb,
      'BLB': d.blb,
      'Stock Akhir': d.stockAkhir,
      'Penambahan piutang': d.penambahanPiutang,
      'Pengurangan piutang': d.penguranganPiutang,
      'Sisa Piutang': d.sisaPiutang,
    }));
    exportExcel(data, `Rekap_Produk_Keluar_Harian_${dailyYearFilter}`);
    setToast({ type: 'success', message: 'Data rekap produk keluar harian berhasil diexport!' });
  };

  // Filtered daily table data
  const filteredDailyData = dailyData.filter((d) => {
    const q = dailySearch.toLowerCase();
    return d.formattedDate.toLowerCase().includes(q) || d.notes.toLowerCase().includes(q);
  });

  // Filtered history table data
  const filteredHistoryData = outflowsList.filter((item) => {
    const q = historySearch.toLowerCase();
    const matchQuery = item.transactionId.toLowerCase().includes(q) ||
      item.keteranganSusu.toLowerCase().includes(q) ||
      (item.destination || '').toLowerCase().includes(q);
    const matchCode = !historyCodeFilter || item.keteranganSusu === historyCodeFilter;
    return matchQuery && matchCode;
  });

  return (
    <div className="space-y-8 pb-12">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header Section (Single Clean Header without duplicate action button) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold mb-2">
            <Boxes className="w-4 h-4" />
            <span>POV Admin Pemasaran</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Produk Keluar</h1>
          <p className="text-xs text-slate-500 font-medium">
            Monitoring dan rekapitulasi pengeluaran stok susu.
          </p>
        </div>
      </div>

      {/* 4 Summary Cards Top Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Stok Saat Ini */}
        <div className="bg-gradient-to-br from-[#1E3F20] to-[#142e16] text-white p-5 rounded-3xl shadow-md space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider block">Total Stok Saat Ini</span>
            <Boxes className="w-5 h-5 text-emerald-300" />
          </div>
          <p className="text-3xl font-black">{summary.totalStokSaatIni?.toLocaleString('id-ID')} <span className="text-xs font-semibold text-emerald-200">pcs</span></p>
          <p className="text-[10px] text-emerald-300 font-medium">Total stok siap digunakan</p>
        </div>

        {/* Card 2: Total Penambahan */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Penambahan</span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-emerald-700">{summary.totalPenambahan?.toLocaleString('id-ID')} <span className="text-xs font-semibold text-slate-500">pcs</span></p>
          <p className="text-[10px] text-emerald-600 font-bold">Dari penerimaan/penambahan stok</p>
        </div>

        {/* Card 3: Total Pengeluaran */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Pengeluaran</span>
            <TrendingDown className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-black text-blue-700">{summary.totalPengeluaran?.toLocaleString('id-ID')} <span className="text-xs font-semibold text-slate-500">pcs</span></p>
          <p className="text-[10px] text-slate-500 font-medium">Total susu keluar</p>
        </div>

        {/* Card 4: Stok Rendah */}
        <div className={`p-5 rounded-3xl shadow-sm border space-y-2 ${
          summary.stokRendahCount > 0 ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold uppercase tracking-wider block opacity-70">Stok Rendah</span>
            <AlertTriangle className={`w-5 h-5 ${summary.stokRendahCount > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
          </div>
          <p className="text-3xl font-black">{summary.stokRendahCount} <span className="text-xs font-semibold">Keterangan</span></p>
          <p className="text-[10px] font-medium opacity-80">
            {summary.stokRendahCount > 0 ? 'Perlu perhatian (< 10 pcs)' : 'Semua stok aman (> 20 pcs)'}
          </p>
        </div>
      </div>

      {/* 2 Main Tabs Navigation */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab('DAILY')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'DAILY' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Table className="w-4 h-4 text-blue-600" />
              <span>Rekap Harian</span>
            </button>

            <button
              onClick={() => setActiveTab('HISTORY')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'HISTORY' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <History className="w-4 h-4 text-emerald-600" />
              <span>Riwayat Transaksi</span>
            </button>
          </div>

          {/* Tab 1 Actions: Export Excel */}
          {activeTab === 'DAILY' && (
            <button
              onClick={handleExportDailyExcel}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-700" />
              <span>Export Rekap Excel</span>
            </button>
          )}
        </div>

        {/* TAB 1: REKAP HARIAN (DEFAULT ACTIVE) */}
        {activeTab === 'DAILY' && (
          <div className="space-y-6">
            {/* Toolbar Filter & Button + Input Data Harian */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[200px]">
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Cari tanggal..."
                    value={dailySearch}
                    onChange={(e) => setDailySearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <select
                  value={dailyMonthFilter}
                  onChange={(e) => setDailyMonthFilter(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="">Semua Bulan</option>
                  <option value="01">01 - Januari</option>
                  <option value="02">02 - Februari</option>
                  <option value="03">03 - Maret</option>
                  <option value="04">04 - April</option>
                  <option value="05">05 - Mei</option>
                  <option value="06">06 - Juni</option>
                  <option value="07">07 - Juli</option>
                  <option value="08">08 - Agustus</option>
                  <option value="09">09 - September</option>
                  <option value="10">10 - Oktober</option>
                  <option value="11">11 - November</option>
                  <option value="12">12 - Desember</option>
                </select>

                <select
                  value={dailyYearFilter}
                  onChange={(e) => setDailyYearFilter(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                </select>

                {(dailySearch || dailyMonthFilter) && (
                  <button
                    onClick={() => {
                      setDailySearch('');
                      setDailyMonthFilter('');
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                  >
                    Reset Filter
                  </button>
                )}
              </div>

              {canManage && (
                <button
                  onClick={() => setDailyModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Input Data Harian</span>
                </button>
              )}
            </div>

            {/* TABEL REKAP HARIAN EXCEL MULTI-KOLOM (18 KOLOM) */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Table className="w-4 h-4 text-blue-600" />
                  <span>Tabel Rekap Pengeluaran Harian ({filteredDailyData.length} Baris)</span>
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1800px] text-left text-sm font-mono border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-800 font-black uppercase text-center text-xs tracking-wider">
                      <th className="py-3.5 px-3.5 border-r border-slate-200 whitespace-nowrap">No</th>
                      <th className="py-3.5 px-3.5 border-r border-slate-200 whitespace-nowrap">Tgl</th>
                      <th className="py-3.5 px-3.5 border-r border-slate-200 whitespace-nowrap">Bln</th>
                      <th className="py-3.5 px-3.5 border-r border-slate-200 whitespace-nowrap">Thn</th>
                      <th className="py-3.5 px-3.5 border-r border-slate-200 bg-emerald-50 text-emerald-900 whitespace-nowrap">MYPI</th>
                      <th className="py-3.5 px-3.5 border-r border-slate-200 bg-emerald-50 text-emerald-900 whitespace-nowrap">HS</th>
                      <th className="py-3.5 px-3.5 border-r border-slate-200 bg-emerald-50 text-emerald-900 whitespace-nowrap">HT</th>
                      <th className="py-3.5 px-3.5 border-r border-slate-200 bg-emerald-50 text-emerald-900 whitespace-nowrap">OS</th>
                      <th className="py-3.5 px-3.5 border-r border-slate-200 bg-amber-50 text-amber-900 whitespace-nowrap">JS (piutang)</th>
                      <th className="py-3.5 px-3.5 border-r border-slate-200 bg-blue-50 text-blue-900 whitespace-nowrap">JS PNBP</th>
                      <th className="py-3.5 px-3.5 border-r border-slate-200 bg-amber-50 text-amber-900 whitespace-nowrap">BS (Piutang)</th>
                      <th className="py-3.5 px-3.5 border-r border-slate-200 bg-purple-50 text-purple-900 whitespace-nowrap">JLB</th>
                      <th className="py-3.5 px-3.5 border-r border-slate-200 bg-purple-50 text-purple-900 whitespace-nowrap">BLB</th>
                      <th className="py-3.5 px-3.5 border-r border-slate-200 bg-slate-900 text-white whitespace-nowrap">Stock Akhir</th>
                      <th className="py-3.5 px-3.5 border-r border-slate-200 bg-amber-50 text-amber-900 whitespace-nowrap">Penambahan piutang</th>
                      <th className="py-3.5 px-3.5 border-r border-slate-200 bg-amber-50 text-amber-900 whitespace-nowrap">Pengurangan piutang</th>
                      <th className="py-3.5 px-3.5 border-r border-slate-200 bg-amber-600 text-white whitespace-nowrap">Sisa Piutang</th>
                      <th className="py-3.5 px-3.5 text-center font-sans whitespace-nowrap">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-bold text-slate-800 text-sm">
                    {filteredDailyData.length > 0 ? (
                      filteredDailyData.map((d) => (
                        <tr key={d.id} className="hover:bg-slate-50 text-right transition-colors">
                          <td className="py-3.5 px-3.5 text-center border-r border-slate-100 font-extrabold">{d.no}</td>
                          <td className="py-3.5 px-3.5 text-center border-r border-slate-100 font-extrabold text-slate-900">{d.tgl}</td>
                          <td className="py-3.5 px-3.5 text-center border-r border-slate-100">{d.bln}</td>
                          <td className="py-3.5 px-3.5 text-center border-r border-slate-100">{d.thn}</td>
                          <td className="py-3.5 px-3.5 border-r border-slate-100 font-extrabold text-emerald-800 bg-emerald-50/30">{d.mypi.toLocaleString('id-ID')}</td>
                          <td className="py-3.5 px-3.5 border-r border-slate-100">{d.hs.toLocaleString('id-ID')}</td>
                          <td className="py-3.5 px-3.5 border-r border-slate-100">{d.ht.toLocaleString('id-ID')}</td>
                          <td className="py-3.5 px-3.5 border-r border-slate-100">{d.os.toLocaleString('id-ID')}</td>
                          <td className="py-3.5 px-3.5 border-r border-slate-100 font-extrabold text-amber-800 bg-amber-50/30">{d.js.toLocaleString('id-ID')}</td>
                          <td className="py-3.5 px-3.5 border-r border-slate-100 font-extrabold text-blue-800 bg-blue-50/30">{d.jsPnb.toLocaleString('id-ID')}</td>
                          <td className="py-3.5 px-3.5 border-r border-slate-100">{d.bs.toLocaleString('id-ID')}</td>
                          <td className="py-3.5 px-3.5 border-r border-slate-100">{d.jlb.toLocaleString('id-ID')}</td>
                          <td className="py-3.5 px-3.5 border-r border-slate-100">{d.blb.toLocaleString('id-ID')}</td>
                          <td className="py-3.5 px-3.5 border-r border-slate-100 font-black text-slate-900 bg-slate-100 text-base">{d.stockAkhir.toLocaleString('id-ID')}</td>
                          <td className="py-3.5 px-3.5 border-r border-slate-100 text-amber-700 font-extrabold">{d.penambahanPiutang.toLocaleString('id-ID')}</td>
                          <td className="py-3.5 px-3.5 border-r border-slate-100 text-blue-700 font-extrabold">{d.penguranganPiutang.toLocaleString('id-ID')}</td>
                          <td className="py-3.5 px-3.5 border-r border-slate-100 font-black text-amber-900 bg-amber-100/60 text-base">{d.sisaPiutang.toLocaleString('id-ID')}</td>
                          <td className="py-3.5 px-3.5 text-center font-sans">
                            <button
                              onClick={() => {
                                setFormDaily({
                                  date: d.rawDate ? new Date(d.rawDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                                  mypi: d.mypi,
                                  hs: d.hs,
                                  ht: d.ht,
                                  os: d.os,
                                  js: d.js,
                                  jsPnb: d.jsPnb,
                                  bs: d.bs,
                                  jlb: d.jlb,
                                  blb: d.blb,
                                  penambahanPiutang: d.penambahanPiutang,
                                  penguranganPiutang: d.penguranganPiutang,
                                  notes: d.notes,
                                });
                                setDailyModalOpen(true);
                              }}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={18} className="py-8 text-center text-slate-400 font-sans">
                          Belum ada data rekap pengeluaran harian tercatat untuk filter ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RIWAYAT TRANSAKSI (LOG TRANSAKSI DETAIL) */}
        {activeTab === 'HISTORY' && (
          <div className="space-y-6">
            {/* Filter Bar Tab 2 */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Cari ID transaksi, keterangan..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <select
                value={historyCodeFilter}
                onChange={(e) => setHistoryCodeFilter(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="">Semua Keterangan Susu</option>
                {masterCodes.map((m) => (
                  <option key={m.code} value={m.code}>{m.code} — {m.name}</option>
                ))}
              </select>

              {(historySearch || historyCodeFilter) && (
                <button
                  onClick={() => {
                    setHistorySearch('');
                    setHistoryCodeFilter('');
                  }}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                >
                  Reset Filter
                </button>
              )}
            </div>

            {/* TABEL LOG RIWAYAT TRANSAKSI */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-600" />
                  <span>Log Riwayat Transaksi Audit ({filteredHistoryData.length} Entry)</span>
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-4 whitespace-nowrap">ID Transaksi</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Tanggal</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Keterangan Susu</th>
                      <th className="py-3.5 px-4 text-right whitespace-nowrap font-black text-slate-900">Jumlah Keluar</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Tujuan / Keterangan</th>
                      <th className="py-3.5 px-4 text-center whitespace-nowrap">Status</th>
                      <th className="py-3.5 px-4 text-center whitespace-nowrap">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredHistoryData.length > 0 ? (
                      filteredHistoryData.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                            {item.transactionId}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                            {new Date(item.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-mono font-black text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg text-xs">
                              {item.keteranganSusu}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-black text-blue-700 text-sm whitespace-nowrap">
                            {item.quantity.toLocaleString('id-ID')} pcs
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 font-semibold max-w-[200px] truncate">
                            {item.destination}
                          </td>
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[10px] inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Selesai
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <button
                              onClick={() => {
                                const matched = stokList.find(s => s.code === item.keteranganSusu);
                                if (matched) {
                                  setSelectedDetail(matched);
                                  setDetailModalOpen(true);
                                }
                              }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                            >
                              Detail
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          Belum ada riwayat transaksi pengeluaran yang sesuai dengan filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DETAIL KETERANGAN SUSU */}
      {detailModalOpen && selectedDetail && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Detail Keterangan Susu</span>
                <h3 className="font-black text-slate-900 text-xl flex items-center gap-2">
                  <span className="font-mono bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-xl">{selectedDetail.code}</span>
                </h3>
              </div>
              <button onClick={() => setDetailModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>

            <p className="text-xs font-semibold text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              {selectedDetail.name}
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-0.5">
                <span className="text-slate-400 font-bold block text-[10px]">Stok Awal</span>
                <p className="font-mono font-black text-slate-900 text-base">{selectedDetail.stokAwal.toLocaleString('id-ID')} pcs</p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-0.5">
                <span className="text-emerald-800 font-bold block text-[10px]">Total Penambahan</span>
                <p className="font-mono font-black text-emerald-700 text-base">+{selectedDetail.penambahan.toLocaleString('id-ID')} pcs</p>
              </div>

              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 space-y-0.5">
                <span className="text-blue-800 font-bold block text-[10px]">Total Pengeluaran</span>
                <p className="font-mono font-black text-blue-700 text-base">-{selectedDetail.pengeluaran.toLocaleString('id-ID')} pcs</p>
              </div>

              <div className="p-3 bg-slate-900 text-white rounded-2xl space-y-0.5">
                <span className="text-slate-300 font-bold block text-[10px]">Sisa Stok Saat Ini</span>
                <p className="font-mono font-black text-emerald-400 text-lg">{selectedDetail.sisaStok.toLocaleString('id-ID')} pcs</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FORM INPUT DATA HARIAN MULTI-KATEGORI */}
      {dailyModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Table className="w-5 h-5 text-blue-600" />
                <span>Form Input Data Harian Produk Keluar</span>
              </h3>
              <button onClick={() => setDailyModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>

            <form onSubmit={handleDailySubmit} className="space-y-4 text-xs">
              {/* Tanggal */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tanggal Rekap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={formDaily.date}
                  onChange={(e) => setFormDaily({ ...formDaily, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Grid Input Pengeluaran Multi-Kategori */}
              <div className="space-y-2">
                <span className="font-black text-slate-900 text-xs block uppercase">Kategori Pengeluaran</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 font-mono">
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-900 mb-1">MYPI</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formDaily.mypi}
                      onChange={(e) => setFormDaily({ ...formDaily, mypi: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">HS</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formDaily.hs}
                      onChange={(e) => setFormDaily({ ...formDaily, hs: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">HT</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formDaily.ht}
                      onChange={(e) => setFormDaily({ ...formDaily, ht: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">OS</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formDaily.os}
                      onChange={(e) => setFormDaily({ ...formDaily, os: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-amber-800 mb-1">JS (Piutang)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formDaily.js}
                      onChange={(e) => setFormDaily({ ...formDaily, js: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-blue-800 mb-1">JS PNBP</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formDaily.jsPnb}
                      onChange={(e) => setFormDaily({ ...formDaily, jsPnb: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-amber-800 mb-1">BS (Piutang)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formDaily.bs}
                      onChange={(e) => setFormDaily({ ...formDaily, bs: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-purple-800 mb-1">JLB</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formDaily.jlb}
                      onChange={(e) => setFormDaily({ ...formDaily, jlb: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-purple-800 mb-1">BLB</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formDaily.blb}
                      onChange={(e) => setFormDaily({ ...formDaily, blb: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Grid Input Piutang */}
              <div className="space-y-2">
                <span className="font-black text-slate-900 text-xs block uppercase">Penyesuaian Piutang (pcs)</span>
                <div className="grid grid-cols-2 gap-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60 font-mono">
                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 mb-1">Penambahan Piutang</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formDaily.penambahanPiutang}
                      onChange={(e) => setFormDaily({ ...formDaily, penambahanPiutang: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-blue-900 mb-1">Pengurangan Piutang</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formDaily.penguranganPiutang}
                      onChange={(e) => setFormDaily({ ...formDaily, penguranganPiutang: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview Result */}
              <div className="p-3.5 bg-slate-900 text-white rounded-2xl flex justify-between items-center text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">Total Keluar Hari Ini:</span>
                  <strong className="text-blue-400 text-sm font-black">{totalKeluarInput.toLocaleString('id-ID')} pcs</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Estimasi Sisa Piutang:</span>
                  <strong className="text-amber-300 text-sm font-black">{liveSisaPiutang.toLocaleString('id-ID')} pcs</strong>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDailyModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingDaily}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  {submittingDaily ? 'Menyimpan...' : 'Simpan Data Harian'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
