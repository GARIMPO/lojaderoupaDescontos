# Checklist para configuração do Supabase

## 1. Verificação de credenciais
- [ ] Acessar o painel do Supabase (https://app.supabase.com)
- [ ] Selecionar o projeto correto
- [ ] Copiar a URL e chave anônima do projeto
- [ ] Verificar se as credenciais no arquivo `.env` ou `.env.local` estão corretas

## 2. Verificação de conexão
- [ ] Abrir o Dashboard do Supabase
- [ ] Ir para "Table Editor" para verificar se há conexão
- [ ] Verificar se pode criar uma tabela de teste manualmente

## 3. Executar o script SQL simplificado
- [ ] Abrir o "SQL Editor" no Supabase
- [ ] Clicar em "+ New query"
- [ ] Copiar e colar o script de `supabase-simpler.sql`
- [ ] Executar o script e verificar se não há erros

## 4. Verificar a existência da tabela
- [ ] Voltar para "Table Editor"
- [ ] Verificar se a tabela "products" foi criada
- [ ] Verificar se o produto de teste está visível

## 5. Testar a aplicação
- [ ] Reiniciar o servidor de desenvolvimento (`npm run dev`)
- [ ] Abrir o navegador no endereço mostrado (geralmente http://localhost:3000)
- [ ] Testar o salvamento de produtos

## 6. Solução de problemas comuns

### Se não conseguir criar a tabela:
- [ ] Verifique se tem permissões de administrador no projeto
- [ ] Tente criar um novo projeto Supabase
- [ ] Atualize as credenciais no `.env`

### Se a tabela foi criada, mas a aplicação não conecta:
- [ ] Verifique se a aplicação está usando as credenciais corretas
- [ ] Verifique a URL do Supabase (deve terminar em `.supabase.co`)
- [ ] Verifique se o banco de dados está online no Dashboard do Supabase

### Se os produtos não aparecem/salvam:
- [ ] Verifique no console do navegador se há erros
- [ ] Verifique se a tabela tem a estrutura correta (colunas esperadas)
- [ ] Verifique se as políticas RLS estão permitindo acesso 