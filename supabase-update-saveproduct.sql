-- Script para corrigir problemas de salvamento de produtos
-- Execute este script para verificar e corrigir a estrutura da tabela products

-- Verificar se a tabela products existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'products'
);

-- Ver estrutura atual da tabela
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM 
  information_schema.columns
WHERE 
  table_schema = 'public' 
  AND table_name = 'products';

-- Modificar tabela se necessário para garantir compatibilidade com o código
DO $$
BEGIN
  -- Adicionar coluna "type" se não existir
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'type'
  ) THEN
    ALTER TABLE public.products ADD COLUMN type TEXT DEFAULT 'clothing';
  END IF;

  -- Garantir que coluna "category" existe
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'category'
  ) THEN
    ALTER TABLE public.products ADD COLUMN category TEXT DEFAULT '';
  END IF;

  -- Garantir que imagens é um array
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'images'
  ) THEN
    ALTER TABLE public.products ADD COLUMN images TEXT[] DEFAULT '{}'::TEXT[];
  END IF;

  -- Garantir que tamanhos é um array
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'sizes'
  ) THEN
    ALTER TABLE public.products ADD COLUMN sizes TEXT[] DEFAULT '{}'::TEXT[];
  END IF;

  -- Garantir que cores é um array
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'colors'
  ) THEN
    ALTER TABLE public.products ADD COLUMN colors TEXT[] DEFAULT '{}'::TEXT[];
  END IF;

  -- Garantir que temos coluna on_sale
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'on_sale'
  ) THEN
    ALTER TABLE public.products ADD COLUMN on_sale BOOLEAN DEFAULT FALSE;
  END IF;

  -- Garantir que temos coluna featured
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'featured'
  ) THEN
    ALTER TABLE public.products ADD COLUMN featured BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Garantir política de acesso para produtos
DROP POLICY IF EXISTS "Acesso público a produtos" ON public.products;
CREATE POLICY "Acesso público a produtos" 
ON public.products 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Inserir um produto de teste para verificar
INSERT INTO public.products (
  name, 
  description, 
  price, 
  category, 
  type,
  stock,
  discount,
  featured,
  on_sale
)
VALUES (
  'Produto de Teste', 
  'Produto criado para verificar se o salvamento está funcionando corretamente', 
  99.90, 
  'Camisetas', 
  'clothing',
  10,
  0,
  true,
  false
)
ON CONFLICT DO NOTHING;

-- Verificar produtos existentes
SELECT * FROM public.products;

-- Verificar o número de produtos
SELECT COUNT(*) FROM public.products; 