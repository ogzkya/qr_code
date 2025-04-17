// Database query optimization test script
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

// Create results directory if it doesn't exist
const resultsDir = path.join(__dirname, 'results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// Connect to MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  }
}

// Load models
const Restaurant = require('../backend/src/models/Restaurant');
const MenuSection = require('../backend/src/models/MenuSection');
const Category = require('../backend/src/models/Category');
const MenuItem = require('../backend/src/models/MenuItem');
const QRCode = require('../backend/src/models/QRCode');
const Order = require('../backend/src/models/Order');
const Reservation = require('../backend/src/models/Reservation');
const Feedback = require('../backend/src/models/Feedback');
const Promotion = require('../backend/src/models/Promotion');

// Queries to test
const queriesToTest = [
  {
    name: 'Get restaurant with menu sections',
    query: async () => {
      return await Restaurant.findOne().exec();
    },
    optimizedQuery: async () => {
      return await Restaurant.findOne().select('name address phone email').exec();
    },
    description: 'Basic restaurant query with field selection'
  },
  {
    name: 'Get menu sections for restaurant',
    query: async (restaurantId) => {
      return await MenuSection.find({ restaurant_id: restaurantId }).exec();
    },
    optimizedQuery: async (restaurantId) => {
      return await MenuSection.find({ restaurant_id: restaurantId })
        .select('name display_order')
        .lean()
        .exec();
    },
    description: 'Menu sections query with field selection and lean()'
  },
  {
    name: 'Get categories with menu items',
    query: async (menuSectionId) => {
      const categories = await Category.find({ menu_section_id: menuSectionId }).exec();
      
      for (const category of categories) {
        category.menuItems = await MenuItem.find({ category_id: category._id }).exec();
      }
      
      return categories;
    },
    optimizedQuery: async (menuSectionId) => {
      const categories = await Category.find({ menu_section_id: menuSectionId })
        .lean()
        .exec();
      
      const categoryIds = categories.map(category => category._id);
      
      const menuItems = await MenuItem.find({ category_id: { $in: categoryIds } })
        .select('name price description image category_id')
        .lean()
        .exec();
      
      const menuItemsByCategory = {};
      menuItems.forEach(item => {
        if (!menuItemsByCategory[item.category_id]) {
          menuItemsByCategory[item.category_id] = [];
        }
        menuItemsByCategory[item.category_id].push(item);
      });
      
      return categories.map(category => ({
        ...category,
        menuItems: menuItemsByCategory[category._id] || []
      }));
    },
    description: 'Categories with menu items using $in operator and lean()'
  },
  {
    name: 'Get menu item with details',
    query: async (menuItemId) => {
      const menuItem = await MenuItem.findById(menuItemId).exec();
      const category = await Category.findById(menuItem.category_id).exec();
      const menuSection = await MenuSection.findById(category.menu_section_id).exec();
      const restaurant = await Restaurant.findById(menuSection.restaurant_id).exec();
      
      return {
        menuItem,
        category,
        menuSection,
        restaurant
      };
    },
    optimizedQuery: async (menuItemId) => {
      const menuItem = await MenuItem.findById(menuItemId)
        .select('name price description image category_id')
        .lean()
        .exec();
      
      const category = await Category.findById(menuItem.category_id)
        .select('name menu_section_id')
        .lean()
        .exec();
      
      const menuSection = await MenuSection.findById(category.menu_section_id)
        .select('name restaurant_id')
        .lean()
        .exec();
      
      const restaurant = await Restaurant.findById(menuSection.restaurant_id)
        .select('name address')
        .lean()
        .exec();
      
      return {
        menuItem,
        category,
        menuSection,
        restaurant
      };
    },
    description: 'Menu item details with field selection and lean()'
  },
  {
    name: 'Get orders for restaurant',
    query: async (restaurantId) => {
      return await Order.find({ restaurant_id: restaurantId })
        .sort({ created_at: -1 })
        .exec();
    },
    optimizedQuery: async (restaurantId) => {
      return await Order.find({ restaurant_id: restaurantId })
        .select('order_number status total customer_name created_at')
        .sort({ created_at: -1 })
        .limit(100)
        .lean()
        .exec();
    },
    description: 'Orders query with field selection, limit, and lean()'
  },
  {
    name: 'Get reservations for date range',
    query: async (restaurantId, startDate, endDate) => {
      return await Reservation.find({
        restaurant_id: restaurantId,
        reservation_date: { $gte: startDate, $lte: endDate }
      }).exec();
    },
    optimizedQuery: async (restaurantId, startDate, endDate) => {
      return await Reservation.find({
        restaurant_id: restaurantId,
        reservation_date: { $gte: startDate, $lte: endDate }
      })
        .select('customer_name party_size reservation_date status')
        .sort({ reservation_date: 1 })
        .lean()
        .exec();
    },
    description: 'Reservations query with date range, field selection, and lean()'
  },
  {
    name: 'Get feedback with pagination',
    query: async (restaurantId, page, limit) => {
      const skip = (page - 1) * limit;
      
      return await Feedback.find({ restaurant_id: restaurantId })
        .skip(skip)
        .limit(limit)
        .exec();
    },
    optimizedQuery: async (restaurantId, page, limit) => {
      const skip = (page - 1) * limit;
      
      return await Feedback.find({ restaurant_id: restaurantId })
        .select('rating comments customer_name created_at status')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();
    },
    description: 'Feedback query with pagination, field selection, and lean()'
  },
  {
    name: 'Get active promotions',
    query: async (restaurantId) => {
      const now = new Date();
      
      return await Promotion.find({
        restaurant_id: restaurantId,
        is_active: true,
        start_date: { $lte: now },
        end_date: { $gte: now }
      }).exec();
    },
    optimizedQuery: async (restaurantId) => {
      const now = new Date();
      
      return await Promotion.find({
        restaurant_id: restaurantId,
        is_active: true,
        start_date: { $lte: now },
        end_date: { $gte: now }
      })
        .select('name description discount_type discount_value start_date end_date')
        .lean()
        .exec();
    },
    description: 'Active promotions query with field selection and lean()'
  },
  {
    name: 'Get menu items by search term',
    query: async (restaurantId, searchTerm) => {
      // Get all menu sections for the restaurant
      const menuSections = await MenuSection.find({ restaurant_id: restaurantId }).exec();
      const menuSectionIds = menuSections.map(section => section._id);
      
      // Get all categories for the menu sections
      const categories = await Category.find({ menu_section_id: { $in: menuSectionIds } }).exec();
      const categoryIds = categories.map(category => category._id);
      
      // Search menu items
      return await MenuItem.find({
        category_id: { $in: categoryIds },
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } }
        ]
      }).exec();
    },
    optimizedQuery: async (restaurantId, searchTerm) => {
      // Create text index on MenuItem collection (would be done during setup)
      // await MenuItem.collection.createIndex({ name: 'text', description: 'text' });
      
      // Get all menu sections for the restaurant
      const menuSections = await MenuSection.find({ restaurant_id: restaurantId })
        .select('_id')
        .lean()
        .exec();
      const menuSectionIds = menuSections.map(section => section._id);
      
      // Get all categories for the menu sections
      const categories = await Category.find({ menu_section_id: { $in: menuSectionIds } })
        .select('_id')
        .lean()
        .exec();
      const categoryIds = categories.map(category => category._id);
      
      // Search menu items using text index
      return await MenuItem.find({
        category_id: { $in: categoryIds },
        $text: { $search: searchTerm }
      })
        .select('name price description image category_id')
        .lean()
        .exec();
    },
    description: 'Menu item search using text index instead of regex'
  }
];

// Run database query optimization tests
async function runDatabaseOptimizationTests() {
  console.log('Starting database query optimization tests...');
  
  await connectToDatabase();
  
  const testResults = {
    queries: [],
    summary: {
      totalQueries: queriesToTest.length,
      totalImprovement: 0
    }
  };
  
  try {
    // Get a sample restaurant ID for testing
    const sampleRestaurant = await Restaurant.findOne().select('_id').lean().exec();
    
    if (!sampleRestaurant) {
      console.error('No restaurant found in database. Please seed the database first.');
      process.exit(1);
    }
    
    const restaurantId = sampleRestaurant._id;
    
    // Get a sample menu section ID for testing
    const sampleMenuSection = await MenuSection.findOne({ restaurant_id: restaurantId }).select('_id').lean().exec();
    
    if (!sampleMenuSection) {
      console.error('No menu section found in database. Please seed the database first.');
      process.exit(1);
    }
    
    const menuSectionId = sampleMenuSection._id;
    
    // Get a sample menu item ID for testing
    const sampleCategory = await Category.findOne({ menu_section_id: menuSectionId }).select('_id').lean().exec();
    
    if (!sampleCategory) {
      console.error('No category found in database. Please seed the database first.');
      process.exit(1);
    }
    
    const categoryId = sampleCategory._id;
    
    const sampleMenuItem = await MenuItem.findOne({ category_id: categoryId }).select('_id').lean().exec();
    
    if (!sampleMenuItem) {
      console.error('No menu item found in database. Please seed the database first.');
      process.exit(1);
    }
    
    const menuItemId = sampleMenuItem._id;
    
    // Test parameters
    const testParams = {
      restaurantId,
      menuSectionId,
      categoryId,
      menuItemId,
      page: 1,
      limit: 10,
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      endDate: new Date(), // now
      searchTerm: 'chicken'
    };
    
    // Run each query test
    for (const queryTest of queriesToTest) {
      console.log(`Testing query: ${queryTest.name}`);
      
      try {
        // Prepare parameters for this query
        const params = [];
        
        if (queryTest.name.includes('restaurant')) {
          params.push(testParams.restaurantId);
        }
        
        if (queryTest.name.includes('menu sections')) {
          params.push(testParams.menuSectionId);
        }
        
        if (queryTest.name.includes('menu item with details')) {
          params.push(testParams.menuItemId);
        }
        
        if (queryTest.name.includes('reservations')) {
          params.push(testParams.restaurantId, testParams.startDate, testParams.endDate);
        }
        
        if (queryTest.name.includes('pagination')) {
          params.push(testParams.restaurantId, testParams.page, testParams.limit);
        }
        
        if (queryTest.name.includes('search')) {
          params.push(testParams.restaurantId, testParams.searchTerm);
        }
        
        // Run original query and measure performance
        const originalStart = performance.now();
        const originalResult = await queryTest.query(...params);
        const originalEnd = performance.now();
        const originalTime = originalEnd - originalStart;
        
        console.log(`  Original query time: ${originalTime.toFixed(2)}ms`);
        
        // Run optimized query and measure performance
        const optimizedStart = performance.now();
        const optimizedResult = await queryTest.optimizedQuery(...params);
        const optimizedEnd = performance.now();
        const optimizedTime = optimizedEnd - optimizedStart;
        
        console.log(`  Optimized query time: ${optimizedTime.toFixed(2)}ms`);
        
        // Calculate improvement
        const improvement = originalTime > 0 ? ((originalTime - optimizedTime) / originalTime) * 100 : 0;
        console.log(`  Improvement: ${improvement.toFixed(2)}%`);
        
        // Store results
        testResults.queries.push({
          name: queryTest.name,
          description: queryTest.description,
          originalTime,
          optimizedTime,
          improvement,
          originalResultSize: JSON.stringify(originalResult).length,
          optimizedResultSize: JSON.stringify(optimizedResult).length,
          dataSizeReduction: ((JSON.stringify(originalResult).length - JSON.stringify(optimizedResult).length) / JSON.stringify(originalResult).length) * 100
        });
        
        testResults.summary.totalImprovement += improvement;
      } catch (error) {
        console.error(`  Error testing query ${queryTest.name}:`, error.message);
        
        testResults.queries.push({
          name: queryTest.name,
          description: queryTest.description,
          error: error.message
        });
      }
    }
    
    // Calculate average improvement
    testResults.summary.averageImprovement = testResults.summary.totalImprovement / testResults.queries.filter(q => !q.error).length;
    
    // Save test results
    const resultsPath = path.join(resultsDir, 'database-optimization-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));
    
    console.log(`Database optimization test results saved to ${resultsPath}`);
    
    // Print summary
    console.log('\nDatabase Optimization Test Summary:');
    console.log(`  Total Queries Tested: ${testResults.summary.totalQueries}`);
    console.log(`  Average Improvement: ${testResults.summary.averageImprovement.toFixed(2)}%`);
    
    // Print top optimizations
    const sortedQueries = [...testResults.queries]
      .filter(q => !q.error)
      .sort((a, b) => b.improvement - a.improvement);
    
    console.log('\nTop Optimizations:');
    sortedQueries.slice(0, 3).forEach((query, index) => {
      console.log(`  ${index + 1}. ${query.name}: ${query.improvement.toFixed(2)}% improvement`);
      console.log(`     ${query.description}`);
    });
    
    // Print optimization recommendations
    console.log('\nOptimization Recommendations:');
    console.log('  1. Use .select() to limit fields returned from the database');
    console.log('  2. Use .lean() for read-only operations to return plain JavaScript objects');
    console.log('  3. Use .limit() to restrict the number of documents returned');
    console.log('  4. Use $in operator for batch queries instead of multiple individual queries');
    console.log('  5. Create indexes for frequently queried fields');
    console.log('  6. Use text indexes instead of regex for text search operations');
    console.log('  7. Use projection to include only necessary fields in nested document queries');
    console.log('  8. Consider using aggregation pipeline for complex queries');
  } catch (error) {
    console.error('Error running database optimization tests:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
  }
  
  console.log('Database optimization tests completed');
}

// Export the test function
module.exports = { runDatabaseOptimizationTests };

// Run the tests if this file is executed directly
if (require.main === module) {
  runDatabaseOptimizationTests().catch(console.error);
}
