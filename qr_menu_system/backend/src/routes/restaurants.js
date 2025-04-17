const express = require('express');
const router = express.Router();
const { 
  createRestaurant, 
  getRestaurants, 
  getRestaurant, 
  updateRestaurant, 
  deleteRestaurant, 
  uploadLogo,
  addStaff,
  getStaff,
  updateStaffRole,
  removeStaff
} = require('../controllers/restaurantController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Base routes
router.route('/')
  .get(protect, getRestaurants)
  .post(protect, createRestaurant);

router.route('/:id')
  .get(protect, getRestaurant)
  .put(protect, updateRestaurant)
  .delete(protect, deleteRestaurant);

// Logo upload route
router.put('/:id/logo', protect, upload.single('logo'), uploadLogo);

// Staff management routes
router.route('/:id/staff')
  .get(protect, getStaff)
  .post(protect, addStaff);

router.route('/:id/staff/:staffId')
  .put(protect, updateStaffRole)
  .delete(protect, removeStaff);

module.exports = router;
