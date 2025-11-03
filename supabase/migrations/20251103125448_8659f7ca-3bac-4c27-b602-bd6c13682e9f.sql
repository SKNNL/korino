-- Add foreign key constraints to ensure referential integrity
-- Using IF NOT EXISTS pattern won't work in Postgres for ALTER TABLE
-- So we'll use a DO block to check and add constraints

DO $$
BEGIN
  -- 1. Add foreign key for favorites table
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'favorites_item_id_fkey'
  ) THEN
    ALTER TABLE public.favorites
    ADD CONSTRAINT favorites_item_id_fkey 
    FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE CASCADE;
  END IF;

  -- 2. Add foreign key for swipes table
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'swipes_item_id_fkey'
  ) THEN
    ALTER TABLE public.swipes
    ADD CONSTRAINT swipes_item_id_fkey 
    FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE CASCADE;
  END IF;

  -- 3. Add foreign keys for interest_messages table
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'interest_messages_sender_id_fkey'
  ) THEN
    ALTER TABLE public.interest_messages
    ADD CONSTRAINT interest_messages_sender_id_fkey 
    FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'interest_messages_receiver_id_fkey'
  ) THEN
    ALTER TABLE public.interest_messages
    ADD CONSTRAINT interest_messages_receiver_id_fkey 
    FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'interest_messages_item_id_fkey'
  ) THEN
    ALTER TABLE public.interest_messages
    ADD CONSTRAINT interest_messages_item_id_fkey 
    FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE CASCADE;
  END IF;

  -- 4. Add foreign keys for messages table
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'messages_match_id_fkey'
  ) THEN
    ALTER TABLE public.messages
    ADD CONSTRAINT messages_match_id_fkey 
    FOREIGN KEY (match_id) REFERENCES public.matches(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'messages_sender_id_fkey'
  ) THEN
    ALTER TABLE public.messages
    ADD CONSTRAINT messages_sender_id_fkey 
    FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

  -- 5. Add foreign keys for matches table
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'matches_user1_id_fkey'
  ) THEN
    ALTER TABLE public.matches
    ADD CONSTRAINT matches_user1_id_fkey 
    FOREIGN KEY (user1_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'matches_user2_id_fkey'
  ) THEN
    ALTER TABLE public.matches
    ADD CONSTRAINT matches_user2_id_fkey 
    FOREIGN KEY (user2_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'matches_item1_id_fkey'
  ) THEN
    ALTER TABLE public.matches
    ADD CONSTRAINT matches_item1_id_fkey 
    FOREIGN KEY (item1_id) REFERENCES public.items(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'matches_item2_id_fkey'
  ) THEN
    ALTER TABLE public.matches
    ADD CONSTRAINT matches_item2_id_fkey 
    FOREIGN KEY (item2_id) REFERENCES public.items(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Update storage policies to enforce user-specific folder paths
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can upload item images" ON storage.objects;
CREATE POLICY "Users can upload item images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'items' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Improve check_for_match function with additional validation
CREATE OR REPLACE FUNCTION public.check_for_match()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_item_owner_id UUID;
  v_matching_swipe_item_id UUID;
BEGIN
  -- Only process right swipes
  IF NEW.swipe_direction = 'right' THEN
    -- Get the owner of the item being swiped on
    SELECT user_id INTO v_item_owner_id
    FROM public.items
    WHERE id = NEW.item_id;
    
    -- Exit early if no owner found
    IF v_item_owner_id IS NULL THEN
      RETURN NEW;
    END IF;
    
    -- Verify the swipe is for an active item
    IF NOT EXISTS (
      SELECT 1 FROM public.items 
      WHERE id = NEW.item_id AND is_active = true
    ) THEN
      RETURN NEW;
    END IF;
    
    -- Check if the item owner has also swiped right on any of the current user's items
    SELECT s.item_id INTO v_matching_swipe_item_id
    FROM public.swipes s
    INNER JOIN public.items i ON s.item_id = i.id
    WHERE s.user_id = v_item_owner_id
      AND i.user_id = NEW.user_id
      AND i.is_active = true
      AND s.swipe_direction = 'right'
    LIMIT 1;
    
    -- If a matching swipe exists, create a match
    IF v_matching_swipe_item_id IS NOT NULL THEN
      INSERT INTO public.matches (user1_id, user2_id, item1_id, item2_id)
      VALUES (NEW.user_id, v_item_owner_id, v_matching_swipe_item_id, NEW.item_id)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;