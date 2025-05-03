-- Script SQL super simplificado para criar apenas a tabela products
-- Use este script se estiver tendo problemas com os scripts mais complexos

-- Tabela de produtos básica
DROP TABLE IF EXISTS public.products;
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12, 2) DEFAULT 0,
  discount INTEGER DEFAULT 0,
  stock INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  on_sale BOOLEAN DEFAULT FALSE,
  imageUrl TEXT,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  colors TEXT[] DEFAULT ARRAY[]::TEXT[],
  sizes TEXT[] DEFAULT ARRAY[]::TEXT[],
  category TEXT DEFAULT '',
  type TEXT DEFAULT 'clothing',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Habilitar acesso público à tabela products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
CREATE POLICY "Enable read access for all users" 
ON public.products FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Enable insert for all users" ON public.products;
CREATE POLICY "Enable insert for all users" 
ON public.products FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users" ON public.products;
CREATE POLICY "Enable update for all users" 
ON public.products FOR UPDATE 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "Enable delete for all users" ON public.products;
CREATE POLICY "Enable delete for all users" 
ON public.products FOR DELETE 
USING (true); 