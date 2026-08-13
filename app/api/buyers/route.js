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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { phone: { contains: search } },
            { address: { contains: search } },
          ],
        }
      : {};

    const buyers = await prisma.buyer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { sales: true } },
      },
    });

    return NextResponse.json({ success: true, data: buyers });
  } catch (error) {
    console.error('GET /api/buyers error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { name, phone, address, notes } = await request.json();

    if (!name || !phone || !address) {
      return NextResponse.json({ success: false, message: 'Nama, telepon, dan alamat wajib diisi' }, { status: 400 });
    }

    const newBuyer = await prisma.buyer.create({
      data: {
        name,
        phone,
        address,
        notes: notes || null,
      },
    });

    return NextResponse.json({ success: true, message: 'Pembeli berhasil ditambahkan', data: newBuyer }, { status: 201 });
  } catch (error) {
    console.error('POST /api/buyers error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
