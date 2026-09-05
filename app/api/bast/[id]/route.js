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

export async function DELETE(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    const allowed = ['ADMIN_PEMASARAN', 'ADMIN_FARM', 'SUPERADMIN'];
    if (!authUser || !requireRole(authUser, allowed)) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak: Tidak memiliki izin menghapus BAST.' },
        { status: 403 }
      );
    }

    const { id } = params;
    const doc = await prisma.bastDocument.findUnique({ where: { id } });
    if (!doc) {
      return NextResponse.json(
        { success: false, message: 'Surat BAST tidak ditemukan.' },
        { status: 404 }
      );
    }

    await prisma.bastDocument.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: `Surat BAST No. ${doc.nomorBast} berhasil dihapus.`,
    });
  } catch (error) {
    console.error('Error DELETE /api/bast/[id]:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menghapus Surat BAST.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    const allowed = ['ADMIN_PEMASARAN', 'ADMIN_FARM', 'SUPERADMIN'];
    if (!authUser || !requireRole(authUser, allowed)) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak.' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json().catch(() => ({}));
    const { status, catatan } = body;

    const doc = await prisma.bastDocument.findUnique({ where: { id } });
    if (!doc) {
      return NextResponse.json(
        { success: false, message: 'Surat BAST tidak ditemukan.' },
        { status: 404 }
      );
    }

    const updated = await prisma.bastDocument.update({
      where: { id },
      data: {
        status: status || 'DIKIRIM_KE_FARM',
        catatan: catatan ? `${doc.catatan || ''}\n${catatan}`.trim() : doc.catatan,
        confirmedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Surat BAST No. ${doc.nomorBast} berhasil dikirim ke Admin Farm!`,
      data: updated,
    });
  } catch (error) {
    console.error('Error PATCH /api/bast/[id]:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memperbarui status Surat BAST.' },
      { status: 500 }
    );
  }
}
