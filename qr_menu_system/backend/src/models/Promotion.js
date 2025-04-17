const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const promotionSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4()
  },
  restaurant_id: {
    type: String,
    ref: 'Restaurant',
    required: [true, 'Please add a restaurant ID']
  },
  name: {
    type: String,
    required: [true, 'Please add a promotion name'],
    trim: true,
    maxlength: [255, 'Name cannot be more than 255 characters']
  },
  description: {
    type: String
  },
  image: {
    type: String
  },
  discount_type: {
    type: String,
    enum: ['percentage', 'fixed_amount', 'buy_x_get_y'],
    required: [true, 'Please add a discount type']
  },
  discount_value: {
    type: Number,
    required: [true, 'Please add a discount value']
  },
  min_order_amount: {
    type: Number,
    default: 0
  },
  start_date: {
    type: Date,
    required: [true, 'Please add a start date']
  },
  end_date: {
    type: Date,
    required: [true, 'Please add an end date']
  },
  is_active: {
    type: Boolean,
    default: true
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
promotionSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Cascade delete promotion items when a promotion is deleted
promotionSchema.pre('remove', async function(next) {
  await this.model('PromotionItem').deleteMany({ promotion_id: this._id });
  next();
});

// Reverse populate with promotion items
promotionSchema.virtual('promotion_items', {
  ref: 'PromotionItem',
  localField: '_id',
  foreignField: 'promotion_id',
  justOne: false
});

// Indexes for efficient querying
promotionSchema.index({ restaurant_id: 1, is_active: 1 });
promotionSchema.index({ start_date: 1, end_date: 1 });

module.exports = mongoose.model('Promotion', promotionSchema);
