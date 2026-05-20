const { logger } = require('../../shared/middleware/logger');
const { callPaymentService } = require('../services/paymentServiceClient');

const paymentController = {
  async createPaymentController(req, res, next) {
    try {
      const response = await callPaymentService(
        'post',
        '/api/v1/payments',
        req.body,
        req.headers['jwt-token'],
      );

      return res.status(response.status).json(response.data);
    } catch (error) {
      logger.error('Error in createPaymentController', {
        error: error && error.message,
        stack: error && error.stack,
      });
      return next(error);
    }
  },

  async getPaymentStatusController(req, res, next) {
    try {
      const response = await callPaymentService(
        'get',
        `/api/v1/payments`,
        req.query,
        req.headers['jwt-token'],
      );

      return res.status(response.status).json(response.data);
    } catch (error) {
      logger.error('Error in getPaymentStatusController', {
        error: error && error.message,
        stack: error && error.stack,
      });
      return next(error);
    }
  },
};

module.exports = paymentController;