const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const categorySchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4()
  },
  menu_section_id: {
    type: String,
    ref: 'MenuSection',
    required: [true, 'Please add a menu section ID']
  },
  name: {
    type: String,
    required: [true, 'Please add a category name'],
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
    default: 'default-category.jpg'
  },
  display_order: {
    type: Number,
    default: 0
  },
  availability_hours: {
    type: Object,
    default: null
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

// Create category slug from the name
categorySchema.pre('save', function(next) {
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

// Cascade delete menu items when a category is deleted
categorySchema.pre('remove', async function(next) {
  await this.model('MenuItem').deleteMany({ category_id: this._id });
  next();
});

// Reverse populate with menu items
categorySchema.virtual('menu_items', {
  ref: 'MenuItem',
  localField: '_id',
  foreignField: 'category_id',
  justOne: false
});

// Compound index to ensure unique category names within a menu section
categorySchema.index({ menu_section_id: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
