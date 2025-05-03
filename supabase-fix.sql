-- CONFIGURAÇÃO DEFINITIVA DO BANCO DE DADOS PARA FASHION FRENZY
-- Execute este script no SQL Editor do Supabase

-- ==========================================
-- TABELAS PRINCIPAIS
-- ==========================================

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
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
CREATE TABLE IF NOT EXISTS store_settings (
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

-- ==========================================
-- POLÍTICAS DE SEGURANÇA
-- ==========================================

-- Ativar RLS (Row Level Security)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable insert access for all users" ON products;
DROP POLICY IF EXISTS "Enable update access for all users" ON products;
DROP POLICY IF EXISTS "Enable delete access for all users" ON products;

DROP POLICY IF EXISTS "Enable read access for all users" ON store_settings;
DROP POLICY IF EXISTS "Enable insert access for all users" ON store_settings;
DROP POLICY IF EXISTS "Enable update access for all users" ON store_settings;
DROP POLICY IF EXISTS "Enable delete access for all users" ON store_settings;

-- Criar políticas TOTALMENTE PÚBLICAS para simplificar o desenvolvimento
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