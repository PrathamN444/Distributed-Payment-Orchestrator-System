const { logger } = require('../../shared/middleware/logger');
const { connectPostgres } = require('../../shared/config/db/postgres');
const { connectRedis } = require('../../shared/config/redis/redis');

const initializeConnections = async () => {
    try {
        logger.info('🔄 Initializing database connections...');

        const [postgresPool, redisClient] = await Promise.all([
            connectPostgres(),
            connectRedis(),
        ]);

        logger.info('🎉 All database connections initialized successfully');

        return {
            postgresPool,
            redisClient,
        };
    } catch (error) {
        logger.fatal('Failed to initialize database connections', {
            error: error.message,
            stack: error.stack,
        });
        process.exit(1);
    }
};

module.exports = {
    initializeConnections,
    connectPostgres,
    connectRedis,
};
