import React, { useState } from 'react';
import {
  X,
  Star,
  Check,
  Truck,
  Shield,
  Ruler,
  ShoppingBag,
  Zap,
  Camera,
  Heart,
  Share2
} from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { useApp } from '../context/AppContext';

export const ProductDetailModal: React.FC = () => {
  const {
    detailProduct,
    closeProductDetail,
    language,
    t,
    addToCart,
    openCheckout,
    isInWishlist,
    toggleWishlist,
    products,
    reviews,
    addReview,
    showToast
  } = useApp();

  if (!detailProduct) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    detailProduct.variants[0] || null
  );
  const [quantity, setQuantity] = useState(1);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');

  // Review submission state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewPhoto, setReviewPhoto] = useState('');

  const currentPrice =
    (detailProduct.discountPrice ?? detailProduct.price) + (selectedVariant?.additionalPrice ?? 0);
  const originalPrice = detailProduct.price + (selectedVariant?.additionalPrice ?? 0);
  const isFav = isInWishlist(detailProduct.id);

  const productReviews = reviews.filter(r => r.productId === detailProduct.id);
  const relatedProducts = products
    .filter(p => p.id !== detailProduct.id && p.category === detailProduct.category)
    .slice(0, 3);

  const handleAddToCart = () => {
    addToCart(detailProduct, selectedVariant?.id, quantity);
  };

  const handleBuyNow = () => {
    addToCart(detailProduct, selectedVariant?.id, quantity);
    closeProductDetail();
    openCheckout();
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      showToast('Please provide your name and review message', 'error');
      return;
    }
    addReview({
      productId: detailProduct.id,
      userName: reviewName.trim(),
      rating: reviewRating,
      comment: reviewComment.trim(),
      reviewImage: reviewPhoto ? reviewPhoto : undefined
    });
    setReviewName('');
    setReviewComment('');
    setReviewPhoto('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Top Header bar with Close Button */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>{language === 'bn' ? detailProduct.categoryBn : detailProduct.category}</span>
            <span>·</span>
            <span className="font-mono">SKU: {selectedVariant?.sku ?? detailProduct.sku}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                showToast(language === 'bn' ? 'লিঙ্ক কপি করা হয়েছে!' : 'Product link copied!');
              }}
              title="Share"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => toggleWishlist(detailProduct.id)}
              className={`p-2 rounded-lg transition-colors ${
                isFav
                  ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/50'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
            </button>
            <button
              onClick={closeProductDetail}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-6 flex-1 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left: Gallery & Zoom Lens */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 group">
                <img
                  src={detailProduct.images[activeImageIndex]}
                  alt={detailProduct.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125 cursor-zoom-in"
                />
                <span className="absolute bottom-3 right-3 text-[11px] bg-slate-950/70 text-white px-2 py-1 rounded backdrop-blur-sm pointer-events-none">
                  Hover to zoom
                </span>
              </div>

              {/* Thumbnails */}
              {detailProduct.images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {detailProduct.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                        idx === activeImageIndex
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info, Price, Variants & Actions */}
            <div className="flex flex-col justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
                  {language === 'bn' ? detailProduct.titleBn : detailProduct.title}
                </h1>

                {/* Rating & Stock Status */}
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {detailProduct.rating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    ({productReviews.length} {t.customerReviews})
                  </span>
                  <span>·</span>
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {t.inStock} ({selectedVariant?.stock ?? detailProduct.stock} units available)
                    </span>
                  </div>
                </div>

                {/* Price Display */}
                <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
                    ৳{currentPrice.toLocaleString()}
                  </span>
                  {detailProduct.discountPrice && (
                    <span className="text-sm line-through text-slate-400 font-mono">
                      ৳{originalPrice.toLocaleString()}
                    </span>
                  )}
                  {detailProduct.discountPrice && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Save ৳{(originalPrice - currentPrice).toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Variant Selectors: Sizes */}
                {detailProduct.variants.some(v => v.size) && (
                  <div className="mt-5">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        {t.selectSize}
                      </label>
                      <button
                        onClick={() => setIsSizeChartOpen(true)}
                        className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <Ruler className="w-3.5 h-3.5" />
                        <span>{t.sizeChart}</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {detailProduct.variants
                        .filter(v => v.size)
                        .map(variant => {
                          const isSelected = selectedVariant?.id === variant.id;
                          return (
                            <button
                              key={variant.id}
                              onClick={() => setSelectedVariant(variant)}
                              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                isSelected
                                  ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm'
                                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                              }`}
                            >
                              {variant.size}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Variant Selectors: Colors */}
                {detailProduct.variants.some(v => v.color) && (
                  <div className="mt-5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block mb-2">
                      {t.selectColor}: <span className="font-normal text-slate-500">{selectedVariant?.color}</span>
                    </label>

                    <div className="flex items-center gap-2.5">
                      {detailProduct.variants
                        .filter(v => v.color)
                        .map(variant => {
                          const isSelected = selectedVariant?.id === variant.id;
                          return (
                            <button
                              key={variant.id}
                              onClick={() => setSelectedVariant(variant)}
                              className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                                isSelected
                                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 scale-110'
                                  : 'border-slate-300 dark:border-slate-600 opacity-80 hover:opacity-100'
                              }`}
                              style={{ backgroundColor: variant.colorHex || '#1e293b' }}
                              title={variant.color}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Quantity Chooser */}
                <div className="mt-6 flex items-center gap-4">
                  <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-sm font-bold text-slate-900 dark:text-white font-mono">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-1.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-xs text-slate-500">
                    {language === 'bn' ? 'সর্বোচ্চ ১০টি একসাথে অর্ডারযোগ্য' : 'Max 10 per order'}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Add to Cart & Buy Now */}
              <div className="mt-8 space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-900 dark:border-white text-slate-900 dark:text-white hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 font-bold text-sm transition-all shadow-sm active:scale-95"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{t.addToCart}</span>
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg active:scale-95"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    <span>{t.buyNow}</span>
                  </button>
                </div>

                {/* Delivery Information Box */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-500" />
                    <span>{language === 'bn' ? 'ঢাকায় ডেলিভারি: ৬০৳ (২৪ ঘণ্টা)' : 'Dhaka Delivery: ৳60 (24h)'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <span>{language === 'bn' ? 'বিকাশ ও সিওডি অনুমোদিত' : 'bKash & COD Verified'}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Tabs: Description, Specs, Customer Reviews */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 text-sm">
              <button
                onClick={() => setActiveTab('desc')}
                className={`pb-2.5 font-bold transition-colors ${
                  activeTab === 'desc'
                    ? 'border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.productDescription}
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`pb-2.5 font-bold transition-colors ${
                  activeTab === 'specs'
                    ? 'border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {language === 'bn' ? 'বৈশিষ্ট্য ও স্পেসিফিকেশন' : 'Specifications & Features'}
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-2.5 font-bold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'reviews'
                    ? 'border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{t.customerReviews}</span>
                <span className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full font-mono">
                  {productReviews.length}
                </span>
              </button>
            </div>

            {/* Tab 1: Description */}
            {activeTab === 'desc' && (
              <div className="pt-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-4">
                <p>{language === 'bn' ? detailProduct.descriptionBn : detailProduct.description}</p>
                {detailProduct.features && (
                  <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    {(language === 'bn' && detailProduct.featuresBn ? detailProduct.featuresBn : detailProduct.features).map((feat, idx) => (
                      <li key={idx}>{feat}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Tab 2: Specifications */}
            {activeTab === 'specs' && (
              <div className="pt-4">
                {detailProduct.specifications ? (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-w-xl text-xs">
                    {Object.entries(detailProduct.specifications).map(([key, val]) => (
                      <div key={key} className="py-2.5 flex justify-between">
                        <span className="font-semibold text-slate-500 dark:text-slate-400">{key}</span>
                        <span className="font-medium text-slate-900 dark:text-white">{val}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Standard specifications apply.</p>
                )}
              </div>
            )}

            {/* Tab 3: Customer Reviews */}
            {activeTab === 'reviews' && (
              <div className="pt-4 space-y-6">
                {/* Review Form */}
                <form
                  onSubmit={handleReviewSubmit}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3"
                >
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {t.writeReview}
                  </h4>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{t.yourRating}:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              star <= reviewRating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-300 dark:text-slate-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder={language === 'bn' ? 'আপনার নাম' : 'Your Name'}
                      value={reviewName}
                      onChange={e => setReviewName(e.target.value)}
                      className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder={t.attachPhoto + ' (URL)'}
                        value={reviewPhoto}
                        onChange={e => setReviewPhoto(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                      <Camera className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    placeholder={t.yourComment}
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />

                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 dark:bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    {t.submitReview}
                  </button>
                </form>

                {/* Reviews List */}
                <div className="space-y-4">
                  {productReviews.length > 0 ? (
                    productReviews.map(rev => (
                      <div
                        key={rev.id}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {rev.userAvatar ? (
                              <img
                                src={rev.userAvatar}
                                alt={rev.userName}
                                className="w-7 h-7 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs">
                                {rev.userName[0]}
                              </div>
                            )}
                            <div>
                              <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                                {rev.userName}
                              </h5>
                              <span className="text-[10px] text-slate-400">{rev.date}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-amber-400">
                            {[...Array(rev.rating)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          {language === 'bn' && rev.commentBn ? rev.commentBn : rev.comment}
                        </p>

                        {rev.reviewImage && (
                          <div className="pt-2">
                            <img
                              src={rev.reviewImage}
                              alt="Review attachment"
                              className="w-24 h-24 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                            />
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 py-4 text-center">
                      No reviews yet for this product. Be the first to review!
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Related / Recommended Products */}
          {relatedProducts.length > 0 && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                {t.recommendedProducts}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedProducts.map(rel => (
                  <div
                    key={rel.id}
                    onClick={() => {
                      closeProductDetail();
                      setTimeout(() => addToCart(rel), 100);
                    }}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 flex items-center gap-3 cursor-pointer group bg-slate-50/50 dark:bg-slate-800/40"
                  >
                    <img
                      src={rel.images[0]}
                      alt={rel.title}
                      className="w-12 h-12 rounded-lg object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {language === 'bn' ? rel.titleBn : rel.title}
                      </p>
                      <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        ৳{(rel.discountPrice ?? rel.price).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Interactive Size Chart Modal Sub-Overlay */}
      {isSizeChartOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Ruler className="w-5 h-5 text-emerald-500" />
                <span>Panjabi & Shirt Size Guide (Inches)</span>
              </h3>
              <button
                onClick={() => setIsSizeChartOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300">
              All measurements are taken flat. Measure your chest around the fullest part.
            </div>

            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                  <th className="p-2 font-bold">Size</th>
                  <th className="p-2 font-bold">Chest (in)</th>
                  <th className="p-2 font-bold">Length (in)</th>
                  <th className="p-2 font-bold">Shoulder (in)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                <tr><td className="p-2 font-bold">38 (M)</td><td className="p-2">40"</td><td className="p-2">40"</td><td className="p-2">17.5"</td></tr>
                <tr><td className="p-2 font-bold">40 (L)</td><td className="p-2">42"</td><td className="p-2">42"</td><td className="p-2">18.5"</td></tr>
                <tr><td className="p-2 font-bold">42 (XL)</td><td className="p-2">44"</td><td className="p-2">44"</td><td className="p-2">19.5"</td></tr>
                <tr><td className="p-2 font-bold">44 (XXL)</td><td className="p-2">46"</td><td className="p-2">45"</td><td className="p-2">20.5"</td></tr>
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
