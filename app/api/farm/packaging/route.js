import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, resolveValidUserId } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const animalType = searchParams.get('animalType');
    const productCategory = searchParams.get('productCategory');
    const productSubtype = searchParams.get('productSubtype');
    const origin = searchParams.get('origin');
    const status = searchParams.get('status');
    const date = searchParams.get('date');

    const where = {};
    if (categoryId) where.categoryId = categoryId;
    if (animalType) where.animalType = animalType;
    if (productCategory) where.productCategory = productCategory;
    if (productSubtype) where.productSubtype = productSubtype;
    if (origin) where.origin = origin;
    if (status) where.status = status;
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

    let packagings;
    try {
      packagings = await prisma.milkPackaging.findMany({
        where,
        include: {
          category: true,
          production: {
            include: { category: true }
          },
          createdBy: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { date: 'desc' },
      });
    } catch (e) {
      packagings = await prisma.milkPackaging.findMany({
        where,
        include: {
          category: true,
          createdBy: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { date: 'desc' },
      });
    }

    return NextResponse.json({ success: true, data: packagings });
  } catch (error) {
    console.error('GET /api/farm/packaging error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (authUser.role !== 'ADMIN_FARM' && authUser.role !== 'ADMIN_PENGEMASAN' && authUser.role !== 'SUPERADMIN')) {
      return NextResponse.json({ success: false, message: 'Akses ditolak: Hanya Admin Pengemasan, Admin Farm, atau Superadmin yang dapat menginput pengemasan' }, { status: 403 });
    }

    const body = await request.json();
    const {
      date,
      productionId,
      productCategory,
      productSubtype,
      origin,
      variant,
      animalType,
      categoryId,
      processedAmount,
      processedUnit,
      processedLiters,
      packagingItems,
      botolQty,
      cupQty,
      plastikBantalQty,
      notes,
      status: reqStatus,
    } = body;

    if (date) {
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const inputDateStr = typeof date === 'string' ? date.split('T')[0] : '';
      if (inputDateStr && inputDateStr > todayStr) {
        return NextResponse.json({ success: false, message: 'Tanggal pengemasan tidak boleh lebih dari tanggal sekarang' }, { status: 400 });
      }
    }

    let selectedProduction = null;
    if (productionId) {
      selectedProduction = await prisma.milkProduction.findUnique({ where: { id: productionId } }).catch(() => null);
    }

    const pCategory = productCategory || 'Susu';
    const pSubtype = productSubtype || null;
    const pOrigin = origin || (selectedProduction ? (selectedProduction.animalType === 'KAMBING' ? 'Kambing' : 'Sapi') : (animalType === 'KAMBING' ? 'Kambing' : 'Sapi'));
    const aType = pOrigin.toUpperCase() === 'KAMBING' ? 'KAMBING' : 'SAPI';
    const pVariant = variant || 'Original';

    const pAmount = parseFloat(processedAmount !== undefined ? processedAmount : processedLiters) || 0;
    const pUnit = processedUnit || (pCategory === 'Keju' ? 'Kg' : 'Liter');

    if (pAmount <= 0) {
      return NextResponse.json({ success: false, message: 'Jumlah liter/bahan yang dikemas harus lebih besar dari 0' }, { status: 400 });
    }

    if (selectedProduction) {
      const sisaVolume = Math.max(0, selectedProduction.rawVolumeLiters - (selectedProduction.processedLiters || 0));
      if (pAmount > sisaVolume) {
        return NextResponse.json({
          success: false,
          message: `Jumlah susu yang akan dikemas (${pAmount} Liter) melebihi stok susu yang tersedia (${sisaVolume} Liter).`
        }, { status: 400 });
      }
    }

    let itemsList = Array.isArray(packagingItems) ? packagingItems : [];
    let totalPackagedQty = 0;
    let bQty = parseInt(botolQty, 10) || 0;
    let cQty = parseInt(cupQty, 10) || 0;
    let pQty = parseInt(plastikBantalQty, 10) || 0;
    let primaryPkgType = null;
    let primaryPkgSize = null;

    if (itemsList.length > 0) {
      totalPackagedQty = itemsList.reduce((sum, i) => sum + (parseInt(i.quantity, 10) || 0), 0);
      primaryPkgType = itemsList[0]?.packagingType || 'Botol';
      primaryPkgSize = itemsList[0]?.size || '';
      
      bQty = itemsList.filter(i => (i.packagingType || '').toLowerCase().includes('botol')).reduce((s, i) => s + (parseInt(i.quantity, 10) || 0), 0);
      cQty = itemsList.filter(i => (i.packagingType || '').toLowerCase().includes('cup')).reduce((s, i) => s + (parseInt(i.quantity, 10) || 0), 0);
      pQty = itemsList.filter(i => (i.packagingType || '').toLowerCase().includes('bantal') || (i.packagingType || '').toLowerCase().includes('pack')).reduce((s, i) => s + (parseInt(i.quantity, 10) || 0), 0);
    } else {
      totalPackagedQty = bQty + cQty + pQty;
      itemsList = [];
      if (bQty > 0) itemsList.push({ packagingType: 'Botol', size: '', quantity: bQty });
      if (cQty > 0) itemsList.push({ packagingType: 'Cup', size: '', quantity: cQty });
      if (pQty > 0) itemsList.push({ packagingType: 'Plastik Bantal', size: '', quantity: pQty });
    }

    if (totalPackagedQty <= 0) {
      return NextResponse.json({ success: false, message: 'Minimal satu jenis kemasan (Botol, Cup, atau Plastik Bantal) harus diisi dengan jumlah > 0' }, { status: 400 });
    }

    const finalStatus = reqStatus || 'MENUNGGU_PENERIMAAN';
    const validUserId = await resolveValidUserId(authUser);

    const packaging = await prisma.milkPackaging.create({
      data: {
        date: date ? new Date(date) : new Date(),
        productCategory: pCategory,
        productSubtype: pSubtype,
        origin: pOrigin,
        variant: pVariant,
        animalType: aType,
        categoryId: categoryId || (selectedProduction ? selectedProduction.categoryId : null),
        processedAmount: pAmount,
        processedUnit: pUnit,
        processedLiters: pUnit === 'Liter' ? pAmount : 0,
        packagingDetails: JSON.stringify(itemsList),
        packagingType: primaryPkgType,
        packageSize: primaryPkgSize,
        botolQty: bQty,
        cupQty: cQty,
        plastikBantalQty: pQty,
        totalPackagedQty,
        quantitySent: totalPackagedQty,
        quantityReceived: totalPackagedQty,
        status: finalStatus,
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

    if (selectedProduction) {
      try {
        await prisma.$executeRawUnsafe(
          'UPDATE milk_packagings SET productionId = ? WHERE id = ?',
          selectedProduction.id,
          packaging.id
        );
      } catch (rawErr) {
        console.error('Raw SQL productionId update error:', rawErr);
      }

      await prisma.milkProduction.update({
        where: { id: selectedProduction.id },
        data: {
          processedLiters: {
            increment: pAmount
          }
        }
      }).catch(e => console.error('Error updating processedLiters:', e));
    }

    try {
      await prisma.systemLog.create({
        data: {
          userId: validUserId,
          userEmail: authUser.email || '',
          action: 'CREATE_PACKAGING',
          details: `Pengemasan ${pCategory} - Susu ${pOrigin}: ${pAmount} Liter diproses -> Total ${totalPackagedQty} pcs (Botol: ${bQty}, Cup: ${cQty}, Plastik Bantal: ${pQty})`,
        },
      });
    } catch (logErr) {
      console.error('Non-critical system log error:', logErr);
    }

    return NextResponse.json({
      success: true,
      message: `Data pengemasan Susu ${pOrigin} (${totalPackagedQty} pcs) berhasil disimpan & stok produk jadi bertambah!`,
      data: packaging,
    });
  } catch (error) {
    console.error('POST /api/farm/packaging error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
