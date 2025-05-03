-- Script simplificado para corrigir problemas de salvamento
-- Execute no SQL Editor do Supabase

-- 1. Verificar e corrigir a tabela de produtos
BEGIN;

-- Se a tabela não existir, vamos criá-la corretamente
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

-- 2. Configurar as políticas de acesso
-- Habilitar Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Apagar políticas existentes para evitar conflitos
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

-- 3. Configurar bucket de armazenamento para imagens
-- Garantir que o bucket existe e está configurado corretamente
SELECT CASE 
  WHEN NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'images'
  ) THEN
    storage.create_bucket('images'::text, '{"public": true, "file_size_limit": 209715200}'::jsonb)
  ELSE
    -- Atualizar bucket existente para ter permissões públicas
    UPDATE storage.buckets SET public = true, file_size_limit = 209715200 WHERE id = 'images'
END;

-- 4. Configurar as políticas para o bucket de imagens
-- Remover políticas existentes para o bucket
DROP POLICY IF EXISTS "Acesso público ao bucket de imagens" ON storage.objects;
DROP POLICY IF EXISTS "Upload público no bucket de imagens" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização pública" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusão pública" ON storage.objects;
DROP POLICY IF EXISTS "Acesso público para o bucket images" ON storage.objects;

-- Criar políticas simples para permitir todas as operações
CREATE POLICY "Acesso público para leitura no bucket images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'images');

CREATE POLICY "Permitir upload público no bucket images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'images');

CREATE POLICY "Permitir atualização pública no bucket images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'images')
WITH CHECK (bucket_id = 'images');

CREATE POLICY "Permitir exclusão pública no bucket images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'images');

-- 5. Inserir produto de teste, se a tabela estiver vazia
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
SELECT 
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
WHERE NOT EXISTS (
  SELECT 1 FROM public.products LIMIT 1
);

COMMIT;

-- 6. Verificação final - exibir informações úteis
SELECT 
  count(*) as total_products,
  (SELECT COUNT(*) FROM storage.buckets WHERE id = 'images') as bucket_exists,
  (SELECT count(*) FROM pg_policies WHERE policyname = 'Acesso total a produtos') as product_policy_exists,
  (SELECT count(*) FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%bucket images%') as storage_policies
FROM public.products; 