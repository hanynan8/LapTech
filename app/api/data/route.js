// // app/api/cart/route.js
// import mongoose from "mongoose";

// /**
//  * ----- Mongo connection (مستخدم نفس الطريقة من ملف data) -----
//  */
// const MONGO_URI = process.env.MONGO_URI;
// if (!MONGO_URI) {
//   console.warn("Warning: MONGO_URI not defined in environment");
// }

// if (!globalThis._mongo) globalThis._mongo = { conn: null, promise: null };

// async function connectToMongo() {
//   if (globalThis._mongo.conn) return globalThis._mongo.conn;
//   if (!MONGO_URI) throw new Error("Please set MONGO_URI environment variable");

//   if (!globalThis._mongo.promise) {
//     globalThis._mongo.promise = mongoose
//       .connect(MONGO_URI, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//       })
//       .then((mongooseInstance) => mongooseInstance);
//   }

//   globalThis._mongo.conn = await globalThis._mongo.promise;
//   return globalThis._mongo.conn;
// }

// /**
//  * Cart Schema
//  */
// const cartSchema = new mongoose.Schema({
//   userId: { type: String, required: true, unique: true },
//   items: [{
//     id: String,
//     name: String,
//     price: mongoose.Schema.Types.Mixed, // يمكن أن يكون رقم أو نص
//     currency: { type: String, default: 'ج.م' },
//     image: String,
//     quantity: { type: Number, default: 1 }
//   }],
//   updatedAt: { type: Date, default: Date.now }
// });

// const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema, "carts");

// /**
//  * Helper functions
//  */
// function jsonResponse(data, status = 200) {
//   return new Response(JSON.stringify(data), {
//     status,
//     headers: { "Content-Type": "application/json" },
//   });
// }

// async function parseBody(request) {
//   try {
//     return await request.json();
//   } catch (err) {
//     return null;
//   }
// }

// /**
//  * GET /api/cart?userId=guest
//  * إحضار سلة المستخدم
//  */
// export async function GET(request) {
//   try {
//     await connectToMongo();
    
//     const url = new URL(request.url);
//     const userId = url.searchParams.get("userId");
    
//     if (!userId) {
//       return jsonResponse({ error: "userId is required" }, 400);
//     }

//     const cart = await Cart.findOne({ userId });
    
//     if (!cart) {
//       return jsonResponse({ items: [] }, 200);
//     }

//     return jsonResponse({ items: cart.items }, 200);
    
//   } catch (err) {
//     console.error("Cart GET error:", err);
//     return jsonResponse({ error: err.message || "Internal server error" }, 500);
//   }
// }

// /**
//  * POST /api/cart?userId=guest
//  * حفظ/تحديث سلة المستخدم
//  */
// export async function POST(request) {
//   try {
//     await connectToMongo();
    
//     const url = new URL(request.url);
//     const userId = url.searchParams.get("userId");
    
//     if (!userId) {
//       return jsonResponse({ error: "userId is required" }, 400);
//     }

//     const body = await parseBody(request);
//     if (!body || !Array.isArray(body.items)) {
//       return jsonResponse({ error: "Invalid request body. Expected { items: [] }" }, 400);
//     }

//     // تحديث أو إنشاء السلة
//     const cart = await Cart.findOneAndUpdate(
//       { userId },
//       { 
//         userId, 
//         items: body.items,
//         updatedAt: new Date()
//       },
//       { 
//         new: true, 
//         upsert: true, // إنشاء جديد إذا لم يوجد
//         runValidators: true 
//       }
//     );

//     return jsonResponse({ 
//       success: true, 
//       items: cart.items,
//       message: "Cart saved successfully"
//     }, 200);
    
//   } catch (err) {
//     console.error("Cart POST error:", err);
//     return jsonResponse({ error: err.message || "Internal server error" }, 500);
//   }
// }

// /**
//  * DELETE /api/cart?userId=guest
//  * مسح سلة المستخدم
//  */
// export async function DELETE(request) {
//   try {
//     await connectToMongo();
    
//     const url = new URL(request.url);
//     const userId = url.searchParams.get("userId");
    
//     if (!userId) {
//       return jsonResponse({ error: "userId is required" }, 400);
//     }

//     const result = await Cart.deleteOne({ userId });
    
//     return jsonResponse({ 
//       success: true,
//       deleted: result.deletedCount > 0,
//       message: "Cart cleared successfully"
//     }, 200);
    
//   } catch (err) {
//     console.error("Cart DELETE error:", err);
//     return jsonResponse({ error: err.message || "Internal server error" }, 500);
//   }
// }