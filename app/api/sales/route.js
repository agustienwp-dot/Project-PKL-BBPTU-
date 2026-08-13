import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const sales = await prisma.sale.findMany({
      orderBy: { saleDate: 'desc' },
      include: {
        animal: {
          select: { id: true, code: true, name: true, type: true, breed: true },
        },
        buyer: {
          select: { id: true, name: true, phone: true, address: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: sales });
  } catch (error) {
    console.error('GET /api/sales error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { animalId, buyerId, sellingPrice, weightAtSale, paymentMethod, notes } = await request.json();

    if (!animalId || !buyerId || sellingPrice === undefined || weightAtSale === undefined) {
      return NextResponse.json({ success: false, message: 'Hewan, pembeli, harga jual, dan berat wajib diisi' }, { status: 400 });
    }

    const animal = await prisma.animal.findUnique({ where: { id: animalId } });
    if (!animal) {
      return NextResponse.json({ success: false, message: 'Hewan tidak ditemukan' }, { status: 404 });
    }

    if (animal.status !== 'AVAILABLE') {
      return NextResponse.json({
        success: false,
        message: `Hewan "${animal.code}" tidak dapat dijual karena berstatus ${animal.status}`,
      }, { status: 400 });
    }

    const buyer = await prisma.buyer.findUnique({ where: { id: buyerId } });
    if (!buyer) {
      return NextResponse.json({ success: false, message: 'Pembeli tidak ditemukan' }, { status: 404 });
    }

    // Atomic Transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedAnimal = await tx.animal.update({
        where: { id: animalId },
        data: { status: 'SOLD' },
      });

      const newSale = await tx.sale.create({
        data: {
          animalId,
          buyerId,
          sellingPrice: parseFloat(sellingPrice),
          weightAtSale: parseFloat(weightAtSale),
          paymentMethod: paymentMethod || 'TRANSFER',
          notes: notes || null,
        },
        include: {
          animal: true,
          buyer: true,
        },
      });

      return newSale;
    });

    return NextResponse.json({
      success: true,
      message: 'Transaksi penjualan berhasil dicatat. Status hewan diubah menjadi SOLD.',
      data: result,
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/sales error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
