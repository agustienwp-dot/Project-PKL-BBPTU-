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

    const rumputList = await prisma.grassStock.findMany({
      orderBy: { date: 'desc' },
    });

    const totalStockKg = rumputList.reduce((acc, curr) => acc + curr.remainingStockKg, 0);

    return NextResponse.json({
      success: true,
      data: rumputList,
      totalStockKg,
    });
  } catch (error) {
    console.error('GET /api/rumput error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { grassType, incomingQtyKg, supplier, notes, date } = await request.json();

    if (!grassType || incomingQtyKg === undefined || parseFloat(incomingQtyKg) <= 0) {
      return NextResponse.json({ success: false, message: 'Jenis rumput dan Jumlah masuk (kg) positif wajib diisi' }, { status: 400 });
    }

    const qty = parseFloat(incomingQtyKg);

    const newStock = await prisma.grassStock.create({
      data: {
        grassType,
        incomingQtyKg: qty,
        remainingStockKg: qty,
        supplier: supplier || null,
        notes: notes || null,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json({ success: true, message: 'Stok rumput berhasil ditambahkan', data: newStock }, { status: 201 });
  } catch (error) {
    console.error('POST /api/rumput error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
