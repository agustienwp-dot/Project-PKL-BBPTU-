import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    const allowed = ['ADMIN_FARM', 'ADMIN_PEMASARAN', 'SUPERADMIN'];
    if (!authUser || !requireRole(authUser, allowed)) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Peran tidak diizinkan.' },
        { status: 403 }
      );
    }

    const { id } = params;
    const doc = await prisma.bastDocument.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!doc) {
      return NextResponse.json(
        { success: false, message: 'Surat BAST tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Berhasil mengambil detail Surat BAST.',
      data: doc,
    });
  } catch (error) {
    console.error('Error GET /api/bast/[id]:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil detail Surat BAST.' },
      { status: 500 }
    );
  }
}
