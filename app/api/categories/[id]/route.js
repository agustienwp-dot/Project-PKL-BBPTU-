import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (authUser.role !== 'SUPERADMIN' && authUser.role !== 'ADMIN_FARM')) {
      return NextResponse.json({ success: false, message: 'Akses ditolak' }, { status: 403 });
    }

    const { id } = params;
    const { name, code, productType, defaultPackaging, description } = await request.json();

    const existingCategory = await prisma.milkCategory.findUnique({ where: { id } });
    if (!existingCategory) {
      return NextResponse.json({ success: false, message: 'Kategori tidak ditemukan' }, { status: 404 });
    }

    const uppercaseCode = code ? code.trim().toUpperCase() : existingCategory.code;

    const updatedCategory = await prisma.milkCategory.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existingCategory.name,
        code: uppercaseCode,
        productType: productType !== undefined ? productType : existingCategory.productType,
        defaultPackaging: defaultPackaging !== undefined ? defaultPackaging : existingCategory.defaultPackaging,
        description: description !== undefined ? description : existingCategory.description,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Kategori berhasil diperbarui',
      data: updatedCategory,
    });
  } catch (error) {
    console.error('PUT /api/categories/[id] error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (authUser.role !== 'SUPERADMIN' && authUser.role !== 'ADMIN_FARM')) {
      return NextResponse.json({ success: false, message: 'Akses ditolak' }, { status: 403 });
    }

    const { id } = params;

    const existingCategory = await prisma.milkCategory.findUnique({ where: { id } });
    if (!existingCategory) {
      return NextResponse.json({ success: false, message: 'Kategori tidak ditemukan' }, { status: 404 });
    }

    await prisma.milkCategory.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: `Kategori '${existingCategory.name}' berhasil dihapus.`,
    });
  } catch (error) {
    console.error('DELETE /api/categories/[id] error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
