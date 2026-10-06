import React from 'react';
import { Eye, Heart, ShoppingBag, Star } from 'lucide-react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { language, t, addToCart, isInWishlist, toggleWishlist, openProductDetail } = useApp();

  const isFav = isInWishlist(product.id);
  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const currentPrice = product.discountPrice ?? product.price;

  return (
    <div className="group relative bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:shadow-lg">
      
      {/* Product Image Area */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-900 cursor-pointer" onClick={() => openProductDetail(product)}>
        <img
          src={product.images[0]}
          alt={product.title}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Quiet Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {discountPercent > 0 && (
            <span className="bg-rose-600 text-white font-mono font-bold text-[11px] px-2 py-0.5 rounded shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {product.isFlashDeal && (
            <span className="bg-amber-500 text-slate-950 font-bold text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm">
              Flash Deal
            </span>
          )}
        </div>

        {/* Favorite & Quick View Floating Action Bar */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            title="Add to Wishlist"
            className={`p-2 rounded-full backdrop-blur-md transition-colors shadow-sm ${
              isFav
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/80'
                : 'bg-white/90 text-slate-700 hover:bg-white dark:bg-slate-900/80 dark:text-slate-200'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              openProductDetail(product);
            }}
            title="Quick View"
            className="p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 dark:bg-slate-900/80 dark:text-slate-200 backdrop-blur-md transition-colors shadow-sm"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Card Content & Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Unboxed Metadata (Category & SKU) */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1">
            <span>{language === 'bn' ? product.categoryBn : product.category}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{product.sku}</span>
          </div>

          {/* Title */}
          <h3
            onClick={() => openProductDetail(product)}
            className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-2 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors leading-snug"
          >
            {language === 'bn' ? product.titleBn : product.title}
          </h3>

          {/* Rating & Review Counter */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-[11px] text-slate-400">
              ({product.reviewCount})
            </span>
          </div>

          {/* Color swatches if any */}
          {product.variants.some(v => v.colorHex) && (
            <div className="flex items-center gap-1.5 mt-3">
              {product.variants
                .filter(v => v.colorHex)
                .slice(0, 4)
                .map((variant) => (
                  <span
                    key={variant.id}
                    title={variant.color}
                    className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600"
                    style={{ backgroundColor: variant.colorHex }}
                  />
                ))}
            </div>
          )}
        </div>

        {/* Pricing & Add to Cart Action */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
                ৳{currentPrice.toLocaleString()}
              </span>
              {product.discountPrice && (
                <span className="text-xs line-through text-slate-400 font-mono">
                  ৳{product.price.toLocaleString()}
                </span>
              )}
            </div>
            {product.stock <= 5 && product.stock > 0 && (
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                {language === 'bn' ? `মাত্র ${product.stock} টি বাকি` : `Only ${product.stock} left`}
              </span>
            )}
          </div>

          <button
            onClick={() => addToCart(product)}
            className="flex items-center gap-1 px-3 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors active:scale-95 shadow-sm"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{t.addToCart}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
