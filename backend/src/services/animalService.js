const prisma = require('../config/prisma');

const getAllAnimals = async (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  const { search, status, type, cageId, sortBy = 'createdAt', order = 'desc' } = query;

  const where = {};

  if (search) {
    where.OR = [
      { code: { contains: search } },
      { name: { contains: search } },
      { breed: { contains: search } },
    ];
  }

  if (status) where.status = status;
  if (type) where.type = type;
  if (cageId) where.cageId = cageId;

  const validSortFields = ['createdAt', 'code', 'name', 'weight', 'purchasePrice', 'estimatedSellingPrice', 'status'];
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const sortOrder = order.toLowerCase() === 'asc' ? 'asc' : 'desc';

  const [total, animals] = await Promise.all([
    prisma.animal.count({ where }),
    prisma.animal.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortField]: sortOrder },
      include: {
        cage: {
          select: { id: true, name: true, location: true, capacity: true },
        },
        sale: {
          select: { id: true, sellingPrice: true, saleDate: true, buyer: { select: { id: true, name: true } } },
        },
      },
    }),
  ]);

  return {
    animals,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getAnimalById = async (id) => {
  const animal = await prisma.animal.findUnique({
    where: { id },
    include: {
      cage: true,
      sale: {
        include: {
          buyer: true,
        },
      },
      weightHistories: {
        orderBy: { recordedAt: 'desc' },
      },
      movements: {
        orderBy: { movedAt: 'desc' },
        include: {
          fromCage: { select: { id: true, name: true } },
          toCage: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!animal) {
    const error = new Error('Hewan tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  return animal;
};

const createAnimal = async (data) => {
  // 1. Check code uniqueness
  const existingCode = await prisma.animal.findUnique({
    where: { code: data.code },
  });
  if (existingCode) {
    const error = new Error(`Kode hewan '${data.code}' sudah digunakan`);
    error.statusCode = 400;
    throw error;
  }

  // 2. Check cage capacity
  const cage = await prisma.cage.findUnique({
    where: { id: data.cageId },
    include: {
      _count: {
        select: { animals: { where: { status: 'AVAILABLE' } } },
      },
    },
  });

  if (!cage) {
    const error = new Error('Kandang tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  const requestedStatus = data.status || 'AVAILABLE';
  if (requestedStatus === 'AVAILABLE' && cage._count.animals >= cage.capacity) {
    const error = new Error(`Kandang '${cage.name}' sudah penuh (Kapasitas: ${cage.capacity})`);
    error.statusCode = 400;
    throw error;
  }

  // Format dates if provided as strings
  const payload = {
    ...data,
    birthDate: data.birthDate ? new Date(data.birthDate) : null,
    entryDate: data.entryDate ? new Date(data.entryDate) : new Date(),
    status: requestedStatus,
  };

  return await prisma.$transaction(async (tx) => {
    const newAnimal = await tx.animal.create({
      data: payload,
    });

    // Create initial weight history record
    await tx.animalWeightHistory.create({
      data: {
        animalId: newAnimal.id,
        weight: newAnimal.weight,
        recordedAt: new Date(),
        notes: 'Catatan berat awal saat dimasukkan ke sistem',
      },
    });

    return newAnimal;
  });
};

const updateAnimal = async (id, data) => {
  const existing = await prisma.animal.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error('Hewan tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  if (data.code && data.code !== existing.code) {
    const existingCode = await prisma.animal.findUnique({ where: { code: data.code } });
    if (existingCode) {
      const error = new Error(`Kode hewan '${data.code}' sudah digunakan`);
      error.statusCode = 400;
      throw error;
    }
  }

  // If cageId is being changed, verify capacity
  if (data.cageId && data.cageId !== existing.cageId) {
    const newCage = await prisma.cage.findUnique({
      where: { id: data.cageId },
      include: {
        _count: { select: { animals: { where: { status: 'AVAILABLE' } } } },
      },
    });

    if (!newCage) {
      const error = new Error('Kandang tujuan tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    const currentStatus = data.status || existing.status;
    if (currentStatus === 'AVAILABLE' && newCage._count.animals >= newCage.capacity) {
      const error = new Error(`Kandang '${newCage.name}' sudah penuh (Kapasitas: ${newCage.capacity})`);
      error.statusCode = 400;
      throw error;
    }
  }

  const payload = { ...data };
  if (data.birthDate) payload.birthDate = new Date(data.birthDate);

  return await prisma.animal.update({
    where: { id },
    data: payload,
  });
};

const deleteAnimal = async (id) => {
  const existing = await prisma.animal.findUnique({
    where: { id },
    include: { sale: true },
  });

  if (!existing) {
    const error = new Error('Hewan tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  if (existing.sale) {
    const error = new Error('Hewan yang sudah memiliki transaksi penjualan tidak dapat dihapus.');
    error.statusCode = 400;
    throw error;
  }

  return await prisma.animal.delete({ where: { id } });
};

// Weight History Service Methods
const getWeightHistory = async (animalId) => {
  const animal = await prisma.animal.findUnique({ where: { id: animalId } });
  if (!animal) {
    const error = new Error('Hewan tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.animalWeightHistory.findMany({
    where: { animalId },
    orderBy: { recordedAt: 'desc' },
  });
};

const addWeightRecord = async (animalId, weight, notes) => {
  const animal = await prisma.animal.findUnique({ where: { id: animalId } });
  if (!animal) {
    const error = new Error('Hewan tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Create weight history entry
    const history = await tx.animalWeightHistory.create({
      data: {
        animalId,
        weight,
        recordedAt: new Date(),
        notes,
      },
    });

    // 2. Update current weight on animal
    await tx.animal.update({
      where: { id: animalId },
      data: { weight },
    });

    return history;
  });
};

// Movement Service Methods
const moveAnimal = async (animalId, toCageId, notes, userId) => {
  const animal = await prisma.animal.findUnique({ where: { id: animalId } });
  if (!animal) {
    const error = new Error('Hewan tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  if (animal.cageId === toCageId) {
    const error = new Error('Hewan sudah berada di kandang yang dipilih.');
    error.statusCode = 400;
    throw error;
  }

  const targetCage = await prisma.cage.findUnique({
    where: { id: toCageId },
    include: {
      _count: {
        select: { animals: { where: { status: 'AVAILABLE' } } },
      },
    },
  });

  if (!targetCage) {
    const error = new Error('Kandang tujuan tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  if (!targetCage.isActive) {
    const error = new Error('Kandang tujuan tidak aktif.');
    error.statusCode = 400;
    throw error;
  }

  // Verify capacity
  if (animal.status === 'AVAILABLE' && targetCage._count.animals >= targetCage.capacity) {
    const error = new Error(`Kandang tujuan '${targetCage.name}' telah penuh (Kapasitas: ${targetCage.capacity})`);
    error.statusCode = 400;
    throw error;
  }

  const fromCageId = animal.cageId;

  // Execute inside atomic database transaction
  return await prisma.$transaction(async (tx) => {
    // 1. Update animal cageId
    const updatedAnimal = await tx.animal.update({
      where: { id: animalId },
      data: { cageId: toCageId },
    });

    // 2. Record AnimalMovement
    const movement = await tx.animalMovement.create({
      data: {
        animalId,
        fromCageId,
        toCageId,
        movedAt: new Date(),
        notes,
      },
    });

    // 3. Record AuditLog
    await tx.auditLog.create({
      data: {
        userId: userId || null,
        action: 'MOVE_ANIMAL',
        entity: 'Animal',
        entityId: animalId,
        details: `Memindahkan hewan ${animal.code} dari kandang ${fromCageId} ke ${toCageId}`,
      },
    });

    return {
      animal: updatedAnimal,
      movement,
    };
  });
};

const getMovements = async (animalId) => {
  const animal = await prisma.animal.findUnique({ where: { id: animalId } });
  if (!animal) {
    const error = new Error('Hewan tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.animalMovement.findMany({
    where: { animalId },
    orderBy: { movedAt: 'desc' },
    include: {
      fromCage: { select: { id: true, name: true } },
      toCage: { select: { id: true, name: true } },
    },
  });
};

module.exports = {
  getAllAnimals,
  getAnimalById,
  createAnimal,
  updateAnimal,
  deleteAnimal,
  getWeightHistory,
  addWeightRecord,
  moveAnimal,
  getMovements,
};
