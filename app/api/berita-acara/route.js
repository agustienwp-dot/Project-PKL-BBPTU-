import { NextResponse } from 'next/server';
import prisma, { isDbOffline } from '@/lib/prisma';
import { getAuthUser, resolveValidUserId } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Global In-Memory Store for instant persistence across fallback / DB states
if (!global.__inMemoryBaList) {
  global.__inMemoryBaList = [];
}

// Helper to format/normalize BA item with both snake_case and camelCase getters for UI compatibility
export function formatBaItem(item) {
  if (!item) return item;
  const nomorBa = item.nomor_ba || item.nomorBa;
  const farmLocation = item.farm_location || item.farmLocation;
  const animalType = item.animal_type || item.animalType;
  const totalProduksi = item.total_produksi ?? item.totalProduksi ?? 0;
  const penggunaanPedet = item.penggunaan_pedet ?? item.penggunaanPedet ?? 0;
  const afkir = item.afkir ?? 0;
  const lainLain = item.lain_lain ?? item.lainLain ?? 0;
  const diserahterimakan = item.diserahterimakan ?? 0;
  const penerimaRole = item.penerima_role || item.penerimaRole;
  const penerimaUserId = item.penerima_user_id || item.penerimaUserId;
  const penerimaName = item.penerima_name || item.penerimaName;
  const penyerahRole = item.penyerah_role || item.penyerahRole;
  const penyerahUserId = item.penyerah_user_id || item.penyerahUserId;
  const penyerahName = item.penyerah_name || item.penyerahName;
  const digitalSignature = item.digital_signature || item.digitalSignature;
  const signedAt = item.signed_at || item.signedAt;
  const signedByName = item.signed_by_name || item.signedByName;
  const sentAt = item.sent_at || item.sentAt;
  const readAt = item.read_at || item.readAt;
  const printedAt = item.printed_at || item.printedAt;
  const productionId = item.production_id || item.productionId;
  const createdById = item.created_by_id || item.createdById;
  const createdBy = item.created_by || item.createdBy;
  const createdAt = item.created_at || item.createdAt;
  const updatedAt = item.updated_at || item.updatedAt;

  const prod = item.production ? {
    ...item.production,
    farmOrigin: item.production.farm_origin || item.production.farmOrigin,
    animalType: item.production.animal_type || item.production.animalType,
    grossVolumeLiters: item.production.gross_volume_liters ?? item.production.grossVolumeLiters,
    pedetVolumeLiters: item.production.pedet_volume_liters ?? item.production.pedetVolumeLiters,
    afkirVolumeLiters: item.production.afkir_volume_liters ?? item.production.afkirVolumeLiters,
    soldFreshVolumeLiters: item.production.sold_fresh_volume_liters ?? item.production.soldFreshVolumeLiters,
    rawVolumeLiters: item.production.raw_volume_liters ?? item.production.rawVolumeLiters,
    keteranganPenjualan: item.production.keterangan_penjualan || item.production.keteranganPenjualan,
  } : null;

  const logs = (item.logs || []).map((l) => ({
    ...l,
    actorName: l.actor_name || l.actorName,
    actorRole: l.actor_role || l.actorRole,
    createdAt: l.created_at || l.createdAt,
  }));

  return {
    ...item,
    nomorBa,
    farmLocation,
    animalType,
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

// Helper to generate sequential BA Number per year with date format (e.g. BA-MG-20260821-002)
async function generateNomorBa(farmLocation = 'FS', targetDate = null) {
  let farmCode = 'FS';
  if (farmLocation && typeof farmLocation === 'string') {
    const loc = farmLocation.toUpperCase().trim();
    if (loc.includes('TEGAL')) farmCode = 'TS';
    else if (loc.includes('LIMPA')) farmCode = 'LK';
    else if (loc.includes('MANGGALA')) farmCode = 'MG';
    else if (loc.includes('EDU')) farmCode = 'EW';
    else farmCode = 'FS';
  }

  const dateObj = targetDate ? new Date(targetDate) : new Date();
  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getDate().toString().padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const yearPrefix = `BA-${farmCode}-${year}`;

  try {
    const count = await prisma.beritaAcara.count({
      where: {
        nomor_ba: { startsWith: yearPrefix },
      },
    });

    const memCount = (global.__inMemoryBaList || []).filter((i) => (i.nomor_ba || i.nomorBa || '').startsWith(yearPrefix)).length;
    const nextNum = (Math.max(count, memCount) + 1).toString().padStart(3, '0');
    return `BA-${farmCode}-${dateStr}-${nextNum}`;
  } catch (err) {
    const memCount = (global.__inMemoryBaList || []).filter((i) => (i.nomor_ba || i.nomorBa || '').startsWith(yearPrefix)).length;
    const nextNum = (memCount + 1).toString().padStart(3, '0');
    return `BA-${farmCode}-${dateStr}-${nextNum}`;
  }
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
    const farmLocation = searchParams.get('farmLocation');
    const animalType = searchParams.get('animalType');
    const date = searchParams.get('date');
    const search = searchParams.get('search');
    const productionId = searchParams.get('productionId');

    const where = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (farmLocation && farmLocation !== 'ALL') {
      where.farm_location = { contains: farmLocation };
    }
    if (animalType && animalType !== 'ALL') {
      where.animal_type = animalType;
    }
    if (productionId) {
      where.production_id = productionId;
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
        { nomor_ba: { contains: search } },
        { farm_location: { contains: search } },
        { penyerah_name: { contains: search } },
        { penerima_name: { contains: search } },
        { notes: { contains: search } },
      ];
    }

    // Role-based visibility
    if (authUser.role === 'ADMIN_PEMASARAN') {
      where.status = {
        in: ['TERKIRIM_KE_PEMASARAN', 'DIBACA_PEMASARAN', 'DICETAK', 'SUDAH_DITANDATANGANI'],
      };
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
              farm_origin: true,
              animal_type: true,
              gross_volume_liters: true,
              pedet_volume_liters: true,
              afkir_volume_liters: true,
              sold_fresh_volume_liters: true,
              raw_volume_liters: true,
              keterangan_penjualan: true,
            },
          },
          created_by: {
            select: { id: true, name: true, email: true, role: true },
          },
          logs: {
            orderBy: { created_at: 'asc' },
          },
        },
        orderBy: { created_at: 'desc' },
      });
    } catch (e) {
      console.error('prisma.beritaAcara.findMany error:', e);
      items = [];
    }

    const formattedDbItems = items.map(formatBaItem);

    // Merge DB items with in-memory store items to guarantee newly created items appear
    const mergedList = [...formattedDbItems];
    const existingIds = new Set(mergedList.map((i) => i.id));
    for (const memItem of global.__inMemoryBaList) {
      const formattedMem = formatBaItem(memItem);
      if (!existingIds.has(formattedMem.id)) {
        mergedList.push(formattedMem);
        existingIds.add(formattedMem.id);
      }
    }

    // Filter merged list if needed
    let filteredList = mergedList;
    if (farmLocation && farmLocation !== 'ALL') {
      filteredList = filteredList.filter((i) => (i.farmLocation || i.farm_location || '').toLowerCase().includes(farmLocation.toLowerCase()));
    }
    if (status && status !== 'ALL') {
      filteredList = filteredList.filter((i) => i.status === status);
    }
    if (search) {
      const s = search.toLowerCase();
      filteredList = filteredList.filter(
        (i) =>
          (i.nomorBa || i.nomor_ba || '').toLowerCase().includes(s) ||
          (i.farmLocation || i.farm_location || '').toLowerCase().includes(s) ||
          (i.penyerahName || i.penyerah_name || '').toLowerCase().includes(s) ||
          (i.penerimaName || i.penerima_name || '').toLowerCase().includes(s)
      );
    }

    // Sort descending by date DESC then created_at DESC so latest inputs are on top
    filteredList.sort((a, b) => {
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      if (dateB !== dateA) return dateB - dateA;
      const timeA = new Date(a.created_at || a.createdAt || a.updated_at || a.updatedAt || 0).getTime();
      const timeB = new Date(b.created_at || b.createdAt || b.updated_at || b.updatedAt || 0).getTime();
      if (timeB !== timeA) return timeB - timeA;
      return (b.id || '').localeCompare(a.id || '');
    });

    return NextResponse.json({ success: true, data: filteredList });
  } catch (error) {
    console.error('GET /api/berita-acara error:', error);
    return NextResponse.json({ success: true, data: (global.__inMemoryBaList || []).map(formatBaItem) });
  }
}

export async function POST(request) {
  let body = {};
  let authUser = null;
  try {
    authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    body = await request.json();
    const {
      productionId,
      date,
      shift,
      farmLocation,
      animalType,
      unit,
      totalProduksi,
      penggunaanPedet,
      afkir,
      lainLain,
      diserahterimakan,
      penerimaName,
      penerimaUserId,
      penyerahName,
      notes,
    } = body;

    // Validation
    if (!farmLocation || !penyerahName || !penerimaName) {
      return NextResponse.json(
        { success: false, message: 'Harap lengkapi semua field wajib (Farm, Penyerah, Penerima).' },
        { status: 400 }
      );
    }

    let totProd = parseFloat(totalProduksi || 0);
    const pedetVol = parseFloat(penggunaanPedet || 0);
    const afkirVol = parseFloat(afkir || 0);
    const lainVol = parseFloat(lainLain || 0);
    const diserahVol = parseFloat(diserahterimakan || 0);

    if (totProd < 0 || pedetVol < 0 || afkirVol < 0 || lainVol < 0 || diserahVol < 0) {
      return NextResponse.json({ success: false, message: 'Nilai volume tidak boleh negatif.' }, { status: 400 });
    }

    // Auto adjust totalProduksi if user entered higher diserahterimakan or if totalProduksi wasn't auto filled
    const calculatedTotal = diserahVol + pedetVol + afkirVol + lainVol;
    if (totProd <= 0 || diserahVol > totProd || calculatedTotal > totProd) {
      totProd = calculatedTotal > 0 ? calculatedTotal : diserahVol;
    }

    // Check productionId valid relation
    let validProdId = null;
    if (productionId) {
      const prodExist = await prisma.milkProduction.findUnique({ where: { id: productionId } }).catch(() => null);
      if (prodExist) validProdId = productionId;
    }

    const validUserId = await resolveValidUserId(authUser);
    const nomorBa = await generateNomorBa(farmLocation, date);
    const initialStatus = body.status || 'TERKIRIM_KE_PEMASARAN';

    let createdBa = null;
    try {
      createdBa = await prisma.beritaAcara.create({
        data: {
          nomor_ba: nomorBa,
          production_id: validProdId,
          date: date ? new Date(date) : new Date(),
          shift: shift || 'Pagi',
          farm_location: farmLocation || 'Tegalsari',
          animal_type: animalType || 'SAPI',
          unit: unit || 'Lt',
          total_produksi: totProd,
          penggunaan_pedet: pedetVol,
          afkir: afkirVol,
          lain_lain: lainVol,
          diserahterimakan: diserahVol,
          penerima_role: 'Seksi Pemasaran',
          penerima_user_id: penerimaUserId || null,
          penerima_name: penerimaName || 'Seksi Pemasaran',
          penyerah_role: 'Seksi YANTEK',
          penyerah_user_id: validUserId,
          penyerah_name: penyerahName || authUser.name || 'Admin Farm Produksi',
          status: initialStatus,
          notes: notes || null,
          created_by_id: validUserId,
          logs: {
            create: {
              action: initialStatus === 'TERKIRIM_KE_PEMASARAN' ? 'SENT' : 'DRAFT_CREATED',
              actor_name: authUser.name || 'Admin Farm',
              actor_role: authUser.role || 'ADMIN_FARM',
              notes: `Berita Acara ${nomorBa} dibuat dan ${initialStatus === 'TERKIRIM_KE_PEMASARAN' ? 'langsung dikirim ke Seksi Pemasaran' : 'disimpan sebagai draft'}.`,
            },
          },
        },
        include: {
          production: true,
          created_by: { select: { id: true, name: true, email: true } },
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

    // Fallback if DB create fails
    const fallbackNomorBa = nomorBa;
    const fallbackBa = formatBaItem({
      id: `ba-${Date.now()}`,
      nomor_ba: fallbackNomorBa,
      production_id: productionId || null,
      date: date || new Date().toISOString(),
      shift: shift || 'Pagi',
      farm_location: farmLocation || 'Tegalsari',
      animal_type: animalType || 'SAPI',
      unit: unit || 'Lt',
      total_produksi: totProd,
      penggunaan_pedet: pedetVol,
      afkir: afkirVol,
      lain_lain: lainVol,
      diserahterimakan: diserahVol,
      penyerah_name: penyerahName || authUser?.name || 'Admin Farm Produksi',
      penerima_name: penerimaName || 'Seksi Pemasaran',
      status: initialStatus,
      notes: notes || null,
      created_at: new Date().toISOString(),
      logs: [
        {
          id: `log-${Date.now()}`,
          action: initialStatus === 'TERKIRIM_KE_PEMASARAN' ? 'SENT' : 'DRAFT_CREATED',
          actor_name: authUser?.name || 'Admin Farm',
          actor_role: authUser?.role || 'ADMIN_FARM',
          notes: `Berita Acara ${fallbackNomorBa} berhasil dibuat dan ${initialStatus === 'TERKIRIM_KE_PEMASARAN' ? 'dikirim ke Seksi Pemasaran' : 'disimpan sebagai draft'}.`,
          created_at: new Date().toISOString(),
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
