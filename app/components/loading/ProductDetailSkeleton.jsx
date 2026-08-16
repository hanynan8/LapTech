// app/components/loading/ProductDetailSkeleton.jsx
//
// سكيلتون تحميل موحّد لكل صفحات تفاصيل المنتج (accessories, laptop,
// component, monitors, other, pc-builds, pos, printers, storage-devices).
//
// ملاحظة مهمة: Next.js (App Router) بيتطلب ملف loading.jsx فعليًا موجود
// جوه كل مجلد route عشان يعرف يعمل Suspense boundary لصفحة التفاصيل بتاعته
// - مينفعش ملف loading.jsx واحد "يغطي" أكتر من مجلد. لكن مش لازم نكرر
// الكود نفسه في كل مكان: كل ملف loading.jsx بيبقى مجرد سطرين بيستوردوا
// الكومبوننت ده ويعرضوه، فالتصميم والتعديل عليه بيتم في مكان واحد بس.
export default function ProductDetailSkeleton() {
  return (
    <main dir="rtl" className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-4 w-40 bg-gray-200 rounded mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-gray-200 rounded" />
            <div className="h-4 w-1/2 bg-gray-200 rounded" />
            <div className="h-10 w-1/3 bg-gray-200 rounded" />
            <div className="h-24 w-full bg-gray-200 rounded-2xl" />
            <div className="h-12 w-full bg-gray-200 rounded-xl" />
          </div>
        </div>
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="h-28 bg-gray-200 rounded-2xl" />
          <div className="h-28 bg-gray-200 rounded-2xl" />
          <div className="h-28 bg-gray-200 rounded-2xl" />
          <div className="h-28 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    </main>
  );
}