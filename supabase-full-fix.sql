-- Script SQL para correção completa do sistema
-- Este script reorganiza TODAS as tabelas e permissões para garantir salvamento global

-- Parte 1: Preparação do ambiente
--------------------------------------
-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_graphql";

-- Parte 2: Limpeza de objetos existentes para evitar conflitos
--------------------------------------
-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Acesso público total a produtos" ON public.products;
DROP POLICY IF EXISTS "Acesso público total a store_settings" ON public.store_settings;
DROP POLICY IF EXISTS "Acesso público total a categories" ON public.categories;
DROP POLICY IF EXISTS "Acesso público total a carts" ON public.carts;
DROP POLICY IF EXISTS "Acesso público total a customers" ON public.customers;
DROP POLICY IF EXISTS "Acesso público total a finances" ON public.finances;
DROP POLICY IF EXISTS "Acesso público total a finance_categories" ON public.finance_categories;
DROP POLICY IF EXISTS "Acesso público total a payment_methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Acesso público total ao bucket images" ON storage.objects;

-- Parte 3: Configuração do Storage
--------------------------------------
-- Configuração otimizada do bucket de armazenamento
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images', 
  'images', 
  true, 
  209715200, -- 200MB limite para permitir imagens de alta resolução
  ARRAY[
    'image/png', 
    'image/jpeg', 
    'image/jpg', 
    'image/gif', 
    'image/webp', 
    'image/svg+xml',
    'image/bmp',
    'image/tiff',
    'application/octet-stream',
    'application/pdf' -- Permitir PDFs para documentos
  ]::text[]
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 209715200,
  allowed_mime_types = ARRAY[
    'image/png', 
    'image/jpeg', 
    'image/jpg', 
    'image/gif', 
    'image/webp', 
    'image/svg+xml',
    'image/bmp',
    'image/tiff',
    'application/octet-stream',
    'application/pdf'
  ]::text[];

-- Parte 4: Estrutura de tabelas
--------------------------------------
-- Tabela de PRODUTOS (recriando para garantir estrutura correta)
DROP TABLE IF EXISTS public.products CASCADE;
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  discount INTEGER DEFAULT 0,
  stock INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  category TEXT,
  on_sale BOOLEAN DEFAULT FALSE,
  sizes TEXT[] DEFAULT ARRAY[]::TEXT[],
  colors TEXT[] DEFAULT ARRAY[]::TEXT[],
  main_image TEXT,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  user_id UUID,
  imageUrl TEXT,
  type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_products_on_sale ON public.products(on_sale) WHERE on_sale = true;

-- Tabela de CONFIGURAÇÕES DA LOJA
DROP TABLE IF EXISTS public.store_settings CASCADE;
CREATE TABLE public.store_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_name TEXT DEFAULT 'Minha Loja',
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  theme_color TEXT DEFAULT '#4F46E5',
  accent_color TEXT DEFAULT '#9333EA',
  logoImage TEXT,
  shareImage TEXT,
  bannerConfig JSONB DEFAULT '{}'::JSONB,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  social_media JSONB DEFAULT '{}'::JSONB,
  payment_methods JSONB DEFAULT '{}'::JSONB,
  shipping_methods JSONB DEFAULT '{}'::JSONB,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de CATEGORIAS
DROP TABLE IF EXISTS public.categories CASCADE;
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES public.categories(id),
  image_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de CARRINHOS
DROP TABLE IF EXISTS public.carts CASCADE;
CREATE TABLE public.carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  items JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de CLIENTES
DROP TABLE IF EXISTS public.customers CASCADE;
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Brasil',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de FINANÇAS (transações)
DROP TABLE IF EXISTS public.finances CASCADE;
CREATE TABLE public.finances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense')),
  category TEXT,
  category_id UUID REFERENCES public.finance_categories(id) ON DELETE SET NULL,
  payment_method TEXT,
  payment_method_id UUID REFERENCES public.payment_methods(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  notes TEXT,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  attachment_url TEXT,
  recurring BOOLEAN DEFAULT FALSE,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de CATEGORIAS FINANCEIRAS
DROP TABLE IF EXISTS public.finance_categories CASCADE;
CREATE TABLE public.finance_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  color TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, type)
);

-- Tabela de MÉTODOS DE PAGAMENTO
DROP TABLE IF EXISTS public.payment_methods CASCADE;
CREATE TABLE public.payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar dependências em ordem correta
DROP TABLE IF EXISTS public.finances CASCADE;
CREATE TABLE public.finances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense')),
  category TEXT,
  category_id UUID REFERENCES public.finance_categories(id) ON DELETE SET NULL,
  payment_method TEXT,
  payment_method_id UUID REFERENCES public.payment_methods(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  notes TEXT,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  attachment_url TEXT,
  recurring BOOLEAN DEFAULT FALSE,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Parte 5: Configuração de Segurança (RLS)
--------------------------------------
-- Habilitar RLS em todas as tabelas
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso público (para desenvolvimento)
CREATE POLICY "Acesso público total a produtos"
ON public.products FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Acesso público total a store_settings"
ON public.store_settings FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Acesso público total a categories"
ON public.categories FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Acesso público total a carts"
ON public.carts FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Acesso público total a customers"
ON public.customers FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Acesso público total a finances"
ON public.finances FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Acesso público total a finance_categories"
ON public.finance_categories FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Acesso público total a payment_methods"
ON public.payment_methods FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Acesso público total ao bucket images"
ON storage.objects FOR ALL 
USING (bucket_id = 'images')
WITH CHECK (bucket_id = 'images');

-- Parte 6: Triggers para atualização automática de timestamps
--------------------------------------
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers de updated_at em todas as tabelas
DROP TRIGGER IF EXISTS set_timestamp_products ON public.products;
CREATE TRIGGER set_timestamp_products
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS set_timestamp_store_settings ON public.store_settings;
CREATE TRIGGER set_timestamp_store_settings
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

DROP TRIGGER IF EXISTS set_timestamp_customers ON public.customers;
CREATE TRIGGER set_timestamp_customers
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS set_timestamp_finances ON public.finances;
CREATE TRIGGER set_timestamp_finances
BEFORE UPDATE ON public.finances
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS set_timestamp_finance_categories ON public.finance_categories;
CREATE TRIGGER set_timestamp_finance_categories
BEFORE UPDATE ON public.finance_categories
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS set_timestamp_payment_methods ON public.payment_methods;
CREATE TRIGGER set_timestamp_payment_methods
BEFORE UPDATE ON public.payment_methods
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Parte 7: Dados iniciais para o sistema funcionar
--------------------------------------
-- Inserir categorias de produtos
INSERT INTO public.categories (name, description)
VALUES 
  ('Roupas', 'Vestuário em geral'),
  ('Calçados', 'Sapatos, tênis, sandálias'),
  ('Acessórios', 'Bolsas, cintos, bijuterias'),
  ('Decoração', 'Itens para casa e decoração'),
  ('Eletrônicos', 'Produtos eletrônicos')
ON CONFLICT (name) DO NOTHING;

-- Inserir categorias financeiras
INSERT INTO public.finance_categories (name, type, color, icon)
VALUES 
  ('Vendas', 'income', '#4CAF50', 'shopping-cart'),
  ('Serviços', 'income', '#2196F3', 'handshake'),
  ('Outros Rendimentos', 'income', '#9C27B0', 'plus-circle'),
  ('Fornecedores', 'expense', '#F44336', 'truck'),
  ('Marketing', 'expense', '#FF9800', 'megaphone'),
  ('Salários', 'expense', '#795548', 'users'),
  ('Aluguel', 'expense', '#607D8B', 'building'),
  ('Utilities', 'expense', '#009688', 'plug'),
  ('Material de Escritório', 'expense', '#3F51B5', 'paperclip')
ON CONFLICT (name, type) DO NOTHING;

-- Inserir métodos de pagamento
INSERT INTO public.payment_methods (name, description)
VALUES 
  ('Dinheiro', 'Pagamento em espécie'),
  ('Cartão de Crédito', 'Pagamento com cartão de crédito'),
  ('Cartão de Débito', 'Pagamento com cartão de débito'),
  ('Transferência Bancária', 'Transferência entre contas bancárias'),
  ('PIX', 'Pagamento instantâneo via PIX'),
  ('Boleto', 'Pagamento via boleto bancário')
ON CONFLICT (name) DO NOTHING;

-- Inserir configuração inicial da loja, se não existir
INSERT INTO public.store_settings (store_name, description, theme_color, accent_color)
SELECT 'Fashion Frenzy', 'Sua loja virtual de moda e estilo', '#4F46E5', '#9333EA'
WHERE NOT EXISTS (SELECT FROM public.store_settings LIMIT 1);

-- Parte 8: Permissões e otimizações finais
--------------------------------------
-- Otimizações para storage
GRANT ALL ON SCHEMA storage TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA storage TO postgres;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA storage TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA storage GRANT SELECT ON TABLES TO anon;

-- Criar índices para melhorar performance de consultas frequentes
CREATE INDEX IF NOT EXISTS idx_finances_transaction_date ON public.finances(transaction_date);
CREATE INDEX IF NOT EXISTS idx_finances_transaction_type ON public.finances(transaction_type);
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);

-- Parte 9: Verificação final
--------------------------------------
-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar bucket
SELECT name, public, file_size_limit, array_length(allowed_mime_types, 1) as mime_types_count
FROM storage.buckets 
WHERE name = 'images';

-- Verificar políticas
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname IN ('public', 'storage') 
ORDER BY schemaname, tablename; 