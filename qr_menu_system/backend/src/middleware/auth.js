const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Check if auth header exists and has the correct format
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Get user from the token
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    // Add user to request object
    req.user = {
      id: user._id
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      // Get user's role for the specified restaurant
      const { restaurantId } = req.params;
      
      if (!restaurantId) {
        return res.status(400).json({
          success: false,
          message: 'Restaurant ID is required'
        });
      }

      const RestaurantAdmin = require('../models/RestaurantAdmin');
      const admin = await RestaurantAdmin.findOne({
        user_id: req.user.id,
        restaurant_id: restaurantId
      });

      if (!admin || !roles.includes(admin.role)) {
        return res.status(403).json({
          success: false,
          message: `User role ${admin ? admin.role : 'none'} is not authorized to access this route`
        });
      }

      // Add role to request object
      req.userRole = admin.role;
      
      next();
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
};
