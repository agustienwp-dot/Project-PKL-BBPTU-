import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productType = searchParams.get('productType'); // SEGAR or OLAHAN

    const categoryWhere = {};
    if (productType) categoryWhere.productType = productType;

    const categories = await prisma.milkCategory.findMany({
      where: categoryWhere,
      orderBy: { name: 'asc' },
    });

    const stockSummary = await Promise.all(
      categories.map(async (cat) => {
        // Calculate ready stock per packagingType
        const prodGroup = await prisma.milkProduction.groupBy({
          by: ['packagingType'],
          where: { categoryId: cat.id },
          _sum: { packagedQty: true },
        });

        const outGroup = await prisma.milkOutflow.groupBy({
          by: ['packagingType'],
          where: { categoryId: cat.id },
          _sum: { quantity: true },
        });

        const packagingStockMap = {};

        // Process production
        prodGroup.forEach((item) => {
          const pkg = item.packagingType || 'botol';
          if (!packagingStockMap[pkg]) packagingStockMap[pkg] = { produced: 0, outflow: 0, ready: 0 };
          packagingStockMap[pkg].produced += item._sum.packagedQty || 0;
        });

        // Process outflow
        outGroup.forEach((item) => {
          const pkg = item.packagingType || 'botol';
          if (!packagingStockMap[pkg]) packagingStockMap[pkg] = { produced: 0, outflow: 0, ready: 0 };
          packagingStockMap[pkg].outflow += item._sum.quantity || 0;
        });

        // Compute ready per packaging
        let totalProduced = 0;
        let totalOutflow = 0;
        Object.keys(packagingStockMap).forEach((pkg) => {
          const data = packagingStockMap[pkg];
          data.ready = Math.max(0, data.produced - data.outflow);
          totalProduced += data.produced;
          totalOutflow += data.outflow;
        });

        const readyStock = Math.max(0, totalProduced - totalOutflow);

        return {
          category: cat,
          productType: cat.productType,
          totalProduced,
          totalOutflow,
          readyStock,
          defaultPackaging: cat.defaultPackaging,
          packagingBreakdown: packagingStockMap,
        };
      })
    );

    const totalReadyStock = stockSummary.reduce((acc, curr) => acc + curr.readyStock, 0);

    // Packaging aggregations for Olahan (Cup, Pack, Botol)
    const packagingTotals = { cup: 0, pack: 0, botol: 0 };
    stockSummary.forEach((s) => {
      Object.keys(s.packagingBreakdown).forEach((pkg) => {
        if (packagingTotals[pkg] !== undefined) {
          packagingTotals[pkg] += s.packagingBreakdown[pkg].ready;
        } else {
          packagingTotals[pkg] = s.packagingBreakdown[pkg].ready;
        }
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        totalReadyStock,
        packagingTotals,
        categories: stockSummary,
      },
    });
  } catch (error) {
    console.error('GET /api/pemasaran/stock error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
