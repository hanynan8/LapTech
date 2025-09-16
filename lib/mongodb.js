// lib/mongodb.js
import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;
if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable in .env.local");
}

let cached = global._mongo; // for dev HMR caching
if (!cached) cached = global._mongo = { conn: null, promise: null };

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const client = new MongoClient(uri, { serverApi: { version: "1" } });
    cached.promise = client.connect().then((client) => client.db()); // return db
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
