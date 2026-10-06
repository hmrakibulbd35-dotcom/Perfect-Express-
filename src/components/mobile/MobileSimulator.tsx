import React, { useState } from 'react';
import {
  Home,
  Grid,
  ShoppingBag,
  Clock,
  User,
  Search,
  Heart,
  ChevronRight,
  ShieldCheck,
  Code2,
  Copy,
  Check,
  Truck,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FLUTTER_CODE_SNIPPET } from '../../data/architectureDocs';

export const MobileSimulator: React.FC = () => {
  const {
    products,
    categories,
    cart,
    cartTotal,
    cartCount,
    updateCartQuantity,
    removeFromCart,
    openProductDetail,
    orders,
    language,
    t,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'home' | 'categories' | 'cart' | 'orders' | 'profile'>('home');
  const [selectedMobileCategory, setSelectedMobileCategory] = useState<string | null>(null);
  const [deliveryArea, setDeliveryArea] = useState<'inside' | 'outside'>('inside');
  const [showCodeDrawer, setShowCodeDrawer] = useState(false);
  const [copied, setCopied] = useState(false);

  const deliveryFee = deliveryArea === 'inside' ? 60 : 120;
  const grandTotal = cartTotal + (cart.length > 0 ? deliveryFee : 0);

  const displayedProducts = selectedMobileCategory
    ? products.filter(p => p.category === selectedMobileCategory)
    : products;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(FLUTTER_CODE_SNIPPET);
    setCopied(true);
    showToast('Flutter Dart code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fadeIn">
      
      {/* Intro strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-sky-600 text-white font-mono text-xs px-2.5 py-0.5 rounded font-bold uppercase">
              Flutter 3.5+ Mobile App
            </span>
            <span className="text-xs text-slate-500 font-mono">BLoC State Pattern · Android & iOS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
            Interactive Cross-Platform Mobile Simulator
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Experience the real-time mobile customer journey with Material 3 styling, bKash MFS checkout & offline persistence.
          </p>
        </div>

        <button
          onClick={() => setShowCodeDrawer(!showCodeDrawer)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md self-start md:self-auto border border-slate-700"
        >
          <Code2 className="w-4 h-4 text-sky-400" />
          <span>{showCodeDrawer ? 'Hide Flutter Code' : 'Inspect Flutter Code'}</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8">
        
        {/* Smartphone Device Frame */}
        <div className="relative w-[375px] h-[760px] bg-slate-950 rounded-[48px] p-3 shadow-2xl border-4 border-slate-800 ring-1 ring-slate-700/50 flex flex-col overflow-hidden">
          
          {/* Dynamic Island / Speaker Notch */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-slate-900 mr-2 border border-slate-800" />
            <div className="w-2 h-2 rounded-full bg-blue-900/60" />
          </div>

          {/* Mobile Screen Surface */}
          <div className="w-full h-full bg-slate-50 dark:bg-slate-900 rounded-[38px] overflow-hidden flex flex-col text-slate-900 dark:text-white relative">
            
            {/* Status Bar */}
            <div className="pt-3 px-6 pb-1 flex items-center justify-between text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 select-none">
              <span>9:41</span>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>

            {/* Flutter AppBar */}
            <div className="px-4 py-2.5 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-slate-950 dark:bg-emerald-500 text-white flex items-center justify-center font-black text-xs">
                  B
                </div>
                <span className="font-extrabold text-sm tracking-tight">
                  Bazaar<span className="text-emerald-500">Pulse</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('cart')}
                  className="relative p-1.5 text-slate-700 dark:text-slate-300"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Screen Content Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar pb-16">
              
              {/* TAB: HOME */}
              {activeTab === 'home' && (
                <div className="space-y-4 p-3">
                  
                  {/* Search Bar in Mobile */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search 1,000+ products..."
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>

                  {/* Mobile Banner Carousel */}
                  <div className="relative h-36 rounded-2xl overflow-hidden bg-slate-950 text-white p-4 flex flex-col justify-end shadow-md">
                    <img
                      src="https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=600&q=80"
                      alt="Banner"
                      className="absolute inset-0 w-full h-full object-cover opacity-60"
                    />
                    <div className="relative z-10">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                        Eid Festive 2026
                      </span>
                      <h4 className="text-sm font-black text-white leading-tight">
                        Silk Panjabi & Sarees
                      </h4>
                      <span className="text-[10px] text-amber-300 font-mono mt-0.5 block">
                        Steadfast 24h Express Delivery
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Category Chips */}
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    <button
                      onClick={() => setSelectedMobileCategory(null)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                        selectedMobileCategory === null
                          ? 'bg-slate-900 text-white dark:bg-emerald-500'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      All
                    </button>
                    {categories.map(c => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedMobileCategory(c.name)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                          selectedMobileCategory === c.name
                            ? 'bg-slate-900 text-white dark:bg-emerald-500'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {c.name.split('&')[0]}
                      </button>
                    ))}
                  </div>

                  {/* Products 2-Column Grid */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {displayedProducts.map(p => (
                      <div
                        key={p.id}
                        onClick={() => openProductDetail(p)}
                        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden cursor-pointer flex flex-col justify-between"
                      >
                        <div className="relative aspect-square">
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            className="w-full h-full object-cover"
                          />
                          {p.discountPrice && (
                            <span className="absolute top-1.5 left-1.5 bg-rose-600 text-white font-mono text-[9px] font-bold px-1 rounded">
                              Save ৳{p.price - p.discountPrice}
                            </span>
                          )}
                        </div>

                        <div className="p-2.5">
                          <h5 className="text-[11px] font-bold text-slate-900 dark:text-white line-clamp-1">
                            {p.title}
                          </h5>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                              ৳{(p.discountPrice ?? p.price).toLocaleString()}
                            </span>
                            {p.discountPrice && (
                              <span className="text-[10px] line-through text-slate-400 font-mono">
                                ৳{p.price.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* TAB: CATEGORIES */}
              {activeTab === 'categories' && (
                <div className="p-3 space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Browse Categories
                  </h4>
                  <div className="space-y-2">
                    {categories.map(c => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedMobileCategory(c.name);
                          setActiveTab('home');
                        }}
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={c.image}
                            alt={c.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block">
                              {c.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {c.itemCount} items
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: CART */}
              {activeTab === 'cart' && (
                <div className="p-3 space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    My Shopping Bag ({cart.length})
                  </h4>

                  {cart.length > 0 ? (
                    <div className="space-y-3">
                      {cart.map(item => (
                        <div
                          key={item.id}
                          className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 flex gap-3 text-xs"
                        >
                          <img
                            src={item.product.images[0]}
                            alt={item.product.title}
                            className="w-14 h-14 rounded-lg object-cover"
                          />
                          <div className="flex-1 flex flex-col justify-between">
                            <h5 className="font-bold text-slate-900 dark:text-white line-clamp-1">
                              {item.product.title}
                            </h5>
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold">
                                ৳{item.totalPrice.toLocaleString()}
                              </span>
                              <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded">
                                <button
                                  onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                  className="px-2 py-0.5 text-xs font-bold"
                                >
                                  -
                                </button>
                                <span className="px-2 py-0.5 font-mono">{item.quantity}</span>
                                <button
                                  onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                  className="px-2 py-0.5 text-xs font-bold"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Delivery Area Toggle in Mobile */}
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
                        <span className="font-bold block">Delivery Location</span>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setDeliveryArea('inside')}
                            className={`p-2 rounded-lg border text-center font-semibold text-[11px] ${
                              deliveryArea === 'inside'
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-600'
                                : 'border-slate-200 dark:border-slate-700 text-slate-600'
                            }`}
                          >
                            Inside Dhaka (৳60)
                          </button>
                          <button
                            onClick={() => setDeliveryArea('outside')}
                            className={`p-2 rounded-lg border text-center font-semibold text-[11px] ${
                              deliveryArea === 'outside'
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-600'
                                : 'border-slate-200 dark:border-slate-700 text-slate-600'
                            }`}
                          >
                            Outside Dhaka (৳120)
                          </button>
                        </div>
                      </div>

                      {/* Total Bar */}
                      <div className="p-3 bg-slate-900 text-white rounded-xl space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span>Total Payable:</span>
                          <span className="font-mono font-bold text-emerald-400 text-sm">
                            ৳{grandTotal.toLocaleString()}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            showToast('bKash payment flow triggered in mobile!');
                          }}
                          className="w-full py-2 bg-[#e2136e] text-white rounded-lg font-bold text-center flex items-center justify-center gap-1.5"
                        >
                          <span>Pay with bKash</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                      <ShoppingBag className="w-8 h-8 mx-auto text-slate-300" />
                      <p>Your mobile cart is empty</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: ORDERS */}
              {activeTab === 'orders' && (
                <div className="p-3 space-y-3 text-xs">
                  <h4 className="font-bold text-slate-500 uppercase tracking-wider">
                    My Order History
                  </h4>
                  {orders.map(order => (
                    <div
                      key={order.id}
                      className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold">{order.orderNumber}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700">
                          {order.status}
                        </span>
                      </div>
                      <p className="text-slate-500">{order.items[0]?.productTitle}</p>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700 text-[11px]">
                        <span className="text-slate-400">Total: ৳{order.total}</span>
                        <span className="font-mono text-emerald-600">
                          {order.courierShipment?.courier}: {order.courierShipment?.consignmentId}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB: PROFILE */}
              {activeTab === 'profile' && (
                <div className="p-4 space-y-4 text-xs">
                  <div className="text-center space-y-1">
                    <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-bold mx-auto">
                      RH
                    </div>
                    <h4 className="font-bold text-sm">Rakibul Hasan</h4>
                    <p className="text-slate-400 font-mono">01711223344</p>
                  </div>

                  <div className="space-y-1 pt-2">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between">
                      <span>Saved Addresses</span>
                      <span className="text-slate-400">2 Addresses</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between">
                      <span>Language</span>
                      <span className="text-emerald-500 font-semibold">বাংলা / EN</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between">
                      <span>Support Hotline</span>
                      <span className="font-mono text-slate-400">09612-000000</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Flutter Bottom Navigation Bar */}
            <div className="absolute bottom-0 inset-x-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-700/60 py-2 px-4 flex items-center justify-between text-[10px] font-semibold text-slate-500">
              <button
                onClick={() => setActiveTab('home')}
                className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-emerald-600 dark:text-emerald-400' : ''}`}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`flex flex-col items-center gap-1 ${activeTab === 'categories' ? 'text-emerald-600 dark:text-emerald-400' : ''}`}
              >
                <Grid className="w-4 h-4" />
                <span>Categories</span>
              </button>
              <button
                onClick={() => setActiveTab('cart')}
                className={`flex flex-col items-center gap-1 ${activeTab === 'cart' ? 'text-emerald-600 dark:text-emerald-400' : ''}`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Cart ({cartCount})</span>
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex flex-col items-center gap-1 ${activeTab === 'orders' ? 'text-emerald-600 dark:text-emerald-400' : ''}`}
              >
                <Clock className="w-4 h-4" />
                <span>Orders</span>
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-emerald-600 dark:text-emerald-400' : ''}`}
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>
            </div>

          </div>
        </div>

        {/* Flutter Source Code Inspection Panel */}
        <div className={`flex-1 w-full space-y-4 ${showCodeDrawer ? 'block' : 'hidden lg:block'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Flutter BLoC Checkout Screen Implementation
              </h3>
              <p className="text-xs text-slate-500">
                Dart code corresponding to the mobile simulator above.
              </p>
            </div>

            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Flutter Dart'}</span>
            </button>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
            <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>mobile/lib/features/checkout/presentation/checkout_screen.dart</span>
              <span>Dart 3.5</span>
            </div>
            <pre className="p-6 text-xs font-mono text-slate-200 overflow-x-auto max-h-[660px] leading-relaxed select-text">
              <code>{FLUTTER_CODE_SNIPPET}</code>
            </pre>
          </div>
        </div>

      </div>

    </div>
  );
};
