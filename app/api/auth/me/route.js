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

    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { id: authUser.id },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      });
    } catch (e) {
      user = null;
    }

    if (!user) {
      const adminId = parseInt(authUser.id, 10);
      if (!isNaN(adminId)) {
        try {
          const adminAcc = await prisma.admin.findUnique({
            where: { id: adminId },
          });
          if (adminAcc) {
            user = {
              id: adminAcc.id.toString(),
              name: adminAcc.username,
              email: `${adminAcc.username}@susu.com`,
              role: (adminAcc.role || 'ADMIN_FARM').toUpperCase(),
            };
          }
        } catch (e) {
          user = null;
        }
      }
    }

    if (!user && authUser.id && authUser.email) {
      user = {
        id: authUser.id,
        name: authUser.name || 'Pengguna',
        email: authUser.email,
        role: authUser.role || 'ADMIN_FARM',
      };
    }

    if (!user) {
      return NextResponse.json({ success: false, message: 'User tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('GET /api/auth/me error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
