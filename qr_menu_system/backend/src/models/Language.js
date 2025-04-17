const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const languageSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4()
  },
  code: {
    type: String,
    required: [true, 'Please add a language code'],
    unique: true,
    trim: true,
    maxlength: [10, 'Code cannot be more than 10 characters']
  },
  name: {
    type: String,
    required: [true, 'Please add a language name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  is_active: {
    type: Boolean,
    default: true
  },
  is_default: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Update the updated_at field before saving
languageSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Reverse populate with translations
languageSchema.virtual('translations', {
  ref: 'Translation',
  localField: '_id',
  foreignField: 'language_id',
  justOne: false
});

module.exports = mongoose.model('Language', languageSchema);
