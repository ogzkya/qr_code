const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const translationSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4()
  },
  language_id: {
    type: String,
    ref: 'Language',
    required: [true, 'Please add a language ID']
  },
  translatable_type: {
    type: String,
    required: [true, 'Please add a translatable type'],
    enum: ['menu_item', 'category', 'menu_section', 'restaurant', 'promotion']
  },
  translatable_id: {
    type: String,
    required: [true, 'Please add a translatable ID']
  },
  field: {
    type: String,
    required: [true, 'Please add a field name'],
    enum: ['name', 'description', 'additional_info', 'ingredients']
  },
  translation: {
    type: String,
    required: [true, 'Please add a translation']
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update the updated_at field before saving
translationSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Compound index to ensure unique translations
translationSchema.index(
  { language_id: 1, translatable_type: 1, translatable_id: 1, field: 1 },
  { unique: true }
);

module.exports = mongoose.model('Translation', translationSchema);
