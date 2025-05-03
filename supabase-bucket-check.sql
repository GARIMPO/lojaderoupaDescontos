-- SQL para verificar e configurar o bucket "images" no Supabase Storage
-- Execute este script no SQL Editor do Supabase para garantir que o bucket exista
-- e que as permissões estejam corretamente configuradas.

-- 1. Verificar se o bucket "images" existe
SELECT 
  name, 
  owner, 
  created_at,
  updated_at,
  public
FROM storage.buckets 
WHERE name = 'images';

-- 2. Criar o bucket "images" se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 
  'images', 
  'images', 
  TRUE, -- bucket público
  52428800, -- limite de 50MB por arquivo
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']::text[]
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE name = 'images'
);

-- 3. Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Permitir acesso público de leitura" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload público" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização pública" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusão pública" ON storage.objects;

-- 4. Criar políticas para permitir acesso público completo
-- Política para leitura (GET)
CREATE POLICY "Permitir acesso público de leitura"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Política para upload (INSERT)
CREATE POLICY "Permitir upload público"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'images');

-- Política para atualização (UPDATE)
CREATE POLICY "Permitir atualização pública"
ON storage.objects FOR UPDATE
USING (bucket_id = 'images');

-- Política para exclusão (DELETE)
CREATE POLICY "Permitir exclusão pública"
ON storage.objects FOR DELETE
USING (bucket_id = 'images');

-- 5. Verificar as políticas configuradas para o bucket "images"
SELECT 
  p.policyname,
  p.tablename,
  p.permissive,
  p.roles,
  p.cmd,
  p.qual
FROM pg_policies p
WHERE p.tablename = 'objects' 
AND p.schemaname = 'storage'
AND p.qual::text LIKE '%images%'; 