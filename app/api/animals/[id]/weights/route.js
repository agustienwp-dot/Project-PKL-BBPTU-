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
    const { weight, notes } = await request.json();

    if (!weight || parseFloat(weight) <= 0) {
      return NextResponse.json({ success: false, message: 'Berat harus berupa angka positif' }, { status: 400 });
    }

    const animal = await prisma.animal.findUnique({ where: { id } });
    if (!animal) {
      return NextResponse.json({ success: false, message: 'Hewan tidak ditemukan' }, { status: 404 });
    }

    const weightVal = parseFloat(weight);

    const [updatedAnimal, newRecord] = await prisma.$transaction([
      prisma.animal.update({
        where: { id },
        data: { weight: weightVal },
      }),
      prisma.weightHistory.create({
        data: {
          animalId: id,
          weight: weightVal,
          notes: notes || null,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Berat badan hewan berhasil dicatat',
      data: {
        animal: updatedAnimal,
        weightHistory: newRecord,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/animals/[id]/weights error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
