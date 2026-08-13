import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const buyer = await prisma.buyer.findUnique({
      where: { id },
      include: {
        sales: {
          orderBy: { saleDate: 'desc' },
          include: {
            animal: { select: { code: true, name: true, type: true, breed: true } },
          },
        },
      },
    });

    if (!buyer) {
      return NextResponse.json({ success: false, message: 'Pembeli tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: buyer });
  } catch (error) {
    console.error('GET /api/buyers/[id] error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { name, phone, address, notes } = await request.json();

    const existing = await prisma.buyer.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Pembeli tidak ditemukan' }, { status: 404 });
    }

    const updated = await prisma.buyer.update({
      where: { id },
      data: {
        name: name || existing.name,
        phone: phone || existing.phone,
        address: address || existing.address,
        notes: notes !== undefined ? notes : existing.notes,
      },
    });

    return NextResponse.json({ success: true, message: 'Data pembeli diperbarui', data: updated });
  } catch (error) {
    console.error('PUT /api/buyers/[id] error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Akses ditolak. Hanya ADMIN.' }, { status: 403 });
    }

    const { id } = params;

    const salesCount = await prisma.sale.count({ where: { buyerId: id } });
    if (salesCount > 0) {
      return NextResponse.json({
        success: false,
        message: 'Pembeli tidak dapat dihapus karena memiliki riwayat transaksi penjualan.',
      }, { status: 400 });
    }

    await prisma.buyer.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Pembeli berhasil dihapus' });
  } catch (error) {
    console.error('DELETE /api/buyers/[id] error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
