const express = require('express');
const router = express.Router();
const { 
  createPromotion,
  getPromotions,
  getPublicPromotions,
  getPromotion,
  updatePromotion,
  deletePromotion,
  incrementUsage
} = require('../controllers/promotionController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/public/restaurant/:restaurantId', getPublicPromotions);

// Protected routes
router.route('/')
  .post(protect, createPromotion);

router.route('/:id')
  .get(protect, getPromotion)
  .put(protect, updatePromotion)
  .delete(protect, deletePromotion);

router.get('/restaurant/:restaurantId', protect, getPromotions);
router.put('/:id/increment-usage', protect, incrementUsage);

module.exports = router;
