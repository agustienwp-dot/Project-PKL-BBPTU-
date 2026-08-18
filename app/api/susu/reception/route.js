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

    const list = await prisma.milkReception.findMany({
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    console.error('GET /api/susu/reception error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { volumeLiters, notes, date } = await request.json();

    if (!volumeLiters || parseFloat(volumeLiters) <= 0) {
      return NextResponse.json({ success: false, message: 'Jumlah volume susu mentah (Liter) harus berupa angka positif' }, { status: 400 });
    }

    const newRecord = await prisma.milkReception.create({
      data: {
        volumeLiters: parseFloat(volumeLiters),
        notes: notes || null,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json({ success: true, message: 'Penerimaan susu mentah berhasil dicatat', data: newRecord }, { status: 201 });
  } catch (error) {
    console.error('POST /api/susu/reception error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
