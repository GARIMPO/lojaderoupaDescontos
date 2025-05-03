-- SQL para garantir que o bucket de imagens esteja corretamente configurado
-- Este script foca especificamente no problema de upload de imagens

-- 1. Verificar se o bucket "images" existe
SELECT 
  name, 
  public, 
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE name = 'images';

-- 2. Criar ou atualizar o bucket "images" com configurações otimizadas para upload
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images', 
  'images', 
  true, -- Tornar o bucket público
  52428800, -- Limite de 50MB por arquivo
  ARRAY[
    'image/png', 
    'image/jpeg', 
    'image/jpg', 
    'image/gif', 
    'image/webp', 
    'image/svg+xml'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY[
    'image/png', 
    'image/jpeg', 
    'image/jpg', 
    'image/gif', 
    'image/webp', 
    'image/svg+xml'
  ]::text[];

-- 3. Garantir que RLS esteja habilitado na tabela de objetos
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 4. Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Acesso público para o bucket images" ON storage.objects;
DROP POLICY IF EXISTS "Permitir acesso público de leitura" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload público" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização pública" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusão pública" ON storage.objects;

-- 5. Criar uma única política permissiva para todas as operações
CREATE POLICY "Acesso público para o bucket images"
ON storage.objects
FOR ALL -- Esta configuração permite SELECT, INSERT, UPDATE, DELETE
USING (bucket_id = 'images')
WITH CHECK (bucket_id = 'images');

-- 6. Verificar se as políticas foram criadas corretamente
SELECT 
  policyname, 
  tablename, 
  permissive, 
  cmd
FROM pg_policies 
WHERE 
  schemaname = 'storage' AND 
  tablename = 'objects';

-- 7. Verificar permissões de acesso ao bucket
SELECT 
  name, 
  public 
FROM storage.buckets 
WHERE name = 'images'; 