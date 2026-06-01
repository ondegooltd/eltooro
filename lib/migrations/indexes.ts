import { getDb } from "@/lib/db/mongodb";

/**
 * Create all database indexes
 */
export async function createIndexes(): Promise<void> {
  const db = await getDb();

  console.log("📊 Creating database indexes...");

  // Users Collection Indexes
  await db
    .collection("users")
    .createIndex({ email: 1 }, { unique: true, sparse: true });
  await db
    .collection("users")
    .createIndex({ phone: 1 }, { unique: true, sparse: true });
  await db.collection("users").createIndex({ createdAt: -1 });
  await db.collection("users").createIndex({ role: 1 });
  await db.collection("users").createIndex({ lastLogin: -1 }); // For querying recently active users

  // Products Collection Indexes
  await db.collection("products").createIndex({ slug: 1 }, { unique: true });
  await db.collection("products").createIndex({ sku: 1 }, { unique: true });
  await db.collection("products").createIndex({ "category.main": 1 });
  await db.collection("products").createIndex({ brand: 1 });
  await db.collection("products").createIndex({ status: 1 });
  await db.collection("products").createIndex({ "price.ghs": 1 });
  await db.collection("products").createIndex({ "rating.average": -1 });
  await db.collection("products").createIndex({ createdAt: -1 });
  await db.collection("products").createIndex({ tags: 1 });
  // Text index for search
  await db
    .collection("products")
    .createIndex(
      { name: "text", description: "text", tags: "text" },
      { name: "product_text_search" }
    );

  // Categories Collection Indexes
  await db.collection("categories").createIndex({ slug: 1 }, { unique: true });
  await db.collection("categories").createIndex({ parentId: 1 });
  await db.collection("categories").createIndex({ order: 1 });
  await db.collection("categories").createIndex({ isActive: 1 });

  // Orders Collection Indexes
  await db
    .collection("orders")
    .createIndex({ orderNumber: 1 }, { unique: true });
  await db.collection("orders").createIndex({ userId: 1 });
  await db
    .collection("orders")
    .createIndex({ "payment.reference": 1 }, { unique: true, sparse: true });
  await db.collection("orders").createIndex({ status: 1 });
  await db.collection("orders").createIndex({ createdAt: -1 });
  await db.collection("orders").createIndex({ "payment.status": 1 });

  // Carts Collection Indexes
  await db.collection("carts").createIndex({ userId: 1 });
  await db.collection("carts").createIndex({ sessionId: 1 });
  await db
    .collection("carts")
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

  // Wishlists Collection Indexes
  await db.collection("wishlists").createIndex({ userId: 1 }, { unique: true });

  // Reviews Collection Indexes
  await db.collection("reviews").createIndex({ productId: 1 });
  await db.collection("reviews").createIndex({ userId: 1 });
  await db.collection("reviews").createIndex({ rating: 1 });
  await db.collection("reviews").createIndex({ createdAt: -1 });
  await db.collection("reviews").createIndex({ productId: 1, verified: 1 });

  // Admin Settings Collection Indexes
  await db.collection("adminsettings").createIndex({ updatedAt: -1 });

  // Admin Info Collection Indexes
  await db.collection("admininfo").createIndex({ type: 1 });
  await db.collection("admininfo").createIndex({ slug: 1 }, { unique: true });
  await db.collection("admininfo").createIndex({ status: 1 });
  await db.collection("admininfo").createIndex({ order: 1 });
  await db.collection("admininfo").createIndex({ createdAt: -1 });
  await db.collection("admininfo").createIndex({ type: 1, status: 1 });
  await db.collection("admininfo").createIndex({ type: 1, order: 1 });
  // Text index for search
  await db
    .collection("admininfo")
    .createIndex(
      { title: "text", content: "text", tags: "text" },
      { name: "admininfo_text_search" }
    );

  // OTPs Collection Indexes
  await db.collection("otps").createIndex({ identifier: 1, type: 1 });
  await db
    .collection("otps")
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await db.collection("otps").createIndex({ createdAt: 1 });

  // Support Tickets Collection Indexes
  await db
    .collection("support_tickets")
    .createIndex({ ticketNumber: 1 }, { unique: true });
  await db.collection("support_tickets").createIndex({ userId: 1 });
  await db.collection("support_tickets").createIndex({ email: 1 });
  await db.collection("support_tickets").createIndex({ status: 1 });
  await db.collection("support_tickets").createIndex({ priority: 1 });
  await db.collection("support_tickets").createIndex({ subject: 1 });
  await db.collection("support_tickets").createIndex({ createdAt: -1 });
  await db.collection("support_tickets").createIndex({ assignedTo: 1 });
  await db.collection("support_tickets").createIndex({ updatedAt: -1 });
  // Compound indexes for common queries
  await db
    .collection("support_tickets")
    .createIndex({ status: 1, priority: 1 });
  await db.collection("support_tickets").createIndex({ userId: 1, status: 1 });

  // SMS Templates Collection Indexes
  await db.collection("sms_templates").createIndex({ eventType: 1 });
  await db.collection("sms_templates").createIndex({ status: 1 });
  await db.collection("sms_templates").createIndex({ isDefault: 1 });
  await db.collection("sms_templates").createIndex({ createdAt: -1 });
  await db.collection("sms_templates").createIndex({ usageCount: -1 });
  await db.collection("sms_templates").createIndex({ lastUsedAt: -1 });
  // Compound indexes for common queries
  await db.collection("sms_templates").createIndex({ eventType: 1, status: 1 });
  await db
    .collection("sms_templates")
    .createIndex({ eventType: 1, isDefault: 1 });

  console.log("✅ Database indexes created successfully!");
}

/**
 * Drop all indexes (use with caution)
 */
export async function dropIndexes(): Promise<void> {
  const db = await getDb();

  console.log("🗑️ Dropping database indexes...");

  const collections = [
    "users",
    "products",
    "categories",
    "orders",
    "carts",
    "wishlists",
    "reviews",
    "adminsettings",
    "admininfo",
    "otps",
    "support_tickets",
    "sms_templates",
  ];

  for (const collectionName of collections) {
    try {
      const collection = db.collection(collectionName);
      const indexes = await collection.indexes();

      // Drop all indexes except _id
      for (const index of indexes) {
        if (index.name !== "_id_") {
          await collection.dropIndex(index.name);
        }
      }
    } catch (error) {
      console.error(`Error dropping indexes for ${collectionName}:`, error);
    }
  }

  console.log("✅ Database indexes dropped!");
}
