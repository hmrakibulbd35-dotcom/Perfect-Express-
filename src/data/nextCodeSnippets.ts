// ==============================================================================
// Complete Production-Ready Next.js 15 React Code Snippets
// Features: App Router, Tailwind CSS, TypeScript, Zustand Store, Lucide Icons
// ==============================================================================

export const NEXT_CART_STORE_CODE = `// ==============================================================================
// File: src/store/useCartStore.ts
// Zustand Store for Next.js 15 with LocalStorage Persistence
// ==============================================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type DeliveryArea = 'INSIDE_DHAKA' | 'OUTSIDE_DHAKA';

export interface CartItem {
  id: string; // Composite: productId + variantId
  productId: string;
  title: string;
  titleBn?: string;
  slug: string;
  sku: string;
  image: string;
  unitPrice: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  selectedColorHex?: string;
  maxStock: number;
}

export interface Coupon {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderValue: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  deliveryArea: DeliveryArea;
  appliedCoupon: Coupon | null;
  
  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  setDeliveryArea: (area: DeliveryArea) => void;
  applyCoupon: (coupon: Coupon) => { success: boolean; message: string };
  removeCoupon: () => void;
  
  // Computed Getters
  getSubtotal: () => number;
  getDeliveryFee: () => number;
  getDiscount: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      deliveryArea: 'INSIDE_DHAKA',
      appliedCoupon: null,

      addItem: (newItem) => {
        const id = \`\${newItem.productId}-\${newItem.selectedSize || 'default'}-\${newItem.selectedColor || 'default'}\`;
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex((i) => i.id === id);

        if (existingIndex > -1) {
          const updated = [...currentItems];
          const newQty = Math.min(updated[existingIndex].quantity + newItem.quantity, newItem.maxStock);
          updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
          set({ items: updated, isOpen: true });
        } else {
          set({ items: [...currentItems, { ...newItem, id }], isOpen: true });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((i) => (i.id === id ? { ...i, quantity: Math.min(quantity, i.maxStock) } : i)),
        });
      },

      clearCart: () => set({ items: [], appliedCoupon: null }),
      setIsOpen: (isOpen) => set({ isOpen }),
      setDeliveryArea: (deliveryArea) => set({ deliveryArea }),

      applyCoupon: (coupon) => {
        const subtotal = get().getSubtotal();
        if (subtotal < coupon.minOrderValue) {
          return {
            success: false,
            message: \`Minimum order value of ৳\${coupon.minOrderValue} required for this coupon.\`,
          };
        }
        set({ appliedCoupon: coupon });
        return { success: true, message: \`Coupon \${coupon.code} applied successfully!\` };
      },

      removeCoupon: () => set({ appliedCoupon: null }),

      getSubtotal: () => get().items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0),

      getDeliveryFee: () => {
        if (get().items.length === 0) return 0;
        return get().deliveryArea === 'INSIDE_DHAKA' ? 60 : 120;
      },

      getDiscount: () => {
        const { appliedCoupon } = get();
        if (!appliedCoupon) return 0;
        const subtotal = get().getSubtotal();
        if (appliedCoupon.discountType === 'PERCENTAGE') {
          return Math.round((subtotal * appliedCoupon.discountValue) / 100);
        }
        return appliedCoupon.discountValue;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const deliveryFee = get().getDeliveryFee();
        const discount = get().getDiscount();
        return Math.max(0, subtotal + deliveryFee - discount);
      },

      getItemCount: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
    }),
    {
      name: 'bazaarpulse-cart-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        deliveryArea: state.deliveryArea,
        appliedCoupon: state.appliedCoupon,
      }),
    }
  )
);
`;

export const NEXT_CART_DRAWER_CODE = `// ==============================================================================
// File: src/components/cart/CartDrawer.tsx
// Slide-Over Cart Drawer with Area Shipping Calculation & Coupon Support
// ==============================================================================

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, ArrowRight, ShoppingBag, ShieldCheck, Tag } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isOpen,
    setIsOpen,
    removeItem,
    updateQuantity,
    deliveryArea,
    setDeliveryArea,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getDeliveryFee,
    getDiscount,
    getTotal,
    getItemCount,
  } = useCartStore();

  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; error: boolean } | null>(null);

  if (!isOpen) return null;

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const discount = getDiscount();
  const total = getTotal();
  const itemCount = getItemCount();

  const FREE_SHIPPING_THRESHOLD = 2500;
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const remainingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (!clean) return;

    if (clean === 'EID2026') {
      const res = applyCoupon({
        code: 'EID2026',
        discountType: 'PERCENTAGE',
        discountValue: 15,
        minOrderValue: 2000,
      });
      setCouponMsg({ text: res.message, error: !res.success });
    } else if (clean === 'DHAKA50') {
      const res = applyCoupon({
        code: 'DHAKA50',
        discountType: 'FIXED',
        discountValue: 50,
        minOrderValue: 1000,
      });
      setCouponMsg({ text: res.message, error: !res.success });
    } else {
      setCouponMsg({ text: 'Invalid promo coupon code.', error: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                My Shopping Bag ({itemCount} {itemCount === 1 ? 'item' : 'items'})
              </h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="px-5 py-3 bg-emerald-50/70 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-900/50">
            <div className="text-xs font-medium text-emerald-800 dark:text-emerald-300 flex items-center justify-between mb-1.5">
              <span>
                {remainingForFree > 0
                  ? \`Add ৳\${remainingForFree} more for FREE shipping Inside Dhaka!\`
                  : '🎉 Congratulations! You unlocked FREE Delivery!'}
              </span>
              <span className="font-mono font-bold">{freeShippingProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-emerald-200 dark:bg-emerald-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: \`\${freeShippingProgress}%\` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length > 0 ? (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={\`/products/\${item.slug}\`}
                          onClick={() => setIsOpen(false)}
                          className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 hover:text-emerald-600 transition-colors"
                        >
                          {item.title}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                        {item.selectedSize && item.selectedColor && <span>·</span>}
                        {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Modifier */}
                      <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-0.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          -
                        </button>
                        <span className="px-3 py-0.5 text-xs font-mono font-bold text-slate-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="px-2.5 py-0.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                        ৳{(item.unitPrice * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Your cart is currently empty
                </h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Browse our authentic collections and flash deals to add items.
                </p>
              </div>
            )}
          </div>

          {/* Footer & Checkout Breakdown */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 space-y-4">
              
              {/* Delivery Area Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Delivery Destination
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryArea('INSIDE_DHAKA')}
                    className={\`py-2 px-3 rounded-lg border text-xs font-semibold transition-all \${
                      deliveryArea === 'INSIDE_DHAKA'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600'
                    }\`}
                  >
                    Inside Dhaka (৳60)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryArea('OUTSIDE_DHAKA')}
                    className={\`py-2 px-3 rounded-lg border text-xs font-semibold transition-all \${
                      deliveryArea === 'OUTSIDE_DHAKA'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600'
                    }\`}
                  >
                    Outside Dhaka (৳120)
                  </button>
                </div>
              </div>

              {/* Coupon Applicator */}
              <div>
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
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo code (e.g. EID2026)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 uppercase font-mono focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-slate-900 dark:bg-slate-700 text-white rounded-lg text-xs font-bold"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponMsg && (
                  <p className={\`text-[10px] mt-1 \${couponMsg.error ? 'text-rose-500' : 'text-emerald-600'}\`}>
                    {couponMsg.text}
                  </p>
                )}
              </div>

              {/* Summary Rows */}
              <div className="space-y-1.5 text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal:</span>
                  <span className="font-mono">৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Courier Charge ({deliveryArea === 'INSIDE_DHAKA' ? 'Dhaka' : 'Nationwide'}):</span>
                  <span className="font-mono">৳{deliveryFee}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount:</span>
                    <span className="font-mono">-৳{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>Total Payable:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    ৳{total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg active:scale-95"
              >
                <span>Proceed to Express Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
`;

export const NEXT_HOME_PAGE_CODE = `// ==============================================================================
// File: src/app/page.tsx
// Next.js 15 App Router - Storefront Homepage with ISR & Dynamic Modules
// ==============================================================================

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Flame, Star, ShoppingBag, ShieldCheck, Truck, CreditCard, RefreshCw } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  titleBn: string;
  slug: string;
  sku: string;
  category: string;
  price: number;
  discountPrice?: number;
  stock: number;
  rating: number;
  reviewCount: number;
  isFlashDeal?: boolean;
  images: string[];
}

// Simulated data fetching (In real app, fetch from Prisma: prisma.product.findMany())
async function getHomepageData() {
  const flashDeals: Product[] = [
    {
      id: 'prod-001',
      title: 'Heritage Embroidered Silk Panjabi - Royal Navy',
      titleBn: 'হেরিটেজ এমব্রয়ডারি সিল্ক পাঞ্জাবি - রয়্যাল নেভি',
      slug: 'heritage-embroidered-silk-panjabi-royal-navy',
      sku: 'PAN-HER-01',
      category: "Men's Fashion",
      price: 3850,
      discountPrice: 2950,
      stock: 14,
      rating: 4.9,
      reviewCount: 42,
      isFlashDeal: true,
      images: ['https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=800&q=80'],
    },
    {
      id: 'prod-002',
      title: 'AcousticPulse Pro Active Noise Cancelling Earbuds',
      titleBn: 'অ্যাকোস্টিকপালস প্রো এএনসি ওয়্যারলেস এয়ারবাডস',
      slug: 'acousticpulse-pro-anc-earbuds',
      sku: 'TECH-ANC-02',
      category: 'Tech Gadgets',
      price: 4500,
      discountPrice: 3499,
      stock: 28,
      rating: 4.8,
      reviewCount: 89,
      isFlashDeal: true,
      images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80'],
    },
  ];

  const featuredCategories = [
    { name: "Men's Fashion & Panjabi", nameBn: 'পুরুষদের ফ্যাশন', slug: 'mens-fashion', count: 48, image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80' },
    { name: "Women's Jamdani Sarees", nameBn: 'ঐতিহ্যবাহী জামদানি', slug: 'womens-wear', count: 64, image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80' },
    { name: 'Tech & Smart Gadgets', nameBn: 'স্মার্ট ইলেকট্রনিক্স', slug: 'tech-gadgets', count: 32, image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80' },
    { name: 'Genuine Leather Footwear', nameBn: 'আসল লেদার জুতো', slug: 'leather-footwear', count: 29, image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80' },
  ];

  return { flashDeals, featuredCategories };
}

export default async function HomePage() {
  const { flashDeals, featuredCategories } = await getHomepageData();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      
      {/* 1. HERO CAMPAIGN BANNER */}
      <section className="relative overflow-hidden bg-slate-950 text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span>🇧🇩 Eid Ul-Fitr 2026 Collection</span>
              <span>·</span>
              <span>Up to 30% Off</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Heritage Silk & Premium Crafted Fashion
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-lg leading-relaxed">
              Exquisite handloom resham needlework tailored for festive celebrations across Bangladesh. Nationwide 24-48 hour courier delivery.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/products/heritage-embroidered-silk-panjabi-royal-navy"
                className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
              >
                <span>Shop Festive Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <span className="text-xs text-slate-400">
                Steadfast 24h Express · bKash & COD
              </span>
            </div>
          </div>

          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
            <img
              src="https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=1200&q=80"
              alt="Hero Silk Panjabi"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITIONS BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-md flex items-center gap-3">
            <Truck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold">24-48h Delivery</h4>
              <p className="text-[11px] text-slate-400">Steadfast & Pathao Hubs</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-md flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-sky-500 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold">bKash, Nagad & COD</h4>
              <p className="text-[11px] text-slate-400">Instant Tokenized MFS</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-md flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-500 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold">100% Genuine Quality</h4>
              <p className="text-[11px] text-slate-400">Artisan Certified Handloom</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-md flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold">7-Day Easy Returns</h4>
              <p className="text-[11px] text-slate-400">Doorstep Replacement</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FLASH DEALS WITH DIGITAL TIMER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-8 border-b border-slate-200 dark:border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500 fill-rose-500" />
              <h2 className="text-2xl font-black tracking-tight">Flash Deals</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">Limited stock deals dispatching within 24 hours.</p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-mono font-bold">
            <span className="text-slate-400">Ends in:</span>
            <span className="text-amber-400">11h : 42m : 38s</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {flashDeals.map((prod) => (
            <div
              key={prod.id}
              className="group bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all"
            >
              <div className="relative aspect-square bg-slate-100 dark:bg-slate-900">
                <img
                  src={prod.images[0]}
                  alt={prod.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 left-2.5 bg-rose-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow">
                  SAVE ৳{prod.price - (prod.discountPrice || prod.price)}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mb-1">
                    <span>{prod.category}</span>
                    <span>·</span>
                    <span>{prod.sku}</span>
                  </div>
                  <Link
                    href={\`/products/\${prod.slug}\`}
                    className="font-bold text-sm line-clamp-2 hover:text-emerald-600 transition-colors"
                  >
                    {prod.title}
                  </Link>
                  <div className="flex items-center gap-1 text-amber-400 mt-2">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{prod.rating}</span>
                    <span className="text-[11px] text-slate-400">({prod.reviewCount})</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-bold font-mono">
                        ৳{(prod.discountPrice || prod.price).toLocaleString()}
                      </span>
                      {prod.discountPrice && (
                        <span className="text-xs line-through text-slate-400 font-mono">
                          ৳{prod.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={\`/products/\${prod.slug}\`}
                    className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors"
                    title="View details"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FEATURED CATEGORIES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-2xl font-black tracking-tight mb-6">Explore Collections</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featuredCategories.map((c) => (
            <Link
              key={c.slug}
              href={\`/categories/\${c.slug}\`}
              className="group relative h-48 rounded-2xl overflow-hidden p-4 flex flex-col justify-end text-white border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <img
                src={c.image}
                alt={c.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="relative z-10">
                <h3 className="font-bold text-sm leading-snug">{c.name}</h3>
                <span className="text-xs text-slate-300 font-mono">{c.count} items</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
`;

export const NEXT_PDP_PAGE_CODE = `// ==============================================================================
// File: src/app/products/[slug]/page.tsx
// Next.js 15 App Router - Product Detail Page with Dynamic Server Rendering
// ==============================================================================

import React from 'react';
import { notFound } from 'next/navigation';
import { ProductDetailClient } from './ProductDetailClient';

interface ProductVariant {
  id: string;
  sku: string;
  size?: string;
  color?: string;
  colorHex?: string;
  weight?: string;
  additionalPrice: number;
  stock: number;
}

interface Product {
  id: string;
  title: string;
  titleBn: string;
  slug: string;
  sku: string;
  category: string;
  categoryBn: string;
  price: number;
  discountPrice?: number;
  stock: number;
  rating: number;
  reviewCount: number;
  description: string;
  descriptionBn: string;
  images: string[];
  variants: ProductVariant[];
  features?: string[];
  specifications?: Record<string, string>;
}

// Simulated data fetching by slug
async function getProductBySlug(slug: string): Promise<Product | null> {
  // In production: return await prisma.product.findUnique({ where: { slug }, include: { variants: true } });
  if (slug === 'heritage-embroidered-silk-panjabi-royal-navy') {
    return {
      id: 'prod-001',
      title: 'Heritage Embroidered Silk Panjabi - Royal Navy',
      titleBn: 'হেরিটেজ এমব্রয়ডারি সিল্ক পাঞ্জাবি - রয়্যাল নেভি',
      slug,
      sku: 'PAN-HER-01',
      category: "Men's Fashion & Panjabi",
      categoryBn: 'পুরুষদের ফ্যাশন ও প্রিমিয়াম পাঞ্জাবি',
      price: 3850,
      discountPrice: 2950,
      stock: 14,
      rating: 4.9,
      reviewCount: 42,
      description: 'Crafted from pure handloom silk with intricate collar and placket geometric embroidery. Lightweight, breathable, and designed for festive Eid, weddings, and cultural celebrations in Bangladesh.',
      descriptionBn: 'প্রিমিয়াম হ্যান্ডলুম সিল্কের তৈরি দৃষ্টিনন্দন জ্যামিতিক কারুকাজ করা কলার ও প্ল্যাকেট। উৎসব, বিয়ে বা ঈদের জন্য বিশেষ মানানসই ও অত্যন্ত আরামদায়ক।',
      images: [
        'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { id: 'v-001-38', sku: 'PAN-HER-01-38', size: '38 (M)', color: 'Royal Navy', colorHex: '#1e293b', additionalPrice: 0, stock: 4 },
        { id: 'v-001-40', sku: 'PAN-HER-01-40', size: '40 (L)', color: 'Royal Navy', colorHex: '#1e293b', additionalPrice: 0, stock: 6 },
        { id: 'v-001-42', sku: 'PAN-HER-01-42', size: '42 (XL)', color: 'Royal Navy', colorHex: '#1e293b', additionalPrice: 100, stock: 3 },
      ],
      features: ['100% Handloom Blended Silk', 'Intricate Resham Thread Embroidery', 'Snap-button placket with engraved rivets'],
      specifications: {
        Fabric: 'Blended Silk Handloom',
        Fit: 'Slim / Regular Tailored',
        Care: 'Dry Clean Recommended',
        Origin: 'Pabna Heritage Handloom, Bangladesh',
      },
    };
  }
  return null;
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <ProductDetailClient product={product} />
    </div>
  );
}
`;

export const NEXT_PDP_CLIENT_CODE = `// ==============================================================================
// File: src/app/products/[slug]/ProductDetailClient.tsx
// Interactive Client Component: Zoom Lens, Variant Matrix, Size Chart & Cart
// ==============================================================================

'use client';

import React, { useState } from 'react';
import { Star, Check, Truck, Shield, Ruler, ShoppingBag, Zap, Heart, Share2, X } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

export const ProductDetailClient: React.FC<{ product: any }> = ({ product }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');

  const { addItem, setIsOpen } = useCartStore();

  const currentPrice = (product.discountPrice ?? product.price) + (selectedVariant?.additionalPrice ?? 0);
  const originalPrice = product.price + (selectedVariant?.additionalPrice ?? 0);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      title: product.title,
      slug: product.slug,
      sku: selectedVariant?.sku || product.sku,
      image: product.images[0],
      unitPrice: currentPrice,
      quantity,
      selectedSize: selectedVariant?.size,
      selectedColor: selectedVariant?.color,
      selectedColorHex: selectedVariant?.colorHex,
      maxStock: selectedVariant?.stock || product.stock,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setIsOpen(true);
  };

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Gallery & Zoom */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group">
            <img
              src={product.images[activeImageIndex]}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125 cursor-zoom-in"
            />
            <span className="absolute bottom-3 right-3 text-[11px] bg-slate-950/70 text-white px-2 py-1 rounded backdrop-blur-sm pointer-events-none">
              Hover to zoom
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1">
            {product.images.map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={\`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all \${
                  idx === activeImageIndex
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                }\`}
              >
                <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Information & Purchase Controls */}
        <div className="flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-1">
                {product.category} · SKU: {selectedVariant?.sku}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {product.title}
              </h1>

              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{product.rating}</span>
                </div>
                <span className="text-xs text-slate-400">({product.reviewCount} customer reviews)</span>
                <span>·</span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  In Stock ({selectedVariant?.stock} units available)
                </span>
              </div>
            </div>

            {/* Price Strip */}
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-baseline gap-3">
              <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
                ৳{currentPrice.toLocaleString()}
              </span>
              {product.discountPrice && (
                <span className="text-sm line-through text-slate-400 font-mono">
                  ৳{originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Variant Selector: Sizes */}
            {product.variants.some((v: any) => v.size) && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Select Size
                  </label>
                  <button
                    onClick={() => setIsSizeChartOpen(true)}
                    className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    Size Guide
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v: any) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={\`px-4 py-2 rounded-xl text-xs font-bold border transition-all \${
                        selectedVariant?.id === v.id
                          ? 'border-emerald-500 bg-emerald-500 text-white shadow-md'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                      }\`}
                    >
                      {v.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-wider">Quantity:</span>
              <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  -
                </button>
                <span className="px-4 py-1 text-sm font-bold font-mono">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                className="py-3.5 px-4 rounded-xl border border-slate-900 dark:border-white font-bold text-sm hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Buy Now</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-500" />
                <span>Dhaka 24-48h Delivery (৳60)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>bKash & COD Verified</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Size Chart Modal */}
      {isSizeChartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Ruler className="w-4 h-4 text-emerald-500" />
                Panjabi & Shirt Size Guide (Inches)
              </h3>
              <button onClick={() => setIsSizeChartOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b font-bold bg-slate-50 dark:bg-slate-800">
                  <th className="p-2">Size</th>
                  <th className="p-2">Chest</th>
                  <th className="p-2">Length</th>
                  <th className="p-2">Shoulder</th>
                </tr>
              </thead>
              <tbody className="divide-y font-mono">
                <tr><td className="p-2 font-bold">38 (M)</td><td className="p-2">40"</td><td className="p-2">40"</td><td className="p-2">17.5"</td></tr>
                <tr><td className="p-2 font-bold">40 (L)</td><td className="p-2">42"</td><td className="p-2">42"</td><td className="p-2">18.5"</td></tr>
                <tr><td className="p-2 font-bold">42 (XL)</td><td className="p-2">44"</td><td className="p-2">44"</td><td className="p-2">19.5"</td></tr>
              </tbody>
            </table>
            <button
              onClick={() => setIsSizeChartOpen(false)}
              className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-bold"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
`;
