-- Script para configurar a tabela 'products' no Supabase
-- Este script cria ou modifica a tabela para garantir que ela tenha todos os campos necessários

-- Verifica se a tabela products existe, se não existir, cria
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Dados básicos do produto
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  stock INTEGER DEFAULT 0,
  
  -- Categoria e tipo
  category TEXT,
  type TEXT, -- 'clothing', 'shoes', 'accessory'
  
  -- Imagens
  imageUrl TEXT,
  images JSONB DEFAULT '[]',
  
  -- Tamanhos e cores disponíveis
  sizes JSONB DEFAULT '[]',
  colors JSONB DEFAULT '[]',
  
  -- Flags e características especiais
  featured BOOLEAN DEFAULT FALSE,
  show_on_homepage BOOLEAN DEFAULT FALSE,
  
  -- Metadados extras (pode ser usado para características específicas)
  metadata JSONB DEFAULT '{}'
);

-- Adicionar coluna show_on_homepage se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'show_on_homepage'
  ) THEN
    ALTER TABLE products ADD COLUMN show_on_homepage BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Habilitar Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes para evitar erros
DROP POLICY IF EXISTS "Permitir leitura pública" ON products;
DROP POLICY IF EXISTS "Permitir inserção anônima" ON products;
DROP POLICY IF EXISTS "Permitir atualização anônima" ON products;
DROP POLICY IF EXISTS "Permitir exclusão anônima" ON products;

-- Criar políticas para acesso
CREATE POLICY "Permitir leitura pública" ON products FOR SELECT USING (TRUE);
CREATE POLICY "Permitir inserção anônima" ON products FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Permitir atualização anônima" ON products FOR UPDATE USING (TRUE);
CREATE POLICY "Permitir exclusão anônima" ON products FOR DELETE USING (TRUE);

-- Criar função para atualizar timestamp 'updated_at' automaticamente
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger se existir
DROP TRIGGER IF EXISTS update_products_timestamp ON products;

-- Criar trigger para atualizar 'updated_at' ao modificar registros
CREATE TRIGGER update_products_timestamp
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Comentário para instruções sobre o bucket de imagens
COMMENT ON TABLE products IS 'Produtos da loja com suporte para imagens no bucket "images/products".'; 