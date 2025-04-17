# Advanced QR Code Menu System - Database Schema

## Overview
This document outlines the database schema for our advanced QR code menu system. The schema is designed to support all the features of the reference site (oddmenu.com) plus additional advanced functionality.

## Database Tables

### 1. Restaurants
```
Table: restaurants
- id: UUID (Primary Key)
- name: VARCHAR(255)
- slug: VARCHAR(255) (unique, for URL generation)
- logo: VARCHAR(255) (path to logo image)
- address: TEXT
- phone: VARCHAR(50)
- email: VARCHAR(255)
- website: VARCHAR(255)
- wifi_password: VARCHAR(255)
- additional_info: TEXT
- working_hours: JSON
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 2. Restaurant Admins
```
Table: restaurant_admins
- id: UUID (Primary Key)
- restaurant_id: UUID (Foreign Key to restaurants.id)
- user_id: UUID (Foreign Key to users.id)
- role: ENUM('owner', 'manager', 'staff')
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 3. Users
```
Table: users
- id: UUID (Primary Key)
- email: VARCHAR(255) (unique)
- password_hash: VARCHAR(255)
- first_name: VARCHAR(100)
- last_name: VARCHAR(100)
- phone: VARCHAR(50)
- is_active: BOOLEAN
- last_login: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 4. Menu Sections
```
Table: menu_sections
- id: UUID (Primary Key)
- restaurant_id: UUID (Foreign Key to restaurants.id)
- name: VARCHAR(255)
- slug: VARCHAR(255)
- display_order: INTEGER
- is_active: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 5. Categories
```
Table: categories
- id: UUID (Primary Key)
- menu_section_id: UUID (Foreign Key to menu_sections.id)
- name: VARCHAR(255)
- slug: VARCHAR(255)
- description: TEXT
- image: VARCHAR(255) (path to category image)
- display_order: INTEGER
- availability_hours: JSON (e.g., "8 AM - 10 AM" for breakfast)
- is_active: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 6. Menu Items
```
Table: menu_items
- id: UUID (Primary Key)
- category_id: UUID (Foreign Key to categories.id)
- name: VARCHAR(255)
- slug: VARCHAR(255)
- description: TEXT
- image: VARCHAR(255) (path to item image)
- price: DECIMAL(10,2)
- discounted_price: DECIMAL(10,2)
- currency: VARCHAR(10)
- weight: INTEGER
- weight_unit: VARCHAR(10) (g, ml, etc.)
- preparation_time: INTEGER (in minutes)
- is_vegetarian: BOOLEAN
- is_vegan: BOOLEAN
- is_gluten_free: BOOLEAN
- spiciness_level: INTEGER (0-5)
- allergens: JSON (array of allergen codes)
- nutritional_info: JSON
- ingredients: TEXT
- display_order: INTEGER
- is_featured: BOOLEAN
- is_available: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 7. Item Options
```
Table: item_options
- id: UUID (Primary Key)
- menu_item_id: UUID (Foreign Key to menu_items.id)
- name: VARCHAR(255)
- description: TEXT
- min_selections: INTEGER
- max_selections: INTEGER
- is_required: BOOLEAN
- display_order: INTEGER
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 8. Option Choices
```
Table: option_choices
- id: UUID (Primary Key)
- item_option_id: UUID (Foreign Key to item_options.id)
- name: VARCHAR(255)
- description: TEXT
- price_adjustment: DECIMAL(10,2)
- display_order: INTEGER
- is_default: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 9. QR Codes
```
Table: qr_codes
- id: UUID (Primary Key)
- restaurant_id: UUID (Foreign Key to restaurants.id)
- name: VARCHAR(255) (e.g., "Table 1", "Bar Menu")
- type: ENUM('table', 'section', 'category', 'promotional')
- target_id: UUID (optional, can point to a specific section/category)
- image_path: VARCHAR(255)
- custom_design: JSON (for storing custom design parameters)
- short_url: VARCHAR(100)
- is_active: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 10. QR Code Scans
```
Table: qr_code_scans
- id: UUID (Primary Key)
- qr_code_id: UUID (Foreign Key to qr_codes.id)
- session_id: VARCHAR(255)
- ip_address: VARCHAR(45)
- user_agent: TEXT
- device_type: VARCHAR(50)
- referrer: VARCHAR(255)
- scanned_at: TIMESTAMP
```

### 11. Orders (Advanced Feature)
```
Table: orders
- id: UUID (Primary Key)
- restaurant_id: UUID (Foreign Key to restaurants.id)
- table_number: VARCHAR(50)
- customer_name: VARCHAR(255)
- customer_phone: VARCHAR(50)
- customer_email: VARCHAR(255)
- status: ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')
- total_amount: DECIMAL(10,2)
- payment_status: ENUM('pending', 'paid', 'failed')
- payment_method: VARCHAR(50)
- notes: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 12. Order Items
```
Table: order_items
- id: UUID (Primary Key)
- order_id: UUID (Foreign Key to orders.id)
- menu_item_id: UUID (Foreign Key to menu_items.id)
- quantity: INTEGER
- unit_price: DECIMAL(10,2)
- total_price: DECIMAL(10,2)
- special_instructions: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 13. Order Item Options
```
Table: order_item_options
- id: UUID (Primary Key)
- order_item_id: UUID (Foreign Key to order_items.id)
- option_choice_id: UUID (Foreign Key to option_choices.id)
- price_adjustment: DECIMAL(10,2)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 14. Reservations (Advanced Feature)
```
Table: reservations
- id: UUID (Primary Key)
- restaurant_id: UUID (Foreign Key to restaurants.id)
- customer_name: VARCHAR(255)
- customer_phone: VARCHAR(50)
- customer_email: VARCHAR(255)
- party_size: INTEGER
- reservation_date: DATE
- reservation_time: TIME
- special_requests: TEXT
- status: ENUM('pending', 'confirmed', 'cancelled', 'completed')
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 15. Feedback (Advanced Feature)
```
Table: feedback
- id: UUID (Primary Key)
- restaurant_id: UUID (Foreign Key to restaurants.id)
- menu_item_id: UUID (Foreign Key to menu_items.id, optional)
- rating: INTEGER (1-5)
- comment: TEXT
- customer_name: VARCHAR(255) (optional)
- customer_email: VARCHAR(255) (optional)
- is_published: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 16. Promotions (Advanced Feature)
```
Table: promotions
- id: UUID (Primary Key)
- restaurant_id: UUID (Foreign Key to restaurants.id)
- name: VARCHAR(255)
- description: TEXT
- image: VARCHAR(255)
- discount_type: ENUM('percentage', 'fixed_amount', 'buy_x_get_y')
- discount_value: DECIMAL(10,2)
- min_order_amount: DECIMAL(10,2)
- start_date: DATE
- end_date: DATE
- is_active: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 17. Promotion Items
```
Table: promotion_items
- id: UUID (Primary Key)
- promotion_id: UUID (Foreign Key to promotions.id)
- menu_item_id: UUID (Foreign Key to menu_items.id)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 18. Languages
```
Table: languages
- id: UUID (Primary Key)
- code: VARCHAR(10) (e.g., 'en', 'es', 'fr')
- name: VARCHAR(50)
- is_active: BOOLEAN
- is_default: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 19. Translations
```
Table: translations
- id: UUID (Primary Key)
- language_id: UUID (Foreign Key to languages.id)
- translatable_type: VARCHAR(255) (e.g., 'menu_item', 'category')
- translatable_id: UUID
- field: VARCHAR(50) (e.g., 'name', 'description')
- translation: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 20. Analytics
```
Table: analytics
- id: UUID (Primary Key)
- restaurant_id: UUID (Foreign Key to restaurants.id)
- date: DATE
- total_scans: INTEGER
- unique_visitors: INTEGER
- average_session_duration: INTEGER (in seconds)
- most_viewed_category_id: UUID (Foreign Key to categories.id)
- most_viewed_item_id: UUID (Foreign Key to menu_items.id)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## Relationships

1. A restaurant has many menu sections
2. A restaurant has many categories through menu sections
3. A restaurant has many menu items through categories
4. A restaurant has many QR codes
5. A restaurant has many orders
6. A restaurant has many reservations
7. A restaurant has many feedback entries
8. A restaurant has many promotions
9. A menu section belongs to a restaurant
10. A menu section has many categories
11. A category belongs to a menu section
12. A category has many menu items
13. A menu item belongs to a category
14. A menu item has many item options
15. An item option belongs to a menu item
16. An item option has many option choices
17. An option choice belongs to an item option
18. A QR code belongs to a restaurant
19. A QR code has many scans
20. An order belongs to a restaurant
21. An order has many order items
22. An order item belongs to an order
23. An order item belongs to a menu item
24. An order item has many order item options
25. An order item option belongs to an order item
26. A reservation belongs to a restaurant
27. A feedback entry belongs to a restaurant
28. A feedback entry may belong to a menu item
29. A promotion belongs to a restaurant
30. A promotion has many promotion items
31. A promotion item belongs to a promotion
32. A promotion item belongs to a menu item
33. A language has many translations
34. A translation belongs to a language
35. An analytics entry belongs to a restaurant

## Indexes

To optimize query performance, the following indexes should be created:

1. restaurants: slug
2. menu_sections: restaurant_id, slug
3. categories: menu_section_id, slug
4. menu_items: category_id, slug, is_featured, is_available
5. qr_codes: restaurant_id, short_url
6. qr_code_scans: qr_code_id, scanned_at
7. orders: restaurant_id, status, created_at
8. order_items: order_id, menu_item_id
9. reservations: restaurant_id, reservation_date, status
10. feedback: restaurant_id, menu_item_id, rating
11. promotions: restaurant_id, is_active, start_date, end_date
12. translations: language_id, translatable_type, translatable_id

This database schema provides a solid foundation for building an advanced QR code menu system with all the features of the reference site plus additional functionality like online ordering, reservations, feedback, promotions, and analytics.
