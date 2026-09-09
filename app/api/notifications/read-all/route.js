import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak' },
        { status: 401 }
      );
    }

    let where = { isRead: false };
    if (authUser.role !== 'SUPERADMIN') {
      where.OR = [
        { targetRole: authUser.role },
        { targetRole: 'ALL' },
        { targetUserId: authUser.id },
      ];
    }

    const updated = await prisma.notification.updateMany({
      where,
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `${updated.count} notifikasi berhasil ditandai sudah dibaca`,
      count: updated.count,
    });
  } catch (error) {
    console.error('POST /api/notifications/read-all error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui notifikasi' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  return POST(request);
}

export async function PATCH(request) {
  return POST(request);
}
