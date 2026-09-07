import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/pemasaran/sales
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('search') || '';
    const productCategory = searchParams.get('productCategory') || '';
    const date = searchParams.get('date') || '';
    const periodType = searchParams.get('periodType') || ''; // "HARIAN" or "BULANAN"
    const month = searchParams.get('month'); // 1-12
    const year = searchParams.get('year'); // e.g. 2026

    const where = {};

    if (productCategory) {
      where.productCategory = productCategory;
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      where.date = { gte: startDate, lte: endDate };
    } else if (periodType === 'BULANAN' && month && year) {
      const m = parseInt(month, 10) - 1;
      const y = parseInt(year, 10);
      const startDate = new Date(y, m, 1, 0, 0, 0);
      const endDate = new Date(y, m + 1, 0, 23, 59, 59, 999);
      where.date = { gte: startDate, lte: endDate };
    }

    if (searchQuery) {
      where.OR = [
        { transactionId: { contains: searchQuery } },
        { productCategory: { contains: searchQuery } },
        { productSubtype: { contains: searchQuery } },
        { variant: { contains: searchQuery } },
        { notes: { contains: searchQuery } },
      ];
    }

    const sales = await prisma.milkSale.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: sales,
    });
  } catch (error) {
    console.error('GET /api/pemasaran/sales error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/pemasaran/sales
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      date,
      productCategory = 'Susu',
      productSubtype = 'Susu Pasteurisasi',
      variant = 'Original',
      packagingType = 'Botol',
      size,
      quantity,
      unitPrice,
      notes = '',
      createdById,
    } = body;

    const qtyNum = parseInt(quantity, 10) || 0;
    const priceNum = parseFloat(unitPrice) || 0;

    if (!productCategory || qtyNum <= 0) {
      return NextResponse.json(
        { success: false, message: 'Jumlah penjualan harus lebih dari 0 pcs' },
        { status: 400 }
      );
    }

    if (priceNum < 0) {
      return NextResponse.json(
        { success: false, message: 'Harga satuan tidak boleh bernilai negatif' },
        { status: 400 }
      );
    }

    // Determine target size e.g. "250 ml", "115 ml", "130 ml", "200 ml"
    let targetSize = (size || '').trim();
    if (!targetSize && notes) {
      const match = notes.match(/Ukuran:\s*([0-9]+\s*(?:ml|liter|g|gram|kg))/i);
      if (match) targetSize = match[1].trim();
    }

    const normCat = productCategory.toLowerCase();
    const normSub = (productSubtype || '').toLowerCase();
    const normPkg = (packagingType || 'Botol').toLowerCase();
    const normSize = targetSize.toLowerCase();

    // 1. CALCULATE RECEIVED STOCK FROM MilkPackaging (includes MENUNGGU_PENERIMAAN, SELESAI, DITERIMA)
    const packagings = await prisma.milkPackaging.findMany({
      where: {
        status: { in: ['DITERIMA', 'SELESAI', 'MENUNGGU_PENERIMAAN'] }
      }
    });

    let totalReceivedForProduct = 0;

    packagings.forEach((pkg) => {
      const pkgCat = (pkg.productCategory || 'Susu').toLowerCase();
      const pkgSub = (pkg.productSubtype || '').toLowerCase();

      // Product match check
      const catMatch = pkgCat.includes(normCat) || normCat.includes(pkgCat) ||
                       (normSub && pkgSub.includes(normSub));

      if (catMatch) {
        let items = [];
        if (pkg.packagingDetails) {
          try {
            const parsed = JSON.parse(pkg.packagingDetails);
            if (Array.isArray(parsed)) items = parsed;
          } catch (e) {}
        }

        if (items.length > 0) {
          items.forEach((it) => {
            const itPkg = (it.packagingType || 'Botol').toLowerCase();
            const itSz = (it.size || '').toLowerCase().trim();

            const pkgMatch = itPkg === normPkg || normPkg.includes(itPkg) || itPkg.includes(normPkg);
            const sizeMatch = !normSize || itSz === normSize || itSz.includes(normSize) || normSize.includes(itSz);

            if (pkgMatch && sizeMatch) {
              totalReceivedForProduct += parseInt(it.quantity, 10) || 0;
            }
          });
        } else {
          const pkgTypeLow = (pkg.packagingType || 'Botol').toLowerCase();
          const pkgSizeLow = (pkg.packageSize || '').toLowerCase().trim();
          const pkgMatch = pkgTypeLow === normPkg;
          const sizeMatch = !normSize || !pkgSizeLow || pkgSizeLow === normSize;

          if (pkgMatch && sizeMatch) {
            totalReceivedForProduct += pkg.quantityReceived || pkg.totalPackagedQty || 0;
          }
        }
      }
    });

    // 2. CALCULATE OUTFLOWS & SALES FOR THIS PRODUCT & SIZE
    const existingOutflows = await prisma.milkOutflow.findMany();
    const existingSales = await prisma.milkSale.findMany({
      where: { status: { not: 'Dibatalkan' } },
    });

    let totalOutflowForProduct = 0;

    existingSales.forEach((sale) => {
      const saleCat = (sale.productCategory || 'Susu').toLowerCase();
      const saleSub = (sale.productSubtype || '').toLowerCase();
      const salePkg = (sale.packagingType || 'Botol').toLowerCase();
      const saleNotes = (sale.notes || '').toLowerCase();

      const catMatch = saleCat.includes(normCat) || normCat.includes(saleCat) ||
                       (normSub && saleSub.includes(normSub));
      const pkgMatch = salePkg === normPkg;
      const sizeMatch = !normSize || saleNotes.includes(normSize);

      if (catMatch && pkgMatch && sizeMatch) {
        totalOutflowForProduct += sale.quantity || 0;
      }
    });

    existingOutflows.forEach((out) => {
      const outPkg = (out.packagingType || 'botol').toLowerCase();
      const outNotes = (out.notes || '').toLowerCase();

      const pkgMatch = outPkg === normPkg || outPkg === 'botol';
      const sizeMatch = !normSize || outNotes.includes(normSize);

      let prodMatch = true;
      if (normCat.includes('yogurt') && !outNotes.includes('yogurt') && (out.productType || '').toLowerCase() === 'segar') {
        prodMatch = false;
      }

      if (pkgMatch && sizeMatch && prodMatch) {
        totalOutflowForProduct += out.quantity || 0;
      }
    });

    const readyStock = Math.max(0, totalReceivedForProduct - totalOutflowForProduct);

    // 3. STOCK WARNING (DO NOT HARD BLOCK TRANSACTION FOR REPORT INTAKE)
    let stockWarning = null;
    if (qtyNum > readyStock) {
      const displayProd = productSubtype || productCategory;
      const displaySize = targetSize ? ` ${targetSize}` : '';
      stockWarning = `⚠ Stok ${displayProd}${displaySize} saat ini terbaca ${readyStock} botol. Transaksi tetap dicatat ke laporan.`;
    }

    // 4. CREATE TRANSACTION & SAVE
    const dateObj = date ? new Date(date) : new Date();
    const dateStr = dateObj.toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const transactionId = `TRX-${dateStr}-${randSuffix}`;

    const totalPrice = qtyNum * priceNum;

    // Combine size in notes if size provided
    let finalNotes = notes;
    if (targetSize && !finalNotes.includes(targetSize)) {
      finalNotes = `Ukuran: ${targetSize}. ${finalNotes}`.trim();
    }

    const sale = await prisma.milkSale.create({
      data: {
        transactionId,
        date: dateObj,
        productCategory,
        productSubtype: productSubtype || productCategory,
        variant,
        packagingType,
        quantity: qtyNum,
        unitPrice: priceNum,
        totalPrice,
        status: 'Berhasil',
        notes: finalNotes,
        createdById: createdById || null,
      },
    });

    // Also record in MilkOutflow for backward compatibility
    const category = await prisma.milkCategory.findFirst({
      where: {
        productType: productCategory === 'Yogurt' ? 'OLAHAN' : 'SEGAR',
      },
    });

    if (category) {
      await prisma.milkOutflow.create({
        data: {
          date: dateObj,
          categoryId: category.id,
          productType: category.productType,
          animalType: category.animalType,
          packagingType: packagingType.toLowerCase(),
          quantity: qtyNum,
          notes: `[Penjualan ${transactionId}] ${finalNotes}`,
          createdById: createdById || null,
        },
      });
    }

    const successMsg = stockWarning
      ? `Penjualan berhasil disimpan! ${stockWarning}`
      : 'Penjualan berhasil disimpan dan stok telah diperbarui.';

    return NextResponse.json({
      success: true,
      message: successMsg,
      warning: stockWarning,
      data: sale,
    });
  } catch (error) {
    console.error('POST /api/pemasaran/sales error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
