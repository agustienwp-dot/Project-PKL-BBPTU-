const express = require('express');
const { getDashboardStats } = require('../controllers/dashboardController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authenticate, getDashboardStats);

module.exports = router;
