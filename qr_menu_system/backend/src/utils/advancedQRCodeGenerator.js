// Enhanced QR Code Customization Utility
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

/**
 * Advanced QR Code Generator with extensive customization options
 */
class AdvancedQRCodeGenerator {
  constructor() {
    this.defaultOptions = {
      errorCorrectionLevel: 'M',
      margin: 4,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      shape: 'square',
      style: 'default',
      logoSize: 0.2, // 20% of QR code size
      dotScale: 1,
      cornerRadius: 0,
      gradientColors: null
    };
  }

  /**
   * Generate a QR code with advanced customization options
   * @param {string} data - The data to encode in the QR code
   * @param {string} outputPath - The path to save the QR code image
   * @param {Object} options - Customization options
   * @returns {Promise<string>} - Path to the generated QR code
   */
  async generateQRCode(data, outputPath, options = {}) {
    // Merge default options with provided options
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    try {
      // Basic QR code generation
      if (mergedOptions.style === 'default') {
        await QRCode.toFile(outputPath, data, {
          errorCorrectionLevel: mergedOptions.errorCorrectionLevel,
          margin: mergedOptions.margin,
          color: mergedOptions.color
        });
        
        // Add logo if provided
        if (options.logoPath) {
          await this.addLogoToQRCode(outputPath, options.logoPath, mergedOptions.logoSize);
        }
        
        return outputPath;
      }
      
      // Advanced styling
      const qrCodeData = await QRCode.create(data, {
        errorCorrectionLevel: mergedOptions.errorCorrectionLevel
      });
      
      // Create canvas for custom rendering
      const size = qrCodeData.modules.size;
      const scale = 10; // Scale factor for better quality
      const canvasSize = size * scale + (mergedOptions.margin * 2 * scale);
      const canvas = createCanvas(canvasSize, canvasSize);
      const ctx = canvas.getContext('2d');
      
      // Fill background
      ctx.fillStyle = mergedOptions.color.light;
      ctx.fillRect(0, 0, canvasSize, canvasSize);
      
      // Draw QR code with custom styling
      await this.drawCustomStyledQRCode(ctx, qrCodeData, mergedOptions, scale);
      
      // Add logo if provided
      if (options.logoPath) {
        await this.addLogoToCanvas(ctx, options.logoPath, canvasSize, mergedOptions.logoSize);
      }
      
      // Save to file
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(outputPath, buffer);
      
      return outputPath;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }
  
  /**
   * Draw QR code with custom styling on canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {Object} qrCodeData - QR code data
   * @param {Object} options - Styling options
   * @param {number} scale - Scale factor
   */
  async drawCustomStyledQRCode(ctx, qrCodeData, options, scale) {
    const size = qrCodeData.modules.size;
    const margin = options.margin * scale;
    const dotSize = scale * options.dotScale;
    
    // Setup gradient if specified
    let fillStyle = options.color.dark;
    if (options.gradientColors) {
      const gradient = ctx.createLinearGradient(margin, margin, margin + size * scale, margin + size * scale);
      gradient.addColorStop(0, options.gradientColors[0]);
      gradient.addColorStop(1, options.gradientColors[1]);
      fillStyle = gradient;
    }
    
    // Draw each module (dot)
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (qrCodeData.modules.data[row * size + col]) {
          ctx.fillStyle = fillStyle;
          
          const x = Math.round(col * scale + margin);
          const y = Math.round(row * scale + margin);
          
          // Different shape styles
          if (options.shape === 'rounded') {
            this.drawRoundedRect(ctx, x, y, dotSize, dotSize, options.cornerRadius || dotSize / 4);
          } else if (options.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(x + dotSize/2, y + dotSize/2, dotSize/2, 0, 2 * Math.PI);
            ctx.fill();
          } else if (options.shape === 'diamond') {
            ctx.beginPath();
            ctx.moveTo(x + dotSize/2, y);
            ctx.lineTo(x + dotSize, y + dotSize/2);
            ctx.lineTo(x + dotSize/2, y + dotSize);
            ctx.lineTo(x, y + dotSize/2);
            ctx.closePath();
            ctx.fill();
          } else {
            // Default square
            ctx.fillRect(x, y, dotSize, dotSize);
          }
        }
      }
    }
    
    // Special handling for finder patterns (the three large squares in corners)
    this.enhanceFinderPatterns(ctx, qrCodeData, options, scale);
  }
  
  /**
   * Draw rounded rectangle
   */
  drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }
  
  /**
   * Enhance the finder patterns (corner squares) with special styling
   */
  enhanceFinderPatterns(ctx, qrCodeData, options, scale) {
    const size = qrCodeData.modules.size;
    const margin = options.margin * scale;
    const finderPatternSize = 7 * scale;
    
    // Positions of the three finder patterns
    const positions = [
      { x: 0, y: 0 }, // Top-left
      { x: size - 7, y: 0 }, // Top-right
      { x: 0, y: size - 7 }  // Bottom-left
    ];
    
    // Draw custom finder patterns
    for (const pos of positions) {
      const x = pos.x * scale + margin;
      const y = pos.y * scale + margin;
      
      // Outer square
      ctx.fillStyle = options.color.dark;
      if (options.shape === 'rounded') {
        this.drawRoundedRect(ctx, x, y, finderPatternSize, finderPatternSize, scale);
      } else {
        ctx.fillRect(x, y, finderPatternSize, finderPatternSize);
      }
      
      // Inner white square
      ctx.fillStyle = options.color.light;
      if (options.shape === 'rounded') {
        this.drawRoundedRect(ctx, x + scale, y + scale, finderPatternSize - 2 * scale, finderPatternSize - 2 * scale, scale / 2);
      } else {
        ctx.fillRect(x + scale, y + scale, finderPatternSize - 2 * scale, finderPatternSize - 2 * scale);
      }
      
      // Center dot
      ctx.fillStyle = options.color.dark;
      if (options.shape === 'rounded' || options.shape === 'circle') {
        this.drawRoundedRect(ctx, x + 2 * scale, y + 2 * scale, finderPatternSize - 4 * scale, finderPatternSize - 4 * scale, scale / 2);
      } else {
        ctx.fillRect(x + 2 * scale, y + 2 * scale, finderPatternSize - 4 * scale, finderPatternSize - 4 * scale);
      }
    }
  }
  
  /**
   * Add logo to an existing QR code image
   * @param {string} qrCodePath - Path to the QR code image
   * @param {string} logoPath - Path to the logo image
   * @param {number} logoSizeRatio - Logo size as a ratio of QR code size
   * @returns {Promise<void>}
   */
  async addLogoToQRCode(qrCodePath, logoPath, logoSizeRatio = 0.2) {
    try {
      // Load QR code image
      const qrCodeImage = await loadImage(qrCodePath);
      const canvas = createCanvas(qrCodeImage.width, qrCodeImage.height);
      const ctx = canvas.getContext('2d');
      
      // Draw QR code
      ctx.drawImage(qrCodeImage, 0, 0);
      
      // Add logo
      await this.addLogoToCanvas(ctx, logoPath, qrCodeImage.width, logoSizeRatio);
      
      // Save to file
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(qrCodePath, buffer);
    } catch (error) {
      console.error('Error adding logo to QR code:', error);
      throw error;
    }
  }
  
  /**
   * Add logo to canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {string} logoPath - Path to the logo image
   * @param {number} canvasSize - Size of the canvas
   * @param {number} logoSizeRatio - Logo size as a ratio of canvas size
   * @returns {Promise<void>}
   */
  async addLogoToCanvas(ctx, logoPath, canvasSize, logoSizeRatio = 0.2) {
    try {
      // Load logo image
      const logoImage = await loadImage(logoPath);
      
      // Calculate logo size and position
      const logoSize = canvasSize * logoSizeRatio;
      const logoX = (canvasSize - logoSize) / 2;
      const logoY = (canvasSize - logoSize) / 2;
      
      // Create circular clipping path for logo (optional)
      ctx.save();
      ctx.beginPath();
      ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.clip();
      
      // Draw logo
      ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
      
      // Add white border around logo
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = logoSize * 0.05;
      ctx.stroke();
      
      ctx.restore();
    } catch (error) {
      console.error('Error adding logo to canvas:', error);
      throw error;
    }
  }
  
  /**
   * Generate a batch of QR codes for tables
   * @param {string} baseUrl - Base URL for the QR codes
   * @param {string} restaurantId - Restaurant ID
   * @param {number} startNumber - Starting table number
   * @param {number} endNumber - Ending table number
   * @param {string} outputDir - Directory to save the QR codes
   * @param {Object} options - Customization options
   * @returns {Promise<Array<string>>} - Paths to the generated QR codes
   */
  async generateTableQRCodes(baseUrl, restaurantId, startNumber, endNumber, outputDir, options = {}) {
    const qrCodePaths = [];
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Generate QR code for each table
    for (let tableNumber = startNumber; tableNumber <= endNumber; tableNumber++) {
      const tableUrl = `${baseUrl}/r/${restaurantId}?table=${tableNumber}`;
      const outputPath = path.join(outputDir, `table-${tableNumber}.png`);
      
      await this.generateQRCode(tableUrl, outputPath, options);
      qrCodePaths.push(outputPath);
    }
    
    return qrCodePaths;
  }
  
  /**
   * Get available QR code templates
   * @returns {Array<Object>} - List of available templates
   */
  getAvailableTemplates() {
    return [
      {
        id: 'classic',
        name: 'Classic',
        description: 'Standard black and white QR code',
        options: {
          style: 'default',
          shape: 'square',
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        }
      },
      {
        id: 'rounded',
        name: 'Rounded',
        description: 'QR code with rounded dots',
        options: {
          style: 'custom',
          shape: 'rounded',
          cornerRadius: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        }
      },
      {
        id: 'dots',
        name: 'Dots',
        description: 'QR code with circular dots',
        options: {
          style: 'custom',
          shape: 'circle',
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        }
      },
      {
        id: 'blue-gradient',
        name: 'Blue Gradient',
        description: 'QR code with blue gradient',
        options: {
          style: 'custom',
          shape: 'square',
          gradientColors: ['#0088cc', '#005577']
        }
      },
      {
        id: 'restaurant',
        name: 'Restaurant Theme',
        description: 'QR code with restaurant-themed colors',
        options: {
          style: 'custom',
          shape: 'rounded',
          cornerRadius: 2,
          color: {
            dark: '#8B4513',
            light: '#FFF8DC'
          }
        }
      },
      {
        id: 'modern',
        name: 'Modern',
        description: 'Modern QR code with diamond dots',
        options: {
          style: 'custom',
          shape: 'diamond',
          color: {
            dark: '#333333',
            light: '#FFFFFF'
          }
        }
      }
    ];
  }
}

module.exports = AdvancedQRCodeGenerator;
