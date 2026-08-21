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
    if (categoryId) where.category_id = categoryId;
    if (animalType) where.animal_type = animalType;
    if (productCategory) where.product_category = productCategory;
    if (productSubtype) where.product_subtype = productSubtype;
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
        created_by: {
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

    if (date) {
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const inputDateStr = typeof date === 'string' ? date.split('T')[0] : '';
      if (inputDateStr && inputDateStr > todayStr) {
        return NextResponse.json({ success: false, message: 'Tanggal pengemasan tidak boleh lebih dari tanggal sekarang' }, { status: 400 });
      }
    }

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

    const validUserId = await resolveValidUserId(authUser);

    const packaging = await prisma.milkPackaging.create({
      data: {
        date: date ? new Date(date) : new Date(),
        product_category: pCategory,
        product_subtype: pSubtype,
        origin: pOrigin,
        variant: pVariant,
        animal_type: aType,
        category_id: categoryId || null,
        processed_amount: pAmount,
        processed_unit: pUnit,
        processed_liters: pUnit === 'Liter' ? pAmount : 0,
        packaging_details: JSON.stringify(itemsList),
        packaging_type: primaryPkgType,
        package_size: primaryPkgSize,
        botol_qty: bQty,
        cup_qty: cQty,
        plastik_bantal_qty: pQty,
        total_packaged_qty: totalPackagedQty,
        quantity_sent: totalPackagedQty,
        notes: notes || '',
        status: 'DRAFT',
        created_by_id: validUserId,
      },
      include: {
        category: true,
        created_by: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    await prisma.systemLog.create({
      data: {
        user_id: validUserId,
        user_email: authUser.email,
        action: 'CREATE_PACKAGING',
        details: `Pengemasan ${pCategory} ${pSubtype ? `(${pSubtype}) ` : ''}- ${pOrigin} ${pVariant}: ${pAmount} ${pUnit} diproses -> Total ${totalPackagedQty} pcs (DRAFT)`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Hasil pengemasan ${pCategory} (${totalPackagedQty} pcs) berhasil disimpan sebagai DRAFT!`,
      data: packaging,
    });
  } catch (error) {
    console.error('POST /api/farm/packaging error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
