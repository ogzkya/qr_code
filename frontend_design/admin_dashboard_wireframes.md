# Admin Dashboard Wireframes

## Overview

The admin dashboard is designed for restaurant owners and staff to manage their digital menu, QR codes, orders, and other advanced features. The interface prioritizes efficiency and ease of use, with a responsive design that works well on both desktop and mobile devices.

## Main Pages

### 1. Login Page

```
+----------------------------------+
|                                  |
|  [Logo]                          |
|                                  |
|  Admin Dashboard Login           |
|                                  |
|  Email:                          |
|  [Email Input Field]             |
|                                  |
|  Password:                       |
|  [Password Input Field]          |
|                                  |
|  [Remember Me] Checkbox          |
|                                  |
|  [Login Button]                  |
|                                  |
|  [Forgot Password?]              |
|                                  |
+----------------------------------+
```

### 2. Dashboard Home

```
+----------------------------------+
|                                  |
|  [Logo] Restaurant Name    [User]|
|                                  |
|  +--------+                      |
|  |        |  Dashboard           |
|  | SIDEBAR|                      |
|  |        |  Quick Stats:        |
|  | Menu   |  +------+ +------+   |
|  | QR Codes|  |      | |      |   |
|  | Orders |  | Scans | | Orders|   |
|  | Reserv.|  | Today | | Today |   |
|  | Feedback|  | 125   | | 43    |   |
|  | Promos |  +------+ +------+   |
|  | Settings|                      |
|  |        |  +------+ +------+   |
|  |        |  |      | |      |   |
|  |        |  | Avg.  | | Most  |   |
|  |        |  | Time  | | Viewed|   |
|  |        |  | 15min | | Pasta |   |
|  +--------+  +------+ +------+   |
|                                  |
|  Recent Activity:                |
|  - New order #1234 (5 min ago)   |
|  - Menu item updated (1 hr ago)  |
|  - New reservation (3 hrs ago)   |
|                                  |
|  QR Code Scans (Last 7 Days):    |
|  [Line Chart]                    |
|                                  |
|  Popular Items:                  |
|  [Bar Chart]                     |
|                                  |
+----------------------------------+
```

### 3. Menu Management

```
+----------------------------------+
|                                  |
|  [Logo] Restaurant Name    [User]|
|                                  |
|  +--------+                      |
|  |        |  Menu Management     |
|  | SIDEBAR|                      |
|  |        |  [+ Add Section]     |
|  |        |                      |
|  |        |  Sections:           |
|  |        |                      |
|  |        |  Main Menu           |
|  |        |  [Edit] [Delete]     |
|  |        |                      |
|  |        |  - Breakfasts        |
|  |        |    [Edit] [Delete]   |
|  |        |                      |
|  |        |  - Hot Meals         |
|  |        |    [Edit] [Delete]   |
|  |        |                      |
|  |        |  - Salads            |
|  |        |    [Edit] [Delete]   |
|  |        |                      |
|  |        |  - Desserts          |
|  |        |    [Edit] [Delete]   |
|  |        |                      |
|  |        |  Bar                 |
|  |        |  [Edit] [Delete]     |
|  |        |                      |
|  |        |  - Cocktails         |
|  |        |    [Edit] [Delete]   |
|  |        |                      |
|  |        |  - Wine              |
|  |        |    [Edit] [Delete]   |
|  |        |                      |
|  +--------+  [+ Add Category]    |
|                                  |
|  [Save Changes]                  |
|                                  |
+----------------------------------+
```

### 4. Category Items Management

```
+----------------------------------+
|                                  |
|  [Logo] Restaurant Name    [User]|
|                                  |
|  +--------+                      |
|  |        |  Hot Meals Items     |
|  | SIDEBAR|                      |
|  |        |  [+ Add Item]        |
|  |        |                      |
|  |        |  [Search Items]      |
|  |        |                      |
|  |        |  [Filter: All ▼]     |
|  |        |                      |
|  |        |  Items:              |
|  |        |                      |
|  |        |  +------------------+|
|  |        |  | [Img] Steak      ||
|  |        |  | $24.99           ||
|  |        |  | [Edit] [Delete]  ||
|  |        |  | [Toggle Active]  ||
|  |        |  +------------------+|
|  |        |                      |
|  |        |  +------------------+|
|  |        |  | [Img] Pasta      ||
|  |        |  | $14.99           ||
|  |        |  | [Edit] [Delete]  ||
|  |        |  | [Toggle Active]  ||
|  |        |  +------------------+|
|  |        |                      |
|  |        |  +------------------+|
|  |        |  | [Img] Burger     ||
|  |        |  | $12.99           ||
|  |        |  | [Edit] [Delete]  ||
|  |        |  | [Toggle Active]  ||
|  |        |  +------------------+|
|  +--------+                      |
|                                  |
|  [Bulk Actions ▼] [Apply]        |
|                                  |
+----------------------------------+
```

### 5. Add/Edit Item Form

```
+----------------------------------+
|                                  |
|  [Logo] Restaurant Name    [User]|
|                                  |
|  +--------+                      |
|  |        |  Edit Item           |
|  | SIDEBAR|                      |
|  |        |  Item Information:   |
|  |        |                      |
|  |        |  Name:               |
|  |        |  [Text Input]        |
|  |        |                      |
|  |        |  Category:           |
|  |        |  [Dropdown]          |
|  |        |                      |
|  |        |  Description:        |
|  |        |  [Text Area]         |
|  |        |                      |
|  |        |  Price:              |
|  |        |  [Number Input]      |
|  |        |                      |
|  |        |  Discounted Price:   |
|  |        |  [Number Input]      |
|  |        |                      |
|  |        |  Weight/Portion:     |
|  |        |  [Number Input] [Unit]|
|  |        |                      |
|  |        |  Preparation Time:   |
|  |        |  [Number Input] min  |
|  |        |                      |
|  |        |  Image:              |
|  |        |  [File Upload]       |
|  |        |  [Current Image]     |
|  +--------+                      |
|                                  |
|  Dietary Options:                |
|  [ ] Vegetarian                  |
|  [ ] Vegan                       |
|  [ ] Gluten-Free                 |
|                                  |
|  Spiciness Level:                |
|  [Slider: 0-5]                   |
|                                  |
|  Allergens:                      |
|  [ ] Nuts [ ] Dairy [ ] Eggs     |
|  [ ] Soy  [ ] Wheat [ ] Fish     |
|  [ ] Shellfish                   |
|                                  |
|  Nutritional Information:        |
|  Calories: [Input]               |
|  Protein:  [Input] g             |
|  Carbs:    [Input] g             |
|  Fat:      [Input] g             |
|                                  |
|  Ingredients:                    |
|  [Text Area]                     |
|                                  |
|  Item Options:                   |
|  [+ Add Option Group]            |
|                                  |
|  Option Group: Size              |
|  Min selections: [Input]         |
|  Max selections: [Input]         |
|  Required: [Checkbox]            |
|                                  |
|  - Small (+$0.00) [Delete]       |
|  - Medium (+$2.00) [Delete]      |
|  - Large (+$4.00) [Delete]       |
|  [+ Add Choice]                  |
|                                  |
|  [+ Add Option Group]            |
|                                  |
|  Display Settings:               |
|  Display Order: [Input]          |
|  Featured Item: [Checkbox]       |
|  Available: [Checkbox]           |
|                                  |
|  [Save Item] [Cancel]            |
|                                  |
+----------------------------------+
```

### 6. QR Code Management

```
+----------------------------------+
|                                  |
|  [Logo] Restaurant Name    [User]|
|                                  |
|  +--------+                      |
|  |        |  QR Code Management  |
|  | SIDEBAR|                      |
|  |        |  [+ Create QR Code]  |
|  |        |                      |
|  |        |  Your QR Codes:      |
|  |        |                      |
|  |        |  +------------------+|
|  |        |  | [QR] Table 1     ||
|  |        |  | Scans: 56        ||
|  |        |  | [Edit] [Download]||
|  |        |  | [Print] [Delete] ||
|  |        |  +------------------+|
|  |        |                      |
|  |        |  +------------------+|
|  |        |  | [QR] Table 2     ||
|  |        |  | Scans: 42        ||
|  |        |  | [Edit] [Download]||
|  |        |  | [Print] [Delete] ||
|  |        |  +------------------+|
|  |        |                      |
|  |        |  +------------------+|
|  |        |  | [QR] Bar Menu    ||
|  |        |  | Scans: 128       ||
|  |        |  | [Edit] [Download]||
|  |        |  | [Print] [Delete] ||
|  |        |  +------------------+|
|  |        |                      |
|  |        |  +------------------+|
|  |        |  | [QR] Promo       ||
|  |        |  | Scans: 87        ||
|  |        |  | [Edit] [Download]||
|  |        |  | [Print] [Delete] ||
|  |        |  +------------------+|
|  +--------+                      |
|                                  |
|  [Bulk Actions ▼] [Apply]        |
|                                  |
+----------------------------------+
```

### 7. Create/Edit QR Code

```
+----------------------------------+
|                                  |
|  [Logo] Restaurant Name    [User]|
|                                  |
|  +--------+                      |
|  |        |  Create QR Code      |
|  | SIDEBAR|                      |
|  |        |  QR Code Name:       |
|  |        |  [Text Input]        |
|  |        |                      |
|  |        |  QR Code Type:       |
|  |        |  [Dropdown]          |
|  |        |  - Table             |
|  |        |  - Section           |
|  |        |  - Category          |
|  |        |  - Promotional       |
|  |        |                      |
|  |        |  Target:             |
|  |        |  [Dropdown]          |
|  |        |  (based on type)     |
|  |        |                      |
|  |        |  Design:             |
|  |        |                      |
|  |        |  Colors:             |
|  |        |  Foreground: [Color] |
|  |        |  Background: [Color] |
|  |        |                      |
|  |        |  Logo:               |
|  |        |  [File Upload]       |
|  |        |                      |
|  |        |  Shape:              |
|  |        |  [Dropdown]          |
|  |        |                      |
|  |        |  Error Correction:   |
|  |        |  [Dropdown]          |
|  +--------+                      |
|                                  |
|  Preview:                        |
|  +----------------------------+  |
|  |                            |  |
|  |  [QR Code Preview]         |  |
|  |                            |  |
|  +----------------------------+  |
|                                  |
|  Short URL:                      |
|  [Generated URL]                 |
|                                  |
|  [Generate QR Code]              |
|  [Save] [Cancel]                 |
|                                  |
+----------------------------------+
```

### 8. Order Management (Advanced Feature)

```
+----------------------------------+
|                                  |
|  [Logo] Restaurant Name    [User]|
|                                  |
|  +--------+                      |
|  |        |  Order Management    |
|  | SIDEBAR|                      |
|  |        |  [Search Orders]     |
|  |        |                      |
|  |        |  Filter:             |
|  |        |  [Status ▼]          |
|  |        |  [Date Range]        |
|  |        |                      |
|  |        |  Orders:             |
|  |        |                      |
|  |        |  +------------------+|
|  |        |  | #1234            ||
|  |        |  | Table 3          ||
|  |        |  | $45.67           ||
|  |        |  | Status: Preparing||
|  |        |  | [View] [Update]  ||
|  |        |  +------------------+|
|  |        |                      |
|  |        |  +------------------+|
|  |        |  | #1233            ||
|  |        |  | Table 5          ||
|  |        |  | $32.45           ||
|  |        |  | Status: Delivered||
|  |        |  | [View] [Update]  ||
|  |        |  +------------------+|
|  |        |                      |
|  |        |  +------------------+|
|  |        |  | #1232            ||
|  |        |  | Table 2          ||
|  |        |  | $78.90           ||
|  |        |  | Status: Pending  ||
|  |        |  | [View] [Update]  ||
|  |        |  +------------------+|
|  +--------+                      |
|                                  |
|  [Bulk Actions ▼] [Apply]        |
|                                  |
+----------------------------------+
```

### 9. Order Details (Advanced Feature)

```
+----------------------------------+
|                                  |
|  [Logo] Restaurant Name    [User]|
|                                  |
|  +--------+                      |
|  |        |  Order #1234         |
|  | SIDEBAR|                      |
|  |        |  Status:             |
|  |        |  [Dropdown] [Update] |
|  |        |                      |
|  |        |  Order Information:  |
|  |        |  Table: 3            |
|  |        |  Time: Apr 17, 2:30PM|
|  |        |  Customer: John D.   |
|  |        |  Phone: 555-123-4567 |
|  |        |                      |
|  |        |  Items:              |
|  |        |                      |
|  |        |  - Steak (1x)        |
|  |        |    Medium rare       |
|  |        |    Side: Fries       |
|  |        |    $24.99            |
|  |        |                      |
|  |        |  - Caesar Salad (1x) |
|  |        |    No croutons       |
|  |        |    $8.99             |
|  |        |                      |
|  |        |  - Soda (2x)         |
|  |        |    $5.98             |
|  |        |                      |
|  |        |  Subtotal: $39.96    |
|  |        |  Tax (10%): $4.00    |
|  |        |  Total: $43.96       |
|  +--------+                      |
|                                  |
|  Special Instructions:           |
|  "Please bring extra napkins"    |
|                                  |
|  Payment Status:                 |
|  [Dropdown] [Update]             |
|                                  |
|  [Print Receipt]                 |
|  [Send to Kitchen]               |
|  [Mark as Complete]              |
|                                  |
+----------------------------------+
```

### 10. Reservation Management (Advanced Feature)

```
+----------------------------------+
|                                  |
|  [Logo] Restaurant Name    [User]|
|                                  |
|  +--------+                      |
|  |        |  Reservations        |
|  | SIDEBAR|                      |
|  |        |  [+ Add Reservation] |
|  |        |                      |
|  |        |  Calendar View:      |
|  |        |  [Month/Week/Day]    |
|  |        |                      |
|  |        |  [Calendar Grid]     |
|  |        |                      |
|  |        |  Upcoming:           |
|  |        |                      |
|  |        |  +------------------+|
|  |        |  | Apr 17, 7:00 PM  ||
|  |        |  | Smith, Party of 4||
|  |        |  | Status: Confirmed||
|  |        |  | [View] [Edit]    ||
|  |        |  +------------------+|
|  |        |                      |
|  |        |  +------------------+|
|  |        |  | Apr 17, 8:30 PM  ||
|  |        |  | Johnson, Party of||
|  |        |  | Status: Pending  ||
|  |        |  | [View] [Edit]    ||
|  |        |  +------------------+|
|  |        |                      |
|  |        |  +------------------+|
|  |        |  | Apr 18, 6:15 PM  ||
|  |        |  | Davis, Party of 2||
|  |        |  | Status: Confirmed||
|  |        |  | [View] [Edit]    ||
|  |        |  +------------------+|
|  +--------+                      |
|                                  |
|  [Export Reservations]           |
|                                  |
+----------------------------------+
```

### 11. Feedback Management (Advanced Feature)

```
+----------------------------------+
|                                  |
|  [Logo] Restaurant Name    [User]|
|                                  |
|  +--------+                      |
|  |        |  Customer Feedback   |
|  | SIDEBAR|                      |
|  |        |  [Search Feedback]   |
|  |        |                      |
|  |        |  Filter:             |
|  |        |  [Rating ▼]          |
|  |        |  [Date Range]        |
|  |        |                      |
|  |        |  Overall Rating:     |
|  |        |  ★★★★☆ 4.2/5         |
|  |        |                      |
|  |        |  Feedback:           |
|  |        |                      |
|  |        |  +------------------+|
|  |        |  | ★★★★★             ||
|  |        |  | "Great food and  ||
|  |        |  | service!"        ||
|  |        |  | - John D., Apr 16||
|  |        |  | [Reply] [Hide]   ||
|  |        |  +------------------+|
|  |        |                      |
|  |        |  +------------------+|
|  |        |  | ★★★☆☆             ||
|  |        |  | "Food was good   ||
|  |        |  | but slow service"||
|  |        |  | - Sarah M., Apr 15||
|  |        |  | [Reply] [Hide]   ||
|  |        |  +------------------+|
|  |        |                      |
|  |        |  +------------------+|
|  |        |  | ★★★★☆             ||
|  |        |  | "Loved the pasta"||
|  |        |  | - Mike T., Apr 14||
|  |        |  | [Reply] [Hide]   ||
|  |        |  +------------------+|
|  +--------+                      |
|                                  |
|  [Export Feedback]               |
|                                  |
+----------------------------------+
```

### 12. Promotions Management (Advanced Feature)

```
+----------------------------------+
|                                  |
|  [Logo] Restaurant Name    [User]|
|                                  |
|  +--------+                      |
|  |        |  Promotions          |
|  | SIDEBAR|                      |
|  |        |  [+ Create Promotion]|
|  |        |                      |
|  |        |  Active Promotions:  |
|  |        |                      |
|  |        |  +------------------+|
|  |        |  | Happy Hour       ||
|  |        |  | 20% off drinks   ||
|  |        |  | Apr 1 - Apr 30   ||
|  |        |  | [Edit] [Duplicate]||
|  |        |  | [Disable] [Delete]||
|  |        |  +------------------+|
|  |        |                      |
|  |        |  +------------------+|
|  |        |  | Lunch Special    ||
|  |        |  | Buy 1 Get 1 Free ||
|  |        |  | Weekdays 11-2    ||
|  |        |  | [Edit] [Duplicate]||
|  |        |  | [Disable] [Delete]||
|  |        |  +------------------+|
|  |        |                      |
|  |        |  Scheduled Promotions:|
|  |        |                      |
|  |        |  +------------------+|
|  |        |  | Summer Special   ||
|  |        |  | 15% off salads   ||
|  |        |  | May 1 - Aug 31   ||
|  |        |  | [Edit] [Duplicate]||
|  |        |  | [Enable] [Delete]||
|  |        |  +------------------+|
|  +--------+                      |
|                                  |
|  [Bulk Actions ▼] [Apply]        |
|                                  |
+----------------------------------+
```

### 13. Analytics Dashboard (Advanced Feature)

```
+----------------------------------+
|                                  |
|  [Logo] Restaurant Name    [User]|
|                                  |
|  +--------+                      |
|  |        |  Analytics           |
|  | SIDEBAR|                      |
|  |        |  Date Range:         |
|  |        |  [Date Picker]       |
|  |        |                      |
|  |        |  QR Code Scans:      |
|  |        |  [Line Chart]        |
|  |        |                      |
|  |        |  Top Performing QR   |
|  |        |  Codes:              |
|  |        |  [Bar Chart]         |
|  |        |                      |
|  |        |  Most Viewed Items:  |
|  |        |  [Bar Chart]         |
|  |        |                      |
|  |        |  Order Statistics:   |
|  |        |  [Line Chart]        |
|  |        |                      |
|  |        |  Average Order Value:|
|  |        |  [Line Chart]        |
|  |        |                      |
|  |        |  Popular Times:      |
|  |        |  [Heat Map]          |
|  |        |                      |
|  |        |  Device Breakdown:   |
|  |        |  [Pie Chart]         |
|  |        |                      |
|  |        |  Visitor Flow:       |
|  |        |  [Flow Diagram]      |
|  +--------+                      |
|                                  |
|  [Export Report]                 |
|                                  |
+----------------------------------+
```

### 14. Settings Page

```
+----------------------------------+
|                                  |
|  [Logo] Restaurant Name    [User]|
|                                  |
|  +--------+                      |
|  |        |  Settings            |
|  | SIDEBAR|                      |
|  |        |  Restaurant Profile: |
|  |        |                      |
|  |        |  Name:               |
|  |        |  [Text Input]        |
|  |        |                      |
|  |        |  Logo:               |
|  |        |  [File Upload]       |
|  |        |                      |
|  |        |  Address:            |
|  |        |  [Text Input]        |
|  |        |                      |
|  |        |  Phone:              |
|  |        |  [Text Input]        |
|  |        |                      |
|  |        |  Email:              |
|  |        |  [Text Input]        |
|  |        |                      |
|  |        |  Website:            |
|  |        |  [Text Input]        |
|  |        |                      |
|  |        |  Working Hours:      |
|  |        |  [Time Inputs]       |
|  |        |                      |
|  |        |  WiFi Password:      |
|  |        |  [Text Input]        |
|  +--------+                      |
|                                  |
|  Additional Information:         |
|  [Text Area]                     |
|                                  |
|  Currency:                       |
|  [Dropdown]                      |
|                                  |
|  Languages:                      |
|  [Checkboxes]                    |
|                                  |
|  Default Language:               |
|  [Dropdown]                      |
|                                  |
|  User Management:                |
|  [+ Add User]                    |
|                                  |
|  [User List with Roles]          |
|                                  |
|  [Save Settings]                 |
|                                  |
+----------------------------------+
```

## Responsive Design Considerations

The admin dashboard is designed to be responsive across different devices:

### Mobile View
- Collapsible sidebar
- Stacked layout for all elements
- Simplified charts and tables
- Touch-friendly controls

### Tablet View
- Semi-expanded sidebar
- Two-column layout where appropriate
- Larger touch targets
- Scrollable tables

### Desktop View
- Full sidebar always visible
- Multi-column layout
- Advanced data visualization
- Keyboard shortcuts

## UI Components

### Navigation
- Collapsible sidebar with icons and labels
- Breadcrumb navigation
- Quick action buttons
- User profile dropdown

### Data Display
- Sortable and filterable tables
- Interactive charts and graphs
- Status indicators with color coding
- Progress bars

### Forms
- Inline validation
- Multi-step forms for complex operations
- Autosave functionality
- Rich text editors

### Notifications
- Toast notifications for actions
- Alert banners for important messages
- Confirmation dialogs
- Activity feed

## Interactive Elements

- Drag-and-drop for reordering items
- Inline editing for quick updates
- Bulk selection and actions
- Real-time updates for orders and reservations
- Expandable sections for detailed information
- Search with autocomplete
- Filtering and sorting options
