# Configuração do Supabase Storage para Imagens Globais

Este guia explica como configurar o Supabase para permitir o upload e salvamento de imagens de forma global na sua aplicação.

## 1. Crie um bucket para armazenar imagens

No console do Supabase:

1. Vá para a seção **Storage** no menu lateral
2. Clique em **Criar novo bucket**
3. Nomeie o bucket como `images`
4. Marque a opção **Público** para permitir acesso sem autenticação
5. Clique em **Criar bucket**

## 2. Configure as políticas de segurança (RLS)

Para permitir que usuários não autenticados (clientes da loja) possam visualizar as imagens, mas apenas administradores possam fazer upload/modificações:

1. No bucket criado, vá para a aba **Políticas**
2. Crie as seguintes políticas:

### Política para visualização pública

- **Nome da Política**: `Permitir visualização pública`
- **Operações permitidas**: SELECT
- **Usando expressão**: `true` (para permitir acesso público)

### Política para upload e gerenciamento

- **Nome da Política**: `Permitir upload anônimo`
- **Operações permitidas**: INSERT, UPDATE, DELETE
- **Usando expressão**: `true` (para permitir acesso anônimo)

## 3. Criação de pastas no bucket

Para melhor organização, crie as seguintes pastas no bucket `images`:

1. `logo` - Para imagens de logo da loja
2. `banners` - Para imagens de banners principais
3. `products` - Para imagens de produtos
4. `categories` - Para imagens de categorias em destaque
5. `share` - Para imagens de compartilhamento social

## 4. Configurando seu arquivo .env

Certifique-se de que seu arquivo `.env` contenha as variáveis de ambiente necessárias:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-pública
```

## 5. Testando o upload de imagens

Para testar se o upload está funcionando:

1. Acesse a página de administração do seu site
2. Vá para a aba de configurações da loja
3. Tente fazer o upload de uma imagem de logo ou banner
4. Salve as configurações
5. Verifique no console do Supabase se a imagem foi salva no bucket correto

## 6. Depurando problemas comuns

Se as imagens não estiverem sendo salvas globalmente:

- **Verifique erros no console**: Abra o console do navegador para ver se há erros durante o upload/salvamento
- **Confirme as variáveis de ambiente**: Certifique-se de que VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão corretos
- **Política RLS**: Verifique se as políticas RLS estão configuradas corretamente
- **Tamanho do arquivo**: Garanta que as imagens não excedam o limite de tamanho (10MB por padrão)
- **Tipo de arquivo**: Verifique se o tipo de arquivo (por exemplo, .jpg, .png) é permitido

## 7. Convertendo imagens locais para o Supabase

Se você já tinha imagens salvas localmente e quer migrar para o Supabase:

1. No painel de administração, vá para a aba configurações
2. Para cada imagem local, clique no botão para alterá-la
3. Faça o upload da nova imagem
4. Salve as configurações

Isso atualizará as referências para apontar para o Supabase Storage em vez de URLs locais temporárias. 