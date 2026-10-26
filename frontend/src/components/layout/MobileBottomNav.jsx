import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, ShoppingBag, Package, User } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';

export default function MobileBottomNav() {
  const location = useLocation();
  const { getTotals } = useCartStore();
  const { user, isAuthenticated, isAdmin, isSeller } = useAuthStore();
  const { itemCount } = getTotals();

  const currentPath = location.pathname;

  // Determine user account link
  const getAccountLink = () => {
    if (!isAuthenticated) return '/login';
    if (isAdmin()) return '/admin/dashboard';
    if (isSeller()) return '/seller/dashboard';
    return '/buyer/dashboard';
  };

  const navItems = [
    {
      label: 'Home',
      path: '/',
      icon: Home,
      isActive: currentPath === '/',
    },
    {
      label: 'Shop',
      path: '/shop',
      icon: Compass,
      isActive: currentPath === '/shop' || currentPath.startsWith('/product/'),
    },
    {
      label: 'Cart',
      path: '/cart',
      icon: ShoppingBag,
      isActive: currentPath === '/cart' || currentPath === '/checkout',
      badge: itemCount > 0 ? itemCount : null,
    },
    {
      label: 'Orders',
      path: isAuthenticated ? '/buyer/orders' : '/login',
      icon: Package,
      isActive: currentPath === '/buyer/orders',
    },
    {
      label: isAuthenticated ? (user?.name?.split(' ')[0] || 'Account') : 'Sign In',
      path: getAccountLink(),
      icon: User,
      isActive: currentPath.includes('/dashboard') || currentPath === '/login' || currentPath === '/register',
    },
  ];

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)] transition-all"
    >
      <div className="grid grid-cols-5 h-16 items-center px-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`relative flex flex-col items-center justify-center h-full py-1 transition-all select-none ${
                active ? 'text-blue-600 scale-105' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${active ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-[9px] rounded-full h-4 min-w-4 px-1 flex items-center justify-center shadow-md animate-pulse">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-1 truncate max-w-[56px] text-center ${
                active ? 'font-black text-blue-600' : 'font-medium'
              }`}>
                {item.label}
              </span>
              {active && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-600" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
