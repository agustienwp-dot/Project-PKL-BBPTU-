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

    const records = await prisma.reproductionRecord.findMany({
      orderBy: { eventDate: 'desc' },
      include: {
        animal: { select: { id: true, code: true, earTag: true, name: true, type: true, breed: true, reproductionStatus: true } },
      },
    });

    return NextResponse.json({ success: true, data: records });
  } catch (error) {
    console.error('GET /api/ternak/reproduction error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { animalId, type, status, expectedBirthDate, bullCode, notes } = await request.json();

    if (!animalId || !type) {
      return NextResponse.json({ success: false, message: 'Ternak dan Jenis Kejadian Reproduksi wajib diisi' }, { status: 400 });
    }

    const record = await prisma.reproductionRecord.create({
      data: {
        animalId,
        type,
        status: status || 'SIAP_BUNTING',
        expectedBirthDate: expectedBirthDate ? new Date(expectedBirthDate) : null,
        bullCode: bullCode || null,
        notes: notes || null,
      },
    });

    // Update animal reproductionStatus
    let newReproStatus = 'Normal';
    if (status === 'HAMIL') newReproStatus = 'Hamil';
    else if (status === 'SIAP_BUNTING') newReproStatus = 'Siap Bunting';
    else if (type === 'MELAHIRKAN') newReproStatus = 'Menyusui';

    await prisma.animal.update({
      where: { id: animalId },
      data: { reproductionStatus: newReproStatus },
    });

    return NextResponse.json({ success: true, message: 'Catatan reproduksi berhasil ditambahkan', data: record }, { status: 201 });
  } catch (error) {
    console.error('POST /api/ternak/reproduction error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
