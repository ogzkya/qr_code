const Feedback = require('../models/Feedback');
const Restaurant = require('../models/Restaurant');
const RestaurantAdmin = require('../models/RestaurantAdmin');
const MenuItem = require('../models/MenuItem');

// @desc    Create new feedback
// @route   POST /api/feedback
// @access  Public
exports.createFeedback = async (req, res) => {
  try {
    const { 
      restaurant_id, 
      menu_item_id,
      customer_name, 
      customer_email,
      rating,
      comments,
      service_rating,
      food_rating,
      ambience_rating,
      value_rating
    } = req.body;

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurant_id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Check if menu item exists if provided
    if (menu_item_id) {
      const menuItem = await MenuItem.findById(menu_item_id);
      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found'
        });
      }
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Create feedback
    const feedback = await Feedback.create({
      restaurant_id,
      menu_item_id,
      customer_name,
      customer_email,
      rating,
      comments,
      service_rating,
      food_rating,
      ambience_rating,
      value_rating,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      data: feedback
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all feedback for a restaurant
// @route   GET /api/feedback/restaurant/:restaurantId
// @access  Private
exports.getFeedback = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { status, menu_item_id, limit = 50, page = 1 } = req.query;

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
        message: 'Not authorized to access feedback for this restaurant'
      });
    }

    // Build query
    const query = { restaurant_id: restaurantId };
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    // Add menu item filter if provided
    if (menu_item_id) {
      query.menu_item_id = menu_item_id;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get feedback
    const feedback = await Feedback.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await Feedback.countDocuments(query);

    res.status(200).json({
      success: true,
      count: feedback.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: feedback
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get public feedback for a restaurant
// @route   GET /api/feedback/public/restaurant/:restaurantId
// @access  Public
exports.getPublicFeedback = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { menu_item_id, limit = 10, page = 1 } = req.query;

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Build query
    const query = { 
      restaurant_id: restaurantId,
      status: 'approved' // Only return approved feedback
    };
    
    // Add menu item filter if provided
    if (menu_item_id) {
      query.menu_item_id = menu_item_id;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get feedback
    const feedback = await Feedback.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await Feedback.countDocuments(query);

    // Calculate average ratings
    const allFeedback = await Feedback.find({
      restaurant_id: restaurantId,
      status: 'approved'
    });

    const totalRatings = allFeedback.length;
    const averageRating = totalRatings > 0 
      ? allFeedback.reduce((sum, item) => sum + item.rating, 0) / totalRatings 
      : 0;
    
    const averageServiceRating = totalRatings > 0 
      ? allFeedback.filter(item => item.service_rating).reduce((sum, item) => sum + item.service_rating, 0) / 
        allFeedback.filter(item => item.service_rating).length 
      : 0;
    
    const averageFoodRating = totalRatings > 0 
      ? allFeedback.filter(item => item.food_rating).reduce((sum, item) => sum + item.food_rating, 0) / 
        allFeedback.filter(item => item.food_rating).length 
      : 0;
    
    const averageAmbienceRating = totalRatings > 0 
      ? allFeedback.filter(item => item.ambience_rating).reduce((sum, item) => sum + item.ambience_rating, 0) / 
        allFeedback.filter(item => item.ambience_rating).length 
      : 0;
    
    const averageValueRating = totalRatings > 0 
      ? allFeedback.filter(item => item.value_rating).reduce((sum, item) => sum + item.value_rating, 0) / 
        allFeedback.filter(item => item.value_rating).length 
      : 0;

    // Rating distribution
    const ratingDistribution = [0, 0, 0, 0, 0]; // 1-5 stars
    allFeedback.forEach(item => {
      ratingDistribution[Math.floor(item.rating) - 1]++;
    });

    res.status(200).json({
      success: true,
      count: feedback.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      statistics: {
        total_ratings: totalRatings,
        average_rating: averageRating,
        average_service_rating: averageServiceRating,
        average_food_rating: averageFoodRating,
        average_ambience_rating: averageAmbienceRating,
        average_value_rating: averageValueRating,
        rating_distribution: ratingDistribution
      },
      data: feedback
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update feedback status
// @route   PUT /api/feedback/:id/status
// @access  Private
exports.updateFeedbackStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    // Check if status is valid
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    let feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Check if user has access to this restaurant
    const adminRecord = await RestaurantAdmin.findOne({
      restaurant_id: feedback.restaurant_id,
      user_id: req.user.id
    });

    if (!adminRecord) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this feedback'
      });
    }

    // Update feedback status
    feedback.status = status;
    await feedback.save();

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Reply to feedback
// @route   PUT /api/feedback/:id/reply
// @access  Private
exports.replyToFeedback = async (req, res) => {
  try {
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({
        success: false,
        message: 'Reply is required'
      });
    }

    let feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Check if user has access to this restaurant
    const adminRecord = await RestaurantAdmin.findOne({
      restaurant_id: feedback.restaurant_id,
      user_id: req.user.id
    });

    if (!adminRecord) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reply to this feedback'
      });
    }

    // Update feedback with reply
    feedback.reply = reply;
    feedback.reply_date = Date.now();
    await feedback.save();

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get feedback statistics for a restaurant
// @route   GET /api/feedback/stats/restaurant/:restaurantId
// @access  Private
exports.getFeedbackStats = async (req, res) => {
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
        message: 'Not authorized to access feedback statistics for this restaurant'
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

    // Get feedback for the period
    const feedback = await Feedback.find({
      restaurant_id: restaurantId,
      created_at: { $gte: startDate }
    });

    // Calculate statistics
    const totalFeedback = feedback.length;
    const approvedFeedback = feedback.filter(fb => fb.status === 'approved').length;
    const pendingFeedback = feedback.filter(fb => fb.status === 'pending').length;
    const rejectedFeedback = feedback.filter(fb => fb.status === 'rejected').length;
    
    const averageRating = totalFeedback > 0 
      ? feedback.reduce((sum, item) => sum + item.rating, 0) / totalFeedback 
      : 0;
    
    const averageServiceRating = totalFeedback > 0 
      ? feedback.filter(item => item.service_rating).reduce((sum, item) => sum + item.service_rating, 0) / 
        feedback.filter(item => item.service_rating).length 
      : 0;
    
    const averageFoodRating = totalFeedback > 0 
      ? feedback.filter(item => item.food_rating).reduce((sum, item) => sum + item.food_rating, 0) / 
        feedback.filter(item => item.food_rating).length 
      : 0;
    
    const averageAmbienceRating = totalFeedback > 0 
      ? feedback.filter(item => item.ambience_rating).reduce((sum, item) => sum + item.ambience_rating, 0) / 
        feedback.filter(item => item.ambience_rating).length 
      : 0;
    
    const averageValueRating = totalFeedback > 0 
      ? feedback.filter(item => item.value_rating).reduce((sum, item) => sum + item.value_rating, 0) / 
        feedback.filter(item => item.value_rating).length 
      : 0;

    // Rating distribution
    const ratingDistribution = [0, 0, 0, 0, 0]; // 1-5 stars
    feedback.forEach(item => {
      ratingDistribution[Math.floor(item.rating) - 1]++;
    });

    // Get feedback by day
    const feedbackByDay = {};
    feedback.forEach(fb => {
      const day = fb.created_at.toISOString().split('T')[0];
      if (!feedbackByDay[day]) {
        feedbackByDay[day] = {
          count: 0,
          rating_sum: 0
        };
      }
      feedbackByDay[day].count++;
      feedbackByDay[day].rating_sum += fb.rating;
    });

    // Convert to array for easier consumption by frontend
    const feedbackByDayArray = Object.keys(feedbackByDay).map(day => ({
      date: day,
      count: feedbackByDay[day].count,
      average_rating: feedbackByDay[day].rating_sum / feedbackByDay[day].count
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Get feedback for menu items
    const menuItemFeedback = {};
    for (const fb of feedback) {
      if (fb.menu_item_id) {
        if (!menuItemFeedback[fb.menu_item_id]) {
          menuItemFeedback[fb.menu_item_id] = {
            count: 0,
            rating_sum: 0,
            menu_item: null
          };
        }
        menuItemFeedback[fb.menu_item_id].count++;
        menuItemFeedback[fb.menu_item_id].rating_sum += fb.rating;
      }
    }

    // Get menu item details
    for (const menuItemId of Object.keys(menuItemFeedback)) {
      const menuItem = await MenuItem.findById(menuItemId);
      if (menuItem) {
        menuItemFeedback[menuItemId].menu_item = {
          id: menuItem._id,
          name: menuItem.name,
          image: menuItem.image
        };
      }
    }

    // Convert to array and sort by count
    const menuItemFeedbackArray = Object.keys(menuItemFeedback)
      .map(menuItemId => ({
        menu_item: menuItemFeedback[menuItemId].menu_item,
        count: menuItemFeedback[menuItemId].count,
        average_rating: menuItemFeedback[menuItemId].rating_sum / menuItemFeedback[menuItemId].count
      }))
      .filter(item => item.menu_item !== null)
      .sort((a, b) => b.count - a.count);

    res.status(200).json({
      success: true,
      data: {
        total_feedback: totalFeedback,
        approved_feedback: approvedFeedback,
        pending_feedback: pendingFeedback,
        rejected_feedback: rejectedFeedback,
        average_rating: averageRating,
        average_service_rating: averageServiceRating,
        average_food_rating: averageFoodRating,
        average_ambience_rating: averageAmbienceRating,
        average_value_rating: averageValueRating,
        rating_distribution: ratingDistribution,
        feedback_by_day: feedbackByDayArray,
        menu_item_feedback: menuItemFeedbackArray
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
