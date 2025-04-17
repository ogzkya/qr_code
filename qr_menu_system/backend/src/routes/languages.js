const express = require('express');
const router = express.Router();
const { 
  getLanguages,
  getLanguage,
  createLanguage,
  updateLanguage,
  deleteLanguage,
  getRestaurantTranslations,
  createTranslation,
  deleteTranslation
} = require('../controllers/languageController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getLanguages);
router.get('/:id', getLanguage);
router.get('/translations/restaurant/:restaurantId', getRestaurantTranslations);

// Protected routes
router.post('/', protect, createLanguage);
router.put('/:id', protect, updateLanguage);
router.delete('/:id', protect, deleteLanguage);

// Translation routes
router.post('/translations', protect, createTranslation);
router.delete('/translations/:id', protect, deleteTranslation);

module.exports = router;
