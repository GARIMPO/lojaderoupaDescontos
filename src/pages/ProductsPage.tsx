import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import ProductFilter from '@/components/ProductFilter';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { getAllProducts } from '@/data/products';
import { Product } from '@/types';
import { toast } from 'sonner';

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
  } else if (normalized === 'destaque' || normalized === 'destaques' || normalized === 'featured' || normalized === 'melhores') {
    normalized = 'featured';
  }
  
  return normalized;
};

const ProductsPage = () => {
  const { category: urlCategory } = useParams<{ category: string }>();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [showFilters, setShowFilters] = useState(!isMobile);
  
  // Get search query from URL if present
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';
  
  // Estado para armazenar todos os produtos (carregados do localStorage)
  const [allProducts, setAllProducts] = useState<Product[]>([]); 
  
  // Estado para os produtos que pertencem à categoria atual (antes de filtros)
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);

  // Estado para os produtos filtrados e ordenados a serem exibidos
  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);
  
  // Filter states
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [sortBy, setSortBy] = useState('default');
  
  // Função para carregar produtos
  const loadProducts = () => {
    console.log("ProductsPage: Carregando produtos...");
    const loadedProducts = getAllProducts();
    setAllProducts(loadedProducts);
  };
  
  // Carregar produtos na montagem inicial
  useEffect(() => {
    loadProducts();
  }, []);

  // Adicionar listener para mudanças no localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Recarregar se a chave 'products' mudar
      if (e.key === 'products') {
        console.log("ProductsPage: Detectou mudança nos produtos, recarregando...");
        loadProducts();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []); // Executa apenas na montagem

  // Filtrar produtos por categoria URL ou busca quando allProducts, urlCategory ou searchQuery mudar
  useEffect(() => {
    const normalizedUrlCategory = urlCategory ? normalizeCategory(urlCategory) : '';
    let initialProducts: Product[] = [];
    
    console.log(`ProductsPage: Filtrando por categoria da URL: ${urlCategory} (normalizada: ${normalizedUrlCategory})`);
    
    // First filter by category if specified
    if (!normalizedUrlCategory) {
      initialProducts = allProducts; // Nenhuma categoria na URL, mostrar todos
    } else if (normalizedUrlCategory === 'off') {
      initialProducts = allProducts.filter(p => Number(p.discount) > 0);
    } else if (normalizedUrlCategory === 'novidades') {
      // Simples: os primeiros ou os que começam com 'new-'
      const newMarked = allProducts.filter(p => p.id.startsWith('new-'));
      initialProducts = newMarked.length > 0 ? newMarked : allProducts.slice(0, 8);
    } else if (normalizedUrlCategory === 'featured') {
      // Filtrar produtos marcados como "featured" (destaque)
      initialProducts = allProducts.filter(p => !!p.featured);
    } else {
      // Filtrar pela categoria normalizada
      initialProducts = allProducts.filter(p => normalizeCategory(p.category) === normalizedUrlCategory);
    }
    
    // Then apply search filter if present
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      initialProducts = initialProducts.filter(product => 
        product.name.toLowerCase().includes(lowercaseQuery) || 
        product.description.toLowerCase().includes(lowercaseQuery) ||
        product.category.toLowerCase().includes(lowercaseQuery)
      );
      console.log(`ProductsPage: Filtrando por busca: "${searchQuery}" (${initialProducts.length} resultados)`);
    }
    
    console.log(`ProductsPage: Encontrados ${initialProducts.length} produtos para a categoria/busca.`);
    setCategoryProducts(initialProducts);

    // Atualizar range de preço com base nos produtos da categoria
    if (initialProducts.length > 0) {
      const prices = initialProducts.map(p => 
        Number(p.discount) > 0 ? Number(p.price) * (1 - Number(p.discount) / 100) : Number(p.price)
      );
      const min = 0; // Always keep min at 0
      const max = Math.ceil(Math.max(...prices));
      setMinPrice(min);
      setMaxPrice(max);
      // Resetar o slider para o novo range apenas se ele estiver fora
      setPriceRange([0, max]); // Always start at 0
    } else {
      setMinPrice(0);
      setMaxPrice(500);
      setPriceRange([0, 500]);
    }
  }, [urlCategory, allProducts, searchQuery]);
  
  // Aplicar filtros (preço, ordenação) aos produtos da categoria
  useEffect(() => {
    let result = [...categoryProducts]; // Começa com os produtos já filtrados por categoria
    
    // Filtrar por preço
        result = result.filter(product => {
      const finalPrice = Number(product.discount) > 0 
        ? Number(product.price) * (1 - Number(product.discount) / 100) 
        : Number(product.price);
      return finalPrice >= priceRange[0] && finalPrice <= priceRange[1];
    });
    
    // Ordenar
    if (sortBy === 'price_asc') {
      result.sort((a, b) => {
        const priceA = Number(a.discount) > 0 ? Number(a.price) * (1 - Number(a.discount) / 100) : Number(a.price);
        const priceB = Number(b.discount) > 0 ? Number(b.price) * (1 - Number(b.discount) / 100) : Number(b.price);
        return priceA - priceB;
      });
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => {
        const priceA = Number(a.discount) > 0 ? Number(a.price) * (1 - Number(a.discount) / 100) : Number(a.price);
        const priceB = Number(b.discount) > 0 ? Number(b.price) * (1 - Number(b.discount) / 100) : Number(b.price);
        return priceB - priceA;
      });
    } else if (sortBy === 'discount') {
      result.sort((a, b) => Number(b.discount) - Number(a.discount));
    } else if (sortBy === 'name_asc') {
        result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name_desc') {
        result.sort((a, b) => b.name.localeCompare(a.name));
    }
    // 'default' não precisa de sort extra aqui, mantém a ordem original da categoria
    
    setDisplayProducts(result); // Atualiza os produtos a serem exibidos

  }, [categoryProducts, priceRange, sortBy]); // Depende dos produtos da categoria e dos filtros
  
  // Handlers para filtros
  const handlePriceChange = (range: [number, number]) => {
    setPriceRange(range);
  };
  
  const handleSortChange = (value: string) => {
    setSortBy(value);
  };
  
  const resetFilters = () => {
    setPriceRange([minPrice, maxPrice]);
    setSortBy('default');
  };
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Memoizar o cálculo para mostrar botão de limpar filtros
  const showClearFilters = useMemo(() => {
    return priceRange[0] !== minPrice || priceRange[1] !== maxPrice || sortBy !== 'default';
  }, [priceRange, minPrice, maxPrice, sortBy]);

  // Título da página - update to include search query
  const pageTitle = useMemo(() => {
      if (searchQuery) {
        return `Resultados para "${searchQuery}"`;
      }
      
      const normCat = urlCategory ? normalizeCategory(urlCategory) : '';
      if (normCat === 'off') return 'Produtos em Oferta';
      if (normCat === 'novidades') return 'Novidades';
      if (normCat === 'featured') return 'Produtos em Destaque';
      if (normCat) return normCat.charAt(0).toUpperCase() + normCat.slice(1);
      return 'Todos os Produtos';
  }, [urlCategory, searchQuery]);
  
  return (
    <>
      <Header />
      <main className="container px-4 mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{pageTitle}</h1>
          <p className="text-gray-600">{displayProducts.length} produtos encontrados</p>
        </div>
        
          <div className="flex flex-col md:flex-row gap-8">
          {/* Botão de Filtros Mobile */}
            {isMobile && (
            <Button 
              variant="outline" 
              className="w-full mb-4 md:hidden" 
              onClick={toggleFilters}
            >
              {showFilters ? <X size={16} className="mr-2" /> : <SlidersHorizontal size={16} className="mr-2" />}
              {showFilters ? 'Fechar Filtros' : 'Mostrar Filtros'}
                </Button>
            )}
            
          {/* Sidebar de Filtros */}
          {(showFilters || !isMobile) && (
            <aside className={`w-full md:w-64 lg:w-72 ${isMobile ? 'mb-8' : ''}`}>
                <ProductFilter 
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  priceRange={priceRange}
                  onPriceChange={handlePriceChange}
                sortBy={sortBy}
                onSortChange={handleSortChange}
                  showClearFilters={showClearFilters}
                onClearFilters={resetFilters}
                />
            </aside>
            )}
            
          {/* Grid de Produtos */}
          <section className="flex-1">
            {displayProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {displayProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                <p className="text-xl text-gray-500">Nenhum produto encontrado com os filtros aplicados.</p>
                {showClearFilters && (
                    <Button variant="link" onClick={resetFilters} className="mt-4">
                        Limpar filtros
                  </Button>
                )}
                </div>
              )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ProductsPage;
