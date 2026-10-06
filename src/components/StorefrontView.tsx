import React from 'react';
import { HeroSlider } from './HeroSlider';
import { FlashDeals } from './FlashDeals';
import { CategoryList } from './CategoryList';
import { ProductCard } from './ProductCard';
import { useApp } from '../context/AppContext';
import { Star, ShieldCheck, Quote, Sparkles } from 'lucide-react';

export const StorefrontView: React.FC = () => {
  const { products, selectedCategory, categories, language, t } = useApp();

  const activeCategoryObj = selectedCategory ? categories.find(c => c.id === selectedCategory) : null;

  const catalogProducts = selectedCategory
    ? products.filter(p => p.category === activeCategoryObj?.name)
    : products;

  const testimonials = [
    {
      id: 1,
      name: 'Dr. Mahfuzur Rahman',
      city: 'Dhanmondi, Dhaka',
      rating: 5,
      comment: 'Ordered the Heritage Silk Panjabi for my brother’s wedding. Arrived within 24 hours via Steadfast in pristine condition with authentic packaging. The needlework is world class.',
      commentBn: 'আমার ভাইয়ের বিয়ের জন্য সিল্ক পাঞ্জাবিটি নিয়েছিলাম। স্টিডফাস্ট কুরিয়ারে ২৪ ঘণ্টার মধ্যে পেয়েছি। কাপড়ের মান ও কলারের কাজ সত্যি অনবদ্য।'
    },
    {
      id: 2,
      name: 'Sabrina Mostafa',
      city: 'Agrabad, Chattogram',
      rating: 5,
      comment: 'The 84-count Jamdani saree exceeded my expectations. Pure cotton feel and genuine handloom certificate included. Seamless bKash payment with instant SMS confirmation.',
      commentBn: 'খাঁটি ৮৪ কাউন্ট জামদানি শাড়িটা হাতে পেয়ে মুগ্ধ হয়েছি। ব্লাউজ পিস সহ নিখুঁত প্যাকেজিং। বিকাশ পেমেন্ট ও এসএমএস কনফার্মেশন খুব সহজ ছিল।'
    },
    {
      id: 3,
      name: 'Tanvir Hossain',
      city: 'Uttara, Dhaka',
      rating: 5,
      comment: 'AcousticPulse Pro earbuds have active noise cancellation that truly isolates Metro Rail noise. Delivery rider called before arriving. Very impressed with BazaarPulse.',
      commentBn: 'মেট্রোরেলে চলার সময় এএনসি দারুণ কাজ করে। ডেলিভারি রাইডার আগে ফোন দিয়ে সঠিক সময়ে পার্সেল দিয়েছেন। সার্ভিস নিয়ে খুব সন্তুষ্ট।'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* 1. Hero Carousel & Logistics USP */}
      <HeroSlider />

      {/* 2. Flash Deals with Live Countdown Timer */}
      <FlashDeals />

      {/* 3. Featured Categories Showcase */}
      <CategoryList />

      {/* 4. Main Product Catalog & Best Sellers */}
      <section className="mb-14">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-slate-800 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {activeCategoryObj
                  ? (language === 'bn' ? activeCategoryObj.nameBn : activeCategoryObj.name)
                  : t.bestSellers}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {activeCategoryObj
                ? `Showing ${catalogProducts.length} items in this category`
                : t.bestSellersSub}
            </p>
          </div>

          <span className="text-xs font-mono font-semibold text-slate-400">
            {catalogProducts.length} {t.items} available
          </span>
        </div>

        {catalogProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {catalogProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400 text-xs">
            No products found matching your current filter.
          </div>
        )}
      </section>

      {/* 5. Customer Testimonials */}
      <section className="mb-14 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t.customerTestimonials}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t.testimonialsSub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(item => (
            <div
              key={item.id}
              className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  "{language === 'bn' ? item.commentBn : item.comment}"
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {item.name}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {item.city}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Buyer</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
