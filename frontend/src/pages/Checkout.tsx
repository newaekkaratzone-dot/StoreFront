import { useEffect, useState } from 'react';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';
import { useTranslation, useAuthStore, CartItem, Cart } from '../store';
import { motion } from 'framer-motion';
import { Package, MapPin, CreditCard, Trash2, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Checkout() {
  const { cartCount, setCartCount, cartProductIds, setCartProductIds } = useAuthStore();
  const [cart, setCart] = useState<Cart | null>(null);
  const [address, setAddress] = useState('');
  const [removingItem, setRemovingItem] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = () => {
    api.get('cart/').then(res => setCart(res.data)).catch(console.error);
  };

  const handleRemoveItem = async (cartItemId: string, productId: string) => {
    setRemovingItem(cartItemId);
    try {
      await api.delete('/cart/', { data: { cart_item_id: cartItemId } });
      fetchCart();
      setCartCount(Math.max(0, cartCount - 1));
      setCartProductIds(cartProductIds.filter((id: string) => id !== productId));
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Failed to remove item', confirmButtonColor: '#7c3aed' });
    } finally {
      setRemovingItem(null);
    }
  };

  const handleUpdateQuantity = async (cartItemId: string, productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(cartItemId, productId);
      return;
    }
    setRemovingItem(cartItemId); // reuse state for loading indicator
    try {
      await api.put('/cart/', { cart_item_id: cartItemId, quantity: newQuantity });
      fetchCart();
    } catch (err: any) {
      console.error(err);
      Swal.fire({ icon: 'error', title: err.response?.data?.error || 'Failed to update quantity', confirmButtonColor: '#7c3aed' });
    } finally {
      setRemovingItem(null);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address.trim()) {
      Swal.fire({
        icon: 'warning',
        title: t.addressRequired || 'Address Required',
        text: t.addressRequiredText || 'Please enter your shipping address.',
        confirmButtonColor: '#7c3aed',
        confirmButtonText: t.confirm || 'Confirm',
        customClass: { popup: 'rounded-3xl' }
      });
      return;
    }

    const result = await Swal.fire({
      title: t.confirmOrder || 'Place Order',
      text: t.confirmOrderText || 'Are you sure you want to place this order?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#6b7280',
      confirmButtonText: t.confirm || 'Confirm',
      cancelButtonText: t.cancel || 'Cancel',
      customClass: { popup: 'rounded-3xl' }
    });

    if (!result.isConfirmed) return;

    try {
      await api.post('checkout/', { shipping_address: address, payment_method: 'cod' });
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Order placed successfully!',
        confirmButtonColor: '#7c3aed',
        customClass: { popup: 'rounded-3xl' }
      });
      navigate('/');
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.error || "Checkout failed",
        confirmButtonColor: '#7c3aed',
        customClass: { popup: 'rounded-3xl' }
      });
    }
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="w-full px-4 md:px-8 xl:px-12 py-24 text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-secondary">{t.emptyBag || 'Your bag is empty.'}</h2>
        <p className="text-gray-500 mt-4">{t.freeDelivery || 'Free delivery and free returns.'}</p>
        <button onClick={() => navigate('/')} className="mt-8 bg-primary text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors">
          {t.continueShopping || 'Continue Shopping'}
        </button>
      </div>
    );
  }

  const total = cart.items.reduce((sum: number, item: CartItem) => sum + (item.quantity * Number(item.product_details.unit_price)), 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full px-4 md:px-8 xl:px-12 py-12"
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl font-semibold tracking-tight text-secondary">{t.reviewBag || 'Review your bag.'}</h1>
        <p className="text-gray-500 mt-2">{t.freeDelivery || 'Free delivery and free returns.'}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="w-full lg:w-2/3 space-y-6">
          <div className="bg-surface rounded-2xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2"><Package className="text-gray-400" /> {t.items || 'Items'}</h3>
            <div className="divide-y divide-gray-100">
              {cart.items.map((item: CartItem) => (
                <div key={item.id} className="py-6 flex gap-6 first:pt-0 last:pb-0">
                  <div className="w-32 h-32 bg-gray-50 rounded-xl p-2 flex items-center justify-center shrink-0">
                    <img src={item.product_details.thumbnail_url} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center relative">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-semibold text-lg text-secondary leading-tight pr-8">{item.product_details.title}</h4>
                      <span className="font-semibold text-lg whitespace-nowrap">฿{item.product_details.unit_price}</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center bg-gray-50 border border-gray-100 rounded-lg p-1">
                        <button 
                          onClick={() => handleUpdateQuantity(item.id, item.product_details.id, item.quantity - 1)}
                          disabled={removingItem === item.id}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-white hover:shadow-sm rounded-md transition-all disabled:opacity-50"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-medium text-secondary">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => handleUpdateQuantity(item.id, item.product_details.id, item.quantity + 1)}
                          disabled={removingItem === item.id}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-white hover:shadow-sm rounded-md transition-all disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleRemoveItem(item.id, item.product_details.id)}
                      disabled={removingItem === item.id}
                      className="absolute bottom-0 right-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                      title="Remove from cart"
                    >
                      {removingItem === item.id ? <Loader2 className="w-5 h-5 animate-spin text-red-500" /> : <Trash2 className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="w-full lg:w-1/3">
          <div className="bg-surface rounded-2xl p-6 lg:p-8 shadow-apple border border-gray-100 sticky top-24">
            <h3 className="text-xl font-semibold mb-6">{t.summary || 'Summary'}</h3>
            
            <div className="space-y-4 text-secondary mb-6 border-b border-gray-100 pb-6">
              <div className="flex justify-between">
                <span className="text-gray-500">{t.subtotal || 'Subtotal'}</span>
                <span>฿{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t.shipping || 'Shipping'}</span>
                <span>{t.free || 'FREE'}</span>
              </div>
            </div>

            <div className="flex justify-between text-2xl font-semibold mb-8">
              <span>{t.total || 'Total'}</span>
              <span>฿{total.toFixed(2)}</span>
            </div>
            
            <form onSubmit={handleCheckout} className="space-y-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <MapPin size={16} className="text-gray-400"/> {t.shippingAddress || 'Shipping Address'}
                </label>
                <textarea 
                  value={address} onChange={e => setAddress(e.target.value)} placeholder={t.enterAddress || 'Enter full address...'}
                  className="w-full bg-transparent border border-gray-300 rounded-xl px-4 py-3 text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder-gray-400 h-28 resize-none"
                ></textarea>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <CreditCard size={16} className="text-gray-400"/> {t.paymentMethod || 'Payment Method'}
                </label>
                <div className="p-4 border border-primary bg-blue-50/50 rounded-xl text-primary font-medium flex items-center justify-between">
                  <span>{t.cod || 'Cash on Delivery'}</span>
                  <div className="w-5 h-5 rounded-full border-4 border-primary bg-white"></div>
                </div>
              </div>

              <motion.button 
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className="w-full bg-primary hover:bg-blue-600 text-white font-medium py-4 rounded-xl mt-4 transition-colors"
              >
                {t.placeOrder || 'Place Order'}
              </motion.button>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
