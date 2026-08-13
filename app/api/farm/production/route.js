import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

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

    const productions = await prisma.milkProduction.findMany({
      where,
      include: {
        category: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ success: true, data: productions });
  } catch (error) {
    console.error('GET /api/farm/production error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (authUser.role !== 'ADMIN_FARM' && authUser.role !== 'SUPERADMIN')) {
      return NextResponse.json({ success: false, message: 'Akses ditolak: Hanya Admin Farm atau Superadmin yang dapat menginput produksi' }, { status: 403 });
    }

    const { date, categoryId, productType, packagingType, rawVolumeLiters, processedLiters, packagedQty, notes } = await request.json();

    if (!categoryId) {
      return NextResponse.json({ success: false, message: 'Kategori susu wajib dipilih' }, { status: 400 });
    }

    const category = await prisma.milkCategory.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json({ success: false, message: 'Kategori susu tidak ditemukan' }, { status: 404 });
    }

    const pType = productType || category.productType || 'SEGAR';
    const pkgType = packagingType || category.defaultPackaging || 'botol';

    const production = await prisma.milkProduction.create({
      data: {
        date: date ? new Date(date) : new Date(),
        categoryId,
        productType: pType,
        packagingType: pkgType,
        rawVolumeLiters: parseFloat(rawVolumeLiters) || 0,
        processedLiters: parseFloat(processedLiters) || 0,
        packagedQty: parseInt(packagedQty, 10) || 0,
        notes: notes || '',
        createdById: authUser.id,
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
        userId: authUser.id,
        userEmail: authUser.email,
        action: 'CREATE_PRODUCTION',
        details: `Input produksi ${pType} ${category.name}: ${rawVolumeLiters || 0} L, dikemas ${packagedQty || 0} ${pkgType}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Data produksi ${pType} (${pkgType}) berhasil disimpan dan masuk ke stok sistem`,
      data: production,
    });
  } catch (error) {
    console.error('POST /api/farm/production error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
