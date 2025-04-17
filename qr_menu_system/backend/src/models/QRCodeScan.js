const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const qrCodeScanSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4()
  },
  qr_code_id: {
    type: String,
    ref: 'QRCode',
    required: [true, 'Please add a QR code ID']
  },
  session_id: {
    type: String,
    required: [true, 'Please add a session ID']
  },
  ip_address: {
    type: String
  },
  user_agent: {
    type: String
  },
  device_type: {
    type: String
  },
  referrer: {
    type: String
  },
  scanned_at: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying of scans by QR code and date
qrCodeScanSchema.index({ qr_code_id: 1, scanned_at: -1 });

module.exports = mongoose.model('QRCodeScan', qrCodeScanSchema);
