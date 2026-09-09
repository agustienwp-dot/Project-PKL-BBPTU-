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

    const [
      totalAnimals,
      availableAnimals,
      soldAnimals,
      deceasedAnimals,
      totalCages,
      totalSales,
      revenueAggregate,
      cagesWithStock,
    ] = await Promise.all([
      prisma.animal.count(),
      prisma.animal.count({ where: { status: 'AVAILABLE' } }),
      prisma.animal.count({ where: { status: 'SOLD' } }),
      prisma.animal.count({ where: { status: 'DECEASED' } }),
      prisma.cage.count({ where: { isActive: true } }),
      prisma.sale.count(),
      prisma.sale.aggregate({
        _sum: { sellingPrice: true },
      }),
      prisma.cage.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          type: true,
          capacity: true,
          _count: {
            select: {
              animals: { where: { status: 'AVAILABLE' } },
            },
          },
        },
      }),
    ]);

    const totalRevenue = revenueAggregate._sum.sellingPrice || 0;

    const cageStockDetails = cagesWithStock.map((c) => {
      const availableAnimalsCount = c._count.animals;
      return {
        cageId: c.id,
        cageName: c.name,
        cageType: c.type,
        capacity: c.capacity,
        availableAnimalsCount,
        emptySlots: Math.max(0, c.capacity - availableAnimalsCount),
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        totalAnimals,
        availableAnimals,
        soldAnimals,
        deceasedAnimals,
        totalCages,
        totalSales,
        totalRevenue,
        cageStockDetails,
      },
    });
  } catch (error) {
    console.error('GET /api/dashboard error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
