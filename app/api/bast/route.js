import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const authUser = getAuthUser(request);
    const allowed = ['ADMIN_FARM', 'ADMIN_PEMASARAN', 'SUPERADMIN'];
    if (!authUser || !requireRole(authUser, allowed)) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Peran tidak diizinkan.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const whereClause = {};
    if (status) {
      whereClause.status = status.toUpperCase();
    }

    const docs = await prisma.bastDocument.findMany({
      where: whereClause,
      orderBy: { tanggal: 'asc' },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Berhasil mengambil daftar Surat BAST.',
      data: docs,
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
    const allowed = ['ADMIN_PEMASARAN', 'ADMIN_FARM', 'SUPERADMIN'];
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
    const sumberField = body.sumber || (animal === 'KAMBING' ? 'SUSU_KAMBING' : 'SUSU_SAPI');

    const isPemasaran = authUser.role === 'ADMIN_PEMASARAN' || !authUser.role?.includes('FARM');
    const isUhtReq = jenisPermintaan === 'PENGOLAHAN_UHT' || jenisPermintaan === 'PERMINTAAN_PENGOLAHAN_UHT';

    const senderName = (pengirimNama || (isUhtReq ? 'Seksi Pemasaran' : (isPemasaran ? 'Admin Pemasaran' : 'Admin Farm Produksi'))).trim();
    const senderRole = body.pengirimRole || authUser.role || (isPemasaran ? 'ADMIN_PEMASARAN' : 'ADMIN_FARM');
    const receiverName = (body.penerimaNama || (isUhtReq ? 'Unit Pengolahan (UHT)' : (isPemasaran ? 'Unit Farm Produksi BBPTUHPT' : 'Bagian Pemasaran & Stok'))).trim();
    const receiverRole = body.penerimaRole || (isUhtReq ? 'UNIT_PENGOLAHAN_UHT' : (isPemasaran ? 'ADMIN_FARM' : 'ADMIN_PEMASARAN'));

    // Generate unique nomor BAST if not explicitly passed
    const dateObj = tanggal ? new Date(tanggal) : new Date();
    const dateStr = dateObj.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const prefix = isUhtReq ? 'BA-UHT' : (isPemasaran ? 'BAST/PEMASARAN' : 'BAST/BBPTU');
    const nomorBast = body.nomorBast || `${prefix}-${dateStr}-${randomSuffix}`;

    let validUserId = authUser.userId || authUser.id || null;
    if (validUserId) {
      const userExists = await prisma.user.findUnique({ where: { id: validUserId }, select: { id: true } });
      if (!userExists) validUserId = null;
    }

    const newBast = await prisma.bastDocument.create({
      data: {
        nomorBast,
        tanggal: dateObj,
        sumber: sumberField,
        volumeLiters: numVolume,
        jenisPermintaan: jenisPermintaan || 'PENJUALAN_LANGSUNG',
        instansiPenerima: instansiPenerima ? instansiPenerima.trim() : (isUhtReq ? 'Unit Pengolahan (UHT)' : null),
        pengirimNama: senderName,
        pengirimRole: senderRole,
        penerimaNama: receiverName,
        penerimaRole: receiverRole,
        status: body.status || 'MENUNGGU_KONFIRMASI',
        catatan: catatan ? catatan.trim() : null,
        productionId: productionId || null,
        createdById: validUserId,
      },
    });

    // Create Notification for target role
    try {
      const targetRole = isPemasaran ? 'ADMIN_FARM' : 'ADMIN_PEMASARAN';
      const targetLink = isPemasaran ? '/riwayat-produksi' : '/pemasaran/bast';
      await prisma.notification.create({
        data: {
          title: `Permintaan Susu Segar: ${jenisPermintaan || 'BAST'} (${numVolume} L)`,
          message: `${senderName} telah mengajukan permintaan susu segar sebanyak ${numVolume} Liter untuk ${jenisPermintaan || 'keperluan olahan/distribusi'}.`,
          type: 'BAST_CREATED',
          targetRole,
          senderId: authUser.id,
          senderName,
          senderRole,
          link: targetLink,
          metadata: JSON.stringify({
            bastId: newBast.id,
            nomorBast,
            volumeLiters: numVolume,
            jenisPermintaan,
          }),
        },
      });
    } catch (notifErr) {
      console.error('Error creating BAST notification:', notifErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Berhasil menerbitkan Surat Berita Acara Serah Terima (BAST) Susu Segar!',
      data: newBast,
    });
  } catch (error) {
    console.error('Error POST /api/bast:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menerbitkan Surat BAST.' },
      { status: 400 }
    );
  }
}
