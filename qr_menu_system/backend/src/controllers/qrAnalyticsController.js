const QRCodeScan = require('../models/QRCodeScan');
const QRCode = require('../models/QRCode');
const Restaurant = require('../models/Restaurant');
const RestaurantAdmin = require('../models/RestaurantAdmin');

// @desc    Get QR code analytics for a restaurant
// @route   GET /api/qr-analytics/restaurant/:restaurantId
// @access  Private
exports.getRestaurantAnalytics = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { period } = req.query; // day, week, month, year, all

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

    // Get all QR codes for this restaurant
    const qrCodes = await QRCode.find({ restaurant_id: restaurantId });
    const qrCodeIds = qrCodes.map(qr => qr._id);

    // Set date filter based on period
    let dateFilter = {};
    if (period) {
      const now = new Date();
      let startDate;

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
          startDate = null;
      }

      if (startDate) {
        dateFilter = { scanned_at: { $gte: startDate } };
      }
    }

    // Get all scans for these QR codes
    const scans = await QRCodeScan.find({
      qr_code_id: { $in: qrCodeIds },
      ...dateFilter
    }).sort({ scanned_at: -1 });

    // Get unique visitors (unique session IDs)
    const uniqueVisitors = [...new Set(scans.map(scan => scan.session_id))].length;

    // Get scans per QR code
    const scansPerQRCode = {};
    for (const scan of scans) {
      if (!scansPerQRCode[scan.qr_code_id]) {
        scansPerQRCode[scan.qr_code_id] = 0;
      }
      scansPerQRCode[scan.qr_code_id]++;
    }

    // Get QR code details and add scan counts
    const qrCodeAnalytics = qrCodes.map(qr => ({
      id: qr._id,
      name: qr.name,
      type: qr.type,
      scan_count: scansPerQRCode[qr._id] || 0
    })).sort((a, b) => b.scan_count - a.scan_count);

    // Get scans per day for the last 30 days
    const scansPerDay = {};
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const filteredScans = scans.filter(scan => scan.scanned_at >= last30Days);
    for (const scan of filteredScans) {
      const day = scan.scanned_at.toISOString().split('T')[0];
      if (!scansPerDay[day]) {
        scansPerDay[day] = 0;
      }
      scansPerDay[day]++;
    }

    // Convert to array for easier consumption by frontend
    const scansPerDayArray = Object.keys(scansPerDay).map(day => ({
      date: day,
      count: scansPerDay[day]
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Get device type distribution
    const deviceTypes = {};
    for (const scan of scans) {
      if (scan.device_type) {
        if (!deviceTypes[scan.device_type]) {
          deviceTypes[scan.device_type] = 0;
        }
        deviceTypes[scan.device_type]++;
      }
    }

    // Convert to array for easier consumption by frontend
    const deviceTypesArray = Object.keys(deviceTypes).map(type => ({
      type,
      count: deviceTypes[type]
    })).sort((a, b) => b.count - a.count);

    // Get referrer distribution
    const referrers = {};
    for (const scan of scans) {
      if (scan.referrer) {
        const referrer = new URL(scan.referrer).hostname;
        if (!referrers[referrer]) {
          referrers[referrer] = 0;
        }
        referrers[referrer]++;
      }
    }

    // Convert to array for easier consumption by frontend
    const referrersArray = Object.keys(referrers).map(referrer => ({
      referrer,
      count: referrers[referrer]
    })).sort((a, b) => b.count - a.count);

    res.status(200).json({
      success: true,
      data: {
        total_scans: scans.length,
        unique_visitors: uniqueVisitors,
        qr_codes: qrCodeAnalytics,
        scans_per_day: scansPerDayArray,
        device_types: deviceTypesArray,
        referrers: referrersArray
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

// @desc    Get QR code analytics for a specific QR code
// @route   GET /api/qr-analytics/qr-code/:qrCodeId
// @access  Private
exports.getQRCodeAnalytics = async (req, res) => {
  try {
    const { qrCodeId } = req.params;
    const { period } = req.query; // day, week, month, year, all

    // Check if QR code exists
    const qrCode = await QRCode.findById(qrCodeId);
    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found'
      });
    }

    // Check if user has access to this restaurant
    const adminRecord = await RestaurantAdmin.findOne({
      restaurant_id: qrCode.restaurant_id,
      user_id: req.user.id
    });

    if (!adminRecord) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this QR code'
      });
    }

    // Set date filter based on period
    let dateFilter = {};
    if (period) {
      const now = new Date();
      let startDate;

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
          startDate = null;
      }

      if (startDate) {
        dateFilter = { scanned_at: { $gte: startDate } };
      }
    }

    // Get all scans for this QR code
    const scans = await QRCodeScan.find({
      qr_code_id: qrCodeId,
      ...dateFilter
    }).sort({ scanned_at: -1 });

    // Get unique visitors (unique session IDs)
    const uniqueVisitors = [...new Set(scans.map(scan => scan.session_id))].length;

    // Get scans per hour of day
    const scansPerHour = Array(24).fill(0);
    for (const scan of scans) {
      const hour = scan.scanned_at.getHours();
      scansPerHour[hour]++;
    }

    // Get scans per day of week
    const scansPerDayOfWeek = Array(7).fill(0);
    for (const scan of scans) {
      const dayOfWeek = scan.scanned_at.getDay();
      scansPerDayOfWeek[dayOfWeek]++;
    }

    // Get scans per day for the last 30 days
    const scansPerDay = {};
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const filteredScans = scans.filter(scan => scan.scanned_at >= last30Days);
    for (const scan of filteredScans) {
      const day = scan.scanned_at.toISOString().split('T')[0];
      if (!scansPerDay[day]) {
        scansPerDay[day] = 0;
      }
      scansPerDay[day]++;
    }

    // Convert to array for easier consumption by frontend
    const scansPerDayArray = Object.keys(scansPerDay).map(day => ({
      date: day,
      count: scansPerDay[day]
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Get device type distribution
    const deviceTypes = {};
    for (const scan of scans) {
      if (scan.device_type) {
        if (!deviceTypes[scan.device_type]) {
          deviceTypes[scan.device_type] = 0;
        }
        deviceTypes[scan.device_type]++;
      }
    }

    // Convert to array for easier consumption by frontend
    const deviceTypesArray = Object.keys(deviceTypes).map(type => ({
      type,
      count: deviceTypes[type]
    })).sort((a, b) => b.count - a.count);

    // Get recent scans (last 100)
    const recentScans = scans.slice(0, 100);

    res.status(200).json({
      success: true,
      data: {
        qr_code: {
          id: qrCode._id,
          name: qrCode.name,
          type: qrCode.type,
          created_at: qrCode.created_at
        },
        total_scans: scans.length,
        unique_visitors: uniqueVisitors,
        scans_per_hour: scansPerHour,
        scans_per_day_of_week: scansPerDayOfWeek,
        scans_per_day: scansPerDayArray,
        device_types: deviceTypesArray,
        recent_scans: recentScans
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

// @desc    Get comparison analytics for multiple QR codes
// @route   POST /api/qr-analytics/compare
// @access  Private
exports.compareQRCodes = async (req, res) => {
  try {
    const { qrCodeIds, period } = req.body;

    if (!qrCodeIds || !Array.isArray(qrCodeIds) || qrCodeIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'QR code IDs are required'
      });
    }

    // Check if QR codes exist and user has access
    const qrCodes = await QRCode.find({ _id: { $in: qrCodeIds } });
    
    if (qrCodes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No QR codes found'
      });
    }

    // Check if user has access to these restaurants
    const restaurantIds = [...new Set(qrCodes.map(qr => qr.restaurant_id))];
    
    for (const restaurantId of restaurantIds) {
      const adminRecord = await RestaurantAdmin.findOne({
        restaurant_id: restaurantId,
        user_id: req.user.id
      });

      if (!adminRecord) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access one or more QR codes'
        });
      }
    }

    // Set date filter based on period
    let dateFilter = {};
    if (period) {
      const now = new Date();
      let startDate;

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
          startDate = null;
      }

      if (startDate) {
        dateFilter = { scanned_at: { $gte: startDate } };
      }
    }

    // Get comparison data for each QR code
    const comparisonData = [];

    for (const qrCode of qrCodes) {
      // Get all scans for this QR code
      const scans = await QRCodeScan.find({
        qr_code_id: qrCode._id,
        ...dateFilter
      });

      // Get unique visitors (unique session IDs)
      const uniqueVisitors = [...new Set(scans.map(scan => scan.session_id))].length;

      // Get scans per day for the period
      const scansPerDay = {};
      
      for (const scan of scans) {
        const day = scan.scanned_at.toISOString().split('T')[0];
        if (!scansPerDay[day]) {
          scansPerDay[day] = 0;
        }
        scansPerDay[day]++;
      }

      // Convert to array for easier consumption by frontend
      const scansPerDayArray = Object.keys(scansPerDay).map(day => ({
        date: day,
        count: scansPerDay[day]
      })).sort((a, b) => new Date(a.date) - new Date(b.date));

      comparisonData.push({
        qr_code: {
          id: qrCode._id,
          name: qrCode.name,
          type: qrCode.type
        },
        total_scans: scans.length,
        unique_visitors: uniqueVisitors,
        scans_per_day: scansPerDayArray
      });
    }

    res.status(200).json({
      success: true,
      data: comparisonData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
