import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Helper calculation
function computeRowTotals(data) {
  const farmTgs = parseFloat(data.farmTgs) || 0;
  const farmLpk = parseFloat(data.farmLpk) || 0;
  const farmMgl = parseFloat(data.farmMgl) || 0;
  const totalPengambilan = farmTgs + farmLpk + farmMgl;

  const susu115ml = parseInt(data.susu115ml, 10) || 0;
  const susu130ml = parseInt(data.susu130ml, 10) || 0;
  const susu200ml = parseInt(data.susu200ml, 10) || 0;
  const susu250ml = parseInt(data.susu250ml, 10) || 0;
  const yogurt200ml = parseInt(data.yogurt200ml, 10) || 0;
  const totalPengolahan = susu115ml + susu130ml + susu200ml + susu250ml + yogurt200ml;

  const eduwisata115ml = parseInt(data.eduwisata115ml, 10) || 0;
  const eduwisata250ml = parseInt(data.eduwisata250ml, 10) || 0;
  const spp115ml = parseInt(data.spp115ml, 10) || 0;
  const spp200ml = parseInt(data.spp200ml, 10) || 0;
  const lainSusu115ml = parseInt(data.lainSusu115ml, 10) || 0;
  const lainSusu250ml = parseInt(data.lainSusu250ml, 10) || 0;
  const lainYogurt200ml = parseInt(data.lainYogurt200ml, 10) || 0;
  const hibahInternal115ml = parseInt(data.hibahInternal115ml, 10) || 0;
  const hibahEksternal200ml = parseInt(data.hibahEksternal200ml, 10) || 0;

  const totalDistribusi =
    eduwisata115ml +
    eduwisata250ml +
    spp115ml +
    spp200ml +
    lainSusu115ml +
    lainSusu250ml +
    lainYogurt200ml +
    hibahInternal115ml +
    hibahEksternal200ml;

  const rusakAfkir = parseInt(data.rusakAfkir, 10) || 0;

  const sisaSusu115ml = Math.max(0, susu115ml - (eduwisata115ml + spp115ml + lainSusu115ml + hibahInternal115ml));
  const sisaSusu250ml = Math.max(0, susu250ml - (eduwisata250ml + lainSusu250ml));
  const sisaYogurt = Math.max(0, yogurt200ml - lainYogurt200ml);

  const jumlahStok = Math.max(0, totalPengolahan - totalDistribusi - rusakAfkir);

  return {
    ...data,
    farmTgs,
    farmLpk,
    farmMgl,
    totalPengambilan,
    susu115ml,
    susu130ml,
    susu200ml,
    susu250ml,
    yogurt200ml,
    totalPengolahan,
    eduwisata115ml,
    eduwisata250ml,
    spp115ml,
    spp200ml,
    lainSusu115ml,
    lainSusu250ml,
    lainYogurt200ml,
    hibahInternal115ml,
    hibahEksternal200ml,
    totalDistribusi,
    rusakAfkir,
    sisaSusu115ml,
    sisaSusu250ml,
    sisaYogurt,
    jumlahStok,
  };
}

function generate7DaysRecords() {
  const records = [];
  const baseYear = 2026;
  const baseMonth = 9; // September

  for (let day = 1; day <= 7; day++) {
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const dateStr = `${baseYear}-09-${dayStr}`;

    const factor = 1 + ((day % 3) - 1) * 0.05;
    const tgs = Math.round(120 * factor);
    const lpk = Math.round(150 * factor);
    const mgl = Math.round(110 * factor);

    const s115 = Math.round(450 * factor);
    const s130 = Math.round(200 * factor);
    const s200 = Math.round(300 * factor);
    const s250 = Math.round(500 * factor);
    const y200 = Math.round(250 * factor);

    const edu115 = Math.round(100 * factor);
    const edu250 = Math.round(120 * factor);
    const spp115 = Math.round(80 * factor);
    const spp200 = Math.round(90 * factor);
    const lain115 = Math.round(50 * factor);
    const lain250 = Math.round(60 * factor);
    const lainYog = Math.round(70 * factor);
    const hibInt = Math.round(30 * factor);
    const hibEks = Math.round(40 * factor);
    const rusak = day % 2 === 0 ? 10 : 5;

    const row = computeRowTotals({
      id: `rep-202609-${dayStr}`,
      tanggal: dateStr,
      farmTgs: tgs,
      farmLpk: lpk,
      farmMgl: mgl,
      susu115ml: s115,
      susu130ml: s130,
      susu200ml: s200,
      susu250ml: s250,
      yogurt200ml: y200,
      eduwisata115ml: edu115,
      eduwisata250ml: edu250,
      spp115ml: spp115,
      spp200ml: spp200,
      lainSusu115ml: lain115,
      lainSusu250ml: lain250,
      lainYogurt200ml: lainYog,
      hibahInternal115ml: hibInt,
      hibahEksternal200ml: hibEks,
      rusakAfkir: rusak,
      status: 'DITERIMA',
      receivedAt: new Date(`${dateStr}T14:30:00Z`).toISOString(),
      receivedByName: 'Admin Pemasaran',
      notes: `Laporan pengolahan & distribusi harian tanggal ${day} September 2026.`,
      createdAt: new Date(`${dateStr}T08:00:00Z`).toISOString(),
    });

    records.push(row);
  }

  return records;
}

let customReportStore = generate7DaysRecords();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const search = (searchParams.get('search') || '').toLowerCase();
    const sortOrder = searchParams.get('sortOrder') || 'asc'; // Default ascending 1-31

    // Attempt to enrich from prisma if available
    let dbPackagings = [];
    try {
      dbPackagings = await prisma.milkPackaging.findMany({
        orderBy: { date: 'asc' },
        include: {
          category: true,
          createdBy: { select: { id: true, name: true, email: true } },
        },
      });
    } catch (err) {
      console.warn('Prisma milkPackaging query fallback to standard report structure');
    }

    let combined = [...customReportStore];

    // Filter by status
    let filtered = combined.map(computeRowTotals);

    if (status && status !== 'ALL') {
      filtered = filtered.filter((r) => r.status === status);
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
          r.tanggal.toLowerCase().includes(search) ||
          (r.notes && r.notes.toLowerCase().includes(search)) ||
          (r.receivedByName && r.receivedByName.toLowerCase().includes(search))
      );
    }

    // Sort by tanggal: ASCENDING by default (tanggal 1 sampai 31)
    filtered.sort((a, b) => {
      if (sortOrder === 'desc') {
        return new Date(b.tanggal) - new Date(a.tanggal);
      }
      return new Date(a.tanggal) - new Date(b.tanggal);
    });

    // Calculate Summary Accumulation
    const summary = filtered.reduce(
      (acc, r) => {
        acc.farmTgs += r.farmTgs || 0;
        acc.farmLpk += r.farmLpk || 0;
        acc.farmMgl += r.farmMgl || 0;
        acc.totalPengambilan += r.totalPengambilan || 0;

        acc.susu115ml += r.susu115ml || 0;
        acc.susu130ml += r.susu130ml || 0;
        acc.susu200ml += r.susu200ml || 0;
        acc.susu250ml += r.susu250ml || 0;
        acc.yogurt200ml += r.yogurt200ml || 0;
        acc.totalPengolahan += r.totalPengolahan || 0;

        acc.eduwisata115ml += r.eduwisata115ml || 0;
        acc.eduwisata250ml += r.eduwisata250ml || 0;
        acc.spp115ml += r.spp115ml || 0;
        acc.spp200ml += r.spp200ml || 0;
        acc.lainSusu115ml += r.lainSusu115ml || 0;
        acc.lainSusu250ml += r.lainSusu250ml || 0;
        acc.lainYogurt200ml += r.lainYogurt200ml || 0;
        acc.hibahInternal115ml += r.hibahInternal115ml || 0;
        acc.hibahEksternal200ml += r.hibahEksternal200ml || 0;
        acc.totalDistribusi += r.totalDistribusi || 0;

        acc.rusakAfkir += r.rusakAfkir || 0;
        acc.sisaSusu115ml += r.sisaSusu115ml || 0;
        acc.sisaSusu250ml += r.sisaSusu250ml || 0;
        acc.sisaYogurt += r.sisaYogurt || 0;
        acc.jumlahStok += r.jumlahStok || 0;
        return acc;
      },
      {
        farmTgs: 0,
        farmLpk: 0,
        farmMgl: 0,
        totalPengambilan: 0,
        susu115ml: 0,
        susu130ml: 0,
        susu200ml: 0,
        susu250ml: 0,
        yogurt200ml: 0,
        totalPengolahan: 0,
        eduwisata115ml: 0,
        eduwisata250ml: 0,
        spp115ml: 0,
        spp200ml: 0,
        lainSusu115ml: 0,
        lainSusu250ml: 0,
        lainYogurt200ml: 0,
        hibahInternal115ml: 0,
        hibahEksternal200ml: 0,
        totalDistribusi: 0,
        rusakAfkir: 0,
        sisaSusu115ml: 0,
        sisaSusu250ml: 0,
        sisaYogurt: 0,
        jumlahStok: 0,
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Berhasil mengambil rekapitulasi pengemasan dan distribusi susu.',
      data: filtered,
      summary,
      totalRecords: filtered.length,
      pendingCount: filtered.filter((r) => r.status === 'MENUNGGU_PENERIMAAN').length,
    });
  } catch (error) {
    console.error('GET /api/pemasaran/pengemasan-report error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil rekapitulasi pengemasan.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    const body = await request.json();

    const newReport = computeRowTotals({
      id: `rep-${Date.now()}`,
      ...body,
      status: body.status || 'MENUNGGU_PENERIMAAN',
      createdAt: new Date().toISOString(),
    });

    customReportStore.push(newReport);
    customReportStore.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));

    if (authUser) {
      try {
        await prisma.systemLog.create({
          data: {
            userId: authUser.id,
            userEmail: authUser.email,
            action: 'CREATE_PENGEMASAN_REPORT',
            details: `Input laporan pengolahan & distribusi tanggal ${newReport.tanggal}: Pengolahan ${newReport.totalPengolahan} botol, Distribusi ${newReport.totalDistribusi} botol`,
          },
        });
      } catch (e) {}
    }

    return NextResponse.json({
      success: true,
      message: `Laporan pengolahan & distribusi tanggal ${newReport.tanggal} berhasil dicatat!`,
      data: newReport,
    });
  } catch (error) {
    console.error('POST /api/pemasaran/pengemasan-report error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menambahkan laporan pengemasan.' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const authUser = getAuthUser(request);
    const body = await request.json();
    const { id, action, receptionNotes, ...updates } = body;

    const index = customReportStore.findIndex((r) => r.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, message: 'Data laporan tidak ditemukan' }, { status: 404 });
    }

    let item = customReportStore[index];

    if (action === 'RECEIVE') {
      item.status = 'DITERIMA';
      item.receivedAt = new Date().toISOString();
      item.receivedByName = authUser?.name || 'Admin Pemasaran';
      if (receptionNotes) {
        item.notes = `${item.notes ? item.notes + ' | ' : ''}Catatan Penerimaan: ${receptionNotes}`;
      }

      if (authUser) {
        try {
          await prisma.systemLog.create({
            data: {
              userId: authUser.id,
              userEmail: authUser.email,
              action: 'RECEIVE_PENGEMASAN_REPORT',
              details: `Admin Pemasaran mengesahkan laporan pengolahan ${item.tanggal}: ${item.jumlahStok} botol stok disahkan`,
            },
          });
        } catch (e) {}
      }
    } else if (action === 'REQUEST_CORRECTION') {
      item.status = 'PERLU_KOREKSI';
      if (receptionNotes) {
        item.notes = `${item.notes ? item.notes + ' | ' : ''}Perlu Koreksi: ${receptionNotes}`;
      }
    } else {
      const recalculated = computeRowTotals({
        ...item,
        ...updates,
      });
      item = { ...item, ...recalculated };
    }

    customReportStore[index] = item;

    return NextResponse.json({
      success: true,
      message:
        action === 'RECEIVE'
          ? 'Laporan hasil pengolahan & distribusi berhasil diterima dan disahkan ke stok pemasaran!'
          : action === 'REQUEST_CORRECTION'
          ? 'Permintaan koreksi telah dikirim ke bagian Pengemasan!'
          : 'Data laporan berhasil diperbarui!',
      data: item,
    });
  } catch (error) {
    console.error('PUT /api/pemasaran/pengemasan-report error:', error);
    return NextResponse.json({ success: false, message: 'Gagal memperbarui laporan pengemasan.' }, { status: 500 });
  }
}
