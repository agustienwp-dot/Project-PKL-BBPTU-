const prisma = require('../config/prisma');

const getAllSales = async () => {
  return await prisma.sale.findMany({
    orderBy: { saleDate: 'desc' },
    include: {
      animal: {
        select: {
          id: true,
          code: true,
          name: true,
          type: true,
          breed: true,
          gender: true,
        },
      },
      buyer: {
        select: {
          id: true,
          name: true,
          phone: true,
          address: true,
        },
      },
    },
  });
};

const getSaleById = async (id) => {
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      animal: true,
      buyer: true,
    },
  });

  if (!sale) {
    const error = new Error('Transaksi penjualan tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  return sale;
};

const createSale = async (data, userId) => {
  const { animalId, buyerId, weightAtSale, sellingPrice, paymentMethod, notes } = data;

  // 1. Validate animal existence
  const animal = await prisma.animal.findUnique({
    where: { id: animalId },
    include: { sale: true },
  });

  if (!animal) {
    const error = new Error('Hewan tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  // 2. Ensure animal status is AVAILABLE
  if (animal.status !== 'AVAILABLE') {
    const error = new Error(`Hewan dengan status '${animal.status}' tidak dapat dijual.`);
    error.statusCode = 400;
    throw error;
  }

  // 3. Ensure animal has not been sold before
  if (animal.sale) {
    const error = new Error('Hewan ini telah memiliki transaksi penjualan aktif.');
    error.statusCode = 400;
    throw error;
  }

  // 4. Validate buyer existence
  const buyer = await prisma.buyer.findUnique({
    where: { id: buyerId },
  });

  if (!buyer) {
    const error = new Error('Pembeli tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  // 5. Validate selling price
  if (sellingPrice <= 0) {
    const error = new Error('Harga penjualan harus angka positif');
    error.statusCode = 400;
    throw error;
  }

  // 6, 7, 8. Execute Database Transaction for Atomic Integrity
  return await prisma.$transaction(async (tx) => {
    // Create Sale entry
    const newSale = await tx.sale.create({
      data: {
        animalId,
        buyerId,
        saleDate: new Date(),
        weightAtSale,
        sellingPrice,
        paymentMethod,
        notes,
      },
    });

    // Update Animal status to SOLD
    await tx.animal.update({
      where: { id: animalId },
      data: {
        status: 'SOLD',
        weight: weightAtSale, // Optionally update current weight to sale weight
      },
    });

    // Create Audit Log
    await tx.auditLog.create({
      data: {
        userId: userId || null,
        action: 'CREATE_SALE',
        entity: 'Sale',
        entityId: newSale.id,
        details: `Penjualan hewan ${animal.code} (${animal.name}) senilai Rp ${sellingPrice.toLocaleString()} kepada ${buyer.name}`,
      },
    });

    return newSale;
  });
};

module.exports = {
  getAllSales,
  getSaleById,
  createSale,
};
