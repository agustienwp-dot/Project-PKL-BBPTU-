const express = require('express');
const { getAllBuyers, getBuyerById, createBuyer, updateBuyer, deleteBuyer } = require('../controllers/buyerController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { validate, buyerSchema } = require('../validators');

const router = express.Router();

router.get('/', authenticate, getAllBuyers);
router.get('/:id', authenticate, getBuyerById);
router.post('/', authenticate, validate(buyerSchema), createBuyer);
router.put('/:id', authenticate, validate(buyerSchema.deepPartial()), updateBuyer);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteBuyer);

module.exports = router;
