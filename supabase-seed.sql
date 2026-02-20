-- Seed default categories for Lassana
-- Run this in your Supabase SQL Editor after running supabase-schema.sql

INSERT INTO categories (name, slug, description) VALUES
  ('Bouquets',  'bouquets',  'Hand-crafted fresh flower bouquets for every occasion'),
  ('Vases',     'vases',     'Artisan ceramic and glass vases to complement any arrangement'),
  ('Gift Boxes','gift-boxes','Curated floral gift sets and premium gift packaging'),
  ('Orchids',   'orchids',   'Exotic orchid arrangements and single-stem orchids'),
  ('Seasonal',  'seasonal',  'Limited-edition seasonal collections and holiday specials')
ON CONFLICT (slug) DO NOTHING;
