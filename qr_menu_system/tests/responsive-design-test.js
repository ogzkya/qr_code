// Test script for responsive design testing
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Device configurations to test
const devices = [
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1366, height: 768 },
  { name: 'Large Desktop', width: 1920, height: 1080 }
];

// Pages to test
const pages = [
  { name: 'Home', path: '/' },
  { name: 'Menu', path: '/menu' },
  { name: 'Menu Item', path: '/menu-item/1' },
  { name: 'Order', path: '/order' },
  { name: 'Reservation', path: '/reservation' }
];

// Run tests
async function runResponsiveTests() {
  console.log('Starting responsive design tests...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    // Base URL for the frontend
    const baseUrl = 'http://localhost:3000';
    
    // Test each device
    for (const device of devices) {
      console.log(`Testing on ${device.name} (${device.width}x${device.height})`);
      
      const page = await browser.newPage();
      await page.setViewport({ width: device.width, height: device.height });
      
      // Test each page
      for (const testPage of pages) {
        console.log(`  - Testing ${testPage.name} page`);
        
        try {
          // Navigate to the page
          await page.goto(`${baseUrl}${testPage.path}`, { waitUntil: 'networkidle2', timeout: 30000 });
          
          // Take a screenshot
          const screenshotPath = path.join(screenshotsDir, `${device.name.toLowerCase()}-${testPage.name.toLowerCase().replace(' ', '-')}.png`);
          await page.screenshot({ path: screenshotPath, fullPage: true });
          
          console.log(`    ✓ Screenshot saved to ${screenshotPath}`);
          
          // Test for responsive elements
          const responsiveIssues = await testResponsiveElements(page);
          
          if (responsiveIssues.length > 0) {
            console.log(`    ⚠ Found ${responsiveIssues.length} responsive issues:`);
            responsiveIssues.forEach(issue => console.log(`      - ${issue}`));
          } else {
            console.log('    ✓ No responsive issues found');
          }
        } catch (error) {
          console.error(`    ✗ Error testing ${testPage.name} page:`, error.message);
        }
      }
      
      await page.close();
    }
  } finally {
    await browser.close();
  }
  
  console.log('Responsive design tests completed');
}

// Test for common responsive design issues
async function testResponsiveElements(page) {
  const issues = [];
  
  // Check for horizontal overflow
  const horizontalOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  
  if (horizontalOverflow) {
    issues.push('Horizontal overflow detected - page content is wider than viewport');
  }
  
  // Check for tiny text
  const tinyText = await page.evaluate(() => {
    const MIN_FONT_SIZE = 12; // Minimum acceptable font size in pixels
    const textElements = Array.from(document.querySelectorAll('p, span, a, h1, h2, h3, h4, h5, h6, button, input, label'));
    
    return textElements.filter(el => {
      const style = window.getComputedStyle(el);
      const fontSize = parseFloat(style.fontSize);
      return fontSize < MIN_FONT_SIZE && el.textContent.trim().length > 0;
    }).length > 0;
  });
  
  if (tinyText) {
    issues.push('Tiny text detected - some text elements have font size smaller than 12px');
  }
  
  // Check for touch targets that are too small
  const smallTouchTargets = await page.evaluate(() => {
    const MIN_TARGET_SIZE = 44; // Minimum touch target size in pixels (based on WCAG guidelines)
    const interactiveElements = Array.from(document.querySelectorAll('a, button, input, select, textarea, [role="button"]'));
    
    return interactiveElements.filter(el => {
      const rect = el.getBoundingClientRect();
      return (rect.width < MIN_TARGET_SIZE || rect.height < MIN_TARGET_SIZE) && 
             window.getComputedStyle(el).display !== 'none';
    }).length > 0;
  });
  
  if (smallTouchTargets) {
    issues.push('Small touch targets detected - some interactive elements are smaller than 44px');
  }
  
  // Check for overlapping elements
  const overlappingElements = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('*'));
    const visibleElements = elements.filter(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    });
    
    let hasOverlap = false;
    
    for (let i = 0; i < visibleElements.length; i++) {
      const el1 = visibleElements[i];
      const rect1 = el1.getBoundingClientRect();
      
      // Skip elements with zero size
      if (rect1.width === 0 || rect1.height === 0) continue;
      
      for (let j = i + 1; j < visibleElements.length; j++) {
        const el2 = visibleElements[j];
        
        // Skip parent-child relationships
        if (el1.contains(el2) || el2.contains(el1)) continue;
        
        const rect2 = el2.getBoundingClientRect();
        
        // Skip elements with zero size
        if (rect2.width === 0 || rect2.height === 0) continue;
        
        // Check for overlap
        if (!(rect1.right < rect2.left || 
              rect1.left > rect2.right || 
              rect1.bottom < rect2.top || 
              rect1.top > rect2.bottom)) {
          hasOverlap = true;
          break;
        }
      }
      
      if (hasOverlap) break;
    }
    
    return hasOverlap;
  });
  
  if (overlappingElements) {
    issues.push('Overlapping elements detected - some elements are overlapping each other');
  }
  
  return issues;
}

// Export the test function
module.exports = { runResponsiveTests };

// Run the tests if this file is executed directly
if (require.main === module) {
  runResponsiveTests().catch(console.error);
}
