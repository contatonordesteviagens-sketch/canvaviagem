-- Add columns for external media and highlighting
ALTER TABLE content_items 
ADD COLUMN IF NOT EXISTS media_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_highlighted BOOLEAN DEFAULT false;

-- Add check constraint for media_type values
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'content_items_media_type_check'
    ) THEN
        ALTER TABLE content_items 
        ADD CONSTRAINT content_items_media_type_check 
        CHECK (media_type IS NULL OR media_type IN ('gif', 'video'));
    END IF;
END $$;