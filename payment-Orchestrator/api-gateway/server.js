const express = require('express');
const app = express();
require('dotenv').config();
const { initializeConnections } = require('./config/connection');
const { logger, loggerMiddleware } = require('../shared/middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');
const { authenticateJWT } = require('../shared/middleware/auth');
const PORT = process.env.API_GATEWAY_PORT;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);

// Health check route
app.get('/health', (req, res) => {
    logger.info('Health check endpoint called');
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use(authenticateJWT);
app.use(routes);

// Global error handler
app.use(errorHandler);

// Start server with database connections
const startServer = async () => {
    let server;

    try {
        const { postgresPool, redisClient } = await initializeConnections();

        app.locals.postgresPool = postgresPool;
        app.locals.redisClient = redisClient;

        server = app.listen(PORT, () => {
            logger.info(`🚀 API gateway Server started on port ${PORT}`);
            logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });

        const shutdown = async (signal) => {
            logger.info(`${signal} signal received: closing HTTP server`);
            if (server) {
                server.close(() => {
                    logger.info('HTTP server closed');
                    postgresPool.end();
                    redisClient.quit();
                    process.exit(0);
                });
            } else {
                postgresPool.end();
                redisClient.quit();
                process.exit(0);
            }
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    } catch (error) {
        logger.fatal('Failed to start API gateway server', {
            error: error.message,
            stack: error.stack
        });
        process.exit(1);
    }
};

startServer();

module.exports = app;
