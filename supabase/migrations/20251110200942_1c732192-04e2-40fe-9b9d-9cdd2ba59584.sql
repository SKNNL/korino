-- Fix search_path for validate_review_input function
CREATE OR REPLACE FUNCTION public.validate_review_input()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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