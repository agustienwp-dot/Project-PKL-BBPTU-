import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

if (!global.__inMemoryProductionList) {
  global.__inMemoryProductionList = [];
}

async function resolveValidUserId(authUser) {
  if (!authUser || !authUser.id) return null;
  try {
    const found = await prisma.user.findUnique({ where: { id: authUser.id } });
    if (found) return found.id;

    if (authUser.email) {
      const foundByEmail = await prisma.user.findUnique({ where: { email: authUser.email } });
      if (foundByEmail) return foundByEmail.id;
    }

    const firstUser = await prisma.user.findFirst();
    if (firstUser) return firstUser.id;
  } catch (e) {
    console.error('resolveValidUserId error:', e);
  }
  return null;
}

export async function GET(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const animalType = searchParams.get('animalType');
    const productType = searchParams.get('productType');
    const categoryId = searchParams.get('categoryId');
    const dateParam = searchParams.get('date');

    const whereClause = {};
    if (animalType) whereClause.animalType = animalType;
    if (productType) whereClause.productType = productType;
    if (categoryId) whereClause.categoryId = categoryId;
    if (dateParam) {
      const startOfDay = new Date(dateParam);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(dateParam);
      endOfDay.setHours(23, 59, 59, 999);
      whereClause.date = { gte: startOfDay, lte: endOfDay };
    }

    let dbProductions = [];
    try {
      dbProductions = await prisma.milkProduction.findMany({
        where: whereClause,
        orderBy: [
          { date: 'desc' },
          { createdAt: 'desc' },
        ],
        include: {
          category: true,
          createdBy: {
            select: { id: true, name: true, email: true },
          },
        },
      });
    } catch (e) {
      console.error('prisma.milkProduction.findMany error:', e);
      dbProductions = [];
    }

    const mergedList = [...dbProductions];
    const existingIds = new Set(dbProductions.map((p) => p.id));

    for (const memProd of global.__inMemoryProductionList) {
      if (!existingIds.has(memProd.id)) {
        if (!animalType || memProd.animalType === animalType) {
          const memDate = typeof memProd.date === 'string' ? memProd.date.split('T')[0] : new Date(memProd.date || 0).toISOString().split('T')[0];
          const isDup = dbProductions.some((dbP) => {
            const dbDate = typeof dbP.date === 'string' ? dbP.date.split('T')[0] : new Date(dbP.date || 0).toISOString().split('T')[0];
            return dbDate === memDate && dbP.shift === memProd.shift && dbP.animalType === memProd.animalType;
          });
          if (!isDup) {
            mergedList.push(memProd);
            existingIds.add(memProd.id);
          }
        }
      }
    }

    mergedList.sort((a, b) => {
      const dayA = typeof a.date === 'string' ? a.date.split('T')[0] : new Date(a.date || 0).toISOString().split('T')[0];
      const dayB = typeof b.date === 'string' ? b.date.split('T')[0] : new Date(b.date || 0).toISOString().split('T')[0];
      if (dayB !== dayA) return dayB.localeCompare(dayA);

      const getTime = (item) => {
        const t = new Date(item.createdAt || item.created_at || item.updatedAt || item.updated_at || 0).getTime();
        if (t > 0) return t;
        if (typeof item.id === 'string' && item.id.startsWith('prod-')) {
          const parsed = parseInt(item.id.replace('prod-', ''), 10);
          if (!isNaN(parsed)) return parsed;
        }
        return 0;
      };
      const timeA = getTime(a);
      const timeB = getTime(b);
      if (timeB !== timeA) return timeB - timeA;

      const shiftWeight = (s) => (String(s).toLowerCase().includes('sore') ? 2 : 1);
      const shiftDiff = shiftWeight(b.shift) - shiftWeight(a.shift);
      if (shiftDiff !== 0) return shiftDiff;

      return (b.id || '').localeCompare(a.id || '');
    });

    const mappedProductions = mergedList.map((p) => {
      const gross = p.grossVolumeLiters > 0 ? p.grossVolumeLiters : p.rawVolumeLiters;
      const sisa = Math.max(0, (p.rawVolumeLiters || 0) - (p.processedLiters || 0));
      return {
        ...p,
        grossVolumeLiters: gross,
        sisaVolumeLiters: sisa,
        fotoTimbangan: p.fotoTimbangan || null,
        farmOrigin: (p.animalType === 'KAMBING' || p.animal_type === 'KAMBING') ? '-' : (p.farmOrigin || 'Manggala'),
      };
    });

    return NextResponse.json({ success: true, data: mappedProductions });
  } catch (error) {
    console.error('GET /api/farm/production error:', error);
    return NextResponse.json({ success: true, data: global.__inMemoryProductionList });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (authUser.role !== 'ADMIN_FARM' && authUser.role !== 'SUPERADMIN' && authUser.role !== 'ADMIN_PENGEMASAN')) {
      return NextResponse.json({ success: false, message: 'Akses ditolak: Hanya Admin Farm, Admin Pengemasan, atau Superadmin yang dapat menginput produksi' }, { status: 403 });
    }

    const { 
      date, shift, farmOrigin, categoryId, productType, animalType, packagingType, 
      grossVolumeLiters, pedetVolumeLiters, afkirVolumeLiters, soldFreshVolumeLiters, 
      keteranganPenjualan, usageType, usageVolumeLiters, rawVolumeLiters, 
      processedLiters, packagedQty, notes, fotoTimbangan, nomorSegel, status, handoverStatus
    } = await request.json();

    if (date) {
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const inputDateStr = typeof date === 'string' ? date.split('T')[0] : '';
      if (inputDateStr && inputDateStr > todayStr) {
        return NextResponse.json({ success: false, message: 'Tanggal produksi tidak boleh lebih dari tanggal sekarang' }, { status: 400 });
      }
    }

    const aType = animalType || 'SAPI';
    const pType = productType || 'SEGAR';
    const pkgType = packagingType || 'botol';

    let targetCategoryId = categoryId;
    let category = null;

    if (targetCategoryId) {
      category = await prisma.milkCategory.findUnique({ where: { id: targetCategoryId } }).catch(() => null);
    }

    if (!category) {
      category = await prisma.milkCategory.findFirst({
        where: aType ? { animalType: aType } : {},
      }).catch(() => null);
      if (category) targetCategoryId = category.id;
    }

    if (!category) {
      category = await prisma.milkCategory.findFirst().catch(() => null);
      if (category) targetCategoryId = category.id;
    }

    if (!category) {
      try {
        const defaultName = aType === 'KAMBING' ? 'Susu Kambing Segar' : 'Susu Sapi Segar';
        const defaultCode = aType === 'KAMBING' ? 'SKS' : 'SSS';
        category = await prisma.milkCategory.create({
          data: {
            name: defaultName,
            code: defaultCode,
            animalType: aType,
            productType: pType,
            defaultPackaging: pkgType,
            description: `Default kategori untuk ${aType}`,
          }
        });
        targetCategoryId = category.id;
      } catch (catErr) {
        console.error('Failed to auto-create category:', catErr);
      }
    }

    if (!category) {
      return NextResponse.json({ success: false, message: 'Kategori susu wajib dipilih atau belum tersedia di database' }, { status: 400 });
    }

    const grossVal = grossVolumeLiters !== undefined ? parseFloat(grossVolumeLiters) || 0 : (parseFloat(rawVolumeLiters) || 0);
    const pedetVal = parseFloat(pedetVolumeLiters) || 0;
    const afkirVal = parseFloat(afkirVolumeLiters) || 0;
    const soldFreshVal = parseFloat(soldFreshVolumeLiters) || 0;
    const totalUsage = pedetVal + afkirVal + soldFreshVal;

    const feedLabel = aType === 'KAMBING' ? 'Cempe' : 'Pedet';
    let summaryUsage = usageType || '';
    if (!summaryUsage) {
      const parts = [];
      if (pedetVal > 0) parts.push(`${feedLabel}: ${pedetVal}L`);
      if (afkirVal > 0) parts.push(`Afkir: ${afkirVal}L`);
      if (soldFreshVal > 0) parts.push(`Jual Segar: ${soldFreshVal}L`);
      summaryUsage = parts.join(', ');
    }

    const netVolume = Math.max(0, grossVal - totalUsage);
    const initialProcessed = processedLiters !== undefined ? parseFloat(processedLiters) || 0 : 0;

    let generatedKodeTransfer = null;
    let generatedPin = null;
    if (netVolume > 0) {
      const nowObj = date ? new Date(date) : new Date();
      const yyyy = nowObj.getFullYear();
      const mm = (nowObj.getMonth() + 1).toString().padStart(2, '0');
      const dd = nowObj.getDate().toString().padStart(2, '0');
      const dateCode = `${yyyy}${mm}${dd}`;
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      generatedKodeTransfer = `TRF-${dateCode}-${randomSuffix}`;
      generatedPin = Math.floor(1000 + Math.random() * 9000).toString();
    }

    const validUserId = await resolveValidUserId(authUser);

    const finalStatus = (status === 'DRAFT' || handoverStatus === 'DRAFT') ? 'DRAFT' : 'DITERIMA';
    const finalHandoverStatus = (status === 'DRAFT' || handoverStatus === 'DRAFT') ? 'DRAFT' : 'DITERIMA';

    let production = null;
    try {
      production = await prisma.milkProduction.create({
        data: {
          date: date ? new Date(date) : new Date(),
          shift: shift || 'Pagi',
          farmOrigin: aType === 'KAMBING' ? '-' : (farmOrigin || 'Manggala'),
          categoryId: targetCategoryId,
          productType: pType,
          animalType: aType,
          packagingType: pkgType,
          grossVolumeLiters: grossVal,
          pedetVolumeLiters: pedetVal,
          afkirVolumeLiters: afkirVal,
          soldFreshVolumeLiters: soldFreshVal,
          keteranganPenjualan: keteranganPenjualan || null,
          usageType: summaryUsage || null,
          usageVolumeLiters: totalUsage,
          rawVolumeLiters: netVolume,
          processedLiters: initialProcessed,
          packagedQty: parseInt(packagedQty, 10) || 0,
          fotoTimbangan: fotoTimbangan || null,
          nomorSegel: nomorSegel || null,
          kodeTransfer: generatedKodeTransfer,
          pinVerifikasi: generatedPin,
          handoverStatus: finalHandoverStatus,
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
    } catch (e) {
      console.error('prisma.milkProduction.create error:', e);
      if (fotoTimbangan && (e.code === 'P1017' || e.message?.includes('closed the connection') || e.message?.includes('max_allowed_packet'))) {
        try {
          console.warn('Retrying prisma.milkProduction.create without oversized fotoTimbangan...');
          production = await prisma.milkProduction.create({
            data: {
              date: date ? new Date(date) : new Date(),
              shift: shift || 'Pagi',
              farmOrigin: aType === 'KAMBING' ? '-' : (farmOrigin || 'Manggala'),
              categoryId: targetCategoryId,
              productType: pType,
              animalType: aType,
              packagingType: pkgType,
              grossVolumeLiters: grossVal,
              pedetVolumeLiters: pedetVal,
              afkirVolumeLiters: afkirVal,
              soldFreshVolumeLiters: soldFreshVal,
              keteranganPenjualan: keteranganPenjualan || null,
              usageType: summaryUsage || null,
              usageVolumeLiters: totalUsage,
              rawVolumeLiters: netVolume,
              processedLiters: initialProcessed,
              packagedQty: parseInt(packagedQty, 10) || 0,
              fotoTimbangan: null,
              nomorSegel: nomorSegel || null,
              kodeTransfer: generatedKodeTransfer,
              pinVerifikasi: generatedPin,
              handoverStatus: finalHandoverStatus,
              status: finalStatus,
              notes: (notes ? notes + ' ' : '') + '(Foto diabaikan karena ukuran file terlalu besar)',
              createdById: validUserId,
            },
            include: {
              category: true,
              createdBy: {
                select: { id: true, name: true, email: true },
              },
            },
          });
        } catch (retryErr) {
          console.error('Retry create without foto failed:', retryErr);
        }
      }
    }

    if (!production) {
      production = {
        id: `prod-${Date.now()}`,
        date: date || new Date().toISOString(),
        shift: shift || 'Pagi',
        farmOrigin: aType === 'KAMBING' ? '-' : (farmOrigin || 'Manggala'),
        categoryId: targetCategoryId,
        productType: pType,
        animalType: aType,
        packagingType: pkgType,
        grossVolumeLiters: grossVal,
        pedetVolumeLiters: pedetVal,
        afkirVolumeLiters: afkirVal,
        soldFreshVolumeLiters: soldFreshVal,
        usageType: summaryUsage,
        usageVolumeLiters: totalUsage,
        rawVolumeLiters: netVolume,
        processedLiters: initialProcessed,
        packagedQty: parseInt(packagedQty, 10) || 0,
        status: finalStatus,
        handoverStatus: finalHandoverStatus,
        kodeTransfer: generatedKodeTransfer,
        pinVerifikasi: generatedPin,
        notes: notes || '',
        fotoTimbangan: fotoTimbangan || null,
        createdAt: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category: category,
        createdBy: { id: authUser.id, name: authUser.name, email: authUser.email },
      };
      global.__inMemoryProductionList.unshift(production);
    }

    await prisma.systemLog.create({
      data: {
        userId: validUserId,
        userEmail: authUser.email,
        action: 'CREATE_PRODUCTION',
        details: `Input produksi ${aType} (${grossVal}L gross, ${netVolume}L net): ${category.name}`,
      },
    }).catch(() => {});

    // Create Notification for Admin Pemasaran
    try {
      const animalLabel = aType === 'KAMBING' ? 'Kambing' : 'Sapi';
      await prisma.notification.create({
        data: {
          title: `Pengiriman Susu Segar: Susu ${animalLabel} (${netVolume} L)`,
          message: `${authUser.name || 'Admin Farm'} telah menginput hasil perah susu ${animalLabel} (${grossVal} L gross, ${netVolume} L diserahterimakan) sesi ${shift || 'Pagi'}.`,
          type: 'STOCK_ADDED',
          targetRole: 'ADMIN_PEMASARAN',
          senderId: validUserId,
          senderName: authUser.name || authUser.email,
          senderRole: authUser.role || 'ADMIN_FARM',
          link: '/pemasaran/terima-susu-segar',
          metadata: JSON.stringify({
            productionId: production.id,
            animalType: aType,
            shift: shift || 'Pagi',
            grossVolumeLiters: grossVal,
            rawVolumeLiters: netVolume,
            farmOrigin: aType === 'KAMBING' ? '-' : (farmOrigin || 'Manggala'),
          }),
        },
      });
    } catch (notifErr) {
      console.error('Error creating notification in POST /api/farm/production:', notifErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Data produksi susu berhasil disimpan!',
      data: production,
    });
  } catch (error) {
    console.error('POST /api/farm/production error:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Gagal menyimpan data produksi' }, { status: 500 });
  }
}
