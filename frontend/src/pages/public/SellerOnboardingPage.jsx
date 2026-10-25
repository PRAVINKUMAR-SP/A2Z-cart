import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store,
  Mail,
  Phone,
  MapPin,
  QrCode,
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Check,
  RefreshCw,
  X,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { useSellerStore } from '../../store/sellerStore';

export default function SellerOnboardingPage() {
  const navigate = useNavigate();
  const { user, login, isSeller } = useAuthStore();
  const { submitApplication, saveSellerProfile, currentSellerProfile, fetchSellerProfile } = useSellerStore();

  const qrInputRef = useRef(null);

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [form, setForm] = useState({
    sellerName: '',
    email: '',
    phone: '',
    sellerAddress: '',
    gpayQr: '',
  });

  // If user already has an active seller account, inform them and link directly to dashboard
  if (isSeller() || user?.sellerStatus === 'APPROVED' || user?.companyName) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50">
          <Store className="w-10 h-10" />
        </div>
        
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Store Already Active</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 font-['Outfit']">
            You Already Have a Seller Account!
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
            Your store <strong>{user?.companyName || user?.sellerName || user?.name}</strong> is already registered and active on A2Z~cart. You can manage your products, customer orders, and UPI payments directly from your Seller Dashboard.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
          <button
            onClick={() => navigate('/seller/dashboard')}
            className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Open Seller Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/shop')}
            className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Browse Customer Store
          </button>
        </div>
      </div>
    );
  }

  // Strict 10-digit mobile number handlers
  const handlePhoneChange = (e) => {
    const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setForm((prev) => ({ ...prev, phone: onlyDigits }));
  };

  const handlePhoneKeyDown = (e) => {
    if (
      ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key) ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePhonePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const onlyDigits = pasted.replace(/\D/g, '').slice(0, 10);
    setForm((prev) => ({ ...prev, phone: onlyDigits }));
  };

  // Google Pay QR Photo Upload Handler
  const handleQrUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size exceeds 5MB limit. Please upload a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setForm((prev) => ({
        ...prev,
        gpayQr: event.target.result,
      }));
      toast.success('GPay QR Code photo attached!');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!form.sellerName.trim()) {
      const msg = 'Please enter your Seller / Store Name.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (!form.email.trim()) {
      const msg = 'Please enter your Primary Email Address.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    const cleanPhone = form.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      const msg = 'Please enter a valid 10-digit phone number.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (!form.sellerAddress.trim()) {
      const msg = 'Please enter your Store / Pickup Address.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (!form.gpayQr) {
      const msg = 'Please upload your Google Pay / UPI QR code photo.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setIsSubmitting(true);

    try {
      const targetUserId = user && user.email === form.email.trim().toLowerCase() ? user.id : null;
      const sellerData = {
        sellerName: form.sellerName.trim(),
        companyName: form.sellerName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: cleanPhone,
        sellerAddress: form.sellerAddress.trim(),
        registeredAddress: form.sellerAddress.trim(),
        gpayQr: form.gpayQr,
        userId: targetUserId,
      };

      // 1. Sync seller profile to PostgreSQL backend via API
      const profileRes = await saveSellerProfile(sellerData);
      const finalUserId = profileRes?.userId || profileRes?.id || targetUserId || `usr-seller-${Date.now()}`;

      // 2. Submit record to store applications
      submitApplication({
        ...sellerData,
        userId: finalUserId,
      });

      // 3. Set user session strictly as ROLE_SELLER (never Admin)
      login(
        {
          id: finalUserId,
          name: form.sellerName.trim(),
          email: form.email.trim().toLowerCase(),
          phone: cleanPhone,
          role: 'ROLE_SELLER',
          sellerStatus: 'APPROVED',
          companyName: form.sellerName.trim(),
          sellerName: form.sellerName.trim(),
          sellerAddress: form.sellerAddress.trim(),
          registeredAddress: form.sellerAddress.trim(),
          gpayQr: form.gpayQr,
          isAdminUser: false,
          avatar: form.gpayQr || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&q=80',
        },
        'jwt_seller_' + Date.now()
      );

      toast.success('Seller Account Created Successfully!');
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to create seller account:', err);
      const msg = 'Failed to create seller account. Please try again.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Confirmation Screen
  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Store Activated & Ready</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 font-['Outfit']">
            Seller Account Created!
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
            Welcome aboard, <strong>{form.sellerName}</strong>! Your seller account is active and your Google Pay QR code is configured to receive buyer payments instantly.
          </p>
        </div>

        {/* Store Summary Card */}
        <div className="p-5 bg-white border border-slate-200 rounded-3xl text-left max-w-lg mx-auto shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{form.sellerName}</h3>
                <p className="text-[11px] text-slate-500">{form.email}</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
              Active Seller
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 block mb-0.5">PHONE NUMBER</span>
              <span className="font-mono font-bold text-slate-800">+91 {form.phone}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 block mb-0.5">PAYMENT METHOD</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> GPay QR Linked
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-xs">
            <span className="text-[10px] font-bold text-slate-400 block mb-0.5">STORE ADDRESS</span>
            <p className="text-slate-700 line-clamp-2">{form.sellerAddress}</p>
          </div>

          {form.gpayQr && (
            <div className="flex items-center gap-3 p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
              <img
                src={form.gpayQr}
                alt="GPay QR Code"
                className="w-14 h-14 rounded-lg object-contain bg-white border border-indigo-200 p-0.5 shadow-xs"
              />
              <div className="text-xs">
                <p className="font-bold text-slate-900">Direct Customer UPI QR</p>
                <p className="text-[11px] text-slate-500">
                  When customers buy from your store, this QR is displayed at checkout.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Next Actions */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
          <button
            onClick={() => navigate('/seller/dashboard')}
            className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Go to Seller Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/seller/dashboard')}
            className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Add Products & Manage Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-6 sm:py-10 space-y-6 sm:space-y-8">
      {/* Hero Header */}
      <div className="text-center space-y-2.5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
          <Store className="w-3.5 h-3.5" />
          <span>A2Z~cart Seller Registration</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 font-['Outfit'] tracking-tight">
          Create Your Seller Account
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Start selling to pan-India buyers. Provide your basic store details and upload your Google Pay QR code to receive customer payments instantly.
        </p>
      </div>

      {/* 3 Value Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 text-center shadow-xs">
          <span className="text-sm font-black text-blue-600 font-['Outfit'] block">⚡ Instant Setup</span>
          <p className="text-[11px] text-slate-500 mt-0.5">No lengthy paperwork, start selling right away</p>
        </div>
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 text-center shadow-xs">
          <span className="text-sm font-black text-emerald-600 font-['Outfit'] block">💸 Direct UPI Payments</span>
          <p className="text-[11px] text-slate-500 mt-0.5">Buyers scan your GPay QR directly at checkout</p>
        </div>
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 text-center shadow-xs">
          <span className="text-sm font-black text-purple-600 font-['Outfit'] block">📦 Pan-India Reach</span>
          <p className="text-[11px] text-slate-500 mt-0.5">Doorstep pickup across 19,000+ pincodes</p>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-3xl p-4 sm:p-9 border border-slate-200 shadow-xl space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">Seller Account Details</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Fill in the 5 required details below to create and activate your seller profile
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* 1. Seller Name */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">
              Seller Name / Store Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative group">
              <input
                type="text"
                required
                placeholder="e.g. Abi Electronics or Abi Store"
                value={form.sellerName}
                onChange={(e) => setForm({ ...form, sellerName: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-slate-50/80 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 rounded-xl outline-none font-medium text-xs sm:text-sm text-slate-800 placeholder-slate-400 transition-all duration-200"
              />
              <Store className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 absolute left-3.5 top-3.5 transition-colors" />
            </div>
            <p className="text-[11px] text-slate-400">This store name will appear on your products and checkout page.</p>
          </div>

          {/* 2. Email & 3. Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <input
                  type="email"
                  required
                  placeholder="seller@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50/80 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 rounded-xl outline-none font-medium text-xs sm:text-sm text-slate-800 placeholder-slate-400 transition-all duration-200"
                />
                <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 absolute left-3.5 top-3.5 transition-colors" />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-slate-700">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <span
                  className={`text-[11px] font-semibold transition-colors ${
                    form.phone.length === 10 ? 'text-emerald-600 font-bold' : 'text-slate-400'
                  }`}
                >
                  {form.phone.length}/10 digits
                </span>
              </div>
              <div className="relative group flex items-center">
                <div className="absolute left-3.5 flex items-center gap-1.5 pointer-events-none select-none z-10">
                  <Phone className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <span className="text-xs font-bold text-slate-700 pl-0.5 pr-2 border-r border-slate-300">
                    +91
                  </span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  required
                  maxLength={10}
                  pattern="[0-9]{10}"
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={handlePhoneChange}
                  onKeyDown={handlePhoneKeyDown}
                  onPaste={handlePhonePaste}
                  className="w-full pl-[76px] pr-4 py-3 bg-slate-50/80 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 rounded-xl outline-none font-medium text-xs sm:text-sm text-slate-800 placeholder-slate-400 tracking-wider transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* 4. Address */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">
              Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative group">
              <textarea
                required
                rows={2}
                placeholder="Shop / Warehouse / Pickup Address, City, State, Pincode"
                value={form.sellerAddress}
                onChange={(e) => setForm({ ...form, sellerAddress: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 rounded-xl outline-none font-medium text-xs sm:text-sm text-slate-800 placeholder-slate-400 transition-all duration-200"
              />
              <MapPin className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 absolute left-3.5 top-3.5 transition-colors" />
            </div>
            <p className="text-[11px] text-slate-400">Orders will be picked up from this address for delivery.</p>
          </div>

          {/* 5. GPay QR Code Photo */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-700">
                Google Pay QR Code Photo <span className="text-rose-500">*</span>
              </label>
              {form.gpayQr && (
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                  <Check className="w-3 h-3" /> QR Attached
                </span>
              )}
            </div>

            {form.gpayQr ? (
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-200">
                <img
                  src={form.gpayQr}
                  alt="GPay QR preview"
                  className="w-24 h-24 rounded-xl object-contain border-2 border-indigo-500 shadow-sm shrink-0 bg-white p-1"
                />
                <div className="space-y-2 text-center sm:text-left">
                  <div>
                    <p className="font-bold text-slate-900 text-xs">Google Pay / UPI QR Photo Attached</p>
                    <p className="text-[11px] text-slate-500">
                      Buyers who choose Online QR Payment will scan this QR to pay you directly.
                    </p>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-3">
                    <button
                      type="button"
                      onClick={() => qrInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold rounded-lg text-xs cursor-pointer transition-colors shadow-2xs"
                    >
                      Change Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, gpayQr: '' })}
                      className="text-xs text-rose-500 hover:text-rose-600 font-bold hover:underline cursor-pointer"
                    >
                      Remove Photo
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={() => qrInputRef.current?.click()}
                className="p-6 rounded-2xl border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/20 hover:bg-indigo-50/40 text-center cursor-pointer transition-all space-y-2 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-100/70 text-indigo-600 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 text-xs sm:text-sm block">
                    Click to Upload Google Pay QR Code Photo
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Upload a screenshot or photo of your Google Pay / PhonePe / Paytm / BHIM UPI QR code (JPG, PNG, WEBP, max 5MB)
                  </p>
                </div>
              </div>
            )}

            <input
              ref={qrInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleQrUpload}
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70 group"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Creating Seller Account...</span>
                </>
              ) : (
                <>
                  <span>Create Seller Account & Start Selling</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
