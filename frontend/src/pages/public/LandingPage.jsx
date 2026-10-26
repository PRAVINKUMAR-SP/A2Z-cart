import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Sparkles, ShieldCheck, Zap, Truck, Star, 
  Store, ShoppingBag, Eye, TrendingUp, CheckCircle2,
  Clock, Heart, ShoppingCart, Tag, RotateCcw, Download, Smartphone
} from 'lucide-react';
import ProductCard from '../../components/product/ProductCard';
import { useProductStore } from '../../store/productStore';
import { CATEGORIES } from '../../utils/constants';
import { formatPrice } from '../../utils/formatters';

export default function LandingPage() {
  const navigate = useNavigate();
  const { products, setSelectedCategory } = useProductStore();
  const [activeTab, setActiveTab] = useState('all');

  // Live Flash Sale Countdown Timer
  const [timeLeft, setTimeLeft] = useState({ hours: 9, minutes: 42, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Hero Animated Single Product Showcase State (Only Product Image, Background Removed)
  const heroShowcase = [
    {
      id: 'prod-shoe-001',
      name: 'Velocity Hyper-Bounce Pro Running Shoes',
      category: 'shoes',
      categoryName: 'Shoes & Sneakers',
      shortName: 'Sneakers',
      watermark: 'SNEAKERS',
      badge: 'Min 50% OFF',
      icon: '👟',
      image: 'https://pngimg.com/uploads/running_shoes/running_shoes_PNG5787.png',
    },
    {
      id: 'prod-dress-002',
      name: 'Flora Meadow Tiered Cotton Summer Maxi Dress',
      category: 'dresses',
      categoryName: 'Dresses & Fashion',
      shortName: 'Fashion',
      watermark: 'FASHION',
      badge: 'Up to 60% OFF',
      icon: '👗',
      image: '/dress_150.png',
    },
    {
      id: 'prod-slip-001',
      name: 'CloudStep Orthopedic Ultra-Cushion Slides',
      category: 'slippers',
      categoryName: 'Slippers & Slides',
      shortName: 'Slides',
      watermark: 'SLIDES',
      badge: 'Starting ₹499',
      icon: '🩴',
      image: 'https://pngimg.com/uploads/sandals/sandals_PNG9671.png',
    },
    {
      id: 'prod-furn-003',
      name: 'Nordic Accent Velvet Lounge Armchair',
      category: 'furniture',
      categoryName: 'Furniture & Living',
      shortName: 'Furniture',
      watermark: 'LIVING',
      badge: 'Up to 55% OFF',
      icon: '🛋️',
      image: 'https://pngimg.com/uploads/armchair/armchair_PNG7022.png',
    },
    {
      id: 'prod-app-001',
      name: 'Barista Touch 20-Bar Professional Espresso Machine',
      category: 'home-appliances',
      categoryName: 'Home Appliances',
      shortName: 'Appliances',
      watermark: 'APPLIANCE',
      badge: 'Festival Deals',
      icon: '☕',
      image: 'https://pngimg.com/uploads/coffee_machine/coffee_machine_PNG102189.png',
    },
    {
      id: 'prod-toy-004',
      name: 'Super-Soft Cuddle Companion Plush Bear',
      category: 'toys',
      categoryName: 'Toys & Kids',
      shortName: 'Toys & Kids',
      watermark: 'TOYS',
      badge: 'Flat 50% OFF',
      icon: '🧸',
      image: 'https://pngimg.com/uploads/teddy_bear/teddy_bear_PNG7.png',
    },
    {
      id: 'prod-sport-004',
      name: 'FIFA Quality Pro Match Football',
      category: 'sports',
      categoryName: 'Sports & Fitness',
      shortName: 'Sports Gear',
      watermark: 'SPORTS',
      badge: 'Active Gear',
      icon: '⚽',
      image: 'https://pngimg.com/uploads/football/football_PNG52726.png',
    },
    {
      id: 'prod-001',
      name: 'Aetheris Pro Spatial Wireless Studio Headphones',
      category: 'electronics',
      categoryName: 'Electronics & Audio',
      shortName: 'Electronics',
      watermark: 'AUDIO',
      badge: 'Flagship Tech',
      icon: '🎧',
      image: 'https://pngimg.com/uploads/headphones/headphones_PNG101971.png',
    },
  ];

  const [heroCatIndex, setHeroCatIndex] = useState(0);

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setHeroCatIndex((prev) => (prev + 1) % heroShowcase.length);
    }, 4000);
    return () => clearInterval(slideTimer);
  }, [heroShowcase.length]);

  // Category specific slices for dedicated showcase sections
  const dressesProducts = products.filter((p) => p.category === 'dresses');
  const shoesProducts = products.filter((p) => p.category === 'shoes');
  const slippersProducts = products.filter((p) => p.category === 'slippers');
  const furnitureProducts = products.filter((p) => p.category === 'furniture');
  const applianceProducts = products.filter((p) => p.category === 'home-appliances');
  const toyProducts = products.filter((p) => p.category === 'toys');
  const sportProducts = products.filter((p) => p.category === 'sports');

  // Flash deals selection (top discounts)
  const flashDeals = products
    .filter((p) => p.discountPercent >= 50)
    .slice(0, 4);

  // Tab filtering for the explore grid
  const tabFilteredProducts = products.filter((p) => {
    if (activeTab === 'all') return true;
    return p.category === activeTab;
  });

  const categoryThumbnails = {
    'dresses': '/dress_150.png',
    'shoes': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
    'slippers': 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=500&q=80',
    'furniture': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&q=80',
    'home-appliances': 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=500&q=80',
    'toys': 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500&q=80',
    'sports': 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&q=80',
    'electronics': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
  };

  const handleCategoryClick = (catId) => {
    setSelectedCategory(catId);
    navigate('/shop');
  };

  const currentItem = heroShowcase[heroCatIndex] || heroShowcase[0];
  const currentWatermark = currentItem.watermark || 'SNEAKERS';
  const splitMid = Math.ceil(currentWatermark.length / 2);
  const splitLeftWord = currentWatermark.slice(0, splitMid);
  const splitRightWord = currentWatermark.slice(splitMid);

  return (
    <div className="w-full bg-[#FAFBFD] text-slate-800 pb-24 space-y-16">

      {/* 1. Human-Crafted Marketplace Hero Banner */}
      <section className="w-full min-h-0 lg:min-h-[calc(100vh-60px)] lg:h-[calc(100vh-60px)] py-6 sm:py-8 lg:py-0 bg-gradient-to-b from-blue-50/70 via-indigo-50/30 to-[#FAFBFD] border-b border-slate-200/60 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center">
            
            {/* Left Promotional Content */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-6">

              <h1 className="text-2.5xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 font-['Outfit'] leading-[1.1]">
                Everything you love, <br />
                <span className="text-blue-600">from A to Z.</span>
              </h1>

              <p className="text-slate-600 text-sm sm:text-lg max-w-xl leading-relaxed">
                Discover millions of authentic products from India's top verified brands. From designer dresses and high-performance sneakers to solid wood furniture, smart home appliances, toys, and sports gear.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 pt-1 sm:pt-2">
                <Link
                  to="/shop"
                  className="px-6 sm:px-8 py-3 sm:py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Start Shopping</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="/a2z-cart.apk"
                  download="A2Z-cart.apk"
                  className="px-5 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-full font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02]"
                  title="Download Official Android App APK"
                >
                  <Download className="w-4 h-4" />
                  <span>Download App</span>
                </a>

                <Link
                  to="/seller-onboarding"
                  className="px-5 sm:px-7 py-3 sm:py-3.5 bg-white hover:bg-slate-50 text-slate-700 rounded-full font-semibold text-xs sm:text-sm border border-slate-300 shadow-xs transition-all hover:border-slate-400"
                >
                  <span>Sell on A2Z</span>
                </Link>
              </div>

              {/* Trust Pillars Checklist */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-200/80 text-[11px] sm:text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Genuine</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Free 1-Day Delivery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>7-Day Return</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Secure Payments</span>
                </div>
              </div>
            </div>

            {/* Right: Nike Split Animated Category Typography & Interactive Product Entrance */}
            <div className="lg:col-span-6 relative flex flex-col items-center justify-center select-none py-2">
              
              {/* 1. Interactive Product (Drops from top) */}
              <div 
                key={`product-container-${heroCatIndex}`}
                className="relative z-10 w-full h-[220px] sm:h-[300px] lg:h-[380px] flex items-center justify-center animate-product-enter"
              >
                <Link
                  to={`/product/${currentItem.id}`}
                  className="group relative flex flex-col items-center justify-center w-full h-full cursor-pointer focus:outline-none"
                  title={`View ${currentItem.name}`}
                >
                  {/* Floating Clean Cutout Product Image - Background Removed */}
                  <img
                    src={currentItem.image}
                    alt={currentItem.name}
                    className="max-h-[190px] sm:max-h-[260px] lg:max-h-[340px] w-auto max-w-[85%] object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.18)] group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-500"
                  />

                  {/* Soft Radial Ambient Shadow beneath the product */}
                  <div className="w-40 sm:w-64 h-4 sm:h-5 bg-slate-400/25 rounded-full blur-lg mt-1 sm:mt-2 group-hover:w-48 sm:group-hover:w-56 group-hover:bg-slate-400/35 transition-all duration-500" />
                </Link>
              </div>

              {/* 2. Split Category Typography in Red (Below product) */}
              <div 
                key={`split-text-${heroCatIndex}`}
                className="relative z-0 flex items-center justify-center pointer-events-none select-none -mt-2 sm:-mt-3 px-2"
              >
                <span className="nike-stroke-red text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black italic tracking-wide uppercase leading-none animate-split-left inline-block">
                  {splitLeftWord}
                </span>
                <span className="nike-stroke-red text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black italic tracking-wide uppercase leading-none animate-split-right inline-block ml-1">
                  {splitRightWord}
                </span>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 2. Category Quick Navigation Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">Shop by Category</h2>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Explore our most popular departments with verified sellers</p>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-6 lg:gap-8 justify-items-center">
          {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
            const thumbImg = categoryThumbnails[cat.id] || cat.banner;

            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="group flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 hover:-translate-y-1.5 focus:outline-none"
              >
                {/* Large Plain Image Thumbnail - No Box, No Outer Border */}
                <div className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-slate-100 shadow-xs group-hover:shadow-lg transition-all duration-300">
                  <img
                    src={thumbImg}
                    alt={cat.name}
                    className={`w-full h-full ${cat.id === 'dresses' ? 'object-cover object-top' : 'object-cover object-center'} group-hover:scale-110 transition-transform duration-300`}
                    loading="lazy"
                  />
                </div>
                {/* Only Category Name */}
                <span className="mt-1.5 sm:mt-2.5 font-semibold text-[11px] sm:text-xs text-slate-800 group-hover:text-blue-600 transition-colors block text-center truncate max-w-[75px] sm:max-w-[110px]">
                  {cat.name.split(' & ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Deal of the Day / Flash Steals Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          
          {/* Header & Countdown */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/15">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-300 text-xs font-black uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                <span>Steal of the Day</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-['Outfit']">
                Limited Stock Flash Offers — Minimum 50% Off
              </h2>
              <p className="text-indigo-100 text-xs sm:text-sm">
                Extra ₹500 off at checkout with coupon code <code className="bg-white/20 px-2 py-0.5 rounded font-mono font-bold">A2ZSAVE</code>
              </p>
            </div>

            {/* Countdown Box */}
            <div className="flex items-center gap-2.5 bg-black/35 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20">
              <Clock className="w-4 h-4 text-amber-300 mr-1" />
              <div className="text-center">
                <span className="text-xl font-black font-mono">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="block text-[9px] uppercase font-bold text-indigo-200">Hours</span>
              </div>
              <span className="text-lg font-bold text-indigo-200">:</span>
              <div className="text-center">
                <span className="text-xl font-black font-mono">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="block text-[9px] uppercase font-bold text-indigo-200">Mins</span>
              </div>
              <span className="text-lg font-bold text-indigo-200">:</span>
              <div className="text-center">
                <span className="text-xl font-black font-mono">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="block text-[9px] uppercase font-bold text-indigo-200">Secs</span>
              </div>
            </div>
          </div>

          {/* Flash Deal Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
            {flashDeals.map((product) => (
              <div
                key={product.id}
                className="bg-white text-slate-800 rounded-2xl p-3.5 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-44 rounded-xl overflow-hidden bg-slate-50 mb-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                      {product.discountPercent}% OFF
                    </span>
                    <span className="absolute top-2 right-2 bg-amber-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-slate-900" />
                      {product.rating}
                    </span>
                  </div>

                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    {product.category}
                  </span>
                  <Link to={`/product/${product.id}`}>
                    <h4 className="font-bold text-slate-900 text-xs line-clamp-2 hover:text-blue-600 transition-colors mb-2">
                      {product.name}
                    </h4>
                  </Link>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-black text-slate-900 font-['Outfit']">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-[11px] text-slate-400 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/product/${product.id}`}
                    className="p-2 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white transition-colors"
                    title="View Deal"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. SECTION: DRESSES & FASHION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">👗</span>
              <h2 className="text-2xl font-black text-slate-900 font-['Outfit']">
                Trending Dresses & Ethnic Apparel
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Pure Chanderi silk Anarkalis, breezy floral maxis, evening cocktail dresses & luxury linen sets
            </p>
          </div>
          <button 
            onClick={() => handleCategoryClick('dresses')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
          >
            <span>See All Dresses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {dressesProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. SECTION: SHOES & SNEAKERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">👟</span>
              <h2 className="text-2xl font-black text-slate-900 font-['Outfit']">
                Footwear Spotlight: Shoes & Sneakers
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Nitrogen foam marathon runners, Italian handcrafted leather Oxfords, retro high-top canvas & trail shoes
            </p>
          </div>
          <button 
            onClick={() => handleCategoryClick('shoes')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
          >
            <span>See All Shoes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {shoesProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. SECTION: SLIPPERS & SLIDES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🩴</span>
              <h2 className="text-2xl font-black text-slate-900 font-['Outfit']">
                Everyday Comfort: Slippers & Slides
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Physiotherapist-recommended orthopedic cloud slides, leather thongs, sherpa house clogs & beach flip-flops
            </p>
          </div>
          <button 
            onClick={() => handleCategoryClick('slippers')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
          >
            <span>See All Slippers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {slippersProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 7. SECTION: FURNITURE & LIVING */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🛋️</span>
              <h2 className="text-2xl font-black text-slate-900 font-['Outfit']">
                Living & Workspace: Premium Furniture
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              High-back ergonomic mesh chairs, 100% seasoned Sheesham desks, velvet accent armchairs & industrial bookshelves
            </p>
          </div>
          <button 
            onClick={() => handleCategoryClick('furniture')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
          >
            <span>See All Furniture</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {furnitureProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 8. SECTION: HOME APPLIANCES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">☕</span>
              <h2 className="text-2xl font-black text-slate-900 font-['Outfit']">
                Smart Home & Kitchen Appliances
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              20-Bar espresso coffee machines, LiDAR robotic vacuum mops, rapid vortex air fryers & 1200W pro blenders
            </p>
          </div>
          <button 
            onClick={() => handleCategoryClick('home-appliances')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
          >
            <span>See All Appliances</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {applianceProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 9. SECTION: TOYS & KIDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🧸</span>
              <h2 className="text-2xl font-black text-slate-900 font-['Outfit']">
                Play, Learn & Grow: Toys & Games
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              STEM space shuttle construction kits, Montessori educational wooden cubes, 4WD stunt RC buggies & giant plush bears
            </p>
          </div>
          <button 
            onClick={() => handleCategoryClick('toys')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
          >
            <span>See All Toys</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {toyProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 10. SECTION: SPORTS & FITNESS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🏸</span>
              <h2 className="text-2xl font-black text-slate-900 font-['Outfit']">
                Active Living: Sports & Fitness Gear
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Laser-aligned eco rubber yoga mats, quick-dial adjustable smart dumbbells, high-modulus badminton duos & match footballs
            </p>
          </div>
          <button 
            onClick={() => handleCategoryClick('sports')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
          >
            <span>See All Sports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {sportProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 11. Interactive Category Filter Tabs Mega Catalog */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 font-['Outfit']">
              Complete Marketplace Catalog
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {tabFilteredProducts.length} verified listings ready for dispatch
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-2xl text-xs font-semibold">
            {[
              { id: 'all', label: 'All Items' },
              { id: 'dresses', label: 'Dresses' },
              { id: 'shoes', label: 'Shoes' },
              { id: 'slippers', label: 'Slippers' },
              { id: 'furniture', label: 'Furniture' },
              { id: 'home-appliances', label: 'Appliances' },
              { id: 'toys', label: 'Toys' },
              { id: 'sports', label: 'Sports' },
              { id: 'electronics', label: 'Electronics' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {tabFilteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 12. Dedicated Mobile App Download Showcase Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-12 text-white shadow-2xl relative overflow-hidden border border-slate-800">
          {/* Ambient Glows */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
                <Smartphone className="w-4 h-4 text-blue-400" />
                <span>Official Mobile App Available</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black font-['Outfit'] tracking-tight">
                Shop on the Go with the <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400">
                  A2Z~cart Android App
                </span>
              </h2>

              <p className="text-slate-300 text-xs sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Enjoy a native, fluid mobile experience with 3D product previews, real-time shipment updates, quick-access cart, and exclusive app-only deals.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-left text-xs font-semibold text-slate-300 max-w-lg mx-auto lg:mx-0">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>3D Spatial Models</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Cloud Cart Sync</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Express Checkout</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <a
                  href="/a2z-cart.apk"
                  download="A2Z-cart.apk"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-blue-600/30 flex items-center gap-3.5 transition-all hover:scale-105"
                >
                  <Download className="w-5 h-5 text-white animate-bounce" />
                  <div className="text-left leading-tight">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-blue-200">Direct Download</p>
                    <p className="text-sm font-black">Download Android APK (Auto-Update)</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="lg:col-span-4 flex items-center justify-center">
              <div className="relative w-52 sm:w-60 h-[320px] sm:h-[380px] bg-slate-800/80 rounded-[36px] p-3 border-4 border-slate-700 shadow-2xl flex flex-col items-center justify-between">
                <div className="w-20 h-4 bg-slate-900 rounded-full mb-2" />
                <div className="flex-1 w-full bg-slate-900/90 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                    <ShoppingBag className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white font-['Outfit']">A2Z~cart</p>
                    <p className="text-[10px] text-blue-300">Android Edition v1.0</p>
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    Live Cloud Sync
                  </span>
                </div>
                <div className="w-12 h-1 bg-slate-600 rounded-full mt-2" />
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
