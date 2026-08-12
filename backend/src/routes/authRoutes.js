const express = require('express');
const { login, getProfile } = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');
const { loginLimiter } = require('../middlewares/rateLimiter');
const { validate, loginSchema } = require('../validators');

const router = express.Router();

router.post('/login', loginLimiter, validate(loginSchema), login);
router.get('/me', authenticate, getProfile);

module.exports = router;
