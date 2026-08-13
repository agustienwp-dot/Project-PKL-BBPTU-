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

    const cage = await prisma.cage.findUnique({
      where: { id },
      include: {
        animals: {
          where: { status: 'AVAILABLE' },
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
            breed: true,
            gender: true,
            weight: true,
            status: true,
          },
        },
      },
    });

    if (!cage) {
      return NextResponse.json({ success: false, message: 'Kandang tidak ditemukan' }, { status: 404 });
    }

    const availableAnimalsCount = cage.animals.length;
    const emptySlots = Math.max(0, cage.capacity - availableAnimalsCount);

    return NextResponse.json({
      success: true,
      data: {
        ...cage,
        availableAnimalsCount,
        emptySlots,
        availableAnimals: cage.animals,
      },
    });
  } catch (error) {
    console.error('GET /api/cages/[id] error:', error);
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
    const { name, type, capacity, location, description, isActive } = await request.json();

    const existing = await prisma.cage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Kandang tidak ditemukan' }, { status: 404 });
    }

    if (name && name !== existing.name) {
      const nameCheck = await prisma.cage.findUnique({ where: { name } });
      if (nameCheck) {
        return NextResponse.json({ success: false, message: 'Nama kandang sudah digunakan' }, { status: 400 });
      }
    }

    const updatedCage = await prisma.cage.update({
      where: { id },
      data: {
        name: name || existing.name,
        type: type || existing.type,
        capacity: capacity !== undefined ? parseInt(capacity, 10) : existing.capacity,
        location: location || existing.location,
        description: description !== undefined ? description : existing.description,
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
      },
    });

    return NextResponse.json({ success: true, message: 'Kandang berhasil diperbarui', data: updatedCage });
  } catch (error) {
    console.error('PUT /api/cages/[id] error:', error);
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

    const availableCount = await prisma.animal.count({
      where: { cageId: id, status: 'AVAILABLE' },
    });

    if (availableCount > 0) {
      return NextResponse.json({
        success: false,
        message: `Kandang tidak dapat dihapus karena masih berisi ${availableCount} ekor hewan berstatus AVAILABLE.`,
      }, { status: 400 });
    }

    await prisma.cage.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Kandang berhasil dihapus' });
  } catch (error) {
    console.error('DELETE /api/cages/[id] error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
