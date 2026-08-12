const buyerService = require('../services/buyerService');

const getAllBuyers = async (req, res, next) => {
  try {
    const buyers = await buyerService.getAllBuyers(req.query);
    res.status(200).json({
      success: true,
      message: 'Daftar pembeli berhasil diambil',
      data: buyers,
    });
  } catch (error) {
    next(error);
  }
};

const getBuyerById = async (req, res, next) => {
  try {
    const buyer = await buyerService.getBuyerById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Detail pembeli berhasil diambil',
      data: buyer,
    });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

const createBuyer = async (req, res, next) => {
  try {
    const newBuyer = await buyerService.createBuyer(req.body);
    res.status(201).json({
      success: true,
      message: 'Data pembeli berhasil ditambahkan',
      data: newBuyer,
    });
  } catch (error) {
    next(error);
  }
};

const updateBuyer = async (req, res, next) => {
  try {
    const updatedBuyer = await buyerService.updateBuyer(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Data pembeli berhasil diperbarui',
      data: updatedBuyer,
    });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

const deleteBuyer = async (req, res, next) => {
  try {
    await buyerService.deleteBuyer(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Data pembeli berhasil dihapus',
      data: null,
    });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

module.exports = {
  getAllBuyers,
  getBuyerById,
  createBuyer,
  updateBuyer,
  deleteBuyer,
};
