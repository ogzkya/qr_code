# Customer-Facing Menu Wireframes

## Mobile-First Design Approach

Our QR code menu system will use a mobile-first design approach since most users will access the menu via their smartphones after scanning a QR code. The interface will be clean, intuitive, and optimized for touch interactions.

## Main Pages

### 1. Landing Page / Home

```
+----------------------------------+
|                                  |
|  [Restaurant Logo]               |
|                                  |
|  Restaurant Name                 |
|                                  |
|  Address                         |
|  Phone Number                    |
|                                  |
|  [Language Selector]             |
|                                  |
|  +----------------------------+  |
|  |                            |  |
|  |  [Main Menu Button]        |  |
|  |                            |  |
|  +----------------------------+  |
|                                  |
|  +----------------------------+  |
|  |                            |  |
|  |  [Bar Menu Button]         |  |
|  |                            |  |
|  +----------------------------+  |
|                                  |
|  Additional Information:         |
|  - Working Hours                 |
|  - WiFi Password                 |
|  - Special Notes                 |
|                                  |
|  [Search Bar]                    |
|                                  |
+----------------------------------+
```

### 2. Menu Categories Page

```
+----------------------------------+
|                                  |
|  [Back Button] Restaurant Name   |
|                                  |
|  [Search Bar]                    |
|                                  |
|  +----------------------------+  |
|  |                            |  |
|  |  [Category 1 Image]        |  |
|  |                            |  |
|  |  Category 1 Name           |  |
|  |  (e.g., Breakfasts)        |  |
|  |                            |  |
|  +----------------------------+  |
|                                  |
|  +----------------------------+  |
|  |                            |  |
|  |  [Category 2 Image]        |  |
|  |                            |  |
|  |  Category 2 Name           |  |
|  |  (e.g., Hot Meals)         |  |
|  |                            |  |
|  +----------------------------+  |
|                                  |
|  +----------------------------+  |
|  |                            |  |
|  |  [Category 3 Image]        |  |
|  |                            |  |
|  |  Category 3 Name           |  |
|  |  (e.g., Salads)            |  |
|  |                            |  |
|  +----------------------------+  |
|                                  |
|  [More Categories...]            |
|                                  |
+----------------------------------+
```

### 3. Category Items Page

```
+----------------------------------+
|                                  |
|  [Back] Category Name            |
|                                  |
|  [Filter Options]                |
|  - Vegetarian                    |
|  - Gluten-Free                   |
|  - Price Range                   |
|                                  |
|  +----------------------------+  |
|  |                            |  |
|  |  [Item 1 Image]            |  |
|  |                            |  |
|  |  Item 1 Name               |  |
|  |  Item Description          |  |
|  |                            |  |
|  |  Weight/Portion  Price     |  |
|  |                            |  |
|  |  [Add to Order Button]     |  |
|  |                            |  |
|  +----------------------------+  |
|                                  |
|  +----------------------------+  |
|  |                            |  |
|  |  [Item 2 Image]            |  |
|  |                            |  |
|  |  Item 2 Name               |  |
|  |  Item Description          |  |
|  |                            |  |
|  |  Weight/Portion  Price     |  |
|  |                            |  |
|  |  [Add to Order Button]     |  |
|  |                            |  |
|  +----------------------------+  |
|                                  |
|  [More Items...]                 |
|                                  |
+----------------------------------+
```

### 4. Item Detail Page

```
+----------------------------------+
|                                  |
|  [Back] Item Name                |
|                                  |
|  [Full Item Image]               |
|                                  |
|  Price: $XX.XX                   |
|  Weight/Portion: XXXg            |
|  Preparation Time: XX min        |
|                                  |
|  Description:                    |
|  Detailed item description with  |
|  ingredients and preparation     |
|  method.                         |
|                                  |
|  Dietary Information:            |
|  [V] Vegetarian                  |
|  [ ] Vegan                       |
|  [✓] Gluten-Free                 |
|                                  |
|  Allergens:                      |
|  - Nuts                          |
|  - Dairy                         |
|                                  |
|  Nutritional Information:        |
|  - Calories: XXX                 |
|  - Protein: XXg                  |
|  - Carbs: XXg                    |
|  - Fat: XXg                      |
|                                  |
|  Options:                        |
|  [ ] Extra cheese (+$2.00)       |
|  [ ] No onions                   |
|  [ ] Spicy                       |
|                                  |
|  Special Instructions:           |
|  [Text Input Field]              |
|                                  |
|  Quantity: [-] 1 [+]             |
|                                  |
|  [Add to Order - $XX.XX]         |
|                                  |
+----------------------------------+
```

### 5. Search Results Page

```
+----------------------------------+
|                                  |
|  [Back] Search Results           |
|                                  |
|  [Search Bar with Query]         |
|                                  |
|  Results for "pasta":            |
|                                  |
|  +----------------------------+  |
|  |                            |  |
|  |  [Item Image]              |  |
|  |                            |  |
|  |  Spaghetti Carbonara       |  |
|  |  Category: Hot Meals       |  |
|  |                            |  |
|  |  $12.99                    |  |
|  |                            |  |
|  +----------------------------+  |
|                                  |
|  +----------------------------+  |
|  |                            |  |
|  |  [Item Image]              |  |
|  |                            |  |
|  |  Pasta Primavera           |  |
|  |  Category: Hot Meals       |  |
|  |                            |  |
|  |  $10.99                    |  |
|  |                            |  |
|  +----------------------------+  |
|                                  |
|  No more results.                |
|                                  |
+----------------------------------+
```

### 6. Order Summary Page (Advanced Feature)

```
+----------------------------------+
|                                  |
|  [Back] Your Order               |
|                                  |
|  Table #: [Dropdown]             |
|                                  |
|  Items:                          |
|                                  |
|  +----------------------------+  |
|  | Spaghetti Carbonara    1x  |  |
|  | - Extra cheese             |  |
|  | - No onions                |  |
|  |                    $14.99  |  |
|  | [Edit] [Remove]            |  |
|  +----------------------------+  |
|                                  |
|  +----------------------------+  |
|  | Caesar Salad           1x  |  |
|  | - No croutons              |  |
|  |                     $8.99  |  |
|  | [Edit] [Remove]            |  |
|  +----------------------------+  |
|                                  |
|  Subtotal:             $23.98    |
|  Tax (10%):             $2.40    |
|  Total:                $26.38    |
|                                  |
|  Special Instructions:           |
|  [Text Input Field]              |
|                                  |
|  [Place Order]                   |
|                                  |
|  [Continue Browsing]             |
|                                  |
+----------------------------------+
```

### 7. Order Confirmation Page (Advanced Feature)

```
+----------------------------------+
|                                  |
|  Order Confirmed!                |
|                                  |
|  [Success Icon]                  |
|                                  |
|  Your order #12345 has been      |
|  received and is being prepared. |
|                                  |
|  Estimated preparation time:     |
|  25 minutes                      |
|                                  |
|  Order Summary:                  |
|  - Spaghetti Carbonara (1x)      |
|  - Caesar Salad (1x)             |
|                                  |
|  Total: $26.38                   |
|                                  |
|  [View Order Status]             |
|                                  |
|  [Return to Menu]                |
|                                  |
+----------------------------------+
```

### 8. Feedback Form (Advanced Feature)

```
+----------------------------------+
|                                  |
|  [Back] Rate Your Experience     |
|                                  |
|  How was your meal?              |
|                                  |
|  [Star Rating: 1-5]              |
|                                  |
|  Which items did you order?      |
|  [Checkbox list of ordered items]|
|                                  |
|  Comments:                       |
|  [Text Area]                     |
|                                  |
|  Your Name (optional):           |
|  [Text Input]                    |
|                                  |
|  Email (optional):               |
|  [Email Input]                   |
|                                  |
|  [Submit Feedback]               |
|                                  |
+----------------------------------+
```

### 9. Reservation Form (Advanced Feature)

```
+----------------------------------+
|                                  |
|  [Back] Make a Reservation       |
|                                  |
|  Date:                           |
|  [Date Picker]                   |
|                                  |
|  Time:                           |
|  [Time Picker]                   |
|                                  |
|  Number of People:               |
|  [Number Input]                  |
|                                  |
|  Your Name:                      |
|  [Text Input]                    |
|                                  |
|  Phone Number:                   |
|  [Phone Input]                   |
|                                  |
|  Email:                          |
|  [Email Input]                   |
|                                  |
|  Special Requests:               |
|  [Text Area]                     |
|                                  |
|  [Check Availability]            |
|                                  |
+----------------------------------+
```

## Responsive Design Considerations

The wireframes above represent the mobile view, but the design will be responsive and adapt to larger screens:

### Tablet View
- Two-column layout for category and item listings
- Larger images
- More visible filtering options
- Sticky navigation

### Desktop View
- Three or four-column layout for category and item listings
- Sidebar for filters and navigation
- Expanded item details without needing to navigate to a separate page
- Split-screen view for order summary while browsing

## UI Components

### Navigation Bar
- Sticky header with restaurant logo/name
- Back button
- Menu section tabs (Main Menu, Bar)
- Search icon
- Order summary icon with item count
- Language selector

### Item Cards
- High-quality image
- Item name
- Brief description
- Price
- Weight/portion
- Dietary icons (vegetarian, gluten-free, etc.)
- Add to order button

### Filters
- Dietary preferences (vegetarian, vegan, gluten-free)
- Allergen filters
- Price range slider
- Spiciness level
- Sort options (price, popularity)

### Order Management
- Floating cart icon with item count
- Easy quantity adjustment
- Option modifications
- Special instructions field
- Order status tracking

## Interactive Elements

- Smooth scrolling
- Image galleries for items with multiple photos
- Swipeable categories
- Animated transitions between pages
- Pull-to-refresh for menu updates
- Tap-to-expand item details
- Double-tap to add to favorites
