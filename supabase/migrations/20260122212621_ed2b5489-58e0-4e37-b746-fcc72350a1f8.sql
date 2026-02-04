-- Mark the 10 most recent video/seasonal items as featured
WITH recent_videos AS (
  SELECT id 
  FROM content_items 
  WHERE type IN ('video', 'seasonal')
  AND is_active = true
  ORDER BY created_at DESC 
  LIMIT 10
)
UPDATE content_items 
SET is_featured = true 
WHERE id IN (SELECT id FROM recent_videos);