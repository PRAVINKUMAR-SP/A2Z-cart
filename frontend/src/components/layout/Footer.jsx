import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Headphones, 
  ArrowUpRight, 
  ArrowUp, 
  Lock 
} from 'lucide-react';
import { useProductStore } from '../../store/productStore';
import { useAuthStore } from '../../store/authStore';
import { CATEGORIES } from '../../utils/constants';

export default function Footer() {
  const navigate = useNavigate();
  const { setSelectedCategory } = useProductStore();
  const { user, isAuthenticated, isAdmin, isSeller } = useAuthStore();

  const getLogoRedirectPath = () => {
    if (!isAuthenticated || !user) return '/';
    if (isAdmin()) return '/admin/dashboard';
    if (isSeller()) return '/seller/dashboard';
    return '/shop';
  };

  const handleCategoryNavigate = (catId) => {
    setSelectedCategory(catId);
    navigate('/shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#0B1120] text-slate-400 text-xs mt-12 border-t border-slate-800/80">
      
      {/* Subtle Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

      {/* 1. Sleek Compact Trust Badges Strip (Single line, lightweight) */}
      <div className="border-b border-slate-800/60 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 py-3.5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="text-slate-300 font-medium text-xs">100% Genuine Brands</span>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300 font-medium text-xs">Fast Pan-India Delivery</span>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-2">
            <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-slate-300 font-medium text-xs">7-Day Easy Returns</span>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Headphones className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="text-slate-300 font-medium text-xs">24/7 Priority Support</span>
          </div>
        </div>
      </div>

      {/* 2. Main Compact Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8">
        
        {/* Brand Summary */}
        <div className="col-span-2 space-y-2.5">
          <Link to={getLogoRedirectPath()} className="inline-block text-lg font-black text-white font-['Outfit'] select-none">
            A2Z<span className="text-blue-500 font-extrabold">~cart</span>
          </Link>
          <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
            Next-gen multi-vendor marketplace featuring verified brand products, 3D interactive previews, and secure checkout.
          </p>
          
          {/* Social Icons Inline */}
          <div className="flex items-center gap-2 pt-1">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-400 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              title="Twitter"
            >
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 hover:border-pink-500 text-slate-400 hover:text-pink-400 flex items-center justify-center transition-colors"
              title="Instagram"
            >
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-600 text-slate-400 hover:text-blue-400 flex items-center justify-center transition-colors"
              title="LinkedIn"
            >
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Categories Column */}
        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-2.5">Categories</h4>
          <ul className="space-y-1.5 text-xs text-slate-400">
            {CATEGORIES.filter(c => c.id !== 'all').slice(0, 5).map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => handleCategoryNavigate(cat.id)}
                  className="hover:text-blue-400 transition-colors cursor-pointer text-left"
                >
                  {cat.name.split(' & ')[0]}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Sell & Partner Column */}
        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-2.5">Sell & Partner</h4>
          <ul className="space-y-1.5 text-xs text-slate-400">
            <li>
              <Link to="/seller-onboarding" className="text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1">
                <span>Sell on A2Z</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </li>
            <li><Link to="/seller/dashboard" className="hover:text-white transition-colors">Seller Dashboard</Link></li>
            <li><Link to="/seller-onboarding" className="hover:text-white transition-colors">Commission & Fees</Link></li>
            <li><Link to="/admin/dashboard" className="hover:text-white transition-colors">Governance</Link></li>
          </ul>
        </div>

        {/* Customer Help Column */}
        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-2.5">Customer Care</h4>
          <ul className="space-y-1.5 text-xs text-slate-400">
            <li><Link to="/buyer/dashboard" className="hover:text-white transition-colors">Track Orders</Link></li>
            <li><Link to="/shop" className="hover:text-white transition-colors">Returns & Refunds</Link></li>
            <li><Link to="/shop" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/shop" className="hover:text-white transition-colors">Terms of Service</Link></li>
          </ul>
        </div>

      </div>

      {/* 3. Bottom Compact Bar */}
      <div className="border-t border-slate-800/80 bg-slate-950/60 py-3.5">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} A2Z~cart India Ltd.</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-slate-400">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>100% Secure Checkout</span>
            </span>
          </div>

          {/* Payment & Back to Top */}
          <div className="flex items-center gap-3.5">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
              <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">UPI</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">Cards</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">RuPay</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">COD</span>
            </div>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs"
              title="Back to Top"
            >
              <span>Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

    </footer>
  );
}
