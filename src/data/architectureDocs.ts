export const PRISMA_SCHEMA = `// ==============================================================================
// Prisma 6.x Production Schema - BazaarPulse Enterprise E-Commerce Platform
// Database Target: PostgreSQL 15+ / 16+
// Features: Full-Text Search, Spatial Area Enums, Bilingual Text, Multi-Variant
// ==============================================================================

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  directUrl  = env("DIRECT_URL")
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearchPostgres", "postgresqlExtensions"]
}

// ==============================================================================
// 1. ENUMS (Domain-Driven Statuses, Roles, and Gateways)
// ==============================================================================

enum Role {
  CUSTOMER
  ADMIN
  MANAGER
  WAREHOUSE_STAFF
  COURIER_RIDER
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  PENDING_VERIFICATION
  DEACTIVATED
}

enum Gender {
  MALE
  FEMALE
  OTHER
  PREFER_NOT_TO_SAY
}

enum ProductStatus {
  DRAFT
  ACTIVE
  ARCHIVED
  OUT_OF_STOCK
}

enum OrderStatus {
  PENDING           // Order placed by customer, awaiting merchant confirmation / payment
  PROCESSING        // Warehouse picking and packaging
  PACKED            // Sealed and labeled with courier tracking barcode
  SHIPPED           // Handed over to courier hub (Steadfast / Pathao)
  OUT_FOR_DELIVERY  // Assigned to local courier rider for last-mile delivery
  DELIVERED         // Customer received item, cash collected (if COD)
  CANCELLED         // Cancelled prior to dispatch
  RETURNED          // Returned / Rejected at doorstep
}

enum PaymentMethod {
  BKASH             // Official bKash Tokenized Checkout API
  NAGAD             // Nagad Mobile Financial Service
  UPAY              // UCB Upay MFS
  ROCKET            // DBBL Rocket MFS
  SSLCOMMERZ        // Hosted Gateway (Visa, Mastercard, AMEX, Nexus)
  COD               // Cash on Delivery at customer doorstep
}

enum PaymentStatus {
  PENDING           // Awaiting payment capture
  INITIATED         // Gateway URL generated / session active
  COMPLETED         // Successfully paid and verified with gateway
  FAILED            // Payment transaction declined or timed out
  REFUNDED          // Refund issued to customer MFS account / card
}

enum DeliveryArea {
  INSIDE_DHAKA      // 24-48h Delivery (Standard ৳60 charge)
  OUTSIDE_DHAKA     // 2-4 Days Nationwide Delivery (Standard ৳120 charge)
  DHAKA_SUB_URBAN   // Gazipur, Savar, Keraniganj, Narayanganj (৳100 charge)
}

enum CourierProvider {
  STEADFAST         // Steadfast Courier B2B API
  PATHAO            // Pathao Courier Merchant API
  REDX              // RedX Logistics
  PAPERFLY          // Paperfly Nationwide Delivery
}

enum DiscountType {
  PERCENTAGE        // Discount calculated as percentage of subtotal
  FIXED             // Flat currency discount amount in BDT
}

// ==============================================================================
// 2. USERS, PROFILES & ADDRESSES
// ==============================================================================

model User {
  id                String       @id @default(uuid())
  phoneNumber       String       @unique @db.VarChar(20)
  email             String?      @unique @db.VarChar(120)
  passwordHash      String?      @db.VarChar(255)
  name              String       @db.VarChar(100)
  avatarUrl         String?      @db.Text
  role              Role         @default(CUSTOMER)
  status            UserStatus   @default(ACTIVE)
  isPhoneVerified   Boolean      @default(false)
  isEmailVerified   Boolean      @default(false)

  // One-to-One Profile
  profile           Profile?

  // Relations
  addresses         Address[]
  orders            Order[]
  cart              Cart?
  wishlistItems     Wishlist[]
  reviews           Review[]
  auditLogs         AuditLog[]

  // Timestamps
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  @@index([phoneNumber])
  @@index([email])
  @@index([role])
  @@index([status])
}

model Profile {
  id                String       @id @default(uuid())
  userId            String       @unique
  user              User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  dateOfBirth       DateTime?    @db.Date
  gender            Gender?      @default(PREFER_NOT_TO_SAY)
  bio               String?      @db.VarChar(255)
  preferredLanguage String       @default("bn") @db.VarChar(5) // "en" | "bn"
  rewardPoints      Int          @default(0)
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt
}

model Address {
  id                String       @id @default(uuid())
  userId            String
  user              User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  fullName          String       @db.VarChar(100)
  phone             String       @db.VarChar(20)
  alternativePhone  String?      @db.VarChar(20)

  division          String       @db.VarChar(50) // Dhaka, Chattogram, Sylhet, etc.
  district          String       @db.VarChar(50) // Dhaka, Gazipur, Cumilla, etc.
  thana             String?      @db.VarChar(60) // Gulshan, Dhanmondi, Mirpur, etc.
  area              DeliveryArea @default(INSIDE_DHAKA)
  streetAddress     String       @db.Text        // House, Road, Flat, Landmark
  postalCode        String?      @db.VarChar(10)

  isDefault         Boolean      @default(false)
  orders            Order[]

  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  @@index([userId])
  @@index([area])
  @@index([district])
}

// ==============================================================================
// 3. CATEGORIES & CATALOG HIERARCHY
// ==============================================================================

model Category {
  id                String       @id @default(uuid())
  name              String       @db.VarChar(100) // English
  nameBn            String       @db.VarChar(120) // Bengali (বাংলা)
  slug              String       @unique @db.VarChar(120)
  description       String?      @db.Text
  imageUrl          String?      @db.Text
  iconName          String?      @db.VarChar(50)
  isActive          Boolean      @default(true)
  orderIndex        Int          @default(0)

  // Self-referencing tree hierarchy (Parent -> Children)
  parentId          String?
  parent            Category?    @relation("CategoryHierarchy", fields: [parentId], references: [id], onDelete: SetNull)
  children          Category[]   @relation("CategoryHierarchy")

  // Products
  products          Product[]

  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  @@index([slug])
  @@index([parentId])
  @@index([isActive, orderIndex])
}

// ==============================================================================
// 4. PRODUCTS & PRODUCT VARIANTS (SKU MATRIX)
// ==============================================================================

model Product {
  id                String           @id @default(uuid())
  title             String           @db.VarChar(200) // English
  titleBn           String           @db.VarChar(250) // Bengali
  slug              String           @unique @db.VarChar(250)
  sku               String           @unique @db.VarChar(60) // Master SKU

  description       String           @db.Text
  descriptionBn     String           @db.Text

  basePrice         Decimal          @db.Decimal(12, 2)
  discountPrice     Decimal?         @db.Decimal(12, 2)
  costPrice         Decimal?         @db.Decimal(12, 2) // Wholesale procurement cost
  stock             Int              @default(0)

  status            ProductStatus    @default(ACTIVE)
  isActive          Boolean          @default(true)
  isFlashDeal       Boolean          @default(false)
  flashDealEnd      DateTime?

  images            String[]         @default([])
  tags              String[]         @default([])
  specifications    Json?            // Arbitrary specs: {"Fabric": "Silk", "Fit": "Slim"}
  weightGrams       Int?             @default(500) // For volumetric shipping calculation

  // Relations
  categoryId        String
  category          Category         @relation(fields: [categoryId], references: [id])
  variants          ProductVariant[]
  reviews           Review[]
  orderItems        OrderItem[]
  cartItems         CartItem[]
  wishlistItems     Wishlist[]

  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt

  @@index([slug])
  @@index([sku])
  @@index([categoryId])
  @@index([status, isActive])
  @@index([isFlashDeal, flashDealEnd])
  @@index([basePrice])
}

model ProductVariant {
  id                String       @id @default(uuid())
  productId         String
  product           Product      @relation(fields: [productId], references: [id], onDelete: Cascade)

  sku               String       @unique @db.VarChar(80) // Variant specific SKU (e.g. PAN-HER-01-40)
  size              String?      @db.VarChar(25)         // e.g. "38", "40", "M", "L", "XL"
  color             String?      @db.VarChar(40)         // e.g. "Royal Navy", "Olive Green"
  colorHex          String?      @db.VarChar(10)         // e.g. "#1e293b"
  weight            String?      @db.VarChar(30)         // e.g. "500g", "1kg"

  additionalPrice   Decimal      @default(0.00) @db.Decimal(12, 2)
  stock             Int          @default(0)
  barcode           String?      @db.VarChar(60)

  // Relations
  cartItems         CartItem[]
  orderItems        OrderItem[]

  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  @@index([productId])
  @@index([sku])
  @@index([size])
  @@index([color])
}

// ==============================================================================
// 5. CART & WISHLIST
// ==============================================================================

model Cart {
  id                String       @id @default(uuid())
  userId            String       @unique
  user              User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  items             CartItem[]
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt
}

model CartItem {
  id                String          @id @default(uuid())
  cartId            String
  cart              Cart            @relation(fields: [cartId], references: [id], onDelete: Cascade)

  productId         String
  product           Product         @relation(fields: [productId], references: [id], onDelete: Cascade)

  variantId         String?
  variant           ProductVariant? @relation(fields: [variantId], references: [id], onDelete: SetNull)

  quantity          Int             @default(1)
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  @@unique([cartId, productId, variantId])
  @@index([cartId])
  @@index([productId])
}

model Wishlist {
  id                String       @id @default(uuid())
  userId            String
  user              User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  productId         String
  product           Product      @relation(fields: [productId], references: [id], onDelete: Cascade)

  createdAt         DateTime     @default(now())

  @@unique([userId, productId])
  @@index([userId])
  @@index([productId])
}

// ==============================================================================
// 6. ORDERS, ORDER ITEMS & TRANSACTIONS
// ==============================================================================

model Order {
  id                  String               @id @default(uuid())
  orderNumber         String               @unique @db.VarChar(50) // e.g. "BP-2026-8801"

  userId              String?
  user                User?                @relation(fields: [userId], references: [id], onDelete: SetNull)

  // Shipping Address Snapshot
  shippingAddressId   String
  shippingAddress     Address              @relation(fields: [shippingAddressId], references: [id])

  items               OrderItem[]

  // Financial Breakdown (All in BDT Currency)
  subtotal            Decimal              @db.Decimal(12, 2)
  deliveryFee         Decimal              @db.Decimal(12, 2) // ৳60 Inside Dhaka / ৳120 Outside Dhaka
  discount            Decimal              @default(0.00) @db.Decimal(12, 2)
  total               Decimal              @db.Decimal(12, 2)

  status              OrderStatus          @default(PENDING)
  paymentMethod       PaymentMethod
  paymentStatus       PaymentStatus        @default(PENDING)

  couponCode          String?              @db.VarChar(30)
  customerNotes       String?              @db.Text
  adminNotes          String?              @db.Text

  // Payment & Courier Tracking
  transactions        PaymentTransaction[]
  shipment            CourierShipment?

  createdAt           DateTime             @default(now())
  updatedAt           DateTime             @updatedAt

  @@index([orderNumber])
  @@index([userId])
  @@index([status])
  @@index([paymentStatus])
  @@index([paymentMethod])
  @@index([createdAt])
}

model OrderItem {
  id                String          @id @default(uuid())
  orderId           String
  order             Order           @relation(fields: [orderId], references: [id], onDelete: Cascade)

  productId         String
  product           Product         @relation(fields: [productId], references: [id])

  variantId         String?
  variant           ProductVariant? @relation(fields: [variantId], references: [id], onDelete: SetNull)

  // Immutable historical snapshots at the exact moment of order placement
  productTitle      String          @db.VarChar(200)
  productSku        String          @db.VarChar(80)
  variantLabel      String?         @db.VarChar(100) // e.g. "Size: 40 (L) · Royal Navy"

  unitPrice         Decimal         @db.Decimal(12, 2)
  quantity          Int             @default(1)
  totalPrice        Decimal         @db.Decimal(12, 2)

  createdAt         DateTime        @default(now())

  @@index([orderId])
  @@index([productId])
  @@index([variantId])
}

// ==============================================================================
// 7. PAYMENTS & COURIER SHIPMENTS
// ==============================================================================

model PaymentTransaction {
  id                String        @id @default(uuid())
  orderId           String
  order             Order         @relation(fields: [orderId], references: [id], onDelete: Cascade)

  provider          PaymentMethod
  transactionId     String?       @unique @db.VarChar(100) // TrxID from bKash (e.g. BKASH-9K2L4P8M)
  paymentGatewayId  String?       @unique @db.VarChar(120) // bKash paymentID (e.g. TR0011XX992384)

  amount            Decimal       @db.Decimal(12, 2)
  currency          String        @default("BDT") @db.VarChar(5)
  status            PaymentStatus @default(PENDING)

  gatewayResponse   Json?         // Full raw webhook/callback payload from bKash / Nagad
  rawPayload        Json?

  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  @@index([orderId])
  @@index([transactionId])
  @@index([paymentGatewayId])
  @@index([provider, status])
}

model CourierShipment {
  id                String          @id @default(uuid())
  orderId           String          @unique
  order             Order           @relation(fields: [orderId], references: [id], onDelete: Cascade)

  provider          CourierProvider @default(STEADFAST)
  consignmentId     String          @unique @db.VarChar(80) // e.g. "STF-889104"
  trackingCode      String          @unique @db.VarChar(80) // e.g. "STEADFAST-DHK-9941"

  status            String          @default("BOOKED") @db.VarChar(50)
  codAmount         Decimal         @db.Decimal(12, 2)
  deliveryCharge    Decimal         @db.Decimal(12, 2)

  recipientName     String          @db.VarChar(100)
  recipientPhone    String          @db.VarChar(20)
  recipientCity     String          @db.VarChar(60)

  bookingDetails    Json?           // Full API response from Steadfast / Pathao
  lastWebhookAt     DateTime?

  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  @@index([consignmentId])
  @@index([trackingCode])
  @@index([provider, status])
}

// ==============================================================================
// 8. CUSTOMER REVIEWS & ENGAGEMENT
// ==============================================================================

model Review {
  id                String       @id @default(uuid())
  productId         String
  product           Product      @relation(fields: [productId], references: [id], onDelete: Cascade)

  userId            String
  user              User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  rating            Int          @default(5) // 1 to 5 stars
  comment           String       @db.Text
  commentBn         String?      @db.Text
  reviewImages      String[]     @default([])

  verifiedPurchase  Boolean      @default(true)
  isApproved        Boolean      @default(true)

  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  @@index([productId])
  @@index([userId])
  @@index([rating])
  @@index([isApproved])
}

// ==============================================================================
// 9. PROMOTIONS & AUDIT LOGS
// ==============================================================================

model Coupon {
  id                String       @id @default(uuid())
  code              String       @unique @db.VarChar(30) // e.g. "EID2026", "DHAKA50"
  discountType      DiscountType @default(PERCENTAGE)
  discountValue     Decimal      @db.Decimal(12, 2)
  minOrderValue     Decimal      @default(0.00) @db.Decimal(12, 2)
  maxDiscount       Decimal?     @db.Decimal(12, 2)

  usageLimit        Int?         // Total redemption limit
  usageCount        Int          @default(0)

  startDate         DateTime     @default(now())
  endDate           DateTime
  isActive          Boolean      @default(true)

  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  @@index([code])
  @@index([isActive, startDate, endDate])
}

model AuditLog {
  id                String       @id @default(uuid())
  userId            String?
  user              User?        @relation(fields: [userId], references: [id], onDelete: SetNull)

  action            String       @db.VarChar(80)  // "ORDER_STATUS_UPDATED", "STOCK_ADJUSTED"
  entityType        String       @db.VarChar(60)  // "Order", "Product", "User"
  entityId          String?      @db.VarChar(60)
  ipAddress         String?      @db.VarChar(45)
  metadata          Json?

  createdAt         DateTime     @default(now())

  @@index([entityType, entityId])
  @@index([action])
  @@index([userId])
}
`;

export const POSTGRES_SQL_DDL = `-- ==============================================================================
-- PostgreSQL 15+ / 16+ Production DDL Schema - BazaarPulse Enterprise
-- Compatible with Supabase, Neon, AWS RDS PostgreSQL, Google Cloud SQL
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. ENUMS
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'ADMIN', 'MANAGER', 'WAREHOUSE_STAFF', 'COURIER_RIDER');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION', 'DEACTIVATED');
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED', 'OUT_OF_STOCK');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED');
CREATE TYPE "PaymentMethod" AS ENUM ('BKASH', 'NAGAD', 'UPAY', 'ROCKET', 'SSLCOMMERZ', 'COD');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'INITIATED', 'COMPLETED', 'FAILED', 'REFUNDED');
CREATE TYPE "DeliveryArea" AS ENUM ('INSIDE_DHAKA', 'OUTSIDE_DHAKA', 'DHAKA_SUB_URBAN');
CREATE TYPE "CourierProvider" AS ENUM ('STEADFAST', 'PATHAO', 'REDX', 'PAPERFLY');
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

-- 2. USERS, PROFILES & ADDRESSES
CREATE TABLE "User" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "phoneNumber" VARCHAR(20) NOT NULL UNIQUE,
  "email" VARCHAR(120) UNIQUE,
  "passwordHash" VARCHAR(255),
  "name" VARCHAR(100) NOT NULL,
  "avatarUrl" TEXT,
  "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
  "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
  "isPhoneVerified" BOOLEAN NOT NULL DEFAULT FALSE,
  "isEmailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE "Profile" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
  "dateOfBirth" DATE,
  "gender" "Gender" DEFAULT 'PREFER_NOT_TO_SAY',
  "bio" VARCHAR(255),
  "preferredLanguage" VARCHAR(5) NOT NULL DEFAULT 'bn',
  "rewardPoints" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE "Address" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "fullName" VARCHAR(100) NOT NULL,
  "phone" VARCHAR(20) NOT NULL,
  "alternativePhone" VARCHAR(20),
  "division" VARCHAR(50) NOT NULL,
  "district" VARCHAR(50) NOT NULL,
  "thana" VARCHAR(60),
  "area" "DeliveryArea" NOT NULL DEFAULT 'INSIDE_DHAKA',
  "streetAddress" TEXT NOT NULL,
  "postalCode" VARCHAR(10),
  "isDefault" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 3. CATEGORIES
CREATE TABLE "Category" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" VARCHAR(100) NOT NULL,
  "nameBn" VARCHAR(120) NOT NULL,
  "slug" VARCHAR(120) NOT NULL UNIQUE,
  "description" TEXT,
  "imageUrl" TEXT,
  "iconName" VARCHAR(50),
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "orderIndex" INTEGER NOT NULL DEFAULT 0,
  "parentId" UUID REFERENCES "Category"("id") ON DELETE SET NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 4. PRODUCTS & VARIANTS
CREATE TABLE "Product" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "title" VARCHAR(200) NOT NULL,
  "titleBn" VARCHAR(250) NOT NULL,
  "slug" VARCHAR(250) NOT NULL UNIQUE,
  "sku" VARCHAR(60) NOT NULL UNIQUE,
  "description" TEXT NOT NULL,
  "descriptionBn" TEXT NOT NULL,
  "basePrice" DECIMAL(12, 2) NOT NULL,
  "discountPrice" DECIMAL(12, 2),
  "costPrice" DECIMAL(12, 2),
  "stock" INTEGER NOT NULL DEFAULT 0,
  "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "isFlashDeal" BOOLEAN NOT NULL DEFAULT FALSE,
  "flashDealEnd" TIMESTAMP WITH TIME ZONE,
  "images" TEXT[] NOT NULL DEFAULT '{}',
  "tags" TEXT[] NOT NULL DEFAULT '{}',
  "specifications" JSONB,
  "weightGrams" INTEGER DEFAULT 500,
  "categoryId" UUID NOT NULL REFERENCES "Category"("id") ON DELETE RESTRICT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE "ProductVariant" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "productId" UUID NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
  "sku" VARCHAR(80) NOT NULL UNIQUE,
  "size" VARCHAR(25),
  "color" VARCHAR(40),
  "colorHex" VARCHAR(10),
  "weight" VARCHAR(30),
  "additionalPrice" DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  "stock" INTEGER NOT NULL DEFAULT 0,
  "barcode" VARCHAR(60),
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 5. CART & WISHLIST
CREATE TABLE "Cart" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE "CartItem" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "cartId" UUID NOT NULL REFERENCES "Cart"("id") ON DELETE CASCADE,
  "productId" UUID NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
  "variantId" UUID REFERENCES "ProductVariant"("id") ON DELETE SET NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT "uq_cart_product_variant" UNIQUE ("cartId", "productId", "variantId")
);

CREATE TABLE "Wishlist" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "productId" UUID NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT "uq_wishlist_user_product" UNIQUE ("userId", "productId")
);

-- 6. ORDERS & ORDER ITEMS
CREATE TABLE "Order" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "orderNumber" VARCHAR(50) NOT NULL UNIQUE,
  "userId" UUID REFERENCES "User"("id") ON DELETE SET NULL,
  "shippingAddressId" UUID NOT NULL REFERENCES "Address"("id") ON DELETE RESTRICT,
  "subtotal" DECIMAL(12, 2) NOT NULL,
  "deliveryFee" DECIMAL(12, 2) NOT NULL,
  "discount" DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  "total" DECIMAL(12, 2) NOT NULL,
  "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
  "paymentMethod" "PaymentMethod" NOT NULL,
  "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "couponCode" VARCHAR(30),
  "customerNotes" TEXT,
  "adminNotes" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE "OrderItem" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "orderId" UUID NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
  "productId" UUID NOT NULL REFERENCES "Product"("id") ON DELETE RESTRICT,
  "variantId" UUID REFERENCES "ProductVariant"("id") ON DELETE SET NULL,
  "productTitle" VARCHAR(200) NOT NULL,
  "productSku" VARCHAR(80) NOT NULL,
  "variantLabel" VARCHAR(100),
  "unitPrice" DECIMAL(12, 2) NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "totalPrice" DECIMAL(12, 2) NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 7. PAYMENTS & COURIERS
CREATE TABLE "PaymentTransaction" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "orderId" UUID NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
  "provider" "PaymentMethod" NOT NULL,
  "transactionId" VARCHAR(100) UNIQUE,
  "paymentGatewayId" VARCHAR(120) UNIQUE,
  "amount" DECIMAL(12, 2) NOT NULL,
  "currency" VARCHAR(5) NOT NULL DEFAULT 'BDT',
  "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "gatewayResponse" JSONB,
  "rawPayload" JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE "CourierShipment" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "orderId" UUID NOT NULL UNIQUE REFERENCES "Order"("id") ON DELETE CASCADE,
  "provider" "CourierProvider" NOT NULL DEFAULT 'STEADFAST',
  "consignmentId" VARCHAR(80) NOT NULL UNIQUE,
  "trackingCode" VARCHAR(80) NOT NULL UNIQUE,
  "status" VARCHAR(50) NOT NULL DEFAULT 'BOOKED',
  "codAmount" DECIMAL(12, 2) NOT NULL,
  "deliveryCharge" DECIMAL(12, 2) NOT NULL,
  "recipientName" VARCHAR(100) NOT NULL,
  "recipientPhone" VARCHAR(20) NOT NULL,
  "recipientCity" VARCHAR(60) NOT NULL,
  "bookingDetails" JSONB,
  "lastWebhookAt" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 8. REVIEWS & COUPONS
CREATE TABLE "Review" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "productId" UUID NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
  "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "rating" INTEGER NOT NULL DEFAULT 5 CHECK ("rating" >= 1 AND "rating" <= 5),
  "comment" TEXT NOT NULL,
  "commentBn" TEXT,
  "reviewImages" TEXT[] NOT NULL DEFAULT '{}',
  "verifiedPurchase" BOOLEAN NOT NULL DEFAULT TRUE,
  "isApproved" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE "Coupon" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "code" VARCHAR(30) NOT NULL UNIQUE,
  "discountType" "DiscountType" NOT NULL DEFAULT 'PERCENTAGE',
  "discountValue" DECIMAL(12, 2) NOT NULL,
  "minOrderValue" DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  "maxDiscount" DECIMAL(12, 2),
  "usageLimit" INTEGER,
  "usageCount" INTEGER NOT NULL DEFAULT 0,
  "startDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "endDate" TIMESTAMP WITH TIME ZONE NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE "AuditLog" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID REFERENCES "User"("id") ON DELETE SET NULL,
  "action" VARCHAR(80) NOT NULL,
  "entityType" VARCHAR(60) NOT NULL,
  "entityId" VARCHAR(60),
  "ipAddress" VARCHAR(45),
  "metadata" JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
`;

export const ERD_ENTITIES = [
  {
    name: 'User',
    description: 'Central user identity supporting phone OTP and Google OAuth',
    fields: [
      { name: 'id', type: 'UUID', isPk: true },
      { name: 'phoneNumber', type: 'VARCHAR(20)', isUnique: true },
      { name: 'email', type: 'VARCHAR(120)', isUnique: true },
      { name: 'name', type: 'VARCHAR(100)' },
      { name: 'role', type: 'ENUM (CUSTOMER, ADMIN, MANAGER, RIDER)' },
      { name: 'status', type: 'ENUM (ACTIVE, SUSPENDED)' },
      { name: 'isPhoneVerified', type: 'BOOLEAN' }
    ]
  },
  {
    name: 'Profile',
    description: 'User personal profile, language preference and loyalty reward points',
    fields: [
      { name: 'id', type: 'UUID', isPk: true },
      { name: 'userId', type: 'UUID', isFk: true, isUnique: true, ref: 'User.id' },
      { name: 'gender', type: 'ENUM (MALE, FEMALE, OTHER)' },
      { name: 'preferredLanguage', type: 'VARCHAR(5) (en / bn)' },
      { name: 'rewardPoints', type: 'INTEGER' }
    ]
  },
  {
    name: 'Address',
    description: 'Saved delivery destinations with Dhaka vs Outside Dhaka flag',
    fields: [
      { name: 'id', type: 'UUID', isPk: true },
      { name: 'userId', type: 'UUID', isFk: true, ref: 'User.id' },
      { name: 'fullName', type: 'VARCHAR(100)' },
      { name: 'phone', type: 'VARCHAR(20)' },
      { name: 'division', type: 'VARCHAR(50)' },
      { name: 'district', type: 'VARCHAR(50)' },
      { name: 'area', type: 'ENUM (INSIDE_DHAKA, OUTSIDE_DHAKA)' },
      { name: 'streetAddress', type: 'TEXT' }
    ]
  },
  {
    name: 'Category',
    description: 'Hierarchical product categories with self-referencing tree',
    fields: [
      { name: 'id', type: 'UUID', isPk: true },
      { name: 'name / nameBn', type: 'VARCHAR(100) (Bilingual)' },
      { name: 'slug', type: 'VARCHAR(120)', isUnique: true },
      { name: 'parentId', type: 'UUID', isFk: true, ref: 'Category.id' },
      { name: 'isActive', type: 'BOOLEAN' },
      { name: 'orderIndex', type: 'INTEGER' }
    ]
  },
  {
    name: 'Product',
    description: 'Core inventory catalog with pricing, stock & flash deals',
    fields: [
      { name: 'id', type: 'UUID', isPk: true },
      { name: 'sku', type: 'VARCHAR(60)', isUnique: true },
      { name: 'slug', type: 'VARCHAR(250)', isUnique: true },
      { name: 'title / titleBn', type: 'TEXT (Bilingual)' },
      { name: 'basePrice / discountPrice', type: 'DECIMAL(12,2)' },
      { name: 'costPrice', type: 'DECIMAL(12,2)' },
      { name: 'stock', type: 'INTEGER' },
      { name: 'isFlashDeal', type: 'BOOLEAN' },
      { name: 'categoryId', type: 'UUID', isFk: true, ref: 'Category.id' }
    ]
  },
  {
    name: 'ProductVariant',
    description: 'SKU variants: Size, Color hex, and Weight with price adjustments',
    fields: [
      { name: 'id', type: 'UUID', isPk: true },
      { name: 'productId', type: 'UUID', isFk: true, ref: 'Product.id' },
      { name: 'sku', type: 'VARCHAR(80)', isUnique: true },
      { name: 'size', type: 'VARCHAR(25)' },
      { name: 'color / colorHex', type: 'VARCHAR(40)' },
      { name: 'additionalPrice', type: 'DECIMAL(12,2)' },
      { name: 'stock', type: 'INTEGER' }
    ]
  },
  {
    name: 'Cart',
    description: 'Persistent server-side user cart instance',
    fields: [
      { name: 'id', type: 'UUID', isPk: true },
      { name: 'userId', type: 'UUID', isFk: true, isUnique: true, ref: 'User.id' }
    ]
  },
  {
    name: 'CartItem',
    description: 'Product variant and quantity assigned to user cart',
    fields: [
      { name: 'id', type: 'UUID', isPk: true },
      { name: 'cartId', type: 'UUID', isFk: true, ref: 'Cart.id' },
      { name: 'productId', type: 'UUID', isFk: true, ref: 'Product.id' },
      { name: 'variantId', type: 'UUID', isFk: true, ref: 'ProductVariant.id' },
      { name: 'quantity', type: 'INTEGER' }
    ]
  },
  {
    name: 'Wishlist',
    description: 'Customer saved favorite products',
    fields: [
      { name: 'id', type: 'UUID', isPk: true },
      { name: 'userId', type: 'UUID', isFk: true, ref: 'User.id' },
      { name: 'productId', type: 'UUID', isFk: true, ref: 'Product.id' }
    ]
  },
  {
    name: 'Order',
    description: 'Transactional master record with live lifecycle status',
    fields: [
      { name: 'id', type: 'UUID', isPk: true },
      { name: 'orderNumber', type: 'VARCHAR(50)', isUnique: true },
      { name: 'userId', type: 'UUID', isFk: true, ref: 'User.id' },
      { name: 'shippingAddressId', type: 'UUID', isFk: true, ref: 'Address.id' },
      { name: 'subtotal / deliveryFee', type: 'DECIMAL(12,2)' },
      { name: 'discount / total', type: 'DECIMAL(12,2)' },
      { name: 'status', type: 'ENUM (PENDING, PROCESSING, SHIPPED, DELIVERED)' },
      { name: 'paymentMethod', type: 'ENUM (BKASH, NAGAD, SSLCOMMERZ, COD)' }
    ]
  },
  {
    name: 'OrderItem',
    description: 'Immutable snapshot of products and variants at checkout time',
    fields: [
      { name: 'id', type: 'UUID', isPk: true },
      { name: 'orderId', type: 'UUID', isFk: true, ref: 'Order.id' },
      { name: 'productId', type: 'UUID', isFk: true, ref: 'Product.id' },
      { name: 'variantId', type: 'UUID', isFk: true, ref: 'ProductVariant.id' },
      { name: 'productTitle / productSku', type: 'VARCHAR' },
      { name: 'unitPrice / totalPrice', type: 'DECIMAL(12,2)' },
      { name: 'quantity', type: 'INTEGER' }
    ]
  },
  {
    name: 'PaymentTransaction',
    description: 'Audit logs for bKash, Nagad, and SSLCommerz gateway callbacks',
    fields: [
      { name: 'id', type: 'UUID', isPk: true },
      { name: 'orderId', type: 'UUID', isFk: true, ref: 'Order.id' },
      { name: 'provider', type: 'ENUM (BKASH, NAGAD, SSLCOMMERZ)' },
      { name: 'transactionId', type: 'VARCHAR(100)', isUnique: true },
      { name: 'paymentGatewayId', type: 'VARCHAR(120)', isUnique: true },
      { name: 'amount', type: 'DECIMAL(12,2)' },
      { name: 'status', type: 'ENUM (PENDING, COMPLETED, FAILED)' }
    ]
  },
  {
    name: 'CourierShipment',
    description: 'Steadfast & Pathao parcel consignment records & real-time webhook updates',
    fields: [
      { name: 'id', type: 'UUID', isPk: true },
      { name: 'orderId', type: 'UUID', isFk: true, ref: 'Order.id' },
      { name: 'provider', type: 'ENUM (STEADFAST, PATHAO)' },
      { name: 'consignmentId', type: 'VARCHAR(80)', isUnique: true },
      { name: 'trackingCode', type: 'VARCHAR(80)', isUnique: true },
      { name: 'codAmount', type: 'DECIMAL(12,2)' },
      { name: 'status', type: 'VARCHAR(50)' }
    ]
  },
  {
    name: 'Review',
    description: 'Customer ratings (1-5 stars), bilingual comments & photo attachments',
    fields: [
      { name: 'id', type: 'UUID', isPk: true },
      { name: 'productId', type: 'UUID', isFk: true, ref: 'Product.id' },
      { name: 'userId', type: 'UUID', isFk: true, ref: 'User.id' },
      { name: 'rating', type: 'INTEGER (1 to 5)' },
      { name: 'comment', type: 'TEXT' },
      { name: 'verifiedPurchase', type: 'BOOLEAN' }
    ]
  },
  {
    name: 'Coupon',
    description: 'Promo codes with percentage or flat BDT discounts',
    fields: [
      { name: 'id', type: 'UUID', isPk: true },
      { name: 'code', type: 'VARCHAR(30)', isUnique: true },
      { name: 'discountType', type: 'ENUM (PERCENTAGE, FIXED)' },
      { name: 'discountValue', type: 'DECIMAL(12,2)' },
      { name: 'minOrderValue', type: 'DECIMAL(12,2)' },
      { name: 'usageLimit / usageCount', type: 'INTEGER' },
      { name: 'isActive', type: 'BOOLEAN' }
    ]
  },
  {
    name: 'AuditLog',
    description: 'Security & compliance log tracking admin actions and order updates',
    fields: [
      { name: 'id', type: 'UUID', isPk: true },
      { name: 'userId', type: 'UUID', isFk: true, ref: 'User.id' },
      { name: 'action', type: 'VARCHAR(80)' },
      { name: 'entityType / entityId', type: 'VARCHAR(60)' },
      { name: 'ipAddress', type: 'VARCHAR(45)' }
    ]
  }
];

export const SYSTEM_ARCHITECTURE_LAYERS = [
  {
    layer: '1. Client Presentation Tier',
    tech: 'Next.js 15 (App Router, React 19) & Flutter (Dart 3.5+ BLoC)',
    responsibilities: [
      'Next.js Storefront with SSR for SEO optimization & ISR for product catalog',
      'Flutter Cross-Platform mobile application (Android & iOS) with offline caching',
      'Bilingual i18n localization (English & Bengali script font rendering)',
      'bKash / Nagad WebView integration & Cash On Delivery single-page checkout'
    ]
  },
  {
    layer: '2. API Gateway & Security Tier',
    tech: 'Node.js Express / NestJS + Redis Rate Limiter + JWT Auth',
    responsibilities: [
      'Reverse proxy, SSL termination, and IP-based rate limiting for flash sales',
      'Phone OTP verification service via Bangladeshi SMS Gateway (Greenweb / Infobip)',
      'Role-based access control (RBAC): SuperAdmin, Merchant Manager, Courier Rider',
      'JSON Web Token (JWT) stateless auth with short-lived access & refresh rotation'
    ]
  },
  {
    layer: '3. Core Business Services Tier',
    tech: 'Modular Domain Services (Catalog, Cart, Checkout, Dispatch)',
    responsibilities: [
      'Dynamic Delivery Fee calculator: Inside Dhaka (৳60) vs Outside Dhaka (৳120)',
      'Automated stock reservation on checkout to prevent overselling flash sales',
      'Invoice PDF generation engine using PDFKit / Puppeteer with thermal printer mode',
      'Event-driven order status lifecycle: Pending -> Processing -> Shipped -> Delivered'
    ]
  },
  {
    layer: '4. 3rd-Party Integration Gateways',
    tech: 'bKash API v1.2, Nagad Gateway, Steadfast & Pathao Courier APIs',
    responsibilities: [
      'bKash Tokenized Checkout API: Create Payment, Execute Payment, Query & Refund',
      'Steadfast Courier API: One-click parcel booking with COD amount & consignment ID',
      'Pathao Courier API: Merchant parcel dispatch with webhook tracking listener',
      'Automated fallback retry queues for network hiccups during payment execution'
    ]
  },
  {
    layer: '5. Persistence & Cache Tier',
    tech: 'PostgreSQL 16 (Prisma ORM) + Redis In-Memory Store',
    responsibilities: [
      'ACID transactional consistency for inventory stock decrement & order commits',
      'PostgreSQL full-text search indexes across Bangla and English product titles',
      'Redis Cache for live flash deal countdowns, top categories, and user sessions',
      'Scheduled background workers (BullMQ) for courier delivery status polling'
    ]
  }
];

export const PROJECT_FOLDER_STRUCTURE = `
bazaarpulse-enterprise/
├── backend-api/                         # Node.js (Express/NestJS) API Microservices
│   ├── src/
│   │   ├── config/                      # Environment variables, Redis, Prisma clients
│   │   ├── modules/
│   │   │   ├── auth/                    # Phone OTP, JWT tokens, Google OAuth
│   │   │   ├── catalog/                 # Products, Categories, Variants, Full-text Search
│   │   │   ├── orders/                  # Order placement, status state machine
│   │   │   ├── payments/
│   │   │   │   ├── bkash.service.ts     # bKash Tokenized API integration
│   │   │   │   ├── nagad.service.ts     # Nagad Signature & Decryption
│   │   │   │   └── sslcommerz.service.ts# SSLCommerz Hosted Session
│   │   │   ├── couriers/
│   │   │   │   ├── steadfast.service.ts # Steadfast API Consignment & Webhooks
│   │   │   │   └── pathao.service.ts    # Pathao B2B Courier Gateway
│   │   │   └── admin/                   # Analytics, Inventory, Invoicing
│   │   ├── middlewares/                 # Auth guard, RBAC, Rate-limit, Error Handler
│   │   ├── prisma/
│   │   │   ├── schema.prisma            # Production PostgreSQL schema
│   │   │   └── seed.ts                  # Bangladeshi sample catalog seed
│   │   └── server.ts
│   └── package.json
│
├── frontend-web/                        # Next.js 15+ Storefront & Admin Portal
│   ├── src/
│   │   ├── app/
│   │   │   ├── (storefront)/            # Customer facing routes
│   │   │   │   ├── page.tsx             # Home: Hero, Flash Deals, Categories
│   │   │   │   ├── products/[slug]/     # PDP: Multi-image zoom, variants, reviews
│   │   │   │   ├── checkout/            # Single-page checkout with Dhaka area calc
│   │   │   │   └── track-order/         # Live milestone timeline
│   │   │   ├── (admin)/
│   │   │   │   ├── admin/dashboard/     # Sales analytics, low-stock alerts
│   │   │   │   ├── admin/inventory/     # Add/edit products, variant matrix
│   │   │   │   └── admin/couriers/      # Steadfast & Pathao dispatch board
│   │   ├── components/                  # UI components (Zero-pill, Tailwind CSS)
│   │   ├── store/                       # Zustand / Redux Toolkit client state
│   │   └── i18n/                        # Bengali & English dictionaries
│   └── tailwind.config.ts
│
└── mobile-flutter/                      # Cross-Platform Flutter 3.5+ (Android & iOS)
    ├── lib/
    │   ├── core/
    │   │   ├── network/                 # Dio HTTP client, Interceptors, Token Refresh
    │   │   ├── constants/               # Colors, Endpoints, BDT Currency formatter
    │   │   └── services/
    │   │       ├── bkash_payment.dart   # Flutter bKash in-app SDK / WebView
    │   │       └── tracking_service.dart# Push notification order updates
    │   ├── features/
    │   │   ├── auth/                    # Phone OTP authentication screen
    │   │   ├── home/                    # Carousel, Flash sale timer, Grid
    │   │   ├── product_detail/          # Zoomable gallery, Variant chips, Reviews
    │   │   ├── cart/                    # Cart drawer, Coupon, Area delivery toggle
    │   │   ├── checkout/                # Single-page checkout with bKash/Nagad
    │   │   └── order_tracking/          # Timeline stepper with courier updates
    │   └── main.dart                    # MultiBlocProvider / Riverpod entry point
    └── pubspec.yaml
`;

export const REST_API_ENDPOINTS = [
  {
    group: 'Authentication & OTP',
    endpoints: [
      {
        method: 'POST',
        path: '/api/v1/auth/otp/send',
        summary: 'Send 6-digit OTP to Bangladeshi mobile number',
        sampleRequest: { phoneNumber: '01711223344' },
        sampleResponse: { success: true, message: 'OTP sent successfully. Valid for 3 minutes.', expiresInSeconds: 180 }
      },
      {
        method: 'POST',
        path: '/api/v1/auth/otp/verify',
        summary: 'Verify OTP and issue JWT access & refresh tokens',
        sampleRequest: { phoneNumber: '01711223344', otp: '482910' },
        sampleResponse: { success: true, token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6...', user: { id: 'usr-1', name: 'Rakibul Hasan', role: 'CUSTOMER' } }
      }
    ]
  },
  {
    group: 'Products & Catalog',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/products?category=mens-fashion&isFlashDeal=true',
        summary: 'Query products with filters, search, and pagination',
        sampleRequest: null,
        sampleResponse: {
          total: 48,
          page: 1,
          limit: 10,
          data: [
            {
              id: 'prod-001',
              title: 'Heritage Embroidered Silk Panjabi',
              price: 3850,
              discountPrice: 2950,
              stock: 14,
              rating: 4.9
            }
          ]
        }
      },
      {
        method: 'GET',
        path: '/api/v1/products/:id',
        summary: 'Get product detail with all variants, specifications and reviews',
        sampleRequest: null,
        sampleResponse: {
          id: 'prod-001',
          title: 'Heritage Embroidered Silk Panjabi - Royal Navy',
          variants: [{ sku: 'PAN-HER-01-40', size: '40 (L)', stock: 6, additionalPrice: 0 }],
          rating: 4.9,
          reviews: [{ userName: 'Tanvir Ahmed', rating: 5, comment: 'Exceptional silk fabric!' }]
        }
      }
    ]
  },
  {
    group: 'Checkout & Orders',
    endpoints: [
      {
        method: 'POST',
        path: '/api/v1/orders/checkout',
        summary: 'Create new order with automated Dhaka vs Outside Dhaka shipping calculation',
        sampleRequest: {
          fullName: 'Siam Chowdhury',
          phone: '01711223344',
          deliveryArea: 'INSIDE_DHAKA',
          address: 'House 42, Road 11, Banani, Dhaka',
          paymentMethod: 'BKASH',
          couponCode: 'EID2026',
          items: [{ productId: 'prod-001', variantId: 'v-001-40', quantity: 1 }]
        },
        sampleResponse: {
          success: true,
          orderId: 'ord-8801',
          orderNumber: 'BP-2026-8801',
          subtotal: 2950,
          deliveryFee: 60,
          discount: 442,
          total: 2568,
          status: 'PENDING',
          paymentStatus: 'INITIATED'
        }
      },
      {
        method: 'GET',
        path: '/api/v1/orders/:orderNumber/track',
        summary: 'Live order tracking with milestone timestamps and courier details',
        sampleRequest: null,
        sampleResponse: {
          orderNumber: 'BP-2026-8801',
          status: 'SHIPPED',
          courier: 'STEADFAST',
          trackingCode: 'STEADFAST-DHK-9941',
          consignmentId: 'STF-889104',
          estimatedDelivery: 'Tomorrow, Oct 6th'
        }
      }
    ]
  },
  {
    group: 'Payment Gateways (bKash & Nagad)',
    endpoints: [
      {
        method: 'POST',
        path: '/api/v1/payments/bkash/create',
        summary: 'Initialize bKash Tokenized Checkout Session',
        sampleRequest: { orderId: 'ord-8801', amount: 2568, invoiceNumber: 'BP-2026-8801' },
        sampleResponse: {
          statusCode: '0000',
          statusMessage: 'Successful',
          paymentID: 'TR0011XX992384',
          bkashURL: 'https://checkout.sandbox.bka.sh/v1.2.0-beta/checkout/index.html?token=...'
        }
      },
      {
        method: 'POST',
        path: '/api/v1/payments/bkash/execute',
        summary: 'Execute bKash payment verification after customer PIN submission',
        sampleRequest: { paymentID: 'TR0011XX992384' },
        sampleResponse: {
          statusCode: '0000',
          trxID: 'BKASH-9K2L4P8M',
          amount: '2568.00',
          transactionStatus: 'Completed',
          paymentExecuteTime: '2026-10-05 12:45:10'
        }
      }
    ]
  },
  {
    group: 'Courier Dispatch APIs (Steadfast & Pathao)',
    endpoints: [
      {
        method: 'POST',
        path: '/api/v1/courier/steadfast/book-order',
        summary: 'Dispatch order parcel to Steadfast Courier via B2B API',
        sampleRequest: {
          invoice: 'BP-2026-8801',
          recipient_name: 'Siam Chowdhury',
          recipient_phone: '01711223344',
          recipient_address: 'House 42, Road 11, Banani, Dhaka',
          cod_amount: 0,
          note: 'Handle silk fabric gently'
        },
        sampleResponse: {
          status: 200,
          message: 'Order created successfully',
          consignment: {
            consignment_id: 'STF-889104',
            tracking_code: 'STEADFAST-DHK-9941',
            delivery_charge: 60
          }
        }
      },
      {
        method: 'POST',
        path: '/api/v1/courier/webhooks/steadfast',
        summary: 'Receive automated delivery status updates from Steadfast webhooks',
        sampleRequest: {
          consignment_id: 'STF-889104',
          tracking_code: 'STEADFAST-DHK-9941',
          status: 'delivered'
        },
        sampleResponse: { success: true, message: 'Order status updated to DELIVERED' }
      }
    ]
  },
  {
    group: 'Admin Management',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/admin/analytics/overview',
        summary: 'Total revenue, active orders, sales graph and low-stock alerts',
        sampleRequest: null,
        sampleResponse: {
          totalRevenue: 495800,
          activeOrders: 18,
          totalProducts: 142,
          lowStockCount: 4,
          weeklyRevenue: [45000, 62000, 78000, 51000, 89000, 94000, 76800]
        }
      }
    ]
  }
];

export const FLUTTER_CODE_SNIPPET = `// ==========================================
// Flutter 3.5+ BLoC Architecture - BazaarPulse Mobile
// File: lib/features/checkout/presentation/checkout_screen.dart
// ==========================================

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class CheckoutScreen extends StatefulWidget {
  final double subtotal;
  final List<CartItemModel> items;

  const CheckoutScreen({
    super.key,
    required this.subtotal,
    required this.items,
  });

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();

  DeliveryArea _deliveryArea = DeliveryArea.insideDhaka;
  PaymentMethod _paymentMethod = PaymentMethod.bkash;

  double get deliveryFee => _deliveryArea == DeliveryArea.insideDhaka ? 60.0 : 120.0;
  double get total => widget.subtotal + deliveryFee;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Checkout · চেকআউট', style: TextStyle(fontWeight: FontWeight.bold)),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Delivery Area Selector
              const Text('Delivery Location / ডেলিভারি এলাকা', style: TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              RadioListTile<DeliveryArea>(
                title: const Text('Inside Dhaka (ঢাকার ভেতরে) · ৳60'),
                subtitle: const Text('24-48 Hours Express Delivery via Steadfast'),
                value: DeliveryArea.insideDhaka,
                groupValue: _deliveryArea,
                onChanged: (val) => setState(() => _deliveryArea = val!),
              ),
              RadioListTile<DeliveryArea>(
                title: const Text('Outside Dhaka (ঢাকার বাইরে) · ৳120'),
                subtitle: const Text('2-4 Days Home Delivery Nationwide'),
                value: DeliveryArea.outsideDhaka,
                groupValue: _deliveryArea,
                onChanged: (val) => setState(() => _deliveryArea = val!),
              ),
              const Divider(height: 32),

              // Payment Method Choice
              const Text('Payment Method / পেমেন্ট মাধ্যম', style: TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              _buildPaymentOption(
                method: PaymentMethod.bkash,
                title: 'bKash Online Payment (বিকাশ)',
                asset: 'assets/icons/bkash_logo.png',
                color: const Color(0xFFD12053),
              ),
              _buildPaymentOption(
                method: PaymentMethod.cod,
                title: 'Cash on Delivery (ক্যাশ অন ডেলিভারি)',
                asset: 'assets/icons/cod_icon.png',
                color: Colors.teal,
              ),

              const SizedBox(height: 24),
              // Order Summary Card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Subtotal:'),
                          Text('৳\${widget.subtotal.toStringAsFixed(0)}'),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Delivery Charge:'),
                          Text('৳\${deliveryFee.toStringAsFixed(0)}'),
                        ],
                      ),
                      const Divider(height: 20),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Total Payable:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          Text(
                            '৳\${total.toStringAsFixed(0)}',
                            style: TextStyle(color: theme.primaryColor, fontWeight: FontWeight.bold, fontSize: 18),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              // Submit Button
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0F172A),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  onPressed: _handlePlaceOrder,
                  child: const Text('Confirm & Place Order · অর্ডার সম্পন্ন করুন', style: TextStyle(fontSize: 16)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPaymentOption({
    required PaymentMethod method,
    required String title,
    required String asset,
    required Color color,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        border: Border.all(
          color: _paymentMethod == method ? color : Colors.grey.shade300,
          width: _paymentMethod == method ? 2 : 1,
        ),
        borderRadius: BorderRadius.circular(8),
      ),
      child: RadioListTile<PaymentMethod>(
        value: method,
        groupValue: _paymentMethod,
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w500)),
        onChanged: (val) => setState(() => _paymentMethod = val!),
      ),
    );
  }

  void _handlePlaceOrder() {
    if (_formKey.currentState?.validate() ?? true) {
      if (_paymentMethod == PaymentMethod.bkash) {
        // Launch bKash Tokenized WebView Checkout flow
        context.read<CheckoutBloc>().add(InitiateBkashPaymentEvent(total: total));
      } else {
        context.read<CheckoutBloc>().add(PlaceCodOrderEvent());
      }
    }
  }
}
`;

export const BKASH_BACKEND_CONTROLLER = `// ==========================================
// Express / Node.js - bKash Tokenized Checkout Handler
// File: src/modules/payments/bkash.controller.ts
// ==========================================

import axios from 'axios';
import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';

const BKASH_BASE_URL = process.env.BKASH_APP_BASE_URL || 'https://tokenized.sandbox.bka.sh/v1.2.0-beta';

// 1. Grant Token from bKash API
async function getBkashAuthToken(): Promise<string> {
  const response = await axios.post(
    \`\${BKASH_BASE_URL}/tokenized/checkout/token/grant\`,
    {
      app_key: process.env.BKASH_APP_KEY,
      app_secret: process.env.BKASH_APP_SECRET
    },
    {
      headers: {
        'username': process.env.BKASH_USERNAME,
        'password': process.env.BKASH_PASSWORD,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data.id_token;
}

// 2. Create Payment URL
export async function createBkashPayment(req: Request, res: Response) {
  try {
    const { orderId } = req.body;
    const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
    const idToken = await getBkashAuthToken();

    const createPayload = {
      mode: '0011',
      payerReference: order.shippingAddressId,
      callbackURL: \`\${process.env.APP_URL}/api/v1/payments/bkash/callback\`,
      amount: order.total.toString(),
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: order.orderNumber
    };

    const response = await axios.post(
      \`\${BKASH_BASE_URL}/tokenized/checkout/create\`,
      createPayload,
      {
        headers: {
          'Authorization': idToken,
          'X-APP-Key': process.env.BKASH_APP_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    // Save transaction initiation
    await prisma.paymentTransaction.create({
      data: {
        orderId: order.id,
        provider: 'BKASH',
        paymentGatewayId: response.data.paymentID,
        amount: order.total,
        status: 'INITIATED',
        rawPayload: response.data
      }
    });

    return res.json({
      success: true,
      paymentID: response.data.paymentID,
      bkashURL: response.data.bkashURL
    });
  } catch (error: any) {
    console.error('bKash create payment error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to initiate bKash payment' });
  }
}

// 3. Execute Payment Callback
export async function executeBkashCallback(req: Request, res: Response) {
  try {
    const { paymentID, status } = req.query;

    if (status !== 'success') {
      return res.redirect(\`/checkout?error=bkash_\${status}\`);
    }

    const idToken = await getBkashAuthToken();
    const executeResponse = await axios.post(
      \`\${BKASH_BASE_URL}/tokenized/checkout/execute\`,
      { paymentID },
      {
        headers: {
          'Authorization': idToken,
          'X-APP-Key': process.env.BKASH_APP_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = executeResponse.data;
    if (data.statusCode === '0000') {
      // Payment Successful - update order & trigger Steadfast auto-booking!
      const trx = await prisma.paymentTransaction.update({
        where: { paymentGatewayId: String(paymentID) },
        data: {
          transactionId: data.trxID,
          status: 'COMPLETED',
          gatewayResponse: data
        }
      });

      await prisma.order.update({
        where: { id: trx.orderId },
        data: {
          paymentStatus: 'COMPLETED',
          status: 'PROCESSING'
        }
      });

      return res.redirect(\`/order-success?orderId=\${trx.orderId}&trxId=\${data.trxID}\`);
    }

    return res.redirect(\`/checkout?error=bkash_failed&code=\${data.statusCode}\`);
  } catch (err: any) {
    return res.status(500).json({ error: 'bKash execution failed' });
  }
}
`;

export const STEADFAST_COURIER_SERVICE = `// ==========================================
// Express / Node.js - Steadfast Courier API Integration
// File: src/modules/couriers/steadfast.service.ts
// ==========================================

import axios from 'axios';
import { prisma } from '../../config/prisma';

const STEADFAST_API_URL = process.env.STEADFAST_API_URL || 'https://portal.steadfast.com.bd/api/v1';

export class SteadfastCourierService {
  private static headers = {
    'Api-Key': process.env.STEADFAST_API_KEY || '',
    'Secret-Key': process.env.STEADFAST_SECRET_KEY || '',
    'Content-Type': 'application/json'
  };

  /**
   * One-click automated parcel booking to Steadfast Courier
   */
  public static async bookParcel(orderId: string) {
    const order = await prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      include: { shippingAddress: true, items: true }
    });

    const isCod = order.paymentMethod === 'COD' && order.paymentStatus === 'PENDING';
    const codAmount = isCod ? Number(order.total) : 0;

    const payload = {
      invoice: order.orderNumber,
      recipient_name: order.shippingAddress.fullName,
      recipient_phone: order.shippingAddress.phone,
      recipient_address: order.shippingAddress.streetAddress,
      cod_amount: codAmount,
      note: \`Total Items: \${order.items.length}. Delivery area: \${order.shippingAddress.area}\`
    };

    const response = await axios.post(
      \`\${STEADFAST_API_URL}/create_order\`,
      payload,
      { headers: this.headers }
    );

    if (response.data.status === 200) {
      const consignment = response.data.consignment;

      // Upsert shipment record
      const shipment = await prisma.courierShipment.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          provider: 'STEADFAST',
          consignmentId: String(consignment.consignment_id),
          trackingCode: consignment.tracking_code,
          status: 'BOOKED',
          codAmount,
          deliveryCharge: consignment.delivery_charge || (order.shippingAddress.area === 'INSIDE_DHAKA' ? 60 : 120),
          recipientName: order.shippingAddress.fullName,
          recipientPhone: order.shippingAddress.phone,
          recipientCity: order.shippingAddress.district,
          bookingDetails: consignment
        },
        update: {
          consignmentId: String(consignment.consignment_id),
          trackingCode: consignment.tracking_code,
          status: 'BOOKED'
        }
      });

      // Update Order Status to SHIPPED
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'SHIPPED' }
      });

      return shipment;
    }

    throw new Error(response.data.message || 'Steadfast booking failed');
  }

  /**
   * Real-time parcel status inquiry
   */
  public static async trackConsignment(trackingCode: string) {
    const response = await axios.get(
      \`\${STEADFAST_API_URL}/status_by_trackingcode/\${trackingCode}\`,
      { headers: this.headers }
    );
    return response.data;
  }
}
`;
