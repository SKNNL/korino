-- Fix 1: Restrict profile visibility to matched users only
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

CREATE POLICY "Users can view matched profiles" ON public.profiles
FOR SELECT TO authenticated
USING (
  id = auth.uid() OR  -- Users can see their own profile
  EXISTS (
    SELECT 1 FROM public.matches
    WHERE (user1_id = auth.uid() AND user2_id = profiles.id)
       OR (user2_id = auth.uid() AND user1_id = profiles.id)
  )
);

-- Fix 2: Create items storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('items', 'items', true)
ON CONFLICT (id) DO NOTHING;

-- Add RLS policies for items bucket
CREATE POLICY "Item images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'items');

CREATE POLICY "Users can upload item images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'items' AND 
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their item images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'items' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add file size and type restrictions
UPDATE storage.buckets 
SET file_size_limit = 5242880,  -- 5MB limit
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE id = 'items';