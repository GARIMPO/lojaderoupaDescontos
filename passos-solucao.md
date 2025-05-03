# Solução para o erro "relation 'public.products' does not exist"

Se você está enfrentando esse erro, siga esses passos para resolvê-lo:

## 1. Verifique sua conexão com o Supabase

Abra o arquivo `.env` ou `.env.local` e confirme que suas credenciais do Supabase estão corretas:

```
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

## 2. Execute o script SQL simplificado

1. Acesse o painel do Supabase: https://app.supabase.com/
2. Selecione seu projeto
3. No menu esquerdo, clique em "SQL Editor"
4. Crie uma nova consulta ("+ New query")
5. Copie e cole o conteúdo do arquivo `supabase-fix-tables.sql`
6. Clique em "Run" para executar o script

## 3. Verifique se as tabelas foram criadas

Após executar o script, você pode verificar se as tabelas foram criadas:

1. No painel do Supabase, vá para "Table Editor"
2. Você deve ver as tabelas: `products`, `store_settings`, `categories` e `carts`

## 4. Reinicie seu servidor de desenvolvimento

```
npm cache clean --force
npm run dev
```

## Solução alternativa: Execute o SQL diretamente

Se você está tendo problemas com o painel do Supabase, pode executar o SQL diretamente usando os seguintes comandos:

```js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'SEU_SUPABASE_URL'
const supabaseKey = 'SUA_SUPABASE_ANON_KEY'
const supabase = createClient(supabaseUrl, supabaseKey)

// Execute o SQL para criar as tabelas
const { data, error } = await supabase.rpc('executeSQL', {
  sql_query: `
    -- Cole aqui o conteúdo do arquivo supabase-fix-tables.sql
  `
})

if (error) {
  console.error('Erro ao executar SQL:', error)
} else {
  console.log('Tabelas criadas com sucesso:', data)
}
```

## Problemas comuns:

### 1. "ERROR: must be owner of schema public"

Solução: Você precisa usar uma conta com privilégios de administrador no Supabase.

### 2. "ERROR: permission denied for schema storage"

Solução: Remova as partes do script relacionadas ao bucket de armazenamento e execute apenas a criação das tabelas.

### 3. "ERROR: database is being accessed by other users"

Solução: Tente executar o script em pequenas partes, uma tabela por vez.

## Se nada funcionar:

1. Crie um novo projeto no Supabase
2. Atualize as credenciais no arquivo `.env`
3. Execute o script SQL completo no novo projeto
4. Teste novamente seu aplicativo 