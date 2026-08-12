const saleService = require('../services/saleService');

const getAllSales = async (req, res, next) => {
  try {
    const sales = await saleService.getAllSales();
    res.status(200).json({
      success: true,
      message: 'Daftar transaksi penjualan berhasil diambil',
      data: sales,
    });
  } catch (error) {
    next(error);
  }
};

const getSaleById = async (req, res, next) => {
  try {
    const sale = await saleService.getSaleById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Detail transaksi penjualan berhasil diambil',
      data: sale,
    });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

const createSale = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const newSale = await saleService.createSale(req.body, userId);
    res.status(201).json({
      success: true,
      message: 'Transaksi penjualan berhasil dicatat',
      data: newSale,
    });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

module.exports = {
  getAllSales,
  getSaleById,
  createSale,
};
