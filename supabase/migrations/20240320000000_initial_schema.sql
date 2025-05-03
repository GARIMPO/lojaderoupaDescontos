-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    images TEXT[],
    category TEXT,
    sizes TEXT[],
    colors TEXT[],
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create store_settings table
CREATE TABLE IF NOT EXISTS store_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_name TEXT,
    store_description TEXT,
    logo_image TEXT,
    banner_config JSONB,
    share_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create carts table
CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create RLS policies for products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON products;

CREATE POLICY "Enable read access for all users" ON products
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON products
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON products
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create RLS policies for store_settings
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON store_settings;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON store_settings;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON store_settings;

CREATE POLICY "Enable read access for all users" ON store_settings
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON store_settings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON store_settings
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create RLS policies for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON categories;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON categories;

CREATE POLICY "Enable read access for all users" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON categories
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON categories
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create RLS policies for carts
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for users on their own cart" ON carts;
DROP POLICY IF EXISTS "Enable insert for users on their own cart" ON carts;
DROP POLICY IF EXISTS "Enable update for users on their own cart" ON carts;
DROP POLICY IF EXISTS "Enable delete for users on their own cart" ON carts;

CREATE POLICY "Enable read access for users on their own cart" ON carts
    FOR SELECT USING (auth.uid()::text = user_id::text OR user_id IS NULL);

CREATE POLICY "Enable insert for users on their own cart" ON carts
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text OR user_id IS NULL);

CREATE POLICY "Enable update for users on their own cart" ON carts
    FOR UPDATE USING (auth.uid()::text = user_id::text OR user_id IS NULL);

CREATE POLICY "Enable delete for users on their own cart" ON carts
    FOR DELETE USING (auth.uid()::text = user_id::text OR user_id IS NULL);

-- Create storage bucket for images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for images bucket
DROP POLICY IF EXISTS "Allow public access to images" ON storage.objects;
CREATE POLICY "Allow public access to images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

DROP POLICY IF EXISTS "Allow authenticated users to upload images" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'images'
    AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Allow authenticated users to update their own images" ON storage.objects;
CREATE POLICY "Allow authenticated users to update their own images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'images'
    AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Allow authenticated users to delete their own images" ON storage.objects;
CREATE POLICY "Allow authenticated users to delete their own images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'images'
    AND auth.role() = 'authenticated'
); 