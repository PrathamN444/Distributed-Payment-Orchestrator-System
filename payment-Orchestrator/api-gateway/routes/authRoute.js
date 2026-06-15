const express = require('express');
const router = express.Router();
const { generateJwtTokenController } = require('../controllers/authController');
const { rateLimitMiddleware } = require('../middleware/rateLimiter');
const { API_METHODS } = require('../constants/rateLimitingConstants');

router.post('/', rateLimitMiddleware(API_METHODS.GenerateJwtTokenLimiterConfig), generateJwtTokenController);

module.exports = router;