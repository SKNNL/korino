-- Add geolocation fields to items table
ALTER TABLE public.items 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Add geolocation fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Create reviews table for rating system
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL,
  reviewer_id UUID NOT NULL,
  reviewed_user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_review_per_match_user UNIQUE(match_id, reviewer_id)
);

-- Enable RLS on reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Users can view reviews of matched users
CREATE POLICY "Users can view reviews of matched users"
ON public.reviews
FOR SELECT
USING (
  auth.uid() = reviewer_id OR 
  auth.uid() = reviewed_user_id OR
  EXISTS (
    SELECT 1 FROM public.matches
    WHERE matches.id = reviews.match_id
    AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
  )
);

-- Users can create reviews for their matches
CREATE POLICY "Users can create reviews for matches"
ON public.reviews
FOR INSERT
WITH CHECK (
  auth.uid() = reviewer_id AND
  EXISTS (
    SELECT 1 FROM public.matches
    WHERE matches.id = reviews.match_id
    AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    AND matches.status = 'completed'
  )
);

-- Create function to calculate average rating
CREATE OR REPLACE FUNCTION public.get_user_average_rating(user_id UUID)
RETURNS NUMERIC AS $$
  SELECT COALESCE(AVG(rating), 0)::NUMERIC(3,2)
  FROM public.reviews
  WHERE reviewed_user_id = user_id;
$$ LANGUAGE SQL STABLE;

-- Create index for geolocation queries
CREATE INDEX IF NOT EXISTS idx_items_location ON public.items(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;