import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak: Tidak terautentikasi' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '30', 10);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    // Role-based filtering:
    // SUPERADMIN can see all notifications
    // ADMIN_PEMASARAN sees notifications targeted to 'ADMIN_PEMASARAN', 'ALL', or their userId
    // Other roles see notifications targeted to their role, 'ALL', or their userId
    let where = {};
    if (authUser.role !== 'SUPERADMIN') {
      where.OR = [
        { targetRole: authUser.role },
        { targetRole: 'ALL' },
        { targetUserId: authUser.id },
      ];
    }

    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.notification.count({
        where: {
          ...where,
          isRead: false,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      unreadCount,
      data: notifications,
    });
  } catch (error) {
    console.error('GET /api/notifications error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat data notifikasi' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      message,
      type,
      targetRole,
      targetUserId,
      link,
      metadata,
    } = body;

    if (!title || !message) {
      return NextResponse.json(
        { success: false, message: 'Judul dan pesan notifikasi wajib diisi' },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type: type || 'STOCK_ADDED',
        targetRole: targetRole || 'ADMIN_PEMASARAN',
        targetUserId: targetUserId || null,
        senderId: authUser.id,
        senderName: authUser.name || authUser.email,
        senderRole: authUser.role,
        link: link || '/pemasaran/terima-data',
        metadata: metadata ? (typeof metadata === 'string' ? metadata : JSON.stringify(metadata)) : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Notifikasi berhasil dibuat',
      data: notification,
    });
  } catch (error) {
    console.error('POST /api/notifications error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat notifikasi' },
      { status: 500 }
    );
  }
}
