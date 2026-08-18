import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// 9 Keterangan Susu Standard Definitions
const KETERANGAN_SUSU_MASTER = [
  { code: 'MYPI', name: 'Susu Murni Segar Hasil Perah Sapi (MYPI)', stokAwal: 4291, defaultPackaging: 'botol' },
  { code: 'HS', name: 'Hasil Perah Susu Sapi Segar Kategori HS', stokAwal: 74, defaultPackaging: 'liter' },
  { code: 'HT', name: 'Hasil Perah Susu Sapi Segar Kategori HT', stokAwal: 449, defaultPackaging: 'liter' },
  { code: 'OS', name: 'Olahan Segar Susu Sapi Kategori OS', stokAwal: 2500, defaultPackaging: 'botol' },
  { code: 'JS', name: 'Penjualan Susu Sapi Segar (Piutang JS)', stokAwal: 10810, defaultPackaging: 'botol', isPiutang: true },
  { code: 'JS PNB', name: 'Penjualan Susu Sapi Segar Setor PNBP', stokAwal: 119879, defaultPackaging: 'botol', isPiutang: true },
  { code: 'BS', name: 'Bulk Segar Sapi Kategori BS (Piutang BS)', stokAwal: 0, defaultPackaging: 'botol', isPiutang: true },
  { code: 'JLB', name: 'Jual Laktasi Bulk Volume Sapi', stokAwal: 482, defaultPackaging: 'liter' },
  { code: 'BLB', name: 'Beli Laktasi Bulk Volume Sapi', stokAwal: 6696, defaultPackaging: 'liter' },
];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month'); // e.g. "04"
    const year = searchParams.get('year');   // e.g. "2026"
    const statusFilter = searchParams.get('status'); // "Aman", "Menipis", "Rendah"
    const queryCode = (searchParams.get('q') || '').toUpperCase().trim();

    // Query all accepted packagings from farm
    const acceptedPackagings = await prisma.milkPackaging.findMany({
      where: { status: 'DITERIMA' },
      orderBy: { date: 'desc' }
    });

    // Query all outflows
    const outflows = await prisma.milkOutflow.findMany({
      orderBy: { date: 'desc' }
    });

    // Query all sales
    const sales = await prisma.milkSale.findMany({
      where: { status: 'Berhasil' },
      orderBy: { date: 'desc' }
    });

    // Aggregate data per Keterangan Susu code
    const list = KETERANGAN_SUSU_MASTER.map((item) => {
      let penambahan = 0;
      let pengeluaran = 0;
      const history = [];

      // Filter accepted packagings for this code/category
      acceptedPackagings.forEach((pkg) => {
        const pkgCat = (pkg.productCategory || '').toUpperCase();
        const pkgSub = (pkg.productSubtype || '').toUpperCase();
        const match = pkgSub.includes(item.code) || pkgCat.includes(item.code) || 
          (item.code === 'MYPI' && pkgCat.includes('SUSU')) ||
          (item.code === 'JS' && pkgCat.includes('PENJUALAN')) ||
          (item.code === 'JS PNB' && (pkgSub.includes('PNB') || pkgSub.includes('PNBP')));

        if (match) {
          const qty = pkg.quantityReceived || pkg.totalPackagedQty || 0;
          penambahan += qty;
          history.push({
            id: `IN-${pkg.id.slice(0, 8)}`,
            date: pkg.receivedAt || pkg.date,
            aktivitas: 'Penambahan (Terima Farm)',
            jumlah: qty,
            tujuan: `Terima dari Admin Farm (${pkg.sentByName || 'Farm'})`,
          });
        }
      });

      // Filter outflows for this code
      outflows.forEach((out) => {
        const notes = (out.notes || '').toUpperCase();
        const pkgType = (out.packagingType || '').toUpperCase();
        const match = notes.includes(item.code) || pkgType.includes(item.code) ||
          (item.code === 'MYPI' && (notes.includes('MYPI') || !notes));

        if (match) {
          const qty = out.quantity || 0;
          pengeluaran += qty;
          history.push({
            id: `OUT-${out.id.slice(0, 8)}`,
            date: out.date,
            aktivitas: 'Pengeluaran',
            jumlah: qty,
            tujuan: out.notes || 'Pengeluaran Stok',
          });
        }
      });

      // Filter sales for this code
      sales.forEach((s) => {
        const sub = (s.productSubtype || '').toUpperCase();
        const notes = (s.notes || '').toUpperCase();
        const match = sub.includes(item.code) || notes.includes(item.code);

        if (match) {
          const qty = s.quantity || 0;
          pengeluaran += qty;
          history.push({
            id: s.transactionId || `TRX-${s.id.slice(0, 8)}`,
            date: s.date,
            aktivitas: 'Penjualan',
            jumlah: qty,
            tujuan: `Penjualan (${s.productCategory})`,
          });
        }
      });

      // Compute sisa stok
      const sisaStok = Math.max(0, item.stokAwal + penambahan - pengeluaran);

      // Determine Status badge
      let status = 'Aman';
      if (sisaStok < 10) {
        status = 'Rendah';
      } else if (sisaStok <= 20) {
        status = 'Menipis';
      }

      // Sort history descending by date
      history.sort((a, b) => new Date(b.date) - new Date(a.date));

      return {
        code: item.code,
        name: item.name,
        stokAwal: item.stokAwal,
        penambahan,
        pengeluaran,
        sisaStok,
        status,
        isPiutang: !!item.isPiutang,
        history,
      };
    });

    // Apply filters if present
    let filteredList = [...list];

    if (queryCode) {
      filteredList = filteredList.filter(
        (i) => i.code.includes(queryCode) || i.name.toUpperCase().includes(queryCode)
      );
    }

    if (statusFilter && statusFilter !== 'Semua') {
      filteredList = filteredList.filter((i) => i.status === statusFilter);
    }

    // Summary Top Cards Metrics
    const totalStokSaatIni = list.reduce((acc, i) => acc + i.sisaStok, 0);
    const totalPenambahan = list.reduce((acc, i) => acc + i.penambahan, 0);
    const totalPengeluaran = list.reduce((acc, i) => acc + i.pengeluaran, 0);
    const stokRendahCount = list.filter((i) => i.status === 'Rendah').length;

    // Piutang Summary Calculation (For JS, JS PNB, BS)
    const piutangItems = list.filter((i) => i.isPiutang);
    const penambahanPiutang = piutangItems.reduce((acc, i) => acc + i.penambahan, 0);
    const penguranganPiutang = piutangItems.reduce((acc, i) => acc + i.pengeluaran, 0);
    const sisaPiutang = piutangItems.reduce((acc, i) => acc + i.sisaStok, 0);

    // Format all recorded outflow items for Tab 2 "Produk Keluar"
    const outflowsList = outflows.map((out, idx) => {
      let matchedCode = 'MYPI';
      const notes = (out.notes || '').toUpperCase();
      KETERANGAN_SUSU_MASTER.forEach((m) => {
        if (notes.includes(m.code)) matchedCode = m.code;
      });

      return {
        id: out.id,
        transactionId: `OUT-${String(outflows.length - idx).padStart(3, '0')}`,
        date: out.date,
        keteranganSusu: matchedCode,
        quantity: out.quantity || 0,
        destination: out.notes || 'Penjualan / Distribusi',
        status: 'Selesai',
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalStokSaatIni,
          totalPenambahan,
          totalPengeluaran,
          stokRendahCount,
        },
        piutangSummary: {
          penambahanPiutang,
          penguranganPiutang,
          sisaPiutang,
        },
        stokKeteranganList: filteredList,
        masterCodes: KETERANGAN_SUSU_MASTER.map((m) => ({ code: m.code, name: m.name })),
        outflowsList,
      },
    });
  } catch (error) {
    console.error('GET /api/pemasaran/stok-keluar error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
