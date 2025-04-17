const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const orderItemOptionSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4()
  },
  order_item_id: {
    type: String,
    ref: 'OrderItem',
    required: [true, 'Please add an order item ID']
  },
  option_choice_id: {
    type: String,
    ref: 'OptionChoice',
    required: [true, 'Please add an option choice ID']
  },
  price_adjustment: {
    type: Number,
    default: 0
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
orderItemOptionSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Index for efficient querying
orderItemOptionSchema.index({ order_item_id: 1 });

module.exports = mongoose.model('OrderItemOption', orderItemOptionSchema);
