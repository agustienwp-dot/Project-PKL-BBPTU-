const prisma = require('../config/prisma');

const getDashboardStats = async () => {
  const [
    totalAnimals,
    availableAnimals,
    soldAnimals,
    deceasedAnimals,
    transferredAnimals,
    totalCages,
    totalSales,
    salesAggregation,
    cagesWithStock,
  ] = await Promise.all([
    prisma.animal.count(),
    prisma.animal.count({ where: { status: 'AVAILABLE' } }),
    prisma.animal.count({ where: { status: 'SOLD' } }),
    prisma.animal.count({ where: { status: 'DECEASED' } }),
    prisma.animal.count({ where: { status: 'TRANSFERRED' } }),
    prisma.cage.count({ where: { isActive: true } }),
    prisma.sale.count(),
    prisma.sale.aggregate({
      _sum: {
        sellingPrice: true,
      },
    }),
    prisma.cage.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        type: true,
        capacity: true,
        _count: {
          select: { animals: { where: { status: 'AVAILABLE' } } },
        },
      },
    }),
  ]);

  const totalRevenue = salesAggregation._sum.sellingPrice || 0;

  const cageStockDetails = cagesWithStock.map((cage) => ({
    cageId: cage.id,
    cageName: cage.name,
    cageType: cage.type,
    capacity: cage.capacity,
    availableAnimalsCount: cage._count.animals,
    emptySlots: Math.max(0, cage.capacity - cage._count.animals),
  }));

  return {
    totalAnimals,
    availableAnimals,
    soldAnimals,
    deceasedAnimals,
    transferredAnimals,
    totalCages,
    totalSales,
    totalRevenue,
    cageStockDetails,
  };
};

module.exports = {
  getDashboardStats,
};
