const animalService = require('../services/animalService');

const getAllAnimals = async (req, res, next) => {
  try {
    const result = await animalService.getAllAnimals(req.query);
    res.status(200).json({
      success: true,
      message: 'Daftar hewan berhasil diambil',
      data: result.animals,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getAnimalById = async (req, res, next) => {
  try {
    const animal = await animalService.getAnimalById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Detail hewan berhasil diambil',
      data: animal,
    });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

const createAnimal = async (req, res, next) => {
  try {
    const newAnimal = await animalService.createAnimal(req.body);
    res.status(201).json({
      success: true,
      message: 'Data hewan berhasil ditambahkan',
      data: newAnimal,
    });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

const updateAnimal = async (req, res, next) => {
  try {
    const updatedAnimal = await animalService.updateAnimal(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Data hewan berhasil diperbarui',
      data: updatedAnimal,
    });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

const deleteAnimal = async (req, res, next) => {
  try {
    await animalService.deleteAnimal(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Data hewan berhasil dihapus',
      data: null,
    });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

// Weight History Handlers
const getWeightHistory = async (req, res, next) => {
  try {
    const weights = await animalService.getWeightHistory(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Riwayat berat hewan berhasil diambil',
      data: weights,
    });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

const addWeightRecord = async (req, res, next) => {
  try {
    const record = await animalService.addWeightRecord(
      req.params.id,
      req.body.weight,
      req.body.notes
    );
    res.status(201).json({
      success: true,
      message: 'Catatan berat hewan berhasil ditambahkan',
      data: record,
    });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

// Movement Handlers
const moveAnimal = async (req, res, next) => {
  try {
    const result = await animalService.moveAnimal(
      req.params.id,
      req.body.toCageId,
      req.body.notes,
      req.user ? req.user.id : null
    );
    res.status(200).json({
      success: true,
      message: 'Hewan berhasil dipindahkan ke kandang baru',
      data: result,
    });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

const getMovements = async (req, res, next) => {
  try {
    const movements = await animalService.getMovements(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Riwayat perpindahan kandang berhasil diambil',
      data: movements,
    });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
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
