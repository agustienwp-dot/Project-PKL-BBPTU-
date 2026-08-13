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

    const animal = await prisma.animal.findUnique({
      where: { id },
      include: {
        cage: true,
        weightHistories: { orderBy: { recordedAt: 'desc' } },
        movements: {
          orderBy: { movedAt: 'desc' },
          include: {
            fromCage: { select: { name: true } },
            toCage: { select: { name: true } },
          },
        },
        sale: {
          include: {
            buyer: true,
          },
        },
      },
    });

    if (!animal) {
      return NextResponse.json({ success: false, message: 'Hewan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: animal });
  } catch (error) {
    console.error('GET /api/animals/[id] error:', error);
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
    const body = await request.json();

    const existing = await prisma.animal.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Hewan tidak ditemukan' }, { status: 404 });
    }

    if (body.code && body.code !== existing.code) {
      const codeCheck = await prisma.animal.findUnique({ where: { code: body.code } });
      if (codeCheck) {
        return NextResponse.json({ success: false, message: 'Kode hewan sudah digunakan' }, { status: 400 });
      }
    }

    const updated = await prisma.animal.update({
      where: { id },
      data: {
        code: body.code || existing.code,
        name: body.name || existing.name,
        type: body.type || existing.type,
        breed: body.breed || existing.breed,
        gender: body.gender || existing.gender,
        birthDate: body.birthDate ? new Date(body.birthDate) : existing.birthDate,
        weight: body.weight !== undefined ? parseFloat(body.weight) : existing.weight,
        healthStatus: body.healthStatus || existing.healthStatus,
        purchasePrice: body.purchasePrice !== undefined ? parseFloat(body.purchasePrice) : existing.purchasePrice,
        estimatedSellingPrice: body.estimatedSellingPrice !== undefined ? parseFloat(body.estimatedSellingPrice) : existing.estimatedSellingPrice,
        status: body.status || existing.status,
        cageId: body.cageId || existing.cageId,
        origin: body.origin !== undefined ? body.origin : existing.origin,
        notes: body.notes !== undefined ? body.notes : existing.notes,
      },
    });

    return NextResponse.json({ success: true, message: 'Data hewan berhasil diperbarui', data: updated });
  } catch (error) {
    console.error('PUT /api/animals/[id] error:', error);
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

    const animal = await prisma.animal.findUnique({ where: { id } });
    if (!animal) {
      return NextResponse.json({ success: false, message: 'Hewan tidak ditemukan' }, { status: 404 });
    }

    if (animal.status === 'SOLD') {
      return NextResponse.json({ success: false, message: 'Hewan yang sudah terjual (SOLD) tidak boleh dihapus' }, { status: 400 });
    }

    await prisma.animal.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Data hewan berhasil dihapus' });
  } catch (error) {
    console.error('DELETE /api/animals/[id] error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
