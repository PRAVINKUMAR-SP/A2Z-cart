import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { INITIAL_PRODUCTS } from '../utils/constants';

export const useProductStore = create(
  persist(
    (set, get) => ({
      products: [],
      selectedCategory: 'all',
      searchQuery: '',
      priceRange: [0, 30000000], // 0 to ₹3,00,000 in paise
      filter3DOnly: false,
      sortBy: 'featured', // featured, price-asc, price-desc, rating

      setSelectedCategory: (cat) => set({ selectedCategory: cat }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      setPriceRange: (range) => set({ priceRange: range }),
      setFilter3DOnly: (val) => set({ filter3DOnly: val }),
      setSortBy: (sort) => set({ sortBy: sort }),

      fetchProductsFromDb: async () => {
        try {
          const res = await fetch('/api/products');
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              const formattedDbProducts = data.map((p) => ({
                id: `prod-db-${p.id}`,
                dbId: p.id,
                name: p.name,
                category: p.category || 'electronics',
                tagline: p.tagline || '',
                description: p.description || '',
                price: p.price,
                originalPrice: p.originalPrice || Math.round(p.price * 1.4),
                discountPercent: p.discountPercent || (p.originalPrice > p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 25),
                stock: p.stock || 20,
                rating: p.rating || 4.8,
                reviewsCount: p.reviewsCount || 10,
                has3DModel: Boolean(p.has3DModel),
                modelShape: p.modelShape,
                image: p.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
                images: [p.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'],
                sellerName: p.sellerName || 'Abi',
                sellerId: p.sellerId || p.seller?.id || (p.sellerName?.toLowerCase() === 'abi' ? 6 : 5),
                sellerStatus: 'APPROVED',
                createdAt: p.createdAt || new Date().toISOString(),
              }));

              set({ products: formattedDbProducts });
            }
          }
        } catch (e) {
          console.warn('Failed to fetch products from db:', e);
        }
      },

      addProduct: (newProduct) => {
        const product = {
          ...newProduct,
          id: newProduct.id || `prod-${Date.now()}`,
          rating: newProduct.rating || 5.0,
          reviewsCount: newProduct.reviewsCount || 1,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ products: [product, ...state.products] }));

        // Asynchronously sync to backend PostgreSQL database
        try {
          fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: product.name,
              category: product.category,
              price: product.price,
              originalPrice: product.originalPrice,
              discountPercent: product.discountPercent,
              stock: product.stock,
              tagline: product.tagline,
              description: product.description,
              image: product.image,
              sellerName: product.sellerName,
            }),
          }).catch(() => {});
        } catch (e) {}

        return product;
      },

      addProducts: (productsList) => {
        const timestamp = Date.now();
        const formatted = productsList.map((p, idx) => ({
          ...p,
          id: p.id || `prod-${timestamp}-${idx}`,
          rating: p.rating || 5.0,
          reviewsCount: p.reviewsCount || 1,
          createdAt: new Date().toISOString(),
        }));
        set((state) => ({ products: [...formatted, ...state.products] }));
        return formatted;
      },

      updateProduct: (id, fields) => {
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...fields } : p)),
        }));
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
      },

      clearAllProducts: () => {
        set({ products: [] });
      },

      resetToSampleProducts: () => {
        set({ products: INITIAL_PRODUCTS });
      },

      getSellerProducts: (sellerId) => {
        return get().products.filter((p) => p.sellerId === sellerId);
      },

      getProductById: (id) => {
        return get().products.find((p) => p.id === id);
      },

      getFilteredProducts: () => {
        const { products, selectedCategory, searchQuery, sortBy } = get();

        let list = products.filter((p) => {
          if (selectedCategory && selectedCategory !== 'all' && p.category !== selectedCategory) {
            return false;
          }
          if (searchQuery && searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            const matchesName = (p.name || '').toLowerCase().includes(q);
            const matchesDesc = (p.description || '').toLowerCase().includes(q);
            const matchesCategory = (p.category || '').toLowerCase().includes(q);
            const matchesBrand = (p.sellerName || '').toLowerCase().includes(q);
            if (!matchesName && !matchesDesc && !matchesCategory && !matchesBrand) return false;
          }
          return true;
        });

        if (sortBy === 'price-asc') list.sort((a, b) => a.price - b.price);
        else if (sortBy === 'price-desc') list.sort((a, b) => b.price - a.price);
        else if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);

        return list;
      },
    }),
    {
      name: 'a2z-products-storage-v4',
      version: 4,
      migrate: (persistedState) => {
        return {
          ...persistedState,
          products: [],
        };
      },
    }
  )
);
