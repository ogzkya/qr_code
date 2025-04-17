const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const MenuSection = require('../models/MenuSection');
const RestaurantAdmin = require('../models/RestaurantAdmin');
const upload = require('../middleware/upload');

// @desc    Get all categories for a menu section
// @route   GET /api/categories/menu-section/:menuSectionId
// @access  Private
exports.getCategories = async (req, res) => {
  try {
    const { menuSectionId } = req.params;

    // Check if menu section exists
    const menuSection = await MenuSection.findById(menuSectionId);
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

    // Get categories
    const categories = await Category.find({ menu_section_id: menuSectionId })
      .sort({ display_order: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Private
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get menu section to check restaurant access
    const menuSection = await MenuSection.findById(category.menu_section_id);
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
        message: 'Not authorized to access this category'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private
exports.createCategory = async (req, res) => {
  try {
    const { 
      menu_section_id, 
      name, 
      description, 
      display_order, 
      availability_hours, 
      is_active 
    } = req.body;

    // Check if menu section exists
    const menuSection = await MenuSection.findById(menu_section_id);
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
        message: 'Not authorized to create categories for this menu section'
      });
    }

    // Parse availability hours if provided
    let parsedAvailabilityHours = null;
    if (availability_hours) {
      parsedAvailabilityHours = typeof availability_hours === 'string' 
        ? JSON.parse(availability_hours) 
        : availability_hours;
    }

    // Create category
    const category = await Category.create({
      menu_section_id,
      name,
      description,
      display_order,
      availability_hours: parsedAvailabilityHours,
      is_active
    });

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (err) {
    console.error(err);
    
    // Handle duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A category with this name already exists for this menu section'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
exports.updateCategory = async (req, res) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get menu section to check restaurant access
    const menuSection = await MenuSection.findById(category.menu_section_id);
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
        message: 'Not authorized to update categories for this menu section'
      });
    }

    // Parse availability hours if provided
    if (req.body.availability_hours) {
      req.body.availability_hours = typeof req.body.availability_hours === 'string' 
        ? JSON.parse(req.body.availability_hours) 
        : req.body.availability_hours;
    }

    // Update category
    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (err) {
    console.error(err);
    
    // Handle duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A category with this name already exists for this menu section'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get menu section to check restaurant access
    const menuSection = await MenuSection.findById(category.menu_section_id);
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
        message: 'Not authorized to delete categories for this menu section'
      });
    }

    // Check if category has menu items
    const menuItems = await MenuItem.find({ category_id: category._id });
    if (menuItems.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with menu items. Delete menu items first.'
      });
    }

    await category.remove();

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

// @desc    Upload category image
// @route   PUT /api/categories/:id/image
// @access  Private
exports.uploadImage = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get menu section to check restaurant access
    const menuSection = await MenuSection.findById(category.menu_section_id);
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
        message: 'Not authorized to update categories for this menu section'
      });
    }

    // Update category with image path
    category.image = req.file.filename;
    await category.save();

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
