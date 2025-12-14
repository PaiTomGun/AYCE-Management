# Database Queries Documentation

This document provides a comprehensive overview of all SQL queries used in the AYCE Management System, explaining the purpose and functionality of each query.

## Table of Contents
- [Authentication & Account Management](#authentication--account-management)
- [Table Management](#table-management)
- [Session Management](#session-management)
- [Menu Management](#menu-management)
- [Order Management](#order-management)
- [Analytics & Reporting](#analytics--reporting)
- [Dashboard Statistics](#dashboard-statistics)
- [Tier Management](#tier-management)

---

## Authentication & Account Management

### Get Account for Authentication
**Purpose**: Retrieve account details during login to verify user credentials and check if account is active.

```sql
SELECT id, username, role, is_active 
FROM accounts 
WHERE username = $1
```
- Fetches user account by username
- Returns basic account info excluding sensitive password hash
- Used to verify account exists and is active before password verification

### Get Password Hash
**Purpose**: Retrieve the stored password hash for password verification during authentication.

```sql
SELECT password_hash 
FROM accounts 
WHERE id = $1
```
- Fetches only the password hash for security
- Separate query ensures password hash is only accessed when needed
- Used after initial account validation

### Get All Accounts
**Purpose**: Retrieve all user accounts with creator information for the admin accounts management page.

```sql
SELECT id, username, role, is_active, created_at, 
       (SELECT username FROM accounts a2 WHERE a2.id = accounts.created_by) as created_by_username
FROM accounts 
ORDER BY created_at DESC
```
- Lists all accounts in reverse chronological order
- Includes who created each account (subquery for creator's username)
- Used by admin to view and manage all system users

### Create New Account
**Purpose**: Insert a new staff or admin account into the system.

```sql
INSERT INTO accounts (id, username, password_hash, role, created_by, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
```
- Creates new user with hashed password
- Tracks who created the account for auditing
- Role can be 'staff' or 'admin'

### Check Username Exists
**Purpose**: Prevent duplicate usernames when creating new accounts.

```sql
SELECT id 
FROM accounts 
WHERE username = $1
```
- Validates username uniqueness before account creation
- Returns ID if username exists, null otherwise

### Update Account Information
**Purpose**: Modify existing account's username or role.

```sql
UPDATE accounts 
SET username = $1, role = $2, updated_at = NOW() 
WHERE id = $3
```
- Updates account details (except password)
- Automatically updates modification timestamp

### Update Account Status
**Purpose**: Enable or disable user accounts (soft delete).

```sql
UPDATE accounts 
SET is_active = $1, updated_at = NOW() 
WHERE id = $2
```
- Deactivates accounts without deleting data
- Prevents login for inactive accounts while preserving history

---

## Table Management

### Get All Tables with Status
**Purpose**: Display all restaurant tables with their current occupancy status and session details for the table management page.

```sql
SELECT 
  rt.*,
  CASE 
    WHEN s.id IS NOT NULL THEN 'occupied'
    ELSE 'free'
  END as status,
  s.id as session_id,
  s.started_at,
  s.session_duration_minutes,
  (SELECT COUNT(*) FROM session_customers WHERE session_id = s.id) as customer_count,
  t.display_name as tier_name,
  t.price_per_person_baht as tier_price
FROM restaurant_tables rt
LEFT JOIN sessions s ON rt.id = s.table_id AND s.status = 'active'
LEFT JOIN tiers t ON s.session_tier_id = t.id
ORDER BY rt.table_code
```
- Shows all tables with their configuration (seats, code)
- Includes real-time occupancy status (occupied/free)
- For occupied tables: shows customer count, dining tier, start time, and session duration
- Used by staff to see table availability at a glance

### Check if Table Code Exists
**Purpose**: Prevent duplicate table codes when creating new tables.

```sql
SELECT table_code 
FROM restaurant_tables 
WHERE LOWER(table_code) = LOWER($1)
```
- Case-insensitive check for table code uniqueness
- Ensures each table has a unique identifier

### Create New Table
**Purpose**: Add a new table to the restaurant layout.

```sql
INSERT INTO restaurant_tables (id, table_code, seats, created_at, updated_at) 
VALUES (gen_random_uuid(), $1, $2, NOW(), NOW())
```
- Creates table with unique ID, code, and seat capacity
- Automatically generates UUID for table ID
- Used by admin to expand seating capacity

### Check for Active Session on Table
**Purpose**: Verify if a table has an active dining session before allowing modifications or deletion.

```sql
SELECT id 
FROM sessions 
WHERE table_id = $1 AND ended_at IS NULL
```
- Prevents deleting or modifying tables with active customers
- Returns session ID if table is occupied

### Update Table Configuration
**Purpose**: Modify table's seating capacity.

```sql
UPDATE restaurant_tables 
SET seats = $1, updated_at = NOW() 
WHERE id = $2
```
- Adjusts seat count for existing tables
- Used when physical table configuration changes

### Delete Table
**Purpose**: Remove a table from the system (only if no active session exists).

```sql
DELETE FROM restaurant_tables 
WHERE id = $1
```
- Permanently removes table
- Only allowed if table is not currently occupied

### Get Active Session by Table ID
**Purpose**: Retrieve detailed information about the current dining session at a specific table.

```sql
SELECT s.*, 
       (SELECT COUNT(*) FROM session_customers WHERE session_id = s.id) as customer_count,
       t.display_name as tier_name,
       t.price_per_person_baht as tier_price
FROM sessions s
LEFT JOIN tiers t ON s.session_tier_id = t.id
WHERE s.table_id = $1 AND s.status = 'active'
LIMIT 1
```
- Gets current session details for a specific table
- Includes customer count and pricing tier information
- Used to display session info when viewing or managing a table

---

## Session Management

### Create New Session
**Purpose**: Start a new dining session when customers are seated at a table.

```sql
INSERT INTO sessions (id, table_id, started_at, status, session_tier_id, session_duration_minutes, created_at, updated_at)
VALUES ($1, $2, $3, 'active', $4, $5, $6, $7)
```
- Creates active session with start time and selected pricing tier
- Links session to specific table
- Sets session duration (typically 90 minutes)
- Triggers customer and customer_tier record creation

### Create Session Customer
**Purpose**: Record individual customer as part of a session.

```sql
INSERT INTO session_customers (id, session_id, created_at)
VALUES ($1, $2, $3)
```
- Creates one record per customer in the dining party
- Used to track exact customer count per session

### Assign Tier to Customer
**Purpose**: Link each customer to their selected pricing tier.

```sql
INSERT INTO customer_tiers (id, session_customer_id, tier_id, started_at)
VALUES ($1, $2, $3, $4)
```
- Records which pricing tier each customer selected
- Allows different customers at same table to have different tiers
- Tracks when tier pricing started

### Get Session Details by ID
**Purpose**: Retrieve complete session information including table, tier, and customer details.

```sql
SELECT s.*, 
       t.table_code,
       tier.display_name as tier_name,
       tier.price_per_person_baht as tier_price,
       (SELECT COUNT(*) FROM session_customers WHERE session_id = s.id) as customer_count
FROM sessions s
JOIN restaurant_tables t ON s.table_id = t.id
LEFT JOIN tiers tier ON s.session_tier_id = tier.id
WHERE s.id = $1
```
- Gets full session context for a specific session ID
- Includes table, pricing, and customer information
- Used for checkout, QR code generation, and session management

### Update Session Status
**Purpose**: Mark a session as completed or cancelled.

```sql
UPDATE sessions 
SET status = $1, ended_at = $2, updated_at = $3 
WHERE id = $4
```
- Changes session status (active → completed/cancelled)
- Records end time for session duration calculation
- Used during checkout process

---

## Menu Management

### Get Menu Items with Categories
**Purpose**: Retrieve all active menu items organized by categories, optionally filtered by pricing tier.

```sql
SELECT 
  mi.*,
  mc.name as category_name,
  mc.position as category_position
FROM menu_items mi
LEFT JOIN menu_categories mc ON mi.category_id = mc.id
WHERE mi.is_deleted = false
  AND EXISTS (
    SELECT 1 FROM menu_item_tiers mit 
    WHERE mit.item_id = mi.id AND mit.tier_id = $1
  )
ORDER BY mc.position, mi.name
```
- Shows all menu items not marked as deleted
- Includes category information for grouping
- Filters items available for specific pricing tier
- Orders by category position then item name
- Used for customer menu display and admin menu management

### Get Tiers for Menu Item
**Purpose**: Retrieve which pricing tiers can order a specific menu item.

```sql
SELECT t.id, t.code, t.display_name 
FROM tiers t 
JOIN menu_item_tiers mit ON t.id = mit.tier_id 
WHERE mit.item_id = $1 AND t.archived_at IS NULL
```
- Lists all active tiers associated with a menu item
- Used to display tier availability for each menu item
- Helps admin see which tiers have access to each item

### Get or Create Menu Category
**Purpose**: Find existing category or prepare to create new one for menu organization.

```sql
SELECT id 
FROM menu_categories 
WHERE name = $1
```
- Looks up category by name
- Used before creating menu items to ensure category exists
- Prevents duplicate categories

### Create Menu Category
**Purpose**: Add a new category for organizing menu items.

```sql
INSERT INTO menu_categories (id, name, position, created_at) 
VALUES ($1, $2, $3, $4)
```
- Creates new category with display position
- Lower position numbers appear first in menu
- Used when adding items to new categories

### Create Menu Item
**Purpose**: Add a new item to the restaurant menu.

```sql
INSERT INTO menu_items (id, name, description, category_id, image_base64, is_available, is_deleted, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, false, $7, $8)
```
- Creates menu item with all details (name, description, image)
- `is_available` controls if item can be ordered
- `is_deleted` is soft delete flag (default false)
- Image stored as base64 string for easy display

### Associate Menu Item with Tiers
**Purpose**: Define which pricing tiers can order a specific menu item.

```sql
INSERT INTO menu_item_tiers (id, item_id, tier_id) 
VALUES ($1, $2, $3)
```
- Links menu item to one or more tiers
- Allows different tier levels to have different menu access
- Higher tiers typically have access to more items

### Update Menu Item
**Purpose**: Modify existing menu item details.

```sql
UPDATE menu_items 
SET name = $1, description = $2, category_id = $3, image_base64 = $4, is_available = $5, updated_at = $6
WHERE id = $7
```
- Updates item information and availability status
- Used by admin to change menu item details or temporarily disable items

### Delete Menu Item Tier Associations
**Purpose**: Remove all tier associations before updating with new ones.

```sql
DELETE FROM menu_item_tiers 
WHERE item_id = $1
```
- Clears existing tier associations
- Used before inserting updated tier list
- Ensures clean update of tier access

### Soft Delete Menu Item
**Purpose**: Mark menu item as deleted without removing historical data.

```sql
UPDATE menu_items 
SET is_deleted = true, updated_at = $1 
WHERE id = $2
```
- Hides item from menu but preserves order history
- Allows past orders to maintain item references
- Can be reversed if needed

### Get All Menu Categories
**Purpose**: Retrieve all categories for menu organization.

```sql
SELECT * 
FROM menu_categories 
ORDER BY position ASC, created_at DESC
```
- Lists all categories in display order
- Used for menu display and category management

---

## Order Management

### Create Order
**Purpose**: Record a new order placed by customers during their dining session.

```sql
INSERT INTO orders (id, session_id, created_at, status)
VALUES ($1, $2, $3, 'pending')
```
- Creates order record linked to active session
- Status starts as 'pending' (waiting for kitchen)
- Timestamp records when order was placed

### Create Order Items
**Purpose**: Record individual items within an order with quantities.

```sql
INSERT INTO order_items (id, order_id, item_id, item_name_snapshot, quantity, created_at)
VALUES ($1, $2, $3, $4, $5, $6)
```
- Links items to order with quantities
- `item_name_snapshot` preserves item name even if menu item is later changed/deleted
- Creates one record per unique item in the order

### Get Session Order Context
**Purpose**: Retrieve session and tier information when creating an order.

```sql
SELECT 
  s.id as session_id,
  s.session_tier_id,
  t.code as tier_code,
  t.price_per_person_baht,
  (SELECT COUNT(*) FROM session_customers WHERE session_id = s.id) as customer_count
FROM sessions s
LEFT JOIN tiers t ON s.session_tier_id = t.id
WHERE s.id = $1
```
- Gets context needed for order logging and validation
- Includes pricing tier and customer count
- Used when creating new orders

### Get Order History for Session
**Purpose**: Display all orders placed during a specific dining session.

```sql
SELECT 
  o.id,
  o.session_id,
  o.created_at,
  o.status,
  json_agg(
    json_build_object(
      'id', oi.id,
      'item_name', oi.item_name_snapshot,
      'quantity', oi.quantity,
      'notes', oi.notes
    ) ORDER BY oi.created_at
  ) as items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.session_id = $1
GROUP BY o.id, o.session_id, o.created_at, o.status
ORDER BY o.created_at DESC
```
- Shows complete order history for a session
- Groups all items within each order using JSON aggregation
- Orders chronologically (newest first)
- Used by customers to see what they've ordered

### Get Pending Orders
**Purpose**: Retrieve all orders waiting to be prepared by kitchen staff.

```sql
SELECT 
  o.id,
  o.session_id,
  o.created_at,
  o.status,
  t.table_code,
  s.session_tier_id,
  tier.display_name as tier_name,
  (
    SELECT json_agg(
      json_build_object(
        'id', oi.id,
        'item_id', oi.item_id,
        'item_name', oi.item_name_snapshot,
        'quantity', oi.quantity
      )
    )
    FROM order_items oi
    WHERE oi.order_id = o.id
  ) as items
FROM orders o
JOIN sessions s ON o.session_id = s.id
JOIN restaurant_tables t ON s.table_id = t.id
LEFT JOIN tiers tier ON s.session_tier_id = tier.id
WHERE o.status = 'pending'
ORDER BY o.created_at ASC
```
- Lists orders that need to be prepared (status = 'pending')
- Includes table number for kitchen staff to know where to deliver
- Shows items in JSON format for easy display
- Orders chronologically (oldest first - FIFO processing)
- Used by staff to manage kitchen queue

### Update Order Status
**Purpose**: Change order status as it progresses through preparation.

```sql
UPDATE orders 
SET status = $1 
WHERE id = $2
```
- Updates order status (pending → preparing → completed)
- Allows staff to track order progress
- Used when marking orders as completed

### Get Order Items for Logging
**Purpose**: Retrieve all items ordered during a session for analytics logging.

```sql
SELECT oi.*, mi.name as item_name, mc.name as category_name, o.created_at as ordered_at
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
LEFT JOIN menu_items mi ON oi.item_id = mi.id
LEFT JOIN menu_categories mc ON mi.category_id = mc.id
WHERE o.session_id = $1
```
- Gets complete order details for session completion
- Includes current item names and categories
- Used during checkout to log menu item statistics

---

## Analytics & Reporting

### Get Session Logs
**Purpose**: Retrieve completed session records for analytics with optional date filtering.

```sql
SELECT * 
FROM session_logs
WHERE started_at >= $1 AND started_at < $2
ORDER BY started_at DESC
```
- Retrieves historical session data for analysis
- Filters by date range for specific reporting periods
- Includes revenue, duration, customer count, payment method
- Used by analytics dashboard to generate insights

### Log Session Data
**Purpose**: Record completed session details for long-term analytics.

```sql
INSERT INTO session_logs (
  id, session_id, table_code, started_at, ended_at, customer_count, 
  session_tier_code, duration_minutes, buffet_price_per_person_baht, 
  total_amount_baht, payment_method, logged_at
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
```
- Creates permanent record when session completes
- Captures all key metrics for analysis
- Includes pricing, duration, payment method, customer count
- Used during checkout to build historical database

### Log Menu Item Orders
**Purpose**: Record which menu items were ordered for popularity analysis.

```sql
INSERT INTO menu_item_logs (
  id, session_id, order_id, item_id, item_name, category_name, 
  quantity, session_tier_code, buffet_price_per_person_baht, 
  customer_count, ordered_at, logged_at
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
```
- Records each menu item ordered with context
- Includes tier, pricing, and customer count for segmented analysis
- Used to identify popular items and optimize menu
- Created during checkout for each ordered item

### Get Top Menu Items
**Purpose**: Identify most frequently ordered menu items for analytics.

```sql
SELECT 
  item_name, 
  category_name, 
  SUM(quantity) as total_quantity, 
  COUNT(DISTINCT session_id) as order_count
FROM menu_item_logs
WHERE ordered_at >= $1 AND ordered_at < $2
GROUP BY item_name, category_name
ORDER BY total_quantity DESC
LIMIT 10
```
- Aggregates order quantities across all sessions
- Counts how many different sessions ordered each item
- Filters by date range for period-specific analysis
- Returns top 10 most popular items
- Used in analytics dashboard to show trending items

---

## Dashboard Statistics

### Calculate Sales Today
**Purpose**: Show total revenue for current day from completed sessions and active payments.

```sql
-- From completed sessions
SELECT COALESCE(SUM(total_amount_baht), 0) as sales_today
FROM session_logs
WHERE DATE(ended_at) = DATE($1)

UNION ALL

-- From active session payments
SELECT COALESCE(SUM(amount_baht), 0)
FROM payments
WHERE DATE(processed_at) = DATE($1)
```
- Sums revenue from two sources: logged sessions and recent payments
- Uses UNION ALL to combine both amounts
- COALESCE ensures null is treated as 0
- Provides real-time sales figures for dashboard

### Count Active Customers
**Purpose**: Display current number of customers dining in the restaurant.

```sql
SELECT COALESCE(SUM(
  (SELECT COUNT(*) FROM session_customers WHERE session_id = s.id)
), 0) as customer_now
FROM sessions s
WHERE s.status = 'active'
```
- Counts all customers in active sessions
- Subquery counts customers per session
- Sum aggregates across all active sessions
- Shows real-time occupancy for capacity planning

### Count Active Tables
**Purpose**: Display how many tables currently have dining customers.

```sql
SELECT COUNT(*) as active_table
FROM sessions
WHERE status = 'active'
```
- Counts sessions with 'active' status
- Each active session represents one occupied table
- Used for quick occupancy overview

### Count Available Tables
**Purpose**: Display how many tables are free for new customers.

```sql
SELECT COUNT(*) as available_table
FROM restaurant_tables rt
WHERE NOT EXISTS (
  SELECT 1 FROM sessions s 
  WHERE s.table_id = rt.id AND s.status = 'active'
)
```
- Counts tables without active sessions
- Uses NOT EXISTS for efficient lookup
- Shows available seating capacity
- Used by staff to manage customer seating

---

## Tier Management

### Get All Active Tiers
**Purpose**: Retrieve pricing tiers available for customer selection.

```sql
SELECT * 
FROM tiers 
WHERE is_active = true AND archived_at IS NULL
ORDER BY priority ASC
```
- Lists only active, non-archived pricing tiers
- Orders by priority (lower numbers appear first)
- Used for tier selection during seat assignment

### Get All Tiers (Including Inactive)
**Purpose**: Show all tiers for admin management including disabled ones.

```sql
SELECT * 
FROM tiers 
WHERE archived_at IS NULL
ORDER BY priority ASC
```
- Shows all tiers except permanently archived
- Includes inactive tiers for admin to manage
- Used in tier management page

### Create New Tier
**Purpose**: Add a new pricing tier option.

```sql
INSERT INTO tiers (
  id, code, display_name, price_per_person_baht, 
  priority, is_active, created_at
)
VALUES ($1, $2, $3, $4, $5, $6, $7)
```
- Creates new pricing tier with all details
- Priority determines display order
- is_active controls if tier can be selected
- Used by admin to add pricing options

### Update Tier
**Purpose**: Modify existing tier details.

```sql
UPDATE tiers 
SET code = $1, display_name = $2, price_per_person_baht = $3, 
    priority = $4, is_active = $5
WHERE id = $6
```
- Updates tier information and status
- Can change price, name, priority, or active status
- Used by admin to adjust pricing and tier configuration

### Archive Tier
**Purpose**: Soft delete a tier (preserves historical data).

```sql
UPDATE tiers 
SET archived_at = $1 
WHERE id = $2
```
- Marks tier as archived without deletion
- Preserves tier data for historical sessions
- Prevents tier from being used for new sessions
- Can be reversed by setting archived_at to NULL

---

## Checkout & Payment

### Create Payment Record
**Purpose**: Record payment details when customers complete their dining session.

```sql
INSERT INTO payments (
  id, session_id, customer_count, price_per_person_baht, 
  amount_baht, method, processed_at
)
VALUES ($1, $2, $3, $4, $5, $6, $7)
```
- Records payment transaction details
- Captures payment method (cash, credit_card, thai_qr)
- Stores pricing snapshot for financial records
- Used during checkout process

### Get Session Data for Checkout
**Purpose**: Retrieve all information needed to calculate bill and complete checkout.

```sql
SELECT 
  s.*, 
  t.table_code, 
  tier.display_name as tier_name, 
  tier.code as tier_code,
  tier.price_per_person_baht,
  (SELECT COUNT(*) FROM session_customers WHERE session_id = s.id) as customer_count
FROM sessions s
JOIN restaurant_tables t ON s.table_id = t.id
LEFT JOIN tiers tier ON s.session_tier_id = tier.id
WHERE s.id = $1
```
- Gets complete session context for billing
- Includes table, pricing tier, and customer count
- Used to calculate total amount due
- Total = customer_count × price_per_person_baht

---

## Query Patterns & Best Practices

### Subqueries for Aggregation
Many queries use subqueries to count related records:
```sql
(SELECT COUNT(*) FROM session_customers WHERE session_id = s.id)
```
This pattern appears frequently to get customer counts without complex joins.

### JSON Aggregation
Used to group multiple rows into single JSON structure:
```sql
json_agg(json_build_object('key', value))
```
Efficient way to return nested data structures without multiple queries.

### Soft Deletes
Tables use flags instead of DELETE:
- `is_deleted` for menu items
- `archived_at` for tiers
- `is_active` for accounts

This preserves historical data and relationships.

### Timestamp Management
Most tables include:
- `created_at` - when record was created
- `updated_at` - when record was last modified
- `logged_at` - when data was logged for analytics

### UUID Primary Keys
All tables use UUID for primary keys:
- Globally unique identifiers
- No sequential ID enumeration risk
- Safe for distributed systems

---

## Performance Considerations

1. **Indexes**: Consider adding indexes on frequently queried columns:
   - `sessions.table_id`
   - `sessions.status`
   - `order_items.order_id`
   - `session_customers.session_id`

2. **Date Range Queries**: Always use indexed timestamp columns for analytics

3. **JOIN Performance**: Most queries use LEFT JOIN to handle optional relationships

4. **Aggregation**: COUNT and SUM operations use COALESCE to handle NULL values

5. **Status Filtering**: Queries frequently filter by status fields (active, pending, etc.)

---

This documentation covers all major queries used throughout the AYCE Management System. Each query is designed to support specific business operations while maintaining data integrity and performance.