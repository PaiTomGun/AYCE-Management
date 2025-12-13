-- Add session_duration_minutes column to sessions table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sessions' AND column_name = 'session_duration_minutes'
    ) THEN
        ALTER TABLE sessions ADD COLUMN session_duration_minutes INTEGER DEFAULT 90;
    END IF;
END $$;

-- Add image_base64 column to menu_items table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'menu_items' AND column_name = 'image_base64'
    ) THEN
        ALTER TABLE menu_items ADD COLUMN image_base64 TEXT;
    END IF;
END $$;

-- Update existing sessions to have default duration
UPDATE sessions SET session_duration_minutes = 90 WHERE session_duration_minutes IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_duration ON sessions(session_duration_minutes);
-- Note: Index on image_base64 removed because base64 images exceed PostgreSQL's 8191 byte index limit
