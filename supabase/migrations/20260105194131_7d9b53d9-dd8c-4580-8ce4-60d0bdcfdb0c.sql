-- Add barcode column to products table
ALTER TABLE public.products 
ADD COLUMN barcode TEXT;

-- Create index for barcode lookups
CREATE INDEX idx_products_barcode ON public.products(barcode);

-- Create unique constraint per user for barcode (a user can't have duplicate barcodes)
CREATE UNIQUE INDEX idx_products_user_barcode ON public.products(user_id, barcode) WHERE barcode IS NOT NULL;