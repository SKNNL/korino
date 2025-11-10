-- Add notification preferences to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS match_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS message_notifications BOOLEAN DEFAULT true;

-- Create comprehensive user deletion function
CREATE OR REPLACE FUNCTION public.delete_user_account(user_id_to_delete UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the requesting user is deleting their own account
  IF auth.uid() != user_id_to_delete THEN
    RAISE EXCEPTION 'Unauthorized: You can only delete your own account';
  END IF;

  -- Delete user data in correct order (respecting foreign keys)
  DELETE FROM public.favorites WHERE user_id = user_id_to_delete;
  DELETE FROM public.swipes WHERE user_id = user_id_to_delete;
  DELETE FROM public.notifications WHERE user_id = user_id_to_delete;
  DELETE FROM public.interest_messages WHERE sender_id = user_id_to_delete OR receiver_id = user_id_to_delete;
  DELETE FROM public.messages WHERE sender_id = user_id_to_delete;
  DELETE FROM public.reviews WHERE reviewer_id = user_id_to_delete OR reviewed_user_id = user_id_to_delete;
  DELETE FROM public.matches WHERE user1_id = user_id_to_delete OR user2_id = user_id_to_delete;
  DELETE FROM public.items WHERE user_id = user_id_to_delete;
  DELETE FROM public.profiles WHERE id = user_id_to_delete;
  
  -- Delete from auth.users (requires service role, will be handled by trigger)
  DELETE FROM auth.users WHERE id = user_id_to_delete;
END;
$$;

-- Create review validation function
CREATE OR REPLACE FUNCTION public.validate_review_input()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validate rating range
  IF NEW.rating < 1 OR NEW.rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;
  
  -- Validate comment length if provided
  IF NEW.comment IS NOT NULL THEN
    NEW.comment := TRIM(NEW.comment);
    IF LENGTH(NEW.comment) > 1000 THEN
      RAISE EXCEPTION 'Comment cannot exceed 1000 characters';
    END IF;
    IF LENGTH(NEW.comment) = 0 THEN
      NEW.comment := NULL;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for review validation
DROP TRIGGER IF EXISTS validate_review_before_insert ON public.reviews;
CREATE TRIGGER validate_review_before_insert
  BEFORE INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_review_input();