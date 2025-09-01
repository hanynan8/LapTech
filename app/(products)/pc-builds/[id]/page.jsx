import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

export const dynamicParams = true;


  // دالة إنشاء الصفحات الثابتة للمنتجات
export async function generateStaticParams() {
  try {
    const res = await fetch('https://restaurant-back-end.vercel.app/api/data?collection=pc-build', {
      next: { revalidate: false }
    });
    
    if (!res.ok) return [];
    
    const data = await res.json();
    let products = [];
    
    if (Array.isArray(data)) {
      products = data.filter(item => item.id);
      data.forEach(item => {
        if (item.products && Array.isArray(item.products)) {
          products = [...products, ...item.products.filter(p => p.id)];
        }
      });
    } else if (data.products && Array.isArray(data.products)) {
      products = data.products.filter(product => product.id);
    }
    
    return products.map((product) => ({
      id: product.id.toString()
    }));
    
  } catch (error) {
    console.error('خطأ في generateStaticParams:', error);
    return [];
  }
}



// Server Component للمنتجات المشابهة
async function RelatedProducts({ product }) {
  // جلب المنتجات ذات الصلة مع تحسينات الأداء
  async function fetchRelatedProducts(product) {
    try {
      const promises = [];
      let relatedProducts = [];

      // إذا كان المنتج يحتوي على relatedProducts IDs محددة
      if (Array.isArray(product?.details?.relatedProducts) && product.details.relatedProducts.length > 0) {
        const relatedPromises = product.details.relatedProducts.slice(0, 8).map(async (id) => {
          try {
            const res = await fetch(
              `https://restaurant-back-end.vercel.app/api/data?collection=pc-build&id=${id}`,
              { 
                next: { revalidate: 3600 }, // تحسين مدة التخزين المؤقت
                signal: AbortSignal.timeout(5000) // إضافة timeout
              }
            );
            if (!res.ok) return null;
            const data = await res.json();
            return Array.isArray(data) && data.length > 0 ? data[0] : data;
          } catch {
            return null;
          }
        });
        
        const relatedResults = await Promise.allSettled(relatedPromises);
        relatedProducts = relatedResults
          .filter(result => result.status === 'fulfilled' && result.value)
          .map(result => result.value)
          .filter(item => item && item.id !== product.id)
          .slice(0, 8);
      }
      
      // إذا لم نحصل على عدد كافٍ، نجلب منتجات من نفس الفئة
      if (relatedProducts.length < 4 && product.category) {
        try {
          const categoryRes = await fetch(
            `https://restaurant-back-end.vercel.app/api/data?collection=pc-build&category=${encodeURIComponent(product.category)}&limit=12`,
            { 
              next: { revalidate: 1800 }, // تقليل مدة التخزين المؤقت للفئات
              signal: AbortSignal.timeout(5000)
            }
          );
          
          if (categoryRes.ok) {
            const categoryData = await categoryRes.json();
            let categoryProducts = [];
            
            if (Array.isArray(categoryData) && categoryData.length > 0 && categoryData[0].products) {
              categoryProducts = categoryData[0].products;
            } else if (Array.isArray(categoryData)) {
              categoryProducts = categoryData;
            }
            
            const additionalProducts = categoryProducts
              .filter(item => item.id !== product.id)
              .slice(0, 8 - relatedProducts.length);
            
            relatedProducts = [...relatedProducts, ...additionalProducts];
          }
        } catch (error) {
          console.error('خطأ في جلب منتجات الفئة:', error);
        }
      }
      
      return relatedProducts.slice(0, 8);
    } catch (error) {
      console.error('خطأ في جلب المنتجات ذات الصلة:', error);
      return [];
    }
  }

  const relatedProducts = await fetchRelatedProducts(product);

  if (relatedProducts.length === 0) return null;

  return (
    <section className="bg-white rounded-3xl shadow-lg p-8 mb-8 fade-in">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">منتجات مشابهة</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {relatedProducts.map((item, index) => (
          <Link 
            key={`related-${item.id}-${index}`} 
            href={`/pc-build/${item.id}`} 
            className="bg-gray-50 rounded-2xl p-4 card-hover border border-gray-200"
            prefetch={false} // تحسين الأداء
          >
            <div className="relative mb-4">
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-40 object-contain"
                loading="lazy"
                decoding="async"
              />
              {item.discount && (
                <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  -{item.discount}%
                </span>
              )}
            </div>
            
            <h3 className="font-bold text-lg mb-2 text-gray-900 line-clamp-2">
              {item.name}
            </h3>
            
            <div className="flex items-center justify-between mb-2">
              <div className="text-xl font-bold text-purple-600">
                {formatPrice(item.price)} {item.currency || 'ج.م'}
              </div>
              {item.rating && (
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400 text-sm">★</span>
                  <span className="text-sm text-gray-600">{item.rating}</span>
                </div>
              )}
            </div>
            
            {item.originalPrice && (
              <div className="text-sm text-gray-500 line-through">
                {formatPrice(item.originalPrice)} {item.currency || 'ج.م'}
              </div>
            )}
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
    cpu: 'المعالج',
    gpu: 'كارت الرسوميات', 
    ram: 'الذاكرة العشوائية',
    storage: 'وحدة التخزين',
    motherboard: 'اللوحة الأم',
    psu: 'مزود الطاقة',
    case: 'الكيس',
    cooler: 'نظام التبريد',
    os: 'نظام التشغيل'
  };

  const validSpecs = Object.entries(specs).filter(([key, value]) => 
    value && value !== '—' && value !== 'غير محدد'
  );

  if (validSpecs.length === 0) return null;

  return (
    <section className="bg-white rounded-3xl shadow-lg p-8 mb-8 fade-in">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">المواصفات التقنية الكاملة</h2>
      
      <div className="info-grid">
        {validSpecs.map(([key, value]) => (
          <div key={key} className="spec-card card-hover">
            <h4 className="font-bold text-lg text-purple-700 mb-3 border-b border-gray-200 pb-2">
              {specLabels[key] || key}
            </h4>
            <div className="text-gray-700">
              {Array.isArray(value) ? (
                <ul className="space-y-2">
                  {value.map((item, idx) => (
                    <li key={`spec-item-${idx}`} className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
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

// Server Component للكمبوننتس
function ComponentsSection({ components }) {
  if (!components || !Array.isArray(components) || components.length === 0) return null;

  return (
    <section className="bg-white rounded-3xl shadow-lg p-8 mb-8 fade-in">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">مكونات الجهاز</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {components.map((component, index) => (
          <div key={`component-${index}`} className="spec-card card-hover">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="font-bold text-purple-700">{component}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Server Component للبنش مارك
function BenchmarksSection({ benchmarks }) {
  if (!benchmarks || Object.keys(benchmarks).length === 0) return null;

  return (
    <section className="bg-white rounded-3xl shadow-lg p-8 mb-8 fade-in">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">معايير الأداء</h2>
      
      <div className="info-grid">
        {Object.entries(benchmarks).map(([key, value]) => (
          <div key={key} className="spec-card card-hover">
            <h4 className="font-bold text-lg text-purple-700 mb-3 border-b border-gray-200 pb-2">
              {key}
            </h4>
            <div className="text-gray-700">
              {Array.isArray(value) ? (
                <ul className="space-y-2">
                  {value.map((item, idx) => (
                    <li key={`benchmark-item-${idx}`} className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="leading-relaxed">
                        {typeof item === 'object' ? JSON.stringify(item) : String(item)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : typeof value === 'object' && value !== null ? (
                <div className="space-y-2">
                  {Object.entries(value).map(([subKey, subValue]) => (
                    <div key={subKey} className="bg-gray-50 px-3 py-1.5 rounded-lg">
                      <span className="font-medium">{subKey}:</span> {String(subValue)}
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

// دالة مساعدة منفصلة لتنسيق السعر (خارج الكومبوننت)
function formatPrice(num) {
  if (num == null) return '—';
  try {
    return new Intl.NumberFormat('ar-EG').format(num);
  } catch {
    return String(num);
  }
}

export default async function ProductDetailsPage({ params }) {
  // انتظار params قبل الاستخدام
  const resolvedParams = await params;
  
  // جلب المنتج الرئيسي مع تحسينات
  async function fetchProductById(id) {
    try {
      const res = await fetch(
        `https://restaurant-back-end.vercel.app/api/data?collection=pc-build&id=${id}`,
        { 
          next: { revalidate: 900 }, // تحسين مدة التخزين المؤقت
          signal: AbortSignal.timeout(8000) // timeout أطول للبيانات المهمة
        }
      );
      
      if (!res.ok) return null;
      
      const data = await res.json();
      return Array.isArray(data) && data.length > 0 ? data[0] : data || null;
    } catch (error) {
      console.error('خطأ في جلب بيانات المنتج:', error);
      return null;
    }
  }

  // جلب المنتج الرئيسي
  const product = await fetchProductById(resolvedParams.id);
  if (!product) notFound();

  // استخراج البيانات
  const specs = product.specs || {};
  const details = product.details || {};
  const components = product.components || [];
  const benchmarks = product.benchmarks || {};
  const isAvailable = details.stockStatus === 'In Stock' || details.stockStatus === 'Limited';

  // تحديد مصفوفة الصور
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : product.image
    ? [product.image]
    : [];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white" dir="rtl">
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
          padding: 2rem;
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
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .spec-card {
          background: white;
          border-radius: 1rem;
          padding: 1.5rem;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .availability-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 14px;
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
      `}</style>

      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header Section */}
        <header className="bg-white rounded-3xl shadow-lg overflow-hidden mb-8 fade-in">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 p-8">
            
            {/* صور المنتج */}
            <div className="xl:col-span-2">
              <div className="sticky top-8">
                {/* الصورة الرئيسية */}
                <div className="bg-gray-50 rounded-2xl p-6 mb-6 relative">
                  <img
                    src={images[0] || product.image || ''}
                    alt={product.name}
                    className="w-full h-80 object-contain"
                    loading="eager"
                    decoding="sync"
                  />
                  {product.badge && (
                    <span className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      {product.badge}
                    </span>
                  )}
                  {product.discount && (
                    <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      خصم {product.discount}%
                    </span>
                  )}
                </div>

                {/* معرض مصغر */}
                {Array.isArray(images) && images.length > 1 && (
                  <div className="grid grid-cols-4 gap-3">
                    {images.slice(0, 4).map((src, i) => (
                      <a key={`gallery-thumb-${i}`} href={`#img-${i}`} className="bg-gray-50 rounded-xl p-2 card-hover relative">
                        <img 
                          src={src} 
                          alt={`${product.name} ${i + 1}`} 
                          className="w-full h-16 object-cover rounded-lg"
                          loading="lazy"
                          decoding="async"
                        />
                      </a>
                    ))}
                  </div>
                )}

                {/* معلومات سريعة */}
                <aside className="bg-gray-50 rounded-2xl p-6 mt-6">
                  <h3 className="font-bold text-lg mb-4 text-gray-900">معلومات المنتج</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">الحالة</span>
                      <span
                        className={`availability-badge ${
                          details.stockStatus === 'In Stock'
                            ? 'available'
                            : details.stockStatus === 'Limited'
                            ? 'limited'
                            : 'unavailable'
                        }`}
                      >
                        {details.stockStatus === 'In Stock' ? (
                          <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            متوفر
                          </>
                        ) : details.stockStatus === 'Limited' ? (
                          <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            كمية محدودة
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            غير متوفر
                          </>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">رقم المنتج</span>
                      <span className="font-medium text-gray-900">{details.sku || product.id || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">الضمان</span>
                      <span className="font-medium text-gray-900">
                        {details.warrantyYears ? `${details.warrantyYears} سنوات` : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">الشركة المصنعة</span>
                      <span className="font-medium text-gray-900">{details.manufacturer || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">الوزن</span>
                      <span className="font-medium text-gray-900">
                        {details.weight_kg ? `${details.weight_kg} كجم` : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">استهلاك الطاقة</span>
                      <span className="font-medium text-gray-900">
                        {details.estimatedPowerW ? `${details.estimatedPowerW} واط` : '—'}
                      </span>
                    </div>
                  </div>
                </aside>
              </div>
            </div>

            {/* تفاصيل المنتج */}
            <div className="xl:col-span-3 space-y-6">
              
              {/* اسم المنتج والسعر */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                    {product.category}
                  </span>
                  {product.rating && (
                    <div className="flex items-center gap-1">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={`product-star-${i}`} className="text-sm">
                            {i < Math.floor(product.rating) ? '★' : '☆'}
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({product.rating})</span>
                      {details.reviewCount && (
                        <span className="text-sm text-gray-500">- {details.reviewCount} تقييم</span>
                      )}
                    </div>
                  )}
                  {product.performanceScore && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      أداء: {product.performanceScore}/100
                    </span>
                  )}
                </div>

                <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-4xl font-bold text-purple-600">
                    {formatPrice(product.price)} {product.currency || 'ج.م'}
                  </div>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="text-xl text-gray-500 line-through">
                      {formatPrice(product.originalPrice)} {product.currency || 'ج.م'}
                    </div>
                  )}
                </div>
              </div>

              {/* مواصفات سريعة */}
              {specs && Object.keys(specs).length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(specs).slice(0, 4).map(([key, value], i) => (
                    <div key={`quick-spec-${i}`} className={`p-4 rounded-xl ${
                      i % 4 === 0 ? 'bg-blue-50 text-blue-700' :
                      i % 4 === 1 ? 'bg-green-50 text-green-700' :
                      i % 4 === 2 ? 'bg-purple-50 text-purple-700' :
                      'bg-orange-50 text-orange-700'
                    }`}>
                      <div className="text-sm font-semibold mb-1">{key}</div>
                      <div className="text-xs font-medium truncate" title={value}>
                        {value || '—'}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* أزرار الإجراء */}
              <div className="flex gap-4 pt-4">
                <button 
                  className={`flex-1 py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 ${
                    isAvailable
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!isAvailable}
                >
                  {isAvailable ? 'اطلب الآن' : 'غير متوفر'}
                </button>
                <button className="px-8 py-4 border-2 border-purple-600 text-purple-600 rounded-2xl font-bold hover:bg-purple-50 transition-colors">
                  المفضلة
                </button>
              </div>

              {/* معلومات إضافية */}
              {(details.psuRecommendation || details.coolingType || details.motherboardFormFactor) && (
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">معلومات إضافية</h3>
                  <div className="space-y-3">
                    {details.psuRecommendation && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">مزود الطاقة الموصى به</span>
                        <span className="font-medium">{details.psuRecommendation}</span>
                      </div>
                    )}
                    {details.coolingType && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">نوع التبريد</span>
                        <span className="font-medium">{details.coolingType}</span>
                      </div>
                    )}
                    {details.motherboardFormFactor && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">حجم اللوحة الأم</span>
                        <span className="font-medium">{details.motherboardFormFactor}</span>
                      </div>
                    )}
                    {details.rgb !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">الإضاءة RGB</span>
                        <span className="font-medium">{details.rgb ? 'متوفر' : 'غير متوفر'}</span>
                      </div>
                    )}
                    {details.supportsMultiGPU !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">دعم كروت رسوميات متعددة</span>
                        <span className="font-medium">{details.supportsMultiGPU ? 'مدعوم' : 'غير مدعوم'}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* الأبعاد المادية */}
              {details.dimensions_mm && (
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">الأبعاد المادية</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {details.dimensions_mm.height && (
                      <div className="bg-white rounded-xl p-3">
                        <div className="text-sm text-gray-600">الارتفاع</div>
                        <div className="font-bold text-purple-700">{details.dimensions_mm.height} مم</div>
                      </div>
                    )}
                    {details.dimensions_mm.width && (
                      <div className="bg-white rounded-xl p-3">
                        <div className="text-sm text-gray-600">العرض</div>
                        <div className="font-bold text-purple-700">{details.dimensions_mm.width} مم</div>
                      </div>
                    )}
                    {details.dimensions_mm.depth && (
                      <div className="bg-white rounded-xl p-3">
                        <div className="text-sm text-gray-600">العمق</div>
                        <div className="font-bold text-purple-700">{details.dimensions_mm.depth} مم</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* المنافذ والاتصالات */}
              {details.ports && details.ports.length > 0 && (
                <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">المنافذ والاتصالات</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {details.ports.map((port, index) => (
                      <div key={`port-${index}`} className="flex items-center gap-3 p-3 bg-white rounded-xl">
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-700 font-medium">{port}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* الملحقات المرفقة */}
              {details.includedAccessories && details.includedAccessories.length > 0 && (
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">الملحقات المرفقة</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {details.includedAccessories.map((accessory, index) => (
                      <div key={`accessory-${index}`} className="flex items-center gap-3 p-3 bg-white rounded-xl">
                        <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-700 font-medium">{accessory}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* المواصفات التقنية */}
        <TechnicalSpecs specs={specs} />

        {/* مكونات الجهاز */}
        <ComponentsSection components={components} />

        {/* معايير الأداء */}
        <BenchmarksSection benchmarks={benchmarks} />

        {/* تفاصيل إضافية */}
        {details && Object.keys(details).length > 0 && (
          <section className="bg-white rounded-3xl shadow-lg p-8 mb-8 fade-in">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">التفاصيل الكاملة</h2>
            
            <div className="info-grid">
              {details.manufacturer && (
                <div className="spec-card card-hover">
                  <h4 className="font-bold text-lg text-purple-700 mb-3 border-b border-gray-200 pb-2">
                    الشركة المصنعة
                  </h4>
                  <div className="text-gray-700 leading-relaxed">{details.manufacturer}</div>
                </div>
              )}

              {details.warrantyYears && (
                <div className="spec-card card-hover">
                  <h4 className="font-bold text-lg text-purple-700 mb-3 border-b border-gray-200 pb-2">
                    فترة الضمان
                  </h4>
                  <div className="text-gray-700 leading-relaxed">{details.warrantyYears} سنوات</div>
                </div>
              )}

              {details.releaseDate && (
                <div className="spec-card card-hover">
                  <h4 className="font-bold text-lg text-purple-700 mb-3 border-b border-gray-200 pb-2">
                    تاريخ الإصدار
                  </h4>
                  <div className="text-gray-700 leading-relaxed">
                    {new Date(details.releaseDate).toLocaleDateString('ar-EG')}
                  </div>
                </div>
              )}

              {details.upgradeNotes && (
                <div className="spec-card card-hover">
                  <h4 className="font-bold text-lg text-purple-700 mb-3 border-b border-gray-200 pb-2">
                    ملاحظات الترقية
                  </h4>
                  <div className="text-gray-700 leading-relaxed">{details.upgradeNotes}</div>
                </div>
              )}

              {details.supportUrl && (
                <div className="spec-card card-hover">
                  <h4 className="font-bold text-lg text-purple-700 mb-3 border-b border-gray-200 pb-2">
                    الدعم الفني
                  </h4>
                  <div className="text-gray-700 leading-relaxed">
                    <a 
                      href={details.supportUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 underline"
                    >
                      رابط الدعم الفني الرسمي
                    </a>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* منتجات ذات صلة مع Suspense لتحسين الأداء */}
        <Suspense fallback={
          <div className="bg-white rounded-3xl shadow-lg p-8 mb-8 fade-in">
            <div className="text-center">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded-lg w-1/3 mx-auto mb-8"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={`skeleton-${i}`} className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                      <div className="bg-gray-200 h-40 rounded-xl mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        }>
          <RelatedProducts product={product} />
        </Suspense>
      </div>

      {/* معرض الصور */}
      {Array.isArray(images) && images.map((src, i) => (
        <div key={`lightbox-img-${i}`} id={`img-${i}`} className="lightbox">
          <a href="#" className="absolute inset-0" aria-label="إغلاق"></a>
          
          <div className="lightbox-content">
            {i > 0 && (
              <a href={`#img-${i-1}`} className="lightbox-nav lightbox-prev" aria-label="الصورة السابقة">❮</a>
            )}
            
            <img 
              src={src} 
              alt={`${product.name} ${i + 1}`} 
              className="max-h-80vh w-auto max-w-full rounded-lg shadow-lg"
              loading="lazy"
              decoding="async"
            />
            
            {i < images.length - 1 && (
              <a href={`#img-${i+1}`} className="lightbox-nav lightbox-next" aria-label="الصورة التالية">❯</a>
            )}
            
            <a href="#" className="lightbox-close" aria-label="إغلاق">✕</a>
          </div>
        </div>
      ))}
    </main>
  );
}