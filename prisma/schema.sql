-- ==============================================================================
-- PostgreSQL 15+ / 16+ Production DDL Schema - BazaarPulse Enterprise
-- Compatible with Supabase, Neon, AWS RDS PostgreSQL, Google Cloud SQL
-- ==============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For Bengali & English fuzzy search

-- -----------------------------------------------------------------------------
-- 1. ENUMS
-- -----------------------------------------------------------------------------

CREATE TYPE "Role" AS ENUM (
  'CUSTOMER',
  'ADMIN',
  'MANAGER',
  'WAREHOUSE_STAFF',
  'COURIER_RIDER'
);

CREATE TYPE "UserStatus" AS ENUM (
  'ACTIVE',
  'SUSPENDED',
  'PENDING_VERIFICATION',
  'DEACTIVATED'
);

CREATE TYPE "Gender" AS ENUM (
  'MALE',
  'FEMALE',
  'OTHER',
  'PREFER_NOT_TO_SAY'
);

CREATE TYPE "ProductStatus" AS ENUM (
  'DRAFT',
  'ACTIVE',
  'ARCHIVED',
  'OUT_OF_STOCK'
);

CREATE TYPE "OrderStatus" AS ENUM (
  'PENDING',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'RETURNED'
);

CREATE TYPE "PaymentMethod" AS ENUM (
  'BKASH',
  'NAGAD',
  'UPAY',
  'ROCKET',
  'SSLCOMMERZ',
  'COD'
);

CREATE TYPE "PaymentStatus" AS ENUM (
  'PENDING',
  'INITIATED',
  'COMPLETED',
  'FAILED',
  'REFUNDED'
);

CREATE TYPE "DeliveryArea" AS ENUM (
  'INSIDE_DHAKA',
  'OUTSIDE_DHAKA',
  'DHAKA_SUB_URBAN'
);

CREATE TYPE "CourierProvider" AS ENUM (
  'STEADFAST',
  'PATHAO',
  'REDX',
  'PAPERFLY'
);

CREATE TYPE "DiscountType" AS ENUM (
  'PERCENTAGE',
  'FIXED'
);

-- -----------------------------------------------------------------------------
-- 2. USERS & PROFILES
-- -----------------------------------------------------------------------------

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

CREATE INDEX "idx_user_phone" ON "User"("phoneNumber");
CREATE INDEX "idx_user_email" ON "User"("email");
CREATE INDEX "idx_user_role_status" ON "User"("role", "status");

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

CREATE INDEX "idx_address_user" ON "Address"("userId");
CREATE INDEX "idx_address_area" ON "Address"("area");
CREATE INDEX "idx_address_district" ON "Address"("district");

-- -----------------------------------------------------------------------------
-- 3. CATEGORIES & HIERARCHY
-- -----------------------------------------------------------------------------

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

CREATE INDEX "idx_category_slug" ON "Category"("slug");
CREATE INDEX "idx_category_parent" ON "Category"("parentId");
CREATE INDEX "idx_category_active_order" ON "Category"("isActive", "orderIndex");

-- -----------------------------------------------------------------------------
-- 4. PRODUCTS & PRODUCT VARIANTS
-- -----------------------------------------------------------------------------

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

CREATE INDEX "idx_product_slug" ON "Product"("slug");
CREATE INDEX "idx_product_sku" ON "Product"("sku");
CREATE INDEX "idx_product_category" ON "Product"("categoryId");
CREATE INDEX "idx_product_flash_deal" ON "Product"("isFlashDeal", "flashDealEnd");
CREATE INDEX "idx_product_status" ON "Product"("status", "isActive");

-- Full-text search index for English and Bangla text search
CREATE INDEX "idx_product_title_trgm" ON "Product" USING gin ("title" gin_trgm_ops);
CREATE INDEX "idx_product_title_bn_trgm" ON "Product" USING gin ("titleBn" gin_trgm_ops);

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

CREATE INDEX "idx_variant_product" ON "ProductVariant"("productId");
CREATE INDEX "idx_variant_sku" ON "ProductVariant"("sku");
CREATE INDEX "idx_variant_size" ON "ProductVariant"("size");
CREATE INDEX "idx_variant_color" ON "ProductVariant"("color");

-- -----------------------------------------------------------------------------
-- 5. CART & WISHLIST
-- -----------------------------------------------------------------------------

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

CREATE INDEX "idx_cartitem_cart" ON "CartItem"("cartId");
CREATE INDEX "idx_cartitem_product" ON "CartItem"("productId");

CREATE TABLE "Wishlist" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "productId" UUID NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT "uq_wishlist_user_product" UNIQUE ("userId", "productId")
);

CREATE INDEX "idx_wishlist_user" ON "Wishlist"("userId");

-- -----------------------------------------------------------------------------
-- 6. ORDERS & ORDER ITEMS
-- -----------------------------------------------------------------------------

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

CREATE INDEX "idx_order_number" ON "Order"("orderNumber");
CREATE INDEX "idx_order_user" ON "Order"("userId");
CREATE INDEX "idx_order_status" ON "Order"("status");
CREATE INDEX "idx_order_payment_status" ON "Order"("paymentStatus");
CREATE INDEX "idx_order_created" ON "Order"("createdAt");

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

CREATE INDEX "idx_orderitem_order" ON "OrderItem"("orderId");
CREATE INDEX "idx_orderitem_product" ON "OrderItem"("productId");

-- -----------------------------------------------------------------------------
-- 7. PAYMENT TRANSACTIONS & COURIER SHIPMENTS
-- -----------------------------------------------------------------------------

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

CREATE INDEX "idx_payment_order" ON "PaymentTransaction"("orderId");
CREATE INDEX "idx_payment_trx" ON "PaymentTransaction"("transactionId");
CREATE INDEX "idx_payment_gateway_id" ON "PaymentTransaction"("paymentGatewayId");

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

CREATE INDEX "idx_courier_consignment" ON "CourierShipment"("consignmentId");
CREATE INDEX "idx_courier_tracking" ON "CourierShipment"("trackingCode");

-- -----------------------------------------------------------------------------
-- 8. CUSTOMER REVIEWS
-- -----------------------------------------------------------------------------

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

CREATE INDEX "idx_review_product" ON "Review"("productId");
CREATE INDEX "idx_review_user" ON "Review"("userId");
CREATE INDEX "idx_review_rating" ON "Review"("rating");

-- -----------------------------------------------------------------------------
-- 9. PROMOTIONS & AUDIT LOGS
-- -----------------------------------------------------------------------------

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

CREATE INDEX "idx_coupon_code" ON "Coupon"("code");
CREATE INDEX "idx_coupon_dates" ON "Coupon"("isActive", "startDate", "endDate");

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

CREATE INDEX "idx_audit_entity" ON "AuditLog"("entityType", "entityId");
CREATE INDEX "idx_audit_user" ON "AuditLog"("userId");
CREATE INDEX "idx_audit_action" ON "AuditLog"("action");
