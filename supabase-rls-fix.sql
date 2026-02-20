-- RLS FIX: Allow admin operations without requiring Supabase Auth session.
-- Run this in your Supabase SQL Editor to enable the admin panel to 
-- create/update/delete products and categories without setting up Auth.
--
-- NOTE: These policies are suitable for a private admin setup. When you add 
-- Supabase Auth later, replace these with the `TO authenticated` versions.

-- Allow public (anon) inserts on products
DROP POLICY IF EXISTS "Admins can insert products" ON products;
CREATE POLICY "Admins can insert products" ON products
FOR INSERT WITH CHECK (true);

-- Allow public (anon) updates on products  
DROP POLICY IF EXISTS "Admins can update products" ON products;
CREATE POLICY "Admins can update products" ON products
FOR UPDATE USING (true);

-- Allow public (anon) deletes on products
DROP POLICY IF EXISTS "Admins can delete products" ON products;
CREATE POLICY "Admins can delete products" ON products
FOR DELETE USING (true);

-- Allow public to read ALL products (including drafts) for admin panel
DROP POLICY IF EXISTS "Admins can view all products" ON products;
CREATE POLICY "Admins can view all products" ON products
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert categories" ON categories;
DROP POLICY IF EXISTS "Admins can update categories" ON categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
CREATE POLICY "Admins can manage categories" ON categories
FOR ALL USING (true) WITH CHECK (true);

-- Allow public to manage promotions (admin use without Auth)
DROP POLICY IF EXISTS "Admins can manage promotions" ON promotions;
DROP POLICY IF EXISTS "Public can view active promotions" ON promotions;
CREATE POLICY "Anyone can manage promotions" ON promotions
FOR ALL USING (true) WITH CHECK (true);
