-- Script SQL básico sem extensões para criar a tabela products
-- Use este script quando tiver problemas com outros scripts

-- TABELA DE PRODUTOS (versão mais simples)
DROP TABLE IF EXISTS public.products;
CREATE TABLE public.products (
  id TEXT PRIMARY KEY DEFAULT replace(md5(random()::text || clock_timestamp()::text), '-', ''),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC DEFAULT 0,
  discount INTEGER DEFAULT 0,
  stock INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  on_sale BOOLEAN DEFAULT FALSE,
  imageUrl TEXT,
  images TEXT[] DEFAULT '{}'::TEXT[],
  colors TEXT[] DEFAULT '{}'::TEXT[],
  sizes TEXT[] DEFAULT '{}'::TEXT[],
  category TEXT DEFAULT '',
  type TEXT DEFAULT 'clothing',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permitir acesso público à tabela
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Products Policy" ON public.products;
CREATE POLICY "Public Products Policy" ON public.products FOR ALL USING (true) WITH CHECK (true);

-- Inserir um produto de teste
INSERT INTO public.products (name, description, price, category, type)
VALUES ('Camiseta Teste', 'Esta é uma camiseta de teste', 99.90, 'Camisetas', 'clothing');

-- Comando para verificar se a tabela foi criada
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'products'
); 