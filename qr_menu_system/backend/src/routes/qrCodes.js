const express = require('express');
const router = express.Router();
const { 
  getQRCodes,
  getQRCode,
  createQRCode,
  updateQRCode,
  deleteQRCode,
  recordScan
} = require('../controllers/qrCodeController');
const { protect } = require('../middleware/auth');

// Protected routes
router.route('/')
  .post(protect, createQRCode);

router.route('/:id')
  .get(protect, getQRCode)
  .put(protect, updateQRCode)
  .delete(protect, deleteQRCode);

router.route('/restaurant/:restaurantId')
  .get(protect, getQRCodes);

// Public route for recording scans
router.post('/scan/:shortUrl', recordScan);

module.exports = router;
