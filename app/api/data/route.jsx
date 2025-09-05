// app/api/data/route.js
import mongoose from "mongoose";

/**
 * ----- Mongo connection (cached) -----
 * كل شيء داخل الملف علشان ما تحتاج import خارجي.
 */
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  // لو مش محطوط، ارجع خطأ واضح (لكن في Vercel هيتحط في Env)
  console.warn("Warning: MONGO_URI not defined in environment");
}

/**
 * Use globalThis cache to avoid multiple connections in dev / serverless
 */
if (!globalThis._mongo) globalThis._mongo = { conn: null, promise: null };

async function connectToMongo() {
  if (globalThis._mongo.conn) return globalThis._mongo.conn;
  if (!MONGO_URI) throw new Error("Please set MONGO_URI environment variable");

  if (!globalThis._mongo.promise) {
    globalThis._mongo.promise = mongoose
      .connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then((mongooseInstance) => mongooseInstance);
  }

  globalThis._mongo.conn = await globalThis._mongo.promise;
  return globalThis._mongo.conn;
}

/**
 * ----- Models (loose schema) -----
 * strict: false يسمح لأي شكل من المستندات (زي كودك الحالي)
 */
const schema = new mongoose.Schema({}, { strict: false });

const Home = mongoose.models.Home || mongoose.model("Home", schema, "home");
const Footer = mongoose.models.Footer || mongoose.model("Footer", schema, "footer");
const AboutUs = mongoose.models.AboutUs || mongoose.model("AboutUs", schema, "aboutus");
const Contact = mongoose.models.Contact || mongoose.model("Contact", schema, "contact");
const Location = mongoose.models.Location || mongoose.model("Location", schema, "location");
const Menu = mongoose.models.Menu || mongoose.model("Menu", schema, "menu");
const Navbar = mongoose.models.Navbar || mongoose.model("Navbar", schema, "navbar");

const collections = {
  home: Home,
  footer: Footer,
  aboutus: AboutUs,
  contact: Contact,
  location: Location,
  menu: Menu,
  navbar: Navbar,
};

/**
 * Helpers
 */
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function parseBody(request) {
  try {
    return await request.json();
  } catch (err) {
    return null;
  }
}

function getSearchParams(request) {
  const url = new URL(request.url);
  return {
    collection: url.searchParams.get("collection"),
    id: url.searchParams.get("id"),
  };
}

/**
 * GET handler
 * - /api/data                      -> returns all collections
 * - /api/data?collection=menu      -> returns all docs in 'menu'
 * - /api/data?collection=menu&id=x -> returns specific doc
 */
export async function GET(request) {
  try {
    await connectToMongo();
    const { collection, id } = getSearchParams(request);

    if (!collection) {
      const results = await Promise.all(
        Object.keys(collections).map((key) => collections[key].find({}))
      );
      const payload = Object.keys(collections).reduce((acc, key, idx) => {
        acc[key] = results[idx];
        return acc;
      }, {});
      return jsonResponse(payload, 200);
    }

    const key = String(collection).toLowerCase();
    const Model = collections[key];
    if (!Model) return jsonResponse({ error: "Collection not found" }, 404);

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) return jsonResponse({ error: "Invalid id format" }, 400);
      const doc = await Model.findById(id);
      if (!doc) return jsonResponse({ error: "Document not found" }, 404);
      return jsonResponse(doc, 200);
    }

    const docs = await Model.find({});
    return jsonResponse(docs, 200);
  } catch (err) {
    console.error(err);
    return jsonResponse({ error: err.message || "Internal server error" }, 500);
  }
}

/**
 * POST handler
 * - POST /api/data?collection=menu  with JSON body (object or array)
 */
export async function POST(request) {
  try {
    await connectToMongo();
    const { collection } = getSearchParams(request);
    if (!collection) return jsonResponse({ error: "Collection is required" }, 400);

    const key = String(collection).toLowerCase();
    const Model = collections[key];
    if (!Model) return jsonResponse({ error: "Collection not found" }, 404);

    const body = await parseBody(request);
    if (Array.isArray(body)) {
      const created = await Model.insertMany(body);
      return jsonResponse(created, 201);
    } else {
      const created = await Model.create(body);
      return jsonResponse(created, 201);
    }
  } catch (err) {
    console.error(err);
    return jsonResponse({ error: err.message || "Internal server error" }, 500);
  }
}

/**
 * PUT handler
 * - PUT /api/data?collection=menu&id=<id> with JSON body
 */
export async function PUT(request) {
  try {
    await connectToMongo();
    const { collection, id } = getSearchParams(request);
    if (!collection) return jsonResponse({ error: "Collection is required" }, 400);
    if (!id) return jsonResponse({ error: "ID is required for PUT" }, 400);
    if (!mongoose.Types.ObjectId.isValid(id)) return jsonResponse({ error: "Invalid id format" }, 400);

    const key = String(collection).toLowerCase();
    const Model = collections[key];
    if (!Model) return jsonResponse({ error: "Collection not found" }, 404);

    const body = await parseBody(request);
    const updated = await Model.findByIdAndUpdate(id, body, { new: true, runValidators: false });
    if (!updated) return jsonResponse({ error: "Document not found" }, 404);
    return jsonResponse(updated, 200);
  } catch (err) {
    console.error(err);
    return jsonResponse({ error: err.message || "Internal server error" }, 500);
  }
}

/**
 * DELETE handler
 * - DELETE /api/data?collection=menu&id=<id>
 */
export async function DELETE(request) {
  try {
    await connectToMongo();
    const { collection, id } = getSearchParams(request);
    if (!collection) return jsonResponse({ error: "Collection is required" }, 400);
    if (!id) return jsonResponse({ error: "ID is required for DELETE" }, 400);
    if (!mongoose.Types.ObjectId.isValid(id)) return jsonResponse({ error: "Invalid id format" }, 400);

    const key = String(collection).toLowerCase();
    const Model = collections[key];
    if (!Model) return jsonResponse({ error: "Collection not found" }, 404);

    const deleted = await Model.findByIdAndDelete(id);
    if (!deleted) return jsonResponse({ error: "Document not found" }, 404);
    return jsonResponse(deleted, 200);
  } catch (err) {
    console.error(err);
    return jsonResponse({ error: err.message || "Internal server error" }, 500);
  }
}
