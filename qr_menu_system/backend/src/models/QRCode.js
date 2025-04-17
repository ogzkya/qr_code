const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const qrCodeSchema = new mongoose.Schema({
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
    required: [true, 'Please add a QR code name'],
    trim: true,
    maxlength: [255, 'Name cannot be more than 255 characters']
  },
  type: {
    type: String,
    enum: ['table', 'section', 'category', 'promotional'],
    default: 'table'
  },
  target_id: {
    type: String,
    default: null
  },
  image_path: {
    type: String
  },
  custom_design: {
    type: Object,
    default: {
      foreground: '#000000',
      background: '#FFFFFF',
      logo: null,
      shape: 'square',
      errorCorrectionLevel: 'M'
    }
  },
  short_url: {
    type: String,
    unique: true
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
qrCodeSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Reverse populate with QR code scans
qrCodeSchema.virtual('scans', {
  ref: 'QRCodeScan',
  localField: '_id',
  foreignField: 'qr_code_id',
  justOne: false
});

// Compound index to ensure unique QR code names within a restaurant
qrCodeSchema.index({ restaurant_id: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('QRCode', qrCodeSchema);
