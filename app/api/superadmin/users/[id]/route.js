import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== 'SUPERADMIN') {
      return NextResponse.json({ success: false, message: 'Akses ditolak: Khusus Superadmin' }, { status: 403 });
    }

    const { id } = params;
    const { name, email, password, role, isActive } = await request.json();

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ success: false, message: 'User tidak ditemukan' }, { status: 404 });
    }

    const updateData = {
      name: name !== undefined ? name : existingUser.name,
      email: email !== undefined ? email : existingUser.email,
      role: role !== undefined ? role : existingUser.role,
      isActive: isActive !== undefined ? isActive : existingUser.isActive,
    };

    if (password && password.trim() !== '') {
      updateData.password = await hashPassword(password);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    await prisma.systemLog.create({
      data: {
        userId: authUser.id,
        userEmail: authUser.email,
        action: 'UPDATE_USER',
        details: `Mengubah data akun ${updatedUser.email} (Role: ${updatedUser.role}, Active: ${updatedUser.isActive})`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Data akun berhasil diperbarui',
      data: updatedUser,
    });
  } catch (error) {
    console.error('PUT /api/superadmin/users/[id] error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== 'SUPERADMIN') {
      return NextResponse.json({ success: false, message: 'Akses ditolak: Khusus Superadmin' }, { status: 403 });
    }

    const { id } = params;

    // Prevent deleting self
    if (id === authUser.id) {
      return NextResponse.json({ success: false, message: 'Tidak dapat menghapus akun Anda sendiri' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ success: false, message: 'User tidak ditemukan' }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });

    await prisma.systemLog.create({
      data: {
        userId: authUser.id,
        userEmail: authUser.email,
        action: 'DELETE_USER',
        details: `Menghapus akun ${existingUser.email} (${existingUser.name})`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Akun ${existingUser.name} berhasil dihapus.`,
    });
  } catch (error) {
    console.error('DELETE /api/superadmin/users/[id] error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
