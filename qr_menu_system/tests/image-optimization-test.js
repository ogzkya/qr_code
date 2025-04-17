// Test script for image loading optimization
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Create results directory if it doesn't exist
const resultsDir = path.join(__dirname, 'results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// Pages to test
const pages = [
  { name: 'Home', path: '/' },
  { name: 'Menu', path: '/menu' },
  { name: 'Menu Item', path: '/menu-item/1' }
];

// Run tests
async function runImageOptimizationTests() {
  console.log('Starting image loading optimization tests...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    // Base URL for the frontend
    const baseUrl = 'http://localhost:3000';
    
    const page = await browser.newPage();
    
    // Enable request interception
    await page.setRequestInterception(true);
    
    // Track image requests and their sizes
    const imageStats = {};
    
    page.on('request', request => {
      request.continue();
    });
    
    page.on('response', async response => {
      const url = response.url();
      const contentType = response.headers()['content-type'] || '';
      
      if (contentType.includes('image/')) {
        const buffer = await response.buffer();
        const size = buffer ? buffer.length : 0;
        
        imageStats[url] = {
          size,
          contentType,
          status: response.status()
        };
      }
    });
    
    // Test each page
    for (const testPage of pages) {
      console.log(`Testing ${testPage.name} page`);
      
      try {
        // Clear cache before each page
        await page.setCacheEnabled(false);
        
        // Track performance metrics
        const performanceMetrics = {};
        
        // Navigate to the page and measure load time
        const startTime = Date.now();
        await page.goto(`${baseUrl}${testPage.path}`, { waitUntil: 'networkidle2', timeout: 30000 });
        const loadTime = Date.now() - startTime;
        
        performanceMetrics.loadTime = loadTime;
        
        // Get all image elements on the page
        const imageElements = await page.evaluate(() => {
          const images = Array.from(document.querySelectorAll('img'));
          return images.map(img => {
            const rect = img.getBoundingClientRect();
            return {
              src: img.src,
              width: img.width,
              height: img.height,
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight,
              visible: rect.top < window.innerHeight && rect.bottom > 0,
              loading: img.loading || 'auto',
              hasLazyClass: img.classList.contains('lazy') || img.classList.contains('lazyload'),
              hasSrcset: img.hasAttribute('srcset'),
              hasSize: img.hasAttribute('width') && img.hasAttribute('height')
            };
          });
        });
        
        // Analyze image optimization issues
        const optimizationIssues = [];
        
        // Check total image size
        const totalImageSize = Object.values(imageStats).reduce((sum, stat) => sum + stat.size, 0);
        performanceMetrics.totalImageSize = totalImageSize;
        
        if (totalImageSize > 2 * 1024 * 1024) { // 2MB threshold
          optimizationIssues.push(`High total image size: ${(totalImageSize / (1024 * 1024)).toFixed(2)}MB`);
        }
        
        // Check for large images
        const largeImages = Object.entries(imageStats).filter(([url, stat]) => stat.size > 200 * 1024); // 200KB threshold
        
        if (largeImages.length > 0) {
          optimizationIssues.push(`Found ${largeImages.length} large images (>200KB):`);
          largeImages.forEach(([url, stat]) => {
            optimizationIssues.push(`  - ${url}: ${(stat.size / 1024).toFixed(2)}KB`);
          });
        }
        
        // Check for missing lazy loading
        const imagesWithoutLazy = imageElements.filter(img => 
          !img.hasLazyClass && 
          img.loading !== 'lazy' && 
          !img.visible
        );
        
        if (imagesWithoutLazy.length > 0) {
          optimizationIssues.push(`Found ${imagesWithoutLazy.length} off-screen images without lazy loading`);
        }
        
        // Check for missing width/height attributes
        const imagesWithoutDimensions = imageElements.filter(img => !img.hasSize);
        
        if (imagesWithoutDimensions.length > 0) {
          optimizationIssues.push(`Found ${imagesWithoutDimensions.length} images without width/height attributes`);
        }
        
        // Check for missing srcset for responsive images
        const largeImagesWithoutSrcset = imageElements.filter(img => 
          img.naturalWidth > 800 && 
          !img.hasSrcset
        );
        
        if (largeImagesWithoutSrcset.length > 0) {
          optimizationIssues.push(`Found ${largeImagesWithoutSrcset.length} large images without srcset attribute`);
        }
        
        // Check for unoptimized image formats
        const unoptimizedFormats = Object.entries(imageStats).filter(([url, stat]) => 
          stat.contentType.includes('image/png') || 
          stat.contentType.includes('image/gif') || 
          stat.contentType.includes('image/bmp')
        );
        
        if (unoptimizedFormats.length > 0) {
          optimizationIssues.push(`Found ${unoptimizedFormats.length} images using suboptimal formats (should use WebP or AVIF):`);
          unoptimizedFormats.forEach(([url, stat]) => {
            optimizationIssues.push(`  - ${url}: ${stat.contentType}`);
          });
        }
        
        // Save results
        const results = {
          page: testPage.name,
          performanceMetrics,
          imageElements: imageElements.length,
          optimizationIssues
        };
        
        const resultsPath = path.join(resultsDir, `image-optimization-${testPage.name.toLowerCase().replace(' ', '-')}.json`);
        fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
        
        console.log(`  ✓ Results saved to ${resultsPath}`);
        
        if (optimizationIssues.length > 0) {
          console.log(`  ⚠ Found ${optimizationIssues.length} optimization issues:`);
          optimizationIssues.forEach(issue => console.log(`    - ${issue}`));
        } else {
          console.log('  ✓ No image optimization issues found');
        }
      } catch (error) {
        console.error(`  ✗ Error testing ${testPage.name} page:`, error.message);
      }
    }
  } finally {
    await browser.close();
  }
  
  console.log('Image optimization tests completed');
}

// Export the test function
module.exports = { runImageOptimizationTests };

// Run the tests if this file is executed directly
if (require.main === module) {
  runImageOptimizationTests().catch(console.error);
}
