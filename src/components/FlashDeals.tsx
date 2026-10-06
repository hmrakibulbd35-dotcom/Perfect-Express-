import React, { useState, useEffect } from 'react';
import { Flame, Clock, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';

export const FlashDeals: React.FC = () => {
  const { products, language, t } = useApp();

  // 12 hours countdown state
  const [timeLeft, setTimeLeft] = useState({
    hours: 11,
    minutes: 42,
    seconds: 38
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const flashProducts = products.filter(p => p.isFlashDeal);

  if (flashProducts.length === 0) return null;

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <section className="mb-14">
      {/* Section Header with Countdown Timer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t.flashDeals}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t.flashDealsSub}
          </p>
        </div>

        {/* Ticking Digital Countdown Timer */}
        <div className="flex items-center gap-2 bg-slate-900 dark:bg-slate-800 text-white px-4 py-2 rounded-xl shadow-md border border-slate-700">
          <Clock className="w-4 h-4 text-rose-400" />
          <span className="text-xs font-semibold text-slate-300 mr-1">{t.endsIn}:</span>
          <div className="flex items-center gap-1 font-mono font-bold text-sm">
            <span className="bg-slate-800 dark:bg-slate-700 px-2 py-0.5 rounded text-amber-400">
              {pad(timeLeft.hours)}
            </span>
            <span className="text-slate-400">:</span>
            <span className="bg-slate-800 dark:bg-slate-700 px-2 py-0.5 rounded text-amber-400">
              {pad(timeLeft.minutes)}
            </span>
            <span className="text-slate-400">:</span>
            <span className="bg-slate-800 dark:bg-slate-700 px-2 py-0.5 rounded text-amber-400">
              {pad(timeLeft.seconds)}
            </span>
          </div>
        </div>
      </div>

      {/* Flash Deals Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {flashProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};
