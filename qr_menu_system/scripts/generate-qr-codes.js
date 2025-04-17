// QR code generation script for demo restaurant
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const { createCanvas } = require('canvas');

// Configuration
const outputDir = path.join(__dirname, '../qr_codes');
const baseUrl = 'https://qrmenu.example.com';

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('Created QR codes directory');
}

// QR code templates
const templates = [
  { name: 'classic', options: { errorCorrectionLevel: 'M', margin: 4, color: { dark: '#000000', light: '#ffffff' } } },
  { name: 'rounded', options: { errorCorrectionLevel: 'M', margin: 4, color: { dark: '#000000', light: '#ffffff' } } },
  { name: 'dots', options: { errorCorrectionLevel: 'M', margin: 4, color: { dark: '#000000', light: '#ffffff' } } },
  { name: 'blue-gradient', options: { errorCorrectionLevel: 'M', margin: 4, color: { dark: '#0062cc', light: '#ffffff' } } },
  { name: 'restaurant-theme', options: { errorCorrectionLevel: 'M', margin: 4, color: { dark: '#8B4513', light: '#FFF8DC' } } },
  { name: 'modern', options: { errorCorrectionLevel: 'H', margin: 4, color: { dark: '#1a1a1a', light: '#ffffff' } } }
];

// Generate QR codes for different purposes
async function generateDemoQRCodes() {
  console.log('Generating QR codes for demo restaurant...');
  
  try {
    // Restaurant main menu QR codes
    await generateRestaurantQRCodes();
    
    // Table QR codes
    await generateTableQRCodes();
    
    // Special QR codes
    await generateSpecialQRCodes();
    
    console.log('QR code generation completed successfully!');
  } catch (error) {
    console.error('Error generating QR codes:', error);
    process.exit(1);
  }
}

// Generate restaurant menu QR codes with different templates
async function generateRestaurantQRCodes() {
  console.log('Generating restaurant menu QR codes...');
  
  const restaurantId = 'demo-restaurant';
  const url = `${baseUrl}/r/${restaurantId}`;
  
  for (const template of templates) {
    const outputPath = path.join(outputDir, `restaurant-menu-${template.name}.png`);
    
    // Apply template-specific styling
    let options = { ...template.options };
    
    if (template.name === 'rounded') {
      // Custom rendering for rounded QR code
      await generateRoundedQRCode(url, outputPath, options);
    } else if (template.name === 'dots') {
      // Custom rendering for dots QR code
      await generateDotsQRCode(url, outputPath, options);
    } else if (template.name === 'blue-gradient') {
      // Custom rendering for gradient QR code
      await generateGradientQRCode(url, outputPath, options);
    } else if (template.name === 'restaurant-theme') {
      // Add restaurant logo to the center
      await generateLogoQRCode(url, outputPath, options, '../frontend/src/assets/images/logo.png');
    } else {
      // Standard QR code generation
      await QRCode.toFile(outputPath, url, options);
    }
    
    console.log(`Generated ${template.name} restaurant menu QR code`);
  }
}

// Generate table-specific QR codes
async function generateTableQRCodes() {
  console.log('Generating table QR codes...');
  
  const restaurantId = 'demo-restaurant';
  const tableCount = 10;
  
  // Use the modern template for table QR codes
  const template = templates.find(t => t.name === 'modern');
  
  for (let tableNumber = 1; tableNumber <= tableCount; tableNumber++) {
    const url = `${baseUrl}/r/${restaurantId}/table/${tableNumber}`;
    const outputPath = path.join(outputDir, `table-${tableNumber}.png`);
    
    // Generate QR code with table number
    await generateTableNumberQRCode(url, outputPath, template.options, tableNumber);
    
    console.log(`Generated QR code for table ${tableNumber}`);
  }
}

// Generate special purpose QR codes
async function generateSpecialQRCodes() {
  console.log('Generating special purpose QR codes...');
  
  const restaurantId = 'demo-restaurant';
  
  // WiFi QR code
  const wifiDetails = {
    ssid: 'GourmetFusion-Guest',
    password: 'guestWiFi2025',
    encryption: 'WPA'
  };
  
  const wifiUrl = `WIFI:S:${wifiDetails.ssid};P:${wifiDetails.password};T:${wifiDetails.encryption};;`;
  const wifiOutputPath = path.join(outputDir, 'wifi.png');
  
  await QRCode.toFile(wifiOutputPath, wifiUrl, {
    errorCorrectionLevel: 'M',
    margin: 4,
    color: { dark: '#4285F4', light: '#ffffff' }
  });
  
  console.log('Generated WiFi QR code');
  
  // Feedback QR code
  const feedbackUrl = `${baseUrl}/r/${restaurantId}/feedback`;
  const feedbackOutputPath = path.join(outputDir, 'feedback.png');
  
  await QRCode.toFile(feedbackOutputPath, feedbackUrl, {
    errorCorrectionLevel: 'M',
    margin: 4,
    color: { dark: '#34A853', light: '#ffffff' }
  });
  
  console.log('Generated feedback QR code');
  
  // Reservation QR code
  const reservationUrl = `${baseUrl}/r/${restaurantId}/reservation`;
  const reservationOutputPath = path.join(outputDir, 'reservation.png');
  
  await QRCode.toFile(reservationOutputPath, reservationUrl, {
    errorCorrectionLevel: 'M',
    margin: 4,
    color: { dark: '#FBBC05', light: '#ffffff' }
  });
  
  console.log('Generated reservation QR code');
  
  // Special promotion QR code
  const promotionUrl = `${baseUrl}/r/${restaurantId}/promotion/weekend-brunch`;
  const promotionOutputPath = path.join(outputDir, 'promotion.png');
  
  await QRCode.toFile(promotionOutputPath, promotionUrl, {
    errorCorrectionLevel: 'M',
    margin: 4,
    color: { dark: '#EA4335', light: '#ffffff' }
  });
  
  console.log('Generated promotion QR code');
}

// Helper function to generate rounded QR code
async function generateRoundedQRCode(text, outputPath, options) {
  const qrData = await QRCode.create(text, { errorCorrectionLevel: options.errorCorrectionLevel });
  const size = qrData.modules.size;
  const data = qrData.modules.data;
  const scale = 10;
  const margin = options.margin * scale;
  const canvasSize = size * scale + 2 * margin;
  
  const canvas = createCanvas(canvasSize, canvasSize);
  const ctx = canvas.getContext('2d');
  
  // Fill background
  ctx.fillStyle = options.color.light;
  ctx.fillRect(0, 0, canvasSize, canvasSize);
  
  // Draw rounded dots
  ctx.fillStyle = options.color.dark;
  const radius = scale / 2;
  
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (data[i * size + j]) {
        ctx.beginPath();
        ctx.arc(
          margin + j * scale + radius,
          margin + i * scale + radius,
          radius,
          0,
          2 * Math.PI
        );
        ctx.fill();
      }
    }
  }
  
  // Save the QR code
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
}

// Helper function to generate dots QR code
async function generateDotsQRCode(text, outputPath, options) {
  const qrData = await QRCode.create(text, { errorCorrectionLevel: options.errorCorrectionLevel });
  const size = qrData.modules.size;
  const data = qrData.modules.data;
  const scale = 10;
  const margin = options.margin * scale;
  const canvasSize = size * scale + 2 * margin;
  
  const canvas = createCanvas(canvasSize, canvasSize);
  const ctx = canvas.getContext('2d');
  
  // Fill background
  ctx.fillStyle = options.color.light;
  ctx.fillRect(0, 0, canvasSize, canvasSize);
  
  // Draw dots with spacing
  ctx.fillStyle = options.color.dark;
  const dotSize = scale * 0.8;
  const offset = (scale - dotSize) / 2;
  
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (data[i * size + j]) {
        ctx.beginPath();
        ctx.arc(
          margin + j * scale + scale / 2,
          margin + i * scale + scale / 2,
          dotSize / 2,
          0,
          2 * Math.PI
        );
        ctx.fill();
      }
    }
  }
  
  // Save the QR code
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
}

// Helper function to generate gradient QR code
async function generateGradientQRCode(text, outputPath, options) {
  const qrData = await QRCode.create(text, { errorCorrectionLevel: options.errorCorrectionLevel });
  const size = qrData.modules.size;
  const data = qrData.modules.data;
  const scale = 10;
  const margin = options.margin * scale;
  const canvasSize = size * scale + 2 * margin;
  
  const canvas = createCanvas(canvasSize, canvasSize);
  const ctx = canvas.getContext('2d');
  
  // Fill background
  ctx.fillStyle = options.color.light;
  ctx.fillRect(0, 0, canvasSize, canvasSize);
  
  // Create gradient
  const gradient = ctx.createLinearGradient(0, 0, canvasSize, canvasSize);
  gradient.addColorStop(0, '#0062cc');
  gradient.addColorStop(1, '#1e90ff');
  
  // Draw QR code with gradient
  ctx.fillStyle = gradient;
  
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (data[i * size + j]) {
        ctx.fillRect(
          margin + j * scale,
          margin + i * scale,
          scale,
          scale
        );
      }
    }
  }
  
  // Save the QR code
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
}

// Helper function to generate QR code with logo
async function generateLogoQRCode(text, outputPath, options, logoPath) {
  const qrData = await QRCode.create(text, { errorCorrectionLevel: 'H' }); // Use high error correction for logo
  const size = qrData.modules.size;
  const data = qrData.modules.data;
  const scale = 10;
  const margin = options.margin * scale;
  const canvasSize = size * scale + 2 * margin;
  
  const canvas = createCanvas(canvasSize, canvasSize);
  const ctx = canvas.getContext('2d');
  
  // Fill background
  ctx.fillStyle = options.color.light;
  ctx.fillRect(0, 0, canvasSize, canvasSize);
  
  // Draw QR code
  ctx.fillStyle = options.color.dark;
  
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (data[i * size + j]) {
        ctx.fillRect(
          margin + j * scale,
          margin + i * scale,
          scale,
          scale
        );
      }
    }
  }
  
  // Add logo placeholder in the center
  const logoSize = size * scale * 0.2; // Logo size is 20% of QR code
  const logoX = (canvasSize - logoSize) / 2;
  const logoY = (canvasSize - logoSize) / 2;
  
  // Clear the center area
  ctx.fillStyle = options.color.light;
  ctx.fillRect(logoX, logoY, logoSize, logoSize);
  
  // Draw logo placeholder
  ctx.fillStyle = '#8B4513';
  ctx.font = `${logoSize * 0.7}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('GF', canvasSize / 2, canvasSize / 2);
  
  // Save the QR code
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
}

// Helper function to generate table number QR code
async function generateTableNumberQRCode(text, outputPath, options, tableNumber) {
  const qrData = await QRCode.create(text, { errorCorrectionLevel: options.errorCorrectionLevel });
  const size = qrData.modules.size;
  const data = qrData.modules.data;
  const scale = 10;
  const margin = options.margin * scale;
  const canvasSize = size * scale + 2 * margin;
  
  const canvas = createCanvas(canvasSize, canvasSize);
  const ctx = canvas.getContext('2d');
  
  // Fill background
  ctx.fillStyle = options.color.light;
  ctx.fillRect(0, 0, canvasSize, canvasSize);
  
  // Draw QR code
  ctx.fillStyle = options.color.dark;
  
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (data[i * size + j]) {
        ctx.fillRect(
          margin + j * scale,
          margin + i * scale,
          scale,
          scale
        );
      }
    }
  }
  
  // Add table number label at the bottom
  const labelHeight = 30;
  const totalHeight = canvasSize + labelHeight;
  
  // Create new canvas with extra space for label
  const labeledCanvas = createCanvas(canvasSize, totalHeight);
  const labeledCtx = labeledCanvas.getContext('2d');
  
  // Copy QR code to new canvas
  labeledCtx.drawImage(canvas, 0, 0);
  
  // Add table number label
  labeledCtx.fillStyle = options.color.dark;
  labeledCtx.font = 'bold 20px Arial';
  labeledCtx.textAlign = 'center';
  labeledCtx.textBaseline = 'middle';
  labeledCtx.fillText(`Table ${tableNumber}`, canvasSize / 2, canvasSize + labelHeight / 2);
  
  // Save the QR code with label
  const buffer = labeledCanvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
}

// Run the QR code generation
generateDemoQRCodes();
