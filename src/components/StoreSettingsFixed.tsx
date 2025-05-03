import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Save, Upload, X, User, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchStoreSettings, saveStoreSettings } from '@/lib/supabase';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Define settings interface
interface StoreSettings {
  storeName: string;
  storeNameFont: string;
  storeNameColor: string;
  storeNameSize: string;
  pageTitle: string;
  pageTitleFont: string;
  pageTitleColor: string;
  pageTitleSize: string;
  pageSubtitle: string;
  logoImage: string;
  mapLink: string;
  shareImage: string;
  footerText: string;
  deliveryInfo: string;
  showPaymentMethods: boolean;
  activePaymentMethods: {
    credit: boolean;
    debit: boolean;
    pix: boolean;
    cash: boolean;
    other: boolean;
  };
  bannerConfig: {
    imageUrl: string;
    title: string;
    subtitle: string;
    showExploreButton: boolean;
    textColor: string;
    buttonColor: string;
  };
  headerLinks: {
    novidades: boolean;
    masculino: boolean;
    feminino: boolean;
    kids: boolean;
    calcados: boolean;
    acessorios: boolean;
    off: boolean;
    customLinks: {
      label: string;
      enabled: boolean;
    }[];
  };
  headerColor: string;
  headerLinkColor: string;
  categoryHighlights: {
    enabled: boolean;
    title: string;
    categories: {
      name: string;
      image: string;
      link: string;
    }[];
  };
  socialMedia: {
    enabled: boolean;
    instagram: {
      enabled: boolean;
      url: string;
    };
    facebook: {
      enabled: boolean;
      url: string;
    };
    whatsapp: {
      enabled: boolean;
      url: string;
    };
    tiktok: {
      enabled: boolean;
      url: string;
    };
    twitter: {
      enabled: boolean;
      url: string;
    };
    website: {
      enabled: boolean;
      url: string;
    };
  };
}

// Default settings
const defaultSettings: StoreSettings = {
  storeName: 'TACO',
  storeNameFont: 'Arial, sans-serif', 
  storeNameColor: '#000000',
  storeNameSize: '24px',
  pageTitle: 'Bem-vindo à TACO',
  pageTitleFont: 'Arial, sans-serif',
  pageTitleColor: '#000000',
  pageTitleSize: '24px',
  pageSubtitle: 'Av. Paulista, 1000 - São Paulo, SP | Tel: (11) 9999-9999',
  logoImage: '',
  mapLink: 'https://maps.google.com/?q=Av.+Paulista,+1000,+São+Paulo',
  shareImage: '',
  footerText: '© 2025 TACO. Todos os direitos reservados.',
  deliveryInfo: 'Frete grátis para compras acima de R$ 199,90. Consulte o prazo estimado de entrega informando seu CEP.',
  showPaymentMethods: true,
  activePaymentMethods: {
    credit: true,
    debit: true,
    pix: true,
    cash: true,
    other: true
  },
  bannerConfig: {
    imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&auto=format&fit=crop',
    title: 'Nova Coleção 2024',
    subtitle: 'Descubra as últimas tendências em roupas e calçados para todas as estações',
    showExploreButton: true,
    textColor: '#FFFFFF',
    buttonColor: '#EF4444'
  },
  headerLinks: {
    novidades: true,
    masculino: true,
    feminino: true,
    kids: true,
    calcados: true,
    acessorios: true,
    off: true,
    customLinks: []
  },
  headerColor: '#FFFFFF',
  headerLinkColor: '#000000',
  categoryHighlights: {
    enabled: true,
    title: 'Categorias em Destaque',
    categories: [
      { 
        name: "Feminino", 
        image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop",
        link: "/products/feminino"
      },
      { 
        name: "Masculino", 
        image: "https://images.unsplash.com/photo-1617196035154-1e7e6e28b0db?w=800&auto=format&fit=crop",
        link: "/products/masculino" 
      },
      { 
        name: "Kids", 
        image: "https://images.unsplash.com/photo-1519238359922-989348752efb?w=800&auto=format&fit=crop",
        link: "/products/kids" 
      },
      { 
        name: "Acessórios", 
        image: "https://images.unsplash.com/photo-1625591341337-13156895c604?w=800&auto=format&fit=crop",
        link: "/products/acessórios" 
      }
    ]
  },
  socialMedia: {
    enabled: false,
    instagram: {
      enabled: true,
      url: 'https://instagram.com/tacoficial'
    },
    facebook: {
      enabled: true,
      url: 'https://facebook.com/tacoficial'
    },
    whatsapp: {
      enabled: true,
      url: 'https://wa.me/5521999999999'
    },
    tiktok: {
      enabled: false,
      url: 'https://tiktok.com/@tacoficial'
    },
    twitter: {
      enabled: false,
      url: 'https://twitter.com/tacoficial'
    },
    website: {
      enabled: false,
      url: 'https://taco.com.br'
    }
  }
};

// Helper function for simple deep merging (handles nested objects)
const deepMerge = (target: any, source: any): any => {
  const isObject = (item: any): boolean => item && typeof item === 'object' && !Array.isArray(item);
  
  // If both are objects, perform deep merge
  if (isObject(target) && isObject(source)) {
    const output = { ...target };
    
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        output[key] = source[key];
      }
    });
    
    return output;
  }
  
  // If not objects, return source
  return source;
};

// Helper to get stored settings with fallback to defaults
const getStoredSettings = (): StoreSettings => {
  const copy = JSON.parse(JSON.stringify(defaultSettings)); // Create a copy without type issues
  return copy;
};

const StoreSettings = () => {
  const [settings, setSettings] = useState<StoreSettings>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [logoImage, setLogoImage] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [shareImage, setShareImage] = useState<File | null>(null);
  const [sharePreview, setSharePreview] = useState<string>('');

  // Carregar configurações ao montar o componente
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        // Buscar configurações do Supabase
        const supabaseSettings = await fetchStoreSettings();
        
        if (supabaseSettings) {
          // Se encontrar no Supabase, usar essas configurações
          setSettings(supabaseSettings);
        } else {
          // Se não encontrar no Supabase, verificar em localStorage
          const storedSettings = localStorage.getItem('storeSettings');
          if (storedSettings) {
            const parsedSettings = JSON.parse(storedSettings);
            setSettings(parsedSettings);
            
            // Salvar no Supabase para sincronização
            await saveStoreSettings(parsedSettings);
          } else {
            // Se não houver configurações, iniciar com valores padrão
            const defaultSettings = {
              storeName: 'Minha Loja',
              headerLinks: {
                novidades: true,
                masculino: true,
                feminino: true,
                kids: true,
                calcados: true,
                acessorios: true,
                off: true,
                customLinks: []
              },
              // Outras configurações padrão aqui
            };
            setSettings(defaultSettings);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        toast.error('Não foi possível carregar as configurações. Verifique sua conexão.');
        
        // Usar localStorage como fallback
        try {
          const storedSettings = localStorage.getItem('storeSettings');
          if (storedSettings) {
            setSettings(JSON.parse(storedSettings));
          }
        } catch (localError) {
          console.error('Erro ao ler configurações do localStorage:', localError);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  // Função para salvar configurações
  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // Salvar no Supabase (principal)
      await saveStoreSettings(settings);
      
      // Backup no localStorage
      localStorage.setItem('storeSettings', JSON.stringify(settings));
      
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Ocorreu um erro ao salvar as configurações. Tente novamente.');
      
      // Garantir que pelo menos está salvo localmente
      localStorage.setItem('storeSettings', JSON.stringify(settings));
    } finally {
      setIsSaving(false);
    }
  };

  // Manipulador para atualizar configurações
  const handleSettingChange = (path: string, value: any) => {
    const pathParts = path.split('.');
    const newSettings = { ...settings };
    
    let current = newSettings;
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!current[pathParts[i]]) {
        current[pathParts[i]] = {};
      }
      current = current[pathParts[i]];
    }
    
    current[pathParts[pathParts.length - 1]] = value;
    setSettings(newSettings);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-3">Carregando configurações...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Configurações da Loja</h2>
        <Button 
          onClick={saveSettings} 
          disabled={isSaving}
          className="bg-shop-red hover:bg-shop-red/90"
        >
          <Save size={16} className="mr-2" />
          {isSaving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
          <TabsTrigger value="navigation">Navegação</TabsTrigger>
          <TabsTrigger value="social">Redes Sociais</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">Nome da Loja</Label>
              <Input
                id="storeName"
                value={settings.storeName || ''}
                onChange={(e) => handleSettingChange('storeName', e.target.value)}
                placeholder="Nome da sua loja"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="storeEmail">Email de Contato</Label>
              <Input
                id="storeEmail"
                value={settings.storeEmail || ''}
                onChange={(e) => handleSettingChange('storeEmail', e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="storeAddress">Endereço</Label>
            <Input
              id="storeAddress"
              value={settings.storeAddress || ''}
              onChange={(e) => handleSettingChange('storeAddress', e.target.value)}
              placeholder="Rua, número, bairro, cidade - UF"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="storePhone">Telefone</Label>
            <Input
              id="storePhone"
              value={settings.storePhone || ''}
              onChange={(e) => handleSettingChange('storePhone', e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="footerText">Texto do Rodapé</Label>
            <Textarea
              id="footerText"
              value={settings.footerText || ''}
              onChange={(e) => handleSettingChange('footerText', e.target.value)}
              placeholder="© 2024 Minha Loja - Todos os direitos reservados"
              rows={2}
            />
          </div>
        </TabsContent>
        
        {/* Outras abas e seus conteúdos aqui */}
      </Tabs>
    </div>
  );
};

export default StoreSettings; 