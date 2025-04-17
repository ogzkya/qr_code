const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const reservationSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4()
  },
  restaurant_id: {
    type: String,
    ref: 'Restaurant',
    required: [true, 'Please add a restaurant ID']
  },
  customer_name: {
    type: String,
    required: [true, 'Please add a customer name']
  },
  customer_phone: {
    type: String,
    required: [true, 'Please add a customer phone number']
  },
  customer_email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  party_size: {
    type: Number,
    required: [true, 'Please add a party size'],
    min: [1, 'Party size must be at least 1']
  },
  reservation_date: {
    type: Date,
    required: [true, 'Please add a reservation date']
  },
  reservation_time: {
    type: String,
    required: [true, 'Please add a reservation time']
  },
  special_requests: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
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
reservationSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Indexes for efficient querying
reservationSchema.index({ restaurant_id: 1, reservation_date: 1 });
reservationSchema.index({ status: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
