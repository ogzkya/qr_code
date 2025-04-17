const express = require('express');
const router = express.Router();
const { 
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  updatePaymentStatus,
  getOrderStats
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/', createOrder);

// Protected routes
router.get('/restaurant/:restaurantId', protect, getOrders);
router.get('/stats/restaurant/:restaurantId', protect, getOrderStats);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, updateOrderStatus);
router.put('/:id/payment', protect, updatePaymentStatus);

module.exports = router;
