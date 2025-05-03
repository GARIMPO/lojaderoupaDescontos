import { createClient } from '@supabase/supabase-js';
import { Product, CartItem } from '@/types';

// Usar variáveis de ambiente para as credenciais do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificar se temos credenciais válidas
const hasValidCredentials = !!(supabaseUrl && supabaseAnonKey);

// Criar cliente Supabase apenas se tivermos credenciais válidas
export const supabase = hasValidCredentials 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Verificação e log detalhado do status da conexão Supabase
if (hasValidCredentials && supabase) {
  console.log("✅ Cliente Supabase inicializado com sucesso!");
  console.log("🔑 URL:", supabaseUrl);
  console.log("🔑 Chave:", supabaseAnonKey ? "Definida" : "Não definida");
  
  // Verificar se as credenciais estão funcionando corretamente
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error("❌ Erro ao verificar sessão Supabase:", error);
      console.log("⚠️ As credenciais podem estar incorretas ou expiradas");
    } else {
      console.log("✅ Sessão Supabase verificada:", data.session ? "Autenticado" : "Anônimo");
    }
  });
} else {
  console.warn("⚠️ Cliente Supabase NÃO foi inicializado! Verificar variáveis de ambiente:");
  console.log(`URL definida: ${!!supabaseUrl}`);
  console.log(`Chave definida: ${!!supabaseAnonKey}`);
}

// Flag para controlar se devemos tentar usar o Supabase
let useSupabase = hasValidCredentials;

// Função para desabilitar o uso do Supabase em caso de erro
export const disableSupabase = () => {
  useSupabase = false;
  console.log('Uso do Supabase desabilitado. Usando apenas localStorage.');
};

// Função auxiliar para converter base64 para File
const base64ToFile = async (base64String: string, fileName: string = 'image.jpg'): Promise<File> => {
  try {
    const response = await fetch(base64String);
    const blob = await response.blob();
    return new File([blob], fileName, { type: blob.type });
  } catch (error) {
    console.error('Erro ao converter base64 para File:', error);
    throw error;
  }
};

// Funções para interagir com o Supabase com fallback para localStorage
export const fetchProducts = async (): Promise<Product[]> => {
  if (!useSupabase || !supabase) {
    console.log('Usando produtos do localStorage');
    // Fallback para localStorage
    return [];
  }
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Product[];
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    disableSupabase();
    return [];
  }
};

export const fetchProductById = async (id: string) => {
  if (!supabase) {
    console.error('Cliente Supabase não está disponível');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Product;
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return null;
  }
};

// Função para buscar configurações da loja
export const fetchStoreSettings = async () => {
  console.log('🔍 Iniciando fetchStoreSettings...');
  try {
    if (!supabase) {
      console.error('❌ Cliente Supabase não está disponível!');
      return null;
    }

    console.log('📤 Buscando configurações da loja no Supabase...');
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .single();

    if (error) {
      console.error('❌ Erro ao buscar configurações:', error);
      if (error.code === 'PGRST116') {
        console.log('⚠️ Nenhuma configuração encontrada. Isso é normal na primeira execução.');
      }
      return null;
    }

    console.log('✅ Configurações recuperadas com sucesso:', data);
    return data;
  } catch (error) {
    console.error('🔥 Erro crítico ao buscar configurações:', error);
    return null;
  }
};

// Função para salvar configurações da loja
export const saveStoreSettings = async (settings: any) => {
  console.log('🔍 Iniciando saveStoreSettings...');
  try {
    if (!supabase) {
      console.error('❌ Cliente Supabase não está disponível!');
      throw new Error('Cliente Supabase não configurado');
    }

    console.log('📤 Salvando configurações da loja no Supabase...');
    const { data, error } = await supabase
      .from('store_settings')
      .upsert(settings)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao salvar configurações:', error);
      if (error.code === '23505') {
        console.error('❌ Erro de chave duplicada:', error.details);
      }
      throw error;
    }

    console.log('✅ Configurações salvas com sucesso:', data);
    return data;
  } catch (error) {
    console.error('🔥 Erro crítico ao salvar configurações:', error);
    throw error;
  }
};

export const saveProduct = async (product: Product) => {
  console.log("🔍 INICIANDO SALVAMENTO DE PRODUTO", product.id ? `ID: ${product.id}` : "(novo produto)");
  console.log("📋 DADOS DO PRODUTO ORIGINAL:", JSON.stringify(product, null, 2));
  
  if (!supabase) {
    console.error("❌ ERRO: Cliente Supabase não disponível!");
    throw new Error("Cliente Supabase não configurado");
  }
  
  try {
    // Clone profundo do produto para evitar modificar o original
    const processedProduct = structuredClone(product);
    
    // Processar imagem principal
    if (processedProduct.imageUrl?.startsWith('data:image')) {
      console.log("🖼️ Processando imagem principal...");
      try {
        const file = await base64ToFile(processedProduct.imageUrl, 'main_image.jpg');
        const url = await uploadImage(file, 'products');
        if (url) {
          processedProduct.imageUrl = url;
          console.log("✅ Imagem principal salva:", url);
        }
      } catch (error) {
        console.error("❌ ERRO ao processar imagem principal:", error);
        // Não interromper o processo se a imagem falhar
      }
    }
    
    // Processar imagens adicionais
    if (Array.isArray(processedProduct.images)) {
      console.log("🖼️ Processando imagens adicionais...");
      const processedImages = [];
      
      for (const img of processedProduct.images) {
        if (img?.startsWith('data:image')) {
          try {
            const file = await base64ToFile(img, 'additional_image.jpg');
            const url = await uploadImage(file, 'products');
            if (url) processedImages.push(url);
          } catch (error) {
            console.error("❌ ERRO ao processar imagem adicional:", error);
            // Continuar com as outras imagens
          }
        } else if (img) {
          processedImages.push(img);
        }
      }
      
      processedProduct.images = processedImages;
      console.log("✅ Imagens adicionais processadas:", processedImages.length);
    } else {
      // Garantir que images seja um array
      processedProduct.images = [];
    }
    
    // Garantir que campos sejam do tipo correto
    processedProduct.sizes = Array.isArray(processedProduct.sizes) ? processedProduct.sizes : [];
    processedProduct.colors = Array.isArray(processedProduct.colors) ? processedProduct.colors : [];
    
    // Validar dados críticos
    if (!processedProduct.name) {
      console.error("❌ ERRO: Nome do produto é obrigatório");
      throw new Error("Nome do produto é obrigatório");
    }
    
    // Normalizações de tipo
    if (typeof processedProduct.price !== 'number') {
      processedProduct.price = parseFloat(processedProduct.price || '0');
      if (isNaN(processedProduct.price)) processedProduct.price = 0;
    }
    
    if (typeof processedProduct.discount !== 'number') {
      processedProduct.discount = parseInt(processedProduct.discount || '0');
      if (isNaN(processedProduct.discount)) processedProduct.discount = 0;
    }
    
    if (typeof processedProduct.stock !== 'number') {
      processedProduct.stock = parseInt(processedProduct.stock || '0');
      if (isNaN(processedProduct.stock)) processedProduct.stock = 0;
    }
    
    // Normalizar booleanos
    processedProduct.featured = !!processedProduct.featured;
    processedProduct.on_sale = !!processedProduct.on_sale;
    
    // Se não houver ID, gerar um UUID
    if (!processedProduct.id) {
      processedProduct.id = crypto.randomUUID();
    }
    
    console.log("📤 ENVIANDO PARA SUPABASE:", JSON.stringify({
      id: processedProduct.id,
      name: processedProduct.name,
      price: processedProduct.price,
      category: processedProduct.category,
      type: processedProduct.type,
      description: processedProduct.description,
      sizes: processedProduct.sizes,
      colors: processedProduct.colors,
      stock: processedProduct.stock,
      discount: processedProduct.discount,
      featured: processedProduct.featured,
      on_sale: processedProduct.on_sale
    }, null, 2));
    
    // SALVAR NO SUPABASE
    const { data, error } = await supabase
      .from('products')
      .upsert(processedProduct, { 
        onConflict: 'id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error("❌ ERRO DE SUPABASE:", error);
      console.error("CÓDIGO:", error.code);
      console.error("MENSAGEM:", error.message);
      console.error("DETALHES:", error.details);
      
      if (error.code === "23502") console.error("Campo obrigatório faltando:", error.details);
      if (error.code === "22P02") console.error("Tipo de dados inválido:", error.details);
      if (error.code === "23505") console.error("Chave duplicada:", error.details);
      throw error;
    }
    
    console.log("✅ PRODUTO SALVO COM SUCESSO:", JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error("🔥 ERRO CRÍTICO NO SAVE PRODUCT:", error);
    throw error;
  }
};

export const deleteProduct = async (id: string) => {
  if (!supabase) {
    console.error('Cliente Supabase não está disponível');
    throw new Error('Cliente Supabase não configurado');
  }

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    throw error;
  }
};

export const fetchCategories = async () => {
  if (!supabase) {
    console.error('Cliente Supabase não está disponível');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return [];
  }
};

export const saveCart = async (userId: string, items: CartItem[]) => {
  if (!supabase) {
    console.error('Cliente Supabase não está disponível');
    throw new Error('Cliente Supabase não configurado');
  }

  try {
    const { error } = await supabase
      .from('carts')
      .upsert({
        user_id: userId,
        items: items,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao salvar carrinho:', error);
    throw error;
  }
};

export const fetchCart = async (userId: string) => {
  if (!supabase) {
    console.error('Cliente Supabase não está disponível');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('carts')
      .select('items')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data?.items || [];
  } catch (error) {
    console.error('Erro ao buscar carrinho:', error);
    return [];
  }
};

// Função para gerar um userId anônimo e consistente para usuários não autenticados
export const getAnonymousUserId = (): string => {
  let userId = localStorage.getItem('anonymous_user_id');
  
  if (!userId) {
    userId = `anon_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('anonymous_user_id', userId);
  }
  
  return userId;
};

// Função para fazer upload de uma imagem para o Supabase Storage
export async function uploadImage(file: File, folder: string = 'products'): Promise<string> {
  if (!supabase) {
    console.error('❌ ERRO: Cliente Supabase não disponível para upload de imagem!');
    throw new Error('Cliente Supabase não configurado');
  }
  
  try {
    console.log('🚀 Iniciando upload de imagem...');
    console.log('📄 Arquivo:', file.name, 'Tamanho:', file.size, 'Tipo:', file.type);
    
    // Garantir que temos uma extensão
    const fileNameParts = file.name.split('.');
    const fileExt = fileNameParts.length > 1 ? fileNameParts.pop() : 'jpg';
    
    // Criar nome de arquivo único e seguro
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 10);
    const fileName = `${timestamp}-${randomId}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    console.log('📁 Caminho do arquivo para upload:', filePath);

    // Tentar fazer o upload
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false // Não queremos sobrescrever, queremos um novo arquivo
      });

    // Se houver erro
    if (error) {
      console.error('❌ Erro no upload:', error.message);
      
      // Se for erro de duplicidade (nome de arquivo já existe)
      if (error.message.includes('duplicate') || error.message.includes('already exists')) {
        console.warn('⚠️ Nome de arquivo duplicado, tentando com outro nome...');
        
        // Criar novo nome ainda mais único
        const newFileName = `${timestamp}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const newFilePath = `${folder}/${newFileName}`;
        
        console.log('📁 Novo caminho:', newFilePath);
        
        // Nova tentativa com nome diferente
        const retryUpload = await supabase.storage
          .from('images')
          .upload(newFilePath, file, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (retryUpload.error) {
          console.error('❌ Falha na segunda tentativa:', retryUpload.error);
          throw retryUpload.error;
        }
        
        if (!retryUpload.data) {
          throw new Error('Upload falhou: Sem dados retornados na segunda tentativa');
        }
        
        // Obter URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(retryUpload.data.path);
          
        console.log('✅ Upload concluído na segunda tentativa!');
        console.log('🔗 URL pública:', publicUrl);
        
        return publicUrl;
      } else {
        // Outros erros
        throw error;
      }
    }

    // Verificação adicional para garantir que temos dados
    if (!data || !data.path) {
      console.error('❌ Upload falhou: Nenhum dado retornado');
      throw new Error('Upload falhou: Nenhum dado retornado');
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(data.path);

    console.log('✅ Upload concluído com sucesso!');
    console.log('🔗 URL pública:', publicUrl);
    
    return publicUrl;
  } catch (error) {
    console.error('🔥 ERRO CRÍTICO NO UPLOAD:', error);
    // Rethrow para que o chamador possa lidar com o erro
    throw error;
  }
}

// Função para atualizar configurações de loja incluindo imagens
export const saveStoreSettingsWithImages = async (settings: any, imageFiles: {
  logo?: File | null,
  banner?: File | null,
  share?: File | null
}) => {
  // Copia as configurações para não modificar o objeto original
  const settingsCopy = { ...settings };
  
  try {
    // Processa os uploads de imagem, se houver
    if (imageFiles.logo) {
      const logoUrl = await uploadImage(imageFiles.logo, 'logo');
      if (logoUrl) settingsCopy.logoImage = logoUrl;
    }
    
    if (imageFiles.banner) {
      const bannerUrl = await uploadImage(imageFiles.banner, 'banners');
      if (bannerUrl && settingsCopy.bannerConfig) {
        settingsCopy.bannerConfig.imageUrl = bannerUrl;
      }
    }
    
    if (imageFiles.share) {
      const shareUrl = await uploadImage(imageFiles.share, 'share');
      if (shareUrl) settingsCopy.shareImage = shareUrl;
    }
    
    // Salva as configurações atualizadas
    return await saveStoreSettings(settingsCopy);
  } catch (error) {
    console.error('Erro ao salvar configurações com imagens:', error);
    throw error;
  }
};

// Adicionar alias para compatibilidade com imports existentes
export const getStoreSettings = fetchStoreSettings;
export const updateStoreSettings = saveStoreSettings; 