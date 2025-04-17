const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/config');
const User = require('../models/User');
const RestaurantAdmin = require('../models/RestaurantAdmin');

// @desc    Register a user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    user = await User.create({
      email,
      password_hash,
      first_name,
      last_name,
      phone
    });

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password_hash');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Update last login
    user.last_login = Date.now();
    await user.save();

    // Get user's restaurant roles
    const restaurantRoles = await RestaurantAdmin.find({ user_id: user._id })
      .populate('restaurant_id', 'name slug');

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        restaurants: restaurantRoles.map(role => ({
          id: role.restaurant_id._id,
          name: role.restaurant_id.name,
          slug: role.restaurant_id.slug,
          role: role.role
        }))
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Get user's restaurant roles
    const restaurantRoles = await RestaurantAdmin.find({ user_id: user._id })
      .populate('restaurant_id', 'name slug');

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        is_active: user.is_active,
        last_login: user.last_login,
        created_at: user.created_at,
        restaurants: restaurantRoles.map(role => ({
          id: role.restaurant_id._id,
          name: role.restaurant_id.name,
          slug: role.restaurant_id.slug,
          role: role.role
        }))
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/updateprofile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { first_name, last_name, phone, current_password, new_password } = req.body;

    // Find user
    const user = await User.findById(req.user.id).select('+password_hash');

    // Update basic info
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (phone) user.phone = phone;

    // Update password if provided
    if (current_password && new_password) {
      // Verify current password
      const isMatch = await bcrypt.compare(current_password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect' });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(new_password, salt);
    }

    // Save user
    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE
  });
};
