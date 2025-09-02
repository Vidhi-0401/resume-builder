// lib/mongoose.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;
const DB_NAME = process.env.MONGODB_DB;

if (!MONGODB_URI) {
  throw new Error("Please set MONGODB_URI in .env.local");
}

// Cache the connection in dev & serverless to avoid creating multiple connections
declare global {
  // eslint-disable-next-line no-var
  var _mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

let cached = global._mongoose || { conn: null, promise: null as Promise<typeof mongoose> | null };
global._mongoose = cached;

export async function connectToDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { dbName: DB_NAME }).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
