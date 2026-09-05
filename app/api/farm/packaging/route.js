import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

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

    const packagings = await prisma.milkPackaging.findMany({
      where,
      include: {
        category: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ success: true, data: packagings });
  } catch (error) {
    console.error('GET /api/farm/packaging error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (authUser.role !== 'ADMIN_FARM' && authUser.role !== 'SUPERADMIN')) {
      return NextResponse.json({ success: false, message: 'Akses ditolak: Hanya Admin Farm atau Superadmin yang dapat menginput hasil pengemasan' }, { status: 403 });
    }

    const body = await request.json();
    const {
      date,
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
    } = body;

    const pCategory = productCategory || 'Susu';
    const pSubtype = productSubtype || null;
    const pOrigin = origin || (animalType === 'KAMBING' ? 'Kambing' : 'Sapi');
    const aType = pOrigin.toUpperCase() === 'KAMBING' ? 'KAMBING' : 'SAPI';
    const pVariant = variant || 'Original';

    const pAmount = parseFloat(processedAmount !== undefined ? processedAmount : processedLiters) || 0;
    const pUnit = processedUnit || (pCategory === 'Keju' ? 'Kg' : 'Liter');

    if (pAmount < 0) {
      return NextResponse.json({ success: false, message: 'Jumlah bahan diproses tidak boleh bernilai negatif' }, { status: 400 });
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
      pQty = itemsList.filter(i => (i.packagingType || '').toLowerCase().includes('bantal')).reduce((s, i) => s + (parseInt(i.quantity, 10) || 0), 0);
    } else {
      totalPackagedQty = bQty + cQty + pQty;
      itemsList = [];
      if (bQty > 0) itemsList.push({ packagingType: 'Botol', size: '', quantity: bQty });
      if (cQty > 0) itemsList.push({ packagingType: 'Cup', size: '', quantity: cQty });
      if (pQty > 0) itemsList.push({ packagingType: 'Plastik Bantal', size: '', quantity: pQty });
    }

    if (totalPackagedQty <= 0 && pAmount <= 0) {
      return NextResponse.json({ success: false, message: 'Harap masukkan jumlah bahan diproses atau rincian kemasan yang valid' }, { status: 400 });
    }

    const packaging = await prisma.milkPackaging.create({
      data: {
        date: date ? new Date(date) : new Date(),
        productCategory: pCategory,
        productSubtype: pSubtype,
        origin: pOrigin,
        variant: pVariant,
        animalType: aType,
        categoryId: categoryId || null,
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
        notes: notes || '',
        status: 'DITERIMA',
        receivedAt: new Date(),
        receivedByName: 'Otomatis Masuk Stok Pemasaran',
        condition: 'Sesuai',
        createdById: authUser.id,
      },
      include: {
        category: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Also sync to PackagedProduct for Admin Pemasaran inventory
    for (const item of itemsList) {
      const sizeStr = item.size ? item.size : item.packagingType || 'Botol';
      const jProduk = `${pCategory}${pVariant && pVariant !== 'Original' ? ` Rasa ${pVariant}` : ''}`;
      const itemQty = parseFloat(item.quantity) || 0;
      if (itemQty > 0) {
        await prisma.packagedProduct.create({
          data: {
            tanggal: date ? new Date(date) : new Date(),
            jenisProduk: jProduk,
            kemasan: sizeStr.includes('ml') || sizeStr.includes('gram') ? `${item.packagingType || 'Botol'} ${sizeStr}` : sizeStr,
            jumlah: itemQty,
            status: 'DITERIMA',
            receivedAt: new Date(),
            receivedByName: 'Otomatis Masuk Stok',
            condition: 'Sesuai',
            notes: notes || null,
            createdById: authUser.id,
          },
        });
      }
    }

    // Create Notification for Admin Pemasaran
    try {
      const displaySub = pSubtype ? `${pSubtype} ` : '';
      const notifTitle = `Stok Baru: ${pCategory} ${displaySub}(${pVariant})`;
      const notifMessage = `${authUser.name || 'Admin Pengolahan'} telah memasukkan stok baru ${pCategory} ${displaySub}- ${pVariant} sebanyak ${totalPackagedQty} pcs ke stok Pemasaran.`;

      await prisma.notification.create({
        data: {
          title: notifTitle,
          message: notifMessage,
          type: 'STOCK_ADDED',
          targetRole: 'ADMIN_PEMASARAN',
          senderId: authUser.id,
          senderName: authUser.name || authUser.email,
          senderRole: authUser.role || 'ADMIN_PENGEMASAN',
          link: '/pemasaran/terima-data',
          metadata: JSON.stringify({
            packagingId: packaging.id,
            category: pCategory,
            subtype: pSubtype,
            variant: pVariant,
            origin: pOrigin,
            quantity: totalPackagedQty,
            unit: 'pcs',
            items: itemsList,
          }),
        },
      });
    } catch (notifErr) {
      console.error('Error creating notification in /api/farm/packaging:', notifErr);
    }

    await prisma.systemLog.create({
      data: {
        userId: authUser.id,
        userEmail: authUser.email,
        action: 'CREATE_PACKAGING',
        details: `Pengemasan ${pCategory} ${pSubtype ? `(${pSubtype}) ` : ''}- ${pOrigin} ${pVariant}: ${pAmount} ${pUnit} diproses -> Total ${totalPackagedQty} pcs (Langsung Masuk Stok Pemasaran)`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Hasil pengemasan ${pCategory} (${totalPackagedQty} pcs) berhasil disimpan & langsung masuk ke stok pemasaran!`,
      data: packaging,
    });
  } catch (error) {
    console.error('POST /api/farm/packaging error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
