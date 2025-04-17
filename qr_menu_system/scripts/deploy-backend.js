// Backend deployment script
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const backendDir = path.join(__dirname, '../backend');
const deployDir = path.join(__dirname, '../deploy');

// Create deployment directory if it doesn't exist
if (!fs.existsSync(deployDir)) {
  fs.mkdirSync(deployDir, { recursive: true });
  console.log('Created deployment directory');
}

// Prepare backend for deployment
console.log('Preparing backend for deployment...');
try {
  // Create production .env file
  const envContent = `PORT=5000
MONGODB_URI=mongodb://localhost:27017/qr_menu_system
JWT_SECRET=advanced_qr_menu_system_secret_key_2025_production
JWT_EXPIRE=30d
FILE_UPLOAD_PATH=uploads
MAX_FILE_SIZE=5242880
NODE_ENV=production`;

  fs.writeFileSync(path.join(backendDir, '.env.production'), envContent);
  console.log('Created production environment file');
  
  // Copy necessary files to deployment directory
  const filesToCopy = [
    'package.json',
    'package-lock.json',
    '.env.production'
  ];
  
  filesToCopy.forEach(file => {
    fs.copyFileSync(
      path.join(backendDir, file),
      path.join(deployDir, file)
    );
    console.log(`Copied ${file} to deployment directory`);
  });
  
  // Create directories in deployment folder
  const directories = [
    'src',
    'src/config',
    'src/controllers',
    'src/middleware',
    'src/models',
    'src/routes',
    'src/utils',
    'uploads'
  ];
  
  directories.forEach(dir => {
    const fullPath = path.join(deployDir, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
  
  // Copy source files recursively
  function copyDir(src, dest) {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
  
  copyDir(path.join(backendDir, 'src'), path.join(deployDir, 'src'));
  console.log('Copied source files to deployment directory');
  
  // Rename .env.production to .env in deployment directory
  fs.renameSync(
    path.join(deployDir, '.env.production'),
    path.join(deployDir, '.env')
  );
  
  // Install production dependencies
  console.log('Installing production dependencies...');
  process.chdir(deployDir);
  execSync('npm install --production', { stdio: 'inherit' });
  
  console.log('Backend deployment preparation completed successfully!');
} catch (error) {
  console.error('Error preparing backend deployment:', error);
  process.exit(1);
}
