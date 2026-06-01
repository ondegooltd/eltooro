/**
 * Example: Migrating from MongoDB Native Driver to Mongoose
 *
 * This file shows examples of how to migrate API routes to use Mongoose models
 */

// ============================================================================
// EXAMPLE 1: GET Product by ID
// ============================================================================

// BEFORE (MongoDB Native):
/*
import { getDb } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = await getDb();
  const { id } = await params;
  
  const product = await db.collection("products").findOne({
    _id: new ObjectId(id),
    status: "active",
  });
  
  return successResponse(product);
}
*/

// AFTER (Mongoose):
/*
import { initModels } from "@/lib/models/helpers";
import { Product } from "@/lib/models";
import { ValidationError } from "@/lib/errors/api-error";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await initModels();
    const { id } = await params;
    
    // Mongoose automatically validates ObjectId format
    const product = await Product.findOne({
      _id: id,
      status: "active",
    });
    
    if (!product) {
      throw new ValidationError("Product not found");
    }
    
    return successResponse(product);
  } catch (error) {
    return handleApiError(error);
  }
}
*/

// ============================================================================
// EXAMPLE 2: Create Product
// ============================================================================

// BEFORE (MongoDB Native):
/*
const product = {
  name: validatedData.name,
  slug: validatedData.slug,
  price: { ghs: validatedData.price },
  // ... other fields
};

const result = await db.collection("products").insertOne(product);
*/

// AFTER (Mongoose):
/*
const product = new Product({
  name: validatedData.name,
  slug: validatedData.slug,
  price: { ghs: validatedData.price },
  // ... other fields
});

// Mongoose validates before saving
await product.save();
// product._id is automatically set
*/

// ============================================================================
// EXAMPLE 3: Update Product
// ============================================================================

// BEFORE (MongoDB Native):
/*
await db.collection("products").updateOne(
  { _id: new ObjectId(id) },
  { $set: { name: validatedData.name, updatedAt: new Date() } }
);
*/

// AFTER (Mongoose):
/*
const product = await Product.findById(id);
if (!product) throw new NotFoundError("Product");

product.name = validatedData.name;
// updatedAt is automatically set by timestamps: true
await product.save();
*/

// OR using findOneAndUpdate:
/*
const product = await Product.findOneAndUpdate(
  { _id: id },
  { $set: { name: validatedData.name } },
  { new: true, runValidators: true }
);
*/

// ============================================================================
// EXAMPLE 4: Query with Filters
// ============================================================================

// BEFORE (MongoDB Native):
/*
const query: any = { status: "active" };
if (category) query["category.main"] = category;
if (minPrice) query["price.ghs"] = { $gte: parseFloat(minPrice) };

const products = await db.collection("products")
  .find(query)
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .toArray();
*/

// AFTER (Mongoose):
/*
const query: any = { status: "active" };
if (category) query["category.main"] = category;
if (minPrice) query["price.ghs"] = { $gte: parseFloat(minPrice) };

const products = await Product.find(query)
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .lean(); // Use .lean() for better performance when not needing Mongoose features
*/

// ============================================================================
// EXAMPLE 5: Populate Relationships
// ============================================================================

// BEFORE (MongoDB Native):
/*
const order = await db.collection("orders").findOne({ _id: new ObjectId(id) });
const user = await db.collection("users").findOne({ _id: order.userId });
*/

// AFTER (Mongoose):
/*
const order = await Order.findById(id).populate("userId", "name email");
// order.userId is now populated with user data
*/

// ============================================================================
// EXAMPLE 6: Transactions
// ============================================================================

// BEFORE (MongoDB Native):
/*
const session = client.startSession();
await session.withTransaction(async () => {
  await db.collection("orders").insertOne(order, { session });
  await db.collection("products").updateOne(
    { _id: productId },
    { $inc: { "stock.quantity": -quantity } },
    { session }
  );
});
*/

// AFTER (Mongoose):
/*
const session = await mongoose.startSession();
await session.withTransaction(async () => {
  await Order.create([order], { session });
  await Product.findByIdAndUpdate(
    productId,
    { $inc: { "stock.quantity": -quantity } },
    { session }
  );
});
*/

// ============================================================================
// EXAMPLE 7: Validation Errors
// ============================================================================

// Mongoose validation errors are automatically caught:
/*
try {
  const product = new Product({ name: "" }); // Invalid: name is required
  await product.save();
} catch (error) {
  if (error instanceof mongoose.Error.ValidationError) {
    // Handle validation errors
    const errors = Object.values(error.errors).map((e) => e.message);
    throw new ValidationError(errors.join(", "));
  }
  throw error;
}
*/
