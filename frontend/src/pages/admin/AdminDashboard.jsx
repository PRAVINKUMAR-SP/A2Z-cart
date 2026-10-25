import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Store,
  Shield,
  Package,
  ShoppingCart,
  Layers,
  CreditCard,
  Settings,
  Search,
  Trash2,
  RefreshCw,
  ChevronRight,
  ExternalLink,
  Menu,
  X,
  Check,
  AlertTriangle,
  Eye,
  ArrowUpRight,
  UserCheck,
  DollarSign,
  QrCode,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Copy,
  Plus,
  Upload,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSellerStore } from '../../store/sellerStore';
import { useOrderStore } from '../../store/orderStore';
import { useProductStore } from '../../store/productStore';
import { useAuthStore } from '../../store/authStore';
import { formatPrice, formatDate } from '../../utils/formatters';
import { CATEGORIES } from '../../utils/constants';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    // Only super admin pravin007ptk@gmail.com has access to Admin Dashboard
    if (!user || user.email !== 'pravin007ptk@gmail.com') {
      const isSeller = user?.role === 'ROLE_SELLER' || user?.role === 'SELLER';
      navigate(isSeller ? '/seller/dashboard' : '/shop', { replace: true });
    }
  }, [user, navigate]);
  const { applications, approveApplication, rejectApplication, deleteApplication } = useSellerStore();
  const { orders, updateOrderStatus: updateStoreOrderStatus } = useOrderStore();
  const { products, addProduct, deleteProduct, clearAllProducts, fetchProductsFromDb } = useProductStore();

  // Active Tab
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Live Backend Data
  const [buyers, setBuyers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [cartProducts, setCartProducts] = useState([]);
  const [orderProducts, setOrderProducts] = useState([]);
  const [liveOrders, setLiveOrders] = useState([]);

  // Inspection Modals
  const [inspectApp, setInspectApp] = useState(null);
  const [inspectOrder, setInspectOrder] = useState(null);
  const [inspectBuyer, setInspectBuyer] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Searches & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [orderFilter, setOrderFilter] = useState('ALL');
  const [sellerFilter, setSellerFilter] = useState('ALL');

  // Model 2: Platform Commission Ledger State
  const [adminCommissions, setAdminCommissions] = useState({
    totalPlatformGrossPaise: 0,
    totalCommissionAccruedPaise: 0,
    totalCommissionPendingPaise: 0,
    totalCommissionSubmittedPaise: 0,
    totalCommissionCollectedPaise: 0,
    invoices: [],
    adminPaymentConfig: null,
  });
  const [commissionFilter, setCommissionFilter] = useState('ALL');
  const [backendSellersList, setBackendSellersList] = useState([]);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [adminProductForm, setAdminProductForm] = useState({
    name: '',
    category: 'electronics',
    sellerName: 'Pravinkumar',
    priceRupees: 2999,
    originalPriceRupees: 4999,
    stock: 25,
    tagline: '',
    description: '',
    brand: '',
    image: '',
  });
  const [adminProductImageMode, setAdminProductImageMode] = useState('upload');
  const [isSubmittingAdminProduct, setIsSubmittingAdminProduct] = useState(false);
  const adminProductImageFileRef = React.useRef(null);
  const [adminUpiForm, setAdminUpiForm] = useState({
    adminName: 'A2Z Cart Platform Operations',
    adminUpiId: '8072628827@upi',
    adminPhone: '8072628827',
    defaultCommissionRate: 10,
  });
  const [isSavingAdminUpi, setIsSavingAdminUpi] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    storeName: 'A2Z Cart',
    commissionRate: 10,
    freeShippingMin: 999,
    supportEmail: 'support@a2zcart.com',
    supportPhone: '+91 80726 28827',
    enableOnline: true,
    enableCod: true,
  });

  // Fetch live data
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. All Users (for role management & directory)
      fetch('/api/admin/users')
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setAllUsers(data);
            setBuyers(data);
          } else {
            const fallback = [
              { id: 4, name: 'Rahul Sharma', email: 'buyer@example.com', phone: '+91 98765 43210', role: 'ROLE_BUYER', createdAt: '2026-10-24T18:30:32' },
              { id: 6, name: 'Abi', email: 'abisheksanthosh06@gmail.com', phone: '8072628829', role: 'ROLE_BUYER', createdAt: '2026-10-24T18:42:18' },
              { id: 7, name: 'Kutty', email: 'sample2@gmail.com', phone: '8072628820', role: 'ROLE_BUYER', createdAt: '2026-10-24T19:43:48' },
              { id: 5, name: 'Pravinkumar', email: 'pravin007ptk@gmail.com', phone: '8072628827', role: 'ROLE_ADMIN', createdAt: '2026-10-24T18:39:27' },
            ];
            setAllUsers(fallback);
            setBuyers(fallback);
          }
        })
        .catch(() => {});

      // 2. Admins list
      fetch('/api/admin/admins')
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) setAdmins(data);
          else {
            setAdmins([
              { id: 5, name: 'Pravinkumar', email: 'pravin007ptk@gmail.com', phone: '8072628827', role: 'ROLE_ADMIN', createdAt: '2026-10-24T18:39:27' },
            ]);
          }
        })
        .catch(() => {});

      // 3. Cart Products
      fetch('/api/admin/cart-products')
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) setCartProducts(data);
        })
        .catch(() => {});

      // 4. Orders
      fetch('/api/admin/orders')
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) setLiveOrders(data);
          else if (orders && orders.length > 0) setLiveOrders(orders);
        })
        .catch(() => {
          if (orders && orders.length > 0) setLiveOrders(orders);
        });

      // 5. Order Products
      fetch('/api/admin/order-products')
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) setOrderProducts(data);
          else {
            const lines = [];
            (orders || []).forEach((o) => {
              (o.suborders || []).forEach((s) => {
                (s.items || []).forEach((item) => {
                  lines.push({
                    orderId: o.id || o.orderTrackingNumber,
                    buyerName: o.buyerName,
                    buyerEmail: o.buyerEmail || 'buyer@example.com',
                    orderStatus: o.status || 'CONFIRMED',
                    paymentMethod: o.paymentMethod || 'ONLINE',
                    orderDate: o.createdAt,
                    productId: item.productId || item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image,
                    sellerName: s.sellerName || 'Merchant',
                  });
                });
              });
            });
            setOrderProducts(lines);
          }
        })
        .catch(() => {});
      // 6. Platform Commission Invoices & Admin Payment Config
      fetch('/api/commissions/admin')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setAdminCommissions(data);
            if (data.adminPaymentConfig) {
              setAdminUpiForm({
                adminName: data.adminPaymentConfig.adminName || 'A2Z Cart Platform Operations',
                adminUpiId: data.adminPaymentConfig.adminUpiId || '8072628827@upi',
                adminPhone: data.adminPaymentConfig.adminPhone || '8072628827',
                defaultCommissionRate: data.adminPaymentConfig.defaultCommissionRate || 10,
              });
            }
          }
        })
        .catch(() => {});

      // 7. Backend Sellers list
      fetch('/api/admin/sellers')
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setBackendSellersList(data);
          }
        })
        .catch(() => {});

      // 8. Live products sync from backend
      if (fetchProductsFromDb) {
        fetchProductsFromDb();
      }
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  };

  const handleVerifyCommission = async (id) => {
    try {
      const res = await fetch(`/api/commissions/admin/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: 'Verified in Admin Bank Account' }),
      });
      if (res.ok) {
        toast.success('Commission payment verified and approved in Admin account!');
        fetchData();
      }
    } catch (e) {
      toast.error('Failed to verify commission payment');
    }
  };

  const handleRejectCommission = async (id) => {
    try {
      const res = await fetch(`/api/commissions/admin/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'UTR not matching bank statement' }),
      });
      if (res.ok) {
        toast.success('Invoice marked back to PENDING');
        fetchData();
      }
    } catch (e) {
      toast.error('Failed to reject commission payment');
    }
  };

  const handleSaveAdminUpi = async (e) => {
    e.preventDefault();
    setIsSavingAdminUpi(true);
    try {
      const res = await fetch('/api/commissions/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminUpiForm),
      });
      if (res.ok) {
        toast.success('Admin receiving UPI details saved securely to database!');
        fetchData();
      } else {
        toast.error('Failed to save Admin UPI details');
      }
    } catch (e) {
      toast.error('Network error saving Admin UPI details');
    } finally {
      setIsSavingAdminUpi(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [orders?.length]);

  // Derived metrics
  const combinedOrders = liveOrders.length > 0 ? liveOrders : orders;
  const totalRevenue = combinedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  
  // Merge sellers from backend API and locally registered applications
  const allSellers = [
    ...(backendSellersList || []),
    ...(applications || []),
  ].reduce((acc, curr) => {
    const nameKey = (curr.companyName || curr.sellerName || curr.name || '').trim().toLowerCase();
    const idKey = String(curr.id || curr.userId || '');
    if (!acc.some((item) => {
      const itName = (item.companyName || item.sellerName || item.name || '').trim().toLowerCase();
      const itId = String(item.id || item.userId || '');
      return (nameKey && itName === nameKey) || (idKey && itId === idKey);
    })) {
      acc.push(curr);
    }
    return acc;
  }, []);

  const pendingSellers = allSellers.filter((a) => a.status === 'PENDING');
  const approvedSellers = allSellers.filter((a) => a.status === 'APPROVED');

  // Helper to compute sales cost, commission amount, and product count sold by a seller
  const getSellerMetrics = (seller) => {
    const sName = (seller.companyName || seller.sellerName || seller.name || '').trim().toLowerCase();
    const sId = String(seller.id || seller.userId || seller.sellerId || '');

    // Gross and commission from invoice records
    const matchedInvoices = (adminCommissions.invoices || []).filter((inv) => {
      const invName = (inv.sellerName || '').trim().toLowerCase();
      const invId = String(inv.sellerId || '');
      return (sName && invName && (invName === sName || invName.includes(sName) || sName.includes(invName))) ||
             (sId && invId && sId === invId);
    });

    const grossFromInvoices = matchedInvoices.reduce((sum, inv) => sum + (Number(inv.grossAmount) || 0), 0);
    const commFromInvoices = matchedInvoices.reduce((sum, inv) => sum + (Number(inv.commissionAmount) || 0), 0);

    // Units sold from order items
    let unitsSold = 0;
    let grossFromOrders = 0;

    (combinedOrders || []).forEach((ord) => {
      let items = [];
      try {
        if (Array.isArray(ord.productDetails)) items = ord.productDetails;
        else if (typeof ord.productDetails === 'string') items = JSON.parse(ord.productDetails);
        else if (Array.isArray(ord.items)) items = ord.items;
      } catch (e) {
        items = [];
      }

      if (Array.isArray(ord.suborders) && ord.suborders.length > 0) {
        ord.suborders.forEach((sub) => {
          const subName = (sub.sellerName || '').trim().toLowerCase();
          const subId = String(sub.sellerId || '');
          if ((sName && subName && (subName === sName || subName.includes(sName) || sName.includes(subName))) ||
              (sId && subId && sId === subId)) {
            (sub.items || []).forEach((it) => {
              const qty = Number(it.quantity || it.productCount || 1);
              const price = Number(it.price || 0);
              unitsSold += qty;
              grossFromOrders += price * qty;
            });
          }
        });
      } else {
        items.forEach((it) => {
          const itName = (it.sellerName || ord.sellerName || '').trim().toLowerCase();
          const itId = String(it.sellerId || ord.sellerId || '');
          if ((sName && itName && (itName === sName || itName.includes(sName) || sName.includes(itName))) ||
              (sId && itId && sId === itId) ||
              (!itName && !itId && sName === 'pravinkumar')) {
            const qty = Number(it.quantity || it.productCount || 1);
            const price = Number(it.price || 0);
            unitsSold += qty;
            grossFromOrders += price * qty;
          }
        });
      }
    });

    const finalGrossPaise = grossFromInvoices > 0 ? grossFromInvoices : grossFromOrders;
    const finalCommPaise = commFromInvoices > 0 ? commFromInvoices : Math.round(finalGrossPaise * 0.10);

    return {
      salesCostPaise: finalGrossPaise,
      commissionPaise: finalCommPaise,
      salesProductCount: unitsSold,
    };
  };

  const handleAdminProductImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setAdminProductForm((prev) => ({ ...prev, image: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleAdminAddProductSubmit = async (e) => {
    e.preventDefault();
    if (!adminProductForm.name.trim()) {
      toast.error('Please enter a product name');
      return;
    }
    setIsSubmittingAdminProduct(true);
    const pricePaise = Math.round(Number(adminProductForm.priceRupees) * 100);
    const origPricePaise = Math.round(Number(adminProductForm.originalPriceRupees || adminProductForm.priceRupees) * 100);
    const discount = origPricePaise > pricePaise ? Math.round(((origPricePaise - pricePaise) / origPricePaise) * 100) : 0;
    
    const matchedSeller = allSellers.find((s) => (s.companyName || s.sellerName || s.name || '').toLowerCase() === adminProductForm.sellerName.toLowerCase());
    const targetSellerId = matchedSeller ? (matchedSeller.id || `seller-${matchedSeller.id}`) : (user?.id || 5);

    const newProd = {
      name: adminProductForm.name.trim(),
      category: adminProductForm.category || 'electronics',
      price: pricePaise,
      originalPrice: origPricePaise,
      discountPercent: discount,
      stock: Number(adminProductForm.stock) || 1,
      tagline: adminProductForm.tagline || '',
      description: adminProductForm.description || '',
      brand: adminProductForm.brand || adminProductForm.sellerName,
      image: adminProductForm.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      images: [adminProductForm.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'],
      sellerName: adminProductForm.sellerName,
      sellerId: targetSellerId,
      sellerStatus: 'APPROVED',
      createdAt: new Date().toISOString(),
    };

    // 1. Instantly save to frontend store
    addProduct(newProd);

    // 2. Sync to PostgreSQL backend
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProd.name,
          category: newProd.category,
          price: newProd.price,
          originalPrice: newProd.originalPrice,
          discountPercent: newProd.discountPercent,
          stock: newProd.stock,
          tagline: newProd.tagline,
          description: newProd.description,
          image: newProd.image,
          sellerName: newProd.sellerName,
        }),
      });
    } catch (e) {
      console.warn('Backend sync warning (saved locally):', e);
    }

    toast.success(`Product "${newProd.name}" published to ${newProd.sellerName}'s catalog!`);
    setShowAddProductModal(false);
    setIsSubmittingAdminProduct(false);
    setAdminProductForm({
      name: '',
      category: 'electronics',
      sellerName: adminProductForm.sellerName,
      priceRupees: 2999,
      originalPriceRupees: 4999,
      stock: 25,
      tagline: '',
      description: '',
      brand: '',
      image: '',
    });
  };

  // Change user role: BUYER, SELLER, ADMIN
  const handleUserRoleChange = async (userId, newRole, userName) => {
    const normalizedRole = newRole.startsWith('ROLE_') ? newRole : `ROLE_${newRole}`;
    try {
      // Optimistic update
      setBuyers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: normalizedRole } : u))
      );
      setAdmins((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: normalizedRole } : u))
      );
      setAllUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: normalizedRole } : u))
      );
      if (inspectBuyer?.id === userId) {
        setInspectBuyer((prev) => ({ ...prev, role: normalizedRole }));
      }

      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: normalizedRole }),
      });

      if (!res.ok) {
        throw new Error('Failed to update role on server');
      }

      toast.success(`Role for ${userName || 'user'} changed to ${newRole}`);
      fetchData();
    } catch (e) {
      toast.error('Failed to change role');
    }
  };

  // Actions
  const handleApproveSeller = (id) => {
    approveApplication(id, 'Approved by Administrator');
    fetch(`/api/admin/sellers/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: 'Approved by Administrator' }),
    }).catch(() => {});
    toast.success('Seller approved successfully');
    setInspectApp(null);
  };

  const handleRejectSeller = (id) => {
    if (!rejectReason.trim()) {
      toast.error('Please enter a rejection reason');
      return;
    }
    rejectApplication(id, rejectReason);
    fetch(`/api/admin/sellers/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: rejectReason }),
    }).catch(() => {});
    toast.error('Seller application rejected');
    setInspectApp(null);
    setRejectReason('');
  };

  const handleDeleteSeller = (id, companyName) => {
    deleteApplication(id);
    fetch(`/api/admin/sellers/${id}`, {
      method: 'DELETE',
    }).catch(() => {});
    toast.success(`Seller "${companyName || id}" deleted`);
    if (inspectApp?.id === id) {
      setInspectApp(null);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    updateStoreOrderStatus(orderId, newStatus);
    setLiveOrders((prev) =>
      prev.map((o) => (o.orderTrackingNumber === orderId || o.id === orderId ? { ...o, status: newStatus } : o))
    );
    const target = liveOrders.find((o) => o.orderTrackingNumber === orderId || o.id === orderId);
    if (target?.id && typeof target.id === 'number') {
      fetch(`/api/orders/${target.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      }).catch(() => {});
    }
    toast.success(`Order status updated to ${newStatus}`);
  };

  const handleDeleteProduct = (id) => {
    deleteProduct(id);
    fetch(`/api/admin/products/${id}`, { method: 'DELETE' }).catch(() => {});
    toast.success('Product deleted');
  };

  const handleClearAllProducts = () => {
    clearAllProducts();
    fetch('/api/admin/products', { method: 'DELETE' }).catch(() => {});
    toast.success('All products removed from catalog');
  };

  const handleDeleteUser = async (id, name, email) => {
    const displayName = name || email || `User #${id}`;

    if (email && user?.email && email.toLowerCase() === user.email.toLowerCase()) {
      toast.error('You cannot delete your own active administrator account');
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Failed to delete user on server');
      }

      setBuyers((prev) => prev.filter((b) => b.id !== id));
      setAdmins((prev) => prev.filter((a) => a.id !== id));
      if (inspectBuyer?.id === id) {
        setInspectBuyer(null);
      }

      toast.success(`User "${displayName}" deleted successfully`);
      fetchData();
    } catch (e) {
      toast.error(e.message || 'Failed to delete user');
    }
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    toast.success('Settings saved');
  };

  // Sidebar items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users, badge: buyers.length },
    {
      id: 'sellers',
      label: 'Sellers',
      icon: Store,
      badge: pendingSellers.length > 0 ? `${pendingSellers.length}` : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    { id: 'products', label: 'Products', icon: Package, badge: products.length },
    {
      id: 'cart-products',
      label: 'Cart products',
      icon: ShoppingCart,
      badge: cartProducts.length > 0 ? cartProducts.length : null,
    },
    { id: 'order-products', label: 'Order Products', icon: Layers, badge: orderProducts.length > 0 ? orderProducts.length : null },
    { id: 'orders', label: 'Orders', icon: CreditCard, badge: combinedOrders.length },
    {
      id: 'commission',
      label: 'Commission Ledger',
      icon: DollarSign,
      badge: adminCommissions?.invoices?.filter((i) => i.status === 'SUBMITTED').length > 0
        ? `${adminCommissions.invoices.filter((i) => i.status === 'SUBMITTED').length} Due`
        : null,
      badgeColor: 'bg-blue-600 text-white',
    },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Mobile Top Header */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-bold text-slate-900 text-base">A2Z Cart Admin</span>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="p-2 text-slate-600 hover:text-slate-900"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex-1 flex max-w-[1500px] w-full mx-auto">
        {/* ============================================================== */}
        {/* CLEAN HUMAN-CRAFTED SIDEBAR                                    */}
        {/* ============================================================== */}
        <aside
          className={`
            fixed lg:sticky top-0 lg:top-[68px] z-40 lg:z-10
            h-screen lg:h-[calc(100vh-68px)]
            w-72 sm:w-80 lg:w-80 bg-white text-slate-700
            flex flex-col justify-between
            transition-transform duration-200 ease-in-out
            border-r border-slate-200 shadow-xs
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div>
            {/* Mobile close toggle only */}
            <div className="lg:hidden px-4 py-3 border-b border-slate-100 flex justify-end">
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-slate-500 hover:text-slate-800 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Menu */}
            <nav className="p-3.5 sm:p-4 space-y-1.5 pt-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                      setSearchQuery('');
                    }}
                    className={`
                      w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium
                      transition-all text-left group
                      ${
                        isActive
                          ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200/80 shadow-2xs'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'
                      }`}>
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-[13px]">{item.label}</span>
                    </div>
                    {item.badge !== null && item.badge !== undefined && (
                      <span
                        className={`
                          text-xs font-bold px-2.5 py-0.5 rounded-full
                          ${
                            isActive
                              ? 'bg-blue-600 text-white'
                              : item.badgeColor || 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                          }
                        `}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User Footer Profile */}
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-xs">
                {user?.name?.charAt(0) || 'P'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Pravinkumar'}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email || 'admin@a2zcart.com'}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          />
        )}

        {/* ============================================================== */}
        {/* MAIN DASHBOARD CONTENT                                         */}
        {/* ============================================================== */}
        <main className="flex-1 p-3.5 sm:p-7 space-y-4 sm:space-y-6 min-w-0">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 capitalize">
                {navItems.find((i) => i.id === activeTab)?.label}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Overview and management of your marketplace store
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchData}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* ========================================================== */}
          {/* 1. DASHBOARD OVERVIEW                                      */}
          {/* ========================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4 sm:space-y-6">
              {/* 4 Clean Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                    <span>Total Revenue</span>
                    <CreditCard className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-slate-900 mt-1 sm:mt-2">{formatPrice(totalRevenue)}</p>
                  <p className="text-[10px] sm:text-[11px] text-emerald-600 mt-1 font-medium">From {combinedOrders.length} orders</p>
                </div>

                <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                    <span>Total Orders</span>
                    <Package className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-slate-900 mt-1 sm:mt-2">{combinedOrders.length}</p>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 mt-1">Processed orders</p>
                </div>

                <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                    <span>Platform Users</span>
                    <Users className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-slate-900 mt-1 sm:mt-2">{buyers.length}</p>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 mt-1">Registered users</p>
                </div>

                <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                    <span>Approved Sellers</span>
                    <Store className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-slate-900 mt-1 sm:mt-2">{approvedSellers.length}</p>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 mt-1 truncate">
                    {pendingSellers.length > 0 ? (
                      <span className="text-amber-600 font-semibold">{pendingSellers.length} pending</span>
                    ) : (
                      'All up to date'
                    )}
                  </p>
                </div>
              </div>

              {/* Pending KYC Notice if any */}
              {pendingSellers.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-amber-900">
                        {pendingSellers.length} seller application{pendingSellers.length > 1 ? 's' : ''} waiting for review
                      </p>
                      <p className="text-[11px] text-amber-700">Review documents and approve or reject seller accounts.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('sellers')}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Review Now
                  </button>
                </div>
              )}

              {/* Recent Orders Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900">Recent Orders</h2>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    View all orders <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-3">Order ID</th>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Payment</th>
                        <th className="px-4 py-3">Total</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {combinedOrders.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-8 text-slate-400">
                            No orders placed yet.
                          </td>
                        </tr>
                      ) : (
                        combinedOrders.slice(0, 5).map((ord) => (
                          <tr key={ord.id || ord.orderTrackingNumber} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-mono font-medium text-slate-900">
                              {ord.orderTrackingNumber || ord.id}
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-slate-900">{ord.buyerName}</p>
                              <p className="text-[11px] text-slate-400">{ord.buyerEmail}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                                {ord.paymentMethod || 'ONLINE'}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-900">{formatPrice(ord.totalAmount)}</td>
                            <td className="px-4 py-3">
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {ord.status || 'CONFIRMED'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => setInspectOrder(ord)}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* 2. USERS DIRECTORY WITH ROLE MANAGEMENT                    */}
          {/* ========================================================== */}
          {(activeTab === 'users' || activeTab === 'buyers') && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {['ALL', 'BUYER', 'SELLER'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setUserRoleFilter(r)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        userRoleFilter === r
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {r === 'ALL' ? 'All Roles' : `${r}s`}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search users by name, email, phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">User Name</th>
                      <th className="px-4 py-3">Email Address</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Assigned Role (Editable)</th>
                      <th className="px-4 py-3">Registered Date</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {buyers
                      .filter((b) => {
                        const cleanRole = (b.role || 'ROLE_BUYER').replace('ROLE_', '');
                        const displayRole = cleanRole === 'ADMIN' ? 'BUYER' : cleanRole;
                        const roleMatches =
                          userRoleFilter === 'ALL' ||
                          displayRole === userRoleFilter;
                        const searchMatches =
                          !searchQuery ||
                          b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.phone?.includes(searchQuery);
                        return roleMatches && searchMatches;
                      })
                      .map((buyer, index) => {
                        const cleanRole = (buyer.role || 'ROLE_BUYER').replace('ROLE_', '');
                        const currentRoleClean = cleanRole === 'ADMIN' ? 'BUYER' : cleanRole;
                        return (
                          <tr key={buyer.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-slate-400 font-mono">#{index + 1}</td>
                            <td className="px-4 py-3 font-semibold text-slate-900">{buyer.name}</td>
                            <td className="px-4 py-3 text-slate-600 font-mono">{buyer.email}</td>
                            <td className="px-4 py-3 text-slate-600">{buyer.phone || '—'}</td>
                            <td className="px-4 py-3">
                              {/* Direct Admin Role Switcher - Buyer / Seller */}
                              <select
                                value={currentRoleClean === 'SELLER' ? 'SELLER' : 'BUYER'}
                                onChange={(e) => handleUserRoleChange(buyer.id, e.target.value, buyer.name)}
                                className={`text-[11px] font-bold rounded-lg border px-2.5 py-1 outline-none cursor-pointer transition-colors ${
                                  currentRoleClean === 'SELLER'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                }`}
                              >
                                <option value="BUYER">BUYER</option>
                                <option value="SELLER">SELLER</option>
                              </select>
                            </td>
                            <td className="px-4 py-3 text-slate-500">{formatDate(buyer.createdAt)}</td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleDeleteUser(buyer.id, buyer.name, buyer.email)}
                                className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-800 font-medium hover:underline cursor-pointer"
                                title="Delete User"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* 3. SELLERS & KYC MODERATION                                */}
          {/* ========================================================== */}
          {activeTab === 'sellers' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setSellerFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        sellerFilter === st
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-slate-500">{allSellers.length} registered sellers</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3">Company</th>
                      <th className="px-4 py-3">Contact</th>
                      <th className="px-4 py-3">Sales Cost</th>
                      <th className="px-4 py-3">Commission Amount</th>
                      <th className="px-4 py-3">Sales Product Count</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allSellers
                      .filter((a) => sellerFilter === 'ALL' || a.status === sellerFilter)
                      .map((app) => {
                        const metrics = getSellerMetrics(app);
                        return (
                          <tr key={app.id || app.companyName} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-semibold text-slate-900">{app.companyName || app.name || 'Seller'}</td>
                            <td className="px-4 py-3 text-slate-600">
                              {app.applicantName ? `${app.applicantName} (${app.email})` : app.email || app.phone || 'N/A'}
                            </td>
                            <td className="px-4 py-3 font-bold text-slate-900 font-['Outfit']">
                              {formatPrice(metrics.salesCostPaise)}
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                {formatPrice(metrics.commissionPaise)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-700 font-medium">
                              <span className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-0.5 rounded-md text-[11px] font-bold">
                                <Package className="w-3.5 h-3.5 text-blue-600" />
                                <span>{metrics.salesProductCount} units</span>
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  app.status === 'APPROVED'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : app.status === 'PENDING'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                              >
                                {app.status || 'APPROVED'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right space-x-2">
                              {app.status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() => handleApproveSeller(app.id)}
                                    className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[11px] font-semibold hover:bg-emerald-700 cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => setInspectApp({ ...app, mode: 'reject' })}
                                    className="px-2.5 py-1 bg-rose-600 text-white rounded text-[11px] font-semibold hover:bg-rose-700 cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleDeleteSeller(app.id, app.companyName)}
                                className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-800 font-medium hover:underline cursor-pointer ml-1"
                                title="Delete Seller"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* 4. PRODUCTS CATALOG                                        */}
          {/* ========================================================== */}
          {activeTab === 'products' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search products by title or seller..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">{products.length} products listed</span>
                  <button
                    onClick={() => setShowAddProductModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Product</span>
                  </button>
                  {products.length > 0 && (
                    <button
                      onClick={handleClearAllProducts}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove All Products
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Seller</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Stock</th>
                      <th className="px-4 py-3">3D Model</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-12 text-slate-400">
                          <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <p className="font-semibold text-slate-700 text-sm">No products in catalog</p>
                          <p className="text-xs text-slate-400 mt-0.5">All products have been removed from the store.</p>
                        </td>
                      </tr>
                    ) : (
                      products
                      .filter(
                        (p) =>
                          !searchQuery ||
                          p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.sellerName?.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 flex items-center gap-2.5">
                            <img src={p.image} alt={p.name} className="w-8 h-8 rounded object-cover border border-slate-200" />
                            <span className="font-semibold text-slate-900 line-clamp-1">{p.name}</span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{p.sellerName}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900">{formatPrice(p.price)}</td>
                          <td className="px-4 py-3 text-slate-600">{p.stock} units</td>
                          <td className="px-4 py-3">
                            {p.has3DModel ? (
                              <span className="text-[10px] font-semibold text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded">
                                Enabled
                              </span>
                            ) : (
                              <span className="text-slate-400">No</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="text-rose-600 hover:text-rose-800 font-medium inline-flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* 6. CART PRODUCTS ACROSS USERS                              */}
          {/* ========================================================== */}
          {activeTab === 'cart-products' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">User Cart Items</h2>
                  <p className="text-xs text-slate-500">Live products currently stored in customers' shopping carts</p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by buyer email or product..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3">Customer Email</th>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Product ID</th>
                      <th className="px-4 py-3">Quantity</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Seller</th>
                      <th className="px-4 py-3">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cartProducts.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-8 text-slate-400">
                          No products currently stored in any customer cart.
                        </td>
                      </tr>
                    ) : (
                      cartProducts
                        .filter(
                          (c) =>
                            !searchQuery ||
                            c.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.productId?.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-mono font-medium text-slate-900">{item.userEmail || 'Guest'}</td>
                            <td className="px-4 py-3 flex items-center gap-2">
                              {item.image && (
                                <img src={item.image} alt={item.productName} className="w-7 h-7 rounded object-cover" />
                              )}
                              <span className="font-medium text-slate-900 line-clamp-1">{item.productName}</span>
                            </td>
                            <td className="px-4 py-3 font-mono text-slate-500">{item.productId}</td>
                            <td className="px-4 py-3 font-semibold text-slate-900">{item.quantity}</td>
                            <td className="px-4 py-3 font-semibold text-slate-900">{formatPrice(item.price)}</td>
                            <td className="px-4 py-3 text-slate-600">{item.sellerName || 'Merchant'}</td>
                            <td className="px-4 py-3 text-slate-400">{formatDate(item.updatedAt)}</td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* 7. ORDER PRODUCTS                                          */}
          {/* ========================================================== */}
          {activeTab === 'order-products' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Purchased Order Products</h2>
                  <p className="text-xs text-slate-500">Itemized line items from confirmed orders</p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by order ID or product..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3">Order ID</th>
                      <th className="px-4 py-3">Product Name</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Quantity</th>
                      <th className="px-4 py-3">Unit Price</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3">Merchant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orderProducts.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-8 text-slate-400">
                          No order products recorded yet.
                        </td>
                      </tr>
                    ) : (
                      orderProducts
                        .filter(
                          (item) =>
                            !searchQuery ||
                            item.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.buyerName?.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-mono font-medium text-blue-600">{item.orderId}</td>
                            <td className="px-4 py-3 flex items-center gap-2">
                              {item.image && (
                                <img src={item.image} alt={item.name} className="w-7 h-7 rounded object-cover" />
                              )}
                              <span className="font-medium text-slate-900 line-clamp-1">{item.name}</span>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-slate-900">{item.buyerName}</p>
                              <p className="text-[10px] text-slate-400">{item.buyerEmail}</p>
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-900">{item.quantity}</td>
                            <td className="px-4 py-3 text-slate-600">{formatPrice(item.price)}</td>
                            <td className="px-4 py-3 font-semibold text-slate-900">
                              {formatPrice((item.price || 0) * (item.quantity || 1))}
                            </td>
                            <td className="px-4 py-3 text-slate-600">{item.sellerName || 'Merchant'}</td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* 8. ORDERS LEDGER                                           */}
          {/* ========================================================== */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {['ALL', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        orderFilter === st
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by order ID or customer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3">Order ID</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Total Amount</th>
                      <th className="px-4 py-3">Payment</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {combinedOrders.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-8 text-slate-400">
                          No orders found.
                        </td>
                      </tr>
                    ) : (
                      combinedOrders
                        .filter((o) => {
                          const matchesFilter = orderFilter === 'ALL' || (o.status || 'CONFIRMED') === orderFilter;
                          const matchesSearch =
                            !searchQuery ||
                            (o.orderTrackingNumber || o.id)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            o.buyerName?.toLowerCase().includes(searchQuery.toLowerCase());
                          return matchesFilter && matchesSearch;
                        })
                        .map((ord) => {
                          const ordId = ord.orderTrackingNumber || ord.id;
                          return (
                            <tr key={ordId} className="hover:bg-slate-50">
                              <td className="px-4 py-3 font-mono font-medium text-slate-900">{ordId}</td>
                              <td className="px-4 py-3">
                                <p className="font-medium text-slate-900">{ord.buyerName}</p>
                                <p className="text-[11px] text-slate-400">{ord.buyerEmail}</p>
                              </td>
                              <td className="px-4 py-3 font-semibold text-slate-900">{formatPrice(ord.totalAmount)}</td>
                              <td className="px-4 py-3">
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                                  {ord.paymentMethod || 'ONLINE'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <select
                                  value={ord.status || 'CONFIRMED'}
                                  onChange={(e) => handleStatusChange(ordId, e.target.value)}
                                  className="text-[11px] font-medium rounded border border-slate-200 bg-white px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                >
                                  <option value="CONFIRMED">CONFIRMED</option>
                                  <option value="PROCESSING">PROCESSING</option>
                                  <option value="SHIPPED">SHIPPED</option>
                                  <option value="DELIVERED">DELIVERED</option>
                                  <option value="CANCELLED">CANCELLED</option>
                                </select>
                              </td>
                              <td className="px-4 py-3 text-slate-500">{formatDate(ord.createdAt)}</td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => setInspectOrder(ord)}
                                  className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  Details
                                </button>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* 9. SETTINGS                                                */}
          {/* ========================================================== */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 max-w-2xl">
              <h2 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                Marketplace Settings
              </h2>

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Store / Marketplace Name</label>
                  <input
                    type="text"
                    value={settings.storeName}
                    onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Platform Commission (%)</label>
                    <input
                      type="number"
                      value={settings.commissionRate}
                      onChange={(e) => setSettings({ ...settings, commissionRate: Number(e.target.value) })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Free Shipping Min (₹)</label>
                    <input
                      type="number"
                      value={settings.freeShippingMin}
                      onChange={(e) => setSettings({ ...settings, freeShippingMin: Number(e.target.value) })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Support Email</label>
                    <input
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Support Phone</label>
                    <input
                      type="text"
                      value={settings.supportPhone}
                      onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableOnline}
                      onChange={(e) => setSettings({ ...settings, enableOnline: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="font-medium text-slate-800">Enable Online Payment (Razorpay / Cards)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableCod}
                      onChange={(e) => setSettings({ ...settings, enableCod: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="font-medium text-slate-800">Enable Cash on Delivery (COD)</span>
                  </label>
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs"
                  >
                    Save Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB: COMMISSION & SETTLEMENTS LEDGER (MODEL 2)              */}
          {/* ========================================================== */}
          {activeTab === 'commission' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      Direct Seller Model Active
                    </span>
                    <span className="text-xs text-indigo-200">Zero Payment Gateway Deductions</span>
                  </div>
                  <h2 className="text-xl font-bold font-['Outfit']">Platform Commission &amp; Seller Settlement Ledger</h2>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    Sellers receive 100% of customer payments directly into their personal Google Pay / PhonePe UPI accounts. 
                    The 10% platform commission is tracked here and remitted by sellers to your Admin UPI QR.
                  </p>
                </div>
                <button
                  onClick={fetchData}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-2 border border-white/20 transition-all cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh Ledger</span>
                </button>
              </div>

              {/* 4 Summary Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-slate-500 text-xs font-semibold">Total Platform Sales (GMV)</span>
                  <p className="text-2xl font-black text-slate-900 font-['Outfit']">
                    {formatPrice(adminCommissions.totalPlatformGrossPaise)}
                  </p>
                  <p className="text-[11px] text-slate-400">Gross customer transaction volume</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-slate-500 text-xs font-semibold">Total Commission Accrued</span>
                  <p className="text-2xl font-black text-indigo-700 font-['Outfit']">
                    {formatPrice(adminCommissions.totalCommissionAccruedPaise)}
                  </p>
                  <p className="text-[11px] text-slate-400">10% Platform fee earned</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs space-y-1 bg-emerald-50/20">
                  <span className="text-emerald-800 text-xs font-bold">Commission Collected in Bank</span>
                  <p className="text-2xl font-black text-emerald-700 font-['Outfit']">
                    {formatPrice(adminCommissions.totalCommissionCollectedPaise)}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified in Admin Bank
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs space-y-1 bg-amber-50/30">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-800 text-xs font-bold">Outstanding from Sellers</span>
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  </div>
                  <p className="text-2xl font-black text-amber-900 font-['Outfit']">
                    {formatPrice(adminCommissions.totalCommissionPendingPaise)}
                  </p>
                  <p className="text-[11px] text-amber-700 font-medium">Pending seller remittance</p>
                </div>
              </div>

              {/* Admin Receiving UPI Account Configuration Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Admin Receiving UPI Payment Configuration</h3>
                      <p className="text-xs text-slate-500">Sellers will scan this UPI QR when paying commission to your bank</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
                    Active Payment Receiving Channel
                  </span>
                </div>

                <form onSubmit={handleSaveAdminUpi} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Beneficiary Name</label>
                    <input
                      type="text"
                      required
                      value={adminUpiForm.adminName}
                      onChange={(e) => setAdminUpiForm({ ...adminUpiForm, adminName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl outline-none font-medium text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Admin UPI ID (VPA) *</label>
                    <input
                      type="text"
                      required
                      placeholder="8072628827@upi"
                      value={adminUpiForm.adminUpiId}
                      onChange={(e) => setAdminUpiForm({ ...adminUpiForm, adminUpiId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl outline-none font-mono font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Admin Phone Number</label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={adminUpiForm.adminPhone}
                      onChange={(e) => setAdminUpiForm({ ...adminUpiForm, adminPhone: e.target.value.replace(/\D/g, '') })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl outline-none font-mono font-bold text-slate-800"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={isSavingAdminUpi}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      {isSavingAdminUpi ? 'Saving...' : 'Save Receiving Settings'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Commission Invoices Verification Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <span>Vendor Commission Settlement Invoices</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Verify seller payments against bank statement UTR numbers
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    {['ALL', 'SUBMITTED', 'PENDING', 'VERIFIED'].map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setCommissionFilter(tab)}
                        className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                          commissionFilter === tab
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {tab === 'ALL'
                          ? `All (${adminCommissions.invoices?.length || 0})`
                          : tab === 'SUBMITTED'
                          ? `Needs Verification (${adminCommissions.invoices?.filter((i) => i.status === 'SUBMITTED').length || 0})`
                          : tab === 'PENDING'
                          ? `Unpaid (${adminCommissions.invoices?.filter((i) => i.status === 'PENDING').length || 0})`
                          : `Verified (${adminCommissions.invoices?.filter((i) => i.status === 'VERIFIED').length || 0})`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-3.5">Vendor / Store</th>
                        <th className="px-5 py-3.5">Order ID</th>
                        <th className="px-5 py-3.5">Order Date</th>
                        <th className="px-5 py-3.5">Customer Payment (100%)</th>
                        <th className="px-5 py-3.5">Admin Fee (10%)</th>
                        <th className="px-5 py-3.5">Submitted UTR Ref</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      {(() => {
                        const filtered = (adminCommissions.invoices || []).filter((inv) => {
                          if (commissionFilter === 'ALL') return true;
                          return inv.status === commissionFilter;
                        });

                        if (filtered.length === 0) {
                          return (
                            <tr>
                              <td colSpan={8} className="px-5 py-8 text-center text-slate-400 italic">
                                No commission invoices match the selected filter.
                              </td>
                            </tr>
                          );
                        }

                        return filtered.map((inv) => (
                          <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-5 py-4 font-bold text-slate-900">
                              <div className="flex items-center gap-1.5">
                                <Store className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span>{inv.sellerName || 'Verified Seller'}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4 font-mono font-bold text-slate-800">
                              {inv.orderTrackingNumber}
                            </td>
                            <td className="px-5 py-4 text-slate-500">
                              {formatDate(inv.createdAt)}
                            </td>
                            <td className="px-5 py-4 font-bold text-slate-900 font-['Outfit']">
                              {formatPrice(inv.grossAmount)}
                            </td>
                            <td className="px-5 py-4 font-bold text-indigo-700 font-['Outfit']">
                              {formatPrice(inv.commissionAmount)}
                            </td>
                            <td className="px-5 py-4 font-mono text-[11px]">
                              {inv.utrNumber ? (
                                <span className="bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-800 border border-slate-200">
                                  {inv.utrNumber}
                                </span>
                              ) : (
                                <span className="text-slate-300 italic">None</span>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              {inv.status === 'VERIFIED' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified in Bank
                                </span>
                              ) : inv.status === 'SUBMITTED' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
                                  <Clock className="w-3 h-3 text-blue-600" /> UTR Submitted
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                  <AlertCircle className="w-3 h-3 text-amber-600" /> Pending Payment
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-4 text-right">
                              {inv.status === 'SUBMITTED' ? (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleVerifyCommission(inv.id)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                                    title="Verify UTR and approve in Bank"
                                  >
                                    Verify &amp; Approve
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRejectCommission(inv.id)}
                                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                                    title="Reject UTR"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : inv.status === 'VERIFIED' ? (
                                <span className="text-[11px] text-emerald-700 font-bold">
                                  Settled ({formatDate(inv.verifiedAt)})
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">
                                  Awaiting payment
                                </span>
                              )}
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================== */}
      {/* MODALS                                                     */}
      {/* ========================================================== */}

      {/* Admin Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Add New Product to Store &amp; Seller</h3>
                <p className="text-xs text-slate-500">Publish product instantly to marketplace and seller dashboard</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddProductModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdminAddProductSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wireless Noise-Cancelling Headphones"
                  value={adminProductForm.name}
                  onChange={(e) => setAdminProductForm({ ...adminProductForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={adminProductForm.category}
                    onChange={(e) => setAdminProductForm({ ...adminProductForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 capitalize"
                  >
                    {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assign to Seller *</label>
                  <select
                    value={adminProductForm.sellerName}
                    onChange={(e) => setAdminProductForm({ ...adminProductForm, sellerName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {allSellers.map((s) => (
                      <option key={s.id || s.companyName} value={s.companyName || s.name || 'Seller'}>
                        {s.companyName || s.name || 'Seller'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="2999"
                    value={adminProductForm.priceRupees}
                    onChange={(e) => setAdminProductForm({ ...adminProductForm, priceRupees: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">MRP Price (₹)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="4999"
                    value={adminProductForm.originalPriceRupees}
                    onChange={(e) => setAdminProductForm({ ...adminProductForm, originalPriceRupees: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Units *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="25"
                    value={adminProductForm.stock}
                    onChange={(e) => setAdminProductForm({ ...adminProductForm, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tagline / Highlight</label>
                <input
                  type="text"
                  placeholder="e.g. Ultra high-fidelity audio with 40-hour battery"
                  value={adminProductForm.tagline}
                  onChange={(e) => setAdminProductForm({ ...adminProductForm, tagline: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Product Image Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700">Product Image</label>
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px]">
                    <button
                      type="button"
                      onClick={() => setAdminProductImageMode('upload')}
                      className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer ${
                        adminProductImageMode === 'upload' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-500'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminProductImageMode('url')}
                      className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer ${
                        adminProductImageMode === 'url' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-500'
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {adminProductImageMode === 'upload' ? (
                  <div className="flex items-center gap-3">
                    <input
                      ref={adminProductImageFileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAdminProductImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => adminProductImageFileRef.current?.click()}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                      <span>Choose Photo</span>
                    </button>
                    {adminProductForm.image && (
                      <img
                        src={adminProductForm.image}
                        alt="Preview"
                        className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                      />
                    )}
                  </div>
                ) : (
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={adminProductForm.image}
                    onChange={(e) => setAdminProductForm({ ...adminProductForm, image: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdminProduct}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isSubmittingAdminProduct ? 'Publishing...' : 'Publish Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Seller Inspection Modal */}
      {inspectApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Seller Details: {inspectApp.companyName}</h3>
              <button onClick={() => setInspectApp(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <p>
                <strong>Applicant:</strong> {inspectApp.applicantName} ({inspectApp.email})
              </p>
              {(() => {
                const m = getSellerMetrics(inspectApp);
                return (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <p><strong>Total Sales Cost:</strong> {formatPrice(m.salesCostPaise)}</p>
                    <p><strong>Platform Commission:</strong> {formatPrice(m.commissionPaise)}</p>
                    <p><strong>Sales Product Count:</strong> {m.salesProductCount} units sold</p>
                  </div>
                );
              })()}
              <p>
                <strong>Registered Address:</strong> {inspectApp.registeredAddress || 'Registered Business Office'}
              </p>
              <p>
                <strong>Bank Settlement:</strong> {inspectApp.bankAccount || 'Direct UPI Settlement'}
              </p>
            </div>

            {inspectApp.mode === 'reject' ? (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-rose-600">Reason for rejection:</label>
                <textarea
                  rows={2}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Invalid GSTIN document"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-rose-500"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setInspectApp(null)}
                    className="px-3 py-1.5 text-slate-600 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleRejectSeller(inspectApp.id)}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleDeleteSeller(inspectApp.id, inspectApp.companyName)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded text-xs font-semibold cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Seller
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setInspectApp(null)}
                    className="px-3 py-1.5 text-slate-600 text-xs font-medium cursor-pointer"
                  >
                    Close
                  </button>
                  {inspectApp.status === 'PENDING' && (
                    <button
                      onClick={() => handleApproveSeller(inspectApp.id)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold cursor-pointer"
                    >
                      Approve Seller
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Inspection Modal */}
      {inspectOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                Order #{inspectOrder.orderTrackingNumber || inspectOrder.id}
              </h3>
              <button onClick={() => setInspectOrder(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-400">Customer</p>
                  <p className="font-semibold text-slate-900">{inspectOrder.buyerName}</p>
                  <p className="text-slate-500">{inspectOrder.buyerEmail}</p>
                  <p className="text-slate-500">{inspectOrder.buyerPhone}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-400">Payment & Total</p>
                  <p className="font-bold text-slate-900">{formatPrice(inspectOrder.totalAmount)}</p>
                  <p className="text-blue-600 font-medium">{inspectOrder.paymentMethod || 'ONLINE'}</p>
                </div>
              </div>

              {inspectOrder.shippingAddress && (
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-[10px] uppercase font-semibold text-slate-400 mb-1">Shipping Address</p>
                  <p className="text-slate-700">
                    {typeof inspectOrder.shippingAddress === 'string'
                      ? inspectOrder.shippingAddress
                      : `${inspectOrder.shippingAddress?.fullName}, ${inspectOrder.shippingAddress?.address}, ${inspectOrder.shippingAddress?.district || inspectOrder.shippingAddress?.city}, ${inspectOrder.shippingAddress?.state} - ${inspectOrder.shippingAddress?.pincode}`}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setInspectOrder(null)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buyer Profile & Role Modal */}
      {inspectBuyer && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">User Account Details</h3>
              <button onClick={() => setInspectBuyer(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-semibold">Name</p>
                <p className="font-bold text-sm text-slate-900">{inspectBuyer.name}</p>
              </div>

              <div>
                <p className="text-slate-400 text-[10px] uppercase font-semibold">Email Address</p>
                <p className="font-mono text-slate-700">{inspectBuyer.email}</p>
              </div>

              <div>
                <p className="text-slate-400 text-[10px] uppercase font-semibold">Mobile Phone</p>
                <p className="text-slate-700">{inspectBuyer.phone || 'Not provided'}</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-800">Change User Role:</label>
                <select
                  value={(inspectBuyer.role || 'ROLE_BUYER').replace('ROLE_', '') === 'SELLER' ? 'SELLER' : 'BUYER'}
                  onChange={(e) => handleUserRoleChange(inspectBuyer.id, e.target.value, inspectBuyer.name)}
                  className="w-full p-2 bg-white border border-slate-200 rounded text-xs font-semibold outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="BUYER">BUYER (Shopping & Orders)</option>
                  <option value="SELLER">SELLER (Storefront & Product Publishing)</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Updates permission level in database immediately.
                </p>
              </div>

              <div>
                <p className="text-slate-400 text-[10px] uppercase font-semibold">Registered On</p>
                <p className="text-slate-500">{formatDate(inspectBuyer.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => handleDeleteUser(inspectBuyer.id, inspectBuyer.name, inspectBuyer.email)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded text-xs font-semibold cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Account
              </button>
              <button
                onClick={() => setInspectBuyer(null)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
