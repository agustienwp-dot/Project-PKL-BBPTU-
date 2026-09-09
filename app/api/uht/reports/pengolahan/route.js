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
      throw new Error('DB_OFFLINE');
    }

    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1), 10);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear(), 10);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const productCategory = searchParams.get('productCategory');
    const packageSize = searchParams.get('packageSize');
    const status = searchParams.get('status');

    const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
    const daysInMonth = new Date(year, month, 0).getDate();

    const startDate = startDateParam ? new Date(`${startDateParam}T00:00:00.000Z`) : startOfMonth;
    const endDate = endDateParam ? new Date(`${endDateParam}T23:59:59.999Z`) : endOfMonth;

    const wherePkg = {
      date: { gte: startDate, lte: endDate },
      status: { not: 'DIBATALKAN' }
    };

    if (productCategory && productCategory !== 'ALL') {
      wherePkg.productCategory = productCategory;
    }
    if (packageSize && packageSize !== 'ALL') {
      wherePkg.packageSize = packageSize;
    }
    if (status && status !== 'ALL') {
      wherePkg.status = status;
    }

    const packagings = await prisma.milkPackaging.findMany({
      where: wherePkg,
      include: {
        category: true,
        createdBy: { select: { name: true } }
      },
      orderBy: { date: 'desc' }
    }).catch(() => []);

    // Fetch received raw milk requests
    const rawMilkRequests = await prisma.milkRequest.findMany({
      where: {
        status: 'DITERIMA',
        date: { gte: startDate, lte: endDate }
      }
    }).catch(() => []);

    // Compute Daily Matrix Logs (Day 1 to daysInMonth)
    const dailyLogs = [];
    const monthlyTotals = {
      susuDiterima: 0,
      susuDiolah: 0,
      susu115: 0,
      susu250: 0,
      cup: 0,
      plastikBantal: 0,
      yogurt200: 0,
      keju: 0,
      totalProduk: 0
    };

    const monthlyVariantBreakdown = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const dStart = new Date(year, month - 1, day, 0, 0, 0, 0);
      const dEnd = new Date(year, month - 1, day, 23, 59, 59, 999);
      const dateStr = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;

      // Requests received on day
      const dayReqs = rawMilkRequests.filter(r => {
        const d = new Date(r.receivedAt || r.date);
        return d >= dStart && d <= dEnd;
      });
      const susuDiterima = dayReqs.reduce((acc, r) => acc + (r.receivedVolumeLiters || r.volumeLiters || 0), 0);

      // Packagings on day
      const dayPkgs = packagings.filter(p => {
        const d = new Date(p.date || p.createdAt);
        return d >= dStart && d <= dEnd;
      });

      let susuDiolah = 0;
      let susu115 = 0;
      let susu250 = 0;
      let cup = 0;
      let plastikBantal = 0;
      let yogurt200 = 0;
      let keju = 0;
      let totalProduk = 0;
      const dayVariantBreakdown = {};

      dayPkgs.forEach(p => {
        susuDiolah += (p.processedAmount || p.processedLiters || 0);

        let details = [];
        if (p.packagingDetails) {
          try {
            const parsed = JSON.parse(p.packagingDetails);
            if (Array.isArray(parsed)) details = parsed;
          } catch (e) {}
        }

        if (details.length > 0) {
          details.forEach(item => {
            const qty = parseInt(item.quantity, 10) || 0;
            const cat = (item.productCategory || p.productCategory || '').toLowerCase();
            const sz = (item.size || '').toLowerCase();
            const pkg = (item.packagingType || '').toLowerCase();
            const variant = item.variant || p.variant || 'Original';

            totalProduk += qty;

            if (cat.includes('yogurt') || pkg.includes('yogurt')) {
              yogurt200 += qty;
              const key = `Yogurt 200 ml (${variant})`;
              dayVariantBreakdown[key] = (dayVariantBreakdown[key] || 0) + qty;
              monthlyVariantBreakdown[key] = (monthlyVariantBreakdown[key] || 0) + qty;
            } else if (cat.includes('keju') || pkg.includes('keju') || sz.includes('gram')) {
              keju += qty;
              const key = `Keju (${sz || '100 gram'})`;
              dayVariantBreakdown[key] = (dayVariantBreakdown[key] || 0) + qty;
              monthlyVariantBreakdown[key] = (monthlyVariantBreakdown[key] || 0) + qty;
            } else if (pkg.includes('cup')) {
              cup += qty;
              const key = `Susu Cup (${variant})`;
              dayVariantBreakdown[key] = (dayVariantBreakdown[key] || 0) + qty;
              monthlyVariantBreakdown[key] = (monthlyVariantBreakdown[key] || 0) + qty;
            } else if (pkg.includes('bantal') || pkg.includes('plastik')) {
              plastikBantal += qty;
              const key = `Susu Plastik Bantal (${variant})`;
              dayVariantBreakdown[key] = (dayVariantBreakdown[key] || 0) + qty;
              monthlyVariantBreakdown[key] = (monthlyVariantBreakdown[key] || 0) + qty;
            } else {
              // Botol
              if (sz.includes('115')) {
                susu115 += qty;
                const key = `Susu 115 ml (${variant})`;
                dayVariantBreakdown[key] = (dayVariantBreakdown[key] || 0) + qty;
                monthlyVariantBreakdown[key] = (monthlyVariantBreakdown[key] || 0) + qty;
              } else {
                susu250 += qty;
                const key = `Susu 250 ml (${variant})`;
                dayVariantBreakdown[key] = (dayVariantBreakdown[key] || 0) + qty;
                monthlyVariantBreakdown[key] = (monthlyVariantBreakdown[key] || 0) + qty;
              }
            }
          });
        } else {
          const qty = p.totalPackagedQty || 0;
          const cat = (p.productCategory || p.productSubtype || '').toLowerCase();
          const pkg = (p.packagingType || '').toLowerCase();
          const isYog = cat.includes('yogurt') || pkg.includes('yogurt');
          const isKj = cat.includes('keju') || pkg.includes('keju');
          const isCup = pkg.includes('cup') || (p.cupQty && p.cupQty > 0);
          const isBantal = pkg.includes('bantal') || pkg.includes('plastik') || (p.plastikBantalQty && p.plastikBantalQty > 0);
          const variant = p.variant || 'Original';

          totalProduk += qty;

          if (isYog) {
            yogurt200 += qty;
            const key = `Yogurt 200 ml (${variant})`;
            dayVariantBreakdown[key] = (dayVariantBreakdown[key] || 0) + qty;
            monthlyVariantBreakdown[key] = (monthlyVariantBreakdown[key] || 0) + qty;
          } else if (isKj) {
            keju += qty;
            const key = `Keju (${p.packageSize || '100 gram'})`;
            dayVariantBreakdown[key] = (dayVariantBreakdown[key] || 0) + qty;
            monthlyVariantBreakdown[key] = (monthlyVariantBreakdown[key] || 0) + qty;
          } else if (isCup) {
            cup += qty;
            const key = `Susu Cup (${variant})`;
            dayVariantBreakdown[key] = (dayVariantBreakdown[key] || 0) + qty;
            monthlyVariantBreakdown[key] = (monthlyVariantBreakdown[key] || 0) + qty;
          } else if (isBantal) {
            plastikBantal += qty;
            const key = `Susu Plastik Bantal (${variant})`;
            dayVariantBreakdown[key] = (dayVariantBreakdown[key] || 0) + qty;
            monthlyVariantBreakdown[key] = (monthlyVariantBreakdown[key] || 0) + qty;
          } else {
            const sz = (p.packageSize || '').toLowerCase();
            if (sz.includes('115')) {
              susu115 += qty;
              const key = `Susu 115 ml (${variant})`;
              dayVariantBreakdown[key] = (dayVariantBreakdown[key] || 0) + qty;
              monthlyVariantBreakdown[key] = (monthlyVariantBreakdown[key] || 0) + qty;
            } else {
              susu250 += qty;
              const key = `Susu 250 ml (${variant})`;
              dayVariantBreakdown[key] = (dayVariantBreakdown[key] || 0) + qty;
              monthlyVariantBreakdown[key] = (monthlyVariantBreakdown[key] || 0) + qty;
            }
          }
        }
      });

      monthlyTotals.susuDiterima += susuDiterima;
      monthlyTotals.susuDiolah += susuDiolah;
      monthlyTotals.susu115 += susu115;
      monthlyTotals.susu250 += susu250;
      monthlyTotals.cup += cup;
      monthlyTotals.plastikBantal += plastikBantal;
      monthlyTotals.yogurt200 += yogurt200;
      monthlyTotals.keju += keju;
      monthlyTotals.totalProduk += totalProduk;

      dailyLogs.push({
        day,
        dateStr,
        susuDiterima,
        susuDiolah,
        susu115,
        susu250,
        cup,
        plastikBantal,
        yogurt200,
        keju,
        totalProduk,
        variantBreakdown: dayVariantBreakdown
      });
    }

    const totalRawMilkReceived = rawMilkRequests.reduce((acc, r) => acc + (r.receivedVolumeLiters || r.volumeLiters || 0), 0);
    const totalMilkProcessed = packagings.reduce((acc, p) => acc + (p.processedAmount || p.processedLiters || 0), 0);
    const totalFinishedProducts = packagings.reduce((acc, p) => acc + (p.totalPackagedQty || 0), 0);

    // Fetch remaining material stocks
    const materials = await prisma.packagingMaterial.findMany({
      orderBy: { name: 'asc' }
    }).catch(() => []);

    const movements = await prisma.materialStockMovement.findMany({
      orderBy: { createdAt: 'desc' }
    }).catch(() => []);

    // Filter materials to match exactly the 5 items in menu 'Sisa Stok Bahan'
    const targetSpecs = [
      { name: 'Botol 250 ml', match: (m) => (m.code || '').includes('BOT-250') || (m.name || '').toLowerCase().includes('250') },
      { name: 'Botol 115 ml', match: (m) => (m.code || '').includes('BOT-115') || (m.name || '').toLowerCase().includes('115') },
      { name: 'Cup', match: (m) => (m.code || '').includes('CUP-200') || ((m.name || '').toLowerCase().includes('cup') && !(m.name || '').toLowerCase().includes('tutup')) },
      { name: 'Plastik Bantal', match: (m) => (m.code || '').includes('PLASTIK') || (m.name || '').toLowerCase().includes('plastik') },
      { name: 'Label', match: (m) => (m.code || '').includes('LBL') || (m.name || '').toLowerCase().includes('label') }
    ];

    const rawMaterialUsageList = (materials || []).map(mat => {
      const matMovements = (movements || []).filter(m => m.materialId === mat.id);
      const usedQty = matMovements
        .filter(m => m.source === 'PENGOLAHAN' || m.type === 'DEDUCTION')
        .reduce((acc, m) => acc + (m.quantity || 0), 0);
      const addedQty = matMovements
        .filter(m => m.source === 'PENYESUAIAN' && m.type === 'ADDITION')
        .reduce((acc, m) => acc + (m.quantity || 0), 0);
      const initialStock = Math.max(0, (mat.currentStock || 0) + usedQty - addedQty);

      return {
        id: mat.id,
        code: mat.code,
        name: mat.name,
        category: mat.category,
        unit: mat.unit,
        initialStock,
        usedQty,
        adjustmentQty: addedQty,
        finalStock: mat.currentStock || 0
      };
    });

    const matchedMaterials = targetSpecs.map(spec => {
      const found = rawMaterialUsageList.find(spec.match);
      if (!found) return null;
      return { ...found, name: spec.name };
    }).filter(Boolean);

    const materialUsageList = matchedMaterials.length > 0 ? matchedMaterials : rawMaterialUsageList;

    // Real-time raw milk remaining balance
    const sisaStokSusuSegar = Math.max(0, totalRawMilkReceived - totalMilkProcessed);

    return NextResponse.json({
      success: true,
      data: {
        month,
        year,
        summary: {
          totalRawMilkReceived,
          totalMilkProcessed,
          totalFinishedProducts,
          sisaStokSusuSegar,
          totalMaterialsUsed: materialUsageList.reduce((acc, m) => acc + m.usedQty, 0)
        },
        dailyLogs,
        monthlyTotals,
        monthlyVariantBreakdown,
        records: packagings,
        materials,
        materialUsage: materialUsageList
      }
    });
  } catch (error) {
    console.error('Error fetching processing report:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
