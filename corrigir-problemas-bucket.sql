-- Script para solucionar problemas no armazenamento de imagens
-- Execute no SQL Editor do Supabase

-- 1. Verificar e corrigir o bucket de armazenamento para imagens
DO $$
BEGIN
  -- Verificar se o bucket existe
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'images') THEN
    -- Criar o bucket de imagens se não existir
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES ('images', 'Images Bucket', true, 209715200, '{image/png,image/jpeg,image/jpg,image/gif,image/webp}');
    
    RAISE NOTICE 'Bucket de imagens criado com sucesso!';
  ELSE
    -- Atualizar configurações do bucket existente
    UPDATE storage.buckets 
    SET 
      public = true, 
      file_size_limit = 209715200,
      allowed_mime_types = '{image/png,image/jpeg,image/jpg,image/gif,image/webp}'
    WHERE id = 'images';
    
    RAISE NOTICE 'Bucket de imagens atualizado com sucesso!';
  END IF;
END $$;

-- 2. Configurar as políticas para o bucket de imagens
-- Remover políticas existentes específicas para o bucket
DROP POLICY IF EXISTS "Acesso público para o bucket images" ON storage.objects;
DROP POLICY IF EXISTS "Acesso público para leitura no bucket images" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload público no bucket images" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização pública no bucket images" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusão pública no bucket images" ON storage.objects;

-- Criar políticas simplificadas com maior permissão
CREATE POLICY "Acesso público para leitura no bucket images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'images');

CREATE POLICY "Permitir upload público no bucket images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'images');

CREATE POLICY "Permitir atualização pública no bucket images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'images')
WITH CHECK (bucket_id = 'images');

CREATE POLICY "Permitir exclusão pública no bucket images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'images');

-- Verificação final para garantir que as políticas foram criadas
SELECT
  (SELECT COUNT(*) FROM storage.buckets WHERE id = 'images') AS bucket_exists,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'objects' AND 
   policyname IN (
     'Acesso público para leitura no bucket images',
     'Permitir upload público no bucket images',
     'Permitir atualização pública no bucket images',
     'Permitir exclusão pública no bucket images'
   )
  ) AS policies_count;

-- Verificar se há objetos no bucket (se já estava funcionando antes)
SELECT COUNT(*) AS objects_count FROM storage.objects WHERE bucket_id = 'images'; 