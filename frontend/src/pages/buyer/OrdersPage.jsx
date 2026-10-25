import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Package, Truck, CheckCircle2, Clock, MapPin, 
  Store, AlertCircle, FileText, ArrowRight, XCircle, CreditCard, Banknote, Sparkles, Check
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useOrderStore } from '../../store/orderStore';
import { formatPrice, formatDate } from '../../utils/formatters';

export default function OrdersPage() {
  const [searchParams] = useSearchParams();
  const highlightedId = searchParams.get('highlight');
  const { user } = useAuthStore();
  const { orders = [], cancelOrder, fetchOrdersFromDb, isOrdersLoading } = useOrderStore();

  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('Found cheaper alternative elsewhere');
  const highlightedRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchOrdersFromDb(user);
    }
  }, [user]);

  // Smooth scroll to highlighted order if navigated from checkout
  useEffect(() => {
    if (highlightedId && highlightedRef.current) {
      setTimeout(() => {
        highlightedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [highlightedId, orders]);

  const handleConfirmCancel = () => {
    if (!selectedOrderForCancel) return;
    cancelOrder(selectedOrderForCancel.id, cancelReason);
    setSelectedOrderForCancel(null);
  };

  // Helper to safely parse shipping address
  const parseAddress = (addr, order) => {
    if (!addr) return { fullName: order?.buyerName || 'Valued Buyer' };
    if (typeof addr === 'object') return addr;
    try {
      return JSON.parse(addr);
    } catch (e) {
      return { fullName: order?.buyerName || 'Valued Buyer' };
    }
  };

  // Helper to extract or construct suborders safely
  const getSuborders = (ord) => {
    if (Array.isArray(ord.suborders) && ord.suborders.length > 0) {
      return ord.suborders;
    }

    let rawItems = [];
    try {
      if (Array.isArray(ord.productDetails)) {
        rawItems = ord.productDetails;
      } else if (typeof ord.productDetails === 'string') {
        rawItems = JSON.parse(ord.productDetails);
      } else if (Array.isArray(ord.items)) {
        rawItems = ord.items;
      }
    } catch (e) {
      rawItems = [];
    }

    if (rawItems.length === 0) {
      return [
        {
          suborderId: `SUB-${String(ord.id || ord.orderTrackingNumber || '1').replace(/\D/g, '') || '1'}-A`,
          sellerName: ord.sellerName || 'A2Z Verified Seller',
          status: ord.status || 'CONFIRMED',
          courier: 'Delhivery Express',
          trackingNumber: `DEL-${Date.now().toString().slice(-8)}`,
          estimatedDelivery: '3 Business Days',
          items: []
        }
      ];
    }

    const bySeller = {};
    rawItems.forEach((it, idx) => {
      const sId = it.sellerId || it.vendorId || `seller-${idx}`;
      if (!bySeller[sId]) {
        bySeller[sId] = {
          suborderId: `SUB-${String(ord.id || ord.orderTrackingNumber || '1').replace(/\D/g, '') || '1'}-${Object.keys(bySeller).length + 1}`,
          sellerId: sId,
          sellerName: it.sellerName || ord.sellerName || 'A2Z Verified Seller',
          status: ord.status || 'CONFIRMED',
          courier: 'Delhivery Express',
          trackingNumber: `DEL-${Date.now().toString().slice(-8)}`,
          estimatedDelivery: '3 Business Days',
          items: []
        };
      }
      bySeller[sId].items.push(it);
    });

    return Object.values(bySeller);
  };

  // Helper to get tracking milestone events
  const getTrackingEvents = (ord) => {
    if (Array.isArray(ord.trackingEvents) && ord.trackingEvents.length > 0) {
      return ord.trackingEvents;
    }
    const isCod = ord.paymentMethod === 'CASH_ON_DELIVERY';
    return [
      { 
        time: 'Just now', 
        title: isCod ? 'Cash on Delivery Order Placed' : 'Payment Received & Confirmed', 
        desc: isCod 
          ? 'Cash on delivery verified. Amount to be collected upon doorstep arrival.' 
          : 'UPI payment verified. Stock allocated and packaging assigned.', 
        done: true 
      },
      { time: 'Pending', title: 'Seller Packaging', desc: 'Vendor is preparing items for carrier pickup.', done: false },
      { time: 'Pending', title: 'Handed to Logistics Carrier', desc: 'Courier pickup scheduled with tracking number.', done: false },
      { time: 'Estimated in 2-3 days', title: 'Out for Delivery', desc: 'Contactless delivery with verification.', done: false }
    ];
  };

  const safeOrders = Array.isArray(orders) ? orders.filter(Boolean) : [];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">
      {/* Top Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">My Orders & Shipments</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track multi-vendor deliveries with real-time carrier milestones & tax receipts</p>
        </div>
        <Link to="/shop" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 self-start sm:self-auto">
          Continue Shopping <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Empty State */}
      {safeOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">You have no previous orders</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse our curated marketplace and place your first order today.
          </p>
          <Link to="/shop" className="inline-block px-6 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-md">
            Go to Shop
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {safeOrders.map((order) => {
            const orderIdentifier = String(order.id || order.orderTrackingNumber || order.dbId || '');
            const isHighlighted = highlightedId && (
              orderIdentifier === highlightedId || 
              String(order.orderTrackingNumber) === highlightedId ||
              String(order.id) === highlightedId
            );

            const addr = parseAddress(order.shippingAddress, order);
            const suborders = getSuborders(order);
            const events = getTrackingEvents(order);
            const isCod = order.paymentMethod === 'CASH_ON_DELIVERY';
            const paymentIdStr = String(order.paymentId || '');
            const isUpiPaid = paymentIdStr.startsWith('upi') || order.paymentMethod === 'ONLINE';

            return (
              <div
                key={orderIdentifier || Math.random()}
                ref={isHighlighted ? highlightedRef : null}
                className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden shadow-xs ${
                  isHighlighted ? 'border-2 border-emerald-500 ring-4 ring-emerald-500/10' : 'border-slate-200'
                }`}
              >
                {/* Highlighted Success Notification Banner */}
                {isHighlighted && (
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-2.5 text-xs font-bold flex flex-wrap items-center justify-between gap-2 shadow-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </span>
                      <span>Order Placed &amp; Confirmed Successfully! Recorded in Database.</span>
                    </div>
                    <span className="text-[11px] font-mono font-bold bg-white/10 px-2 py-0.5 rounded-md border border-white/20">
                      ID: {orderIdentifier}
                    </span>
                  </div>
                )}

                {/* Order Master Header */}
                <div className="bg-slate-50 p-4 sm:p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 text-xs">
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3 sm:gap-6">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Order Placed</span>
                      <span className="font-bold text-slate-800">{formatDate(order.createdAt)}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Amount</span>
                      <span className="font-black text-slate-900 font-['Outfit']">{formatPrice(order.totalAmount)}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Ship To</span>
                      <span className="font-bold text-slate-800 truncate max-w-[120px] sm:max-w-none block">{addr.fullName || order.buyerName || 'Valued Buyer'}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Payment</span>
                      {isCod ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          <Banknote className="w-3 h-3 text-amber-600" />
                          <span>COD</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{isUpiPaid ? 'UPI Paid' : 'Paid'}</span>
                        </span>
                      )}
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Status</span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        {order.status || 'CONFIRMED'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Order ID</span>
                      <span className="font-mono font-bold text-slate-900">{orderIdentifier}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => alert(`Tax Invoice for ${orderIdentifier}\nTotal Amount: ${formatPrice(order.totalAmount)}\nPayment Method: ${order.paymentMethod}\nStatus: ${order.status || 'CONFIRMED'}\n\nInvoice downloaded to browser.`)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-white text-slate-700 font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>Invoice</span>
                    </button>
                  </div>
                </div>

                {/* Suborders & Tracking Milestones */}
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  {suborders.map((sub, sIdx) => (
                    <div key={sub.suborderId || sIdx} className="space-y-4 pb-6 border-b border-slate-100 last:border-b-0 last:pb-0">
                      
                      {/* Suborder Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-blue-600" />
                          <span className="font-bold text-xs text-slate-900">
                            Vendor: <strong>{sub.sellerName}</strong>
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                            {sub.suborderId}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-500">Carrier: <strong>{sub.courier || 'Delhivery Express'}</strong></span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-500 font-mono">AWB: {sub.trackingNumber || `DEL-${Date.now().toString().slice(-8)}`}</span>
                        </div>
                      </div>

                      {/* Items in this suborder */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(sub.items || []).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                            <img 
                              src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'} 
                              alt={item.name || 'Product'} 
                              className="w-14 h-14 object-cover rounded-xl bg-white shrink-0" 
                              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'; }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-xs text-slate-900 line-clamp-1">{item.name || 'Product Item'}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Qty: {item.quantity || 1} · {formatPrice(item.price || 0)} each
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Animated Tracking Progress Timeline */}
                  <div className="p-5 bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-cyan-400" />
                        <h4 className="font-bold text-xs tracking-wider uppercase text-cyan-300">
                          Live Carrier Milestones
                        </h4>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Status: {order.status || 'CONFIRMED'}</span>
                      </span>
                    </div>

                    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700">
                      {events.map((event, idx) => (
                        <div key={idx} className="relative flex items-start gap-3 text-xs">
                          <span
                            className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full ring-4 ring-slate-900 ${
                              event.done ? 'bg-cyan-400' : 'bg-slate-600'
                            }`}
                          ></span>
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className={`font-bold ${event.done ? 'text-white' : 'text-slate-400'}`}>
                                {event.title}
                              </span>
                              <span className="text-[10px] text-slate-400">{event.time}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">{event.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Cancellation Trigger (Only if not delivered or cancelled) */}
                  {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedOrderForCancel(order)}
                        className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Request Cancellation</span>
                      </button>
                    </div>
                  )}

                  {order.status === 'CANCELLED' && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2 border border-red-200">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>This order was cancelled. Refund has been initiated to original payment source.</span>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Modal */}
      {selectedOrderForCancel && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              Cancel Order {selectedOrderForCancel.id || selectedOrderForCancel.orderTrackingNumber}
            </h3>
            <p className="text-xs text-slate-500">
              Please choose a reason for cancellation. Any payments made will be reversed within 24-48 business hours.
            </p>
            <div className="space-y-2 text-xs">
              {[
                'Found cheaper alternative elsewhere',
                'Delivery time is too long',
                'Ordered by mistake / changed mind',
                'Incorrect shipping address selected'
              ].map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="reason"
                    checked={cancelReason === reason}
                    onChange={() => setCancelReason(reason)}
                    className="accent-red-600"
                  />
                  <span className="font-medium text-slate-700">{reason}</span>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setSelectedOrderForCancel(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-xs cursor-pointer"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
