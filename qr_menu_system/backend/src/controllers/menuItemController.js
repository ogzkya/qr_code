const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');
const MenuSection = require('../models/MenuSection');
const RestaurantAdmin = require('../models/RestaurantAdmin');
const ItemOption = require('../models/ItemOption');

// @desc    Get all menu items for a category
// @route   GET /api/menu-items/category/:categoryId
// @access  Private
exports.getMenuItems = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Check if category exists
    const category = await Category.findById(categoryId);
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

    // Get menu items
    const menuItems = await MenuItem.find({ category_id: categoryId })
      .sort({ display_order: 1 });

    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: menuItems
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single menu item
// @route   GET /api/menu-items/:id
// @access  Private
exports.getMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Get category and menu section to check restaurant access
    const category = await Category.findById(menuItem.category_id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

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
        message: 'Not authorized to access this menu item'
      });
    }

    // Get item options
    const itemOptions = await ItemOption.find({ menu_item_id: menuItem._id })
      .sort({ display_order: 1 });

    res.status(200).json({
      success: true,
      data: {
        ...menuItem.toObject(),
        item_options: itemOptions
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

// @desc    Create new menu item
// @route   POST /api/menu-items
// @access  Private
exports.createMenuItem = async (req, res) => {
  try {
    const { 
      category_id, 
      name, 
      description, 
      price,
      discounted_price,
      currency,
      weight,
      weight_unit,
      preparation_time,
      is_vegetarian,
      is_vegan,
      is_gluten_free,
      spiciness_level,
      allergens,
      nutritional_info,
      ingredients,
      display_order,
      is_featured,
      is_available
    } = req.body;

    // Check if category exists
    const category = await Category.findById(category_id);
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
        message: 'Not authorized to create menu items for this category'
      });
    }

    // Parse JSON fields if provided as strings
    let parsedAllergens = allergens;
    if (allergens && typeof allergens === 'string') {
      parsedAllergens = JSON.parse(allergens);
    }

    let parsedNutritionalInfo = nutritional_info;
    if (nutritional_info && typeof nutritional_info === 'string') {
      parsedNutritionalInfo = JSON.parse(nutritional_info);
    }

    // Create menu item
    const menuItem = await MenuItem.create({
      category_id,
      name,
      description,
      price,
      discounted_price,
      currency,
      weight,
      weight_unit,
      preparation_time,
      is_vegetarian,
      is_vegan,
      is_gluten_free,
      spiciness_level,
      allergens: parsedAllergens,
      nutritional_info: parsedNutritionalInfo,
      ingredients,
      display_order,
      is_featured,
      is_available
    });

    res.status(201).json({
      success: true,
      data: menuItem
    });
  } catch (err) {
    console.error(err);
    
    // Handle duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A menu item with this name already exists for this category'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update menu item
// @route   PUT /api/menu-items/:id
// @access  Private
exports.updateMenuItem = async (req, res) => {
  try {
    let menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Get category and menu section to check restaurant access
    const category = await Category.findById(menuItem.category_id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

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
        message: 'Not authorized to update menu items for this category'
      });
    }

    // Parse JSON fields if provided as strings
    if (req.body.allergens && typeof req.body.allergens === 'string') {
      req.body.allergens = JSON.parse(req.body.allergens);
    }

    if (req.body.nutritional_info && typeof req.body.nutritional_info === 'string') {
      req.body.nutritional_info = JSON.parse(req.body.nutritional_info);
    }

    // Update menu item
    menuItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: menuItem
    });
  } catch (err) {
    console.error(err);
    
    // Handle duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A menu item with this name already exists for this category'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu-items/:id
// @access  Private
exports.deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Get category and menu section to check restaurant access
    const category = await Category.findById(menuItem.category_id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

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
        message: 'Not authorized to delete menu items for this category'
      });
    }

    await menuItem.remove();

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

// @desc    Upload menu item image
// @route   PUT /api/menu-items/:id/image
// @access  Private
exports.uploadImage = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Get category and menu section to check restaurant access
    const category = await Category.findById(menuItem.category_id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

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
        message: 'Not authorized to update menu items for this category'
      });
    }

    // Update menu item with image path
    menuItem.image = req.file.filename;
    await menuItem.save();

    res.status(200).json({
      success: true,
      data: menuItem
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
