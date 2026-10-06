import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Truck, ShieldCheck, CreditCard, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

const slides = [
  {
    id: 1,
    tag: 'EID UL-FITR 2026 COLLECTION',
    tagBn: 'ঈদ উল-ফিতর ২০২৬ বিশেষ কালেকশন',
    title: 'Pure Handloom Silk & Royal Heritage Panjabi',
    titleBn: 'খাঁটি হ্যান্ডলুম সিল্ক ও প্রিমিয়াম রয়্যাল পাঞ্জাবি',
    subtitle: 'Exquisite resham needlework tailored for festive occasions across Bangladesh.',
    subtitleBn: 'উৎসবের আনন্দ বাড়িয়ে তুলতে সূক্ষ্ম রেশম কারুকাজে তৈরি খাঁটি সিল্ক পাঞ্জাবি।',
    image: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=1400&q=80',
    cta: 'Explore Festive Wear',
    ctaBn: 'কালেকশন দেখুন',
    discount: 'Up to 30% Off'
  },
  {
    id: 2,
    tag: 'FLAGSHIP AUDIO & WEARABLES',
    tagBn: 'স্মার্ট অডিও ও ট্রাভেল গ্যাজেটস',
    title: 'AcousticPulse Pro Active Noise Cancelling',
    titleBn: 'অ্যাকোস্টিকপালস প্রো এএনসি ওয়্যারলেস ইয়ারবাডস',
    subtitle: 'Immerse in studio fidelity audio with 35dB hybrid ANC and 38-hour battery.',
    subtitleBn: '৩৫ ডেসিবেল হাইব্রিড অ্যাক্টিভ নয়েজ ক্যান্সেলেশন ও শক্তিশালী ৩৮ ঘণ্টার প্লেটাইম।',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1400&q=80',
    cta: 'Discover Tech Deals',
    ctaBn: 'গ্যাজেট কিনুন',
    discount: 'Instant ৳1,000 Off'
  },
  {
    id: 3,
    tag: 'TRADITIONAL WEAVING ART',
    tagBn: 'ঐতিহ্যবাহী জামদানি শিল্প',
    title: 'Authentic 84-Count Rupganj Jamdani Sarees',
    titleBn: 'রূপগঞ্জের খাঁটি ৮৪ কাউন্ট ঐতিহ্যবাহী জামদানি শাড়ি',
    subtitle: 'Certified artisan crafted fine cotton with rich gold zari woven borders.',
    subtitleBn: 'দক্ষ তাঁতিদের নিখুঁত হাতে বোনা সুতি ও সোনালী জরির অনবদ্য মেলবন্ধন।',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1400&q=80',
    cta: 'Shop Traditional Sarees',
    ctaBn: 'শাড়ি কালেকশন দেখুন',
    discount: 'Handcrafted Heritage'
  }
];

export const HeroSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { language, products, openProductDetail } = useApp();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[currentSlide];

  return (
    <div className="relative mb-12">
      {/* Main Banner Slider Container */}
      <div className="relative h-[440px] sm:h-[480px] w-full overflow-hidden rounded-2xl bg-slate-950 text-white shadow-xl">
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 transform scale-105"
          style={{ backgroundImage: `url(${slide.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />

        <div className="relative max-w-7xl mx-auto h-full px-6 sm:px-10 flex flex-col justify-center max-w-2xl">
          <div className="text-xs font-semibold tracking-wider text-emerald-400 uppercase mb-3 flex items-center gap-2">
            <span>{language === 'bn' ? slide.tagBn : slide.tag}</span>
            <span>·</span>
            <span className="text-amber-400 font-mono">{slide.discount}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            {language === 'bn' ? slide.titleBn : slide.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 mb-8 leading-relaxed line-clamp-2">
            {language === 'bn' ? slide.subtitleBn : slide.subtitle}
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                const target = products[currentSlide] || products[0];
                openProductDetail(target);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-lg transition-all shadow-lg active:scale-95"
            >
              <span>{language === 'bn' ? slide.ctaBn : slide.cta}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-400">
              {language === 'bn' ? '২৪-৪৮ ঘণ্টায় ডেলিভারি' : 'Steadfast 24h Express'}
            </span>
          </div>
        </div>

        {/* Carousel Prev/Next Arrows */}
        <button
          onClick={() => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full transition-colors backdrop-blur-sm"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full transition-colors backdrop-blur-sm"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentSlide ? 'w-8 bg-emerald-400' : 'w-2 bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Trust & Logistics Proposition Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 shadow-sm">
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              {language === 'bn' ? 'দ্রুততম কুরিয়ার ডেলিভারি' : 'Steadfast & Pathao'}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'bn' ? 'ঢাকায় ২৪-৪৮ ঘণ্টা, সারাদেশে ২-৪ দিন' : 'Dhaka 24-48h, Nationwide 2-4 days'}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 shadow-sm">
          <div className="p-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              {language === 'bn' ? 'বিকাশ, নগদ ও ক্যাশ অন ডেলিভারি' : 'bKash, Nagad & COD'}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'bn' ? 'পণ্য পেয়ে টাকা পরিশোধের সুবিধা' : 'Pay via MFS or cash at doorstep'}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 shadow-sm">
          <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              {language === 'bn' ? '১০০% খাঁটি পণ্য ও গ্যারান্টি' : '100% Genuine Quality'}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'bn' ? 'প্রত্যয়িত কারিগর ও ব্র্যান্ড ওয়ারেন্টি' : 'Direct from certified handlooms & brands'}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 shadow-sm">
          <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              {language === 'bn' ? 'সহজ ৭ দিনের রিটার্ন পলিসি' : '7 Days Easy Returns'}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'bn' ? 'পণ্য পছন্দ না হলে ঝামেলামুক্ত বদল' : 'Hassle-free replacement guarantee'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
