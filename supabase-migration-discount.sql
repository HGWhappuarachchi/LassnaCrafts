-- Run this in your Supabase SQL Editor.
-- Step 1: Add compare_at_price column to products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS compare_at_price DECIMAL(10, 2) DEFAULT NULL;

-- Step 2: Create the products storage bucket for image uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Storage policies (DROP first — IF NOT EXISTS is not supported for policies)
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update product images" ON storage.objects;

CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

CREATE POLICY "Anyone can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'products');

CREATE POLICY "Anyone can update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'products');
