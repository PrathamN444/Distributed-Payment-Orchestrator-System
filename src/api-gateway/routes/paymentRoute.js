const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/payments', paymentController.createPaymentController);
router.get('/payments/:id', paymentController.getPaymentStatusController);

module.exports = router;