const express = require('express');
const {
  getAllAnimals,
  getAnimalById,
  createAnimal,
  updateAnimal,
  deleteAnimal,
  getWeightHistory,
  addWeightRecord,
  moveAnimal,
  getMovements,
} = require('../controllers/animalController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const {
  validate,
  animalSchema,
  animalUpdateSchema,
  weightRecordSchema,
  movementSchema,
} = require('../validators');

const router = express.Router();

// General Animal Routes
router.get('/', authenticate, getAllAnimals);
router.post('/', authenticate, validate(animalSchema), createAnimal);
router.get('/:id', authenticate, getAnimalById);
router.put('/:id', authenticate, validate(animalUpdateSchema), updateAnimal);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteAnimal);

// Weight History Routes
router.get('/:id/weights', authenticate, getWeightHistory);
router.post('/:id/weights', authenticate, validate(weightRecordSchema), addWeightRecord);

// Cage Movement Routes
router.post('/:id/move', authenticate, validate(movementSchema), moveAnimal);
router.get('/:id/movements', authenticate, getMovements);

module.exports = router;
