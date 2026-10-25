import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Store, TrendingUp, Package, DollarSign, Clock, 
  AlertCircle, CheckCircle2, Plus, Edit3, Trash2, Truck, ExternalLink,
  LayoutDashboard, ShoppingBag, CreditCard, Settings, Menu, X,
  Search, RefreshCw, ChevronRight, Building2, ShieldCheck, ArrowRight,
  Upload, Camera, QrCode, Phone, Mail, MapPin, Check, Sparkles,
  FileCode, Download, Image as ImageIcon, FileText, Copy, Smartphone
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useProductStore } from '../../store/productStore';
import { useOrderStore } from '../../store/orderStore';
import { useSellerStore } from '../../store/sellerStore';
import { formatPrice, formatDate } from '../../utils/formatters';
import { CATEGORIES } from '../../utils/constants';

export default function SellerDashboard() {
  const { user, isApprovedSeller, isPendingSeller } = useAuthStore();
  const { products, addProduct, addProducts, deleteProduct, updateProduct, fetchProductsFromDb } = useProductStore();
  const { orders, updateSuborderStatus } = useOrderStore();
  const { currentSellerProfile, saveSellerProfile, fetchSellerProfile } = useSellerStore();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [catalogViewMode, setCatalogViewMode] = useState('my'); // 'my' | 'all'

  const qrInputRef = useRef(null);
  const productImageInputRef = useRef(null);
  const jsonFileInputRef = useRef(null);
  const jsonCatalogInputRef = useRef(null);

  useEffect(() => {
    if (fetchProductsFromDb) {
      fetchProductsFromDb();
    }
  }, []);

  const [imageInputMode, setImageInputMode] = useState('upload'); // 'upload' | 'url'
  const [jsonNotice, setJsonNotice] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);

  const [profileForm, setProfileForm] = useState({
    sellerName: '',
    sellerAddress: '',
    phone: '',
    email: '',
    gpayQr: '',
  });

  // Dynamic store identity
  const currentStoreName = currentSellerProfile?.sellerName || user?.companyName || user?.name || 'Seller Store';
  const sellerId = user?.id ? `seller-${user.id}` : 'seller-techhub';

  // Model 2: Platform Commission & Invoices State
  const [commissionData, setCommissionData] = useState({
    totalGrossSalesPaise: 0,
    totalCommissionPaise: 0,
    pendingCommissionPaise: 0,
    submittedCommissionPaise: 0,
    verifiedCommissionPaise: 0,
    invoices: [],
    adminPaymentConfig: null,
  });
  const [showPayCommissionModal, setShowPayCommissionModal] = useState(false);
  const [commissionUtrInput, setCommissionUtrInput] = useState('');
  const [isSubmittingCommission, setIsSubmittingCommission] = useState(false);
  const [copiedAdminUpi, setCopiedAdminUpi] = useState(false);

  const fetchSellerCommissions = async () => {
    try {
      const res = await fetch(`http://localhost:8085/api/commissions/seller?sellerName=${encodeURIComponent(currentStoreName)}`);
      if (res.ok) {
        const data = await res.json();
        setCommissionData(data);
      }
    } catch (err) {
      console.error('Failed to fetch commission ledger:', err);
    }
  };

  useEffect(() => {
    fetchSellerCommissions();
  }, [currentStoreName]);

  const handlePayCommissionSubmit = async (e) => {
    e.preventDefault();
    if (!commissionUtrInput || commissionUtrInput.trim().length < 6) {
      alert('Please enter a valid 12-digit UPI Transaction Reference / UTR Number.');
      return;
    }
    setIsSubmittingCommission(true);
    try {
      const res = await fetch('http://localhost:8085/api/commissions/seller/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerName: currentStoreName,
          utrNumber: commissionUtrInput.trim(),
        }),
      });
      if (res.ok) {
        alert('Commission payment submitted successfully! Admin will verify against bank records.');
        setShowPayCommissionModal(false);
        setCommissionUtrInput('');
        fetchSellerCommissions();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.message || 'Failed to submit commission payment.');
      }
    } catch (err) {
      alert('Network error submitting commission payment.');
    } finally {
      setIsSubmittingCommission(false);
    }
  };

  // Fetch or check seller profile on mount
  useEffect(() => {
    fetchSellerProfile(user?.id, user?.email).then((prof) => {
      if (prof && (prof.sellerName || prof.companyName)) {
        setProfileForm({
          sellerName: prof.sellerName || prof.companyName || '',
          sellerAddress: prof.sellerAddress || prof.registeredAddress || '',
          phone: prof.phone || user?.phone || '',
          email: prof.email || user?.email || '',
          gpayQr: prof.gpayQr || '',
        });
      } else if (!currentSellerProfile?.sellerName) {
        // First time seller entering dashboard: ask for details
        setProfileForm({
          sellerName: user?.companyName || user?.name || '',
          sellerAddress: '',
          phone: user?.phone || '',
          email: user?.email || '',
          gpayQr: '',
        });
        setShowSetupModal(true);
      }
    });
  }, [user?.id, user?.email]);

  // Synchronize form when currentSellerProfile updates
  useEffect(() => {
    if (currentSellerProfile?.sellerName) {
      setProfileForm((prev) => ({
        sellerName: currentSellerProfile.sellerName || prev.sellerName,
        sellerAddress: currentSellerProfile.sellerAddress || currentSellerProfile.registeredAddress || prev.sellerAddress,
        phone: currentSellerProfile.phone || prev.phone,
        email: currentSellerProfile.email || prev.email,
        gpayQr: currentSellerProfile.gpayQr || prev.gpayQr,
      }));
    }
  }, [currentSellerProfile]);

  const handlePhotoUpload = (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, JPEG, WEBP, etc.).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size exceeds 5MB limit. Please upload a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setProfileForm((prev) => ({
        ...prev,
        [field]: event.target.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    if (!profileForm.sellerName.trim()) {
      alert('Please enter your Seller / Store Name.');
      return;
    }

    setIsSavingProfile(true);
    try {
      await saveSellerProfile({
        ...profileForm,
        userId: user?.id,
      });
      setShowSetupModal(false);
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 4000);
    } catch (err) {
      console.error('Failed to save seller profile:', err);
      alert('Failed to save seller profile. Please try again.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const [newProductForm, setNewProductForm] = useState({
    name: '',
    category: 'electronics',
    priceRupees: 2999,
    originalPriceRupees: 4999,
    stock: 25,
    tagline: '',
    description: '',
    brand: '',
    warranty: '',
    material: '',
    features: '',
    image: '',
  });

  const downloadSampleJson = () => {
    const sample = {
      name: "Apex SoundWave Studio Wireless",
      category: "electronics",
      priceRupees: 2999,
      originalPriceRupees: 4999,
      stock: 25,
      tagline: "Engineered with premium aerospace alloy and active smart telemetry.",
      description: "Designed for professionals demanding uncompromised precision and all-day endurance with 40-hour battery life and rapid USB-C charging.",
      brand: "Apex Audio",
      warranty: "1 Year Replacement Warranty",
      material: "Aerospace Aluminum & Memory Foam",
      features: "Active Hybrid ANC, Bluetooth 5.3, Ultra Low Latency",
      specs: {
        "Brand": "Apex Audio",
        "Battery Life": "40 Hours Playtime",
        "Connectivity": "Bluetooth 5.3 + 3.5mm Aux",
        "Noise Cancellation": "Active Hybrid ANC (4 microphones)",
        "Warranty": "1 Year Replacement Warranty"
      },
      image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80"
    };
    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-details-sample.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleProductImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, JPEG, WEBP, etc.).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size exceeds 5MB limit. Please upload a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setNewProductForm((prev) => ({
        ...prev,
        image: event.target.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleJsonUpload = (e, target = 'modal') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);

        // Case 1: Bulk array of products
        if (Array.isArray(parsed)) {
          if (parsed.length === 0) {
            alert('The uploaded JSON array contains no products.');
            return;
          }

          const formattedProducts = parsed.map((item, idx) => {
            const priceR = Number(item.priceRupees || (item.price ? item.price / 100 : 999));
            const origR = Number(item.originalPriceRupees || (item.originalPrice ? item.originalPrice / 100 : priceR * 1.25));
            const specsObj = item.specs || {};
            const specs = {
              ...(item.brand ? { 'Brand / Manufacturer': item.brand } : {}),
              ...(item.warranty ? { 'Warranty Info': item.warranty } : {}),
              ...(item.material ? { 'Material / Fabric / Build': item.material } : {}),
              ...(item.features ? { 'Key Highlights': item.features } : {}),
              ...specsObj,
            };

            return {
              name: item.name || item.title || `Imported Product ${idx + 1}`,
              category: item.category || 'electronics',
              price: Math.round(priceR * 100),
              originalPrice: Math.round(origR * 100),
              discountPercent: origR > priceR ? Math.round(((origR - priceR) / origR) * 100) : 0,
              stock: Number(item.stock || item.quantity || 10),
              tagline: item.tagline || '',
              description: item.description || '',
              specs: specs,
              brand: item.brand || specsObj['Brand'] || specsObj['Brand / Manufacturer'] || currentStoreName,
              image: item.image || item.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
              images: [item.image || item.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'],
              sellerId: user?.id || sellerId,
              sellerName: currentStoreName,
              sellerStatus: 'APPROVED',
            };
          });

          addProducts(formattedProducts);
          setJsonNotice(`Successfully imported ${formattedProducts.length} products with full details from JSON!`);
          setTimeout(() => setJsonNotice(null), 5000);
          if (target === 'modal') {
            setShowAddProductModal(false);
          }
          return;
        }

        // Case 2: Single product JSON
        if (typeof parsed === 'object' && parsed !== null) {
          const priceR = Number(parsed.priceRupees || (parsed.price ? parsed.price / 100 : 2999));
          const origR = Number(parsed.originalPriceRupees || (parsed.originalPrice ? parsed.originalPrice / 100 : Math.round(priceR * 1.4)));
          const specsObj = parsed.specs || {};
          const brand = parsed.brand || specsObj['Brand / Manufacturer'] || specsObj['Brand'] || specsObj['Manufacturer'] || '';
          const warranty = parsed.warranty || specsObj['Warranty Info'] || specsObj['Warranty'] || '';
          const material = parsed.material || specsObj['Material / Fabric / Build'] || specsObj['Material'] || specsObj['Fabric'] || '';
          const features = parsed.features || specsObj['Key Highlights'] || specsObj['Highlights'] || '';

          if (target === 'catalog') {
            const specs = {
              ...(brand ? { 'Brand / Manufacturer': brand } : {}),
              ...(warranty ? { 'Warranty Info': warranty } : {}),
              ...(material ? { 'Material / Fabric / Build': material } : {}),
              ...(features ? { 'Key Highlights': features } : {}),
              ...specsObj,
            };

            addProduct({
              name: parsed.name || parsed.title || 'Imported Product',
              category: parsed.category || 'electronics',
              price: Math.round(priceR * 100),
              originalPrice: Math.round(origR * 100),
              discountPercent: origR > priceR ? Math.round(((origR - priceR) / origR) * 100) : 0,
              stock: Number(parsed.stock || parsed.quantity || 10),
              tagline: parsed.tagline || '',
              description: parsed.description || '',
              specs: specs,
              brand: brand || currentStoreName,
              image: parsed.image || parsed.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
              images: [parsed.image || parsed.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'],
              sellerId: user?.id || sellerId,
              sellerName: currentStoreName,
              sellerStatus: 'APPROVED',
            });
            setJsonNotice(`Product "${parsed.name || parsed.title}" added to catalog with details from JSON!`);
            setTimeout(() => setJsonNotice(null), 5000);
          } else {
            setNewProductForm({
              name: parsed.name || parsed.title || '',
              category: parsed.category || 'electronics',
              priceRupees: priceR,
              originalPriceRupees: origR,
              stock: Number(parsed.stock || parsed.quantity || 25),
              tagline: parsed.tagline || '',
              description: parsed.description || '',
              brand: brand,
              warranty: warranty,
              material: material,
              features: features,
              image: parsed.image || parsed.imageUrl || '',
            });
            setJsonNotice('Product details autofilled from JSON successfully!');
            setTimeout(() => setJsonNotice(null), 4000);
          }
        } else {
          alert('Invalid JSON structure. Please ensure the file contains a product object or array.');
        }
      } catch (err) {
        console.error('Error parsing JSON:', err);
        alert('Failed to parse JSON file. Please check file formatting syntax.');
      } finally {
        if (e.target) e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleOpenAddModal = () => {
    setEditingProductId(null);
    setNewProductForm({
      name: '',
      category: 'electronics',
      priceRupees: 2999,
      originalPriceRupees: 4999,
      stock: 25,
      tagline: '',
      description: '',
      brand: '',
      warranty: '',
      material: '',
      features: '',
      image: '',
    });
    setShowAddProductModal(true);
  };

  const handleEditProduct = (p) => {
    setEditingProductId(p.id);
    const specsObj = p.specs || {};
    setNewProductForm({
      name: p.name || '',
      category: p.category || 'electronics',
      priceRupees: p.price ? Math.round(p.price / 100) : 2999,
      originalPriceRupees: p.originalPrice ? Math.round(p.originalPrice / 100) : 4999,
      stock: p.stock || 25,
      tagline: p.tagline || '',
      description: p.description || '',
      brand: p.brand || specsObj['Brand / Manufacturer'] || specsObj['Brand'] || specsObj['Manufacturer'] || '',
      warranty: p.warranty || specsObj['Warranty Info'] || specsObj['Warranty'] || '',
      material: p.material || specsObj['Material / Fabric / Build'] || specsObj['Material'] || specsObj['Fabric'] || '',
      features: p.features || specsObj['Key Highlights'] || specsObj['Highlights'] || '',
      image: p.image || '',
    });
    setShowAddProductModal(true);
  };

  // Calculate Seller Metrics without hardcoded techhub duplicate data
  const myProducts = products.filter((p) => {
    // 1. Match by sellerId (handles number 5 vs string "5" vs "seller-5")
    const matchId =
      (user?.id && (String(p.sellerId) === String(user.id) || p.sellerId === `seller-${user.id}`)) ||
      p.sellerId === sellerId;

    // 2. Match by store name or user name
    const pStore = (p.sellerName || '').trim().toLowerCase();
    const currStore = (currentStoreName || '').trim().toLowerCase();
    const uName = (user?.name || '').trim().toLowerCase();

    const matchName =
      (currStore && pStore === currStore) ||
      (uName && pStore === uName) ||
      (pStore && currStore && (pStore.includes(currStore) || currStore.includes(pStore)));

    // 3. Admin user or store owner
    const isAdminUser = user?.role === 'ROLE_ADMIN' || user?.isAdminUser || user?.email === 'pravin007ptk@gmail.com';

    return matchId || matchName || (isAdminUser && (!p.sellerName || p.sellerName === 'Pravinkumar' || p.sellerName === 'TechHub Retailers Pvt Ltd'));
  });

  const displayedProducts = catalogViewMode === 'all' ? products : myProducts;
  
  // Find suborders for this seller
  const mySuborders = [];
  orders.forEach((ord) => {
    ord.suborders?.forEach((sub) => {
      if (
        sub.sellerId === user?.id ||
        sub.sellerId === sellerId ||
        (currentStoreName && sub.sellerName?.toLowerCase() === currentStoreName.toLowerCase())
      ) {
        mySuborders.push({ ...sub, parentOrderId: ord.id, createdAt: ord.createdAt });
      }
    });
  });

  const grossSalesPaise = mySuborders.reduce((acc, sub) => {
    return acc + sub.items.reduce((sAcc, i) => sAcc + i.price * i.quantity, 0);
  }, 0);

  const unitsSold = mySuborders.reduce((acc, sub) => {
    return acc + sub.items.reduce((sAcc, i) => sAcc + i.quantity, 0);
  }, 0);

  const netPayoutPaise = Math.round(grossSalesPaise * 0.90); // 90% to seller after 10% platform fee

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!isApprovedSeller()) {
      alert('Your seller application is currently PENDING. Product publishing is locked until Admin approval.');
      return;
    }

    if (!newProductForm.image) {
      alert('Please upload a product photo or provide an image URL.');
      return;
    }

    const pricePaise = Math.round(Number(newProductForm.priceRupees) * 100);
    const origPricePaise = Math.round(Number(newProductForm.originalPriceRupees || newProductForm.priceRupees) * 100);
    const discount = origPricePaise > pricePaise 
      ? Math.round(((origPricePaise - pricePaise) / origPricePaise) * 100) 
      : 0;

    const specs = {
      ...(newProductForm.brand ? { 'Brand / Manufacturer': newProductForm.brand } : {}),
      ...(newProductForm.warranty ? { 'Warranty Info': newProductForm.warranty } : {}),
      ...(newProductForm.material ? { 'Material / Fabric / Build': newProductForm.material } : {}),
      ...(newProductForm.features ? { 'Key Highlights': newProductForm.features } : {}),
    };

    if (editingProductId) {
      updateProduct(editingProductId, {
        name: newProductForm.name,
        category: newProductForm.category || 'electronics',
        price: pricePaise,
        originalPrice: origPricePaise,
        discountPercent: discount,
        stock: Number(newProductForm.stock) || 1,
        tagline: newProductForm.tagline || '',
        description: newProductForm.description || '',
        specs: specs,
        brand: newProductForm.brand || currentStoreName,
        image: newProductForm.image,
        images: [newProductForm.image],
      });
      setJsonNotice(`Product "${newProductForm.name}" updated successfully!`);
      setTimeout(() => setJsonNotice(null), 4000);
    } else {
      addProduct({
        name: newProductForm.name,
        category: newProductForm.category || 'electronics',
        price: pricePaise,
        originalPrice: origPricePaise,
        discountPercent: discount,
        stock: Number(newProductForm.stock) || 1,
        tagline: newProductForm.tagline || '',
        description: newProductForm.description || '',
        specs: specs,
        brand: newProductForm.brand || currentStoreName,
        image: newProductForm.image,
        images: [newProductForm.image],
        sellerId: user?.id || sellerId,
        sellerName: currentStoreName,
        sellerStatus: 'APPROVED',
      });
      setJsonNotice(`Product "${newProductForm.name}" published successfully!`);
      setTimeout(() => setJsonNotice(null), 4000);
    }

    setShowAddProductModal(false);
    setEditingProductId(null);
    setNewProductForm({
      name: '',
      category: 'electronics',
      priceRupees: 2999,
      originalPriceRupees: 4999,
      stock: 25,
      tagline: '',
      description: '',
      brand: '',
      warranty: '',
      material: '',
      features: '',
      image: '',
    });
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package, badge: myProducts.length },
    { id: 'orders', label: 'Orders', icon: Truck, badge: mySuborders.length, badgeColor: 'bg-emerald-100 text-emerald-700' },
    { id: 'earnings', label: 'Earnings & Payouts', icon: CreditCard },
    { id: 'settings', label: 'Store Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* Mobile Top Header Bar with Menu Toggle */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 -ml-2 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-emerald-600" />
          <span className="font-bold text-sm text-slate-900 truncate max-w-[200px]">
            {currentStoreName}
          </span>
        </div>
        <div className="w-5" />
      </div>

      <div className="flex-1 flex max-w-[1500px] w-full mx-auto">
        {/* ============================================================== */}
        {/* SIDEBAR NAVIGATION                                             */}
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
            {/* Mobile close toggle */}
            <div className="lg:hidden px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Seller Navigation</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-slate-500 hover:text-slate-800 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Seller Store Header in Sidebar */}
            <div className="p-4 sm:p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-xs shrink-0">
                  <Store className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-bold text-slate-900 truncate">
                    {currentStoreName}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {isApprovedSeller() ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" />
                        <span>Pending</span>
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400">
                      ID: {currentSellerProfile?.id ? `SLR-${currentSellerProfile.id}` : (user?.id ? `SLR-${user.id}` : 'SLR-01')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Menu Links */}
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
                    }}
                    className={`
                      w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium
                      transition-all text-left group cursor-pointer
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
              <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-xs">
                {user?.name?.charAt(0) || 'S'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Seller Account'}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email || 'seller@a2zcart.com'}</p>
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
        {/* MAIN DASHBOARD CONTENT AREA                                    */}
        {/* ============================================================== */}
        <main className="flex-1 p-3.5 sm:p-7 space-y-4 sm:space-y-6 min-w-0">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 capitalize">
                {navItems.find((i) => i.id === activeTab)?.label}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeTab === 'dashboard' && 'Live performance metrics and order fulfillment overview'}
                {activeTab === 'products' && 'Manage your product inventory, pricing, and catalog listings'}
                {activeTab === 'orders' && 'Fulfill customer orders and update dispatch tracking'}
                {activeTab === 'earnings' && 'Financial settlement overview and revenue distribution'}
                {activeTab === 'settings' && 'Your vendor business registration details and KYC status'}
              </p>
            </div>
          </div>

          {/* Feedback & Notice Banners */}
          {jsonNotice && (
            <div className="bg-blue-50 border border-blue-200 text-blue-900 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{jsonNotice}</span>
              </div>
              <button onClick={() => setJsonNotice(null)} className="text-blue-700 hover:text-blue-900 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {saveSuccessNotice && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Store profile updated successfully!</span>
              </div>
              <button onClick={() => setSaveSuccessNotice(false)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Warning Alert if Status is PENDING */}
          {isPendingSeller() && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900 shadow-xs">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-sm">Action Restricted: Application Pending Approval</span>
                <p className="text-amber-800">
                  Per platform security rules, sellers with <code>PENDING</code> or <code>REJECTED</code> status cannot publish products or process customer orders. Switch your active persona in the top navigation bar to <strong>Platform Admin</strong> to review and approve this company!
                </p>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 1: DASHBOARD OVERVIEW                                  */}
          {/* ========================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4 sm:space-y-6">
              {/* KPI Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                    <span>Gross Sales</span>
                    <DollarSign className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-slate-900 mt-1 sm:mt-2 font-['Outfit']">{formatPrice(grossSalesPaise)}</p>
                  <span className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" /> +18.4%
                  </span>
                </div>

                <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                    <span>Net Payout</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-emerald-600 mt-1 sm:mt-2 font-['Outfit']">{formatPrice(netPayoutPaise)}</p>
                  <span className="text-[10px] sm:text-[11px] text-slate-400 mt-1 block">After 10% fee</span>
                </div>

                <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                    <span>Units Sold</span>
                    <Package className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-slate-900 mt-1 sm:mt-2 font-['Outfit']">{unitsSold} Units</p>
                  <span className="text-[10px] sm:text-[11px] text-slate-500 mt-1 block">Completed orders</span>
                </div>

                <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                    <span>Active Listings</span>
                    <Store className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-slate-900 mt-1 sm:mt-2 font-['Outfit']">{myProducts.length} Items</p>
                  <span className="text-[10px] sm:text-[11px] text-slate-500 mt-1 block">Live in store</span>
                </div>
              </div>

              {/* Quick Split: Recent Orders & Recent Products */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders Overview */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <span>Fulfillment Orders</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>View all ({mySuborders.length})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {mySuborders.length === 0 ? (
                    <p className="text-xs text-slate-400 py-8 text-center">No orders currently awaiting processing.</p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {mySuborders.slice(0, 3).map((sub, idx) => (
                        <div key={idx} className="py-3 flex items-center justify-between text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-900">{sub.suborderId}</span>
                              <span className="px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 text-[10px]">
                                {sub.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">Carrier: {sub.courier} · {sub.items.length} items</p>
                          </div>
                          <span className="font-mono text-slate-400 text-[11px]">{sub.trackingNumber}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Catalog Overview */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <Package className="w-4 h-4 text-emerald-600" />
                      <span>Product Inventory</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('products')}
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>View all ({myProducts.length})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {myProducts.length === 0 ? (
                    <p className="text-xs text-slate-400 py-8 text-center">No products published yet.</p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {myProducts.slice(0, 3).map((p) => (
                        <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover bg-slate-100 shrink-0" />
                            <div>
                              <p className="font-bold text-slate-800 line-clamp-1 max-w-[180px]">{p.name}</p>
                              <p className="text-[11px] text-slate-500">{formatPrice(p.price)}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.stock < 10 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {p.stock} in stock
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 2: PRODUCTS CATALOG                                    */}
          {/* ========================================================== */}
          {activeTab === 'products' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search your products by title..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {isApprovedSeller() && (
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="bg-slate-100 p-0.5 rounded-lg flex items-center text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setCatalogViewMode('my')}
                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          catalogViewMode === 'my'
                            ? 'bg-white text-blue-600 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        My Store ({myProducts.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setCatalogViewMode('all')}
                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          catalogViewMode === 'all'
                            ? 'bg-white text-blue-600 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        All Products ({products.length})
                      </button>
                    </div>

                    <input
                      ref={jsonCatalogInputRef}
                      type="file"
                      accept=".json,application/json"
                      onChange={(e) => handleJsonUpload(e, 'catalog')}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => jsonCatalogInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                      title="Upload product details in JSON format"
                    >
                      <FileCode className="w-3.5 h-3.5 text-blue-600" />
                      <span>Upload JSON</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenAddModal}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Product</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="p-3">Product</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Available Stock</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {displayedProducts
                      .filter((p) => !productSearch || p.name?.toLowerCase().includes(productSearch.toLowerCase()))
                      .map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-3 flex items-center gap-3">
                            <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg bg-slate-100 shrink-0" />
                            <div>
                              <p className="font-bold text-slate-800 line-clamp-1 max-w-xs">{p.name}</p>
                              {p.tagline && (
                                <p className="text-[10px] text-slate-500 line-clamp-1 max-w-xs">{p.tagline}</p>
                              )}
                              <p className="text-[10px] text-slate-400 font-mono">{p.id}</p>
                            </div>
                          </td>
                          <td className="p-3 text-slate-600 capitalize">{p.category}</td>
                          <td className="p-3 font-bold text-slate-900">{formatPrice(p.price)}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                p.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                              }`}>
                                {p.stock} Units
                              </span>
                              {isApprovedSeller() && (
                                <button
                                  onClick={() => updateProduct(p.id, { stock: (p.stock || 0) + 10 })}
                                  className="text-[10px] text-blue-600 hover:underline font-bold cursor-pointer"
                                  title="Restock +10"
                                >
                                  +10
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-right space-x-2">
                            {isApprovedSeller() && (
                              <button
                                onClick={() => handleEditProduct(p)}
                                className="text-slate-500 hover:text-blue-600 cursor-pointer"
                                title="Edit product details"
                              >
                                <Edit3 className="w-4 h-4 inline" />
                              </button>
                            )}
                            <Link to={`/product/${p.id}`} className="text-blue-600 hover:text-blue-700 font-bold" title="View live page">
                              <ExternalLink className="w-4 h-4 inline" />
                            </Link>
                            {isApprovedSeller() && (
                              <button
                                onClick={() => deleteProduct(p.id)}
                                className="text-rose-500 hover:text-rose-700 cursor-pointer"
                                title="Delete listing"
                              >
                                <Trash2 className="w-4 h-4 inline" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    {myProducts.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center py-8 text-slate-400">
                          No products found in your catalog.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 3: ORDERS & FULFILLMENT                                */}
          {/* ========================================================== */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by suborder ID or courier..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  Total Orders: {mySuborders.length}
                </span>
              </div>

              {mySuborders.length === 0 ? (
                <p className="text-xs text-slate-400 py-12 text-center">No orders currently awaiting processing.</p>
              ) : (
                <div className="divide-y divide-slate-100 p-4">
                  {mySuborders
                    .filter((s) => !orderSearch || s.suborderId?.toLowerCase().includes(orderSearch.toLowerCase()) || s.courier?.toLowerCase().includes(orderSearch.toLowerCase()))
                    .map((sub, idx) => (
                      <div key={idx} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900">{sub.suborderId}</span>
                            <span className="text-slate-400">(Parent: {sub.parentOrderId})</span>
                            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                              sub.status === 'DELIVERED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : sub.status === 'SHIPPED'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {sub.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-slate-500">
                            <span>Carrier: <strong>{sub.courier}</strong></span>
                            <span>AWB: <strong className="font-mono">{sub.trackingNumber}</strong></span>
                            <span>Items: {sub.items.length}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {sub.status === 'CONFIRMED' && (
                            <button
                              onClick={() => updateSuborderStatus(sub.parentOrderId, sub.suborderId, 'SHIPPED', 'BlueDart Express', `BLUEDART-IND-${Date.now().toString().slice(-6)}`)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Mark Shipped & Assign AWB</span>
                            </button>
                          )}
                          {sub.status === 'SHIPPED' && (
                            <button
                              onClick={() => updateSuborderStatus(sub.parentOrderId, sub.suborderId, 'DELIVERED')}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Mark Delivered</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 4: EARNINGS & PLATFORM COMMISSION (MODEL 2)             */}
          {/* ========================================================== */}
          {activeTab === 'earnings' && (
            <div className="space-y-6">
              {/* Model 2 Explanation Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      Direct Seller Payment Model Active
                    </span>
                    <span className="text-xs text-blue-200">Zero Gateway Fees</span>
                  </div>
                  <h3 className="font-bold text-base font-['Outfit']">Direct UPI Collection &amp; Platform Commission Ledger</h3>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    Buyers scan your store&apos;s Google Pay / PhonePe QR code and pay <strong>100% directly into your bank account</strong>. 
                    The 10% platform fee is invoiced to Admin and settled via the Admin UPI QR below.
                  </p>
                </div>
                {commissionData.pendingCommissionPaise > 0 && (
                  <button
                    onClick={() => setShowPayCommissionModal(true)}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Pay ₹{formatPrice(commissionData.pendingCommissionPaise)} Commission</span>
                  </button>
                )}
              </div>

              {/* 4 KPI Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
                  <span className="text-slate-500 text-xs font-semibold">Total Direct Sales</span>
                  <p className="text-2xl font-black text-slate-900 font-['Outfit']">
                    {formatPrice(commissionData.totalGrossSalesPaise || grossSalesPaise)}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> 100% in your bank / GPay
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
                  <span className="text-slate-500 text-xs font-semibold">Platform Commission (10%)</span>
                  <p className="text-2xl font-black text-slate-700 font-['Outfit']">
                    {formatPrice(commissionData.totalCommissionPaise || Math.round(grossSalesPaise * 0.10))}
                  </p>
                  <p className="text-[11px] text-slate-400">Total platform fee accrued</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs space-y-1.5 bg-amber-50/30">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-800 text-xs font-bold">Commission Due to Admin</span>
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  </div>
                  <p className="text-2xl font-black text-amber-900 font-['Outfit']">
                    {formatPrice(commissionData.pendingCommissionPaise)}
                  </p>
                  <p className="text-[11px] text-amber-700 font-medium">
                    {commissionData.pendingCommissionPaise > 0 ? 'Pending payment to Admin QR' : 'All invoices settled'}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs space-y-1.5 bg-emerald-50/20">
                  <span className="text-emerald-800 text-xs font-bold">Verified &amp; Settled</span>
                  <p className="text-2xl font-black text-emerald-700 font-['Outfit']">
                    {formatPrice(commissionData.verifiedCommissionPaise)}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-medium">Approved by platform admin</p>
                </div>
              </div>

              {/* Commission Invoices Ledger Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-indigo-600" />
                      <span>Order Commission Invoices</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Itemized breakdown of all direct customer orders and platform commission
                    </p>
                  </div>
                  <button
                    onClick={fetchSellerCommissions}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh Invoices</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-3.5">Order Tracking #</th>
                        <th className="px-5 py-3.5">Order Date</th>
                        <th className="px-5 py-3.5">Customer Payment (100%)</th>
                        <th className="px-5 py-3.5">Admin Fee (10%)</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5">Submitted UTR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      {commissionData.invoices && commissionData.invoices.length > 0 ? (
                        commissionData.invoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-5 py-4 font-mono font-bold text-slate-900">
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
                            <td className="px-5 py-4">
                              {inv.status === 'VERIFIED' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Paid
                                </span>
                              ) : inv.status === 'SUBMITTED' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                  <Clock className="w-3 h-3 text-blue-600 animate-spin" /> Verifying Bank
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                  <AlertCircle className="w-3 h-3 text-amber-600" /> Pending Payment
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-4 font-mono text-[11px] text-slate-500">
                              {inv.utrNumber || <span className="text-slate-300 italic">Not submitted</span>}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-5 py-8 text-center text-slate-400 italic">
                            No commission invoices generated yet. Invoices appear automatically when orders are confirmed.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Settlement Account Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Your Store Payment &amp; Collection Channel</span>
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 self-start sm:self-auto">
                    {currentSellerProfile?.gpayQr ? 'Google Pay QR Active' : 'Direct UPI Ready'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Store Merchant Name</span>
                    <p className="font-bold text-slate-800 mt-0.5">{currentStoreName}</p>
                    <p className="text-slate-500 text-[11px]">Direct recipient of all buyer sales</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Linked UPI / Phone</span>
                    <p className="font-mono font-bold text-slate-800 mt-0.5">
                      {currentSellerProfile?.phone || user?.phone || '8072628827'}
                    </p>
                    <p className="text-slate-500 text-[11px]">{currentSellerProfile?.email || user?.email || 'Active'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Commission Rate</span>
                    <p className="font-bold text-indigo-700 mt-0.5">10.0% Standard Marketplace Fee</p>
                    <p className="text-slate-500 text-[11px]">Payable to Admin via UPI QR</p>
                  </div>
                </div>
              </div>

              {/* Pay Commission to Admin QR Modal */}
              {showPayCommissionModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                  <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[92vh] overflow-y-auto">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                          <QrCode className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-slate-900">Pay Platform Commission</h3>
                          <p className="text-[11px] text-slate-500">Scan Admin UPI QR to settle fee</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPayCommissionModal(false)}
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Amount Banner */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 shadow-sm space-y-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-950/80">Commission Payable to Admin</span>
                          <div className="text-2xl font-black font-['Outfit']">
                            {formatPrice(commissionData.pendingCommissionPaise || 24990)}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-950/80 block">Beneficiary</span>
                          <span className="font-bold text-xs">{commissionData.adminPaymentConfig?.adminName || 'A2Z Cart Admin'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Smart Admin QR Container */}
                    {(() => {
                      const adminUpi = commissionData.adminPaymentConfig?.adminUpiId || '8072628827@upi';
                      const adminName = commissionData.adminPaymentConfig?.adminName || 'A2Z Cart Admin';
                      const pendingRupees = ((commissionData.pendingCommissionPaise || 24990) / 100).toFixed(2);
                      const adminUpiUri = `upi://pay?pa=${encodeURIComponent(adminUpi)}&pn=${encodeURIComponent(adminName)}&am=${pendingRupees}&cu=INR&tn=${encodeURIComponent(`A2ZCart Commission - ${currentStoreName}`)}`;
                      const adminQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${encodeURIComponent(adminUpiUri)}`;

                      return (
                        <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-amber-200 text-center space-y-3">
                          <div className="relative inline-block p-3 bg-white rounded-2xl shadow-sm border border-slate-200">
                            <img
                              src={adminQrUrl}
                              alt="Admin UPI QR Code"
                              className="w-48 h-48 object-contain rounded-xl bg-white mx-auto"
                            />
                          </div>

                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100/70 text-amber-900 border border-amber-200 rounded-full text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                            <span>Amount ₹{pendingRupees} Pre-Filled on Scan</span>
                          </div>

                          {/* Direct Mobile Intent Link */}
                          <div>
                            <a
                              href={adminUpiUri}
                              className="w-full py-2 px-3 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-xl inline-flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <Smartphone className="w-3.5 h-3.5" />
                              <span>Open in UPI App on this Phone</span>
                            </a>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Admin UPI ID Card */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Admin Receiving UPI VPA</span>
                      <div className="flex items-center justify-between font-mono font-bold text-slate-800 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                        <span className="truncate">{commissionData.adminPaymentConfig?.adminUpiId || '8072628827@upi'}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(commissionData.adminPaymentConfig?.adminUpiId || '8072628827@upi');
                            setCopiedAdminUpi(true);
                            setTimeout(() => setCopiedAdminUpi(false), 2000);
                          }}
                          className="text-blue-600 hover:text-blue-800 p-1 cursor-pointer"
                          title="Copy Admin UPI ID"
                        >
                          {copiedAdminUpi ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Form to submit UTR reference */}
                    <form onSubmit={handlePayCommissionSubmit} className="space-y-3 text-xs pt-1">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Enter 12-Digit UPI Transaction Reference / UTR Number *
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            required
                            placeholder="e.g. 428190382910"
                            value={commissionUtrInput}
                            onChange={(e) => setCommissionUtrInput(e.target.value.replace(/\D/g, '').slice(0, 12))}
                            className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-amber-500 font-mono text-xs font-bold text-slate-800"
                          />
                          <button
                            type="button"
                            onClick={() => setCommissionUtrInput(Math.floor(100000000000 + Math.random() * 900000000000).toString())}
                            className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-xl whitespace-nowrap cursor-pointer transition-colors"
                          >
                            Fill Demo UTR
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Found in your Google Pay / PhonePe transaction details after paying the Admin QR.
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowPayCommissionModal(false)}
                          className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingCommission}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isSubmittingCommission ? 'Submitting...' : 'Submit Payment Proof'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 5: STORE SETTINGS & PROFILE                             */}
          {/* ========================================================== */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Save Success Notice */}
              {saveSuccessNotice && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs shadow-xs animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="font-semibold">Store details and payment profile updated successfully!</span>
                </div>
              )}

              {/* Vendor Profile & Commercial Identity */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg border-2 border-white/20 shrink-0">
                      <Store className="w-7 h-7 sm:w-8 sm:h-8" />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-black font-['Outfit'] tracking-tight">
                          {currentStoreName}
                        </h2>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified Store</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Merchant ID: <strong className="font-mono text-white">{currentSellerProfile?.id ? `SLR-${currentSellerProfile.id}` : (user?.id ? `SLR-${user.id}` : 'SLR-01')}</strong>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowSetupModal(true)}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer self-start sm:self-center shadow-xs"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Store Details</span>
                  </button>
                </div>

                {/* Details Grid */}
                <div className="p-6 sm:p-7 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                      <Store className="w-3.5 h-3.5 text-blue-600" />
                      <span>Seller / Store Name</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                      {currentSellerProfile?.sellerName || currentStoreName}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      <span>Contact Email</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800">
                      {currentSellerProfile?.email || user?.email || 'Not configured'}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Phone Number</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 font-mono">
                      {currentSellerProfile?.phone || user?.phone || 'Not configured'}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>Seller Registered Address</span>
                    </div>
                    <p className="text-sm text-slate-800 whitespace-pre-line">
                      {currentSellerProfile?.sellerAddress || currentSellerProfile?.registeredAddress || (
                        <span className="text-slate-400 italic">No physical store address provided yet.</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Google Pay (G-Pay) QR Payment Photo Section */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-indigo-600" />
                      <span>Seller Google Pay (G-Pay) QR Photo</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Uploaded QR code photo used by customers for instant UPI / Google Pay orders and vendor settlement.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowSetupModal(true)}
                    className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-center"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{currentSellerProfile?.gpayQr ? 'Change G-Pay QR Photo' : 'Upload G-Pay QR Photo'}</span>
                  </button>
                </div>

                {currentSellerProfile?.gpayQr ? (
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 rounded-2xl bg-gradient-to-br from-indigo-50/50 via-blue-50/30 to-purple-50/40 border border-indigo-100">
                    {/* QR Frame Container */}
                    <div className="relative p-3 bg-white rounded-2xl shadow-md border-2 border-indigo-200 shrink-0 text-center">
                      <img
                        src={currentSellerProfile.gpayQr}
                        alt="Seller Google Pay QR"
                        className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-xl"
                      />
                      <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-700">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Google Pay Accepted</span>
                      </div>
                    </div>

                    {/* QR Info and Settlement Details */}
                    <div className="space-y-3 text-xs text-slate-600">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100/80 text-indigo-800 font-bold text-[11px]">
                        <Check className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Active Payment QR Connected</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">
                        This Google Pay QR photo is configured for your store. When buyers check out or choose UPI payment, they can scan this QR code directly with Google Pay, PhonePe, Paytm, or any UPI banking app.
                      </p>
                      <div className="p-3 bg-white rounded-xl border border-indigo-100 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Settlement Beneficiary:</span>
                          <span className="font-bold text-slate-900">{currentStoreName}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Linked Phone / VPA:</span>
                          <span className="font-mono font-bold text-slate-900">{currentSellerProfile?.phone || user?.phone || 'Linked via G-Pay'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">No Google Pay QR Photo Uploaded</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                        Upload your Google Pay QR photo so customers can scan and pay your store directly without hassle.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowSetupModal(true)}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs inline-flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Google Pay QR Photo</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ============================================================== */}
      {/* ADD PRODUCT MODAL                                              */}
      {/* ============================================================== */}
      {/* PUBLISH / EDIT PRODUCT MODAL                                   */}
      {/* ============================================================== */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {editingProductId ? 'Edit Product Details' : 'Publish New Marketplace Product'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {editingProductId ? 'Update specifications, description, and product details' : 'Fill details manually or upload in JSON format'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddProductModal(false);
                  setEditingProductId(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Fill from JSON Banner */}
            {!editingProductId && (
              <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-blue-900">
                  <FileCode className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <p className="font-bold text-[11px] text-blue-950">Autofill via JSON</p>
                    <p className="text-[10px] text-blue-700">Upload a product .json file to populate all details automatically</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <input
                    ref={jsonFileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={(e) => handleJsonUpload(e, 'modal')}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => jsonFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload JSON</span>
                  </button>
                  <button
                    type="button"
                    onClick={downloadSampleJson}
                    className="inline-flex items-center gap-1 px-2 py-1.5 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-medium cursor-pointer transition-colors"
                    title="Download sample JSON template"
                  >
                    <Download className="w-3 h-3" />
                    <span>Sample</span>
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="Apex SoundWave Studio Wireless"
                  value={newProductForm.name}
                  onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newProductForm.category}
                    onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 font-medium cursor-pointer"
                  >
                    {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Stock Count</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newProductForm.stock}
                    onChange={(e) => setNewProductForm({ ...newProductForm, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newProductForm.priceRupees}
                    onChange={(e) => setNewProductForm({ ...newProductForm, priceRupees: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Original MRP (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newProductForm.originalPriceRupees}
                    onChange={(e) => setNewProductForm({ ...newProductForm, originalPriceRupees: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              {/* Product Photo Upload Section */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-semibold text-slate-700">Product Image (Photo Upload)</label>
                  <button
                    type="button"
                    onClick={() => setImageInputMode(imageInputMode === 'upload' ? 'url' : 'upload')}
                    className="text-[10px] text-blue-600 hover:underline font-medium cursor-pointer"
                  >
                    {imageInputMode === 'upload' ? 'Or enter Image URL' : 'Upload photo file'}
                  </button>
                </div>

                {imageInputMode === 'upload' ? (
                  <div>
                    <input
                      ref={productImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProductImageUpload}
                      className="hidden"
                    />

                    {newProductForm.image ? (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <img
                          src={newProductForm.image}
                          alt="Product preview"
                          className="w-16 h-16 object-cover rounded-lg border border-slate-200 shadow-2xs bg-white shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-slate-800 truncate">Product Photo Selected</p>
                          <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                            <Check className="w-3 h-3" /> Ready to publish
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <button
                              type="button"
                              onClick={() => productImageInputRef.current?.click()}
                              className="text-[10px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                            >
                              Change Photo
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              type="button"
                              onClick={() => setNewProductForm((prev) => ({ ...prev, image: '' }))}
                              className="text-[10px] font-bold text-rose-600 hover:text-rose-800 cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => productImageInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/40 rounded-xl p-4 text-center cursor-pointer transition-all group"
                      >
                        <div className="w-10 h-10 mx-auto rounded-full bg-blue-100/60 group-hover:bg-blue-100 flex items-center justify-center text-blue-600 mb-1.5 transition-colors">
                          <Camera className="w-5 h-5" />
                        </div>
                        <p className="font-bold text-xs text-slate-800 group-hover:text-blue-700">
                          Click to upload product photo
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Supports PNG, JPG, JPEG, WEBP (Max 5MB)
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <input
                      type="url"
                      required
                      placeholder="https://images.unsplash.com/photo-..."
                      value={newProductForm.image}
                      onChange={(e) => setNewProductForm({ ...newProductForm, image: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 font-medium font-mono text-[11px]"
                    />
                    {newProductForm.image && (
                      <div className="flex items-center gap-2 pt-1">
                        <img src={newProductForm.image} alt="Preview" className="w-8 h-8 rounded object-cover border border-slate-200" />
                        <span className="text-[10px] text-slate-500">Live URL preview</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Product Details & Specifications */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Product Details & Specifications</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Product Tagline / Short Summary
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pure Chanderi Silk with Intricate Zari Embroidery & Organza Dupatta"
                    value={newProductForm.tagline}
                    onChange={(e) => setNewProductForm({ ...newProductForm, tagline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 font-medium text-xs"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Catchy one-line highlight displayed below the title on product page</p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Full Product Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe product highlights, materials, package contents, and customer benefits..."
                    value={newProductForm.description}
                    onChange={(e) => setNewProductForm({ ...newProductForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 font-medium text-xs resize-y"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Brand / Manufacturer</label>
                    <input
                      type="text"
                      placeholder="e.g. Apex Audio / Store Brand"
                      value={newProductForm.brand}
                      onChange={(e) => setNewProductForm({ ...newProductForm, brand: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 font-medium text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Warranty Info</label>
                    <input
                      type="text"
                      placeholder="e.g. 1 Year Replacement Warranty"
                      value={newProductForm.warranty}
                      onChange={(e) => setNewProductForm({ ...newProductForm, warranty: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 font-medium text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Material / Fabric / Build</label>
                    <input
                      type="text"
                      placeholder="e.g. Aerospace Aluminum, 100% Cotton"
                      value={newProductForm.material}
                      onChange={(e) => setNewProductForm({ ...newProductForm, material: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 font-medium text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Key Highlights</label>
                    <input
                      type="text"
                      placeholder="e.g. 40h Battery, Fast Charging, Water Resistant"
                      value={newProductForm.features}
                      onChange={(e) => setNewProductForm({ ...newProductForm, features: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 font-medium text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddProductModal(false);
                    setEditingProductId(null);
                  }}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
                >
                  {editingProductId ? 'Update Product Details' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SELLER FIRST-TIME PROFILE SETUP / EDIT MODAL                   */}
      {/* ============================================================== */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shrink-0">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">
                    {currentSellerProfile?.sellerName ? 'Edit Store Profile & Payment QR' : 'Setup Your Seller Store'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Provide your seller details and upload your Google Pay QR photo.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSetupModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
              {/* Google Pay QR Photo Upload */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <QrCode className="w-4 h-4 text-indigo-600" />
                    <span>Google Pay QR Photo</span>
                  </label>
                  {profileForm.gpayQr && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      ✓ QR Added
                    </span>
                  )}
                </div>

                {profileForm.gpayQr ? (
                  <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-indigo-100">
                    <img
                      src={profileForm.gpayQr}
                      alt="G-Pay QR preview"
                      className="w-20 h-20 rounded-xl object-contain border-2 border-indigo-500 shadow-xs shrink-0 bg-white p-1"
                    />
                    <div className="space-y-1.5">
                      <p className="font-bold text-slate-800 text-xs">Google Pay QR Attached</p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => qrInputRef.current?.click()}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded-lg text-[11px] cursor-pointer transition-colors"
                        >
                          Change QR Photo
                        </button>
                        <button
                          type="button"
                          onClick={() => setProfileForm({ ...profileForm, gpayQr: '' })}
                          className="text-[11px] text-rose-500 hover:underline font-semibold cursor-pointer"
                        >
                          Remove QR
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => qrInputRef.current?.click()}
                    className="p-5 rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-white hover:bg-indigo-50/30 text-center cursor-pointer transition-all space-y-1.5"
                  >
                    <QrCode className="w-7 h-7 text-indigo-500 mx-auto" />
                    <p className="font-bold text-slate-700 text-xs">Click to Upload G-Pay QR Photo</p>
                    <p className="text-[10px] text-slate-400">Photo / screenshot of your Google Pay QR code</p>
                  </div>
                )}

                <input
                  ref={qrInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePhotoUpload(e, 'gpayQr')}
                />
              </div>

              {/* Seller Name */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Seller / Store Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Electronics & Gadgets"
                  value={profileForm.sellerName}
                  onChange={(e) => setProfileForm({ ...profileForm, sellerName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-xs text-slate-900"
                />
              </div>

              {/* Seller Address */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Seller Address <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="2"
                  required
                  placeholder="e.g. Shop No. 15, City Center Plaza, Cross Road, Bengaluru, Karnataka - 560001"
                  value={profileForm.sellerAddress}
                  onChange={(e) => setProfileForm({ ...profileForm, sellerAddress: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-xs text-slate-900"
                />
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-xs text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="seller@example.com"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-xs text-slate-900"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSetupModal(false)}
                  className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-2"
                >
                  {isSavingProfile ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Store Details</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
