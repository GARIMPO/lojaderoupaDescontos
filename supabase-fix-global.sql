-- SQL para corrigir problemas de salvamento global
-- Este script otimiza todas as configurações e tabelas para garantir funcionamento correto

-- 1. Verificar e definir extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Recriar o bucket de armazenamento com configurações corretas
-- Verificar se o bucket existe e, se não, criar
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images', 
  'images', 
  true, -- tornar bucket público
  104857600, -- aumentar limite para 100MB
  ARRAY[
    'image/png', 
    'image/jpeg', 
    'image/jpg', 
    'image/gif', 
    'image/webp', 
    'image/svg+xml',
    'application/octet-stream' -- para qualquer tipo binário
  ]::text[]
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY[
    'image/png', 
    'image/jpeg', 
    'image/jpg', 
    'image/gif', 
    'image/webp', 
    'image/svg+xml',
    'application/octet-stream'
  ]::text[];

-- 3. Ajustar tipos de dados da tabela de produtos para evitar erros de tipo
ALTER TABLE IF EXISTS public.products 
  ALTER COLUMN price TYPE DECIMAL(12, 2),
  ALTER COLUMN discount TYPE INTEGER,
  ALTER COLUMN stock TYPE INTEGER,
  ALTER COLUMN sizes TYPE TEXT[] USING COALESCE(sizes, '{}'),
  ALTER COLUMN colors TYPE TEXT[] USING COALESCE(colors, '{}'),
  ALTER COLUMN images TYPE TEXT[] USING COALESCE(images, '{}');

-- 4. Adicionar opção NULL a campos problemáticos que podem causar erros de salvamento
ALTER TABLE IF EXISTS public.products 
  ALTER COLUMN discount DROP NOT NULL,
  ALTER COLUMN stock DROP NOT NULL,
  ALTER COLUMN featured DROP NOT NULL,
  ALTER COLUMN on_sale DROP NOT NULL;

ALTER TABLE IF EXISTS public.store_settings
  ALTER COLUMN theme_color DROP NOT NULL,
  ALTER COLUMN accent_color DROP NOT NULL;

-- 5. Assegurar que a tabela de categorias existe
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Inserir categorias padrão
INSERT INTO public.categories (name)
VALUES 
  ('Roupas'),
  ('Calçados'),
  ('Acessórios'),
  ('Decoração'),
  ('Eletrônicos')
ON CONFLICT (name) DO NOTHING;

-- 7. Assegurar políticas RLS (Row Level Security) estejam configuradas corretamente
-- Ativar RLS nas tabelas
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Acesso público total a produtos" ON public.products;
DROP POLICY IF EXISTS "Acesso público total a store_settings" ON public.store_settings;
DROP POLICY IF EXISTS "Acesso público total a categories" ON public.categories;
DROP POLICY IF EXISTS "Acesso público total ao bucket images" ON storage.objects;

-- Criar novas políticas com acesso total para desenvolvimento
CREATE POLICY "Acesso público total a produtos"
ON public.products FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Acesso público total a store_settings"
ON public.store_settings FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Acesso público total a categories"
ON public.categories FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Acesso público total ao bucket images"
ON storage.objects FOR ALL 
USING (bucket_id = 'images')
WITH CHECK (bucket_id = 'images');

-- 8. Otimizar a tabela de produtos para melhor performance
-- Adicionar índices para consultas comuns
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at);

-- 9. Adicionar trigger para atualização automática do timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger à tabela de produtos
DROP TRIGGER IF EXISTS set_timestamp ON public.products;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 10. Resolver problemas de permissão no Storage
-- Garantir que o supabase_storage_admin tenha todas as permissões necessárias
GRANT ALL ON SCHEMA storage TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA storage TO postgres;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA storage TO postgres;

-- 11. Habilitar permissão de leitura anônima para o bucket
ALTER DEFAULT PRIVILEGES IN SCHEMA storage
GRANT SELECT ON TABLES TO anon;

-- 12. Verificar permissões corretas no bucket images
SELECT 
  b.name, 
  b.public,
  b.file_size_limit,
  b.allowed_mime_types,
  count(o.id) as total_objects
FROM 
  storage.buckets b
LEFT JOIN 
  storage.objects o ON b.id = o.bucket_id
WHERE 
  b.name = 'images'
GROUP BY 
  b.name, b.public, b.file_size_limit, b.allowed_mime_types; 