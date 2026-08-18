'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ArrowLeft, Printer, CheckCircle2, ShieldCheck, FileText, QrCode } from 'lucide-react';

export default function CertificatePrintPage() {
  const params = useParams();
  const id = params?.id;

  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCert = async () => {
    try {
      const res = await api.get('/pelayanan/certificates');
      if (res.data.success) {
        const found = res.data.data.find((c) => c.id === id);
        setCert(found || null);
      }
    } catch (err) {
      console.error('Error fetching certificate:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCert();
  }, [id]);

  if (loading) return <LoadingSpinner text="Memuat Dokumen Surat Resmi..." />;
  if (!cert) return <div className="p-6 bg-white text-slate-500 rounded-2xl">Dokumen Surat tidak ditemukan</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between print:hidden">
        <Link href="/pelayanan" className="p-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-600 rounded-xl transition-colors inline-flex items-center gap-2 text-xs font-bold shadow-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Front Office Pelayanan</span>
        </Link>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1E3F20] hover:bg-[#2b592e] text-white rounded-xl text-xs font-bold shadow-lg transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Surat Resmi (Print / PDF)</span>
        </button>
      </div>

      {/* Official Certificate Paper Container */}
      <div className="bg-white border-2 border-slate-800 rounded-3xl p-8 md:p-12 space-y-8 shadow-xl relative overflow-hidden text-slate-900 font-serif print:shadow-none print:border-none print:p-0">
        
        {/* Kop Surat SITERNAK Pak Ahmad */}
        <div className="border-b-4 border-double border-slate-900 pb-4 text-center space-y-1">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider font-sans text-[#1E3F20]">
            PEMERINTAH KABUPATEN PETERNAKAN PAK AHMAD
          </h2>
          <h3 className="text-sm md:text-base font-extrabold uppercase font-sans tracking-wide text-slate-800">
            DINAS PETERNAKAN & KESEHATAN HEWAN (SITERNAK)
          </h3>
          <p className="text-xs font-sans text-slate-600">
            Jl. Raya Peternakan Utami No. 88, Sukamaju, Boyolali • Telp/WA: (0276) 889977 • Email: pelayanan@siternak.go.id
          </p>
        </div>

        {/* Title Surat */}
        <div className="text-center space-y-1">
          <h1 className="text-lg md:text-xl font-bold uppercase underline font-sans text-slate-900">
            {cert.certType === 'SKKH' ? 'SURAT KETERANGAN KESEHATAN HEWAN (SKKH)' : 'SURAT IZIN LALU LINTAS TERNAK'}
          </h1>
          <p className="text-xs font-mono font-bold text-slate-700">Nomor Registrasi Resmi: {cert.certNumber}</p>
        </div>

        {/* Content Body */}
        <div className="space-y-4 text-xs md:text-sm font-sans leading-relaxed text-slate-800">
          <p>
            Yang bertanda tangan di bawah ini, Petugas / Mantri Kesehatan Hewan Resmi **SITERNAK Peternakan Pak Ahmad**, menerangkan bahwa hewan ternak dengan rincian sebagai berikut:
          </p>

          {/* Data Table Detail */}
          <div className="bg-[#F5F5F0] p-5 rounded-2xl border border-slate-300 space-y-2 text-xs">
            <div className="grid grid-cols-3">
              <span className="font-bold text-slate-600">Nama Pemilik Ternak:</span>
              <span className="col-span-2 font-bold text-slate-900">{cert.ownerName}</span>
            </div>
            <div className="grid grid-cols-3">
              <span className="font-bold text-slate-600">Rincian Ternak:</span>
              <span className="col-span-2 font-bold text-[#1E3F20]">{cert.animalSummary}</span>
            </div>
            <div className="grid grid-cols-3">
              <span className="font-bold text-slate-600">Lokasi Asal Ternak:</span>
              <span className="col-span-2">{cert.originAddress}</span>
            </div>
            {cert.destAddress && (
              <div className="grid grid-cols-3">
                <span className="font-bold text-slate-600">Tujuan Pengiriman:</span>
                <span className="col-span-2">{cert.destAddress}</span>
              </div>
            )}
            <div className="grid grid-cols-3">
              <span className="font-bold text-slate-600">Masa Berlaku Surat:</span>
              <span className="col-span-2 font-mono font-bold text-emerald-800">
                Sampai dengan {new Date(cert.validUntil).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>

          <p>
            Berdasarkan hasil pemeriksaan fisik, klinis, serta laboratorium yang telah dilakukan, hewan ternak tersebut di atas **DINYATAKAN SEHAT**, tidak menunjukkan gejala penyakit menular ternak (Bebas PMK & Anthrax), dan **LAYAK UNTUK DILALULINTASKAN / DIPOTONG**.
          </p>

          <p className="text-xs text-slate-500 italic">
            Demikian Surat Keterangan ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.
          </p>
        </div>

        {/* Signature & QR Code Official Seal */}
        <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs font-sans">
          <div className="space-y-2 text-center">
            <div className="p-3 bg-slate-100 rounded-xl border border-slate-300 inline-block">
              <QrCode className="w-16 h-16 text-slate-800" />
            </div>
            <p className="text-[10px] text-slate-500 font-mono">Verifikasi QR Code Resmi SITERNAK</p>
          </div>

          <div className="text-center space-y-10">
            <div>
              <p>Diterbitkan di: <strong>Boyolali</strong></p>
              <p>Pada Tanggal: <strong>{new Date(cert.issuedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></p>
              <p className="font-bold mt-1 text-[#1E3F20]">Admin Pelayanan SITERNAK</p>
            </div>

            <div>
              <p className="font-bold underline text-slate-900 font-sans text-sm">{cert.issuedBy}</p>
              <p className="text-[10px] text-slate-500">NIP. 19870912 201201 2 004</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
