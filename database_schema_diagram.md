# Database Schema Diagram

```
+----------------+       +------------------+       +---------------+
| restaurants    |       | menu_sections    |       | categories    |
+----------------+       +------------------+       +---------------+
| id             |<----->| id               |<----->| id            |
| name           |       | restaurant_id    |       | menu_section_id|
| slug           |       | name             |       | name          |
| logo           |       | slug             |       | slug          |
| address        |       | display_order    |       | description   |
| phone          |       | is_active        |       | image         |
| email          |       | created_at       |       | display_order |
| website        |       | updated_at       |       | avail_hours   |
| wifi_password  |       +------------------+       | is_active     |
| additional_info|                                  | created_at    |
| working_hours  |                                  | updated_at    |
| created_at     |                                  +---------------+
| updated_at     |                                          |
+----------------+                                          |
        |                                                   |
        |                                                   v
+----------------+                                  +---------------+
| restaurant_admins|                                | menu_items    |
+----------------+                                  +---------------+
| id             |                                  | id            |
| restaurant_id  |                                  | category_id   |
| user_id        |                                  | name          |
| role           |                                  | slug          |
| created_at     |                                  | description   |
| updated_at     |                                  | image         |
+----------------+                                  | price         |
        |                                           | disc_price    |
        v                                           | currency      |
+----------------+                                  | weight        |
| users          |                                  | weight_unit   |
+----------------+                                  | prep_time     |
| id             |                                  | is_vegetarian |
| email          |                                  | is_vegan      |
| password_hash  |                                  | is_gluten_free|
| first_name     |                                  | spiciness     |
| last_name      |                                  | allergens     |
| phone          |                                  | nutrition     |
| is_active      |                                  | ingredients   |
| last_login     |                                  | display_order |
| created_at     |                                  | is_featured   |
| updated_at     |                                  | is_available  |
+----------------+                                  | created_at    |
                                                    | updated_at    |
                                                    +---------------+
                                                            |
                                                            |
+----------------+       +------------------+               |
| qr_codes       |       | qr_code_scans    |               |
+----------------+       +------------------+               |
| id             |<----->| id               |               |
| restaurant_id  |       | qr_code_id       |               |
| name           |       | session_id       |               |
| type           |       | ip_address       |               |
| target_id      |       | user_agent       |               |
| image_path     |       | device_type      |               |
| custom_design  |       | referrer         |               |
| short_url      |       | scanned_at       |               |
| is_active      |       +------------------+               |
| created_at     |                                          |
| updated_at     |                                          |
+----------------+                                          |
                                                            |
                                                            v
+----------------+       +------------------+       +---------------+
| orders         |       | order_items      |       | item_options  |
+----------------+       +------------------+       +---------------+
| id             |<----->| id               |<------| id            |
| restaurant_id  |       | order_id         |       | menu_item_id  |
| table_number   |       | menu_item_id     |       | name          |
| customer_name  |       | quantity         |       | description   |
| customer_phone |       | unit_price       |       | min_selections|
| customer_email |       | total_price      |       | max_selections|
| status         |       | special_instr    |       | is_required   |
| total_amount   |       | created_at       |       | display_order |
| payment_status |       | updated_at       |       | created_at    |
| payment_method |       +------------------+       | updated_at    |
| notes          |               |                  +---------------+
| created_at     |               |                          |
| updated_at     |               v                          |
+----------------+       +------------------+               |
                         | order_item_options|              v
                         +------------------+       +---------------+
                         | id               |       | option_choices|
                         | order_item_id    |       +---------------+
                         | option_choice_id |       | id            |
                         | price_adjustment |       | item_option_id|
                         | created_at       |<------| name          |
                         | updated_at       |       | description   |
                         +------------------+       | price_adjust  |
                                                    | display_order |
                                                    | is_default    |
                                                    | created_at    |
                                                    | updated_at    |
                                                    +---------------+

+----------------+       +------------------+       +---------------+
| reservations   |       | feedback         |       | promotions    |
+----------------+       +------------------+       +---------------+
| id             |       | id               |       | id            |
| restaurant_id  |       | restaurant_id    |       | restaurant_id |
| customer_name  |       | menu_item_id     |       | name          |
| customer_phone |       | rating           |       | description   |
| customer_email |       | comment          |       | image         |
| party_size     |       | customer_name    |       | discount_type |
| reservation_date|      | customer_email   |       | discount_value|
| reservation_time|      | is_published     |       | min_order_amt |
| special_requests|      | created_at       |       | start_date    |
| status         |       | updated_at       |       | end_date      |
| created_at     |       +------------------+       | is_active     |
| updated_at     |                                  | created_at    |
+----------------+                                  | updated_at    |
                                                    +---------------+
                                                            |
                                                            v
+----------------+       +------------------+       +---------------+
| languages      |       | translations     |       | promotion_items|
+----------------+       +------------------+       +---------------+
| id             |<----->| id               |       | id            |
| code           |       | language_id      |       | promotion_id  |
| name           |       | translatable_type|       | menu_item_id  |
| is_active      |       | translatable_id  |       | created_at    |
| is_default     |       | field            |       | updated_at    |
| created_at     |       | translation      |       +---------------+
| updated_at     |       | created_at       |
+----------------+       | updated_at       |
                         +------------------+

+----------------+
| analytics      |
+----------------+
| id             |
| restaurant_id  |
| date           |
| total_scans    |
| unique_visitors|
| avg_session_dur|
| most_viewed_cat|
| most_viewed_item|
| created_at     |
| updated_at     |
+----------------+
```

This diagram illustrates the relationships between the tables in our database schema. The arrows indicate foreign key relationships between tables. The schema is designed to support all the features of our advanced QR code menu system, including:

1. Restaurant and menu management
2. User authentication and authorization
3. QR code generation and tracking
4. Online ordering
5. Table reservations
6. Customer feedback
7. Promotions and special offers
8. Multi-language support
9. Analytics and reporting

The database uses UUIDs as primary keys for better security and distribution, and includes timestamps for tracking creation and updates across all tables.
