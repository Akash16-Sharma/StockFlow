-- Ensure UPDATE payloads include old row data
ALTER TABLE public.products REPLICA IDENTITY FULL;

-- Ensure products table is included in realtime publication (idempotent)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
  WHEN undefined_object THEN
    -- publication should exist on Lovable Cloud; ignore if not
    NULL;
END $$;