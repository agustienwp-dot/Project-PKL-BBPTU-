import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/pemasaran/reports
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const periodType = searchParams.get('periodType') || 'HARIAN'; // "HARIAN" or "BULANAN"
    const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const monthStr = searchParams.get('month') || (new Date().getMonth() + 1).toString();
    const yearStr = searchParams.get('year') || new Date().getFullYear().toString();

    let startDate, endDate, periodLabel;

    if (periodType === 'HARIAN') {
      startDate = new Date(dateStr);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(dateStr);
      endDate.setHours(23, 59, 59, 999);

      periodLabel = startDate.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } else {
      const m = parseInt(monthStr, 10) - 1;
      const y = parseInt(yearStr, 10);
      startDate = new Date(y, m, 1, 0, 0, 0);
      endDate = new Date(y, m + 1, 0, 23, 59, 59, 999);

      periodLabel = startDate.toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric',
      });
    }

    const sales = await prisma.milkSale.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        status: 'Berhasil',
      },
      orderBy: { date: 'desc' },
      include: {
        createdBy: { select: { name: true } },
      },
    });

    const totalTransactions = sales.length;
    const totalUnitsSold = sales.reduce((acc, s) => acc + (s.quantity || 0), 0);
    const totalRevenue = sales.reduce((acc, s) => acc + (s.totalPrice || 0), 0);

    // Grouping by product for top & lowest selling
    const productStats = {};
    sales.forEach((s) => {
      const pName = `${s.productSubtype || s.productCategory} (${s.variant || 'Original'}) - ${s.packagingType}`;
      if (!productStats[pName]) {
        productStats[pName] = { name: pName, units: 0, revenue: 0 };
      }
      productStats[pName].units += s.quantity || 0;
      productStats[pName].revenue += s.totalPrice || 0;
    });

    const sortedProducts = Object.values(productStats).sort((a, b) => b.units - a.units);
    const topProduct = sortedProducts.length > 0 ? sortedProducts[0] : null;
    const lowestProduct = sortedProducts.length > 0 ? sortedProducts[sortedProducts.length - 1] : null;

    // Table rows aggregation
    const tableData = sales.map((s) => ({
      id: s.id,
      transactionId: s.transactionId,
      date: s.date,
      dateFormatted: new Date(s.date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      productCategory: s.productCategory,
      productName: `${s.productSubtype || s.productCategory} (${s.variant || 'Original'})`,
      packagingType: s.packagingType,
      quantity: s.quantity,
      unitPrice: s.unitPrice,
      totalPrice: s.totalPrice,
      status: s.status,
    }));

    return NextResponse.json({
      success: true,
      data: {
        periodType,
        periodLabel,
        totalTransactions,
        totalUnitsSold,
        totalRevenue,
        topProduct,
        lowestProduct,
        productBreakdown: sortedProducts,
        tableData,
      },
    });
  } catch (error) {
    console.error('GET /api/pemasaran/reports error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
