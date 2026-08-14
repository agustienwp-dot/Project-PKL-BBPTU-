import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const animalType = searchParams.get('animalType');
    const date = searchParams.get('date');

    const where = {};
    if (categoryId) where.categoryId = categoryId;
    if (animalType) where.animalType = animalType;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const packagings = await prisma.milkPackaging.findMany({
      where,
      include: {
        category: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ success: true, data: packagings });
  } catch (error) {
    console.error('GET /api/farm/packaging error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (authUser.role !== 'ADMIN_FARM' && authUser.role !== 'SUPERADMIN')) {
      return NextResponse.json({ success: false, message: 'Akses ditolak: Hanya Admin Farm atau Superadmin yang dapat menginput hasil pengemasan' }, { status: 403 });
    }

    const { date, categoryId, animalType, processedLiters, botolQty, cupQty, plastikBantalQty, notes } = await request.json();

    const liters = parseFloat(processedLiters) || 0;
    const botol = parseInt(botolQty, 10) || 0;
    const cup = parseInt(cupQty, 10) || 0;
    const plastikBantal = parseInt(plastikBantalQty, 10) || 0;

    // Validation
    if (liters < 0 || botol < 0 || cup < 0 || plastikBantal < 0) {
      return NextResponse.json({ success: false, message: 'Jumlah liter dan kemasan tidak boleh bernilai negatif' }, { status: 400 });
    }

    const totalPackagedQty = botol + cup + plastikBantal;
    if (totalPackagedQty <= 0 && liters <= 0) {
      return NextResponse.json({ success: false, message: 'Harap masukkan jumlah liter diproses atau jumlah kemasan valid' }, { status: 400 });
    }

    const aType = animalType || 'SAPI';

    const packaging = await prisma.milkPackaging.create({
      data: {
        date: date ? new Date(date) : new Date(),
        animalType: aType,
        categoryId: categoryId || null,
        processedLiters: liters,
        botolQty: botol,
        cupQty: cup,
        plastikBantalQty: plastikBantal,
        totalPackagedQty,
        notes: notes || '',
        status: 'SELESAI',
        createdById: authUser.id,
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
        action: 'CREATE_PACKAGING',
        details: `Pengemasan ${aType}: ${liters}L diproses -> Botol: ${botol}, Cup: ${cup}, Plastik Bantal: ${plastikBantal} (Total: ${totalPackagedQty} pcs)`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Hasil pengemasan (${totalPackagedQty} pcs) berhasil dicatat!`,
      data: packaging,
    });
  } catch (error) {
    console.error('POST /api/farm/packaging error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
