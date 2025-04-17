const Promotion = require('../models/Promotion');
const PromotionItem = require('../models/PromotionItem');
const Restaurant = require('../models/Restaurant');
const RestaurantAdmin = require('../models/RestaurantAdmin');
const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');

// @desc    Create new promotion
// @route   POST /api/promotions
// @access  Private
exports.createPromotion = async (req, res) => {
  try {
    const { 
      restaurant_id, 
      name,
      description,
      start_date,
      end_date,
      discount_type,
      discount_value,
      min_order_amount,
      max_discount_amount,
      usage_limit,
      is_active,
      applies_to,
      menu_item_ids,
      category_ids
    } = req.body;

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
        message: 'Not authorized to create promotions for this restaurant'
      });
    }

    // Validate discount type
    if (!['percentage', 'fixed'].includes(discount_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discount type'
      });
    }

    // Validate discount value
    if (discount_type === 'percentage' && (discount_value <= 0 || discount_value > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Percentage discount must be between 1 and 100'
      });
    }

    if (discount_type === 'fixed' && discount_value <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Fixed discount must be greater than 0'
      });
    }

    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid start or end date'
      });
    }

    if (endDate <= startDate) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    // Validate applies_to
    if (!['all', 'specific_items', 'specific_categories'].includes(applies_to)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid applies_to value'
      });
    }

    // Create promotion
    const promotion = await Promotion.create({
      restaurant_id,
      name,
      description,
      start_date: startDate,
      end_date: endDate,
      discount_type,
      discount_value,
      min_order_amount: min_order_amount || 0,
      max_discount_amount: max_discount_amount || null,
      usage_limit: usage_limit || null,
      usage_count: 0,
      is_active: is_active !== undefined ? is_active : true,
      applies_to
    });

    // Create promotion items if applies to specific items or categories
    if (applies_to === 'specific_items' && menu_item_ids && menu_item_ids.length > 0) {
      // Validate menu items
      for (const menuItemId of menu_item_ids) {
        const menuItem = await MenuItem.findById(menuItemId);
        if (!menuItem) {
          // Delete the promotion if any menu item is invalid
          await Promotion.findByIdAndDelete(promotion._id);
          return res.status(404).json({
            success: false,
            message: `Menu item not found: ${menuItemId}`
          });
        }

        // Create promotion item
        await PromotionItem.create({
          promotion_id: promotion._id,
          item_type: 'menu_item',
          item_id: menuItemId
        });
      }
    } else if (applies_to === 'specific_categories' && category_ids && category_ids.length > 0) {
      // Validate categories
      for (const categoryId of category_ids) {
        const category = await Category.findById(categoryId);
        if (!category) {
          // Delete the promotion if any category is invalid
          await Promotion.findByIdAndDelete(promotion._id);
          return res.status(404).json({
            success: false,
            message: `Category not found: ${categoryId}`
          });
        }

        // Create promotion item
        await PromotionItem.create({
          promotion_id: promotion._id,
          item_type: 'category',
          item_id: categoryId
        });
      }
    }

    res.status(201).json({
      success: true,
      data: promotion
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all promotions for a restaurant
// @route   GET /api/promotions/restaurant/:restaurantId
// @access  Private
exports.getPromotions = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { is_active, limit = 50, page = 1 } = req.query;

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
        message: 'Not authorized to access promotions for this restaurant'
      });
    }

    // Build query
    const query = { restaurant_id: restaurantId };
    
    // Add active filter if provided
    if (is_active !== undefined) {
      query.is_active = is_active === 'true';
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get promotions
    const promotions = await Promotion.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await Promotion.countDocuments(query);

    // Get promotion items for each promotion
    const promotionsWithItems = await Promise.all(promotions.map(async (promotion) => {
      const promotionItems = await PromotionItem.find({ promotion_id: promotion._id });
      
      // Get details for each promotion item
      const itemsWithDetails = await Promise.all(promotionItems.map(async (item) => {
        let itemDetails = null;
        
        if (item.item_type === 'menu_item') {
          const menuItem = await MenuItem.findById(item.item_id);
          if (menuItem) {
            itemDetails = {
              id: menuItem._id,
              name: menuItem.name,
              price: menuItem.price,
              image: menuItem.image
            };
          }
        } else if (item.item_type === 'category') {
          const category = await Category.findById(item.item_id);
          if (category) {
            itemDetails = {
              id: category._id,
              name: category.name
            };
          }
        }
        
        return {
          ...item.toObject(),
          item_details: itemDetails
        };
      }));
      
      return {
        ...promotion.toObject(),
        items: itemsWithDetails
      };
    }));

    res.status(200).json({
      success: true,
      count: promotions.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: promotionsWithItems
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get active promotions for a restaurant (public)
// @route   GET /api/promotions/public/restaurant/:restaurantId
// @access  Public
exports.getPublicPromotions = async (req, res) => {
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

    // Get current date
    const now = new Date();

    // Get active promotions
    const promotions = await Promotion.find({
      restaurant_id: restaurantId,
      is_active: true,
      start_date: { $lte: now },
      end_date: { $gte: now }
    }).sort({ created_at: -1 });

    // Get promotion items for each promotion
    const promotionsWithItems = await Promise.all(promotions.map(async (promotion) => {
      const promotionItems = await PromotionItem.find({ promotion_id: promotion._id });
      
      // Get details for each promotion item
      const itemsWithDetails = await Promise.all(promotionItems.map(async (item) => {
        let itemDetails = null;
        
        if (item.item_type === 'menu_item') {
          const menuItem = await MenuItem.findById(item.item_id);
          if (menuItem) {
            itemDetails = {
              id: menuItem._id,
              name: menuItem.name,
              price: menuItem.price,
              image: menuItem.image
            };
          }
        } else if (item.item_type === 'category') {
          const category = await Category.findById(item.item_id);
          if (category) {
            itemDetails = {
              id: category._id,
              name: category.name
            };
          }
        }
        
        return {
          ...item.toObject(),
          item_details: itemDetails
        };
      }));
      
      return {
        ...promotion.toObject(),
        items: itemsWithDetails
      };
    }));

    res.status(200).json({
      success: true,
      count: promotions.length,
      data: promotionsWithItems
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single promotion
// @route   GET /api/promotions/:id
// @access  Private
exports.getPromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    // Check if user has access to this restaurant
    const adminRecord = await RestaurantAdmin.findOne({
      restaurant_id: promotion.restaurant_id,
      user_id: req.user.id
    });

    if (!adminRecord) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this promotion'
      });
    }

    // Get promotion items
    const promotionItems = await PromotionItem.find({ promotion_id: promotion._id });
    
    // Get details for each promotion item
    const itemsWithDetails = await Promise.all(promotionItems.map(async (item) => {
      let itemDetails = null;
      
      if (item.item_type === 'menu_item') {
        const menuItem = await MenuItem.findById(item.item_id);
        if (menuItem) {
          itemDetails = {
            id: menuItem._id,
            name: menuItem.name,
            price: menuItem.price,
            image: menuItem.image
          };
        }
      } else if (item.item_type === 'category') {
        const category = await Category.findById(item.item_id);
        if (category) {
          itemDetails = {
            id: category._id,
            name: category.name
          };
        }
      }
      
      return {
        ...item.toObject(),
        item_details: itemDetails
      };
    }));

    res.status(200).json({
      success: true,
      data: {
        ...promotion.toObject(),
        items: itemsWithDetails
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

// @desc    Update promotion
// @route   PUT /api/promotions/:id
// @access  Private
exports.updatePromotion = async (req, res) => {
  try {
    const { 
      name,
      description,
      start_date,
      end_date,
      discount_type,
      discount_value,
      min_order_amount,
      max_discount_amount,
      usage_limit,
      is_active,
      applies_to,
      menu_item_ids,
      category_ids
    } = req.body;

    let promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    // Check if user has access to this restaurant
    const adminRecord = await RestaurantAdmin.findOne({
      restaurant_id: promotion.restaurant_id,
      user_id: req.user.id
    });

    if (!adminRecord || (adminRecord.role !== 'owner' && adminRecord.role !== 'manager')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this promotion'
      });
    }

    // Validate discount type if provided
    if (discount_type && !['percentage', 'fixed'].includes(discount_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discount type'
      });
    }

    // Validate discount value if provided
    if (discount_type === 'percentage' && discount_value !== undefined && (discount_value <= 0 || discount_value > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Percentage discount must be between 1 and 100'
      });
    }

    if (discount_type === 'fixed' && discount_value !== undefined && discount_value <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Fixed discount must be greater than 0'
      });
    }

    // Validate dates if provided
    let startDate, endDate;
    
    if (start_date) {
      startDate = new Date(start_date);
      if (isNaN(startDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid start date'
        });
      }
    }
    
    if (end_date) {
      endDate = new Date(end_date);
      if (isNaN(endDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid end date'
        });
      }
    }
    
    if (startDate && endDate && endDate <= startDate) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    // Validate applies_to if provided
    if (applies_to && !['all', 'specific_items', 'specific_categories'].includes(applies_to)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid applies_to value'
      });
    }

    // Update promotion
    promotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      {
        name: name || promotion.name,
        description: description !== undefined ? description : promotion.description,
        start_date: startDate || promotion.start_date,
        end_date: endDate || promotion.end_date,
        discount_type: discount_type || promotion.discount_type,
        discount_value: discount_value !== undefined ? discount_value : promotion.discount_value,
        min_order_amount: min_order_amount !== undefined ? min_order_amount : promotion.min_order_amount,
        max_discount_amount: max_discount_amount !== undefined ? max_discount_amount : promotion.max_discount_amount,
        usage_limit: usage_limit !== undefined ? usage_limit : promotion.usage_limit,
        is_active: is_active !== undefined ? is_active : promotion.is_active,
        applies_to: applies_to || promotion.applies_to
      },
      { new: true, runValidators: true }
    );

    // Update promotion items if applies_to is changed or items are provided
    if (
      (applies_to && applies_to !== promotion.applies_to) ||
      (applies_to === 'specific_items' && menu_item_ids) ||
      (applies_to === 'specific_categories' && category_ids)
    ) {
      // Delete existing promotion items
      await PromotionItem.deleteMany({ promotion_id: promotion._id });

      // Create new promotion items
      if (applies_to === 'specific_items' && menu_item_ids && menu_item_ids.length > 0) {
        // Validate menu items
        for (const menuItemId of menu_item_ids) {
          const menuItem = await MenuItem.findById(menuItemId);
          if (!menuItem) {
            return res.status(404).json({
              success: false,
              message: `Menu item not found: ${menuItemId}`
            });
          }

          // Create promotion item
          await PromotionItem.create({
            promotion_id: promotion._id,
            item_type: 'menu_item',
            item_id: menuItemId
          });
        }
      } else if (applies_to === 'specific_categories' && category_ids && category_ids.length > 0) {
        // Validate categories
        for (const categoryId of category_ids) {
          const category = await Category.findById(categoryId);
          if (!category) {
            return res.status(404).json({
              success: false,
              message: `Category not found: ${categoryId}`
            });
          }

          // Create promotion item
          await PromotionItem.create({
            promotion_id: promotion._id,
            item_type: 'category',
            item_id: categoryId
          });
        }
      }
    }

    // Get updated promotion with items
    const updatedPromotion = await Promotion.findById(promotion._id);
    const promotionItems = await PromotionItem.find({ promotion_id: promotion._id });
    
    // Get details for each promotion item
    const itemsWithDetails = await Promise.all(promotionItems.map(async (item) => {
      let itemDetails = null;
      
      if (item.item_type === 'menu_item') {
        const menuItem = await MenuItem.findById(item.item_id);
        if (menuItem) {
          itemDetails = {
            id: menuItem._id,
            name: menuItem.name,
            price: menuItem.price,
            image: menuItem.image
          };
        }
      } else if (item.item_type === 'category') {
        const category = await Category.findById(item.item_id);
        if (category) {
          itemDetails = {
            id: category._id,
            name: category.name
          };
        }
      }
      
      return {
        ...item.toObject(),
        item_details: itemDetails
      };
    }));

    res.status(200).json({
      success: true,
      data: {
        ...updatedPromotion.toObject(),
        items: itemsWithDetails
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

// @desc    Delete promotion
// @route   DELETE /api/promotions/:id
// @access  Private
exports.deletePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    // Check if user has access to this restaurant
    const adminRecord = await RestaurantAdmin.findOne({
      restaurant_id: promotion.restaurant_id,
      user_id: req.user.id
    });

    if (!adminRecord || (adminRecord.role !== 'owner' && adminRecord.role !== 'manager')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this promotion'
      });
    }

    // Delete promotion items
    await PromotionItem.deleteMany({ promotion_id: promotion._id });

    // Delete promotion
    await promotion.remove();

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

// @desc    Increment promotion usage count
// @route   PUT /api/promotions/:id/increment-usage
// @access  Private
exports.incrementUsage = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    // Check if user has access to this restaurant
    const adminRecord = await RestaurantAdmin.findOne({
      restaurant_id: promotion.restaurant_id,
      user_id: req.user.id
    });

    if (!adminRecord) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this promotion'
      });
    }

    // Check if promotion has reached usage limit
    if (promotion.usage_limit !== null && promotion.usage_count >= promotion.usage_limit) {
      return res.status(400).json({
        success: false,
        message: 'Promotion has reached usage limit'
      });
    }

    // Increment usage count
    promotion.usage_count += 1;
    await promotion.save();

    res.status(200).json({
      success: true,
      data: promotion
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
