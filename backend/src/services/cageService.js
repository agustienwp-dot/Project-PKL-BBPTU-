const prisma = require('../config/prisma');

const getAllCages = async () => {
  const cages = await prisma.cage.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          animals: {
            where: { status: 'AVAILABLE' },
          },
        },
      },
    },
  });

  return cages.map((cage) => {
    const availableCount = cage._count.animals;
    const emptySlots = Math.max(0, cage.capacity - availableCount);
    return {
      id: cage.id,
      name: cage.name,
      type: cage.type,
      location: cage.location,
      capacity: cage.capacity,
      availableAnimalsCount: availableCount,
      emptySlots,
      description: cage.description,
      isActive: cage.isActive,
      createdAt: cage.createdAt,
      updatedAt: cage.updatedAt,
    };
  });
};

const getCageById = async (id) => {
  const cage = await prisma.cage.findUnique({
    where: { id },
    include: {
      animals: {
        where: { status: 'AVAILABLE' },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!cage) {
    const error = new Error('Kandang tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  const availableAnimalsCount = cage.animals.length;
  const emptySlots = Math.max(0, cage.capacity - availableAnimalsCount);

  return {
    id: cage.id,
    name: cage.name,
    type: cage.type,
    location: cage.location,
    capacity: cage.capacity,
    availableAnimalsCount,
    emptySlots,
    description: cage.description,
    isActive: cage.isActive,
    availableAnimals: cage.animals,
    createdAt: cage.createdAt,
    updatedAt: cage.updatedAt,
  };
};

const createCage = async (data) => {
  return await prisma.cage.create({
    data,
  });
};

const updateCage = async (id, data) => {
  const existing = await prisma.cage.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error('Kandang tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.cage.update({
    where: { id },
    data,
  });
};

const deleteCage = async (id) => {
  const existing = await prisma.cage.findUnique({
    where: { id },
    include: {
      _count: {
        select: { animals: true },
      },
    },
  });

  if (!existing) {
    const error = new Error('Kandang tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  if (existing._count.animals > 0) {
    const error = new Error('Kandang tidak dapat dihapus karena masih menampung hewan.');
    error.statusCode = 400;
    throw error;
  }

  return await prisma.cage.delete({
    where: { id },
  });
};

module.exports = {
  getAllCages,
  getCageById,
  createCage,
  updateCage,
  deleteCage,
};
