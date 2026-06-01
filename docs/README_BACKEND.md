# Backend Implementation - Complete Guide

## ✅ All Components Implemented

This document provides an overview of all implemented backend components and how to use them.

## 📦 Installation

Install all required dependencies:

```bash
yarn install
# or
npm install
```

## 🔧 Required Environment Variables

Add these to your `.env.local` file:

```env
# Database
MONGODB_URI=

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Paystack
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (Resend)
RESEND_API_KEY=re_...

# Redis (Optional - for caching and rate limiting)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Or traditional Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# SMS (MNotify)
MNOTIFY_PROVIDER_URL=https://api.mnotify.com/api/sms/quick
MNOTIFY_API_KEY=your_mnotify_api_key_here
MNOTIFY_SMS_SENDER_ID=your_sender_id_here

# Logging
LOG_LEVEL=info
```

## 🚀 Setup Commands

### 1. Seed Database

Populate the database with test data:

```bash
# Normal seed (skips existing records)
yarn seed

# Reset and seed (deletes existing data)
yarn seed:reset
```

This will create:
- 2 admin users (admin@iherb.com, superadmin@iherb.com)
- 3 test customers
- 9 product categories
- 1 admin settings record
- 12 admin info records

### 2. Create Database Indexes

Create all necessary database indexes for optimal performance:

```bash
yarn migrate
```

## 📁 Implemented Components

### 1. Seed Script (`scripts/seed.ts`)

Comprehensive database seeding with:
- Users (admins and customers)
- Categories (with subcategories)
- Admin Settings (single record)
- Admin Info (multiple records)

**Usage:**
```bash
yarn seed          # Seed without reset
yarn seed:reset    # Clear and seed
```

### 2. OTP System (`lib/auth/otp.ts`)

One-time password system for email/phone verification:
- Generate 6-digit OTPs
- Store in MongoDB with TTL (10 minutes)
- Rate limiting (3 requests per hour)
- Automatic expiry

**Usage:**
```typescript
import { generateOTP, storeOTP, verifyOTP } from "@/lib/auth/otp";

// Generate and store OTP
const otp = generateOTP();
await storeOTP(email, otp, "email");

// Verify OTP
const isValid = await verifyOTP(email, otp, "email");
```

### 3. Email Notifications (`lib/notifications/email.ts`)

Email service using Resend:
- Order confirmation
- Payment confirmation
- Order shipped
- Order delivered
- OTP emails
- Password reset

**Usage:**
```typescript
import { sendOrderConfirmationEmail } from "@/lib/notifications/email";

await sendOrderConfirmationEmail(
  "user@example.com",
  "ORD-20240101-12345",
  150.00,
  "GHS"
);
```

### 4. SMS Notifications (`lib/notifications/sms.ts`)

SMS service (supports Twilio, Termii):
- Order confirmation
- Payment confirmation
- Order shipped
- Order delivered
- OTP SMS

**Usage:**
```typescript
import { sendOrderConfirmationSMS } from "@/lib/notifications/sms";

await sendOrderConfirmationSMS("+233241234567", "ORD-20240101-12345");
```

### 5. Rate Limiting (`lib/ratelimit.ts`)

API rate limiting with Upstash Redis:
- Authentication: 5 requests per 15 minutes
- Payment: 3 requests per minute
- Search: 30 requests per minute
- OTP: 3 requests per hour
- General: 100 requests per minute

**Usage in API routes:**
```typescript
import { withAuthRateLimit } from "@/lib/api/ratelimit-middleware";

export async function POST(request: NextRequest) {
  // Check rate limit
  const rateLimitResponse = await withAuthRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;
  
  // Continue with handler...
}
```

### 6. Redis Caching (`lib/cache/redis.ts`)

Caching utilities for:
- Products (5 min TTL)
- Categories (1 hour TTL)
- User data (15 min TTL)
- Admin settings (30 min TTL)

**Usage:**
```typescript
import { getCache, setCache, cacheKeys } from "@/lib/cache/redis";

// Get from cache
const products = await getCache(cacheKeys.products.list("supplements", 1));

// Set cache
await setCache(cacheKeys.products.list("supplements", 1), products, 300);
```

### 7. Background Jobs (`lib/jobs/queue.ts`)

Queue system using BullMQ for async processing:
- Email queue
- SMS queue
- Notification queue
- Order processing queue

**Usage:**
```typescript
import { addEmailJob, addNotificationJob } from "@/lib/jobs/queue";

// Add email job
await addEmailJob("order_confirmation", {
  email: "user@example.com",
  orderNumber: "ORD-123",
  orderTotal: 150.00,
  currency: "GHS"
});

// Add notification (both email and SMS)
await addNotificationJob(
  "order_confirmation",
  { email: "user@example.com", ... },
  { phone: "+233241234567", ... }
);
```

**Note:** BullMQ requires a full Redis connection (not REST API). For Upstash, use a Redis client like `ioredis`.

### 8. Logging (`lib/logger.ts`)

Structured logging with levels:
- DEBUG
- INFO
- WARN
- ERROR

**Usage:**
```typescript
import { logger, logRequest, logError } from "@/lib/logger";

logger.info("User logged in", { userId: "123" });
logger.error("Payment failed", error, { orderId: "ORD-123" });

logRequest("POST", "/api/orders", 200, 150, "user-123", "192.168.1.1");
```

### 9. Database Migrations (`lib/migrations/indexes.ts`)

Index creation for optimal query performance:
- Users indexes (email, phone, role, createdAt)
- Products indexes (slug, sku, category, brand, text search)
- Orders indexes (orderNumber, userId, status)
- And more...

**Usage:**
```bash
yarn migrate
```

## 🔌 Integration Examples

### Using OTP in API Route

```typescript
// app/api/auth/otp/route.ts
import { generateOTP, storeOTP } from "@/lib/auth/otp";
import { sendOTPEmail } from "@/lib/notifications/email";
import { withOTPRateLimit } from "@/lib/api/ratelimit-middleware";

export async function POST(request: NextRequest) {
  const rateLimitResponse = await withOTPRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;
  
  const { email } = await request.json();
  const otp = generateOTP();
  
  await storeOTP(email, otp, "email");
  await sendOTPEmail(email, otp);
  
  return successResponse({ message: "OTP sent" });
}
```

### Using Background Jobs for Notifications

```typescript
// In order creation
import { addNotificationJob } from "@/lib/jobs/queue";

// After order is created
await addNotificationJob(
  "order_confirmation",
  {
    email: order.shipping.email,
    orderNumber: order.orderNumber,
    orderTotal: order.pricing.total,
    currency: order.pricing.currency,
  },
  {
    phone: order.shipping.phone,
    orderNumber: order.orderNumber,
  }
);
```

### Using Caching in API Routes

```typescript
import { getCache, setCache, cacheKeys } from "@/lib/cache/redis";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "all";
  const page = parseInt(searchParams.get("page") || "1");
  
  // Try cache first
  const cacheKey = cacheKeys.products.list(category, page);
  const cached = await getCache(cacheKey);
  if (cached) {
    return successResponse(cached);
  }
  
  // Fetch from database
  const products = await db.collection("products").find(...).toArray();
  
  // Cache result
  await setCache(cacheKey, products, CACHE_TTL.PRODUCTS);
  
  return successResponse(products);
}
```

## 📊 Monitoring

### Log Levels

Set `LOG_LEVEL` environment variable:
- `debug` - All logs
- `info` - Info, warnings, and errors
- `warn` - Warnings and errors only
- `error` - Errors only

### Error Tracking

Integrate with Sentry by setting `SENTRY_DSN`:
```env
SENTRY_DSN=https://...
```

## 🧪 Testing

All components are ready for integration testing. Example test structure:

```typescript
// __tests__/lib/auth/otp.test.ts
import { generateOTP, storeOTP, verifyOTP } from "@/lib/auth/otp";

describe("OTP System", () => {
  it("should generate 6-digit OTP", () => {
    const otp = generateOTP();
    expect(otp).toMatch(/^\d{6}$/);
  });
  
  it("should verify correct OTP", async () => {
    const otp = generateOTP();
    await storeOTP("test@example.com", otp, "email");
    const isValid = await verifyOTP("test@example.com", otp, "email");
    expect(isValid).toBe(true);
  });
});
```

## 🚨 Important Notes

1. **Redis**: For production, ensure Redis is properly configured. Upstash REST API works for caching and rate limiting, but BullMQ requires a full Redis connection.

2. **Email Service**: Configure Resend API key for email notifications to work.

3. **SMS Service**: Configure Twilio or Termii for SMS notifications.

4. **Rate Limiting**: Falls back to in-memory rate limiting if Redis is not available (not recommended for production).

5. **Background Jobs**: Workers need to be running separately or in a separate process.

## 📝 Next Steps

1. Configure environment variables
2. Run `yarn seed` to populate test data
3. Run `yarn migrate` to create indexes
4. Start integrating components into your API routes
5. Set up background job workers
6. Configure monitoring and error tracking

## 🎉 All Done!

All backend components from the implementation plan are now complete and ready to use!
