import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight, ShieldCheck, Tag, Sparkles, Store } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { formatPrice } from '../../utils/formatters';

export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, removeItem, updateQuantity, coupon, applyCoupon, removeCoupon, getTotals, fetchCartFromDb } = useCartStore();
  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState(null);

  useEffect(() => {
    if (user) {
      fetchCartFromDb(user);
    }
  }, [user]);

  const { itemCount, subtotal, originalTotal, productDiscount, couponDiscount, deliveryFee, finalTotal } = getTotals();

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput.trim());
    setCouponMessage(res);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 font-['Outfit']">Your Shopping Cart is Empty</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Explore our next-gen marketplace and discover trending audio, 3D electronics, and apparel.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-24 sm:pb-8">
      <div className="flex items-center justify-between pb-4 sm:pb-6 mb-4 sm:mb-6 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">Shopping Cart</h1>
          <p className="text-xs text-slate-500 mt-0.5">{itemCount} items from verified marketplace sellers</p>
        </div>
        <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
          Prices and delivery slots confirmed
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-8 space-y-3.5 sm:space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 hover:border-slate-300 transition-all"
            >
              <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl bg-slate-100 shrink-0"
                />
                <div className="space-y-1 min-w-0 flex-1 sm:flex-initial">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                    <Store className="w-3 h-3 text-blue-500" />
                    <span className="truncate max-w-[140px] sm:max-w-none">{item.sellerName || 'Verified Vendor'}</span>
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">{item.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm sm:text-base font-black text-slate-900">{formatPrice(item.price)}</span>
                    {item.originalPrice && (
                      <span className="text-[11px] sm:text-xs text-slate-400 line-through">
                        {formatPrice(item.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quantity Controls & Remove */}
              <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-3 sm:gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 shadow-inner">
                  <button
                    onClick={() => updateQuantity(item.productId || item.id, item.quantity - 1, user)}
                    className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-slate-600 hover:text-slate-900 font-bold text-xs cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-bold text-slate-900">{item.productCount || item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId || item.id, item.quantity + 1, user)}
                    className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-slate-600 hover:text-slate-900 font-bold text-xs cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => {
                    removeItem(item.productId || item.id, user);
                    toast.success(`${item.name} removed from cart`);
                  }}
                  className="p-1.5 sm:p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Trust Banner */}
          <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 flex items-center gap-3 text-xs text-blue-900">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <span className="font-bold">A2Z~cart Buyer Protection: </span>
              <span>100% money-back guarantee if the item is damaged or not as described.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Coupon */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Coupon Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Tag className="w-4 h-4 text-amber-500" />
              <span>Apply Marketplace Coupon</span>
            </div>

            {coupon ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-emerald-800">Coupon applied: {coupon.code}</span>
                  <p className="text-[11px] text-emerald-600">Saved {formatPrice(couponDiscount)}</p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-[11px] font-bold text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon code (Try A2ZFIRST)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-100 rounded-xl text-xs font-semibold uppercase outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Apply
                </button>
              </form>
            )}

            {couponMessage && (
              <p className={`text-[11px] font-medium ${couponMessage.success ? 'text-emerald-600' : 'text-red-600'}`}>
                {couponMessage.message}
              </p>
            )}
          </div>

          {/* Pricing Ledger Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 font-['Outfit']">
              Price Details
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total MRP ({itemCount} items)</span>
                <span>{formatPrice(originalTotal)}</span>
              </div>

              {productDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Product Discount</span>
                  <span>- {formatPrice(productDiscount)}</span>
                </div>
              )}

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Savings ({coupon?.code})</span>
                  <span>- {formatPrice(couponDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Estimated Delivery Charge</span>
                <span>{deliveryFee === 0 ? <strong className="text-emerald-600 font-bold">FREE</strong> : formatPrice(deliveryFee)}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Total Payable Amount</span>
                <span className="text-xl font-black text-blue-600">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Mobile Sticky Bottom Checkout Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-lg flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Total Payable</span>
          <span className="text-lg font-black text-blue-600 leading-tight">
            {formatPrice(finalTotal)}
          </span>
        </div>
        <button
          onClick={() => navigate('/checkout')}
          className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/25 transition-all"
        >
          <span>Checkout</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
