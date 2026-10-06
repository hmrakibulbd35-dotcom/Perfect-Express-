import React from 'react';
import { Truck, ShieldCheck, Phone, Mail, MapPin, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { language, t, categories, setSelectedCategory } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-xs">
      
      {/* Top Value Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <span className="font-bold text-white uppercase tracking-wider block mb-1">
            24-48h Dhaka Delivery
          </span>
          <p className="text-slate-400 text-[11px]">
            Express fulfillment powered by Steadfast Courier automated sorting hubs.
          </p>
        </div>

        <div>
          <span className="font-bold text-white uppercase tracking-wider block mb-1">
            Official bKash & Nagad
          </span>
          <p className="text-slate-400 text-[11px]">
            Direct tokenized checkout with zero transaction fees for customers.
          </p>
        </div>

        <div>
          <span className="font-bold text-white uppercase tracking-wider block mb-1">
            Authentic Bangladeshi Handloom
          </span>
          <p className="text-slate-400 text-[11px]">
            Hand-woven jamdani, silk panjabi, and pure Sundarbans organic harvest.
          </p>
        </div>

        <div>
          <span className="font-bold text-white uppercase tracking-wider block mb-1">
            Customer Support 24/7
          </span>
          <p className="text-slate-400 text-[11px]">
            Hotline: 09612-000000 · WhatsApp: +880 1711-223344
          </p>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-lg">
              B
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              Bazaar<span className="text-emerald-400">Pulse</span>
            </span>
          </div>

          <p className="text-slate-400 text-xs leading-relaxed">
            {language === 'bn'
              ? 'বাংলাদেশের প্রিমিয়াম ই-কমার্স ও দ্রুততম কুরিয়ার ডেলিভারি ইকোসিস্টেম। সেরা পণ্যের নিশ্চিত বিশ্বস্ত ঠিকানা।'
              : 'Enterprise multi-channel commerce platform engineered for high-velocity merchants, automated logistics, and nationwide express fulfillment.'}
          </p>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Gulshan Avenue, Dhaka-1212, Bangladesh</span>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-bold text-white uppercase tracking-wider mb-3">
            {t.featuredCategories}
          </h4>
          <ul className="space-y-2">
            {categories.slice(0, 5).map(cat => (
              <li key={cat.id}>
                <button
                  onClick={() => setSelectedCategory(cat.id)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {language === 'bn' ? cat.nameBn : cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Integrations & Tech */}
        <div>
          <h4 className="font-bold text-white uppercase tracking-wider mb-3">
            Logistics & Gateway APIs
          </h4>
          <ul className="space-y-2 text-slate-400">
            <li>Steadfast Courier B2B API</li>
            <li>Pathao Courier Express</li>
            <li>bKash Tokenized Checkout v1.2</li>
            <li>Nagad Mobile Financial Gateway</li>
            <li>SSLCommerz Host Payment</li>
            <li>PostgreSQL 16 with Prisma ORM</li>
          </ul>
        </div>

        {/* Payment & Courier Badges */}
        <div>
          <h4 className="font-bold text-white uppercase tracking-wider mb-3">
            Supported Payment & Couriers
          </h4>
          <div className="flex flex-wrap gap-2 text-[11px] font-mono font-bold text-slate-300">
            <span className="bg-slate-800 px-2.5 py-1 rounded border border-slate-700">bKash</span>
            <span className="bg-slate-800 px-2.5 py-1 rounded border border-slate-700">Nagad</span>
            <span className="bg-slate-800 px-2.5 py-1 rounded border border-slate-700">COD</span>
            <span className="bg-slate-800 px-2.5 py-1 rounded border border-slate-700">Visa / MC</span>
            <span className="bg-slate-800 px-2.5 py-1 rounded border border-slate-700">Steadfast</span>
            <span className="bg-slate-800 px-2.5 py-1 rounded border border-slate-700">Pathao</span>
          </div>
        </div>

      </div>

      {/* Bottom Legal bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-2">
        <p>© 2026 BazaarPulse Enterprise. All rights reserved.</p>
        <p className="flex items-center gap-1">
          <span>Engineered with React 19, Next.js, Flutter & Prisma ORM</span>
        </p>
      </div>

    </footer>
  );
};
