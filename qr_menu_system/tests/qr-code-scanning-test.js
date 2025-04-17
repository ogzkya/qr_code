// Test script for QR code scanning in various conditions
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const { createCanvas } = require('canvas');

// Create test results directory if it doesn't exist
const resultsDir = path.join(__dirname, 'results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// Create test QR codes directory if it doesn't exist
const qrCodesDir = path.join(__dirname, 'test-qr-codes');
if (!fs.existsSync(qrCodesDir)) {
  fs.mkdirSync(qrCodesDir, { recursive: true });
}

// Test scenarios for QR code generation
const testScenarios = [
  { name: 'standard', options: { errorCorrectionLevel: 'M' } },
  { name: 'low-error-correction', options: { errorCorrectionLevel: 'L' } },
  { name: 'high-error-correction', options: { errorCorrectionLevel: 'H' } },
  { name: 'small-size', options: { errorCorrectionLevel: 'M', scale: 2 } },
  { name: 'large-size', options: { errorCorrectionLevel: 'M', scale: 10 } },
  { name: 'custom-colors', options: { errorCorrectionLevel: 'M', color: { dark: '#0000FF', light: '#FFFF00' } } },
  { name: 'inverted-colors', options: { errorCorrectionLevel: 'M', color: { dark: '#FFFFFF', light: '#000000' } } },
  { name: 'low-contrast', options: { errorCorrectionLevel: 'M', color: { dark: '#666666', light: '#999999' } } }
];

// Simulated conditions to test QR code readability
const simulatedConditions = [
  { name: 'normal', transform: (canvas) => canvas }, // No transformation
  { name: 'blur', transform: (canvas) => applyBlur(canvas, 1.5) },
  { name: 'noise', transform: (canvas) => applyNoise(canvas, 0.1) },
  { name: 'low-light', transform: (canvas) => adjustBrightness(canvas, -0.3) },
  { name: 'high-light', transform: (canvas) => adjustBrightness(canvas, 0.3) },
  { name: 'rotation-15', transform: (canvas) => rotateCanvas(canvas, 15) },
  { name: 'rotation-30', transform: (canvas) => rotateCanvas(canvas, 30) },
  { name: 'partial-obstruction', transform: (canvas) => applyPartialObstruction(canvas, 0.1) }
];

// Run tests
async function runQRCodeScanningTests() {
  console.log('Starting QR code scanning tests...');
  
  // Generate test QR codes
  await generateTestQRCodes();
  
  // Test QR code scanning
  await testQRCodeScanning();
  
  console.log('QR code scanning tests completed');
}

// Generate test QR codes for different scenarios
async function generateTestQRCodes() {
  console.log('Generating test QR codes...');
  
  const testUrl = 'https://qrmenu.example.com/r/test-restaurant';
  
  for (const scenario of testScenarios) {
    console.log(`  - Generating ${scenario.name} QR code`);
    
    const outputPath = path.join(qrCodesDir, `qr-${scenario.name}.png`);
    
    try {
      await QRCode.toFile(outputPath, testUrl, scenario.options);
      console.log(`    ✓ Saved to ${outputPath}`);
    } catch (error) {
      console.error(`    ✗ Error generating QR code:`, error.message);
    }
  }
  
  // Apply simulated conditions to each QR code
  for (const scenario of testScenarios) {
    const originalPath = path.join(qrCodesDir, `qr-${scenario.name}.png`);
    
    if (!fs.existsSync(originalPath)) {
      continue;
    }
    
    for (const condition of simulatedConditions) {
      if (condition.name === 'normal') continue; // Skip normal condition as we already have the original
      
      console.log(`  - Applying ${condition.name} condition to ${scenario.name} QR code`);
      
      const outputPath = path.join(qrCodesDir, `qr-${scenario.name}-${condition.name}.png`);
      
      try {
        // Load the original QR code
        const canvas = createCanvas(200, 200);
        const ctx = canvas.getContext('2d');
        const img = await loadImage(originalPath);
        
        // Draw the original image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Apply the transformation
        const transformedCanvas = condition.transform(canvas);
        
        // Save the transformed image
        const buffer = transformedCanvas.toBuffer('image/png');
        fs.writeFileSync(outputPath, buffer);
        
        console.log(`    ✓ Saved to ${outputPath}`);
      } catch (error) {
        console.error(`    ✗ Error applying condition:`, error.message);
      }
    }
  }
}

// Test QR code scanning with a QR code reader
async function testQRCodeScanning() {
  console.log('Testing QR code scanning...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    // Use a web-based QR code reader for testing
    // Note: In a real-world scenario, you would test with actual mobile devices
    const page = await browser.newPage();
    
    // Results to track scanning success
    const scanResults = [];
    
    // Test each QR code
    const qrCodeFiles = fs.readdirSync(qrCodesDir).filter(file => file.endsWith('.png'));
    
    for (const qrCodeFile of qrCodeFiles) {
      console.log(`  - Testing scanning of ${qrCodeFile}`);
      
      const qrCodePath = path.join(qrCodesDir, qrCodeFile);
      
      try {
        // Navigate to a web-based QR code reader
        await page.goto('https://webqr.com/', { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Upload the QR code image
        const inputElement = await page.$('input[type=file]');
        await inputElement.uploadFile(qrCodePath);
        
        // Wait for the result
        await page.waitForSelector('#qrcode', { timeout: 5000 });
        
        // Check if scanning was successful
        const scanResult = await page.evaluate(() => {
          const resultElement = document.getElementById('qrcode');
          return resultElement ? resultElement.textContent.trim() : '';
        });
        
        const success = scanResult.includes('qrmenu.example.com');
        
        scanResults.push({
          qrCode: qrCodeFile,
          success,
          result: scanResult
        });
        
        if (success) {
          console.log(`    ✓ Successfully scanned`);
        } else {
          console.log(`    ✗ Failed to scan correctly`);
        }
      } catch (error) {
        console.error(`    ✗ Error testing QR code:`, error.message);
        
        scanResults.push({
          qrCode: qrCodeFile,
          success: false,
          error: error.message
        });
      }
    }
    
    // Save scan results
    const resultsPath = path.join(resultsDir, 'qr-code-scanning-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(scanResults, null, 2));
    
    console.log(`  ✓ Results saved to ${resultsPath}`);
    
    // Calculate success rate
    const successCount = scanResults.filter(result => result.success).length;
    const totalCount = scanResults.length;
    const successRate = (successCount / totalCount) * 100;
    
    console.log(`  QR code scanning success rate: ${successRate.toFixed(2)}% (${successCount}/${totalCount})`);
    
    // Analyze results by scenario and condition
    const scenarioResults = {};
    const conditionResults = {};
    
    for (const result of scanResults) {
      const parts = result.qrCode.replace('.png', '').split('-');
      
      if (parts.length >= 2) {
        const scenario = parts[1];
        
        if (!scenarioResults[scenario]) {
          scenarioResults[scenario] = { success: 0, total: 0 };
        }
        
        scenarioResults[scenario].total++;
        if (result.success) {
          scenarioResults[scenario].success++;
        }
        
        if (parts.length >= 3) {
          const condition = parts.slice(2).join('-');
          
          if (!conditionResults[condition]) {
            conditionResults[condition] = { success: 0, total: 0 };
          }
          
          conditionResults[condition].total++;
          if (result.success) {
            conditionResults[condition].success++;
          }
        }
      }
    }
    
    console.log('  Results by QR code type:');
    for (const [scenario, results] of Object.entries(scenarioResults)) {
      const rate = (results.success / results.total) * 100;
      console.log(`    - ${scenario}: ${rate.toFixed(2)}% (${results.success}/${results.total})`);
    }
    
    console.log('  Results by condition:');
    for (const [condition, results] of Object.entries(conditionResults)) {
      const rate = (results.success / results.total) * 100;
      console.log(`    - ${condition}: ${rate.toFixed(2)}% (${results.success}/${results.total})`);
    }
  } finally {
    await browser.close();
  }
}

// Helper function to load an image into a canvas
async function loadImage(src) {
  const { loadImage } = require('canvas');
  return await loadImage(src);
}

// Apply blur effect to canvas
function applyBlur(canvas, radius) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  
  // Simple box blur implementation
  const width = canvas.width;
  const height = canvas.height;
  const blurredData = new Uint8ClampedArray(pixels.length);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      let count = 0;
      
      for (let ky = -radius; ky <= radius; ky++) {
        for (let kx = -radius; kx <= radius; kx++) {
          const px = x + kx;
          const py = y + ky;
          
          if (px >= 0 && px < width && py >= 0 && py < height) {
            const i = (py * width + px) * 4;
            r += pixels[i];
            g += pixels[i + 1];
            b += pixels[i + 2];
            a += pixels[i + 3];
            count++;
          }
        }
      }
      
      const i = (y * width + x) * 4;
      blurredData[i] = r / count;
      blurredData[i + 1] = g / count;
      blurredData[i + 2] = b / count;
      blurredData[i + 3] = a / count;
    }
  }
  
  // Create a new canvas with the blurred data
  const blurredCanvas = createCanvas(canvas.width, canvas.height);
  const blurredCtx = blurredCanvas.getContext('2d');
  const blurredImageData = blurredCtx.createImageData(width, height);
  blurredImageData.data.set(blurredData);
  blurredCtx.putImageData(blurredImageData, 0, 0);
  
  return blurredCanvas;
}

// Apply noise to canvas
function applyNoise(canvas, amount) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  
  for (let i = 0; i < pixels.length; i += 4) {
    const noise = Math.random() * 2 - 1; // Random value between -1 and 1
    
    pixels[i] = Math.min(255, Math.max(0, pixels[i] + noise * amount * 255));
    pixels[i + 1] = Math.min(255, Math.max(0, pixels[i + 1] + noise * amount * 255));
    pixels[i + 2] = Math.min(255, Math.max(0, pixels[i + 2] + noise * amount * 255));
  }
  
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

// Adjust brightness of canvas
function adjustBrightness(canvas, adjustment) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = Math.min(255, Math.max(0, pixels[i] + adjustment * 255));
    pixels[i + 1] = Math.min(255, Math.max(0, pixels[i + 1] + adjustment * 255));
    pixels[i + 2] = Math.min(255, Math.max(0, pixels[i + 2] + adjustment * 255));
  }
  
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

// Rotate canvas
function rotateCanvas(canvas, degrees) {
  const rotatedCanvas = createCanvas(canvas.width, canvas.height);
  const ctx = rotatedCanvas.getContext('2d');
  
  // Translate to center of canvas
  ctx.translate(canvas.width / 2, canvas.height / 2);
  
  // Rotate
  ctx.rotate(degrees * Math.PI / 180);
  
  // Draw the original canvas, centered
  ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
  
  return rotatedCanvas;
}

// Apply partial obstruction to canvas
function applyPartialObstruction(canvas, coverage) {
  const ctx = canvas.getContext('2d');
  
  // Draw a rectangle over part of the QR code
  ctx.fillStyle = 'white';
  
  // Obstruct a corner
  const size = canvas.width * coverage;
  ctx.fillRect(0, 0, size, size);
  
  return canvas;
}

// Export the test function
module.exports = { runQRCodeScanningTests };

// Run the tests if this file is executed directly
if (require.main === module) {
  runQRCodeScanningTests().catch(console.error);
}
