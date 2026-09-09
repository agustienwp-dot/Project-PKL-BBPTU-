'use client';

import React, { useRef, useState } from 'react';
import { FileText, Printer, Download, Loader2 } from 'lucide-react';

export default function BeritaAcaraDocumentUht({ ba, showHeader = true, onPrint, onClose }) {
  const docRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  if (!ba) return null;

  const nomorBaStr = ba.nomorBa || ba.nomor_ba || '-';
  const dateObj = new Date(ba.date || Date.now());
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const dateFormatted = `${dateObj.getDate()} ${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
  const fileName = `Berita_Acara_${nomorBaStr.replace(/[^a-zA-Z0-9-]/g, '_')}.pdf`;

  const handleDownloadPdf = async () => {
    if (!docRef.current) return;
    setDownloading(true);
    try {
      let html2pdf;
      try {
        html2pdf = (await import('html2pdf.js')).default;
      } catch (e) {
        if (typeof window !== 'undefined' && window.html2pdf) {
          html2pdf = window.html2pdf;
        }
      }

      if (!html2pdf && typeof window !== 'undefined') {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
        html2pdf = window.html2pdf;
      }

      if (html2pdf) {
        const element = docRef.current;
        const opt = {
          margin: [8, 8, 8, 8],
          filename: fileName,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        await html2pdf().set(opt).from(element).save();
      } else {
        window.print();
      }
    } catch (err) {
      console.error('Download PDF error:', err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  const isHibah = ba.type === 'HIBAH' || (ba.nomorBa && ba.nomorBa.includes('BAST-HB'));
  const isOlahan = ba.type === 'SUSU_OLAHAN' || (ba.nomorBa && ba.nomorBa.includes('BAST-OLAHAN'));
  const isFarmHandover = !isHibah && !isOlahan;

  let parsedItems = [];
  if (ba.items) {
    try {
      parsedItems = typeof ba.items === 'string' ? JSON.parse(ba.items) : ba.items;
    } catch (e) { }
  }

  const penerima = ba.penerimaName || ba.receiverName || (isOlahan ? 'Seksi Pemasaran' : (isHibah ? 'Bag umum / RTP' : 'SEKSI PEMASARAN'));
  const penyerah = ba.penyerahName || ba.giverName || (isOlahan ? 'Seksi Pengemasan & Olahan' : 'SEKSI YANTEK');
  const selectedLocation = (ba.farmLocation || ba.location || 'Pengemasan & Olahan').toUpperCase();

  const locationsList = ['TEGALSARI', 'LIMPAKUWUS', 'MANGGALA', 'EDUWISATA'];
  const unitLabel = ba.unit || 'Kg';

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
              DARI SEKSI UHT KE{' '}
              <span className="border-b border-dotted border-black px-2 inline-block font-normal uppercase">
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
        <p className="text-xs md:text-sm font-sans font-bold text-slate-900 pt-1 tracking-wide">
          Nomor: {ba.nomorBa || ba.nomor_ba || '-'}
        </p>
      </div>

      {/* 3. INFORMASI WAKTU & LOKASI */}
      <div className="my-6 text-xs md:text-sm font-sans space-y-2 text-black">
        {!isHibah && !isOlahan && (<div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1E3F20]" />
            <span className="font-extrabold text-slate-900 text-base">Preview Berita Acara</span>
            <span className="text-xs font-bold text-slate-400 font-mono">({nomorBaStr})</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full text-xs font-bold shadow transition-colors cursor-pointer disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Mengunduh...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>Simpan PDF</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                if (onPrint) onPrint(ba);
                else window.print();
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1E3F20] text-white hover:bg-[#16331a] rounded-full text-xs font-bold shadow transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-white" />
              <span>Cetak Print</span>
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl ml-1 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        )}

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
                parsedItems.map((item, idx) => {
                  if (isOlahan) {
                    let nameLabel = item.product || item.name || item.productCategory || 'Susu Olahan';
                    let pkgType = item.packagingType || '';
                    let sizeStr = item.size || item.packageSize || '';
                    let varStr = item.variant ? `(${item.variant})` : '';
                    let unitStr = item.unit || (pkgType.toLowerCase().includes('botol') ? 'Botol' : (pkgType.toLowerCase().includes('cup') ? 'Cup' : (pkgType.toLowerCase().includes('keju') || nameLabel.toLowerCase().includes('keju') ? 'Kemasan Keju' : 'pcs')));
                    let qtyVal = item.quantity ?? 0;

                    let formattedName = nameLabel;
                    if (pkgType && !nameLabel.toLowerCase().includes(pkgType.toLowerCase()) && !pkgType.toLowerCase().includes(nameLabel.toLowerCase())) {
                      formattedName += ` ${pkgType}`;
                    }
                    if (varStr) {
                      formattedName += ` - ${varStr}`;
                    }
                    if (sizeStr) {
                      formattedName += ` ${sizeStr}`;
                    }

                    return (
                      <tr key={idx} className="border-b border-black text-xs md:text-sm min-h-[45px]">
                        <td className="border-r border-black p-3 font-medium align-top">
                          <span className="font-bold text-black">{formattedName}</span>
                        </td>
                        <td className="p-3 font-medium align-top">
                          <span className="font-bold text-black">{qtyVal} {unitStr}</span>
                        </td>
                      </tr>
                    );
                  }

                  return (
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
                  );
                })
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
    </div >
  );
}
