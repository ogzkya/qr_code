const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const menuItemSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4()
  },
  category_id: {
    type: String,
    ref: 'Category',
    required: [true, 'Please add a category ID']
  },
  name: {
    type: String,
    required: [true, 'Please add an item name'],
    trim: true,
    maxlength: [255, 'Name cannot be more than 255 characters']
  },
  slug: {
    type: String,
    required: [true, 'Please add a slug'],
    trim: true,
    maxlength: [255, 'Slug cannot be more than 255 characters']
  },
  description: {
    type: String
  },
  image: {
    type: String,
    default: 'default-item.jpg'
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  discounted_price: {
    type: Number,
    default: null
  },
  currency: {
    type: String,
    default: '$'
  },
  weight: {
    type: Number
  },
  weight_unit: {
    type: String,
    default: 'g'
  },
  preparation_time: {
    type: Number,
    default: null
  },
  is_vegetarian: {
    type: Boolean,
    default: false
  },
  is_vegan: {
    type: Boolean,
    default: false
  },
  is_gluten_free: {
    type: Boolean,
    default: false
  },
  spiciness_level: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  allergens: {
    type: [String],
    default: []
  },
  nutritional_info: {
    type: Object,
    default: null
  },
  ingredients: {
    type: String
  },
  display_order: {
    type: Number,
    default: 0
  },
  is_featured: {
    type: Boolean,
    default: false
  },
  is_available: {
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

// Create item slug from the name
menuItemSchema.pre('save', function(next) {
  if (!this.isModified('name')) {
    next();
    return;
  }
  this.slug = this.name
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
  this.updated_at = Date.now();
  next();
});

// Cascade delete item options when a menu item is deleted
menuItemSchema.pre('remove', async function(next) {
  await this.model('ItemOption').deleteMany({ menu_item_id: this._id });
  next();
});

// Reverse populate with item options
menuItemSchema.virtual('item_options', {
  ref: 'ItemOption',
  localField: '_id',
  foreignField: 'menu_item_id',
  justOne: false
});

// Compound index to ensure unique item names within a category
menuItemSchema.index({ category_id: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
