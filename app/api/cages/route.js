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

    const cages = await prisma.cage.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            animals: {
              where: { status: 'AVAILABLE' },
            },
          },
        },
      },
    });

    const formattedCages = cages.map((cage) => {
      const availableAnimalsCount = cage._count.animals;
      const emptySlots = Math.max(0, cage.capacity - availableAnimalsCount);
      return {
        ...cage,
        availableAnimalsCount,
        emptySlots,
      };
    });

    return NextResponse.json({ success: true, data: formattedCages });
  } catch (error) {
    console.error('GET /api/cages error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { name, type, capacity, location, description, isActive } = await request.json();

    if (!name || !type || capacity === undefined || !location) {
      return NextResponse.json({ success: false, message: 'Nama, jenis, kapasitas, dan lokasi wajib diisi' }, { status: 400 });
    }

    const existing = await prisma.cage.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json({ success: false, message: 'Nama kandang sudah digunakan' }, { status: 400 });
    }

    const newCage = await prisma.cage.create({
      data: {
        name,
        type,
        capacity: parseInt(capacity, 10),
        location,
        description: description || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ success: true, message: 'Kandang berhasil ditambahkan', data: newCage }, { status: 201 });
  } catch (error) {
    console.error('POST /api/cages error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
