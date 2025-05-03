-- Configuração do Supabase para Fashion Frenzy
-- Execute este SQL no editor SQL do Supabase: https://xzvkkbrbwxghhqtncxok.supabase.co

-- ==================
-- EXTENSÕES NECESSÁRIAS
-- ==================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================
-- TABELAS
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

-- ==================
-- SEGURANÇA (RLS)
-- ==================

-- Ativar RLS para tabelas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Acesso público para produtos" ON products;
DROP POLICY IF EXISTS "Acesso público para configurações" ON store_settings;

-- Criar políticas de acesso público
CREATE POLICY "Acesso público para produtos" ON products
  FOR ALL USING (true);

CREATE POLICY "Acesso público para configurações" ON store_settings
  FOR ALL USING (true);

-- ==================
-- TRIGGERS
-- ==================

-- Função para atualizar o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para produtos
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Trigger para configurações
DROP TRIGGER IF EXISTS update_store_settings_updated_at ON store_settings;
CREATE TRIGGER update_store_settings_updated_at
BEFORE UPDATE ON store_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Produto de teste
INSERT INTO products (id, name, description, price, category, type, imageUrl, show_on_homepage)
VALUES ('test-product-1', 'Produto Teste', 'Descrição do produto teste', 99.90, 'Masculino', 'clothing', 'https://via.placeholder.com/300', true)
ON CONFLICT (id) DO NOTHING; 