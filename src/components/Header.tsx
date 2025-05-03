import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, User, LogOut, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useCart } from '../contexts/CartContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Product } from '@/types';
import { getAllProducts } from '@/data/products';
import { useAuth } from '@/contexts/AuthContext';

// Define settings interface
interface StoreSettings {
  storeName: string;
  bannerConfig: {
    imageUrl: string;
    title: string;
    subtitle: string;
    showExploreButton: boolean;
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
  storeNameFont?: string;
  storeNameColor?: string;
  headerColor?: string;
  headerLinkColor?: string;
}

// Default settings
const defaultSettings: StoreSettings = {
  storeName: 'TACO',
  bannerConfig: {
    imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&auto=format&fit=crop',
    title: 'Nova Coleção 2024',
    subtitle: 'Descubra as últimas tendências em roupas e calçados para todas as estações',
    showExploreButton: true,
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
  storeNameFont: 'Arial',
  storeNameColor: '#000000',
  headerColor: '#FFFFFF',
  headerLinkColor: '#000000'
};

// Helper function for simple deep merging (you might already have this)
const deepMerge = (target: any, source: any): any => {
  // Implementation as added previously
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

// Get settings from localStorage using deep merge
const getStoredSettings = (): StoreSettings => {
  let storedSettingsJson: string | null = null;
  if (typeof window !== 'undefined') {
    storedSettingsJson = localStorage.getItem('storeSettings');
  }

  if (storedSettingsJson) {
    try {
      const storedSettings = JSON.parse(storedSettingsJson);
      // Ensure defaultSettings includes all necessary keys, including socialMedia etc.
      // You might need to update defaultSettings definition if it's incomplete here.
      const completeDefaultSettings = { 
        /* ... include all default properties like storeName, bannerConfig, headerLinks, footerText, categoryHighlights, socialMedia ... */ 
        ...defaultSettings // Assuming defaultSettings is complete
      };
      return deepMerge(completeDefaultSettings, storedSettings) as StoreSettings;
      } catch (e) {
      console.error('Failed to parse stored settings in Header, using defaults.', e);
      return { ...defaultSettings }; 
    }
  }
  return { ...defaultSettings }; 
};

// Function to convert text to URL-friendly format
const normalizeForUrl = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cart } = useCart();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState<StoreSettings>(() => getStoredSettings()); // Load settings initially
  const location = useLocation(); // Get current location
  const navigate = useNavigate(); // For navigation
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // New state for search results
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  
  const { user, signOut } = useAuth();
  
  // Load products on component mount
  useEffect(() => {
    const products = getAllProducts();
    setAllProducts(products);
  }, []);
  
  // Filter products based on search query
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filteredProducts = allProducts.filter(product => 
        product.name.toLowerCase().includes(lowercaseQuery) || 
        product.description.toLowerCase().includes(lowercaseQuery) ||
        product.category.toLowerCase().includes(lowercaseQuery)
      );
      setSearchResults(filteredProducts.slice(0, 5)); // Limit to 5 results
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery, allProducts]);
  
  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchResultsRef.current && 
        searchInputRef.current && 
        !searchResultsRef.current.contains(event.target as Node) &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    // Listen for settings changes from localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'storeSettings') {
        console.log("Header detected settings change, reloading..."); // Debug log
        setSettings(getStoredSettings()); // Reload settings using the robust function
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Cleanup listener on component unmount
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []); // Empty dependency array ensures this runs only once on mount for the listener setup

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to products page with search query
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearchResults(false);
    }
  };
  
  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const getLinkClass = (path: string) => {
    // Check if the current location pathname starts with the link's path
    // Using startsWith allows matching for nested routes (e.g., /products/feminino should match /products)
    // Exact match for '/' homepage
    
    // Decode URI components to handle special characters like "ç" in "calçados"
    const decodedPath = decodeURIComponent(path.toLowerCase());
    const decodedLocationPath = decodeURIComponent(location.pathname.toLowerCase());
    
    const isActive = path === '/' 
      ? decodedLocationPath === decodedPath 
      : decodedLocationPath.startsWith(decodedPath);
      
    return isActive
      ? 'px-1 py-1 font-semibold underline-offset-4 underline' // Active style without color
      : 'px-1 py-1 hover:underline'; // Default style without color
  };
  
  const getMobileLinkClass = (path: string) => {
    // Decode URI components to handle special characters like "ç" in "calçados"
    const decodedPath = decodeURIComponent(path.toLowerCase());
    const decodedLocationPath = decodeURIComponent(location.pathname.toLowerCase());
    
    const isActive = path === '/' 
      ? decodedLocationPath === decodedPath 
      : decodedLocationPath.startsWith(decodedPath);
      
    return isActive
      ? 'block px-2 py-1 font-semibold underline-offset-4 underline' // Active mobile style without color
      : 'block px-2 py-1 hover:underline'; // Default mobile style without color
  };

  // Ensure settings and headerLinks exist before trying to access them
  const headerLinks = settings?.headerLinks || defaultSettings.headerLinks;

  return (
    <>
      <div className="sticky top-0 z-50">
        <header 
          className="border-b border-gray-200"
          style={{ backgroundColor: settings?.headerColor || defaultSettings.headerColor }}
        >
          <div className="container px-4 mx-auto">
            <div className="flex items-center justify-between min-h-14 md:min-h-16 py-2">
              {/* Logo */}
              <Link to="/" className="flex items-center">
                <span 
                  className="text-2xl md:text-3xl font-bold" 
                  style={{ 
                    fontFamily: settings?.storeNameFont || defaultSettings.storeNameFont,
                    color: settings?.storeNameColor || defaultSettings.storeNameColor
                  }}
                >
                  {settings?.storeName || defaultSettings.storeName}
                </span>
              </Link>

              {/* Mobile Menu Button */}
              <div className="flex md:hidden">
                <Button
                  onClick={toggleMenu}
                  variant="ghost"
                  size="sm"
                  className="p-1 mr-2"
                  style={{ color: settings?.headerLinkColor || defaultSettings.headerLinkColor }}
                >
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </Button>
                <Link to="/cart" className="relative p-1" style={{ color: settings?.headerLinkColor || defaultSettings.headerLinkColor }}>
                  <ShoppingCart size={24} />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 text-xs text-white bg-shop-red rounded-full flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex md:flex-1 md:justify-center">
                <ul className="flex flex-wrap justify-center gap-3 text-sm max-w-full" style={{ color: settings?.headerLinkColor || defaultSettings.headerLinkColor }}>
                  {headerLinks.novidades && 
                    <li><Link to="/products/novidades" className={getLinkClass("/products/novidades")} style={{ color: settings?.headerLinkColor || defaultSettings.headerLinkColor }}>Novidades</Link></li>
                  }
                  {headerLinks.masculino && 
                    <li><Link to="/products/masculino" className={getLinkClass("/products/masculino")} style={{ color: settings?.headerLinkColor || defaultSettings.headerLinkColor }}>Masculino</Link></li>
                  }
                  {headerLinks.feminino && 
                    <li><Link to="/products/feminino" className={getLinkClass("/products/feminino")} style={{ color: settings?.headerLinkColor || defaultSettings.headerLinkColor }}>Feminino</Link></li>
                  }
                  {headerLinks.kids && 
                    <li><Link to="/products/kids" className={getLinkClass("/products/kids")} style={{ color: settings?.headerLinkColor || defaultSettings.headerLinkColor }}>Kids</Link></li>
                  }
                  {headerLinks.calcados && 
                    <li><Link to="/products/calçados" className={getLinkClass("/products/calçados")} style={{ color: settings?.headerLinkColor || defaultSettings.headerLinkColor }}>Calçados</Link></li>
                  }
                  {headerLinks.acessorios && 
                    <li><Link to="/products/acessórios" className={getLinkClass("/products/acessórios")} style={{ color: settings?.headerLinkColor || defaultSettings.headerLinkColor }}>Acessórios</Link></li>
                  }
                  {headerLinks.off && 
                    <li><Link to="/products/off" className={`${getLinkClass("/products/off")} font-semibold`} style={{ color: settings?.headerLinkColor || defaultSettings.headerLinkColor }}>OFF</Link></li>
                  }
                  {headerLinks.customLinks && headerLinks.customLinks.map((link, index) => (
                    link.enabled && (
                      <li key={`custom-${index}`}>
                        <Link 
                          to={`/products/${normalizeForUrl(link.label)}`}
                          className={getLinkClass(`/products/${normalizeForUrl(link.label)}`)}
                          style={{ color: settings?.headerLinkColor || defaultSettings.headerLinkColor }}
                        >
                          {link.label}
                        </Link>
                      </li>
                    )
                  ))}
                </ul>
              </nav>

              {/* Desktop Account, Admin, and Cart */}
              <div className="hidden md:flex items-center space-x-2">
                {user ? (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Link to="/admin">
                        <Settings size={20} />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={signOut}
                      className="text-red-600 hover:text-red-800"
                    >
                      <LogOut size={20} />
                    </Button>
                  </div>
                ) : (
                  <Button variant="ghost" size="icon" asChild>
                    <Link to="/login">
                      <User size={20} />
                    </Link>
                  </Button>
                )}
                <Link to="/cart" className="p-1 relative hover:text-shop-red" style={{ color: settings?.headerLinkColor || defaultSettings.headerLinkColor }}>
                  <ShoppingCart size={20} />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 text-xs text-white bg-shop-red rounded-full flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Menu - Directly below header, still within sticky container */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 border-b border-gray-200 ${isMenuOpen ? 'max-h-96' : 'max-h-0'}`}
          style={{ backgroundColor: settings?.headerColor || defaultSettings.headerColor }}
        >
          <nav className="container mx-auto">
            <ul className="flex flex-col space-y-3 p-4">
              {headerLinks.novidades && 
                <li><Link to="/products/novidades" className={getMobileLinkClass("/products/novidades")} onClick={toggleMenu} style={{ color: settings?.headerLinkColor || defaultSettings.headerLinkColor }}>Novidades</Link></li>
              }
              {headerLinks.masculino && 
                <li><Link to="/products/masculino" className={getMobileLinkClass("/products/masculino")} onClick={toggleMenu} style={{ color: settings?.headerLinkColor || defaultSettings.headerLinkColor }}>Masculino</Link></li>
              }
              {headerLinks.feminino && 
                <li><Link to="/products/feminino" className={getMobileLinkClass("/products/feminino")} onClick={toggleMenu} style={{ color: settings?.headerLinkColor || defaultSettings.headerLinkColor }}>Feminino</Link></li>
              }
              {headerLinks.kids && 
                <li><Link to="/products/kids" className={getMobileLinkClass("/products/kids")} onClick={toggleMenu} style={{ color: settings?.headerLinkColor || defaultSettings.headerLinkColor }}>Kids</Link></li>
              }
              {headerLinks.calcados && 
                <li><Link to="/products/calçados" className={getMobileLinkClass("/products/calçados")} onClick={toggleMenu} style={{ color: settings?.headerLinkColor || defaultSettings.headerLinkColor }}>Calçados</Link></li>
              }
              {headerLinks.acessorios && 
                <li><Link to="/products/acessórios" className={getMobileLinkClass("/products/acessórios")} onClick={toggleMenu} style={{ color: settings?.headerLinkColor || defaultSettings.headerLinkColor }}>Acessórios</Link></li>
              }
              {headerLinks.off && 
                <li><Link to="/products/off" className={`${getMobileLinkClass("/products/off")} font-semibold`} onClick={toggleMenu} style={{ color: settings?.headerLinkColor || defaultSettings.headerLinkColor }}>OFF</Link></li>
              }
              {headerLinks.customLinks && headerLinks.customLinks.map((link, index) => (
                link.enabled && (
                  <li key={`mobile-custom-${index}`}>
                    <Link 
                      to={`/products/${normalizeForUrl(link.label)}`}
                      className={getMobileLinkClass(`/products/${normalizeForUrl(link.label)}`)}
                      onClick={toggleMenu}
                      style={{ color: settings?.headerLinkColor || defaultSettings.headerLinkColor }}
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              ))}
              <li><Button
                variant="ghost"
                size="sm"
                asChild
                className="flex items-center justify-start px-2"
              >
                {user ? (
                  <div className="flex items-center justify-between w-full">
                    <Link to="/admin" className="flex items-center" onClick={toggleMenu}>
                      <Settings size={16} className="mr-2" />
                      <span>Painel Admin</span>
                    </Link>
                    <div onClick={signOut} className="flex items-center text-red-600">
                      <LogOut size={16} className="mr-2" />
                      <span>Sair</span>
                    </div>
                  </div>
                ) : (
                  <Link to="/login" className="flex items-center">
                    <User size={16} className="mr-2" />
                    <span>Login</span>
                  </Link>
                )}
              </Button></li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Search Bar - Below Header for Desktop and Mobile */}
      <div className="bg-gray-100 py-2 border-b border-gray-200">
        <div className="container px-4 mx-auto">
          <form onSubmit={handleSearch} className="flex items-center justify-center">
            <div className="relative w-full max-w-md">
              <Input
                ref={searchInputRef}
                type="search"
                placeholder="O que você procura?"
                className="pl-3 pr-10 py-1 rounded-full border-gray-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
              />
              <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Search className="h-4 w-4 text-gray-400" />
              </button>
              
              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div 
                  ref={searchResultsRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-50 max-h-[400px] overflow-y-auto"
                >
                  <ul className="divide-y divide-gray-100">
                    {searchResults.map(product => (
                      <li 
                        key={product.id}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleProductClick(product.id)}
                      >
                        <div className="flex items-center p-3">
                          <div className="w-16 h-16 rounded bg-gray-100 mr-3 overflow-hidden flex-shrink-0">
                            <img 
                              src={product.imageUrl} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/160?text=Imagem+não+encontrada';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">{product.name}</h4>
                            <p className="text-xs text-gray-500 mt-1 truncate">{product.category}</p>
                            <div className="flex items-center mt-1">
                              {product.discount > 0 ? (
                                <>
                                  <span className="text-xs font-medium text-shop-red">
                                    R$ {(product.price * (1 - product.discount / 100)).toFixed(2)}
                                  </span>
                                  <span className="text-xs text-gray-400 line-through ml-2">
                                    R$ {product.price.toFixed(2)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-xs font-medium">
                                  R$ {product.price.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                    
                    {/* View All Results Link */}
                    <li className="hover:bg-gray-50 cursor-pointer transition-colors">
                      <div 
                        className="p-3 text-center text-sm text-shop-red font-medium"
                        onClick={() => {
                          navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                          setSearchQuery('');
                          setShowSearchResults(false);
                        }}
                      >
                        Ver todos os resultados
                      </div>
                    </li>
                  </ul>
                </div>
              )}
              
              {/* No results message */}
              {showSearchResults && searchQuery.trim().length > 1 && searchResults.length === 0 && (
                <div 
                  ref={searchResultsRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-50 p-4 text-center"
                >
                  <p className="text-sm text-gray-500">Nenhum produto encontrado para "{searchQuery}"</p>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Header;
