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

    // Today & Month Stats for SEGAR
    const todaySegarProd = await prisma.milkProduction.aggregate({
      where: { productType: 'SEGAR', date: { gte: startOfToday, lte: endOfToday } },
      _sum: { rawVolumeLiters: true, packagedQty: true },
    });
    const monthSegarProd = await prisma.milkProduction.aggregate({
      where: { productType: 'SEGAR', date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { rawVolumeLiters: true, packagedQty: true },
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
      take: 5,
      where: { productType: 'SEGAR' },
      orderBy: { date: 'desc' },
      include: { category: true, createdBy: { select: { name: true } } },
    });
    const recentOlahanProductions = await prisma.milkProduction.findMany({
      take: 5,
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
        segar: {
          totalReadyStock: totalSegarReady,
          todayLiters: todaySegarProd._sum.rawVolumeLiters || 0,
          todayPackaged: todaySegarProd._sum.packagedQty || 0,
          monthLiters: monthSegarProd._sum.rawVolumeLiters || 0,
          monthPackaged: monthSegarProd._sum.packagedQty || 0,
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
