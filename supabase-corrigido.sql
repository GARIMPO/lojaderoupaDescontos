-- Script corrigido para resolver problemas de salvamento no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. VERIFICAR E CORRIGIR A TABELA DE PRODUTOS
-- Recriamos a tabela de produtos com a estrutura correta
DROP TABLE IF EXISTS public.products;

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
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

-- 2. GARANTIR POLÍTICAS DE ACESSO CORRETAS
-- Habilitar segurança por linha (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.products;
DROP POLICY IF EXISTS "Enable update for all users" ON public.products;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.products;
DROP POLICY IF EXISTS "Acesso público a produtos" ON public.products;
DROP POLICY IF EXISTS "Acesso total a produtos" ON public.products;

-- Criar política de acesso totalmente aberta para desenvolvimento
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

-- Remover políticas antigas do bucket de imagens
DROP POLICY IF EXISTS "Acesso público ao bucket de imagens" ON storage.objects;
DROP POLICY IF EXISTS "Upload público no bucket de imagens" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização pública" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusão pública" ON storage.objects;
DROP POLICY IF EXISTS "Acesso público para o bucket images" ON storage.objects;

-- Criar política para permitir leitura pública
CREATE POLICY "Acesso público para leitura no bucket images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'images');

-- Criar política para permitir inserção pública
CREATE POLICY "Permitir upload público no bucket images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'images');

-- Criar política para permitir atualização pública
CREATE POLICY "Permitir atualização pública no bucket images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'images')
WITH CHECK (bucket_id = 'images');

-- Criar política para permitir exclusão pública
CREATE POLICY "Permitir exclusão pública no bucket images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'images');

-- 4. Inserir produto de teste para confirmar que a estrutura está correta
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

-- Exibir políticas
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM 
  pg_policies
WHERE 
  schemaname IN ('public', 'storage') AND 
  (tablename = 'products' OR tablename = 'objects')
ORDER BY 
  schemaname, tablename; 