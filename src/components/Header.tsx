import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  Moon,
  Sun,
  Languages,
  Layers,
  Smartphone,
  ShieldCheck,
  Store,
  ChevronDown,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const {
    activeMode,
    setActiveMode,
    theme,
    toggleTheme,
    language,
    toggleLanguage,
    t,
    cartCount,
    wishlist,
    setIsCartDrawerOpen,
    searchQuery,
    setSearchQuery,
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    openProductDetail
  } = useApp();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);

  // Close search suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setIsCatDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = searchQuery.trim()
    ? products.filter(
        p =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.titleBn.includes(searchQuery) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Top Announcement Bar */}
      <div className="bg-slate-900 text-white dark:bg-slate-950 text-xs py-1.5 px-4 text-center flex items-center justify-between border-b border-slate-800">
        <div className="hidden sm:flex items-center gap-3 text-slate-300 font-medium">
          <span>⚡ Express Courier Dispatch: Steadfast & Pathao nationwide</span>
          <span>·</span>
          <span>🇧🇩 Official bKash, Nagad & COD Available</span>
        </div>
        <div className="flex items-center gap-4 mx-auto sm:mx-0 font-medium text-slate-300">
          <span>{language === 'bn' ? 'কুপন কোড:' : 'Promo Code:'} <span className="font-mono text-emerald-400 font-bold">EID2026</span> ({language === 'bn' ? '১৫% ছাড়' : '15% Off'})</span>
          <span>·</span>
          <span className="text-slate-400">Dhaka: 24-48 hrs</span>
        </div>
      </div>

      {/* Main Nav Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                setActiveMode('storefront');
                setSelectedCategory(null);
                setSearchQuery('');
              }}
              className="flex items-center gap-2 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-emerald-500 text-white flex items-center justify-center font-black text-xl shadow-md group-hover:scale-105 transition-transform">
                B
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  Bazaar<span className="text-emerald-600 dark:text-emerald-400">Pulse</span>
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold hidden md:block">
                  Enterprise E-Commerce
                </p>
              </div>
            </button>

            {/* Category Dropdown */}
            <div className="relative hidden lg:block" ref={catRef}>
              <button
                onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span>{selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : t.allCategories}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isCatDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCatDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50">
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setIsCatDropdownOpen(false);
                      setActiveMode('storefront');
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      selectedCategory === null
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-semibold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    {t.allCategories}
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setIsCatDropdownOpen(false);
                        setActiveMode('storefront');
                      }}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-colors ${
                        selectedCategory === cat.id
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-semibold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <span>{language === 'bn' ? cat.nameBn : cat.name}</span>
                      <span className="text-xs text-slate-400 font-mono">{cat.itemCount}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search Bar with Auto-Suggestions */}
          <div className="flex-1 max-w-xl relative" ref={searchRef}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder={t.searchPlaceholder}
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 pl-10 pr-10 py-2 text-sm rounded-lg border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Suggestions Dropdown */}
            {isSearchFocused && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 max-h-96 overflow-y-auto">
                {searchResults.length > 0 ? (
                  <div>
                    <div className="p-2 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                      {searchResults.length} {searchResults.length === 1 ? 'Product Found' : 'Products Found'}
                    </div>
                    {searchResults.map(prod => (
                      <button
                        key={prod.id}
                        onClick={() => {
                          openProductDetail(prod);
                          setIsSearchFocused(false);
                        }}
                        className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-3 border-b border-slate-100 dark:border-slate-700/50 last:border-none transition-colors"
                      >
                        <img
                          src={prod.images[0]}
                          alt={prod.title}
                          className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {language === 'bn' ? prod.titleBn : prod.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            <span>{language === 'bn' ? prod.categoryBn : prod.category}</span>
                            <span>·</span>
                            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                              ৳{prod.discountPrice ?? prod.price}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    No products matched "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Navigation & Utility Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switch */}
            <button
              onClick={toggleLanguage}
              title="Toggle Language (English / বাংলা)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
            >
              <Languages className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{language === 'en' ? 'বাংলা' : 'EN'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title="Toggle Light / Dark Mode"
              className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => {
                setActiveMode('storefront');
                if (wishlist.length > 0) {
                  const firstFav = products.find(p => wishlist.includes(p.id));
                  if (firstFav) openProductDetail(firstFav);
                }
              }}
              title="Wishlist"
              className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative"
            >
              <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              title="Cart Drawer"
              className="flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-lg transition-all shadow-sm active:scale-95"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold hidden sm:inline">{t.cart}</span>
            </button>
          </div>
        </div>

        {/* Global Module Mode Selector Switcher */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 py-2 overflow-x-auto no-scrollbar text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveMode('storefront')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                activeMode === 'storefront'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>{t.storefront}</span>
            </button>

            <button
              onClick={() => setActiveMode('mobile-sim')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                activeMode === 'mobile-sim'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-sky-500" />
              <span>{t.mobileApp}</span>
            </button>

            <button
              onClick={() => setActiveMode('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                activeMode === 'admin'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t.adminPanel}</span>
            </button>

            <button
              onClick={() => setActiveMode('architecture')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                activeMode === 'architecture'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>{t.architecture}</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-3 text-slate-500 dark:text-slate-400 text-[11px]">
            <span>PostgreSQL · Prisma 6</span>
            <span>·</span>
            <span>Steadfast & Pathao Courier APIs</span>
            <span>·</span>
            <span>bKash Tokenized Checkout</span>
          </div>
        </div>
      </div>
    </header>
  );
};
