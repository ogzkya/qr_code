const express = require('express');
const router = express.Router();
const { 
  createReservation,
  getReservations,
  getReservation,
  updateReservationStatus,
  checkAvailability,
  getReservationStats
} = require('../controllers/reservationController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/', createReservation);
router.post('/check-availability', checkAvailability);

// Protected routes
router.get('/restaurant/:restaurantId', protect, getReservations);
router.get('/stats/restaurant/:restaurantId', protect, getReservationStats);
router.get('/:id', protect, getReservation);
router.put('/:id/status', protect, updateReservationStatus);

module.exports = router;
