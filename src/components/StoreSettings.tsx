import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Save, Upload, X, User, ShoppingCart } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { toast as showToast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { uploadImage, fetchStoreSettings, saveStoreSettings } from '@/lib/supabase';

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
  storeEmail?: string;
  storeAddress?: string;
  storePhone?: string;
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
  const output = { ...target }; // Start with target's properties
  // Check if both target and source are actual objects (not arrays or null)
  const isObject = (item: any): boolean => item && typeof item === 'object' && !Array.isArray(item);

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      const targetValue = target[key];
      const sourceValue = source[key];

      if (isObject(targetValue) && isObject(sourceValue)) {
        // If both values are objects, recursively merge them
        output[key] = deepMerge(targetValue, sourceValue);
      } else {
        // Otherwise, source value overwrites target value (including primitives, arrays, null)
        output[key] = sourceValue;
      }
    });
  }
  // Add keys from source that are not in target
  Object.keys(source).forEach(key => {
    if (!target.hasOwnProperty(key)) {
       output[key] = source[key];
    }
  });

  return output;
};

// Try to load settings from localStorage on app initialization
const getStoredSettings = (): StoreSettings => {
  let storedSettingsJson: string | null = null;
  if (typeof window !== 'undefined') {
    storedSettingsJson = localStorage.getItem('storeSettings');
  }

  if (storedSettingsJson) {
    try {
      const storedSettings = JSON.parse(storedSettingsJson);
      // Deep merge stored settings OVER the defaults
      // This ensures all default keys are present, and stored values override them
      return deepMerge(defaultSettings, storedSettings) as StoreSettings;
    } catch (e) {
      console.error('Failed to parse stored settings, using defaults.', e);
      // Fallback to defaults if parsing fails
      const copy = JSON.parse(JSON.stringify(defaultSettings)); // Create a copy without type issues
      return copy;
    }
  }
  // Return defaults if nothing is stored
  const copy = JSON.parse(JSON.stringify(defaultSettings)); // Create a copy without type issues
  return copy;
};

const StoreSettings = () => {
  const [settings, setSettings] = useState<StoreSettings>(getStoredSettings());
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
            const defaultSettings = getStoredSettings();
            setSettings(defaultSettings);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        showToast('Não foi possível carregar as configurações');
        
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
      // Copia das configurações para não modificar o estado diretamente
      const settingsCopy = { ...settings };
      
      // Faz upload das imagens, se houver
      if (logoImage) {
        console.log('Fazendo upload da imagem do logo...');
        const logoUrl = await uploadImage(logoImage, 'logo');
        if (logoUrl) settingsCopy.logoImage = logoUrl;
      }
      
      if (bannerImage && settingsCopy.bannerConfig) {
        console.log('Fazendo upload da imagem do banner...');
        const bannerUrl = await uploadImage(bannerImage, 'banners');
        if (bannerUrl) {
          settingsCopy.bannerConfig = {
            ...settingsCopy.bannerConfig,
            imageUrl: bannerUrl
          };
        }
      }
      
      if (shareImage) {
        console.log('Fazendo upload da imagem de compartilhamento...');
        const shareUrl = await uploadImage(shareImage, 'share');
        if (shareUrl) settingsCopy.shareImage = shareUrl;
      }
      
      // Salvar no Supabase
      console.log('Salvando configurações no Supabase...');
      await saveStoreSettings(settingsCopy);
      
      // Atualizar o estado com as URLs permanentes
      setSettings(settingsCopy);
      
      // Backup no localStorage
      localStorage.setItem('storeSettings', JSON.stringify(settingsCopy));
      
      showToast('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      showToast('Erro ao salvar configurações');
      
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

  // Manipulador para upload de imagem do logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Fazer upload da logo
        const logoUrl = await uploadImage(file, 'logo');
        
        // Atualizar o estado
        if (logoUrl) {
          setSettings(prev => ({ ...prev, logoImage: logoUrl }));
          showToast.success('Logo enviado com sucesso!');
        }
      } catch (error) {
        console.error('Erro ao enviar logo:', error);
        showToast.error('Erro ao enviar logo. Tente novamente.');
      }
    }
  };

  // Manipulador para upload de imagem do banner
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Fazer upload do banner
        const bannerUrl = await uploadImage(file, 'banners');
        
        // Atualizar o estado
        if (bannerUrl && settings.bannerConfig) {
          setSettings(prev => ({
            ...prev,
            bannerConfig: { ...prev.bannerConfig, imageUrl: bannerUrl }
          }));
          showToast.success('Banner enviado com sucesso!');
        }
      } catch (error) {
        console.error('Erro ao enviar banner:', error);
        showToast.error('Erro ao enviar banner. Tente novamente.');
      }
    }
  };

  // Manipulador para upload de imagem de compartilhamento
  const handleShareImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Fazer upload da imagem de compartilhamento
        const shareUrl = await uploadImage(file, 'share');
        
        // Atualizar o estado
        if (shareUrl) {
          setSettings(prev => ({ ...prev, shareImage: shareUrl }));
          showToast.success('Imagem de compartilhamento enviada com sucesso!');
        }
      } catch (error) {
        console.error('Erro ao enviar imagem de compartilhamento:', error);
        showToast.error('Erro ao enviar imagem. Tente novamente.');
      }
    }
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
        
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logo e Imagens</CardTitle>
              <CardDescription>Configure o logo e as imagens da sua loja</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logoUpload">Logo da Loja</Label>
                <div className="flex items-center gap-4">
                  {(logoPreview || settings.logoImage) && (
                    <div className="relative w-24 h-24 border rounded">
                      <img 
                        src={logoPreview || settings.logoImage} 
                        alt="Logo preview" 
                        className="object-contain w-full h-full"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 w-6 h-6 rounded-full bg-red-500 text-white"
                        onClick={() => {
                          setLogoImage(null);
                          setLogoPreview('');
                          handleSettingChange('logoImage', '');
                        }}
                      >
                        <X size={12} />
                      </Button>
                    </div>
                  )}
                  
                  <div>
                    <Input
                      id="logoUpload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('logoUpload')?.click()}
                    >
                      <Upload size={16} className="mr-2" />
                      Enviar Logo
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bannerUpload">Imagem do Banner</Label>
                <div className="flex items-center gap-4">
                  {(bannerPreview || (settings.bannerConfig && settings.bannerConfig.imageUrl)) && (
                    <div className="relative w-48 h-24 border rounded">
                      <img 
                        src={bannerPreview || (settings.bannerConfig && settings.bannerConfig.imageUrl)} 
                        alt="Banner preview" 
                        className="object-cover w-full h-full"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 w-6 h-6 rounded-full bg-red-500 text-white"
                        onClick={() => {
                          setBannerImage(null);
                          setBannerPreview('');
                          if (settings.bannerConfig) {
                            const newBanner = {...settings.bannerConfig, imageUrl: ''};
                            handleSettingChange('bannerConfig', newBanner);
                          }
                        }}
                      >
                        <X size={12} />
                      </Button>
                    </div>
                  )}
                  
                  <div>
                    <Input
                      id="bannerUpload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleBannerUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('bannerUpload')?.click()}
                    >
                      <Upload size={16} className="mr-2" />
                      Enviar Banner
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Outras abas e seus conteúdos aqui */}
      </Tabs>
    </div>
  );
};

export default StoreSettings;
