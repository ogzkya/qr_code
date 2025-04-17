const MenuSection = require('../models/MenuSection');
const Category = require('../models/Category');
const Restaurant = require('../models/Restaurant');
const RestaurantAdmin = require('../models/RestaurantAdmin');

// @desc    Get all menu sections for a restaurant
// @route   GET /api/menu-sections/restaurant/:restaurantId
// @access  Private
exports.getMenuSections = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Check if user has access to this restaurant
    const adminRecord = await RestaurantAdmin.findOne({
      restaurant_id: restaurantId,
      user_id: req.user.id
    });

    if (!adminRecord) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this restaurant'
      });
    }

    // Get menu sections
    const menuSections = await MenuSection.find({ restaurant_id: restaurantId })
      .sort({ display_order: 1 });

    res.status(200).json({
      success: true,
      count: menuSections.length,
      data: menuSections
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single menu section
// @route   GET /api/menu-sections/:id
// @access  Private
exports.getMenuSection = async (req, res) => {
  try {
    const menuSection = await MenuSection.findById(req.params.id);

    if (!menuSection) {
      return res.status(404).json({
        success: false,
        message: 'Menu section not found'
      });
    }

    // Check if user has access to this restaurant
    const adminRecord = await RestaurantAdmin.findOne({
      restaurant_id: menuSection.restaurant_id,
      user_id: req.user.id
    });

    if (!adminRecord) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this menu section'
      });
    }

    res.status(200).json({
      success: true,
      data: menuSection
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new menu section
// @route   POST /api/menu-sections
// @access  Private
exports.createMenuSection = async (req, res) => {
  try {
    const { restaurant_id, name, display_order, is_active } = req.body;

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurant_id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Check if user has access to this restaurant
    const adminRecord = await RestaurantAdmin.findOne({
      restaurant_id,
      user_id: req.user.id
    });

    if (!adminRecord || (adminRecord.role !== 'owner' && adminRecord.role !== 'manager')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create menu sections for this restaurant'
      });
    }

    // Create menu section
    const menuSection = await MenuSection.create({
      restaurant_id,
      name,
      display_order,
      is_active
    });

    res.status(201).json({
      success: true,
      data: menuSection
    });
  } catch (err) {
    console.error(err);
    
    // Handle duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A menu section with this name already exists for this restaurant'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update menu section
// @route   PUT /api/menu-sections/:id
// @access  Private
exports.updateMenuSection = async (req, res) => {
  try {
    let menuSection = await MenuSection.findById(req.params.id);

    if (!menuSection) {
      return res.status(404).json({
        success: false,
        message: 'Menu section not found'
      });
    }

    // Check if user has access to this restaurant
    const adminRecord = await RestaurantAdmin.findOne({
      restaurant_id: menuSection.restaurant_id,
      user_id: req.user.id
    });

    if (!adminRecord || (adminRecord.role !== 'owner' && adminRecord.role !== 'manager')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update menu sections for this restaurant'
      });
    }

    // Update menu section
    menuSection = await MenuSection.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: menuSection
    });
  } catch (err) {
    console.error(err);
    
    // Handle duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A menu section with this name already exists for this restaurant'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete menu section
// @route   DELETE /api/menu-sections/:id
// @access  Private
exports.deleteMenuSection = async (req, res) => {
  try {
    const menuSection = await MenuSection.findById(req.params.id);

    if (!menuSection) {
      return res.status(404).json({
        success: false,
        message: 'Menu section not found'
      });
    }

    // Check if user has access to this restaurant
    const adminRecord = await RestaurantAdmin.findOne({
      restaurant_id: menuSection.restaurant_id,
      user_id: req.user.id
    });

    if (!adminRecord || (adminRecord.role !== 'owner' && adminRecord.role !== 'manager')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete menu sections for this restaurant'
      });
    }

    // Check if menu section has categories
    const categories = await Category.find({ menu_section_id: menuSection._id });
    if (categories.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete menu section with categories. Delete categories first.'
      });
    }

    await menuSection.remove();

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
