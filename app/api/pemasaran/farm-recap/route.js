import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function calculateItemNet(item) {
  const produksi = parseFloat(item.produksiSusu) || 0;
  const pedet = parseFloat(item.susuPedet) || 0;
  const afkir = parseFloat(item.susuAfkir) || 0;
  const dist = parseFloat(item.distribusiSegar) || 0;
  const net = Math.max(0, produksi - pedet - afkir - dist);

  return {
    ...item,
    produksiSusu: produksi,
    susuPedet: pedet,
    susuAfkir: afkir,
    distribusiSegar: dist,
    susuSiapOlah: net,
  };
}

// Generate 31 full days of morning and afternoon perah sessions for August 2026
function generateMonthlyFarmSessions() {
  const sessions = [];
  const baseYear = 2026;

  for (let day = 1; day <= 31; day++) {
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const dateStr = `${baseYear}-08-${dayStr}`;

    const factor = 1 + ((day % 5) - 2) * 0.05;

    const tgs = Math.round(120 * factor);
    const lpk = Math.round(150 * factor);
    const mgl = Math.round(110 * factor);
    const totalPengambilan = tgs + lpk + mgl; // EXACT Pengambilan Susu Segar in Pengolahan

    const pagiSiapOlah = Math.floor(totalPengambilan / 2);
    const soreSiapOlah = totalPengambilan - pagiSiapOlah;

    const pedetPagi = Math.round(18 * factor);
    const afkirPagi = Math.round(4 * factor);
    const distPagi = Math.round(14 * factor);
    const grossPagi = pagiSiapOlah + pedetPagi + afkirPagi + distPagi;

    const pedetSore = Math.round(18 * factor);
    const afkirSore = Math.round(4 * factor);
    const distSore = Math.round(14 * factor);
    const grossSore = soreSiapOlah + pedetSore + afkirSore + distSore;

    // Sesi Pagi (Net: pagiSiapOlah)
    sessions.push({
      id: `frm-${dayStr}-pagi`,
      tanggal: dateStr,
      jenisTernak: 'SAPI',
      kegiatanPerah: 'Pagi',
      produksiSusu: grossPagi,
      susuPedet: pedetPagi,
      susuAfkir: afkirPagi,
      distribusiSegar: distPagi,
      rincianPembeli: 'Kantin Karyawan & Pelanggan Pagi',
      susuSiapOlah: pagiSiapOlah,
      status: day >= 20 ? 'MENUNGGU_VERIFIKASI' : 'DITERIMA',
      receivedAt: day < 20 ? new Date(`${dateStr}T10:00:00Z`).toISOString() : null,
      receivedByName: day < 20 ? 'Admin Pemasaran' : null,
      notes: `Perah pagi tanggal ${day} Agustus 2026 diserahkan ke pengolahan.`,
      createdAt: new Date(`${dateStr}T07:30:00Z`).toISOString(),
    });

    // Sesi Sore (Net: soreSiapOlah) -> Total Harian = totalPengambilan (0 Selisih)
    sessions.push({
      id: `frm-${dayStr}-sore`,
      tanggal: dateStr,
      jenisTernak: 'SAPI',
      kegiatanPerah: 'Sore',
      produksiSusu: grossSore,
      susuPedet: pedetSore,
      susuAfkir: afkirSore,
      distribusiSegar: distSore,
      rincianPembeli: 'Pembeli Sore Langsung',
      susuSiapOlah: soreSiapOlah,
      status: day >= 20 ? 'MENUNGGU_VERIFIKASI' : 'DITERIMA',
      receivedAt: day < 20 ? new Date(`${dateStr}T17:30:00Z`).toISOString() : null,
      receivedByName: day < 20 ? 'Admin Pemasaran' : null,
      notes: `Perah sore tanggal ${day} Agustus 2026.`,
      createdAt: new Date(`${dateStr}T16:00:00Z`).toISOString(),
    });
  }

  return sessions;
}

let farmSessionsStore = generateMonthlyFarmSessions();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const animal = searchParams.get('animal');
    const session = searchParams.get('session');
    const status = searchParams.get('status');
    const search = (searchParams.get('search') || '').toLowerCase();
    const sortOrder = searchParams.get('sortOrder') || 'asc'; // Default ascending 1-31

    // Always ensure fresh baseline
    if (!farmSessionsStore || farmSessionsStore.length === 0) {
      farmSessionsStore = generateMonthlyFarmSessions();
    }

    // Fetch verified BAST documents from database for automatic deductions
    let verifiedBasts = [];
    try {
      verifiedBasts = await prisma.bastDocument.findMany({
        where: { status: 'DITERIMA' },
        orderBy: { tanggal: 'asc' },
      });
    } catch (e) {
      console.warn('Could not query database BASTs, using fallback:', e.message);
    }

    // Map verified BAST by Date
    const bastByDateMap = {};
    verifiedBasts.forEach((b) => {
      const dStr = new Date(b.tanggal).toISOString().slice(0, 10);
      if (!bastByDateMap[dStr]) bastByDateMap[dStr] = [];
      bastByDateMap[dStr].push({
        id: b.id,
        nomorBast: b.nomorBast,
        volumeLiters: b.volumeLiters || 0,
        jenisPermintaan: b.jenisPermintaan || 'PENJUALAN_LANGSUNG',
        instansiPenerima: b.instansiPenerima || 'Umum',
        catatan: b.catatan || '',
        keteranganPemakaian: `Dipakai untuk ${b.jenisPermintaan === 'HIBAH' ? 'Hibah' : 'Penjualan Langsung'} (${b.instansiPenerima}): ${b.volumeLiters} Liter`,
      });
    });

    let filtered = farmSessionsStore.map(calculateItemNet);

    if (status && status !== 'ALL') {
      filtered = filtered.filter((r) => r.status === status);
    }
    if (animal && animal !== 'ALL') {
      filtered = filtered.filter((r) => r.jenisTernak?.toUpperCase() === animal.toUpperCase());
    }
    if (session && session !== 'ALL') {
      filtered = filtered.filter((r) => r.kegiatanPerah?.toLowerCase() === session.toLowerCase());
    }
    if (startDate) {
      filtered = filtered.filter((r) => r.tanggal >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter((r) => r.tanggal <= endDate);
    }
    if (search) {
      filtered = filtered.filter(
        (r) =>
          r.tanggal.includes(search) ||
          r.rincianPembeli?.toLowerCase().includes(search) ||
          r.notes?.toLowerCase().includes(search)
      );
    }

    // Sort by date: Ascending (Tanggal 1 s/d 31)
    filtered.sort((a, b) => {
      const cmp = new Date(a.tanggal) - new Date(b.tanggal);
      if (cmp !== 0) return sortOrder === 'desc' ? -cmp : cmp;
      return a.kegiatanPerah === 'Pagi' ? -1 : 1;
    });

    // Summary calculations
    const totalProduksiGross = filtered.reduce((sum, r) => sum + (r.produksiSusu || 0), 0);
    const pagiRecords = filtered.filter((r) => r.kegiatanPerah === 'Pagi');
    const soreRecords = filtered.filter((r) => r.kegiatanPerah === 'Sore');

    const totalPagiGross = pagiRecords.reduce((sum, r) => sum + (r.produksiSusu || 0), 0);
    const totalPagiSiapOlah = pagiRecords.reduce((sum, r) => sum + (r.susuSiapOlah || 0), 0);

    const totalSoreGross = soreRecords.reduce((sum, r) => sum + (r.produksiSusu || 0), 0);
    const totalSoreSiapOlah = soreRecords.reduce((sum, r) => sum + (r.susuSiapOlah || 0), 0);

    const totalDistribusiSegar = filtered.reduce((sum, r) => sum + (r.distribusiSegar || 0), 0);
    const totalPedet = filtered.reduce((sum, r) => sum + (r.susuPedet || 0), 0);
    const totalAfkir = filtered.reduce((sum, r) => sum + (r.susuAfkir || 0), 0);
    const totalSusuSiapOlah = filtered.reduce((sum, r) => sum + (r.susuSiapOlah || 0), 0);

    // Grouping by Date (Daily Unified Aggregation with BAST Automatic Deductions)
    const dailyMap = {};
    filtered.forEach((r) => {
      if (!dailyMap[r.tanggal]) {
        const dayBasts = bastByDateMap[r.tanggal] || [];
        const totalBastDeduction = dayBasts.reduce((acc, b) => acc + (b.volumeLiters || 0), 0);
        const bastUsageDescriptions = dayBasts.map((b) => b.keteranganPemakaian);

        dailyMap[r.tanggal] = {
          tanggal: r.tanggal,
          jenisTernak: r.jenisTernak,
          totalGross: 0,
          pagiGross: 0,
          pagiPedet: 0,
          pagiAfkir: 0,
          pagiDistribusi: 0,
          pagiSiapOlah: 0,
          soreGross: 0,
          sorePedet: 0,
          soreAfkir: 0,
          soreDistribusi: 0,
          soreSiapOlah: 0,
          totalPedet: 0,
          totalAfkir: 0,
          totalDistribusi: 0,
          totalSusuSiapOlah: 0,
          // BAST Automations
          bastAllocations: dayBasts,
          totalBastDeduction,
          bastUsageDescriptions,
          sisaBersihSiapOlah: 0, // Calculated below
          sessions: [],
          status: 'DITERIMA',
          notes: '',
        };
      }

      const day = dailyMap[r.tanggal];
      day.totalGross += r.produksiSusu || 0;
      day.totalPedet += r.susuPedet || 0;
      day.totalAfkir += r.susuAfkir || 0;
      day.totalDistribusi += r.distribusiSegar || 0;
      day.totalSusuSiapOlah += r.susuSiapOlah || 0;

      if (r.status === 'MENUNGGU_VERIFIKASI') {
        day.status = 'MENUNGGU_VERIFIKASI';
      }

      if (r.kegiatanPerah === 'Pagi') {
        day.pagiGross += r.produksiSusu || 0;
        day.pagiPedet += r.susuPedet || 0;
        day.pagiAfkir += r.susuAfkir || 0;
        day.pagiDistribusi += r.distribusiSegar || 0;
        day.pagiSiapOlah += r.susuSiapOlah || 0;
      } else {
        day.soreGross += r.produksiSusu || 0;
        day.sorePedet += r.susuPedet || 0;
        day.soreAfkir += r.susuAfkir || 0;
        day.soreDistribusi += r.distribusiSegar || 0;
        day.soreSiapOlah += r.susuSiapOlah || 0;
      }

      day.sessions.push(r);
    });

    // Finalize Net Available after BAST Deductions
    let totalAllBastDeduction = 0;
    Object.values(dailyMap).forEach((day) => {
      day.sisaBersihSiapOlah = Math.max(0, day.totalSusuSiapOlah - day.totalBastDeduction);
      totalAllBastDeduction += day.totalBastDeduction;
    });

    const dailyList = Object.values(dailyMap).sort((a, b) => {
      if (sortOrder === 'desc') {
        return new Date(b.tanggal) - new Date(a.tanggal);
      }
      return new Date(a.tanggal) - new Date(b.tanggal);
    });

    const pendingVerificationCount = filtered.filter((r) => r.status === 'MENUNGGU_VERIFIKASI').length;

    return NextResponse.json({
      success: true,
      data: filtered,
      dailyList,
      summary: {
        totalProduksiGross,
        totalPagiGross,
        totalPagiSiapOlah,
        totalSoreGross,
        totalSoreSiapOlah,
        totalDistribusiSegar,
        totalPedet,
        totalAfkir,
        totalSusuSiapOlah,
        totalBastDeduction: totalAllBastDeduction,
        netSusuFreshTersedia: Math.max(0, totalSusuSiapOlah - totalAllBastDeduction),
        pendingVerificationCount,
      },
    });
  } catch (error) {
    console.error('GET /api/pemasaran/farm-recap error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    const body = await request.json();

    const calculated = calculateItemNet({
      ...body,
      id: `frm-${Date.now()}`,
      status: body.status || 'MENUNGGU_VERIFIKASI',
      createdAt: new Date().toISOString(),
    });

    farmSessionsStore.push(calculated);
    farmSessionsStore.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));

    return NextResponse.json({
      success: true,
      message: `Data perah ${calculated.kegiatanPerah} (${calculated.produksiSusu} L) berhasil dicatat!`,
      data: calculated,
    });
  } catch (error) {
    console.error('POST /api/pemasaran/farm-recap error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const authUser = getAuthUser(request);
    const body = await request.json();
    const { id, action, receptionNotes, ...updates } = body;

    const index = farmSessionsStore.findIndex((r) => r.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, message: 'Data perah farm tidak ditemukan' }, { status: 404 });
    }

    let item = farmSessionsStore[index];

    if (action === 'RECEIVE') {
      item.status = 'DITERIMA';
      item.receivedAt = new Date().toISOString();
      item.receivedByName = authUser?.name || 'Admin Pemasaran';
      if (receptionNotes) item.notes = `${item.notes ? item.notes + ' | ' : ''}Catatan Verifikasi: ${receptionNotes}`;
    } else if (action === 'REQUEST_CORRECTION') {
      item.status = 'PERLU_KOREKSI';
      if (receptionNotes) item.notes = `${item.notes ? item.notes + ' | ' : ''}Perlu Koreksi: ${receptionNotes}`;
    } else {
      const recalculated = calculateItemNet({
        ...item,
        ...updates,
      });
      item = { ...item, ...recalculated };
    }

    farmSessionsStore[index] = item;

    return NextResponse.json({
      success: true,
      message:
        action === 'RECEIVE'
          ? 'Data perah farm berhasil diverifikasi & disahkan sebagai susu siap olah!'
          : action === 'REQUEST_CORRECTION'
          ? 'Catatan koreksi telah dicatat!'
          : 'Data berhasil diperbarui!',
      data: item,
    });
  } catch (error) {
    console.error('PUT /api/pemasaran/farm-recap error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
