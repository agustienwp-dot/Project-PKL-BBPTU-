import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const productType = searchParams.get('productType');
    const animalType = searchParams.get('animalType');
    const date = searchParams.get('date');

    const where = {};
    if (categoryId) where.categoryId = categoryId;
    if (productType) where.productType = productType;
    if (animalType) where.animalType = animalType;
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

    const { date, categoryId, productType, animalType, packagingType, grossVolumeLiters, pedetVolumeLiters, afkirVolumeLiters, usageType, usageVolumeLiters, rawVolumeLiters, processedLiters, packagedQty, notes } = await request.json();

    if (!categoryId) {
      return NextResponse.json({ success: false, message: 'Kategori susu wajib dipilih' }, { status: 400 });
    }

    const category = await prisma.milkCategory.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json({ success: false, message: 'Kategori susu tidak ditemukan' }, { status: 404 });
    }

    const pType = productType || category.productType || 'SEGAR';
    const aType = animalType || category.animalType || 'SAPI';
    const pkgType = packagingType || category.defaultPackaging || 'botol';

    const grossVal = grossVolumeLiters !== undefined ? parseFloat(grossVolumeLiters) || 0 : (parseFloat(rawVolumeLiters) || 0);
    const pedetVal = parseFloat(pedetVolumeLiters) || 0;
    const afkirVal = parseFloat(afkirVolumeLiters) || 0;
    const totalUsage = pedetVal + afkirVal;

    const feedLabel = aType === 'KAMBING' ? 'Cempe' : 'Pedet';
    let summaryUsage = usageType || '';
    if (!summaryUsage) {
      const parts = [];
      if (pedetVal > 0) parts.push(`${feedLabel}: ${pedetVal}L`);
      if (afkirVal > 0) parts.push(`Afkir: ${afkirVal}L`);
      summaryUsage = parts.join(', ');
    }

    const netVolume = Math.max(0, grossVal - totalUsage);
    const finalProcessed = processedLiters !== undefined ? parseFloat(processedLiters) || netVolume : netVolume;

    const production = await prisma.milkProduction.create({
      data: {
        date: date ? new Date(date) : new Date(),
        categoryId,
        productType: pType,
        animalType: aType,
        packagingType: pkgType,
        grossVolumeLiters: grossVal,
        pedetVolumeLiters: pedetVal,
        afkirVolumeLiters: afkirVal,
        usageType: summaryUsage || null,
        usageVolumeLiters: totalUsage,
        rawVolumeLiters: netVolume,
        processedLiters: finalProcessed,
        packagedQty: parseInt(packagedQty, 10) || Math.round(netVolume),
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

    const usageDetail = summaryUsage ? ` (Potongan: ${summaryUsage})` : '';

    await prisma.systemLog.create({
      data: {
        userId: authUser.id,
        userEmail: authUser.email,
        action: 'CREATE_PRODUCTION',
        details: `Produksi susu ${aType} (${pType}) ${category.name}: Gross ${grossVal} L${usageDetail} -> Susu siap olah: ${netVolume} L`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Produksi susu ${aType === 'KAMBING' ? 'Kambing' : 'Sapi'} berhasil disimpan! (Susu siap olah: ${netVolume} Liter)`,
      data: production,
    });
  } catch (error) {
    console.error('POST /api/farm/production error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
