-- Create item_images table for multiple images per item
CREATE TABLE public.item_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for queries by item
CREATE INDEX idx_item_images_item_id ON public.item_images(item_id);

-- Enable RLS
ALTER TABLE public.item_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view item images"
ON public.item_images FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert images for own items"
ON public.item_images FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.items 
    WHERE id = item_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete images for own items"
ON public.item_images FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.items 
    WHERE id = item_id AND user_id = auth.uid()
  )
);

-- Add read_at column to messages table for read receipts
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- Index for unread messages queries
CREATE INDEX IF NOT EXISTS idx_messages_read_at 
ON public.messages(read_at) WHERE read_at IS NULL;