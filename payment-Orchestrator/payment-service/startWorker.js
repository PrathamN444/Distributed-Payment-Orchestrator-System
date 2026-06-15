require('dotenv').config();
const { logger } = require('../shared/middleware/logger');
const { initializeConnections } = require('./config/connection');

initializeConnections()
  .then(() => {
    // start the worker after DB & Redis are ready
    require('./utils/paymentWorker');
    logger.info('Worker started');
  })
  .catch((err) => {
    logger.error('Failed to init connections for worker', {
      error: err.message,
      stack: err.stack
    });
    process.exit(1);
  });