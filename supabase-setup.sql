-- Script para configurar o Supabase para salvar imagens e configurações globalmente

-- Tabela para configurações da loja (store_settings)
CREATE TABLE IF NOT EXISTS store_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Configurações básicas da loja
  store_name TEXT DEFAULT 'Minha Loja',
  logo_image TEXT,
  share_image TEXT,
  footer_text TEXT DEFAULT '© 2024 Minha Loja',
  
  -- Configuração de banner e categorias
  banner_config JSONB DEFAULT '{"imageUrl": "", "title": "Nova Coleção", "subtitle": "Veja as novidades", "showExploreButton": true, "textColor": "#FFFFFF", "buttonColor": "#000000"}',
  category_highlights JSONB DEFAULT '{"enabled": true, "title": "Categorias em Destaque", "categories": []}',
  
  -- Outras configurações como JSON para facilitar atualizações
  store_config JSONB DEFAULT '{
    "storeNameFont": "Arial, sans-serif",
    "storeNameColor": "#000000",
    "storeNameSize": "24px",
    "pageTitle": "Bem-vindo à Minha Loja",
    "pageTitleFont": "Arial, sans-serif",
    "pageTitleColor": "#000000",
    "pageTitleSize": "24px",
    "pageSubtitle": "",
    "mapLink": "",
    "deliveryInfo": "",
    "showPaymentMethods": true,
    "storeEmail": "",
    "storeAddress": "",
    "storePhone": "",
    "activePaymentMethods": {
      "credit": true,
      "debit": true,
      "pix": true,
      "cash": true,
      "other": true
    },
    "headerLinks": {
      "novidades": true,
      "masculino": true,
      "feminino": true,
      "kids": true,
      "calcados": true,
      "acessorios": true,
      "off": true,
      "customLinks": []
    },
    "headerColor": "#FFFFFF",
    "headerLinkColor": "#000000",
    "socialMedia": {
      "enabled": false,
      "instagram": {"enabled": false, "url": ""},
      "facebook": {"enabled": false, "url": ""},
      "whatsapp": {"enabled": false, "url": ""},
      "tiktok": {"enabled": false, "url": ""},
      "twitter": {"enabled": false, "url": ""},
      "website": {"enabled": false, "url": ""}
    }
  }'
);

-- Habilitar RLS na tabela
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir acesso anônimo
CREATE POLICY "Permitir leitura pública" ON store_settings FOR SELECT USING (true);
CREATE POLICY "Permitir inserção anônima" ON store_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização anônima" ON store_settings FOR UPDATE USING (true);

-- Criar registro inicial (se não existir)
INSERT INTO store_settings (id)
SELECT '00000000-0000-0000-0000-000000000001'
WHERE NOT EXISTS (SELECT 1 FROM store_settings);

-- INSTRUÇÕES PARA CONFIGURAÇÃO DO STORAGE:
/*
IMPORTANTE: Execute manualmente os seguintes passos no console do Supabase:

1. Vá para "Storage" no menu lateral
2. Clique em "Create new bucket"
   - Nome: images
   - Marque a opção "Public bucket" para permitir acesso público às imagens
   - Clique em "Create bucket"

3. Selecione o bucket "images" e vá para a aba "Policies" 
4. Crie 4 políticas com estas configurações:
   
   a) Para visualização:
      - Nome: "Permitir visualização pública"
      - Allowed operation: SELECT
      - Policy definition: true
   
   b) Para upload:
      - Nome: "Permitir upload anônimo"
      - Allowed operation: INSERT
      - Policy definition: true
   
   c) Para atualização:
      - Nome: "Permitir atualização anônima"
      - Allowed operation: UPDATE
      - Policy definition: true
      
   d) Para exclusão:
      - Nome: "Permitir exclusão anônima"
      - Allowed operation: DELETE
      - Policy definition: true

5. Crie as seguintes pastas dentro do bucket "images":
   - logo
   - banners
   - products
   - share
   - categories
*/

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

-- ==================
-- CONFIGURAÇÃO DE SEGURANÇA (RLS)
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
-- CONFIGURAÇÃO DE TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
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

-- ==================
-- INSTRUÇÕES PARA CONFIGURAÇÃO DE STORAGE
-- ==================

-- IMPORTANTE: A criação de buckets e políticas de storage deve ser feita através da interface do Supabase
-- ou usando a API, pois não é possível fazer diretamente por SQL.
-- Siga as instruções abaixo manualmente após executar este script:

/*
CONFIGURAÇÃO DO BUCKET DE STORAGE:

1. Acesse o Supabase Dashboard -> Storage
2. Crie um novo bucket chamado "images" marcando a opção "Public bucket"
3. Dentro do bucket "images", crie as seguintes pastas:
   - products
   - logo
   - banners
   - share
   - categories

4. Configure as políticas de acesso:
   Vá em Storage -> Policies e adicione as seguintes políticas para o bucket "images":

   a) PARA LEITURA (SELECT):
      - Name: "Permitir leitura pública"
      - Definition: true
      - Role: anon, authenticated

   b) PARA UPLOAD (INSERT):
      - Name: "Permitir upload anônimo"
      - Definition: true
      - Role: anon, authenticated

   c) PARA ATUALIZAÇÃO (UPDATE):
      - Name: "Permitir atualizações anônimas"
      - Definition: true
      - Role: anon, authenticated

   d) PARA EXCLUSÃO (DELETE):
      - Name: "Permitir exclusão anônima"
      - Definition: true
      - Role: anon, authenticated
*/

-- ==================
-- TESTE DE INTEGRAÇÃO
-- ==================

-- Para verificar se a integração está funcionando, insira alguns dados de teste:
INSERT INTO products (id, name, description, price, category, type, imageUrl, show_on_homepage)
VALUES ('test-product-1', 'Produto Teste 1', 'Descrição do produto teste', 99.90, 'Masculino', 'clothing', 'https://via.placeholder.com/300', true)
ON CONFLICT (id) DO NOTHING;

-- Você pode verificar se o produto foi inserido com a consulta:
-- SELECT * FROM products WHERE id = 'test-product-1'; 