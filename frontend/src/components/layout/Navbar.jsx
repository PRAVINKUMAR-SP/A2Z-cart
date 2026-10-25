import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  ShoppingCart, Search, User, ShieldCheck, Store, 
  Menu, X, Sparkles, ChevronDown, Package, ArrowRight, LogOut, CheckCircle2, Clock, ExternalLink,
  ShoppingBag, Check
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useProductStore } from '../../store/productStore';
import { formatPrice } from '../../utils/formatters';
import { ROLES } from '../../utils/constants';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, isBuyer, isSeller, isAdmin, switchRole, canSwitchRoles, updateUser } = useAuthStore();
  const { items, getTotals, fetchCartFromDb, resetCartOnLogout } = useCartStore();
  const { searchQuery, setSearchQuery } = useProductStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef(null);

  useEffect(() => {
    if (user?.email) {
      fetchCartFromDb(user);
    } else {
      resetCartOnLogout();
    }
  }, [user?.email]);

  // Auto-detect if logged-in user already has an active seller company in the database
  useEffect(() => {
    if (isAuthenticated && user?.email && !isSeller() && user.email !== 'pravin007ptk@gmail.com') {
      fetch(`/api/seller/profile?userId=${user.id || ''}&email=${encodeURIComponent(user.email)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.exists) {
            updateUser({
              role: 'ROLE_SELLER',
              sellerStatus: data.status || 'APPROVED',
              companyName: data.sellerName || data.companyName,
              sellerName: data.sellerName || data.companyName,
              sellerAddress: data.sellerAddress,
              gpayQr: data.gpayQr,
            });
          }
        })
        .catch(() => {});
    }
  }, [user?.id, user?.email]);

  // Click outside to close role switcher dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target)) {
        setRoleDropdownOpen(false);
      }
    };
    if (roleDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [roleDropdownOpen]);

  const { itemCount, subtotal } = getTotals();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate('/shop');
  };

  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';
  const isAuthPage = isLoginPage || isRegisterPage;
  const isAdminDashboard = location.pathname.startsWith('/admin') || (isAdmin() && location.pathname.includes('admin'));
  const isSellerDashboard = location.pathname.startsWith('/seller') || (isSeller() && location.pathname.includes('seller'));
  const isDashboard = isAdminDashboard || isSellerDashboard;

  const isSuperAdmin = Boolean(user && user.email === 'pravin007ptk@gmail.com');
  const showRoleSwitcher = isSuperAdmin;

  const handleSwitchRole = (newRole, redirectPath) => {
    if (switchRole) {
      switchRole(newRole);
    }
    setRoleDropdownOpen(false);
    setMobileMenuOpen(false);
    const label = newRole === ROLES.ADMIN ? 'Admin' : newRole === ROLES.SELLER ? 'Seller' : 'Buyer';
    toast.success(`Switched to ${label} Mode`);
    if (redirectPath) {
      navigate(redirectPath);
    }
  };

  // Role-based logo navigation: Buyer -> /shop, Seller -> /seller/dashboard, Admin -> /admin/dashboard, Logged out -> /
  const getLogoRedirectPath = () => {
    if (!isAuthenticated || !user) return '/';
    if (isAdmin()) return '/admin/dashboard';
    if (isSeller()) return '/seller/dashboard';
    return '/shop';
  };

  const handleLogout = () => {
    resetCartOnLogout();
    logout();
    toast.success('Signed out successfully.');
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  if (isLandingPage || isAuthPage) {
    return (
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          {/* Clean Typography Logo Only with Role-based Routing */}
          <Link to={getLogoRedirectPath()} className="text-2xl font-black tracking-tight text-slate-900 font-['Outfit'] select-none">
            A2Z<span className="text-blue-600 font-extrabold">~cart</span>
          </Link>

          {/* Center: Refined Animated "Welcome to A2Z~cart" (Desktop/Tablet Only) */}
          <div className="hidden md:flex flex-col items-center justify-center select-none group cursor-default">
            <span className="welcome-gradient-text text-base sm:text-lg md:text-xl font-black font-['Outfit'] tracking-tight">
              Welcome to A2Z~cart
            </span>
            <span className="h-[2px] w-12 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 rounded-full mt-0.5 group-hover:w-24 transition-all duration-500 opacity-80" />
          </div>

          {/* Context-aware Action Button */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/shop"
                  className="hidden sm:inline-flex px-4 py-2 rounded-full text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-all"
                >
                  Browse Shop
                </Link>
                <Link
                  to={isAdmin() ? '/admin/dashboard' : isSeller() ? '/seller/dashboard' : '/shop'}
                  className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span>{user?.name?.split(' ')[0] || 'Dashboard'}</span>
                </Link>
              </div>
            ) : isLoginPage ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/shop"
                  className="hidden sm:inline-flex px-4 py-2 rounded-full text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-all"
                >
                  Browse Shop
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                >
                  <span>Register</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : isRegisterPage ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/shop"
                  className="hidden sm:inline-flex px-4 py-2 rounded-full text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-all"
                >
                  Browse Shop
                </Link>
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <a
                  href="/a2z-cart.apk"
                  download="A2Z-cart.apk"
                  className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-blue-600 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200 shadow-2xs"
                  title="Download Official Android App APK"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden xs:inline">Download App</span>
                  <span className="xs:hidden">App</span>
                </a>
                <Link
                  to="/login"
                  className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Navbar Row with Enhanced Height */}
        <div className="py-2.5 sm:py-4.5 min-h-[64px] sm:min-h-[82px] flex items-center justify-between gap-2 sm:gap-6">
          
          {/* Logo with Role-based Routing */}
          <div className="flex items-center">
            <Link to={getLogoRedirectPath()} className="text-xl sm:text-2xl md:text-[28px] font-black tracking-tight text-slate-900 font-['Outfit'] select-none flex items-center gap-1 group">
              A2Z<span className="text-blue-600 font-extrabold group-hover:text-indigo-600 transition-colors">~cart</span>
            </Link>
          </div>

        {/* Central Search Bar - Hidden on Dashboards (Admin & Seller) */}
        {!isDashboard && (
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl relative hidden md:block">
            <div className="relative flex items-center group">
              <Search className="w-4.5 h-4.5 text-slate-400 group-focus-within:text-blue-600 absolute left-4 transition-colors pointer-events-none" />
              <input
                type="text"
                placeholder="Search the products, brand, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-3 bg-slate-100/80 hover:bg-slate-100/90 focus:bg-white border border-slate-200/80 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-full text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/80 transition-all"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        )}

        {/* Right Action Icons: Dashboards, Orders, Cart, User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          
          {/* Role Switcher Dropdown (Replaces static Browse Store on Dashboards) */}
          {(isDashboard || showRoleSwitcher) && (
            <div className="relative" ref={roleDropdownRef}>
              <button
                type="button"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-slate-100 hover:bg-slate-200/90 text-slate-700 text-[11px] sm:text-xs font-bold transition-all border border-slate-200/90 shadow-2xs cursor-pointer select-none"
                title="Change Role / Switch View"
              >
                {isAdmin() ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                ) : isSeller() ? (
                  <Store className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                )}
                <span className="text-slate-500 font-medium">Role:</span>
                <span
                  className={`font-extrabold ${
                    isAdmin()
                      ? 'text-purple-700'
                      : isSeller()
                      ? 'text-emerald-700'
                      : 'text-blue-700'
                  }`}
                >
                  {isAdmin() ? 'Admin' : isSeller() ? 'Seller' : 'Buyer'}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    roleDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Switch Role / View
                      </p>
                      <p className="text-xs font-semibold text-slate-800">
                        Preview Platform As
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                      Live
                    </span>
                  </div>

                  <div className="p-1.5 space-y-1">
                    {/* Buyer Option */}
                    <button
                      type="button"
                      onClick={() => handleSwitchRole(ROLES.BUYER, '/shop')}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                        isBuyer()
                          ? 'bg-blue-50 text-blue-900 border border-blue-200/80 font-bold'
                          : 'hover:bg-slate-50 text-slate-700 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`p-1.5 rounded-lg ${
                            isBuyer()
                              ? 'bg-blue-600 text-white'
                              : 'bg-blue-50 text-blue-600'
                          }`}
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold leading-tight">Buyer</p>
                          <p className="text-[10px] text-slate-400">
                            Customer storefront & cart
                          </p>
                        </div>
                      </div>
                      {isBuyer() && (
                        <Check className="w-4 h-4 text-blue-600 stroke-[3]" />
                      )}
                    </button>

                    {/* Seller Option */}
                    <button
                      type="button"
                      onClick={() => handleSwitchRole(ROLES.SELLER, '/seller/dashboard')}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                        isSeller()
                          ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/80 font-bold'
                          : 'hover:bg-slate-50 text-slate-700 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`p-1.5 rounded-lg ${
                            isSeller()
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          <Store className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold leading-tight">Seller</p>
                          <p className="text-[10px] text-slate-400">
                            Storefront & seller dashboard
                          </p>
                        </div>
                      </div>
                      {isSeller() && (
                        <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                      )}
                    </button>

                    {/* Admin Option */}
                    <button
                      type="button"
                      onClick={() => handleSwitchRole(ROLES.ADMIN, '/admin/dashboard')}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                        isAdmin()
                          ? 'bg-purple-50 text-purple-900 border border-purple-200/80 font-bold'
                          : 'hover:bg-slate-50 text-slate-700 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`p-1.5 rounded-lg ${
                            isAdmin()
                              ? 'bg-purple-600 text-white'
                              : 'bg-purple-50 text-purple-600'
                          }`}
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold leading-tight">Admin</p>
                          <p className="text-[10px] text-slate-400">
                            Platform moderation & users
                          </p>
                        </div>
                      </div>
                      {isAdmin() && (
                        <Check className="w-4 h-4 text-purple-600 stroke-[3]" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!isDashboard && (
            <>
              {/* Quick Portal Switch Link (shown if not an admin with switcher) */}
              {!showRoleSwitcher && (
                isSeller() ? (
                  <Link
                    to="/seller/dashboard"
                    className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold border border-emerald-200 transition-all"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Seller Dashboard</span>
                  </Link>
                ) : isAdmin() ? (
                  <Link
                    to="/admin/dashboard"
                    className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold border border-purple-200 transition-all"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin Console</span>
                  </Link>
                ) : (
                  <Link
                    to="/seller-onboarding"
                    className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold border border-blue-200 transition-all"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Become a Seller</span>
                  </Link>
                )
              )}

              {/* Orders Section Link */}
              <Link
                to="/buyer/orders"
                className="flex items-center gap-1.5 p-2 sm:px-3.5 sm:py-2.5 rounded-full hover:bg-slate-100 text-slate-700 hover:text-blue-600 transition-all text-xs font-bold border border-slate-200/70 hover:border-slate-300 shadow-2xs"
                title="My Orders & Shipments"
              >
                <Package className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">Orders</span>
              </Link>

              {/* Cart Icon & Real Data */}
              <Link
                to="/cart"
                className="relative p-2 sm:px-3.5 sm:py-2 rounded-full hover:bg-slate-100 text-slate-700 transition-all flex items-center gap-2.5 group border border-slate-200/70 hover:border-slate-300 shadow-2xs"
                title="Shopping Cart"
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 text-slate-700 group-hover:text-blue-600 transition-colors" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2.5 bg-blue-600 text-white text-[10px] font-black rounded-full h-4 min-w-4 px-1 flex items-center justify-center shadow-md animate-scale">
                      {itemCount}
                    </span>
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-left -space-y-0.5">
                  <span className="text-[11px] text-slate-500 font-bold leading-none">Cart</span>
                  <span className="text-xs font-extrabold text-slate-900 leading-tight">
                    {itemCount > 0 ? formatPrice(subtotal) : '₹0'}
                  </span>
                </div>
              </Link>
            </>
          )}

            {/* User Account Dropdown */}
            <div className="relative">
              {isAuthenticated && user ? (
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all shadow-xs"
                  >
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80'}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-blue-500/20"
                    />
                    <div className="hidden md:flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[100px]">
                        {user.name.split(' ')[0]}
                      </span>
                      <span className="text-[10px] text-slate-400 capitalize">
                        {isSeller() ? 'Seller' : isAdmin() ? 'Admin' : 'Buyer'}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in duration-150">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-xs text-slate-400">Signed in as</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-blue-600 font-medium truncate">{user.email}</p>
                        <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                          Role: {isSeller() ? 'SELLER' : isAdmin() ? 'ADMIN' : 'BUYER'}
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/buyer/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium"
                        >
                          <Package className="w-4 h-4 text-slate-400" />
                          <span>My Orders & Shipments</span>
                        </Link>

                        <Link
                          to="/buyer/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          <span>Buyer Profile & Addresses</span>
                        </Link>

                        <div className="my-1 border-t border-slate-100"></div>

                        {/* Role-specific portal link */}
                        {isAdmin() && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 font-medium"
                          >
                            <ShieldCheck className="w-4 h-4 text-purple-600" />
                            <span>Admin Console</span>
                          </Link>
                        )}

                        {isSeller() && (
                          <Link
                            to="/seller/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-50 font-medium"
                          >
                            <Store className="w-4 h-4 text-emerald-600" />
                            <span>Seller Dashboard</span>
                          </Link>
                        )}

                        <div className="my-1 border-t border-slate-100"></div>

                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-full text-sm font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-full text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar & Menu Drawer */}
        <div className="pb-3 md:hidden space-y-2">
          {!isAdminDashboard && (
            <form onSubmit={handleSearchSubmit} className="relative group">
              <Search className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 absolute left-3.5 top-3.5 transition-colors pointer-events-none" />
              <input
                type="text"
                placeholder="Search the products, brand, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-slate-100/90 focus:bg-white border border-slate-200/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 rounded-full text-sm outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/80 transition-all"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          )}

          {mobileMenuOpen && (
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 space-y-2 animate-in fade-in duration-200">
              <Link
                to={getLogoRedirectPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-white text-xs font-bold text-slate-700 shadow-2xs hover:text-blue-600"
              >
                <span>{isAuthenticated ? (isAdmin() ? 'Admin Console' : isSeller() ? 'Seller Dashboard' : 'Browse Shop') : 'Home'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              {!isDashboard && (
                <>
                  <Link
                    to="/buyer/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-white text-xs font-bold text-slate-700 shadow-2xs hover:text-blue-600"
                  >
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-slate-500" />
                      <span>My Orders</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                  <Link
                    to="/cart"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-white text-xs font-bold text-slate-700 shadow-2xs hover:text-blue-600"
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-slate-500" />
                      <span>Cart ({itemCount})</span>
                    </div>
                    <span className="font-extrabold text-blue-600">{itemCount > 0 ? formatPrice(subtotal) : '₹0'}</span>
                  </Link>
                </>
              )}
              {showRoleSwitcher && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Switch View / Mode</span>
                    <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Active: {isAdmin() ? 'Admin' : isSeller() ? 'Seller' : 'Buyer'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSwitchRole(ROLES.BUYER, '/shop')}
                      className={`px-2 py-2 rounded-lg text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                        isBuyer() ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Buyer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSwitchRole(ROLES.SELLER, '/seller/dashboard')}
                      className={`px-2 py-2 rounded-lg text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                        isSeller() ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>Seller</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSwitchRole(ROLES.ADMIN, '/admin/dashboard')}
                      className={`px-2 py-2 rounded-lg text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                        isAdmin() ? 'bg-purple-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Admin</span>
                    </button>
                  </div>
                </div>
              )}
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-red-50 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors shadow-2xs cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Sign Out</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-red-400" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
