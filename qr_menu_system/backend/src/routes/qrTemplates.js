const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');
const AdvancedQRCodeGenerator = require('../utils/advancedQRCodeGenerator');
const QRCode = require('../models/QRCode');
const Restaurant = require('../models/Restaurant');
const RestaurantAdmin = require('../models/RestaurantAdmin');

// Initialize QR code generator
const qrCodeGenerator = new AdvancedQRCodeGenerator();

// @desc    Get available QR code templates
// @route   GET /api/qr-templates
// @access  Private
router.get('/', protect, (req, res) => {
  try {
    const templates = qrCodeGenerator.getAvailableTemplates();
    
    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Generate QR code with custom template
// @route   POST /api/qr-templates/generate
// @access  Private
router.post('/generate', protect, upload.single('logo'), async (req, res) => {
  try {
    const { 
      data, 
      template_id, 
      custom_options,
      restaurant_id,
      name,
      type,
      target_id
    } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'QR code data is required'
      });
    }

    // Check if restaurant exists and user has access
    if (restaurant_id) {
      const restaurant = await Restaurant.findById(restaurant_id);
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found'
        });
      }

      const adminRecord = await RestaurantAdmin.findOne({
        restaurant_id,
        user_id: req.user.id
      });

      if (!adminRecord) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this restaurant'
        });
      }
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const filename = `qr-${Date.now()}-${Math.floor(Math.random() * 1000)}.png`;
    const outputPath = path.join(uploadsDir, filename);

    // Get template options
    let options = {};
    if (template_id) {
      const templates = qrCodeGenerator.getAvailableTemplates();
      const template = templates.find(t => t.id === template_id);
      if (template) {
        options = { ...template.options };
      }
    }

    // Apply custom options if provided
    if (custom_options) {
      const parsedOptions = typeof custom_options === 'string' 
        ? JSON.parse(custom_options) 
        : custom_options;
      
      options = { ...options, ...parsedOptions };
    }

    // Add logo if uploaded
    if (req.file) {
      options.logoPath = req.file.path;
    }

    // Generate QR code
    await qrCodeGenerator.generateQRCode(data, outputPath, options);

    // Create QR code record in database if restaurant_id is provided
    let qrCodeRecord = null;
    if (restaurant_id && name) {
      // Generate short URL
      const shortUrl = generateShortUrl();

      // Create QR code record
      qrCodeRecord = await QRCode.create({
        restaurant_id,
        name,
        type: type || 'table',
        target_id,
        image_path: filename,
        custom_design: options,
        short_url: shortUrl,
        is_active: true
      });
    }

    res.status(200).json({
      success: true,
      data: {
        filename,
        url: `/uploads/${filename}`,
        qr_code: qrCodeRecord
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Generate batch QR codes for tables
// @route   POST /api/qr-templates/batch-tables
// @access  Private
router.post('/batch-tables', protect, async (req, res) => {
  try {
    const { 
      restaurant_id, 
      start_number, 
      end_number, 
      template_id, 
      custom_options 
    } = req.body;

    // Validate input
    if (!restaurant_id || !start_number || !end_number) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant ID, start number, and end number are required'
      });
    }

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
        message: 'Not authorized to generate QR codes for this restaurant'
      });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Create batch directory
    const batchDir = path.join(uploadsDir, `batch-${Date.now()}`);
    fs.mkdirSync(batchDir, { recursive: true });

    // Get template options
    let options = {};
    if (template_id) {
      const templates = qrCodeGenerator.getAvailableTemplates();
      const template = templates.find(t => t.id === template_id);
      if (template) {
        options = { ...template.options };
      }
    }

    // Apply custom options if provided
    if (custom_options) {
      const parsedOptions = typeof custom_options === 'string' 
        ? JSON.parse(custom_options) 
        : custom_options;
      
      options = { ...options, ...parsedOptions };
    }

    // Generate QR codes
    const baseUrl = process.env.BASE_URL || 'https://qrmenu.example.com';
    const qrCodePaths = await qrCodeGenerator.generateTableQRCodes(
      baseUrl,
      restaurant_id,
      parseInt(start_number),
      parseInt(end_number),
      batchDir,
      options
    );

    // Create QR code records in database
    const qrCodeRecords = [];
    for (let tableNumber = parseInt(start_number); tableNumber <= parseInt(end_number); tableNumber++) {
      // Generate short URL
      const shortUrl = generateShortUrl();

      // Create QR code record
      const qrCode = await QRCode.create({
        restaurant_id,
        name: `Table ${tableNumber}`,
        type: 'table',
        image_path: `batch-${Date.now()}/table-${tableNumber}.png`,
        custom_design: options,
        short_url: shortUrl,
        is_active: true
      });

      qrCodeRecords.push(qrCode);
    }

    // Create zip file of all QR codes
    const archiver = require('archiver');
    const zipPath = path.join(uploadsDir, `tables-${restaurant_id}-${Date.now()}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    output.on('close', () => {
      res.status(200).json({
        success: true,
        data: {
          qr_codes: qrCodeRecords,
          zip_url: `/uploads/${path.basename(zipPath)}`,
          count: qrCodeRecords.length
        }
      });
    });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(output);
    
    // Add each QR code to the zip
    for (let tableNumber = parseInt(start_number); tableNumber <= parseInt(end_number); tableNumber++) {
      const filePath = path.join(batchDir, `table-${tableNumber}.png`);
      archive.file(filePath, { name: `table-${tableNumber}.png` });
    }

    archive.finalize();
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

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

module.exports = router;
