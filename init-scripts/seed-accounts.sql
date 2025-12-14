-- Seed Admin Account
-- Default admin account with username: admin, password: admin123
-- Password hash is SHA256 of "admin123"

INSERT INTO accounts (id, username, password_hash, role, is_active, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001', 'admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin', true, NOW(), NOW());

-- Optional: Seed a staff account
-- Username: staff, password: staff123
-- Password hash is SHA256 of "staff123"

INSERT INTO accounts (id, username, password_hash, role, is_active, created_by, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000002', 'staff', '10176e7b7b24d317acfcf8d2064cfd2f24e154f7b5a96603077d5ef813d6a6b6', 'staff', true, '00000000-0000-0000-0000-000000000001', NOW(), NOW());

COMMIT;
