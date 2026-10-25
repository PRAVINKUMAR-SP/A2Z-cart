import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Star, ShoppingCart, Zap, ShieldCheck, Truck, RotateCcw, 
  Sparkles, CheckCircle2, ChevronRight, Store, MapPin, Eye, Image as ImageIcon,
  Heart, ZoomIn, ZoomOut, Maximize2, X, SlidersHorizontal
} from 'lucide-react';
import Product3DViewer from '../../components/three/Product3DViewer';
import ProductCard from '../../components/product/ProductCard';
import { useProductStore } from '../../store/productStore';
import { useCartStore } from '../../store/cartStore';
import { formatPrice } from '../../utils/formatters';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProductById, products, setSelectedCategory } = useProductStore();
  const { addItem } = useCartStore();

  const product = getProductById(id) || getProductById('prod-001');

  const [viewMode, setViewMode] = useState('gallery'); // Default to high-res photography gallery
  const [selectedImage, setSelectedImage] = useState(product?.image);
  const [imageFit, setImageFit] = useState('cover'); // 'cover' fills the card beautifully, 'contain' shows uncropped
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxScale, setLightboxScale] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [suggestionTab, setSuggestionTab] = useState('category'); // 'category' | 'seller'
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('560001');
  const [pincodeChecked, setPincodeChecked] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  useEffect(() => {
    if (product?.image) {
      setSelectedImage(product.image);
    }
  }, [product?.id, product?.image]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
    };
    if (isLightboxOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Product Not Found</h2>
        <Link to="/shop" className="text-blue-600 underline mt-4 inline-block font-semibold">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`Added ${quantity} × ${product.name} to cart!`);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    navigate('/checkout');
  };

  const handleToggleWishlist = () => {
    const next = !isWishlisted;
    setIsWishlisted(next);
    toast.success(next ? `Saved ${product.name} to wishlist!` : 'Removed from wishlist');
  };

  // Suggested & Related Products
  const sameCategoryProducts = (products || []).filter(
    (p) => String(p.id) !== String(product.id) && String(p.dbId) !== String(product.dbId) && p.category === product.category
  );

  const sameSellerProducts = (products || []).filter(
    (p) => String(p.id) !== String(product.id) && String(p.dbId) !== String(product.dbId) && ((p.sellerName && product.sellerName && p.sellerName.toLowerCase() === product.sellerName.toLowerCase()) || (p.sellerId && product.sellerId && p.sellerId === product.sellerId))
  );

  const fallbackOtherProducts = (products || []).filter(
    (p) => String(p.id) !== String(product.id) && String(p.dbId) !== String(product.dbId) && p.category !== product.category
  );

  const categorySuggestions = sameCategoryProducts.length >= 4 
    ? sameCategoryProducts.slice(0, 8) 
    : [...sameCategoryProducts, ...fallbackOtherProducts].slice(0, 8);

  const sellerSuggestions = sameSellerProducts.length >= 4
    ? sameSellerProducts.slice(0, 8)
    : [...sameSellerProducts, ...fallbackOtherProducts].slice(0, 8);

  const activeSuggestions = suggestionTab === 'seller' ? sellerSuggestions : categorySuggestions;
  const categoryDisplayName = (product.category || 'All').replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6 sm:space-y-8 pb-24 sm:pb-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/shop" className="hover:text-blue-600">Marketplace</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-400 capitalize">{product.category}</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800 font-bold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: 3D Spatial Canvas vs Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* View Mode Switcher Toggle */}
          {product.has3DModel && (
            <div className="flex items-center justify-between bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                onClick={() => setViewMode('3d')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  viewMode === '3d'
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Interactive 3D Spatial View</span>
              </button>

              <button
                onClick={() => setViewMode('gallery')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  viewMode === 'gallery'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>High-Res Photo Gallery</span>
              </button>
            </div>
          )}

          {/* Visual Display */}
          {viewMode === '3d' && product.has3DModel ? (
            <Product3DViewer shape={product.modelShape || 'headphones'} productName={product.name} />
          ) : (
            <div
              className="relative w-full h-[340px] sm:h-[580px] lg:h-[620px] rounded-3xl overflow-hidden bg-gradient-to-b from-slate-50 via-slate-100/40 to-slate-100 border border-slate-200/90 shadow-sm group select-none cursor-zoom-in"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
                setZoomPos({ x, y });
              }}
              onClick={() => {
                setLightboxScale(1);
                setIsLightboxOpen(true);
              }}
            >
              <img
                src={selectedImage || product.image}
                alt={product.name}
                style={{
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transform: isZoomed ? 'scale(2.2)' : 'scale(1)',
                  transition: isZoomed ? 'transform 0.08s ease-out' : 'transform 0.3s ease-out',
                }}
                className={`w-full h-full pointer-events-none transition-all duration-300 ${
                  imageFit === 'cover'
                    ? 'object-cover object-top sm:object-center'
                    : 'object-contain p-4'
                }`}
              />

              {/* Top Badges & Controls Overlay */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-auto z-10">
                <div className="flex items-center gap-2">
                  {product.discountPercent > 0 && (
                    <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
                      {product.discountPercent}% OFF
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageFit(imageFit === 'cover' ? 'contain' : 'cover');
                    }}
                    className="px-2.5 py-1 rounded-full bg-white/90 hover:bg-white backdrop-blur-md border border-slate-200/90 text-slate-700 text-[11px] font-bold shadow-xs transition-all flex items-center gap-1.5"
                    title="Toggle crop to fill card or fit entire photo"
                  >
                    <SlidersHorizontal className="w-3 h-3 text-slate-500" />
                    <span>{imageFit === 'cover' ? 'Fit Whole' : 'Fill Card'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleWishlist();
                    }}
                    className={`p-2 rounded-full backdrop-blur-md border shadow-xs transition-all ${
                      isWishlisted
                        ? 'bg-rose-50 border-rose-300 text-rose-500'
                        : 'bg-white/90 border-slate-200/90 text-slate-600 hover:text-rose-500 hover:bg-white'
                    }`}
                    title="Save to Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxScale(1);
                      setIsLightboxOpen(true);
                    }}
                    className="p-2 rounded-full bg-white/90 hover:bg-white backdrop-blur-md border border-slate-200/90 text-slate-700 shadow-xs transition-all hover:scale-105"
                    title="Expand Fullscreen"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bottom Floating Zoom Hint */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none transition-opacity duration-300 z-10">
                <span className={`px-3 py-1 rounded-full backdrop-blur-md text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-opacity ${
                  isZoomed ? 'opacity-0' : 'bg-slate-900/80 text-white opacity-90'
                }`}>
                  <ZoomIn className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Hover to zoom details • Click to expand</span>
                </span>
              </div>
            </div>
          )}

          {/* Thumbnail Gallery Row */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1 pt-1">
            {(product.images && product.images.length > 0 ? product.images : [product.image]).map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedImage(img);
                  setViewMode('gallery');
                }}
                className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-slate-100 relative group/thumb ${
                  selectedImage === img && viewMode === 'gallery'
                    ? 'border-blue-600 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200/90 opacity-75 hover:opacity-100 hover:border-slate-300'
                }`}
              >
                <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover object-center" />
                <div className="absolute inset-0 bg-black/5 group-hover/thumb:bg-transparent transition-colors" />
              </button>
            ))}
          </div>

          {/* Flipkart / Amazon Trust Guarantees */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-center space-y-1">
              <ShieldCheck className="w-4 h-4 text-blue-600 mx-auto" />
              <p className="text-[10px] font-bold text-slate-800">100% Genuine</p>
              <p className="text-[9px] text-slate-400">Direct from Brand</p>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-center space-y-1">
              <RotateCcw className="w-4 h-4 text-emerald-600 mx-auto" />
              <p className="text-[10px] font-bold text-slate-800">7 Days Return</p>
              <p className="text-[9px] text-slate-400">Easy Replacement</p>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-center space-y-1">
              <Truck className="w-4 h-4 text-amber-600 mx-auto" />
              <p className="text-[10px] font-bold text-slate-800">Free Express</p>
              <p className="text-[9px] text-slate-400">Fast 2-Day Transit</p>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-center space-y-1">
              <Zap className="w-4 h-4 text-purple-600 mx-auto" />
              <p className="text-[10px] font-bold text-slate-800">100% Secure</p>
              <p className="text-[9px] text-slate-400">Bank-Grade Encryption</p>
            </div>
          </div>
        </div>

        {/* Center & Right Column: Details, Pricing, Specs & Buy Box */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Header & Seller Tag */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-100 text-blue-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Store className="w-3 h-3" />
                <span>Sold By: {product.sellerName}</span>
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified Seller</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug font-['Outfit']">
              {product.name}
            </h1>

            {product.tagline && (
              <p className="text-sm font-semibold text-slate-500 mt-1">
                {product.tagline.toLowerCase().includes('flipkart')
                  ? 'Pure Handcrafted Artisan Collection • Direct Weaver Quality Assured'
                  : product.tagline}
              </p>
            )}

            {/* Ratings */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1 bg-emerald-600 text-white px-2.5 py-0.5 rounded-md text-xs font-black shadow-xs">
                <span>{product.rating}</span>
                <Star className="w-3 h-3 fill-white" />
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {product.reviewsCount} Verified Customer Ratings & Reviews
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-slate-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {product.discountPercent > 0 && (
                <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                  {product.discountPercent}% Instant Savings
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Inclusive of all taxes. Free express shipping on orders over ₹999.
            </p>
          </div>

          {/* Bank Offers Banner */}
          <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl text-xs space-y-1.5">
            <span className="font-bold text-amber-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Available Marketplace Offers:</span>
            </span>
            <p className="text-amber-800 text-[11px]">
              • <strong>Bank Offer:</strong> 10% Instant Discount up to ₹1,500 on ICICI / HDFC Credit Cards.
            </p>
            <p className="text-amber-800 text-[11px]">
              • <strong>Special Coupon:</strong> Use code <code className="bg-amber-200/60 px-1.5 py-0.5 rounded font-mono font-bold">A2ZFIRST</code> at checkout for flat ₹500 off.
            </p>
          </div>

          {/* Stock & Purchase Actions */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-2 text-slate-600 hover:text-slate-900 font-bold text-sm"
                >
                  -
                </button>
                <span className="px-4 py-2 text-xs font-bold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                  className="px-3.5 py-2 text-slate-600 hover:text-slate-900 font-bold text-sm"
                >
                  +
                </button>
              </div>

              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                In Stock ({product.stock} units remaining)
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleAddToCart}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>

          {/* Pin-Code Estimator */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Check Delivery to Your Pincode</span>
              </span>
              {pincodeChecked && (
                <span className="text-xs font-bold text-emerald-600">
                  Delivered by 26 Oct (Express 2-Day)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Enter 6-digit Pincode"
                className="px-3 py-2 bg-slate-100 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500 w-44"
                maxLength={6}
              />
              <button
                onClick={() => setPincodeChecked(true)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all"
              >
                Check
              </button>
            </div>
          </div>

          {/* Description & Specs Accordion */}
          <div className="space-y-4 pt-2">
            <div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">Product Description</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {product.description || 'Authentic quality product backed by marketplace guarantee.'}
              </p>
            </div>

            {product.specs && Object.keys(product.specs).length > 0 && (
              <div>
                <h3 className="font-bold text-sm text-slate-900 mb-2">Technical Specifications</h3>
                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
                  {Object.entries(product.specs).map(([key, val]) => (
                    <div key={key} className="grid grid-cols-3 p-3 bg-white">
                      <span className="font-semibold text-slate-500 col-span-1">{key}</span>
                      <span className="text-slate-800 font-medium col-span-2">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Suggested & Related Products Section */}
      {activeSuggestions.length > 0 && (
        <section className="pt-10 border-t border-slate-200/80 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 shadow-2xs">
                  <Sparkles className="w-4 h-4" />
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-blue-600">
                  Recommended For You
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">
                {suggestionTab === 'category' 
                  ? `Similar Products in ${categoryDisplayName}` 
                  : `More Deals from ${product.sellerName || 'Abi'} Store`}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {suggestionTab === 'category'
                  ? `Handpicked recommendations matching your interest in ${categoryDisplayName.toLowerCase()}`
                  : `Browse popular authentic items offered by verified seller ${product.sellerName || 'Abi'}`}
              </p>
            </div>

            {/* Filter Tabs & View All button */}
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSuggestionTab('category')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    suggestionTab === 'category'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Similar Category ({sameCategoryProducts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSuggestionTab('seller')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    suggestionTab === 'seller'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  More from {product.sellerName || 'Abi'} ({sameSellerProducts.length})
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (setSelectedCategory) setSelectedCategory(product.category);
                  navigate('/shop');
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200 cursor-pointer"
              >
                <span>View All {categoryDisplayName}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {activeSuggestions.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3.5 py-2.5 shadow-lg flex items-center justify-between gap-2.5">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Price</span>
          <span className="text-base font-black text-slate-900 leading-tight truncate">
            {formatPrice(product.price)}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-1 justify-end">
          <button
            onClick={handleAddToCart}
            className="py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
          <button
            onClick={handleBuyNow}
            className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>Buy Now</span>
          </button>
        </div>
      </div>

      {/* Fullscreen High-Resolution Lightbox Modal */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white z-10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm tracking-wide text-slate-200">{product.name}</span>
              <span className="text-xs text-slate-400 hidden sm:inline">| Ultra High-Resolution Inspection</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-white/10 rounded-full p-1 border border-white/20">
                <button
                  type="button"
                  onClick={() => setLightboxScale((prev) => Math.max(0.8, prev - 0.3))}
                  className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-slate-200"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold px-2 text-slate-300">
                  {Math.round(lightboxScale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setLightboxScale((prev) => Math.min(3, prev + 0.3))}
                  className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-slate-200"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white border border-white/20 transition-colors"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Central Image Canvas */}
          <div 
            className="flex-1 flex items-center justify-center overflow-auto my-4 cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage || product.image}
              alt={product.name}
              style={{
                transform: `scale(${lightboxScale})`,
                transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl select-none"
            />
          </div>

          {/* Bottom Thumbnails & Hint */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 z-10" onClick={(e) => e.stopPropagation()}>
            <span>Click outside or press <kbd className="px-1.5 py-0.5 rounded bg-white/20 text-white font-mono text-[10px]">ESC</kbd> to close</span>
          </div>
        </div>
      )}
    </div>
  );
}
