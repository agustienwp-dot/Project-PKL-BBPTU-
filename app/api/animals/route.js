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
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const type = searchParams.get('type') || '';
    const cageId = searchParams.get('cageId') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    const where = {};

    if (status) where.status = status;
    if (type) where.type = type;
    if (cageId) where.cageId = cageId;

    if (search) {
      where.OR = [
        { code: { contains: search } },
        { name: { contains: search } },
        { breed: { contains: search } },
      ];
    }

    const skip = (page - 1) * limit;

    const [animals, total] = await Promise.all([
      prisma.animal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
        include: {
          cage: { select: { id: true, name: true, location: true } },
          sale: {
            include: {
              buyer: { select: { id: true, name: true, phone: true } },
            },
          },
        },
      }),
      prisma.animal.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: animals,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('GET /api/animals error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      code,
      name,
      type,
      breed,
      gender,
      birthDate,
      weight,
      healthStatus,
      purchasePrice,
      estimatedSellingPrice,
      cageId,
      status,
      origin,
      notes,
    } = body;

    if (!code || !name || !type || !breed || !gender || weight === undefined || purchasePrice === undefined || !cageId) {
      return NextResponse.json({ success: false, message: 'Field utama wajib diisi' }, { status: 400 });
    }

    const existingCode = await prisma.animal.findUnique({ where: { code } });
    if (existingCode) {
      return NextResponse.json({ success: false, message: 'Kode hewan sudah digunakan' }, { status: 400 });
    }

    const cage = await prisma.cage.findUnique({
      where: { id: cageId },
      include: {
        _count: { select: { animals: { where: { status: 'AVAILABLE' } } } },
      },
    });

    if (!cage) {
      return NextResponse.json({ success: false, message: 'Kandang tidak ditemukan' }, { status: 404 });
    }

    const currentCount = cage._count.animals;
    if (currentCount >= cage.capacity) {
      return NextResponse.json({
        success: false,
        message: `Kandang "${cage.name}" sudah penuh! Kapasitas: ${cage.capacity}, Terisi: ${currentCount}.`,
      }, { status: 400 });
    }

    const newAnimal = await prisma.animal.create({
      data: {
        code,
        name,
        type,
        breed,
        gender,
        birthDate: birthDate ? new Date(birthDate) : null,
        weight: parseFloat(weight),
        healthStatus: healthStatus || 'Sehat',
        purchasePrice: parseFloat(purchasePrice),
        estimatedSellingPrice: estimatedSellingPrice ? parseFloat(estimatedSellingPrice) : null,
        status: status || 'AVAILABLE',
        cageId,
        origin: origin || null,
        notes: notes || null,
        weightHistories: {
          create: {
            weight: parseFloat(weight),
            notes: 'Berat awal saat dicatat',
          },
        },
      },
    });

    return NextResponse.json({ success: true, message: 'Hewan berhasil ditambahkan', data: newAnimal }, { status: 201 });
  } catch (error) {
    console.error('POST /api/animals error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
