// lib/mongoAuth.js
// Shared mongoose connection helper. Reuses the same cached connection
// pattern used by the NextAuth route/register route (globalThis._mongoAuth)
// so we don't open a second connection pool in the same runtime.

import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

if (!globalThis._mongoAuth) {
  globalThis._mongoAuth = { conn: null, promise: null };
}

export async function connectMongoDB() {
  if (globalThis._mongoAuth.conn) return globalThis._mongoAuth.conn;
  if (!MONGO_URI) throw new Error('MONGO_URI not set');

  if (!globalThis._mongoAuth.promise) {
    globalThis._mongoAuth.promise = mongoose.connect(MONGO_URI).then((m) => m);
  }

  globalThis._mongoAuth.conn = await globalThis._mongoAuth.promise;
  return globalThis._mongoAuth.conn;
}

export default connectMongoDB;