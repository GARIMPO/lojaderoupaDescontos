-- Criação da tabela para configurações da loja
CREATE TABLE IF NOT EXISTS store_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Campos de configuração da loja
  store_name TEXT,
  store_name_font TEXT,
  store_name_color TEXT,
  store_name_size TEXT,
  page_title TEXT,
  page_title_font TEXT,
  page_title_color TEXT,
  page_title_size TEXT,
  page_subtitle TEXT,
  store_email TEXT,
  store_address TEXT,
  store_phone TEXT,
  
  -- Imagens
  logo_image TEXT,
  share_image TEXT,
  
  -- Footer e informações de contato
  footer_text TEXT,
  delivery_info TEXT,
  map_link TEXT,
  
  -- Configurações de pagamento
  show_payment_methods BOOLEAN DEFAULT TRUE,
  payment_methods JSONB DEFAULT '{"credit": true, "debit": true, "pix": true, "cash": true, "other": true}',
  
  -- Banner
  banner_config JSONB DEFAULT '{"imageUrl": "", "title": "", "subtitle": "", "showExploreButton": true, "textColor": "#FFFFFF", "buttonColor": "#000000"}',
  
  -- Header e navegação
  header_links JSONB DEFAULT '{"novidades": true, "masculino": true, "feminino": true, "kids": true, "calcados": true, "acessorios": true, "off": true, "customLinks": []}',
  header_color TEXT DEFAULT '#FFFFFF',
  header_link_color TEXT DEFAULT '#000000',
  
  -- Categorias em destaque
  category_highlights JSONB DEFAULT '{"enabled": true, "title": "Categorias em Destaque", "categories": []}',
  
  -- Redes sociais
  social_media JSONB DEFAULT '{"enabled": false, "instagram": {"enabled": false, "url": ""}, "facebook": {"enabled": false, "url": ""}, "whatsapp": {"enabled": false, "url": ""}, "tiktok": {"enabled": false, "url": ""}, "twitter": {"enabled": false, "url": ""}, "website": {"enabled": false, "url": ""}}'
);

-- Configuração de RLS (Row Level Security) para a tabela de configurações
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura para todos (pública)
CREATE POLICY "Permitir leitura pública de configurações" ON store_settings
  FOR SELECT USING (TRUE);

-- Política para permitir inserção apenas para usuários autenticados com papel anon
CREATE POLICY "Permitir inserção com autenticação anônima" ON store_settings
  FOR INSERT WITH CHECK (auth.role() = 'anon');

-- Política para permitir modificação apenas para usuários autenticados com papel anon
CREATE POLICY "Permitir atualização com autenticação anônima" ON store_settings
  FOR UPDATE USING (auth.role() = 'anon');

-- Procedimento para atualizar o timestamp quando houver atualização
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_store_settings_updated_at
BEFORE UPDATE ON store_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Configuração do bucket para armazenamento de imagens
-- Nota: Esta parte precisa ser feita no console do Supabase, mas aqui está o
-- equivalente em SQL:

-- CREATE BUCKET IF NOT EXISTS 'images'
-- WITH (
--   public = TRUE
-- );

-- Comentário para instruções de configuração do bucket
COMMENT ON TABLE store_settings IS 'Para configurar o bucket de imagens, siga estas etapas no console do Supabase:
1. Vá para Storage > Criar novo bucket
2. Nomeie o bucket como "images"
3. Marque a opção "Acesso público" para permitir acesso a imagens sem autenticação
4. Em "Políticas", crie políticas para permitir:
   - SELECT (para todos)
   - INSERT (para usuários anônimos)
   - UPDATE (para usuários anônimos)
   - DELETE (para usuários anônimos)';

-- Agora vamos criar uma entrada inicial na tabela de configurações, se não existir
INSERT INTO store_settings (id)
SELECT '00000000-0000-0000-0000-000000000000'
WHERE NOT EXISTS (SELECT 1 FROM store_settings); 