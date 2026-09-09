import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    const allowed = ['ADMIN_PEMASARAN', 'SUPERADMIN'];
    if (!authUser || !requireRole(authUser, allowed)) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Peran tidak diizinkan.' },
        { status: 403 }
      );
    }

    const { id } = params;
    const sale = await prisma.milkSale.findUnique({
      where: { id },
      include: {
        piutang: {
          include: {
            pelunasan: {
              orderBy: { tanggal: 'desc' },
            },
          },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!sale) {
      return NextResponse.json(
        { success: false, message: 'Transaksi penjualan tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Berhasil mengambil detail penjualan.',
      data: sale,
    });
  } catch (error) {
    console.error('Error GET /api/milk-sales/[id]:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil detail penjualan.' },
      { status: 500 }
    );
  }
}
