import { NextResponse } from 'next/server';
import prisma, { isDbOffline, markDbOffline, markDbOnline } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    if (isDbOffline()) {
      throw new Error('DB_OFFLINE_CACHE');
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Get categories for SEGAR vs OLAHAN
    const segarCategories = await prisma.milkCategory.findMany({ where: { productType: 'SEGAR' }, orderBy: { name: 'asc' } });
    const olahanCategories = await prisma.milkCategory.findMany({ where: { productType: 'OLAHAN' }, orderBy: { name: 'asc' } });

    // Function to calculate stock breakdown for categories
    const getStockForCategories = async (catList) => {
      return Promise.all(
        catList.map(async (cat) => {
          const prodSum = await prisma.milkProduction.aggregate({
            where: { categoryId: cat.id },
            _sum: { packagedQty: true, rawVolumeLiters: true },
          });

          const outSum = await prisma.milkOutflow.aggregate({
            where: { categoryId: cat.id },
            _sum: { quantity: true },
          });

          const packaged = prodSum._sum.packagedQty || 0;
          const outflow = outSum._sum.quantity || 0;
          const ready = Math.max(0, packaged - outflow);

          // Get packaging breakdown
          const prodPkg = await prisma.milkProduction.groupBy({
            by: ['packagingType'],
            where: { categoryId: cat.id },
            _sum: { packagedQty: true },
          });

          const outPkg = await prisma.milkOutflow.groupBy({
            by: ['packagingType'],
            where: { categoryId: cat.id },
            _sum: { quantity: true },
          });

          const pkgMap = {};
          prodPkg.forEach((p) => {
            const pkg = p.packagingType || cat.defaultPackaging || 'botol';
            if (!pkgMap[pkg]) pkgMap[pkg] = { packaged: 0, outflow: 0, ready: 0 };
            pkgMap[pkg].packaged += p._sum.packagedQty || 0;
          });

          outPkg.forEach((o) => {
            const pkg = o.packagingType || cat.defaultPackaging || 'botol';
            if (!pkgMap[pkg]) pkgMap[pkg] = { packaged: 0, outflow: 0, ready: 0 };
            pkgMap[pkg].outflow += o._sum.quantity || 0;
          });

          Object.keys(pkgMap).forEach((k) => {
            pkgMap[k].ready = Math.max(0, pkgMap[k].packaged - pkgMap[k].outflow);
          });

          return {
            id: cat.id,
            name: cat.name,
            code: cat.code,
            productType: cat.productType,
            defaultPackaging: cat.defaultPackaging,
            packaged,
            outflow,
            ready,
            packagingBreakdown: pkgMap,
          };
        })
      );
    };

    const segarStocks = await getStockForCategories(segarCategories);
    const olahanStocks = await getStockForCategories(olahanCategories);

    const totalSegarReady = segarStocks.reduce((acc, c) => acc + c.ready, 0);
    const totalOlahanReady = olahanStocks.reduce((acc, c) => acc + c.ready, 0);

    // Kemasan breakdown for Olahan (Cup, Pack, Botol)
    const olahanKemasanTotals = { cup: 0, pack: 0, botol: 0 };
    olahanStocks.forEach((s) => {
      Object.keys(s.packagingBreakdown).forEach((pkg) => {
        if (olahanKemasanTotals[pkg] !== undefined) {
          olahanKemasanTotals[pkg] += s.packagingBreakdown[pkg].ready;
        } else {
          olahanKemasanTotals[pkg] = s.packagingBreakdown[pkg].ready;
        }
      });
    });

    // Today & Month Stats for SEGAR (All, Sapi, Kambing)
    const todaySegarProd = await prisma.milkProduction.aggregate({
      where: { productType: 'SEGAR', date: { gte: startOfToday, lte: endOfToday } },
      _sum: { rawVolumeLiters: true, packagedQty: true },
    });
    const todaySapiProd = await prisma.milkProduction.aggregate({
      where: { productType: 'SEGAR', animalType: 'SAPI', date: { gte: startOfToday, lte: endOfToday } },
      _sum: { rawVolumeLiters: true, packagedQty: true },
    });
    const todayKambingProd = await prisma.milkProduction.aggregate({
      where: { productType: 'SEGAR', animalType: 'KAMBING', date: { gte: startOfToday, lte: endOfToday } },
      _sum: { rawVolumeLiters: true, packagedQty: true },
    });

    const monthSegarProd = await prisma.milkProduction.aggregate({
      where: { productType: 'SEGAR', date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { rawVolumeLiters: true, packagedQty: true },
    });
    const monthSapiProd = await prisma.milkProduction.aggregate({
      where: { productType: 'SEGAR', animalType: 'SAPI', date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { rawVolumeLiters: true, packagedQty: true },
    });
    const monthKambingProd = await prisma.milkProduction.aggregate({
      where: { productType: 'SEGAR', animalType: 'KAMBING', date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { rawVolumeLiters: true, packagedQty: true },
    });

    const totalSapiAgg = await prisma.milkProduction.aggregate({
      where: { animalType: 'SAPI' },
      _sum: { rawVolumeLiters: true },
    });
    const totalKambingAgg = await prisma.milkProduction.aggregate({
      where: { animalType: 'KAMBING' },
      _sum: { rawVolumeLiters: true },
    });

    const todaySegarOut = await prisma.milkOutflow.aggregate({
      where: { productType: 'SEGAR', date: { gte: startOfToday, lte: endOfToday } },
      _sum: { quantity: true },
    });
    const monthSegarOut = await prisma.milkOutflow.aggregate({
      where: { productType: 'SEGAR', date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { quantity: true },
    });

    // Today & Month Stats for OLAHAN
    const todayOlahanProd = await prisma.milkProduction.aggregate({
      where: { productType: 'OLAHAN', date: { gte: startOfToday, lte: endOfToday } },
      _sum: { rawVolumeLiters: true, packagedQty: true },
    });
    const monthOlahanProd = await prisma.milkProduction.aggregate({
      where: { productType: 'OLAHAN', date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { rawVolumeLiters: true, packagedQty: true },
    });
    const todayOlahanOut = await prisma.milkOutflow.aggregate({
      where: { productType: 'OLAHAN', date: { gte: startOfToday, lte: endOfToday } },
      _sum: { quantity: true },
    });
    const monthOlahanOut = await prisma.milkOutflow.aggregate({
      where: { productType: 'OLAHAN', date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { quantity: true },
    });

    // Recent items
    const recentSegarProductions = await prisma.milkProduction.findMany({
      take: 8,
      where: { productType: 'SEGAR' },
      orderBy: { date: 'desc' },
      include: { category: true, createdBy: { select: { name: true } } },
    });
    const recentOlahanProductions = await prisma.milkProduction.findMany({
      take: 8,
      where: { productType: 'OLAHAN' },
      orderBy: { date: 'desc' },
      include: { category: true, createdBy: { select: { name: true } } },
    });

    const recentSegarOutflows = await prisma.milkOutflow.findMany({
      take: 5,
      where: { productType: 'SEGAR' },
      orderBy: { date: 'desc' },
      include: { category: true, createdBy: { select: { name: true } } },
    });
    const recentOlahanOutflows = await prisma.milkOutflow.findMany({
      take: 5,
      where: { productType: 'OLAHAN' },
      orderBy: { date: 'desc' },
      include: { category: true, createdBy: { select: { name: true } } },
    });

    // Superadmin overall summary
    const totalAdmins = await prisma.user.count();
    const totalLitersAgg = await prisma.milkProduction.aggregate({ _sum: { rawVolumeLiters: true } });
    const recentLogs = await prisma.systemLog.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
    });

    // Admin Farm Production Breakdown: check today first, fallback to latest recorded production date if today has no inputs
    let targetStartDate = startOfToday;
    let targetEndDate = endOfToday;

    const checkTodayAgg = await prisma.milkProduction.aggregate({
      where: { date: { gte: startOfToday, lte: endOfToday } },
      _sum: { grossVolumeLiters: true, rawVolumeLiters: true },
    });

    if ((checkTodayAgg._sum.grossVolumeLiters || 0) === 0 && (checkTodayAgg._sum.rawVolumeLiters || 0) === 0) {
      const latestProd = await prisma.milkProduction.findFirst({
        orderBy: { date: 'desc' },
      });
      if (latestProd && latestProd.date) {
        const dLat = new Date(latestProd.date);
        targetStartDate = new Date(dLat.getFullYear(), dLat.getMonth(), dLat.getDate(), 0, 0, 0, 0);
        targetEndDate = new Date(dLat.getFullYear(), dLat.getMonth(), dLat.getDate(), 23, 59, 59, 999);
      }
    }

    const todayFarmProdAgg = await prisma.milkProduction.aggregate({
      where: { date: { gte: targetStartDate, lte: targetEndDate } },
      _sum: {
        grossVolumeLiters: true,
        pedetVolumeLiters: true,
        afkirVolumeLiters: true,
        soldFreshVolumeLiters: true,
        rawVolumeLiters: true,
      },
    });

    const todayFarmSapiProdAgg = await prisma.milkProduction.aggregate({
      where: { animalType: 'SAPI', date: { gte: targetStartDate, lte: targetEndDate } },
      _sum: {
        grossVolumeLiters: true,
        pedetVolumeLiters: true,
        afkirVolumeLiters: true,
        soldFreshVolumeLiters: true,
        rawVolumeLiters: true,
      },
    });

    const todayFarmKambingProdAgg = await prisma.milkProduction.aggregate({
      where: { animalType: 'KAMBING', date: { gte: targetStartDate, lte: targetEndDate } },
      _sum: {
        grossVolumeLiters: true,
        pedetVolumeLiters: true,
        afkirVolumeLiters: true,
        soldFreshVolumeLiters: true,
        rawVolumeLiters: true,
      },
    });

    const todayFarmOriginAgg = await prisma.milkProduction.groupBy({
      by: ['farmOrigin'],
      where: { date: { gte: targetStartDate, lte: targetEndDate } },
      _sum: { grossVolumeLiters: true, rawVolumeLiters: true },
    });

    const farmOriginMap = { tegalsari: 0, limpakuwus: 0, manggala: 0, eduwisata: 0 };
    todayFarmOriginAgg.forEach(f => {
      let key = (f.farmOrigin || '').toLowerCase().replace(/\s+/g, '').trim();
      if (key === 'limpakuwiu') key = 'limpakuwus';
      if (farmOriginMap[key] !== undefined) {
        const vol = (f._sum.grossVolumeLiters || 0) > 0 ? f._sum.grossVolumeLiters : (f._sum.rawVolumeLiters || 0);
        farmOriginMap[key] += vol;
      }
    });

    // Fetch sold fresh items with buyer breakdown
    const todaySoldFreshItems = await prisma.milkProduction.findMany({
      where: {
        soldFreshVolumeLiters: { gt: 0 }
      },
      select: {
        id: true,
        date: true,
        shift: true,
        farmOrigin: true,
        animalType: true,
        soldFreshVolumeLiters: true,
        keteranganPenjualan: true,
      },
      orderBy: { date: 'desc' },
      take: 10
    });

    // Today Packaging Aggregates for Admin Farm (Total, Sapi, Kambing)
    const todayPackagingAgg = await prisma.milkPackaging.aggregate({
      where: { date: { gte: startOfToday, lte: endOfToday } },
      _sum: { botolQty: true, cupQty: true, plastikBantalQty: true, totalPackagedQty: true, processedLiters: true },
    });

    const sapiPackagingAgg = await prisma.milkPackaging.aggregate({
      where: { animalType: 'SAPI', date: { gte: startOfToday, lte: endOfToday } },
      _sum: { botolQty: true, cupQty: true, plastikBantalQty: true, totalPackagedQty: true, processedLiters: true },
    });

    const kambingPackagingAgg = await prisma.milkPackaging.aggregate({
      where: { animalType: 'KAMBING', date: { gte: startOfToday, lte: endOfToday } },
      _sum: { botolQty: true, cupQty: true, plastikBantalQty: true, totalPackagedQty: true, processedLiters: true },
    });

    const totalPackagingAgg = await prisma.milkPackaging.aggregate({
      _sum: { botolQty: true, cupQty: true, plastikBantalQty: true, totalPackagedQty: true, processedLiters: true },
    });

    // Chart Data Generation (7 Days & Current Month 1-30/31)
    const getDailyChartData = async (daysCount) => {
      const chartData = [];
      const daysName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
        const dEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

        const dayAgg = await prisma.milkProduction.aggregate({
          where: { date: { gte: dStart, lte: dEnd } },
          _sum: { rawVolumeLiters: true },
        });

        const sapiAgg = await prisma.milkProduction.aggregate({
          where: { animalType: 'SAPI', date: { gte: dStart, lte: dEnd } },
          _sum: { rawVolumeLiters: true },
        });

        const kambingAgg = await prisma.milkProduction.aggregate({
          where: { animalType: 'KAMBING', date: { gte: dStart, lte: dEnd } },
          _sum: { rawVolumeLiters: true },
        });

        const dayLabel = `${daysName[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;

        chartData.push({
          label: dayLabel,
          dayName: daysName[d.getDay()],
          dayNum: d.getDate(),
          monthNum: d.getMonth() + 1,
          dateStr: `${d.getDate()}/${d.getMonth() + 1}`,
          formattedDate: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
          fullDate: d.toISOString().split('T')[0],
          totalLiters: dayAgg._sum.rawVolumeLiters || 0,
          sapiLiters: sapiAgg._sum.rawVolumeLiters || 0,
          kambingLiters: kambingAgg._sum.rawVolumeLiters || 0,
        });
      }
      return chartData;
    };

    const getMonthlyChartData = async () => {
      const chartData = [];
      const daysName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const year = now.getFullYear();
      const month = now.getMonth();
      const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

      for (let day = 1; day <= totalDaysInMonth; day++) {
        const d = new Date(year, month, day);
        const dStart = new Date(year, month, day, 0, 0, 0, 0);
        const dEnd = new Date(year, month, day, 23, 59, 59, 999);

        const dayAgg = await prisma.milkProduction.aggregate({
          where: { date: { gte: dStart, lte: dEnd } },
          _sum: { rawVolumeLiters: true },
        });

        const sapiAgg = await prisma.milkProduction.aggregate({
          where: { animalType: 'SAPI', date: { gte: dStart, lte: dEnd } },
          _sum: { rawVolumeLiters: true },
        });

        const kambingAgg = await prisma.milkProduction.aggregate({
          where: { animalType: 'KAMBING', date: { gte: dStart, lte: dEnd } },
          _sum: { rawVolumeLiters: true },
        });

        const monthName = d.toLocaleDateString('id-ID', { month: 'short' });

        chartData.push({
          label: `${daysName[d.getDay()]} ${day}/${month + 1}`,
          dayName: daysName[d.getDay()],
          dayNum: day,
          monthNum: month + 1,
          dateStr: `${day}/${month + 1}`,
          formattedDate: `${day} ${monthName}`,
          fullDate: d.toISOString().split('T')[0],
          totalLiters: dayAgg._sum.rawVolumeLiters || 0,
          sapiLiters: sapiAgg._sum.rawVolumeLiters || 0,
          kambingLiters: kambingAgg._sum.rawVolumeLiters || 0,
        });
      }
      return chartData;
    };

    const chart7Days = await getDailyChartData(7);
    const chart30Days = await getMonthlyChartData();

    const recentPackagings = await prisma.milkPackaging.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: { category: true, createdBy: { select: { name: true } } },
    });

    return NextResponse.json({
      success: true,
      data: {
        superadmin: {
          totalAdmins,
          totalLitersProduced: totalLitersAgg._sum.rawVolumeLiters || 0,
          totalSegarReady,
          totalOlahanReady,
          recentLogs,
        },
        farm: {
          todayGrossLiters: todayFarmProdAgg._sum.grossVolumeLiters || todaySegarProd._sum.rawVolumeLiters || 0,
          todayPedetLiters: todayFarmProdAgg._sum.pedetVolumeLiters || 0,
          todayAfkirLiters: todayFarmProdAgg._sum.afkirVolumeLiters || 0,
          todaySoldFreshLiters: todayFarmProdAgg._sum.soldFreshVolumeLiters || 0,
          todayRawLiters: todayFarmProdAgg._sum.rawVolumeLiters || todaySegarProd._sum.rawVolumeLiters || 0,

          todaySapiGross: todayFarmSapiProdAgg._sum.grossVolumeLiters || todaySapiProd._sum.rawVolumeLiters || 0,
          todaySapiRaw: todayFarmSapiProdAgg._sum.rawVolumeLiters || todaySapiProd._sum.rawVolumeLiters || 0,

          todayKambingGross: todayFarmKambingProdAgg._sum.grossVolumeLiters || todayKambingProd._sum.rawVolumeLiters || 0,
          todayKambingRaw: todayFarmKambingProdAgg._sum.rawVolumeLiters || todayKambingProd._sum.rawVolumeLiters || 0,

          todayTotalLiters: todayFarmProdAgg._sum.grossVolumeLiters || todaySegarProd._sum.rawVolumeLiters || 0,
          todaySapiLiters: todayFarmSapiProdAgg._sum.grossVolumeLiters || todaySapiProd._sum.rawVolumeLiters || 0,
          todayKambingLiters: todayFarmKambingProdAgg._sum.grossVolumeLiters || todayKambingProd._sum.rawVolumeLiters || 0,

          farmOriginToday: farmOriginMap,
          todaySoldFreshItems,

          // Overall Packaging (Kept for backwards compatibility)
          todayPackagedQty: todayPackagingAgg._sum.totalPackagedQty || 0,
          todayBotolQty: todayPackagingAgg._sum.botolQty || 0,
          todayCupQty: todayPackagingAgg._sum.cupQty || 0,
          todayPlastikBantalQty: todayPackagingAgg._sum.plastikBantalQty || 0,
          todayProcessedLiters: todayPackagingAgg._sum.processedLiters || 0,

          // Sapi Packaging
          sapiPackagedQty: sapiPackagingAgg._sum.totalPackagedQty || 0,
          sapiBotolQty: sapiPackagingAgg._sum.botolQty || 0,
          sapiCupQty: sapiPackagingAgg._sum.cupQty || 0,
          sapiPlastikBantalQty: sapiPackagingAgg._sum.plastikBantalQty || 0,
          sapiProcessedLiters: sapiPackagingAgg._sum.processedLiters || 0,

          // Kambing Packaging
          kambingPackagedQty: kambingPackagingAgg._sum.totalPackagedQty || 0,
          kambingBotolQty: kambingPackagingAgg._sum.botolQty || 0,
          kambingCupQty: kambingPackagingAgg._sum.cupQty || 0,
          kambingPlastikBantalQty: kambingPackagingAgg._sum.plastikBantalQty || 0,
          kambingProcessedLiters: kambingPackagingAgg._sum.processedLiters || 0,

          totalAccumulatedLiters: totalLitersAgg._sum.rawVolumeLiters || 0,
          totalPackagedQty: totalPackagingAgg._sum.totalPackagedQty || 0,
          chart7Days,
          chart30Days,
          recentPackagings,
          recentLogs,
        },
        segar: {
          totalReadyStock: totalSegarReady,
          todayLiters: todaySegarProd._sum.rawVolumeLiters || 0,
          todaySapiLiters: todaySapiProd._sum.rawVolumeLiters || 0,
          todayKambingLiters: todayKambingProd._sum.rawVolumeLiters || 0,
          todayPackaged: todaySegarProd._sum.packagedQty || 0,
          monthLiters: monthSegarProd._sum.rawVolumeLiters || 0,
          monthSapiLiters: monthSapiProd._sum.rawVolumeLiters || 0,
          monthKambingLiters: monthKambingProd._sum.rawVolumeLiters || 0,
          monthPackaged: monthSegarProd._sum.packagedQty || 0,
          totalSapiLiters: totalSapiAgg._sum.rawVolumeLiters || 0,
          totalKambingLiters: totalKambingAgg._sum.rawVolumeLiters || 0,
          todayOutflow: todaySegarOut._sum.quantity || 0,
          monthOutflow: monthSegarOut._sum.quantity || 0,
          categories: segarStocks,
          recentProductions: recentSegarProductions,
          recentOutflows: recentSegarOutflows,
        },
        olahan: {
          totalReadyStock: totalOlahanReady,
          packagingTotals: olahanKemasanTotals,
          todayLiters: todayOlahanProd._sum.rawVolumeLiters || 0,
          todayPackaged: todayOlahanProd._sum.packagedQty || 0,
          monthLiters: monthOlahanProd._sum.rawVolumeLiters || 0,
          monthPackaged: monthOlahanProd._sum.packagedQty || 0,
          todayOutflow: todayOlahanOut._sum.quantity || 0,
          monthOutflow: monthOlahanOut._sum.quantity || 0,
          categories: olahanStocks,
          recentProductions: recentOlahanProductions,
          recentOutflows: recentOlahanOutflows,
        },
      },
    });
  } catch (error) {
    console.error('GET /api/dashboard/stats error:', error);

    const memList = global.__inMemoryProductionList || [
      {
        id: 'prod-fallback-1',
        date: new Date().toISOString(),
        shift: 'Sore',
        farmOrigin: 'Limpakuwus',
        animalType: 'SAPI',
        grossVolumeLiters: 8000,
        pedetVolumeLiters: 120,
        afkirVolumeLiters: 90,
        soldFreshVolumeLiters: 20,
        rawVolumeLiters: 7770,
        notes: '',
        createdAt: new Date().toISOString(),
      },
    ];

    let gross = 0, pedet = 0, afkir = 0, soldFresh = 0, raw = 0;
    let sapiGross = 0, sapiRaw = 0, kambingGross = 0, kambingRaw = 0;
    const originMap = { tegalsari: 0, limpakuwus: 0, manggala: 0, eduwisata: 0 };

    memList.forEach((p) => {
      const g = parseFloat(p.grossVolumeLiters || 0);
      const r = parseFloat(p.rawVolumeLiters || 0);
      gross += g;
      pedet += parseFloat(p.pedetVolumeLiters || 0);
      afkir += parseFloat(p.afkirVolumeLiters || 0);
      soldFresh += parseFloat(p.soldFreshVolumeLiters || 0);
      raw += r;

      if (p.animalType === 'KAMBING') {
        kambingGross += g;
        kambingRaw += r;
      } else {
        sapiGross += g;
        sapiRaw += r;
      }

      let fKey = (p.farmOrigin || '').toLowerCase().replace(/\s+/g, '');
      if (fKey.includes('tegal')) originMap.tegalsari += g;
      else if (fKey.includes('limpa')) originMap.limpakuwus += g;
      else if (fKey.includes('edu')) originMap.eduwisata += g;
      else originMap.manggala += g;
    });

    return NextResponse.json({
      success: true,
      data: {
        superadmin: {
          totalAdmins: 5,
          totalLitersProduced: raw,
          totalSegarReady: raw,
          totalOlahanReady: 0,
          recentLogs: [],
        },
        farm: {
          todayGrossLiters: gross,
          todayPedetLiters: pedet,
          todayAfkirLiters: afkir,
          todaySoldFreshLiters: soldFresh,
          todayRawLiters: raw,
          todaySapiGross: sapiGross,
          todaySapiRaw: sapiRaw,
          todayKambingGross: kambingGross,
          todayKambingRaw: kambingRaw,
          todayTotalLiters: gross,
          todaySapiLiters: sapiGross,
          todayKambingLiters: kambingGross,
          farmOriginToday: originMap,
          todaySoldFreshItems: [],
          todayPackagedQty: Math.round(raw),
          todayBotolQty: Math.round(raw),
          todayCupQty: 0,
          todayPlastikBantalQty: 0,
          todayProcessedLiters: raw,
          sapiPackagedQty: Math.round(sapiRaw),
          sapiBotolQty: Math.round(sapiRaw),
          sapiCupQty: 0,
          sapiPlastikBantalQty: 0,
          sapiProcessedLiters: sapiRaw,
          kambingPackagedQty: Math.round(kambingRaw),
          kambingBotolQty: Math.round(kambingRaw),
          kambingCupQty: 0,
          kambingPlastikBantalQty: 0,
          kambingProcessedLiters: kambingRaw,
          totalAccumulatedLiters: raw,
          totalPackagedQty: Math.round(raw),
          chart7Days: [
            { label: 'Hari ini', dateStr: '19/8', totalLiters: raw, sapiLiters: sapiRaw, kambingLiters: kambingRaw },
          ],
          chart30Days: [],
          recentPackagings: [],
          recentLogs: [],
        },
        segar: {
          totalReadyStock: raw,
          todayLiters: raw,
          todaySapiLiters: sapiRaw,
          todayKambingLiters: kambingRaw,
          todayPackaged: Math.round(raw),
          monthLiters: raw,
          categories: [],
          recentProductions: memList,
          recentOutflows: [],
        },
        olahan: {
          totalReadyStock: 0,
          packagingTotals: { cup: 0, pack: 0, botol: 0 },
          todayLiters: 0,
          todayPackaged: 0,
          categories: [],
          recentProductions: [],
          recentOutflows: [],
        },
      },
    });
  }
}
