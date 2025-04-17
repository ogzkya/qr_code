const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const orderItemSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4()
  },
  order_id: {
    type: String,
    ref: 'Order',
    required: [true, 'Please add an order ID']
  },
  menu_item_id: {
    type: String,
    ref: 'MenuItem',
    required: [true, 'Please add a menu item ID']
  },
  quantity: {
    type: Number,
    required: [true, 'Please add a quantity'],
    min: [1, 'Quantity must be at least 1']
  },
  unit_price: {
    type: Number,
    required: [true, 'Please add a unit price']
  },
  total_price: {
    type: Number,
    required: [true, 'Please add a total price']
  },
  special_instructions: {
    type: String
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
orderItemSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Cascade delete order item options when an order item is deleted
orderItemSchema.pre('remove', async function(next) {
  await this.model('OrderItemOption').deleteMany({ order_item_id: this._id });
  next();
});

// Reverse populate with order item options
orderItemSchema.virtual('order_item_options', {
  ref: 'OrderItemOption',
  localField: '_id',
  foreignField: 'order_item_id',
  justOne: false
});

// Index for efficient querying
orderItemSchema.index({ order_id: 1 });

module.exports = mongoose.model('OrderItem', orderItemSchema);
