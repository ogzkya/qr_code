const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const restaurantSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4()
  },
  name: {
    type: String,
    required: [true, 'Please add a restaurant name'],
    trim: true,
    maxlength: [255, 'Name cannot be more than 255 characters']
  },
  slug: {
    type: String,
    required: [true, 'Please add a slug'],
    unique: true,
    trim: true,
    maxlength: [255, 'Slug cannot be more than 255 characters']
  },
  logo: {
    type: String,
    default: 'default-logo.png'
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  phone: {
    type: String,
    maxlength: [50, 'Phone number cannot be more than 50 characters']
  },
  email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  website: {
    type: String
  },
  wifi_password: {
    type: String
  },
  additional_info: {
    type: String
  },
  working_hours: {
    type: Object,
    default: {
      monday: { open: '09:00', close: '22:00', closed: false },
      tuesday: { open: '09:00', close: '22:00', closed: false },
      wednesday: { open: '09:00', close: '22:00', closed: false },
      thursday: { open: '09:00', close: '22:00', closed: false },
      friday: { open: '09:00', close: '23:00', closed: false },
      saturday: { open: '10:00', close: '23:00', closed: false },
      sunday: { open: '10:00', close: '22:00', closed: false }
    }
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

// Create restaurant slug from the name
restaurantSchema.pre('save', function(next) {
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

// Cascade delete menu sections when a restaurant is deleted
restaurantSchema.pre('remove', async function(next) {
  await this.model('MenuSection').deleteMany({ restaurant_id: this._id });
  next();
});

// Reverse populate with menu sections
restaurantSchema.virtual('menu_sections', {
  ref: 'MenuSection',
  localField: '_id',
  foreignField: 'restaurant_id',
  justOne: false
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
