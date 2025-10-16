-- Enable leaked password protection for better security
-- This is handled via Auth settings, not SQL

-- Add database indexes for performance optimization
-- These will significantly improve query performance with many concurrent users

-- Index for items queries (frequently filtered by category, user, and active status)
CREATE INDEX IF NOT EXISTS idx_items_user_id ON public.items(user_id);
CREATE INDEX IF NOT EXISTS idx_items_category ON public.items(category);
CREATE INDEX IF NOT EXISTS idx_items_is_active ON public.items(is_active);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON public.items(created_at DESC);

-- Index for swipes (used to find matching swipes)
CREATE INDEX IF NOT EXISTS idx_swipes_user_id ON public.swipes(user_id);
CREATE INDEX IF NOT EXISTS idx_swipes_item_id ON public.swipes(item_id);
CREATE INDEX IF NOT EXISTS idx_swipes_direction ON public.swipes(swipe_direction);
CREATE INDEX IF NOT EXISTS idx_swipes_user_item ON public.swipes(user_id, item_id);

-- Index for matches (frequently queried by both users)
CREATE INDEX IF NOT EXISTS idx_matches_user1_id ON public.matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2_id ON public.matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON public.matches(created_at DESC);

-- Index for messages (ordered by time, filtered by match)
CREATE INDEX IF NOT EXISTS idx_messages_match_id ON public.messages(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_match_created ON public.messages(match_id, created_at DESC);

-- Index for favorites
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_item_id ON public.favorites(item_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_item ON public.favorites(user_id, item_id);

-- Add foreign key constraints for data integrity (if not already present)
-- This ensures referential integrity and prevents orphaned records

DO $$ 
BEGIN
  -- Add foreign key for favorites -> items
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'favorites_item_id_fkey' 
    AND table_name = 'favorites'
  ) THEN
    ALTER TABLE public.favorites 
    ADD CONSTRAINT favorites_item_id_fkey 
    FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE CASCADE;
  END IF;

  -- Add foreign key for favorites -> profiles
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'favorites_user_id_fkey' 
    AND table_name = 'favorites'
  ) THEN
    ALTER TABLE public.favorites 
    ADD CONSTRAINT favorites_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

  -- Add foreign key for swipes -> items
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'swipes_item_id_fkey' 
    AND table_name = 'swipes'
  ) THEN
    ALTER TABLE public.swipes 
    ADD CONSTRAINT swipes_item_id_fkey 
    FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE CASCADE;
  END IF;

  -- Add foreign key for swipes -> profiles
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'swipes_user_id_fkey' 
    AND table_name = 'swipes'
  ) THEN
    ALTER TABLE public.swipes 
    ADD CONSTRAINT swipes_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

  -- Add foreign key for items -> profiles
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'items_user_id_fkey' 
    AND table_name = 'items'
  ) THEN
    ALTER TABLE public.items 
    ADD CONSTRAINT items_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

  -- Add foreign key for matches -> items
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'matches_item1_id_fkey' 
    AND table_name = 'matches'
  ) THEN
    ALTER TABLE public.matches 
    ADD CONSTRAINT matches_item1_id_fkey 
    FOREIGN KEY (item1_id) REFERENCES public.items(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'matches_item2_id_fkey' 
    AND table_name = 'matches'
  ) THEN
    ALTER TABLE public.matches 
    ADD CONSTRAINT matches_item2_id_fkey 
    FOREIGN KEY (item2_id) REFERENCES public.items(id) ON DELETE CASCADE;
  END IF;

  -- Add foreign key for matches -> profiles
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'matches_user1_id_fkey' 
    AND table_name = 'matches'
  ) THEN
    ALTER TABLE public.matches 
    ADD CONSTRAINT matches_user1_id_fkey 
    FOREIGN KEY (user1_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'matches_user2_id_fkey' 
    AND table_name = 'matches'
  ) THEN
    ALTER TABLE public.matches 
    ADD CONSTRAINT matches_user2_id_fkey 
    FOREIGN KEY (user2_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

  -- Add foreign key for messages -> matches
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'messages_match_id_fkey' 
    AND table_name = 'messages'
  ) THEN
    ALTER TABLE public.messages 
    ADD CONSTRAINT messages_match_id_fkey 
    FOREIGN KEY (match_id) REFERENCES public.matches(id) ON DELETE CASCADE;
  END IF;

  -- Add foreign key for messages -> profiles
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'messages_sender_id_fkey' 
    AND table_name = 'messages'
  ) THEN
    ALTER TABLE public.messages 
    ADD CONSTRAINT messages_sender_id_fkey 
    FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add unique constraints to prevent duplicate data
ALTER TABLE public.swipes DROP CONSTRAINT IF EXISTS swipes_user_item_unique;
ALTER TABLE public.swipes ADD CONSTRAINT swipes_user_item_unique UNIQUE (user_id, item_id);

-- Optimize the check_for_match function for better performance
CREATE OR REPLACE FUNCTION public.check_for_match()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    
    -- Check if the item owner has also swiped right on any of the current user's items
    -- Using optimized query with early exit
    SELECT s.item_id INTO v_matching_swipe_item_id
    FROM public.swipes s
    INNER JOIN public.items i ON s.item_id = i.id
    WHERE s.user_id = v_item_owner_id
      AND i.user_id = NEW.user_id
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
$function$;

-- Enable the trigger if not already enabled
DROP TRIGGER IF EXISTS on_swipe_check_match ON public.swipes;
CREATE TRIGGER on_swipe_check_match
  AFTER INSERT ON public.swipes
  FOR EACH ROW
  EXECUTE FUNCTION public.check_for_match();

-- Add connection pooling hint comments for documentation
COMMENT ON TABLE public.items IS 'Items table - indexed for high-performance queries with concurrent users';
COMMENT ON TABLE public.swipes IS 'Swipes table - optimized with unique constraint and indexes for match detection';
COMMENT ON TABLE public.matches IS 'Matches table - indexed for fast user match lookups';
COMMENT ON TABLE public.messages IS 'Messages table - indexed for real-time chat performance';