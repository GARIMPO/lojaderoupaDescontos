-- CONFIGURAÇÃO COMPLETA DO SUPABASE PARA FASHION FRENZY
-- Execute este script no SQL Editor do Supabase

-- ==================
-- CONFIGURAÇÃO INICIAL - EXTENSÕES NECESSÁRIAS
-- ==================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- ==================
-- CONFIGURAÇÃO DE TABELAS
-- ==================

-- Tabela de produtos
DROP TABLE IF EXISTS products;
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  discount INTEGER DEFAULT 0,
  imageUrl TEXT,
  images TEXT[] DEFAULT '{}',
  category TEXT NOT NULL,
  type TEXT DEFAULT 'clothing',
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  stock INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  show_on_homepage BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de configurações da loja
DROP TABLE IF EXISTS store_settings;
CREATE TABLE store_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_name TEXT,
  store_name_font TEXT,
  store_name_color TEXT,
  store_name_size TEXT,
  page_title TEXT,
  page_title_font TEXT,
  page_title_color TEXT,
  page_title_size TEXT,
  page_subtitle TEXT,
  logo_image TEXT,
  map_link TEXT,
  share_image TEXT,
  footer_text TEXT,
  delivery_info TEXT,
  show_payment_methods BOOLEAN DEFAULT true,
  store_email TEXT,
  store_address TEXT,
  store_phone TEXT,
  active_payment_methods JSONB DEFAULT '{"credit": true, "debit": true, "pix": true, "cash": true, "other": true}',
  banner_config JSONB,
  header_links JSONB,
  header_color TEXT,
  header_link_color TEXT,
  category_highlights JSONB,
  social_media JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de categorias
DROP TABLE IF EXISTS categories;
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de carrinhos
DROP TABLE IF EXISTS carts;
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  items JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==================
-- CONFIGURAÇÃO DE SEGURANÇA (RLS)
-- ==================

-- Ativar RLS para tabelas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable insert access for all users" ON products;
DROP POLICY IF EXISTS "Enable update access for all users" ON products;
DROP POLICY IF EXISTS "Enable delete access for all users" ON products;

DROP POLICY IF EXISTS "Enable read access for all users" ON store_settings;
DROP POLICY IF EXISTS "Enable insert access for all users" ON store_settings;
DROP POLICY IF EXISTS "Enable update access for all users" ON store_settings;
DROP POLICY IF EXISTS "Enable delete access for all users" ON store_settings;

DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
DROP POLICY IF EXISTS "Enable insert access for all users" ON categories;
DROP POLICY IF EXISTS "Enable update access for all users" ON categories;
DROP POLICY IF EXISTS "Enable delete access for all users" ON categories;

DROP POLICY IF EXISTS "Enable read access for all users" ON carts;
DROP POLICY IF EXISTS "Enable insert access for all users" ON carts;
DROP POLICY IF EXISTS "Enable update access for all users" ON carts;
DROP POLICY IF EXISTS "Enable delete access for all users" ON carts;

-- Criar políticas completamente públicas para simplificar o desenvolvimento
-- Produtos
CREATE POLICY "Enable read access for all users" ON products FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON products FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON products FOR DELETE USING (true);

-- Configurações
CREATE POLICY "Enable read access for all users" ON store_settings FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON store_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON store_settings FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON store_settings FOR DELETE USING (true);

-- Categorias
CREATE POLICY "Enable read access for all users" ON categories FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON categories FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON categories FOR DELETE USING (true);

-- Carrinhos
CREATE POLICY "Enable read access for all users" ON carts FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON carts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON carts FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON carts FOR DELETE USING (true);

-- ==================
-- TRIGGER PARA ATUALIZAÇÃO AUTOMÁTICA
-- ==================
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_modtime
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_store_settings_modtime
    BEFORE UPDATE ON store_settings
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

-- ==================
-- Inserir alguns dados iniciais para teste
-- ==================

-- Produto de teste
INSERT INTO products (id, name, description, price, category, imageUrl, type)
VALUES (
  'test-product-001',
  'Camiseta Teste',
  'Camiseta de alta qualidade para teste',
  99.90,
  'masculino',
  'https://via.placeholder.com/600x800',
  'clothing'
) ON CONFLICT (id) DO NOTHING;

-- Configurações iniciais 
INSERT INTO store_settings (id, store_name, page_title)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Fashion Frenzy',
  'Bem-vindo à Fashion Frenzy'
) ON CONFLICT (id) DO NOTHING;

-- ==================
-- INSTRUÇÕES ADICIONAIS
-- ==================

/*
APÓS EXECUTAR ESTE SCRIPT, SIGA ESTAS ETAPAS NO CONSOLE DO SUPABASE:

1. Vá para Storage -> Buckets
2. Clique em "New Bucket" e crie um bucket chamado "images"
3. Configure o bucket "images" como público
4. Dentro do bucket 'images', crie as seguintes pastas:
   - products
   - logo
   - banners
   - share
   - categories

5. Vá para Storage -> Policies e adicione as seguintes políticas:
   - Selecione o bucket "images"
   - Adicione uma policy para:
     * Permitir SELECT para todos (permitir leitura pública)
     * Permitir INSERT para todos (permitir upload público)
     * Permitir UPDATE para todos (permitir atualização pública)
     * Permitir DELETE para todos (permitir exclusão pública)
*/ 