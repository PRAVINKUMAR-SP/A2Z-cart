import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ORDER_STATUS } from '../utils/constants';

// Clean up any legacy mock orders so order tracking reflects real user data
try {
  const existingOrders = localStorage.getItem('a2z-orders-storage-v2') || localStorage.getItem('a2z-orders-storage');
  if (existingOrders) {
    const parsed = JSON.parse(existingOrders);
    if (parsed?.state?.orders && parsed.state.orders.some((o) => o.id === 'ORD-98214' || o.buyerId === 'usr-buyer-01')) {
      parsed.state.orders = [];
      localStorage.setItem('a2z-orders-storage-v2', JSON.stringify(parsed));
      localStorage.removeItem('a2z-orders-storage');
    }
  }
} catch (e) {}

export const useOrderStore = create(
  persist(
    (set, get) => ({
      orders: [], // Real data only - empty until user actually places an order!
      isOrdersLoading: false,

      fetchOrdersFromDb: async (user) => {
        if (!user) return get().orders;
        set({ isOrdersLoading: true });
        try {
          const numericUserId = user.id && !isNaN(Number(user.id)) ? Number(user.id) : null;
          const queryParams = numericUserId
            ? `userId=${numericUserId}&email=${encodeURIComponent(user.email || '')}`
            : `email=${encodeURIComponent(user.email || '')}`;
          const res = await fetch(`/api/orders?${queryParams}`);
          if (res.ok) {
            const data = await res.json();
            // Transform DB orders into rich order objects expected by UI
            const formatted = data.map((dbOrder) => {
              let items = [];
              try {
                if (typeof dbOrder.productDetails === 'string') {
                  items = JSON.parse(dbOrder.productDetails);
                } else if (Array.isArray(dbOrder.productDetails)) {
                  items = dbOrder.productDetails;
                }
              } catch (e) {
                items = [];
              }

              let shippingAddress = {};
              try {
                if (typeof dbOrder.shippingAddress === 'string') {
                  shippingAddress = JSON.parse(dbOrder.shippingAddress);
                } else if (dbOrder.shippingAddress) {
                  shippingAddress = dbOrder.shippingAddress;
                }
              } catch (e) {
                shippingAddress = { fullName: dbOrder.buyerName, phone: dbOrder.buyerPhone };
              }

              // Group items by seller for multi-vendor suborders
              const itemsBySeller = {};
              (items || []).forEach((item) => {
                const sId = item.sellerId || 'seller-techhub';
                if (!itemsBySeller[sId]) {
                  itemsBySeller[sId] = {
                    sellerId: sId,
                    sellerName: item.sellerName || 'Verified Seller',
                    items: [],
                  };
                }
                itemsBySeller[sId].items.push(item);
              });

              const suborders = Object.values(itemsBySeller).map((sellerGroup, idx) => ({
                suborderId: `SUB-${dbOrder.orderTrackingNumber?.split('-')[1] || dbOrder.id}-${String.fromCharCode(65 + idx)}`,
                sellerId: sellerGroup.sellerId,
                sellerName: sellerGroup.sellerName,
                status: dbOrder.status || 'CONFIRMED',
                courier: 'Delhivery Express',
                trackingNumber: `DEL-${Date.now().toString().slice(-8)}`,
                estimatedDelivery: new Date(Date.now() + 86400000 * 3).toLocaleDateString(),
                items: sellerGroup.items,
              }));

              const isCod = dbOrder.paymentMethod === 'CASH_ON_DELIVERY';

              return {
                id: dbOrder.orderTrackingNumber || `ORD-${dbOrder.id}`,
                dbId: dbOrder.id,
                orderTrackingNumber: dbOrder.orderTrackingNumber || `ORD-${dbOrder.id}`,
                buyerId: dbOrder.userId || user?.id,
                buyerName: dbOrder.buyerName || shippingAddress.fullName,
                buyerPhone: dbOrder.buyerPhone || shippingAddress.phone,
                createdAt: dbOrder.createdAt || new Date().toISOString(),
                status: dbOrder.status || 'CONFIRMED',
                paymentMethod: dbOrder.paymentMethod || (isCod ? 'CASH_ON_DELIVERY' : 'ONLINE'),
                paymentStatus: dbOrder.paymentStatus || (isCod ? 'PENDING' : 'SUCCESS'),
                paymentId: dbOrder.paymentId,
                totalAmount: dbOrder.totalAmount,
                shippingAddress,
                productDetails: items,
                suborders,
                trackingEvents: [
                  { 
                    time: 'Just now', 
                    title: isCod ? 'Cash on Delivery Order Confirmed' : 'Order Verified & Confirmed', 
                    desc: isCod ? 'Cash on Delivery confirmed. Payment to be collected upon doorstep delivery.' : 'Payment verified securely with instant stock allocation.', 
                    done: true 
                  },
                  { time: 'Pending', title: 'Seller Packaging', desc: 'Vendor is preparing items for pickup.', done: false },
                  { time: 'Pending', title: 'Handed to Logistics Carrier', desc: 'Courier pickup scheduled.', done: false },
                  { time: 'Estimated in 3 days', title: 'Delivered', desc: 'Contactless delivery with verification.', done: false }
                ]
              };
            });

            // Update orders in state
            set({ orders: formatted, isOrdersLoading: false });
            return formatted;
          }
        } catch (e) {
          console.error('Failed to fetch orders from database:', e);
        }
        set({ isOrdersLoading: false });
        return get().orders;
      },

      createOrder: async ({ items, address, paymentMethod, paymentId, razorpayOrderId, totals, user }) => {
        // Multi-Vendor Architecture: Group items by seller to create suborders!
        const itemsBySeller = {};
        items.forEach((item) => {
          const sId = item.sellerId || 'seller-techhub';
          if (!itemsBySeller[sId]) {
            itemsBySeller[sId] = {
              sellerId: sId,
              sellerName: item.sellerName || 'Verified Seller',
              items: [],
            };
          }
          itemsBySeller[sId].items.push(item);
        });

        const newOrderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;

        const isCod = paymentMethod === 'COD' || paymentMethod === 'CASH_ON_DELIVERY';
        const normalizedPaymentMethod = isCod ? 'CASH_ON_DELIVERY' : 'ONLINE';
        const paymentStatus = isCod ? 'PENDING' : 'SUCCESS';

        const suborders = Object.values(itemsBySeller).map((sellerGroup, idx) => ({
          suborderId: `SUB-${newOrderId.split('-')[1]}-${String.fromCharCode(65 + idx)}`,
          sellerId: sellerGroup.sellerId,
          sellerName: sellerGroup.sellerName,
          status: ORDER_STATUS.CONFIRMED,
          courier: 'Delhivery Express',
          trackingNumber: `DEL-${Date.now().toString().slice(-8)}`,
          estimatedDelivery: new Date(Date.now() + 86400000 * 3).toLocaleDateString(),
          items: sellerGroup.items,
        }));

        const numericUserId = user?.id && !isNaN(Number(user.id)) ? Number(user.id) : null;

        const newOrder = {
          id: newOrderId,
          orderTrackingNumber: newOrderId,
          userId: numericUserId,
          buyerId: user?.id || 'usr-buyer-01',
          buyerEmail: user?.email || address?.email || '',
          buyerName: address?.fullName || user?.name || 'Buyer',
          buyerPhone: address?.phone || user?.phone || '',
          createdAt: new Date().toISOString(),
          status: ORDER_STATUS.CONFIRMED,
          paymentMethod: normalizedPaymentMethod,
          paymentStatus: paymentStatus,
          paymentId: paymentId || (isCod ? `cod_${Date.now()}` : `pay_rzp_${Date.now()}`),
          razorpayOrderId: razorpayOrderId || `order_rzp_${Date.now()}`,
          totalAmount: totals.finalTotal,
          shippingAddress: address,
          productDetails: items,
          suborders,
          trackingEvents: [
            { 
              time: 'Just now', 
              title: isCod ? 'Cash on Delivery Order Confirmed' : 'Order Verified & Confirmed', 
              desc: isCod ? 'Cash on Delivery confirmed. Payment to be collected upon doorstep delivery.' : 'Payment verified securely with instant stock allocation.', 
              done: true 
            },
            { time: 'Pending', title: 'Seller Packaging', desc: 'Vendor is preparing items for pickup.', done: false },
            { time: 'Pending', title: 'Handed to Logistics Carrier', desc: 'Courier pickup scheduled.', done: false },
            { time: 'Estimated in 3 days', title: 'Delivered', desc: 'Contactless delivery with verification.', done: false }
          ]
        };

        // Persist order directly into PostgreSQL Database via REST API
        try {
          const dbPayload = {
            orderId: newOrderId,
            orderTrackingNumber: newOrderId,
            userId: numericUserId,
            buyerEmail: newOrder.buyerEmail,
            buyerName: newOrder.buyerName,
            buyerPhone: newOrder.buyerPhone,
            totalAmount: totals.finalTotal,
            status: 'CONFIRMED',
            paymentMethod: normalizedPaymentMethod,
            paymentStatus: paymentStatus,
            paymentId: newOrder.paymentId,
            razorpayOrderId: newOrder.razorpayOrderId,
            shippingAddress: address,
            productDetails: items,
          };

          const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dbPayload),
          });

          if (res.ok) {
            const savedDbOrder = await res.json();
            newOrder.dbId = savedDbOrder.id;
          }
        } catch (e) {
          console.error('Failed to persist order to database:', e);
        }

        set((state) => ({ orders: [newOrder, ...state.orders] }));
        return newOrder;
      },

      updateSuborderStatus: (orderId, suborderId, newStatus, courier, trackingNumber) => {
        set((state) => ({
          orders: state.orders.map((ord) => {
            if (ord.id !== orderId) return ord;
            const updatedSuborders = ord.suborders.map((sub) => {
              if (sub.suborderId !== suborderId) return sub;
              return {
                ...sub,
                status: newStatus,
                courier: courier || sub.courier,
                trackingNumber: trackingNumber || sub.trackingNumber,
              };
            });
            return { ...ord, suborders: updatedSuborders };
          }),
        }));
      },

      cancelOrder: async (orderId, reason) => {
        const order = get().orders.find((o) => o.id === orderId);
        if (order?.dbId) {
          try {
            await fetch(`/api/orders/${order.dbId}/status`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'CANCELLED' }),
            });
          } catch (e) {
            console.error('Failed to cancel order in database:', e);
          }
        }

        set((state) => ({
          orders: state.orders.map((ord) =>
            ord.id === orderId
              ? {
                  ...ord,
                  status: ORDER_STATUS.CANCELLED,
                  cancellationReason: reason,
                  trackingEvents: [
                    ...ord.trackingEvents,
                    { time: 'Just now', title: 'Order Cancelled', desc: reason || 'Cancelled by buyer.', done: true },
                  ],
                }
              : ord
          ),
        }));
      },

      getBuyerOrders: (buyerId) => {
        return get().orders.filter((o) => o.buyerId === buyerId || !o.buyerId);
      },

      getSellerOrders: (sellerId) => {
        return get().orders.filter((o) =>
          o.suborders.some((sub) => sub.sellerId === sellerId)
        );
      },

      getOrderById: (orderId) => {
        return get().orders.find((o) => o.id === orderId);
      },
    }),
    {
      name: 'a2z-orders-storage-v2',
    }
  )
);
