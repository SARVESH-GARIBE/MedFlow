import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        console.error('❌ JWT_SECRET not defined');
        return res.status(500).json({ success: false, message: 'Server configuration error' });
      }

      const decoded = jwt.verify(token, secret);

      // Get full user data including role and assigned area
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      req.user = {
        id: user._id,
        role: user.role,
        assignedArea: user.assignedArea,
        isVerified: user.verification?.isVerified || false,
        status: user.status
      };

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        console.error('❌ Token expired:', error.message);
        return res.status(401).json({ success: false, message: 'Token expired' });
      } else if (error.name === 'JsonWebTokenError') {
        console.error('❌ Invalid token:', error.message);
        return res.status(401).json({ success: false, message: 'Invalid token' });
      } else {
        console.error('❌ Auth error:', error.message);
        return res.status(401).json({ success: false, message: 'Not authorized' });
      }
    }
  } else {
    return res.status(401).json({ success: false, message: 'No authorization token provided' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }

    next();
  };
};

export const authorizeArea = () => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Super admin has access to all areas
    if (req.user.role === 'super_admin') {
      return next();
    }

    // Admin must have assigned area
    if (req.user.role === 'admin') {
      if (!req.user.assignedArea || !req.user.assignedArea.city) {
        return res.status(403).json({
          success: false,
          message: 'Admin must be assigned to an area',
        });
      }

      // Check if request is for their assigned area
      const requestCity = req.query.city || req.body.city || req.params.city;
      const requestArea = req.query.area || req.body.area || req.params.area;

      if (requestCity && requestCity !== req.user.assignedArea.city) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Area restriction',
        });
      }

      if (requestArea && req.user.assignedArea.area && requestArea !== req.user.assignedArea.area) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Area restriction',
        });
      }
    }

    next();
  };
};

export const requireVerification = () => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!req.user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Account verification required',
      });
    }

    next();
  };
};
