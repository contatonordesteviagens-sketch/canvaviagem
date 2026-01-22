-- Add explicit blocking policies for subscriptions table
-- These ensure only the Service Role (webhooks) can modify subscription data

-- Block direct INSERT from authenticated users
CREATE POLICY "Block direct subscription inserts"
ON public.subscriptions
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Block direct UPDATE from authenticated users
CREATE POLICY "Block direct subscription updates"
ON public.subscriptions
FOR UPDATE
TO authenticated
USING (false);

-- Block direct DELETE from authenticated users
CREATE POLICY "Block direct subscription deletes"
ON public.subscriptions
FOR DELETE
TO authenticated
USING (false);