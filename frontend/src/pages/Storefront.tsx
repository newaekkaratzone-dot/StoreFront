import { useEffect, useState } from 'react';
import { api } from '../api';
import { useTranslation, useAuthStore } from '../store';
import { Star, Heart, Search, ShoppingBag, Loader2, X } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Product } from '../store';

export default function Storefront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { t } = useTranslation();
  const { user, cartCount, setCartCount, favorites, toggleFavorite, cartProductIds, setCartProductIds } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [quantityToAdd, setQuantityToAdd] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const query = searchParams.toString();
        const res = await api.get(`/products/${query ? `?${query}` : ''}`);
        setProducts(res.data.results || res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams]);

  const isFavoritesOnly = searchParams.get('favorites_only') === 'true';
  const displayProducts = isFavoritesOnly ? products.filter(p => favorites.includes(p.id)) : products;

  const handleAddToCart = async (productId: string, quantity: number = 1) => {
    if (!user || user.role !== 'buyer') {
      navigate('/login');
      return;
    }

    setAddingToCart(productId);
    try {
      await api.post('/cart/', { product_id: productId, quantity });
      
      // We don't know the exact cart count if we just added. We could re-fetch or assume increment.
      // If it wasn't in cart before, increment cartCount by 1.
      if (!cartProductIds.includes(productId)) {
        setCartCount(cartCount + 1);
        setCartProductIds([...cartProductIds, productId]);
      }
      
      Swal.fire({
        icon: 'success',
        title: t.addToCartSuccess || 'Added to cart!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        iconColor: '#10b981',
      });
      setSelectedProduct(null);
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: err.response?.data?.error || 'Failed to add to cart', confirmButtonColor: '#7c3aed' });
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <div className="flex px-4 md:px-8 xl:px-12 py-8 w-full">
      <Sidebar />
      <main className="flex-1">
        {/* Search Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-secondary dark:text-dark-text mb-2">
              {isFavoritesOnly ? (t.favourites || 'Favorites') : (t.ourProducts || 'Our Products')}
            </h1>
            <p className="text-muted dark:text-dark-muted">
              {isFavoritesOnly ? '' : (t.ourProductsDesc || 'Find the best tech gadgets here.')}
            </p>
          </div>
          
          <div className="relative w-full md:w-64">
            <input 
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border rounded-full bg-surface dark:bg-dark-surface dark:border-dark-border text-secondary dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchParams.get('search') || ''}
              onChange={e => {
                const newParams = new URLSearchParams(searchParams);
                if (e.target.value) newParams.set('search', e.target.value);
                else newParams.delete('search');
                setSearchParams(newParams);
              }}
            />
            <Search className="absolute left-3 top-2.5 text-muted dark:text-dark-muted" size={18} />
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayProducts.map((product, idx) => {
              if (product.isFeatured) {
                // Featured Card (Purple Background)
                return (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} key={product.id} className="relative rounded-3xl overflow-hidden shadow-sm group">
                    <div className="absolute inset-0 bg-primary/90 dark:bg-primary/80 z-10 mix-blend-multiply"></div>
                    <img src={product.thumbnail_url} alt={product.title} className="absolute inset-0 w-full h-full object-cover" />
                    
                    <div className="relative z-20 p-6 flex flex-col h-full justify-between min-h-[350px]">
                      <div className="flex justify-between items-start">
                        <div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center space-x-1">
                          <span className="text-white text-xs font-bold">5/5</span>
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        </div>
                        <button 
                          onClick={() => toggleFavorite(product.id)}
                          className={`w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform ${favorites.includes(product.id) ? 'text-red-500' : 'text-primary'}`}
                        >
                          <Heart className={`w-4 h-4 ${favorites.includes(product.id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                      
                      <div className="mt-auto text-center cursor-pointer" onClick={() => setSelectedProduct(product)}>
                        <h3 className="text-white font-bold text-lg mb-4">{product.title}</h3>
                        <button 
                          className="inline-flex items-center space-x-2 px-6 py-2 rounded-full border-2 border-white/50 bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-primary transition-colors font-semibold"
                        >
                          <Search className="w-4 h-4" />
                          <span>฿{product.unit_price}</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              }

              // Standard Card
              return (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} key={product.id} className="bg-surface dark:bg-dark-surface rounded-3xl p-4 shadow-sm group hover:shadow-md transition-shadow flex flex-col">
                  <div className="relative aspect-square mb-4 rounded-2xl overflow-hidden bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
                    <button 
                      onClick={() => toggleFavorite(product.id)}
                      className={`absolute top-3 right-3 w-8 h-8 bg-white dark:bg-dark-surface rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform z-10 ${favorites.includes(product.id) ? 'text-red-500' : 'text-primary'}`}
                    >
                      <Heart className={`w-4 h-4 ${favorites.includes(product.id) ? 'fill-current' : ''}`} />
                    </button>
                    <img src={product.thumbnail_url} alt={product.title} className="w-4/5 h-4/5 object-contain group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  
                  <div className="flex flex-col flex-1 items-center text-center px-2 cursor-pointer" onClick={() => setSelectedProduct(product)}>
                    {idx === 0 || idx === 5 ? (
                      <span className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 uppercase tracking-wide">{t.topItem}</span>
                    ) : null}
                    
                    <h3 className="text-sm font-semibold text-secondary dark:text-dark-text mb-4 line-clamp-2">{product.title}</h3>
                    
                    <div className="mt-auto flex items-center space-x-3">
                      {product.oldPrice && (
                        <span className="text-sm text-gray-400 line-through">฿{product.oldPrice}</span>
                      )}
                      <button 
                        className="flex items-center space-x-2 px-5 py-2 rounded-full border-2 border-primary/20 text-primary hover:bg-primary hover:text-white transition-colors font-semibold text-sm"
                      >
                        <Search className="w-4 h-4" />
                        <span>฿{product.unit_price}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Product Details Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div 

              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }} 
              onClick={(e) => e.stopPropagation()}
              className="bg-surface dark:bg-dark-surface w-full max-w-4xl rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row relative max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-500 hover:bg-white hover:text-red-500 transition-colors shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-full md:w-1/2 bg-gray-50 dark:bg-dark-bg p-8 flex items-center justify-center min-h-[300px]">
                <img src={selectedProduct.thumbnail_url} alt={selectedProduct.title} className="w-full h-full object-contain max-h-[400px] mix-blend-multiply dark:mix-blend-normal" />
              </div>

              <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col overflow-y-auto">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full tracking-wide">NEW</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-bold text-secondary dark:text-dark-text">5.0</span>
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-secondary dark:text-dark-text mb-4 leading-tight">{selectedProduct.title}</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 whitespace-pre-line leading-relaxed flex-1">
                  {selectedProduct.description || 'No description available for this product.'}
                </p>

                  <div className="mt-auto border-t border-gray-100 dark:border-dark-border pt-6">
                  <div className="flex items-end justify-between mb-6">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Price</p>
                      <span className="text-4xl font-bold text-secondary dark:text-dark-text">฿{selectedProduct.unit_price}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {selectedProduct.quantity > 0 ? (
                          <span className="text-green-500">In Stock: {selectedProduct.quantity}</span>
                        ) : (
                          <span className="text-red-500">Out of Stock</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 mb-4">
                    <div className="flex items-center bg-gray-100 dark:bg-dark-border rounded-2xl p-2">
                      <button 
                        onClick={() => setQuantityToAdd(Math.max(1, quantityToAdd - 1))}
                        disabled={quantityToAdd <= 1}
                        className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-dark-bg rounded-xl transition-colors disabled:opacity-50"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-semibold text-secondary dark:text-white">
                        {quantityToAdd}
                      </span>
                      <button 
                        onClick={() => setQuantityToAdd(Math.min(selectedProduct.quantity, quantityToAdd + 1))}
                        disabled={quantityToAdd >= selectedProduct.quantity}
                        className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-dark-bg rounded-xl transition-colors disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>

                    <button 
                      onClick={() => handleAddToCart(selectedProduct.id, quantityToAdd)}
                      disabled={addingToCart === selectedProduct.id || selectedProduct.quantity <= 0}
                      className="flex-1 py-4 bg-primary text-white rounded-2xl font-semibold text-lg flex items-center justify-center space-x-2 hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-lg shadow-primary/30"
                    >
                      {addingToCart === selectedProduct.id ? <Loader2 className="w-6 h-6 animate-spin" /> : <ShoppingBag className="w-6 h-6" />}
                      <span>{selectedProduct.quantity <= 0 ? 'Out of Stock' : (t.addToCart || 'Add to Cart')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
