import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from '@/data/products';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ProductGallery } from '@/components/ProductGallery';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Heart, ShoppingCart, Share2, Truck } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { Product } from '@/types';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const { addToCart } = useCart();
  
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  
  useEffect(() => {
    // Try to find the product in localStorage first
    try {
      const storedProducts = localStorage.getItem('products');
      if (storedProducts && id) {
        try {
          const parsedProducts: Product[] = JSON.parse(storedProducts);
          if (Array.isArray(parsedProducts)) {
            const foundProduct = parsedProducts.find(p => p.id === id);
            if (foundProduct) {
              console.log('Produto encontrado no localStorage:', foundProduct.name);
              console.log('Imagem principal:', foundProduct.imageUrl);
              console.log('Imagens adicionais:', foundProduct.images);
              
              // Verificar se o produto tem uma imagem principal definida
              if (!foundProduct.imageUrl && foundProduct.images && foundProduct.images.length > 0) {
                foundProduct.imageUrl = foundProduct.images[0];
                console.log('Definindo imagem principal a partir das imagens:', foundProduct.imageUrl);
              }
              
              setProduct(foundProduct);
              
              // Inicialize os estados com valores padrão do produto
              if (foundProduct.sizes && foundProduct.sizes.length > 0) {
                setSelectedSize(foundProduct.sizes[0]);
              }
              
              if (foundProduct.colors && foundProduct.colors.length > 0) {
                setSelectedColor(foundProduct.colors[0]);
              }
              
              return;
            } else {
              console.log(`Produto com ID ${id} não encontrado no localStorage`);
            }
          } else {
            console.warn('Dados de produtos no localStorage não são um array válido');
          }
        } catch (parseError) {
          console.error('Erro ao analisar produtos do localStorage:', parseError);
        }
      }
    } catch (e) {
      console.error('Error loading products from localStorage', e);
    }
    
    // Fallback to mock data
    try {
      if (id) {
        const mockProduct = getProductById(id);
        if (mockProduct) {
          console.log('Produto encontrado nos dados mock:', mockProduct.name);
          console.log('Imagem principal:', mockProduct.imageUrl);
          console.log('Imagens adicionais:', mockProduct.images);
          
          // Verificar se o produto tem uma imagem principal definida
          if (!mockProduct.imageUrl && mockProduct.images && mockProduct.images.length > 0) {
            mockProduct.imageUrl = mockProduct.images[0];
            console.log('Definindo imagem principal a partir das imagens:', mockProduct.imageUrl);
          }
          
          setProduct(mockProduct);
          
          // Inicialize os estados com valores padrão do produto
          if (mockProduct.sizes && mockProduct.sizes.length > 0) {
            setSelectedSize(mockProduct.sizes[0]);
          }
          
          if (mockProduct.colors && mockProduct.colors.length > 0) {
            setSelectedColor(mockProduct.colors[0]);
          }
        } else {
          console.error('Produto não encontrado:', id);
          setProduct(null);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar produto nos dados mock:', error);
      setProduct(null);
    }
  }, [id]);
  
  if (!product) {
    return (
      <>
        <Header />
        <div className="container px-4 mx-auto py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
          <Link to="/" className="text-shop-red hover:underline">
            Voltar para a página inicial
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const discountedPrice = product.discount > 0 
    ? (product.price * (100 - product.discount)) / 100 
    : product.price;

  const handleAddToCart = () => {
    if (!product) return; // Verificação adicional
    
    if (!selectedSize) {
      toast.error("Por favor, selecione um tamanho");
      return;
    }
    
    if (Array.isArray(product.colors) && product.colors.length > 0 && !selectedColor) {
      toast.error("Por favor, selecione uma cor");
      return;
    }
    
    try {
      addToCart({
        ...product,
        quantity,
        selectedSize: selectedSize || '',
        selectedColor: selectedColor || ''
      });
      
      toast.success("Produto adicionado ao carrinho");
    } catch (error) {
      console.error("Erro ao adicionar produto ao carrinho:", error);
      toast.error("Ocorreu um erro ao adicionar o produto ao carrinho");
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    } else {
      toast.warning(`Quantidade máxima disponível: ${product.stock}`);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <>
      <Header />
      <main className="py-8">
        <div className="container px-4 mx-auto">
          <nav className="flex mb-8 text-sm text-gray-500">
            <Link to="/" className="hover:text-gray-800">Home</Link>
            <span className="mx-2">/</span>
            <Link to={`/products/${product.category}`} className="hover:text-gray-800">
              {product.category}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800">{product.name}</span>
          </nav>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Gallery */}
            <div>
              <ProductGallery 
                images={product.images || []} 
                mainImageUrl={product.imageUrl}
                name={product.name || 'Produto'} 
              />
            </div>
            
            {/* Product Info */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-4">
                {product.discount > 0 ? (
                  <>
                    <span className="text-2xl font-bold text-shop-red">
                      R$ {discountedPrice.toFixed(2)}
                    </span>
                    <span className="text-lg text-gray-400 line-through">
                      R$ {product.price.toFixed(2)}
                    </span>
                    <span className="bg-shop-red text-white text-sm px-2 py-1 rounded">
                      -{product.discount}%
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold">
                    R$ {product.price.toFixed(2)}
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 mb-6">
                {product.description}
              </p>
              
              {/* Sizes */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">
                  Tamanho {selectedSize ? `- ${selectedSize}` : ''}
                  <span className="text-shop-red ml-1">*</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className={`px-3 py-2 border rounded-md transition
                        ${selectedSize === size ? 'bg-shop-red text-white border-shop-red' : 'border-gray-300 hover:border-gray-400'}
                      `}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Colors */}
              {product.colors.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-2">
                    Cor {selectedColor ? `- ${selectedColor}` : ''}
                    <span className="text-shop-red ml-1">*</span>
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        className={`flex items-center justify-center h-10 px-3 border rounded-md transition
                          ${selectedColor === color ? 'border-shop-red' : 'border-gray-300 hover:border-gray-400'}
                        `}
                        onClick={() => setSelectedColor(color)}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Quantity */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Quantidade</h3>
                <div className="flex items-center">
                  <button
                    className="h-10 w-10 border rounded-l-md flex items-center justify-center hover:bg-gray-100"
                    onClick={decrementQuantity}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="h-10 w-16 border-t border-b flex items-center justify-center">
                    {quantity}
                  </span>
                  <button
                    className="h-10 w-10 border rounded-r-md flex items-center justify-center hover:bg-gray-100"
                    onClick={incrementQuantity}
                  >
                    <Plus size={16} />
                  </button>
                  <span className="ml-4 text-sm text-gray-500">
                    {product.stock} unidades disponíveis
                  </span>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Button
                  className="flex-1 bg-shop-red hover:bg-shop-red/90 h-12"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Adicionar ao carrinho
                </Button>
                <Button variant="outline" className="flex-1 h-12">
                  <Heart className="mr-2 h-5 w-5" />
                  Adicionar aos favoritos
                </Button>
              </div>
              
              {/* Shipping Info */}
              <div className="border rounded-md p-4 mb-6">
                <div className="flex items-start">
                  <Truck className="text-shop-red mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">Entrega</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Frete grátis para compras acima de R$ 199,90. 
                      Consulte o prazo estimado de entrega informando seu CEP.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Share */}
              <div className="flex items-center text-gray-500 text-sm">
                <Share2 size={16} className="mr-2" />
                <span>Compartilhar</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ProductDetails;
