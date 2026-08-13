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

    const complaints = await prisma.publicComplaint.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: complaints });
  } catch (error) {
    console.error('GET /api/pelayanan/complaints error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { reporterName, reporterPhone, category, title, description } = await request.json();

    if (!reporterName || !reporterPhone || !category || !title || !description) {
      return NextResponse.json({ success: false, message: 'Field pengaduan wajib diisi' }, { status: 400 });
    }

    const count = await prisma.publicComplaint.count();
    const complaintNo = `ADU-${String(count + 1).padStart(3, '0')}`;

    const newComplaint = await prisma.publicComplaint.create({
      data: {
        complaintNo,
        reporterName,
        reporterPhone,
        category,
        title,
        description,
        status: 'BARU',
      },
    });

    return NextResponse.json({ success: true, message: 'Pengaduan berhasil dicatat', data: newComplaint }, { status: 201 });
  } catch (error) {
    console.error('POST /api/pelayanan/complaints error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (authUser.role !== 'ADMIN_PELAYANAN' && authUser.role !== 'SUPERADMIN' && authUser.role !== 'ADMIN_TERNAK')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { id, status, response } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ success: false, message: 'id dan status wajib diisi' }, { status: 400 });
    }

    const updated = await prisma.publicComplaint.update({
      where: { id },
      data: {
        status,
        ...(response !== undefined ? { response } : {}),
      },
    });

    return NextResponse.json({ success: true, message: 'Status pengaduan berhasil diperbarui', data: updated });
  } catch (error) {
    console.error('PUT /api/pelayanan/complaints error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
