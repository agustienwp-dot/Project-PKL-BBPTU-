import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (authUser.role !== 'ADMIN_PEMASARAN' && authUser.role !== 'SUPERADMIN')) {
      return NextResponse.json({ success: false, message: 'Akses ditolak' }, { status: 403 });
    }

    const { id } = params;
    const { date, categoryId, productType, packagingType, quantity, notes } = await request.json();

    const existing = await prisma.milkOutflow.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Data pengeluaran tidak ditemukan' }, { status: 404 });
    }

    const newCategoryId = categoryId || existing.categoryId;
    const newProductType = productType || existing.productType;
    const newPackagingType = packagingType || existing.packagingType;
    const newQty = quantity !== undefined ? parseInt(quantity, 10) : existing.quantity;

    // Check available stock (excluding existing record's quantity)
    const productionSum = await prisma.milkProduction.aggregate({
      where: {
        categoryId: newCategoryId,
        packagingType: newPackagingType,
      },
      _sum: { packagedQty: true },
    });

    const outflowSum = await prisma.milkOutflow.aggregate({
      where: {
        categoryId: newCategoryId,
        packagingType: newPackagingType,
        id: { not: id },
      },
      _sum: { quantity: true },
    });

    const totalProduced = productionSum._sum.packagedQty || 0;
    const otherOutflows = outflowSum._sum.quantity || 0;
    const availableStock = totalProduced - otherOutflows;

    if (newQty > availableStock) {
      return NextResponse.json({
        success: false,
        message: `Stok tidak mencukupi! Maksimal pengeluaran yang diizinkan untuk kemasan ${newPackagingType}: ${availableStock}.`,
      }, { status: 400 });
    }

    const updated = await prisma.milkOutflow.update({
      where: { id },
      data: {
        date: date ? new Date(date) : existing.date,
        categoryId: newCategoryId,
        productType: newProductType,
        packagingType: newPackagingType,
        quantity: newQty,
        notes: notes !== undefined ? notes : existing.notes,
      },
      include: {
        category: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Data pengeluaran berhasil diperbarui',
      data: updated,
    });
  } catch (error) {
    console.error('PUT /api/pemasaran/outflow/[id] error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (authUser.role !== 'ADMIN_PEMASARAN' && authUser.role !== 'SUPERADMIN')) {
      return NextResponse.json({ success: false, message: 'Akses ditolak' }, { status: 403 });
    }

    const { id } = params;

    const existing = await prisma.milkOutflow.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Data pengeluaran tidak ditemukan' }, { status: 404 });
    }

    await prisma.milkOutflow.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Data pengeluaran berhasil dihapus.',
    });
  } catch (error) {
    console.error('DELETE /api/pemasaran/outflow/[id] error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
