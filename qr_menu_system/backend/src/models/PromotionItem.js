const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const promotionItemSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4()
  },
  promotion_id: {
    type: String,
    ref: 'Promotion',
    required: [true, 'Please add a promotion ID']
  },
  menu_item_id: {
    type: String,
    ref: 'MenuItem',
    required: [true, 'Please add a menu item ID']
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
promotionItemSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Compound index to ensure a menu item is only added once to a promotion
promotionItemSchema.index({ promotion_id: 1, menu_item_id: 1 }, { unique: true });

module.exports = mongoose.model('PromotionItem', promotionItemSchema);
