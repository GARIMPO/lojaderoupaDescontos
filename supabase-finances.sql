-- SQL para criar estrutura de finanças no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela de transações financeiras
CREATE TABLE IF NOT EXISTS public.finances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  transaction_type TEXT NOT NULL, -- 'income' ou 'expense'
  category TEXT,
  payment_method TEXT,
  status TEXT DEFAULT 'completed', -- 'pending', 'completed', 'cancelled'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID
);

-- 2. Criar tabela de categorias financeiras
CREATE TABLE IF NOT EXISTS public.finance_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL, -- 'income' ou 'expense'
  color TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela de métodos de pagamento
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Garantir que RLS esteja habilitado nas tabelas
ALTER TABLE public.finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- 5. Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Acesso público total a finances" ON public.finances;
DROP POLICY IF EXISTS "Acesso público total a finance_categories" ON public.finance_categories;
DROP POLICY IF EXISTS "Acesso público total a payment_methods" ON public.payment_methods;

-- 6. Criar políticas de acesso público para desenvolvimento
-- Finanças
CREATE POLICY "Acesso público total a finances"
ON public.finances
FOR ALL
USING (true)
WITH CHECK (true);

-- Categorias financeiras
CREATE POLICY "Acesso público total a finance_categories"
ON public.finance_categories
FOR ALL
USING (true)
WITH CHECK (true);

-- Métodos de pagamento
CREATE POLICY "Acesso público total a payment_methods"
ON public.payment_methods
FOR ALL
USING (true)
WITH CHECK (true);

-- 7. Adicionar categorias financeiras básicas
INSERT INTO public.finance_categories (name, type, color, icon) VALUES 
('Vendas', 'income', '#4CAF50', 'shopping-cart'),
('Serviços', 'income', '#2196F3', 'handshake'),
('Outros Rendimentos', 'income', '#9C27B0', 'plus-circle'),
('Fornecedores', 'expense', '#F44336', 'truck'),
('Marketing', 'expense', '#FF9800', 'megaphone'),
('Salários', 'expense', '#795548', 'users'),
('Aluguel', 'expense', '#607D8B', 'building'),
('Utilities', 'expense', '#009688', 'plug'),
('Material de Escritório', 'expense', '#3F51B5', 'paperclip')
ON CONFLICT (name) DO NOTHING;

-- 8. Adicionar métodos de pagamento básicos
INSERT INTO public.payment_methods (name, description) VALUES 
('Dinheiro', 'Pagamento em espécie'),
('Cartão de Crédito', 'Pagamento com cartão de crédito'),
('Cartão de Débito', 'Pagamento com cartão de débito'),
('Transferência Bancária', 'Transferência entre contas bancárias'),
('PIX', 'Pagamento instantâneo via PIX'),
('Boleto', 'Pagamento via boleto bancário')
ON CONFLICT (name) DO NOTHING;

-- 9. Criar gatilho para atualização automática de timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar gatilho às tabelas de finanças
DROP TRIGGER IF EXISTS set_timestamp_finances ON public.finances;
CREATE TRIGGER set_timestamp_finances
BEFORE UPDATE ON public.finances
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS set_timestamp_finance_categories ON public.finance_categories;
CREATE TRIGGER set_timestamp_finance_categories
BEFORE UPDATE ON public.finance_categories
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS set_timestamp_payment_methods ON public.payment_methods;
CREATE TRIGGER set_timestamp_payment_methods
BEFORE UPDATE ON public.payment_methods
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 10. Verificar se tudo foi criado corretamente
SELECT 'finances' as tabela, COUNT(*) FROM public.finances
UNION ALL
SELECT 'finance_categories' as tabela, COUNT(*) FROM public.finance_categories
UNION ALL
SELECT 'payment_methods' as tabela, COUNT(*) FROM public.payment_methods; 