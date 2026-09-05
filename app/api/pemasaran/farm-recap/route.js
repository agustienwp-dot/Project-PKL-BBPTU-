import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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

    // 1. Fetch Realtime Milk Production directly from Database
    const dbProductions = await prisma.milkProduction.findMany({
      orderBy: { date: 'asc' },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // 2. Fetch Realtime Active BAST Documents from Database
    const activeBasts = await prisma.bastDocument.findMany({
      where: { status: { in: ['DIKIRIM_KE_FARM', 'DITERIMA'] } },
      orderBy: { tanggal: 'asc' },
    });

    // Map BAST by Date & Animal Type
    const bastByDateMap = {};
    activeBasts.forEach((b) => {
      const dStr = new Date(b.tanggal).toISOString().slice(0, 10);
      const bAnimal = (b.sumber === 'SUSU_KAMBING' || (b.catatan && b.catatan.toLowerCase().includes('kambing'))) ? 'KAMBING' : 'SAPI';
      const key = `${dStr}_${bAnimal}`;
      if (!bastByDateMap[key]) bastByDateMap[key] = [];
      const tujuanLabel = b.instansiPenerima ? ` (${b.instansiPenerima})` : '';
      const keperluanLabel = b.jenisPermintaan === 'HIBAH' ? 'Hibah' : (b.jenisPermintaan === 'PENGOLAHAN_UHT' ? 'Pengolahan UHT' : 'Distribusi');

      bastByDateMap[key].push({
        id: b.id,
        nomorBast: b.nomorBast,
        volumeLiters: b.volumeLiters || 0,
        jenisPermintaan: b.jenisPermintaan || 'PENJUALAN_LANGSUNG',
        instansiPenerima: b.instansiPenerima || '-',
        catatan: b.catatan || '',
        jenisTernak: bAnimal,
        keteranganPemakaian: `${keperluanLabel}${tujuanLabel}: ${b.volumeLiters} L`,
      });
    });

    // 3. Map Database Records to Sessions
    const sessions = dbProductions.map((p) => {
      const dateObj = new Date(p.date);
      const dateStr = dateObj.toISOString().slice(0, 10);
      const isPagi = dateObj.getHours() < 12;
      const animalType = (p.animalType || 'SAPI').toUpperCase();
      const gross = parseFloat(p.grossVolumeLiters || p.produksi) || 0;
      const pedet = parseFloat(p.pedetVolumeLiters || p.setorPedet) || 0;
      const afkir = parseFloat(p.afkirVolumeLiters || p.rusakAfkir) || 0;
      const netKandang = Math.max(0, gross - pedet - afkir);

      // Status: if >= 20th day of month, default to MENUNGGU_VERIFIKASI if not DITERIMA
      const currentStatus = p.status === 'DITERIMA' ? 'DITERIMA' : (dateObj.getDate() >= 20 ? 'MENUNGGU_VERIFIKASI' : 'DITERIMA');

      return {
        id: p.id,
        tanggal: dateStr,
        jenisTernak: animalType,
        kegiatanPerah: isPagi ? 'Pagi' : 'Sore',
        produksiSusu: gross,
        susuPedet: pedet,
        susuAfkir: afkir,
        distribusiSegar: 0, // Semua distribusi tercatat melalui BAST
        susuSiapOlah: netKandang,
        status: currentStatus,
        receivedAt: currentStatus === 'DITERIMA' ? p.date : null,
        receivedByName: currentStatus === 'DITERIMA' ? 'Admin Pemasaran' : null,
        notes: p.notes || `Perah ${isPagi ? 'Pagi' : 'Sore'} Susu ${animalType} tgl ${dateObj.getDate()} diserahkan ke pengolahan.`,
        createdAt: p.createdAt || p.date,
      };
    });

    // 4. Filtering
    let filtered = sessions;
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
          r.notes?.toLowerCase().includes(search) ||
          r.jenisTernak?.toLowerCase().includes(search)
      );
    }

    // Sort by Date (Ascending 1 - 31 Default)
    filtered.sort((a, b) => {
      const cmp = new Date(a.tanggal) - new Date(b.tanggal);
      if (cmp !== 0) return sortOrder === 'desc' ? -cmp : cmp;
      return a.kegiatanPerah === 'Pagi' ? -1 : 1;
    });

    // 5. Grouping by Date & Animal Type (1 Hari Jadi Satu - Zero Discrepancy Realtime)
    const dailyMap = {};
    filtered.forEach((r) => {
      const animalType = r.jenisTernak || 'SAPI';
      const mapKey = `${r.tanggal}_${animalType}`;

      if (!dailyMap[mapKey]) {
        const dayBasts = bastByDateMap[mapKey] || [];
        const totalBastDeduction = dayBasts.reduce((acc, b) => acc + (b.volumeLiters || 0), 0);
        const bastUsageDescriptions = dayBasts.map((b) => b.keteranganPemakaian);

        dailyMap[mapKey] = {
          tanggal: r.tanggal,
          jenisTernak: animalType,
          totalGross: 0,
          pagiGross: 0,
          pagiPedet: 0,
          pagiAfkir: 0,
          pagiSiapOlah: 0,
          soreGross: 0,
          sorePedet: 0,
          soreAfkir: 0,
          soreSiapOlah: 0,
          totalPedet: 0,
          totalAfkir: 0,
          totalDistribusi: totalBastDeduction, // Distribusi adalah total BAST
          totalSusuSiapOlah: 0,
          // BAST Allocations
          bastAllocations: dayBasts,
          totalBastDeduction,
          bastUsageDescriptions,
          sisaBersihSiapOlah: 0,
          totalKeluar: 0,
          selisih: 0,
          statusRekonsiliasi: 'SEIMBANG',
          sessions: [],
          status: 'DITERIMA',
          notes: '',
        };
      }

      const day = dailyMap[mapKey];
      day.totalGross += r.produksiSusu || 0;
      day.totalPedet += r.susuPedet || 0;
      day.totalAfkir += r.susuAfkir || 0;
      day.totalSusuSiapOlah += r.susuSiapOlah || 0;

      if (r.status === 'MENUNGGU_VERIFIKASI') {
        day.status = 'MENUNGGU_VERIFIKASI';
      }

      if (r.kegiatanPerah === 'Pagi') {
        day.pagiGross += r.produksiSusu || 0;
        day.pagiPedet += r.susuPedet || 0;
        day.pagiAfkir += r.susuAfkir || 0;
        day.pagiSiapOlah += r.susuSiapOlah || 0;
      } else {
        day.soreGross += r.produksiSusu || 0;
        day.sorePedet += r.susuPedet || 0;
        day.soreAfkir += r.susuAfkir || 0;
        day.soreSiapOlah += r.susuSiapOlah || 0;
      }

      day.sessions.push(r);
    });

    // Finalize Reconciliation (Zero Discrepancy Formula)
    let totalAllGross = 0;
    let totalAllPedet = 0;
    let totalAllAfkir = 0;
    let totalAllBastDeduction = 0;
    let totalAllNetSiapOlah = 0;

    Object.values(dailyMap).forEach((day) => {
      // Sisa Bersih Siap Olah Diterima Pengolahan = Gross - Pedet - Afkir - BAST
      day.sisaBersihSiapOlah = Math.max(0, day.totalGross - day.totalPedet - day.totalAfkir - day.totalBastDeduction);
      // Total Keluar = Pedet + Afkir + BAST + Sisa Bersih
      day.totalKeluar = day.totalPedet + day.totalAfkir + day.totalBastDeduction + day.sisaBersihSiapOlah;
      // Selisih = Gross Masuk - Total Keluar = 0 (100% PAS)
      day.selisih = day.totalGross - day.totalKeluar;
      day.statusRekonsiliasi = day.selisih === 0 ? 'SEIMBANG (0 L)' : `SELISIH ${day.selisih} L`;

      totalAllGross += day.totalGross;
      totalAllPedet += day.totalPedet;
      totalAllAfkir += day.totalAfkir;
      totalAllBastDeduction += day.totalBastDeduction;
      totalAllNetSiapOlah += day.sisaBersihSiapOlah;
    });

    const dailyList = Object.values(dailyMap).sort((a, b) => {
      if (sortOrder === 'desc') {
        return new Date(b.tanggal) - new Date(a.tanggal);
      }
      return new Date(a.tanggal) - new Date(b.tanggal);
    });

    const pendingVerificationCount = filtered.filter((r) => r.status === 'MENUNGGU_VERIFIKASI').length;
    const totalSemuaKeluar = totalAllPedet + totalAllAfkir + totalAllBastDeduction + totalAllNetSiapOlah;
    const grandSelisih = totalAllGross - totalSemuaKeluar;

    return NextResponse.json({
      success: true,
      data: filtered,
      dailyList,
      summary: {
        totalProduksiGross: totalAllGross,
        totalPedet: totalAllPedet,
        totalAfkir: totalAllAfkir,
        totalDistribusiSegar: totalAllBastDeduction,
        totalBastDeduction: totalAllBastDeduction,
        totalSusuSiapOlah: totalAllNetSiapOlah,
        netSusuFreshTersedia: totalAllNetSiapOlah,
        totalKeluar: totalSemuaKeluar,
        selisih: grandSelisih,
        statusRekonsiliasi: grandSelisih === 0 ? 'SEIMBANG (0 L)' : `SELISIH ${grandSelisih} L`,
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

    const gross = parseFloat(body.produksiSusu || body.grossVolumeLiters) || 0;
    const pedet = parseFloat(body.susuPedet || body.pedetVolumeLiters) || 0;
    const afkir = parseFloat(body.susuAfkir || body.afkirVolumeLiters) || 0;
    const net = Math.max(0, gross - pedet - afkir);
    const dateObj = body.tanggal ? new Date(body.tanggal) : new Date();

    const created = await prisma.milkProduction.create({
      data: {
        date: dateObj,
        tanggal: dateObj,
        productType: 'SEGAR',
        animalType: (body.jenisTernak || 'SAPI').toUpperCase(),
        grossVolumeLiters: gross,
        produksi: gross,
        pedetVolumeLiters: pedet,
        setorPedet: pedet,
        afkirVolumeLiters: afkir,
        rusakAfkir: afkir,
        rawVolumeLiters: net,
        kirimKePI: net,
        processedLiters: net,
        packagedQty: Math.round(net),
        notes: body.notes || `Input sesi perah ${body.kegiatanPerah || 'Pagi'}`,
        status: body.status || 'DITERIMA',
        createdById: authUser?.id || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Data perah (${gross} L) berhasil dicatat secara realtime ke database!`,
      data: created,
    });
  } catch (error) {
    console.error('POST /api/pemasaran/farm-recap error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const authUser = getAuthUser(request);
    const body = await request.json();
    const { id, action, receptionNotes, ...updates } = body;

    const existing = await prisma.milkProduction.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Data perah farm tidak ditemukan di database' }, { status: 404 });
    }

    let newStatus = existing.status;
    let newNotes = existing.notes || '';

    if (action === 'RECEIVE') {
      newStatus = 'DITERIMA';
      if (receptionNotes) newNotes = `${newNotes ? newNotes + ' | ' : ''}Catatan Verifikasi: ${receptionNotes}`;
    } else if (action === 'REQUEST_CORRECTION') {
      newStatus = 'PERLU_KOREKSI';
      if (receptionNotes) newNotes = `${newNotes ? newNotes + ' | ' : ''}Perlu Koreksi: ${receptionNotes}`;
    }

    const updated = await prisma.milkProduction.update({
      where: { id },
      data: {
        status: newStatus,
        notes: newNotes,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message:
        action === 'RECEIVE'
          ? 'Data perah farm berhasil diverifikasi & disahkan sebagai susu siap olah!'
          : action === 'REQUEST_CORRECTION'
          ? 'Catatan koreksi telah dicatat!'
          : 'Data berhasil diperbarui!',
      data: updated,
    });
  } catch (error) {
    console.error('PUT /api/pemasaran/farm-recap error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
