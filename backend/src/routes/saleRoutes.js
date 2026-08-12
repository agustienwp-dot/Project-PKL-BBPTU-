const express = require('express');
const { getAllSales, getSaleById, createSale } = require('../controllers/saleController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validate, saleSchema } = require('../validators');

const router = express.Router();

router.get('/', authenticate, getAllSales);
router.get('/:id', authenticate, getSaleById);
router.post('/', authenticate, validate(saleSchema), createSale);

module.exports = router;
