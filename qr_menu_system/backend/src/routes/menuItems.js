const express = require('express');
const router = express.Router();
const { 
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  uploadImage
} = require('../controllers/menuItemController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
  .post(protect, createMenuItem);

router.route('/:id')
  .get(protect, getMenuItem)
  .put(protect, updateMenuItem)
  .delete(protect, deleteMenuItem);

router.route('/category/:categoryId')
  .get(protect, getMenuItems);

// Image upload route
router.put('/:id/image', protect, upload.single('image'), uploadImage);

module.exports = router;
