/**
 * Seed script for shipping methods
 * Run with: pnpm seed:shipping-methods or npm run seed:shipping-methods
 */

import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI as string;

async function seedShippingMethods() {
  if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is not defined in environment variables");
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db();
    const shippingMethodsCollection = db.collection("shipping_methods");

    const shippingMethods = [
      {
        name: "Standard Shipping",
        code: "standard",
        description: "Standard shipping with reliable delivery",
        deliveryTime: "4-7 business days",
        multiplier: 1.0,
        isActive: true,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Express Shipping",
        code: "express",
        description: "Fast express shipping for urgent deliveries",
        deliveryTime: "2-3 business days",
        multiplier: 1.5,
        isActive: true,
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Insert shipping methods (skip duplicates)
    for (const method of shippingMethods) {
      await shippingMethodsCollection.updateOne(
        { code: method.code },
        { $setOnInsert: method },
        { upsert: true },
      );
    }

    console.log(`✅ Seeded ${shippingMethods.length} delivery methods`);
  } catch (error) {
    console.error("❌ Error seeding shipping methods:", error);
    process.exit(1);
  } finally {
    await client.close();
    console.log("✅ Database connection closed");
  }
}

// Run if called directly
if (require.main === module) {
  seedShippingMethods()
    .then(() => {
      console.log("✅ Shipping methods seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Shipping methods seeding failed:", error);
      process.exit(1);
    });
}

export default seedShippingMethods;
