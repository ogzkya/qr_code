const express = require('express');
const router = express.Router();
const { 
  getMenuSections,
  getMenuSection,
  createMenuSection,
  updateMenuSection,
  deleteMenuSection
} = require('../controllers/menuSectionController');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, createMenuSection);

router.route('/:id')
  .get(protect, getMenuSection)
  .put(protect, updateMenuSection)
  .delete(protect, deleteMenuSection);

router.route('/restaurant/:restaurantId')
  .get(protect, getMenuSections);

module.exports = router;
