const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const restaurantAdminSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4()
  },
  restaurant_id: {
    type: String,
    ref: 'Restaurant',
    required: [true, 'Please add a restaurant ID']
  },
  user_id: {
    type: String,
    ref: 'User',
    required: [true, 'Please add a user ID']
  },
  role: {
    type: String,
    enum: ['owner', 'manager', 'staff'],
    default: 'staff'
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
restaurantAdminSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Compound index to ensure a user can only have one role per restaurant
restaurantAdminSchema.index({ restaurant_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model('RestaurantAdmin', restaurantAdminSchema);
