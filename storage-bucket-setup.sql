-- Script para configurar o bucket de armazenamento 'images' no Supabase

-- Este script pode ser executado no Console SQL do Supabase
-- ATENÇÃO: Algumas operações de storage podem requerer uso da UI do Console do Supabase

-- Verifique se a extensão storage-api está disponível
SELECT EXISTS (
  SELECT 1 FROM pg_extension WHERE extname = 'pg_net'
);

-- Instruções para criar bucket via UI (execute no console do Supabase):
-- 1. Navegue até "Storage" no menu lateral
-- 2. Clique em "Create new bucket"
-- 3. Nome: images (minúsculas)
-- 4. Marque "Public bucket" (permitir acesso público)
-- 5. Clique em "Create bucket"

-- Criar pastas necessárias:
-- 1. Selecione o bucket "images"
-- 2. Clique em "Create folder" e crie as pastas:
--    - products
--    - logo
--    - banners
--    - share
--    - categories

-- Configurar políticas de acesso ao bucket:
-- Essas políticas devem ser configuradas na interface UI do Supabase

-- 1. Política para SELECT (leitura pública)
-- Nome: "Permitir leitura pública"
-- Allowed operation: SELECT
-- Policy definition: (true)
-- Descrição: "Permitir acesso público de leitura a todos os arquivos"

-- 2. Política para INSERT (upload)
-- Nome: "Permitir upload anônimo"
-- Allowed operation: INSERT
-- Policy definition: (true)
-- Descrição: "Permitir upload de arquivos sem autenticação"

-- 3. Política para UPDATE (atualização)
-- Nome: "Permitir atualização anônima"
-- Allowed operation: UPDATE
-- Policy definition: (true)
-- Descrição: "Permitir atualização de arquivos sem autenticação"

-- 4. Política para DELETE (exclusão)
-- Nome: "Permitir exclusão anônima"
-- Allowed operation: DELETE
-- Policy definition: (true)
-- Descrição: "Permitir exclusão de arquivos sem autenticação"

-- Verificar se o bucket existe (para referência, não é executável no console SQL)
-- SELECT * FROM storage.buckets WHERE name = 'images';

-- IMPORTANTE: Para testar a configuração:
-- 1. Acesse o bucket pela UI do Supabase
-- 2. Tente fazer upload de uma imagem na pasta 'products'
-- 3. Verifique se consegue visualizar a imagem após o upload
-- 4. Copie a URL pública e verifique se é acessível no navegador 