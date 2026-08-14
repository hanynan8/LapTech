// lib/getBaseUrl.js
//
// الـ fetch لما بيشتغل جوا Server Component / على السيرفر (Node.js) محتاج رابط
// كامل (absolute URL) مش نسبي زي '/api/data'. الدالة دي بترجع الدومين الصحيح
// تلقائياً حسب البيئة:
//
//  1) لو NEXT_PUBLIC_SITE_URL متظبط في .env (الأفضل للإنتاج) -> يستخدمه.
//  2) لو شغال على Vercel -> بيستخدم VERCEL_URL تلقائياً.
//  3) في التطوير المحلي -> بيرجع http://localhost:PORT (افتراضي 3000).
//
// يعني لما تستضيف المشروع على دومين جديد، تحط الدومين في NEXT_PUBLIC_SITE_URL
// وخلاص كل الطلبات هتتوجه لـ domain/api/data تلقائياً.

export function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return `http://localhost:${process.env.PORT || 3000}`;
}
