import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import AddToCartButton from '../../_addToTheCart'; // Adjust the path based on your project structure


export const dynamicParams = true;

// دالة إنشاء الصفحات الثابتة للمنتجات
export async function generateStaticParams() {
  try {
    const res = await fetch(
      'https://restaurant-back-end.vercel.app/api/data?collection=pos',
      {
        next: { revalidate: false },
      }
    );

    if (!res.ok) return [];

    const data = await res.json();
    let products = [];

    if (Array.isArray(data)) {
      products = data.filter((item) => item.id);
      data.forEach((item) => {
        if (item.products && Array.isArray(item.products)) {
          products = [...products, ...item.products.filter((p) => p.id)];
        }
      });
    } else if (data.products && Array.isArray(data.products)) {
      products = data.products.filter((product) => product.id);
    }

    return products.map((product) => ({
      id: product.id.toString(),
    }));
  } catch (error) {
    console.error('خطأ في generateStaticParams:', error);
    return [];
  }
}

// Server Component للمنتجات المشابهة
async function RelatedProducts({ product }) {
  // جلب مجموعة منتجات حسب فئة (fallback)
  async function fetchByCategory(category, limit = 12) {
    try {
      const res = await fetch(
        `https://restaurant-back-end.vercel.app/api/data?collection=pos&category=${encodeURIComponent(
          category
        )}&limit=${limit}`,
        { next: { revalidate: 86000 } }
      );
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  // جلب المنتجات ذات الصلة مع تحسينات الأداء
  async function fetchRelatedProducts(product) {
    try {
      // RELATED PRODUCTS - البحث في نفس الفئة
      const DESIRED_RELATED_COUNT = 8;
      let relatedProducts = [];

      if (product.category) {
        const candidates = await fetchByCategory(
          product.category,
          DESIRED_RELATED_COUNT * 2
        );
        const filtered = Array.isArray(candidates)
          ? candidates.filter((p) => p && p.id !== product.id)
          : [];

        relatedProducts = filtered.slice(0, DESIRED_RELATED_COUNT);
      }

      return relatedProducts;
    } catch (error) {
      console.error('خطأ في جلب المنتجات ذات الصلة:', error);
      return [];
    }
  }

  const relatedProducts = await fetchRelatedProducts(product);

  if (relatedProducts.length === 0) return null;
  return (
    <section className="bg-white rounded-3xl shadow-lg p-4 sm:p-8 mb-8 fade-in">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
        منتجات مشابهة
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
        {relatedProducts.map((product, index) => (
          <Link
            key={`related-${product.id}-${index}`}
            href={`/pos/${product.id}`}
            className="bg-gray-50 rounded-2xl p-3 sm:p-4 card-hover border border-gray-200"
            prefetch={false} // تحسين الأداء
          >
            <div className="relative mb-3 sm:mb-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-24 sm:h-40 object-contain"
                loading="lazy"
                decoding="async"
              />
              {product.badge && (
                <span className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  {product.badge}
                </span>
              )}
            </div>

            <h3 className="font-bold text-sm sm:text-lg mb-2 text-gray-900 line-clamp-2">
              {product.name}
            </h3>

            <div className="flex items-center justify-between mb-2">
              <div className="text-sm sm:text-xl font-bold text-purple-600">
                {formatPrice(product.price)} {product.currency || 'ج.م'}
              </div>
              {product.rating && (
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400 text-xs sm:text-sm">★</span>
                  <span className="text-xs sm:text-sm text-gray-600">
                    {product.rating}
                  </span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// Server Component للمواصفات التقنية
function TechnicalSpecs({ specs }) {
  if (!specs || Object.keys(specs).length === 0) return null;

  const specLabels = {
    processor: 'المعالج',
    cpu: 'المعالج',
    gpu: 'كارت الرسوميات',
    ram: 'الذاكرة العشوائية',
    storage: 'وحدة التخزين',
    display: 'الشاشة',
    resolution: 'دقة الشاشة',
    battery: 'البطارية',
    os: 'نظام التشغيل',
    weight: 'الوزن',
    dimensions_mm: 'الأبعاد',
    ports: 'المنافذ',
  };

  const validSpecs = Object.entries(specs).filter(
    ([key, value]) => value && value !== '—' && value !== 'غير محدد'
  );

  if (validSpecs.length === 0) return null;

  return (
    <section className="bg-white rounded-3xl shadow-lg p-4 sm:p-8 mb-8 fade-in">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
        المواصفات التقنية الكاملة
      </h2>

      <div className="info-grid">
        {validSpecs.map(([key, value]) => (
          <div key={key} className="spec-card card-hover">
            <h4 className="font-bold text-base sm:text-lg text-purple-700 mb-3 border-b border-gray-200 pb-2">
              {specLabels[key] ||
                key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase())}
            </h4>
            <div className="text-gray-700 text-sm sm:text-base">
              {Array.isArray(value) ? (
                <ul className="space-y-2">
                  {value.map((item, idx) => (
                    <li
                      key={`spec-item-${idx}`}
                      className="flex items-start gap-2"
                    >
                      <span className="w-1 h-1 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="leading-relaxed">
                        {typeof item === 'object'
                          ? JSON.stringify(item)
                          : String(item)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : typeof value === 'object' && value !== null ? (
                <div className="space-y-2">
                  {Object.entries(value).map(([subKey, subValue]) => (
                    <div key={subKey} className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="leading-relaxed">
                        <span className="font-medium">{subKey}:</span>{' '}
                        {String(subValue)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="leading-relaxed">{String(value)}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Server Component للبنشمارك
function BenchmarksSection({ benchmarks }) {
  if (!benchmarks || Object.keys(benchmarks).length === 0) return null;

  const validBenchmarks = Object.entries(benchmarks).filter(
    ([key, value]) => value && value !== '—' && value !== 'غير محدد'
  );

  if (validBenchmarks.length === 0) return null;

  return (
    <section className="bg-white rounded-3xl shadow-lg p-4 sm:p-8 mb-8 fade-in">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
        معايير الأداء
      </h2>

      <div className="info-grid">
        {validBenchmarks.map(([key, value]) => (
          <div
            key={key}
            className="spec-card card-hover bg-red-50 border-red-200"
          >
            <h4 className="font-bold text-base sm:text-lg text-red-700 mb-3 border-b border-red-200 pb-2">
              {key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, (str) => str.toUpperCase())}
            </h4>
            <div className="text-red-800 text-sm sm:text-base">
              {Array.isArray(value) ? (
                <ul className="space-y-2">
                  {value.map((item, idx) => (
                    <li
                      key={`benchmark-item-${idx}`}
                      className="flex items-start gap-2"
                    >
                      <span className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="leading-relaxed">
                        {typeof item === 'object'
                          ? JSON.stringify(item)
                          : String(item)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : typeof value === 'object' && value !== null ? (
                <div className="space-y-2">
                  {Object.entries(value).map(([subKey, subValue]) => (
                    <div key={subKey} className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="leading-relaxed">
                        <span className="font-medium">{subKey}:</span>{' '}
                        {String(subValue)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="leading-relaxed">{String(value)}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Server Component للميزات
function FeaturesSection({ features }) {
  if (!features || !Array.isArray(features) || features.length === 0)
    return null;

  return (
    <section className="bg-white rounded-3xl shadow-lg p-4 sm:p-8 mb-8 fade-in">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
        المزايا والخصائص
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {features.map((feature, index) => (
          <div
            key={`feature-${index}`}
            className="flex items-center gap-3 p-3 sm:p-4 bg-green-50 rounded-xl border border-green-200"
          >
            <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
            <span className="text-green-800 font-medium text-sm sm:text-base">
              {feature}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

// Server Component لمجالات الاستخدام
function UsageScenariosSection({ usageScenarios }) {
  if (
    !usageScenarios ||
    !Array.isArray(usageScenarios) ||
    usageScenarios.length === 0
  )
    return null;

  return (
    <section className="bg-white rounded-3xl shadow-lg p-4 sm:p-8 mb-8 fade-in">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
        مجالات الاستخدام
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {usageScenarios.map((scenario, index) => (
          <div
            key={`usage-${index}`}
            className="flex items-center gap-3 p-3 sm:p-4 bg-orange-50 rounded-xl border border-orange-200"
          >
            <div className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0"></div>
            <span className="text-orange-800 font-medium text-sm sm:text-base">
              {scenario}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

// Component معلومات المنتج للموبايل
function MobileProductInfo({ product, isAvailable }) {
  return (
    <aside className="bg-gray-50 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 lg:hidden">
      <h3 className="font-bold text-lg mb-4 text-gray-900">معلومات المنتج</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm sm:text-base">الحالة</span>
          <span
            className={`font-semibold text-sm sm:text-base ${
              isAvailable ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {isAvailable ? `متوفر (${product.stock})` : 'غير متوفر'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm sm:text-base">رقم المنتج</span>
          <span className="font-medium text-gray-900 text-sm sm:text-base">
            {product.sku || product.id || '—'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm sm:text-base">الفئة</span>
          <span className="font-medium text-gray-900 text-sm sm:text-base">
            {product.category || '—'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm sm:text-base">
            الشركة المصنعة
          </span>
          <span className="font-medium text-gray-900 text-sm sm:text-base">
            {product.manufacturer || '—'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm sm:text-base">الضمان</span>
          <span className="font-medium text-gray-900 text-sm sm:text-base">
            {product.warrantyMonths
              ? `${product.warrantyMonths} شهر`
              : product.warranty || '—'}
          </span>
        </div>
        {product.weightKg && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm sm:text-base">الوزن</span>
            <span className="font-medium text-gray-900 text-sm sm:text-base">
              {product.weightKg} كجم
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}

// دالة مساعدة منفصلة لتنسيق السعر
function formatPrice(num) {
  if (num == null) return '—';
  try {
    return new Intl.NumberFormat('ar-EG').format(num);
  } catch {
    return String(num);
  }
}

export default async function ProductDetailsPage({ params }) {
  const resolvedParams = await params;

  // جلب المنتج حسب id
  async function fetchProductById(id) {
    const res = await fetch(
      `https://restaurant-back-end.vercel.app/api/data?collection=pos&id=${id}`,
      { next: { revalidate: 86000 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data[0] : data || null;
  }

  // جلب المنتج الرئيسي
  const product = await fetchProductById(resolvedParams.id);
  if (!product) notFound();

  // استخراج البيانات الفعلية من API
  const specs = product.specs || {};
  const benchmarks = product.benchmarks || {};
  const features = product.features || [];
  const usageScenarios = product.usageScenarios || [];
  const isAvailable = product.isActive && product.stock > 0;

  // تحديد مصفوفة الصور
  const images =
    product.detailedImages && product.detailedImages.length > 0
      ? product.detailedImages
      : product.image
      ? [product.image]
      : [];

  return (
    <main
      className="min-h-screen bg-gradient-to-b from-slate-50 to-white"
      dir="rtl"
    >
      <style>{`
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15);
        }
        
        .fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .lightbox { 
          display: none; 
          align-items: center; 
          justify-content: center; 
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          z-index: 1000;
          padding: 1rem;
        }
        .lightbox:target { 
          display: flex; 
        }
        
        .lightbox-content {
          position: relative;
          max-width: 90vw;
          max-height: 90vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .lightbox img { 
          max-height: 80vh; 
          width: auto; 
          max-width: 100%; 
          border-radius: 0.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        
        .lightbox-close, .lightbox-nav {
          background: white;
          color: #333;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        
        .lightbox-close:hover, .lightbox-nav:hover {
          background: #f3f4f6;
        }
        
        .lightbox-close {
          position: absolute;
          top: -40px;
          right: -10px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        
        .lightbox-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.5rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        
        .lightbox-prev { left: 20px; }
        .lightbox-next { right: 20px; }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        @media (min-width: 640px) {
          .info-grid {
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
          }
        }

        .spec-card {
          background: white;
          border-radius: 1rem;
          padding: 1rem;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }

        @media (min-width: 640px) {
          .spec-card {
            padding: 1.5rem;
          }
        }

        .availability-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 12px;
        }

        @media (min-width: 640px) {
          .availability-badge {
            padding: 8px 12px;
            font-size: 14px;
          }
        }

        .available {
          background-color: #dcfce7;
          color: #166534;
          border: 1px solid #bbf7d0;
        }

        .unavailable {
          background-color: #fee2e2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .limited {
          background-color: #fef3c7;
          color: #d97706;
          border: 1px solid #fde68a;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media (max-width: 1023px) {
          .lightbox {
            padding: 0.5rem;
          }
          
          .lightbox-close {
            top: -30px;
            right: -5px;
            width: 25px;
            height: 25px;
          }
          
          .lightbox-nav {
            width: 35px;
            height: 35px;
            font-size: 1.2rem;
          }
          
          .lightbox-prev { left: 10px; }
          .lightbox-next { right: 10px; }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header Section */}
        <header className="bg-white rounded-3xl shadow-lg overflow-hidden mb-6 sm:mb-8 fade-in">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 sm:gap-8 p-4 sm:p-8">
            {/* صور المنتج */}
            <div className="xl:col-span-2">
              <div className="xl:sticky xl:top-8">
                {/* الصورة الرئيسية */}
                <div className="bg-gray-50 rounded-2xl p-3 sm:p-6 mb-4 sm:mb-6 relative">
                  <img
                    src={images[0] || product.image || '/placeholder.jpg'}
                    alt={product.name}
                    className="w-full h-60 sm:h-80 object-contain"
                    loading="eager"
                    decoding="sync"
                  />
                  {product.badge && (
                    <span className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                      {product.badge}
                    </span>
                  )}
                </div>

                {/* معرض مصغر */}
                {Array.isArray(images) && images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
                    {images.slice(0, 4).map((src, i) => (
                      <a
                        key={`gallery-thumb-${i}`}
                        href={`#img-${i}`}
                        className="bg-gray-50 rounded-xl p-1 sm:p-2 card-hover relative"
                      >
                        <img
                          src={src}
                          alt={`${product.name} ${i + 1}`}
                          className="w-full h-12 sm:h-16 object-cover rounded-lg"
                          loading="lazy"
                          decoding="async"
                        />
                      </a>
                    ))}
                  </div>
                )}

                {/* معلومات سريعة - للشاشات الكبيرة فقط */}
                <aside className="bg-gray-50 rounded-2xl p-4 sm:p-6 hidden lg:block">
                  <h3 className="font-bold text-lg mb-4 text-gray-900">
                    معلومات المنتج
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">الحالة</span>
                      <span
                        className={`font-semibold ${
                          isAvailable ? 'text-green-600' : 'text-red-500'
                        }`}
                      >
                        {isAvailable ? `متوفر (${product.stock})` : 'غير متوفر'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">رقم المنتج</span>
                      <span className="font-medium text-gray-900">
                        {product.sku || product.id || '—'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">الفئة</span>
                      <span className="font-medium text-gray-900">
                        {product.category || '—'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">الشركة المصنعة</span>
                      <span className="font-medium text-gray-900">
                        {product.manufacturer || '—'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">الضمان</span>
                      <span className="font-medium text-gray-900">
                        {product.warrantyMonths
                          ? `${product.warrantyMonths} شهر`
                          : product.warranty || '—'}
                      </span>
                    </div>
                    {product.weightKg && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">الوزن</span>
                        <span className="font-medium text-gray-900">
                          {product.weightKg} كجم
                        </span>
                      </div>
                    )}
                  </div>
                </aside>
              </div>
            </div>

            {/* تفاصيل المنتج */}
            <div className="xl:col-span-3 space-y-4 sm:space-y-6">
              {/* اسم المنتج والسعر */}
              <div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                  <span className="bg-purple-100 text-purple-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                    {product.category}
                  </span>
                  {product.rating && (
                    <div className="flex items-center gap-1">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={`product-star-${i}`}
                            className="text-xs sm:text-sm"
                          >
                            {i < Math.floor(product.rating) ? '★' : '☆'}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs sm:text-sm text-gray-600">
                        ({product.rating})
                      </span>
                    </div>
                  )}
                </div>

                <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>

                {/* حالة التوفر */}
                <div className="mb-4">
                  <span
                    className={`availability-badge ${
                      isAvailable
                        ? 'available'
                        : product.stock === 0
                        ? 'unavailable'
                        : 'limited'
                    }`}
                  >
                    {isAvailable ? (
                      <>
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        متوفر ({product.stock} قطعة)
                      </>
                    ) : product.stock === 0 ? (
                      <>
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                        غير متوفر
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        كمية محدودة ({product.stock} قطعة)
                      </>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-4 sm:mb-6">
                  <div className="text-2xl sm:text-4xl font-bold text-purple-600">
                    {formatPrice(product.price)} {product.currency || 'ج.م'}
                  </div>
                </div>
              </div>

              {/* مواصفات سريعة */}
              {specs && Object.keys(specs).length > 0 && (
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  {Object.entries(specs)
                    .slice(0, 4)
                    .map(([key, value], i) => (
                      <div
                        key={`quick-spec-${i}`}
                        className={`p-3 sm:p-4 rounded-xl ${
                          i === 0
                            ? 'bg-blue-50 text-blue-700'
                            : i === 1
                            ? 'bg-green-50 text-green-700'
                            : i === 2
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-orange-50 text-orange-700'
                        }`}
                      >
                        <div className="text-xs sm:text-sm font-semibold mb-1">
                          {key
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, (str) => str.toUpperCase())}
                        </div>
                        <div
                          className="text-xs font-medium truncate"
                          title={
                            Array.isArray(value)
                              ? value.join(', ')
                              : String(value)
                          }
                        >
                          {Array.isArray(value)
                            ? value.join(', ')
                            : String(value) || '—'}
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* أزرار الإجراء */}
              <div>
                <AddToCartButton product={product}>اطلب الآن</AddToCartButton>
              </div>

              {/* الوصف */}
              {product.description && (
                <div className="bg-gray-50 rounded-2xl p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                    وصف المنتج
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                    {product.description}
                  </p>
                </div>
              )}

              {/* الميزات */}
              {features && features.length > 0 && (
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                    الميزات الرئيسية
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                    {features.map((feature, index) => (
                      <div
                        key={`feature-${index}`}
                        className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-xl"
                      >
                        <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-700 font-medium text-sm sm:text-base">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* مجالات الاستخدام */}
              {usageScenarios && usageScenarios.length > 0 && (
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                    مجالات الاستخدام
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                    {usageScenarios.map((scenario, index) => (
                      <div
                        key={`usage-${index}`}
                        className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-xl"
                      >
                        <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-700 font-medium text-sm sm:text-base">
                          {scenario}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* معلومات المنتج للموبايل - تظهر بعد مجالات الاستخدام */}
        <MobileProductInfo product={product} isAvailable={isAvailable} />

        {/* المواصفات التقنية */}
        <TechnicalSpecs specs={specs} />

        {/* معايير الأداء */}
        <BenchmarksSection benchmarks={benchmarks} />

        {/* الميزات */}
        <FeaturesSection features={features} />

        {/* مجالات الاستخدام */}
        <UsageScenariosSection usageScenarios={usageScenarios} />

        {/* منتجات ذات صلة مع Suspense لتحسين الأداء */}
        <Suspense
          fallback={
            <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-8 mb-6 sm:mb-8 fade-in">
              <div className="text-center">
                <div className="animate-pulse">
                  <div className="h-6 sm:h-8 bg-gray-200 rounded-lg w-1/3 mx-auto mb-6 sm:mb-8"></div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={`skeleton-${i}`}
                        className="bg-gray-50 rounded-2xl p-3 sm:p-4 border border-gray-200"
                      >
                        <div className="bg-gray-200 h-24 sm:h-40 rounded-xl mb-3 sm:mb-4"></div>
                        <div className="h-3 sm:h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          }
        >
          <RelatedProducts product={product} />
        </Suspense>

        {/* تفاصيل إضافية */}
        <section className="bg-white rounded-3xl shadow-lg p-4 sm:p-8 mb-6 sm:mb-8 fade-in">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
            تفاصيل إضافية
          </h2>

          <div className="info-grid">
            {product.manufacturer && (
              <div className="spec-card card-hover">
                <h4 className="font-bold text-base sm:text-lg text-gray-700 mb-3 border-b border-gray-200 pb-2">
                  الشركة المصنعة
                </h4>
                <div className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  {product.manufacturer}
                </div>
              </div>
            )}

            {product.sku && (
              <div className="spec-card card-hover">
                <h4 className="font-bold text-base sm:text-lg text-gray-700 mb-3 border-b border-gray-200 pb-2">
                  رقم المنتج (SKU)
                </h4>
                <div className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  {product.sku}
                </div>
              </div>
            )}

            {product.modelNumber && (
              <div className="spec-card card-hover">
                <h4 className="font-bold text-base sm:text-lg text-gray-700 mb-3 border-b border-gray-200 pb-2">
                  رقم الموديل
                </h4>
                <div className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  {product.modelNumber}
                </div>
              </div>
            )}

            {product.ean && (
              <div className="spec-card card-hover">
                <h4 className="font-bold text-base sm:text-lg text-gray-700 mb-3 border-b border-gray-200 pb-2">
                  باركود EAN
                </h4>
                <div className="text-gray-700 leading-relaxed text-xs sm:text-sm">
                  {product.ean}
                </div>
              </div>
            )}

            {product.warrantyMonths && (
              <div className="spec-card card-hover">
                <h4 className="font-bold text-base sm:text-lg text-gray-700 mb-3 border-b border-gray-200 pb-2">
                  فترة الضمان
                </h4>
                <div className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  {product.warrantyMonths} شهر
                </div>
              </div>
            )}

            {product.releaseDate && (
              <div className="spec-card card-hover">
                <h4 className="font-bold text-base sm:text-lg text-gray-700 mb-3 border-b border-gray-200 pb-2">
                  تاريخ الإصدار
                </h4>
                <div className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  {new Date(product.releaseDate).toLocaleDateString('ar-EG')}
                </div>
              </div>
            )}

            {product.weightKg && (
              <div className="spec-card card-hover">
                <h4 className="font-bold text-base sm:text-lg text-gray-700 mb-3 border-b border-gray-200 pb-2">
                  الوزن
                </h4>
                <div className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  {product.weightKg} كجم
                </div>
              </div>
            )}

            {product.performanceScore && (
              <div className="spec-card card-hover">
                <h4 className="font-bold text-base sm:text-lg text-gray-700 mb-3 border-b border-gray-200 pb-2">
                  نقاط الأداء
                </h4>
                <div className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  {product.performanceScore}/100
                </div>
              </div>
            )}

            {product.stock !== undefined && (
              <div className="spec-card card-hover">
                <h4 className="font-bold text-base sm:text-lg text-gray-700 mb-3 border-b border-gray-200 pb-2">
                  الكمية المتاحة
                </h4>
                <div
                  className={`leading-relaxed font-semibold text-sm sm:text-base ${
                    product.stock > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {product.stock > 0 ? `${product.stock} قطعة` : 'غير متوفر'}
                </div>
              </div>
            )}

            {product.supportedLanguages &&
              product.supportedLanguages.length > 0 && (
                <div className="spec-card card-hover">
                  <h4 className="font-bold text-base sm:text-lg text-gray-700 mb-3 border-b border-gray-200 pb-2">
                    اللغات المدعومة
                  </h4>
                  <div className="text-gray-700 leading-relaxed text-sm sm:text-base">
                    {product.supportedLanguages.join(', ')}
                  </div>
                </div>
              )}

            {product.certifications && product.certifications.length > 0 && (
              <div className="spec-card card-hover">
                <h4 className="font-bold text-base sm:text-lg text-gray-700 mb-3 border-b border-gray-200 pb-2">
                  الشهادات والتصاريح
                </h4>
                <div className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  {product.certifications.join(', ')}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* معرض الصور */}
      {Array.isArray(images) &&
        images.map((src, i) => (
          <div key={`lightbox-img-${i}`} id={`img-${i}`} className="lightbox">
            <a href="#" className="absolute inset-0" aria-label="إغلاق"></a>

            <div className="lightbox-content">
              {i > 0 && (
                <a
                  href={`#img-${i - 1}`}
                  className="lightbox-nav lightbox-prev"
                  aria-label="الصورة السابقة"
                >
                  ❮
                </a>
              )}

              <img
                src={src}
                alt={`${product.name} ${i + 1}`}
                className="max-h-80vh w-auto max-w-full rounded-lg shadow-lg"
                loading="lazy"
                decoding="async"
              />

              {i < images.length - 1 && (
                <a
                  href={`#img-${i + 1}`}
                  className="lightbox-nav lightbox-next"
                  aria-label="الصورة التالية"
                >
                  ❯
                </a>
              )}

              <a href="#" className="lightbox-close" aria-label="إغلاق">
                ✕
              </a>
            </div>
          </div>
        ))}
    </main>
  );
}
