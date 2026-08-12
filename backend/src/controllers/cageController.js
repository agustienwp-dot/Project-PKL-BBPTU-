const cageService = require('../services/cageService');

const getAllCages = async (req, res, next) => {
  try {
    const cages = await cageService.getAllCages();
    res.status(200).json({
      success: true,
      message: 'Daftar kandang berhasil diambil',
      data: cages,
    });
  } catch (error) {
    next(error);
  }
};

const getCageById = async (req, res, next) => {
  try {
    const cage = await cageService.getCageById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Detail kandang berhasil diambil',
      data: cage,
    });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

const createCage = async (req, res, next) => {
  try {
    const newCage = await cageService.createCage(req.body);
    res.status(201).json({
      success: true,
      message: 'Kandang berhasil ditambahkan',
      data: newCage,
    });
  } catch (error) {
    next(error);
  }
};

const updateCage = async (req, res, next) => {
  try {
    const updatedCage = await cageService.updateCage(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Data kandang berhasil diperbarui',
      data: updatedCage,
    });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

const deleteCage = async (req, res, next) => {
  try {
    await cageService.deleteCage(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Kandang berhasil dihapus',
      data: null,
    });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

module.exports = {
  getAllCages,
  getCageById,
  createCage,
  updateCage,
  deleteCage,
};
