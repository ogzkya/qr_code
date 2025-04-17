const express = require('express');
const router = express.Router();
const { 
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadImage
} = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
  .post(protect, createCategory);

router.route('/:id')
  .get(protect, getCategory)
  .put(protect, updateCategory)
  .delete(protect, deleteCategory);

router.route('/menu-section/:menuSectionId')
  .get(protect, getCategories);

// Image upload route
router.put('/:id/image', protect, upload.single('image'), uploadImage);

module.exports = router;
