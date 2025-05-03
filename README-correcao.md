# Correção do Problema de Salvamento de Produtos

Este guia vai ajudar a corrigir o problema de salvamento de produtos na plataforma Fashion Frenzy.

## Diagnóstico do Problema

O problema ocorre porque:

1. A estrutura da tabela `products` no Supabase pode estar incorreta ou desatualizada
2. As políticas de acesso (RLS) podem estar configuradas de forma restritiva
3. O bucket de armazenamento de imagens pode não estar configurado corretamente

## Solução Passo a Passo

### 1. Execute o Script SQL no Supabase

1. Acesse o painel do Supabase (https://supabase.com)
2. Faça login e selecione seu projeto
3. Vá para "SQL Editor" no menu lateral
4. Crie um novo script (botão "+ New Query")
5. Copie e cole todo o conteúdo do arquivo `supabase-corrigido.sql`
6. Clique em "Run" para executar o script

### 2. Verifique se o Script foi Aplicado com Sucesso

Após executar o script, verifique se:

- A tabela `products` foi recriada
- A política "Acesso total a produtos" foi criada
- O bucket de imagens "images" foi configurado
- As políticas para operações CRUD no bucket foram criadas
- O produto de teste foi inserido

### 3. Reinicie a Aplicação

Após aplicar as correções no Supabase:

1. Pare o servidor de desenvolvimento (Ctrl+C no terminal)
2. Inicie novamente com `npm run dev`
3. Limpe o cache do navegador (Ctrl+F5)

### 4. Teste o Cadastro de Produto

1. Acesse a página de cadastro de produto
2. Preencha todos os campos obrigatórios (nome, preço, etc.)
3. Adicione imagens (principal e adicionais)
4. Clique em salvar

Agora o produto deve ser salvo com sucesso!

## Informações Adicionais

### Estrutura Correta da Tabela products

- `id`: UUID (identificador único)
- `name`: TEXT (obrigatório)
- `description`: TEXT
- `price`: NUMERIC(10,2) (obrigatório)
- `discount`: INTEGER
- `stock`: INTEGER
- `featured`: BOOLEAN
- `on_sale`: BOOLEAN
- `imageUrl`: TEXT
- `images`: TEXT[] (array de URLs)
- `colors`: TEXT[] (array de cores)
- `sizes`: TEXT[] (array de tamanhos)
- `category`: TEXT
- `type`: TEXT
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### Recomendações para Prevenção de Problemas

1. Não altere manualmente a estrutura da tabela no Supabase
2. Sempre verifique as políticas de acesso ao enfrentar problemas de salvamento
3. Mantenha o bucket de armazenamento configurado corretamente
4. Verifique os logs no console para identificar problemas específicos

### Resolução de Problemas Comuns

- **Erro "Cannot insert to..."**: As políticas RLS estão restritivas
- **Erro 403/404 ao salvar imagens**: As políticas do bucket storage não estão corretas
- **Validação de dados**: Certifique-se de que todos os campos obrigatórios estão preenchidos 