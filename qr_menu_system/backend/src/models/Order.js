const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const orderSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4()
  },
  restaurant_id: {
    type: String,
    ref: 'Restaurant',
    required: [true, 'Please add a restaurant ID']
  },
  table_number: {
    type: String
  },
  customer_name: {
    type: String
  },
  customer_phone: {
    type: String
  },
  customer_email: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'pending'
  },
  total_amount: {
    type: Number,
    required: [true, 'Please add a total amount']
  },
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  payment_method: {
    type: String
  },
  notes: {
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
orderSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Cascade delete order items when an order is deleted
orderSchema.pre('remove', async function(next) {
  await this.model('OrderItem').deleteMany({ order_id: this._id });
  next();
});

// Reverse populate with order items
orderSchema.virtual('order_items', {
  ref: 'OrderItem',
  localField: '_id',
  foreignField: 'order_id',
  justOne: false
});

// Indexes for efficient querying
orderSchema.index({ restaurant_id: 1, created_at: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
