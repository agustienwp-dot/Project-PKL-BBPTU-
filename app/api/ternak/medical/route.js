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

    const records = await prisma.medicalRecord.findMany({
      orderBy: { recordedAt: 'desc' },
      include: {
        animal: { select: { id: true, code: true, earTag: true, name: true, type: true, breed: true } },
      },
    });

    return NextResponse.json({ success: true, data: records });
  } catch (error) {
    console.error('GET /api/ternak/medical error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { animalId, diagnosis, treatment, vaccineName, veterinarian, status, notes } = await request.json();

    if (!animalId || !diagnosis || !treatment) {
      return NextResponse.json({ success: false, message: 'Ternak, Diagnosis, dan Pengobatan wajib diisi' }, { status: 400 });
    }

    const record = await prisma.medicalRecord.create({
      data: {
        animalId,
        diagnosis,
        treatment,
        vaccineName: vaccineName || null,
        veterinarian: veterinarian || authUser.name,
        status: status || 'SELESAI',
        notes: notes || null,
      },
    });

    // Update animal quarantineStatus if needed
    if (status === 'KARANTINA' || status === 'DALAM_PERAWATAN') {
      await prisma.animal.update({
        where: { id: animalId },
        data: { quarantineStatus: status === 'KARANTINA' ? 'Karantina' : 'Sakit' },
      });
    }

    return NextResponse.json({ success: true, message: 'Catatan medis ternak berhasil ditambahkan', data: record }, { status: 201 });
  } catch (error) {
    console.error('POST /api/ternak/medical error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
