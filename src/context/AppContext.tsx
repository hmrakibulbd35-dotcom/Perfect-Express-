import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Category,
  CartItem,
  Order,
  Coupon,
  Language,
  Theme,
  DeliveryArea,
  PaymentMethod,
  OrderStatus,
  CourierProvider,
  Review
} from '../types';
import {
  initialCategories,
  initialProducts,
  initialOrders,
  activeCoupons,
  sampleReviews
} from '../data/mockData';
import { translations } from '../data/translations';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  // Navigation & View Mode
  activeMode: 'storefront' | 'mobile-sim' | 'admin' | 'architecture';
  setActiveMode: (mode: 'storefront' | 'mobile-sim' | 'admin' | 'architecture') => void;
  
  // Theme & Language
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: typeof translations.en;
  
  // Catalog & Search
  products: Product[];
  categories: Category[];
  selectedCategory: string | null;
  setSelectedCategory: (catId: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Product Detail Modal
  detailProduct: Product | null;
  openProductDetail: (product: Product) => void;
  closeProductDetail: () => void;
  
  // Reviews
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'date' | 'verifiedPurchase'>) => void;
  
  // Cart & Wishlist
  cart: CartItem[];
  addToCart: (product: Product, variantId?: string, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  
  wishlist: string[]; // product IDs
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  
  // Checkout & Coupons
  isCheckoutOpen: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  
  // Simulated bKash Gateway Modal
  bkashModal: {
    isOpen: boolean;
    orderData?: any;
    step: 'phone' | 'otp' | 'pin' | 'success';
  };
  openBkashModal: (orderData: any) => void;
  closeBkashModal: () => void;
  setBkashStep: (step: 'phone' | 'otp' | 'pin' | 'success') => void;
  
  // Orders & Tracking
  orders: Order[];
  createOrder: (orderPayload: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    address: {
      fullName: string;
      phone: string;
      division: string;
      district: string;
      area: DeliveryArea;
      fullAddress: string;
    };
    deliveryArea: DeliveryArea;
    paymentMethod: PaymentMethod;
    notes?: string;
  }) => Order;
  activeTrackedOrder: Order | null;
  trackOrder: (order: Order) => void;
  closeTrackingModal: () => void;
  
  // Admin Operations
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  bookCourierDispatch: (orderId: string, courier: CourierProvider) => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'rating' | 'reviewCount'>) => void;
  updateProductStock: (productId: string, newStock: number) => void;
  deleteProduct: (productId: string) => void;
  
  // Invoice Modal
  invoiceOrder: Order | null;
  openInvoice: (order: Order) => void;
  closeInvoice: () => void;
  
  // Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeMode, setActiveMode] = useState<'storefront' | 'mobile-sim' | 'admin' | 'architecture'>('storefront');
  const [theme, setTheme] = useState<Theme>('light');
  const [language, setLanguage] = useState<Language>('en');
  
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories] = useState<Category[]>(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>(sampleReviews);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>(['prod-001', 'prod-003']);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [activeTrackedOrder, setActiveTrackedOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  const [bkashModal, setBkashModal] = useState<{
    isOpen: boolean;
    orderData?: any;
    step: 'phone' | 'otp' | 'pin' | 'success';
  }>({
    isOpen: false,
    step: 'phone'
  });

  const t = translations[language];

  // Sync HTML theme class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'bn' : 'en'));
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // Cart operations
  const addToCart = (product: Product, variantId?: string, quantity: number = 1) => {
    const variant = variantId ? product.variants.find(v => v.id === variantId) : product.variants[0];
    const unitPrice = (product.discountPrice ?? product.price) + (variant?.additionalPrice ?? 0);
    const cartItemId = `${product.id}-${variant?.id ?? 'default'}`;

    setCart(prev => {
      const existing = prev.find(item => item.id === cartItemId);
      if (existing) {
        return prev.map(item =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + quantity, totalPrice: (item.quantity + quantity) * unitPrice }
            : item
        );
      } else {
        return [
          ...prev,
          {
            id: cartItemId,
            productId: product.id,
            product,
            selectedVariant: variant,
            quantity,
            unitPrice,
            totalPrice: unitPrice * quantity
          }
        ];
      }
    });

    showToast(
      language === 'bn'
        ? `"${product.titleBn}" ব্যাগে যুক্ত করা হয়েছে!`
        : `Added "${product.title}" to cart!`
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === cartItemId
          ? { ...item, quantity, totalPrice: item.unitPrice * quantity }
          : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast(language === 'bn' ? 'পছন্দের তালিকা থেকে সরানো হয়েছে' : 'Removed from wishlist', 'info');
        return prev.filter(id => id !== productId);
      } else {
        showToast(language === 'bn' ? 'পছন্দের তালিকায় যুক্ত হয়েছে!' : 'Added to wishlist!');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Detail Modal
  const openProductDetail = (product: Product) => setDetailProduct(product);
  const closeProductDetail = () => setDetailProduct(null);

  // Reviews
  const addReview = (reviewData: Omit<Review, 'id' | 'date' | 'verifiedPurchase'>) => {
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      verifiedPurchase: true
    };
    setReviews(prev => [newReview, ...prev]);
    showToast(language === 'bn' ? 'ধন্যবাদ! আপনার রিভিউ জমা হয়েছে।' : 'Thank you! Your review has been submitted.');
  };

  // Coupons
  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const coupon = activeCoupons.find(c => c.code === cleanCode);
    if (!coupon) {
      return { success: false, message: language === 'bn' ? 'অকার্যকর প্রোমো কোড' : 'Invalid coupon code' };
    }
    if (cartTotal < coupon.minOrderValue) {
      return {
        success: false,
        message:
          language === 'bn'
            ? `এই কোডের জন্য ন্যূনতম ৳${coupon.minOrderValue} অর্ডারের প্রয়োজন`
            : `Minimum order value of ৳${coupon.minOrderValue} required for this coupon`
      };
    }
    setAppliedCoupon(coupon);
    showToast(
      language === 'bn'
        ? `প্রোমো কোড ${coupon.code} সফলভাবে প্রয়োগ হয়েছে!`
        : `Promo code ${coupon.code} applied successfully!`
    );
    return { success: true, message: 'Applied' };
  };

  const removeCoupon = () => setAppliedCoupon(null);

  // Checkout modal
  const openCheckout = () => {
    setIsCartDrawerOpen(false);
    setIsCheckoutOpen(true);
  };
  const closeCheckout = () => setIsCheckoutOpen(false);

  // Simulated bKash
  const openBkashModal = (orderData: any) => {
    setBkashModal({ isOpen: true, orderData, step: 'phone' });
  };
  const closeBkashModal = () => {
    setBkashModal({ isOpen: false, step: 'phone' });
  };
  const setBkashStep = (step: 'phone' | 'otp' | 'pin' | 'success') => {
    setBkashModal(prev => ({ ...prev, step }));
  };

  // Create Order
  const createOrder = (orderPayload: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    address: {
      fullName: string;
      phone: string;
      division: string;
      district: string;
      area: DeliveryArea;
      fullAddress: string;
    };
    deliveryArea: DeliveryArea;
    paymentMethod: PaymentMethod;
    notes?: string;
  }): Order => {
    const subtotal = cartTotal;
    const deliveryFee = orderPayload.deliveryArea === 'INSIDE_DHAKA' ? 60 : 120;
    
    let discount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.discountType === 'PERCENTAGE') {
        discount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
      } else {
        discount = appliedCoupon.discountValue;
      }
    }

    const total = Math.max(0, subtotal + deliveryFee - discount);
    const orderNumber = `BP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowIso = new Date().toISOString();

    const orderItems = cart.map(item => ({
      id: `item-${Date.now()}-${item.id}`,
      productId: item.productId,
      productTitle: item.product.title,
      productSku: item.selectedVariant?.sku ?? item.product.sku,
      variantLabel: item.selectedVariant
        ? `${item.selectedVariant.size ? 'Size: ' + item.selectedVariant.size : ''} ${item.selectedVariant.color ? '· ' + item.selectedVariant.color : ''}`.trim()
        : undefined,
      price: item.unitPrice,
      quantity: item.quantity,
      image: item.product.images[0]
    }));

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName: orderPayload.customerName,
      customerPhone: orderPayload.customerPhone,
      customerEmail: orderPayload.customerEmail,
      shippingAddress: orderPayload.address,
      items: orderItems,
      subtotal,
      deliveryFee,
      discount,
      couponCode: appliedCoupon?.code,
      total,
      status: orderPayload.paymentMethod === 'COD' ? 'PROCESSING' : 'PENDING',
      paymentMethod: orderPayload.paymentMethod,
      paymentStatus: orderPayload.paymentMethod === 'COD' ? 'PENDING' : 'COMPLETED',
      transactionId: orderPayload.paymentMethod === 'BKASH' ? `BKASH-${Math.random().toString(36).substring(2, 9).toUpperCase()}` : undefined,
      notes: orderPayload.notes,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    // Auto-create courier consignment assignment simulation
    const courierName: CourierProvider = orderPayload.deliveryArea === 'INSIDE_DHAKA' ? 'STEADFAST' : 'PATHAO';
    newOrder.courierShipment = {
      consignmentId: `${courierName === 'STEADFAST' ? 'STF' : 'PTH'}-${Math.floor(100000 + Math.random() * 900000)}`,
      trackingCode: `${courierName}-${orderPayload.deliveryArea === 'INSIDE_DHAKA' ? 'DHK' : 'BD'}-${Math.floor(1000 + Math.random() * 9000)}`,
      courier: courierName,
      status: 'BOOKED',
      deliveryFee,
      codAmount: orderPayload.paymentMethod === 'COD' ? total : 0,
      bookedAt: nowIso,
      lastUpdated: nowIso
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    setAppliedCoupon(null);
    closeCheckout();
    setActiveTrackedOrder(newOrder);

    showToast(
      language === 'bn'
        ? `অর্ডার #${orderNumber} সফলভাবে গ্রহণ করা হয়েছে!`
        : `Order #${orderNumber} placed successfully!`
    );

    return newOrder;
  };

  const trackOrder = (order: Order) => setActiveTrackedOrder(order);
  const closeTrackingModal = () => setActiveTrackedOrder(null);

  // Admin order & product management
  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          const updated = { ...ord, status, updatedAt: new Date().toISOString() };
          if (ord.courierShipment) {
            let courierStatus = ord.courierShipment.status;
            if (status === 'SHIPPED') courierStatus = 'IN_TRANSIT';
            if (status === 'DELIVERED') courierStatus = 'DELIVERED';
            updated.courierShipment = { ...ord.courierShipment, status: courierStatus, lastUpdated: new Date().toISOString() };
          }
          return updated;
        }
        return ord;
      })
    );
    showToast(language === 'bn' ? 'অর্ডার স্ট্যাটাস আপডেট হয়েছে' : 'Order status updated');
  };

  const bookCourierDispatch = (orderId: string, courier: CourierProvider) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          const trackingCode = `${courier}-${ord.shippingAddress.area === 'INSIDE_DHAKA' ? 'DHK' : 'BD'}-${Math.floor(1000 + Math.random() * 9000)}`;
          const consignmentId = `${courier === 'STEADFAST' ? 'STF' : 'PTH'}-${Math.floor(100000 + Math.random() * 900000)}`;
          return {
            ...ord,
            status: 'SHIPPED',
            courierShipment: {
              consignmentId,
              trackingCode,
              courier,
              status: 'IN_TRANSIT',
              deliveryFee: ord.deliveryFee,
              codAmount: ord.paymentMethod === 'COD' ? ord.total : 0,
              bookedAt: new Date().toISOString(),
              lastUpdated: new Date().toISOString()
            }
          };
        }
        return ord;
      })
    );
    showToast(
      language === 'bn'
        ? `${courier === 'STEADFAST' ? 'স্টিডফাস্ট' : 'পাঠাও'} কুরিয়ারে বুকিং সম্পন্ন হয়েছে!`
        : `Booked with ${courier} Courier!`
    );
  };

  const addProduct = (newProdData: Omit<Product, 'id' | 'createdAt' | 'rating' | 'reviewCount'>) => {
    const newProduct: Product = {
      ...newProdData,
      id: `prod-${Date.now()}`,
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString()
    };
    setProducts(prev => [newProduct, ...prev]);
    showToast(language === 'bn' ? 'নতুন পণ্য ক্যাটালগে যুক্ত হয়েছে!' : 'Product added to catalog!');
  };

  const updateProductStock = (productId: string, newStock: number) => {
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, stock: Math.max(0, newStock) } : p))
    );
    showToast(language === 'bn' ? 'স্টক তথ্য হালনাগাদ করা হয়েছে' : 'Stock updated');
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    showToast(language === 'bn' ? 'পণ্য মুছে ফেলা হয়েছে' : 'Product removed', 'info');
  };

  const openInvoice = (order: Order) => setInvoiceOrder(order);
  const closeInvoice = () => setInvoiceOrder(null);

  return (
    <AppContext.Provider
      value={{
        activeMode,
        setActiveMode,
        theme,
        setTheme,
        toggleTheme,
        language,
        setLanguage,
        toggleLanguage,
        t,
        products,
        categories,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        detailProduct,
        openProductDetail,
        closeProductDetail,
        reviews,
        addReview,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        cartCount,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        wishlist,
        toggleWishlist,
        isInWishlist,
        isCheckoutOpen,
        openCheckout,
        closeCheckout,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        bkashModal,
        openBkashModal,
        closeBkashModal,
        setBkashStep,
        orders,
        createOrder,
        activeTrackedOrder,
        trackOrder,
        closeTrackingModal,
        updateOrderStatus,
        bookCourierDispatch,
        addProduct,
        updateProductStock,
        deleteProduct,
        invoiceOrder,
        openInvoice,
        closeInvoice,
        toasts,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
