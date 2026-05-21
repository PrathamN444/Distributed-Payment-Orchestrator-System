const { Worker, UnrecoverableError } = require('bullmq');
const {redis} = require('../../shared/config/redis/redis');
const { logger } = require('../../shared/middleware/logger');
const paymentRepository = require('../repositories/paymentRepository');
const { paymentDLQ } = require('./paymentQueue');
const { PAYMENT_STATUS } = require('../constants/paymentConstants');

// provider timeout wrapper to handle provider timeouts and mark them as retryable errors
const withTimeout = (promise, timeoutMs) => {
  const error = new Error('Provider request timeout');
  error.retryable = true;  // mark as retryable for BullMQ to handle retries
  return Promise.race([
    promise, new Promise((_, reject) => setTimeout(() => {
      reject(error);
    }, timeoutMs))
  ]);
};

// Simulated payment provider call
const processProviderPayment = async (jobData) => {

  // Simulate external API
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Random failures for testing
  const random = Math.random();
  if(random < 0.3){
    throw new Error('BullMQ Provider timeout.');
  }
    
  return{ success: true, providerReference: `txn_${Date.now()}` };
};

// Worker to process payment jobs
const paymentWorker = new Worker('payment-processing', async (job) => {
  const { payment_id, provider_transaction_id } = job.data;
  logger.info('Processing payment job', { payment_id, attempt: job.attemptsMade + 1 });

  try{
    // payment validation to prevent duplicate processing in case of retries and ensure idempotency
    const paymentDetails = await paymentRepository.getPaymentById(provider_transaction_id);
    
    if(!paymentDetails){
      logger.error('Payment record not found in DB', { payment_id, provider_transaction_id });
      const error = new Error('Payment record not found');
      error.retryable = false;  // mark as non-retryable to move to DLQ immediately
      throw error;
    }

    if(paymentDetails.status === PAYMENT_STATUS.SUCCESS){
      logger.info('Payment already marked as success. Skipping processing.', { payment_id });
      return true;
    }

    await paymentRepository.updatePayment({ paymentId: payment_id, status: PAYMENT_STATUS.PROCESSING });

    // Call provider with timeout handling for 10 seconds
    const providerResponse = await withTimeout(processProviderPayment( job.data ), 10000);

    // mark status as success and update provider reference in provider transaction id
    await paymentRepository.updatePayment({ paymentId: payment_id, status: PAYMENT_STATUS.SUCCESS, providerTransactionId: providerResponse.providerReference });

    logger.info('Payment processed successfully', { paymentId: payment_id });
    return true;
  } 
  catch(error){
    logger.error( 'Payment processing failed', { payment_id, retryable: error.retryable, attempt: job.attemptsMade + 1, error: error.message });

    if(job.attemptsMade + 1 >= job.opts.attempts || error.retryable === false){
      logger.error(`Payment job failed after ${job.attemptsMade + 1} retries. maximum attempts: ${job.opts.attempts}. Moving to DLQ`, { payment_id });

      // mark payment as failed in DB with total retry attempts 
      await paymentRepository.updatePayment({paymentId: payment_id, failureReason: error.message, status: PAYMENT_STATUS.FAILED, retryCount: job.attemptsMade + 1});

      // add failed job details to DLQ for further analysis and manual intervention if needed
      await paymentDLQ.add('failed-payment', { 
        originalJob: job.data,
        payment_id, failureReason: error.message, 
        attemptsMade: job.attemptsMade + 1, 
        failedAt: new Date().toISOString() 
      },
      { jobId: payment_id });

      // if the error is non-retryable, throw UnrecoverableError to prevent further retries and move to DLQ immediately
      if(error.retryable === false){
        throw new UnrecoverableError(error.message);
      }
    } 
    else{
      await paymentRepository.updatePayment({paymentId: payment_id, failureReason: error.message, status: PAYMENT_STATUS.RETRYING, retryCount: job.attemptsMade + 1});
    }
    
    throw error;
  }
},{
    connection:redis,
    concurrency: 2,
    settings: {
      stalledInterval: 30000,
      maxStalledCount: 2,
    }
});

paymentWorker.on('completed', (job) => { 
  logger.info(`Job completed with jobId: ${job.id}`)}
);

paymentWorker.on('failed', (job, error) => {
  logger.error(`Job failed with JobId: ${job.id}, attempt: ${job.attemptsMade}, error: ${error.message}`);
});

paymentWorker.on('error', (error) => {
  logger.error(`Worker crashed, error: ${error.message}`)
});

// shutting down worker gracefully on SIGINT
process.on('SIGINT', async () => {
    logger.info('Closing payment worker');
    await paymentWorker.close();
    process.exit(0);
  }
);

module.exports = paymentWorker;