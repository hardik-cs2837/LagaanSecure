const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

const { User } = require('../models');

const requireRole = (...roles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    
    try {
      // Double check role against DB for stale tokens
      const dbUser = await User.findByPk(req.user.id);
      if (!dbUser || !roles.includes(dbUser.role)) {
        if (roles.includes('admin')) {
          console.warn(`[SECURITY] Unauthorized admin access attempt. UserID: ${req.user.id}, Route: ${req.originalUrl}, IP: ${req.ip}, Timestamp: ${new Date().toISOString()}`);
          return res.status(403).json({ success: false, error: 'Admin access required.' });
        }
        return res.status(403).json({ success: false, error: 'Access forbidden: Insufficient role' });
      }
      
      // Update req.user with latest DB role just in case
      req.user.role = dbUser.role;
      next();
    } catch(err) {
      next(err);
    }
  };
};

module.exports = { verifyToken, requireRole };
