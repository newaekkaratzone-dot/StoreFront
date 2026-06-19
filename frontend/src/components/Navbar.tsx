import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, useTranslation } from '../store';
import { api } from '../api';
import { ShoppingCart, Package, Heart, Search, Moon, Sun, Globe, Settings } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout, theme, toggleTheme, language, toggleLanguage, cartCount, setCartCount, setCartProductIds, favorites } = useAuthStore();
  const { t } = useTranslation();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = e.currentTarget.value.trim();
      if (val) {
        navigate(`/?search=${encodeURIComponent(val)}`);
      } else {
        navigate(`/`);
      }
    }
  };

  useEffect(() => {
    if (user?.role === 'buyer') {
      api.get('/cart/')
        .then(res => {
          const count = res.data.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
          const ids = res.data.items?.map((item: any) => item.product_details?.id || item.product) || [];
          setCartCount(count);
          setCartProductIds(ids);
        })
        .catch(console.error);
    }
  }, [user]);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: t.confirmLogout || 'Are you sure you want to logout?',
      text: t.confirmLogoutText || 'You will need to login again to access your account.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#6b7280',
      confirmButtonText: t.confirm || 'Confirm',
      cancelButtonText: t.cancel || 'Cancel',
      customClass: { popup: 'rounded-3xl' }
    });

    if (result.isConfirmed) {
      logout();
      navigate('/login');
    }
  };

  return (
    <nav className="bg-surface dark:bg-dark-surface sticky top-0 z-50 rounded-b-3xl shadow-sm px-6 py-4 flex items-center justify-between transition-colors duration-300">
      {/* Logo */}
      <Link to={user?.role === 'seller' ? '/dashboard' : '/'} className="flex items-center space-x-1 group">
        <span className="text-2xl font-black text-secondary dark:text-dark-text tracking-tighter">MLC</span>
        <div className="w-2 h-2 bg-primary rounded-full group-hover:scale-150 transition-transform"></div>
      </Link>

      {/* Search Bar */}
      <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          onKeyDown={handleSearch}
          className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-full leading-5 bg-background dark:bg-dark-bg text-secondary dark:text-dark-text placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-dark-surface focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-colors"
          placeholder={t.search}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-6">
        {user ? (
          <>
            <Link to={user.role === 'seller' ? '/dashboard' : '/'} className="flex items-center space-x-2 text-secondary dark:text-dark-text hover:text-primary dark:hover:text-primary transition-colors">
              <Package className="w-5 h-5" />
              <span className="text-sm font-medium hidden lg:block">{user.role === 'seller' ? t.dashboard : t.orders}</span>
            </Link>
            
            {user.role === 'buyer' && (
              <>
                <Link to="/?favorites_only=true" className="flex items-center space-x-2 text-secondary dark:text-dark-text hover:text-primary dark:hover:text-primary transition-colors relative">
                  <Heart className="w-5 h-5" />
                  <span className="text-sm font-medium hidden lg:block">{t.favourites}</span>
                  {favorites.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-surface dark:border-dark-surface">
                      {favorites.length > 99 ? '99+' : favorites.length}
                    </span>
                  )}
                </Link>
                <Link to="/checkout" className="flex items-center space-x-2 text-secondary dark:text-dark-text hover:text-primary dark:hover:text-primary transition-colors relative">
                  <ShoppingCart className="w-5 h-5" />
                  <span className="text-sm font-medium hidden lg:block">{t.cart}</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-surface dark:border-dark-surface">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {user.role === 'seller' && (
              <>
                <Link to="/products" className="flex items-center space-x-2 text-secondary dark:text-dark-text hover:text-primary dark:hover:text-primary transition-colors">
                  <Package className="w-5 h-5" />
                  <span className="text-sm font-medium hidden lg:block">{t.manageProducts || 'Manage Products'}</span>
                </Link>
                <Link to="/settings" className="flex items-center space-x-2 text-secondary dark:text-dark-text hover:text-primary dark:hover:text-primary transition-colors">
                  <Settings className="w-5 h-5" />
                  <span className="text-sm font-medium hidden lg:block">{t.settings || 'Settings'}</span>
                </Link>
              </>
            )}

            <div className="h-6 w-px bg-gray-200 dark:bg-dark-border mx-2"></div>

            <button onClick={toggleLanguage} className="p-2 text-secondary dark:text-dark-text hover:bg-background dark:hover:bg-dark-bg rounded-full transition-colors flex items-center space-x-1" title="Toggle Language">
              <Globe className="w-5 h-5" />
              <span className="text-xs font-bold uppercase">{language}</span>
            </button>

            <button onClick={toggleTheme} className="p-2 text-secondary dark:text-dark-text hover:bg-background dark:hover:bg-dark-bg rounded-full transition-colors" title="Toggle Theme">
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            <div className="flex items-center space-x-3 cursor-pointer" onClick={handleLogout} title={t.logout}>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white overflow-hidden shadow-sm">
                <img src="https://ui-avatars.com/api/?name=User&background=random" alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>
          </>
        ) : (
          <>
            <button onClick={toggleLanguage} className="p-2 text-secondary dark:text-dark-text hover:bg-background dark:hover:bg-dark-bg rounded-full transition-colors flex items-center space-x-1" title="Toggle Language">
              <Globe className="w-5 h-5" />
              <span className="text-xs font-bold uppercase">{language}</span>
            </button>

            <button onClick={toggleTheme} className="p-2 text-secondary dark:text-dark-text hover:bg-background dark:hover:bg-dark-bg rounded-full transition-colors" title="Toggle Theme">
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <Link to="/login" className="text-sm font-medium text-secondary dark:text-dark-text hover:text-primary transition-colors">{t.login}</Link>
            <Link to="/register" className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-full shadow hover:bg-indigo-700 transition-colors">{t.register}</Link>
          </>
        )}
      </div>
    </nav>
  );
}
