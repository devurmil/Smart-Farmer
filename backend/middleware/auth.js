const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    // Get token from HTTP-only cookie first, then fallback to Authorization header for deployment compatibility
    let token = req.cookies?.token;
    
    // Fallback to Authorization header if cookie not present (for cross-origin deployment issues)
    if (!token) {
      const authHeader = req.header('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.replace('Bearer ', '');
      }
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication provided.'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }
    req.user = user;
    console.log('Auth successful - User:', user.email, 'Role:', user.role); // Debug log
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token expired.'
      });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    // Get token from HTTP-only cookie first, then fallback to Authorization header
    let token = req.cookies?.token;
    
    // Fallback to Authorization header if cookie not present
    if (!token) {
      const authHeader = req.header('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.replace('Bearer ', '');
      }
    }
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // For optional auth, we don't return errors, just continue without user
    next();
  }
};

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = { auth, optionalAuth, generateToken };