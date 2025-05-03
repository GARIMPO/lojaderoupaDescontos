-- SQL completo para corrigir problemas na integração com Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Preparar para recriação limpando tabelas e políticas existentes
-- Remover tabelas na ordem correta para evitar problemas de chave estrangeira
DROP TABLE IF EXISTS public.carts;
DROP TABLE IF EXISTS public.products;
DROP TABLE IF EXISTS public.store_settings;
DROP TABLE IF EXISTS public.categories;

-- 2. Criar tabela de produtos com estrutura correta
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  discount INTEGER DEFAULT 0,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  featured BOOLEAN DEFAULT FALSE,
  category TEXT,
  on_sale BOOLEAN DEFAULT FALSE,
  sizes TEXT[],
  colors TEXT[],
  main_image TEXT,
  images TEXT[],
  user_id UUID,
  -- Adicionar outros campos usados na aplicação
  imageUrl TEXT,
  type TEXT
);

-- 3. Criar tabela de configurações da loja
CREATE TABLE public.store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name TEXT NOT NULL DEFAULT 'Minha Loja',
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  theme_color TEXT DEFAULT '#4F46E5',
  accent_color TEXT DEFAULT '#9333EA',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  share_image_url TEXT,
  user_id UUID,
  -- Compatibilidade com campos usados na aplicação
  logoImage TEXT,
  shareImage TEXT,
  bannerConfig JSONB
);

-- 4. Criar tabela de categorias
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Criar tabela de carrinhos
CREATE TABLE public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  items JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Configurar armazenamento para imagens
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('images', 'images', true, 52428800, 
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml']::text[]
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml']::text[];

-- 7. Habilitar RLS (Row Level Security) em todas as tabelas
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 8. Remover políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.products;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.products;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.products;
DROP POLICY IF EXISTS "Acesso público total a produtos" ON public.products;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.store_settings;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.store_settings;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.store_settings;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.store_settings;
DROP POLICY IF EXISTS "Acesso público total a store_settings" ON public.store_settings;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.categories;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.categories;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.categories;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.categories;
DROP POLICY IF EXISTS "Acesso público total a categories" ON public.categories;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.carts;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.carts;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.carts;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.carts;
DROP POLICY IF EXISTS "Acesso público total a carts" ON public.carts;

DROP POLICY IF EXISTS "Acesso público para o bucket images" ON storage.objects;
DROP POLICY IF EXISTS "Permitir acesso público de leitura" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload público" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização pública" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusão pública" ON storage.objects;

-- 9. Criar políticas de acesso público para desenvolvimento
-- Produtos
CREATE POLICY "Acesso público total a produtos"
ON public.products
FOR ALL
USING (true)
WITH CHECK (true);

-- Configurações da loja
CREATE POLICY "Acesso público total a store_settings"
ON public.store_settings
FOR ALL
USING (true)
WITH CHECK (true);

-- Categorias
CREATE POLICY "Acesso público total a categories"
ON public.categories
FOR ALL
USING (true)
WITH CHECK (true);

-- Carrinhos
CREATE POLICY "Acesso público total a carts"
ON public.carts
FOR ALL
USING (true)
WITH CHECK (true);

-- Storage (imagens)
CREATE POLICY "Acesso público para o bucket images"
ON storage.objects
FOR ALL
USING (bucket_id = 'images')
WITH CHECK (bucket_id = 'images');

-- 10. Criar gatilho para atualização automática de timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar gatilho às tabelas
DROP TRIGGER IF EXISTS set_timestamp ON public.products;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS set_timestamp_settings ON public.store_settings;
CREATE TRIGGER set_timestamp_settings
BEFORE UPDATE ON public.store_settings
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS set_timestamp_categories ON public.categories;
CREATE TRIGGER set_timestamp_categories
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS set_timestamp_carts ON public.carts;
CREATE TRIGGER set_timestamp_carts
BEFORE UPDATE ON public.carts
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 11. Inserir categorias básicas para começar
INSERT INTO public.categories (name) VALUES 
('Roupas'),
('Calçados'),
('Acessórios'),
('Decoração'),
('Eletrônicos')
ON CONFLICT (name) DO NOTHING;

-- 12. Verificar se tudo foi criado corretamente
SELECT 'products' as tabela, COUNT(*) FROM public.products
UNION ALL
SELECT 'store_settings' as tabela, COUNT(*) FROM public.store_settings
UNION ALL
SELECT 'categories' as tabela, COUNT(*) FROM public.categories
UNION ALL
SELECT 'carts' as tabela, COUNT(*) FROM public.carts;

-- Verificar políticas
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE schemaname IN ('public', 'storage')
ORDER BY schemaname, tablename; 