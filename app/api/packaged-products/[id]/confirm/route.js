import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    const allowed = ['ADMIN_PEMASARAN', 'SUPERADMIN'];
    if (!authUser || !requireRole(authUser, allowed)) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak: Hanya Admin Pemasaran atau Superadmin yang dapat mengonfirmasi penerimaan produk olahan.' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json().catch(() => ({}));
    const { condition = 'Sesuai', notes } = body;

    const item = await prisma.packagedProduct.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json(
        { success: false, message: 'Data produk olahan tidak ditemukan.' },
        { status: 404 }
      );
    }

    if (item.status === 'DITERIMA') {
      return NextResponse.json(
        { success: false, message: 'Produk olahan ini sudah dikonfirmasi penerimaannya sebelumnya.' },
        { status: 400 }
      );
    }

    const receiverName = (authUser.name || 'Admin Pemasaran & Stok').trim();

    const updatedItem = await prisma.packagedProduct.update({
      where: { id },
      data: {
        status: 'DITERIMA',
        receivedAt: new Date(),
        receivedByName: receiverName,
        condition: condition,
        notes: notes ? `${item.notes || ''}\n[Pemasaran]: ${notes.trim()}` : item.notes,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil mengonfirmasi penerimaan produk olahan (${item.jenisProduk} - ${item.kemasan}) ke stok Pemasaran!`,
      data: updatedItem,
    });
  } catch (error) {
    console.error('Error POST /api/packaged-products/[id]/confirm:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal mengonfirmasi produk olahan.' },
      { status: 500 }
    );
  }
}
