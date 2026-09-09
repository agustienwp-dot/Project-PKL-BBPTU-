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
    const { status, catatan, tanggal, volumeLiters, instansiPenerima, penerimaNama, sumber, jenisPermintaan } = body;

    const doc = await prisma.bastDocument.findUnique({ where: { id } });
    if (!doc) {
      return NextResponse.json(
        { success: false, message: 'Surat BAST tidak ditemukan.' },
        { status: 404 }
      );
    }

    const updateData = {};
    if (status !== undefined) {
      updateData.status = status;
      updateData.confirmedAt = new Date();
    }
    if (catatan !== undefined) updateData.catatan = catatan;
    if (tanggal !== undefined) updateData.tanggal = new Date(tanggal);
    if (volumeLiters !== undefined) updateData.volumeLiters = parseFloat(volumeLiters) || 0;
    if (instansiPenerima !== undefined) updateData.instansiPenerima = instansiPenerima;
    if (penerimaNama !== undefined) updateData.penerimaNama = penerimaNama;
    if (sumber !== undefined) updateData.sumber = sumber;
    if (jenisPermintaan !== undefined) updateData.jenisPermintaan = jenisPermintaan;

    // Fallback if empty payload sent for backward compatibility (e.g. mark sent)
    if (Object.keys(updateData).length === 0) {
      updateData.status = 'DIKIRIM_KE_FARM';
      updateData.confirmedAt = new Date();
    }

    const updated = await prisma.bastDocument.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `Surat BAST No. ${doc.nomorBast} berhasil diperbarui!`,
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
