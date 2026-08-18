import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== 'SUPERADMIN') {
      return NextResponse.json({ success: false, message: 'Akses ditolak: Khusus Superadmin' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error('GET /api/superadmin/users error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== 'SUPERADMIN') {
      return NextResponse.json({ success: false, message: 'Akses ditolak: Khusus Superadmin' }, { status: 403 });
    }

    const { name, email, password, role } = await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ success: false, message: 'Semua field wajib diisi' }, { status: 400 });
    }

    // Check duplicate
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: false, message: `Email ${email} sudah terdaftar` }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Log action
    await prisma.systemLog.create({
      data: {
        userId: authUser.id,
        userEmail: authUser.email,
        action: 'CREATE_USER',
        details: `Membuat akun baru ${email} dengan role ${role}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Akun ${name} (${role}) berhasil dibuat.`,
      data: newUser,
    });
  } catch (error) {
    console.error('POST /api/superadmin/users error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
