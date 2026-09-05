import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json().catch(() => ({}));
    const isRead = body.isRead !== undefined ? Boolean(body.isRead) : true;

    const notification = await prisma.notification.update({
      where: { id },
      data: {
        isRead,
        readAt: isRead ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: isRead ? 'Notifikasi ditandai sudah dibaca' : 'Notifikasi ditandai belum dibaca',
      data: notification,
    });
  } catch (error) {
    console.error('PATCH /api/notifications/[id] error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui status notifikasi' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak' },
        { status: 401 }
      );
    }

    const { id } = params;

    await prisma.notification.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Notifikasi berhasil dihapus',
    });
  } catch (error) {
    console.error('DELETE /api/notifications/[id] error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus notifikasi' },
      { status: 500 }
    );
  }
}
