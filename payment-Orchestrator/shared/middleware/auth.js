const jwt = require('jsonwebtoken');
const { logger } = require('./logger');
const { StatusCodes } = require('http-status-codes');

function authenticateJWT(req, res, next){
  const authHeader = req.headers.authorization || req.headers['jwt-token'];
  if(!authHeader){
    logger.error('Authorization header missing');
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Authorization token required' });
  }

  const userId = req.headers.userid;
  if(!userId){
    logger.error('User ID header missing');
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'User ID header required' });
  }

  const JWT_SECRET = process.env.JWT_SECRET_KEY;
  if(!JWT_SECRET){
    logger.error('JWT secret not configured');
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'JWT secret not configured' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if(err){
      logger.error('Invalid or expired token');
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid or expired token' });
    }

    if(payload?.userId !== userId){
      logger.error('User ID mismatch between token and request headers');
      return res.status(StatusCodes.FORBIDDEN).json({ error: 'User ID mismatch between token and request headers' });
    }

    req.user = {
      id: payload.userId,
      jti: payload.jti
    };

    next();
  });
}

function authorize(...allowedRoles){
  return (req, res, next) => {
    if (!req.user) {
      logger.error('Authentication required');
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Authentication required' });
    }

    if(allowedRoles.length === 0){
      return next();
    }

    if(!allowedRoles.includes(req.user.role)){
      logger.error('Access forbidden');
      return res.status(StatusCodes.FORBIDDEN).json({ error: 'Forbidden' });
    }

    next();
  };
}

module.exports = { authenticateJWT, authorize };