import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, Save, Filter, Upload, X, Star } from 'lucide-react';
import { Product } from '@/types';
import { getAllProducts, saveProductsToLocalStorage } from '@/data/products';
import { saveProduct as saveProductToSupabase, fetchProducts as fetchProductsFromSupabase, deleteProduct as deleteProductFromSupabase } from '@/lib/supabase';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import StoreSettings from '@/components/StoreSettings';
import FinancialManagement from '@/components/FinancialManagement';
import CustomerManagement from '@/components/CustomerManagement';
import { toast } from 'sonner';
import { saveProductRobust, syncProducts } from '@/lib/productHelper';

const AdminPage = () => {
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [productImages, setProductImages] = useState<string[]>(['', '', '', '']);
  const previousEditingProductId = useRef<string>('');
  const [headerCustomLinks, setHeaderCustomLinks] = useState<Array<{label: string; enabled: boolean}>>([]);
  const [featuredCategories, setFeaturedCategories] = useState<Array<{name: string; link: string; image: string}>>([]);
  
  const categories = ['all', 'acessórios', 'calçados', 'feminino', 'kids', 'masculino'];
  
  // Compute filter categories including enabled custom links and featured categories
  const filterCategories = [...categories];
  
  useEffect(() => {
    // Add enabled custom links to filter categories
    if (headerCustomLinks && headerCustomLinks.length > 0) {
      headerCustomLinks.forEach(link => {
        if (link.enabled) {
          const normalizedLink = getNormalizedLink(link.label);
          if (!filterCategories.includes(normalizedLink)) {
            filterCategories.push(normalizedLink);
          }
        }
      });
    }
    
    // Add featured categories to filter categories
    if (featuredCategories && featuredCategories.length > 0) {
      featuredCategories.forEach(category => {
        // Extract category name from the link path
        const normalizedName = category.link.split('/').pop() || '';
        if (normalizedName && !filterCategories.includes(normalizedName)) {
          filterCategories.push(normalizedName);
        }
      });
    }
  }, [headerCustomLinks, featuredCategories]);
  
  useEffect(() => {
    // Registrar logs de debug para todas as categorias
    console.log("====== DEBUG CATEGORIAS ======");
    try {
      const storedProducts = localStorage.getItem('products');
      if (storedProducts) {
        const products = JSON.parse(storedProducts);
        console.log("Total de produtos:", products.length);
        
        // Mapear produtos por categoria
        const categorias = products.reduce((acc, product) => {
          const cat = product.category.toLowerCase();
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        }, {});
        
        console.log("Produtos por categoria:", categorias);
        
        // Mapear produtos por tipo
        const tipos = products.reduce((acc, product) => {
          const tipo = product.type;
          acc[tipo] = (acc[tipo] || 0) + 1;
          return acc;
        }, {});
        
        console.log("Produtos por tipo:", tipos);
        
        // Verificar discrepâncias entre categoria e tipo
        const discrepancias = products.filter(p => {
          if (normalizeCategory(p.category) === 'calçados' && p.type !== 'shoes') return true;
          if (normalizeCategory(p.category) === 'acessórios' && p.type !== 'accessory') return true;
          return false;
        });
        
        if (discrepancias.length > 0) {
          console.log("Produtos com discrepância entre categoria e tipo:", discrepancias);
        }
      }
    } catch (e) {
      console.error('Erro ao analisar categorias:', e);
    }
    console.log("====== FIM DEBUG CATEGORIAS ======");
  }, []);
  
  // Carregamento inicial de produtos
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        // Usar a nova função de sincronização para garantir consistência dos dados
        console.log("Sincronizando produtos entre localStorage e Supabase...");
        const products = await syncProducts();
        
        // Atualizar o estado com os produtos sincronizados
        setProductsList(products);
        setFilteredProducts(products);
        console.log(`Carregados ${products.length} produtos após sincronização`);
      } catch (error) {
        console.error('Erro ao sincronizar produtos:', error);
        
        // Fallback para localStorage em caso de erro
        try {
          const storedProducts = localStorage.getItem('products');
          if (storedProducts) {
            const parsedProducts = JSON.parse(storedProducts);
            setProductsList(parsedProducts);
            setFilteredProducts(parsedProducts);
            console.log("Usando produtos do localStorage como fallback");
          } else {
            // Initialize with empty array if no products exist
            const emptyProducts: Product[] = [];
            setProductsList(emptyProducts);
            setFilteredProducts(emptyProducts);
          }
        } catch (e) {
          console.error('Erro ao carregar produtos do localStorage:', e);
          const emptyProducts: Product[] = [];
          setProductsList(emptyProducts);
          setFilteredProducts(emptyProducts);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProducts();
  }, []);
  
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProducts(productsList);
    } else {
      const normalizedSelectedCategory = normalizeCategory(selectedCategory);
      console.log("Filtrando por categoria:", normalizedSelectedCategory);
      
      setFilteredProducts(productsList.filter(product => {
        const normalizedProductCategory = normalizeCategory(product.category);
        
        if (normalizedSelectedCategory === 'calçados') {
          const isMatch = normalizedProductCategory === 'calçados' || product.type === 'shoes';
          console.log(`Produto: ${product.name}, categoria: ${product.category}, tipo: ${product.type}, match: ${isMatch}`);
          return isMatch;
        } else if (normalizedSelectedCategory === 'acessórios') {
          const isMatch = normalizedProductCategory === 'acessórios' || product.type === 'accessory';
          console.log(`Produto: ${product.name}, categoria: ${product.category}, tipo: ${product.type}, match: ${isMatch}`);
          return isMatch;
        } else {
          // Check if it's a custom link category
          const isCustomLinkCategory = headerCustomLinks.some(link => 
            link.enabled && getNormalizedLink(link.label) === normalizedSelectedCategory
          );
          
          // Check if it's a featured category
          const isFeaturedCategory = featuredCategories.some(category => {
            const categoryValue = category.link.split('/').pop() || '';
            return categoryValue === normalizedSelectedCategory;
          });
          
          if (isCustomLinkCategory || isFeaturedCategory) {
            const isMatch = normalizedProductCategory === normalizedSelectedCategory;
            console.log(`Produto: ${product.name}, categoria: ${product.category}, categoria customizada/destaque: ${normalizedSelectedCategory}, match: ${isMatch}`);
            return isMatch;
          } else {
            const isMatch = normalizedProductCategory === normalizedSelectedCategory;
            console.log(`Produto: ${product.name}, categoria: ${product.category}, categoria normalizada: ${normalizedProductCategory}, comparando com: ${normalizedSelectedCategory}, match: ${isMatch}`);
            return isMatch;
          }
        }
      }));
    }
  }, [selectedCategory, productsList, headerCustomLinks, featuredCategories]);

  useEffect(() => {
    if (editingProduct) {
      // Apenas configure as imagens inicialmente quando o produto for carregado pela primeira vez
      // Não reconfigurar quando outros campos são editados
      if (!productImages.some(img => img) || editingProduct.id !== previousEditingProductId.current) {
        const mainImage = editingProduct.imageUrl || '';
        const additionalImages = [...(editingProduct.images || [])].slice(0, 3);
        
        const newProductImages = [mainImage];
        
        for (const img of additionalImages) {
          if (img && img !== mainImage) {
            newProductImages.push(img);
          }
        }
        
        while (newProductImages.length < 4) {
          newProductImages.push('');
        }
        
        setProductImages(newProductImages);
        
        // Guarde o ID do produto atual para saber quando mudamos para um produto diferente
        previousEditingProductId.current = editingProduct.id;
      }
    } else {
      setProductImages(['', '', '', '']);
      previousEditingProductId.current = '';
    }
  }, [editingProduct]);
  
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('storeSettings');
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        // Load custom links from settings
        if (parsedSettings?.headerLinks?.customLinks) {
          setHeaderCustomLinks(parsedSettings.headerLinks.customLinks);
        }
        
        // Load featured categories from settings
        if (parsedSettings?.categoryHighlights?.categories) {
          setFeaturedCategories(parsedSettings.categoryHighlights.categories);
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);
  
  const handleNewProduct = () => {
    // Gerar um ID único baseado em timestamp
    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 1000);
    
    const newProduct: Product = {
      id: `new-${timestamp}-${randomId}`,
      name: '',
      description: '',
      price: 0,
      discount: 0,
      imageUrl: '',
      images: [],
      category: '',  // Campo obrigatório que deve ser selecionado pelo usuário
      type: 'clothing',
      sizes: ['P', 'M', 'G'],
      colors: ['Preto', 'Branco'],
      stock: 10, // Valor padrão mais realista
      featured: false,
      on_sale: false // Adicionando o campo obrigatório
    };
    
    setEditingProduct(newProduct);
    setProductImages(['', '', '', '']);
    setIsDialogOpen(true);
  };
  
  const handleEditProduct = (product: Product) => {
    setEditingProduct({ ...product });
    setIsDialogOpen(true);
  };
  
  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      // Remover o produto da lista
      const updatedProducts = productsList.filter(product => product.id !== id);
      
      // Try to delete from Supabase first
      console.log("Tentando excluir produto do Supabase...");
      deleteProductFromSupabase(id)
        .then(() => {
          console.log("Produto excluído com sucesso do Supabase!");
        })
        .catch(error => {
          console.error("Erro ao excluir produto do Supabase:", error);
        })
        .finally(() => {
          // Always update localStorage and state
          saveProductsToLocalStorage(updatedProducts);
          setProductsList(updatedProducts);
          setFilteredProducts(updatedProducts);
          toast.success('Produto excluído com sucesso!');
        });
    }
  };

  // Helper function to compress image
  const compressImage = async (base64String: string, quality = 0.6, maxWidth = 800): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const img = new Image();
        
        // Estabelecer um timeout para evitar processamento infinito
        const timeoutId = setTimeout(() => {
          console.error('Timeout ao processar imagem');
          // Retornar a imagem original em caso de timeout
          resolve(base64String);
        }, 10000); // 10 segundos
        
        img.onload = () => {
          clearTimeout(timeoutId);
          
          try {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            // Calculate new dimensions if width exceeds maxWidth
            if (width > maxWidth) {
              const ratio = maxWidth / width;
              width = maxWidth;
              height = height * ratio;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              console.error('Could not get canvas context');
              resolve(base64String); // Retornar original em caso de erro
              return;
            }
            
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedDataUrl);
          } catch (err) {
            console.error('Erro durante a compressão da imagem:', err);
            resolve(base64String); // Retornar original em caso de erro
          }
        };
        
        img.onerror = (err) => {
          clearTimeout(timeoutId);
          console.error('Erro ao carregar imagem:', err);
          resolve(base64String); // Retornar original em caso de erro
        };
        
        img.src = base64String;
      } catch (err) {
        console.error('Erro crítico na compressão:', err);
        resolve(base64String); // Retornar original em caso de erro
      }
    });
  };
  
  // Helper function to normalize category strings
  const normalizeCategory = (categoryStr: string) => {
    if (!categoryStr) return '';
    
    // 1. Trim spaces and convert to lowercase
    let normalized = categoryStr.trim().toLowerCase();
    
    // 2. Handle common variations and normalize
    if (normalized === 'calcados' || normalized === 'calçados' || normalized === 'shoes') {
      normalized = 'calçados';
    } else if (normalized === 'acessorios' || normalized === 'acessórios' || normalized === 'accessories' || normalized === 'accessory') {
      normalized = 'acessórios';
    } else if (normalized === 'masculino' || normalized === 'men' || normalized === 'homem') {
      normalized = 'masculino';
    } else if (normalized === 'feminino' || normalized === 'women' || normalized === 'mulher') {
      normalized = 'feminino';
    } else if (normalized === 'infantil' || normalized === 'children' || normalized === 'kids' || normalized === 'kid') {
      normalized = 'kids';
    } else if (normalized === 'oferta' || normalized === 'ofertas' || normalized === 'promoção' || normalized === 'off' || normalized === 'sale') {
      normalized = 'off';
    } else if (normalized === 'novidade' || normalized === 'novidades' || normalized === 'new' || normalized === 'new arrivals') {
      normalized = 'novidades';
    }
    
    return normalized;
  };
  
  // Função para converter uma imagem base64 para Blob e fazer upload para o Supabase
  const uploadBase64ImageToSupabase = async (base64String: string, folder: string = 'products'): Promise<string> => {
    if (!base64String) return '';
    if (!base64String.startsWith('data:image')) return base64String; // Já é uma URL, retornar como está
    
    try {
      console.log(`🖼️ Convertendo imagem base64 para upload no Supabase (${folder})...`);
      
      // Extrair o tipo e os dados da imagem base64
      const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        console.error('❌ Formato de base64 inválido');
        return base64String;
      }
      
      const contentType = matches[1];
      const base64Data = matches[2];
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      
      for (let i = 0; i < byteCharacters.length; i += 512) {
        const slice = byteCharacters.slice(i, i + 512);
        const byteNumbers = new Array(slice.length);
        for (let j = 0; j < slice.length; j++) {
          byteNumbers[j] = slice.charCodeAt(j);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      
      const blob = new Blob(byteArrays, { type: contentType });
      const fileName = `product_${Date.now()}_${Math.random().toString(36).substring(2, 10)}.${contentType.split('/')[1] || 'jpg'}`;
      const filePath = `${folder}/${fileName}`;
      
      console.log(`🔄 Fazendo upload do blob (${(blob.size / 1024).toFixed(2)}KB) para o Supabase...`);
      
      // Tentar importar o cliente Supabase diretamente do módulo
      const supabaseModule = await import('@/lib/supabase');
      const supabaseClient = supabaseModule.supabase;
      
      if (!supabaseClient) {
        console.error('❌ Cliente Supabase não está disponível');
        return base64String;
      }
      
      const { data, error } = await supabaseClient.storage
        .from('images')
        .upload(filePath, blob, {
          contentType,
          upsert: true
        });
      
      if (error) {
        console.error('❌ Erro ao fazer upload da imagem para o Supabase:', error);
        return base64String;
      }
      
      // Obter a URL pública da imagem
      const { data: urlData } = supabaseClient.storage
        .from('images')
        .getPublicUrl(filePath);
      
      console.log('✅ Imagem enviada com sucesso para o Supabase:', urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error('❌ Erro ao processar imagem para o Supabase:', error);
      return base64String; // Em caso de erro, retornar a string base64 original
    }
  };

  const handleSaveProduct = async () => {
    if (!editingProduct) return;
    
    // Verificar campos obrigatórios
    const missingFields = [];
    if (!editingProduct.name) missingFields.push('Nome');
    if (!editingProduct.description) missingFields.push('Descrição');
    if (!editingProduct.category) missingFields.push('Categoria');
    
    if (missingFields.length > 0) {
      toast.error(`Por favor, preencha todos os campos obrigatórios: ${missingFields.join(', ')}`);
      return;
    }

    // Validar que a categoria foi selecionada e é válida
    if (editingProduct.category.trim() === '') {
      toast.error('É necessário selecionar uma categoria para o produto');
      return;
    }
    
    // Garantir que a categoria seja uma das válidas
    const validCategories = ['feminino', 'masculino', 'kids', 'acessórios', 'calçados', 'featured', 'off'];
    
    // Adicionar links personalizados como categorias válidas
    const customLinkCategories = headerCustomLinks
      .filter(link => link.enabled)
      .map(link => getNormalizedLink(link.label));
    
    const allValidCategories = [...validCategories, ...customLinkCategories];
    
    const normalizedCategory = normalizeCategory(editingProduct.category);
    console.log("Categoria normalizada:", normalizedCategory);
    
    // Verificar se a categoria está na lista de categorias válidas ou é um link personalizado
    if (!allValidCategories.includes(normalizedCategory)) {
      toast.error(`A categoria "${editingProduct.category}" não é válida. Escolha uma das categorias disponíveis.`);
      return;
    }
    
    // Normalizar a categoria 
    editingProduct.category = normalizedCategory;
    
    // Garantir que o tipo de produto seja consistente com a categoria principal
    if (normalizedCategory === 'calçados' && editingProduct.type !== 'shoes') {
      editingProduct.type = 'shoes';
    } else if (normalizedCategory === 'acessórios' && editingProduct.type !== 'accessory') {
      editingProduct.type = 'accessory';
    } else if ((normalizedCategory === 'feminino' || normalizedCategory === 'masculino' || normalizedCategory === 'kids') && editingProduct.type !== 'clothing') {
      editingProduct.type = 'clothing';
    } else if (!validCategories.includes(normalizedCategory) && !editingProduct.type) {
      editingProduct.type = 'clothing';
    }
    
    // Garantir que arrays de tamanhos e cores não sejam undefined
    if (!editingProduct.sizes || !Array.isArray(editingProduct.sizes)) {
      editingProduct.sizes = [];
    }
    
    if (!editingProduct.colors || !Array.isArray(editingProduct.colors)) {
      editingProduct.colors = [];
    }
    
    // Ajustar tamanhos com base no tipo se necessário
    if (editingProduct.sizes.length === 0) {
      if (editingProduct.type === 'shoes') {
        editingProduct.sizes = ['38', '39', '40', '41', '42'];
      } else if (editingProduct.type === 'accessory') {
        editingProduct.sizes = ['Único'];
      } else if (editingProduct.type === 'clothing') {
        editingProduct.sizes = ['P', 'M', 'G'];
      }
    }
    
    // Ajustar cores se não foram especificadas
    if (editingProduct.colors.length === 0) {
      editingProduct.colors = ['Preto'];
    }
    
    // Verificar se há pelo menos uma imagem
    const hasAtLeastOneImage = productImages.some(img => img);
    if (!hasAtLeastOneImage) {
      toast.error('Por favor, adicione pelo menos uma imagem');
      return;
    }

    try {
      // Compress images to reduce storage size
      const compressedImages = await Promise.all(
        productImages.map(async img => {
          if (!img) return '';
          try {
            return await compressImage(img);
          } catch (err) {
            console.error("Failed to compress image:", err);
            return img;
          }
        })
      );
      
      // Find first non-empty image for main image
      const mainImage = compressedImages.find(img => img) || '';
      // Get other non-empty images that aren't duplicates of main image
      const additionalImages = compressedImages.filter(img => img && img !== mainImage);
      
      // Criar o produto atualizado
      const updatedProduct: Product = {
        ...editingProduct,
        imageUrl: mainImage,
        images: additionalImages
      };
      
      console.log("Salvando produto:", {
        id: updatedProduct.id,
        name: updatedProduct.name,
        category: updatedProduct.category,
        type: updatedProduct.type,
        imageUrl: updatedProduct.imageUrl?.substring(0, 30) + "...",
        imagesCount: updatedProduct.images?.length || 0
      });
      
      // Usando nossa nova implementação de salvamento robusta
      try {
        const savedProduct = await saveProductRobust(updatedProduct);
        console.log("✅ Produto salvo com sucesso:", savedProduct);
        
        // Atualizar a lista local
        const updatedProductsList = [...productsList];
        const existingIndex = updatedProductsList.findIndex(p => p.id === savedProduct.id);
        
        if (existingIndex >= 0) {
          updatedProductsList[existingIndex] = savedProduct;
        } else {
          updatedProductsList.push(savedProduct);
        }
        
        setProductsList(updatedProductsList);
        setFilteredProducts(updatedProductsList);
        
        // Limpar o estado
        setEditingProduct(null);
        setProductImages(['', '', '', '']);
        setIsDialogOpen(false);
        
        toast.success('Produto salvo com sucesso!');
      } catch (error) {
        console.error("❌ Erro ao salvar produto:", error);
        toast.error('Erro ao salvar o produto. Tente novamente.');
      }
    } catch (error) {
      console.error("❌ Erro ao processar imagens:", error);
      toast.error('Erro ao processar as imagens. Tente novamente.');
    }
  };
  
  const handleFieldChange = (field: keyof Product, value: any) => {
    if (!editingProduct) return;
    
    // Se estiver atualizando a categoria, atualizar o tipo automaticamente
    if (field === 'category') {
      // Normalizar o valor da categoria para garantir consistência
      const normalizedValue = normalizeCategory(value);
      console.log(`Alterando categoria para: ${normalizedValue}`);
      
      // Determinar tipo apropriado com base na categoria
      let newType: 'clothing' | 'shoes' | 'accessory';
      let newSizes: string[] = [...editingProduct.sizes];
      
      // Definir o tipo com base na categoria
      if (normalizedValue === 'calçados') {
        newType = 'shoes';
        
        // Sugerir tamanhos adequados para calçados se os tamanhos atuais não forem numéricos
        if (!newSizes.length || !newSizes.some(size => /^\d+$/.test(size))) {
          newSizes = ['38', '39', '40', '41', '42'];
        }
      } else if (normalizedValue === 'acessórios') {
        newType = 'accessory';
        
        // Sugerir "Único" para acessórios se os tamanhos atuais forem numéricos ou padrão de roupas
        if (!newSizes.length || newSizes.some(size => /^\d+$/.test(size)) || 
            (newSizes.includes('P') && newSizes.includes('M') && newSizes.includes('G'))) {
          newSizes = ['Único'];
        }
      } else {
        // Para categorias de roupas (feminino, masculino, kids)
        newType = 'clothing';
        
        // Sugerir tamanhos padrão para roupas se os tamanhos atuais forem numéricos ou "Único"
        if (!newSizes.length || newSizes.includes('Único') || newSizes.some(size => /^\d+$/.test(size))) {
          newSizes = ['P', 'M', 'G'];
        }
      }
      
      console.log(`Tipo de produto definido automaticamente: ${newType}`);
      console.log(`Tamanhos sugeridos: ${newSizes.join(', ')}`);
      
      // Atualizar o produto com a nova categoria, tipo e tamanhos sugeridos
      // IMPORTANTE: Preservar as imagens que já foram carregadas
      setEditingProduct({
        ...editingProduct,
        [field]: normalizedValue,
        type: newType,
        sizes: newSizes
      });
      
      // Não resetar o estado das imagens quando mudar a categoria
    } else {
      // Para outros campos, apenas atualizar o valor normalmente
      // IMPORTANTE: Preservar as imagens que já foram carregadas
      setEditingProduct({
        ...editingProduct,
        [field]: value
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      
      // Verificação mais estrita de tamanho - limite de 2MB para garantir melhor desempenho
      const maxSizeMB = 2;
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`A imagem é muito grande. O tamanho máximo é ${maxSizeMB}MB.`);
        toast.info('Imagens menores melhoram a performance do site.');
        return;
      }

      toast.info(`Processando imagem ${index + 1}...`, { duration: 2000 });
      console.log(`Iniciando upload da imagem ${index + 1}, tipo: ${file.type}, tamanho: ${(file.size / 1024).toFixed(2)}KB`);

      // Verificar o tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast.error(`O arquivo selecionado não é uma imagem. Tipo: ${file.type}`);
        return;
      }

      const reader = new FileReader();
      
      // Criar um timeout para interromper o processo se demorar muito
      const timeout = setTimeout(() => {
        reader.abort();
        toast.error(`Tempo limite excedido ao processar a imagem ${index + 1}.`);
      }, 15000); // 15 segundos
      
      reader.onloadend = async () => {
        try {
          // Limpar o timeout
          clearTimeout(timeout);
          
          if (!reader.result || typeof reader.result !== 'string') {
            toast.error(`Erro ao ler a imagem ${index + 1}.`);
            return;
          }
          
          console.log(`Imagem ${index + 1} carregada, comprimindo...`);
          
          // Determinar a qualidade de compressão com base no tamanho do arquivo
          const quality = file.size > 0.5 * 1024 * 1024 ? 0.4 : 0.6; // Mais compressão para arquivos maiores
          const maxWidth = file.size > 1 * 1024 * 1024 ? 600 : 800; // Menor resolução para arquivos maiores
          
          // Pre-compress image right at upload time com parâmetros ajustados
          const compressedImage = await compressImage(reader.result, quality, maxWidth);
          
          // Atualizar APENAS a imagem específica sem afetar as outras
          setProductImages(prevImages => {
            const newImages = [...prevImages];
            newImages[index] = compressedImage;
            console.log(`Imagem ${index + 1} comprimida e salva com sucesso.`);
            return newImages;
          });
          
          toast.success(`Imagem ${index + 1} carregada com sucesso!`);
        } catch (err) {
          console.error('Failed to compress image at upload time:', err);
          
          // Limpar o timeout em caso de erro
          clearTimeout(timeout);
          
          // Tentar compressão mais agressiva em caso de erro
          try {
            if (!reader.result || typeof reader.result !== 'string') {
              toast.error(`Erro ao ler a imagem ${index + 1}.`);
              return;
            }
            
            const emergencyCompressed = await compressImage(reader.result, 0.3, 400);
            setProductImages(prevImages => {
              const newImages = [...prevImages];
              newImages[index] = emergencyCompressed;
              console.log(`Imagem ${index + 1} salva com compressão de emergência.`);
              return newImages;
            });
            toast.success(`Imagem ${index + 1} carregada com compressão adicional.`);
          } catch (finalErr) {
            console.error('Erro crítico ao comprimir imagem:', finalErr);
            
            // Último recurso - usar a imagem original se estiver disponível
            if (reader.result && typeof reader.result === 'string') {
              setProductImages(prevImages => {
                const newImages = [...prevImages];
                newImages[index] = reader.result as string;
                console.log(`Imagem ${index + 1} salva sem compressão (último recurso).`);
                return newImages;
              });
              toast.warning(`Imagem ${index + 1} carregada sem compressão. O sistema pode ficar lento.`);
            } else {
              toast.error(`Não foi possível processar a imagem ${index + 1}.`);
            }
          }
        }
      };
      
      reader.onerror = (error) => {
        // Limpar o timeout em caso de erro
        clearTimeout(timeout);
        
        console.error('Erro ao ler o arquivo:', error);
        toast.error(`Erro ao processar a imagem ${index + 1}.`);
      };
      
      reader.readAsDataURL(file);
    } catch (generalError) {
      console.error('Erro geral ao carregar imagem:', generalError);
      toast.error('Ocorreu um erro ao processar a imagem. Por favor, tente novamente.');
    }
  };

  const handleRemoveImage = (index: number) => {
    console.log(`Removendo imagem do índice ${index}`);
    
    setProductImages(prevImages => {
      const newImages = [...prevImages];
      newImages[index] = '';
      console.log(`Imagem ${index + 1} removida com sucesso.`);
      return newImages;
    });
    
    toast.info(`Imagem ${index + 1} removida.`);
  };
  
  // Função para renderizar o badge de categoria com a cor apropriada
  const renderCategoryBadge = (category: string) => {
    let bgColor = "bg-gray-100";
    let textColor = "text-gray-800";
    
    switch(category.toLowerCase()) {
      case 'feminino':
        bgColor = "bg-pink-100";
        textColor = "text-pink-800";
        break;
      case 'masculino':
        bgColor = "bg-blue-100";
        textColor = "text-blue-800";
        break;
      case 'kids':
        bgColor = "bg-purple-100";
        textColor = "text-purple-800";
        break;
      case 'acessórios':
        bgColor = "bg-yellow-100";
        textColor = "text-yellow-800";
        break;
      case 'calçados':
        bgColor = "bg-green-100";
        textColor = "text-green-800";
        break;
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor} capitalize`}>
        {category}
      </span>
    );
  };
  
  // Get normalized category link
  const getNormalizedLink = (text: string): string => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  };
  
  const handleAddProduct = () => {
    setEditingProduct(newEmptyProduct());
    setIsDialogOpen(true);
  };
  
  // Função para criar um produto vazio para adicionar
  const newEmptyProduct = (): Product => {
    // Gerar um ID único baseado em timestamp
    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 1000);
    
    return {
      id: `new-${timestamp}-${randomId}`,
      name: '',
      description: '',
      price: 0,
      discount: 0,
      imageUrl: '',
      images: [],
      category: '',
      type: 'clothing',
      sizes: ['P', 'M', 'G'],
      colors: ['Preto', 'Branco'],
      stock: 10,
      featured: false,
      showOnHomepage: false,
      on_sale: false // Adicionando o campo obrigatório
    };
  };
  
  return (
    <>
      <Header />
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Painel de Administração</h1>
        
        {/* Indicador de carregamento */}
        {isLoading && (
          <div className="flex justify-center items-center h-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-3">Carregando produtos...</span>
          </div>
        )}
        
        <Tabs defaultValue="products">
          <TabsList className="mb-6">
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
            <TabsTrigger value="financial">Finanças</TabsTrigger>
            <TabsTrigger value="customers">Clientes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products" className="space-y-6">
            <Accordion type="single" collapsible defaultValue="productsList">
              <AccordionItem value="productsList">
                <AccordionTrigger className="font-bold">
                  Lista de Produtos
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex justify-between items-center mb-4">
                    <Button 
                      onClick={handleAddProduct} 
                      className="bg-shop-red hover:bg-shop-red/90 mb-2"
                    >
                      <Plus size={16} className="mr-2" />
                      Adicionar Produto
                    </Button>

                    <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                      <div className="flex items-center gap-2 mb-2">
                        <CollapsibleTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Filter size={16} className="mr-2" />
                            Filtrar por Categoria ou Link Personalizado
                          </Button>
                        </CollapsibleTrigger>
                        {selectedCategory !== 'all' && (
                          <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                            Categoria: {selectedCategory}
                          </span>
                        )}
                      </div>
                      <CollapsibleContent className="bg-gray-50 p-4 rounded-lg mb-4">
                        <div className="flex flex-wrap gap-2">
                          {categories.map(category => (
                            <Button
                              key={category}
                              variant={selectedCategory === category ? "default" : "outline"}
                              size="sm"
                              className={selectedCategory === category ? "bg-shop-red hover:bg-shop-red/90" : ""}
                              onClick={() => setSelectedCategory(category)}
                            >
                              {category === 'all' ? 'Todas' : category.charAt(0).toUpperCase() + category.slice(1)}
                            </Button>
                          ))}
                          
                          {/* Custom link filter buttons */}
                          {headerCustomLinks.filter(link => link.enabled).map((link, index) => {
                            const normalizedLink = getNormalizedLink(link.label);
                            return (
                              <Button
                                key={`custom-${index}`}
                                variant={selectedCategory === normalizedLink ? "default" : "outline"}
                                size="sm"
                                className={selectedCategory === normalizedLink ? "bg-shop-red hover:bg-shop-red/90" : ""}
                                onClick={() => setSelectedCategory(normalizedLink)}
                              >
                                {link.label}
                              </Button>
                            );
                          })}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Imagem</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Preço</TableHead>
                          <TableHead>Estoque</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">
                              {product.imageUrl && (
                                <img 
                                  src={product.imageUrl} 
                                  alt={product.name} 
                                  className="w-16 h-16 object-cover rounded"
                                />
                              )}
                            </TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>
                              <div className="flex flex-col space-y-1">
                                {renderCategoryBadge(product.category)}
                                {product.featured && (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center">
                                    <Star size={10} className="mr-1" /> Destaque
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {product.discount > 0 ? (
                                <>
                                  <span className="text-shop-red font-semibold">
                                    R$ {((product.price * (100 - product.discount)) / 100).toFixed(2)}
                                  </span>
                                  <br />
                                  <span className="text-gray-400 text-sm line-through">
                                    R$ {product.price.toFixed(2)}
                                  </span>
                                </>
                              ) : (
                                <span>R$ {product.price.toFixed(2)}</span>
                              )}
                            </TableCell>
                            <TableCell>{product.stock} unids.</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditProduct(product)}
                                >
                                  <Pencil size={16} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => handleDeleteProduct(product.id)}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
          
          <TabsContent value="settings">
            <StoreSettings />
          </TabsContent>
          
          <TabsContent value="financial">
            <FinancialManagement />
          </TabsContent>
          
          <TabsContent value="customers">
            <CustomerManagement />
          </TabsContent>
        </Tabs>
      </main>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct?.id.startsWith('new-') ? 'Novo Produto' : 'Editar Produto'}
            </DialogTitle>
            <DialogDescription>
              Complete os detalhes do produto abaixo. Todos os campos marcados com * são obrigatórios.
            </DialogDescription>
          </DialogHeader>
          
          {editingProduct && (
            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Produto*</Label>
                  <Input
                    id="name"
                    value={editingProduct.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    placeholder="Nome do produto"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria*</Label>
                  <select
                    id="category"
                    className="w-full rounded-md border border-gray-300 p-2"
                    value={editingProduct.category}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                  >
                    <option value="">Selecione uma categoria</option>
                    <optgroup label="Categorias Principais">
                      <option value="acessórios">Acessórios</option>
                      <option value="calçados">Calçados</option>
                      <option value="feminino">Feminino</option>
                      <option value="kids">Kids</option>
                      <option value="masculino">Masculino</option>
                    </optgroup>
                    
                    {headerCustomLinks.length > 0 && (
                      <optgroup label="Links Personalizados">
                        {headerCustomLinks.map((link, index) => (
                          link.enabled && (
                            <option 
                              key={`link-${index}`} 
                              value={getNormalizedLink(link.label)}
                            >
                              {link.label}
                            </option>
                          )
                        ))}
                      </optgroup>
                    )}
                    
                    {featuredCategories.length > 0 && (
                      <optgroup label="Categorias em Destaque">
                        {featuredCategories.map((category, index) => {
                          // Extract category name from the link path
                          const categoryValue = category.link.split('/').pop() || '';
                          // Only add if not already in main categories
                          const isInMainCategories = ['acessórios', 'acessorios', 'calçados', 'calcados', 'feminino', 'kids', 'masculino'].includes(categoryValue);
                          
                          return !isInMainCategories && (
                            <option 
                              key={`featured-${index}`} 
                              value={categoryValue}
                            >
                              {category.name}
                            </option>
                          );
                        })}
                      </optgroup>
                    )}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    A categoria determina onde o produto será exibido na loja e define automaticamente o tipo do produto.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço*</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingProduct.price}
                    onChange={(e) => handleFieldChange('price', parseFloat(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="discount">Desconto (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    value={editingProduct.discount}
                    onChange={(e) => handleFieldChange('discount', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stock">Estoque*</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={editingProduct.stock}
                    onChange={(e) => handleFieldChange('stock', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição*</Label>
                <Textarea
                  id="description"
                  value={editingProduct.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Descreva o produto detalhadamente"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="featured">Em Destaque</Label>
                  <div className="flex items-start">
                    <div className="flex items-center space-x-2 cursor-pointer" onClick={() => {
                      // Toggle the featured value when clicking anywhere in this div
                      handleFieldChange('featured', !editingProduct.featured);
                    }}>
                      <Checkbox
                        id="featured"
                        checked={editingProduct.featured}
                        onCheckedChange={(checked) => handleFieldChange('featured', !!checked)}
                        className={`cursor-pointer ${editingProduct.featured ? "bg-shop-red border-shop-red" : ""}`}
                      />
                      <label htmlFor="featured" className="text-sm cursor-pointer">
                        Mostrar este produto em destaque na página inicial
                      </label>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Produtos em destaque aparecem na seção "Produtos em Destaque" da página inicial.
                    Use esta opção para promover seus melhores produtos.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Tamanhos Sugeridos</Label>
                  <div className="p-2 border rounded bg-gray-50">
                    {editingProduct.type === 'clothing' && (
                      <div className="text-sm text-gray-600">
                        Sugestão para roupas: P, M, G, GG
                      </div>
                    )}
                    {editingProduct.type === 'shoes' && (
                      <div className="text-sm text-gray-600">
                        Sugestão para calçados: 34, 35, 36, 37, 38, 39, 40, 41, 42
                      </div>
                    )}
                    {editingProduct.type === 'accessory' && (
                      <div className="text-sm text-gray-600">
                        Sugestão para acessórios: Único (ou P, M, G para cintos/pulseiras)
                      </div>
                    )}
                    <div className="mt-1 text-xs text-blue-600">
                      Tipo do produto (definido automaticamente): {editingProduct.type === 'clothing' ? 'Roupa' : editingProduct.type === 'shoes' ? 'Calçado' : 'Acessório'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Promoção</Label>
                <div className="flex items-start">
                  <div className="flex items-center space-x-2 cursor-pointer" onClick={() => {
                    // Toggle the discount value when clicking anywhere in this div
                    const newDiscountValue = editingProduct.discount > 0 ? 0 : 10;
                    handleFieldChange('discount', newDiscountValue);
                  }}>
                    <Checkbox
                      id="promotion"
                      checked={editingProduct.discount > 0}
                      className="cursor-pointer"
                      onCheckedChange={(checked) => {
                        if (checked) {
                          const discountValue = editingProduct.discount === 0 ? 10 : editingProduct.discount;
                          handleFieldChange('discount', discountValue);
                        } else {
                          handleFieldChange('discount', 0);
                        }
                      }}
                    />
                    <label htmlFor="promotion" className="text-sm cursor-pointer">
                      Este produto está em promoção (aparecerá na seção "Produtos em Oferta" da página inicial)
                    </label>
                  </div>
                </div>
                
                {editingProduct.discount > 0 && (
                  <div className="mt-2">
                    <Label htmlFor="discountValue">Percentual de desconto (%)</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="discountValue"
                        type="number"
                        min="1"
                        max="99"
                        value={editingProduct.discount.toString()}
                        onChange={(e) => handleFieldChange('discount', parseInt(e.target.value) || 0)}
                        className="w-24"
                      />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <Label>Imagens do Produto*</Label>
                <p className="text-sm text-gray-500">
                  Adicione uma imagem principal e até 3 imagens adicionais para o produto.
                </p>
                
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="relative">
                      <div className={`h-32 rounded-md overflow-hidden border-2 ${index === 0 ? 'border-shop-red' : 'border-gray-200'} flex items-center justify-center bg-gray-50`}>
                        {productImages[index] ? (
                          <>
                            <img 
                              src={productImages[index]} 
                              alt={`Imagem ${index + 1}`} 
                              className="w-full h-full object-cover" 
                            />
                            <Button 
                              type="button" 
                              variant="destructive" 
                              size="sm" 
                              className="absolute top-1 right-1 w-6 h-6 p-0 rounded-full"
                              onClick={() => handleRemoveImage(index)}
                            >
                              <X size={12} />
                            </Button>
                          </>
                        ) : (
                          <div className="text-center p-2">
                            <Upload size={20} className="mx-auto text-gray-400 mb-1" />
                            <span className="text-xs text-gray-500">
                              {index === 0 ? 'Imagem principal*' : `Imagem ${index + 1}`}
                            </span>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        id={`image-upload-${index}`}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, index)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => document.getElementById(`image-upload-${index}`)?.click()}
                      >
                        <Upload size={14} className="mr-1" />
                        Upload
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sizes">Tamanhos (separados por vírgula)</Label>
                <Input
                  id="sizes"
                  value={editingProduct.sizes.join(', ')}
                  onChange={(e) => handleFieldChange('sizes', e.target.value.split(',').map(s => s.trim()))}
                  placeholder="P, M, G, GG"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Deixe em branco para produtos sem tamanhos específicos
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="colors">Cores (separadas por vírgula)</Label>
                <Input
                  id="colors"
                  value={editingProduct.colors.join(', ')}
                  onChange={(e) => handleFieldChange('colors', e.target.value.split(',').map(c => c.trim()))}
                  placeholder="Preto, Branco, Azul"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Deixe em branco para produtos sem cores específicas
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              className="bg-shop-red hover:bg-shop-red/90" 
              onClick={handleSaveProduct}
            >
              <Save size={16} className="mr-2" />
              Salvar Produto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </>
  );
};

export default AdminPage;
