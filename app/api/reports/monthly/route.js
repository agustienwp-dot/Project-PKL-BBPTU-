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

    // Date range for the requested month with timezone buffer
    const daysInMonth = new Date(year, month, 0).getDate();
    const queryStart = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0) - 48 * 60 * 60 * 1000);
    const queryEnd = new Date(Date.UTC(year, month - 1, daysInMonth, 23, 59, 59, 999) + 48 * 60 * 60 * 1000);

    if (isDbOffline()) {
      throw new Error('DB_OFFLINE_CACHE');
    }

    const whereProd = {
      date: { gte: queryStart, lte: queryEnd },
    };
    const whereOut = {
      createdAt: { gte: queryStart, lte: queryEnd },
    };

    if (productType && productType !== 'ALL') {
      whereProd.productType = productType;
      whereOut.productType = productType;
    }

    if (animalType && animalType !== 'ALL') {
      whereProd.animalType = animalType.toUpperCase();
      whereOut.animalType = animalType.toUpperCase();
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
        orderBy: { createdAt: 'asc' },
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
      if (isNaN(d.getTime())) return { year: 0, month: 0, day: 0 };
      const iso = d.toISOString().slice(0, 10).split('-');
      return {
        year: parseInt(iso[0], 10),
        month: parseInt(iso[1], 10),
        day: parseInt(iso[2], 10),
      };
    };

    // Filter strictly to the requested year and month
    const validProductions = monthProductions.filter((p) => {
      const parsed = parseDateObj(p.date);
      return parsed.year === year && parsed.month === month;
    });

    const validOutflows = monthOutflows.filter((o) => {
      const parsed = parseDateObj(o.createdAt || o.date);
      return parsed.year === year && parsed.month === month;
    });

    // Merge in-memory production store items if present
    const mergedProductions = [...validProductions];
    const existingIds = new Set(mergedProductions.map((p) => p.id));
    for (const memProd of (global.__inMemoryProductionList || [])) {
      if (!existingIds.has(memProd.id)) {
        const pDate = parseDateObj(memProd.date);
        if (pDate.year === year && pDate.month === month) {
          const memAnimal = (memProd.animalType || memProd.animal_type || 'SAPI').toUpperCase();
          if (!animalType || animalType === 'ALL' || memAnimal === animalType.toUpperCase()) {
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
      kambing: { pagi: 0, sore: 0, total: 0 },
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
      const raw = parseFloat(p.rawVolumeLiters ?? p.raw_volume_liters ?? 0);
      const pedet = parseFloat(p.pedetVolumeLiters ?? p.pedet_volume_liters ?? 0);
      const afkir = parseFloat(p.afkirVolumeLiters ?? p.afkir_volume_liters ?? 0);
      let gross = parseFloat(p.grossVolumeLiters ?? p.gross_volume_liters ?? 0);
      if (gross <= 0 && raw > 0) {
        gross = raw + pedet + afkir;
      }
      const soldFresh = parseFloat(p.soldFreshVolumeLiters ?? p.sold_fresh_volume_liters ?? 0);
      const processed = parseFloat(p.processedLiters ?? p.processed_liters ?? 0) || raw;
      const pkgQty = parseInt(p.packagedQty ?? p.packaged_qty ?? 0, 10) || Math.round(raw);
      const aType = (p.animalType || p.animal_type || 'SAPI').toUpperCase();
      const fOrigin = p.farmOrigin || p.farm_origin || 'Manggala';

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

      const isSore = (p.shift || '').toLowerCase().includes('sore');
      if (aType === 'KAMBING') {
        if (isSore) {
          farmsMonthlyTotal.kambing.sore += gross;
        } else {
          farmsMonthlyTotal.kambing.pagi += gross;
        }
        farmsMonthlyTotal.kambing.total += gross;
      } else {
        const fKey = normalizeFarmKey(fOrigin);
        if (isSore) {
          farmsMonthlyTotal[fKey].sore += gross;
        } else {
          farmsMonthlyTotal[fKey].pagi += gross;
        }
        farmsMonthlyTotal[fKey].total += gross;
      }
      farmsMonthlyTotal.grandTotal += gross;

      const pkg = p.packagingType || p.packaging_type || 'botol';
      if (packagingProducedTotals[pkg] !== undefined) {
        packagingProducedTotals[pkg] += pkgQty;
      } else {
        packagingProducedTotals[pkg] = pkgQty;
      }
    });

    validOutflows.forEach((o) => {
      const q = parseFloat(o.quantity || 0);
      totalOutflow += q;

      const pkg = o.packagingType || o.packaging_type || 'botol';
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
        return parsed.day === day;
      });

      const dayOuts = validOutflows.filter((o) => {
        const parsed = parseDateObj(o.createdAt || o.date);
        return parsed.day === day;
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
        kambing: { pagi: 0, sore: 0, total: 0 },
        grandTotal: 0,
      };

      const dayPkgProd = { botol: 0, cup: 0, pack: 0 };
      const dayPkgOut = { botol: 0, cup: 0, pack: 0 };

      dayProds.forEach((p) => {
        const raw = parseFloat(p.rawVolumeLiters ?? p.raw_volume_liters ?? 0);
        const pedet = parseFloat(p.pedetVolumeLiters ?? p.pedet_volume_liters ?? 0);
        const afkir = parseFloat(p.afkirVolumeLiters ?? p.afkir_volume_liters ?? 0);
        let gross = parseFloat(p.grossVolumeLiters ?? p.gross_volume_liters ?? 0);
        if (gross <= 0 && raw > 0) {
          gross = raw + pedet + afkir;
        }
        const soldFresh = parseFloat(p.soldFreshVolumeLiters ?? p.sold_fresh_volume_liters ?? 0);
        const processed = parseFloat(p.processedLiters ?? p.processed_liters ?? 0) || raw;
        const pkgQty = parseInt(p.packagedQty ?? p.packaged_qty ?? 0, 10) || Math.round(raw);
        const aType = (p.animalType || p.animal_type || 'SAPI').toUpperCase();
        const fOrigin = p.farmOrigin || p.farm_origin || 'Manggala';

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

        const isSore = (p.shift || '').toLowerCase().includes('sore');
        if (aType === 'KAMBING') {
          if (isSore) {
            farmsBreakdown.kambing.sore += gross;
          } else {
            farmsBreakdown.kambing.pagi += gross;
          }
          farmsBreakdown.kambing.total += gross;
        } else {
          const fKey = normalizeFarmKey(fOrigin);
          if (isSore) {
            farmsBreakdown[fKey].sore += gross;
          } else {
            farmsBreakdown[fKey].pagi += gross;
          }
          farmsBreakdown[fKey].total += gross;
        }
        farmsBreakdown.grandTotal += gross;

        const pkg = p.packagingType || p.packaging_type || 'botol';
        dayPkgProd[pkg] = (dayPkgProd[pkg] || 0) + pkgQty;
      });

      dayOuts.forEach((o) => {
        const q = parseFloat(o.quantity || 0);
        dayOutflow += q;
        const pkg = o.packagingType || o.packaging_type || 'botol';
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
      success: false,
      message: error?.message || 'Gagal memuat laporan bulanan',
      data: null,
    }, { status: 500 });
  }
}
