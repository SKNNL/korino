-- Create interest_messages table for messages sent with right swipes
CREATE TABLE public.interest_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  is_read boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE public.interest_messages ENABLE ROW LEVEL SECURITY;

-- Users can insert their own messages
CREATE POLICY "Users can send interest messages"
ON public.interest_messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Users can view messages they sent
CREATE POLICY "Users can view sent messages"
ON public.interest_messages FOR SELECT
USING (auth.uid() = sender_id);

-- Users can view messages they received
CREATE POLICY "Users can view received messages"
ON public.interest_messages FOR SELECT
USING (auth.uid() = receiver_id);

-- Users can update read status of received messages
CREATE POLICY "Users can update received messages"
ON public.interest_messages FOR UPDATE
USING (auth.uid() = receiver_id);

-- Add index for better performance
CREATE INDEX idx_interest_messages_receiver ON public.interest_messages(receiver_id);
CREATE INDEX idx_interest_messages_sender ON public.interest_messages(sender_id);