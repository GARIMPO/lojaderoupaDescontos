-- SQL simplificado para configurar o bucket de armazenamento "images" no Supabase

-- Criar o bucket "images" se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Garantir que a segurança baseada em linhas esteja ativada
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Acesso público para o bucket images" ON storage.objects;

-- Criar uma única política que permite todas as operações (SELECT, INSERT, UPDATE, DELETE)
-- Esta é a forma mais simples de configurar acesso público total para o bucket
CREATE POLICY "Acesso público para o bucket images"
ON storage.objects
FOR ALL
USING (bucket_id = 'images')
WITH CHECK (bucket_id = 'images');

-- Verificar se o bucket existe
SELECT name, public FROM storage.buckets WHERE name = 'images';

-- Verificar se a política foi criada
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'; 