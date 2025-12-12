-- ============================================
-- CLEANUP
-- ============================================

DROP TABLE IF EXISTS "menu_item_logs" CASCADE;
DROP TABLE IF EXISTS "session_logs" CASCADE;
DROP TABLE IF EXISTS "payments" CASCADE;
DROP TABLE IF EXISTS "order_items" CASCADE;
DROP TABLE IF EXISTS "orders" CASCADE;
DROP TABLE IF EXISTS "menu_item_tiers" CASCADE;
DROP TABLE IF EXISTS "menu_items" CASCADE;
DROP TABLE IF EXISTS "menu_categories" CASCADE;
DROP TABLE IF EXISTS "customer_tiers" CASCADE;
DROP TABLE IF EXISTS "session_customers" CASCADE;
DROP TABLE IF EXISTS "sessions" CASCADE;
DROP TABLE IF EXISTS "tiers" CASCADE;
DROP TABLE IF EXISTS "restaurant_tables" CASCADE;
DROP TYPE IF EXISTS "session_status" CASCADE;

-- ============================================
-- CUSTOM TYPES
-- ============================================

CREATE TYPE "session_status" AS ENUM (
  'active',
  'completed',
  'cancelled'
);

-- ============================================
-- TABLES
-- ============================================

-- Restaurant Tables
CREATE TABLE "restaurant_tables" (
  "id" uuid PRIMARY KEY,
  "table_code" text UNIQUE NOT NULL,
  "seats" int NOT NULL,
  "qr_code_slug" text,
  "layout" text,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

-- Tiers (Buffet Price Tiers)
CREATE TABLE "tiers" (
  "id" uuid PRIMARY KEY,
  "code" text UNIQUE NOT NULL,
  "display_name" text NOT NULL,
  "price_per_person_baht" decimal(10,2) NOT NULL,
  "priority" int NOT NULL,
  "metadata" text,
  "is_active" boolean DEFAULT true,
  "created_at" timestamptz,
  "archived_at" timestamptz
);

-- Menu Categories
CREATE TABLE "menu_categories" (
  "id" uuid PRIMARY KEY,
  "name" text NOT NULL,
  "position" int,
  "created_at" timestamptz
);

-- Sessions
CREATE TABLE "sessions" (
  "id" uuid PRIMARY KEY,
  "table_id" uuid NOT NULL REFERENCES "restaurant_tables" ("id"),
  "started_at" timestamptz,
  "ended_at" timestamptz,
  "status" session_status NOT NULL,
  "session_tier_id" uuid REFERENCES "tiers" ("id"),
  "note" text,
  "metadata" text,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

-- Session Customers
CREATE TABLE "session_customers" (
  "id" uuid PRIMARY KEY,
  "session_id" uuid NOT NULL REFERENCES "sessions" ("id"),
  "type" text,
  "created_at" timestamptz
);

-- Customer Tiers (Junction Table)
CREATE TABLE "customer_tiers" (
  "id" uuid PRIMARY KEY,
  "session_customer_id" uuid NOT NULL REFERENCES "session_customers" ("id"),
  "tier_id" uuid REFERENCES "tiers" ("id"),
  "started_at" timestamptz,
  "ended_at" timestamptz,
  UNIQUE ("session_customer_id", "tier_id", "started_at")
);

-- Menu Items (Buffet Items)
CREATE TABLE "menu_items" (
  "id" uuid PRIMARY KEY,
  "category_id" uuid REFERENCES "menu_categories" ("id"),
  "name" text NOT NULL,
  "description" text,
  "is_available" boolean DEFAULT true,
  "is_deleted" boolean DEFAULT false,
  "stock" int,
  "options" text,
  "created_at" timestamptz,
  "updated_at" timestamptz,
  "deleted_at" timestamptz
);

-- Menu Item Tiers (Junction Table)
CREATE TABLE "menu_item_tiers" (
  "id" uuid PRIMARY KEY,
  "item_id" uuid REFERENCES "menu_items" ("id"),
  "tier_id" uuid REFERENCES "tiers" ("id"),
  UNIQUE ("item_id", "tier_id")
);

-- Orders
CREATE TABLE "orders" (
  "id" uuid PRIMARY KEY,
  "session_id" uuid NOT NULL REFERENCES "sessions" ("id"),
  "created_at" timestamptz,
  "status" text,
  "metadata" text
);

-- Order Items (Buffet Orders)
CREATE TABLE "order_items" (
  "id" uuid PRIMARY KEY,
  "order_id" uuid NOT NULL REFERENCES "orders" ("id"),
  "item_id" uuid REFERENCES "menu_items" ("id"),
  "item_name_snapshot" text,
  "quantity" int NOT NULL,
  "notes" text,
  "created_at" timestamptz
);

-- Payments (Buffet Session Payment)
CREATE TABLE "payments" (
  "id" uuid PRIMARY KEY,
  "session_id" uuid NOT NULL REFERENCES "sessions" ("id"),
  "customer_count" int NOT NULL,
  "price_per_person_baht" decimal(10,2) NOT NULL,
  "amount_baht" decimal(10,2) NOT NULL,
  "method" text NOT NULL,
  "processed_at" timestamptz
);

-- ============================================
-- LOGS
-- ============================================

-- Session Logs
-- Note: session_id is stored but not a foreign key since sessions are deleted after completion
CREATE TABLE "session_logs" (
  "id" uuid PRIMARY KEY,
  "session_id" uuid NOT NULL,
  "customer_count" int NOT NULL,
  "session_tier_code" text,
  "duration_minutes" int,
  "buffet_price_per_person_baht" decimal(10,2) NOT NULL,
  "total_amount_baht" decimal(10,2) NOT NULL,
  "payment_method" text NOT NULL,
  "table_code" text,
  "started_at" timestamptz NOT NULL,
  "ended_at" timestamptz NOT NULL,
  "logged_at" timestamptz DEFAULT NOW(),
  UNIQUE ("session_id")
);

-- Menu Item Logs (Track what customers order from buffet)
-- Note: Stores denormalized data and IDs without foreign keys since source data is deleted
CREATE TABLE "menu_item_logs" (
  "id" uuid PRIMARY KEY,
  "session_id" uuid NOT NULL,
  "order_id" uuid NOT NULL,
  "item_id" uuid REFERENCES "menu_items" ("id"),
  "item_name" text NOT NULL,
  "category_name" text,
  "quantity" int NOT NULL,
  "session_tier_code" text,
  "buffet_price_per_person_baht" decimal(10,2),
  "customer_count" int,
  "ordered_at" timestamptz NOT NULL,
  "logged_at" timestamptz DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR QUERY OPTIMIZATION
-- ============================================

-- Session indexes for common queries (active sessions only, since completed ones are removed)
CREATE INDEX idx_sessions_table_id ON "sessions" ("table_id");
CREATE INDEX idx_sessions_status ON "sessions" ("status") WHERE "status" = 'active';
CREATE INDEX idx_sessions_tier_id ON "sessions" ("session_tier_id");

-- Order indexes for current session lookups
CREATE INDEX idx_orders_session_id ON "orders" ("session_id");
CREATE INDEX idx_orders_session_created ON "orders" ("session_id", "created_at");

-- Order items indexes
CREATE INDEX idx_order_items_order_id ON "order_items" ("order_id");
CREATE INDEX idx_order_items_item_id ON "order_items" ("item_id");

-- Menu item indexes
CREATE INDEX idx_menu_items_category_id ON "menu_items" ("category_id");
CREATE INDEX idx_menu_items_available ON "menu_items" ("is_available") WHERE "is_deleted" = false;

-- Log indexes for reporting (main data source after sessions are removed)
CREATE INDEX idx_session_logs_started_at ON "session_logs" ("started_at");
CREATE INDEX idx_session_logs_ended_at ON "session_logs" ("ended_at");
CREATE INDEX idx_session_logs_tier ON "session_logs" ("session_tier_code");
CREATE INDEX idx_session_logs_date_tier ON "session_logs" ("started_at", "session_tier_code");
CREATE INDEX idx_session_logs_payment_method ON "session_logs" ("payment_method", "started_at");

CREATE INDEX idx_menu_logs_item_id ON "menu_item_logs" ("item_id");
CREATE INDEX idx_menu_logs_ordered_at ON "menu_item_logs" ("ordered_at");
CREATE INDEX idx_menu_logs_item_ordered ON "menu_item_logs" ("item_id", "ordered_at");
CREATE INDEX idx_menu_logs_category ON "menu_item_logs" ("category_name", "ordered_at");
CREATE INDEX idx_menu_logs_tier ON "menu_item_logs" ("session_tier_code", "ordered_at");

-- Customer tier indexes
CREATE INDEX idx_customer_tiers_session_customer_id ON "customer_tiers" ("session_customer_id");
CREATE INDEX idx_customer_tiers_active ON "customer_tiers" ("session_customer_id", "ended_at") WHERE "ended_at" IS NULL;

-- Tier indexes
CREATE INDEX idx_tiers_active ON "tiers" ("is_active", "priority");

-- Session customers indexes
CREATE INDEX idx_session_customers_session_id ON "session_customers" ("session_id");
