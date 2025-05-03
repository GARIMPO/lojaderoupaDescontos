import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { getDiscountedProducts, getFeaturedProducts } from '@/data/products';
import { Share2, Eye } from 'lucide-react';
import MetaTags from '@/components/MetaTags';

// Define settings interface
interface StoreSettings {
  storeName: string;
  pageTitle: string;
  pageTitleFont: string;
  pageTitleColor: string;
  pageTitleSize: string;
  pageSubtitle: string;
  logoImage: string;
  mapLink: string;
  shareImage: string;
  footerText: string;
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
  pageTitle: 'Bem-vindo à TACO',
  pageTitleFont: 'Arial, sans-serif',
  pageTitleColor: '#000000',
  pageTitleSize: '24px',
  pageSubtitle: 'Av. Paulista, 1000 - São Paulo, SP | Tel: (11) 9999-9999',
  logoImage: '',
  mapLink: 'https://maps.google.com/?q=Av.+Paulista,+1000,+São+Paulo',
  shareImage: '',
  footerText: 'Todos os direitos reservados',
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
    customLinks: [],
  },
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
    enabled: true,
    instagram: {
      enabled: true,
      url: "https://www.instagram.com/example",
    },
    facebook: {
      enabled: true,
      url: "https://www.facebook.com/example",
    },
    whatsapp: {
      enabled: true,
      url: "https://wa.me/5511999999999",
    },
    tiktok: {
      enabled: true,
      url: "https://www.tiktok.com/@example",
    },
    twitter: {
      enabled: true,
      url: "https://twitter.com/example",
    },
    website: {
      enabled: true,
      url: "https://www.example.com",
    },
  },
};

// Helper function for simple deep merging (handles nested objects)
const deepMerge = (target: any, source: any): any => {
  const output = { ...target };
  const isObject = (item: any): boolean => item && typeof item === 'object' && !Array.isArray(item);

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      const targetValue = target[key];
      const sourceValue = source[key];

      if (isObject(targetValue) && isObject(sourceValue)) {
        output[key] = deepMerge(targetValue, sourceValue);
      } else {
        output[key] = sourceValue;
      }
    });
    Object.keys(source).forEach(key => {
      if (!target.hasOwnProperty(key)) {
        output[key] = source[key];
      }
    });
  }

  return output;
};

// Get settings from localStorage
const getStoredSettings = (): StoreSettings => {
  let storedSettingsJson: string | null = null;
  if (typeof window !== 'undefined') {
    storedSettingsJson = localStorage.getItem('storeSettings');
  }

  if (storedSettingsJson) {
    try {
      const storedSettings = JSON.parse(storedSettingsJson);
      // Deep merge stored settings OVER the defaults
      return deepMerge(defaultSettings, storedSettings) as StoreSettings;
    } catch (e) {
      console.error('Failed to parse stored settings, using defaults.', e);
      // Fallback to defaults if parsing fails
      return { ...defaultSettings }; // Return a copy of defaults
    }
  }
  // Return defaults if nothing is stored
  return { ...defaultSettings }; // Return a copy of defaults
};

const HomeBanner = ({ settings }: { settings: StoreSettings }) => (
  <div className="relative h-[50vh] md:h-[70vh] bg-gray-100 overflow-hidden">
    <img 
      src={settings.bannerConfig.imageUrl} 
      alt={settings.bannerConfig.title} 
      className="absolute inset-0 w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/10"></div>
    <div className="absolute inset-0 flex flex-col items-start justify-center p-8 md:p-16">
      <h1 
        className="text-3xl md:text-5xl font-bold mb-4" 
        style={{ color: settings.bannerConfig.textColor || '#FFFFFF' }}
      >
        {settings.bannerConfig.title}
      </h1>
      <p 
        className="text-lg md:text-xl mb-6 max-w-md" 
        style={{ 
          color: settings.bannerConfig.textColor || '#FFFFFF',
          opacity: 0.8 
        }}
      >
        {settings.bannerConfig.subtitle}
      </p>
      {settings.bannerConfig.showExploreButton && (
        <Link to="/products/novidades">
          <Button 
            className="text-white hover:opacity-90"
            style={{ backgroundColor: settings.bannerConfig.buttonColor || '#EF4444' }}
          >
            Novidades
          </Button>
        </Link>
      )}
    </div>
  </div>
);

const CategoryHighlights = ({ settings }: { settings: StoreSettings }) => {
  // Não exibir o componente se a seção estiver desabilitada nas configurações
  if (!settings.categoryHighlights.enabled) return null;
  
  return (
    <div className="py-12">
      <div className="container px-4 mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">{settings.categoryHighlights.title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {settings.categoryHighlights.categories.map((category, index) => (
            <Link 
              key={index} 
              to={category.link}
              className="relative group h-40 md:h-60 overflow-hidden rounded-lg"
            >
              <img 
                src={category.image} 
                alt={category.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <h3 className="text-white font-semibold text-lg md:text-xl">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper function to format the subtitle with WhatsApp links
const formatSubtitleWithWhatsApp = (subtitle: string): React.ReactNode => {
  // Regular expression to find phone numbers in various formats
  const phoneRegex = /(\(?\d{2}\)?\s*)?(\d{4,5}[-\s]?\d{4})/g;
  
  if (!phoneRegex.test(subtitle)) {
    return subtitle;
  }
  
  // Reset the regex to use it again
  phoneRegex.lastIndex = 0;
  
  const parts: Array<string | JSX.Element> = [];
  let lastIndex = 0;
  let match;
  
  while ((match = phoneRegex.exec(subtitle)) !== null) {
    // Add the text before the match
    if (match.index > lastIndex) {
      parts.push(subtitle.substring(lastIndex, match.index));
    }
    
    // Extract the phone number
    const fullMatch = match[0];
    const areaCode = match[1] ? match[1].replace(/\D/g, '') : '';
    const number = match[2].replace(/\D/g, '');
    
    // Format the WhatsApp link
    const whatsappNumber = `55${areaCode}${number}`;
    const whatsappLink = `https://wa.me/${whatsappNumber}`;
    
    // Add the clickable phone link
    parts.push(
      <a 
        key={match.index} 
        href={whatsappLink} 
        target="_blank" 
        rel="noopener noreferrer"
        className="hover:underline"
        style={{ color: 'inherit' }}
      >
        {fullMatch}
      </a>
    );
    
    lastIndex = match.index + fullMatch.length;
  }
  
  // Add any remaining text
  if (lastIndex < subtitle.length) {
    parts.push(subtitle.substring(lastIndex));
  }
  
  return parts;
};

const Index = () => {
  // Get discounted products for the sale section
  const discountedProducts = getDiscountedProducts();
  // Get featured products to display in the featured section
  const featuredProducts = getFeaturedProducts();
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  
  useEffect(() => {
    // Load settings from localStorage
    setSettings(getStoredSettings());
    
    // Listen for settings changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'storeSettings') {
        try {
          const newSettings = e.newValue ? JSON.parse(e.newValue) : defaultSettings;
          setSettings(newSettings);
        } catch (e) {
          console.error('Failed to parse updated settings', e);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  return (
    <>
      <MetaTags 
        title={settings.pageTitle || settings.storeName}
        description={settings.pageSubtitle || 'Confira nossa loja online'}
        image={settings.shareImage || ''}
      />
      
      <Header />
      
      {/* Store Info Section */}
      {(settings.pageTitle || settings.pageSubtitle) && (
        <div className="py-6 bg-white border-b">
          <div className="container px-4 mx-auto text-center">
            {settings.pageTitle && (
              <h1 
                className="text-2xl font-medium"
                style={{ 
                  fontFamily: settings.pageTitleFont || 'Arial, sans-serif',
                  color: settings.pageTitleColor || '#000000',
                  fontSize: settings.pageTitleSize || '24px'
                }}
              >
                {settings.pageTitle}
              </h1>
            )}
            
            {/* Display logo image if available */}
            {settings.logoImage && (
              <div className="mt-4 mb-4 flex justify-center">
                <img 
                  src={settings.logoImage} 
                  alt="Logo da loja" 
                  className="w-[150px] h-[150px] object-contain"
                />
              </div>
            )}
            
            {settings.pageSubtitle && (
              <p 
                className="mt-2"
                style={{ 
                  color: settings.pageTitleColor || '#000000'
                }}
              >
                {formatSubtitleWithWhatsApp(settings.pageSubtitle)}
              </p>
            )}
            {settings.mapLink && (
              <div className="flex flex-col items-center gap-2">
                <a 
                  href={settings.mapLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs mt-1 inline-block hover:underline"
                  style={{ 
                    color: settings.pageTitleColor || '#000000'
                  }}
                >
                  Ver mapa
                </a>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: settings.storeName,
                        text: 'Confira nossa loja!',
                        url: window.location.href,
                      }).catch(console.error);
                    } else {
                      navigator.clipboard.writeText(window.location.href).then(() => {
                        alert('Link copiado para a área de transferência!');
                      }).catch(console.error);
                    }
                  }}
                  className="text-xs inline-flex items-center gap-1 hover:underline"
                  style={{ 
                    color: settings.pageTitleColor || '#000000'
                  }}
                >
                  <Share2 size={12} />
                  Compartilhar loja
                </button>
                <button
                  onClick={() => {
                    const footer = document.querySelector('footer');
                    if (footer) {
                      footer.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="text-xs inline-flex items-center gap-1 hover:underline"
                  style={{ 
                    color: settings.pageTitleColor || '#000000'
                  }}
                >
                  <Eye size={12} />
                  Ver Redes Sociais
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      <main>
        <HomeBanner settings={settings} />
        
        <CategoryHighlights settings={settings} />
        
        {/* Featured Products Section */}
        <div className="py-12">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">Produtos em Destaque</h2>
              <p className="text-gray-600 mt-2">Conheça nossos produtos mais populares</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.slice(0, 4).map((product) => (
                <Link 
                  key={product.id} 
                  to={`/product/${product.id}`}
                  className="group relative overflow-hidden bg-white rounded-md transition-all duration-300 hover:shadow-lg"
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" 
                    />
                    {product.discount > 0 && (
                      <div className="absolute top-2 right-2 bg-shop-red text-white text-sm px-2 py-1 rounded">
                        -{product.discount}%
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium">{product.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      {product.discount > 0 ? (
                        <>
                          <span className="text-shop-red font-semibold">
                            R$ {((product.price * (100 - product.discount)) / 100).toFixed(2)}
                          </span>
                          <span className="text-gray-400 text-sm line-through">
                            R$ {product.price.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="font-semibold">R$ {product.price.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/products/featured">
                <Button variant="outline" className="border-shop-red text-shop-red hover:bg-shop-red hover:text-white">
                  Ver Todos os Destaques
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Discount Products Section */}
        <div className="bg-shop-light-gray py-12">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">Produtos em Oferta</h2>
              <p className="text-gray-600 mt-2">Aproveite as melhores promoções com até 50% OFF</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {discountedProducts.slice(0, 4).map((product) => (
                <Link 
                  key={product.id} 
                  to={`/product/${product.id}`}
                  className="group relative overflow-hidden bg-white rounded-md transition-all duration-300 hover:shadow-lg"
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" 
                    />
                    <div className="absolute top-2 right-2 bg-shop-red text-white text-sm px-2 py-1 rounded">
                      -{product.discount}%
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium">{product.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-shop-red font-semibold">
                        R$ {((product.price * (100 - product.discount)) / 100).toFixed(2)}
                      </span>
                      <span className="text-gray-400 text-sm line-through">
                        R$ {product.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/products/off">
                <Button variant="outline" className="border-shop-red text-shop-red hover:bg-shop-red hover:text-white">
                  Ver Todas as Ofertas
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default Index;
