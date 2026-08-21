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
        created_by: { select: { id: true, name: true, email: true } },
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

    if (date) {
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const inputDateStr = typeof date === 'string' ? date.split('T')[0] : '';
      if (inputDateStr && inputDateStr > todayStr) {
        return NextResponse.json({ success: false, message: 'Tanggal produksi tidak boleh lebih dari tanggal sekarang' }, { status: 400 });
      }
    }

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
    const soldFreshVal = soldFreshVolumeLiters !== undefined ? parseFloat(soldFreshVolumeLiters) || 0 : (existing.soldFreshVolumeLiters || 0);
    const totalUsage = pedetVal + afkirVal + soldFreshVal;

    const aType = animalType || existing.animal_type || 'SAPI';
    const feedLabel = aType === 'KAMBING' ? 'Cempe' : 'Pedet';
    let summaryUsage = usageType !== undefined ? usageType : existing.usage_type;
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
          farm_origin: farmOrigin !== undefined ? farmOrigin : (existing.farm_origin || existing.farmOrigin),
          category_id: categoryId !== undefined ? categoryId : (existing.category_id || existing.categoryId),
          product_type: productType !== undefined ? productType : (existing.product_type || existing.productType),
          animal_type: animalType !== undefined ? animalType : (existing.animal_type || existing.animalType),
          packaging_type: packagingType !== undefined ? packagingType : (existing.packaging_type || existing.packagingType),
          gross_volume_liters: grossVal,
          pedet_volume_liters: pedetVal,
          afkir_volume_liters: afkirVal,
          sold_fresh_volume_liters: soldFreshVal,
          keterangan_penjualan: keteranganPenjualan !== undefined ? keteranganPenjualan : (existing.keterangan_penjualan || existing.keteranganPenjualan),
          usage_type: summaryUsage || null,
          usage_volume_liters: totalUsage,
          raw_volume_liters: netVolume,
          processed_liters: finalProcessed,
          packaged_qty: packagedQty !== undefined ? parseInt(packagedQty, 10) : Math.round(netVolume),
          notes: notes !== undefined ? notes : existing.notes,
        },
        include: {
          category: true,
          created_by: {
            select: { id: true, name: true, email: true },
          },
        },
      });
    } catch (e) {
      console.error('prisma.milkProduction.update error:', e);
      updated = {
        ...existing,
        date: date || existing.date,
        shift: shift !== undefined ? shift : existing.shift,
        farm_origin: farmOrigin !== undefined ? farmOrigin : (existing.farm_origin || existing.farmOrigin),
        category_id: categoryId !== undefined ? categoryId : (existing.category_id || existing.categoryId),
        product_type: productType !== undefined ? productType : (existing.product_type || existing.productType),
        animal_type: animalType !== undefined ? animalType : (existing.animal_type || existing.animalType),
        packaging_type: packagingType !== undefined ? packagingType : (existing.packaging_type || existing.packagingType),
        gross_volume_liters: grossVal,
        pedet_volume_liters: pedetVal,
        afkir_volume_liters: afkirVal,
        sold_fresh_volume_liters: soldFreshVal,
        keterangan_penjualan: keteranganPenjualan !== undefined ? keteranganPenjualan : (existing.keterangan_penjualan || existing.keteranganPenjualan),
        usage_type: summaryUsage || null,
        usage_volume_liters: totalUsage,
        raw_volume_liters: netVolume,
        processed_liters: finalProcessed,
        packaged_qty: packagedQty !== undefined ? parseInt(packagedQty, 10) : Math.round(netVolume),
        notes: notes !== undefined ? notes : existing.notes,
        // Camelcase compatibility for UI
        farmOrigin: farmOrigin !== undefined ? farmOrigin : (existing.farmOrigin || existing.farm_origin),
        categoryId: categoryId !== undefined ? categoryId : (existing.categoryId || existing.category_id),
        productType: productType !== undefined ? productType : (existing.productType || existing.product_type),
        animalType: animalType !== undefined ? animalType : (existing.animalType || existing.animal_type),
        packagingType: packagingType !== undefined ? packagingType : (existing.packagingType || existing.packaging_type),
        grossVolumeLiters: grossVal,
        pedetVolumeLiters: pedetVal,
        afkirVolumeLiters: afkirVal,
        soldFreshVolumeLiters: soldFreshVal,
        rawVolumeLiters: netVolume,
        processedLiters: finalProcessed,
        packagedQty: packagedQty !== undefined ? parseInt(packagedQty, 10) : Math.round(netVolume),
      };
    }

    if (updated) {
      updated.farmOrigin = updated.farmOrigin || updated.farm_origin;
      updated.categoryId = updated.categoryId || updated.category_id;
      updated.productType = updated.productType || updated.product_type;
      updated.animalType = updated.animalType || updated.animal_type;
      updated.packagingType = updated.packagingType || updated.packaging_type;
      updated.grossVolumeLiters = updated.grossVolumeLiters ?? updated.gross_volume_liters;
      updated.pedetVolumeLiters = updated.pedetVolumeLiters ?? updated.pedet_volume_liters;
      updated.afkirVolumeLiters = updated.afkirVolumeLiters ?? updated.afkir_volume_liters;
      updated.soldFreshVolumeLiters = updated.soldFreshVolumeLiters ?? updated.sold_fresh_volume_liters;
      updated.rawVolumeLiters = updated.rawVolumeLiters ?? updated.raw_volume_liters;
      updated.processedLiters = updated.processedLiters ?? updated.processed_liters;
      updated.packagedQty = updated.packagedQty ?? updated.packaged_qty;
      updated.createdBy = updated.createdBy || updated.created_by;
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
    } catch (e) { }

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
    } catch (e) { }

    return NextResponse.json({
      success: true,
      message: 'Data produksi berhasil dihapus.',
    });
  } catch (error) {
    console.error('DELETE /api/farm/production/[id] error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
