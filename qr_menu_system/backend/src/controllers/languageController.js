const Language = require('../models/Language');
const Translation = require('../models/Translation');
const Restaurant = require('../models/Restaurant');
const RestaurantAdmin = require('../models/RestaurantAdmin');
const MenuSection = require('../models/MenuSection');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const Promotion = require('../models/Promotion');

// @desc    Get all languages
// @route   GET /api/languages
// @access  Public
exports.getLanguages = async (req, res) => {
  try {
    const languages = await Language.find({ is_active: true }).sort({ is_default: -1, name: 1 });

    res.status(200).json({
      success: true,
      count: languages.length,
      data: languages
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single language
// @route   GET /api/languages/:id
// @access  Public
exports.getLanguage = async (req, res) => {
  try {
    const language = await Language.findById(req.params.id);

    if (!language) {
      return res.status(404).json({
        success: false,
        message: 'Language not found'
      });
    }

    res.status(200).json({
      success: true,
      data: language
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new language
// @route   POST /api/languages
// @access  Private (Admin only)
exports.createLanguage = async (req, res) => {
  try {
    const { code, name, is_active, is_default } = req.body;

    // Check if language code already exists
    const existingLanguage = await Language.findOne({ code });
    if (existingLanguage) {
      return res.status(400).json({
        success: false,
        message: 'Language code already exists'
      });
    }

    // If setting as default, update all other languages
    if (is_default) {
      await Language.updateMany({}, { is_default: false });
    }

    // Create language
    const language = await Language.create({
      code,
      name,
      is_active,
      is_default
    });

    res.status(201).json({
      success: true,
      data: language
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update language
// @route   PUT /api/languages/:id
// @access  Private (Admin only)
exports.updateLanguage = async (req, res) => {
  try {
    const { name, is_active, is_default } = req.body;

    let language = await Language.findById(req.params.id);

    if (!language) {
      return res.status(404).json({
        success: false,
        message: 'Language not found'
      });
    }

    // If setting as default, update all other languages
    if (is_default && !language.is_default) {
      await Language.updateMany({}, { is_default: false });
    }

    // Update language
    language = await Language.findByIdAndUpdate(
      req.params.id,
      { name, is_active, is_default },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: language
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete language
// @route   DELETE /api/languages/:id
// @access  Private (Admin only)
exports.deleteLanguage = async (req, res) => {
  try {
    const language = await Language.findById(req.params.id);

    if (!language) {
      return res.status(404).json({
        success: false,
        message: 'Language not found'
      });
    }

    // Check if it's the default language
    if (language.is_default) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete default language'
      });
    }

    // Delete all translations for this language
    await Translation.deleteMany({ language_id: language._id });

    // Delete language
    await language.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get translations for a restaurant
// @route   GET /api/languages/translations/restaurant/:restaurantId
// @access  Public
exports.getRestaurantTranslations = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { language_id } = req.query;

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Check if language exists
    if (language_id) {
      const language = await Language.findById(language_id);
      if (!language) {
        return res.status(404).json({
          success: false,
          message: 'Language not found'
        });
      }
    }

    // Get all menu sections for this restaurant
    const menuSections = await MenuSection.find({ restaurant_id: restaurantId });
    const menuSectionIds = menuSections.map(section => section._id);

    // Get all categories for these menu sections
    const categories = await Category.find({ menu_section_id: { $in: menuSectionIds } });
    const categoryIds = categories.map(category => category._id);

    // Get all menu items for these categories
    const menuItems = await MenuItem.find({ category_id: { $in: categoryIds } });
    const menuItemIds = menuItems.map(item => item._id);

    // Get promotions for this restaurant
    const promotions = await Promotion.find({ restaurant_id: restaurantId });
    const promotionIds = promotions.map(promo => promo._id);

    // Build query for translations
    let query = {
      $or: [
        { translatable_type: 'restaurant', translatable_id: restaurantId },
        { translatable_type: 'menu_section', translatable_id: { $in: menuSectionIds } },
        { translatable_type: 'category', translatable_id: { $in: categoryIds } },
        { translatable_type: 'menu_item', translatable_id: { $in: menuItemIds } },
        { translatable_type: 'promotion', translatable_id: { $in: promotionIds } }
      ]
    };

    // Add language filter if provided
    if (language_id) {
      query.language_id = language_id;
    }

    // Get translations
    const translations = await Translation.find(query);

    // Organize translations by type and ID
    const organizedTranslations = {};

    translations.forEach(translation => {
      const key = `${translation.translatable_type}_${translation.translatable_id}_${translation.language_id}`;
      
      if (!organizedTranslations[key]) {
        organizedTranslations[key] = {
          type: translation.translatable_type,
          id: translation.translatable_id,
          language_id: translation.language_id,
          translations: {}
        };
      }
      
      organizedTranslations[key].translations[translation.field] = translation.translation;
    });

    res.status(200).json({
      success: true,
      count: translations.length,
      data: Object.values(organizedTranslations)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create or update translation
// @route   POST /api/languages/translations
// @access  Private
exports.createTranslation = async (req, res) => {
  try {
    const { 
      language_id, 
      translatable_type, 
      translatable_id, 
      field, 
      translation 
    } = req.body;

    // Validate input
    if (!language_id || !translatable_type || !translatable_id || !field || !translation) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if language exists
    const language = await Language.findById(language_id);
    if (!language) {
      return res.status(404).json({
        success: false,
        message: 'Language not found'
      });
    }

    // Check if translatable item exists and user has access
    let restaurantId;

    switch (translatable_type) {
      case 'restaurant':
        const restaurant = await Restaurant.findById(translatable_id);
        if (!restaurant) {
          return res.status(404).json({
            success: false,
            message: 'Restaurant not found'
          });
        }
        restaurantId = restaurant._id;
        break;

      case 'menu_section':
        const menuSection = await MenuSection.findById(translatable_id);
        if (!menuSection) {
          return res.status(404).json({
            success: false,
            message: 'Menu section not found'
          });
        }
        restaurantId = menuSection.restaurant_id;
        break;

      case 'category':
        const category = await Category.findById(translatable_id);
        if (!category) {
          return res.status(404).json({
            success: false,
            message: 'Category not found'
          });
        }
        const categoryMenuSection = await MenuSection.findById(category.menu_section_id);
        restaurantId = categoryMenuSection.restaurant_id;
        break;

      case 'menu_item':
        const menuItem = await MenuItem.findById(translatable_id);
        if (!menuItem) {
          return res.status(404).json({
            success: false,
            message: 'Menu item not found'
          });
        }
        const itemCategory = await Category.findById(menuItem.category_id);
        const itemMenuSection = await MenuSection.findById(itemCategory.menu_section_id);
        restaurantId = itemMenuSection.restaurant_id;
        break;

      case 'promotion':
        const promotion = await Promotion.findById(translatable_id);
        if (!promotion) {
          return res.status(404).json({
            success: false,
            message: 'Promotion not found'
          });
        }
        restaurantId = promotion.restaurant_id;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid translatable type'
        });
    }

    // Check if user has access to this restaurant
    const adminRecord = await RestaurantAdmin.findOne({
      restaurant_id: restaurantId,
      user_id: req.user.id
    });

    if (!adminRecord || (adminRecord.role !== 'owner' && adminRecord.role !== 'manager')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create translations for this item'
      });
    }

    // Check if translation already exists
    let translationRecord = await Translation.findOne({
      language_id,
      translatable_type,
      translatable_id,
      field
    });

    if (translationRecord) {
      // Update existing translation
      translationRecord.translation = translation;
      await translationRecord.save();
    } else {
      // Create new translation
      translationRecord = await Translation.create({
        language_id,
        translatable_type,
        translatable_id,
        field,
        translation
      });
    }

    res.status(200).json({
      success: true,
      data: translationRecord
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete translation
// @route   DELETE /api/languages/translations/:id
// @access  Private
exports.deleteTranslation = async (req, res) => {
  try {
    const translation = await Translation.findById(req.params.id);

    if (!translation) {
      return res.status(404).json({
        success: false,
        message: 'Translation not found'
      });
    }

    // Check if user has access to this translation
    let restaurantId;

    switch (translation.translatable_type) {
      case 'restaurant':
        restaurantId = translation.translatable_id;
        break;

      case 'menu_section':
        const menuSection = await MenuSection.findById(translation.translatable_id);
        if (!menuSection) {
          return res.status(404).json({
            success: false,
            message: 'Menu section not found'
          });
        }
        restaurantId = menuSection.restaurant_id;
        break;

      case 'category':
        const category = await Category.findById(translation.translatable_id);
        if (!category) {
          return res.status(404).json({
            success: false,
            message: 'Category not found'
          });
        }
        const categoryMenuSection = await MenuSection.findById(category.menu_section_id);
        restaurantId = categoryMenuSection.restaurant_id;
        break;

      case 'menu_item':
        const menuItem = await MenuItem.findById(translation.translatable_id);
        if (!menuItem) {
          return res.status(404).json({
            success: false,
            message: 'Menu item not found'
          });
        }
        const itemCategory = await Category.findById(menuItem.category_id);
        const itemMenuSection = await MenuSection.findById(itemCategory.menu_section_id);
        restaurantId = itemMenuSection.restaurant_id;
        break;

      case 'promotion':
        const promotion = await Promotion.findById(translation.translatable_id);
        if (!promotion) {
          return res.status(404).json({
            success: false,
            message: 'Promotion not found'
          });
        }
        restaurantId = promotion.restaurant_id;
        break;
    }

    const adminRecord = await RestaurantAdmin.findOne({
      restaurant_id: restaurantId,
      user_id: req.user.id
    });

    if (!adminRecord || (adminRecord.role !== 'owner' && adminRecord.role !== 'manager')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this translation'
      });
    }

    await translation.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
