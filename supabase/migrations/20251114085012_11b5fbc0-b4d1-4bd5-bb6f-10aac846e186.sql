-- Add verification status to profiles
ALTER TABLE public.profiles 
ADD COLUMN is_verified BOOLEAN DEFAULT false,
ADD COLUMN verified_at TIMESTAMP WITH TIME ZONE;

-- Add estimated value to items
ALTER TABLE public.items 
ADD COLUMN estimated_value NUMERIC(10,2);

-- Create exchange proposals table for multiple item exchanges
CREATE TABLE public.exchange_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_items UUID[] NOT NULL,
  receiver_item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_item_id UUID REFERENCES public.items(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'inappropriate', 'fraud', 'other')),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT report_target_check CHECK (
    (reported_user_id IS NOT NULL AND reported_item_id IS NULL) OR
    (reported_user_id IS NULL AND reported_item_id IS NOT NULL)
  )
);

-- Create message templates table
CREATE TABLE public.message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exchange_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exchange_proposals
CREATE POLICY "Users can view proposals they're part of"
  ON public.exchange_proposals FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create proposals"
  ON public.exchange_proposals FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received proposals"
  ON public.exchange_proposals FOR UPDATE
  USING (auth.uid() = receiver_id);

-- RLS Policies for reports
CREATE POLICY "Users can view their own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- RLS Policies for message_templates
CREATE POLICY "Users can view their own templates"
  ON public.message_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own templates"
  ON public.message_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
  ON public.message_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
  ON public.message_templates FOR DELETE
  USING (auth.uid() = user_id);

-- Update profiles RLS to allow public viewing
DROP POLICY IF EXISTS "Users can view matched profiles" ON public.profiles;

CREATE POLICY "Anyone can view profiles"
  ON public.profiles FOR SELECT
  USING (true);

-- Function to calculate CO2 saved (average 2.5kg CO2 per item exchanged)
CREATE OR REPLACE FUNCTION public.get_user_co2_saved(user_id_param UUID)
RETURNS NUMERIC
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(COUNT(*) * 2.5, 0)
  FROM public.matches
  WHERE (user1_id = user_id_param OR user2_id = user_id_param)
    AND status = 'completed';
$$;

-- Function to get user stats
CREATE OR REPLACE FUNCTION public.get_user_stats(user_id_param UUID)
RETURNS TABLE (
  total_items INTEGER,
  active_items INTEGER,
  total_matches INTEGER,
  completed_exchanges INTEGER,
  average_rating NUMERIC,
  total_value NUMERIC,
  co2_saved NUMERIC
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT COUNT(*)::INTEGER FROM public.items WHERE user_id = user_id_param),
    (SELECT COUNT(*)::INTEGER FROM public.items WHERE user_id = user_id_param AND is_active = true),
    (SELECT COUNT(*)::INTEGER FROM public.matches WHERE user1_id = user_id_param OR user2_id = user_id_param),
    (SELECT COUNT(*)::INTEGER FROM public.matches WHERE (user1_id = user_id_param OR user2_id = user_id_param) AND status = 'completed'),
    (SELECT COALESCE(AVG(rating), 0)::NUMERIC(3,2) FROM public.reviews WHERE reviewed_user_id = user_id_param),
    (SELECT COALESCE(SUM(estimated_value), 0) FROM public.items WHERE user_id = user_id_param),
    (SELECT public.get_user_co2_saved(user_id_param));
$$;