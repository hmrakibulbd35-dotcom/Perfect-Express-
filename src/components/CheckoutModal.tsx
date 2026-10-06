import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CreditCard,
  Truck,
  Tag,
  Check,
  AlertCircle,
  ArrowRight,
  MapPin,
  Phone,
  User,
  Banknote
} from 'lucide-react';
import { DeliveryArea, PaymentMethod } from '../types';
import { useApp } from '../context/AppContext';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    closeCheckout,
    cart,
    cartTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    createOrder,
    openBkashModal,
    language,
    t,
    showToast
  } = useApp();

  const [fullName, setFullName] = useState('Rakibul Hasan');
  const [phone, setPhone] = useState('01711223344');
  const [email, setEmail] = useState('rakibul.bd35@gmail.com');
  const [division, setDivision] = useState('Dhaka');
  const [district, setDistrict] = useState('Dhaka');
  const [deliveryArea, setDeliveryArea] = useState<DeliveryArea>('INSIDE_DHAKA');
  const [streetAddress, setStreetAddress] = useState('House 12, Road 5, Block C, Banani');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BKASH');
  const [couponInput, setCouponInput] = useState('');

  if (!isCheckoutOpen || cart.length === 0) return null;

  const deliveryFee = deliveryArea === 'INSIDE_DHAKA' ? 60 : 120;

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      discount = Math.round((cartTotal * appliedCoupon.discountValue) / 100);
    } else {
      discount = appliedCoupon.discountValue;
    }
  }

  const grandTotal = Math.max(0, cartTotal + deliveryFee - discount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput.trim());
    if (!res.success) {
      showToast(res.message, 'error');
    }
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim() || !streetAddress.trim()) {
      showToast('Please fill in name, phone, and delivery address', 'error');
      return;
    }

    if (phone.length < 11) {
      showToast('Please enter a valid 11-digit phone number (01XXXXXXXXX)', 'error');
      return;
    }

    const payload = {
      customerName: fullName.trim(),
      customerPhone: phone.trim(),
      customerEmail: email.trim() || undefined,
      address: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        division,
        district,
        area: deliveryArea,
        fullAddress: streetAddress.trim()
      },
      deliveryArea,
      paymentMethod,
      notes: notes.trim() || undefined
    };

    if (paymentMethod === 'BKASH') {
      // Trigger interactive bKash Sandbox simulation modal
      closeCheckout();
      openBkashModal({
        totalAmount: grandTotal,
        invoiceNumber: `BP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        payload
      });
    } else {
      createOrder(payload);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
              ✓
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t.checkoutTitle}
              </h2>
              <p className="text-[11px] text-slate-500">
                {language === 'bn' ? 'দ্রুত ডেলিভারি ও সুরক্ষিত পেমেন্ট' : 'Single-Page Express Checkout'}
              </p>
            </div>
          </div>

          <button
            onClick={closeCheckout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Checkout Body: Form on Left, Summary on Right */}
        <form onSubmit={handleSubmitOrder} className="overflow-y-auto p-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Shipping & Payment Form (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Contact & Recipient */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t.contactShipping}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    {t.fullName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder={t.fullNamePlaceholder}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    {t.phone} *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={11}
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder={t.phonePlaceholder}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Area Selection (Inside Dhaka vs Outside Dhaka) */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t.deliveryArea}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => {
                    setDeliveryArea('INSIDE_DHAKA');
                    setDivision('Dhaka');
                    setDistrict('Dhaka');
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    deliveryArea === 'INSIDE_DHAKA'
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 ring-1 ring-emerald-500'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryArea"
                    checked={deliveryArea === 'INSIDE_DHAKA'}
                    onChange={() => {}}
                    className="mt-1 text-emerald-600"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Inside Dhaka (৳60)
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block leading-tight">
                      24-48 Hours Express via Steadfast
                    </span>
                  </div>
                </div>

                <div
                  onClick={() => {
                    setDeliveryArea('OUTSIDE_DHAKA');
                    setDivision('Chattogram');
                    setDistrict('Chattogram');
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    deliveryArea === 'OUTSIDE_DHAKA'
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 ring-1 ring-emerald-500'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryArea"
                    checked={deliveryArea === 'OUTSIDE_DHAKA'}
                    onChange={() => {}}
                    className="mt-1 text-emerald-600"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Outside Dhaka (৳120)
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block leading-tight">
                      2-4 Days Home Delivery Nationwide
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Street Address */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {t.deliveryAddress} *
              </label>
              <textarea
                required
                rows={2}
                value={streetAddress}
                onChange={e => setStreetAddress(e.target.value)}
                placeholder={t.deliveryAddressPlaceholder}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Payment Method Selector */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t.paymentMethod}</span>
              </h3>

              <div className="space-y-2">
                {/* bKash */}
                <div
                  onClick={() => setPaymentMethod('BKASH')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === 'BKASH'
                      ? 'border-[#e2136e] bg-pink-50/50 dark:bg-pink-950/20 ring-1 ring-[#e2136e]'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'BKASH'}
                      onChange={() => {}}
                      className="text-[#e2136e]"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>bKash Online Payment</span>
                        <span className="text-[10px] bg-[#e2136e] text-white px-1.5 py-0.2 rounded font-mono">
                          Instant
                        </span>
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {t.bkashDesc}
                      </p>
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded bg-[#e2136e] text-white flex items-center justify-center font-black text-xs">
                    ব
                  </div>
                </div>

                {/* Cash on Delivery */}
                <div
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === 'COD'
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-1 ring-emerald-500'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'COD'}
                      onChange={() => {}}
                      className="text-emerald-600"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {t.cashOnDelivery}
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {t.codDesc}
                      </p>
                    </div>
                  </div>
                  <Banknote className="w-5 h-5 text-emerald-600" />
                </div>

                {/* Nagad */}
                <div
                  onClick={() => setPaymentMethod('NAGAD')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === 'NAGAD'
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 ring-1 ring-amber-500'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'NAGAD'}
                      onChange={() => {}}
                      className="text-amber-600"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {t.nagadPayment}
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {t.nagadDesc}
                      </p>
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded bg-amber-600 text-white flex items-center justify-center font-black text-xs">
                    ন
                  </div>
                </div>

                {/* SSLCommerz */}
                <div
                  onClick={() => setPaymentMethod('SSLCOMMERZ')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === 'SSLCOMMERZ'
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 ring-1 ring-blue-500'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'SSLCOMMERZ'}
                      onChange={() => {}}
                      className="text-blue-600"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {t.sslCommerz}
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {t.sslDesc}
                      </p>
                    </div>
                  </div>
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary & Coupon (5 Cols) */}
          <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-200 dark:border-slate-700">
                {t.orderSummary} ({cart.length} {cart.length === 1 ? 'item' : 'items'})
              </h3>

              {/* Items mini list */}
              <div className="max-h-48 overflow-y-auto space-y-2.5 pr-1 divide-y divide-slate-100 dark:divide-slate-800">
                {cart.map(item => (
                  <div key={item.id} className="pt-2 first:pt-0 flex items-center gap-3 text-xs">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {language === 'bn' ? item.product.titleBn : item.product.title}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Qty: {item.quantity} × ৳{item.unitPrice}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      ৳{item.totalPrice.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Applicator */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                      <Tag className="w-3.5 h-3.5" />
                      <span className="font-mono font-bold">{appliedCoupon.code}</span>
                      <span className="text-[11px]">(-৳{discount})</span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-slate-400 hover:text-rose-500 font-bold text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={t.couponPlaceholder}
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-3 py-1.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      {t.apply}
                    </button>
                  </div>
                )}
                <div className="text-[10px] text-slate-400 mt-1">
                  Try coupon: <span className="font-mono font-bold text-emerald-600">EID2026</span> (15% off) or <span className="font-mono font-bold text-emerald-600">DHAKA50</span>
                </div>
              </div>

              {/* Price Calculation breakdown */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{t.subtotal}</span>
                  <span className="font-mono">৳{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{t.deliveryFee}</span>
                  <span className="font-mono">৳{deliveryFee}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>{t.discount}</span>
                    <span className="font-mono">-৳{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>{t.totalAmount}</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    ৳{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Place Order CTA */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg active:scale-95"
              >
                <span>{t.confirmOrder}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Encrypted 256-bit SSL Checkout & Instant Invoice</span>
              </div>
            </div>

          </div>

        </form>

      </div>
    </div>
  );
};
