require('dotenv').config();
const express = require('express');
const { initializeConnections } = require('./config/connection');
const { logger, loggerMiddleware } = require('../middleware/logger');
const app = express();
const PORT = process.env.PAYMENT_SERVICE_PORT;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);

// Global error handler
app.use((err, req, res, next) => {
    logger.error('Unhandled Error', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });
    res.status(500).json({ error: 'Internal Server Error' });
});

// Health check route
app.get('/health', (req, res) => {
    logger.info('Health check endpoint called');
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server with database connections
const startServer = async () => {
    let server;

    try {
        const { postgresPool, redisClient } = await initializeConnections();

        app.locals.postgresPool = postgresPool;
        app.locals.redisClient = redisClient;

        server = app.listen(PORT, () => {
            logger.info(`🚀 Server started on port ${PORT}`);
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
        logger.fatal('Failed to start server', {
            error: error.message,
            stack: error.stack
        });
        process.exit(1);
    }
};

startServer();

module.exports = app;
