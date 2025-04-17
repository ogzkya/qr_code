const Reservation = require('../models/Reservation');
const Restaurant = require('../models/Restaurant');
const RestaurantAdmin = require('../models/RestaurantAdmin');

// @desc    Create new reservation
// @route   POST /api/reservations
// @access  Public
exports.createReservation = async (req, res) => {
  try {
    const { 
      restaurant_id, 
      customer_name, 
      customer_phone, 
      customer_email,
      party_size,
      reservation_date,
      reservation_time,
      special_requests
    } = req.body;

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurant_id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Validate required fields
    if (!customer_name || !customer_phone || !party_size || !reservation_date || !reservation_time) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate party size
    if (party_size < 1) {
      return res.status(400).json({
        success: false,
        message: 'Party size must be at least 1'
      });
    }

    // Validate reservation date and time
    const reservationDateTime = new Date(`${reservation_date}T${reservation_time}`);
    if (isNaN(reservationDateTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reservation date or time'
      });
    }

    // Check if reservation is in the future
    if (reservationDateTime < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Reservation must be in the future'
      });
    }

    // Check if restaurant is open on the reservation date
    const dayOfWeek = new Date(reservation_date).toLocaleDateString('en-US', { weekday: 'lowercase' });
    if (restaurant.working_hours && restaurant.working_hours[dayOfWeek]) {
      const workingHours = restaurant.working_hours[dayOfWeek];
      
      // Check if restaurant is closed on that day
      if (workingHours.closed) {
        return res.status(400).json({
          success: false,
          message: `Restaurant is closed on ${dayOfWeek}`
        });
      }
      
      // Check if reservation time is within working hours
      const openTime = workingHours.open;
      const closeTime = workingHours.close;
      
      if (reservation_time < openTime || reservation_time > closeTime) {
        return res.status(400).json({
          success: false,
          message: `Restaurant is only open from ${openTime} to ${closeTime} on ${dayOfWeek}`
        });
      }
    }

    // Create reservation
    const reservation = await Reservation.create({
      restaurant_id,
      customer_name,
      customer_phone,
      customer_email,
      party_size,
      reservation_date: reservationDateTime,
      reservation_time,
      special_requests,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      data: reservation
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all reservations for a restaurant
// @route   GET /api/reservations/restaurant/:restaurantId
// @access  Private
exports.getReservations = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { date, status, limit = 50, page = 1 } = req.query;

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
        message: 'Not authorized to access reservations for this restaurant'
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
      
      query.reservation_date = {
        $gte: startDate,
        $lte: endDate
      };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get reservations
    const reservations = await Reservation.find(query)
      .sort({ reservation_date: 1, reservation_time: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await Reservation.countDocuments(query);

    res.status(200).json({
      success: true,
      count: reservations.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: reservations
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single reservation
// @route   GET /api/reservations/:id
// @access  Private
exports.getReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Check if user has access to this restaurant
    const adminRecord = await RestaurantAdmin.findOne({
      restaurant_id: reservation.restaurant_id,
      user_id: req.user.id
    });

    if (!adminRecord) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this reservation'
      });
    }

    res.status(200).json({
      success: true,
      data: reservation
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update reservation status
// @route   PUT /api/reservations/:id/status
// @access  Private
exports.updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    // Check if status is valid
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    let reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Check if user has access to this restaurant
    const adminRecord = await RestaurantAdmin.findOne({
      restaurant_id: reservation.restaurant_id,
      user_id: req.user.id
    });

    if (!adminRecord) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this reservation'
      });
    }

    // Update reservation status
    reservation.status = status;
    await reservation.save();

    res.status(200).json({
      success: true,
      data: reservation
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Check availability for a reservation
// @route   POST /api/reservations/check-availability
// @access  Public
exports.checkAvailability = async (req, res) => {
  try {
    const { 
      restaurant_id, 
      party_size,
      reservation_date,
      reservation_time
    } = req.body;

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurant_id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Validate required fields
    if (!party_size || !reservation_date || !reservation_time) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate party size
    if (party_size < 1) {
      return res.status(400).json({
        success: false,
        message: 'Party size must be at least 1'
      });
    }

    // Validate reservation date and time
    const reservationDateTime = new Date(`${reservation_date}T${reservation_time}`);
    if (isNaN(reservationDateTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reservation date or time'
      });
    }

    // Check if reservation is in the future
    if (reservationDateTime < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Reservation must be in the future'
      });
    }

    // Check if restaurant is open on the reservation date
    const dayOfWeek = new Date(reservation_date).toLocaleDateString('en-US', { weekday: 'lowercase' });
    if (restaurant.working_hours && restaurant.working_hours[dayOfWeek]) {
      const workingHours = restaurant.working_hours[dayOfWeek];
      
      // Check if restaurant is closed on that day
      if (workingHours.closed) {
        return res.status(200).json({
          success: true,
          available: false,
          message: `Restaurant is closed on ${dayOfWeek}`
        });
      }
      
      // Check if reservation time is within working hours
      const openTime = workingHours.open;
      const closeTime = workingHours.close;
      
      if (reservation_time < openTime || reservation_time > closeTime) {
        return res.status(200).json({
          success: true,
          available: false,
          message: `Restaurant is only open from ${openTime} to ${closeTime} on ${dayOfWeek}`
        });
      }
    }

    // Check existing reservations for the same time slot
    // This is a simplified availability check - in a real system, you would need to consider
    // table capacity, reservation duration, and other factors
    const startDate = new Date(reservation_date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(reservation_date);
    endDate.setHours(23, 59, 59, 999);
    
    const existingReservations = await Reservation.find({
      restaurant_id,
      reservation_date: {
        $gte: startDate,
        $lte: endDate
      },
      status: { $in: ['pending', 'confirmed'] }
    });

    // Count reservations within 1 hour of the requested time
    const [requestedHour, requestedMinute] = reservation_time.split(':').map(Number);
    const requestedTimeInMinutes = requestedHour * 60 + requestedMinute;
    
    let conflictingReservations = 0;
    let totalPartySize = 0;
    
    existingReservations.forEach(reservation => {
      const [resHour, resMinute] = reservation.reservation_time.split(':').map(Number);
      const resTimeInMinutes = resHour * 60 + resMinute;
      
      // Check if reservation is within 1 hour of requested time
      if (Math.abs(resTimeInMinutes - requestedTimeInMinutes) <= 60) {
        conflictingReservations++;
        totalPartySize += reservation.party_size;
      }
    });

    // Simplified capacity check - assume restaurant can handle 50 people per hour
    // In a real system, this would be based on restaurant-specific capacity settings
    const hourlyCapacity = 50;
    const isAvailable = totalPartySize + parseInt(party_size) <= hourlyCapacity;

    // Suggest alternative times if not available
    let alternativeTimes = [];
    if (!isAvailable) {
      // Suggest times 1 hour before and after in 30-minute increments
      for (let offset = -120; offset <= 120; offset += 30) {
        if (offset === 0) continue; // Skip the requested time
        
        const newTimeInMinutes = requestedTimeInMinutes + offset;
        const newHour = Math.floor(newTimeInMinutes / 60);
        const newMinute = newTimeInMinutes % 60;
        
        // Skip times outside restaurant hours
        if (restaurant.working_hours && restaurant.working_hours[dayOfWeek]) {
          const [openHour, openMinute] = restaurant.working_hours[dayOfWeek].open.split(':').map(Number);
          const [closeHour, closeMinute] = restaurant.working_hours[dayOfWeek].close.split(':').map(Number);
          
          const openTimeInMinutes = openHour * 60 + openMinute;
          const closeTimeInMinutes = closeHour * 60 + closeMinute;
          
          if (newTimeInMinutes < openTimeInMinutes || newTimeInMinutes > closeTimeInMinutes) {
            continue;
          }
        }
        
        // Format time as HH:MM
        const formattedHour = newHour.toString().padStart(2, '0');
        const formattedMinute = newMinute.toString().padStart(2, '0');
        const alternativeTime = `${formattedHour}:${formattedMinute}`;
        
        alternativeTimes.push(alternativeTime);
      }
    }

    res.status(200).json({
      success: true,
      available: isAvailable,
      message: isAvailable ? 'Reservation time is available' : 'Reservation time is not available',
      alternative_times: !isAvailable ? alternativeTimes : []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get reservation statistics for a restaurant
// @route   GET /api/reservations/stats/restaurant/:restaurantId
// @access  Private
exports.getReservationStats = async (req, res) => {
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
        message: 'Not authorized to access reservation statistics for this restaurant'
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

    // Get reservations for the period
    const reservations = await Reservation.find({
      restaurant_id: restaurantId,
      reservation_date: { $gte: startDate }
    });

    // Calculate statistics
    const totalReservations = reservations.length;
    const confirmedReservations = reservations.filter(res => res.status === 'confirmed').length;
    const cancelledReservations = reservations.filter(res => res.status === 'cancelled').length;
    const completedReservations = reservations.filter(res => res.status === 'completed').length;
    const pendingReservations = reservations.filter(res => res.status === 'pending').length;
    
    const totalPartySize = reservations.reduce((sum, res) => sum + res.party_size, 0);
    const averagePartySize = totalReservations > 0 ? totalPartySize / totalReservations : 0;

    // Get reservations by day
    const reservationsByDay = {};
    reservations.forEach(reservation => {
      const day = reservation.reservation_date.toISOString().split('T')[0];
      if (!reservationsByDay[day]) {
        reservationsByDay[day] = {
          count: 0,
          party_size: 0
        };
      }
      reservationsByDay[day].count++;
      reservationsByDay[day].party_size += reservation.party_size;
    });

    // Convert to array for easier consumption by frontend
    const reservationsByDayArray = Object.keys(reservationsByDay).map(day => ({
      date: day,
      count: reservationsByDay[day].count,
      party_size: reservationsByDay[day].party_size
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Get reservations by hour
    const reservationsByHour = Array(24).fill(0);
    reservations.forEach(reservation => {
      const [hour] = reservation.reservation_time.split(':').map(Number);
      reservationsByHour[hour]++;
    });

    // Get reservations by day of week
    const reservationsByDayOfWeek = Array(7).fill(0);
    reservations.forEach(reservation => {
      const dayOfWeek = new Date(reservation.reservation_date).getDay();
      reservationsByDayOfWeek[dayOfWeek]++;
    });

    res.status(200).json({
      success: true,
      data: {
        total_reservations: totalReservations,
        confirmed_reservations: confirmedReservations,
        cancelled_reservations: cancelledReservations,
        completed_reservations: completedReservations,
        pending_reservations: pendingReservations,
        average_party_size: averagePartySize,
        reservations_by_day: reservationsByDayArray,
        reservations_by_hour: reservationsByHour,
        reservations_by_day_of_week: reservationsByDayOfWeek
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
