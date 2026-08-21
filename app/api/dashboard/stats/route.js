import { NextResponse } from 'next/server';
import prisma, { isDbOffline } from '@/lib/prisma';
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
    const segarCategories = await prisma.milkCategory.findMany({ where: { product_type: 'SEGAR' }, orderBy: { name: 'asc' } });
    const olahanCategories = await prisma.milkCategory.findMany({ where: { product_type: 'OLAHAN' }, orderBy: { name: 'asc' } });

    // Function to calculate stock breakdown for categories
    const getStockForCategories = async (catList) => {
      return Promise.all(
        catList.map(async (cat) => {
          const prodSum = await prisma.milkProduction.aggregate({
            where: { category_id: cat.id },
            _sum: { packaged_qty: true, raw_volume_liters: true },
          });

          const outSum = await prisma.milkOutflow.aggregate({
            where: { category_id: cat.id },
            _sum: { quantity: true },
          });

          const packaged = prodSum._sum.packaged_qty || 0;
          const outflow = outSum._sum.quantity || 0;
          const ready = Math.max(0, packaged - outflow);

          // Get packaging breakdown
          const prodPkg = await prisma.milkProduction.groupBy({
            by: ['packaging_type'],
            where: { category_id: cat.id },
            _sum: { packaged_qty: true },
          });

          const outPkg = await prisma.milkOutflow.groupBy({
            by: ['packaging_type'],
            where: { category_id: cat.id },
            _sum: { quantity: true },
          });

          const pkgMap = {};
          prodPkg.forEach((p) => {
            const pkg = p.packaging_type || cat.default_packaging || cat.defaultPackaging || 'botol';
            if (!pkgMap[pkg]) pkgMap[pkg] = { packaged: 0, outflow: 0, ready: 0 };
            pkgMap[pkg].packaged += p._sum.packaged_qty || 0;
          });

          outPkg.forEach((o) => {
            const pkg = o.packaging_type || cat.default_packaging || cat.defaultPackaging || 'botol';
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
            productType: cat.product_type || cat.productType,
            defaultPackaging: cat.default_packaging || cat.defaultPackaging,
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
      where: { product_type: 'SEGAR', date: { gte: startOfToday, lte: endOfToday } },
      _sum: { raw_volume_liters: true, packaged_qty: true },
    });
    const todaySapiProd = await prisma.milkProduction.aggregate({
      where: { product_type: 'SEGAR', animal_type: 'SAPI', date: { gte: startOfToday, lte: endOfToday } },
      _sum: { raw_volume_liters: true, packaged_qty: true },
    });
    const todayKambingProd = await prisma.milkProduction.aggregate({
      where: { product_type: 'SEGAR', animal_type: 'KAMBING', date: { gte: startOfToday, lte: endOfToday } },
      _sum: { raw_volume_liters: true, packaged_qty: true },
    });

    const monthSegarProd = await prisma.milkProduction.aggregate({
      where: { product_type: 'SEGAR', date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { raw_volume_liters: true, packaged_qty: true },
    });
    const monthSapiProd = await prisma.milkProduction.aggregate({
      where: { product_type: 'SEGAR', animal_type: 'SAPI', date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { raw_volume_liters: true, packaged_qty: true },
    });
    const monthKambingProd = await prisma.milkProduction.aggregate({
      where: { product_type: 'SEGAR', animal_type: 'KAMBING', date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { raw_volume_liters: true, packaged_qty: true },
    });

    const totalSapiAgg = await prisma.milkProduction.aggregate({
      where: { animal_type: 'SAPI' },
      _sum: { raw_volume_liters: true },
    });
    const totalKambingAgg = await prisma.milkProduction.aggregate({
      where: { animal_type: 'KAMBING' },
      _sum: { raw_volume_liters: true },
    });

    const todaySegarOut = await prisma.milkOutflow.aggregate({
      where: { product_type: 'SEGAR', date: { gte: startOfToday, lte: endOfToday } },
      _sum: { quantity: true },
    });
    const monthSegarOut = await prisma.milkOutflow.aggregate({
      where: { product_type: 'SEGAR', date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { quantity: true },
    });

    // Today & Month Stats for OLAHAN
    const todayOlahanProd = await prisma.milkProduction.aggregate({
      where: { product_type: 'OLAHAN', date: { gte: startOfToday, lte: endOfToday } },
      _sum: { raw_volume_liters: true, packaged_qty: true },
    });
    const monthOlahanProd = await prisma.milkProduction.aggregate({
      where: { product_type: 'OLAHAN', date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { raw_volume_liters: true, packaged_qty: true },
    });
    const todayOlahanOut = await prisma.milkOutflow.aggregate({
      where: { product_type: 'OLAHAN', date: { gte: startOfToday, lte: endOfToday } },
      _sum: { quantity: true },
    });
    const monthOlahanOut = await prisma.milkOutflow.aggregate({
      where: { product_type: 'OLAHAN', date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { quantity: true },
    });

    // Recent items
    const recentSegarRaw = await prisma.milkProduction.findMany({
      take: 8,
      where: { product_type: 'SEGAR' },
      orderBy: { date: 'desc' },
      include: { category: true, created_by: { select: { name: true } } },
    });
    const recentSegarProductions = recentSegarRaw.map((item) => ({
      ...item,
      grossVolumeLiters: item.gross_volume_liters ?? item.grossVolumeLiters,
      pedetVolumeLiters: item.pedet_volume_liters ?? item.pedetVolumeLiters,
      afkirVolumeLiters: item.afkir_volume_liters ?? item.afkirVolumeLiters,
      rawVolumeLiters: item.raw_volume_liters ?? item.rawVolumeLiters,
      farmOrigin: item.farm_origin || item.farmOrigin,
      animalType: item.animal_type || item.animalType,
      createdBy: item.created_by || item.createdBy,
    }));

    const recentOlahanRaw = await prisma.milkProduction.findMany({
      take: 8,
      where: { product_type: 'OLAHAN' },
      orderBy: { date: 'desc' },
      include: { category: true, created_by: { select: { name: true } } },
    });
    const recentOlahanProductions = recentOlahanRaw.map((item) => ({
      ...item,
      grossVolumeLiters: item.gross_volume_liters ?? item.grossVolumeLiters,
      pedetVolumeLiters: item.pedet_volume_liters ?? item.pedetVolumeLiters,
      afkirVolumeLiters: item.afkir_volume_liters ?? item.afkirVolumeLiters,
      rawVolumeLiters: item.raw_volume_liters ?? item.rawVolumeLiters,
      farmOrigin: item.farm_origin || item.farmOrigin,
      animalType: item.animal_type || item.animalType,
      createdBy: item.created_by || item.createdBy,
    }));

    const recentSegarOutflowsRaw = await prisma.milkOutflow.findMany({
      take: 5,
      where: { product_type: 'SEGAR' },
      orderBy: { date: 'desc' },
      include: { category: true, created_by: { select: { name: true } } },
    });
    const recentSegarOutflows = recentSegarOutflowsRaw.map((item) => ({
      ...item,
      animalType: item.animal_type || item.animalType,
      createdBy: item.created_by || item.createdBy,
    }));

    const recentOlahanOutflowsRaw = await prisma.milkOutflow.findMany({
      take: 5,
      where: { product_type: 'OLAHAN' },
      orderBy: { date: 'desc' },
      include: { category: true, created_by: { select: { name: true } } },
    });
    const recentOlahanOutflows = recentOlahanOutflowsRaw.map((item) => ({
      ...item,
      animalType: item.animal_type || item.animalType,
      createdBy: item.created_by || item.createdBy,
    }));

    // Superadmin overall summary
    const totalAdmins = await prisma.user.count();
    const totalLitersAgg = await prisma.milkProduction.aggregate({ _sum: { raw_volume_liters: true } });
    const recentLogsRaw = await prisma.systemLog.findMany({
      take: 8,
      orderBy: { created_at: 'desc' },
    });
    const recentLogs = recentLogsRaw.map((l) => ({
      ...l,
      userId: l.user_id || l.userId,
      userEmail: l.user_email || l.userEmail,
      createdAt: l.created_at || l.createdAt,
    }));

    // Admin Farm Production Breakdown: check today first, fallback to latest recorded production date if today has no inputs
    let targetStartDate = startOfToday;
    let targetEndDate = endOfToday;

    const checkTodayAgg = await prisma.milkProduction.aggregate({
      where: { date: { gte: startOfToday, lte: endOfToday } },
      _sum: { gross_volume_liters: true, raw_volume_liters: true },
    });

    if ((checkTodayAgg._sum.gross_volume_liters || 0) === 0 && (checkTodayAgg._sum.raw_volume_liters || 0) === 0) {
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
        gross_volume_liters: true,
        pedet_volume_liters: true,
        afkir_volume_liters: true,
        sold_fresh_volume_liters: true,
        raw_volume_liters: true,
      },
    });

    const todayFarmSapiProdAgg = await prisma.milkProduction.aggregate({
      where: { animal_type: 'SAPI', date: { gte: targetStartDate, lte: targetEndDate } },
      _sum: {
        gross_volume_liters: true,
        pedet_volume_liters: true,
        afkir_volume_liters: true,
        sold_fresh_volume_liters: true,
        raw_volume_liters: true,
      },
    });

    const todayFarmKambingProdAgg = await prisma.milkProduction.aggregate({
      where: { animal_type: 'KAMBING', date: { gte: targetStartDate, lte: targetEndDate } },
      _sum: {
        gross_volume_liters: true,
        pedet_volume_liters: true,
        afkir_volume_liters: true,
        sold_fresh_volume_liters: true,
        raw_volume_liters: true,
      },
    });

    const todayFarmOriginAgg = await prisma.milkProduction.groupBy({
      by: ['farm_origin'],
      where: { date: { gte: targetStartDate, lte: targetEndDate } },
      _sum: { gross_volume_liters: true, raw_volume_liters: true },
    });

    const farmOriginMap = { tegalsari: 0, limpakuwus: 0, manggala: 0, eduwisata: 0 };
    todayFarmOriginAgg.forEach(f => {
      let key = (f.farm_origin || '').toLowerCase().replace(/\s+/g, '').replace(/^farm\s*/i, '').trim();
      if (key.includes('limpa')) key = 'limpakuwus';
      if (key.includes('tegal')) key = 'tegalsari';
      if (key.includes('manggala')) key = 'manggala';
      if (key.includes('edu')) key = 'eduwisata';
      if (farmOriginMap[key] !== undefined) {
        const vol = (f._sum.gross_volume_liters || 0) > 0 ? f._sum.gross_volume_liters : (f._sum.raw_volume_liters || 0);
        farmOriginMap[key] += vol;
      }
    });

    if (global.__inMemoryProductionList && global.__inMemoryProductionList.length > 0) {
      global.__inMemoryProductionList.forEach((m) => {
        let key = (m.farmOrigin || m.farm_origin || 'manggala').toLowerCase().replace(/\s+/g, '').replace(/^farm\s*/i, '').trim();
        if (key.includes('limpa')) key = 'limpakuwus';
        if (key.includes('tegal')) key = 'tegalsari';
        if (key.includes('manggala')) key = 'manggala';
        if (key.includes('edu')) key = 'eduwisata';

        if (farmOriginMap[key] !== undefined) {
          const vol = (m.grossVolumeLiters || m.gross_volume_liters || 0) > 0 ? (m.grossVolumeLiters || m.gross_volume_liters) : (m.rawVolumeLiters || m.raw_volume_liters || 0);
          farmOriginMap[key] += vol;
        }
      });
    }

    // Fetch sold fresh items with buyer breakdown
    const todaySoldFreshItemsRaw = await prisma.milkProduction.findMany({
      where: {
        sold_fresh_volume_liters: { gt: 0 }
      },
      select: {
        id: true,
        date: true,
        shift: true,
        farm_origin: true,
        animal_type: true,
        sold_fresh_volume_liters: true,
        keterangan_penjualan: true,
      },
      orderBy: { date: 'desc' },
      take: 10
    });
    const todaySoldFreshItems = todaySoldFreshItemsRaw.map((item) => ({
      ...item,
      farmOrigin: item.farm_origin || item.farmOrigin,
      animalType: item.animal_type || item.animalType,
      soldFreshVolumeLiters: item.sold_fresh_volume_liters ?? item.soldFreshVolumeLiters,
      keteranganPenjualan: item.keterangan_penjualan || item.keteranganPenjualan,
    }));

    // Today Packaging Aggregates for Admin Farm (Total, Sapi, Kambing)
    const todayPackagingAgg = await prisma.milkPackaging.aggregate({
      where: { date: { gte: startOfToday, lte: endOfToday } },
      _sum: { botol_qty: true, cup_qty: true, plastik_bantal_qty: true, total_packaged_qty: true, processed_liters: true },
    });

    const sapiPackagingAgg = await prisma.milkPackaging.aggregate({
      where: { animal_type: 'SAPI', date: { gte: startOfToday, lte: endOfToday } },
      _sum: { botol_qty: true, cup_qty: true, plastik_bantal_qty: true, total_packaged_qty: true, processed_liters: true },
    });

    const kambingPackagingAgg = await prisma.milkPackaging.aggregate({
      where: { animal_type: 'KAMBING', date: { gte: startOfToday, lte: endOfToday } },
      _sum: { botol_qty: true, cup_qty: true, plastik_bantal_qty: true, total_packaged_qty: true, processed_liters: true },
    });

    const totalPackagingAgg = await prisma.milkPackaging.aggregate({
      _sum: { botol_qty: true, cup_qty: true, plastik_bantal_qty: true, total_packaged_qty: true, processed_liters: true },
    });

    const parseDateToYYYYMMDD = (dateInput) => {
      if (!dateInput) return '';
      if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateInput)) {
        return dateInput.substring(0, 10);
      }
      const d = new Date(dateInput);
      const yyyy = d.getFullYear();
      const mm = (d.getMonth() + 1).toString().padStart(2, '0');
      const dd = d.getDate().toString().padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    // Chart Data Generation (7 Days & Current Month 1-30/31)
    const getDailyChartData = async (daysCount) => {
      const chartData = [];
      const daysName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
        const dEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
        const yyyy = d.getFullYear();
        const mm = (d.getMonth() + 1).toString().padStart(2, '0');
        const dd = d.getDate().toString().padStart(2, '0');
        const dStr = `${yyyy}-${mm}-${dd}`;

        const dayAgg = await prisma.milkProduction.aggregate({
          where: { date: { gte: dStart, lte: dEnd } },
          _sum: { gross_volume_liters: true, raw_volume_liters: true },
        });

        const sapiAgg = await prisma.milkProduction.aggregate({
          where: { animal_type: 'SAPI', date: { gte: dStart, lte: dEnd } },
          _sum: { gross_volume_liters: true, raw_volume_liters: true },
        });

        const kambingAgg = await prisma.milkProduction.aggregate({
          where: { animal_type: 'KAMBING', date: { gte: dStart, lte: dEnd } },
          _sum: { gross_volume_liters: true, raw_volume_liters: true },
        });

        let totVol = (dayAgg._sum.gross_volume_liters || 0) > 0 ? dayAgg._sum.gross_volume_liters : (dayAgg._sum.raw_volume_liters || 0);
        let sapiVol = (sapiAgg._sum.gross_volume_liters || 0) > 0 ? sapiAgg._sum.gross_volume_liters : (sapiAgg._sum.raw_volume_liters || 0);
        let kambingVol = (kambingAgg._sum.gross_volume_liters || 0) > 0 ? kambingAgg._sum.gross_volume_liters : (kambingAgg._sum.raw_volume_liters || 0);

        if (global.__inMemoryProductionList && global.__inMemoryProductionList.length > 0) {
          for (const m of global.__inMemoryProductionList) {
            const mStr = parseDateToYYYYMMDD(m.date);
            if (mStr === dStr) {
              const vol = (m.grossVolumeLiters || m.gross_volume_liters || 0) > 0 ? (m.grossVolumeLiters || m.gross_volume_liters) : (m.rawVolumeLiters || m.raw_volume_liters || 0);
              totVol += vol;
              if ((m.animalType || m.animal_type) === 'KAMBING') {
                kambingVol += vol;
              } else {
                sapiVol += vol;
              }
            }
          }
        }

        const dayLabel = `${daysName[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;

        chartData.push({
          label: dayLabel,
          dayName: daysName[d.getDay()],
          dayNum: d.getDate(),
          monthNum: d.getMonth() + 1,
          dateStr: `${d.getDate()}/${d.getMonth() + 1}`,
          formattedDate: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
          fullDate: dStr,
          totalLiters: totVol,
          sapiLiters: sapiVol,
          kambingLiters: kambingVol,
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
        const yyyy = year;
        const mm = (month + 1).toString().padStart(2, '0');
        const dd = day.toString().padStart(2, '0');
        const dStr = `${yyyy}-${mm}-${dd}`;

        const dayAgg = await prisma.milkProduction.aggregate({
          where: { date: { gte: dStart, lte: dEnd } },
          _sum: { gross_volume_liters: true, raw_volume_liters: true },
        });

        const sapiAgg = await prisma.milkProduction.aggregate({
          where: { animal_type: 'SAPI', date: { gte: dStart, lte: dEnd } },
          _sum: { gross_volume_liters: true, raw_volume_liters: true },
        });

        const kambingAgg = await prisma.milkProduction.aggregate({
          where: { animal_type: 'KAMBING', date: { gte: dStart, lte: dEnd } },
          _sum: { gross_volume_liters: true, raw_volume_liters: true },
        });

        let totVol = (dayAgg._sum.gross_volume_liters || 0) > 0 ? dayAgg._sum.gross_volume_liters : (dayAgg._sum.raw_volume_liters || 0);
        let sapiVol = (sapiAgg._sum.gross_volume_liters || 0) > 0 ? sapiAgg._sum.gross_volume_liters : (sapiAgg._sum.raw_volume_liters || 0);
        let kambingVol = (kambingAgg._sum.gross_volume_liters || 0) > 0 ? kambingAgg._sum.gross_volume_liters : (kambingAgg._sum.raw_volume_liters || 0);

        if (global.__inMemoryProductionList && global.__inMemoryProductionList.length > 0) {
          for (const m of global.__inMemoryProductionList) {
            const mStr = parseDateToYYYYMMDD(m.date);
            if (mStr === dStr) {
              const vol = (m.grossVolumeLiters || m.gross_volume_liters || 0) > 0 ? (m.grossVolumeLiters || m.gross_volume_liters) : (m.rawVolumeLiters || m.raw_volume_liters || 0);
              totVol += vol;
              if ((m.animalType || m.animal_type) === 'KAMBING') {
                kambingVol += vol;
              } else {
                sapiVol += vol;
              }
            }
          }
        }

        const monthName = d.toLocaleDateString('id-ID', { month: 'short' });

        chartData.push({
          label: `${daysName[d.getDay()]} ${day}/${month + 1}`,
          dayName: daysName[d.getDay()],
          dayNum: day,
          monthNum: month + 1,
          dateStr: `${day}/${month + 1}`,
          formattedDate: `${day} ${monthName}`,
          fullDate: dStr,
          totalLiters: totVol,
          sapiLiters: sapiVol,
          kambingLiters: kambingVol,
        });
      }
      return chartData;
    };

    const chart7Days = await getDailyChartData(7);
    const chart30Days = await getMonthlyChartData();

    const recentPackagingsRaw = await prisma.milkPackaging.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: { category: true, created_by: { select: { name: true } } },
    });
    const recentPackagings = recentPackagingsRaw.map((item) => ({
      ...item,
      animalType: item.animal_type || item.animalType,
      createdBy: item.created_by || item.createdBy,
    }));

    // Add in-memory production items into dashboard stats totals
    let memGrossTotal = 0;
    let memSapiGross = 0;
    let memKambingGross = 0;
    let memRawTotal = 0;
    let memSapiRaw = 0;
    let memKambingRaw = 0;

    if (global.__inMemoryProductionList && global.__inMemoryProductionList.length > 0) {
      for (const m of global.__inMemoryProductionList) {
        const gross = m.grossVolumeLiters || m.gross_volume_liters || m.rawVolumeLiters || m.raw_volume_liters || 0;
        const raw = m.rawVolumeLiters || m.raw_volume_liters || 0;
        memGrossTotal += gross;
        memRawTotal += raw;
        if ((m.animalType || m.animal_type) === 'KAMBING') {
          memKambingGross += gross;
          memKambingRaw += raw;
        } else {
          memSapiGross += gross;
          memSapiRaw += raw;
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        superadmin: {
          totalAdmins,
          totalLitersProduced: (totalLitersAgg._sum.raw_volume_liters || 0) + memRawTotal,
          totalSegarReady,
          totalOlahanReady,
          recentLogs,
        },
        farm: {
          todayGrossLiters: (todayFarmProdAgg._sum.gross_volume_liters || todaySegarProd._sum.raw_volume_liters || 0) + memGrossTotal,
          todayPedetLiters: todayFarmProdAgg._sum.pedet_volume_liters || 0,
          todayAfkirLiters: todayFarmProdAgg._sum.afkir_volume_liters || 0,
          todaySoldFreshLiters: todayFarmProdAgg._sum.sold_fresh_volume_liters || 0,
          todayRawLiters: (todayFarmProdAgg._sum.raw_volume_liters || todaySegarProd._sum.raw_volume_liters || 0) + memRawTotal,

          todaySapiGross: (todayFarmSapiProdAgg._sum.gross_volume_liters || todaySapiProd._sum.raw_volume_liters || 0) + memSapiGross,
          todaySapiRaw: (todayFarmSapiProdAgg._sum.raw_volume_liters || todaySapiProd._sum.raw_volume_liters || 0) + memSapiRaw,

          todayKambingGross: (todayFarmKambingProdAgg._sum.gross_volume_liters || todayKambingProd._sum.raw_volume_liters || 0) + memKambingGross,
          todayKambingRaw: (todayFarmKambingProdAgg._sum.raw_volume_liters || todayKambingProd._sum.raw_volume_liters || 0) + memKambingRaw,

          todayTotalLiters: (todayFarmProdAgg._sum.gross_volume_liters || todaySegarProd._sum.raw_volume_liters || 0) + memGrossTotal,
          todaySapiLiters: (todayFarmSapiProdAgg._sum.gross_volume_liters || todaySapiProd._sum.raw_volume_liters || 0) + memSapiGross,
          todayKambingLiters: (todayFarmKambingProdAgg._sum.gross_volume_liters || todayKambingProd._sum.raw_volume_liters || 0) + memKambingGross,

          farmOriginToday: farmOriginMap,
          todaySoldFreshItems,

          // Overall Packaging (Kept for backwards compatibility)
          todayPackagedQty: todayPackagingAgg._sum.total_packaged_qty || 0,
          todayBotolQty: todayPackagingAgg._sum.botol_qty || 0,
          todayCupQty: todayPackagingAgg._sum.cup_qty || 0,
          todayPlastikBantalQty: todayPackagingAgg._sum.plastik_bantal_qty || 0,
          todayProcessedLiters: todayPackagingAgg._sum.processed_liters || 0,

          // Sapi Packaging
          sapiPackagedQty: sapiPackagingAgg._sum.total_packaged_qty || 0,
          sapiBotolQty: sapiPackagingAgg._sum.botol_qty || 0,
          sapiCupQty: sapiPackagingAgg._sum.cup_qty || 0,
          sapiPlastikBantalQty: sapiPackagingAgg._sum.plastik_bantal_qty || 0,
          sapiProcessedLiters: sapiPackagingAgg._sum.processed_liters || 0,

          // Kambing Packaging
          kambingPackagedQty: kambingPackagingAgg._sum.total_packaged_qty || 0,
          kambingBotolQty: kambingPackagingAgg._sum.botol_qty || 0,
          kambingCupQty: kambingPackagingAgg._sum.cup_qty || 0,
          kambingPlastikBantalQty: kambingPackagingAgg._sum.plastik_bantal_qty || 0,
          kambingProcessedLiters: kambingPackagingAgg._sum.processed_liters || 0,

          totalAccumulatedLiters: totalLitersAgg._sum.raw_volume_liters || 0,
          totalPackagedQty: totalPackagingAgg._sum.total_packaged_qty || 0,
          chart7Days,
          chart30Days,
          recentPackagings,
          recentLogs,
        },
        segar: {
          totalReadyStock: totalSegarReady,
          todayLiters: todaySegarProd._sum.raw_volume_liters || 0,
          todaySapiLiters: todaySapiProd._sum.raw_volume_liters || 0,
          todayKambingLiters: todayKambingProd._sum.raw_volume_liters || 0,
          todayPackaged: todaySegarProd._sum.packaged_qty || 0,
          monthLiters: monthSegarProd._sum.raw_volume_liters || 0,
          monthSapiLiters: monthSapiProd._sum.raw_volume_liters || 0,
          monthKambingLiters: monthKambingProd._sum.raw_volume_liters || 0,
          monthPackaged: monthSegarProd._sum.packaged_qty || 0,
          totalSapiLiters: totalSapiAgg._sum.raw_volume_liters || 0,
          totalKambingLiters: totalKambingAgg._sum.raw_volume_liters || 0,
          todayOutflow: todaySegarOut._sum.quantity || 0,
          monthOutflow: monthSegarOut._sum.quantity || 0,
          categories: segarStocks,
          recentProductions: recentSegarProductions,
          recentOutflows: recentSegarOutflows,
        },
        olahan: {
          totalReadyStock: totalOlahanReady,
          packagingTotals: olahanKemasanTotals,
          todayLiters: todayOlahanProd._sum.raw_volume_liters || 0,
          todayPackaged: todayOlahanProd._sum.packaged_qty || 0,
          monthLiters: monthOlahanProd._sum.raw_volume_liters || 0,
          monthPackaged: monthOlahanProd._sum.packaged_qty || 0,
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

    const memList = global.__inMemoryProductionList || [];

    let gross = 0, pedet = 0, afkir = 0, soldFresh = 0, raw = 0;
    let sapiGross = 0, sapiRaw = 0, kambingGross = 0, kambingRaw = 0;
    const originMap = { tegalsari: 0, limpakuwus: 0, manggala: 0, eduwisata: 0 };

    memList.forEach((p) => {
      const g = parseFloat(p.grossVolumeLiters || p.gross_volume_liters || 0);
      const r = parseFloat(p.rawVolumeLiters || p.raw_volume_liters || 0);
      gross += g;
      pedet += parseFloat(p.pedetVolumeLiters || p.pedet_volume_liters || 0);
      afkir += parseFloat(p.afkirVolumeLiters || p.afkir_volume_liters || 0);
      soldFresh += parseFloat(p.soldFreshVolumeLiters || p.sold_fresh_volume_liters || 0);
      raw += r;

      if ((p.animalType || p.animal_type) === 'KAMBING') {
        kambingGross += g;
        kambingRaw += r;
      } else {
        sapiGross += g;
        sapiRaw += r;
      }

      let fKey = (p.farmOrigin || p.farm_origin || '').toLowerCase().replace(/\s+/g, '');
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
