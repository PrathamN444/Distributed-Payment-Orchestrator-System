const router = require('express').Router();
const { createPaymentController, getPaymentStatusController } = require('../controllers/paymentController');

router.post('/payments', createPaymentController);
router.get('/payments/:id', getPaymentStatusController);

module.exports = router;