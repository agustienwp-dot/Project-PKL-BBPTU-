import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const authUser = getAuthUser(request);
    const allowed = ['ADMIN_PEMASARAN', 'SUPERADMIN'];
    if (!authUser || !requireRole(authUser, allowed)) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Peran tidak diizinkan.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // lunas / belum_lunas

    const whereClause = {};
    if (status === 'lunas') {
      whereClause.lunas = true;
    } else if (status === 'belum_lunas') {
      whereClause.lunas = false;
    }

    const piutangList = await prisma.piutang.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        milkSale: {
          include: {
            createdBy: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        pelunasan: {
          orderBy: { tanggal: 'desc' },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Berhasil mengambil daftar piutang.',
      data: piutangList,
    });
  } catch (error) {
    console.error('Error GET /api/piutang:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil daftar piutang.' },
      { status: 500 }
    );
  }
}
