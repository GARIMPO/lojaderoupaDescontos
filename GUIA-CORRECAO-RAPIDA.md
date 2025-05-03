# Guia Rápido para Corrigir o Problema de Salvamento

Siga estes passos para resolver o problema de salvamento e exibição dos produtos:

## 1. Execute o Script SQL no Supabase

1. Acesse o painel do Supabase em https://app.supabase.com
2. Selecione seu projeto
3. Vá em "SQL Editor" no menu lateral
4. Crie uma nova consulta (botão "+ New Query")
5. Cole todo o conteúdo do arquivo `supabase-fix-simple.sql`
6. Clique em "Run" (botão verde)

## 2. Adicione os Arquivos de Sincronização ao Projeto

Observe que já criamos dois arquivos importantes:

- `src/lib/supabaseSync.ts` - Gerencia a sincronização entre Supabase e localStorage
- `src/data/products.ts` - Modificado para usar a sincronização

## 3. Reinicie o Servidor de Desenvolvimento

```bash
# Navegue até a pasta do projeto
cd "C:\Users\jenni\OneDrive\Área de Trabalho\Fashion-frenzy-main"

# Interrompa qualquer instância em execução (Ctrl+C)
# E inicie novamente
npm run dev
```

## 4. Limpe o Cache e Recarregue

1. Abra seu navegador
2. Acesse http://localhost:3000
3. Pressione **Ctrl+F5** para forçar uma recarga completa
4. Espere alguns segundos para que a sincronização inicial ocorra

## 5. Tente Salvar um Novo Produto

1. Navegue até a seção de administração
2. Adicione um novo produto com todos os campos obrigatórios
3. Salve o produto

Agora o produto deve ser salvo corretamente e aparecer na lista de produtos!

## Problemas comuns:

- **Erro ao salvar**: Verifique o console do navegador (F12) para mensagens específicas
- **Produtos não aparecem**: Certifique-se de que as políticas foram aplicadas corretamente no Supabase
- **Imagens não carregam**: Verifique se o bucket de armazenamento foi configurado corretamente

Se você ainda tiver problemas, execute o script SQL novamente e verifique se todas as consultas foram executadas com sucesso. 