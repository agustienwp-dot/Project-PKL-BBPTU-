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

    const categories = await prisma.masterCategory.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('GET /api/superadmin/master error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== 'SUPERADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized. Hanya SUPERADMIN.' }, { status: 403 });
    }

    const { group, name, code, description } = await request.json();

    if (!group || !name || !code) {
      return NextResponse.json({ success: false, message: 'Group, nama, dan kode master wajib diisi' }, { status: 400 });
    }

    const existing = await prisma.masterCategory.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json({ success: false, message: 'Kode master category sudah ada' }, { status: 400 });
    }

    const newCategory = await prisma.masterCategory.create({
      data: {
        group,
        name,
        code,
        description: description || null,
      },
    });

    return NextResponse.json({ success: true, message: 'Master Data berhasil ditambahkan', data: newCategory }, { status: 201 });
  } catch (error) {
    console.error('POST /api/superadmin/master error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
