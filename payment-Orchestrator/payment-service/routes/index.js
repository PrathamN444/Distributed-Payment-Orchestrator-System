const router = require('express').Router();
const paymentRoutes = require('./paymentRoute');

router.use('/api/v1', paymentRoutes);

module.exports = router;