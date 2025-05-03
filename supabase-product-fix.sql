-- SQL para corrigir a estrutura da tabela de produtos e políticas de acesso

-- 1. Verificar a estrutura atual da tabela de produtos
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM 
  information_schema.columns 
WHERE 
  table_name = 'products' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Remover a tabela products se existir e recriar com estrutura correta
DROP TABLE IF EXISTS public.products;
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
  user_id UUID
);

-- 3. Garantir que a segurança por linha esteja ativada
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 4. Remover todas as políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.products;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.products;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.products;
DROP POLICY IF EXISTS "Acesso público total a produtos" ON public.products;

-- 5. Criar política única para acesso total público (para desenvolvimento)
CREATE POLICY "Acesso público total a produtos"
ON public.products
FOR ALL
USING (true)
WITH CHECK (true);

-- 6. Verificar bucket de armazenamento para imagens
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 7. Garantir que a segurança por linha esteja ativada para objetos
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 8. Remover políticas existentes para objetos
DROP POLICY IF EXISTS "Acesso público para o bucket images" ON storage.objects;

-- 9. Criar política para acesso total ao bucket de imagens
CREATE POLICY "Acesso público para o bucket images"
ON storage.objects
FOR ALL
USING (bucket_id = 'images')
WITH CHECK (bucket_id = 'images');

-- 10. Criar ou redefinir a função de gatilho para atualização automática do timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Criar gatilho para atualização automática de timestamp
DROP TRIGGER IF EXISTS set_timestamp ON public.products;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 12. Verificar se a tabela store_settings existe
CREATE TABLE IF NOT EXISTS public.store_settings (
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
  user_id UUID
);

-- 13. Criar política de acesso público para store_settings
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso público total a store_settings" ON public.store_settings;
CREATE POLICY "Acesso público total a store_settings"
ON public.store_settings
FOR ALL
USING (true)
WITH CHECK (true);

-- 14. Exibir tabelas criadas e suas políticas
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'storage'; 