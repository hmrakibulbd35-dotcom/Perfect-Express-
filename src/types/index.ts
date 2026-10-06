export type Role = 'CUSTOMER' | 'ADMIN' | 'MANAGER' | 'COURIER_RIDER';

export type Language = 'en' | 'bn';
export type Theme = 'light' | 'dark';

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'BKASH' | 'NAGAD' | 'SSLCOMMERZ' | 'COD';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type DeliveryArea = 'INSIDE_DHAKA' | 'OUTSIDE_DHAKA';
export type CourierProvider = 'STEADFAST' | 'PATHAO';

export interface ProductVariant {
  id: string;
  sku: string;
  size?: string;
  color?: string;
  colorHex?: string;
  weight?: string;
  additionalPrice: number;
  stock: number;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  commentBn?: string;
  date: string;
  verifiedPurchase: boolean;
  userAvatar?: string;
  reviewImage?: string;
}

export interface Product {
  id: string;
  title: string;
  titleBn: string;
  slug: string;
  sku: string;
  category: string;
  categoryBn: string;
  price: number;
  discountPrice?: number;
  isFlashDeal?: boolean;
  flashDealEnd?: string;
  stock: number;
  rating: number;
  reviewCount: number;
  description: string;
  descriptionBn: string;
  images: string[];
  variants: ProductVariant[];
  tags: string[];
  features?: string[];
  featuresBn?: string[];
  specifications?: Record<string, string>;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  nameBn: string;
  slug: string;
  icon: string;
  itemCount: number;
  image: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  selectedVariant?: ProductVariant;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Address {
  id?: string;
  fullName: string;
  phone: string;
  alternativePhone?: string;
  division: string;
  district: string;
  area: DeliveryArea;
  fullAddress: string;
  postalCode?: string;
}

export interface CourierShipment {
  consignmentId: string;
  trackingCode: string;
  courier: CourierProvider;
  status: 'BOOKED' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  deliveryFee: number;
  codAmount: number;
  bookedAt: string;
  lastUpdated: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productTitle: string;
  productSku: string;
  variantLabel?: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: Address;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  couponCode?: string;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  courierShipment?: CourierShipment;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderValue: number;
  expiresAt: string;
  description: string;
  descriptionBn: string;
}
