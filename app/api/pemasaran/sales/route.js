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
      productSubtype = 'Susu UHT',
      variant = 'Original',
      packagingType = 'Botol',
      quantity,
      unitPrice,
      notes,
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

    // 1. CALCULATE READY STOCK FOR THIS SPECIFIC PRODUCT
    const acceptedPackagings = await prisma.milkPackaging.findMany({
      where: { status: 'DITERIMA' },
    });

    let totalReceivedForProduct = 0;

    acceptedPackagings.forEach((pkg) => {
      const pCat = pkg.productCategory || 'Susu Segar';
      const pSub = pkg.productSubtype || pCat;

      let matchCat = false;
      if (productCategory === 'Susu Segar') {
        matchCat = pCat === 'Susu Segar' || (pCat === 'Susu' && !['Susu Rasa', 'Susu Berasa', 'Pasteurisasi'].includes(pSub));
      } else if (productCategory === 'Susu Olahan') {
        matchCat = pCat === 'Susu Olahan' || pCat === 'Yogurt' || pCat === 'Keju' || ['Susu Rasa', 'Susu Berasa', 'Pasteurisasi'].includes(pSub);
      } else {
        matchCat = pCat.toLowerCase() === productCategory.toLowerCase();
      }

      if (matchCat) {
        let items = [];
        if (pkg.packagingDetails) {
          try {
            const parsed = JSON.parse(pkg.packagingDetails);
            if (Array.isArray(parsed)) items = parsed;
          } catch (e) {}
        }

        const baseType = packagingType.split(' ')[0].toLowerCase();

        if (items.length > 0) {
          items.forEach((it) => {
            const itType = (it.packagingType || 'Botol').toLowerCase();
            const pkgMatch = itType.includes(baseType) || baseType.includes(itType);
            if (pkgMatch) {
              totalReceivedForProduct += parseInt(it.quantity, 10) || 0;
            }
          });
        } else {
          // Fallback legacy packaging
          const pkgTypeLow = (pkg.packagingType || 'Botol').toLowerCase();
          if (pkgTypeLow.includes(baseType) || baseType.includes(pkgTypeLow)) {
            totalReceivedForProduct += pkg.quantityReceived || pkg.totalPackagedQty || 0;
          }
        }
      }
    });

    // Query existing outflows & sales for this product
    const existingOutflows = await prisma.milkOutflow.findMany();
    const existingSales = await prisma.milkSale.findMany({
      where: { status: 'Berhasil' },
    });

    let totalOutflowForProduct = 0;
    const reqBaseType = packagingType.split(' ')[0].toLowerCase();

    existingOutflows.forEach((out) => {
      const outType = (out.packagingType || 'botol').toLowerCase();
      if (outType.includes(reqBaseType) || reqBaseType.includes(outType)) {
        totalOutflowForProduct += out.quantity || 0;
      }
    });

    existingSales.forEach((sale) => {
      const sCat = sale.productCategory || 'Susu Segar';
      const sSub = sale.productSubtype || sCat;
      let catMatch = false;

      if (productCategory === 'Susu Segar') {
        catMatch = sCat === 'Susu Segar' || (sCat === 'Susu' && !['Susu Rasa', 'Susu Berasa', 'Pasteurisasi'].includes(sSub));
      } else if (productCategory === 'Susu Olahan') {
        catMatch = sCat === 'Susu Olahan' || sCat === 'Yogurt' || sCat === 'Keju' || ['Susu Rasa', 'Susu Berasa', 'Pasteurisasi'].includes(sSub);
      } else {
        catMatch = sCat.toLowerCase() === productCategory.toLowerCase();
      }

      const salePkgType = (sale.packagingType || 'Botol').toLowerCase();
      const pkgMatch = salePkgType.includes(reqBaseType) || reqBaseType.includes(salePkgType);
      if (catMatch && pkgMatch) {
        totalOutflowForProduct += sale.quantity || 0;
      }
    });

    const readyStock = Math.max(0, totalReceivedForProduct - totalOutflowForProduct);

    // 2. CHECK STOCK AVAILABILITY
    if (qtyNum > readyStock) {
      const pSubDisplay = productSubtype || (productCategory === 'Susu Segar' ? 'Susu Segar' : productCategory);
      return NextResponse.json(
        {
          success: false,
          message: `Stok tidak mencukupi untuk melakukan penjualan.`,
          readyStock,
          requestedQty: qtyNum,
          productInfo: `${pSubDisplay} (${variant}) - ${packagingType}`,
        },
        { status: 400 }
      );
    }

    // 3. CREATE TRANSACTION & SAVE
    const dateObj = date ? new Date(date) : new Date();
    const dateStr = dateObj.toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const transactionId = `TRX-${dateStr}-${randSuffix}`;

    const totalPrice = qtyNum * priceNum;

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
        notes,
        createdById: createdById || null,
      },
    });

    // Also record in MilkOutflow for backward compatibility with stock APIs
    const category = await prisma.milkCategory.findFirst({
      where: {
        productType: productCategory === 'Susu' ? 'SEGAR' : 'OLAHAN',
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
          notes: `[Penjualan ${transactionId}] ${notes || ''}`,
          createdById: createdById || null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Penjualan berhasil disimpan dan stok telah diperbarui.',
      data: sale,
    });
  } catch (error) {
    console.error('POST /api/pemasaran/sales error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
