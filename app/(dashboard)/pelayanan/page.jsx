'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Plus, 
  Printer, 
  MessageSquare, 
  Search, 
  AlertCircle,
  FileCheck,
  UserCheck
} from 'lucide-react';

export default function AdminPelayananPage() {
  const { user, isAdminPelayanan, isSuperAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [toast, setToast] = useState(null);

  // New Request Modal
  const [showReqModal, setShowReqModal] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantAddress, setApplicantAddress] = useState('');
  const [serviceType, setServiceType] = useState('Surat Keterangan Kesehatan Hewan (SKKH)');
  const [animalDetails, setAnimalDetails] = useState('');

  // Generate Cert Modal
  const [showCertModal, setShowCertModal] = useState(false);
  const [selectedReqId, setSelectedReqId] = useState('');
  const [certType, setCertType] = useState('SKKH');
  const [ownerName, setOwnerName] = useState('');
  const [animalSummary, setAnimalSummary] = useState('');
  const [originAddress, setOriginAddress] = useState('');
  const [destAddress, setDestAddress] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rRes, cRes, compRes] = await Promise.all([
        api.get('/pelayanan/requests'),
        api.get('/pelayanan/certificates'),
        api.get('/pelayanan/complaints'),
      ]);

      if (rRes.data.success) setRequests(rRes.data.data);
      if (cRes.data.success) setCertificates(cRes.data.data);
      if (compRes.data.success) setComplaints(compRes.data.data);
    } catch (err) {
      console.error('Error fetching pelayanan data:', err);
      setToast({ type: 'error', message: 'Gagal memuat data pelayanan.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminPelayanan || isSuperAdmin) {
      fetchData();
    }
  }, [isAdminPelayanan, isSuperAdmin]);

  if (!isAdminPelayanan && !isSuperAdmin) {
    return (
      <div className="p-8 bg-white border border-rose-200 rounded-3xl text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-black text-rose-700">Akses Ditolak — Khusus ADMIN PELAYANAN</h2>
        <p className="text-xs text-slate-500">Halaman ini dikhususkan untuk Front Office Administrasi & Penerbitan Surat SITERNAK.</p>
      </div>
    );
  }

  if (loading) return <LoadingSpinner text="Memuat Portal Front Office Pelayanan..." />;

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.put('/pelayanan/requests', { id, status });
      if (res.data.success) {
        setToast({ type: 'success', message: `Status permohonan berhasil diubah menjadi ${status}` });
        fetchData();
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Gagal memperbarui status permohonan.' });
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/pelayanan/requests', {
        applicantName,
        applicantPhone,
        applicantAddress,
        serviceType,
        animalDetails,
      });

      if (res.data.success) {
        setToast({ type: 'success', message: 'Permohonan layanan baru berhasil dicatat!' });
        setShowReqModal(false);
        setApplicantName('');
        setApplicantPhone('');
        setApplicantAddress('');
        setAnimalDetails('');
        fetchData();
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Gagal mencatat permohonan.' });
    }
  };

  const handleCreateCertificate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/pelayanan/certificates', {
        certType,
        serviceRequestId: selectedReqId || null,
        ownerName,
        animalSummary,
        originAddress,
        destAddress,
        validDays: 14,
      });

      if (res.data.success) {
        setToast({ type: 'success', message: `Surat Resmi ${certType} Berhasil Diterbitkan!` });
        setShowCertModal(false);
        fetchData();
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Gagal menerbitkan surat resmi.' });
    }
  };

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;
  const approvedCount = requests.filter((r) => r.status === 'APPROVED').length;

  return (
    <div className="space-y-8 pb-12">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-blue-950 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-700" />
            POV 2: ADMIN PELAYANAN (Front Office & Administrasi Surat)
          </h1>
          <p className="text-slate-600 text-xs mt-1">Pengelolaan Permohonan Layanan, Generator Surat SKKH / Izin Lalu Lintas, & Pengaduan</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowReqModal(true)}
            className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Permohonan Baru</span>
          </button>
          <button
            onClick={() => setShowCertModal(true)}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Terbitkan SKKH / Surat Resmi</span>
          </button>
        </div>
      </div>

      {/* 4 Status Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-1 shadow-sm border-t-4 border-t-amber-500">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Permohonan Baru (Pending)</span>
          <h3 className="text-3xl font-black text-amber-700">{pendingCount} <span className="text-xs font-normal text-slate-500">berkas</span></h3>
          <p className="text-xs text-slate-500">Verifikasi Berkas Front Office</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-1 shadow-sm border-t-4 border-t-emerald-600">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Surat Diterbitkan Bulan Ini</span>
          <h3 className="text-3xl font-black text-emerald-800">{certificates.length} <span className="text-xs font-normal text-slate-500">dokumen</span></h3>
          <p className="text-xs text-emerald-700 font-semibold">SKKH & Surat Lalu Lintas</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-1 shadow-sm border-t-4 border-t-blue-600">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Permohonan Disetujui</span>
          <h3 className="text-3xl font-black text-blue-700">{approvedCount} <span className="text-xs font-normal text-slate-500">layanan</span></h3>
          <p className="text-xs text-slate-500">Telah Memenuhi Syarat Medik</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-1 shadow-sm border-t-4 border-t-rose-500">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Laporan Pengaduan</span>
          <h3 className="text-3xl font-black text-rose-600">{complaints.length} <span className="text-xs font-normal text-slate-500">laporan</span></h3>
          <p className="text-xs text-slate-500">Pengaduan Masyarakat/Peternak</p>
        </div>
      </div>

      {/* Main Permohonan Layanan Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-blue-700" />
          Daftar Permohonan Layanan Peternakan (Front Office)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-[#F5F5F0] text-slate-700 uppercase text-[11px] tracking-wider border-b border-slate-200 font-bold">
              <tr>
                <th className="px-4 py-3">No. Permohonan</th>
                <th className="px-4 py-3">Nama Pemohon & Alamat</th>
                <th className="px-4 py-3">Jenis Layanan</th>
                <th className="px-4 py-3">Detail Hewan</th>
                <th className="px-4 py-3">Status Verifikasi</th>
                <th className="px-4 py-3 text-center">Aksi Administrasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3.5 font-mono font-bold text-blue-900">{r.requestNo}</td>
                  <td className="px-4 py-3.5">
                    <span className="font-bold text-slate-900 block">{r.applicantName}</span>
                    <span className="text-xs text-slate-500">{r.applicantPhone} • {r.applicantAddress}</span>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-slate-800">{r.serviceType}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-600 font-medium">{r.animalDetails}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      r.status === 'PENDING' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                      r.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                      'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {r.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'APPROVED')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors"
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'REJECTED')}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors"
                          >
                            Tolak
                          </button>
                        </>
                      )}

                      {r.status === 'APPROVED' && (
                        <button
                          onClick={() => {
                            setSelectedReqId(r.id);
                            setOwnerName(r.applicantName);
                            setAnimalSummary(r.animalDetails);
                            setOriginAddress(r.applicantAddress);
                            setShowCertModal(true);
                          }}
                          className="px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Buat SKKH</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dokumen Surat Resmi & Pengaduan Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Generator & Print Surat SKKH / Izin Lalu Lintas */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-700" />
            Surat Resmi Diterbitkan (SKKH & Izin Lalu Lintas)
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {certificates.map((c) => (
              <div key={c.id} className="p-4 bg-[#F5F5F0] border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                    {c.certNumber}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">{c.ownerName} ({c.certType})</h4>
                  <p className="text-xs text-slate-600">{c.animalSummary}</p>
                  <span className="text-[10px] text-slate-500 block mt-1">Berlaku s.d: {new Date(c.validUntil).toLocaleDateString('id-ID')}</span>
                </div>

                <Link
                  href={`/pelayanan/surat/${c.id}`}
                  className="px-3 py-1.5 bg-[#1E3F20] hover:bg-[#2b592e] text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Dokumen</span>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Public Complaints & Pengaduan */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-rose-600" />
            Layanan Pengaduan Masyarakat
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {complaints.map((comp) => (
              <div key={comp.id} className="p-4 bg-[#F5F5F0] border border-slate-200 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono font-bold text-rose-800">{comp.complaintNo}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    comp.status === 'BARU' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {comp.status}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{comp.title}</h4>
                <p className="text-xs text-slate-600">{comp.description}</p>
                <div className="text-[11px] text-slate-500 border-t border-slate-200 pt-2 flex justify-between">
                  <span>Pelapor: {comp.reporterName} ({comp.reporterPhone})</span>
                  <span>{new Date(comp.createdAt).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Modal New Request */}
      {showReqModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900">Input Permohonan Layanan Baru</h3>
            <form onSubmit={handleCreateRequest} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Nama Pemohon</label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2.5"
                  placeholder="e.g. H. Ahmad Syamsul"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Telepon / Whatsapp</label>
                <input
                  type="text"
                  required
                  value={applicantPhone}
                  onChange={(e) => setApplicantPhone(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2.5"
                  placeholder="081234567890"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Alamat Pemohon</label>
                <input
                  type="text"
                  required
                  value={applicantAddress}
                  onChange={(e) => setApplicantAddress(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2.5"
                  placeholder="Desa Sukamaju, Boyolali"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Jenis Layanan</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                >
                  <option value="Surat Keterangan Kesehatan Hewan (SKKH)">Surat Keterangan Kesehatan Hewan (SKKH)</option>
                  <option value="Izin Lalu Lintas Ternak">Izin Lalu Lintas Ternak</option>
                  <option value="Bantuan Feed & Pakan Subsidized">Bantuan Feed & Pakan Subsidized</option>
                </select>
              </div>
              <div>
                <label className="font-bold block mb-1">Detail & Jumlah Ternak</label>
                <textarea
                  required
                  value={animalDetails}
                  onChange={(e) => setAnimalDetails(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2.5"
                  placeholder="e.g. 5 ekor Sapi Potong Limosin"
                  rows="2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowReqModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 text-white font-bold rounded-xl shadow-md"
                >
                  Simpan Permohonan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Generate Certificate */}
      {showCertModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900">Terbitkan Surat Resmi SKKH / Lalu Lintas</h3>
            <form onSubmit={handleCreateCertificate} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Jenis Surat</label>
                <select
                  value={certType}
                  onChange={(e) => setCertType(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                >
                  <option value="SKKH">Surat Keterangan Kesehatan Hewan (SKKH)</option>
                  <option value="IZIN_LALU_LINTAS">Surat Izin Lalu Lintas Ternak</option>
                </select>
              </div>
              <div>
                <label className="font-bold block mb-1">Nama Pemilik Ternak</label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Ringkasan Ternak</label>
                <input
                  type="text"
                  required
                  value={animalSummary}
                  onChange={(e) => setAnimalSummary(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Alamat Asal Ternak</label>
                <input
                  type="text"
                  required
                  value={originAddress}
                  onChange={(e) => setOriginAddress(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Alamat Tujuan Pengiriman</label>
                <input
                  type="text"
                  value={destAddress}
                  onChange={(e) => setDestAddress(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-slate-300 rounded-xl p-2.5"
                  placeholder="Pasar Hewan / Rumah Potong Hewan"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCertModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 text-white font-bold rounded-xl shadow-md"
                >
                  Terbitkan Surat Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
