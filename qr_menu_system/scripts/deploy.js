// Main deployment script
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const projectRoot = path.join(__dirname, '..');
const frontendDeployScript = path.join(__dirname, 'deploy-frontend.js');
const backendDeployScript = path.join(__dirname, 'deploy-backend.js');
const qrCodeGenScript = path.join(__dirname, 'generate-qr-codes.js');
const seedDataScript = path.join(projectRoot, 'backend/src/seed/demo-data.js');

// Install required dependencies
console.log('Installing required dependencies...');
try {
  execSync('npm install canvas qrcode', { stdio: 'inherit', cwd: projectRoot });
  console.log('Dependencies installed successfully');
} catch (error) {
  console.error('Error installing dependencies:', error);
  process.exit(1);
}

// Run deployment steps
async function deploy() {
  console.log('Starting deployment process...');
  
  try {
    // Step 1: Deploy backend
    console.log('\n=== DEPLOYING BACKEND ===');
    execSync(`node ${backendDeployScript}`, { stdio: 'inherit' });
    
    // Step 2: Deploy frontend
    console.log('\n=== DEPLOYING FRONTEND ===');
    execSync(`node ${frontendDeployScript}`, { stdio: 'inherit' });
    
    // Step 3: Seed demo data
    console.log('\n=== SEEDING DEMO DATA ===');
    execSync(`node ${seedDataScript}`, { stdio: 'inherit', cwd: path.join(projectRoot, 'backend') });
    
    // Step 4: Generate QR codes
    console.log('\n=== GENERATING QR CODES ===');
    execSync(`node ${qrCodeGenScript}`, { stdio: 'inherit' });
    
    // Step 5: Create documentation
    console.log('\n=== CREATING DOCUMENTATION ===');
    createDocumentation();
    
    console.log('\n=== DEPLOYMENT COMPLETED SUCCESSFULLY ===');
    console.log('The QR Menu System has been deployed and is ready for use!');
    
    // Print access information
    const deployDir = path.join(projectRoot, 'deploy');
    console.log(`\nAccess Information:`);
    console.log(`- Backend API: http://localhost:5000`);
    console.log(`- Frontend: http://localhost:3000`);
    console.log(`- Admin Login: admin@example.com / password123`);
    console.log(`- QR Codes: ${path.join(projectRoot, 'qr_codes')}`);
    console.log(`- Documentation: ${path.join(projectRoot, 'documentation')}`);
    
  } catch (error) {
    console.error('Error during deployment:', error);
    process.exit(1);
  }
}

// Create documentation
function createDocumentation() {
  const docsDir = path.join(projectRoot, 'documentation');
  
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  
  // Create README
  const readmePath = path.join(docsDir, 'README.md');
  const readmeContent = `# Advanced QR Code Menu System

## Overview
This is an advanced QR code menu system for restaurants, offering a comprehensive digital menu solution with multiple advanced features beyond the basic functionality of traditional QR menu systems.

## Features

### Core Features
- **Digital Menu Management**: Easily manage menu sections, categories, and items
- **QR Code Generation**: Create and customize QR codes for tables and special purposes
- **Mobile-Friendly Interface**: Responsive design optimized for all devices
- **Admin Dashboard**: Comprehensive management interface for restaurant owners

### Advanced Features
- **Multi-Language Support**: Menu available in multiple languages with easy translation management
- **Online Ordering**: Customers can place orders directly from their devices
- **Table Reservation**: Built-in reservation system with availability checking
- **Customer Feedback**: Collect and manage customer ratings and comments
- **Special Offers & Promotions**: Create and manage time-limited discounts and special offers
- **Nutritional Information**: Display detailed nutritional data and allergen information
- **QR Code Analytics**: Track scans and analyze customer engagement
- **Custom QR Code Design**: Multiple templates and customization options

## Getting Started

### Accessing the System
- **Admin Dashboard**: http://localhost:5000/admin
  - Username: admin@example.com
  - Password: password123

- **Customer Menu**: http://localhost:3000/r/demo-restaurant

### QR Codes
QR codes are available in the \`qr_codes\` directory:
- Restaurant menu QR codes with different templates
- Table-specific QR codes
- Special purpose QR codes (WiFi, Feedback, Reservation, Promotion)

## Documentation

### For Restaurant Owners
- [Admin Guide](./admin-guide.md): How to manage your restaurant, menu, and settings
- [QR Code Guide](./qr-code-guide.md): How to create and use QR codes effectively

### For Developers
- [API Documentation](./api-docs.md): Complete API reference
- [Development Guide](./development-guide.md): How to extend and customize the system

## Support
For questions or support, please contact support@qrmenu.example.com
`;
  
  fs.writeFileSync(readmePath, readmeContent);
  console.log('Created README.md');
  
  // Create Admin Guide
  const adminGuidePath = path.join(docsDir, 'admin-guide.md');
  const adminGuideContent = `# Admin Guide

## Getting Started
This guide will help restaurant owners and managers effectively use the QR Menu System to manage their digital menu, QR codes, orders, reservations, and more.

## Logging In
1. Access the admin dashboard at http://localhost:5000/admin
2. Enter your email and password
3. For demo purposes, use:
   - Email: admin@example.com
   - Password: password123

## Dashboard Overview
The dashboard provides an overview of your restaurant's performance:
- Total menu views
- Active orders
- Upcoming reservations
- Recent feedback
- QR code scan statistics

## Managing Your Menu

### Menu Sections
Menu sections are the top-level organization of your menu (e.g., Breakfast, Lunch, Dinner).

To add a new section:
1. Go to Menu > Sections
2. Click "Add New Section"
3. Fill in the name, description, and upload an image
4. Set the display order and availability times
5. Click "Save"

### Categories
Categories organize items within a section (e.g., Appetizers, Main Courses).

To add a new category:
1. Go to Menu > Categories
2. Click "Add New Category"
3. Select the parent menu section
4. Fill in the name, description, and upload an image
5. Set the display order
6. Click "Save"

### Menu Items
To add a new menu item:
1. Go to Menu > Items
2. Click "Add New Item"
3. Select the category
4. Fill in all details:
   - Name and description
   - Price
   - Preparation time
   - Dietary information (vegetarian, vegan, gluten-free)
   - Allergens
   - Nutritional information
5. Upload a high-quality image
6. Click "Save"

### Item Options
Item options allow customization (e.g., cooking preference, sides, toppings).

To add options to a menu item:
1. Go to Menu > Items
2. Find the item and click "Options"
3. Click "Add New Option Group"
4. Fill in the option group details:
   - Name (e.g., "Cooking Preference")
   - Whether selection is required
   - Minimum and maximum selections
5. Add choices within the option group
6. Set price adjustments for each choice
7. Click "Save"

## Managing QR Codes

### Creating QR Codes
1. Go to QR Codes > Generate
2. Select the QR code type:
   - Restaurant Menu
   - Table-Specific
   - Special Purpose (WiFi, Feedback, etc.)
3. Choose a template and customize colors
4. Add your restaurant logo (optional)
5. Click "Generate"

### QR Code Analytics
1. Go to QR Codes > Analytics
2. View scan statistics by:
   - Time period (day, week, month)
   - QR code type
   - Table number
   - Device type
   - Location

## Managing Orders
1. Go to Orders
2. View all incoming orders
3. Click on an order to see details
4. Update order status:
   - New
   - In Progress
   - Ready
   - Delivered
   - Cancelled

## Managing Reservations
1. Go to Reservations
2. View upcoming reservations
3. Manage reservation status
4. Check availability for specific dates and times
5. Add manual reservations for phone or in-person bookings

## Managing Feedback
1. Go to Feedback
2. View and filter customer feedback
3. Respond to customer comments
4. Publish or hide feedback from public view

## Managing Promotions
1. Go to Promotions
2. Create new promotion:
   - Set discount type (percentage or fixed amount)
   - Set valid date range
   - Select applicable items or categories
   - Set usage limits
3. View and manage existing promotions

## Settings
1. Go to Settings
2. Update restaurant information
3. Manage user accounts and permissions
4. Configure language settings
5. Set up payment methods
6. Customize email notifications

## Best Practices
- Keep menu items updated with current prices and availability
- Use high-quality images for all menu items
- Respond promptly to customer feedback
- Update QR codes when making significant menu changes
- Review analytics regularly to identify popular items and peak times
`;
  
  fs.writeFileSync(adminGuidePath, adminGuideContent);
  console.log('Created admin-guide.md');
  
  // Create QR Code Guide
  const qrCodeGuidePath = path.join(docsDir, 'qr-code-guide.md');
  const qrCodeGuideContent = `# QR Code Guide

## Introduction
QR codes are the core of this system, allowing customers to access your digital menu instantly. This guide explains how to create, customize, and effectively use QR codes for your restaurant.

## Types of QR Codes

### Restaurant Menu QR Codes
These QR codes direct customers to your main menu.

**Use cases:**
- Place on entrance signs
- Include in marketing materials
- Add to business cards
- Display on website

### Table QR Codes
These QR codes are specific to each table and enable table-specific ordering.

**Use cases:**
- Place on each table
- Enable direct ordering to specific table
- Track table-specific analytics

### Special Purpose QR Codes

#### WiFi QR Code
Allows customers to connect to your WiFi network instantly.

**Use cases:**
- Display near entrance
- Include on table tents
- Add to menu footer

#### Feedback QR Code
Directs customers to your feedback form.

**Use cases:**
- Place near exit
- Include on receipts
- Add to thank you cards

#### Reservation QR Code
Allows customers to make reservations.

**Use cases:**
- Add to website
- Include in email signatures
- Place on business cards

#### Promotion QR Code
Links to special offers or promotions.

**Use cases:**
- Include in advertisements
- Display on promotional materials
- Use in social media campaigns

## QR Code Templates

The system offers several QR code templates:

1. **Classic**: Traditional square QR code
2. **Rounded**: QR code with rounded dots
3. **Dots**: QR code with separated dots
4. **Blue Gradient**: QR code with blue gradient coloring
5. **Restaurant Theme**: QR code with restaurant colors and logo
6. **Modern**: High-contrast QR code with table number label

## Customization Options

### Colors
- Customize foreground and background colors
- Use your brand colors for consistency
- Ensure sufficient contrast for reliable scanning

### Logo Integration
- Add your restaurant logo to the center of QR codes
- Use high error correction level when adding logos
- Keep logo size to 20-25% of total QR code size

### Design Tips
- Maintain adequate quiet zone (white space) around QR codes
- Test all QR codes on multiple devices before printing
- Avoid distorting QR codes when resizing

## Printing Guidelines

### Size Recommendations
- Minimum size: 2 x 2 cm (0.8 x 0.8 inches)
- Recommended size for tables: 5 x 5 cm (2 x 2 inches)
- Recommended size for entrance: 10 x 10 cm (4 x 4 inches)

### Material Recommendations
- Use waterproof materials for table QR codes
- Consider lamination for durability
- Use high-quality printing for best results

### Placement Recommendations
- Place at eye level when seated
- Avoid placing near reflective surfaces
- Ensure adequate lighting for scanning

## QR Code Analytics

The system tracks QR code usage, providing valuable insights:

- Scan frequency by time of day
- Scan frequency by day of week
- Device types used for scanning
- Time spent on menu after scanning
- Conversion rate from scan to order

Use these analytics to:
- Optimize menu layout
- Identify peak usage times
- Improve customer experience
- Measure marketing campaign effectiveness

## Troubleshooting

### Common Issues
- QR code too small
- Poor printing quality
- Inadequate lighting
- Reflective surfaces
- Damaged QR codes

### Solutions
- Increase QR code size
- Improve printing quality
- Ensure adequate lighting
- Use non-reflective materials
- Replace damaged QR codes promptly

## Best Practices

1. **Test Before Deploying**: Always test QR codes on multiple devices before printing and distributing.

2. **Update Regularly**: Update QR codes when making significant menu changes.

3. **Track Performance**: Regularly review QR code analytics to optimize placement and design.

4. **Provide Instructions**: Include brief scanning instructions for customers unfamiliar with QR codes.

5. **Have Alternatives**: Provide alternative access methods for customers who cannot use QR codes.
`;
  
  fs.writeFileSync(qrCodeGuidePath, qrCodeGuideContent);
  console.log('Created qr-code-guide.md');
  
  // Create API Documentation
  const apiDocsPath = path.join(docsDir, 'api-docs.md');
  const apiDocsContent = `# API Documentation

## Authentication

### Login
\`\`\`
POST /api/auth/login
\`\`\`

**Request Body:**
\`\`\`json
{
  "email": "admin@example.com",
  "password": "password123"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d21b4667d0d8992e610c85",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
\`\`\`

### Register
\`\`\`
POST /api/auth/register
\`\`\`

**Request Body:**
\`\`\`json
{
  "name": "New User",
  "email": "user@example.com",
  "password": "password123"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d21b4667d0d8992e610c86",
    "name": "New User",
    "email": "user@example.com",
    "role": "user"
  }
}
\`\`\`

### Get Current User
\`\`\`
GET /api/auth/me
\`\`\`

**Headers:**
\`\`\`
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "60d21b4667d0d8992e610c85",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
\`\`\`

## Restaurants

### Get All Restaurants
\`\`\`
GET /api/restaurants
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "60d21b4667d0d8992e610c87",
      "name": "Gourmet Fusion",
      "description": "A modern restaurant offering a fusion of international cuisines...",
      "address": "123 Main Street, Anytown, USA",
      "phone": "(555) 123-4567",
      "email": "info@gourmetfusion.example",
      "website": "https://gourmetfusion.example",
      "logo": "https://via.placeholder.com/200x200?text=Gourmet+Fusion",
      "cuisine_types": ["International", "Fusion", "Modern"],
      "price_range": "$$"
    }
  ]
}
\`\`\`

### Get Single Restaurant
\`\`\`
GET /api/restaurants/:id
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "60d21b4667d0d8992e610c87",
    "name": "Gourmet Fusion",
    "description": "A modern restaurant offering a fusion of international cuisines...",
    "address": "123 Main Street, Anytown, USA",
    "city": "Anytown",
    "state": "CA",
    "postal_code": "12345",
    "country": "USA",
    "phone": "(555) 123-4567",
    "email": "info@gourmetfusion.example",
    "website": "https://gourmetfusion.example",
    "hours_of_operation": {
      "monday": { "open": "11:00", "close": "22:00" },
      "tuesday": { "open": "11:00", "close": "22:00" },
      "wednesday": { "open": "11:00", "close": "22:00" },
      "thursday": { "open": "11:00", "close": "23:00" },
      "friday": { "open": "11:00", "close": "23:00" },
      "saturday": { "open": "10:00", "close": "23:00" },
      "sunday": { "open": "10:00", "close": "22:00" }
    },
    "logo": "https://via.placeholder.com/200x200?text=Gourmet+Fusion",
    "cover_image": "https://via.placeholder.com/1200x400?text=Gourmet+Fusion",
    "cuisine_types": ["International", "Fusion", "Modern"],
    "price_range": "$$",
    "has_vegetarian_options": true,
    "has_vegan_options": true,
    "has_gluten_free_options": true,
    "has_online_ordering": true,
    "has_reservation": true,
    "wifi_password": "guestWiFi2025",
    "default_language": "en",
    "is_active": true
  }
}
\`\`\`

### Create Restaurant
\`\`\`
POST /api/restaurants
\`\`\`

**Headers:**
\`\`\`
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

**Request Body:**
\`\`\`json
{
  "name": "New Restaurant",
  "description": "Restaurant description",
  "address": "456 Oak Street, Anytown, USA",
  "phone": "(555) 987-6543",
  "email": "info@newrestaurant.example",
  "website": "https://newrestaurant.example",
  "cuisine_types": ["Italian", "Mediterranean"],
  "price_range": "$$$"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "60d21b4667d0d8992e610c88",
    "name": "New Restaurant",
    "description": "Restaurant description",
    "address": "456 Oak Street, Anytown, USA",
    "phone": "(555) 987-6543",
    "email": "info@newrestaurant.example",
    "website": "https://newrestaurant.example",
    "cuisine_types": ["Italian", "Mediterranean"],
    "price_range": "$$$",
    "is_active": true
  }
}
\`\`\`

## Menu Sections

### Get Menu Sections for Restaurant
\`\`\`
GET /api/menu-sections/restaurant/:restaurantId
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "id": "60d21b4667d0d8992e610c89",
      "restaurant_id": "60d21b4667d0d8992e610c87",
      "name": "Breakfast",
      "description": "Start your day with our delicious breakfast options",
      "display_order": 1,
      "image": "https://via.placeholder.com/400x300?text=Breakfast",
      "is_active": true,
      "availability": {
        "days": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        "start_time": "07:00",
        "end_time": "11:00"
      }
    },
    {
      "id": "60d21b4667d0d8992e610c8a",
      "restaurant_id": "60d21b4667d0d8992e610c87",
      "name": "Lunch",
      "description": "Perfect meals for your midday break",
      "display_order": 2,
      "image": "https://via.placeholder.com/400x300?text=Lunch",
      "is_active": true,
      "availability": {
        "days": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        "start_time": "11:00",
        "end_time": "16:00"
      }
    }
  ]
}
\`\`\`

## Categories

### Get Categories for Menu Section
\`\`\`
GET /api/categories/menu-section/:menuSectionId
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "60d21b4667d0d8992e610c8b",
      "menu_section_id": "60d21b4667d0d8992e610c89",
      "name": "Egg Specialties",
      "description": "Delicious egg dishes to start your day",
      "display_order": 1,
      "image": "https://via.placeholder.com/300x200?text=Egg+Specialties",
      "is_active": true
    },
    {
      "id": "60d21b4667d0d8992e610c8c",
      "menu_section_id": "60d21b4667d0d8992e610c89",
      "name": "Pancakes & Waffles",
      "description": "Sweet breakfast treats",
      "display_order": 2,
      "image": "https://via.placeholder.com/300x200?text=Pancakes+and+Waffles",
      "is_active": true
    }
  ]
}
\`\`\`

## Menu Items

### Get Menu Items for Category
\`\`\`
GET /api/menu-items/category/:categoryId
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "60d21b4667d0d8992e610c8d",
      "category_id": "60d21b4667d0d8992e610c8b",
      "name": "Classic Eggs Benedict",
      "description": "Poached eggs on English muffin with Canadian bacon and hollandaise sauce",
      "price": 14.95,
      "image": "https://via.placeholder.com/400x300?text=Eggs+Benedict",
      "preparation_time": 15,
      "is_vegetarian": false,
      "is_vegan": false,
      "is_gluten_free": false,
      "calories": 650,
      "allergens": ["eggs", "gluten", "dairy"],
      "is_active": true,
      "is_featured": true,
      "portion_size": "2 eggs",
      "ingredients": "Eggs, English muffin, Canadian bacon, hollandaise sauce, butter, chives"
    }
  ]
}
\`\`\`

## QR Codes

### Generate QR Code
\`\`\`
POST /api/qr-codes
\`\`\`

**Headers:**
\`\`\`
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

**Request Body:**
\`\`\`json
{
  "restaurant_id": "60d21b4667d0d8992e610c87",
  "name": "Main Menu QR",
  "type": "restaurant_menu",
  "template": "classic",
  "foreground_color": "#000000",
  "background_color": "#FFFFFF",
  "include_logo": true,
  "error_correction_level": "M"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "60d21b4667d0d8992e610c8e",
    "restaurant_id": "60d21b4667d0d8992e610c87",
    "name": "Main Menu QR",
    "type": "restaurant_menu",
    "template": "classic",
    "foreground_color": "#000000",
    "background_color": "#FFFFFF",
    "include_logo": true,
    "error_correction_level": "M",
    "image_url": "/uploads/qr-codes/60d21b4667d0d8992e610c8e.png",
    "target_url": "https://qrmenu.example.com/r/demo-restaurant",
    "created_at": "2025-04-17T03:30:00.000Z"
  }
}
\`\`\`

## Orders

### Create Order
\`\`\`
POST /api/orders
\`\`\`

**Request Body:**
\`\`\`json
{
  "restaurant_id": "60d21b4667d0d8992e610c87",
  "table_number": 5,
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "555-123-4567",
  "items": [
    {
      "menu_item_id": "60d21b4667d0d8992e610c8d",
      "quantity": 2,
      "special_instructions": "Extra sauce on the side",
      "options": [
        {
          "option_id": "60d21b4667d0d8992e610c8f",
          "choice_id": "60d21b4667d0d8992e610c90"
        }
      ]
    }
  ]
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "60d21b4667d0d8992e610c91",
    "restaurant_id": "60d21b4667d0d8992e610c87",
    "order_number": "ORD-12345",
    "table_number": 5,
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "555-123-4567",
    "status": "new",
    "total": 29.90,
    "items": [
      {
        "menu_item_id": "60d21b4667d0d8992e610c8d",
        "name": "Classic Eggs Benedict",
        "price": 14.95,
        "quantity": 2,
        "subtotal": 29.90,
        "special_instructions": "Extra sauce on the side",
        "options": [
          {
            "option_id": "60d21b4667d0d8992e610c8f",
            "option_name": "Eggs",
            "choice_id": "60d21b4667d0d8992e610c90",
            "choice_name": "Poached (Traditional)",
            "price_adjustment": 0
          }
        ]
      }
    ],
    "created_at": "2025-04-17T03:35:00.000Z"
  }
}
\`\`\`

## Reservations

### Create Reservation
\`\`\`
POST /api/reservations
\`\`\`

**Request Body:**
\`\`\`json
{
  "restaurant_id": "60d21b4667d0d8992e610c87",
  "customer_name": "Jane Smith",
  "customer_email": "jane@example.com",
  "customer_phone": "555-987-6543",
  "party_size": 4,
  "reservation_date": "2025-04-20T19:00:00.000Z",
  "special_requests": "Window table if possible"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "60d21b4667d0d8992e610c92",
    "restaurant_id": "60d21b4667d0d8992e610c87",
    "reservation_number": "RES-67890",
    "customer_name": "Jane Smith",
    "customer_email": "jane@example.com",
    "customer_phone": "555-987-6543",
    "party_size": 4,
    "reservation_date": "2025-04-20T19:00:00.000Z",
    "status": "confirmed",
    "special_requests": "Window table if possible",
    "created_at": "2025-04-17T03:40:00.000Z"
  }
}
\`\`\`

## Feedback

### Create Feedback
\`\`\`
POST /api/feedback
\`\`\`

**Request Body:**
\`\`\`json
{
  "restaurant_id": "60d21b4667d0d8992e610c87",
  "menu_item_id": "60d21b4667d0d8992e610c8d",
  "customer_name": "Alex Johnson",
  "customer_email": "alex@example.com",
  "rating": 5,
  "comments": "The Eggs Benedict was amazing! Will definitely order again.",
  "service_rating": 5,
  "food_rating": 5,
  "ambience_rating": 4,
  "value_rating": 4
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "60d21b4667d0d8992e610c93",
    "restaurant_id": "60d21b4667d0d8992e610c87",
    "menu_item_id": "60d21b4667d0d8992e610c8d",
    "customer_name": "Alex Johnson",
    "customer_email": "alex@example.com",
    "rating": 5,
    "comments": "The Eggs Benedict was amazing! Will definitely order again.",
    "service_rating": 5,
    "food_rating": 5,
    "ambience_rating": 4,
    "value_rating": 4,
    "status": "pending",
    "created_at": "2025-04-17T03:45:00.000Z"
  }
}
\`\`\`

## Languages

### Get Available Languages
\`\`\`
GET /api/languages
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "code": "en",
      "name": "English",
      "native_name": "English",
      "is_active": true,
      "is_default": true,
      "direction": "ltr"
    },
    {
      "code": "es",
      "name": "Spanish",
      "native_name": "Español",
      "is_active": true,
      "is_default": false,
      "direction": "ltr"
    },
    {
      "code": "fr",
      "name": "French",
      "native_name": "Français",
      "is_active": true,
      "is_default": false,
      "direction": "ltr"
    },
    {
      "code": "zh",
      "name": "Chinese",
      "native_name": "中文",
      "is_active": true,
      "is_default": false,
      "direction": "ltr"
    }
  ]
}
\`\`\`

## Promotions

### Get Active Promotions
\`\`\`
GET /api/promotions/public/restaurant/:restaurantId
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "60d21b4667d0d8992e610c94",
      "restaurant_id": "60d21b4667d0d8992e610c87",
      "name": "Happy Hour Special",
      "description": "Enjoy 20% off all drinks from 4pm to 6pm, Monday to Friday",
      "start_date": "2025-01-01T00:00:00.000Z",
      "end_date": "2025-12-31T23:59:59.000Z",
      "discount_type": "percentage",
      "discount_value": 20,
      "min_order_amount": 0,
      "is_active": true,
      "applies_to": "specific_categories",
      "items": [
        {
          "item_type": "category",
          "item_details": {
            "id": "60d21b4667d0d8992e610c95",
            "name": "Cocktails"
          }
        },
        {
          "item_type": "category",
          "item_details": {
            "id": "60d21b4667d0d8992e610c96",
            "name": "Wine"
          }
        },
        {
          "item_type": "category",
          "item_details": {
            "id": "60d21b4667d0d8992e610c97",
            "name": "Non-Alcoholic"
          }
        }
      ]
    }
  ]
}
\`\`\`

## Error Responses

### Validation Error
\`\`\`json
{
  "success": false,
  "error": "Validation Error",
  "message": "Please provide all required fields",
  "errors": [
    {
      "field": "email",
      "message": "Please include a valid email"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters"
    }
  ]
}
\`\`\`

### Authentication Error
\`\`\`json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Not authorized to access this resource"
}
\`\`\`

### Resource Not Found
\`\`\`json
{
  "success": false,
  "error": "Not Found",
  "message": "Resource not found with id of 60d21b4667d0d8992e610c99"
}
\`\`\`

### Server Error
\`\`\`json
{
  "success": false,
  "error": "Server Error",
  "message": "Server error occurred"
}
\`\`\`
`;
  
  fs.writeFileSync(apiDocsPath, apiDocsContent);
  console.log('Created api-docs.md');
  
  // Create Development Guide
  const devGuidePath = path.join(docsDir, 'development-guide.md');
  const devGuideContent = `# Development Guide

## System Architecture

The QR Menu System is built using a modern stack with the following components:

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: Authentication
- **Multer**: File uploads
- **QRCode**: QR code generation

### Frontend
- **React**: UI library
- **React Router**: Navigation
- **Material UI**: Component library
- **Axios**: HTTP client
- **i18next**: Internationalization
- **React QR Code**: QR code display

## Project Structure

### Backend Structure
\`\`\`
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── utils/          # Utility functions
│   └── server.js       # Entry point
├── uploads/            # Uploaded files
└── package.json        # Dependencies
\`\`\`

### Frontend Structure
\`\`\`
frontend/
├── public/             # Static files
├── src/
│   ├── assets/         # Images, fonts, etc.
│   ├── components/     # Reusable components
│   │   ├── common/     # Shared components
│   │   ├── menu/       # Menu components
│   │   ├── qrcode/     # QR code components
│   │   ├── order/      # Order components
│   │   ├── reservation/# Reservation components
│   │   └── feedback/   # Feedback components
│   ├── context/        # React context
│   ├── hooks/          # Custom hooks
│   ├── locales/        # Translation files
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── utils/          # Utility functions
│   ├── App.js          # Main component
│   └── index.js        # Entry point
└── package.json        # Dependencies
\`\`\`

## Setup Development Environment

### Prerequisites
- Node.js (v14+)
- MongoDB (v4+)
- npm or yarn

### Backend Setup
1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:
   \`\`\`
   npm install
   \`\`\`
4. Create a .env file with the following variables:
   \`\`\`
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/qr_menu_system
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   FILE_UPLOAD_PATH=uploads
   MAX_FILE_SIZE=5242880
   NODE_ENV=development
   \`\`\`
5. Start the development server:
   \`\`\`
   npm run dev
   \`\`\`

### Frontend Setup
1. Navigate to the frontend directory
2. Install dependencies:
   \`\`\`
   npm install
   \`\`\`
3. Create a .env file with the following variables:
   \`\`\`
   REACT_APP_API_URL=http://localhost:5000/api
   \`\`\`
4. Start the development server:
   \`\`\`
   npm start
   \`\`\`

## Database Models

### Restaurant Model
\`\`\`javascript
{
  name: String,
  description: String,
  address: String,
  city: String,
  state: String,
  postal_code: String,
  country: String,
  phone: String,
  email: String,
  website: String,
  hours_of_operation: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  logo: String,
  cover_image: String,
  cuisine_types: [String],
  price_range: String,
  has_vegetarian_options: Boolean,
  has_vegan_options: Boolean,
  has_gluten_free_options: Boolean,
  has_online_ordering: Boolean,
  has_reservation: Boolean,
  wifi_password: String,
  default_language: String,
  is_active: Boolean
}
\`\`\`

### Menu Section Model
\`\`\`javascript
{
  restaurant_id: ObjectId,
  name: String,
  description: String,
  display_order: Number,
  image: String,
  is_active: Boolean,
  availability: {
    days: [String],
    start_time: String,
    end_time: String
  }
}
\`\`\`

### Category Model
\`\`\`javascript
{
  menu_section_id: ObjectId,
  name: String,
  description: String,
  display_order: Number,
  image: String,
  is_active: Boolean
}
\`\`\`

### Menu Item Model
\`\`\`javascript
{
  category_id: ObjectId,
  name: String,
  description: String,
  price: Number,
  image: String,
  preparation_time: Number,
  is_vegetarian: Boolean,
  is_vegan: Boolean,
  is_gluten_free: Boolean,
  calories: Number,
  allergens: [String],
  is_active: Boolean,
  is_featured: Boolean,
  portion_size: String,
  ingredients: String
}
\`\`\`

## API Endpoints

See the [API Documentation](./api-docs.md) for detailed information on all available endpoints.

## Authentication

The system uses JWT (JSON Web Tokens) for authentication. Protected routes require a valid token in the Authorization header:

\`\`\`
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

### User Roles
- **Admin**: Full access to all features
- **Restaurant Owner**: Access to their restaurant data
- **Restaurant Staff**: Limited access based on permissions
- **Customer**: Public access only

## File Uploads

File uploads are handled using Multer middleware. Files are stored in the \`uploads\` directory and referenced in the database by their path.

### Supported File Types
- Images: jpg, jpeg, png, gif
- Documents: pdf

### File Size Limits
- Images: 5MB
- Documents: 10MB

## QR Code Generation

QR codes are generated using the \`qrcode\` library. The system supports various customization options:

- Template selection
- Color customization
- Logo integration
- Error correction level
- Size and margin adjustment

## Internationalization

The system supports multiple languages using i18next. Translation files are stored in the \`frontend/src/locales\` directory.

### Adding a New Language
1. Create a new translation file in \`frontend/src/locales\`
2. Add the language to the language selector component
3. Add translations for all UI elements

## Testing

### Backend Testing
\`\`\`
cd backend
npm test
\`\`\`

### Frontend Testing
\`\`\`
cd frontend
npm test
\`\`\`

## Deployment

### Backend Deployment
1. Set environment variables for production
2. Build the application:
   \`\`\`
   npm run build
   \`\`\`
3. Start the server:
   \`\`\`
   npm start
   \`\`\`

### Frontend Deployment
1. Set environment variables for production
2. Build the application:
   \`\`\`
   npm run build
   \`\`\`
3. Deploy the \`build\` directory to a static file server

## Contributing

### Code Style
- Follow ESLint configuration
- Use Prettier for code formatting
- Follow the existing project structure

### Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## Extending the System

### Adding New Features
1. Identify the feature requirements
2. Design the database models
3. Implement the backend API
4. Create the frontend components
5. Add translations
6. Test thoroughly

### Custom Themes
The system supports custom theming through Material UI's theming system. To create a custom theme:

1. Create a new theme file in \`frontend/src/themes\`
2. Define your theme colors, typography, and component styles
3. Import and apply the theme in \`App.js\`

### Custom QR Code Templates
To add a new QR code template:

1. Create a new template function in \`backend/src/utils/qrCodeGenerator.js\`
2. Add the template to the available templates list
3. Implement the frontend component to display the template option

## Troubleshooting

### Common Issues

#### MongoDB Connection Errors
- Check that MongoDB is running
- Verify the connection string in .env
- Check network connectivity

#### File Upload Issues
- Verify the uploads directory exists and is writable
- Check file size limits
- Verify supported file types

#### QR Code Generation Issues
- Check error correction level (higher levels allow for more customization)
- Ensure logo size is appropriate (too large may make QR code unscannable)
- Test QR codes on multiple devices

## Support

For technical support, please contact:
- Email: dev-support@qrmenu.example.com
- GitHub Issues: https://github.com/qrmenu/issues
`;
  
  fs.writeFileSync(devGuidePath, devGuideContent);
  console.log('Created development-guide.md');
  
  console.log('Documentation created successfully!');
}

// Run deployment
deploy();
