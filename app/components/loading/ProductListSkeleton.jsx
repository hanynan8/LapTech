// app/components/loading/ProductListSkeleton.jsx
//
// سكيلتون تحميل موحّد لكل صفحات قائمة المنتجات (نفس ملاحظة
// ProductDetailSkeleton.jsx: كل مجلد route لازم يكون فيه ملف loading.jsx
// خاص بيه، لكن كل الملفات دي بتستورد التصميم من هنا بدل ما تكرره).
export default function ProductListSkeleton() {
  return (
    <main dir="rtl" className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 w-1/3 bg-gray-200 rounded mb-3" />
        <div className="h-4 w-1/2 bg-gray-200 rounded mb-8" />
        <div className="flex gap-3 mb-8 overflow-hidden">
          <div className="h-9 w-24 bg-gray-200 rounded-full" />
          <div className="h-9 w-24 bg-gray-200 rounded-full" />
          <div className="h-9 w-24 bg-gray-200 rounded-full" />
          <div className="h-9 w-24 bg-gray-200 rounded-full" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div className="h-32 sm:h-40 bg-gray-200 rounded-xl mb-4" />
              <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-1/2 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}