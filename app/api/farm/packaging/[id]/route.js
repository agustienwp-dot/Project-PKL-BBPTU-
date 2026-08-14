import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (authUser.role !== 'ADMIN_FARM' && authUser.role !== 'SUPERADMIN')) {
      return NextResponse.json({ success: false, message: 'Akses ditolak' }, { status: 403 });
    }

    const { id } = params;
    const { date, categoryId, animalType, processedLiters, botolQty, cupQty, plastikBantalQty, notes } = await request.json();

    const existing = await prisma.milkPackaging.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Data pengemasan tidak ditemukan' }, { status: 404 });
    }

    const liters = processedLiters !== undefined ? parseFloat(processedLiters) : existing.processedLiters;
    const botol = botolQty !== undefined ? parseInt(botolQty, 10) : existing.botolQty;
    const cup = cupQty !== undefined ? parseInt(cupQty, 10) : existing.cupQty;
    const plastikBantal = plastikBantalQty !== undefined ? parseInt(plastikBantalQty, 10) : existing.plastikBantalQty;

    if (liters < 0 || botol < 0 || cup < 0 || plastikBantal < 0) {
      return NextResponse.json({ success: false, message: 'Nilai jumlah liter dan pcs kemasan tidak boleh negatif' }, { status: 400 });
    }

    const totalPackagedQty = botol + cup + plastikBantal;

    const updated = await prisma.milkPackaging.update({
      where: { id },
      data: {
        date: date ? new Date(date) : existing.date,
        animalType: animalType !== undefined ? animalType : existing.animalType,
        categoryId: categoryId !== undefined ? categoryId : existing.categoryId,
        processedLiters: liters,
        botolQty: botol,
        cupQty: cup,
        plastikBantalQty: plastikBantal,
        totalPackagedQty,
        notes: notes !== undefined ? notes : existing.notes,
      },
      include: {
        category: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    await prisma.systemLog.create({
      data: {
        userId: authUser.id,
        userEmail: authUser.email,
        action: 'UPDATE_PACKAGING',
        details: `Memperbarui data pengemasan ID ${id}: Total ${totalPackagedQty} pcs`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Data pengemasan berhasil diperbarui',
      data: updated,
    });
  } catch (error) {
    console.error('PUT /api/farm/packaging/[id] error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (authUser.role !== 'ADMIN_FARM' && authUser.role !== 'SUPERADMIN')) {
      return NextResponse.json({ success: false, message: 'Akses ditolak' }, { status: 403 });
    }

    const { id } = params;

    const existing = await prisma.milkPackaging.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Data pengemasan tidak ditemukan' }, { status: 404 });
    }

    await prisma.milkPackaging.delete({ where: { id } });

    await prisma.systemLog.create({
      data: {
        userId: authUser.id,
        userEmail: authUser.email,
        action: 'DELETE_PACKAGING',
        details: `Menghapus data pengemasan ID ${id}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Data pengemasan berhasil dihapus',
    });
  } catch (error) {
    console.error('DELETE /api/farm/packaging/[id] error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
