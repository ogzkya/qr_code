const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const menuSectionSchema = new mongoose.Schema({
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
    required: [true, 'Please add a section name'],
    trim: true,
    maxlength: [255, 'Name cannot be more than 255 characters']
  },
  slug: {
    type: String,
    required: [true, 'Please add a slug'],
    trim: true,
    maxlength: [255, 'Slug cannot be more than 255 characters']
  },
  display_order: {
    type: Number,
    default: 0
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

// Create section slug from the name
menuSectionSchema.pre('save', function(next) {
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

// Cascade delete categories when a section is deleted
menuSectionSchema.pre('remove', async function(next) {
  await this.model('Category').deleteMany({ menu_section_id: this._id });
  next();
});

// Reverse populate with categories
menuSectionSchema.virtual('categories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'menu_section_id',
  justOne: false
});

// Compound index to ensure unique section names within a restaurant
menuSectionSchema.index({ restaurant_id: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model('MenuSection', menuSectionSchema);
