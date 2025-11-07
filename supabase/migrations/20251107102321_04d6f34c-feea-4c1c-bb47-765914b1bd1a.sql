-- Fix the search_path security warning for the get_user_average_rating function
DROP FUNCTION IF EXISTS public.get_user_average_rating(UUID);

CREATE OR REPLACE FUNCTION public.get_user_average_rating(user_id UUID)
RETURNS NUMERIC 
LANGUAGE SQL 
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(AVG(rating), 0)::NUMERIC(3,2)
  FROM public.reviews
  WHERE reviewed_user_id = user_id;
$$;