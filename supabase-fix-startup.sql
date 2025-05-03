-- SQL para resolver problemas de integração e salvar informações globalmente
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar todas as tabelas necessárias para o funcionamento da aplicação
DO $$ 
BEGIN
    -- Verificar se tabelas existem e criar se não existirem
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'products' AND schemaname = 'public') THEN
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
            imageUrl TEXT,
            type TEXT
        );
    END IF;

    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'store_settings' AND schemaname = 'public') THEN
        CREATE TABLE public.store_settings (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            store_name TEXT DEFAULT 'Minha Loja',
            description TEXT,
            logo_url TEXT,
            banner_url TEXT,
            theme_color TEXT DEFAULT '#4F46E5',
            accent_color TEXT DEFAULT '#9333EA',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            share_image_url TEXT,
            user_id UUID,
            logoImage TEXT,
            shareImage TEXT,
            bannerConfig JSONB
        );
    END IF;

    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'categories' AND schemaname = 'public') THEN
        CREATE TABLE public.categories (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'carts' AND schemaname = 'public') THEN
        CREATE TABLE public.carts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id TEXT,
            items JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'finances' AND schemaname = 'public') THEN
        CREATE TABLE public.finances (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
            description TEXT NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            transaction_type TEXT NOT NULL,
            category TEXT,
            payment_method TEXT,
            status TEXT DEFAULT 'completed',
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            user_id UUID
        );
    END IF;

    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'finance_categories' AND schemaname = 'public') THEN
        CREATE TABLE public.finance_categories (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT UNIQUE NOT NULL,
            type TEXT NOT NULL,
            color TEXT,
            icon TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'payment_methods' AND schemaname = 'public') THEN
        CREATE TABLE public.payment_methods (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT UNIQUE NOT NULL,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- 2. Configurar bucket de armazenamento para imagens
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('images', 'images', true, 52428800, 
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml']::text[]
)
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml']::text[];

-- 3. Ativar RLS em todas as tabelas
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 4. Remover todas as políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Acesso público total a produtos" ON public.products;
DROP POLICY IF EXISTS "Acesso público total a store_settings" ON public.store_settings;
DROP POLICY IF EXISTS "Acesso público total a categories" ON public.categories;
DROP POLICY IF EXISTS "Acesso público total a carts" ON public.carts;
DROP POLICY IF EXISTS "Acesso público para o bucket images" ON storage.objects;
DROP POLICY IF EXISTS "Acesso público total a finances" ON public.finances;
DROP POLICY IF EXISTS "Acesso público total a finance_categories" ON public.finance_categories;
DROP POLICY IF EXISTS "Acesso público total a payment_methods" ON public.payment_methods;

-- 5. Criar políticas de acesso público para desenvolvimento
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

-- Finanças
CREATE POLICY "Acesso público total a finances"
ON public.finances
FOR ALL
USING (true)
WITH CHECK (true);

-- Categorias financeiras
CREATE POLICY "Acesso público total a finance_categories"
ON public.finance_categories
FOR ALL
USING (true)
WITH CHECK (true);

-- Métodos de pagamento
CREATE POLICY "Acesso público total a payment_methods"
ON public.payment_methods
FOR ALL
USING (true)
WITH CHECK (true);

-- Storage (imagens)
CREATE POLICY "Acesso público para o bucket images"
ON storage.objects
FOR ALL
USING (bucket_id = 'images')
WITH CHECK (bucket_id = 'images');

-- 6. Inserir dados iniciais se as tabelas estiverem vazias
-- Categorias de produtos
INSERT INTO public.categories (name)
SELECT 'Roupas' WHERE NOT EXISTS (SELECT FROM public.categories WHERE name = 'Roupas')
UNION ALL
SELECT 'Calçados' WHERE NOT EXISTS (SELECT FROM public.categories WHERE name = 'Calçados')
UNION ALL
SELECT 'Acessórios' WHERE NOT EXISTS (SELECT FROM public.categories WHERE name = 'Acessórios')
UNION ALL
SELECT 'Decoração' WHERE NOT EXISTS (SELECT FROM public.categories WHERE name = 'Decoração')
UNION ALL
SELECT 'Eletrônicos' WHERE NOT EXISTS (SELECT FROM public.categories WHERE name = 'Eletrônicos');

-- Categorias financeiras
INSERT INTO public.finance_categories (name, type, color, icon)
SELECT 'Vendas', 'income', '#4CAF50', 'shopping-cart' WHERE NOT EXISTS (SELECT FROM public.finance_categories WHERE name = 'Vendas')
UNION ALL
SELECT 'Serviços', 'income', '#2196F3', 'handshake' WHERE NOT EXISTS (SELECT FROM public.finance_categories WHERE name = 'Serviços')
UNION ALL
SELECT 'Outros Rendimentos', 'income', '#9C27B0', 'plus-circle' WHERE NOT EXISTS (SELECT FROM public.finance_categories WHERE name = 'Outros Rendimentos')
UNION ALL
SELECT 'Fornecedores', 'expense', '#F44336', 'truck' WHERE NOT EXISTS (SELECT FROM public.finance_categories WHERE name = 'Fornecedores')
UNION ALL
SELECT 'Marketing', 'expense', '#FF9800', 'megaphone' WHERE NOT EXISTS (SELECT FROM public.finance_categories WHERE name = 'Marketing')
UNION ALL
SELECT 'Salários', 'expense', '#795548', 'users' WHERE NOT EXISTS (SELECT FROM public.finance_categories WHERE name = 'Salários')
UNION ALL
SELECT 'Aluguel', 'expense', '#607D8B', 'building' WHERE NOT EXISTS (SELECT FROM public.finance_categories WHERE name = 'Aluguel')
UNION ALL
SELECT 'Utilities', 'expense', '#009688', 'plug' WHERE NOT EXISTS (SELECT FROM public.finance_categories WHERE name = 'Utilities')
UNION ALL
SELECT 'Material de Escritório', 'expense', '#3F51B5', 'paperclip' WHERE NOT EXISTS (SELECT FROM public.finance_categories WHERE name = 'Material de Escritório');

-- Métodos de pagamento
INSERT INTO public.payment_methods (name, description)
SELECT 'Dinheiro', 'Pagamento em espécie' WHERE NOT EXISTS (SELECT FROM public.payment_methods WHERE name = 'Dinheiro')
UNION ALL
SELECT 'Cartão de Crédito', 'Pagamento com cartão de crédito' WHERE NOT EXISTS (SELECT FROM public.payment_methods WHERE name = 'Cartão de Crédito')
UNION ALL
SELECT 'Cartão de Débito', 'Pagamento com cartão de débito' WHERE NOT EXISTS (SELECT FROM public.payment_methods WHERE name = 'Cartão de Débito')
UNION ALL
SELECT 'Transferência Bancária', 'Transferência entre contas bancárias' WHERE NOT EXISTS (SELECT FROM public.payment_methods WHERE name = 'Transferência Bancária')
UNION ALL
SELECT 'PIX', 'Pagamento instantâneo via PIX' WHERE NOT EXISTS (SELECT FROM public.payment_methods WHERE name = 'PIX')
UNION ALL
SELECT 'Boleto', 'Pagamento via boleto bancário' WHERE NOT EXISTS (SELECT FROM public.payment_methods WHERE name = 'Boleto');

-- 7. Criar configuração inicial da loja se não existir
INSERT INTO public.store_settings (store_name, description, theme_color, accent_color)
SELECT 'Minha Loja Fashion', 'Sua loja virtual de moda e estilo', '#4F46E5', '#9333EA'
WHERE NOT EXISTS (SELECT FROM public.store_settings LIMIT 1);

-- 8. Verificar se tudo foi criado corretamente
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 9. Verificar políticas
SELECT 
    schemaname, 
    tablename, 
    policyname 
FROM 
    pg_policies 
WHERE 
    schemaname IN ('public', 'storage')
ORDER BY 
    schemaname, tablename; 