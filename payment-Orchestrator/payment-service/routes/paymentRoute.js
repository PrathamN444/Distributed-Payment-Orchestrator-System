const { createPaymentController, getPaymentStatusController } = require('../controllers/paymentController');

const router = require('express').Router();

router.post('/payments', createPaymentController);
router.get('/payments', getPaymentStatusController);

module.exports = router;