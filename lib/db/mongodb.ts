/**
 * Native MongoDB driver access on top of the **same** Mongoose connection pool.
 * Used by: NextAuth MongoDB adapter, OTP counters, order number sequences, raw DB helpers.
 * Do not create a second MongoClient here — that avoids split-brain connections.
 */
import type { Db, MongoClient } from "mongodb";
import mongoose from "mongoose";
import connectDB from "./mongoose";

const uri = process.env.MONGODB_URI || "";
const dbNameMatch = uri.match(/\/([^/?]+)(\?|$)/);
const databaseName = dbNameMatch ? dbNameMatch[1] : undefined;

declare global {
  // eslint-disable-next-line no-var -- TypeScript global augmentation requires `var`
  var _mongoAdapterClientPromise: Promise<MongoClient> | undefined;
}

function createMongoClientPromise(): Promise<MongoClient> {
  return (async () => {
    await connectDB();
    // Mongoose bundles a compatible driver; cast for NextAuth / getDb typings vs root `mongodb`.
    return mongoose.connection.getClient() as unknown as MongoClient;
  })();
}

let prodAdapterClientPromise: Promise<MongoClient> | null = null;

function getAdapterClientPromise(): Promise<MongoClient> {
  if (process.env.NODE_ENV === "development") {
    return (global._mongoAdapterClientPromise ??= createMongoClientPromise());
  }
  prodAdapterClientPromise ??= createMongoClientPromise();
  return prodAdapterClientPromise;
}

/** Shared MongoClient promise for @next-auth/mongodb-adapter */
const clientPromise = getAdapterClientPromise();

export default clientPromise;

export async function getDb(): Promise<Db> {
  await connectDB();
  const client = mongoose.connection.getClient();
  const rawDb =
    databaseName != null ? client.db(databaseName) : mongoose.connection.db;
  if (!rawDb) {
    throw new Error("MongoDB database not available");
  }
  return rawDb as unknown as Db;
}
