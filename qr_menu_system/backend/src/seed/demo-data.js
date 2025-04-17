// Sample data for demo restaurant
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
const Restaurant = require('../src/models/Restaurant');
const User = require('../src/models/User');
const RestaurantAdmin = require('../src/models/RestaurantAdmin');
const MenuSection = require('../src/models/MenuSection');
const Category = require('../src/models/Category');
const MenuItem = require('../src/models/MenuItem');
const ItemOption = require('../src/models/ItemOption');
const OptionChoice = require('../src/models/OptionChoice');
const Language = require('../src/models/Language');
const Translation = require('../src/models/Translation');
const Promotion = require('../src/models/Promotion');
const PromotionItem = require('../src/models/PromotionItem');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Create demo data
async function seedDemoData() {
  try {
    // Clear existing data
    await clearExistingData();
    
    // Create admin user
    const adminUser = await createAdminUser();
    
    // Create restaurant
    const restaurant = await createRestaurant();
    
    // Link admin to restaurant
    await linkAdminToRestaurant(adminUser, restaurant);
    
    // Create languages
    const languages = await createLanguages();
    
    // Create menu sections
    const menuSections = await createMenuSections(restaurant);
    
    // Create categories
    const categories = await createCategories(menuSections);
    
    // Create menu items
    const menuItems = await createMenuItems(categories);
    
    // Create item options
    await createItemOptions(menuItems);
    
    // Create translations
    await createTranslations(restaurant, menuSections, categories, menuItems, languages);
    
    // Create promotions
    await createPromotions(restaurant, categories, menuItems);
    
    console.log('Demo data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding demo data:', error);
    process.exit(1);
  }
}

// Clear existing data
async function clearExistingData() {
  console.log('Clearing existing data...');
  
  await Restaurant.deleteMany({});
  await User.deleteMany({});
  await RestaurantAdmin.deleteMany({});
  await MenuSection.deleteMany({});
  await Category.deleteMany({});
  await MenuItem.deleteMany({});
  await ItemOption.deleteMany({});
  await OptionChoice.deleteMany({});
  await Language.deleteMany({});
  await Translation.deleteMany({});
  await Promotion.deleteMany({});
  await PromotionItem.deleteMany({});
  
  console.log('Existing data cleared');
}

// Create admin user
async function createAdminUser() {
  console.log('Creating admin user...');
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);
  
  const adminUser = await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    password: hashedPassword,
    role: 'admin'
  });
  
  console.log('Admin user created');
  return adminUser;
}

// Create restaurant
async function createRestaurant() {
  console.log('Creating restaurant...');
  
  const restaurant = await Restaurant.create({
    name: 'Gourmet Fusion',
    description: 'A modern restaurant offering a fusion of international cuisines with a focus on fresh, local ingredients.',
    address: '123 Main Street, Anytown, USA',
    city: 'Anytown',
    state: 'CA',
    postal_code: '12345',
    country: 'USA',
    phone: '(555) 123-4567',
    email: 'info@gourmetfusion.example',
    website: 'https://gourmetfusion.example',
    hours_of_operation: {
      monday: { open: '11:00', close: '22:00' },
      tuesday: { open: '11:00', close: '22:00' },
      wednesday: { open: '11:00', close: '22:00' },
      thursday: { open: '11:00', close: '23:00' },
      friday: { open: '11:00', close: '23:00' },
      saturday: { open: '10:00', close: '23:00' },
      sunday: { open: '10:00', close: '22:00' }
    },
    logo: 'https://via.placeholder.com/200x200?text=Gourmet+Fusion',
    cover_image: 'https://via.placeholder.com/1200x400?text=Gourmet+Fusion',
    cuisine_types: ['International', 'Fusion', 'Modern'],
    price_range: '$$',
    has_vegetarian_options: true,
    has_vegan_options: true,
    has_gluten_free_options: true,
    has_online_ordering: true,
    has_reservation: true,
    wifi_password: 'guestWiFi2025',
    default_language: 'en',
    is_active: true
  });
  
  console.log('Restaurant created');
  return restaurant;
}

// Link admin to restaurant
async function linkAdminToRestaurant(adminUser, restaurant) {
  console.log('Linking admin to restaurant...');
  
  await RestaurantAdmin.create({
    user_id: adminUser._id,
    restaurant_id: restaurant._id,
    role: 'owner',
    permissions: ['manage_menu', 'manage_orders', 'manage_reservations', 'manage_staff', 'view_analytics']
  });
  
  console.log('Admin linked to restaurant');
}

// Create languages
async function createLanguages() {
  console.log('Creating languages...');
  
  const languages = await Language.insertMany([
    {
      code: 'en',
      name: 'English',
      native_name: 'English',
      is_active: true,
      is_default: true,
      direction: 'ltr'
    },
    {
      code: 'es',
      name: 'Spanish',
      native_name: 'Español',
      is_active: true,
      is_default: false,
      direction: 'ltr'
    },
    {
      code: 'fr',
      name: 'French',
      native_name: 'Français',
      is_active: true,
      is_default: false,
      direction: 'ltr'
    },
    {
      code: 'zh',
      name: 'Chinese',
      native_name: '中文',
      is_active: true,
      is_default: false,
      direction: 'ltr'
    }
  ]);
  
  console.log('Languages created');
  return languages;
}

// Create menu sections
async function createMenuSections(restaurant) {
  console.log('Creating menu sections...');
  
  const menuSections = await MenuSection.insertMany([
    {
      restaurant_id: restaurant._id,
      name: 'Breakfast',
      description: 'Start your day with our delicious breakfast options',
      display_order: 1,
      image: 'https://via.placeholder.com/400x300?text=Breakfast',
      is_active: true,
      availability: {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        start_time: '07:00',
        end_time: '11:00'
      }
    },
    {
      restaurant_id: restaurant._id,
      name: 'Lunch',
      description: 'Perfect meals for your midday break',
      display_order: 2,
      image: 'https://via.placeholder.com/400x300?text=Lunch',
      is_active: true,
      availability: {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        start_time: '11:00',
        end_time: '16:00'
      }
    },
    {
      restaurant_id: restaurant._id,
      name: 'Dinner',
      description: 'Exquisite dinner options for a perfect evening',
      display_order: 3,
      image: 'https://via.placeholder.com/400x300?text=Dinner',
      is_active: true,
      availability: {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        start_time: '16:00',
        end_time: '22:00'
      }
    },
    {
      restaurant_id: restaurant._id,
      name: 'Drinks',
      description: 'Refreshing beverages and cocktails',
      display_order: 4,
      image: 'https://via.placeholder.com/400x300?text=Drinks',
      is_active: true,
      availability: {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        start_time: '11:00',
        end_time: '23:00'
      }
    }
  ]);
  
  console.log('Menu sections created');
  return menuSections;
}

// Create categories
async function createCategories(menuSections) {
  console.log('Creating categories...');
  
  const breakfastSection = menuSections.find(section => section.name === 'Breakfast');
  const lunchSection = menuSections.find(section => section.name === 'Lunch');
  const dinnerSection = menuSections.find(section => section.name === 'Dinner');
  const drinksSection = menuSections.find(section => section.name === 'Drinks');
  
  const categories = await Category.insertMany([
    // Breakfast categories
    {
      menu_section_id: breakfastSection._id,
      name: 'Egg Specialties',
      description: 'Delicious egg dishes to start your day',
      display_order: 1,
      image: 'https://via.placeholder.com/300x200?text=Egg+Specialties',
      is_active: true
    },
    {
      menu_section_id: breakfastSection._id,
      name: 'Pancakes & Waffles',
      description: 'Sweet breakfast treats',
      display_order: 2,
      image: 'https://via.placeholder.com/300x200?text=Pancakes+and+Waffles',
      is_active: true
    },
    {
      menu_section_id: breakfastSection._id,
      name: 'Healthy Options',
      description: 'Nutritious breakfast choices',
      display_order: 3,
      image: 'https://via.placeholder.com/300x200?text=Healthy+Options',
      is_active: true
    },
    
    // Lunch categories
    {
      menu_section_id: lunchSection._id,
      name: 'Sandwiches',
      description: 'Gourmet sandwiches and wraps',
      display_order: 1,
      image: 'https://via.placeholder.com/300x200?text=Sandwiches',
      is_active: true
    },
    {
      menu_section_id: lunchSection._id,
      name: 'Salads',
      description: 'Fresh and crisp salads',
      display_order: 2,
      image: 'https://via.placeholder.com/300x200?text=Salads',
      is_active: true
    },
    {
      menu_section_id: lunchSection._id,
      name: 'Soups',
      description: 'Hearty and warming soups',
      display_order: 3,
      image: 'https://via.placeholder.com/300x200?text=Soups',
      is_active: true
    },
    
    // Dinner categories
    {
      menu_section_id: dinnerSection._id,
      name: 'Appetizers',
      description: 'Delicious starters to share',
      display_order: 1,
      image: 'https://via.placeholder.com/300x200?text=Appetizers',
      is_active: true
    },
    {
      menu_section_id: dinnerSection._id,
      name: 'Main Courses',
      description: 'Exquisite main dishes',
      display_order: 2,
      image: 'https://via.placeholder.com/300x200?text=Main+Courses',
      is_active: true
    },
    {
      menu_section_id: dinnerSection._id,
      name: 'Desserts',
      description: 'Sweet treats to end your meal',
      display_order: 3,
      image: 'https://via.placeholder.com/300x200?text=Desserts',
      is_active: true
    },
    
    // Drinks categories
    {
      menu_section_id: drinksSection._id,
      name: 'Cocktails',
      description: 'Signature and classic cocktails',
      display_order: 1,
      image: 'https://via.placeholder.com/300x200?text=Cocktails',
      is_active: true
    },
    {
      menu_section_id: drinksSection._id,
      name: 'Wine',
      description: 'Fine selection of wines',
      display_order: 2,
      image: 'https://via.placeholder.com/300x200?text=Wine',
      is_active: true
    },
    {
      menu_section_id: drinksSection._id,
      name: 'Non-Alcoholic',
      description: 'Refreshing non-alcoholic beverages',
      display_order: 3,
      image: 'https://via.placeholder.com/300x200?text=Non-Alcoholic',
      is_active: true
    }
  ]);
  
  console.log('Categories created');
  return categories;
}

// Create menu items
async function createMenuItems(categories) {
  console.log('Creating menu items...');
  
  // Find categories
  const eggCategory = categories.find(category => category.name === 'Egg Specialties');
  const pancakesCategory = categories.find(category => category.name === 'Pancakes & Waffles');
  const healthyBreakfastCategory = categories.find(category => category.name === 'Healthy Options');
  
  const sandwichesCategory = categories.find(category => category.name === 'Sandwiches');
  const saladsCategory = categories.find(category => category.name === 'Salads');
  const soupsCategory = categories.find(category => category.name === 'Soups');
  
  const appetizersCategory = categories.find(category => category.name === 'Appetizers');
  const mainCoursesCategory = categories.find(category => category.name === 'Main Courses');
  const dessertsCategory = categories.find(category => category.name === 'Desserts');
  
  const cocktailsCategory = categories.find(category => category.name === 'Cocktails');
  const wineCategory = categories.find(category => category.name === 'Wine');
  const nonAlcoholicCategory = categories.find(category => category.name === 'Non-Alcoholic');
  
  const menuItems = await MenuItem.insertMany([
    // Egg Specialties
    {
      category_id: eggCategory._id,
      name: 'Classic Eggs Benedict',
      description: 'Poached eggs on English muffin with Canadian bacon and hollandaise sauce',
      price: 14.95,
      image: 'https://via.placeholder.com/400x300?text=Eggs+Benedict',
      preparation_time: 15,
      is_vegetarian: false,
      is_vegan: false,
      is_gluten_free: false,
      calories: 650,
      allergens: ['eggs', 'gluten', 'dairy'],
      is_active: true,
      is_featured: true,
      portion_size: '2 eggs',
      ingredients: 'Eggs, English muffin, Canadian bacon, hollandaise sauce, butter, chives'
    },
    {
      category_id: eggCategory._id,
      name: 'Veggie Omelette',
      description: 'Three-egg omelette with bell peppers, onions, tomatoes, spinach and cheddar cheese',
      price: 12.95,
      image: 'https://via.placeholder.com/400x300?text=Veggie+Omelette',
      preparation_time: 12,
      is_vegetarian: true,
      is_vegan: false,
      is_gluten_free: true,
      calories: 450,
      allergens: ['eggs', 'dairy'],
      is_active: true,
      is_featured: false,
      portion_size: '3 eggs',
      ingredients: 'Eggs, bell peppers, onions, tomatoes, spinach, cheddar cheese, salt, pepper'
    },
    {
      category_id: eggCategory._id,
      name: 'Huevos Rancheros',
      description: 'Fried eggs on corn tortillas with black beans, avocado, salsa and queso fresco',
      price: 13.95,
      image: 'https://via.placeholder.com/400x300?text=Huevos+Rancheros',
      preparation_time: 14,
      is_vegetarian: true,
      is_vegan: false,
      is_gluten_free: true,
      calories: 580,
      allergens: ['eggs', 'dairy'],
      is_active: true,
      is_featured: false,
      portion_size: '2 eggs',
      ingredients: 'Eggs, corn tortillas, black beans, avocado, tomato salsa, queso fresco, cilantro'
    },
    
    // Pancakes & Waffles
    {
      category_id: pancakesCategory._id,
      name: 'Buttermilk Pancakes',
      description: 'Fluffy buttermilk pancakes served with maple syrup and butter',
      price: 10.95,
      image: 'https://via.placeholder.com/400x300?text=Buttermilk+Pancakes',
      preparation_time: 12,
      is_vegetarian: true,
      is_vegan: false,
      is_gluten_free: false,
      calories: 720,
      allergens: ['gluten', 'dairy', 'eggs'],
      is_active: true,
      is_featured: true,
      portion_size: '3 pancakes',
      ingredients: 'Flour, buttermilk, eggs, sugar, baking powder, butter, maple syrup'
    },
    {
      category_id: pancakesCategory._id,
      name: 'Belgian Waffle',
      description: 'Crispy Belgian waffle topped with fresh berries, whipped cream and powdered sugar',
      price: 12.95,
      image: 'https://via.placeholder.com/400x300?text=Belgian+Waffle',
      preparation_time: 15,
      is_vegetarian: true,
      is_vegan: false,
      is_gluten_free: false,
      calories: 680,
      allergens: ['gluten', 'dairy', 'eggs'],
      is_active: true,
      is_featured: false,
      portion_size: '1 large waffle',
      ingredients: 'Flour, milk, eggs, sugar, baking powder, butter, berries, whipped cream'
    },
    
    // Healthy Options
    {
      category_id: healthyBreakfastCategory._id,
      name: 'Acai Bowl',
      description: 'Acai berry smoothie topped with granola, fresh fruit, coconut flakes and honey',
      price: 11.95,
      image: 'https://via.placeholder.com/400x300?text=Acai+Bowl',
      preparation_time: 10,
      is_vegetarian: true,
      is_vegan: false,
      is_gluten_free: false,
      calories: 420,
      allergens: ['nuts', 'gluten'],
      is_active: true,
      is_featured: true,
      portion_size: '12 oz bowl',
      ingredients: 'Acai berries, banana, granola, strawberries, blueberries, coconut flakes, honey'
    },
    {
      category_id: healthyBreakfastCategory._id,
      name: 'Avocado Toast',
      description: 'Multigrain toast topped with smashed avocado, cherry tomatoes, microgreens and a poached egg',
      price: 13.95,
      image: 'https://via.placeholder.com/400x300?text=Avocado+Toast',
      preparation_time: 12,
      is_vegetarian: true,
      is_vegan: false,
      is_gluten_free: false,
      calories: 380,
      allergens: ['gluten', 'eggs'],
      is_active: true,
      is_featured: false,
      portion_size: '2 slices',
      ingredients: 'Multigrain bread, avocado, cherry tomatoes, microgreens, egg, olive oil, salt, pepper, red pepper flakes'
    },
    
    // Sandwiches
    {
      category_id: sandwichesCategory._id,
      name: 'Grilled Chicken Panini',
      description: 'Grilled chicken breast with pesto, mozzarella, roasted red peppers and arugula on ciabatta bread',
      price: 14.95,
      image: 'https://via.placeholder.com/400x300?text=Chicken+Panini',
      preparation_time: 12,
      is_vegetarian: false,
      is_vegan: false,
      is_gluten_free: false,
      calories: 620,
      allergens: ['gluten', 'dairy', 'nuts'],
      is_active: true,
      is_featured: true,
      portion_size: '1 sandwich',
      ingredients: 'Chicken breast, ciabatta bread, pesto, mozzarella cheese, roasted red peppers, arugula'
    },
    {
      category_id: sandwichesCategory._id,
      name: 'Veggie Wrap',
      description: 'Spinach tortilla filled with hummus, mixed greens, cucumber, avocado, carrots and sprouts',
      price: 12.95,
      image: 'https://via.placeholder.com/400x300?text=Veggie+Wrap',
      preparation_time: 8,
      is_vegetarian: true,
      is_vegan: true,
      is_gluten_free: false,
      calories: 450,
      allergens: ['gluten'],
      is_active: true,
      is_featured: false,
      portion_size: '1 wrap',
      ingredients: 'Spinach tortilla, hummus, mixed greens, cucumber, avocado, carrots, sprouts'
    },
    
    // Salads
    {
      category_id: saladsCategory._id,
      name: 'Cobb Salad',
      description: 'Mixed greens topped with grilled chicken, bacon, avocado, blue cheese, hard-boiled egg and cherry tomatoes',
      price: 15.95,
      image: 'https://via.placeholder.com/400x300?text=Cobb+Salad',
      preparation_time: 10,
      is_vegetarian: false,
      is_vegan: false,
      is_gluten_free: true,
      calories: 580,
      allergens: ['eggs', 'dairy'],
      is_active: true,
      is_featured: true,
      portion_size: 'Large bowl',
      ingredients: 'Mixed greens, grilled chicken, bacon, avocado, blue cheese, egg, cherry tomatoes, red wine vinaigrette'
    },
    {
      category_id: saladsCategory._id,
      name: 'Mediterranean Quinoa Salad',
      description: 'Quinoa with cucumber, cherry tomatoes, red onion, kalamata olives, feta cheese and lemon herb dressing',
      price: 13.95,
      image: 'https://via.placeholder.com/400x300?text=Quinoa+Salad',
      preparation_time: 8,
      is_vegetarian: true,
      is_vegan: false,
      is_gluten_free: true,
      calories: 420,
      allergens: ['dairy'],
      is_active: true,
      is_featured: false,
      portion_size: 'Large bowl',
      ingredients: 'Quinoa, cucumber, cherry tomatoes, red onion, kalamata olives, feta cheese, parsley, mint, lemon juice, olive oil'
    },
    
    // Soups
    {
      category_id: soupsCategory._id,
      name: 'Tomato Basil Soup',
      description: 'Creamy tomato soup with fresh basil and a touch of cream, served with a grilled cheese crouton',
      price: 8.95,
      image: 'https://via.placeholder.com/400x300?text=Tomato+Soup',
      preparation_time: 5,
      is_vegetarian: true,
      is_vegan: false,
      is_gluten_free: false,
      calories: 320,
      allergens: ['dairy', 'gluten'],
      is_active: true,
      is_featured: true,
      portion_size: '12 oz bowl',
      ingredients: 'Tomatoes, onion, garlic, basil, vegetable broth, cream, butter, bread, cheddar cheese'
    },
    {
      category_id: soupsCategory._id,
      name: 'French Onion Soup',
      description: 'Caramelized onion soup with beef broth, topped with a baguette crouton and melted Gruyère cheese',
      price: 9.95,
      image: 'https://via.placeholder.com/400x300?text=French+Onion+Soup',
      preparation_time: 8,
      is_vegetarian: false,
      is_vegan: false,
      is_gluten_free: false,
      calories: 380,
      allergens: ['gluten', 'dairy'],
      is_active: true,
      is_featured: false,
      portion_size: '12 oz bowl',
      ingredients: 'Onions, beef broth, white wine, baguette, Gruyère cheese, thyme, bay leaf'
    },
    
    // Appetizers
    {
      category_id: appetizersCategory._id,
      name: 'Crispy Calamari',
      description: 'Lightly battered and fried calamari served with marinara sauce and lemon aioli',
      price: 13.95,
      image: 'https://via.placeholder.com/400x300?text=Calamari',
      preparation_time: 12,
      is_vegetarian: false,
      is_vegan: false,
      is_gluten_free: false,
      calories: 480,
      allergens: ['gluten', 'eggs', 'shellfish'],
      is_active: true,
      is_featured: true,
      portion_size: 'Shareable plate',
      ingredients: 'Calamari, flour, eggs, breadcrumbs, marinara sauce, lemon, garlic, mayonnaise'
    },
    {
      category_id: appetizersCategory._id,
      name: 'Spinach Artichoke Dip',
      description: 'Creamy spinach and artichoke dip topped with parmesan cheese, served with tortilla chips',
      price: 11.95,
      image: 'https://via.placeholder.com/400x300?text=Spinach+Dip',
      preparation_time: 15,
      is_vegetarian: true,
      is_vegan: false,
      is_gluten_free: true,
      calories: 520,
      allergens: ['dairy'],
      is_active: true,
      is_featured: false,
      portion_size: 'Shareable bowl',
      ingredients: 'Spinach, artichoke hearts, cream cheese, sour cream, parmesan cheese, garlic, tortilla chips'
    },
    
    // Main Courses
    {
      category_id: mainCoursesCategory._id,
      name: 'Grilled Salmon',
      description: 'Grilled Atlantic salmon with lemon herb butter, served with roasted vegetables and quinoa pilaf',
      price: 24.95,
      image: 'https://via.placeholder.com/400x300?text=Grilled+Salmon',
      preparation_time: 20,
      is_vegetarian: false,
      is_vegan: false,
      is_gluten_free: true,
      calories: 620,
      allergens: ['fish', 'dairy'],
      is_active: true,
      is_featured: true,
      portion_size: '6 oz fillet',
      ingredients: 'Atlantic salmon, lemon, butter, herbs, zucchini, bell peppers, quinoa, vegetable broth'
    },
    {
      category_id: mainCoursesCategory._id,
      name: 'Filet Mignon',
      description: '8 oz filet mignon with red wine reduction, served with garlic mashed potatoes and asparagus',
      price: 34.95,
      image: 'https://via.placeholder.com/400x300?text=Filet+Mignon',
      preparation_time: 25,
      is_vegetarian: false,
      is_vegan: false,
      is_gluten_free: true,
      calories: 780,
      allergens: ['dairy'],
      is_active: true,
      is_featured: true,
      portion_size: '8 oz steak',
      ingredients: 'Beef tenderloin, red wine, shallots, butter, potatoes, garlic, cream, asparagus'
    },
    {
      category_id: mainCoursesCategory._id,
      name: 'Mushroom Risotto',
      description: 'Creamy Arborio rice with wild mushrooms, truffle oil, parmesan cheese and fresh herbs',
      price: 19.95,
      image: 'https://via.placeholder.com/400x300?text=Mushroom+Risotto',
      preparation_time: 25,
      is_vegetarian: true,
      is_vegan: false,
      is_gluten_free: true,
      calories: 580,
      allergens: ['dairy'],
      is_active: true,
      is_featured: false,
      portion_size: 'Large bowl',
      ingredients: 'Arborio rice, wild mushrooms, white wine, vegetable broth, parmesan cheese, truffle oil, butter, shallots, garlic, thyme'
    },
    
    // Desserts
    {
      category_id: dessertsCategory._id,
      name: 'Chocolate Lava Cake',
      description: 'Warm chocolate cake with a molten center, served with vanilla ice cream and raspberry coulis',
      price: 9.95,
      image: 'https://via.placeholder.com/400x300?text=Lava+Cake',
      preparation_time: 15,
      is_vegetarian: true,
      is_vegan: false,
      is_gluten_free: false,
      calories: 580,
      allergens: ['gluten', 'dairy', 'eggs'],
      is_active: true,
      is_featured: true,
      portion_size: 'Individual cake',
      ingredients: 'Chocolate, butter, eggs, sugar, flour, vanilla ice cream, raspberries'
    },
    {
      category_id: dessertsCategory._id,
      name: 'New York Cheesecake',
      description: 'Classic New York style cheesecake with graham cracker crust and seasonal berry compote',
      price: 8.95,
      image: 'https://via.placeholder.com/400x300?text=Cheesecake',
      preparation_time: 10,
      is_vegetarian: true,
      is_vegan: false,
      is_gluten_free: false,
      calories: 520,
      allergens: ['gluten', 'dairy', 'eggs'],
      is_active: true,
      is_featured: false,
      portion_size: 'Slice',
      ingredients: 'Cream cheese, sugar, eggs, graham crackers, butter, vanilla, mixed berries'
    },
    
    // Cocktails
    {
      category_id: cocktailsCategory._id,
      name: 'Classic Martini',
      description: 'Gin or vodka with dry vermouth and olive or lemon twist',
      price: 12.95,
      image: 'https://via.placeholder.com/400x300?text=Martini',
      preparation_time: 5,
      is_vegetarian: true,
      is_vegan: true,
      is_gluten_free: true,
      calories: 220,
      allergens: [],
      is_active: true,
      is_featured: true,
      portion_size: '6 oz',
      ingredients: 'Gin or vodka, dry vermouth, olive or lemon twist',
      alcohol_content: 25
    },
    {
      category_id: cocktailsCategory._id,
      name: 'Signature Old Fashioned',
      description: 'Bourbon whiskey with sugar, bitters, orange peel and a cherry',
      price: 13.95,
      image: 'https://via.placeholder.com/400x300?text=Old+Fashioned',
      preparation_time: 5,
      is_vegetarian: true,
      is_vegan: true,
      is_gluten_free: true,
      calories: 180,
      allergens: [],
      is_active: true,
      is_featured: false,
      portion_size: '4 oz',
      ingredients: 'Bourbon whiskey, sugar cube, Angostura bitters, orange peel, cherry',
      alcohol_content: 32
    },
    
    // Wine
    {
      category_id: wineCategory._id,
      name: 'Cabernet Sauvignon',
      description: 'Full-bodied red wine with notes of black currant, cedar and vanilla',
      price: 12.95,
      image: 'https://via.placeholder.com/400x300?text=Cabernet',
      preparation_time: 2,
      is_vegetarian: true,
      is_vegan: true,
      is_gluten_free: true,
      calories: 150,
      allergens: ['sulfites'],
      is_active: true,
      is_featured: true,
      portion_size: '6 oz glass',
      ingredients: 'Cabernet Sauvignon grapes',
      alcohol_content: 14
    },
    {
      category_id: wineCategory._id,
      name: 'Chardonnay',
      description: 'Medium-bodied white wine with notes of apple, pear and oak',
      price: 11.95,
      image: 'https://via.placeholder.com/400x300?text=Chardonnay',
      preparation_time: 2,
      is_vegetarian: true,
      is_vegan: true,
      is_gluten_free: true,
      calories: 140,
      allergens: ['sulfites'],
      is_active: true,
      is_featured: false,
      portion_size: '6 oz glass',
      ingredients: 'Chardonnay grapes',
      alcohol_content: 13.5
    },
    
    // Non-Alcoholic
    {
      category_id: nonAlcoholicCategory._id,
      name: 'Fresh Fruit Smoothie',
      description: 'Blend of seasonal fruits with yogurt and honey',
      price: 7.95,
      image: 'https://via.placeholder.com/400x300?text=Fruit+Smoothie',
      preparation_time: 5,
      is_vegetarian: true,
      is_vegan: false,
      is_gluten_free: true,
      calories: 280,
      allergens: ['dairy'],
      is_active: true,
      is_featured: true,
      portion_size: '16 oz',
      ingredients: 'Seasonal fruits, yogurt, honey, ice'
    },
    {
      category_id: nonAlcoholicCategory._id,
      name: 'Iced Matcha Latte',
      description: 'Premium matcha green tea with milk over ice',
      price: 5.95,
      image: 'https://via.placeholder.com/400x300?text=Matcha+Latte',
      preparation_time: 3,
      is_vegetarian: true,
      is_vegan: false,
      is_gluten_free: true,
      calories: 180,
      allergens: ['dairy'],
      is_active: true,
      is_featured: false,
      portion_size: '16 oz',
      ingredients: 'Matcha green tea powder, milk, ice, optional sweetener'
    }
  ]);
  
  console.log('Menu items created');
  return menuItems;
}

// Create item options
async function createItemOptions(menuItems) {
  console.log('Creating item options...');
  
  // Find specific menu items
  const eggsBenedict = menuItems.find(item => item.name === 'Classic Eggs Benedict');
  const pancakes = menuItems.find(item => item.name === 'Buttermilk Pancakes');
  const chickenPanini = menuItems.find(item => item.name === 'Grilled Chicken Panini');
  const salmon = menuItems.find(item => item.name === 'Grilled Salmon');
  const smoothie = menuItems.find(item => item.name === 'Fresh Fruit Smoothie');
  
  // Create options
  const eggOptions = await ItemOption.create({
    menu_item_id: eggsBenedict._id,
    name: 'Eggs',
    description: 'How would you like your eggs?',
    is_required: true,
    min_selections: 1,
    max_selections: 1,
    display_order: 1
  });
  
  await OptionChoice.insertMany([
    {
      item_option_id: eggOptions._id,
      name: 'Poached (Traditional)',
      price_adjustment: 0,
      is_default: true,
      display_order: 1
    },
    {
      item_option_id: eggOptions._id,
      name: 'Over Easy',
      price_adjustment: 0,
      is_default: false,
      display_order: 2
    },
    {
      item_option_id: eggOptions._id,
      name: 'Scrambled',
      price_adjustment: 0,
      is_default: false,
      display_order: 3
    }
  ]);
  
  const toppingsOptions = await ItemOption.create({
    menu_item_id: pancakes._id,
    name: 'Toppings',
    description: 'Add extra toppings to your pancakes',
    is_required: false,
    min_selections: 0,
    max_selections: 4,
    display_order: 1
  });
  
  await OptionChoice.insertMany([
    {
      item_option_id: toppingsOptions._id,
      name: 'Fresh Berries',
      price_adjustment: 2.50,
      is_default: false,
      display_order: 1
    },
    {
      item_option_id: toppingsOptions._id,
      name: 'Banana Slices',
      price_adjustment: 1.50,
      is_default: false,
      display_order: 2
    },
    {
      item_option_id: toppingsOptions._id,
      name: 'Chocolate Chips',
      price_adjustment: 1.50,
      is_default: false,
      display_order: 3
    },
    {
      item_option_id: toppingsOptions._id,
      name: 'Whipped Cream',
      price_adjustment: 1.00,
      is_default: false,
      display_order: 4
    }
  ]);
  
  const breadOptions = await ItemOption.create({
    menu_item_id: chickenPanini._id,
    name: 'Bread Choice',
    description: 'Select your bread type',
    is_required: true,
    min_selections: 1,
    max_selections: 1,
    display_order: 1
  });
  
  await OptionChoice.insertMany([
    {
      item_option_id: breadOptions._id,
      name: 'Ciabatta (Traditional)',
      price_adjustment: 0,
      is_default: true,
      display_order: 1
    },
    {
      item_option_id: breadOptions._id,
      name: 'Sourdough',
      price_adjustment: 0,
      is_default: false,
      display_order: 2
    },
    {
      item_option_id: breadOptions._id,
      name: 'Gluten-Free Bread',
      price_adjustment: 2.00,
      is_default: false,
      display_order: 3
    }
  ]);
  
  const sideOptions = await ItemOption.create({
    menu_item_id: salmon._id,
    name: 'Side Options',
    description: 'Choose your side',
    is_required: true,
    min_selections: 1,
    max_selections: 1,
    display_order: 1
  });
  
  await OptionChoice.insertMany([
    {
      item_option_id: sideOptions._id,
      name: 'Quinoa Pilaf (Traditional)',
      price_adjustment: 0,
      is_default: true,
      display_order: 1
    },
    {
      item_option_id: sideOptions._id,
      name: 'Mashed Potatoes',
      price_adjustment: 0,
      is_default: false,
      display_order: 2
    },
    {
      item_option_id: sideOptions._id,
      name: 'Wild Rice',
      price_adjustment: 0,
      is_default: false,
      display_order: 3
    },
    {
      item_option_id: sideOptions._id,
      name: 'French Fries',
      price_adjustment: 0,
      is_default: false,
      display_order: 4
    }
  ]);
  
  const smoothieOptions = await ItemOption.create({
    menu_item_id: smoothie._id,
    name: 'Base Options',
    description: 'Choose your smoothie base',
    is_required: true,
    min_selections: 1,
    max_selections: 1,
    display_order: 1
  });
  
  await OptionChoice.insertMany([
    {
      item_option_id: smoothieOptions._id,
      name: 'Yogurt (Traditional)',
      price_adjustment: 0,
      is_default: true,
      display_order: 1
    },
    {
      item_option_id: smoothieOptions._id,
      name: 'Almond Milk',
      price_adjustment: 1.00,
      is_default: false,
      display_order: 2
    },
    {
      item_option_id: smoothieOptions._id,
      name: 'Coconut Milk',
      price_adjustment: 1.00,
      is_default: false,
      display_order: 3
    },
    {
      item_option_id: smoothieOptions._id,
      name: 'Oat Milk',
      price_adjustment: 1.00,
      is_default: false,
      display_order: 4
    }
  ]);
  
  const smoothieAddOns = await ItemOption.create({
    menu_item_id: smoothie._id,
    name: 'Add-Ons',
    description: 'Enhance your smoothie with add-ons',
    is_required: false,
    min_selections: 0,
    max_selections: 3,
    display_order: 2
  });
  
  await OptionChoice.insertMany([
    {
      item_option_id: smoothieAddOns._id,
      name: 'Protein Powder',
      price_adjustment: 2.00,
      is_default: false,
      display_order: 1
    },
    {
      item_option_id: smoothieAddOns._id,
      name: 'Chia Seeds',
      price_adjustment: 1.00,
      is_default: false,
      display_order: 2
    },
    {
      item_option_id: smoothieAddOns._id,
      name: 'Flax Seeds',
      price_adjustment: 1.00,
      is_default: false,
      display_order: 3
    },
    {
      item_option_id: smoothieAddOns._id,
      name: 'Spinach',
      price_adjustment: 1.00,
      is_default: false,
      display_order: 4
    },
    {
      item_option_id: smoothieAddOns._id,
      name: 'Avocado',
      price_adjustment: 1.50,
      is_default: false,
      display_order: 5
    }
  ]);
  
  console.log('Item options created');
}

// Create translations
async function createTranslations(restaurant, menuSections, categories, menuItems, languages) {
  console.log('Creating translations...');
  
  const spanishLanguage = languages.find(lang => lang.code === 'es');
  const frenchLanguage = languages.find(lang => lang.code === 'fr');
  const chineseLanguage = languages.find(lang => lang.code === 'zh');
  
  // Restaurant translations
  await Translation.insertMany([
    // Spanish translations
    {
      language_code: spanishLanguage.code,
      entity_type: 'restaurant',
      entity_id: restaurant._id,
      field: 'name',
      translation: 'Fusión Gourmet'
    },
    {
      language_code: spanishLanguage.code,
      entity_type: 'restaurant',
      entity_id: restaurant._id,
      field: 'description',
      translation: 'Un restaurante moderno que ofrece una fusión de cocinas internacionales con énfasis en ingredientes frescos y locales.'
    },
    
    // French translations
    {
      language_code: frenchLanguage.code,
      entity_type: 'restaurant',
      entity_id: restaurant._id,
      field: 'name',
      translation: 'Fusion Gastronomique'
    },
    {
      language_code: frenchLanguage.code,
      entity_type: 'restaurant',
      entity_id: restaurant._id,
      field: 'description',
      translation: 'Un restaurant moderne offrant une fusion de cuisines internationales avec un accent sur les ingrédients frais et locaux.'
    },
    
    // Chinese translations
    {
      language_code: chineseLanguage.code,
      entity_type: 'restaurant',
      entity_id: restaurant._id,
      field: 'name',
      translation: '美食融合'
    },
    {
      language_code: chineseLanguage.code,
      entity_type: 'restaurant',
      entity_id: restaurant._id,
      field: 'description',
      translation: '一家现代餐厅，提供国际美食融合，注重新鲜和当地食材。'
    }
  ]);
  
  // Menu section translations
  const breakfastSection = menuSections.find(section => section.name === 'Breakfast');
  const lunchSection = menuSections.find(section => section.name === 'Lunch');
  const dinnerSection = menuSections.find(section => section.name === 'Dinner');
  const drinksSection = menuSections.find(section => section.name === 'Drinks');
  
  await Translation.insertMany([
    // Spanish translations
    {
      language_code: spanishLanguage.code,
      entity_type: 'menu_section',
      entity_id: breakfastSection._id,
      field: 'name',
      translation: 'Desayuno'
    },
    {
      language_code: spanishLanguage.code,
      entity_type: 'menu_section',
      entity_id: lunchSection._id,
      field: 'name',
      translation: 'Almuerzo'
    },
    {
      language_code: spanishLanguage.code,
      entity_type: 'menu_section',
      entity_id: dinnerSection._id,
      field: 'name',
      translation: 'Cena'
    },
    {
      language_code: spanishLanguage.code,
      entity_type: 'menu_section',
      entity_id: drinksSection._id,
      field: 'name',
      translation: 'Bebidas'
    },
    
    // French translations
    {
      language_code: frenchLanguage.code,
      entity_type: 'menu_section',
      entity_id: breakfastSection._id,
      field: 'name',
      translation: 'Petit Déjeuner'
    },
    {
      language_code: frenchLanguage.code,
      entity_type: 'menu_section',
      entity_id: lunchSection._id,
      field: 'name',
      translation: 'Déjeuner'
    },
    {
      language_code: frenchLanguage.code,
      entity_type: 'menu_section',
      entity_id: dinnerSection._id,
      field: 'name',
      translation: 'Dîner'
    },
    {
      language_code: frenchLanguage.code,
      entity_type: 'menu_section',
      entity_id: drinksSection._id,
      field: 'name',
      translation: 'Boissons'
    },
    
    // Chinese translations
    {
      language_code: chineseLanguage.code,
      entity_type: 'menu_section',
      entity_id: breakfastSection._id,
      field: 'name',
      translation: '早餐'
    },
    {
      language_code: chineseLanguage.code,
      entity_type: 'menu_section',
      entity_id: lunchSection._id,
      field: 'name',
      translation: '午餐'
    },
    {
      language_code: chineseLanguage.code,
      entity_type: 'menu_section',
      entity_id: dinnerSection._id,
      field: 'name',
      translation: '晚餐'
    },
    {
      language_code: chineseLanguage.code,
      entity_type: 'menu_section',
      entity_id: drinksSection._id,
      field: 'name',
      translation: '饮料'
    }
  ]);
  
  // Sample menu item translations
  const eggsBenedict = menuItems.find(item => item.name === 'Classic Eggs Benedict');
  const avocadoToast = menuItems.find(item => item.name === 'Avocado Toast');
  const grilledSalmon = menuItems.find(item => item.name === 'Grilled Salmon');
  
  await Translation.insertMany([
    // Spanish translations
    {
      language_code: spanishLanguage.code,
      entity_type: 'menu_item',
      entity_id: eggsBenedict._id,
      field: 'name',
      translation: 'Huevos Benedict Clásicos'
    },
    {
      language_code: spanishLanguage.code,
      entity_type: 'menu_item',
      entity_id: eggsBenedict._id,
      field: 'description',
      translation: 'Huevos pochados sobre muffin inglés con tocino canadiense y salsa holandesa'
    },
    {
      language_code: spanishLanguage.code,
      entity_type: 'menu_item',
      entity_id: avocadoToast._id,
      field: 'name',
      translation: 'Tostada de Aguacate'
    },
    {
      language_code: spanishLanguage.code,
      entity_type: 'menu_item',
      entity_id: avocadoToast._id,
      field: 'description',
      translation: 'Tostada de pan multigrano con aguacate, tomates cherry, microvegetales y un huevo pochado'
    },
    {
      language_code: spanishLanguage.code,
      entity_type: 'menu_item',
      entity_id: grilledSalmon._id,
      field: 'name',
      translation: 'Salmón a la Parrilla'
    },
    {
      language_code: spanishLanguage.code,
      entity_type: 'menu_item',
      entity_id: grilledSalmon._id,
      field: 'description',
      translation: 'Salmón del Atlántico a la parrilla con mantequilla de hierbas y limón, servido con vegetales asados y pilaf de quinoa'
    },
    
    // French translations
    {
      language_code: frenchLanguage.code,
      entity_type: 'menu_item',
      entity_id: eggsBenedict._id,
      field: 'name',
      translation: 'Œufs Bénédicte Classiques'
    },
    {
      language_code: frenchLanguage.code,
      entity_type: 'menu_item',
      entity_id: eggsBenedict._id,
      field: 'description',
      translation: 'Œufs pochés sur muffin anglais avec bacon canadien et sauce hollandaise'
    },
    {
      language_code: frenchLanguage.code,
      entity_type: 'menu_item',
      entity_id: avocadoToast._id,
      field: 'name',
      translation: 'Toast à l\'Avocat'
    },
    {
      language_code: frenchLanguage.code,
      entity_type: 'menu_item',
      entity_id: avocadoToast._id,
      field: 'description',
      translation: 'Pain multigrain garni d\'avocat écrasé, tomates cerises, micro-pousses et un œuf poché'
    },
    {
      language_code: frenchLanguage.code,
      entity_type: 'menu_item',
      entity_id: grilledSalmon._id,
      field: 'name',
      translation: 'Saumon Grillé'
    },
    {
      language_code: frenchLanguage.code,
      entity_type: 'menu_item',
      entity_id: grilledSalmon._id,
      field: 'description',
      translation: 'Saumon atlantique grillé avec beurre aux herbes et citron, servi avec légumes rôtis et pilaf de quinoa'
    },
    
    // Chinese translations
    {
      language_code: chineseLanguage.code,
      entity_type: 'menu_item',
      entity_id: eggsBenedict._id,
      field: 'name',
      translation: '经典班尼迪克蛋'
    },
    {
      language_code: chineseLanguage.code,
      entity_type: 'menu_item',
      entity_id: eggsBenedict._id,
      field: 'description',
      translation: '水波蛋配英式松饼、加拿大培根和荷兰酱'
    },
    {
      language_code: chineseLanguage.code,
      entity_type: 'menu_item',
      entity_id: avocadoToast._id,
      field: 'name',
      translation: '牛油果吐司'
    },
    {
      language_code: chineseLanguage.code,
      entity_type: 'menu_item',
      entity_id: avocadoToast._id,
      field: 'description',
      translation: '多谷物吐司配捣碎的牛油果、樱桃番茄、微型蔬菜和水波蛋'
    },
    {
      language_code: chineseLanguage.code,
      entity_type: 'menu_item',
      entity_id: grilledSalmon._id,
      field: 'name',
      translation: '烤三文鱼'
    },
    {
      language_code: chineseLanguage.code,
      entity_type: 'menu_item',
      entity_id: grilledSalmon._id,
      field: 'description',
      translation: '烤大西洋三文鱼配柠檬香草黄油，搭配烤蔬菜和藜麦饭'
    }
  ]);
  
  console.log('Translations created');
}

// Create promotions
async function createPromotions(restaurant, categories, menuItems) {
  console.log('Creating promotions...');
  
  // Find specific categories
  const breakfastCategory = categories.find(category => category.name === 'Egg Specialties');
  const mainCoursesCategory = categories.find(category => category.name === 'Main Courses');
  
  // Create promotions
  const happyHourPromotion = await Promotion.create({
    restaurant_id: restaurant._id,
    name: 'Happy Hour Special',
    description: 'Enjoy 20% off all drinks from 4pm to 6pm, Monday to Friday',
    start_date: new Date('2025-01-01'),
    end_date: new Date('2025-12-31'),
    discount_type: 'percentage',
    discount_value: 20,
    min_order_amount: 0,
    max_discount_amount: null,
    usage_limit: null,
    usage_count: 0,
    is_active: true,
    applies_to: 'specific_categories'
  });
  
  const weekendBrunchPromotion = await Promotion.create({
    restaurant_id: restaurant._id,
    name: 'Weekend Brunch Special',
    description: 'Get a free coffee with any breakfast item on weekends',
    start_date: new Date('2025-01-01'),
    end_date: new Date('2025-12-31'),
    discount_type: 'fixed',
    discount_value: 3.95,
    min_order_amount: 10,
    max_discount_amount: 3.95,
    usage_limit: null,
    usage_count: 0,
    is_active: true,
    applies_to: 'specific_categories'
  });
  
  const newCustomerPromotion = await Promotion.create({
    restaurant_id: restaurant._id,
    name: 'New Customer Discount',
    description: '15% off your first order',
    start_date: new Date('2025-01-01'),
    end_date: new Date('2025-12-31'),
    discount_type: 'percentage',
    discount_value: 15,
    min_order_amount: 0,
    max_discount_amount: 50,
    usage_limit: 1,
    usage_count: 0,
    is_active: true,
    applies_to: 'all'
  });
  
  // Create promotion items
  await PromotionItem.create({
    promotion_id: happyHourPromotion._id,
    item_type: 'category',
    item_id: categories.find(category => category.name === 'Cocktails')._id
  });
  
  await PromotionItem.create({
    promotion_id: happyHourPromotion._id,
    item_type: 'category',
    item_id: categories.find(category => category.name === 'Wine')._id
  });
  
  await PromotionItem.create({
    promotion_id: happyHourPromotion._id,
    item_type: 'category',
    item_id: categories.find(category => category.name === 'Non-Alcoholic')._id
  });
  
  await PromotionItem.create({
    promotion_id: weekendBrunchPromotion._id,
    item_type: 'category',
    item_id: categories.find(category => category.name === 'Egg Specialties')._id
  });
  
  await PromotionItem.create({
    promotion_id: weekendBrunchPromotion._id,
    item_type: 'category',
    item_id: categories.find(category => category.name === 'Pancakes & Waffles')._id
  });
  
  await PromotionItem.create({
    promotion_id: weekendBrunchPromotion._id,
    item_type: 'category',
    item_id: categories.find(category => category.name === 'Healthy Options')._id
  });
  
  console.log('Promotions created');
}

// Run the seed function
seedDemoData();
