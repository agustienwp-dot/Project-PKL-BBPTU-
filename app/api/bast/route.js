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
      orderBy: { tanggal: 'desc' },
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
    const allowed = ['ADMIN_FARM', 'SUPERADMIN'];
    if (!authUser || !requireRole(authUser, allowed)) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak: Hanya Admin Farm atau Superadmin yang dapat menerbitkan BAST.' },
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

    const senderName = (pengirimNama || authUser.name || 'Admin Farm Produksi').trim();

    // Generate unique nomor BAST
    const dateObj = tanggal ? new Date(tanggal) : new Date();
    const dateStr = dateObj.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const nomorBast = `BAST/BBPTU/${dateStr}/${randomSuffix}`;

    const newBast = await prisma.bastDocument.create({
      data: {
        nomorBast,
        tanggal: dateObj,
        sumber: 'SUSU_SEGAR',
        volumeLiters: numVolume,
        jenisPermintaan: jenisPermintaan || 'PENJUALAN_LANGSUNG',
        instansiPenerima: instansiPenerima ? instansiPenerima.trim() : null,
        pengirimNama: senderName,
        pengirimRole: authUser.role || 'ADMIN_FARM',
        status: 'MENUNGGU_KONFIRMASI',
        catatan: catatan ? catatan.trim() : null,
        productionId: productionId || null,
        createdById: authUser.userId || authUser.id || null,
      },
    });

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
