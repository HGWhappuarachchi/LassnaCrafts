-- RLS FINAL: Secure admin operations behind Supabase Auth.
-- Run this AFTER you have set up an admin user in Supabase Auth.
-- This reverts the open-access policies to require a valid session.

-- PRODUCTS
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;
DROP POLICY IF EXISTS "Admins can view all products" ON products;
DROP POLICY IF EXISTS "Public can view active products" ON products;

CREATE POLICY "Public can view active products" ON products
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can view all products" ON products
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert products" ON products
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admins can update products" ON products
FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Admins can delete products" ON products
FOR DELETE TO authenticated USING (true);

-- CATEGORIES
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
DROP POLICY IF EXISTS "Public can view categories" ON categories;

CREATE POLICY "Public can view categories" ON categories
FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON categories
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- PROMOTIONS
DROP POLICY IF EXISTS "Anyone can manage promotions" ON promotions;
DROP POLICY IF EXISTS "Admins can manage promotions" ON promotions;
DROP POLICY IF EXISTS "Public can view active promotions" ON promotions;

-- Public can validate promo codes (needed for cart)
CREATE POLICY "Public can view active promotions" ON promotions
FOR SELECT USING (is_active = true AND (start_date IS NULL OR start_date <= NOW()) AND (end_date IS NULL OR end_date >= NOW()));

CREATE POLICY "Admins can manage promotions" ON promotions
FOR ALL TO authenticated USING (true) WITH CHECK (true);
