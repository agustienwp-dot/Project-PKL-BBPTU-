import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
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

    // Today & Month Stats for SEGAR (Susu Sapi)
    const todaySegarProd = await prisma.milkProduction.aggregate({
      where: { productType: 'SEGAR', date: { gte: startOfToday, lte: endOfToday } },
      _sum: { grossVolumeLiters: true, pedetVolumeLiters: true, afkirVolumeLiters: true, rawVolumeLiters: true, packagedQty: true },
    });

    const monthSegarProd = await prisma.milkProduction.aggregate({
      where: { productType: 'SEGAR', date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { grossVolumeLiters: true, pedetVolumeLiters: true, afkirVolumeLiters: true, rawVolumeLiters: true, packagedQty: true },
    });

    const totalLitersAgg = await prisma.milkProduction.aggregate({ _sum: { rawVolumeLiters: true, grossVolumeLiters: true } });

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

    // Sapi & Kambing Specific Aggregates
    const todaySapiProd = await prisma.milkProduction.aggregate({
      where: { animalType: 'SAPI', date: { gte: startOfToday, lte: endOfToday } },
      _sum: { grossVolumeLiters: true, pedetVolumeLiters: true, afkirVolumeLiters: true, rawVolumeLiters: true, kirimKePI: true },
    });

    const monthSapiProd = await prisma.milkProduction.aggregate({
      where: { animalType: 'SAPI', date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { grossVolumeLiters: true, pedetVolumeLiters: true, afkirVolumeLiters: true, rawVolumeLiters: true, kirimKePI: true },
    });

    const totalSapiAgg = await prisma.milkProduction.aggregate({
      where: { animalType: 'SAPI' },
      _sum: { grossVolumeLiters: true, rawVolumeLiters: true },
    });

    const todayKambingProd = await prisma.milkProduction.aggregate({
      where: { animalType: 'KAMBING', date: { gte: startOfToday, lte: endOfToday } },
      _sum: { grossVolumeLiters: true, pedetVolumeLiters: true, afkirVolumeLiters: true, rawVolumeLiters: true, kirimKePI: true },
    });

    const monthKambingProd = await prisma.milkProduction.aggregate({
      where: { animalType: 'KAMBING', date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { grossVolumeLiters: true, pedetVolumeLiters: true, afkirVolumeLiters: true, rawVolumeLiters: true, kirimKePI: true },
    });

    const totalKambingAgg = await prisma.milkProduction.aggregate({
      where: { animalType: 'KAMBING' },
      _sum: { grossVolumeLiters: true, rawVolumeLiters: true },
    });

    // Total Diserahterimakan (from BAST today/overall or kirimKePI)
    const todayBastAgg = await prisma.bastDocument.aggregate({
      where: { tanggal: { gte: startOfToday, lte: endOfToday } },
      _sum: { volumeLiters: true },
    });

    const totalBastAgg = await prisma.bastDocument.aggregate({
      _sum: { volumeLiters: true },
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
    const recentLogs = await prisma.systemLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    const recentBasts = await prisma.bastDocument.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
    });

    // Build timeline activities list
    const combinedActivities = [];

    recentBasts.forEach((bast) => {
      const timeStr = new Date(bast.confirmedAt || bast.createdAt).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta',
      }) + ' WIB';

      const isConfirmed = bast.status === 'DITERIMA' || bast.status === 'SELESAI';
      const actorName = bast.penerimaNama || 'Seksi Pemasaran';
      const senderName = bast.pengirimNama || 'Admin Farm Produksi';

      combinedActivities.push({
        id: bast.id,
        time: timeStr,
        createdAt: bast.createdAt,
        type: 'BAST',
        title: `${actorName} (${senderName})`,
        text: isConfirmed
          ? `${actorName} (${senderName}) mengkonfirmasi penerimaan Berita Acara ${bast.nomorBast} sejumlah ${Math.round(bast.volumeLiters).toLocaleString('id-ID')} Liter.`
          : `${senderName} membuat draf Berita Acara ${bast.nomorBast} sejumlah ${Math.round(bast.volumeLiters).toLocaleString('id-ID')} Liter untuk ${bast.instansiPenerima || 'Pemasaran'}.`,
      });
    });

    recentLogs.forEach((log) => {
      const timeStr = new Date(log.createdAt).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta',
      }) + ' WIB';

      combinedActivities.push({
        id: log.id,
        time: timeStr,
        createdAt: log.createdAt,
        type: 'LOG',
        title: log.action,
        text: log.details || `${log.userEmail}: ${log.action}`,
      });
    });

    // Sort by createdAt descending
    combinedActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Today Packaging Aggregates for Admin Farm (Susu Sapi)
    const todayPackagingAgg = await prisma.milkPackaging.aggregate({
      where: { date: { gte: startOfToday, lte: endOfToday } },
      _sum: { botolQty: true, cupQty: true, plastikBantalQty: true, totalPackagedQty: true, processedLiters: true, processedAmount: true },
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
          _sum: { rawVolumeLiters: true, grossVolumeLiters: true },
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
          totalLiters: dayAgg._sum.rawVolumeLiters || dayAgg._sum.grossVolumeLiters || 0,
          grossLiters: dayAgg._sum.grossVolumeLiters || 0,
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
          _sum: { rawVolumeLiters: true, grossVolumeLiters: true },
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
          totalLiters: dayAgg._sum.rawVolumeLiters || dayAgg._sum.grossVolumeLiters || 0,
          grossLiters: dayAgg._sum.grossVolumeLiters || 0,
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

    const todayGross = todaySegarProd._sum.grossVolumeLiters || todaySegarProd._sum.rawVolumeLiters || 0;
    const todayPedet = todaySegarProd._sum.pedetVolumeLiters || 0;
    const todayAfkir = todaySegarProd._sum.afkirVolumeLiters || 0;
    const todayNet = todaySegarProd._sum.rawVolumeLiters || 0;

    const todaySapiLiters = todaySapiProd._sum.rawVolumeLiters || todaySapiProd._sum.grossVolumeLiters || 0;
    const todayKambingLiters = todayKambingProd._sum.rawVolumeLiters || todayKambingProd._sum.grossVolumeLiters || 0;
    const todayDiserahterimakan = todayBastAgg._sum.volumeLiters || (todaySapiProd._sum.kirimKePI || 0) + (todayKambingProd._sum.kirimKePI || 0) || Math.max(0, todayNet - 350);

    const totalGrossAll = totalLitersAgg._sum.grossVolumeLiters || totalLitersAgg._sum.rawVolumeLiters || 0;
    const totalSapiAll = totalSapiAgg._sum.grossVolumeLiters || totalSapiAgg._sum.rawVolumeLiters || 0;
    const totalKambingAll = totalKambingAgg._sum.grossVolumeLiters || totalKambingAgg._sum.rawVolumeLiters || 0;
    const totalDiserahterimakanAll = totalBastAgg._sum.volumeLiters || (totalLitersAgg._sum.rawVolumeLiters || 0);

    return NextResponse.json({
      success: true,
      data: {
        superadmin: {
          totalAdmins,
          totalLitersProduced: totalGrossAll,
          totalSegarReady,
          totalOlahanReady,
          recentLogs,
        },
        farm: {
          todayGrossLiters: todayGross,
          todayPedetLiters: todayPedet,
          todayAfkirLiters: todayAfkir,
          todayTotalLiters: todayNet || todayGross,
          todaySapiLiters: todaySapiLiters,
          todayKambingLiters: todayKambingLiters,
          todayDiserahkanLiters: todayDiserahterimakan,

          totalGrossLiters: totalGrossAll,
          totalSapiLiters: totalSapiAll,
          totalKambingLiters: totalKambingAll,
          totalDiserahkanLiters: totalDiserahterimakanAll,

          // Packaging
          todayPackagedQty: todayPackagingAgg._sum.totalPackagedQty || 0,
          todayBotolQty: todayPackagingAgg._sum.botolQty || 0,
          todayCupQty: todayPackagingAgg._sum.cupQty || 0,
          todayPlastikBantalQty: todayPackagingAgg._sum.plastikBantalQty || 0,
          todayProcessedLiters: todayPackagingAgg._sum.processedLiters || todayPackagingAgg._sum.processedAmount || 0,

          totalAccumulatedLiters: totalGrossAll,
          totalPackagedQty: totalPackagingAgg._sum.totalPackagedQty || 0,
          chart7Days,
          chart30Days,
          recentPackagings,
          recentLogs,
          recentActivities: combinedActivities,
        },
        segar: {
          totalReadyStock: totalSegarReady,
          todayLiters: todayNet || todayGross,
          todaySapiLiters: todaySapiLiters,
          todayKambingLiters: todayKambingLiters,
          todayPackaged: todaySegarProd._sum.packagedQty || 0,
          monthLiters: monthSegarProd._sum.rawVolumeLiters || 0,
          monthSapiLiters: monthSapiProd._sum.rawVolumeLiters || 0,
          monthKambingLiters: monthKambingProd._sum.rawVolumeLiters || 0,
          monthPackaged: monthSegarProd._sum.packagedQty || 0,
          totalSapiLiters: totalSapiAll,
          totalKambingLiters: totalKambingAll,
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
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
