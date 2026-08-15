import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== 'SUPERADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized. Hanya SUPERADMIN.' }, { status: 403 });
    }

    const [logs, userCount, activeUserCount, logErrorCount] = await Promise.all([
      prisma.systemLog.findMany({
        take: 30,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.systemLog.count({ where: { level: 'ERROR' } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        logs,
        systemStats: {
          userCount,
          activeUserCount,
          logErrorCount,
          serverStatus: 'ONLINE (MySQL & Next.js App Router OK)',
          dbStorageUsage: 'Aktif (MySQL Projek BBPTU)',
          uptimeHours: 99.9,
        },
      },
    });
  } catch (error) {
    console.error('GET /api/superadmin/logs error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
