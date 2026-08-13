import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { toCageId, notes } = await request.json();

    if (!toCageId) {
      return NextResponse.json({ success: false, message: 'Kandang tujuan wajib dipilih' }, { status: 400 });
    }

    const animal = await prisma.animal.findUnique({ where: { id } });
    if (!animal) {
      return NextResponse.json({ success: false, message: 'Hewan tidak ditemukan' }, { status: 404 });
    }

    if (animal.cageId === toCageId) {
      return NextResponse.json({ success: false, message: 'Hewan sudah berada di kandang ini' }, { status: 400 });
    }

    const targetCage = await prisma.cage.findUnique({
      where: { id: toCageId },
      include: {
        _count: { select: { animals: { where: { status: 'AVAILABLE' } } } },
      },
    });

    if (!targetCage) {
      return NextResponse.json({ success: false, message: 'Kandang tujuan tidak ditemukan' }, { status: 404 });
    }

    const currentCount = targetCage._count.animals;
    if (currentCount >= targetCage.capacity) {
      return NextResponse.json({
        success: false,
        message: `Kandang tujuan "${targetCage.name}" sudah penuh! Kapasitas: ${targetCage.capacity}, Terisi: ${currentCount}.`,
      }, { status: 400 });
    }

    const fromCageId = animal.cageId;

    const [updatedAnimal, movementRecord] = await prisma.$transaction([
      prisma.animal.update({
        where: { id },
        data: { cageId: toCageId },
      }),
      prisma.cageMovement.create({
        data: {
          animalId: id,
          fromCageId,
          toCageId,
          notes: notes || null,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Hewan berhasil dipindahkan ke ${targetCage.name}`,
      data: {
        animal: updatedAnimal,
        movement: movementRecord,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/animals/[id]/move error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
