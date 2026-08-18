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

    // Query all RECEIVED packaging records from farm
    const acceptedPackagings = await prisma.milkPackaging.findMany({
      where: {
        status: 'DITERIMA',
      },
    });

    // Query all outflows
    const outflows = await prisma.milkOutflow.findMany();

    const stockSummary = await Promise.all(
      categories.map(async (cat) => {
        const packagingStockMap = {};

        // Aggregate accepted packagings for this category or matching category name
        acceptedPackagings.forEach((pkg) => {
          // If categoryId matches OR productCategory matches
          const matchCat = pkg.categoryId === cat.id || 
            (cat.productType === 'SEGAR' && (pkg.productCategory === 'Susu' || pkg.productCategory === 'Susu Segar')) ||
            (cat.productType === 'OLAHAN' && (pkg.productCategory === 'Susu Olahan' || pkg.productCategory === 'Yogurt' || pkg.productCategory === 'Keju' || pkg.productSubtype === 'Susu Rasa' || pkg.productSubtype === 'Susu Berasa' || pkg.productSubtype === 'Pasteurisasi'));

          if (matchCat) {
            // Check details or fallback to botol/cup/plastikBantal
            let items = [];
            if (pkg.packagingDetails) {
              try {
                const parsed = JSON.parse(pkg.packagingDetails);
                if (Array.isArray(parsed)) items = parsed;
              } catch (e) {}
            }

            if (items.length > 0) {
              items.forEach((it) => {
                const key = (it.packagingType || 'botol').toLowerCase();
                if (!packagingStockMap[key]) packagingStockMap[key] = { produced: 0, outflow: 0, ready: 0 };
                packagingStockMap[key].produced += parseInt(it.quantity, 10) || 0;
              });
            } else {
              const b = pkg.botolQty || 0;
              const c = pkg.cupQty || 0;
              const p = pkg.plastikBantalQty || 0;
              if (b > 0) {
                if (!packagingStockMap['botol']) packagingStockMap['botol'] = { produced: 0, outflow: 0, ready: 0 };
                packagingStockMap['botol'].produced += b;
              }
              if (c > 0) {
                if (!packagingStockMap['cup']) packagingStockMap['cup'] = { produced: 0, outflow: 0, ready: 0 };
                packagingStockMap['cup'].produced += c;
              }
              if (p > 0) {
                if (!packagingStockMap['pack']) packagingStockMap['pack'] = { produced: 0, outflow: 0, ready: 0 };
                packagingStockMap['pack'].produced += p;
              }
            }
          }
        });

        // Aggregate outflow
        outflows.forEach((out) => {
          if (out.categoryId === cat.id) {
            const key = (out.packagingType || 'botol').toLowerCase();
            if (!packagingStockMap[key]) packagingStockMap[key] = { produced: 0, outflow: 0, ready: 0 };
            packagingStockMap[key].outflow += out.quantity || 0;
          }
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

    // Also calculate global received totals for ALL DITERIMA packaging entries
    let globalAcceptedQty = 0;
    const globalPackagingTotals = { cup: 0, pack: 0, botol: 0 };

    acceptedPackagings.forEach((pkg) => {
      const rec = pkg.quantityReceived || pkg.totalPackagedQty || 0;
      globalAcceptedQty += rec;

      let items = [];
      if (pkg.packagingDetails) {
        try {
          const parsed = JSON.parse(pkg.packagingDetails);
          if (Array.isArray(parsed)) items = parsed;
        } catch (e) {}
      }

      if (items.length > 0) {
        items.forEach((it) => {
          const t = (it.packagingType || '').toLowerCase();
          const q = parseInt(it.quantity, 10) || 0;
          if (t.includes('cup')) globalPackagingTotals.cup += q;
          else if (t.includes('bantal') || t.includes('pack')) globalPackagingTotals.pack += q;
          else globalPackagingTotals.botol += q;
        });
      } else {
        globalPackagingTotals.botol += pkg.botolQty || 0;
        globalPackagingTotals.cup += pkg.cupQty || 0;
        globalPackagingTotals.pack += pkg.plastikBantalQty || 0;
      }
    });

    // Subtract global outflows
    outflows.forEach((out) => {
      const t = (out.packagingType || '').toLowerCase();
      const q = out.quantity || 0;
      if (t.includes('cup')) globalPackagingTotals.cup = Math.max(0, globalPackagingTotals.cup - q);
      else if (t.includes('pack') || t.includes('bantal')) globalPackagingTotals.pack = Math.max(0, globalPackagingTotals.pack - q);
      else globalPackagingTotals.botol = Math.max(0, globalPackagingTotals.botol - q);
    });

    const totalOutflowGlobal = outflows.reduce((sum, o) => sum + (o.quantity || 0), 0);
    const totalReadyStock = Math.max(0, globalAcceptedQty - totalOutflowGlobal);

    return NextResponse.json({
      success: true,
      data: {
        totalReadyStock,
        packagingTotals: globalPackagingTotals,
        categories: stockSummary,
      },
    });
  } catch (error) {
    console.error('GET /api/pemasaran/stock error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
