const { Pool } = require('pg');
const { logger } = require('../../middleware/logger');

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

const connectPostgres = async (retries = 0) => {
  try {
    const pool = new Pool({
      host: process.env.POSTGRES_DB_HOST || 'localhost',
      port: process.env.POSTGRES_DB_PORT || 5432,
      user: process.env.POSTGRES_DB_USER || 'postgres',
      password: process.env.POSTGRES_DB_PASSWORD || 'password',
      database: process.env.POSTGRES_DB_NAME || 'payments_db',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    const client = await pool.connect();
    client.release();

    logger.info('✓ PostgreSQL Database Connected Successfully');
    return pool;
  } catch (error) {
    if (retries < MAX_RETRIES) {
      logger.warn(`PostgreSQL connection failed, retrying (${retries + 1}/${MAX_RETRIES})`, {
        error: error.message,
        nextRetryInSeconds: RETRY_DELAY / 1000,
      });

      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return connectPostgres(retries + 1);
    }

    logger.error('✗ PostgreSQL connection failed after all retries', {
      error: error.message,
      totalRetries: MAX_RETRIES,
    });
    throw error;
  }
};

module.exports = { connectPostgres };