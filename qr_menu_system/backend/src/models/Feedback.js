const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const feedbackSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4()
  },
  restaurant_id: {
    type: String,
    ref: 'Restaurant',
    required: [true, 'Please add a restaurant ID']
  },
  menu_item_id: {
    type: String,
    ref: 'MenuItem',
    default: null
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating'],
    min: 1,
    max: 5
  },
  comment: {
    type: String
  },
  customer_name: {
    type: String
  },
  customer_email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  is_published: {
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
});

// Update the updated_at field before saving
feedbackSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Indexes for efficient querying
feedbackSchema.index({ restaurant_id: 1, created_at: -1 });
feedbackSchema.index({ menu_item_id: 1, rating: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
