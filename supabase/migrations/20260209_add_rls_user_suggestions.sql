-- Enable RLS on user_suggestions table
ALTER TABLE user_suggestions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to view only their own suggestions
CREATE POLICY "Users can view own suggestions"
ON user_suggestions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Allow users to insert their own suggestions
CREATE POLICY "Users can insert own suggestions"
ON user_suggestions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Allow anonymous users to insert suggestions (for logged-out users)
CREATE POLICY "Anonymous can insert suggestions"
ON user_suggestions
FOR INSERT
TO anon
WITH CHECK (true);

-- Policy: Admins can view all suggestions
-- Note: You'll need to create an admin role or use a custom claim
-- For now, using a simple approach with a helper function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user email matches admin email
  RETURN (
    SELECT email FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'agenciarochadigitalmidia@gmail.com'
  ) IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Admins can view all suggestions"
ON user_suggestions
FOR SELECT
TO authenticated
USING (is_admin());

-- Policy: Admins can update/delete any suggestion
CREATE POLICY "Admins can update all suggestions"
ON user_suggestions
FOR UPDATE
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can delete all suggestions"
ON user_suggestions
FOR DELETE
TO authenticated
USING (is_admin());
