-- Fix 1: Restrict profiles to authenticated users only
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Fix 2: Restrict items to authenticated users only
DROP POLICY IF EXISTS "Anyone can view active items" ON public.items;

CREATE POLICY "Authenticated users can view active items"
ON public.items FOR SELECT
TO authenticated
USING (is_active = true);

-- Fix 3: Remove public INSERT on notifications - only allow via SECURITY DEFINER function
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Create a more restrictive policy that only allows the service role
CREATE POLICY "Only service role can insert notifications"
ON public.notifications FOR INSERT
TO service_role
WITH CHECK (true);