# Mongoose Models

This directory contains all Mongoose schemas for the application. These schemas provide:

- **Type Safety**: Full TypeScript support with interfaces
- **Validation**: Built-in Mongoose validation
- **Indexes**: Optimized database indexes
- **Relationships**: Proper references between collections

## Models

1. **User** (`user.ts`) - User accounts with addresses and preferences
2. **Product** (`product.ts`) - Products with pricing, stock, and images
3. **Order** (`order.ts`) - Orders with items, shipping, billing, and payment
4. **Category** (`category.ts`) - Product categories with hierarchy
5. **Cart** (`cart.ts`) - Shopping carts with expiration
6. **Wishlist** (`wishlist.ts`) - User wishlists
7. **Review** (`review.ts`) - Product reviews
8. **SupportTicket** (`support-ticket.ts`) - Customer support tickets
9. **AdminInfo** (`admin-info.ts`) - Content management (policies, FAQs, etc.)
10. **AdminSettings** (`admin-settings.ts`) - Application settings
11. **SMSTemplate** (`sms-template.ts`) - SMS notification templates

## Usage in API Routes

### Basic Pattern

```typescript
import { initModels } from "@/lib/models/helpers";
import { Product } from "@/lib/models";

export async function GET(request: NextRequest) {
  try {
    // Initialize connection and get models
    await initModels();
    
    // Use the model
    const products = await Product.find({ status: "active" })
      .sort({ createdAt: -1 })
      .limit(20);
    
    return successResponse(products);
  } catch (error) {
    return handleApiError(error);
  }
}
```

### With Validation

```typescript
import { initModels } from "@/lib/models/helpers";
import { Product } from "@/lib/models";
import { z } from "zod";

const createProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().min(0),
  // ... other fields
});

export async function POST(request: NextRequest) {
  try {
    await initModels();
    const body = await request.json();
    
    // Zod validation (for API input)
    const validatedData = createProductSchema.parse(body);
    
    // Mongoose validation (for database integrity)
    const product = new Product({
      ...validatedData,
      slug: generateSlug(validatedData.name),
      // ... other computed fields
    });
    
    // Mongoose will validate before saving
    await product.save();
    
    return successResponse(product, {}, 201);
  } catch (error) {
    // Handle both Zod and Mongoose validation errors
    return handleApiError(error);
  }
}
```

## Migration from MongoDB Native Driver

### Before (MongoDB Native):
```typescript
const db = await getDb();
const product = await db.collection("products").findOne({
  _id: new ObjectId(id),
});
```

### After (Mongoose):
```typescript
await initModels();
const product = await Product.findById(id);
```

## Benefits

1. **Automatic Validation**: Mongoose validates data before saving
2. **Type Safety**: Full TypeScript support
3. **Better Queries**: Cleaner query syntax
4. **Relationships**: Easy population of related documents
5. **Middleware**: Hooks for pre/post save operations
6. **Indexes**: Defined in schema, automatically created

## Notes

- Models use the same collection names as before
- All existing indexes are preserved
- Can be used alongside MongoDB native driver if needed
- Models are cached and reused across requests
