const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const itemOptionSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4()
  },
  menu_item_id: {
    type: String,
    ref: 'MenuItem',
    required: [true, 'Please add a menu item ID']
  },
  name: {
    type: String,
    required: [true, 'Please add an option name'],
    trim: true,
    maxlength: [255, 'Name cannot be more than 255 characters']
  },
  description: {
    type: String
  },
  min_selections: {
    type: Number,
    default: 0
  },
  max_selections: {
    type: Number,
    default: 1
  },
  is_required: {
    type: Boolean,
    default: false
  },
  display_order: {
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
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Update the updated_at field before saving
itemOptionSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Cascade delete option choices when an item option is deleted
itemOptionSchema.pre('remove', async function(next) {
  await this.model('OptionChoice').deleteMany({ item_option_id: this._id });
  next();
});

// Reverse populate with option choices
itemOptionSchema.virtual('option_choices', {
  ref: 'OptionChoice',
  localField: '_id',
  foreignField: 'item_option_id',
  justOne: false
});

// Compound index to ensure unique option names within a menu item
itemOptionSchema.index({ menu_item_id: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('ItemOption', itemOptionSchema);
