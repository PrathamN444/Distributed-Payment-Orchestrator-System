const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { API_METHODS } = require('../constants/rateLimitingConstants');
const { rateLimitMiddleware } = require('../middleware/rateLimiter');

router.post('/payments', rateLimitMiddleware(API_METHODS.CreatePaymentLimiterConfig), paymentController.createPaymentController);
router.get('/payments/:id', rateLimitMiddleware(API_METHODS.GetPaymentLimiterConfig), paymentController.getPaymentStatusController);

module.exports = router;