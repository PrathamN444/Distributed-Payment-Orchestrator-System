const { Queue } = require('bullmq');
const {redis} = require('../../shared/config/redis/redis');

const paymentQueue = new Queue('payment-processing',
    {
        connection: redis,
        defaultJobOptions: {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
            removeOnComplete: 1000,
            removeOnFail: false,
        },
    }
);

const paymentDLQ = new Queue('payment-dlq', { connection: redis });

module.exports = {paymentQueue, paymentDLQ};