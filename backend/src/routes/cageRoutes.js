const express = require('express');
const { getAllCages, getCageById, createCage, updateCage, deleteCage } = require('../controllers/cageController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { validate, cageSchema, cageUpdateSchema } = require('../validators');

const router = express.Router();

// Public / Authenticated Routes
router.get('/', authenticate, getAllCages);
router.get('/:id', authenticate, getCageById);

// Admin / Staff Operational Routes
router.post('/', authenticate, validate(cageSchema), createCage);
router.put('/:id', authenticate, validate(cageUpdateSchema), updateCage);

// Admin Only Delete Route
router.delete('/:id', authenticate, authorize('ADMIN'), deleteCage);

module.exports = router;
