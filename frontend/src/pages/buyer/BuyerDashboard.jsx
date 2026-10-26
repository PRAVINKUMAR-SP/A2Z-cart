import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, MapPin, Package, ShieldCheck, Mail, Phone, Plus, CheckCircle2, Download, Smartphone, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { Capacitor } from '@capacitor/core';

export default function BuyerDashboard() {
  const isNativeApp = typeof window !== 'undefined' && (Capacitor?.isNativePlatform?.() || false);
  const { user, updateUser } = useAuthStore();
  const { savedAddresses, fetchAddressesFromDb } = useCartStore();

  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  useEffect(() => {
    if (user) {
      fetchAddressesFromDb(user);
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUser(profileForm);
    setIsEditing(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-8">
      {/* Buyer Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80'}
            alt={user?.name}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover ring-4 ring-blue-500/10 shadow-sm shrink-0"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">{user?.name}</h1>
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[240px] sm:max-w-none">{user?.email} {user?.phone ? `· ${user.phone}` : ''}</p>
            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                Verified Buyer
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                Prime Delivery
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center flex-wrap">
          {!isNativeApp && (
            <a
              href="/a2z-cart.apk"
              download="A2Z-cart.apk"
              className="px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all hover:scale-105"
              title="Download Android App APK"
            >
              <Smartphone className="w-4 h-4" />
              <span>Download App</span>
            </a>
          )}

          <Link
            to="/buyer/orders"
            className="px-4 sm:px-5 py-2.5 sm:py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all"
          >
            <Package className="w-4 h-4" />
            <span>View Orders</span>
          </Link>
        </div>
      </div>

      {/* Android Mobile App Download Card Banner */}
      {!isNativeApp && (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="space-y-1.5 z-10 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              A2Z Official Mobile App
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-['Outfit']">Install A2Z~cart on Your Phone</h2>
            <p className="text-blue-100 text-xs sm:text-sm max-w-lg leading-relaxed">
              Enjoy 3D interactive shopping, lightning-fast checkouts, live tracking, and exclusive app-only deals directly on your Android phone.
            </p>
          </div>
          <a
            href="/a2z-cart.apk"
            download="A2Z-cart.apk"
            className="z-10 px-6 py-3.5 bg-white hover:bg-slate-50 text-blue-700 font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg hover:shadow-2xl flex items-center gap-2.5 transition-all hover:scale-105 shrink-0"
          >
            <Download className="w-4.5 h-4.5 text-blue-600" />
            <span>Download App (Official APK)</span>
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Profile Details */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-bold text-sm text-slate-900">Personal Information</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-100 rounded-xl outline-none font-medium"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-100 rounded-xl outline-none font-medium"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-100 rounded-xl outline-none font-medium"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-bold mt-2"
              >
                Save Changes
              </button>
            </form>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 text-slate-700">
                <User className="w-4 h-4 text-slate-400" />
                <span>{user?.name}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{user?.phone ? (user.phone.startsWith('+91') ? user.phone : `+91 ${user.phone}`) : 'Not provided'}</span>
              </div>
            </div>
          )}

          {/* Security Box */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Two-Factor Authentication Active</span>
            </span>
            <p className="text-[11px] text-slate-500">Your account is secured with Spring Security session protection.</p>
          </div>
        </div>

        {/* Right Column: Saved Delivery Addresses */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-sm text-slate-900">Saved Delivery Addresses</h2>
              <p className="text-xs text-slate-400">Used for single-click express checkout</p>
            </div>
          </div>

          {savedAddresses.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
              <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700">No saved addresses found</p>
              <p className="text-[11px] mt-0.5">Addresses added during checkout will be saved securely to database and appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedAddresses.map((addr) => (
                <div key={addr.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{addr.fullName}</span>
                    {addr.isDefault && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 font-medium">{addr.address || addr.street}</p>
                  <p className="text-slate-600">{addr.district || addr.city}, {addr.state} - <span className="font-bold text-slate-800">{addr.pincode}</span></p>
                  <p className="text-[11px] text-slate-500 font-semibold">{addr.country || 'India'}</p>
                  <p className="text-[11px] text-slate-400 font-medium pt-1 border-t border-slate-200/60 mt-1.5">{addr.phone} · {addr.email}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
