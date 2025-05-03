import React, { useState, useEffect } from 'react';
// Importar todos os ícones de um único arquivo para evitar problemas de carregamento
import { 
  FaInstagram, 
  FaFacebookF, 
  FaWhatsapp, 
  FaGlobe 
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

// Interface para as configurações da loja
interface SocialMedia {
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
}

interface StoreSettings {
  footerText: string;
  socialMedia: SocialMedia;
}

// Default settings for the footer part
const defaultFooterSettings: Pick<StoreSettings, 'footerText' | 'socialMedia'> = {
  footerText: '© 2025 TACO. Todos os direitos reservados.',
  socialMedia: {
    enabled: false,
    instagram: { enabled: true, url: '#' },
    facebook: { enabled: true, url: '#' },
    whatsapp: { enabled: true, url: '#' },
    tiktok: { enabled: false, url: '#' },
    twitter: { enabled: false, url: '#' },
    website: { enabled: false, url: '#' },
  }
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

const Footer = () => {
  const [footerText, setFooterText] = useState(defaultFooterSettings.footerText);
  const [socialMedia, setSocialMedia] = useState<SocialMedia>(defaultFooterSettings.socialMedia);

  useEffect(() => {
    // Function to load and merge settings specifically for the footer
    const loadFooterSettings = () => {
      let mergedSettings = { ...defaultFooterSettings }; // Start with defaults
      
      if (typeof window !== 'undefined') {
        const storedSettingsJson = localStorage.getItem('storeSettings');
        if (storedSettingsJson) {
          try {
            const storedSettings = JSON.parse(storedSettingsJson);
            // Selectively merge only the relevant parts (footerText, socialMedia)
            const relevantStoredSettings = {
              footerText: storedSettings.footerText,
              socialMedia: storedSettings.socialMedia,
            };
            // Merge stored relevant settings over the defaults
            mergedSettings = deepMerge(mergedSettings, relevantStoredSettings);
          } catch (e) {
            console.error('Failed to parse stored settings for footer, using defaults.', e);
            // Keep mergedSettings as defaults in case of error
          }
        }
      }
      
      // Update state with the potentially merged settings
      setFooterText(mergedSettings.footerText || defaultFooterSettings.footerText);
      setSocialMedia(mergedSettings.socialMedia || defaultFooterSettings.socialMedia);
    };

    // Load on initial mount
    loadFooterSettings();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'storeSettings') {
        loadFooterSettings(); // Reload and merge settings on change
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Tamanho dos ícones
  const iconSize = 32;

  // Renderizar ícones de redes sociais
  const renderSocialIcons = () => {
    if (!socialMedia || !socialMedia.enabled) return null;

    return (
      <div className="flex justify-center space-x-8 mt-4">
        {socialMedia.instagram.enabled && (
          <a 
            href={socialMedia.instagram.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-pink-600 transition-colors"
            title="Instagram"
          >
            <FaInstagram size={iconSize} />
          </a>
        )}
        
        {socialMedia.facebook.enabled && (
          <a 
            href={socialMedia.facebook.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-blue-600 transition-colors"
            title="Facebook"
          >
            <FaFacebookF size={iconSize} />
          </a>
        )}
        
        {socialMedia.twitter.enabled && (
          <a 
            href={socialMedia.twitter.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-black transition-colors"
            title="Twitter/X"
          >
            <FaXTwitter size={iconSize} />
          </a>
        )}
        
        {socialMedia.whatsapp.enabled && (
          <a 
            href={socialMedia.whatsapp.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-green-500 transition-colors"
            title="WhatsApp"
          >
            <FaWhatsapp size={iconSize} />
          </a>
        )}
        
        {socialMedia.website.enabled && (
          <a 
            href={socialMedia.website.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-teal-500 transition-colors"
            title="Website"
          >
            <FaGlobe size={iconSize} />
          </a>
        )}
      </div>
    );
  };

  return (
    <footer className="bg-gray-100 py-8">
      <div className="container px-4 mx-auto">
        <div className="text-center text-sm text-gray-500">
          {socialMedia && socialMedia.enabled && (
            <div className="mb-6">
              <h4 className="text-base font-semibold mb-3">Siga-nos nas redes sociais</h4>
              {renderSocialIcons()}
            </div>
          )}
          <p dangerouslySetInnerHTML={{ __html: footerText }} />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
