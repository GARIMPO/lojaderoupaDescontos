-- Script SQL simplificado para criar apenas as tabelas básicas
-- Use esse script se estiver tendo problemas com o script completo

-- Habilitar extensão necessária para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TABELA DE PRODUTOS
DROP TABLE IF EXISTS public.products;
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12, 2) NOT NULL DEFAULT 0,
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

-- TABELA DE CONFIGURAÇÕES DA LOJA
DROP TABLE IF EXISTS public.store_settings;
CREATE TABLE public.store_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT DEFAULT 'Fashion Frenzy',
  logo_url TEXT,
  banner_url TEXT,
  share_image_url TEXT,
  primary_color TEXT DEFAULT '#f13c3c',
  secondary_color TEXT DEFAULT '#2e2e2e',
  accent_color TEXT DEFAULT '#4d97fd',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA DE CATEGORIAS
DROP TABLE IF EXISTS public.categories;
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA DE CARRINHOS
DROP TABLE IF EXISTS public.carts;
CREATE TABLE public.carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  items JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HABILITAR RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE ACESSO PÚBLICO PARA DESENVOLVIMENTO
DROP POLICY IF EXISTS "Acesso público total a produtos" ON public.products;
CREATE POLICY "Acesso público total a produtos"
ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso público total a configurações" ON public.store_settings;
CREATE POLICY "Acesso público total a configurações"
ON public.store_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso público total a categorias" ON public.categories;
CREATE POLICY "Acesso público total a categorias"
ON public.categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso público total a carrinhos" ON public.carts;
CREATE POLICY "Acesso público total a carrinhos"
ON public.carts FOR ALL USING (true) WITH CHECK (true);

-- VERIFICAR BUCKET DE ARMAZENAMENTO
DO $$
BEGIN
  -- Criar bucket de imagens se não existir
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'images', 
    'images', 
    true, 
    104857600,  -- 100MB
    ARRAY[
      'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp',
      'image/svg+xml', 'application/octet-stream'
    ]::text[]
  ) ON CONFLICT (id) DO UPDATE
  SET 
    file_size_limit = 104857600,
    allowed_mime_types = ARRAY[
      'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp',
      'image/svg+xml', 'application/octet-stream'
    ]::text[],
    public = true;
END $$;

-- Permissões para bucket de armazenamento
DROP POLICY IF EXISTS "Acesso público ao bucket de imagens" ON storage.objects;
CREATE POLICY "Acesso público ao bucket de imagens"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

DROP POLICY IF EXISTS "Upload público no bucket de imagens" ON storage.objects;
CREATE POLICY "Upload público no bucket de imagens"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'images');

DROP POLICY IF EXISTS "Atualização pública no bucket de imagens" ON storage.objects;
CREATE POLICY "Atualização pública no bucket de imagens"
ON storage.objects FOR UPDATE
USING (bucket_id = 'images')
WITH CHECK (bucket_id = 'images');

-- INSERIR ALGUNS DADOS INICIAIS
INSERT INTO public.categories (name, description)
VALUES 
  ('Camisetas', 'Camisetas e tops'),
  ('Calças', 'Calças e shorts'),
  ('Vestidos', 'Vestidos e saias'),
  ('Acessórios', 'Bolsas, cintos e joias'),
  ('Calçados', 'Sapatos, tênis e sandálias')
ON CONFLICT DO NOTHING;

-- Configuração inicial da loja
INSERT INTO public.store_settings (name, primary_color, secondary_color, accent_color)
VALUES ('Fashion Frenzy', '#f13c3c', '#2e2e2e', '#4d97fd')
ON CONFLICT DO NOTHING; 