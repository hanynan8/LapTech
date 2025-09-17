export const runtime = "nodejs";
// app/api/auth/[...nextauth]/route.js
import { handlers } from "./auth"  // assuming عندك ملف auth.js في جذر المشروع

export const { GET, POST } = handlers
