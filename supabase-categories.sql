-- Script SQL para inserir categorias padrão no sistema
-- Execute este script para garantir que as categorias básicas estejam disponíveis

-- Garantir que a tabela de categorias existe
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Habilitar RLS na tabela
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Criar política de acesso público
DROP POLICY IF EXISTS "Acesso público a categorias" ON public.categories;
CREATE POLICY "Acesso público a categorias" 
ON public.categories 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Inserir categorias padrão (não duplicar se já existirem)
INSERT INTO public.categories (name, description)
VALUES 
  ('Camisetas', 'Camisetas e tops de todos os estilos'),
  ('Calças', 'Calças, shorts e leggings'),
  ('Vestidos', 'Vestidos e saias para todas as ocasiões'),
  ('Acessórios', 'Bolsas, cintos, joias e outros acessórios'),
  ('Calçados', 'Sapatos, tênis, sandálias e botas')
ON CONFLICT (name) DO NOTHING;

-- Verificar se as categorias foram inseridas
SELECT * FROM public.categories; 