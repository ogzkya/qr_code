const express = require('express');
const router = express.Router();
const { 
  createFeedback,
  getFeedback,
  getPublicFeedback,
  updateFeedbackStatus,
  replyToFeedback,
  getFeedbackStats
} = require('../controllers/feedbackController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/', createFeedback);
router.get('/public/restaurant/:restaurantId', getPublicFeedback);

// Protected routes
router.get('/restaurant/:restaurantId', protect, getFeedback);
router.get('/stats/restaurant/:restaurantId', protect, getFeedbackStats);
router.put('/:id/status', protect, updateFeedbackStatus);
router.put('/:id/reply', protect, replyToFeedback);

module.exports = router;
