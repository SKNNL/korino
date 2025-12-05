-- Create a function that returns items filtered by distance with pagination
CREATE OR REPLACE FUNCTION public.get_items_within_distance(
  user_lat double precision,
  user_lon double precision,
  max_distance_km double precision,
  category_filter text DEFAULT NULL,
  search_filter text DEFAULT NULL,
  page_offset integer DEFAULT 0,
  page_limit integer DEFAULT 12
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  category text,
  location text,
  image_url text,
  created_at timestamptz,
  user_id uuid,
  distance double precision,
  total_count bigint
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH filtered_items AS (
    SELECT 
      i.id,
      i.title,
      i.description,
      i.category,
      i.location,
      i.image_url,
      i.created_at,
      i.user_id,
      public.calculate_distance(user_lat, user_lon, i.latitude, i.longitude) AS dist
    FROM public.items i
    WHERE i.is_active = true
      AND i.latitude IS NOT NULL
      AND i.longitude IS NOT NULL
      AND (category_filter IS NULL OR category_filter = 'all' OR i.category = category_filter)
      AND (search_filter IS NULL OR search_filter = '' OR 
           LOWER(i.title) LIKE '%' || LOWER(search_filter) || '%' OR 
           LOWER(i.description) LIKE '%' || LOWER(search_filter) || '%')
  ),
  distance_filtered AS (
    SELECT * FROM filtered_items
    WHERE dist <= max_distance_km
  ),
  counted AS (
    SELECT COUNT(*) AS cnt FROM distance_filtered
  )
  SELECT 
    df.id,
    df.title,
    df.description,
    df.category,
    df.location,
    df.image_url,
    df.created_at,
    df.user_id,
    df.dist AS distance,
    c.cnt AS total_count
  FROM distance_filtered df
  CROSS JOIN counted c
  ORDER BY df.dist ASC
  OFFSET page_offset
  LIMIT page_limit;
END;
$$;