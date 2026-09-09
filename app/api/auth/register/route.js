import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { name, email, password, role } = await request.json();

    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();
    let userRole = (role || 'ADMIN_FARM').toUpperCase();

    const validRoles = ['SUPERADMIN', 'ADMIN_FARM', 'ADMIN_PENGEMASAN', 'ADMIN_PEMASARAN'];
    if (!validRoles.includes(userRole)) {
      userRole = 'ADMIN_FARM';
    }

    if (!cleanName || !cleanEmail || !cleanPassword) {
      return NextResponse.json(
        { success: false, message: 'Nama Lengkap, Email, dan Password wajib diisi.' },
        { status: 400 }
      );
    }

    if (cleanPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Kata sandi minimal 8 karakter.' },
        { status: 400 }
      );
    }

    // Check if email or username already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { name: cleanName },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email atau Nama Pengguna sudah terdaftar. Silakan gunakan email lain.' },
        { status: 400 }
      );
    }

    // Hash password & create user
    const hashedPassword = await hashPassword(cleanPassword);

    const newUser = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        role: userRole,
        isActive: true,
      },
    });

    // Create log
    try {
      await prisma.systemLog.create({
        data: {
          userId: newUser.id,
          userEmail: newUser.email,
          action: 'REGISTER_USER',
          details: `Pendaftaran akun baru untuk ${cleanName} (${cleanEmail}) dengan role ${userRole}`,
        },
      });
    } catch (e) {
      console.warn('SystemLog creation error:', e);
    }

    // Generate auth token
    const token = generateToken({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    });

    return NextResponse.json({
      success: true,
      message: 'Registrasi akun berhasil!',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mendaftar akun. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
