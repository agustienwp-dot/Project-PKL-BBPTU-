import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, resolveValidUserId } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const productType = searchParams.get('productType');
    const date = searchParams.get('date');

    const where = {};
    if (categoryId) where.categoryId = categoryId;
    if (productType) where.productType = productType;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const outflows = await prisma.milkOutflow.findMany({
      where,
      include: {
        category: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ success: true, data: outflows });
  } catch (error) {
    console.error('GET /api/pemasaran/outflow error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (authUser.role !== 'ADMIN_PEMASARAN' && authUser.role !== 'SUPERADMIN' && authUser.role !== 'ADMIN_PENGEMASAN')) {
      return NextResponse.json({ success: false, message: 'Akses ditolak: Hanya Admin Pemasaran, Admin Pengemasan, atau Superadmin yang dapat menginput pengeluaran stok' }, { status: 403 });
    }

    const { date, categoryId, productType, packagingType, quantity, notes } = await request.json();

    if (!quantity || parseInt(quantity, 10) <= 0) {
      return NextResponse.json({ success: false, message: 'Jumlah pengeluaran valid (lebih dari 0) wajib diisi' }, { status: 400 });
    }

    let targetCategoryId = categoryId;
    if (!targetCategoryId) {
      const defaultCat = await prisma.milkCategory.findFirst();
      if (defaultCat) targetCategoryId = defaultCat.id;
    }

    if (!targetCategoryId) {
      return NextResponse.json({ success: false, message: 'Kategori produk tidak ditemukan' }, { status: 400 });
    }

    const qtyNumber = parseInt(quantity, 10);

    const category = await prisma.milkCategory.findUnique({ where: { id: targetCategoryId } });
    if (!category) {
      return NextResponse.json({ success: false, message: 'Kategori produk tidak ditemukan' }, { status: 404 });
    }

    const pType = productType || category.productType || 'SEGAR';
    const pkgType = packagingType || category.defaultPackaging || 'botol';
    const noteStr = notes || '';

    // Determine target size e.g. "250 ml", "115 ml", "130 ml", "200 ml"
    let targetSize = '';
    const match = noteStr.match(/Ukuran:\s*([0-9]+\s*(?:ml|liter|g|gram|kg))/i) ||
                  noteStr.match(/([0-9]+\s*(?:ml|liter|g|gram|kg))/i);
    if (match) targetSize = match[1].trim().toLowerCase();

    const normPkg = pkgType.toLowerCase();
    const normType = pType.toLowerCase();

    // Calculate ready stock for this product & size from MilkPackaging
    const packagings = await prisma.milkPackaging.findMany({
      where: { status: { in: ['DITERIMA', 'SELESAI', 'MENUNGGU_PENERIMAAN'] } }
    });

    let totalReceived = 0;
    packagings.forEach((pkg) => {
      let items = [];
      if (pkg.packagingDetails) {
        try {
          const parsed = JSON.parse(pkg.packagingDetails);
          if (Array.isArray(parsed)) items = parsed;
        } catch (e) {}
      }

      if (items.length > 0) {
        items.forEach((it) => {
          const itPkg = (it.packagingType || 'botol').toLowerCase();
          const itSz = (it.size || '').toLowerCase().trim();

          const pkgMatch = itPkg === normPkg || normPkg.includes(itPkg) || itPkg.includes(normPkg);
          const sizeMatch = !targetSize || itSz === targetSize || itSz.includes(targetSize) || targetSize.includes(itSz);

          if (pkgMatch && sizeMatch) {
            totalReceived += parseInt(it.quantity, 10) || 0;
          }
        });
      } else {
        const pkgTypeLow = (pkg.packagingType || 'botol').toLowerCase();
        const pkgSizeLow = (pkg.packageSize || '').toLowerCase().trim();
        const pkgMatch = pkgTypeLow === normPkg;
        const sizeMatch = !targetSize || !pkgSizeLow || pkgSizeLow === targetSize;

        if (pkgMatch && sizeMatch) {
          totalReceived += pkg.quantityReceived || pkg.totalPackagedQty || 0;
        }
      }
    });

    // Calculate total outflows & sales for this product & size
    const existingOutflows = await prisma.milkOutflow.findMany();
    const existingSales = await prisma.milkSale.findMany({ where: { status: { not: 'Dibatalkan' } } });

    let totalOutflow = 0;

    existingSales.forEach((sale) => {
      const salePkg = (sale.packagingType || 'botol').toLowerCase();
      const saleNotes = (sale.notes || '').toLowerCase();
      const pkgMatch = salePkg === normPkg;
      const sizeMatch = !targetSize || saleNotes.includes(targetSize);

      if (pkgMatch && sizeMatch) {
        totalOutflow += sale.quantity || 0;
      }
    });

    existingOutflows.forEach((out) => {
      const outPkg = (out.packagingType || 'botol').toLowerCase();
      const outNotes = (out.notes || '').toLowerCase();
      const pkgMatch = outPkg === normPkg || outPkg === 'botol';
      const sizeMatch = !targetSize || outNotes.includes(targetSize);

      if (pkgMatch && sizeMatch) {
        totalOutflow += out.quantity || 0;
      }
    });

    const availableStock = Math.max(0, totalReceived - totalOutflow);

    let stockWarning = null;
    if (qtyNumber > availableStock) {
      const sizeDisplay = targetSize ? ` ${targetSize}` : '';
      stockWarning = `⚠ Stok ${category.name}${sizeDisplay} saat ini terbaca ${availableStock} botol. Transaksi tetap dicatat ke laporan.`;
    }

    const validUserId = await resolveValidUserId(authUser);

    const outflow = await prisma.milkOutflow.create({
      data: {
        date: date ? new Date(date) : new Date(),
        categoryId: targetCategoryId,
        productType: pType,
        animalType: category.animalType,
        packagingType: pkgType,
        quantity: qtyNumber,
        notes: noteStr || notes || '',
        createdById: validUserId || authUser.id,
      },
      include: {
        category: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    await prisma.systemLog.create({
      data: {
        userId: validUserId,
        userEmail: authUser.email,
        action: 'CREATE_OUTFLOW',
        details: `Input produk keluar ${pType} ${category.name} (${pkgType}): ${qtyNumber}`,
      },
    });

    const successMsg = stockWarning
      ? `Pengeluaran stok berhasil dicatat! ${stockWarning}`
      : `Pengeluaran ${qtyNumber} ${pkgType} ${category.name} berhasil dicatat.`;

    return NextResponse.json({
      success: true,
      message: successMsg,
      warning: stockWarning,
      data: outflow,
    });
  } catch (error) {
    console.error('POST /api/pemasaran/outflow error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

