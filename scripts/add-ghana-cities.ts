/**
 * Migrate the admin settings `deliveryFees` to the dynamic, admin-managed shape:
 *
 *   { cities: [{ name, fee }], other: number, international: number }
 *
 * - Converts a legacy flat document ({ accra: 50, capeCoast: 50, ... }) into the
 *   new `cities` array, preserving every existing fee.
 * - Adds any default cities that aren't already present.
 * - Ensures `other` and `international` fees exist.
 * - Idempotent: safe to run repeatedly. If the document is already migrated it
 *   only tops up missing default cities.
 *
 * Run with: pnpm add:ghana-cities or npm run add:ghana-cities
 */

import { MongoClient } from "mongodb";
import {
  DEFAULT_DELIVERY_CITIES,
  OTHER_CITY_DEFAULT_FEE,
  INTERNATIONAL_DEFAULT_FEE,
  type DeliveryCity,
} from "../lib/shipping/ghana-cities";

// const MONGODB_URI = process.env.MONGODB_URI as string;
const MONGODB_URI =
  "mongodb+srv://eltooroDb:xjt9OFhPbNwGwQ6U@eltooromain.vpvy4kq.mongodb.net/abdb?appName=eltooroMain";

// Friendly display names for legacy camelCase fee keys.
const LEGACY_KEY_NAMES: Record<string, string> = {
  winneba: "Winneba",
  mankesim: "Mankesim",
  accra: "Accra",
  capeCoast: "Cape Coast",
  takoradi: "Takoradi",
  kumasi: "Kumasi",
  sunyani: "Sunyani",
  tema: "Tema",
  kasoa: "Kasoa",
  madina: "Madina",
  ashaiman: "Ashaiman",
  obuasi: "Obuasi",
  tarkwa: "Tarkwa",
  koforidua: "Koforidua",
  ho: "Ho",
  techiman: "Techiman",
  tamale: "Tamale",
  wa: "Wa",
  bolgatanga: "Bolgatanga",
};

function humanize(key: string): string {
  const spaced = key.replace(/([a-z])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

async function addGhanaCities() {
  if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is not defined");
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db();
    const collection = db.collection("adminsettings");

    const settings = await collection.findOne({});
    if (!settings) {
      console.error(
        "❌ No admin settings document found. Run `npm run seed` first."
      );
      process.exit(1);
    }

    const existing = (settings.deliveryFees || {}) as Record<string, unknown>;

    // Start from existing cities (already-migrated docs) or convert legacy keys.
    const cities: DeliveryCity[] = Array.isArray(existing.cities)
      ? (existing.cities as DeliveryCity[]).map((c) => ({
          name: String(c.name),
          fee: Number(c.fee),
        }))
      : Object.entries(existing)
          .filter(
            ([key, value]) =>
              key !== "international" &&
              key !== "other" &&
              key !== "cities" &&
              typeof value === "number"
          )
          .map(([key, value]) => ({
            name: LEGACY_KEY_NAMES[key] || humanize(key),
            fee: value as number,
          }));

    // Top up with any default cities not already present (case-insensitive).
    const present = new Set(cities.map((c) => c.name.trim().toLowerCase()));
    for (const city of DEFAULT_DELIVERY_CITIES) {
      if (!present.has(city.name.trim().toLowerCase())) {
        cities.push({ ...city });
        present.add(city.name.trim().toLowerCase());
      }
    }

    const other =
      typeof existing.other === "number"
        ? (existing.other as number)
        : OTHER_CITY_DEFAULT_FEE;
    const international =
      typeof existing.international === "number"
        ? (existing.international as number)
        : INTERNATIONAL_DEFAULT_FEE;

    await collection.updateOne(
      { _id: settings._id },
      { $set: { deliveryFees: { cities, other, international } } }
    );

    console.log(
      `✅ Delivery fees migrated: ${cities.length} cities, other=${other}, international=${international}`
    );
  } catch (error) {
    console.error("❌ Error migrating delivery fees:", error);
    process.exit(1);
  } finally {
    await client.close();
    console.log("✅ Database connection closed");
  }
}

if (require.main === module) {
  addGhanaCities()
    .then(() => {
      console.log("✅ Delivery fees migration completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Delivery fees migration failed:", error);
      process.exit(1);
    });
}

export default addGhanaCities;
