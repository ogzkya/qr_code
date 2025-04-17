// Frontend deployment script
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const frontendDir = path.join(__dirname, '../frontend');
const buildDir = path.join(frontendDir, 'build');

// Create frontend directory if it doesn't exist
if (!fs.existsSync(frontendDir)) {
  fs.mkdirSync(frontendDir, { recursive: true });
  console.log('Created frontend directory');
}

// Initialize React app
console.log('Initializing React app...');
try {
  process.chdir(frontendDir);
  
  // Check if package.json exists
  if (!fs.existsSync(path.join(frontendDir, 'package.json'))) {
    console.log('Creating new React app...');
    execSync('npx create-react-app .', { stdio: 'inherit' });
  } else {
    console.log('React app already initialized');
  }
  
  // Install dependencies
  console.log('Installing dependencies...');
  execSync('npm install react-router-dom axios @mui/material @mui/icons-material @emotion/react @emotion/styled react-qr-code i18next react-i18next', { stdio: 'inherit' });
  
  // Create src directory structure
  const directories = [
    'src/components',
    'src/components/common',
    'src/components/menu',
    'src/components/qrcode',
    'src/components/order',
    'src/components/reservation',
    'src/components/feedback',
    'src/pages',
    'src/services',
    'src/utils',
    'src/assets',
    'src/assets/images',
    'src/context',
    'src/hooks',
    'src/locales'
  ];
  
  directories.forEach(dir => {
    const fullPath = path.join(frontendDir, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
  
  // Build the app
  console.log('Building the app...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('Frontend deployment preparation completed successfully!');
} catch (error) {
  console.error('Error preparing frontend deployment:', error);
  process.exit(1);
}
