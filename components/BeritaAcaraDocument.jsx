'use client';

import React from 'react';

export default function BeritaAcaraDocument({ ba }) {
  if (!ba) return null;

  const dateObj = new Date(ba.date || Date.now());
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const dateFormatted = `${dateObj.getDate()} ${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

  const isHibah = ba.type === 'HIBAH' || (ba.nomorBa && ba.nomorBa.includes('BAST-HB'));
  const isOlahan = ba.type === 'SUSU_OLAHAN' || (ba.nomorBa && ba.nomorBa.includes('BAST-OLAHAN'));

  let parsedItems = [];
  if (ba.items) {
    try {
      parsedItems = typeof ba.items === 'string' ? JSON.parse(ba.items) : ba.items;
    } catch (e) {}
  }

  const penerima = ba.penerimaName || ba.receiverName || (isOlahan ? 'Seksi Pemasaran' : (isHibah ? 'Bag umum / RTP' : ''));
  const penyerah = ba.penyerahName || ba.giverName || (isOlahan ? 'Seksi Pengemasan & Olahan' : 'TEGUH');
  const selectedLocation = (ba.farmLocation || ba.location || 'Pengemasan & Olahan').toUpperCase();

  const locationsList = ['TEGALSARI', 'LIMPAKUWUS', 'MANGGALA', 'EDUWISATA'];
  const unitLabel = (ba.unit && ba.unit !== 'Kg') ? ba.unit : 'Lt';

  return (
    <div className="printable-document bg-white text-black font-serif p-8 md:p-12 max-w-3xl mx-auto border border-slate-300 shadow-md print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none print:w-full print:text-black">
      
      {/* 1. KOP SURAT (HEADER INSTANSI) */}
      <div className="text-center pb-2 border-b border-black space-y-0.5">
        <h2 className="text-xs md:text-sm font-bold tracking-tight uppercase leading-tight">
          BALAI BESAR PEMBIBITAN TERNAK UNGGUL DAN HIJAUAN PAKAN TERNAK BATURRADEN
        </h2>
        <h3 className="text-xs md:text-sm font-bold tracking-tight uppercase">
          (BBPTUHPT BATURRADEN)
        </h3>
      </div>

      {/* 2. JUDUL BERITA ACARA */}
      <div className="text-center my-5 space-y-1">
        <h1 className={`text-xs md:text-sm uppercase tracking-wide ${isOlahan ? 'font-normal' : 'font-bold'}`}>
          {isOlahan
            ? 'BERITA ACARA SERAH TERIMA HASIL SUSU OLAHAN SIAP JUAL'
            : isHibah
            ? 'BERITA ACARA SERAH TERIMA SUSU HIBAH'
            : 'BERITA ACARA SERAH TERIMA SUSU'}
        </h1>
        <p className={`text-xs uppercase tracking-tight ${isOlahan ? 'font-normal' : 'font-semibold'}`}>
          {isOlahan ? (
            <>
              DARI SEKSI PENGEMASAN & OLAHAN KE{' '}
              <span className="border-b border-dotted border-black px-2 inline-block font-normal">
                {penerima || 'SEKSI PEMASARAN'}
              </span>
            </>
          ) : isHibah ? (
            <>
              DARI TIM KERJA LAYANAN PEMASARAN KE{' '}
              <span className="border-b border-dotted border-black px-2 inline-block font-bold">
                {penerima || '...................................................'}
              </span>
            </>
          ) : (
            <>
              DARI TIM KERJA LAYANAN PEMASARAN DENGAN{' '}
              <span className="border-b border-dotted border-black px-2 inline-block font-bold">
                {penerima || '...................................................'}
              </span>
            </>
          )}
        </p>
        <p className="text-xs font-bold font-sans pt-1">
          Nomor: {ba.nomorBa || ba.nomor_ba || '-'}
        </p>
        <p className="text-xs md:text-sm font-sans font-bold text-slate-900 pt-0.5 tracking-wide">
          Nomor: {ba.nomorBa || ba.nomor_ba || '-'}
        </p>
      </div>

      {/* 3. INFORMASI WAKTU & LOKASI */}
      <div className="my-6 text-xs md:text-sm font-sans space-y-2 text-black">
        {!isHibah && !isOlahan && (
          <div className="flex items-center gap-2">
            <span className="w-24 font-bold text-xs uppercase">PAGI/SORE</span>
            <span>:</span>
            <span className="font-semibold text-xs tracking-wide">
              {locationsList.map((loc, i) => {
                const isSelected = selectedLocation.includes(loc);
                return (
                  <React.Fragment key={loc}>
                    {isSelected ? (
                      <span className="inline-block px-2.5 py-0.5 border border-black rounded-full font-extrabold text-black">
                        {loc}
                      </span>
                    ) : (
                      <span>{loc}</span>
                    )}
                    {i < locationsList.length - 1 ? ' / ' : ''}
                  </React.Fragment>
                );
              })}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="w-24 font-bold text-xs">Tanggal</span>
          <span>:</span>
          <span className="font-semibold text-xs text-black">{dateFormatted}</span>
        </div>
      </div>

      {/* 4. TABEL UTAMA */}
      <div className="my-6">
        <table className="w-full text-left text-xs md:text-sm border-collapse border border-black font-sans">
          <thead>
            <tr className="border-b border-black font-bold text-center bg-gray-50 print:bg-white text-xs md:text-sm">
              <th className="border-r border-black p-3 w-1/2 font-bold text-center">
                {isOlahan ? 'Nama Produk & Ukuran' : 'Jumlah Yang Diterima (Ltr)'}
              </th>
              <th className="p-3 w-1/2 font-bold text-center">
                {isOlahan ? 'Jumlah Produk Siap Jual' : 'Keterangan'}
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(parsedItems) && parsedItems.length > 0 ? (
              parsedItems.map((item, idx) => (
                <tr key={idx} className="border-b border-black text-xs md:text-sm min-h-[45px]">
                  <td className="border-r border-black p-3 font-medium align-top">
                    {item.product ? (
                      <span className="font-bold">{item.product} {item.size || ''}</span>
                    ) : item.quantity ? (
                      <span className="text-sm font-bold">{item.quantity} Liter</span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="p-3 font-medium align-top">
                    {item.quantity && item.unit && item.product ? (
                      <span className="font-bold text-black">{item.quantity} {item.unit}</span>
                    ) : (
                      <span>{item.purpose || ba.purpose || ba.notes || '-'}</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr className="border-b border-black text-xs md:text-sm min-h-[100px]">
                <td className="border-r border-black p-4 font-bold text-sm md:text-base align-top">
                  {ba.diserahterimakan ? `${ba.diserahterimakan} Botol` : `${ba.totalProduksi || 0} Liter`}
                </td>
                <td className="p-4 font-medium align-top">
                  {ba.purpose || ba.notes || 'Hasil Susu Olahan Siap Jual'}
                </td>
              </tr>
            )}

            {/* Note row at the bottom of the table if available */}
            {ba.notes && (
              <tr className="border-t border-black">
                <td colSpan={2} className="p-2 text-xs italic font-sans text-slate-800">
                  Catatan: {ba.notes}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 5. AREA TANDA TANGAN DUA PIHAK */}
      <div className="mt-12 pt-4 font-sans text-xs md:text-sm">
        <div className="grid grid-cols-2 gap-8 text-center">
          
          {/* LEFT: YANG MENERIMA */}
          <div className="flex flex-col justify-between h-36">
            <div>
              <p className="font-semibold text-black">Yang Menerima,</p>
              {isOlahan && <p className="font-semibold text-black">Seksi Pemasaran</p>}
            </div>

            <div className="h-16 flex items-center justify-center relative">
              {ba.confirmedByName ? (
                <span className="text-xs font-bold text-emerald-800 border border-emerald-300 bg-emerald-50 px-3 py-1 rounded">
                  ✓ Dikonfirmasi ({ba.confirmedByName})
                </span>
              ) : ba.digitalSignature ? (
                <img src={ba.digitalSignature} alt="Tanda Tangan" className="max-h-14 object-contain" />
              ) : null}
            </div>

            <div>
              <p className="font-bold text-black border-b border-dotted border-black inline-block min-w-[200px] pb-0.5 uppercase">
                {penerima || '...................................................'}
              </p>
            </div>
          </div>

          {/* RIGHT: YANG MENYERAHKAN */}
          <div className="flex flex-col justify-between h-36">
            <div>
              <p className="font-semibold text-black">Yang Menyerahkan,</p>
              <p className="font-semibold text-black">{isOlahan ? 'Seksi Pengemasan & Olahan' : 'Tim Kerja Layanan Pemasaran'}</p>
            </div>

            <div className="h-16 flex items-center justify-center relative">
              {/* Signature space */}
            </div>

            <div>
              <p className="font-bold text-black border-b border-dotted border-black inline-block min-w-[200px] pb-0.5 uppercase">
                {penyerah}
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
