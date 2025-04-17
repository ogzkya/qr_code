const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const OrderItemOption = require('../models/OrderItemOption');
const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');
const MenuSection = require('../models/MenuSection');
const Restaurant = require('../models/Restaurant');
const RestaurantAdmin = require('../models/RestaurantAdmin');
const ItemOption = require('../models/ItemOption');
const OptionChoice = require('../models/OptionChoice');

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
exports.createOrder = async (req, res) => {
  try {
    const { 
      restaurant_id, 
      table_number, 
      customer_name, 
      customer_phone, 
      customer_email,
      items,
      notes
    } = req.body;

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurant_id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    // Calculate total amount and validate items
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      // Check if menu item exists
      const menuItem = await MenuItem.findById(item.menu_item_id);
      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: `Menu item not found: ${item.menu_item_id}`
        });
      }

      // Check if menu item is available
      if (!menuItem.is_available) {
        return res.status(400).json({
          success: false,
          message: `Menu item is not available: ${menuItem.name}`
        });
      }

      // Calculate item price
      let itemPrice = menuItem.discounted_price || menuItem.price;
      let itemTotalPrice = itemPrice * item.quantity;

      // Validate and calculate options price
      const validatedOptions = [];
      if (item.options && Array.isArray(item.options) && item.options.length > 0) {
        for (const option of item.options) {
          // Check if option choice exists
          const optionChoice = await OptionChoice.findById(option.option_choice_id);
          if (!optionChoice) {
            return res.status(404).json({
              success: false,
              message: `Option choice not found: ${option.option_choice_id}`
            });
          }

          // Check if option choice belongs to this menu item
          const itemOption = await ItemOption.findById(optionChoice.item_option_id);
          if (!itemOption || itemOption.menu_item_id !== menuItem._id) {
            return res.status(400).json({
              success: false,
              message: `Option choice does not belong to this menu item: ${optionChoice._id}`
            });
          }

          // Add option price adjustment
          itemTotalPrice += optionChoice.price_adjustment * item.quantity;

          validatedOptions.push({
            option_choice_id: optionChoice._id,
            price_adjustment: optionChoice.price_adjustment
          });
        }
      }

      validatedItems.push({
        menu_item_id: menuItem._id,
        quantity: item.quantity,
        unit_price: itemPrice,
        total_price: itemTotalPrice,
        special_instructions: item.special_instructions || '',
        options: validatedOptions
      });

      totalAmount += itemTotalPrice;
    }

    // Create order
    const order = await Order.create({
      restaurant_id,
      table_number,
      customer_name,
      customer_phone,
      customer_email,
      status: 'pending',
      total_amount: totalAmount,
      payment_status: 'pending',
      notes
    });

    // Create order items
    for (const item of validatedItems) {
      const orderItem = await OrderItem.create({
        order_id: order._id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        special_instructions: item.special_instructions
      });

      // Create order item options
      for (const option of item.options) {
        await OrderItemOption.create({
          order_item_id: orderItem._id,
          option_choice_id: option.option_choice_id,
          price_adjustment: option.price_adjustment
        });
      }
    }

    // Get complete order with items
    const completeOrder = await Order.findById(order._id);
    const orderItems = await OrderItem.find({ order_id: order._id });
    
    // Get order item options
    const orderItemsWithOptions = await Promise.all(orderItems.map(async (item) => {
      const options = await OrderItemOption.find({ order_item_id: item._id });
      return {
        ...item.toObject(),
        options
      };
    }));

    res.status(201).json({
      success: true,
      data: {
        ...completeOrder.toObject(),
        items: orderItemsWithOptions
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

// @desc    Get all orders for a restaurant
// @route   GET /api/orders/restaurant/:restaurantId
// @access  Private
exports.getOrders = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { status, date, limit = 50, page = 1 } = req.query;

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
        message: 'Not authorized to access orders for this restaurant'
      });
    }

    // Build query
    const query = { restaurant_id: restaurantId };
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    // Add date filter if provided
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      query.created_at = {
        $gte: startDate,
        $lte: endDate
      };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get orders
    const orders = await Order.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: orders
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user has access to this restaurant
    const adminRecord = await RestaurantAdmin.findOne({
      restaurant_id: order.restaurant_id,
      user_id: req.user.id
    });

    if (!adminRecord) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    // Get order items
    const orderItems = await OrderItem.find({ order_id: order._id });
    
    // Get order item options and menu item details
    const orderItemsWithDetails = await Promise.all(orderItems.map(async (item) => {
      const options = await OrderItemOption.find({ order_item_id: item._id });
      const menuItem = await MenuItem.findById(item.menu_item_id);
      
      // Get option choice details
      const optionsWithDetails = await Promise.all(options.map(async (option) => {
        const optionChoice = await OptionChoice.findById(option.option_choice_id);
        const itemOption = await ItemOption.findById(optionChoice.item_option_id);
        
        return {
          ...option.toObject(),
          option_choice: {
            id: optionChoice._id,
            name: optionChoice.name
          },
          item_option: {
            id: itemOption._id,
            name: itemOption.name
          }
        };
      }));
      
      return {
        ...item.toObject(),
        menu_item: {
          id: menuItem._id,
          name: menuItem.name,
          image: menuItem.image
        },
        options: optionsWithDetails
      };
    }));

    res.status(200).json({
      success: true,
      data: {
        ...order.toObject(),
        items: orderItemsWithDetails
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

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    // Check if status is valid
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user has access to this restaurant
    const adminRecord = await RestaurantAdmin.findOne({
      restaurant_id: order.restaurant_id,
      user_id: req.user.id
    });

    if (!adminRecord) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    // Update order status
    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update payment status
// @route   PUT /api/orders/:id/payment
// @access  Private
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { payment_status, payment_method } = req.body;

    if (!payment_status) {
      return res.status(400).json({
        success: false,
        message: 'Payment status is required'
      });
    }

    // Check if payment status is valid
    const validPaymentStatuses = ['pending', 'paid', 'failed'];
    if (!validPaymentStatuses.includes(payment_status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status'
      });
    }

    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user has access to this restaurant
    const adminRecord = await RestaurantAdmin.findOne({
      restaurant_id: order.restaurant_id,
      user_id: req.user.id
    });

    if (!adminRecord) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    // Update payment status
    order.payment_status = payment_status;
    if (payment_method) {
      order.payment_method = payment_method;
    }
    await order.save();

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get order statistics for a restaurant
// @route   GET /api/orders/stats/restaurant/:restaurantId
// @access  Private
exports.getOrderStats = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { period } = req.query; // day, week, month, year

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
        message: 'Not authorized to access order statistics for this restaurant'
      });
    }

    // Set date filter based on period
    let startDate;
    const now = new Date();
    
    switch (period) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 30)); // Default to 30 days
    }

    // Get orders for the period
    const orders = await Order.find({
      restaurant_id: restaurantId,
      created_at: { $gte: startDate }
    });

    // Calculate statistics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
    const paidOrders = orders.filter(order => order.payment_status === 'paid').length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get orders by status
    const ordersByStatus = {
      pending: orders.filter(order => order.status === 'pending').length,
      confirmed: orders.filter(order => order.status === 'confirmed').length,
      preparing: orders.filter(order => order.status === 'preparing').length,
      ready: orders.filter(order => order.status === 'ready').length,
      delivered: orders.filter(order => order.status === 'delivered').length,
      cancelled: orders.filter(order => order.status === 'cancelled').length
    };

    // Get orders by day
    const ordersByDay = {};
    orders.forEach(order => {
      const day = order.created_at.toISOString().split('T')[0];
      if (!ordersByDay[day]) {
        ordersByDay[day] = {
          count: 0,
          revenue: 0
        };
      }
      ordersByDay[day].count++;
      ordersByDay[day].revenue += order.total_amount;
    });

    // Convert to array for easier consumption by frontend
    const ordersByDayArray = Object.keys(ordersByDay).map(day => ({
      date: day,
      count: ordersByDay[day].count,
      revenue: ordersByDay[day].revenue
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Get popular menu items
    const orderItems = await OrderItem.find({
      order_id: { $in: orders.map(order => order._id) }
    });

    const menuItemCounts = {};
    orderItems.forEach(item => {
      if (!menuItemCounts[item.menu_item_id]) {
        menuItemCounts[item.menu_item_id] = {
          count: 0,
          revenue: 0
        };
      }
      menuItemCounts[item.menu_item_id].count += item.quantity;
      menuItemCounts[item.menu_item_id].revenue += item.total_price;
    });

    // Get menu item details and sort by popularity
    const popularItems = await Promise.all(
      Object.keys(menuItemCounts)
        .map(async (menuItemId) => {
          const menuItem = await MenuItem.findById(menuItemId);
          if (!menuItem) return null;
          
          return {
            id: menuItem._id,
            name: menuItem.name,
            count: menuItemCounts[menuItemId].count,
            revenue: menuItemCounts[menuItemId].revenue
          };
        })
    );

    // Filter out null values and sort by count
    const filteredPopularItems = popularItems
      .filter(item => item !== null)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 items

    res.status(200).json({
      success: true,
      data: {
        total_orders: totalOrders,
        total_revenue: totalRevenue,
        paid_orders: paidOrders,
        average_order_value: averageOrderValue,
        orders_by_status: ordersByStatus,
        orders_by_day: ordersByDayArray,
        popular_items: filteredPopularItems
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
