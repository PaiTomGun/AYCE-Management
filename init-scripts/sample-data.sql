-- Sample Data for AYCE Management System

-- ============================================
-- SEED ACCOUNTS (MUST RUN FIRST)
-- ============================================

-- Seed Admin Account
-- Username: admin, Password: admin123
INSERT INTO accounts (id, username, password_hash, role, is_active, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001', 'admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin', true, NOW(), NOW())
ON CONFLICT (username) DO NOTHING;

-- Seed Staff Account
-- Username: staff, Password: staff123
INSERT INTO accounts (id, username, password_hash, role, is_active, created_by, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000002', 'staff', 'c5e51e5995efae0cca275a1f671fd5b645f5338bb6936e5d30f7b5c0c9b5c4e9', 'staff', true, '00000000-0000-0000-0000-000000000001', NOW(), NOW())
ON CONFLICT (username) DO NOTHING;

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert Tiers (Buffet Price Levels)
INSERT INTO tiers (id, code, display_name, price_per_person_baht, priority, is_active, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'STANDARD', 'Standard Buffet', 399.00, 1, true, NOW()),
('22222222-2222-2222-2222-222222222222', 'PREMIUM', 'Premium Buffet', 599.00, 2, true, NOW()),
('33333333-3333-3333-3333-333333333333', 'VIP', 'VIP Buffet', 899.00, 3, true, NOW());

-- Insert Menu Categories
INSERT INTO menu_categories (id, name, position, created_at) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'เนื้อสัตว์', 1, NOW()),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ของทะเล', 2, NOW()),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'ผัก', 3, NOW()),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'ของหวาน', 4, NOW());

-- Insert Menu Items - Meat
INSERT INTO menu_items (id, category_id, name, description, is_available, stock, created_at, updated_at) VALUES
('10000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'หมูสามชั้น', 'หมูสามชั้นคุณภาพดี', true, 100, NOW(), NOW()),
('10000000-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'เนื้อวัว', 'เนื้อวัวชั้นดี', true, 80, NOW(), NOW()),
('10000000-0000-0000-0000-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ไก่', 'เนื้อไก่สด', true, 100, NOW(), NOW()),
('10000000-0000-0000-0000-000000000004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'เนื้อแกะ', 'เนื้อแกะนุ่ม', true, 50, NOW(), NOW());

-- Insert Menu Items - Seafood
INSERT INTO menu_items (id, category_id, name, description, is_available, stock, created_at, updated_at) VALUES
('20000000-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'กุ้ง', 'กุ้งสด', true, 100, NOW(), NOW()),
('20000000-0000-0000-0000-000000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'หมึก', 'หมึกสด', true, 80, NOW(), NOW()),
('20000000-0000-0000-0000-000000000003', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ปลา', 'ปลาสด', true, 60, NOW(), NOW()),
('20000000-0000-0000-0000-000000000004', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'หอยแมลงภู่', 'หอยแมลงภู่สด', true, 70, NOW(), NOW());

-- Insert Menu Items - Vegetables
INSERT INTO menu_items (id, category_id, name, description, is_available, stock, created_at, updated_at) VALUES
('30000000-0000-0000-0000-000000000001', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'ผักบุ้ง', 'ผักบุ้งสด', true, 100, NOW(), NOW()),
('30000000-0000-0000-0000-000000000002', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'กะหล่ำปลี', 'กะหล่ำปลีสด', true, 100, NOW(), NOW()),
('30000000-0000-0000-0000-000000000003', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'เห็ด', 'เห็ดหลากหลายชนิด', true, 100, NOW(), NOW()),
('30000000-0000-0000-0000-000000000004', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'ข้าวโพด', 'ข้าวโพดหวาน', true, 80, NOW(), NOW());

-- Insert Menu Items - Desserts
INSERT INTO menu_items (id, category_id, name, description, is_available, stock, created_at, updated_at) VALUES
('40000000-0000-0000-0000-000000000001', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'ไอศกรีม', 'ไอศกรีมหลากหลายรส', true, 200, NOW(), NOW()),
('40000000-0000-0000-0000-000000000002', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'เค้ก', 'เค้กหลากหลายชนิด', true, 100, NOW(), NOW()),
('40000000-0000-0000-0000-000000000003', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'ผลไม้', 'ผลไม้สด', true, 150, NOW(), NOW());

-- Link Menu Items to Tiers (Standard tier gets basic items)
INSERT INTO menu_item_tiers (id, item_id, tier_id) 
SELECT 
  gen_random_uuid(),
  mi.id,
  '11111111-1111-1111-1111-111111111111'
FROM menu_items mi
WHERE mi.category_id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'cccccccc-cccc-cccc-cccc-cccccccccccc');

-- Premium tier gets all items
INSERT INTO menu_item_tiers (id, item_id, tier_id) 
SELECT 
  gen_random_uuid(),
  mi.id,
  '22222222-2222-2222-2222-222222222222'
FROM menu_items mi;

-- VIP tier gets all items
INSERT INTO menu_item_tiers (id, item_id, tier_id) 
SELECT 
  gen_random_uuid(),
  mi.id,
  '33333333-3333-3333-3333-333333333333'
FROM menu_items mi;

-- Insert Restaurant Tables
INSERT INTO restaurant_tables (id, table_code, seats, qr_code_slug, layout, created_at, updated_at) VALUES
('10000000-0000-0000-0000-000000000001', 'Table 1', 2, 'qr-table-1', '{"x": 0, "y": 0}', NOW(), NOW()),
('10000000-0000-0000-0000-000000000002', 'Table 2', 4, 'qr-table-2', '{"x": 1, "y": 0}', NOW(), NOW()),
('10000000-0000-0000-0000-000000000003', 'Table 3', 4, 'qr-table-3', '{"x": 2, "y": 0}', NOW(), NOW()),
('10000000-0000-0000-0000-000000000004', 'Table 4', 6, 'qr-table-4', '{"x": 0, "y": 1}', NOW(), NOW()),
('10000000-0000-0000-0000-000000000005', 'Table 5', 6, 'qr-table-5', '{"x": 1, "y": 1}', NOW(), NOW()),
('10000000-0000-0000-0000-000000000006', 'Table 6', 8, 'qr-table-6', '{"x": 2, "y": 1}', NOW(), NOW()),
('10000000-0000-0000-0000-000000000007', 'Table 7', 2, 'qr-table-7', '{"x": 0, "y": 2}', NOW(), NOW()),
('10000000-0000-0000-0000-000000000008', 'Table 8', 4, 'qr-table-8', '{"x": 1, "y": 2}', NOW(), NOW()),
('10000000-0000-0000-0000-000000000009', 'Table 9', 4, 'qr-table-9', '{"x": 2, "y": 2}', NOW(), NOW());

-- Insert Sample Session Logs for Analytics (past week)
INSERT INTO session_logs (
  id, session_id, customer_count, session_tier_code, duration_minutes,
  buffet_price_per_person_baht, total_amount_baht, payment_method, table_code,
  started_at, ended_at, logged_at
) 
SELECT 
  gen_random_uuid(),
  gen_random_uuid(),
  floor(random() * 6 + 2)::int, -- 2-8 customers
  (ARRAY['STANDARD', 'PREMIUM', 'VIP'])[floor(random() * 3 + 1)],
  floor(random() * 60 + 60)::int, -- 60-120 minutes
  (ARRAY[399, 599, 899])[floor(random() * 3 + 1)],
  (floor(random() * 6 + 2) * (ARRAY[399, 599, 899])[floor(random() * 3 + 1)])::decimal,
  (ARRAY['cash', 'credit_card', 'promptpay'])[floor(random() * 3 + 1)],
  'Table ' || floor(random() * 9 + 1)::text,
  NOW() - (random() * interval '7 days') - interval '2 hours',
  NOW() - (random() * interval '7 days'),
  NOW()
FROM generate_series(1, 100); -- Generate 100 sample logs

COMMIT;
