const axios = require('axios');
const CircuitBreaker = require('opossum');
const { logger } = require('../../shared/middleware/logger');

const breakerOptions = {
  timeout: 5000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000,
  volumeThreshold: 5,
  rollingCountTimeout: 10000,
  rollingCountBuckets: 10,
};

async function axiosRequest(options) {
  return axios(options);
}

const paymentServiceBreaker = new CircuitBreaker(axiosRequest, breakerOptions);

paymentServiceBreaker.on('open', () => logger.warn('PaymentService circuit opened'));
paymentServiceBreaker.on('halfOpen', () => logger.info('PaymentService circuit half-open'));
paymentServiceBreaker.on('close', () => logger.info('PaymentService circuit closed'));
paymentServiceBreaker.on('timeout', () => logger.warn('PaymentService request timed out'));
paymentServiceBreaker.on('reject', () => logger.warn('PaymentService request rejected (circuit open)'));
paymentServiceBreaker.on('failure', (error) => logger.error('PaymentService request failed', { error: error.message }));

paymentServiceBreaker.fallback(() => ({
  status: 503,
  data: { message: 'Payment service temporarily unavailable. Please try again later.' },
}));

module.exports = { paymentServiceBreaker };