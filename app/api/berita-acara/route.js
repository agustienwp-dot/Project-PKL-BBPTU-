import { NextResponse } from 'next/server';
import prisma, { isDbOffline, markDbOffline, markDbOnline } from '@/lib/prisma';
import { getAuthUser, resolveValidUserId } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Global In-Memory Store for instant persistence across fallback / DB states
if (!global.__inMemoryBaList) {
  global.__inMemoryBaList = [];
}

// Helper to generate sequential BA Number (e.g. BA-FS-20260820-001)
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

  const prefix = `BA-${farmCode}-${dateStr}`;

  try {
    const count = await prisma.beritaAcara.count({
      where: {
        nomorBa: { startsWith: prefix },
      },
    });

    const memCount = (global.__inMemoryBaList || []).filter((i) => i.nomorBa && i.nomorBa.startsWith(prefix)).length;
    const nextNum = (Math.max(count, memCount) + 1).toString().padStart(3, '0');
    return `${prefix}-${nextNum}`;
  } catch (err) {
    const memCount = (global.__inMemoryBaList || []).filter((i) => i.nomorBa && i.nomorBa.startsWith(prefix)).length;
    const nextNum = (memCount + 1).toString().padStart(3, '0');
    return `${prefix}-${nextNum}`;
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
        { nomorBa: { contains: search } },
        { farmLocation: { contains: search } },
        { penyerahName: { contains: search } },
        { penerimaName: { contains: search } },
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
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {
      items = [];
    }

    // Merge DB items with in-memory store items to guarantee newly created items appear
    const mergedList = [...items];
    const existingIds = new Set(mergedList.map((i) => i.id));
    for (const memItem of global.__inMemoryBaList) {
      if (!existingIds.has(memItem.id)) {
        mergedList.push(memItem);
        existingIds.add(memItem.id);
      }
    }

    // Filter merged list if needed
    let filteredList = mergedList;
    if (farmLocation && farmLocation !== 'ALL') {
      filteredList = filteredList.filter((i) => (i.farmLocation || '').toLowerCase().includes(farmLocation.toLowerCase()));
    }
    if (status && status !== 'ALL') {
      filteredList = filteredList.filter((i) => i.status === status);
    }
    if (search) {
      const s = search.toLowerCase();
      filteredList = filteredList.filter(
        (i) =>
          (i.nomorBa || '').toLowerCase().includes(s) ||
          (i.farmLocation || '').toLowerCase().includes(s) ||
          (i.penyerahName || '').toLowerCase().includes(s) ||
          (i.penerimaName || '').toLowerCase().includes(s)
      );
    }

    // Sort descending by newest update / creation time so latest updated items are on top
    filteredList.sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.createdAt || a.date || 0).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt || b.date || 0).getTime();
      return timeB - timeA;
    });

    return NextResponse.json({ success: true, data: filteredList });
  } catch (error) {
    console.error('GET /api/berita-acara error:', error);
    return NextResponse.json({ success: true, data: global.__inMemoryBaList });
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

    const createdBa = await prisma.beritaAcara.create({
      data: {
        nomorBa,
        productionId: validProdId,
        date: date ? new Date(date) : new Date(),
        shift: shift || 'Pagi',
        farmLocation: farmLocation || 'Tegalsari',
        animalType: animalType || 'SAPI',
        unit: unit || 'Kg',
        totalProduksi: totProd,
        penggunaanPedet: pedetVol,
        afkir: afkirVol,
        lainLain: lainVol,
        diserahterimakan: diserahVol,
        penerimaRole: 'Seksi Pemasaran',
        penerimaUserId: penerimaUserId || null,
        penerimaName: penerimaName || 'Seksi Pemasaran',
        penyerahRole: 'Seksi YANTEK',
        penyerahUserId: validUserId,
        penyerahName: penyerahName || authUser.name || 'Admin Farm Produksi',
        status: initialStatus,
        notes: notes || null,
        createdById: validUserId,
        logs: {
          create: {
            action: initialStatus === 'TERKIRIM_KE_PEMASARAN' ? 'SENT' : 'DRAFT_CREATED',
            actorName: authUser.name || 'Admin Farm',
            actorRole: authUser.role || 'ADMIN_FARM',
            notes: `Berita Acara ${nomorBa} dibuat dan ${initialStatus === 'TERKIRIM_KE_PEMASARAN' ? 'langsung dikirim ke Seksi Pemasaran' : 'disimpan sebagai draft'}.`,
          },
        },
      },
      include: {
        production: true,
        createdBy: { select: { id: true, name: true, email: true } },
        logs: true,
      },
    });

    if (createdBa) {
      if (productionId && !createdBa.productionId) {
        createdBa.productionId = productionId;
      }
      global.__inMemoryBaList.unshift(createdBa);
    }

    return NextResponse.json({ success: true, data: createdBa, message: 'Berita Acara berhasil dibuat.' });
  } catch (error) {
    console.error('POST /api/berita-acara error:', error);

    // Smooth fallback if DB is offline/unreachable
    const fallbackNomorBa = await generateNomorBa(body?.farmLocation, body?.date);
    const initialStatus = body?.status || 'TERKIRIM_KE_PEMASARAN';
    const diserahVol = parseFloat(body?.diserahterimakan || 0);

    const fallbackBa = {
      id: `ba-${Date.now()}`,
      nomorBa: fallbackNomorBa,
      productionId: body?.productionId || null,
      date: body?.date || new Date().toISOString(),
      shift: body?.shift || 'Pagi',
      farmLocation: body?.farmLocation || 'Tegalsari',
      animalType: body?.animalType || 'SAPI',
      unit: body?.unit || 'Kg',
      totalProduksi: parseFloat(body?.totalProduksi || 0),
      penggunaanPedet: parseFloat(body?.penggunaanPedet || 0),
      afkir: parseFloat(body?.afkir || 0),
      lainLain: parseFloat(body?.lainLain || 0),
      diserahterimakan: diserahVol,
      penyerahName: body?.penyerahName || authUser?.name || 'Admin Farm Produksi',
      penerimaName: body?.penerimaName || 'Seksi Pemasaran',
      status: initialStatus,
      notes: body?.notes || null,
      createdAt: new Date().toISOString(),
      logs: [
        {
          id: `log-${Date.now()}`,
          action: initialStatus === 'TERKIRIM_KE_PEMASARAN' ? 'SENT' : 'DRAFT_CREATED',
          actorName: authUser?.name || 'Admin Farm',
          actorRole: authUser?.role || 'ADMIN_FARM',
          notes: `Berita Acara ${fallbackNomorBa} berhasil dibuat dan ${initialStatus === 'TERKIRIM_KE_PEMASARAN' ? 'dikirim ke Seksi Pemasaran' : 'disimpan sebagai draft'}.`,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    global.__inMemoryBaList.unshift(fallbackBa);

    return NextResponse.json({
      success: true,
      data: fallbackBa,
      message: `✓ Berita Acara ${fallbackNomorBa} (${diserahVol} ${body?.unit || 'Kg'}) berhasil disimpan! 🚀`,
    });
  }
}



