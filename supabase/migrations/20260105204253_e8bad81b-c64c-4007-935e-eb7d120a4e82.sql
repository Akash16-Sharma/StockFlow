-- Add indexes for optimized queries
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(barcode) WHERE barcode IS NOT NULL;