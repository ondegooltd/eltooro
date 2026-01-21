import { createIndexes } from "@/lib/migrations/indexes";

async function migrate() {
  try {
    console.log("🚀 Starting database migration...");
    await createIndexes();
    console.log("✅ Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
