const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const optionChoiceSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4()
  },
  item_option_id: {
    type: String,
    ref: 'ItemOption',
    required: [true, 'Please add an item option ID']
  },
  name: {
    type: String,
    required: [true, 'Please add a choice name'],
    trim: true,
    maxlength: [255, 'Name cannot be more than 255 characters']
  },
  description: {
    type: String
  },
  price_adjustment: {
    type: Number,
    default: 0
  },
  display_order: {
    type: Number,
    default: 0
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
});

// Update the updated_at field before saving
optionChoiceSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Compound index to ensure unique choice names within an item option
optionChoiceSchema.index({ item_option_id: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('OptionChoice', optionChoiceSchema);
