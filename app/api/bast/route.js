import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function formatBastDoc(item) {
  if (!item) return item;
  const nomorBast = item.nomorBA || item.nomorBa || item.nomorBast;
  const tanggal = item.date || item.tanggal || item.createdAt;
  const volumeLiters = item.diserahterimakan ?? item.totalProduksi ?? item.volumeLiters ?? 0;
  const jenisPermintaan = item.type || item.jenisPermintaan || 'HIBAH';
  const instansiPenerima = item.receiverName || item.penerimaName || item.purpose || item.instansiPenerima || 'Instansi / Yayasan Penerima';
  const penerimaNama = item.receiverName || item.penerimaName || instansiPenerima;
  const pengirimNama = item.giverName || item.penyerahName || item.pengirimNama || 'Tim Kerja Layanan Pemasaran';
  const catatan = item.notes || item.catatan || '';
  const animalType = (item.animalType || item.animal_type || 'SAPI').toUpperCase();
  const sumber = animalType === 'KAMBING' ? 'SUSU_KAMBING' : 'SUSU_SAPI';

  return {
    ...item,
    id: item.id,
    nomorBast,
    nomorBa: nomorBast,
    nomorBA: nomorBast,
    tanggal,
    date: tanggal,
    volumeLiters,
    diserahterimakan: volumeLiters,
    totalProduksi: item.totalProduksi ?? volumeLiters,
    jenisPermintaan,
    type: jenisPermintaan,
    instansiPenerima,
    penerimaNama,
    receiverName: penerimaNama,
    pengirimNama,
    giverName: pengirimNama,
    catatan,
    notes: catatan,
    animalType,
    sumber,
    status: item.status || 'DITERIMA',
  };
}

export async function GET(request) {
  try {
    const authUser = getAuthUser(request);
    const allowed = ['ADMIN_FARM', 'ADMIN_PEMASARAN', 'ADMIN_PENGEMASAN', 'SUPERADMIN'];
    if (!authUser || !requireRole(authUser, allowed)) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Peran tidak diizinkan.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    const whereClause = {};
    if (status) {
      whereClause.status = status.toUpperCase();
    }
    if (type) {
      whereClause.type = type.toUpperCase();
    }
    if (search) {
      whereClause.OR = [
        { nomorBA: { contains: search } },
        { notes: { contains: search } },
        { penerimaName: { contains: search } },
        { penyerahName: { contains: search } },
        { purpose: { contains: search } },
      ];
    }

    const docs = await prisma.beritaAcara.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    const formatted = docs.map(formatBastDoc);

    return NextResponse.json({
      success: true,
      message: 'Berhasil mengambil daftar Surat BAST.',
      data: formatted,
    });
  } catch (error) {
    console.error('Error GET /api/bast:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data Surat BAST.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    const allowed = ['ADMIN_PEMASARAN', 'ADMIN_FARM', 'ADMIN_PENGEMASAN', 'SUPERADMIN'];
    if (!authUser || !requireRole(authUser, allowed)) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak: Hanya Admin Pemasaran, Admin Farm, atau Superadmin yang dapat menerbitkan BAST.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      tanggal,
      volumeLiters,
      jenisPermintaan,
      instansiPenerima,
      pengirimNama,
      catatan,
      productionId,
    } = body;

    const numVolume = parseFloat(volumeLiters);
    if (isNaN(numVolume) || numVolume <= 0) {
      return NextResponse.json(
        { success: false, message: 'Volume susu segar (Liter) wajib diisi dan bernilai > 0.' },
        { status: 400 }
      );
    }

    const animal = (body.animalType || body.jenisTernak || (body.sumber === 'SUSU_KAMBING' ? 'KAMBING' : 'SAPI')).toUpperCase();
    const isPemasaran = authUser.role === 'ADMIN_PEMASARAN' || !authUser.role?.includes('FARM');
    const isUhtReq = jenisPermintaan === 'PENGOLAHAN_UHT' || jenisPermintaan === 'PERMINTAAN_PENGOLAHAN_UHT';

    const senderName = (pengirimNama || (isUhtReq ? 'Seksi Pemasaran' : (isPemasaran ? 'Tim Kerja Layanan Pemasaran' : 'Admin Farm Produksi'))).trim();
    const senderRole = body.pengirimRole || authUser.role || (isPemasaran ? 'ADMIN_PEMASARAN' : 'ADMIN_FARM');
    const receiverName = (body.penerimaNama || instansiPenerima || (isUhtReq ? 'Unit Pengolahan (UHT)' : 'Yayasan / Instansi Penerima')).trim();
    const receiverRole = body.penerimaRole || (isUhtReq ? 'UNIT_PENGOLAHAN_UHT' : 'PENERIMA_HIBAH');

    // Generate unique nomor BAST
    const dateObj = tanggal ? new Date(tanggal) : new Date();
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    let nomorBast = body.nomorBast;
    if (!nomorBast) {
      const bTypePrefix = jenisPermintaan === 'PEMBELIAN' ? 'BAST-PB' : (jenisPermintaan === 'SUSU_OLAHAN' ? 'BAST-OLAHAN' : 'BAST-HB');

      // Hitung urutan tahunan
      const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
      const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

      const bastDocsInYear = await prisma.beritaAcara.findMany({
        where: {
          date: {
            gte: startOfYear,
            lte: endOfYear,
          },
        },
        select: {
          nomorBA: true,
        },
      });

      let maxSeq = 0;
      for (const d of bastDocsInYear) {
        if (!d.nomorBA) continue;
        const match = d.nomorBA.match(/[-/](\d{3,})$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxSeq && num < 100000) {
            maxSeq = num;
          }
        }
      }

      let nextSeq = Math.max(maxSeq + 1, 1);
      nomorBast = `${bTypePrefix}-${dateStr}-${String(nextSeq).padStart(3, '0')}`;

      // Pastikan unik
      while (await prisma.beritaAcara.findUnique({ where: { nomorBA: nomorBast } })) {
        nextSeq++;
        nomorBast = `${bTypePrefix}-${dateStr}-${String(nextSeq).padStart(3, '0')}`;
      }
    }

    let validUserId = authUser.userId || authUser.id || null;
    if (validUserId) {
      const userExists = await prisma.user.findUnique({ where: { id: validUserId }, select: { id: true } });
      if (!userExists) validUserId = null;
    }

    const createdBa = await prisma.beritaAcara.create({
      data: {
        nomorBA: nomorBast,
        type: jenisPermintaan || 'HIBAH',
        date: dateObj,
        animalType: animal,
        unit: 'Liter',
        totalProduksi: numVolume,
        diserahterimakan: numVolume,
        penerimaRole: receiverRole,
        penerimaName: receiverName,
        receiverName: receiverName,
        penyerahRole: senderRole,
        penyerahName: senderName,
        giverName: senderName,
        status: body.status || 'DITERIMA',
        notes: catatan ? catatan.trim() : null,
        purpose: receiverName,
        productionId: productionId || null,
        createdById: validUserId,
      },
    });

    const formatted = formatBastDoc(createdBa);

    return NextResponse.json({
      success: true,
      message: 'Berhasil menerbitkan Surat Berita Acara Serah Terima (BAST) Susu Segar!',
      data: formatted,
    });
  } catch (error) {
    console.error('Error POST /api/bast:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menerbitkan Surat BAST.' },
      { status: 400 }
    );
  }
}
