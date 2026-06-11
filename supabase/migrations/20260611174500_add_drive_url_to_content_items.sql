-- Add drive_url column to content_items table
ALTER TABLE "public"."content_items" ADD COLUMN IF NOT EXISTS "drive_url" text;
