import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Sparkles, CheckCircle2, Heart, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { formatPrice } from '../../utils/formatters';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const productLink = isAuthenticated ? `/product/${product.id}` : '/register';

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast('Please create an account to start shopping!', { icon: '🛍️' });
      navigate('/register');
      return;
    }
    addItem(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast('Please create an account to save items!', { icon: '🤍' });
      navigate('/register');
      return;
    }
    const nextState = !isWishlisted;
    setIsWishlisted(nextState);
    toast.success(nextState ? `Saved ${product.name} to wishlist!` : `Removed from wishlist`);
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative">
      <div>
        {/* Product Image Container */}
        <Link to={productLink} className="relative block overflow-hidden bg-slate-100 aspect-[4/5]">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.has3DModel && (
              <div className="bg-slate-900/85 backdrop-blur-md text-cyan-300 border border-cyan-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>3D Spatial View</span>
              </div>
            )}
            {product.discountPercent > 0 && (
              <div className="bg-gradient-to-r from-red-600 to-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-md w-fit">
                {product.discountPercent}% OFF
              </div>
            )}
          </div>

          {/* Floating Wishlist Heart */}
          <button
            onClick={handleToggleWishlist}
            className={`absolute top-3 right-3 p-1.5 rounded-full backdrop-blur-md border transition-all z-10 ${
              isWishlisted
                ? 'bg-rose-50 border-rose-300 text-rose-500'
                : 'bg-white/80 border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-white'
            }`}
            title="Add to Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
          </button>
        </Link>

        {/* Content Info */}
        <div className="p-3 sm:p-4">
          {/* Seller / Brand Info */}
          <div className="flex items-center gap-1.5 mb-1 sm:mb-1.5">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 truncate max-w-[120px] sm:max-w-[170px]">
              {product.sellerName}
            </span>
            <CheckCircle2 className="w-3 h-3 text-blue-500 shrink-0" title="Verified Brand Seller" />
          </div>

          {/* Title */}
          <Link to={productLink}>
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2 hover:text-blue-600 transition-colors mb-1.5 sm:mb-2 min-h-[32px] sm:min-h-[38px]">
              {product.name}
            </h3>
          </Link>

          {/* Ratings & Express Delivery */}
          <div className="flex items-center justify-between mb-2 sm:mb-2.5">
            <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold border border-amber-200">
              <span>{product.rating}</span>
              <Star className="w-2.5 sm:w-3 h-2.5 sm:h-3 fill-amber-500 text-amber-500" />
              <span className="text-[9px] sm:text-[10px] text-amber-600 font-medium">({product.reviewsCount})</span>
            </div>

            <span className="text-[9px] sm:text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
              <Zap className="w-2.5 sm:w-3 h-2.5 sm:h-3 fill-emerald-500 text-emerald-500" />
              <span className="hidden xs:inline">Free Delivery</span>
              <span className="xs:hidden">Free</span>
            </span>
          </div>

          {/* Price Section */}
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-sm sm:text-base md:text-lg font-black text-slate-900 font-['Outfit']">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-3 pt-0 sm:p-4 sm:pt-0">
        <button
          onClick={handleAddToCart}
          className="w-full py-2 sm:py-2.5 px-2.5 sm:px-4 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-colors duration-200 shadow-sm"
        >
          <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
}
