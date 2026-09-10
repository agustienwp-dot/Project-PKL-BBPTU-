import { NextResponse } from 'next/server';
import prisma, { isDbOffline } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function parseDateToYYYYMMDD(val) {
  if (!val) return '';
  if (typeof val === 'string') {
    if (val.includes('T')) return val.split('T')[0];
    if (val.match(/^\d{4}-\d{2}-\d{2}$/)) return val;
  }
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export async function GET(request) {
  const now = new Date();
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    if (isDbOffline()) {
      throw new Error('DB_OFFLINE_CACHE');
    }
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Get categories for SEGAR vs OLAHAN
    const segarCategories = await prisma.milkCategory.findMany({ where: { productType: 'SEGAR' }, orderBy: { name: 'asc' } }).catch(() => []);
    const olahanCategories = await prisma.milkCategory.findMany({ where: { productType: 'OLAHAN' }, orderBy: { name: 'asc' } }).catch(() => []);

    // Function to calculate stock breakdown for categories
    const getStockForCategories = async (catList) => {
      return Promise.all(
        catList.map(async (cat) => {
          const prodSum = await prisma.milkProduction.aggregate({
            where: { categoryId: cat.id },
            _sum: { packagedQty: true, rawVolumeLiters: true },
          }).catch(() => ({ _sum: { packagedQty: 0, rawVolumeLiters: 0 } }));

          const outSum = await prisma.milkOutflow.aggregate({
            where: { categoryId: cat.id },
            _sum: { quantity: true },
          }).catch(() => ({ _sum: { quantity: 0 } }));

          const packaged = prodSum._sum?.packagedQty || 0;
          const outflow = outSum._sum?.quantity || 0;
          const ready = Math.max(0, packaged - outflow);

          // Get packaging breakdown
          const prodPkg = await prisma.milkProduction.groupBy({
            by: ['packagingType'],
            where: { categoryId: cat.id },
            _sum: { packagedQty: true },
          }).catch(() => []);

          const outPkg = await prisma.milkOutflow.groupBy({
            by: ['packagingType'],
            where: { categoryId: cat.id },
            _sum: { quantity: true },
          }).catch(() => []);

          const pkgMap = {};
          prodPkg.forEach((p) => {
            const pkg = p.packagingType || cat.defaultPackaging || 'botol';
            if (!pkgMap[pkg]) pkgMap[pkg] = { packaged: 0, outflow: 0, ready: 0 };
            pkgMap[pkg].packaged += p._sum?.packagedQty || 0;
          });

          outPkg.forEach((o) => {
            const pkg = o.packagingType || cat.defaultPackaging || 'botol';
            if (!pkgMap[pkg]) pkgMap[pkg] = { packaged: 0, outflow: 0, ready: 0 };
            pkgMap[pkg].outflow += o._sum?.quantity || 0;
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
    const totalLitersAgg = await prisma.milkProduction.aggregate({ _sum: { rawVolumeLiters: true, grossVolumeLiters: true } }).catch(() => ({ _sum: { rawVolumeLiters: 0, grossVolumeLiters: 0 } }));
    // Today & Month Stats for SEGAR (All, Sapi, Kambing)
    const emptySum = { rawVolumeLiters: 0, packagedQty: 0 };
    const todaySegarProd = await prisma.milkProduction.aggregate({
      where: { productType: 'SEGAR', date: { gte: startOfToday, lte: endOfToday } },
      _sum: { rawVolumeLiters: true, packagedQty: true },
    }).catch(() => ({ _sum: emptySum }));

    const monthSegarProd = await prisma.milkProduction.aggregate({
      where: { productType: 'SEGAR', date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { rawVolumeLiters: true, packagedQty: true },
    }).catch(() => ({ _sum: emptySum }));

    const todaySegarOut = await prisma.milkOutflow.aggregate({
      where: { productType: 'SEGAR', createdAt: { gte: startOfToday, lte: endOfToday } },
      _sum: { quantity: true },
    }).catch(() => ({ _sum: { quantity: 0 } }));
    const monthSegarOut = await prisma.milkOutflow.aggregate({
      where: { productType: 'SEGAR', createdAt: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { quantity: true },
    }).catch(() => ({ _sum: { quantity: 0 } }));

    // Today & Month Stats for OLAHAN
    const todayOlahanProd = await prisma.milkProduction.aggregate({
      where: { productType: 'OLAHAN', date: { gte: startOfToday, lte: endOfToday } },
      _sum: { rawVolumeLiters: true, packagedQty: true },
    }).catch(() => ({ _sum: emptySum }));
    const monthOlahanProd = await prisma.milkProduction.aggregate({
      where: { productType: 'OLAHAN', date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { rawVolumeLiters: true, packagedQty: true },
    }).catch(() => ({ _sum: emptySum }));
    const todayOlahanOut = await prisma.milkOutflow.aggregate({
      where: { productType: 'OLAHAN', createdAt: { gte: startOfToday, lte: endOfToday } },
      _sum: { quantity: true },
    }).catch(() => ({ _sum: { quantity: 0 } }));
    const monthOlahanOut = await prisma.milkOutflow.aggregate({
      where: { productType: 'OLAHAN', createdAt: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { quantity: true },
    }).catch(() => ({ _sum: { quantity: 0 } }));

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
    let todayBastAgg = { _sum: { volumeLiters: 0 } };
    let totalBastAgg = { _sum: { volumeLiters: 0 } };
    try {
      const bastClient = prisma.bastDocument || prisma.beritaAcara;
      if (bastClient) {
        const baToday = await bastClient.aggregate({
          where: { date: { gte: startOfToday, lte: endOfToday } },
          _sum: { diserahterimakan: true, totalProduksi: true },
        }).catch(() => ({ _sum: { diserahterimakan: 0, totalProduksi: 0 } }));
        todayBastAgg = { _sum: { volumeLiters: baToday._sum?.diserahterimakan || baToday._sum?.totalProduksi || 0 } };

        const baTotal = await bastClient.aggregate({
          _sum: { diserahterimakan: true, totalProduksi: true },
        }).catch(() => ({ _sum: { diserahterimakan: 0, totalProduksi: 0 } }));
        totalBastAgg = { _sum: { volumeLiters: baTotal._sum?.diserahterimakan || baTotal._sum?.totalProduksi || 0 } };
      }
    } catch (e) {
      console.error('Error fetching bast aggregations:', e);
    }

    // Recent items
    const recentSegarRaw = await prisma.milkProduction.findMany({
      take: 8,
      where: { productType: 'SEGAR' },
      orderBy: { date: 'desc' },
      include: { category: true, createdBy: { select: { name: true } } },
    });
    const recentSegarProductions = recentSegarRaw.map((item) => ({
      ...item,
      grossVolumeLiters: item.grossVolumeLiters || item.rawVolumeLiters || 0,
      pedetVolumeLiters: item.pedetVolumeLiters || 0,
      afkirVolumeLiters: item.afkirVolumeLiters || 0,
      rawVolumeLiters: item.rawVolumeLiters || 0,
      farmOrigin: item.farmOrigin || 'Manggala',
      animalType: item.animalType || 'SAPI',
      createdBy: item.createdBy,
    }));

    const recentOlahanRaw = await prisma.milkProduction.findMany({
      take: 8,
      where: { productType: 'OLAHAN' },
      orderBy: { date: 'desc' },
      include: { category: true, createdBy: { select: { name: true } } },
    });
    const recentOlahanProductions = recentOlahanRaw.map((item) => ({
      ...item,
      grossVolumeLiters: item.grossVolumeLiters || item.rawVolumeLiters || 0,
      pedetVolumeLiters: item.pedetVolumeLiters || 0,
      afkirVolumeLiters: item.afkirVolumeLiters || 0,
      rawVolumeLiters: item.rawVolumeLiters || 0,
      farmOrigin: item.farmOrigin || 'Manggala',
      animalType: item.animalType || 'SAPI',
      createdBy: item.createdBy,
    }));

    const recentSegarOutflowsRaw = await prisma.milkOutflow.findMany({
      take: 5,
      where: { productType: 'SEGAR' },
      orderBy: { createdAt: 'desc' },
      include: { category: true, createdBy: { select: { name: true } } },
    }).catch(() => []);
    const recentSegarOutflows = recentSegarOutflowsRaw.map((item) => ({
      ...item,
      animalType: item.animalType || 'SAPI',
      createdBy: item.createdBy,
    }));

    const recentOlahanOutflowsRaw = await prisma.milkOutflow.findMany({
      take: 5,
      where: { productType: 'OLAHAN' },
      orderBy: { createdAt: 'desc' },
      include: { category: true, createdBy: { select: { name: true } } },
    }).catch(() => []);
    const recentOlahanOutflows = recentOlahanOutflowsRaw.map((item) => ({
      ...item,
      animalType: item.animalType || 'SAPI',
      createdBy: item.createdBy,
    }));

    // Superadmin overall summary
    const totalAdmins = await prisma.user.count().catch(() => 0);
    const recentLogsRaw = await prisma.systemLog.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
    }).catch(() => []);
    const recentLogs = recentLogsRaw.map((l) => ({
      ...l,
      userId: l.userId,
      userEmail: l.userEmail,
      createdAt: l.createdAt,
    }));

    // Admin Farm Production Breakdown: check today first, fallback to latest recorded production date if today has no inputs
    let targetStartDate = startOfToday;
    let targetEndDate = endOfToday;

    const checkTodayAgg = await prisma.milkProduction.aggregate({
      where: { date: { gte: startOfToday, lte: endOfToday } },
      _sum: { grossVolumeLiters: true, rawVolumeLiters: true },
    }).catch(() => ({ _sum: { grossVolumeLiters: 0, rawVolumeLiters: 0 } }));

    if ((checkTodayAgg._sum?.grossVolumeLiters || 0) === 0 && (checkTodayAgg._sum?.rawVolumeLiters || 0) === 0) {
      const latestProd = await prisma.milkProduction.findFirst({
        orderBy: { date: 'desc' },
      }).catch(() => null);
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
    }).catch(() => ({ _sum: { grossVolumeLiters: 0, pedetVolumeLiters: 0, afkirVolumeLiters: 0, soldFreshVolumeLiters: 0, rawVolumeLiters: 0 } }));

    const todayFarmSapiProdAgg = await prisma.milkProduction.aggregate({
      where: { animalType: 'SAPI', date: { gte: targetStartDate, lte: targetEndDate } },
      _sum: {
        grossVolumeLiters: true,
        pedetVolumeLiters: true,
        afkirVolumeLiters: true,
        soldFreshVolumeLiters: true,
        rawVolumeLiters: true,
      },
    }).catch(() => ({ _sum: { grossVolumeLiters: 0, pedetVolumeLiters: 0, afkirVolumeLiters: 0, soldFreshVolumeLiters: 0, rawVolumeLiters: 0 } }));

    const todayFarmKambingProdAgg = await prisma.milkProduction.aggregate({
      where: { animalType: 'KAMBING', date: { gte: targetStartDate, lte: targetEndDate } },
      _sum: {
        grossVolumeLiters: true,
        pedetVolumeLiters: true,
        afkirVolumeLiters: true,
        soldFreshVolumeLiters: true,
        rawVolumeLiters: true,
      },
    }).catch(() => ({ _sum: { grossVolumeLiters: 0, pedetVolumeLiters: 0, afkirVolumeLiters: 0, soldFreshVolumeLiters: 0, rawVolumeLiters: 0 } }));

    const todayFarmOriginAgg = await prisma.milkProduction.groupBy({
      by: ['farmOrigin'],
      where: { date: { gte: targetStartDate, lte: targetEndDate } },
      _sum: { grossVolumeLiters: true, rawVolumeLiters: true },
    }).catch(() => []);

    const farmOriginMap = { tegalsari: 0, limpakuwus: 0, manggala: 0, eduwisata: 0 };
    todayFarmOriginAgg.forEach(f => {
      let key = (f.farmOrigin || '').toLowerCase().replace(/\s+/g, '').replace(/^farm\s*/i, '').trim();
      if (key.includes('limpa')) key = 'limpakuwus';
      if (key.includes('tegal')) key = 'tegalsari';
      if (key.includes('manggala')) key = 'manggala';
      if (key.includes('edu')) key = 'eduwisata';
      if (farmOriginMap[key] !== undefined) {
        const vol = (f._sum?.grossVolumeLiters || 0) > 0 ? f._sum.grossVolumeLiters : (f._sum?.rawVolumeLiters || 0);
        farmOriginMap[key] += vol;
      }
    });

    const bastClientForRecent = prisma.beritaAcara || prisma.bastDocument;
    const recentBasts = (bastClientForRecent && typeof bastClientForRecent.findMany === 'function')
      ? await bastClientForRecent.findMany({
          take: 6,
          orderBy: { createdAt: 'desc' },
        }).catch(() => [])
      : [];

    // Build timeline activities list
    const combinedActivities = [];

    recentBasts.forEach((bast) => {
      const timeStr = new Date(bast.confirmedAt || bast.createdAt).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta',
      }) + ' WIB';

      const isConfirmed = bast.status === 'DITERIMA' || bast.status === 'SELESAI';
      const actorName = bast.penerimaName || bast.penerimaNama || 'Seksi Pemasaran';
      const senderName = bast.penyerahName || bast.pengirimNama || 'Admin Farm Produksi';
      const nomorBaStr = bast.nomorBA || bast.nomor_ba || bast.nomorBast || '';
      const vol = bast.diserahterimakan || bast.totalProduksi || bast.volumeLiters || 0;

      combinedActivities.push({
        id: bast.id,
        time: timeStr,
        createdAt: bast.createdAt,
        type: 'BAST',
        title: `${actorName} (${senderName})`,
        text: isConfirmed
          ? `${actorName} (${senderName}) mengkonfirmasi penerimaan Berita Acara ${nomorBaStr} sejumlah ${Math.round(vol).toLocaleString('id-ID')} Liter.`
          : `${senderName} membuat draf Berita Acara ${nomorBaStr} sejumlah ${Math.round(vol).toLocaleString('id-ID')} Liter untuk ${bast.instansiPenerima || 'Pemasaran'}.`,
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

    if (global.__inMemoryProductionList && global.__inMemoryProductionList.length > 0) {
      global.__inMemoryProductionList.forEach((m) => {
        let key = (m.farmOrigin || 'manggala').toLowerCase().replace(/\s+/g, '').replace(/^farm\s*/i, '').trim();
        if (key.includes('limpa')) key = 'limpakuwus';
        if (key.includes('tegal')) key = 'tegalsari';
        if (key.includes('manggala')) key = 'manggala';
        if (key.includes('edu')) key = 'eduwisata';

        if (farmOriginMap[key] !== undefined) {
          const vol = (m.grossVolumeLiters || 0) > 0 ? m.grossVolumeLiters : (m.rawVolumeLiters || 0);
          farmOriginMap[key] += vol;
        }
      });
    }

    // Fetch sold fresh items with buyer breakdown
    const todaySoldFreshItemsRaw = await prisma.milkProduction.findMany({
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
    }).catch(() => []);
    const todaySoldFreshItems = todaySoldFreshItemsRaw.map((item) => ({
      ...item,
      farmOrigin: item.farmOrigin || 'Manggala',
      animalType: item.animalType || 'SAPI',
      soldFreshVolumeLiters: item.soldFreshVolumeLiters || 0,
      keteranganPenjualan: item.keteranganPenjualan || '',
    }));

    // Today Packaging Aggregates for Admin Farm
    const emptyPkgSum = { botolQty: 0, cupQty: 0, plastikBantalQty: 0, totalPackagedQty: 0, processedLiters: 0, processedAmount: 0 };
    const todayPackagingAgg = await prisma.milkPackaging.aggregate({
      where: { date: { gte: startOfToday, lte: endOfToday } },
      _sum: { botolQty: true, cupQty: true, plastikBantalQty: true, totalPackagedQty: true, processedLiters: true, processedAmount: true },
    }).catch(() => ({ _sum: emptyPkgSum }));

    const sapiPackagingAgg = await prisma.milkPackaging.aggregate({
      where: { animalType: 'SAPI', date: { gte: startOfToday, lte: endOfToday } },
      _sum: { botolQty: true, cupQty: true, plastikBantalQty: true, totalPackagedQty: true, processedLiters: true },
    }).catch(() => ({ _sum: emptyPkgSum }));

    const kambingPackagingAgg = await prisma.milkPackaging.aggregate({
      where: { animalType: 'KAMBING', date: { gte: startOfToday, lte: endOfToday } },
      _sum: { botolQty: true, cupQty: true, plastikBantalQty: true, totalPackagedQty: true, processedLiters: true },
    }).catch(() => ({ _sum: emptyPkgSum }));

    const totalPackagingAgg = await prisma.milkPackaging.aggregate({
      _sum: { botolQty: true, cupQty: true, plastikBantalQty: true, totalPackagedQty: true, processedLiters: true },
    }).catch(() => ({ _sum: emptyPkgSum }));

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

    // Chart Data Generation (7 Days & Current Month)
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
          _sum: { rawVolumeLiters: true, grossVolumeLiters: true },
          _sum: { grossVolumeLiters: true, rawVolumeLiters: true },
        }).catch(() => ({ _sum: { grossVolumeLiters: 0, rawVolumeLiters: 0 } }));

        const sapiAgg = await prisma.milkProduction.aggregate({
          where: { animalType: 'SAPI', date: { gte: dStart, lte: dEnd } },
          _sum: { grossVolumeLiters: true, rawVolumeLiters: true },
        }).catch(() => ({ _sum: { grossVolumeLiters: 0, rawVolumeLiters: 0 } }));

        const kambingAgg = await prisma.milkProduction.aggregate({
          where: { animalType: 'KAMBING', date: { gte: dStart, lte: dEnd } },
          _sum: { grossVolumeLiters: true, rawVolumeLiters: true },
        }).catch(() => ({ _sum: { grossVolumeLiters: 0, rawVolumeLiters: 0 } }));

        let totVol = (dayAgg._sum?.grossVolumeLiters || 0) > 0 ? dayAgg._sum.grossVolumeLiters : (dayAgg._sum?.rawVolumeLiters || 0);
        let sapiVol = (sapiAgg._sum?.grossVolumeLiters || 0) > 0 ? sapiAgg._sum.grossVolumeLiters : (sapiAgg._sum?.rawVolumeLiters || 0);
        let kambingVol = (kambingAgg._sum?.grossVolumeLiters || 0) > 0 ? kambingAgg._sum.grossVolumeLiters : (kambingAgg._sum?.rawVolumeLiters || 0);

        if (global.__inMemoryProductionList && global.__inMemoryProductionList.length > 0) {
          for (const m of global.__inMemoryProductionList) {
            const mStr = parseDateToYYYYMMDD(m.date);
            if (mStr === dStr) {
              const vol = (m.grossVolumeLiters || 0) > 0 ? m.grossVolumeLiters : (m.rawVolumeLiters || 0);
              totVol += vol;
              if (m.animalType === 'KAMBING') {
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
      const currentDay = now.getDate();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(year, month, day);
        const dStart = new Date(year, month, day, 0, 0, 0, 0);
        const dEnd = new Date(year, month, day, 23, 59, 59, 999);
        const yyyy = year;
        const mm = (month + 1).toString().padStart(2, '0');
        const dd = day.toString().padStart(2, '0');
        const dStr = `${yyyy}-${mm}-${dd}`;

        let totVol = 0;
        let sapiVol = 0;
        let kambingVol = 0;

        if (day <= currentDay) {
          const dayAgg = await prisma.milkProduction.aggregate({
            where: { date: { gte: dStart, lte: dEnd } },
            _sum: { grossVolumeLiters: true, rawVolumeLiters: true },
          }).catch(() => ({ _sum: { grossVolumeLiters: 0, rawVolumeLiters: 0 } }));

          const sapiAgg = await prisma.milkProduction.aggregate({
            where: { animalType: 'SAPI', date: { gte: dStart, lte: dEnd } },
            _sum: { grossVolumeLiters: true, rawVolumeLiters: true },
          }).catch(() => ({ _sum: { grossVolumeLiters: 0, rawVolumeLiters: 0 } }));

          const kambingAgg = await prisma.milkProduction.aggregate({
            where: { animalType: 'KAMBING', date: { gte: dStart, lte: dEnd } },
            _sum: { grossVolumeLiters: true, rawVolumeLiters: true },
          }).catch(() => ({ _sum: { grossVolumeLiters: 0, rawVolumeLiters: 0 } }));

          totVol = (dayAgg._sum?.grossVolumeLiters || 0) > 0 ? dayAgg._sum.grossVolumeLiters : (dayAgg._sum?.rawVolumeLiters || 0);
          sapiVol = (sapiAgg._sum?.grossVolumeLiters || 0) > 0 ? sapiAgg._sum.grossVolumeLiters : (sapiAgg._sum?.rawVolumeLiters || 0);
          kambingVol = (kambingAgg._sum?.grossVolumeLiters || 0) > 0 ? kambingAgg._sum.grossVolumeLiters : (kambingAgg._sum?.rawVolumeLiters || 0);

          if (global.__inMemoryProductionList && global.__inMemoryProductionList.length > 0) {
            for (const m of global.__inMemoryProductionList) {
              const mStr = parseDateToYYYYMMDD(m.date);
              if (mStr === dStr) {
                const vol = (m.grossVolumeLiters || 0) > 0 ? m.grossVolumeLiters : (m.rawVolumeLiters || 0);
                totVol += vol;
                if (m.animalType === 'KAMBING') {
                  kambingVol += vol;
                } else {
                  sapiVol += vol;
                }
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
          isFuture: day > currentDay,
        });
      }
      return chartData;
    };

    const chart7Days = await getDailyChartData(7);
    const chart30Days = await getMonthlyChartData();

    const recentPackagingsRaw = await prisma.milkPackaging.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: { category: true, createdBy: { select: { name: true } } },
    }).catch(() => []);
    const recentPackagings = recentPackagingsRaw.map((item) => ({
      ...item,
      animalType: item.animalType || 'SAPI',
      createdBy: item.createdBy,
    }));

    // --- ADMIN PENGEMASAN SPECIFIC DASHBOARD STATS ---
    const productionsAll = await prisma.milkProduction.findMany().catch(() => []);
    const packagingsAllForSisa = await prisma.milkPackaging.findMany({
      where: { status: { not: 'DIBATALKAN' } }
    }).catch(() => []);

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

    // Raw milk ready to process for Pengemasan comes ONLY from milk requests & BAST confirmed by Admin Pemasaran
    let totalConfirmedFromRequests = 0;
    let confirmedMilkRequests = [];
    try {
      if (prisma.milkRequest && typeof prisma.milkRequest.findMany === 'function') {
        confirmedMilkRequests = await prisma.milkRequest.findMany({
          where: {
            status: { in: ['DISETUJUI', 'SIAP_DITERIMA', 'DITERIMA', 'SELESAI'] }
          }
        });
        totalConfirmedFromRequests = confirmedMilkRequests.reduce((acc, r) => {
          const vol = (r.receivedVolumeLiters && r.receivedVolumeLiters > 0) ? r.receivedVolumeLiters : (r.volumeLiters || 0);
          return acc + vol;
        }, 0);
      }
    } catch (e) {
      if (global.__inMemoryMilkRequestList && global.__inMemoryMilkRequestList.length > 0) {
        global.__inMemoryMilkRequestList.forEach(mem => {
          if (['DISETUJUI', 'SIAP_DITERIMA', 'DITERIMA', 'SELESAI'].includes(mem.status)) {
            const vol = (mem.receivedVolumeLiters && mem.receivedVolumeLiters > 0) ? mem.receivedVolumeLiters : (mem.volumeLiters || 0);
            totalConfirmedFromRequests += vol;
          }
        });
      }
    }

    let confirmedBastsToUht = [];
    try {
      if (prisma.beritaAcara && typeof prisma.beritaAcara.findMany === 'function') {
        confirmedBastsToUht = await prisma.beritaAcara.findMany({
          where: {
            status: { in: ['DISETUJUI', 'DITERIMA', 'DIBACA_PEMASARAN', 'SELESAI'] },
            OR: [
              { type: 'PERMINTAAN_SUSU' },
              { type: 'REQUEST_SUSU' },
              { penerimaRole: { contains: 'Pengolahan' } },
              { penerimaRole: { contains: 'UHT' } },
              { receiverDept: { contains: 'Pengolahan' } },
              { receiverDept: { contains: 'UHT' } },
            ]
          }
        });
      }
    } catch (e) {
      if (global.__inMemoryBaList && global.__inMemoryBaList.length > 0) {
        confirmedBastsToUht = global.__inMemoryBaList.filter(b => {
          const isUht = (b.type === 'PERMINTAAN_SUSU' || b.type === 'REQUEST_SUSU' || (b.penerimaRole || '').includes('Pengolahan') || (b.penerimaRole || '').includes('UHT'));
          const isDone = ['DISETUJUI', 'DITERIMA', 'DIBACA_PEMASARAN', 'SELESAI'].includes(b.status);
          return isUht && isDone;
        });
      }
    }

    const processedRequestNos = new Set(confirmedMilkRequests.map(r => r.requestNo));
    let totalConfirmedFromBasts = 0;
    confirmedBastsToUht.forEach(b => {
      const bNo = b.nomorBA || b.nomor_ba || '';
      const isAlreadyCounted = Array.from(processedRequestNos).some(rNo => rNo && (bNo.includes(rNo) || (b.notes && b.notes.includes(rNo))));
      if (!isAlreadyCounted) {
        totalConfirmedFromBasts += (b.diserahterimakan || b.totalProduksi || 0);
      }
    });

    const totalRawLitersReceived = totalConfirmedFromRequests + totalConfirmedFromBasts;

    const totalLitersProcessedInPkg = packagingsAllForSisa.reduce((acc, p) => {
      return acc + (p.processedAmount || p.processedLiters || 0);
    }, 0);

    const sisaBahanLiters = Math.max(0, totalRawLitersReceived - totalLitersProcessedInPkg);

    // 2. Stok Awal (Packaged ready stock up to start of today)
    const packagingsUpToYesterday = await prisma.milkPackaging.aggregate({
      where: {
        date: { lt: startOfToday },
        status: { not: 'DIBATALKAN' }
      },
      _sum: { totalPackagedQty: true }
    }).catch(() => ({ _sum: null }));

    const outflowsUpToYesterday = await prisma.milkOutflow.aggregate({
      where: { createdAt: { lt: startOfToday } },
      _sum: { quantity: true }
    }).catch(() => ({ _sum: null }));

    const salesUpToYesterday = await prisma.milkSale.aggregate({
      where: { date: { lt: startOfToday }, status: { not: 'Dibatalkan' } },
      _sum: { quantity: true }
    }).catch(() => ({ _sum: null }));

    const totalPackagedBeforeToday = (packagingsUpToYesterday?._sum?.totalPackagedQty || 0);
    const totalOutflowBeforeToday = (outflowsUpToYesterday?._sum?.quantity || 0) + (salesUpToYesterday?._sum?.quantity || 0);
    const stokAwalPcs = Math.max(0, totalPackagedBeforeToday - totalOutflowBeforeToday);

    // 3. Today's Packaging & Outflow Transactions
    const todayPackaging = await prisma.milkPackaging.aggregate({
      where: {
        OR: [
          { date: { gte: startOfToday, lte: endOfToday } },
          { createdAt: { gte: startOfToday, lte: endOfToday } }
        ],
        status: { not: 'DIBATALKAN' }
      },
      _sum: { totalPackagedQty: true }
    }).catch(() => ({ _sum: null }));

    const todayOutflows = await prisma.milkOutflow.aggregate({
      where: {
        createdAt: { gte: startOfToday, lte: endOfToday }
      },
      _sum: { quantity: true }
    }).catch(() => ({ _sum: null }));

    const todaySales = await prisma.milkSale.aggregate({
      where: {
        OR: [
          { date: { gte: startOfToday, lte: endOfToday } },
          { createdAt: { gte: startOfToday, lte: endOfToday } }
        ],
        status: { not: 'Dibatalkan' }
      },
      _sum: { quantity: true }
    }).catch(() => ({ _sum: null }));

    const hasilPengemasanHariIni = (todayPackaging?._sum?.totalPackagedQty || 0);
    const outflowHariIni = (todayOutflows?._sum?.quantity || 0) + (todaySales?._sum?.quantity || 0);

    // 4. Stok Akhir
    const stokAkhirPcs = Math.max(0, stokAwalPcs + hasilPengemasanHariIni - outflowHariIni);

    // 5. Jumlah Stok (Overall total ready stock currently in persediaan)
    const totalPackagedAll = await prisma.milkPackaging.aggregate({
      where: { status: { not: 'DIBATALKAN' } },
      _sum: { totalPackagedQty: true }
    }).catch(() => ({ _sum: null }));

    const totalOutflowsAll = await prisma.milkOutflow.aggregate({ _sum: { quantity: true } }).catch(() => ({ _sum: null }));
    const totalSalesAll = await prisma.milkSale.aggregate({ where: { status: { not: 'Dibatalkan' } }, _sum: { quantity: true } }).catch(() => ({ _sum: null }));

    const totalPackagedQtySum = (totalPackagedAll?._sum?.totalPackagedQty || 0);
    const totalOutflowQtySum = (totalOutflowsAll?._sum?.quantity || 0) + (totalSalesAll?._sum?.quantity || 0);

    const jumlahStokPcs = Math.max(0, totalPackagedQtySum - totalOutflowQtySum);

    // 6. Detailed Packaging Variant Breakdown Stock (Botol 115ml, Botol 250ml, Cup, Plastik Bantal, Yogurt, Keju)
    let botol115Packaged = 0, botol250Packaged = 0, cupPackaged = 0, plastikBantalPackaged = 0, yogurtPackaged = 0, kejuPackaged = 0;
    let botol115Outflow = 0, botol250Outflow = 0, cupOutflow = 0, plastikBantalOutflow = 0, yogurtOutflow = 0, kejuOutflow = 0;

    const allPackagings = await prisma.milkPackaging.findMany({
      where: { status: { not: 'DIBATALKAN' } }
    }).catch(() => []);

    allPackagings.forEach(p => {
      let parsedDetails = [];
      if (p.packagingDetails) {
        try {
          parsedDetails = JSON.parse(p.packagingDetails);
        } catch (e) {}
      }

      if (Array.isArray(parsedDetails) && parsedDetails.length > 0) {
        parsedDetails.forEach(item => {
          const qty = parseInt(item.quantity, 10) || 0;
          const itemCat = (item.productCategory || '').toLowerCase();
          const pCatStr = (p.productCategory || '').toLowerCase();
          const pSubStr = (p.productSubtype || '').toLowerCase();
          const pVarStr = (p.variant || '').toLowerCase();
          const pNotesStr = (p.notes || '').toLowerCase();
          const pkgType = (item.packagingType || '').toLowerCase();
          const size = (item.size || '').toLowerCase();

          const isItemYogurt = itemCat.includes('yogurt') || pkgType.includes('yogurt') || pCatStr.includes('yogurt') || pSubStr.includes('yogurt') || pVarStr.includes('yogurt') || pNotesStr.includes('yogurt');
          const isItemKeju = itemCat.includes('keju') || pkgType.includes('keju') || size.includes('gram') || pCatStr.includes('keju') || pSubStr.includes('keju') || pVarStr.includes('keju') || pNotesStr.includes('keju');

          if (isItemYogurt) {
            yogurtPackaged += qty;
          } else if (isItemKeju) {
            kejuPackaged += qty;
          } else if (pkgType.includes('cup')) {
            cupPackaged += qty;
          } else if (pkgType.includes('plastik') || pkgType.includes('bantal')) {
            plastikBantalPackaged += qty;
          } else if (size.includes('115')) {
            botol115Packaged += qty;
          } else {
            botol250Packaged += qty;
          }
        });
      } else {
        const isYogurt = (p.productCategory || '').toLowerCase().includes('yogurt') || 
                         (p.productSubtype || '').toLowerCase().includes('yogurt');
        const isKeju = (p.productCategory || '').toLowerCase().includes('keju') || 
                       (p.productSubtype || '').toLowerCase().includes('keju');

        if (isYogurt) {
          yogurtPackaged += (p.totalPackagedQty || 0);
        } else if (isKeju) {
          kejuPackaged += (p.totalPackagedQty || 0);
        } else if (p.botolQty > 0 || p.cupQty > 0 || p.plastikBantalQty > 0) {
          const mainSize = (p.packageSize || '').toLowerCase();
          if (mainSize.includes('115')) {
            botol115Packaged += (p.botolQty || 0);
          } else {
            botol250Packaged += (p.botolQty || 0);
          }
          cupPackaged += (p.cupQty || 0);
          plastikBantalPackaged += (p.plastikBantalQty || 0);
        } else {
          const qty = p.totalPackagedQty || 0;
          const mainPkg = (p.packagingType || '').toLowerCase();
          const mainSize = (p.packageSize || '').toLowerCase();

          if (mainPkg.includes('cup')) {
            cupPackaged += qty;
          } else if (mainPkg.includes('plastik') || mainPkg.includes('bantal') || mainPkg.includes('pack')) {
            plastikBantalPackaged += qty;
          } else if (mainSize.includes('115')) {
            botol115Packaged += qty;
          } else {
            botol250Packaged += qty;
          }
        }
      }
    });


    const allSales = await prisma.milkSale.findMany({
      where: { status: { not: 'Dibatalkan' } }
    }).catch(() => []);

    allSales.forEach(s => {
      const catStr = (s.productCategory || s.productSubtype || '').toLowerCase();
      const isYogurt = catStr.includes('yogurt');
      const isKeju = catStr.includes('keju');
      const qty = s.quantity || 0;
      const notes = (s.notes || '').toLowerCase();
      const pkgType = (s.packagingType || '').toLowerCase();

      if (isYogurt) {
        yogurtOutflow += qty;
      } else if (isKeju) {
        kejuOutflow += qty;
      } else if (pkgType.includes('cup') || notes.includes('cup')) {
        cupOutflow += qty;
      } else if (pkgType.includes('plastik') || notes.includes('plastik') || notes.includes('bantal')) {
        plastikBantalOutflow += qty;
      } else if (notes.includes('115')) {
        botol115Outflow += qty;
      } else {
        botol250Outflow += qty;
      }
    });

    const allOutflows = await prisma.milkOutflow.findMany().catch(() => []);

    allOutflows.forEach(o => {
      const notes = (o.notes || '').toLowerCase();
      const pType = (o.productType || '').toLowerCase();
      const isYogurt = pType === 'olahan' && (notes.includes('keluar_yogurt') || notes.includes('penjualan yogurt') || notes.includes('afkir yogurt'));
      const isKeju = pType === 'olahan' && (notes.includes('keluar_keju') || notes.includes('penjualan keju') || notes.includes('afkir keju'));
      const qty = o.quantity || 0;
      const pkgType = (o.packagingType || '').toLowerCase();

      if (isYogurt) {
        yogurtOutflow += qty;
      } else if (isKeju) {
        kejuOutflow += qty;
      } else if (pkgType.includes('cup') || notes.includes('cup')) {
        cupOutflow += qty;
      } else if (pkgType.includes('plastik') || notes.includes('plastik') || notes.includes('bantal')) {
        plastikBantalOutflow += qty;
      } else if (notes.includes('115')) {
        botol115Outflow += qty;
      } else {
        botol250Outflow += qty;
      }
    });

    const stokBotol115 = Math.max(0, botol115Packaged - botol115Outflow);
    const stokBotol250 = Math.max(0, botol250Packaged - botol250Outflow);
    const stokCup = Math.max(0, cupPackaged - cupOutflow);
    const stokPlastikBantal = Math.max(0, plastikBantalPackaged - plastikBantalOutflow);
    const stokYogurt = Math.max(0, yogurtPackaged - yogurtOutflow);
    const stokKeju = Math.max(0, kejuPackaged - kejuOutflow);

    // Packaging Daily Charts (7 Days & Month)
    const getPackagingDailyChartData = async (daysCount) => {
      const chartData = [];
      const daysName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
        const dEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

        const pkgAgg = await prisma.milkPackaging.aggregate({
          where: {
            OR: [
              { date: { gte: dStart, lte: dEnd } },
              { createdAt: { gte: dStart, lte: dEnd } }
            ],
            status: { not: 'DIBATALKAN' }
          },
          _sum: { totalPackagedQty: true, processedAmount: true }
        }).catch(() => ({ _sum: null }));

        const totalPcs = pkgAgg?._sum?.totalPackagedQty || 0;
        const totalLiters = pkgAgg?._sum?.processedAmount || 0;

        const dayLabel = `${daysName[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;

        chartData.push({
          label: dayLabel,
          dayName: daysName[d.getDay()],
          dayNum: d.getDate(),
          monthNum: d.getMonth() + 1,
          dateStr: `${d.getDate()}/${d.getMonth() + 1}`,
          formattedDate: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
          fullDate: d.toISOString().split('T')[0],
          totalLiters: totalLiters,
          grossLiters: totalLiters,
          totalPackagedPcs: totalPcs,
          stokAdded: totalPcs,
          litersProcessed: totalLiters,
        });
      }
      return chartData;
    };

    const getPackagingMonthlyChartData = async () => {
      const chartData = [];
      const daysName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const year = now.getFullYear();
      const month = now.getMonth();
      const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

      for (let day = 1; day <= totalDaysInMonth; day++) {
        const d = new Date(year, month, day);
        const dStart = new Date(year, month, day, 0, 0, 0, 0);
        const dEnd = new Date(year, month, day, 23, 59, 59, 999);

        const pkgAgg = await prisma.milkPackaging.aggregate({
          where: {
            OR: [
              { date: { gte: dStart, lte: dEnd } },
              { createdAt: { gte: dStart, lte: dEnd } }
            ],
            status: { not: 'DIBATALKAN' }
          },
          _sum: { totalPackagedQty: true, processedAmount: true }
        }).catch(() => ({ _sum: null }));

        const totalPcs = pkgAgg?._sum?.totalPackagedQty || 0;
        const totalLiters = pkgAgg?._sum?.processedAmount || 0;

        const monthName = d.toLocaleDateString('id-ID', { month: 'short' });

        chartData.push({
          label: `${daysName[d.getDay()]} ${day}/${month + 1}`,
          dayName: daysName[d.getDay()],
          dayNum: day,
          monthNum: month + 1,
          dateStr: `${day}/${month + 1}`,
          formattedDate: `${day} ${monthName}`,
          fullDate: d.toISOString().split('T')[0],
          totalLiters: totalLiters,
          grossLiters: totalLiters,
          totalPackagedPcs: totalPcs,
          stokAdded: totalPcs,
          litersProcessed: totalLiters,
        });
      }
      return chartData;
    };

    const packagingChart7Days = await getPackagingDailyChartData(7);
    const packagingChart30Days = await getPackagingMonthlyChartData();

    // Combined Recent Activity Feed (Packaging, Production, Sales, Outflow, Berita Acara)
    let rawBaList = [];
    try {
      if (prisma.beritaAcara) {
        rawBaList = await prisma.beritaAcara.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { createdBy: { select: { name: true } } } });
      }
    } catch (e) {}

    const [rawPkgList, rawProdList, rawSalesList, rawOutList] = await Promise.all([
      prisma.milkPackaging.findMany({ take: 6, orderBy: { updatedAt: 'desc' }, include: { createdBy: { select: { name: true } } } }).catch(() => []),
      prisma.milkProduction.findMany({ take: 6, orderBy: { updatedAt: 'desc' }, include: { createdBy: { select: { name: true } } } }).catch(() => []),
      prisma.milkSale.findMany({ take: 6, orderBy: { updatedAt: 'desc' }, include: { createdBy: { select: { name: true } } } }).catch(() => []),
      prisma.milkOutflow.findMany({ take: 6, orderBy: { updatedAt: 'desc' }, include: { createdBy: { select: { name: true } } } }).catch(() => []),
    ]);

    const activityList = [];

    rawPkgList.forEach((p) => {
      activityList.push({
        id: `pkg-${p.id}`,
        type: 'HASIL_PENGOLAHAN',
        title: `Hasil pengolahan ${p.productSubtype || p.productCategory}`,
        detail: `${p.totalPackagedQty || 0} pcs diproduksi`,
        status: p.status || 'SELESAI',
        timestamp: p.updatedAt || p.date,
        icon: '📦',
        user: p.createdBy?.name || 'Admin Pengemasan',
        raw: p,
      });
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
    rawOutList.forEach((o) => {
      const isOlahan = (o.productType || '').toLowerCase() === 'olahan';
      if (isOlahan) {
        const isAfkir = (o.notes || '').toLowerCase().includes('afkir') || (o.notes || '').toLowerCase().includes('rusak');
        activityList.push({
          id: `out-${o.id}`,
          type: isAfkir ? 'AFKIR' : 'HIBAH',
          title: isAfkir ? `Produk Rusak / Afkir` : `Distribusi Hibah Olahan`,
          detail: `${o.notes || `${o.quantity} pcs dikeluarkan`}`,
          status: 'Berhasil',
          timestamp: o.updatedAt || o.date,
          icon: isAfkir ? '⚠️' : '🎁',
          user: o.createdBy?.name || 'Admin Pengemasan',
          raw: o,
        });
      }
    });

    activityList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const recentActivities = activityList.slice(0, 8);

    const dbMaterials = (prisma.packagingMaterial && typeof prisma.packagingMaterial.findMany === 'function')
      ? await prisma.packagingMaterial.findMany({ orderBy: { name: 'asc' } }).catch(() => [])
      : [];
    let matAmanCount = 0;
    let matMenipisCount = 0;
    let matKritisCount = 0;

    const enrichedMaterials = (dbMaterials || []).map(mat => {
      let status = 'Aman';
      if (mat.currentStock <= mat.criticalStock) {
        status = 'Kritis';
        matKritisCount++;
      } else if (mat.currentStock <= mat.minimumStock) {
        status = 'Menipis';
        matMenipisCount++;
      } else {
        matAmanCount++;
      }
      return { ...mat, status };
    });

    let calcGross = (todayFarmProdAgg._sum?.grossVolumeLiters || 0) + memGrossTotal;
    let calcSapiGross = (todayFarmSapiProdAgg._sum?.grossVolumeLiters || 0) + memSapiGross;
    let calcKambingGross = (todayFarmKambingProdAgg._sum?.grossVolumeLiters || 0) + memKambingGross;
    let calcSapiRaw = (todayFarmSapiProdAgg._sum?.rawVolumeLiters || 0) + memSapiRaw;
    let calcKambingRaw = (todayFarmKambingProdAgg._sum?.rawVolumeLiters || 0) + memKambingRaw;

    const realFarmActivities = [];
    (recentSegarRaw || []).forEach(p => {
      const vol = p.grossVolumeLiters || p.rawVolumeLiters || 0;
      const isKambing = p.animalType === 'KAMBING';
      realFarmActivities.push({
        id: `prod-${p.id}`,
        title: isKambing ? 'Input Produksi Kambing' : 'Input Produksi Sapi',
        details: isKambing 
          ? `Pencatatan perah kambing (${p.shift || 'Pagi'}) sebanyak ${vol.toLocaleString('id-ID')} Liter`
          : `Farm ${p.farmOrigin || 'Manggala'} (${p.shift || 'Pagi'}) sebanyak ${vol.toLocaleString('id-ID')} Liter`,
        icon: isKambing ? '🐐' : '🐄',
        status: 'Tercatat',
        date: p.createdAt || p.date,
        createdAt: p.createdAt || p.date,
      });

      if ((p.rawVolumeLiters || 0) > 0) {
        realFarmActivities.push({
          id: `st-${p.id}`,
          title: 'Serah Terima Susu',
          details: `Serah terima ${(p.rawVolumeLiters).toLocaleString('id-ID')} Liter susu ${isKambing ? 'kambing' : 'sapi'} ke Divisi UHT`,
          icon: '🥛',
          status: 'Selesai',
          date: new Date(new Date(p.createdAt || p.date).getTime() + 15 * 60000),
          createdAt: new Date(new Date(p.createdAt || p.date).getTime() + 15 * 60000),
        });
      }
    });

    (recentPackagingsRaw || []).forEach(pkg => {
      const type = pkg.productSubtype || pkg.productCategory || 'Susu Olahan';
      const isYogurt = type.toLowerCase().includes('yogurt');
      realFarmActivities.push({
        id: `pkg-${pkg.id}`,
        title: isYogurt ? 'Pengolahan Yogurt' : `Pengolahan ${type}`,
        details: `Divisi UHT mengemas ${pkg.totalPackagedQty || pkg.botolQty || 0} pcs (${type})`,
        icon: isYogurt ? '🥣' : '🍶',
        status: 'Selesai',
        date: pkg.createdAt || pkg.date,
        createdAt: pkg.createdAt || pkg.date,
      });
    });

    if (global.__inMemoryProductionList && global.__inMemoryProductionList.length > 0) {
      global.__inMemoryProductionList.forEach((m, idx) => {
        const vol = m.grossVolumeLiters || m.rawVolumeLiters || 0;
        const isKambing = m.animalType === 'KAMBING';
        realFarmActivities.push({
          id: `mem-${idx}`,
          title: isKambing ? 'Input Produksi Kambing' : 'Input Produksi Sapi',
          details: isKambing
            ? `Pencatatan perah kambing (${m.shift || 'Pagi'}) sebanyak ${vol.toLocaleString('id-ID')} Liter`
            : `Farm ${m.farmOrigin || 'Manggala'} (${m.shift || 'Pagi'}) sebanyak ${vol.toLocaleString('id-ID')} Liter`,
          icon: isKambing ? '🐐' : '🐄',
          status: 'Tercatat',
          date: m.date || new Date(),
          createdAt: m.date || new Date(),
        });
      });
    }

    realFarmActivities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      data: {
        packagingStats: {
          stokAwalPcs,
          stokAkhirPcs,
          sisaBahanLiters,
          jumlahStokPcs,
          stokBotol115,
          stokBotol250,
          stokCup,
          stokPlastikBantal,
          stokYogurt,
          stokKeju,
          dikemasHariIniPcs: hasilPengemasanHariIni,
          outflowHariIni,
          chart7Days: packagingChart7Days,
          chart30Days: packagingChart30Days,
          recentPackagings: rawPkgList,
          recentActivities,
          materials: enrichedMaterials,
          materialStatus: {
            amanCount: matAmanCount,
            menipisCount: matMenipisCount,
            kritisCount: matKritisCount,
            warningCount: matMenipisCount + matKritisCount
          },
        },
        superadmin: {
          totalAdmins,
          totalLitersProduced: totalGrossAll,
          totalSegarReady,
          totalOlahanReady,
          recentLogs,
        },
        farm: {
          todayGrossLiters: calcGross,
          todayPedetLiters: todayFarmProdAgg._sum?.pedetVolumeLiters || 0,
          todayAfkirLiters: todayFarmProdAgg._sum?.afkirVolumeLiters || 0,
          todaySoldFreshLiters: todayFarmProdAgg._sum?.soldFreshVolumeLiters || 0,
          todayRawLiters: (todayFarmProdAgg._sum?.rawVolumeLiters || 0) + memRawTotal,

          todaySapiGross: calcSapiGross,
          todaySapiRaw: calcSapiRaw,

          todayKambingGross: calcKambingGross,
          todayKambingRaw: calcKambingRaw,

          todayTotalLiters: calcGross,
          todaySapiLiters: calcSapiGross,
          todayKambingLiters: calcKambingGross,

          farmOriginToday: farmOriginMap,
          todaySoldFreshItems,

          todayPackagedQty: todayPackagingAgg._sum?.totalPackagedQty || 0,
          todayBotolQty: todayPackagingAgg._sum?.botolQty || 0,
          todayCupQty: todayPackagingAgg._sum?.cupQty || 0,
          todayPlastikBantalQty: todayPackagingAgg._sum?.plastikBantalQty || 0,
          todayProcessedLiters: todayPackagingAgg._sum?.processedLiters || 0,

          sapiPackagedQty: sapiPackagingAgg._sum?.totalPackagedQty || 0,
          sapiBotolQty: sapiPackagingAgg._sum?.botolQty || 0,
          sapiCupQty: sapiPackagingAgg._sum?.cupQty || 0,
          sapiPlastikBantalQty: sapiPackagingAgg._sum?.plastikBantalQty || 0,
          sapiProcessedLiters: sapiPackagingAgg._sum?.processedLiters || 0,

          kambingPackagedQty: kambingPackagingAgg._sum?.totalPackagedQty || 0,
          kambingBotolQty: kambingPackagingAgg._sum?.botolQty || 0,
          kambingCupQty: kambingPackagingAgg._sum?.cupQty || 0,
          kambingPlastikBantalQty: kambingPackagingAgg._sum?.plastikBantalQty || 0,
          kambingProcessedLiters: kambingPackagingAgg._sum?.processedLiters || 0,

          totalAccumulatedLiters: totalLitersAgg._sum?.rawVolumeLiters || 0,
          totalPackagedQty: totalPackagingAgg._sum?.totalPackagedQty || 0,
          chart7Days,
          chart30Days,
          recentPackagings: rawPkgList,
          recentLogs: realFarmActivities,
        },
        segar: {
          totalReadyStock: totalSegarReady,
          todayLiters: todaySegarProd._sum?.rawVolumeLiters || 0,
          todaySapiLiters: todaySapiProd._sum?.rawVolumeLiters || 0,
          todayKambingLiters: todayKambingProd._sum?.rawVolumeLiters || 0,
          todayPackaged: todaySegarProd._sum?.packagedQty || 0,
          monthLiters: monthSegarProd._sum?.rawVolumeLiters || 0,
          monthSapiLiters: monthSapiProd._sum?.rawVolumeLiters || 0,
          monthKambingLiters: monthKambingProd._sum?.rawVolumeLiters || 0,
          monthPackaged: monthSegarProd._sum?.packagedQty || 0,
          totalSapiLiters: totalSapiAgg._sum?.rawVolumeLiters || 0,
          totalKambingLiters: totalKambingAgg._sum?.rawVolumeLiters || 0,
          todayOutflow: todaySegarOut._sum?.quantity || 0,
          monthOutflow: monthSegarOut._sum?.quantity || 0,
          categories: segarStocks,
          recentProductions: recentSegarProductions,
          recentOutflows: recentSegarOutflows,
        },
        olahan: {
          totalReadyStock: totalOlahanReady,
          packagingTotals: olahanKemasanTotals,
          todayLiters: todayOlahanProd._sum?.rawVolumeLiters || 0,
          todayPackaged: todayOlahanProd._sum?.packagedQty || 0,
          monthLiters: monthOlahanProd._sum?.rawVolumeLiters || 0,
          monthPackaged: monthOlahanProd._sum?.packagedQty || 0,
          todayOutflow: todayOlahanOut._sum?.quantity || 0,
          monthOutflow: monthOlahanOut._sum?.quantity || 0,
          categories: olahanStocks,
          recentProductions: recentOlahanProductions,
          recentOutflows: recentOlahanOutflows,
        },
      },
    });
  } catch (error) {
    console.error('GET /api/dashboard/stats error:', error);
    const fallbackNow = new Date();
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

    const fallbackDaysName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const catchChart7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(fallbackNow);
      d.setDate(d.getDate() - i);
      const s = (i === 0 && sapiGross > 0) ? sapiGross : 0;
      const k = (i === 0 && kambingGross > 0) ? kambingGross : 0;
      const tot = (i === 0 && gross > 0) ? gross : (s + k);
      catchChart7Days.push({
        label: `${fallbackDaysName[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`,
        dayName: fallbackDaysName[d.getDay()],
        dayNum: d.getDate(),
        monthNum: d.getMonth() + 1,
        dateStr: `${d.getDate()}/${d.getMonth() + 1}`,
        formattedDate: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        totalLiters: tot,
        sapiLiters: s,
        kambingLiters: k,
      });
    }

    const catchChart30Days = [];
    const curDay = fallbackNow.getDate();
    const daysInMonth = new Date(fallbackNow.getFullYear(), fallbackNow.getMonth() + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(fallbackNow.getFullYear(), fallbackNow.getMonth(), day);
      let s = 0, k = 0, tot = 0;
      if (day === curDay) {
        s = sapiGross || 0;
        k = kambingGross || 0;
        tot = gross || (s + k);
      }
      catchChart30Days.push({
        label: `${fallbackDaysName[d.getDay()]} ${day}/${fallbackNow.getMonth() + 1}`,
        dayName: fallbackDaysName[d.getDay()],
        dayNum: day,
        monthNum: fallbackNow.getMonth() + 1,
        dateStr: `${day}/${fallbackNow.getMonth() + 1}`,
        formattedDate: `${day} ${d.toLocaleDateString('id-ID', { month: 'short' })}`,
        totalLiters: tot,
        sapiLiters: s,
        kambingLiters: k,
        isFuture: day > curDay,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        packagingStats: {
          stokAwalPcs: 0,
          stokAkhirPcs: 0,
          sisaBahanLiters: raw,
          jumlahStokPcs: 0,
          stokBotol115: 0,
          stokBotol250: 0,
          stokCup: 0,
          stokPlastikBantal: 0,
          stokYogurt: 0,
          stokKeju: 0,
          dikemasHariIniPcs: 0,
          outflowHariIni: 0,
          chart7Days: catchChart7Days.map(c => ({ ...c, totalPackagedPcs: 0, stokAdded: 0, litersProcessed: 0 })),
          chart30Days: catchChart30Days.map(c => ({ ...c, totalPackagedPcs: 0, stokAdded: 0, litersProcessed: 0 })),
          recentPackagings: [],
          recentActivities: [],
        },
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
          chart7Days: catchChart7Days,
          chart30Days: catchChart30Days,
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


