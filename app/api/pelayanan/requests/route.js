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

    const requests = await prisma.serviceRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        certificates: true,
      },
    });

    return NextResponse.json({ success: true, data: requests });
  } catch (error) {
    console.error('GET /api/pelayanan/requests error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { applicantName, applicantPhone, applicantAddress, serviceType, animalDetails, notes } = await request.json();

    if (!applicantName || !applicantPhone || !applicantAddress || !serviceType || !animalDetails) {
      return NextResponse.json({ success: false, message: 'Field utama permohonan wajib diisi' }, { status: 400 });
    }

    const count = await prisma.serviceRequest.count();
    const requestNo = `REQ-2026-${String(count + 1).padStart(3, '0')}`;

    const newRequest = await prisma.serviceRequest.create({
      data: {
        requestNo,
        applicantName,
        applicantPhone,
        applicantAddress,
        serviceType,
        animalDetails,
        notes: notes || null,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, message: 'Permohonan layanan berhasil dibuat', data: newRequest }, { status: 201 });
  } catch (error) {
    console.error('POST /api/pelayanan/requests error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (authUser.role !== 'ADMIN_PELAYANAN' && authUser.role !== 'SUPERADMIN')) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Hanya ADMIN PELAYANAN / SUPERADMIN.' }, { status: 403 });
    }

    const { id, status, notes } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ success: false, message: 'id dan status wajib disertakan' }, { status: 400 });
    }

    const updated = await prisma.serviceRequest.update({
      where: { id },
      data: {
        status,
        ...(notes !== undefined ? { notes } : {}),
      },
    });

    return NextResponse.json({ success: true, message: `Permohonan diubah status menjadi ${status}`, data: updated });
  } catch (error) {
    console.error('PUT /api/pelayanan/requests error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
