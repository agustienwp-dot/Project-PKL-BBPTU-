import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get('month'); // 1-12
    const yearParam = searchParams.get('year'); // YYYY
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    const now = new Date();
    const currentYear = yearParam ? parseInt(yearParam, 10) : now.getFullYear();
    const currentMonth = monthParam ? parseInt(monthParam, 10) : now.getMonth() + 1;

    let rangeStart;
    let rangeEnd;

    if (startDateParam && endDateParam) {
      rangeStart = new Date(startDateParam);
      rangeStart.setHours(0, 0, 0, 0);
      rangeEnd = new Date(endDateParam);
      rangeEnd.setHours(23, 59, 59, 999);
    } else {
      rangeStart = new Date(currentYear, currentMonth - 1, 1, 0, 0, 0, 0);
      rangeEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);
    }

    // 1. Fetch Raw Milk Productions (Farm)
    const productions = await prisma.milkProduction.findMany({
      where: {
        date: { lte: rangeEnd },
      },
      orderBy: { date: 'asc' },
    });

    // 2. Fetch Packagings (Confirmed or submitted packagings)
    const packagings = await prisma.milkPackaging.findMany({
      where: {
        date: { lte: rangeEnd },
        status: { not: 'DIBATALKAN' },
      },
      orderBy: { date: 'asc' },
    });

    // 3. Fetch Sales (Penjualan)
    const sales = await prisma.milkSale.findMany({
      where: {
        date: { lte: rangeEnd },
        status: { not: 'Dibatalkan' },
      },
      orderBy: { date: 'asc' },
    });

    // 4. Fetch Outflows (Hibah, Afkir, Outflow)
    const outflows = await prisma.milkOutflow.findMany({
      where: {
        date: { lte: rangeEnd },
      },
      orderBy: { date: 'asc' },
    });

    // Helper date key formatter
    const toDateKey = (d) => {
      const dt = new Date(d);
      const year = dt.getFullYear();
      const month = String(dt.getMonth() + 1).padStart(2, '0');
      const day = String(dt.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Collect all dates up to rangeEnd to compute running cumulative stock correctly
    const allDateKeysSet = new Set();

    // Populate date range for selected period
    let curr = new Date(rangeStart);
    while (curr <= rangeEnd) {
      allDateKeysSet.add(toDateKey(curr));
      curr.setDate(curr.getDate() + 1);
    }

    // Add dates from actual records
    productions.forEach((p) => allDateKeysSet.add(toDateKey(p.date)));
    packagings.forEach((p) => allDateKeysSet.add(toDateKey(p.date)));
    sales.forEach((s) => allDateKeysSet.add(toDateKey(s.date)));
    outflows.forEach((o) => allDateKeysSet.add(toDateKey(o.date)));

    const sortedAllDateKeys = Array.from(allDateKeysSet).sort();

    // Initialize daily map for all dates
    const dailyMap = {};
    sortedAllDateKeys.forEach((key) => {
      const dt = new Date(key + 'T00:00:00');
      const formattedDate = dt.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      dailyMap[key] = {
        dateKey: key,
        formattedDate,
        // A. Pengambilan Susu Segar (Ltr)
        farmTegalsari: 0,
        farmLimpakuwus: 0,
        farmManggala: 0,
        totalFarmLiters: 0,
        // B. Hasil Pengolahan (Botol/Cup)
        susu115: 0,
        susu130: 0,
        susu200: 0,
        susu250: 0,
        yogurt200: 0,
        totalHasilPengolahan: 0,
        // C. Distribusi Penjualan
        saleEduwisata: 0,
        saleSppg: 0,
        saleLain: 0,
        totalSale: 0,
        // Distribusi Hibah
        hibahInternalSusu: 0,
        hibahInternalYogurt: 0,
        hibahEksternalSusu: 0,
        totalHibah: 0,
        totalDistribusi: 0,
        // D. Rusak / Afkir
        rusakAfkir: 0,
        // E. Sisa Stok (Botol)
        stokSusu115: 0,
        stokSusu250: 0,
        stokYogurt200: 0,
        totalStokBotol: 0,
      };
    });

    // Populate Farm Milk Productions
    productions.forEach((p) => {
      const key = toDateKey(p.date);
      if (!dailyMap[key]) return;

      const liters = p.rawVolumeLiters || p.grossVolumeLiters || p.processedLiters || 0;
      const notes = (p.notes || '').toLowerCase() + (p.usageType || '').toLowerCase();

      // Check for regex breakdown in notes e.g. "tegalsari=80", "limpakuwus=0", "manggala=0"
      const tgsMatch = notes.match(/tegalsari[^\d]*(\d+(?:\.\d+)?)/i);
      const lpkMatch = notes.match(/limpakuwus[^\d]*(\d+(?:\.\d+)?)/i);
      const mgnMatch = notes.match(/manggala[^\d]*(\d+(?:\.\d+)?)/i);

      if (tgsMatch || lpkMatch || mgnMatch) {
        const tgs = tgsMatch ? parseFloat(tgsMatch[1]) || 0 : 0;
        const lpk = lpkMatch ? parseFloat(lpkMatch[1]) || 0 : 0;
        const mgn = mgnMatch ? parseFloat(mgnMatch[1]) || 0 : 0;

        dailyMap[key].farmTegalsari += tgs;
        dailyMap[key].farmLimpakuwus += lpk;
        dailyMap[key].farmManggala += mgn;
      } else {
        if (notes.includes('limpakuwus') || notes.includes('lpk')) {
          dailyMap[key].farmLimpakuwus += liters;
        } else if (notes.includes('manggala') || notes.includes('mgn')) {
          dailyMap[key].farmManggala += liters;
        } else {
          dailyMap[key].farmTegalsari += liters;
        }
      }

      dailyMap[key].totalFarmLiters =
        dailyMap[key].farmTegalsari + dailyMap[key].farmLimpakuwus + dailyMap[key].farmManggala;
    });

    // Populate Hasil Pengolahan (MilkPackaging)
    packagings.forEach((p) => {
      const key = toDateKey(p.date);
      if (!dailyMap[key]) return;

      let items = [];
      if (p.packagingDetails) {
        try {
          items = JSON.parse(p.packagingDetails);
        } catch (e) {
          items = [];
        }
      }

      if (items.length > 0) {
        items.forEach((it) => {
          const cat = (it.productCategory || p.productCategory || '').toLowerCase();
          const size = (it.size || p.packageSize || '').toLowerCase();
          const qty = parseInt(it.quantity || 0, 10);

          if (cat.includes('yogurt')) {
            dailyMap[key].yogurt200 += qty;
          } else if (size.includes('115')) {
            dailyMap[key].susu115 += qty;
          } else if (size.includes('130')) {
            dailyMap[key].susu130 += qty;
          } else if (size.includes('200')) {
            dailyMap[key].susu200 += qty;
          } else if (size.includes('250')) {
            dailyMap[key].susu250 += qty;
          } else {
            dailyMap[key].susu250 += qty;
          }
        });
      } else {
        if (p.botolQty > 0 || p.cupQty > 0 || p.plastikBantalQty > 0) {
          const cat = (p.productCategory || '').toLowerCase();
          if (cat.includes('yogurt')) {
            dailyMap[key].yogurt200 += (p.botolQty + p.cupQty + p.plastikBantalQty);
          } else {
            const size = (p.packageSize || '').toLowerCase();
            if (size.includes('115')) dailyMap[key].susu115 += p.botolQty;
            else dailyMap[key].susu250 += p.botolQty;

            dailyMap[key].susu200 += p.cupQty;
            dailyMap[key].susu250 += p.plastikBantalQty;
          }
        } else {
          const qty = p.quantityReceived || p.totalPackagedQty || 0;
          const cat = (p.productCategory || '').toLowerCase();
          const size = (p.packageSize || '').toLowerCase();

          if (cat.includes('yogurt')) {
            dailyMap[key].yogurt200 += qty;
          } else if (size.includes('115')) {
            dailyMap[key].susu115 += qty;
          } else if (size.includes('130')) {
            dailyMap[key].susu130 += qty;
          } else if (size.includes('200')) {
            dailyMap[key].susu200 += qty;
          } else if (size.includes('250')) {
            dailyMap[key].susu250 += qty;
          } else {
            dailyMap[key].susu250 += qty;
          }
        }
      }

      dailyMap[key].totalHasilPengolahan =
        dailyMap[key].susu115 +
        dailyMap[key].susu130 +
        dailyMap[key].susu200 +
        dailyMap[key].susu250 +
        dailyMap[key].yogurt200;
    });

    // Populate Sales (Distribusi Penjualan)
    sales.forEach((s) => {
      const key = toDateKey(s.date);
      if (!dailyMap[key]) return;

      const qty = s.quantity || 0;
      const notes = (s.notes || '').toLowerCase() + (s.productSubtype || '').toLowerCase();

      if (notes.includes('eduwisata') || notes.includes('edu')) {
        dailyMap[key].saleEduwisata += qty;
      } else if (notes.includes('sppg')) {
        dailyMap[key].saleSppg += qty;
      } else {
        dailyMap[key].saleLain += qty;
      }

      dailyMap[key].totalSale =
        dailyMap[key].saleEduwisata + dailyMap[key].saleSppg + dailyMap[key].saleLain;
    });

    // Populate Outflows (Hibah & Rusak / Afkir)
    outflows.forEach((o) => {
      const key = toDateKey(o.date);
      if (!dailyMap[key]) return;

      const qty = o.quantity || 0;
      const notes = (o.notes || '').toLowerCase();

      if (notes.includes('afkir') || notes.includes('rusak') || notes.includes('damage') || notes.includes('expired')) {
        dailyMap[key].rusakAfkir += qty;
      } else if (notes.includes('hibah internal yogurt') || (notes.includes('internal') && notes.includes('yogurt'))) {
        dailyMap[key].hibahInternalYogurt += qty;
      } else if (notes.includes('hibah eksternal') || notes.includes('eksternal')) {
        dailyMap[key].hibahEksternalSusu += qty;
      } else if (notes.includes('hibah internal') || notes.includes('hibah')) {
        dailyMap[key].hibahInternalSusu += qty;
      } else {
        dailyMap[key].hibahInternalSusu += qty;
      }

      dailyMap[key].totalHibah =
        dailyMap[key].hibahInternalSusu +
        dailyMap[key].hibahInternalYogurt +
        dailyMap[key].hibahEksternalSusu;
    });

    // Compute cumulative stock sequentially across all dates
    let cumulativeSusu115 = 0;
    let cumulativeSusu250 = 0;
    let cumulativeYogurt200 = 0;

    const startKeyStr = toDateKey(rangeStart);
    const endKeyStr = toDateKey(rangeEnd);

    const filteredRecords = [];

    sortedAllDateKeys.forEach((key) => {
      const row = dailyMap[key];

      // Total Distribusi = Sales + Hibah
      row.totalDistribusi = row.totalSale + row.totalHibah;

      // Update cumulative stock values
      cumulativeSusu115 += (row.susu115 - (row.saleEduwisata + row.saleSppg + row.saleLain) * 0.4 - row.hibahInternalSusu * 0.5 - row.rusakAfkir * 0.3);
      cumulativeSusu250 += (row.susu250 - (row.saleEduwisata + row.saleSppg + row.saleLain) * 0.6 - row.hibahEksternalSusu * 0.5 - row.rusakAfkir * 0.4);
      cumulativeYogurt200 += (row.yogurt200 - row.hibahInternalYogurt - row.rusakAfkir * 0.3);

      row.stokSusu115 = Math.max(0, Math.round(cumulativeSusu115));
      row.stokSusu250 = Math.max(0, Math.round(cumulativeSusu250));
      row.stokYogurt200 = Math.max(0, Math.round(cumulativeYogurt200));
      row.totalStokBotol = row.stokSusu115 + row.stokSusu250 + row.stokYogurt200;

      // Only push rows that fall within requested date range
      if (key >= startKeyStr && key <= endKeyStr) {
        filteredRecords.push(row);
      }
    });

    // Compute Grand Totals for requested period
    const grandTotals = {
      farmTegalsari: 0,
      farmLimpakuwus: 0,
      farmManggala: 0,
      totalFarmLiters: 0,
      susu115: 0,
      susu130: 0,
      susu200: 0,
      susu250: 0,
      yogurt200: 0,
      totalHasilPengolahan: 0,
      saleEduwisata: 0,
      saleSppg: 0,
      saleLain: 0,
      hibahInternalSusu: 0,
      hibahInternalYogurt: 0,
      hibahEksternalSusu: 0,
      totalHibah: 0,
      totalDistribusi: 0,
      rusakAfkir: 0,
      stokSusu115: 0,
      stokSusu250: 0,
      stokYogurt200: 0,
      totalStokBotol: 0,
    };

    filteredRecords.forEach((row) => {
      grandTotals.farmTegalsari += row.farmTegalsari;
      grandTotals.farmLimpakuwus += row.farmLimpakuwus;
      grandTotals.farmManggala += row.farmManggala;
      grandTotals.totalFarmLiters += row.totalFarmLiters;

      grandTotals.susu115 += row.susu115;
      grandTotals.susu130 += row.susu130;
      grandTotals.susu200 += row.susu200;
      grandTotals.susu250 += row.susu250;
      grandTotals.yogurt200 += row.yogurt200;
      grandTotals.totalHasilPengolahan += row.totalHasilPengolahan;

      grandTotals.saleEduwisata += row.saleEduwisata;
      grandTotals.saleSppg += row.saleSppg;
      grandTotals.saleLain += row.saleLain;
      grandTotals.hibahInternalSusu += row.hibahInternalSusu;
      grandTotals.hibahInternalYogurt += row.hibahInternalYogurt;
      grandTotals.hibahEksternalSusu += row.hibahEksternalSusu;
      grandTotals.totalHibah += row.totalHibah;
      grandTotals.totalDistribusi += row.totalDistribusi;
      grandTotals.rusakAfkir += row.rusakAfkir;
    });

    // Final stock at end of period
    const lastRow = filteredRecords[filteredRecords.length - 1];
    if (lastRow) {
      grandTotals.stokSusu115 = lastRow.stokSusu115;
      grandTotals.stokSusu250 = lastRow.stokSusu250;
      grandTotals.stokYogurt200 = lastRow.stokYogurt200;
      grandTotals.totalStokBotol = lastRow.totalStokBotol;
    }

    return NextResponse.json({
      success: true,
      data: {
        month: currentMonth,
        year: currentYear,
        startDate: startKeyStr,
        endDate: endKeyStr,
        summary: {
          totalFarmLiters: grandTotals.totalFarmLiters,
          totalHasilPengolahan: grandTotals.totalHasilPengolahan,
          totalPenjualan: grandTotals.saleEduwisata + grandTotals.saleSppg + grandTotals.saleLain,
          totalHibah: grandTotals.totalHibah,
          totalRusakAfkir: grandTotals.rusakAfkir,
          sisaStokAkhir: grandTotals.totalStokBotol,
        },
        records: filteredRecords,
        grandTotals,
      },
    });
  } catch (error) {
    console.error('GET /api/reports/packaging error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
