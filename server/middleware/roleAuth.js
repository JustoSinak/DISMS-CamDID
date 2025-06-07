// identity-blockchain-app/server/middleware/roleAuth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const roleAuth = (...roles) => {
  return async (req, res, next) => {
    try {
      // 1. Get token from header
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. No token provided.'
        });
      }

      // 2. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 3. Get user from database
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found.'
        });
      }

      // 4. Check if user has required role
      if (!user.hasRole(roles)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.'
        });
      }

      // 5. Attach user to request object
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
  };
};

/**
 * Middleware to check if the user has the citizen role
 */
const isCitizen = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role !== 'citizen') {
    return res.status(403).json({ message: 'Access denied. Citizen role required.' });
  }
  
  next();
};

/**
 * Middleware to check if the user has the verifier role
 */
const isVerifier = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role !== 'verifier') {
    return res.status(403).json({ message: 'Access denied. Verifier role required.' });
  }
  
  next();
};

/**
 * Middleware to check if the user has the issuer role
 */
const isIssuer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role !== 'issuer') {
    return res.status(403).json({ message: 'Access denied. Issuer role required.' });
  }
  
  next();
};

/**
 * Middleware to check if the user has admin role
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  
  next();
};

/**
 * Middleware to check if the user has any of the specified roles
 */
const hasAnyRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }
    
    next();
  };
};

module.exports = {
  roleAuth,
  isCitizen,
  isVerifier,
  isIssuer,
  isAdmin,
  hasAnyRole
};
