# Complete Backend Implementation Plan
## iHerb Clone - E-commerce Platform

**Tech Stack:**
- MongoDB (Database)
- NextAuth.js (Authentication - Phone & Email)
- Paystack Ghana (Payment Processing)
- Cloudinary (Image Management)
- Next.js 16 App Router (API Routes)
- TypeScript

**Priority:** Speed, Scalability, Performance

---

## Table of Contents
1. [Database Schema Design](#database-schema-design)
2. [Authentication System](#authentication-system)
3. [API Routes Architecture](#api-routes-architecture)
4. [Payment Integration](#payment-integration)
5. [Image Management](#image-management)
6. [Order Processing Flow](#order-processing-flow)
7. [Notification System](#notification-system)
8. [Performance Optimizations](#performance-optimizations)
9. [Scalability Considerations](#scalability-considerations)
10. [Security Measures](#security-measures)
11. [Seed Script Service](#seed-script-service)
12. [Implementation Phases](#implementation-phases)
13. [Required Environment Variables](#required-environment-variables)
14. [Required Dependencies](#required-dependencies)
15. [Additional Recommendations](#additional-recommendations)

---

## 1. Database Schema Design

### MongoDB Collections

#### 1.1 Users Collection
```typescript
{
  _id: ObjectId,
  email: string (unique, sparse index),
  phone: string (unique, sparse index, format: +233XXXXXXXXX),
  emailVerified: boolean,
  phoneVerified: boolean,
  password: string (hashed with bcrypt),
  name: {
    first: string,
    last: string
  },
  addresses: [{
    _id: ObjectId,
    type: 'shipping' | 'billing',
    firstName: string,
    lastName: string,
    address: string,
    apartment?: string,
    city: string,
    region: string,
    postalCode?: string,
    phone: string,
    isDefault: boolean,
    createdAt: Date
  }],
  role: 'customer' | 'admin',
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date,
  preferences: {
    currency: 'GHS' | 'USD',
    language: string,
    notifications: {
      email: boolean,
      sms: boolean
    }
  }
}
```

**Indexes:**
- `email: 1` (unique, sparse)
- `phone: 1` (unique, sparse)
- `createdAt: -1`

#### 1.2 Products Collection
```typescript
{
  _id: ObjectId,
  name: string (indexed, text search),
  slug: string (unique, indexed),
  brand: string (indexed),
  sku: string (unique, indexed),
  description: string,
  shortDescription: string,
  images: [{
    url: string (Cloudinary URL),
    publicId: string (Cloudinary public_id),
    alt: string,
    order: number
  }],
  category: {
    main: string (indexed),
    sub?: string
  },
  price: {
    ghs: number,
    usd?: number
  },
  originalPrice?: {
    ghs: number,
    usd?: number
  },
  stock: {
    quantity: number,
    lowStockThreshold: number,
    inStock: boolean
  },
  specifications: [{
    label: string,
    value: string
  }],
  highlights: [string],
  rating: {
    average: number,
    count: number
  },
  reviews: [{
    userId: ObjectId (ref: Users),
    rating: number (1-5),
    comment: string,
    verified: boolean,
    createdAt: Date
  }],
  tags: [string] (indexed),
  status: 'active' | 'inactive' | 'draft',
  createdAt: Date,
  updatedAt: Date,
  views: number,
  sales: number
}
```

**Indexes:**
- `slug: 1` (unique)
- `sku: 1` (unique)
- `category.main: 1`
- `brand: 1`
- `status: 1`
- `"price.ghs": 1`
- `rating.average: -1`
- `createdAt: -1`
- **Text Index:** `name`, `description`, `tags`

**Frontend Integration Notes:**
- Product cards should support hover states to show "Add to Cart" button
- Each product card should have a "Buy Now" button (direct checkout)
- Quantity controls (+/-) should be available in product cards
- Backend API supports these features through:
  - `POST /api/cart` - Add to cart endpoint
  - `POST /api/orders` - Direct checkout (buy now)
  - `PUT /api/cart/[id]` - Update quantity endpoint

#### 1.3 Categories Collection
```typescript
{
  _id: ObjectId,
  name: string (unique),
  slug: string (unique, indexed),
  parentId?: ObjectId (ref: Categories),
  description?: string,
  image?: {
    url: string,
    publicId: string
  },
  order: number,
  isActive: boolean,
  productCount: number,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `slug: 1` (unique)
- `parentId: 1`
- `order: 1`

#### 1.4 Orders Collection
```typescript
{
  _id: ObjectId,
  orderNumber: string (unique, indexed, format: ORD-YYYYMMDD-XXXXX),
  userId: ObjectId (ref: Users, indexed),
  items: [{
    productId: ObjectId (ref: Products),
    name: string,
    sku: string,
    image: string,
    price: number,
    quantity: number,
    subtotal: number
  }],
  pricing: {
    subtotal: number,
    serviceFee: number, // 3 GHS per item (Ghana) or 30 GHS (International)
    deliveryFee: number,
    total: number,
    currency: 'GHS' | 'USD'
  },
  shipping: {
    firstName: string,
    lastName: string,
    address: string,
    apartment?: string,
    city: string,
    region: string,
    postalCode?: string,
    phone: string,
    deliveryLocation: string, // Winneba, Accra, Kumasi, etc.
    estimatedDelivery: Date,
    deliveryTime: string // "4hr - 24 hours", "6hrs to 24hrs", etc.
  },
  billing: {
    firstName: string,
    lastName: string,
    address: string,
    city: string,
    region: string,
    postalCode?: string
  },
  payment: {
    method: 'momo' | 'card' | 'paystack',
    provider: 'paystack',
    transactionId?: string,
    reference: string (unique, indexed),
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded',
    amount: number,
    paidAt?: Date
  },
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded',
  statusHistory: [{
    status: string,
    timestamp: Date,
    note?: string
  }],
  trackingNumber?: string,
  notes?: string,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `orderNumber: 1` (unique)
- `userId: 1`
- `payment.reference: 1` (unique)
- `status: 1`
- `createdAt: -1`
- `"payment.status": 1`

#### 1.5 Carts Collection (for persistent carts)
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: Users, indexed),
  sessionId?: string (for guest carts, indexed),
  items: [{
    productId: ObjectId (ref: Products),
    quantity: number,
    addedAt: Date
  }],
  updatedAt: Date,
  expiresAt: Date (TTL index - 30 days)
}
```

**Indexes:**
- `userId: 1`
- `sessionId: 1`
- `expiresAt: 1` (TTL)

#### 1.6 Wishlists Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: Users, unique, indexed),
  items: [{
    productId: ObjectId (ref: Products),
    addedAt: Date
  }],
  updatedAt: Date
}
```

**Indexes:**
- `userId: 1` (unique)

#### 1.7 Reviews Collection
```typescript
{
  _id: ObjectId,
  productId: ObjectId (ref: Products, indexed),
  userId: ObjectId (ref: Users, indexed),
  orderId?: ObjectId (ref: Orders), // For verified purchases
  rating: number (1-5, indexed),
  title?: string,
  comment: string,
  images?: [{
    url: string,
    publicId: string
  }],
  verified: boolean,
  helpful: number,
  reported: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `productId: 1`
- `userId: 1`
- `rating: 1`
- `createdAt: -1`
- Compound: `{ productId: 1, verified: 1 }`

#### 1.8 Admin Settings Collection (Single Record)

**Important:** This collection must contain ONLY ONE document. All settings are managed through this single record.

```typescript
{
  _id: ObjectId,
  // Delivery Fees (in GHS)
  deliveryFees: {
    winneba: number, // 15
    mankesim: number, // 30
    accra: number, // 50
    capeCoast: number, // 50
    takoradi: number, // 50
    kumasi: number, // 65
    sunyani: number, // 70 (suggested default)
    international: number // Calculated separately, typically 0
  },
  // Service Fees (in GHS)
  serviceFees: {
    ghana: number, // 3 per item
    international: number // 30 per item
  },
  // Delivery Times (in hours)
  deliveryTimes: {
    winneba: { min: number, max: number }, // 4-24 hours
    accraCentral: { min: number, max: number }, // 6-24 hours
    outsideAccraCentral: { min: number, max: number }, // 2-5 days (48-120 hours)
    international: { min: number, max: number } // 6-8 weeks (1008-1344 hours)
  },
  // General Settings
  settings: {
    currency: {
      default: 'GHS',
      supported: ['GHS', 'USD']
    },
    freeShippingThreshold: number, // Minimum order amount for free shipping (default: 200 GHS)
    lowStockThreshold: number, // Default low stock threshold (default: 10)
    orderPrefix: string, // "ORD" for order numbers
    maintenanceMode: boolean, // Enable/disable site maintenance mode
    allowGuestCheckout: boolean, // Allow checkout without account
    requireEmailVerification: boolean, // Require email verification for signup
    requirePhoneVerification: boolean, // Require phone verification for signup
    maxCartItems: number, // Maximum items in cart (default: 100)
    maxQuantityPerItem: number // Maximum quantity per product (default: 99)
  },
  // Payment Settings
  payment: {
    paystackPublicKey: string,
    paystackSecretKey: string, // Should be encrypted in production
    testMode: boolean, // Use Paystack test mode
    allowedMethods: ['momo', 'card', 'bank'] // Allowed payment methods
  },
  // Notification Settings
  notifications: {
    emailEnabled: boolean,
    smsEnabled: boolean,
    emailProvider: string, // 'sendgrid' | 'resend' | 'ses'
    smsProvider: string, // 'mnotify'
    emailFrom: string, // Default sender email
    smsFrom: string // Default sender phone number
  },
  // SEO Settings
  seo: {
    siteName: string,
    siteDescription: string,
    defaultMetaTags: {
      title: string,
      description: string,
      keywords: string[]
    },
    ogImage?: string, // Open Graph image URL
    twitterHandle?: string
  },
  // Business Information
  business: {
    name: string,
    email: string,
    phone: string,
    address: {
      street: string,
      city: string,
      region: string,
      country: string,
      postalCode?: string
    },
    taxId?: string,
    registrationNumber?: string
  },
  // Social Media Links
  socialMedia: {
    facebook?: string,
    twitter?: string,
    instagram?: string,
    youtube?: string,
    linkedin?: string
  },
  updatedAt: Date,
  updatedBy: ObjectId (ref: Users) // Admin who last updated
}
```

**Indexes:**
- Single record constraint: Use application logic to ensure only one document exists
- `updatedAt: -1`

**Implementation Note:** 
- Always use `findOneAndUpdate` with `upsert: true` to ensure only one document exists
- Before inserting, delete all existing documents: `await collection.deleteMany({})`
- Or use: `await collection.findOneAndUpdate({}, { $set: settings }, { upsert: true })`

#### 1.9 Admin Info Collection (Multiple Records)

**Important:** This collection can contain MULTIPLE records. Each record has a `type` field that categorizes the content.

```typescript
{
  _id: ObjectId,
  type: string (indexed, enum: [
    'privacy_policy',        // Privacy policy document
    'terms_of_service',      // Terms of service
    'terms_and_conditions',  // Terms and conditions (alias)
    'faq',                   // Frequently asked questions
    'contact',               // Contact information
    'about_us',              // About us page
    'shipping_policy',       // Shipping and delivery policy
    'return_policy',         // Return policy
    'refund_policy',         // Refund policy
    'cancellation_policy',   // Order cancellation policy
    'accessibility',         // Accessibility statement
    'affiliate_terms',       // Affiliate program terms
    'blog_post',             // Blog posts/articles
    'announcement',          // Site announcements
    'help_article',          // Help center articles
    'custom'                 // Custom content type
  ]),
  title: string (indexed, required),
  slug: string (unique, indexed, required),
  content: string (required), // HTML or Markdown content
  excerpt?: string, // Short description/summary
  author?: ObjectId (ref: Users), // Admin who created/updated
  status: 'draft' | 'published' | 'archived' (default: 'draft'),
  order?: number, // For ordering FAQs, help articles, etc. (lower = higher priority)
  tags?: [string], // Tags for categorization and search
  metadata?: {
    // For FAQ
    category?: string,
    question?: string, // For individual FAQ items
    answer?: string,  // For individual FAQ items
    
    // For Contact
    email?: string,
    phone?: string,
    address?: string,
    workingHours?: string,
    
    // For Blog/Announcement
    featuredImage?: {
      url: string,
      publicId: string,
      alt?: string
    },
    publishedAt?: Date,
    authorName?: string,
    
    // For Help Articles
    relatedArticles?: [ObjectId], // References to other help articles
    
    // Custom metadata (flexible for future needs)
    [key: string]: any
  },
  views?: number (default: 0), // View counter
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `type: 1` (indexed for filtering by type)
- `slug: 1` (unique, indexed for URL routing)
- `status: 1` (indexed for filtering published content)
- `order: 1` (indexed for sorting)
- `createdAt: -1` (indexed for chronological sorting)
- Compound: `{ type: 1, status: 1 }` (for filtering published content by type)
- Compound: `{ type: 1, order: 1 }` (for sorting within type)
- **Text Index:** `title`, `content`, `tags` (for full-text search)

**Usage Examples:**
- Privacy Policy: `type: 'privacy_policy'`
- Terms of Service: `type: 'terms_of_service'`
- FAQ Items: `type: 'faq'` (can have multiple FAQ records)
- Contact Info: `type: 'contact'`
- Help Articles: `type: 'help_article'` (multiple articles)

---

## 2. Authentication System

### 2.1 NextAuth Configuration

**File:** `app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import EmailProvider from "next-auth/providers/email"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"
import { sendOTP, verifyOTP } from "@/lib/auth/otp"

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    // Email/Password Provider
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        phone: { label: "Phone", type: "text" }
      },
      async authorize(credentials) {
        // Handle email/password or phone/password login
      }
    }),
    // Email OTP Provider
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier, url }) {
        // Send OTP email
      }
    }),
    // Phone OTP Provider (Custom)
    {
      id: "phone",
      name: "Phone",
      type: "credentials",
      credentials: {
        phone: { label: "Phone", type: "text" },
        otp: { label: "OTP", type: "text" }
      },
      async authorize(credentials) {
        // Verify phone OTP
      }
    }
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  pages: {
    signIn: "/login",
    signUp: "/signup"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    }
  }
}

export default NextAuth(authOptions)
```

### 2.2 OTP System

**File:** `lib/auth/otp.ts`

- Store OTPs in MongoDB with TTL (for speed)
- OTP expiry: 10 minutes
- Rate limiting: 3 OTP requests per phone/email per hour
- OTP length: 6 digits

### 2.3 Phone Number Validation

- **Format:** +233XXXXXXXXX (E.164 format, e.g., +233241234567)
- Use `libphonenumber-js` for validation and normalization
- Normalize all phone numbers to E.164 format on input
- Accept local formats (020XXXXXXX, 024XXXXXXX) and convert to E.164
- Store all phone numbers in E.164 format in database

---

## 3. API Routes Architecture

### 3.1 API Route Structure

```
app/api/
├── auth/
│   └── [...nextauth]/
│       └── route.ts
├── products/
│   ├── route.ts (GET - list products)
│   ├── [id]/
│   │   ├── route.ts (GET, PUT, DELETE)
│   │   ├── reviews/
│   │   │   └── route.ts (GET, POST)
│   │   └── related/
│   │       └── route.ts (GET)
│   └── search/
│       └── route.ts (GET)
├── categories/
│   ├── route.ts (GET)
│   └── [slug]/
│       └── route.ts (GET)
├── cart/
│   ├── route.ts (GET, POST, DELETE)
│   └── [id]/
│       └── route.ts (PUT, DELETE)
├── orders/
│   ├── route.ts (GET, POST)
│   ├── [id]/
│   │   ├── route.ts (GET, PUT)
│   │   └── cancel/
│   │       └── route.ts (POST)
│   └── track/
│       └── route.ts (GET)
├── payments/
│   ├── initialize/
│   │   └── route.ts (POST)
│   ├── verify/
│   │   └── route.ts (POST)
│   └── webhook/
│       └── route.ts (POST)
├── upload/
│   └── route.ts (POST - Cloudinary)
├── wishlist/
│   ├── route.ts (GET, POST)
│   └── [id]/
│       └── route.ts (DELETE)
├── users/
│   ├── profile/
│   │   └── route.ts (GET, PUT)
│   └── addresses/
│       ├── route.ts (GET, POST)
│       └── [id]/
│           └── route.ts (PUT, DELETE)
├── admin/
│   ├── settings/
│   │   └── route.ts (GET, PUT - Admin only)
│   └── info/
│       ├── route.ts (GET - public, POST - Admin)
│       ├── [id]/
│       │   └── route.ts (GET, PUT, DELETE - Admin)
│       ├── [slug]/
│       │   └── route.ts (GET - public)
│       └── by-type/
│           └── route.ts (GET - public)
```

### 3.2 Key API Endpoints

#### Products API
- `GET /api/products` - List products with pagination, filters, sorting
- `GET /api/products/[id]` - Get single product
- `GET /api/products/search?q=...` - Search products
- `GET /api/products/[id]/related` - Get related products
  - Returns products from same category, same brand, or similar price range
  - Uses product tags for matching
  - Excludes current product
  - Returns up to 8 related products

#### Orders API
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/[id]` - Get order details
- `POST /api/orders/[id]/cancel` - Cancel order
- `GET /api/orders/track?orderNumber=...` - Track order

#### Payment API
- `POST /api/payments/initialize` - Initialize Paystack payment
- `POST /api/payments/verify` - Verify payment
- `POST /api/payments/webhook` - Paystack webhook handler

#### Admin Settings API
- `GET /api/admin/settings` - Get admin settings
  - Public endpoint: Returns only delivery fees, service fees, and delivery times (for checkout calculations)
  - Admin endpoint: Returns full settings (when authenticated as admin)
- `PUT /api/admin/settings` - Update admin settings (Admin only)
  - **Important:** Always ensures only ONE record exists
  - Uses `findOneAndUpdate` with `upsert: true` or deletes all and inserts one
  - Validates all required fields
  - Updates `updatedBy` with current admin user ID

#### Admin Info API
- `GET /api/admin/info` - List all admin info
  - Public: Returns only published records
  - Admin: Returns all records (draft, published, archived)
  - Supports pagination, filtering by type, status, and search
- `GET /api/admin/info/by-type?type=privacy_policy` - Get admin info by type (public)
  - Returns published records of specified type
  - Supports multiple types: `?type=privacy_policy&type=terms_of_service`
- `GET /api/admin/info/[slug]` - Get admin info by slug (public)
  - Returns single published record by slug
  - Increments view counter
- `POST /api/admin/info` - Create admin info (Admin only)
  - Creates new admin info record
  - Validates type enum, slug uniqueness
  - Sets author to current admin user
- `GET /api/admin/info/[id]` - Get single admin info by ID (Admin only)
  - Returns record regardless of status (for editing)
- `PUT /api/admin/info/[id]` - Update admin info (Admin only)
  - Updates existing record
  - Validates slug uniqueness (excluding current record)
- `DELETE /api/admin/info/[id]` - Delete admin info (Admin only)
  - Soft delete: Sets status to 'archived' (recommended)
  - Or hard delete: Removes from database

---

## 4. Payment Integration

### 4.1 Paystack Setup

**File:** `lib/payments/paystack.ts`

```typescript
import axios from "axios"

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY

// Initialize Transaction
export async function initializePayment(data: {
  email: string,
  amount: number, // in pesewas (kobo)
  reference: string,
  metadata?: Record<string, any>
}) {
  const response = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    {
      email: data.email,
      amount: data.amount * 100, // Convert to pesewas
      reference: data.reference,
      currency: "GHS",
      metadata: data.metadata,
      channels: ["card", "mobile_money", "bank"]
    },
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      }
    }
  )
  return response.data
}

// Verify Transaction
export async function verifyPayment(reference: string) {
  const response = await axios.get(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
      }
    }
  )
  return response.data
}

// Handle Webhook
export async function handlePaystackWebhook(payload: any, signature: string) {
  // Verify webhook signature
  const crypto = require("crypto")
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(payload))
    .digest("hex")
  
  if (hash !== signature) {
    throw new Error("Invalid webhook signature")
  }
  
  // Process webhook event
  const event = payload.event
  // Handle: charge.success, charge.failed, etc.
}
```

### 4.2 Payment Flow

1. **Order Creation**
   - Calculate totals (subtotal + service fee + delivery fee)
   - Create order with status "pending"
   - Generate unique payment reference

2. **Payment Initialization**
   - Call Paystack initialize API
   - Return authorization URL to frontend
   - User completes payment on Paystack

3. **Payment Verification**
   - Webhook receives payment status
   - Verify transaction with Paystack
   - Update order status
   - Send confirmation email/SMS

### 4.3 Service Fee Calculation

```typescript
function calculateServiceFee(items: CartItem[], isInternational: boolean): number {
  const feePerItem = isInternational ? 30 : 3 // GHS
  return items.length * feePerItem
}
```

### 4.4 Delivery Fee Calculation

```typescript
const DELIVERY_FEES: Record<string, number> = {
  "Winneba": 15,
  "Mankesim": 30,
  "Accra": 50,
  "Cape Coast": 50,
  "Takoradi": 50,
  "Kumasi": 65,
  "Sunyani": 70, // Suggested
  "International": 0 // Calculated separately
}

function calculateDeliveryFee(city: string, isInternational: boolean): number {
  if (isInternational) {
    // Calculate based on weight/size for international
    return 0 // Placeholder
  }
  return DELIVERY_FEES[city] || 50 // Default
}
```

---

## 5. Image Management

### 5.1 Cloudinary Setup

**File:** `lib/cloudinary.ts`

```typescript
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function uploadImage(file: Buffer, folder: string) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: `iherb/${folder}`,
        transformation: [
          { width: 800, height: 800, crop: "limit", quality: "auto" },
          { format: "auto" }
        ]
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    ).end(file)
  })
}

export async function deleteImage(publicId: string) {
  return cloudinary.uploader.destroy(publicId)
}
```

### 5.2 Image Upload API

**File:** `app/api/upload/route.ts`

- Accept multipart/form-data
- Validate file type (images only)
- Validate file size (max 5MB)
- Upload to Cloudinary
- Return URL and public_id

### 5.3 Image Optimization

- Use Cloudinary transformations for responsive images
- Generate multiple sizes: thumbnail, medium, large
- Lazy loading on frontend
- WebP format with fallback

---

## 6. Order Processing Flow

### 6.1 Order Creation Flow

```
1. User adds items to cart (client-side)
2. User proceeds to checkout
3. User fills shipping information
4. System calculates:
   - Subtotal (sum of item prices * quantities)
   - Service fee (3 GHS/item for Ghana, 30 GHS/item for International)
   - Delivery fee (based on city from Admin Settings)
   - Total
5. User selects payment method
6. POST /api/orders
   - Validate cart items
   - Check product availability
   - Generate unique order number (ORD-YYYYMMDD-XXXXX)
   - Create order document with status "pending"
   - Reserve inventory (decrement stock) - Use MongoDB transaction
   - Return order with payment reference
7. Initialize payment with Paystack
8. User completes payment
9. Webhook receives payment confirmation
10. Verify payment with Paystack API
11. Update order status to "confirmed"
12. Send confirmation email/SMS
13. Update product sales count
```

### 6.1.1 Order Number Generation

```typescript
// lib/orders/generateOrderNumber.ts
import { ObjectId } from "mongodb"

export async function generateOrderNumber(
  prefix: string = "ORD",
  db: any
): Promise<string> {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
  
  // Generate random 5-digit number
  let random: string
  let orderNumber: string
  let exists: boolean
  
  do {
    random = Math.floor(Math.random() * 100000).toString().padStart(5, '0')
    orderNumber = `${prefix}-${dateStr}-${random}`
    
    // Check if order number already exists
    exists = await db.collection("orders").findOne({ orderNumber })
  } while (exists)
  
  return orderNumber
}
```

### 6.1.2 Guest Checkout Support

- If `allowGuestCheckout` is enabled in Admin Settings:
  - User can checkout without account
  - Store email/phone in order document
  - Order tracking via order number + email/phone
  - Option to create account after checkout (link in confirmation email)

### 6.2 Order Status Flow

```
pending → confirmed → processing → shipped → delivered
                ↓
            cancelled
                ↓
            refunded
```

### 6.3 Inventory Management

- **Stock Reservation:** Reserve items when order is created
  - Use MongoDB transactions to ensure atomicity
  - Check availability before reserving
  - Handle concurrent orders for same product
- **Stock Release:** Release if payment fails or order cancelled
  - Automatic release after 24 hours if payment not completed
  - Manual release on order cancellation
- **Low Stock Alerts:** Notify admin when stock < threshold (from Admin Settings)
- **Out of Stock:** Mark product as unavailable when quantity = 0

**Implementation Example:**
```typescript
// Use MongoDB transactions for inventory management
const session = client.startSession()
try {
  await session.withTransaction(async () => {
    // 1. Check product availability
    const product = await productsCollection.findOne(
      { _id: productId, "stock.quantity": { $gte: quantity } },
      { session }
    )
    
    if (!product) throw new Error("Insufficient stock")
    
    // 2. Reserve stock (decrement quantity)
    await productsCollection.updateOne(
      { _id: productId },
      { $inc: { "stock.quantity": -quantity } },
      { session }
    )
    
    // 3. Create order
    await ordersCollection.insertOne(orderDoc, { session })
  })
} finally {
  await session.endSession()
}
```

### 6.4 Delivery Time Calculation

```typescript
function calculateDeliveryTime(city: string, isInternational: boolean): {
  estimatedDelivery: Date,
  deliveryTime: string
} {
  const now = new Date()
  let hours: number
  let deliveryTime: string

  if (isInternational) {
    hours = 6 * 24 * 7 // 6-8 weeks
    deliveryTime = "6-8 weeks by ship"
  } else {
    switch (city) {
      case "Winneba":
        hours = 24
        deliveryTime = "4hr - 24 hours"
        break
      case "Accra":
      case "Cape Coast":
      case "Takoradi":
        hours = 24
        deliveryTime = "6hrs to 24hrs"
        break
      default:
        hours = 5 * 24 // 2-5 days
        deliveryTime = "2 - 5 days"
    }
  }

  const estimatedDelivery = new Date(now.getTime() + hours * 60 * 60 * 1000)
  return { estimatedDelivery, deliveryTime }
}
```

---

## 7. Notification System

### 7.1 Email Notifications

**Service:** SendGrid, Resend, or AWS SES

**File:** `lib/notifications/email.ts`

**Email Templates:**
- Order Confirmation
- Payment Confirmation
- Order Shipped
- Order Delivered
- Password Reset
- OTP Code

### 7.2 SMS Notifications

**Service:** MNotify

**File:** `lib/notifications/sms.ts`

**SMS Templates:**
- Order Confirmation
- Payment Confirmation
- OTP Code
- Delivery Updates

### 7.3 Notification Triggers

- Order created → Email + SMS
- Payment successful → Email + SMS
- Order shipped → Email + SMS (with tracking)
- Order delivered → Email + SMS

---

## 8. Performance Optimizations

### 8.1 Database Optimizations

- **Indexes:** Create appropriate indexes for all queries
- **Connection Pooling:** Use MongoDB connection pooling
- **Query Optimization:** Use `explain()` to analyze slow queries
- **Aggregation Pipelines:** Use for complex queries
- **Caching:** Redis for frequently accessed data

### 8.2 API Optimizations

- **Response Caching:** Cache product listings, categories
- **Pagination:** Limit results (20-50 items per page)
- **Field Selection:** Only return required fields
- **Compression:** Enable gzip/brotli compression
- **CDN:** Use CDN for static assets

### 8.3 Frontend Optimizations

- **Image Optimization:** Use Next.js Image component with Cloudinary
- **Code Splitting:** Dynamic imports for heavy components
- **Server Components:** Use React Server Components where possible
- **Static Generation:** Pre-render product pages where possible

### 8.4 Caching Strategy

**Redis Cache Keys:**
- `products:list:{category}:{page}` - Product listings
- `products:{id}` - Single product
- `categories:all` - All categories
- `user:{id}:cart` - User cart

**Cache TTL:**
- Products: 5 minutes
- Categories: 1 hour
- User data: 15 minutes

---

## 9. Scalability Considerations

### 9.1 Database Scaling

- **Sharding:** Shard by user ID or product category
- **Read Replicas:** Use MongoDB read replicas for read-heavy operations
- **Archiving:** Archive old orders to separate collection

### 9.2 Application Scaling

- **Horizontal Scaling:** Deploy multiple Next.js instances
- **Load Balancing:** Use load balancer (Vercel, AWS ALB)
- **Queue System:** Use Bull/BullMQ for background jobs
  - Email sending
  - SMS sending
  - Image processing
  - Order processing

### 9.3 Background Jobs

**Jobs to Queue:**
- Send confirmation emails
- Send SMS notifications
- Update product ratings
- Generate reports
- Cleanup expired carts

### 9.4 Monitoring & Logging

- **APM:** Use Sentry, Datadog, or New Relic
- **Logging:** Structured logging with Winston or Pino
- **Metrics:** Track:
  - API response times
  - Database query times
  - Error rates
  - Order conversion rates

### 9.4.1 Monitoring Metrics

**Key Metrics to Track:**

1. **Performance Metrics:**
   - API endpoint response times (p50, p95, p99)
   - Database query execution times
   - Cache hit rates
   - Image upload/processing times

2. **Business Metrics:**
   - Order conversion rate
   - Average order value (AOV)
   - Cart abandonment rate
   - Payment success rate
   - User registration rate

3. **System Health:**
   - Error rates by endpoint
   - Database connection pool usage
   - Redis cache memory usage
   - Background job queue length
   - API rate limit hits

4. **User Metrics:**
   - Active users (DAU, MAU)
   - Session duration
   - Page views
   - Search queries

### 9.4.2 Alert Thresholds

Set up alerts for:

- **Critical:**
  - API error rate > 5%
  - Database connection failures
  - Payment processing failures
  - Order creation failures

- **Warning:**
  - API response time p95 > 2 seconds
  - Database query time > 1 second
  - Cache hit rate < 70%
  - Background job queue > 1000 items

- **Info:**
  - High traffic spikes (> 2x normal)
  - Low stock alerts
  - Failed payment attempts

### 9.4.3 Dashboard Recommendations

**Recommended Dashboards:**

1. **System Health Dashboard:**
   - API response times
   - Error rates
   - Database performance
   - Cache performance

2. **Business Metrics Dashboard:**
   - Orders per day
   - Revenue metrics
   - Conversion funnel
   - Top products

3. **User Activity Dashboard:**
   - Active users
   - User registrations
   - Search queries
   - Popular pages

**Tools:**
- Grafana for custom dashboards
- Datadog for APM and monitoring
- Sentry for error tracking
- Google Analytics for user behavior

---

## 10. Security Measures

### 10.1 Authentication Security

- **Password Hashing:** Use bcrypt (cost factor 12)
- **Rate Limiting:** Limit login attempts (5 per 15 minutes)
- **JWT Expiry:** Short-lived tokens (30 days) with refresh tokens
- **OTP Security:** 6-digit OTP, 10-minute expiry

### 10.2 API Security

- **Rate Limiting:** Use `@upstash/ratelimit` or similar
  - Authentication endpoints: 5 requests per 15 minutes per IP
  - Payment endpoints: 3 requests per minute per user
  - Product search: 30 requests per minute per IP
  - General API: 100 requests per minute per IP
  - OTP requests: 3 requests per hour per phone/email
- **CORS:** Configure CORS properly
- **Input Validation:** Use Zod for all inputs
- **SQL Injection:** Use parameterized queries (MongoDB handles this)
- **XSS Protection:** Sanitize user inputs

**Rate Limiting Implementation Example:**
```typescript
// lib/ratelimit.ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
})

export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  analytics: true,
})

export const paymentRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
})

export const searchRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  analytics: true,
})
```

### 10.3 Payment Security

- **Webhook Verification:** Verify Paystack webhook signatures
- **Idempotency:** Prevent duplicate payments
- **Amount Validation:** Verify payment amount matches order total

### 10.3.1 Webhook Security

**File:** `lib/payments/webhook-security.ts`

```typescript
import crypto from "crypto"

// Verify Paystack Webhook Signature
export function verifyPaystackWebhook(
  payload: string | object,
  signature: string,
  secret: string
): boolean {
  const hash = crypto
    .createHmac("sha512", secret)
    .update(typeof payload === "string" ? payload : JSON.stringify(payload))
    .digest("hex")
  
  return hash === signature
}

// Idempotency Key Management
const processedWebhooks = new Set<string>()

export function isWebhookProcessed(idempotencyKey: string): boolean {
  return processedWebhooks.has(idempotencyKey)
}

export function markWebhookProcessed(idempotencyKey: string): void {
  processedWebhooks.add(idempotencyKey)
  // In production, store in Redis with TTL (24 hours)
}

// Webhook Retry Logic
export async function handleWebhookWithRetry(
  webhookHandler: () => Promise<void>,
  maxRetries: number = 3
): Promise<void> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await webhookHandler()
      return
    } catch (error) {
      lastError = error as Error
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
    }
  }
  
  throw lastError || new Error("Webhook processing failed after retries")
}
```

### 10.4 Data Protection

- **Encryption:** Encrypt sensitive data at rest
- **PII Handling:** Minimize PII collection, encrypt in transit
- **GDPR Compliance:** Allow data deletion, export

---

## 10.5 Error Handling Patterns

### 10.5.1 Standard API Response Format

All API endpoints should follow a consistent response format:

```typescript
// Success Response
{
  success: true,
  data: any,
  meta?: {
    pagination?: {
      page: number,
      limit: number,
      total: number,
      totalPages: number
    },
    timestamp: string (ISO 8601)
  }
}

// Error Response
{
  success: false,
  error: {
    code: string, // Error code (e.g., "VALIDATION_ERROR", "NOT_FOUND", "UNAUTHORIZED")
    message: string, // User-friendly error message
    details?: any, // Additional error details (for development)
    field?: string // For validation errors, the field that failed
  },
  meta: {
    timestamp: string (ISO 8601)
  }
}
```

### 10.5.2 HTTP Status Codes

Use appropriate HTTP status codes:

- `200 OK` - Successful GET, PUT, PATCH requests
- `201 Created` - Successful POST requests (resource created)
- `204 No Content` - Successful DELETE requests
- `400 Bad Request` - Validation errors, malformed requests
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate resource (e.g., existing email)
- `422 Unprocessable Entity` - Business logic errors
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server errors
- `503 Service Unavailable` - Maintenance mode, service down

### 10.5.3 Error Handling Implementation

**File:** `lib/errors/api-error.ts`

```typescript
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, public field?: string, details?: any) {
    super(400, "VALIDATION_ERROR", message, details)
    this.name = "ValidationError"
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(404, "NOT_FOUND", `${resource} not found`)
    this.name = "NotFoundError"
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = "Unauthorized") {
    super(401, "UNAUTHORIZED", message)
    this.name = "UnauthorizedError"
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = "Forbidden") {
    super(403, "FORBIDDEN", message)
    this.name = "ForbiddenError"
  }
}
```

**File:** `lib/errors/error-handler.ts`

```typescript
import { NextResponse } from "next/server"
import { ApiError } from "./api-error"

export function handleApiError(error: unknown) {
  // Log error for monitoring
  console.error("API Error:", error)
  
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          ...(process.env.NODE_ENV === "development" && { details: error.details }),
          ...(error instanceof ValidationError && { field: error.field })
        },
        meta: {
          timestamp: new Date().toISOString()
        }
      },
      { status: error.statusCode }
    )
  }
  
  // Unknown errors
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred",
        ...(process.env.NODE_ENV === "development" && {
          details: error instanceof Error ? error.message : String(error)
        })
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    },
    { status: 500 }
  )
}
```

### 10.5.4 Error Logging

- Log all errors to monitoring service (Sentry, Datadog, etc.)
- Include request context (user ID, IP, endpoint, timestamp)
- Don't log sensitive information (passwords, payment details)
- Use structured logging format

---

## 11. Seed Script Service

### 11.1 Overview

A comprehensive seed script to preload the database with test data including:
- Test users (customers and admins)
- Product categories
- Admin settings (single record)
- Admin info records (multiple types)

**File:** `scripts/seed.ts` or `scripts/seed.js`

### 11.2 Script Structure

```typescript
// scripts/seed.ts
import { MongoClient, ObjectId } from "mongodb"
import bcrypt from "bcryptjs"

const MONGODB_URI = process.env.MONGODB_URI as string;

async function seed() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    const db = client.db()
    
    console.log("🌱 Starting database seed...")
    
    // Clear existing data (optional - use with caution)
    // await clearDatabase(db)
    
    // Seed in order
    await seedUsers(db)
    await seedCategories(db)
    await seedAdminSettings(db)
    await seedAdminInfo(db)
    
    console.log("✅ Database seed completed successfully!")
  } catch (error) {
    console.error("❌ Seed failed:", error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

// Run seed
seed()
```

### 11.3 Seed Functions

#### 11.3.1 Seed Users

```typescript
async function seedUsers(db: any) {
  console.log("👤 Seeding users...")
  
  const usersCollection = db.collection("users")
  
  // Hash password helper
  const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 12)
  }
  
  const users = [
    // Admin Users
    {
      email: "admin@iherb.com",
      phone: "+233241234567",
      emailVerified: true,
      phoneVerified: true,
      password: await hashPassword("Admin@123"),
      name: {
        first: "Admin",
        last: "User"
      },
      role: "admin",
      addresses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      preferences: {
        currency: "GHS",
        language: "en",
        notifications: {
          email: true,
          sms: true
        }
      }
    },
    {
      email: "superadmin@iherb.com",
      phone: "+233241234568",
      emailVerified: true,
      phoneVerified: true,
      password: await hashPassword("SuperAdmin@123"),
      name: {
        first: "Super",
        last: "Admin"
      },
      role: "admin",
      addresses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      preferences: {
        currency: "GHS",
        language: "en",
        notifications: {
          email: true,
          sms: true
        }
      }
    },
    // Test Customers
    {
      email: "customer1@test.com",
      phone: "+233241234569",
      emailVerified: true,
      phoneVerified: true,
      password: await hashPassword("Customer@123"),
      name: {
        first: "John",
        last: "Doe"
      },
      role: "customer",
      addresses: [
        {
          _id: new ObjectId(),
          type: "shipping",
          firstName: "John",
          lastName: "Doe",
          address: "123 Main Street",
          apartment: "Apt 4B",
          city: "Accra",
          region: "Greater Accra",
          postalCode: "00233",
          phone: "+233241234569",
          isDefault: true,
          createdAt: new Date()
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      preferences: {
        currency: "GHS",
        language: "en",
        notifications: {
          email: true,
          sms: true
        }
      }
    },
    {
      email: "customer2@test.com",
      phone: "+233241234570",
      emailVerified: true,
      phoneVerified: false,
      password: await hashPassword("Customer@123"),
      name: {
        first: "Jane",
        last: "Smith"
      },
      role: "customer",
      addresses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      preferences: {
        currency: "GHS",
        language: "en",
        notifications: {
          email: true,
          sms: false
        }
      }
    },
    {
      phone: "+233241234571",
      emailVerified: false,
      phoneVerified: true,
      password: await hashPassword("PhoneUser@123"),
      name: {
        first: "Phone",
        last: "User"
      },
      role: "customer",
      addresses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      preferences: {
        currency: "GHS",
        language: "en",
        notifications: {
          email: false,
          sms: true
        }
      }
    }
  ]
  
  // Insert users (skip duplicates)
  for (const user of users) {
    await usersCollection.updateOne(
      { $or: [{ email: user.email }, { phone: user.phone }] },
      { $setOnInsert: user },
      { upsert: true }
    )
  }
  
  console.log(`✅ Seeded ${users.length} users`)
}
```

#### 11.3.2 Seed Categories

```typescript
async function seedCategories(db: any) {
  console.log("📁 Seeding categories...")
  
  const categoriesCollection = db.collection("categories")
  
  const categories = [
    {
      name: "Natural Hair Growth Products",
      slug: "natural-hair-growth-products",
      description: "Products for natural hair growth and care",
      order: 1,
      isActive: true,
      productCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Beard Hair Growth for Men",
      slug: "beard-hair-growth-men",
      description: "Products specifically for men's beard growth",
      order: 2,
      isActive: true,
      productCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Hair Care",
      slug: "hair-care",
      description: "Shampoo, anti-dandruff, and hair care products",
      order: 3,
      isActive: true,
      productCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Facial Care",
      slug: "facial-care",
      description: "Serums, acne treatment products, and facial care",
      order: 4,
      isActive: true,
      productCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Supplements",
      slug: "supplements",
      description: "Health supplements and vitamins",
      order: 5,
      isActive: true,
      productCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Women Wellness",
      slug: "women-wellness",
      description: "Supplements and products for women's wellness",
      parentId: null, // Will be set to Supplements ID
      order: 1,
      isActive: true,
      productCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Men Wellness",
      slug: "men-wellness",
      description: "Supplements and products for men's wellness",
      parentId: null, // Will be set to Supplements ID
      order: 2,
      isActive: true,
      productCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Gummies",
      slug: "gummies",
      description: "Vitamin and supplement gummies",
      parentId: null, // Will be set to Supplements ID
      order: 3,
      isActive: true,
      productCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Menstrual Pain Solutions",
      slug: "menstrual-pain-solutions",
      description: "Products to help with menstrual pain and discomfort",
      order: 6,
      isActive: true,
      productCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
  
  // Insert main categories first
  const mainCategories = categories.filter(c => !c.parentId)
  for (const category of mainCategories) {
    await categoriesCollection.updateOne(
      { slug: category.slug },
      { $setOnInsert: category },
      { upsert: true }
    )
  }
  
  // Get Supplements ID and update subcategories
  const supplements = await categoriesCollection.findOne({ slug: "supplements" })
  if (supplements) {
    const subcategories = categories.filter(c => 
      ["women-wellness", "men-wellness", "gummies"].includes(c.slug)
    )
    
    for (const subcategory of subcategories) {
      await categoriesCollection.updateOne(
        { slug: subcategory.slug },
        { 
          $setOnInsert: {
            ...subcategory,
            parentId: supplements._id
          }
        },
        { upsert: true }
      )
    }
  }
  
  // Insert remaining categories
  const remaining = categories.filter(c => 
    !["women-wellness", "men-wellness", "gummies"].includes(c.slug) && !c.parentId
  )
  for (const category of remaining) {
    await categoriesCollection.updateOne(
      { slug: category.slug },
      { $setOnInsert: category },
      { upsert: true }
    )
  }
  
  console.log(`✅ Seeded ${categories.length} categories`)
}
```

#### 11.3.3 Seed Admin Settings

```typescript
async function seedAdminSettings(db: any) {
  console.log("⚙️ Seeding admin settings...")
  
  const settingsCollection = db.collection("adminsettings")
  
  // Get admin user ID
  const adminUser = await db.collection("users").findOne({ email: "admin@iherb.com" })
  
  const adminSettings = {
    deliveryFees: {
      winneba: 15,
      mankesim: 30,
      accra: 50,
      capeCoast: 50,
      takoradi: 50,
      kumasi: 65,
      sunyani: 70,
      international: 0 // Calculated separately
    },
    serviceFees: {
      ghana: 3, // per item
      international: 30 // per item
    },
    deliveryTimes: {
      winneba: { min: 4, max: 24 }, // hours
      accraCentral: { min: 6, max: 24 }, // hours
      outsideAccraCentral: { min: 48, max: 120 }, // hours (2-5 days)
      international: { min: 1008, max: 1344 } // hours (6-8 weeks)
    },
    settings: {
      currency: {
        default: "GHS",
        supported: ["GHS", "USD"]
      },
      freeShippingThreshold: 200, // GHS
      lowStockThreshold: 10,
      orderPrefix: "ORD",
      maintenanceMode: false,
      allowGuestCheckout: true,
      requireEmailVerification: false,
      requirePhoneVerification: false
    },
    payment: {
      paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY || "",
      paystackSecretKey: process.env.PAYSTACK_SECRET_KEY || "", // Should be encrypted
      testMode: true
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: true,
      emailProvider: "resend",
      smsProvider: "mnotify"
    },
    seo: {
      siteName: "iHerb Clone",
      siteDescription: "Shop vitamins, supplements, and natural health products",
      defaultMetaTags: {
        title: "iHerb - Vitamins, Supplements, Natural Health Products",
        description: "Shop vitamins, supplements, and natural health products at iHerb. Best prices on premium brands.",
        keywords: ["vitamins", "supplements", "health", "wellness", "natural products"]
      }
    },
    business: {
      name: "iHerb Clone",
      email: "info@iherb.com",
      phone: "+233241234567",
      address: {
        street: "123 Business Street",
        city: "Accra",
        region: "Greater Accra",
        country: "Ghana",
        postalCode: "00233"
      },
      taxId: "",
      registrationNumber: ""
    },
    socialMedia: {
      facebook: "https://facebook.com/iherb",
      instagram: "https://instagram.com/iherb",
      twitter: "https://twitter.com/iherb",
      youtube: "",
      linkedin: ""
    },
    updatedAt: new Date(),
    updatedBy: adminUser?._id || null
  }
  
  // Ensure only one document exists - delete all and insert one
  await settingsCollection.deleteMany({})
  await settingsCollection.insertOne(adminSettings)
  
  console.log("✅ Seeded admin settings (single record)")
}
```

#### 11.3.4 Seed Admin Info

```typescript
async function seedAdminInfo(db: any) {
  console.log("📄 Seeding admin info...")
  
  const adminInfoCollection = db.collection("admininfo")
  
  // Get admin user ID
  const adminUser = await db.collection("users").findOne({ email: "admin@iherb.com" })
  
  const adminInfoRecords = [
    {
      type: "privacy_policy",
      title: "Privacy Policy",
      slug: "privacy-policy",
      content: `
        <h1>Privacy Policy</h1>
        <p>Last updated: ${new Date().toLocaleDateString()}</p>
        <p>We respect your privacy and are committed to protecting your personal data...</p>
        <h2>Information We Collect</h2>
        <p>We collect information that you provide directly to us, including:</p>
        <ul>
          <li>Name and contact information</li>
          <li>Payment information</li>
          <li>Shipping address</li>
        </ul>
        <h2>How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Process and fulfill your orders</li>
          <li>Send you order confirmations and updates</li>
          <li>Improve our services</li>
        </ul>
      `,
      excerpt: "Our privacy policy explains how we collect, use, and protect your personal information.",
      author: adminUser?._id || null,
      status: "published",
      order: 1,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      type: "terms_of_service",
      title: "Terms of Service",
      slug: "terms-of-service",
      content: `
        <h1>Terms of Service</h1>
        <p>Last updated: ${new Date().toLocaleDateString()}</p>
        <p>Please read these terms of service carefully before using our website...</p>
        <h2>Acceptance of Terms</h2>
        <p>By accessing and using this website, you accept and agree to be bound by these terms...</p>
        <h2>Use License</h2>
        <p>Permission is granted to temporarily download one copy of the materials on our website...</p>
      `,
      excerpt: "Terms and conditions for using our e-commerce platform.",
      author: adminUser?._id || null,
      status: "published",
      order: 2,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      type: "faq",
      title: "Frequently Asked Questions",
      slug: "faq",
      content: `
        <h1>Frequently Asked Questions</h1>
        <div class="faq-item">
          <h3>How do I place an order?</h3>
          <p>To place an order, simply add items to your cart and proceed to checkout...</p>
        </div>
        <div class="faq-item">
          <h3>What payment methods do you accept?</h3>
          <p>We accept Mobile Money (MoMo) for Ghanaian customers and Paystack for international payments...</p>
        </div>
        <div class="faq-item">
          <h3>How long does delivery take?</h3>
          <p>Delivery times vary by location. Please check our shipping policy for details...</p>
        </div>
      `,
      excerpt: "Common questions and answers about our services.",
      author: adminUser?._id || null,
      status: "published",
      order: 3,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      type: "contact",
      title: "Contact Us",
      slug: "contact",
      content: `
        <h1>Contact Us</h1>
        <p>We'd love to hear from you. Get in touch with us through any of the following channels:</p>
        <h2>Customer Service</h2>
        <p>Email: support@iherb.com</p>
        <p>Phone: +233 XX XXX XXXX</p>
        <p>Hours: Monday - Friday, 9:00 AM - 5:00 PM GMT</p>
      `,
      excerpt: "Get in touch with our customer service team.",
      author: adminUser?._id || null,
      status: "published",
      order: 4,
      metadata: {
        email: "support@iherb.com",
        phone: "+233241234567",
        address: "123 Business Street, Accra, Ghana"
      },
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      type: "shipping_policy",
      title: "Shipping & Delivery Policy",
      slug: "shipping-policy",
      content: `
        <h1>Shipping & Delivery Policy</h1>
        <h2>Delivery Times</h2>
        <ul>
          <li><strong>Winneba:</strong> 4hr - 24 hours</li>
          <li><strong>Accra and Central Region:</strong> 6hrs to 24hrs</li>
          <li><strong>Outside Accra and Central Region:</strong> 2 - 5 days</li>
          <li><strong>International:</strong> 6-8 weeks by ship</li>
        </ul>
        <h2>Delivery Costs</h2>
        <ul>
          <li>Winneba: 15 GHS</li>
          <li>Mankesim: 30 GHS</li>
          <li>Accra, Cape Coast, Takoradi: 50 GHS</li>
          <li>Kumasi: 65 GHS</li>
          <li>Sunyani: 70 GHS</li>
        </ul>
      `,
      excerpt: "Information about our shipping and delivery policies.",
      author: adminUser?._id || null,
      status: "published",
      order: 5,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      type: "return_policy",
      title: "Return Policy",
      slug: "return-policy",
      content: `
        <h1>Return Policy</h1>
        <p>We offer a 30-day return policy on all products...</p>
        <h2>Return Conditions</h2>
        <ul>
          <li>Items must be unused and in original packaging</li>
          <li>Proof of purchase required</li>
          <li>Return shipping costs are the customer's responsibility</li>
        </ul>
      `,
      excerpt: "Our return and refund policy.",
      author: adminUser?._id || null,
      status: "published",
      order: 6,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      type: "about_us",
      title: "About Us",
      slug: "about-us",
      content: `
        <h1>About iHerb</h1>
        <p>iHerb is your trusted source for vitamins, supplements, and natural health products...</p>
        <h2>Our Mission</h2>
        <p>To provide high-quality health and wellness products at affordable prices...</p>
        <h2>Our Values</h2>
        <ul>
          <li>Quality</li>
          <li>Customer Service</li>
          <li>Transparency</li>
        </ul>
      `,
      excerpt: "Learn more about iHerb and our mission.",
      author: adminUser?._id || null,
      status: "published",
      order: 7,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      type: "refund_policy",
      title: "Refund Policy",
      slug: "refund-policy",
      content: `
        <h1>Refund Policy</h1>
        <p>We offer refunds for eligible products within 30 days of purchase...</p>
        <h2>Refund Process</h2>
        <ol>
          <li>Contact our customer service</li>
          <li>Provide order number and reason</li>
          <li>Return the product (if applicable)</li>
          <li>Receive refund within 4-7 business days</li>
        </ol>
      `,
      excerpt: "Our refund policy and process.",
      author: adminUser?._id || null,
      status: "published",
      order: 8,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      type: "cancellation_policy",
      title: "Cancellation Policy",
      slug: "cancellation-policy",
      content: `
        <h1>Order Cancellation Policy</h1>
        <p>You can cancel your order before it is shipped...</p>
        <h2>How to Cancel</h2>
        <p>Contact us within 24 hours of placing your order for immediate cancellation.</p>
      `,
      excerpt: "Information about cancelling orders.",
      author: adminUser?._id || null,
      status: "published",
      order: 9,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      type: "accessibility",
      title: "Accessibility Statement",
      slug: "accessibility",
      content: `
        <h1>Accessibility Statement</h1>
        <p>We are committed to ensuring digital accessibility for people with disabilities...</p>
        <h2>Our Commitment</h2>
        <p>We aim to conform to WCAG 2.1 Level AA standards.</p>
      `,
      excerpt: "Our commitment to web accessibility.",
      author: adminUser?._id || null,
      status: "published",
      order: 10,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      type: "help_article",
      title: "How to Track Your Order",
      slug: "how-to-track-order",
      content: `
        <h1>How to Track Your Order</h1>
        <p>You can track your order in several ways:</p>
        <ol>
          <li>Log into your account and go to Orders</li>
          <li>Use the tracking number sent to your email</li>
          <li>Contact customer service with your order number</li>
        </ol>
      `,
      excerpt: "Learn how to track your order status.",
      author: adminUser?._id || null,
      status: "published",
      order: 1,
      tags: ["orders", "tracking", "shipping"],
      metadata: {
        category: "Orders",
        relatedArticles: []
      },
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      type: "help_article",
      title: "Payment Methods",
      slug: "payment-methods",
      content: `
        <h1>Payment Methods</h1>
        <p>We accept the following payment methods:</p>
        <ul>
          <li>Mobile Money (MoMo) - For Ghanaian customers</li>
          <li>Credit/Debit Cards - Via Paystack</li>
          <li>Bank Transfer - Via Paystack</li>
        </ul>
      `,
      excerpt: "Accepted payment methods.",
      author: adminUser?._id || null,
      status: "published",
      order: 2,
      tags: ["payment", "checkout"],
      metadata: {
        category: "Payment",
        relatedArticles: []
      },
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
  
  // Insert admin info records (multiple records allowed)
  // Use upsert to avoid duplicates based on slug
  for (const record of adminInfoRecords) {
    await adminInfoCollection.updateOne(
      { slug: record.slug },
      { 
        $setOnInsert: record,
        $set: {
          updatedAt: new Date()
        }
      },
      { upsert: true }
    )
  }
  
  console.log(`✅ Seeded ${adminInfoRecords.length} admin info records (multiple records)`)
}
```

### 11.4 Running the Seed Script

#### 11.4.1 Using TypeScript

```bash
# Install tsx for running TypeScript files
npm install -D tsx

# Run seed script
npx tsx scripts/seed.ts
```

#### 11.4.2 Using Node.js

```bash
# Compile TypeScript first
npx tsc scripts/seed.ts

# Run compiled JavaScript
node scripts/seed.js
```

#### 11.4.3 Package.json Script

Add to `package.json`:

```json
{
  "scripts": {
    "seed": "tsx scripts/seed.ts",
    "seed:reset": "tsx scripts/seed.ts --reset"
  }
}
```

Then run:
```bash
npm run seed
```

### 11.5 Seed Script Options

```typescript
// Add command-line arguments
const args = process.argv.slice(2)
const shouldReset = args.includes("--reset")
const seedOnly = args.includes("--only")

async function clearDatabase(db: any) {
  if (!shouldReset) return
  
  console.log("🗑️ Clearing existing data...")
  await db.collection("users").deleteMany({})
  await db.collection("categories").deleteMany({})
  await db.collection("adminsettings").deleteMany({})
  await db.collection("admininfo").deleteMany({})
  console.log("✅ Database cleared")
}
```

### 11.6 Seed Data Summary

After running the seed script, you'll have:

- **2 Admin Users:**
  - admin@iherb.com / Admin@123
  - superadmin@iherb.com / SuperAdmin@123

- **3 Test Customers:**
  - customer1@test.com / Customer@123
  - customer2@test.com / Customer@123
  - Phone user: +233241234571 / PhoneUser@123

- **9 Categories:**
  - 6 main categories
  - 3 subcategories under Supplements

- **1 Admin Settings Record (Single Record):**
  - Delivery fees configured (Winneba, Mankesim, Accra, Cape Coast, Takoradi, Kumasi, Sunyani)
  - Service fees configured (Ghana: 3 GHS/item, International: 30 GHS/item)
  - Delivery times configured (by location)
  - General settings (currency, thresholds, etc.)
  - Payment settings
  - Notification settings
  - SEO settings
  - Business information
  - Social media links

- **12 Admin Info Records (Multiple Records):**
  - Privacy Policy (`type: 'privacy_policy'`)
  - Terms of Service (`type: 'terms_of_service'`)
  - FAQ (`type: 'faq'`)
  - Contact (`type: 'contact'`)
  - Shipping Policy (`type: 'shipping_policy'`)
  - Return Policy (`type: 'return_policy'`)
  - Refund Policy (`type: 'refund_policy'`)
  - Cancellation Policy (`type: 'cancellation_policy'`)
  - About Us (`type: 'about_us'`)
  - Accessibility Statement (`type: 'accessibility'`)
  - Help Article: "How to Track Your Order" (`type: 'help_article'`)
  - Help Article: "Payment Methods" (`type: 'help_article'`)

---

## 12. Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Set up MongoDB database and collections
- [ ] Configure NextAuth with email/phone providers
- [ ] Create basic API routes structure
- [ ] Set up Cloudinary integration
- [ ] Implement OTP system
- [ ] Create Admin Settings collection (single record schema)
- [ ] Create Admin Info collection (multiple records schema)
- [ ] Implement seed script for test data

### Phase 2: Core Features (Week 3-4)
- [ ] Product CRUD APIs
- [ ] Category management
- [ ] Cart functionality
- [ ] Order creation flow
- [ ] Paystack payment integration
- [ ] Admin Settings API (GET, PUT - single record)
- [ ] Admin Info API (CRUD - multiple records)
- [ ] Delivery fee calculation using Admin Settings

### Phase 3: Advanced Features (Week 5-6)
- [ ] Order tracking
- [ ] Review system
- [ ] Wishlist functionality
- [ ] Search functionality
- [ ] Email/SMS notifications

### Phase 4: Optimization (Week 7-8)
- [ ] Implement caching (Redis)
- [ ] Database indexing
- [ ] API response optimization
- [ ] Background job queue
- [ ] Monitoring and logging

### Phase 5: Testing & Deployment (Week 9-10)
- [ ] Unit tests
- [ ] Integration tests
- [ ] Load testing
- [ ] Security audit
- [ ] Production deployment

---

## 13. Required Environment Variables

```env
# Database
MONGODB_URI=
REDIS_URL=redis://localhost:6379

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Paystack
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (SendGrid/Resend)
EMAIL_SERVER=smtp://...
EMAIL_FROM=noreply@iherb.com

# SMS (MNotify)
MNOTIFY_PROVIDER_URL=https://api.mnotify.com/api/sms/quick
MNOTIFY_API_KEY=your_mnotify_api_key_here
MNOTIFY_SMS_SENDER_ID=your_sender_id_here

# App
NODE_ENV=production
```

---

## 14. Required Dependencies

```json
{
  "dependencies": {
    "next-auth": "^5.0.0",
    "@auth/mongodb-adapter": "^1.0.0",
    "mongodb": "^6.0.0",
    "mongoose": "^8.0.0",
    "bcryptjs": "^2.4.3",
    "zod": "^3.25.76",
    "cloudinary": "^1.41.0",
    "axios": "^1.6.0",
    "redis": "^4.6.0",
    "bullmq": "^5.0.0",
    "libphonenumber-js": "^1.11.0",
    "@upstash/ratelimit": "^1.0.0",
    "resend": "^3.0.0",
  }
}
```

---

## 15. Additional Recommendations

### 14.1 Search Implementation
- Use MongoDB text search for basic search
- Consider Algolia or Meilisearch for advanced search
- Implement search suggestions/autocomplete

### 14.2 Analytics
- Track user behavior (Google Analytics, Plausible)
- Track conversion funnel
- Monitor key metrics (AOV, conversion rate, etc.)

### 14.3 Admin Panel
- Create admin dashboard for:
  - Product management
  - Order management
  - User management
  - Analytics

### 14.4 Testing Strategy

#### 14.4.1 Unit Tests

**File:** `__tests__/lib/utils.test.ts`

```typescript
import { describe, it, expect } from "@jest/globals"
import { generateOrderNumber } from "@/lib/orders/generateOrderNumber"

describe("generateOrderNumber", () => {
  it("should generate order number with correct format", () => {
    const orderNumber = generateOrderNumber("ORD")
    expect(orderNumber).toMatch(/^ORD-\d{8}-\d{5}$/)
  })
  
  it("should generate unique order numbers", () => {
    const order1 = generateOrderNumber("ORD")
    const order2 = generateOrderNumber("ORD")
    expect(order1).not.toBe(order2)
  })
})
```

**Test Coverage:**
- Utility functions (order number generation, fee calculations)
- Validation functions
- Format conversion functions
- Date/time utilities

#### 14.4.2 Integration Tests

**File:** `__tests__/api/products/route.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals"
import { MongoClient } from "mongodb"
import { GET } from "@/app/api/products/route"

describe("GET /api/products", () => {
  let client: MongoClient
  
  beforeAll(async () => {
    client = new MongoClient(process.env.MONGODB_URI!)
    await client.connect()
  })
  
  afterAll(async () => {
    await client.close()
  })
  
  it("should return products with pagination", async () => {
    const request = new Request("/api/products?page=1&limit=10")
    const response = await GET(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toHaveLength(10)
    expect(data.meta.pagination).toBeDefined()
  })
  
  it("should filter products by category", async () => {
    const request = new Request("http://localhost:3000/api/products?category=supplements")
    const response = await GET(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.data.every((p: any) => p.category.main === "supplements")).toBe(true)
  })
})
```

**Test Coverage:**
- All API endpoints
- Authentication flows
- Payment processing
- Order creation
- Database operations

#### 14.4.3 E2E Tests

**File:** `__tests__/e2e/checkout.test.ts`

```typescript
import { test, expect } from "@playwright/test"

test("complete checkout flow", async ({ page }) => {
  // Add product to cart
  await page.goto("/products")
  await page.click('[data-testid="add-to-cart"]')
  
  // Go to cart
  await page.goto("/cart")
  await expect(page.locator('[data-testid="cart-item"]')).toBeVisible()
  
  // Proceed to checkout
  await page.click('[data-testid="checkout-button"]')
  
  // Fill shipping information
  await page.fill('[name="firstName"]', "John")
  await page.fill('[name="lastName"]', "Doe")
  await page.fill('[name="email"]', "john@test.com")
  await page.fill('[name="address"]', "123 Main St")
  await page.fill('[name="city"]', "Accra")
  await page.fill('[name="phone"]', "+233241234567")
  
  // Continue to payment
  await page.click('[data-testid="continue-payment"]')
  
  // Select payment method
  await page.click('[data-testid="payment-momo"]')
  
  // Place order
  await page.click('[data-testid="place-order"]')
  
  // Verify success
  await expect(page.locator('[data-testid="order-success"]')).toBeVisible()
})
```

**Test Coverage:**
- User registration/login
- Product browsing and search
- Cart management
- Checkout flow
- Payment processing
- Order tracking

#### 14.4.4 Load Testing

**Tools:** k6, Artillery, or Apache JMeter

**Test Scenarios:**
- Concurrent user registrations
- High-volume product searches
- Multiple simultaneous checkouts
- Payment processing under load
- Database query performance

**Performance Targets:**
- API response time < 200ms (p95)
- Support 1000 concurrent users
- Handle 10,000 requests per minute
- Database queries < 100ms (p95)

#### 14.4.5 Test Data Fixtures

**File:** `__tests__/fixtures/products.ts`

```typescript
export const testProducts = [
  {
    name: "Test Product 1",
    slug: "test-product-1",
    brand: "Test Brand",
    sku: "TEST-001",
    price: { ghs: 100 },
    stock: { quantity: 50, inStock: true },
    category: { main: "supplements" },
    status: "active"
  },
  // ... more test products
]

export const testUsers = [
  {
    email: "test@example.com",
    phone: "+233241234567",
    password: "hashed_password",
    role: "customer"
  },
  // ... more test users
]
```

### 14.5 Database Migration Strategy

#### 14.5.1 Migration Approach

**File:** `migrations/001-initial-schema.ts`

```typescript
import { MongoClient } from "mongodb"

export async function up(client: MongoClient) {
  const db = client.db()
  
  // Create collections
  await db.createCollection("users")
  await db.createCollection("products")
  await db.createCollection("categories")
  await db.createCollection("orders")
  await db.createCollection("adminsettings")
  await db.createCollection("admininfo")
  
  // Create indexes
  await db.collection("users").createIndex({ email: 1 }, { unique: true, sparse: true })
  await db.collection("users").createIndex({ phone: 1 }, { unique: true, sparse: true })
  await db.collection("products").createIndex({ slug: 1 }, { unique: true })
  // ... more indexes
}

export async function down(client: MongoClient) {
  const db = client.db()
  
  // Drop collections (use with caution)
  await db.collection("users").drop()
  await db.collection("products").drop()
  // ... drop other collections
}
```

#### 14.5.2 Migration Management

**File:** `lib/migrations/migrate.ts`

```typescript
import { MongoClient } from "mongodb"
import * as migrations from "@/migrations"

export async function runMigrations(client: MongoClient) {
  const db = client.db()
  const migrationsCollection = db.collection("_migrations")
  
  // Get applied migrations
  const applied = await migrationsCollection
    .find({})
    .sort({ timestamp: 1 })
    .toArray()
  
  const appliedNames = new Set(applied.map(m => m.name))
  
  // Run pending migrations
  for (const [name, migration] of Object.entries(migrations)) {
    if (!appliedNames.has(name)) {
      console.log(`Running migration: ${name}`)
      await migration.up(client)
      await migrationsCollection.insertOne({
        name,
        timestamp: new Date()
      })
      console.log(`Migration ${name} completed`)
    }
  }
}
```

#### 14.5.3 Schema Versioning

- Store schema version in Admin Settings
- Track migration history in `_migrations` collection
- Use semantic versioning for migrations (e.g., `001`, `002`)
- Test migrations on staging before production

#### 14.5.4 Rollback Strategy

- Always implement `down()` migration for rollback
- Backup database before running migrations
- Test rollback procedures in staging
- Document breaking changes

### 14.6 API Response Format Standard

All API endpoints should follow this standard format:

**Success Response:**
```typescript
{
  success: true,
  data: any, // Response data
  meta?: {
    pagination?: {
      page: number,
      limit: number,
      total: number,
      totalPages: number
    },
    timestamp: string // ISO 8601 format
  }
}
```

**Error Response:**
```typescript
{
  success: false,
  error: {
    code: string, // Error code
    message: string, // User-friendly message
    details?: any, // Additional details (dev only)
    field?: string // For validation errors
  },
  meta: {
    timestamp: string
  }
}
```

**Implementation Example:**
```typescript
// lib/api/response.ts
export function successResponse(data: any, meta?: any) {
  return NextResponse.json({
    success: true,
    data,
    meta: {
      ...meta,
      timestamp: new Date().toISOString()
    }
  })
}

export function errorResponse(error: ApiError) {
  return NextResponse.json({
    success: false,
    error: {
      code: error.code,
      message: error.message,
      ...(process.env.NODE_ENV === "development" && { details: error.details })
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  }, { status: error.statusCode })
}
```

---

## Conclusion

This implementation plan provides a comprehensive, scalable, and performant backend architecture for the iHerb clone. The focus on MongoDB indexing, API optimization, caching, and background jobs ensures the system can handle growth while maintaining speed and reliability.

**Key Priorities:**
1. ✅ Speed: Caching, optimized queries, CDN
2. ✅ Scalability: Horizontal scaling, queues, read replicas
3. ✅ Performance: Database indexes, API optimization, image optimization

**Next Steps:**
1. Review and approve this plan
2. Set up development environment
3. Begin Phase 1 implementation
4. Iterate based on testing and feedback
