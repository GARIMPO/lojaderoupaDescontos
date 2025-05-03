import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartItem from '@/components/CartItem';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ArrowRight, Trash2, ShoppingBag, Truck, CreditCard, Wallet, Landmark, CircleDollarSign, ChevronDown, Smartphone } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface PaymentMethodsConfig {
  credit: boolean;
  debit: boolean;
  pix: boolean;
  cash: boolean;
  other: boolean;
}

const CartPage = () => {
  const { cart, clearCart, cartTotal } = useCart();
  const navigate = useNavigate();
  const [deliveryInfo, setDeliveryInfo] = useState<string>('Frete grátis para compras acima de R$ 199,90. Consulte o prazo estimado de entrega informando seu CEP.');
  const [paymentMethod, setPaymentMethod] = useState<string>('credit');
  const [paymentAccordionOpen, setPaymentAccordionOpen] = useState<string>('');
  const [showPaymentMethods, setShowPaymentMethods] = useState<boolean>(true);
  const [activePaymentMethods, setActivePaymentMethods] = useState<PaymentMethodsConfig>({
    credit: true,
    debit: true,
    pix: true,
    cash: true,
    other: true
  });
  
  // Load settings from localStorage
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('storeSettings');
      if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        if (settings.deliveryInfo) {
          setDeliveryInfo(settings.deliveryInfo);
        }
        // Check if payment methods should be shown
        if (settings.hasOwnProperty('showPaymentMethods')) {
          setShowPaymentMethods(settings.showPaymentMethods);
        }
        // Load active payment methods
        if (settings.hasOwnProperty('activePaymentMethods')) {
          setActivePaymentMethods(settings.activePaymentMethods);
          
          // If the currently selected payment method is now inactive, select the first active one
          if (!settings.activePaymentMethods[paymentMethod]) {
            const activeMethod = Object.keys(settings.activePaymentMethods).find(
              key => settings.activePaymentMethods[key]
            );
            if (activeMethod) {
              setPaymentMethod(activeMethod);
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to load settings', error);
    }
  }, []);
  
  const handleCheckout = () => {
    if (showPaymentMethods && !paymentMethod) {
      alert('Por favor, selecione uma forma de pagamento antes de finalizar a compra.');
      return;
    }
    alert(`${showPaymentMethods ? `Forma de pagamento selecionada: ${getPaymentMethodName(paymentMethod)}` : 'Processando pagamento...'}\nEsta funcionalidade ainda não está disponível. Obrigado pela compreensão!`);
  };
  
  const getPaymentMethodName = (method: string): string => {
    switch (method) {
      case 'credit': return 'Cartão de Crédito';
      case 'debit': return 'Cartão de Débito';
      case 'pix': return 'PIX';
      case 'cash': return 'Dinheiro';
      case 'other': return 'Outro';
      default: return 'Não selecionado';
    }
  };

  const handlePaymentMethodSelect = (method: string) => {
    setPaymentMethod(method);
    setPaymentAccordionOpen('');
  };
  
  // Check if there are any active payment methods
  const hasActivePaymentMethods = Object.values(activePaymentMethods).some(value => value);
  
  return (
    <>
      <Header />
      <main className="py-8">
        <div className="container px-4 mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center">
            <ShoppingCart className="mr-3" /> Meu Carrinho
          </h1>
          
          {cart.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
                    <h2 className="font-semibold">Itens do Carrinho ({cart.length})</h2>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-shop-red hover:text-shop-red/80"
                      onClick={clearCart}
                    >
                      <Trash2 size={16} className="mr-2" />
                      Limpar carrinho
                    </Button>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {cart.map((item) => (
                      <CartItem key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} item={item} />
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <Link to="/">
                      <Button variant="outline" size="sm" className="text-sm">
                        <ShoppingBag size={16} className="mr-2" />
                        Continuar comprando
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Order Summary */}
              <div>
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
                  <h2 className="font-semibold mb-4">Resumo do Pedido</h2>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>R$ {cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Frete:</span>
                      <span>{cartTotal >= 199.9 ? 'Grátis' : 'R$ 15,00'}</span>
                    </div>
                    
                    {cartTotal < 199.9 && (
                      <div className="text-sm text-shop-red mt-2">
                        Falta R$ {(199.9 - cartTotal).toFixed(2)} para frete grátis!
                      </div>
                    )}
                    
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total:</span>
                        <span>R$ {(cartTotal + (cartTotal >= 199.9 ? 0 : 15)).toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Em até 12x sem juros
                      </div>
                    </div>
                  </div>
                  
                  {/* Payment Method Accordion - Only show if enabled in settings */}
                  {showPaymentMethods && hasActivePaymentMethods && (
                    <div className="mt-6 mb-6 border-t border-gray-200 pt-4">
                      <Accordion 
                        type="single" 
                        collapsible 
                        value={paymentAccordionOpen}
                        onValueChange={setPaymentAccordionOpen}
                        className="border rounded-md"
                      >
                        <AccordionItem value="payment-methods" className="border-none">
                          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center">
                                <CreditCard size={18} className="mr-2 text-gray-600" />
                                <span className="font-medium">
                                  Escolher a Forma de Pagamento
                                </span>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pt-2 pb-4">
                            <div className="space-y-2">
                              {activePaymentMethods.credit && (
                                <div 
                                  className={`flex items-center p-2 rounded-md hover:bg-gray-50 cursor-pointer ${paymentMethod === 'credit' ? 'bg-gray-50 border border-gray-200' : ''}`}
                                  onClick={() => handlePaymentMethodSelect('credit')}
                                >
                                  <CreditCard size={16} className="mr-2 text-gray-600" />
                                  <span>Cartão de Crédito</span>
                                </div>
                              )}
                              
                              {activePaymentMethods.debit && (
                                <div 
                                  className={`flex items-center p-2 rounded-md hover:bg-gray-50 cursor-pointer ${paymentMethod === 'debit' ? 'bg-gray-50 border border-gray-200' : ''}`}
                                  onClick={() => handlePaymentMethodSelect('debit')}
                                >
                                  <CreditCard size={16} className="mr-2 text-gray-600" />
                                  <span>Cartão de Débito</span>
                                </div>
                              )}
                              
                              {activePaymentMethods.pix && (
                                <div 
                                  className={`flex items-center p-2 rounded-md hover:bg-gray-50 cursor-pointer ${paymentMethod === 'pix' ? 'bg-gray-50 border border-gray-200' : ''}`}
                                  onClick={() => handlePaymentMethodSelect('pix')}
                                >
                                  <Smartphone size={16} className="mr-2 text-gray-600" />
                                  <span>PIX</span>
                                </div>
                              )}
                              
                              {activePaymentMethods.cash && (
                                <div 
                                  className={`flex items-center p-2 rounded-md hover:bg-gray-50 cursor-pointer ${paymentMethod === 'cash' ? 'bg-gray-50 border border-gray-200' : ''}`}
                                  onClick={() => handlePaymentMethodSelect('cash')}
                                >
                                  <CircleDollarSign size={16} className="mr-2 text-gray-600" />
                                  <span>Dinheiro</span>
                                </div>
                              )}
                              
                              {activePaymentMethods.other && (
                                <div 
                                  className={`flex items-center p-2 rounded-md hover:bg-gray-50 cursor-pointer ${paymentMethod === 'other' ? 'bg-gray-50 border border-gray-200' : ''}`}
                                  onClick={() => handlePaymentMethodSelect('other')}
                                >
                                  <span className="flex justify-center items-center w-4 h-4 mr-2 rounded-full border border-gray-600 text-xs">?</span>
                                  <span>Outro</span>
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  )}
                  
                  <Button 
                    className="w-full bg-shop-red hover:bg-shop-red/90"
                    onClick={handleCheckout}
                  >
                    Finalizar Compra
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                  
                  {/* Delivery Information Section - Moved to below checkout button */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center mb-2">
                      <Truck size={16} className="mr-2 text-gray-600" /> 
                      <span className="font-medium text-sm">Entrega</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {deliveryInfo}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-shop-light-gray mb-4">
                <ShoppingCart size={24} className="text-gray-500" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Seu carrinho está vazio</h2>
              <p className="text-gray-500 mb-6">Os produtos adicionados ao carrinho aparecerão aqui.</p>
              <Link to="/">
                <Button className="bg-shop-red hover:bg-shop-red/90">
                  Continuar comprando
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CartPage;
