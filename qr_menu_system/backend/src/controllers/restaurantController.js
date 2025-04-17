const Restaurant = require('../models/Restaurant');
const RestaurantAdmin = require('../models/RestaurantAdmin');
const upload = require('../middleware/upload');
const { v4: uuidv4 } = require('uuid');

// @desc    Create new restaurant
// @route   POST /api/restaurants
// @access  Private
exports.createRestaurant = async (req, res) => {
  try {
    const { name, address, phone, email, website, wifi_password, additional_info, working_hours } = req.body;

    // Create restaurant
    const restaurant = await Restaurant.create({
      name,
      address,
      phone,
      email,
      website,
      wifi_password,
      additional_info,
      working_hours: working_hours ? JSON.parse(working_hours) : undefined
    });

    // Assign current user as restaurant owner
    await RestaurantAdmin.create({
      restaurant_id: restaurant._id,
      user_id: req.user.id,
      role: 'owner'
    });

    res.status(201).json({
      success: true,
      data: restaurant
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all restaurants for current user
// @route   GET /api/restaurants
// @access  Private
exports.getRestaurants = async (req, res) => {
  try {
    // Find all restaurant admin records for current user
    const adminRecords = await RestaurantAdmin.find({ user_id: req.user.id });
    
    // Get restaurant IDs
    const restaurantIds = adminRecords.map(record => record.restaurant_id);
    
    // Find restaurants
    const restaurants = await Restaurant.find({ _id: { $in: restaurantIds } });
    
    // Add role to each restaurant
    const restaurantsWithRoles = restaurants.map(restaurant => {
      const adminRecord = adminRecords.find(record => record.restaurant_id === restaurant._id.toString());
      return {
        ...restaurant.toObject(),
        role: adminRecord ? adminRecord.role : null
      };
    });

    res.status(200).json({
      success: true,
      count: restaurantsWithRoles.length,
      data: restaurantsWithRoles
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single restaurant
// @route   GET /api/restaurants/:id
// @access  Private
exports.getRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Check if user has access to this restaurant
    const adminRecord = await RestaurantAdmin.findOne({
      restaurant_id: restaurant._id,
      user_id: req.user.id
    });

    if (!adminRecord) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this restaurant'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...restaurant.toObject(),
        role: adminRecord.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private
exports.updateRestaurant = async (req, res) => {
  try {
    let restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Check if user has access to this restaurant
    const adminRecord = await RestaurantAdmin.findOne({
      restaurant_id: restaurant._id,
      user_id: req.user.id
    });

    if (!adminRecord || (adminRecord.role !== 'owner' && adminRecord.role !== 'manager')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this restaurant'
      });
    }

    // Parse working hours if provided
    if (req.body.working_hours) {
      req.body.working_hours = JSON.parse(req.body.working_hours);
    }

    // Update restaurant
    restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private
exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Check if user is the owner
    const adminRecord = await RestaurantAdmin.findOne({
      restaurant_id: restaurant._id,
      user_id: req.user.id
    });

    if (!adminRecord || adminRecord.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Only the owner can delete a restaurant'
      });
    }

    await restaurant.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Upload restaurant logo
// @route   PUT /api/restaurants/:id/logo
// @access  Private
exports.uploadLogo = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Check if user has access to this restaurant
    const adminRecord = await RestaurantAdmin.findOne({
      restaurant_id: restaurant._id,
      user_id: req.user.id
    });

    if (!adminRecord || (adminRecord.role !== 'owner' && adminRecord.role !== 'manager')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this restaurant'
      });
    }

    // Update restaurant with logo path
    restaurant.logo = req.file.filename;
    await restaurant.save();

    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add staff to restaurant
// @route   POST /api/restaurants/:id/staff
// @access  Private
exports.addStaff = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and role'
      });
    }

    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Check if user is owner or manager
    const adminRecord = await RestaurantAdmin.findOne({
      restaurant_id: restaurant._id,
      user_id: req.user.id
    });

    if (!adminRecord || (adminRecord.role !== 'owner' && adminRecord.role !== 'manager')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add staff to this restaurant'
      });
    }

    // Find user by email
    const User = require('../models/User');
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already staff
    const existingStaff = await RestaurantAdmin.findOne({
      restaurant_id: restaurant._id,
      user_id: user._id
    });

    if (existingStaff) {
      return res.status(400).json({
        success: false,
        message: 'User is already staff at this restaurant'
      });
    }

    // Add user as staff
    const staff = await RestaurantAdmin.create({
      restaurant_id: restaurant._id,
      user_id: user._id,
      role
    });

    res.status(201).json({
      success: true,
      data: {
        id: staff._id,
        restaurant_id: staff.restaurant_id,
        user: {
          id: user._id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name
        },
        role: staff.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get restaurant staff
// @route   GET /api/restaurants/:id/staff
// @access  Private
exports.getStaff = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Check if user has access to this restaurant
    const adminRecord = await RestaurantAdmin.findOne({
      restaurant_id: restaurant._id,
      user_id: req.user.id
    });

    if (!adminRecord) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this restaurant'
      });
    }

    // Get all staff
    const User = require('../models/User');
    const staff = await RestaurantAdmin.find({ restaurant_id: restaurant._id });
    
    // Get user details for each staff member
    const staffWithDetails = await Promise.all(staff.map(async (member) => {
      const user = await User.findById(member.user_id);
      return {
        id: member._id,
        restaurant_id: member.restaurant_id,
        user: {
          id: user._id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name
        },
        role: member.role
      };
    }));

    res.status(200).json({
      success: true,
      count: staffWithDetails.length,
      data: staffWithDetails
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update staff role
// @route   PUT /api/restaurants/:id/staff/:staffId
// @access  Private
exports.updateStaffRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide role'
      });
    }

    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Check if user is owner
    const adminRecord = await RestaurantAdmin.findOne({
      restaurant_id: restaurant._id,
      user_id: req.user.id
    });

    if (!adminRecord || adminRecord.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Only the owner can update staff roles'
      });
    }

    // Find staff record
    const staff = await RestaurantAdmin.findById(req.params.staffId);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff not found'
      });
    }

    // Update role
    staff.role = role;
    await staff.save();

    // Get user details
    const User = require('../models/User');
    const user = await User.findById(staff.user_id);

    res.status(200).json({
      success: true,
      data: {
        id: staff._id,
        restaurant_id: staff.restaurant_id,
        user: {
          id: user._id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name
        },
        role: staff.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Remove staff
// @route   DELETE /api/restaurants/:id/staff/:staffId
// @access  Private
exports.removeStaff = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Check if user is owner or manager
    const adminRecord = await RestaurantAdmin.findOne({
      restaurant_id: restaurant._id,
      user_id: req.user.id
    });

    if (!adminRecord || (adminRecord.role !== 'owner' && adminRecord.role !== 'manager')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove staff from this restaurant'
      });
    }

    // Find staff record
    const staff = await RestaurantAdmin.findById(req.params.staffId);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff not found'
      });
    }

    // Prevent removing owner
    if (staff.role === 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Cannot remove restaurant owner'
      });
    }

    // Prevent managers from removing other managers
    if (adminRecord.role === 'manager' && staff.role === 'manager') {
      return res.status(403).json({
        success: false,
        message: 'Managers cannot remove other managers'
      });
    }

    await staff.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
