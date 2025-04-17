require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/qr_menu_system',
  JWT_SECRET: process.env.JWT_SECRET || 'qr_menu_secret_key',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  FILE_UPLOAD_PATH: process.env.FILE_UPLOAD_PATH || 'uploads',
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 1024 * 1024 * 5, // 5MB
  NODE_ENV: process.env.NODE_ENV || 'development'
};
