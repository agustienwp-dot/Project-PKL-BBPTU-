import { NextResponse } from 'next/server';
import prisma, { isDbOffline } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const now = new Date();
    const month = parseInt(searchParams.get('month') || (now.getMonth() + 1).toString(), 10);
    const year = parseInt(searchParams.get('year') || now.getFullYear().toString(), 10);
    const productType = searchParams.get('productType') || 'ALL'; // Default to ALL if not specified
    const animalType = searchParams.get('animalType') || 'ALL'; // Default to ALL if not specified

    // Date range for the requested month using pure UTC bounds
    const daysInMonth = new Date(year, month, 0).getDate();
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month - 1, daysInMonth, 23, 59, 59, 999));

    // Fast bypass if DB is known to be offline (instant <2ms response)
    if (isDbOffline()) {
      throw new Error('DB_OFFLINE_CACHE');
    }

    const whereProd = {
      date: { gte: startDate, lte: endDate },
    };
    const whereOut = {
      date: { gte: startDate, lte: endDate },
    };

    if (productType && productType !== 'ALL') {
      whereProd.product_type = productType;
      whereOut.product_type = productType;
    }

    if (animalType && animalType !== 'ALL') {
      whereProd.animal_type = animalType;
      whereOut.animal_type = animalType;
    }

    let monthProductions = [];
    try {
      monthProductions = await prisma.milkProduction.findMany({
        where: whereProd,
        include: { category: true },
        orderBy: { date: 'asc' },
      });
    } catch (e) {
      console.error('monthProductions findMany error:', e);
      monthProductions = [];
    }

    let monthOutflows = [];
    try {
      monthOutflows = await prisma.milkOutflow.findMany({
        where: whereOut,
        include: { category: true },
        orderBy: { date: 'asc' },
      });
    } catch (e) {
      console.error('monthOutflows findMany error:', e);
      monthOutflows = [];
    }

    const parseDateObj = (dateInput) => {
      if (!dateInput) return { year: 0, month: 0, day: 0 };
      if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateInput)) {
        const parts = dateInput.substring(0, 10).split('-');
        return {
          year: parseInt(parts[0], 10),
          month: parseInt(parts[1], 10),
          day: parseInt(parts[2], 10),
        };
      }
      const d = new Date(dateInput);
      return {
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        day: d.getDate(),
      };
    };

    // Merge in-memory production store items
    const mergedProductions = [...monthProductions];
    const existingIds = new Set(mergedProductions.map((p) => p.id));
    for (const memProd of (global.__inMemoryProductionList || [])) {
      if (!existingIds.has(memProd.id)) {
        const pDate = parseDateObj(memProd.date);
        if (pDate.year === year && pDate.month === month) {
          const memAnimal = memProd.animal_type || memProd.animalType;
          if (!animalType || animalType === 'ALL' || memAnimal === animalType) {
            mergedProductions.push(memProd);
            existingIds.add(memProd.id);
          }
        }
      }
    }

    // Monthly Aggregates
    let totalGrossLiters = 0;
    let totalPedetLiters = 0;
    let totalAfkirLiters = 0;
    let totalSoldFreshLiters = 0;
    let totalRawLiters = 0;
    let totalSapiRawLiters = 0;
    let totalKambingRawLiters = 0;
    let totalProcessedLiters = 0;
    let totalPackaged = 0;
    let totalOutflow = 0;

    const farmsMonthlyTotal = {
      tegalsari: { pagi: 0, sore: 0, total: 0 },
      limpakuwus: { pagi: 0, sore: 0, total: 0 },
      manggala: { pagi: 0, sore: 0, total: 0 },
      eduwisata: { pagi: 0, sore: 0, total: 0 },
      grandTotal: 0,
    };

    const packagingProducedTotals = { botol: 0, cup: 0, pack: 0 };
    const packagingOutflowTotals = { botol: 0, cup: 0, pack: 0 };

    const normalizeFarmKey = (origin) => {
      if (!origin) return 'manggala';
      const o = origin.toLowerCase();
      if (o.includes('tegal')) return 'tegalsari';
      if (o.includes('limpa')) return 'limpakuwus';
      if (o.includes('edu')) return 'eduwisata';
      return 'manggala';
    };

    mergedProductions.forEach((p) => {
      const gross = parseFloat(p.gross_volume_liters ?? p.grossVolumeLiters ?? p.raw_volume_liters ?? p.rawVolumeLiters ?? 0);
      const raw = parseFloat(p.raw_volume_liters ?? p.rawVolumeLiters ?? 0);
      const pedet = parseFloat(p.pedet_volume_liters ?? p.pedetVolumeLiters ?? 0);
      const afkir = parseFloat(p.afkir_volume_liters ?? p.afkirVolumeLiters ?? 0);
      const soldFresh = parseFloat(p.sold_fresh_volume_liters ?? p.soldFreshVolumeLiters ?? 0);
      const processed = parseFloat(p.processed_liters ?? p.processedLiters ?? 0) || raw;
      const pkgQty = parseInt(p.packaged_qty ?? p.packagedQty ?? 0, 10) || Math.round(raw);
      const aType = p.animal_type || p.animalType;
      const fOrigin = p.farm_origin || p.farmOrigin;

      totalGrossLiters += gross;
      totalPedetLiters += pedet;
      totalAfkirLiters += afkir;
      totalSoldFreshLiters += soldFresh;
      totalRawLiters += raw;
      if (aType === 'KAMBING') {
        totalKambingRawLiters += raw;
      } else {
        totalSapiRawLiters += raw;
      }
      totalProcessedLiters += processed;
      totalPackaged += pkgQty;

      const fKey = normalizeFarmKey(fOrigin);
      const isSore = (p.shift || '').toLowerCase().includes('sore');
      if (isSore) {
        farmsMonthlyTotal[fKey].sore += gross;
      } else {
        farmsMonthlyTotal[fKey].pagi += gross;
      }
      farmsMonthlyTotal[fKey].total += gross;
      farmsMonthlyTotal.grandTotal += gross;

      const pkg = p.packaging_type || p.packagingType || 'botol';
      if (packagingProducedTotals[pkg] !== undefined) {
        packagingProducedTotals[pkg] += pkgQty;
      } else {
        packagingProducedTotals[pkg] = pkgQty;
      }
    });

    monthOutflows.forEach((o) => {
      const q = parseFloat(o.quantity || 0);
      totalOutflow += q;

      const pkg = o.packaging_type || o.packagingType || 'botol';
      if (packagingOutflowTotals[pkg] !== undefined) {
        packagingOutflowTotals[pkg] += q;
      } else {
        packagingOutflowTotals[pkg] = q;
      }
    });

    // Generate Daily Breakdown (Day 1 to daysInMonth)
    const dailyLogs = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dayProds = mergedProductions.filter((p) => {
        const parsed = parseDateObj(p.date);
        return parsed.day === day && parsed.month === month && parsed.year === year;
      });

      const dayOuts = monthOutflows.filter((o) => {
        const parsed = parseDateObj(o.date);
        return parsed.day === day && parsed.month === month && parsed.year === year;
      });

      let dayGrossLiters = 0;
      let dayPedetLiters = 0;
      let dayAfkirLiters = 0;
      let daySoldFreshLiters = 0;
      let dayRawLiters = 0;
      let daySapiRawLiters = 0;
      let dayKambingRawLiters = 0;
      let dayProcessedLiters = 0;
      let dayPackaged = 0;
      let dayOutflow = 0;

      const farmsBreakdown = {
        tegalsari: { pagi: 0, sore: 0, total: 0 },
        limpakuwus: { pagi: 0, sore: 0, total: 0 },
        manggala: { pagi: 0, sore: 0, total: 0 },
        eduwisata: { pagi: 0, sore: 0, total: 0 },
        grandTotal: 0,
      };

      const dayPkgProd = { botol: 0, cup: 0, pack: 0 };
      const dayPkgOut = { botol: 0, cup: 0, pack: 0 };

      dayProds.forEach((p) => {
        const gross = parseFloat(p.gross_volume_liters ?? p.grossVolumeLiters ?? p.raw_volume_liters ?? p.rawVolumeLiters ?? 0);
        const raw = parseFloat(p.raw_volume_liters ?? p.rawVolumeLiters ?? 0);
        const pedet = parseFloat(p.pedet_volume_liters ?? p.pedetVolumeLiters ?? 0);
        const afkir = parseFloat(p.afkir_volume_liters ?? p.afkirVolumeLiters ?? 0);
        const soldFresh = parseFloat(p.sold_fresh_volume_liters ?? p.soldFreshVolumeLiters ?? 0);
        const processed = parseFloat(p.processed_liters ?? p.processedLiters ?? 0) || raw;
        const pkgQty = parseInt(p.packaged_qty ?? p.packagedQty ?? 0, 10) || Math.round(raw);
        const aType = p.animal_type || p.animalType;
        const fOrigin = p.farm_origin || p.farmOrigin;

        dayGrossLiters += gross;
        dayPedetLiters += pedet;
        dayAfkirLiters += afkir;
        daySoldFreshLiters += soldFresh;
        dayRawLiters += raw;
        if (aType === 'KAMBING') {
          dayKambingRawLiters += raw;
        } else {
          daySapiRawLiters += raw;
        }
        dayProcessedLiters += processed;
        dayPackaged += pkgQty;

        const fKey = normalizeFarmKey(fOrigin);
        const isSore = (p.shift || '').toLowerCase().includes('sore');
        if (isSore) {
          farmsBreakdown[fKey].sore += gross;
        } else {
          farmsBreakdown[fKey].pagi += gross;
        }
        farmsBreakdown[fKey].total += gross;
        farmsBreakdown.grandTotal += gross;

        const pkg = p.packaging_type || p.packagingType || 'botol';
        dayPkgProd[pkg] = (dayPkgProd[pkg] || 0) + pkgQty;
      });

      dayOuts.forEach((o) => {
        const q = parseFloat(o.quantity || 0);
        dayOutflow += q;
        const pkg = o.packaging_type || o.packagingType || 'botol';
        dayPkgOut[pkg] = (dayPkgOut[pkg] || 0) + q;
      });

      dailyLogs.push({
        day,
        dateStr: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`,
        grossVolumeLiters: dayGrossLiters,
        pedetVolumeLiters: dayPedetLiters,
        afkirVolumeLiters: dayAfkirLiters,
        soldFreshVolumeLiters: daySoldFreshLiters,
        rawVolumeLiters: dayRawLiters,
        sapiRawLiters: daySapiRawLiters,
        keteranganPenjualan: null,
        kambingRawLiters: dayKambingRawLiters,
        processedLiters: dayProcessedLiters,
        packagedQty: dayPackaged,
        outflowQty: dayOutflow,
        farmsBreakdown,
        pkgProd: dayPkgProd,
        pkgOut: dayPkgOut,
        productionCount: dayProds.length,
        outflowCount: dayOuts.length,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        month,
        year,
        productType,
        summary: {
          totalGrossLiters,
          totalPedetLiters,
          totalAfkirLiters,
          totalSoldFreshLiters,
          totalRawLiters,
          totalSapiRawLiters,
          totalKambingRawLiters,
          totalProcessedLiters,
          totalPackaged,
          totalOutflow,
          farmsMonthlyTotal,
          netStockChange: totalPackaged - totalOutflow,
          packagingProducedTotals,
          packagingOutflowTotals,
        },
        dailyLogs,
      },
    });
  } catch (error) {
    console.error('GET /api/reports/monthly error:', error);
    return NextResponse.json({
      success: true,
      data: {
        month: 8,
        year: 2026,
        summary: {
          totalGrossLiters: 0,
          totalRawLiters: 0,
          farmsMonthlyTotal: {
            tegalsari: { pagi: 0, sore: 0, total: 0 },
            limpakuwus: { pagi: 0, sore: 0, total: 0 },
            manggala: { pagi: 0, sore: 0, total: 0 },
            eduwisata: { pagi: 0, sore: 0, total: 0 },
            grandTotal: 0,
          },
        },
        dailyLogs: [],
      },
    });
  }
}
