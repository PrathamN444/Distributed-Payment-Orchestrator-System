const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { API_METHODS } = require('../constants/rateLimitingConstants');
const { rateLimitMiddleware } = require('../middleware/rateLimiter');
const { authenticateJWT } = require('../../shared/middleware/auth');

router.post('/payments', authenticateJWT, rateLimitMiddleware(API_METHODS.CreatePaymentLimiterConfig), paymentController.createPaymentController);
router.get('/payments/:id', authenticateJWT, rateLimitMiddleware(API_METHODS.GetPaymentLimiterConfig), paymentController.getPaymentStatusController);

module.exports = router;