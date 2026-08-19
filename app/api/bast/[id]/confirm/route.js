import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    const allowed = ['ADMIN_PEMASARAN', 'SUPERADMIN'];
    if (!authUser || !requireRole(authUser, allowed)) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak: Hanya Admin Pemasaran atau Superadmin yang dapat mengonfirmasi serah terima BAST.' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json().catch(() => ({}));
    const { catatan } = body;

    const doc = await prisma.bastDocument.findUnique({ where: { id } });
    if (!doc) {
      return NextResponse.json(
        { success: false, message: 'Surat BAST tidak ditemukan.' },
        { status: 404 }
      );
    }

    if (doc.status === 'DITERIMA') {
      return NextResponse.json(
        { success: false, message: 'Surat BAST ini sudah dikonfirmasi serah terima sebelumnya.' },
        { status: 400 }
      );
    }

    const receiverName = (authUser.name || 'Admin Pemasaran & Stok').trim();

    const updatedDoc = await prisma.bastDocument.update({
      where: { id },
      data: {
        status: 'DITERIMA',
        penerimaNama: receiverName,
        penerimaRole: authUser.role || 'ADMIN_PEMASARAN',
        confirmedAt: new Date(),
        catatan: catatan ? `${doc.catatan || ''}\n[Pemasaran Notes]: ${catatan.trim()}` : doc.catatan,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Berhasil mengonfirmasi serah terima Berita Acara (BAST) Susu Segar!',
      data: updatedDoc,
    });
  } catch (error) {
    console.error('Error POST /api/bast/[id]/confirm:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal mengonfirmasi Surat BAST.' },
      { status: 500 }
    );
  }
}
