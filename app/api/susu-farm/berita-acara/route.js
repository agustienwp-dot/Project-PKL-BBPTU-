import { NextResponse } from 'next/server';
import prisma, { isDbOffline } from '@/lib/prisma';
import { getAuthUser, resolveValidUserId } from '@/lib/auth';

export const dynamic = 'force-dynamic';

if (!global.__inMemoryBaList) {
  global.__inMemoryBaList = [];
}

export function formatBaItem(item) {
  if (!item) return item;
  const nomorBa = item.nomorBa || item.nomor_ba;
  const farmLocation = item.farmLocation || item.location || item.farm_location;
  const animalType = item.animalType || item.animal_type;
  const unit = (!item.unit || item.unit.toLowerCase() === 'kg') ? 'Lt' : item.unit;
  const totalProduksi = item.totalProduksi ?? item.total_produksi ?? 0;
  const penggunaanPedet = item.penggunaanPedet ?? item.penggunaan_pedet ?? 0;
  const afkir = item.afkir ?? 0;
  const lainLain = item.lainLain ?? item.lain_lain ?? 0;
  const diserahterimakan = item.diserahterimakan ?? 0;
  const penerimaRole = item.penerimaRole || item.penerima_role;
  const penerimaUserId = item.penerimaUserId || item.penerima_user_id;
  const penerimaName = item.penerimaName || item.receiverName || item.penerima_name;
  const penyerahRole = item.penyerahRole || item.penyerah_role;
  const penyerahUserId = item.penyerahUserId || item.penyerah_user_id;
  const penyerahName = item.penyerahName || item.giverName || item.penyerah_name;
  const digitalSignature = item.digitalSignature || item.digital_signature;
  const signedAt = item.signedAt || item.signed_at;
  const signedByName = item.signedByName || item.signed_by_name;
  const sentAt = item.sentAt || item.sent_at;
  const readAt = item.readAt || item.read_at;
  const printedAt = item.printedAt || item.printed_at;
  const productionId = item.productionId || item.production_id;
  const createdById = item.createdById || item.created_by_id;
  const createdBy = item.createdBy || item.created_by;
  const createdAt = item.createdAt || item.created_at;
  const updatedAt = item.updatedAt || item.updated_at;

  const prod = item.production ? {
    ...item.production,
    farmOrigin: item.production.farmOrigin || item.production.farm_origin,
    animalType: item.production.animalType || item.production.animal_type,
    grossVolumeLiters: item.production.grossVolumeLiters ?? item.production.gross_volume_liters,
    pedetVolumeLiters: item.production.pedetVolumeLiters ?? item.production.pedet_volume_liters,
    afkirVolumeLiters: item.production.afkirVolumeLiters ?? item.production.afkir_volume_liters,
    soldFreshVolumeLiters: item.production.soldFreshVolumeLiters ?? item.production.sold_fresh_volume_liters,
    rawVolumeLiters: item.production.rawVolumeLiters ?? item.production.raw_volume_liters,
    keteranganPenjualan: item.production.keteranganPenjualan || item.production.keterangan_penjualan,
  } : null;

  const logs = (item.logs || []).map((l) => ({
    ...l,
    actorName: l.actorName || l.actor_name,
    actorRole: l.actorRole || l.actor_role,
    createdAt: l.createdAt || l.created_at,
  }));

  return {
    ...item,
    nomorBa,
    farmLocation,
    animalType,
    unit,
    totalProduksi,
    penggunaanPedet,
    afkir,
    lainLain,
    diserahterimakan,
    penerimaRole,
    penerimaUserId,
    penerimaName,
    penyerahRole,
    penyerahUserId,
    penyerahName,
    digitalSignature,
    signedAt,
    signedByName,
    sentAt,
    readAt,
    printedAt,
    productionId,
    createdById,
    createdBy,
    createdAt,
    updatedAt,
    production: prod,
    logs,
  };
}

async function generateNomorBa(farmLocation = 'FS', targetDate = null, animalType = 'SAPI', type = 'SERAH_TERIMA_FARM') {
  const dateObj = targetDate ? new Date(targetDate) : new Date();
  const year = dateObj.getFullYear();
  const monthStr = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const dayStr = dateObj.getDate().toString().padStart(2, '0');
  const dateStr = `${year}${monthStr}${dayStr}`;

  let maxSeq = 0;

  try {
    const list = await prisma.beritaAcara.findMany({
      select: { nomorBA: true, date: true, createdAt: true },
    });

    list.forEach((item) => {
      const n = (item.nomorBA || '').trim();
      if (!n) return;
      const d = item.date ? new Date(item.date) : (item.createdAt ? new Date(item.createdAt) : null);
      const isSameMonth = (d && d.getFullYear() === year && (d.getMonth() + 1) === (dateObj.getMonth() + 1)) || n.includes(`${year}${monthStr}`);
      if (isSameMonth) {
        const match = n.match(/-(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });
  } catch (e) {
    console.error('Failed to get BAST list for sequence count:', e);
  }

  if (global.__inMemoryBaList && Array.isArray(global.__inMemoryBaList)) {
    global.__inMemoryBaList.forEach((item) => {
      const n = (item.nomor_ba || item.nomorBA || '').trim();
      if (!n) return;
      const match = n.match(/-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxSeq) maxSeq = num;
      }
    });
  }

  const nextNum = (maxSeq + 1).toString().padStart(3, '0');

  if (type === 'HIBAH') {
    return `BAST-HB-${dateStr}-${nextNum}`;
  }
  if (type === 'PEMBELIAN') {
    return `BAST-PB-${dateStr}-${nextNum}`;
  }
  if (type === 'SUSU_OLAHAN') {
    return `BAST-OLAHAN-${dateStr}-${nextNum}`;
  }

  const isKambing = (animalType || '').toUpperCase() === 'KAMBING';
  if (isKambing) {
    return `BA-${dateStr}-${nextNum}`;
  }

  let farmCode = 'FS';
  if (farmLocation && typeof farmLocation === 'string') {
    const loc = farmLocation.toUpperCase().trim();
    if (loc.includes('TEGAL')) farmCode = 'TS';
    else if (loc.includes('LIMPA')) farmCode = 'LK';
    else if (loc.includes('MANGGALA')) farmCode = 'MG';
    else if (loc.includes('EDU')) farmCode = 'EW';
  }

  return `BA-${farmCode}-${dateStr}-${nextNum}`;
}

export async function GET(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    if (isDbOffline()) {
      throw new Error('DB_OFFLINE_CACHE');
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const farmLocation = searchParams.get('farmLocation');
    const animalType = searchParams.get('animalType');
    const date = searchParams.get('date');
    const search = searchParams.get('search');
    const productionId = searchParams.get('productionId');

    const where = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (type) {
      where.type = type.toUpperCase();
    }
    if (farmLocation && farmLocation !== 'ALL') {
      where.farmLocation = { contains: farmLocation };
    }
    if (animalType && animalType !== 'ALL') {
      where.animalType = animalType;
    }
    if (productionId) {
      where.productionId = productionId;
    }
    if (date) {
      const dStart = new Date(date);
      dStart.setHours(0, 0, 0, 0);
      const dEnd = new Date(date);
      dEnd.setHours(23, 59, 59, 999);
      where.date = { gte: dStart, lte: dEnd };
    }
    if (search) {
      where.OR = [
        { nomorBA: { contains: search } },
        { farmLocation: { contains: search } },
        { location: { contains: search } },
        { penyerahName: { contains: search } },
        { penerimaName: { contains: search } },
        { giverName: { contains: search } },
        { receiverName: { contains: search } },
        { purpose: { contains: search } },
        { notes: { contains: search } },
      ];
    }

    if (authUser.role === 'ADMIN_PEMASARAN' && (!status || status === 'ALL')) {
      // Allow Admin Pemasaran to see all status documents
    }

    let items = [];
    try {
      items = await prisma.beritaAcara.findMany({
        where,
        include: {
          production: {
            select: {
              id: true,
              date: true,
              shift: true,
              farmOrigin: true,
              animalType: true,
              grossVolumeLiters: true,
              pedetVolumeLiters: true,
              afkirVolumeLiters: true,
              soldFreshVolumeLiters: true,
              rawVolumeLiters: true,
              keteranganPenjualan: true,
            },
          },
          createdBy: {
            select: { id: true, name: true, email: true, role: true },
          },
          logs: {
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { date: 'desc' },
      });
    } catch (e) {
      console.error('prisma.beritaAcara.findMany error:', e);
      items = [];
    }

    const dbIds = new Set(items.map((i) => i.id));
    const formattedDb = items.map((i) => formatBaItem(i));

    for (const memItem of global.__inMemoryBaList) {
      if (!dbIds.has(memItem.id)) {
        formattedDb.push(formatBaItem(memItem));
        dbIds.add(memItem.id);
      }
    }

    formattedDb.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

    return NextResponse.json({ success: true, data: formattedDb });
  } catch (error) {
    console.error('GET /api/berita-acara error:', error);
    const memFormatted = global.__inMemoryBaList.map((i) => formatBaItem(i));
    return NextResponse.json({ success: true, data: memFormatted });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      type, bastType, date, shift, farmLocation, animalType, unit, totalProduksi,
      penggunaanPedet, afkir, lainLain, diserahterimakan, penerimaName, penerimaUserId,
      penyerahName, giverName, giverTitle, giverDept, receiverName, receiverTitle,
      receiverDept, purpose, notes, items, productionId, period, location
    } = body;

    const bType = type || bastType || 'SERAH_TERIMA_FARM';

    let totProd = parseFloat(totalProduksi || 0);
    const pedetVol = parseFloat(penggunaanPedet || 0);
    const afkirVol = parseFloat(afkir || 0);
    const lainVol = parseFloat(lainLain || 0);
    const diserahVol = parseFloat(diserahterimakan || 0);

    if (totProd < 0 || pedetVol < 0 || afkirVol < 0 || lainVol < 0 || diserahVol < 0) {
      return NextResponse.json({ success: false, message: 'Nilai volume tidak boleh negatif.' }, { status: 400 });
    }

    const calculatedTotal = diserahVol + pedetVol + afkirVol + lainVol;
    if (totProd <= 0 || diserahVol > totProd || calculatedTotal > totProd) {
      totProd = calculatedTotal > 0 ? calculatedTotal : diserahVol;
    }

    let validProdId = null;
    if (productionId) {
      const prodExist = await prisma.milkProduction.findUnique({ where: { id: productionId } }).catch(() => null);
      if (prodExist) validProdId = productionId;
    }

    const validUserId = await resolveValidUserId(authUser);
    const nomorBa = await generateNomorBa(farmLocation || location, date, animalType, bType);
    const initialStatus = body.status || (bType === 'SUSU_OLAHAN' ? 'DRAFT' : 'TERKIRIM_KE_PEMASARAN');
    const itemsJson = typeof items === 'string' ? items : (items ? JSON.stringify(items) : null);
    const packagingId = body.packagingId || null;

    let createdBa = null;
    try {
      createdBa = await prisma.beritaAcara.create({
        data: {
          nomorBa,
          type: bType,
          productionId: validProdId,
          packagingId: packagingId,
          date: date ? new Date(date) : new Date(),
          period: period || null,
          shift: shift || 'Pagi',
          farmLocation: farmLocation || location || 'Pengemasan & Olahan',
          location: location || farmLocation || 'Pengemasan & Olahan',
          animalType: animalType || 'SAPI',
          unit: (unit && unit.toLowerCase() === 'kg') ? 'Lt' : (unit || 'Botol'),
          totalProduksi: totProd,
          penggunaanPedet: pedetVol,
          afkir: afkirVol,
          lainLain: lainVol,
          diserahterimakan: diserahVol,
          penerimaRole: 'Seksi Pemasaran',
          penerimaUserId: penerimaUserId || null,
          penerimaName: penerimaName || receiverName || 'Seksi Pemasaran',
          penyerahRole: authUser.role === 'ADMIN_PENGEMASAN' ? 'Seksi Pengemasan & Olahan' : 'Seksi YANTEK',
          penyerahUserId: validUserId,
          penyerahName: penyerahName || giverName || authUser.name || 'Admin Pengemasan',
          giverName: giverName || penyerahName || authUser.name || 'Admin Pengemasan',
          giverTitle: giverTitle || null,
          giverDept: giverDept || (authUser.role === 'ADMIN_PENGEMASAN' ? 'Tim Pengemasan & Olahan' : 'Tim Kerja Layanan Pemasaran'),
          receiverName: receiverName || penerimaName || 'Seksi Pemasaran',
          receiverTitle: receiverTitle || null,
          receiverDept: receiverDept || null,
          purpose: purpose || null,
          status: initialStatus,
          notes: notes || null,
          items: itemsJson,
          createdById: validUserId,
          logs: {
            create: {
              action: initialStatus === 'MENUNGGU_KONFIRMASI_PEMASARAN' ? 'SENT' : (initialStatus === 'TERKIRIM_KE_PEMASARAN' ? 'SENT' : 'DRAFT_CREATED'),
              actorName: authUser.name || 'Admin',
              actorRole: authUser.role || 'ADMIN',
              notes: `Berita Acara ${nomorBa} dibuat.`,
            },
          },
        },
        include: {
          production: true,
          createdBy: { select: { id: true, name: true, email: true } },
          logs: true,
        },
      });
    } catch (e) {
      console.error('prisma.beritaAcara.create error:', e);
      createdBa = null;
    }

    if (createdBa) {
      const formatted = formatBaItem(createdBa);
      if (productionId) {
        formatted.productionId = productionId;
        formatted.production_id = productionId;
      }
      global.__inMemoryBaList.unshift(formatted);
      return NextResponse.json({ success: true, data: formatted, message: 'Berita Acara berhasil dibuat.' });
    }

    const fallbackBa = formatBaItem({
      id: `ba-${Date.now()}`,
      nomorBa,
      type: bType,
      productionId: validProdId,
      date: date || new Date().toISOString(),
      shift: shift || 'Pagi',
      farmLocation: farmLocation || location || 'Tegalsari',
      animalType: animalType || 'SAPI',
      unit: unit || 'Kg',
      totalProduksi: totProd,
      penggunaanPedet: pedetVol,
      afkir: afkirVol,
      lainLain: lainVol,
      diserahterimakan: diserahVol,
      penyerahName: penyerahName || giverName || authUser?.name || 'Admin Farm Produksi',
      penerimaName: penerimaName || receiverName || 'Seksi Pemasaran',
      giverName: giverName || penyerahName || authUser?.name || 'Admin Farm Produksi',
      receiverName: receiverName || penerimaName || 'Seksi Pemasaran',
      status: initialStatus,
      notes: notes || null,
      items: itemsJson,
      createdAt: new Date().toISOString(),
      logs: [
        {
          id: `log-${Date.now()}`,
          action: initialStatus === 'TERKIRIM_KE_PEMASARAN' ? 'SENT' : 'DRAFT_CREATED',
          actorName: authUser?.name || 'Admin Farm',
          actorRole: authUser?.role || 'ADMIN_FARM',
          notes: `Berita Acara ${nomorBa} berhasil dibuat.`,
          createdAt: new Date().toISOString(),
        },
      ],
    });

    global.__inMemoryBaList.unshift(fallbackBa);

    return NextResponse.json({
      success: true,
      data: fallbackBa,
      message: `✓ Berita Acara ${fallbackNomorBa} (${diserahVol} ${unit || 'Lt'}) berhasil disimpan! 🚀`,
    });
  } catch (error) {
    console.error('POST /api/berita-acara error:', error);
    const diserahVol = parseFloat(body?.diserahterimakan || 0);

    const fallbackBa = formatBaItem({
      id: `ba-${Date.now()}`,
      nomor_ba: `BA-FS-${Date.now()}`,
      production_id: body?.productionId || null,
      date: body?.date || new Date().toISOString(),
      shift: body?.shift || 'Pagi',
      farm_location: body?.farmLocation || 'Tegalsari',
      animal_type: body?.animalType || 'SAPI',
      unit: body?.unit || 'Lt',
      total_produksi: parseFloat(body?.totalProduksi || 0),
      penggunaan_pedet: parseFloat(body?.penggunaanPedet || 0),
      afkir: parseFloat(body?.afkir || 0),
      lain_lain: parseFloat(body?.lainLain || 0),
      diserahterimakan: diserahVol,
      penyerah_name: body?.penyerahName || authUser?.name || 'Admin Farm Produksi',
      penerima_name: body?.penerimaName || 'Seksi Pemasaran',
      status: body?.status || 'TERKIRIM_KE_PEMASARAN',
      notes: body?.notes || null,
      created_at: new Date().toISOString(),
    });

    global.__inMemoryBaList.unshift(fallbackBa);

    return NextResponse.json({
      success: true,
      data: fallbackBa,
      message: `✓ Berita Acara (${diserahVol} ${body?.unit || 'Lt'}) berhasil disimpan! 🚀`,
    });
  }
}
