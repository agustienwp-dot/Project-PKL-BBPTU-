import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword, generateToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { email, username, password } = await request.json();
    const identifier = (email || username || '').trim();

    if (!identifier || !password) {
      return NextResponse.json({ success: false, message: 'Email/Username dan password wajib diisi' }, { status: 400 });
    }

    // 1. Check in User model (users table)
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { name: identifier },
        ],
      },
    });

    if (user) {
      const isValid = await comparePassword(password, user.password);
      if (isValid) {
        let finalRole = user.role;
        if (user.name && user.name.toUpperCase().includes('PENGEMASAN')) {
          finalRole = 'ADMIN_PENGEMASAN';
        }

        const token = generateToken({
          id: user.id,
          name: user.name,
          email: user.email,
          role: finalRole,
        });

        return NextResponse.json({
          success: true,
          message: 'Login berhasil',
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: finalRole,
          },
        });
      }
    }

    // 2. Check in Admin model (admin table)
    const adminAccount = await prisma.admin.findFirst({
      where: {
        username: identifier,
        record_flag: 'ACTIVE',
      },
    });

    if (adminAccount && adminAccount.password) {
      let isMatch = false;
      try {
        isMatch = await comparePassword(password, adminAccount.password);
      } catch (e) {
        isMatch = false;
      }
      if (!isMatch && password === adminAccount.password) {
        isMatch = true;
      }

      if (isMatch) {
        let mappedRole = (adminAccount.role || '').toUpperCase();
        if (!mappedRole || mappedRole === 'ADMIN_FARM') {
          if (adminAccount.username && adminAccount.username.toUpperCase().includes('PENGEMASAN')) {
            mappedRole = 'ADMIN_PENGEMASAN';
          } else if (adminAccount.username && adminAccount.username.toUpperCase().includes('PEMASARAN')) {
            mappedRole = 'ADMIN_PEMASARAN';
          } else {
            mappedRole = 'ADMIN_FARM';
          }
        }

        const emailFallback = `${adminAccount.username}@susu.com`;
        
        const token = generateToken({
          id: adminAccount.id.toString(),
          name: adminAccount.username,
          email: emailFallback,
          role: mappedRole,
        });

        return NextResponse.json({
          success: true,
          message: 'Login berhasil',
          token,
          user: {
            id: adminAccount.id.toString(),
            name: adminAccount.username,
            email: emailFallback,
            role: mappedRole,
          },
        });
      }
    }

    return NextResponse.json({ success: false, message: 'Email/Username atau password tidak valid' }, { status: 401 });
  } catch (error) {
    console.error('Login route error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
