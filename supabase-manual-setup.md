# Configuração Manual do Supabase para Fashion Frenzy

## 1. Configuração Inicial

1. Acesse o [Console do Supabase](https://app.supabase.com/project/xzvkkbrbwxghhqtncxok)
2. Vá para o SQL Editor
3. Execute o script `supabase-complete-setup.sql`

## 2. Configuração do Storage

### 2.1 Criar o Bucket de Imagens

1. No menu lateral, clique em **Storage**
2. Clique em **Create new bucket**
3. Configure:
   - Nome: `images` (exatamente este nome)
   - Marque a opção **Public bucket**
   - Clique em **Create bucket**

### 2.2 Criar Pastas no Bucket

1. Selecione o bucket `images`
2. Clique em **Create folder** e crie as seguintes pastas:
   - `products` - para imagens de produtos
   - `logo` - para o logo da loja
   - `banners` - para banners da página inicial
   - `share` - para imagens de compartilhamento
   - `categories` - para imagens de categorias

### 2.3 Configurar Políticas de Acesso

1. No bucket `images`, vá para a aba **Policies**
2. Clique em **New Policy**
3. Selecione **For full customization**
4. Crie as seguintes políticas:

#### Política para Leitura (SELECT)
- **Policy name**: Permitir leitura pública
- **Definition**: `true`
- **Target roles**: `anon, authenticated`
- **Description**: Permitir acesso público de leitura a todos os arquivos

#### Política para Upload (INSERT)
- **Policy name**: Permitir upload anônimo
- **Definition**: `true`
- **Target roles**: `anon, authenticated`
- **Description**: Permitir upload de arquivos sem autenticação

#### Política para Atualização (UPDATE)
- **Policy name**: Permitir atualização anônima
- **Definition**: `true`
- **Target roles**: `anon, authenticated`
- **Description**: Permitir atualização de arquivos sem autenticação

#### Política para Exclusão (DELETE)
- **Policy name**: Permitir exclusão anônima
- **Definition**: `true`
- **Target roles**: `anon, authenticated`
- **Description**: Permitir exclusão de arquivos sem autenticação

## 3. Verificação das Tabelas

1. No menu lateral, clique em **Table Editor**
2. Verifique se as tabelas foram criadas:
   - `products`
   - `store_settings`

3. Verifique se os dados de teste foram inseridos:
   - Na tabela `products`, deve haver um produto de teste
   - Na tabela `store_settings`, deve haver uma configuração inicial

## 4. Teste de Integração

1. Acesse sua aplicação em `http://localhost:3000`
2. Faça login como administrador
3. Tente as seguintes operações:

### Teste de Produtos
1. Vá para a página de administração
2. Crie um novo produto com imagem
3. Verifique se:
   - O produto aparece na tabela `products`
   - A imagem foi salva na pasta `products` do bucket `images`

### Teste de Configurações
1. Vá para as configurações da loja
2. Faça upload de:
   - Logo da loja
   - Banner principal
   - Imagem de compartilhamento
3. Verifique se:
   - As imagens foram salvas nas pastas corretas
   - As configurações foram atualizadas na tabela `store_settings`

## 5. Solução de Problemas

Se encontrar problemas, verifique:

1. **Erros de Permissão**
   - Verifique se todas as políticas de acesso estão configuradas corretamente
   - Confirme se o bucket está marcado como público

2. **Problemas com Imagens**
   - Verifique o console do navegador para erros de upload
   - Confirme se as imagens estão sendo salvas nas pastas corretas
   - Verifique se as URLs das imagens estão sendo geradas corretamente

3. **Problemas com Dados**
   - Verifique se as tabelas foram criadas corretamente
   - Confirme se os dados estão sendo salvos nas tabelas
   - Verifique se os triggers de `updated_at` estão funcionando

## 6. Configuração do Ambiente

Certifique-se de que seu arquivo `.env` contém as variáveis corretas:

```env
VITE_SUPABASE_URL=https://xzvkkbrbwxghhqtncxok.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6dmtrYnJid3hnaGhxdG5jeG9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMjE4MjcsImV4cCI6MjA2MTc5NzgyN30.nOuYr8xRzVGlq6SI_3iG7IRJzitz-0VbX3yvVZ6VLMs
VITE_USE_SUPABASE=true
```

## 7. Manutenção

Para manter o sistema funcionando corretamente:

1. **Backup Regular**
   - Faça backup das tabelas regularmente
   - Mantenha cópias das imagens importantes

2. **Monitoramento**
   - Verifique o uso do storage
   - Monitore o tamanho das tabelas
   - Acompanhe os logs de erro

3. **Atualizações**
   - Mantenha o Supabase atualizado
   - Verifique se há novas políticas de segurança
   - Atualize as configurações conforme necessário 