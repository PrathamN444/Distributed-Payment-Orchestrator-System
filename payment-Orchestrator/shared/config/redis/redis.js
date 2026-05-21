const Redis = require('ioredis');
const { logger } = require('../../middleware/logger');

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  // password: process.env.REDIS_PASSWORD || undefined,
  // db: process.env.REDIS_DB || 0,
  enableReadyCheck: true,
  enableOfflineQueue: true,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

const connectRedis = async (retries = 0) => {

  return new Promise((resolve, reject) => {
    const handleConnect = () => {
      cleanup();
      logger.info('✓ Redis Cache Connected Successfully');
      resolve(redis);
    };

    const handleError = (error) => {
      cleanup();
      redis.disconnect();

      if (retries < MAX_RETRIES) {
        logger.warn(`Redis connection failed, retrying (${retries + 1}/${MAX_RETRIES})`, {
          error: error.message,
          nextRetryInSeconds: RETRY_DELAY / 1000,
        });

        setTimeout(() => {
          connectRedis(retries + 1).then(resolve).catch(reject);
        }, RETRY_DELAY);
        return;
      }

      logger.error('✗ Redis connection failed after all retries', {
        error: error.message,
        totalRetries: MAX_RETRIES,
      });
      reject(error);
    };

    const cleanup = () => {
      redis.off('connect', handleConnect);
      redis.off('error', handleError);
    };

    redis.once('connect', handleConnect);
    redis.once('error', handleError);
  });
};

module.exports = { connectRedis, redis };