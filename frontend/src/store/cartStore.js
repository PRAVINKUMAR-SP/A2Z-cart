import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Helper to safely get active logged in user from localStorage if not explicitly passed
const getActiveUser = (explicitUser) => {
  if (explicitUser && explicitUser.email) return explicitUser;
  try {
    const authStorage = localStorage.getItem('a2z-auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      if (parsed?.state?.user && parsed.state.user.email) {
        return parsed.state.user;
      }
    }
  } catch (e) {}
  return null;
};

// Clean up any legacy mock initial items and duplicate mock addresses so the cart always shows real user data
try {
  const existingCart = localStorage.getItem('a2z-cart-storage-v2') || localStorage.getItem('a2z-cart-storage');
  if (existingCart) {
    const parsed = JSON.parse(existingCart);
    let modified = false;
    if (parsed?.state?.items && parsed.state.items.some((i) => i.id === 'prod-001' || !i.id?.startsWith('prod-'))) {
      parsed.state.items = [];
      modified = true;
    }
    if (parsed?.state?.savedAddresses && parsed.state.savedAddresses.some((a) => a.fullName === 'Rahul Sharma' || a.id === 'addr-1' || a.id === 'addr-2')) {
      parsed.state.savedAddresses = [];
      parsed.state.selectedAddress = null;
      modified = true;
    }
    if (modified) {
      localStorage.setItem('a2z-cart-storage-v2', JSON.stringify(parsed));
      localStorage.removeItem('a2z-cart-storage');
    }
  }
} catch (e) {}

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // Cart products strictly for the currently logged-in user
      cartOwnerEmail: null, // Tracks which user owns the active in-memory cart
      selectedAddress: null, // Delivery address chosen for checkout
      savedAddresses: [], // Loaded from database for logged in user
      isAddressesLoading: false,
      isCartLoading: false,
      coupon: { code: 'A2ZFIRST', discountPaise: 50000 }, // ₹500 off welcome coupon

      // Reset cart completely when a user logs out so no other user can see their cart
      resetCartOnLogout: () => {
        set({ items: [], selectedAddress: null, cartOwnerEmail: null });
        try {
          localStorage.removeItem('a2z-cart-storage-v2');
        } catch (e) {}
      },

      // Fetch cart products strictly for THIS particular user from PostgreSQL Database
      fetchCartFromDb: async (user = null) => {
        const activeUser = getActiveUser(user);
        if (!activeUser || !activeUser.email) {
          // If no user is logged in, DO NOT show any previous user's cart products!
          set({ items: [], cartOwnerEmail: null, isCartLoading: false });
          return [];
        }

        const normalizedEmail = activeUser.email.trim().toLowerCase();

        // If another user was previously loaded, clear out old items immediately
        if (get().cartOwnerEmail && get().cartOwnerEmail !== normalizedEmail) {
          set({ items: [], cartOwnerEmail: normalizedEmail });
        }

        set({ isCartLoading: true, cartOwnerEmail: normalizedEmail });
        try {
          const queryParams = `email=${encodeURIComponent(normalizedEmail)}`;
          const res = await fetch(`http://localhost:8085/api/cart?${queryParams}`);
          if (res.ok) {
            const data = await res.json();
            // ALWAYS set items to what is in this particular user's DB cart!
            // If this user has 0 items in DB, it sets items: [] (empty), never keeping another user's items!
            const formattedItems = (data || []).map((item) => ({
              id: item.productId,
              productId: item.productId,
              name: item.productName || item.name,
              price: item.price,
              originalPrice: item.originalPrice || item.price,
              quantity: item.quantity,
              productCount: item.productCount || item.quantity,
              image: item.image,
              sellerName: item.sellerName || 'Verified Seller',
              sellerId: item.sellerId || 'seller-techhub',
              stock: item.stock || 99,
            }));
            set({ items: formattedItems, isCartLoading: false, cartOwnerEmail: normalizedEmail });
            return formattedItems;
          }
        } catch (e) {
          console.error('Failed to load cart products from database for user:', normalizedEmail, e);
        }
        set({ isCartLoading: false });
        return get().items;
      },

      // Add product to cart strictly for THIS particular user and persist to DB
      addItem: (product, qty = 1, user = null) => {
        const activeUser = getActiveUser(user);
        const normalizedEmail = activeUser?.email ? activeUser.email.trim().toLowerCase() : null;

        // Ensure state is associated with this particular user
        if (normalizedEmail && get().cartOwnerEmail && get().cartOwnerEmail !== normalizedEmail) {
          set({ items: [], cartOwnerEmail: normalizedEmail });
        } else if (normalizedEmail) {
          set({ cartOwnerEmail: normalizedEmail });
        }

        const items = get().items;
        const targetId = product.productId || product.id;
        const existing = items.find((item) => (item.productId || item.id) === targetId);

        let updatedItems;
        let finalQty = qty;

        if (existing) {
          finalQty = Math.min(existing.quantity + qty, product.stock || 99);
          updatedItems = items.map((item) =>
            (item.productId || item.id) === targetId
              ? { ...item, quantity: finalQty, productCount: finalQty }
              : item
          );
        } else {
          finalQty = Math.min(qty, product.stock || 99);
          const newItem = {
            id: targetId,
            productId: targetId,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            quantity: finalQty,
            productCount: finalQty,
            image: product.image,
            sellerName: product.sellerName || 'Verified Seller',
            sellerId: product.sellerId || 'seller-techhub',
            stock: product.stock,
          };
          updatedItems = [...items, newItem];
        }

        set({ items: updatedItems });

        // Persist productId, quantity, and productCount strictly for this particular user to PostgreSQL DB
        if (activeUser && normalizedEmail) {
          const numericUserId = activeUser.id && !isNaN(Number(activeUser.id)) ? Number(activeUser.id) : null;
          fetch('http://localhost:8085/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: targetId,
              userId: numericUserId,
              userEmail: normalizedEmail,
              quantity: finalQty,
              productCount: finalQty,
              setExactQuantity: !!existing,
              productName: product.name,
              price: product.price,
              originalPrice: product.originalPrice,
              image: product.image,
              sellerId: product.sellerId,
              sellerName: product.sellerName,
              stock: product.stock,
            }),
          }).catch((err) => console.error('Failed to sync added cart item with DB:', err));
        }
      },

      // Update quantity and productCount strictly for this particular user
      updateQuantity: (productId, qty, user = null) => {
        const activeUser = getActiveUser(user);
        const normalizedEmail = activeUser?.email ? activeUser.email.trim().toLowerCase() : null;

        if (qty <= 0) {
          get().removeItem(productId, activeUser);
          return;
        }

        const items = get().items.map((item) =>
          (item.productId || item.id) === productId
            ? { ...item, quantity: Math.min(qty, item.stock || 99), productCount: Math.min(qty, item.stock || 99) }
            : item
        );
        set({ items });

        // Update in PostgreSQL Database strictly for this particular user
        if (activeUser && normalizedEmail) {
          const numericUserId = activeUser.id && !isNaN(Number(activeUser.id)) ? Number(activeUser.id) : null;
          fetch('http://localhost:8085/api/cart', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId,
              userId: numericUserId,
              userEmail: normalizedEmail,
              quantity: qty,
              productCount: qty,
            }),
          }).catch((err) => console.error('Failed to update cart item quantity in DB:', err));
        }
      },

      // Remove item from state and DB strictly for this particular user
      removeItem: (productId, user = null) => {
        const activeUser = getActiveUser(user);
        const normalizedEmail = activeUser?.email ? activeUser.email.trim().toLowerCase() : null;

        set({
          items: get().items.filter((item) => (item.productId || item.id) !== productId),
        });

        if (activeUser && normalizedEmail) {
          const numericUserId = activeUser.id && !isNaN(Number(activeUser.id)) ? Number(activeUser.id) : null;
          const queryParams = numericUserId
            ? `userId=${numericUserId}&email=${encodeURIComponent(normalizedEmail)}`
            : `email=${encodeURIComponent(normalizedEmail)}`;
          fetch(`http://localhost:8085/api/cart/${productId}?${queryParams}`, {
            method: 'DELETE',
          }).catch((err) => console.error('Failed to remove cart item from DB:', err));
        }
      },

      // Clear cart strictly for this particular user
      clearCart: (user = null) => {
        const activeUser = getActiveUser(user);
        const normalizedEmail = activeUser?.email ? activeUser.email.trim().toLowerCase() : null;

        set({ items: [] });

        if (activeUser && normalizedEmail) {
          const numericUserId = activeUser.id && !isNaN(Number(activeUser.id)) ? Number(activeUser.id) : null;
          const queryParams = numericUserId
            ? `userId=${numericUserId}&email=${encodeURIComponent(normalizedEmail)}`
            : `email=${encodeURIComponent(normalizedEmail)}`;
          fetch(`http://localhost:8085/api/cart/clear?${queryParams}`, {
            method: 'DELETE',
          }).catch((err) => console.error('Failed to clear cart in DB:', err));
        }
      },

      setSelectedAddress: (address) => {
        set({ selectedAddress: address });
      },

      fetchAddressesFromDb: async (user) => {
        if (!user) return [];
        set({ isAddressesLoading: true });
        try {
          const numericUserId = user.id && !isNaN(Number(user.id)) ? Number(user.id) : null;
          const queryParams = numericUserId
            ? `userId=${numericUserId}&email=${encodeURIComponent(user.email || '')}`
            : `email=${encodeURIComponent(user.email || '')}`;
          const res = await fetch(`http://localhost:8085/api/addresses?${queryParams}`);
          if (res.ok) {
            const data = await res.json();
            const currentSelected = get().selectedAddress;
            const activeSelected = currentSelected
              ? data.find((a) => a.id === currentSelected.id) || data.find((a) => a.isDefault) || data[0] || null
              : data.find((a) => a.isDefault) || data[0] || null;

            set({
              savedAddresses: data,
              selectedAddress: activeSelected,
              isAddressesLoading: false,
            });
            return data;
          }
        } catch (e) {
          console.error('Failed to load user addresses from database:', e);
        }
        set({ isAddressesLoading: false });
        return [];
      },

      saveAddressToDb: async (addressData, user) => {
        const numericUserId = user?.id && !isNaN(Number(user.id)) ? Number(user.id) : null;
        const payload = {
          userId: numericUserId,
          fullName: addressData.fullName,
          email: addressData.email || user?.email || '',
          phone: addressData.phone,
          address: addressData.address || addressData.street,
          country: addressData.country || 'India',
          state: addressData.state,
          district: addressData.district || addressData.city,
          pincode: addressData.pincode,
          isDefault: addressData.isDefault ?? true,
        };

        const res = await fetch('http://localhost:8085/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Failed to save address to database');
        }

        const saved = await res.json();
        const currentList = get().savedAddresses.filter((a) => a.id !== saved.id);
        const updated = [saved, ...currentList];
        set({
          savedAddresses: updated,
          selectedAddress: saved,
        });
        return saved;
      },

      deleteAddressFromDb: async (id) => {
        try {
          await fetch(`http://localhost:8085/api/addresses/${id}`, { method: 'DELETE' });
          const updated = get().savedAddresses.filter((a) => a.id !== id);
          set({
            savedAddresses: updated,
            selectedAddress: get().selectedAddress?.id === id ? (updated[0] || null) : get().selectedAddress,
          });
        } catch (e) {
          console.error('Failed to delete address:', e);
        }
      },

      setDefaultAddressInDb: async (id, user) => {
        try {
          const numericUserId = user?.id && !isNaN(Number(user.id)) ? Number(user.id) : null;
          const queryParams = numericUserId
            ? `userId=${numericUserId}&email=${encodeURIComponent(user?.email || '')}`
            : (user?.email ? `email=${encodeURIComponent(user.email)}` : '');
          await fetch(`http://localhost:8085/api/addresses/${id}/default?${queryParams}`, { method: 'PUT' });
          const updated = get().savedAddresses.map((a) => ({
            ...a,
            isDefault: a.id === id,
          }));
          const selected = updated.find((a) => a.id === id) || null;
          set({ savedAddresses: updated, selectedAddress: selected });
        } catch (e) {
          console.error('Failed to set default address:', e);
        }
      },

      applyCoupon: (code) => {
        if (!code) return { success: false, message: 'Please enter a valid coupon code' };
        if (code.toUpperCase() === 'A2ZFIRST') {
          set({ coupon: { code: 'A2ZFIRST', discountPaise: 50000 } });
          return { success: true, message: 'Coupon A2ZFIRST applied! Saved ₹500.' };
        } else if (code.toUpperCase() === 'SUPER10') {
          set({ coupon: { code: 'SUPER10', discountPercent: 10 } });
          return { success: true, message: 'Super Saver 10% discount applied!' };
        }
        return { success: false, message: 'Invalid or expired coupon code' };
      },

      removeCoupon: () => {
        set({ coupon: null });
      },

      // Computed Totals & Product Counts
      getTotals: () => {
        const items = get().items;
        const subtotal = items.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);
        const originalTotal = items.reduce((acc, item) => acc + (item.originalPrice || item.price) * (item.quantity || 1), 0);
        const productDiscount = originalTotal - subtotal;
        
        let couponDiscount = 0;
        const coupon = get().coupon;
        if (coupon) {
          if (coupon.discountPaise) couponDiscount = Math.min(coupon.discountPaise, subtotal);
          else if (coupon.discountPercent) couponDiscount = Math.round((subtotal * coupon.discountPercent) / 100);
        }

        // Free shipping on orders over ₹999 (99900 paise)
        const deliveryFee = subtotal > 99900 || items.length === 0 ? 0 : 9900; // ₹99
        const finalTotal = Math.max(0, subtotal - couponDiscount + deliveryFee);

        // Calculate total product count
        const totalProductCount = items.reduce((acc, i) => acc + (i.productCount || i.quantity || 1), 0);

        return {
          itemCount: totalProductCount,
          productCount: totalProductCount,
          uniqueProductsCount: items.length,
          subtotal,
          originalTotal,
          productDiscount,
          couponDiscount,
          deliveryFee,
          finalTotal,
        };
      },
    }),
    {
      name: 'a2z-cart-storage-v2',
      // Store cartOwnerEmail along with items to prevent cross-user leakage
      partialize: (state) => ({
        items: state.items,
        cartOwnerEmail: state.cartOwnerEmail,
        selectedAddress: state.selectedAddress,
        coupon: state.coupon,
      }),
    }
  )
);
