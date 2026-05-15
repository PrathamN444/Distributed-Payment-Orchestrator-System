const winston = require('winston');
const path = require('path');

// Define log levels and colors
const customLevels = {
    levels: {
        fatal: 0,
        error: 1,
        warn: 2,
        info: 3,
        debug: 4,
        trace: 5
    },
    colors: {
        fatal: 'red',
        error: 'red',
        warn: 'yellow',
        info: 'green',
        debug: 'blue',
        trace: 'gray'
    }
};

// Create logger instance
const logger = winston.createLogger({
    levels: customLevels.levels,
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
            let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
            if (stack) {
                log += `\n${stack}`;
            }
            if (Object.keys(meta).length > 0) {
                log += `\nMeta: ${JSON.stringify(meta, null, 2)}`;
            }
            return log;
        })
    ),
    defaultMeta: { service: 'payment-orchestrator' },
    transports: [
        // Console transport
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize({ colors: customLevels.colors }),
                winston.format.printf(({ timestamp, level, message, stack }) => {
                    let log = `${timestamp} [${level}]: ${message}`;
                    if (stack) {
                        log += `\n${stack}`;
                    }
                    return log;
                })
            )
        }),
        // File transport - Error logs
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/error.log'),
            level: 'error',
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.json()
            )
        }),
        // File transport - Combined logs
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/combined.log'),
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.json()
            )
        })
    ]
});

// Middleware to attach logger to request object
const loggerMiddleware = (req, res, next) => {
    req.logger = logger;

    // Log incoming request
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent')
    });

    // Log response on finish
    res.on('finish', () => {
        logger.info(`${req.method} ${req.path} - ${res.statusCode}`, {
            statusCode: res.statusCode,
            duration: `${Date.now() - req.startTime}ms`
        });
    });

    req.startTime = Date.now();
    next();
};

module.exports = { logger, loggerMiddleware };
