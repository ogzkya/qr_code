const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const analyticsSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4()
  },
  restaurant_id: {
    type: String,
    ref: 'Restaurant',
    required: [true, 'Please add a restaurant ID']
  },
  date: {
    type: Date,
    required: [true, 'Please add a date'],
    default: Date.now
  },
  total_scans: {
    type: Number,
    default: 0
  },
  unique_visitors: {
    type: Number,
    default: 0
  },
  average_session_duration: {
    type: Number,
    default: 0
  },
  most_viewed_category_id: {
    type: String,
    ref: 'Category',
    default: null
  },
  most_viewed_item_id: {
    type: String,
    ref: 'MenuItem',
    default: null
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
analyticsSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Compound index for efficient querying
analyticsSchema.index({ restaurant_id: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Analytics', analyticsSchema);
