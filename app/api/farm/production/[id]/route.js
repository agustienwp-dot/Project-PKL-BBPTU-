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
    const { date, categoryId, productType, animalType, packagingType, rawVolumeLiters, processedLiters, packagedQty, notes } = await request.json();

    const existing = await prisma.milkProduction.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Data produksi tidak ditemukan' }, { status: 404 });
    }

    const updated = await prisma.milkProduction.update({
      where: { id },
      data: {
        date: date ? new Date(date) : existing.date,
        categoryId: categoryId !== undefined ? categoryId : existing.categoryId,
        productType: productType !== undefined ? productType : existing.productType,
        animalType: animalType !== undefined ? animalType : existing.animalType,
        packagingType: packagingType !== undefined ? packagingType : existing.packagingType,
        rawVolumeLiters: rawVolumeLiters !== undefined ? parseFloat(rawVolumeLiters) : existing.rawVolumeLiters,
        processedLiters: processedLiters !== undefined ? parseFloat(processedLiters) : existing.processedLiters,
        packagedQty: packagedQty !== undefined ? parseInt(packagedQty, 10) : existing.packagedQty,
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
