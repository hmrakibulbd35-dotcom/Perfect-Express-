import React from 'react';
import { useApp } from '../context/AppContext';

export const CategoryList: React.FC = () => {
  const { categories, selectedCategory, setSelectedCategory, language, t } = useApp();

  return (
    <section className="mb-14">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t.featuredCategories}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'bn' ? 'আমাদের জনপ্রিয় পণ্য ক্যাটাগরিগুলো ঘুরে দেখুন' : 'Explore handpicked artisan & tech collections'}
          </p>
        </div>

        {selectedCategory && (
          <button
            onClick={() => setSelectedCategory(null)}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            {language === 'bn' ? 'সব দেখুন' : 'Clear Filter'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map(category => {
          const isSelected = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(isSelected ? null : category.id)}
              className={`group text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between h-44 overflow-hidden relative ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
              }`}
            >
              <div className="relative w-full h-24 rounded-lg overflow-hidden mb-2 bg-slate-100 dark:bg-slate-900">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              <div>
                <h3 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {language === 'bn' ? category.nameBn : category.name}
                </h3>
                <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                  {category.itemCount} {t.items}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
