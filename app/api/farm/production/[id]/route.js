import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (authUser.role !== 'ADMIN_FARM' && authUser.role !== 'SUPERADMIN')) {
      return NextResponse.json({ success: false, message: 'Akses ditolak' }, { status: 403 });
    }

    const { id } = params;
    const { date, categoryId, productType, animalType, packagingType, grossVolumeLiters, pedetVolumeLiters, afkirVolumeLiters, usageType, usageVolumeLiters, rawVolumeLiters, processedLiters, packagedQty, notes } = await request.json();

    const existing = await prisma.milkProduction.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Data produksi tidak ditemukan' }, { status: 404 });
    }

    const grossVal = grossVolumeLiters !== undefined ? parseFloat(grossVolumeLiters) || 0 : (existing.grossVolumeLiters || existing.rawVolumeLiters || 0);
    const pedetVal = pedetVolumeLiters !== undefined ? parseFloat(pedetVolumeLiters) || 0 : (existing.pedetVolumeLiters || 0);
    const afkirVal = afkirVolumeLiters !== undefined ? parseFloat(afkirVolumeLiters) || 0 : (existing.afkirVolumeLiters || 0);
    const totalUsage = pedetVal + afkirVal;

    const aType = animalType || existing.animalType || 'SAPI';
    const feedLabel = aType === 'KAMBING' ? 'Cempe' : 'Pedet';
    let summaryUsage = usageType !== undefined ? usageType : existing.usageType;
    if (!summaryUsage || usageType === undefined) {
      const parts = [];
      if (pedetVal > 0) parts.push(`${feedLabel}: ${pedetVal}L`);
      if (afkirVal > 0) parts.push(`Afkir: ${afkirVal}L`);
      summaryUsage = parts.join(', ');
    }

    const netVolume = Math.max(0, grossVal - totalUsage);
    const finalProcessed = processedLiters !== undefined ? parseFloat(processedLiters) || netVolume : netVolume;

    const updated = await prisma.milkProduction.update({
      where: { id },
      data: {
        date: date ? new Date(date) : existing.date,
        categoryId: categoryId !== undefined ? categoryId : existing.categoryId,
        productType: productType !== undefined ? productType : existing.productType,
        animalType: animalType !== undefined ? animalType : existing.animalType,
        packagingType: packagingType !== undefined ? packagingType : existing.packagingType,
        grossVolumeLiters: grossVal,
        pedetVolumeLiters: pedetVal,
        afkirVolumeLiters: afkirVal,
        usageType: summaryUsage || null,
        usageVolumeLiters: totalUsage,
        rawVolumeLiters: netVolume,
        processedLiters: finalProcessed,
        packagedQty: packagedQty !== undefined ? parseInt(packagedQty, 10) : Math.round(netVolume),
        notes: notes !== undefined ? notes : existing.notes,
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
        action: 'UPDATE_PRODUCTION',
        details: `Memperbarui data produksi (ID: ${id})`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Data produksi berhasil diperbarui',
      data: updated,
    });
  } catch (error) {
    console.error('PUT /api/farm/production/[id] error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (authUser.role !== 'ADMIN_FARM' && authUser.role !== 'SUPERADMIN')) {
      return NextResponse.json({ success: false, message: 'Akses ditolak' }, { status: 403 });
    }

    const { id } = params;

    const existing = await prisma.milkProduction.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Data produksi tidak ditemukan' }, { status: 404 });
    }

    await prisma.milkProduction.delete({ where: { id } });

    await prisma.systemLog.create({
      data: {
        userId: authUser.id,
        userEmail: authUser.email,
        action: 'DELETE_PRODUCTION',
        details: `Menghapus data produksi (ID: ${id})`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Data produksi berhasil dihapus.',
    });
  } catch (error) {
    console.error('DELETE /api/farm/production/[id] error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
