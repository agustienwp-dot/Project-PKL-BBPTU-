'use client';

import React from 'react';

export default function BeritaAcaraDocument({ ba }) {
  if (!ba) return null;

  const dateFormatted = new Date(ba.date || Date.now()).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const fmt = (n) =>
    n !== undefined && n !== null && n > 0
      ? n.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
      : '';

  const unitLabel = ba.unit || 'Kg';

  return (
    <div className="bg-white text-black font-serif p-8 md:p-12 max-w-4xl mx-auto border border-slate-300 shadow-md print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none print:w-full">
      {/* 1. HEADER INSTANSI SAMAKAN EKSAK DENGAN DOKUMEN FISIK */}
      <div className="text-center pb-2 border-b-2 border-black">
        <h2 className="text-base md:text-lg font-bold tracking-wide uppercase">
          BALAI BESAR PEMBIBITAN TERNAK UNGGUL DAN HIJAUAN PAKAN TERNAK BATURRADEN
        </h2>
        <h3 className="text-sm md:text-base font-bold tracking-wider uppercase">
          (BBPTUHPT BATURRADEN)
        </h3>
      </div>

      {/* 2. JUDUL BERITA ACARA */}
      <div className="text-center my-6 space-y-1">
        <h1 className="text-base md:text-lg font-bold uppercase tracking-wider">
          BERITA ACARA SERAH TERIMA
        </h1>
        <h2 className="text-sm md:text-base font-bold uppercase tracking-wide">
          SUSU LAYAK KONSUMSI
        </h2>
        <p className="text-xs md:text-sm font-medium text-slate-800">
          Dari Seksi Pelayanan Teknik ke Seksi Pemasaran
        </p>
      </div>

      {/* 3. INFORMASI SHIFT, LOKASI & TANGGAL */}
      <div className="my-5 text-xs md:text-sm font-bold space-y-1.5 font-sans">
        <div className="flex items-center gap-2">
          <span className="w-28 uppercase">PAGI/SORE</span>
          <span>:</span>
          <span className="uppercase text-slate-900 font-extrabold">
            {ba.shift ? `${ba.shift.toUpperCase()} / ` : ''}{ba.farmLocation || 'TEGALSARI / LIMPAKUWUS'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-28 uppercase">Tanggal</span>
          <span>:</span>
          <span className="text-slate-900 font-extrabold">{dateFormatted}</span>
        </div>
      </div>

      {/* 4. TABEL BESAR SESUAI DOKUMEN FISIK */}
      <div className="my-6">
        <table className="w-full text-center text-xs md:text-sm border-collapse border-2 border-black font-sans">
          <thead>
            <tr className="border-b-2 border-black font-bold bg-slate-50 print:bg-white">
              <th className="border-r-2 border-black p-2.5 w-1/5">
                Total Produksi
                <span className="block text-[11px] font-medium">( {unitLabel} )</span>
              </th>
              <th className="border-r-2 border-black p-2.5 w-1/5">
                Penggunaan Pedet
                <span className="block text-[11px] font-medium">( {unitLabel} )</span>
              </th>
              <th className="border-r-2 border-black p-2.5 w-1/5">
                Afkir
                <span className="block text-[11px] font-medium">( {unitLabel} )</span>
              </th>
              <th className="border-r-2 border-black p-2.5 w-1/5">
                Lain-lain
                <span className="block text-[11px] font-medium">( {unitLabel} )</span>
              </th>
              <th className="p-2.5 w-1/5">
                Diserahterimakan
                <span className="block text-[11px] font-medium">( {unitLabel} )</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="h-36 font-bold text-slate-900 text-lg md:text-xl align-middle">
              <td className="border-r-2 border-black p-3 font-sans font-black">{fmt(ba.totalProduksi)}</td>
              <td className="border-r-2 border-black p-3 font-sans font-black">{fmt(ba.penggunaanPedet)}</td>
              <td className="border-r-2 border-black p-3 font-sans font-black">{fmt(ba.afkir)}</td>
              <td className="border-r-2 border-black p-3 font-sans font-black">{fmt(ba.lainLain)}</td>
              <td className="p-3 font-sans font-black text-xl md:text-2xl">{fmt(ba.diserahterimakan)}</td>
            </tr>
          </tbody>
        </table>
        {ba.notes && (
          <p className="text-xs font-sans text-slate-600 mt-2 italic">
            Catatan: {ba.notes}
          </p>
        )}
      </div>

      {/* 5. AREA TANDA TANGAN DUA PIHAK EKSAK SAMAKAN FISIK */}
      <div className="mt-12 pt-4 font-sans text-xs md:text-sm">
        <div className="grid grid-cols-2 gap-12 text-center">
          {/* PIHAK PENERIMA (SEKSI PEMASARAN) */}
          <div className="flex flex-col justify-between h-44 space-y-2">
            <div>
              <p className="font-bold text-slate-800">Yang menerima,</p>
              <p className="font-bold text-black uppercase">{ba.penerimaRole || 'Seksi Pemasaran'}</p>
            </div>
            
            <div className="h-20 flex items-center justify-center relative">
              {ba.readAt ? (
                <div className="text-[10px] font-bold text-blue-900 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded print:border-slate-300">
                  ✓ Diterima Seksi Pemasaran
                  <span className="block text-[9px] font-mono text-slate-600">
                    {new Date(ba.readAt).toLocaleString('id-ID')}
                  </span>
                </div>
              ) : (
                <div className="w-full text-center">
                  <span className="text-slate-400 italic text-[11px]"></span>
                </div>
              )}
            </div>

            <div>
              <div className="border-b border-dotted border-black w-48 mx-auto mb-1"></div>
            </div>
          </div>

          {/* PIHAK PENYERAH (SEKSI YANTEK / PEMELIHARAAN) */}
          <div className="flex flex-col justify-between h-44 space-y-2">
            <div>
              <p className="font-bold text-slate-800">Yang menyerahkan,</p>
              <p className="font-bold text-black uppercase">{ba.penyerahRole || 'Seksi YANTEK'}</p>
            </div>

            <div className="h-20 flex items-center justify-center relative">
              {ba.digitalSignature ? (
                <div className="flex flex-col items-center">
                  <img
                    src={ba.digitalSignature}
                    alt="Tanda Tangan Digital"
                    className="max-h-16 max-w-full object-contain"
                  />
                  {ba.signedAt && (
                    <span className="text-[9px] font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 print:border-slate-300 mt-0.5">
                      ✓ Ditandatangani Digital ({new Date(ba.signedAt).toLocaleDateString('id-ID')})
                    </span>
                  )}
                </div>
              ) : (
                <div className="w-full text-center">
                  <span className="text-slate-400 italic text-[11px]"></span>
                </div>
              )}
            </div>

            <div>
              <div className="border-b border-dotted border-black w-48 mx-auto mb-1"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
