const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4()
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password_hash: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  first_name: {
    type: String,
    required: [true, 'Please add a first name']
  },
  last_name: {
    type: String,
    required: [true, 'Please add a last name']
  },
  phone: {
    type: String,
    maxlength: [50, 'Phone number cannot be more than 50 characters']
  },
  is_active: {
    type: Boolean,
    default: true
  },
  last_login: {
    type: Date
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
userSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
