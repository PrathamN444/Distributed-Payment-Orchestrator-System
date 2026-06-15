const express = require('express');
const router = express.Router();
const paymentRoutes = require('./paymentRoute');
const authRoutes = require('./authRoute');

router.use('/api/v1', paymentRoutes);
router.use('/api/v1/generate-jwt-token', authRoutes);

module.exports = router;