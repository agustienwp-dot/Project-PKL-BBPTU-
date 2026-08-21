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
    if (!authUser || (authUser.role !== 'ADMIN_PEMASARAN' && authUser.role !== 'SUPERADMIN')) {
      return NextResponse.json({ success: false, message: 'Akses ditolak: Hanya Admin Pemasaran atau Superadmin yang dapat menginput pengeluaran stok' }, { status: 403 });
    }

    const { date, categoryId, productType, packagingType, quantity, notes } = await request.json();

    if (!categoryId || !quantity || parseInt(quantity, 10) <= 0) {
      return NextResponse.json({ success: false, message: 'Kategori produk dan jumlah pengeluaran valid (lebih dari 0) wajib diisi' }, { status: 400 });
    }

    const qtyNumber = parseInt(quantity, 10);

    const category = await prisma.milkCategory.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json({ success: false, message: 'Kategori produk tidak ditemukan' }, { status: 404 });
    }

    const pType = productType || category.productType || 'SEGAR';
    const pkgType = packagingType || category.defaultPackaging || 'botol';

    // Check available ready stock for this category AND packagingType
    const productionSum = await prisma.milkProduction.aggregate({
      where: {
        categoryId,
        packagingType: pkgType,
      },
      _sum: { packagedQty: true },
    });

    const outflowSum = await prisma.milkOutflow.aggregate({
      where: {
        categoryId,
        packagingType: pkgType,
      },
      _sum: { quantity: true },
    });

    const totalProduced = productionSum._sum.packagedQty || 0;
    const totalOutflow = outflowSum._sum.quantity || 0;
    const availableStock = totalProduced - totalOutflow;

    if (qtyNumber > availableStock) {
      return NextResponse.json({
        success: false,
        message: `Stok tidak mencukupi! Stok ready ${category.name} kemasan ${pkgType} saat ini hanya ${availableStock} ${pkgType}, tidak dapat mengeluarkan ${qtyNumber} ${pkgType}.`,
      }, { status: 400 });
    }

    const validUserId = await resolveValidUserId(authUser);

    const outflow = await prisma.milkOutflow.create({
      data: {
        date: date ? new Date(date) : new Date(),
        categoryId,
        productType: pType,
        packagingType: pkgType,
        quantity: qtyNumber,
        notes: notes || '',
        createdById: validUserId,
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
        details: `Input produk keluar ${pType} ${category.name} (${pkgType}): ${qtyNumber} ${pkgType}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Pengeluaran ${qtyNumber} ${pkgType} ${category.name} berhasil dicatat. Stok otomatis berkurang.`,
      data: outflow,
    });
  } catch (error) {
    console.error('POST /api/pemasaran/outflow error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

