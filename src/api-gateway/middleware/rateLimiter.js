const { RateLimiterRedis } = require('rate-limiter-flexible');
const Redis = require('ioredis');
const { API_METHODS, RATE_LIMITER_CONFIG } = require('../constants/rateLimitingConstants');
const { logger } = require('../../middleware/logger');

const redisClient = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
// redis connection events 
redisClient.on('connect', () => {
  logger.info('Rate limiter Redis connected');
});

redisClient.on('error', (err) => {
  logger.error('Rate limiter Redis error', {
    error: err.message,
  });
});

redisClient.on('reconnecting', () => {
  logger.warn('Rate limiter Redis reconnecting');
});

const limiterCache = new Map();

function getLimiter(cfg){
  const cacheKey = cfg.keyPrefix || `${cfg.points}:${cfg.duration}`;
  if (limiterCache.has(cacheKey)) return limiterCache.get(cacheKey);

  const limiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: cfg.keyPrefix || `rl_${cacheKey}`,
    points: cfg.points,
    duration: cfg.duration,
    blockDuration: cfg.blockDuration || 0,
  });

  limiterCache.set(cacheKey, limiter);
  return limiter;
}


function getUserKey(req) {
  if (req.user && req.user.id) {
    return `user:${req.user.id}`;
  }
  return `ip:${req.ip}`;
}

function rateLimitMiddleware(apiName){
  const cfg = RATE_LIMITER_CONFIG[apiName];
  if(!cfg){
    // return noop middleware if not configured
    return (req, res, next) => next();
  }
  const limiter = getLimiter(cfg);

  return async function (req, res, next){
    const key = getUserKey(req);
    try{
        const rateLimitingRes = await limiter.consume(key, 1);
        res.set('X-RateLimit-Limit', cfg.points);
        res.set('X-RateLimit-Remaining', rateLimitingRes.remainingPoints);
        res.set('X-RateLimit-Reset', Math.floor(Date.now() / 1000) + Math.ceil(rateLimitingRes.msBeforeNext / 1000));
        return next();
    } 
    catch(err){
        const isRateLimitRejection = err && typeof err.msBeforeNext === 'number';
        // Redis or host failure
        if(!isRateLimitRejection){
            logger.error('Redis unavailable - Rate limiter Redis failure', { error: err.message, stack: err.stack });
            return next();
        }
        // Rate limit exceeded
        const retrySecs = Math.ceil(err.msBeforeNext / 1000) || 1;
        res.set('Retry-After', String(retrySecs));
        res.set('X-RateLimit-Limit', cfg.points);
        res.set('X-RateLimit-Remaining', 0);
        res.set('X-RateLimit-Reset', Math.floor(Date.now() / 1000) + retrySecs);
        return res.status(429).json({ message: 'Too Many Requests', retryAfter: retrySecs });
    }
  };
}

module.exports = {
  rateLimitMiddleware
};