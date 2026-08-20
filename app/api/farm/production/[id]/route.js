import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, resolveValidUserId } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const item = await prisma.milkProduction.findUnique({
      where: { id },
      include: {
        category: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!item) {
      const memMatch = (global.__inMemoryProductionList || []).find((i) => i.id === id);
      if (memMatch) {
        return NextResponse.json({ success: true, data: memMatch });
      }
      return NextResponse.json({ success: false, message: 'Data produksi tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('GET /api/farm/production/[id] error:', error);
    const memMatch = (global.__inMemoryProductionList || []).find((i) => i.id === id);
    if (memMatch) {
      return NextResponse.json({ success: true, data: memMatch });
    }
    return NextResponse.json({ success: false, message: 'Gagal mengambil data produksi' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (authUser.role !== 'ADMIN_FARM' && authUser.role !== 'SUPERADMIN')) {
      return NextResponse.json({ success: false, message: 'Akses ditolak' }, { status: 403 });
    }

    const { id } = params;
    const { date, shift, farmOrigin, categoryId, productType, animalType, packagingType, grossVolumeLiters, pedetVolumeLiters, afkirVolumeLiters, soldFreshVolumeLiters, keteranganPenjualan, usageType, usageVolumeLiters, rawVolumeLiters, processedLiters, packagedQty, notes } = await request.json();

    let existing = null;
    try {
      existing = await prisma.milkProduction.findUnique({ where: { id } });
    } catch (e) {
      existing = null;
    }

    if (!existing && global.__inMemoryProductionList) {
      existing = global.__inMemoryProductionList.find((p) => p.id === id);
    }

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Data produksi tidak ditemukan' }, { status: 404 });
    }

    const grossVal = grossVolumeLiters !== undefined ? parseFloat(grossVolumeLiters) || 0 : (existing.grossVolumeLiters || existing.rawVolumeLiters || 0);
    const pedetVal = pedetVolumeLiters !== undefined ? parseFloat(pedetVolumeLiters) || 0 : (existing.pedetVolumeLiters || 0);
    const afkirVal = afkirVolumeLiters !== undefined ? parseFloat(afkirVolumeLiters) || 0 : (existing.afkirVolumeLiters || 0);
    const soldFreshVal = 0;
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

    let updated = null;
    try {
      updated = await prisma.milkProduction.update({
        where: { id },
        data: {
          date: date ? new Date(date) : existing.date,
          shift: shift !== undefined ? shift : existing.shift,
          farmOrigin: farmOrigin !== undefined ? farmOrigin : existing.farmOrigin,
          categoryId: categoryId !== undefined ? categoryId : existing.categoryId,
          productType: productType !== undefined ? productType : existing.productType,
          animalType: animalType !== undefined ? animalType : existing.animalType,
          packagingType: packagingType !== undefined ? packagingType : existing.packagingType,
          grossVolumeLiters: grossVal,
          pedetVolumeLiters: pedetVal,
          afkirVolumeLiters: afkirVal,
          soldFreshVolumeLiters: soldFreshVal,
          keteranganPenjualan: keteranganPenjualan !== undefined ? keteranganPenjualan : existing.keteranganPenjualan,
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
    } catch (e) {
      updated = {
        ...existing,
        date: date || existing.date,
        shift: shift !== undefined ? shift : existing.shift,
        farmOrigin: farmOrigin !== undefined ? farmOrigin : existing.farmOrigin,
        animalType: animalType !== undefined ? animalType : existing.animalType,
        grossVolumeLiters: grossVal,
        pedetVolumeLiters: pedetVal,
        afkirVolumeLiters: afkirVal,
        rawVolumeLiters: netVolume,
        processedLiters: finalProcessed,
        packagedQty: Math.round(netVolume),
        notes: notes !== undefined ? notes : existing.notes,
      };
    }

    if (global.__inMemoryProductionList) {
      const idx = global.__inMemoryProductionList.findIndex((p) => p.id === id);
      if (idx !== -1) {
        global.__inMemoryProductionList[idx] = {
          ...global.__inMemoryProductionList[idx],
          ...updated,
        };
      }
    }

    try {
      const validUserId = await resolveValidUserId(authUser);
      await prisma.systemLog.create({
        data: {
          userId: validUserId,
          userEmail: authUser.email,
          action: 'UPDATE_PRODUCTION',
          details: `Memperbarui data produksi (ID: ${id})`,
        },
      });
    } catch (e) {}

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

    let existing = null;
    try {
      existing = await prisma.milkProduction.findUnique({ where: { id } });
    } catch (e) {
      existing = null;
    }

    if (!existing && global.__inMemoryProductionList) {
      existing = global.__inMemoryProductionList.find((p) => p.id === id);
    }

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Data produksi tidak ditemukan' }, { status: 404 });
    }

    try {
      await prisma.milkProduction.delete({ where: { id } });
    } catch (e) {}

    if (global.__inMemoryProductionList) {
      global.__inMemoryProductionList = global.__inMemoryProductionList.filter((p) => p.id !== id);
    }

    try {
      const validUserId = await resolveValidUserId(authUser);
      await prisma.systemLog.create({
        data: {
          userId: validUserId,
          userEmail: authUser.email,
          action: 'DELETE_PRODUCTION',
          details: `Menghapus data produksi (ID: ${id})`,
        },
      });
    } catch (e) {}

    return NextResponse.json({
      success: true,
      message: 'Data produksi berhasil dihapus.',
    });
  } catch (error) {
    console.error('DELETE /api/farm/production/[id] error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
