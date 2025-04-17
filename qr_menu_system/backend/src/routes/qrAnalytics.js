const express = require('express');
const router = express.Router();
const { 
  getRestaurantAnalytics,
  getQRCodeAnalytics,
  compareQRCodes
} = require('../controllers/qrAnalyticsController');
const { protect } = require('../middleware/auth');

router.get('/restaurant/:restaurantId', protect, getRestaurantAnalytics);
router.get('/qr-code/:qrCodeId', protect, getQRCodeAnalytics);
router.post('/compare', protect, compareQRCodes);

module.exports = router;
