import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/pemasaran/sales/[id]
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
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!sale) {
      return NextResponse.json({ success: false, message: 'Transaksi penjualan tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: sale });
  } catch (error) {
    console.error('GET /api/pemasaran/sales/[id] error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/pemasaran/sales/[id]
export async function DELETE(request, { params }) {
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
    const sale = await prisma.milkSale.findUnique({ where: { id } });

    if (!sale) {
      return NextResponse.json({ success: false, message: 'Transaksi penjualan tidak ditemukan.' }, { status: 404 });
    }

    await prisma.milkSale.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Transaksi penjualan berhasil dihapus & stok dikembalikan.',
    });
  } catch (error) {
    console.error('DELETE /api/pemasaran/sales/[id] error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
