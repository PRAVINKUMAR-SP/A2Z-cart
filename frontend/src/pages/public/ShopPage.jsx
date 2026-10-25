import React from 'react';
import { Search } from 'lucide-react';
import ProductCard from '../../components/product/ProductCard';
import { useProductStore } from '../../store/productStore';
import { CATEGORIES } from '../../utils/constants';

export default function ShopPage() {
  const {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    getFilteredProducts,
  } = useProductStore();

  const filteredProducts = getFilteredProducts();
  const currentCategory = CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <div>
      {/* Category Show Section: Placed right between Navbar and Products */}
      <section className="bg-white border-b border-slate-200/80 shadow-2xs py-3.5 sm:py-6">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-start sm:justify-center gap-3.5 sm:gap-8 md:gap-10 overflow-x-auto no-scrollbar py-1 scroll-smooth">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id || (!selectedCategory && cat.id === 'all');
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="flex flex-col items-center group shrink-0 focus:outline-none transition-all cursor-pointer select-none"
                >
                  <div
                    className={`relative w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden transition-all duration-300 ${
                      isSelected
                        ? 'ring-3 ring-blue-600 ring-offset-2 scale-105 shadow-md'
                        : 'ring-2 ring-slate-100 group-hover:ring-blue-300 group-hover:scale-105 shadow-xs'
                    }`}
                  >
                    <img
                      src={cat.banner}
                      alt={cat.shortName || cat.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    {cat.id === 'all' && (
                      <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-[0.5px] flex items-center justify-center">
                        <span className="text-[10px] sm:text-xs font-black text-white uppercase tracking-wider bg-black/40 px-2 py-0.5 rounded-full">
                          All
                        </span>
                      </div>
                    )}
                  </div>
                  <span
                    className={`mt-2 text-[11px] sm:text-[13px] transition-colors whitespace-nowrap ${
                      isSelected
                        ? 'text-blue-600 font-bold'
                        : 'text-slate-700 font-medium group-hover:text-blue-600'
                    }`}
                  >
                    {cat.shortName || cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Catalog Products Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
        {/* Header Banner */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-slate-200">
          <div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-3xl font-black text-slate-900 font-['Outfit']">
                {selectedCategory === 'all' || !selectedCategory
                  ? 'Marketplace Catalog'
                  : `${currentCategory?.shortName || 'Category'} Collection`}
              </h1>
              {selectedCategory && selectedCategory !== 'all' && (
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="text-[11px] sm:text-xs px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-blue-600 font-bold transition-all shadow-2xs"
                  title="Show all products"
                >
                  Show All Products
                </button>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
              Showing {filteredProducts.length} verified products available for instant dispatch
            </p>
          </div>

          {/* Top Sorting Controls */}
          <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-500 shadow-xs cursor-pointer"
            >
              <option value="featured">Featured & Recommended</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>
        </div>


        {/* Full-width Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 sm:p-16 text-center border border-slate-200 shadow-xs space-y-4 max-w-lg mx-auto my-8">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No matching products found</h3>
            <p className="text-xs text-slate-500">
              We couldn't find any products in this category matching your criteria.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              View All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
