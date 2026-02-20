-- Supabase Schema for Lassana E-Commerce

-- 1. Categories Table
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Products Table
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    images TEXT[] DEFAULT '{}', -- Array of image URLs from Supabase Storage
    stock_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Promotions / Discounts Table
CREATE TABLE promotions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value DECIMAL(10, 2) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Orders Table
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    customer_email VARCHAR(255),
    shipping_address TEXT,
    total_amount DECIMAL(10, 2) NOT NULL,
    discount_id UUID REFERENCES promotions(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, shipped, delivered, cancelled
    payment_method VARCHAR(50) DEFAULT 'whatsapp', -- whatsapp, stripe
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Order Items Table
CREATE TABLE order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Categories Policies
-- Public can read categories
CREATE POLICY "Public can view categories" ON categories 
FOR SELECT USING (true);
-- Only authenticated users (admins) can modify categories
CREATE POLICY "Admins can insert categories" ON categories 
FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update categories" ON categories 
FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete categories" ON categories 
FOR DELETE TO authenticated USING (true);

-- Products Policies
-- Public can read active products only
CREATE POLICY "Public can view active products" ON products 
FOR SELECT USING (is_active = true);
-- Admins can view all products
CREATE POLICY "Admins can view all products" ON products 
FOR SELECT TO authenticated USING (true);
-- Admins can modify products
CREATE POLICY "Admins can insert products" ON products 
FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update products" ON products 
FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete products" ON products 
FOR DELETE TO authenticated USING (true);

-- Promotions Policies
-- Public can view active promotions to check codes
CREATE POLICY "Public can view active promotions" ON promotions 
FOR SELECT USING (is_active = true AND (start_date IS NULL OR start_date <= NOW()) AND (end_date IS NULL OR end_date >= NOW()));
-- Admins can manage promotions
CREATE POLICY "Admins can manage promotions" ON promotions 
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Orders Policies
-- Public can insert orders (if creating via the storefront before WhatsApp)
CREATE POLICY "Public can insert orders" ON orders 
FOR INSERT WITH CHECK (true);
-- Admins can manage all orders
CREATE POLICY "Admins can view orders" ON orders 
FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can update orders" ON orders 
FOR UPDATE TO authenticated USING (true);

-- Order Items Policies
-- Public can insert order items
CREATE POLICY "Public can insert order items" ON order_items 
FOR INSERT WITH CHECK (true);
-- Admins can view order items
CREATE POLICY "Admins can view order items" ON order_items 
FOR SELECT TO authenticated USING (true);

-- Functions
-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON promotions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
