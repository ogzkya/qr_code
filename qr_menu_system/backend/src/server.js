const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const config = require('./config/config');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Body parser middleware
app.use(express.json());

// Enable CORS
app.use(cors());

// Set static folder for file uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Connect to MongoDB
mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Define routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/menu-sections', require('./routes/menuSections'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/menu-items', require('./routes/menuItems'));
app.use('/api/qr-codes', require('./routes/qrCodes'));
app.use('/api/qr-templates', require('./routes/qrTemplates'));
app.use('/api/qr-analytics', require('./routes/qrAnalytics'));
app.use('/api/languages', require('./routes/languages'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/promotions', require('./routes/promotions'));
// app.use('/api/analytics', require('./routes/analytics'));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to QR Menu System API' });
});

// Start server
const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`Server running in ${config.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1));
});

module.exports = app;
