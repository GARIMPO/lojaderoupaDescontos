# Configuração do Storage no Supabase

## 1. Acesse o painel do Supabase

Acesse [https://app.supabase.com/project/xzvkkbrbwxghhqtncxok](https://app.supabase.com/project/xzvkkbrbwxghhqtncxok)

## 2. Crie o bucket de storage

1. No menu lateral, clique em **Storage**
2. Clique no botão **Create new bucket**
3. Configure:
   - Nome: `images` (exatamente este nome)
   - Marque a opção **Public bucket**
   - Clique em **Create bucket**

## 3. Crie as pastas necessárias

Dentro do bucket `images`, crie as seguintes pastas:

1. `products` - para imagens de produtos
2. `logo` - para o logo da loja
3. `banners` - para banners da página inicial
4. `share` - para imagens de compartilhamento
5. `categories` - para imagens de categorias

Para criar cada pasta:
- Clique no bucket `images`
- Clique em **Create folder**
- Digite o nome da pasta
- Clique em **Create folder**

## 4. Configure as políticas de acesso

1. No menu Storage, clique na aba **Policies**
2. Clique em **New Policy**
3. Selecione **For full customization**
4. Configure cada política conforme abaixo:

### Política para SELECT (leitura pública)

- **Policy name**: Permitir leitura pública
- **Definition**: `true`
- **Target roles**: `anon, authenticated`
- Clique em **Create policy**

### Política para INSERT (upload)

- **Policy name**: Permitir upload anônimo
- **Definition**: `true`
- **Target roles**: `anon, authenticated`
- Clique em **Create policy**

### Política para UPDATE (atualização)

- **Policy name**: Permitir atualizações anônimas
- **Definition**: `true`
- **Target roles**: `anon, authenticated`
- Clique em **Create policy**

### Política para DELETE (exclusão)

- **Policy name**: Permitir exclusão anônima
- **Definition**: `true`
- **Target roles**: `anon, authenticated`
- Clique em **Create policy**

## 5. Teste a integração

1. Volte para o seu site Fashion Frenzy
2. Vá para a página de administração
3. Tente fazer upload de uma imagem de produto
4. Verifique no console do navegador (F12) se há mensagens de sucesso
5. Verifique no Supabase Storage se a imagem foi salva na pasta `products`

Se tudo estiver funcionando corretamente, as imagens serão salvas no Supabase e seus produtos e configurações serão armazenados globalmente! 