const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }

    // Verify JWT - NO DEMO TOKENS!
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: 'User not found' 
        });
      }

      if (user.isActive === false) {
        return res.status(401).json({ 
          success: false,
          message: 'Account is deactivated' 
        });
      }

      req.user = user;
      req.token = token;
      next();
    } catch (error) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid or expired token' 
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

const hrOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'hr') {
    return res.status(403).json({ 
      success: false,
      message: 'Access denied. HR only.' 
    });
  }
  next();
};

const employeeOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'employee') {
    return res.status(403).json({ 
      success: false,
      message: 'Access denied. Employees only.' 
    });
  }
  next();
};

module.exports = { authMiddleware, hrOnly, employeeOnly };