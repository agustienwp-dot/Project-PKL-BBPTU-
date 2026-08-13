import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const now = new Date();
    const month = parseInt(searchParams.get('month') || (now.getMonth() + 1).toString(), 10);
    const year = parseInt(searchParams.get('year') || now.getFullYear().toString(), 10);
    const productType = searchParams.get('productType') || 'SEGAR'; // SEGAR or OLAHAN

    // Date range for the requested month
    const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    const daysInMonth = new Date(year, month, 0).getDate();

    const whereProd = {
      date: { gte: startDate, lte: endDate },
    };
    const whereOut = {
      date: { gte: startDate, lte: endDate },
    };

    if (productType !== 'ALL') {
      whereProd.productType = productType;
      whereOut.productType = productType;
    }

    // Get all production & outflow in this month
    const monthProductions = await prisma.milkProduction.findMany({
      where: whereProd,
      include: { category: true },
      orderBy: { date: 'asc' },
    });

    const monthOutflows = await prisma.milkOutflow.findMany({
      where: whereOut,
      include: { category: true },
      orderBy: { date: 'asc' },
    });

    // Monthly Aggregates
    let totalRawLiters = 0;
    let totalProcessedLiters = 0;
    let totalPackaged = 0;
    let totalOutflow = 0;

    const packagingProducedTotals = { botol: 0, cup: 0, pack: 0 };
    const packagingOutflowTotals = { botol: 0, cup: 0, pack: 0 };

    monthProductions.forEach((p) => {
      totalRawLiters += p.rawVolumeLiters;
      totalProcessedLiters += p.processedLiters;
      totalPackaged += p.packagedQty;

      const pkg = p.packagingType || 'botol';
      if (packagingProducedTotals[pkg] !== undefined) {
        packagingProducedTotals[pkg] += p.packagedQty;
      } else {
        packagingProducedTotals[pkg] = p.packagedQty;
      }
    });

    monthOutflows.forEach((o) => {
      totalOutflow += o.quantity;

      const pkg = o.packagingType || 'botol';
      if (packagingOutflowTotals[pkg] !== undefined) {
        packagingOutflowTotals[pkg] += o.quantity;
      } else {
        packagingOutflowTotals[pkg] = o.quantity;
      }
    });

    // Generate Daily Breakdown (Day 1 to daysInMonth)
    const dailyLogs = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStart = new Date(year, month - 1, day, 0, 0, 0, 0);
      const dayEnd = new Date(year, month - 1, day, 23, 59, 59, 999);

      const dayProds = monthProductions.filter((p) => {
        const d = new Date(p.date);
        return d >= dayStart && d <= dayEnd;
      });

      const dayOuts = monthOutflows.filter((o) => {
        const d = new Date(o.date);
        return d >= dayStart && d <= dayEnd;
      });

      let dayRawLiters = 0;
      let dayProcessedLiters = 0;
      let dayPackaged = 0;
      let dayOutflow = 0;

      const dayPkgProd = { botol: 0, cup: 0, pack: 0 };
      const dayPkgOut = { botol: 0, cup: 0, pack: 0 };

      dayProds.forEach((p) => {
        dayRawLiters += p.rawVolumeLiters;
        dayProcessedLiters += p.processedLiters;
        dayPackaged += p.packagedQty;
        const pkg = p.packagingType || 'botol';
        dayPkgProd[pkg] = (dayPkgProd[pkg] || 0) + p.packagedQty;
      });

      dayOuts.forEach((o) => {
        dayOutflow += o.quantity;
        const pkg = o.packagingType || 'botol';
        dayPkgOut[pkg] = (dayPkgOut[pkg] || 0) + o.quantity;
      });

      dailyLogs.push({
        day,
        dateStr: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        rawVolumeLiters: dayRawLiters,
        processedLiters: dayProcessedLiters,
        packagedQty: dayPackaged,
        outflowQty: dayOutflow,
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
          totalRawLiters,
          totalProcessedLiters,
          totalPackaged,
          totalOutflow,
          netStockChange: totalPackaged - totalOutflow,
          packagingProducedTotals,
          packagingOutflowTotals,
        },
        dailyLogs,
      },
    });
  } catch (error) {
    console.error('GET /api/reports/monthly error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
