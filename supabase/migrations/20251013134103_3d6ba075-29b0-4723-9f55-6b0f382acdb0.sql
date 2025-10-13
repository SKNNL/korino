-- Add new columns to items table for brand, condition, and price_range
ALTER TABLE public.items
ADD COLUMN brand TEXT,
ADD COLUMN condition TEXT CHECK (condition IN ('neuf', 'tres_bon_etat', 'bon_etat', 'etat_correct', 'pour_pieces')),
ADD COLUMN price_range TEXT CHECK (price_range IN ('gratuit', '1_10', '10_30', '30_50', '50_100', '100_200', '200_plus'));