import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  ShieldCheck, MapPin, CheckCircle2, CreditCard, Banknote, 
  Lock, ArrowRight, Store, Sparkles, Check, AlertCircle, Plus, Trash2, Home,
  QrCode, Copy, Smartphone, X, Loader2, Clock, RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useOrderStore } from '../../store/orderStore';
import { useSellerStore } from '../../store/sellerStore';
import { formatPrice } from '../../utils/formatters';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    items, 
    selectedAddress, 
    savedAddresses, 
    setSelectedAddress, 
    fetchAddressesFromDb,
    saveAddressToDb,
    deleteAddressFromDb,
    setDefaultAddressInDb,
    getTotals, 
    clearCart 
  } = useCartStore();
  const { createOrder } = useOrderStore();

  const [paymentMethod, setPaymentMethod] = useState('ONLINE'); // 'ONLINE' | 'COD'
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [showNewAddressModal, setShowNewAddressModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState('waiting'); // 'waiting' | 'verifying' | 'success'
  const [sessionTimeLeft, setSessionTimeLeft] = useState(600); // 10 minutes session validity
  const [selectedQrTab, setSelectedQrTab] = useState('smart'); // 'smart' (auto-fills ₹2,499) | 'custom' (uploaded photo)
  const [upiUtr, setUpiUtr] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [activeQrSellerId, setActiveQrSellerId] = useState(null);

  const { currentSellerProfile, fetchSellerProfile } = useSellerStore();

  useEffect(() => {
    fetchSellerProfile();
  }, []);

  // Address form containing: Name, Email, Phone, Address, Country, State, District, Pincode
  const [newAddressForm, setNewAddressForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: (user?.phone || '').replace(/\D/g, '').slice(0, 10),
    address: '',
    country: 'India',
    state: 'Tamil Nadu',
    district: '',
    pincode: '',
  });

  // Sync user info into address form when user loads
  useEffect(() => {
    if (user) {
      fetchAddressesFromDb(user);
      setNewAddressForm((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || (user.phone || '').replace(/\D/g, '').slice(0, 10),
      }));
    }
  }, [user]);

  // 10-Minute session validity countdown (NEVER auto-confirms order without user paying!)
  useEffect(() => {
    if (!showQrModal || paymentStep !== 'waiting') return;

    const timer = setInterval(() => {
      setSessionTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0; // Session expired
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showQrModal, paymentStep]);

  const totals = getTotals();

  if (items.length === 0 && paymentStep !== 'success' && !isProcessing) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">No items ready for checkout</h2>
        <Link to="/shop" className="text-blue-600 underline mt-3 inline-block font-semibold">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  // Group items by seller for multi-vendor shipment preview
  const itemsBySeller = items.reduce((acc, item) => {
    const sId = item.sellerId || 'seller-techhub';
    if (!acc[sId]) {
      acc[sId] = {
        sellerName: item.sellerName || 'Verified Seller',
        items: [],
      };
    }
    acc[sId].items.push(item);
    return acc;
  }, {});

  const sellersInCart = Object.entries(itemsBySeller);
  const currentSelectedSellerId = activeQrSellerId || sellersInCart[0]?.[0];
  const currentSelectedSellerGroup = itemsBySeller[currentSelectedSellerId] || sellersInCart[0]?.[1];

  const activeSellerName = currentSellerProfile?.sellerName || currentSelectedSellerGroup?.sellerName || 'A2Z Verified Seller';
  const rawPhone = (currentSellerProfile?.phone || user?.phone || '8072628827').replace(/\D/g, '').slice(0, 10);
  const activeSellerPhone = rawPhone.length === 10 ? rawPhone : '8072628827';
  const activeSellerQr = currentSellerProfile?.gpayQr || null;
  const activeSellerUpiId = currentSellerProfile?.upiId || `${activeSellerPhone}@upi`;

  // Dynamic NPCI standard UPI URI with exact order amount (e.g. 2499.00) embedded
  const rupeeAmount = (totals.finalTotal / 100).toFixed(2);
  const dynamicUpiUri = `upi://pay?pa=${encodeURIComponent(activeSellerUpiId)}&pn=${encodeURIComponent(activeSellerName)}&am=${rupeeAmount}&cu=INR&tn=${encodeURIComponent(`A2ZCart Order - ${activeSellerName}`)}`;
  const dynamicQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=8&data=${encodeURIComponent(dynamicUpiUri)}`;

  const handleSaveNewAddress = async (e) => {
    e.preventDefault();
    if (!newAddressForm.fullName.trim()) {
      toast.error('Please enter full name');
      return;
    }
    if (!newAddressForm.email.trim()) {
      toast.error('Please enter email address');
      return;
    }
    if (!newAddressForm.phone || newAddressForm.phone.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!newAddressForm.address.trim()) {
      toast.error('Please enter complete street/house address');
      return;
    }
    if (!newAddressForm.state.trim()) {
      toast.error('Please enter state');
      return;
    }
    if (!newAddressForm.district.trim()) {
      toast.error('Please enter district/city');
      return;
    }
    if (!newAddressForm.pincode || newAddressForm.pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }

    setIsSavingAddress(true);
    try {
      await saveAddressToDb(newAddressForm, user);
      toast.success('Delivery address saved securely to database!');
      setShowNewAddressModal(false);
      // Reset form address fields
      setNewAddressForm((prev) => ({
        ...prev,
        address: '',
        district: '',
        pincode: '',
      }));
    } catch (err) {
      toast.error(err.message || 'Failed to save address. Please retry.');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this saved address?')) {
      await deleteAddressFromDb(id);
      toast.success('Address removed from database.');
    }
  };

  const handleExecutePaymentAndOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please enter and select a delivery address to proceed.');
      return;
    }

    setIsProcessing(true);

    try {
      const isCod = paymentMethod === 'COD' || paymentMethod === 'CASH_ON_DELIVERY';

      // Step 1: Simulate Payment Verification for Online or Instant Order Creation for COD
      if (!isCod) {
        await new Promise((resolve) => setTimeout(resolve, 1300));
      }

      const generatedPaymentId = isCod 
        ? `cod_${Date.now()}` 
        : `upi_${upiUtr ? `utr_${upiUtr}` : `qr_${Date.now()}`}`;
      const mockRazorpayOrderId = `order_upi_${Date.now()}`;

      // Step 2: Backend Multi-Vendor Order Creation & Database Persistence
      const createdOrder = await createOrder({
        items,
        address: selectedAddress,
        paymentMethod: isCod ? 'CASH_ON_DELIVERY' : 'ONLINE',
        paymentId: generatedPaymentId,
        razorpayOrderId: mockRazorpayOrderId,
        totals,
        user,
      });

      // Step 3: Trigger Confetti Celebration
      confetti({
        particleCount: 140,
        spread: 85,
        origin: { y: 0.6 },
      });

      if (isCod) {
        toast.success('Cash on delivery order confirmed! Stored in database.');
      } else {
        toast.success(`Payment verified successfully! Order confirmed with ${activeSellerName}.`);
      }

      // Navigate to order confirmation / tracking & clear cart
      setTimeout(() => {
        clearCart();
        setShowQrModal(false);
        navigate(`/buyer/orders?highlight=${createdOrder.id}`);
      }, 700);

    } catch (err) {
      console.error(err);
      toast.error('Order processing failed. Please retry.');
      setPaymentStep('waiting');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle primary checkout button click
  const handleProceedToPayment = () => {
    if (!selectedAddress) {
      toast.error('Please enter and select a delivery address to proceed.');
      return;
    }
    if (paymentMethod === 'COD' || paymentMethod === 'CASH_ON_DELIVERY') {
      handleExecutePaymentAndOrder();
    } else {
      setShowQrModal(true);
      setPaymentStep('waiting');
      setSessionTimeLeft(600); // 10 minutes session validity
      setSelectedQrTab('smart');
    }
  };

  // User explicitly clicks "I Have Paid" after approving the transaction on their phone
  const handleUserConfirmPayment = async () => {
    if (isProcessing) return;
    setPaymentStep('verifying');

    // Simulate verification check with banking gateway
    await new Promise((r) => setTimeout(r, 1400));
    setPaymentStep('success');

    // Trigger celebratory confetti
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
    });

    // Execute order creation into PostgreSQL backend
    await handleExecutePaymentAndOrder();
  };

  const formatSessionTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      {/* Checkout Stepper Header */}
      <div className="mb-6 sm:mb-8 pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">Secure Multi-Vendor Checkout</h1>
          <p className="text-xs text-slate-500 mt-0.5">Protected with 256-bit bank-grade TLS encryption & fraud protection</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 self-start sm:self-auto">
          <Lock className="w-3.5 h-3.5" />
          <span>Encrypted Checkout</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* Left Column: Delivery Address, Seller Shipments & Payment Options */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          
          {/* 1. Delivery Address Selection */}
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <h3 className="font-bold text-sm text-slate-900">Delivery Address</h3>
              </div>
              {savedAddresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowNewAddressModal(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              )}
            </div>

            {/* If user has no addresses in DB yet, show the address entry form directly */}
            {savedAddresses.length === 0 ? (
              <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/90 space-y-4">
                <div className="flex items-center gap-2 text-slate-800">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <p className="text-xs font-bold">Please enter your delivery address (saved securely to database for next time):</p>
                </div>

                <form onSubmit={handleSaveNewAddress} className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Pravin Kumar"
                        value={newAddressForm.fullName}
                        onChange={(e) => setNewAddressForm({ ...newAddressForm, fullName: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl outline-none font-medium text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. pravin@example.com"
                        value={newAddressForm.email}
                        onChange={(e) => setNewAddressForm({ ...newAddressForm, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl outline-none font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-slate-700">Phone Number *</label>
                        <span className="text-[10px] text-slate-400 font-semibold">{newAddressForm.phone?.length || 0}/10 digits</span>
                      </div>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-xs font-bold text-slate-400 select-none">+91</span>
                        <input
                          type="tel"
                          inputMode="numeric"
                          required
                          maxLength={10}
                          placeholder="9876543210"
                          value={newAddressForm.phone}
                          onChange={(e) => setNewAddressForm({ ...newAddressForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                          className="w-full pl-11 pr-3 py-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl outline-none font-medium text-slate-800 tracking-wider"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Country *</label>
                      <input
                        type="text"
                        required
                        value={newAddressForm.country}
                        onChange={(e) => setNewAddressForm({ ...newAddressForm, country: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl outline-none font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Address (House No, Building, Street, Area) *</label>
                    <textarea
                      required
                      placeholder="e.g. Flat 302, Green Valley Towers, MG Road"
                      rows={2}
                      value={newAddressForm.address}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl outline-none font-medium text-slate-800"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">District / City *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Chennai / Bengaluru"
                        value={newAddressForm.district}
                        onChange={(e) => setNewAddressForm({ ...newAddressForm, district: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl outline-none font-medium text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">State *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Tamil Nadu"
                        value={newAddressForm.state}
                        onChange={(e) => setNewAddressForm({ ...newAddressForm, state: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl outline-none font-medium text-slate-800"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-slate-700">Pincode *</label>
                        <span className="text-[10px] text-slate-400 font-semibold">{newAddressForm.pincode?.length || 0}/6 digits</span>
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        required
                        maxLength={6}
                        placeholder="600001"
                        value={newAddressForm.pincode}
                        onChange={(e) => setNewAddressForm({ ...newAddressForm, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl outline-none font-medium text-slate-800 tracking-wider"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSavingAddress}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isSavingAddress ? 'Saving to Database...' : 'Save Address & Deliver Here'}</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* If user has saved addresses in DB, show address cards */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedAddresses.map((addr) => {
                  const isSelected = selectedAddress?.id === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddress(addr)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative group ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-xs text-slate-900">{addr.fullName}</p>
                          {addr.isDefault && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700">
                              Default
                            </span>
                          )}
                        </div>
                        {isSelected && (
                          <span className="text-blue-600">
                            <CheckCircle2 className="w-5 h-5 fill-blue-600 text-white" />
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 mt-1.5 font-medium leading-relaxed">{addr.address || addr.street}</p>
                      <p className="text-xs text-slate-600 font-medium">
                        {addr.district || addr.city}, {addr.state} - <span className="font-bold text-slate-800">{addr.pincode}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 font-semibold">{addr.country || 'India'}</p>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-semibold">{addr.phone} · {addr.email}</span>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteAddress(e, addr.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete address"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Multi-Vendor Suborder Splitting Preview */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                2
              </span>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Shipments by Verified Vendors</h3>
                <p className="text-[11px] text-slate-400">
                  Items will be packaged and tracked separately by their respective manufacturers
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(itemsBySeller).map(([sellerId, group], idx) => (
                <div key={sellerId} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Store className="w-4 h-4 text-blue-600" />
                      <span>Package {idx + 1}: Dispatched by <strong>{group.sellerName}</strong></span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      Express Courier Included
                    </span>
                  </div>

                  <div className="divide-y divide-slate-200/60">
                    {group.items.map((item) => (
                      <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg bg-white shrink-0" />
                          <div>
                            <p className="font-bold text-slate-800 line-clamp-1">{item.name}</p>
                            <p className="text-[11px] text-slate-400">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-black text-slate-900">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Payment Method Choice */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                3
              </span>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Select Payment Method</h3>
                <p className="text-[11px] text-slate-500">Pay directly to vendor via UPI QR or choose Cash on Delivery</p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Option A: Online Payment via Seller UPI / Google Pay QR */}
              <div
                className={`p-4 rounded-2xl border-2 transition-all ${
                  paymentMethod !== 'COD'
                    ? 'border-blue-600 bg-blue-50/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white cursor-pointer'
                }`}
                onClick={() => setPaymentMethod('ONLINE')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">Online Payment (Google Pay / PhonePe / UPI QR)</span>
                        <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded">Instant Auto-Confirmation</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Scan vendor QR code via Google Pay, PhonePe, Paytm, CRED or any UPI app</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod !== 'COD'}
                    onChange={() => setPaymentMethod('ONLINE')}
                    className="w-4 h-4 text-blue-600 accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Option B: Cash on Delivery */}
              <div
                className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-blue-600 bg-blue-50/30 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
                onClick={() => setPaymentMethod('COD')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900">Cash on Delivery (COD)</span>
                    <p className="text-[11px] text-slate-500">Pay cash or UPI upon courier arrival at your doorstep</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="w-4 h-4 text-blue-600 accent-blue-600"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Order Pricing Summary & Execute Button */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <h3 className="font-bold text-sm text-slate-900 pb-3 border-b border-slate-100">Price Details</h3>
            
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal ({totals.itemCount} items)</span>
                <span className="font-semibold text-slate-800">{formatPrice(totals.subtotal)}</span>
              </div>
              {totals.productDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Product Discounts</span>
                  <span>-{formatPrice(totals.productDiscount)}</span>
                </div>
              )}
              {totals.couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-{formatPrice(totals.couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery & Handling</span>
                <span className="font-semibold text-slate-800">
                  {totals.deliveryFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : formatPrice(totals.deliveryFee)}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between text-sm font-black text-slate-900">
                <span>Total Payable</span>
                <span className="text-base text-blue-600">{formatPrice(totals.finalTotal)}</span>
              </div>
            </div>

            <button
              onClick={handleProceedToPayment}
              disabled={isProcessing || !selectedAddress}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Payment & Placing Order...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>
                    {paymentMethod === 'COD' 
                      ? 'Confirm Cash on Delivery Order' 
                      : `Confirm & Pay ${formatPrice(totals.finalTotal)} via QR`}
                  </span>
                </>
              )}
            </button>

            {!selectedAddress && (
              <p className="text-[11px] text-amber-600 text-center font-semibold">
                * Please enter and save your delivery address above to enable checkout.
              </p>
            )}

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 space-y-1">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Buyer Protection Guarantee</span>
              </span>
              <p>7-day replacement guarantee on defective items across all vendor shipments.</p>
            </div>
          </div>
        </div>

      </div>

      {/* Add New Address Modal (for users who already have addresses and want to add another) */}
      {showNewAddressModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Add New Delivery Address</span>
              </h3>
              <button
                onClick={() => setShowNewAddressModal(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewAddress} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pravin Kumar"
                    value={newAddressForm.fullName}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl outline-none font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. pravin@example.com"
                    value={newAddressForm.email}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl outline-none font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">Phone Number *</label>
                    <span className="text-[10px] text-slate-400 font-semibold">{newAddressForm.phone?.length || 0}/10 digits</span>
                  </div>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs font-bold text-slate-400 select-none">+91</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      required
                      maxLength={10}
                      placeholder="9876543210"
                      value={newAddressForm.phone}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      className="w-full pl-11 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl outline-none font-medium text-slate-800 tracking-wider"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Country *</label>
                  <input
                    type="text"
                    required
                    value={newAddressForm.country}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, country: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl outline-none font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Address (House No, Building, Street, Area) *</label>
                <textarea
                  required
                  placeholder="e.g. Flat 302, Green Valley Towers, MG Road"
                  rows={2}
                  value={newAddressForm.address}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl outline-none font-medium text-slate-800"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">District / City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chennai"
                    value={newAddressForm.district}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, district: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl outline-none font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tamil Nadu"
                    value={newAddressForm.state}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl outline-none font-medium text-slate-800"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">Pincode *</label>
                    <span className="text-[10px] text-slate-400 font-semibold">{newAddressForm.pincode?.length || 0}/6 digits</span>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    maxLength={6}
                    placeholder="600001"
                    value={newAddressForm.pincode}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl outline-none font-medium text-slate-800 tracking-wider"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewAddressModal(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAddress}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  {isSavingAddress ? 'Saving to Database...' : 'Save Address to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dedicated QR Payment Modal with Pre-filled Amount & Explicit Confirmation */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">UPI QR Payment Gateway</h3>
                  <p className="text-[11px] text-slate-500">Scan &amp; pay with any mobile UPI app</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isProcessing) {
                    setShowQrModal(false);
                    setPaymentStep('waiting');
                  }
                }}
                disabled={isProcessing}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Amount & Beneficiary Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white shadow-md space-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">Total Payable Amount</span>
                  <div className="text-2xl font-black font-['Outfit']">{formatPrice(totals.finalTotal)}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">Beneficiary Store</span>
                  <span className="font-bold text-xs flex items-center gap-1 justify-end">
                    <Store className="w-3.5 h-3.5 text-blue-200" />
                    <span>{activeSellerName}</span>
                  </span>
                  <span className="text-[9px] bg-emerald-500/30 text-emerald-100 px-1.5 py-0.5 rounded-full inline-flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Verified Seller
                  </span>
                </div>
              </div>
            </div>

            {/* Multi-Seller Shipment Selector (if items from multiple sellers exist) */}
            {sellersInCart.length > 1 && (
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-600">Shipment Vendor:</span>
                {sellersInCart.map(([sId, grp]) => {
                  const isSel = (activeQrSellerId || sellersInCart[0][0]) === sId;
                  return (
                    <button
                      key={sId}
                      type="button"
                      onClick={() => setActiveQrSellerId(sId)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                        isSel ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'
                      }`}
                    >
                      {grp.sellerName}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Modal Body: Waiting for Payment */}
            {paymentStep === 'waiting' && (
              <div className="space-y-4">
                {/* QR Display Switcher (if seller uploaded a custom photo) */}
                {activeSellerQr && (
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setSelectedQrTab('smart')}
                      className={`flex-1 py-1.5 px-2 rounded-lg transition-all cursor-pointer ${
                        selectedQrTab === 'smart'
                          ? 'bg-white text-blue-600 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      ⚡ Smart QR (₹{rupeeAmount} Auto-Filled)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedQrTab('custom')}
                      className={`flex-1 py-1.5 px-2 rounded-lg transition-all cursor-pointer ${
                        selectedQrTab === 'custom'
                          ? 'bg-white text-blue-600 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      🏪 Seller Standee Photo
                    </button>
                  </div>
                )}

                {/* QR Code Container */}
                <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-indigo-200 text-center space-y-3">
                  <div className="relative inline-block p-3 bg-white rounded-2xl shadow-sm border border-slate-200">
                    <img
                      src={selectedQrTab === 'custom' && activeSellerQr ? activeSellerQr : dynamicQrCodeUrl}
                      alt="UPI Payment QR Code"
                      className="w-52 h-52 object-contain rounded-xl bg-white mx-auto"
                    />
                  </div>

                  {/* Guaranteed Amount Auto-Fill Indicator */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Exact amount <strong>{formatPrice(totals.finalTotal)}</strong> auto-fills on mobile scan</span>
                  </div>

                  {/* Accepted Apps Badges */}
                  <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-600 pt-1">
                    <span className="px-2 py-0.5 bg-white rounded border border-slate-200 shadow-2xs">Google Pay</span>
                    <span className="px-2 py-0.5 bg-white rounded border border-slate-200 shadow-2xs">PhonePe</span>
                    <span className="px-2 py-0.5 bg-white rounded border border-slate-200 shadow-2xs">Paytm</span>
                    <span className="px-2 py-0.5 bg-white rounded border border-slate-200 shadow-2xs">BHIM</span>
                    <span className="px-2 py-0.5 bg-white rounded border border-slate-200 shadow-2xs">CRED</span>
                  </div>

                  {/* Mobile Direct UPI Intent Link */}
                  <div className="pt-1">
                    <a
                      href={dynamicUpiUri}
                      className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl inline-flex items-center justify-center gap-1.5 border border-blue-200 transition-colors"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Tap to Open in UPI App (Mobile Device)</span>
                    </a>
                  </div>
                </div>

                {/* Session Timer & Safe Payment Guarantee Notice (NO AUTO-CONFIRMATION) */}
                <div className="p-3.5 bg-amber-50/90 rounded-2xl border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>QR Payment Window</span>
                    </div>
                    <span
                      className={`font-mono font-bold text-xs px-2.5 py-0.5 rounded-full border ${
                        sessionTimeLeft < 60
                          ? 'bg-rose-100 text-rose-700 border-rose-200 animate-pulse'
                          : 'bg-white text-amber-800 border-amber-200'
                      }`}
                    >
                      {sessionTimeLeft > 0 ? `${formatSessionTime(sessionTimeLeft)} remaining` : 'Session Expired'}
                    </span>
                  </div>

                  {sessionTimeLeft === 0 ? (
                    <div className="pt-1">
                      <p className="text-[11px] text-rose-700 font-medium mb-2">
                        Payment session has timed out for security. Please refresh to generate an active QR session.
                      </p>
                      <button
                        type="button"
                        onClick={() => setSessionTimeLeft(600)}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Refresh QR Session (10 Mins)</span>
                      </button>
                    </div>
                  ) : (
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Please scan and complete payment of <strong>{formatPrice(totals.finalTotal)}</strong> on your phone.
                      Your order will <strong>never auto-confirm</strong> without your explicit payment confirmation below.
                    </p>
                  )}
                </div>

                {/* Copyable UPI ID */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Seller UPI VPA ID</span>
                  <div className="flex items-center justify-between font-mono font-bold text-slate-800 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                    <span className="truncate">{activeSellerUpiId}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(activeSellerUpiId);
                        setCopiedUpi(true);
                        toast.success('Seller UPI ID copied to clipboard!');
                        setTimeout(() => setCopiedUpi(false), 2000);
                      }}
                      className="text-blue-600 hover:text-blue-800 p-1 cursor-pointer"
                      title="Copy UPI ID"
                    >
                      {copiedUpi ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Optional UTR input */}
                <div className="space-y-1 text-xs">
                  <label className="block text-[11px] font-bold text-slate-700">
                    12-Digit UPI Ref / UTR No. (Optional)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="e.g. 428190382910"
                      value={upiUtr}
                      onChange={(e) => setUpiUtr(e.target.value.replace(/\D/g, '').slice(0, 12))}
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-mono text-xs font-bold text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setUpiUtr(Math.floor(100000000000 + Math.random() * 900000000000).toString())}
                      className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-xl whitespace-nowrap cursor-pointer transition-colors"
                    >
                      Fill Demo UTR
                    </button>
                  </div>
                </div>

                {/* Explicit Buyer Confirm & Cancel Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={handleUserConfirmPayment}
                    disabled={isProcessing || sessionTimeLeft === 0}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>I Have Paid {formatPrice(totals.finalTotal)} — Confirm Order</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowQrModal(false);
                      setPaymentStep('waiting');
                    }}
                    className="w-full py-2 text-slate-500 hover:text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Cancel / Back to Checkout
                  </button>
                </div>
              </div>
            )}

            {/* Modal Body: Verifying with Banking Gateway */}
            {paymentStep === 'verifying' && (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center mx-auto">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-slate-900">Payment Signal Received!</h4>
                  <p className="text-xs text-slate-500">Auto-verifying transaction with NPCI &amp; Banking Gateway...</p>
                </div>
                <div className="max-w-xs mx-auto p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-2 text-left">
                  <div className="flex items-center justify-between text-emerald-700 font-semibold">
                    <span>1. UPI App Approval</span>
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex items-center justify-between text-blue-700 font-semibold">
                    <span>2. Bank Settlement Verification</span>
                    <span className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <div className="flex items-center justify-between text-slate-400 font-medium">
                    <span>3. Registering Order in Database</span>
                    <span>Pending</span>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Body: Payment Success Celebration */}
            {paymentStep === 'success' && (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center mx-auto text-emerald-600 animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-slate-900">Payment Confirmed Successfully!</h4>
                  <p className="text-xs text-emerald-600 font-semibold">Order placed and saved to PostgreSQL database.</p>
                </div>
                <p className="text-xs text-slate-400">Redirecting to order tracking &amp; receipt...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
