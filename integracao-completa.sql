-- Script de integração completa - Corrige todos os problemas de salvamento
-- Execute este script no SQL Editor do Supabase

-- 1. VERIFICAR E CORRIGIR A TABELA DE PRODUTOS
-- Primeiro, verifica se a tabela existe e cria se necessário
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) DEFAULT 0,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verificar e corrigir tipos das colunas (ajusta se já existir)
ALTER TABLE public.products 
  ALTER COLUMN price TYPE NUMERIC(10,2),
  ALTER COLUMN discount TYPE INTEGER,
  ALTER COLUMN stock TYPE INTEGER,
  ALTER COLUMN featured TYPE BOOLEAN USING CASE WHEN featured::TEXT = 'true' THEN TRUE ELSE FALSE END,
  ALTER COLUMN on_sale TYPE BOOLEAN USING CASE WHEN on_sale::TEXT = 'true' THEN TRUE ELSE FALSE END;

-- Garantir que arrays são tratados corretamente
DO $$
BEGIN
  -- Verificar se imagens é um array
  EXECUTE 'ALTER TABLE public.products ALTER COLUMN images TYPE TEXT[]';
  EXCEPTION WHEN OTHERS THEN
    ALTER TABLE public.products DROP COLUMN IF EXISTS images;
    ALTER TABLE public.products ADD COLUMN images TEXT[] DEFAULT ARRAY[]::TEXT[];
  
  -- Verificar se cores é um array
  EXECUTE 'ALTER TABLE public.products ALTER COLUMN colors TYPE TEXT[]';
  EXCEPTION WHEN OTHERS THEN
    ALTER TABLE public.products DROP COLUMN IF EXISTS colors;
    ALTER TABLE public.products ADD COLUMN colors TEXT[] DEFAULT ARRAY[]::TEXT[];
  
  -- Verificar se tamanhos é um array
  EXECUTE 'ALTER TABLE public.products ALTER COLUMN sizes TYPE TEXT[]';
  EXCEPTION WHEN OTHERS THEN
    ALTER TABLE public.products DROP COLUMN IF EXISTS sizes;
    ALTER TABLE public.products ADD COLUMN sizes TEXT[] DEFAULT ARRAY[]::TEXT[];
END $$;

-- 2. GARANTIR POLÍTICAS DE ACESSO
-- Habilitar segurança por linha (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.products;
DROP POLICY IF EXISTS "Enable update for all users" ON public.products;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.products;
DROP POLICY IF EXISTS "Acesso público a produtos" ON public.products;

-- Criar políticas de acesso totalmente abertas para desenvolvimento
CREATE POLICY "Acesso total a produtos" 
ON public.products 
FOR ALL
USING (true) 
WITH CHECK (true);

-- 3. CONFIGURAR BUCKET DE IMAGENS CORRETAMENTE
-- Verificar e configurar bucket de imagens
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images', 
  'images', 
  true, 
  209715200, -- 200MB
  ARRAY[
    'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp',
    'image/svg+xml', 'image/bmp', 'image/tiff',
    'application/octet-stream', 'application/pdf'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 209715200,
  allowed_mime_types = ARRAY[
    'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp',
    'image/svg+xml', 'image/bmp', 'image/tiff',
    'application/octet-stream', 'application/pdf'
  ]::text[];

-- Configurar políticas para o bucket de imagens
DROP POLICY IF EXISTS "Acesso público ao bucket de imagens" ON storage.objects;
DROP POLICY IF EXISTS "Upload público no bucket de imagens" ON storage.objects;

CREATE POLICY "Acesso público ao bucket de imagens"
ON storage.objects
FOR SELECT
USING (bucket_id = 'images');

CREATE POLICY "Upload público no bucket de imagens"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'images');

-- 4. INSERIR PRODUTO DE TESTE
-- Inserir produto de teste para confirmar que a estrutura está correta
INSERT INTO public.products (
  name, 
  description, 
  price, 
  discount, 
  stock, 
  featured, 
  on_sale, 
  category, 
  type,
  sizes,
  colors
)
VALUES (
  'Produto de Teste SQL', 
  'Este produto foi inserido pelo script de integração para confirmar que a estrutura está correta',
  149.90,
  10,
  50,
  TRUE,
  TRUE,
  'Camisetas',
  'clothing',
  ARRAY['P', 'M', 'G']::TEXT[],
  ARRAY['Preto', 'Branco', 'Azul']::TEXT[]
)
ON CONFLICT DO NOTHING;

-- 5. VERIFICAÇÃO FINAL
-- Exibir estrutura da tabela
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM 
  information_schema.columns
WHERE 
  table_schema = 'public' 
  AND table_name = 'products'
ORDER BY ordinal_position;

-- Exibir produtos existentes
SELECT * FROM public.products LIMIT 10; 