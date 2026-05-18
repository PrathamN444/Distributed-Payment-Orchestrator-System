const jwt = require('jsonwebtoken');

function authenticateJWT(req, res, next){
  const authHeader = req.headers.authorization || req.headers['jwt-token'];
  if(!authHeader){
    logger.error('Authorization header missing');
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const JWT_SECRET = process.env.JWT_SECRET;
  if(!JWT_SECRET){
    logger.error('JWT secret not configured');
    return res.status(500).json({ error: 'JWT secret not configured' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if(err){
      logger.error('Invalid or expired token');
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    req.user = payload;
    next();
  });
}

function authorize(...allowedRoles){
  return (req, res, next) => {
    if (!req.user) {
      logger.error('Authentication required');
      return res.status(401).json({ error: 'Authentication required' });
    }

    if(allowedRoles.length === 0){
      return next();
    }

    if(!allowedRoles.includes(req.user.role)){
      logger.error('Access forbidden');
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
}

module.exports = { authenticateJWT, authorize };