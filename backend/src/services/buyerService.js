const prisma = require('../config/prisma');

const getAllBuyers = async (query = {}) => {
  const { search } = query;
  const where = {};

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { phone: { contains: search } },
      { address: { contains: search } },
    ];
  }

  return await prisma.buyer.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { sales: true },
      },
    },
  });
};

const getBuyerById = async (id) => {
  const buyer = await prisma.buyer.findUnique({
    where: { id },
    include: {
      sales: {
        orderBy: { saleDate: 'desc' },
        include: {
          animal: {
            select: {
              id: true,
              code: true,
              name: true,
              type: true,
              breed: true,
            },
          },
        },
      },
    },
  });

  if (!buyer) {
    const error = new Error('Data pembeli tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  return buyer;
};

const createBuyer = async (data) => {
  return await prisma.buyer.create({
    data,
  });
};

const updateBuyer = async (id, data) => {
  const existing = await prisma.buyer.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error('Data pembeli tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.buyer.update({
    where: { id },
    data,
  });
};

const deleteBuyer = async (id) => {
  const existing = await prisma.buyer.findUnique({
    where: { id },
    include: { _count: { select: { sales: true } } },
  });

  if (!existing) {
    const error = new Error('Data pembeli tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  if (existing._count.sales > 0) {
    const error = new Error('Pembeli yang memiliki riwayat transaksi tidak dapat dihapus.');
    error.statusCode = 400;
    throw error;
  }

  return await prisma.buyer.delete({ where: { id } });
};

module.exports = {
  getAllBuyers,
  getBuyerById,
  createBuyer,
  updateBuyer,
  deleteBuyer,
};
