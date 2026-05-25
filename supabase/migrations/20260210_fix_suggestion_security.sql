-- Fix security vulnerabilities in user_suggestions
-- This migration adds rate limiting and validation to prevent spam

-- Drop the insecure anonymous policy
DROP POLICY IF EXISTS "Anonymous can insert suggestions" ON user_suggestions;

-- Create a rate-limiting function using PostgreSQL's built-in features
CREATE OR REPLACE FUNCTION check_suggestion_rate_limit(p_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Count suggestions from this email in the last hour
  SELECT COUNT(*) INTO recent_count
  FROM user_suggestions
  WHERE user_email = p_email
  AND created_at > NOW() - INTERVAL '1 hour';
  
  -- Allow max 3 suggestions per hour per email
  RETURN recent_count < 3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- New secure anonymous policy with rate limiting and validation
CREATE POLICY "Anonymous can insert suggestions with limits"
ON user_suggestions
FOR INSERT
TO anon
WITH CHECK (
  -- Ensure email is provided and looks valid
  user_email IS NOT NULL 
  AND user_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  -- Ensure suggestion text is provided and not too short/long
  AND suggestion_text IS NOT NULL
  AND length(trim(suggestion_text)) >= 10
  AND length(suggestion_text) <= 1000
  -- Check rate limit
  AND check_suggestion_rate_limit(user_email)
);

-- Add index to improve rate limiting query performance
CREATE INDEX IF NOT EXISTS idx_suggestions_email_created 
ON user_suggestions(user_email, created_at DESC);

-- Add comment explaining the security measures
COMMENT ON POLICY "Anonymous can insert suggestions with limits" ON user_suggestions IS
'Allows anonymous suggestions with protections: email validation, content length limits (10-1000 chars), and rate limiting (3 per hour per email)';
