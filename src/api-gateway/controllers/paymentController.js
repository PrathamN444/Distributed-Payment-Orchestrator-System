const { logger } = require('../../middleware/logger');
const { callPaymentService } = require('../services/paymentServiceClient');

const paymentController = {
  async createPaymentController(req, res, next) {
    try {
      const response = await callPaymentService({
        method: 'post',
        path: '/api/v1/payments',
        data: req.body,
        jwtToken: req.headers['jwt-token'],
      });

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
      const response = await callPaymentService({
        method: 'get',
        path: `/api/v1/payments/${req.params.id}`,
        jwtToken: req.headers['jwt-token'],
      });

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