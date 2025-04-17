const QRCode = require('../models/QRCode');
const Restaurant = require('../models/Restaurant');
const RestaurantAdmin = require('../models/RestaurantAdmin');
const MenuSection = require('../models/MenuSection');
const Category = require('../models/Category');
const QRCodeScan = require('../models/QRCodeScan');
const qrcode = require('qrcode');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/config');

// @desc    Get all QR codes for a restaurant
// @route   GET /api/qr-codes/restaurant/:restaurantId
// @access  Private
exports.getQRCodes = async (req, res) => {
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

    // Get QR codes
    const qrCodes = await QRCode.find({ restaurant_id: restaurantId });

    res.status(200).json({
      success: true,
      count: qrCodes.length,
      data: qrCodes
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single QR code
// @route   GET /api/qr-codes/:id
// @access  Private
exports.getQRCode = async (req, res) => {
  try {
    const qrCode = await QRCode.findById(req.params.id);

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

    // Get scan statistics
    const scanCount = await QRCodeScan.countDocuments({ qr_code_id: qrCode._id });
    const uniqueScans = await QRCodeScan.distinct('session_id', { qr_code_id: qrCode._id });
    
    // Get last 30 days scans
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentScans = await QRCodeScan.find({
      qr_code_id: qrCode._id,
      scanned_at: { $gte: thirtyDaysAgo }
    }).sort({ scanned_at: -1 }).limit(100);

    res.status(200).json({
      success: true,
      data: {
        ...qrCode.toObject(),
        statistics: {
          total_scans: scanCount,
          unique_visitors: uniqueScans.length,
          recent_scans: recentScans
        }
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

// @desc    Create new QR code
// @route   POST /api/qr-codes
// @access  Private
exports.createQRCode = async (req, res) => {
  try {
    const { 
      restaurant_id, 
      name, 
      type, 
      target_id,
      custom_design
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
        message: 'Not authorized to create QR codes for this restaurant'
      });
    }

    // Validate target_id based on type
    if (type === 'section' && target_id) {
      const menuSection = await MenuSection.findById(target_id);
      if (!menuSection || menuSection.restaurant_id !== restaurant_id) {
        return res.status(400).json({
          success: false,
          message: 'Invalid menu section ID'
        });
      }
    } else if (type === 'category' && target_id) {
      const category = await Category.findById(target_id);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID'
        });
      }
      
      const menuSection = await MenuSection.findById(category.menu_section_id);
      if (!menuSection || menuSection.restaurant_id !== restaurant_id) {
        return res.status(400).json({
          success: false,
          message: 'Category does not belong to this restaurant'
        });
      }
    }

    // Parse custom design if provided as string
    let parsedCustomDesign = custom_design;
    if (custom_design && typeof custom_design === 'string') {
      parsedCustomDesign = JSON.parse(custom_design);
    }

    // Generate short URL
    const shortUrl = generateShortUrl();

    // Create QR code record
    const qrCode = await QRCode.create({
      restaurant_id,
      name,
      type,
      target_id,
      custom_design: parsedCustomDesign,
      short_url: shortUrl
    });

    // Generate QR code image
    const baseUrl = process.env.BASE_URL || 'https://qrmenu.example.com';
    const qrUrl = `${baseUrl}/m/${shortUrl}`;
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Generate QR code image
    const qrImagePath = path.join(uploadsDir, `qr-${qrCode._id}.png`);
    
    // QR code options
    const qrOptions = {
      errorCorrectionLevel: parsedCustomDesign?.errorCorrectionLevel || 'M',
      color: {
        dark: parsedCustomDesign?.foreground || '#000000',
        light: parsedCustomDesign?.background || '#FFFFFF'
      }
    };
    
    await qrcode.toFile(qrImagePath, qrUrl, qrOptions);
    
    // Update QR code with image path
    qrCode.image_path = `qr-${qrCode._id}.png`;
    await qrCode.save();

    res.status(201).json({
      success: true,
      data: qrCode
    });
  } catch (err) {
    console.error(err);
    
    // Handle duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A QR code with this name already exists for this restaurant'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update QR code
// @route   PUT /api/qr-codes/:id
// @access  Private
exports.updateQRCode = async (req, res) => {
  try {
    let qrCode = await QRCode.findById(req.params.id);

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

    if (!adminRecord || (adminRecord.role !== 'owner' && adminRecord.role !== 'manager')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update QR codes for this restaurant'
      });
    }

    // Parse custom design if provided as string
    if (req.body.custom_design && typeof req.body.custom_design === 'string') {
      req.body.custom_design = JSON.parse(req.body.custom_design);
    }

    // Update QR code
    qrCode = await QRCode.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Regenerate QR code image if custom design was updated
    if (req.body.custom_design) {
      const baseUrl = process.env.BASE_URL || 'https://qrmenu.example.com';
      const qrUrl = `${baseUrl}/m/${qrCode.short_url}`;
      
      // QR code options
      const qrOptions = {
        errorCorrectionLevel: qrCode.custom_design?.errorCorrectionLevel || 'M',
        color: {
          dark: qrCode.custom_design?.foreground || '#000000',
          light: qrCode.custom_design?.background || '#FFFFFF'
        }
      };
      
      const uploadsDir = path.join(__dirname, '../../uploads');
      const qrImagePath = path.join(uploadsDir, `qr-${qrCode._id}.png`);
      
      await qrcode.toFile(qrImagePath, qrUrl, qrOptions);
    }

    res.status(200).json({
      success: true,
      data: qrCode
    });
  } catch (err) {
    console.error(err);
    
    // Handle duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A QR code with this name already exists for this restaurant'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete QR code
// @route   DELETE /api/qr-codes/:id
// @access  Private
exports.deleteQRCode = async (req, res) => {
  try {
    const qrCode = await QRCode.findById(req.params.id);

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

    if (!adminRecord || (adminRecord.role !== 'owner' && adminRecord.role !== 'manager')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete QR codes for this restaurant'
      });
    }

    // Delete QR code image if exists
    if (qrCode.image_path) {
      const imagePath = path.join(__dirname, '../../uploads', qrCode.image_path);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await qrCode.remove();

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

// @desc    Record QR code scan
// @route   POST /api/qr-codes/scan/:shortUrl
// @access  Public
exports.recordScan = async (req, res) => {
  try {
    const { shortUrl } = req.params;
    const { session_id, ip_address, user_agent, device_type, referrer } = req.body;

    // Find QR code by short URL
    const qrCode = await QRCode.findOne({ short_url: shortUrl });

    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found'
      });
    }

    // Check if QR code is active
    if (!qrCode.is_active) {
      return res.status(400).json({
        success: false,
        message: 'QR code is inactive'
      });
    }

    // Record scan
    await QRCodeScan.create({
      qr_code_id: qrCode._id,
      session_id: session_id || uuidv4(),
      ip_address,
      user_agent,
      device_type,
      referrer
    });

    // Determine redirect URL based on QR code type and target
    let redirectUrl;
    const baseUrl = process.env.BASE_URL || 'https://qrmenu.example.com';
    
    if (qrCode.type === 'table') {
      redirectUrl = `${baseUrl}/r/${qrCode.restaurant_id}?table=${qrCode.name}`;
    } else if (qrCode.type === 'section' && qrCode.target_id) {
      redirectUrl = `${baseUrl}/r/${qrCode.restaurant_id}/s/${qrCode.target_id}`;
    } else if (qrCode.type === 'category' && qrCode.target_id) {
      redirectUrl = `${baseUrl}/r/${qrCode.restaurant_id}/c/${qrCode.target_id}`;
    } else if (qrCode.type === 'promotional') {
      redirectUrl = `${baseUrl}/r/${qrCode.restaurant_id}/promo/${qrCode._id}`;
    } else {
      redirectUrl = `${baseUrl}/r/${qrCode.restaurant_id}`;
    }

    res.status(200).json({
      success: true,
      data: {
        redirect_url: redirectUrl
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

// Helper function to generate a short URL
function generateShortUrl() {
  // Generate a random string of 8 characters
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let shortUrl = '';
  for (let i = 0; i < 8; i++) {
    shortUrl += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return shortUrl;
}
