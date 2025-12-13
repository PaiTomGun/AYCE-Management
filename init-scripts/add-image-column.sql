-- Add image_base64 column to menu_items table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'menu_items' 
        AND column_name = 'image_base64'
    ) THEN
        ALTER TABLE menu_items ADD COLUMN image_base64 text;
        RAISE NOTICE 'Column image_base64 added to menu_items table';
    ELSE
        RAISE NOTICE 'Column image_base64 already exists in menu_items table';
    END IF;
END $$;
