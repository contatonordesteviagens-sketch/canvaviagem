-- Add name column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name TEXT;

-- Add name column to magic_link_tokens table
ALTER TABLE public.magic_link_tokens ADD COLUMN IF NOT EXISTS name TEXT;