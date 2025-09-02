import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

export const dynamicParams = true;

// دالة إنشاء الصفحات الثابتة للمنتجات
export async function generateStaticParams() {
  try {
    const res = await fetch('https://restaurant-back-end.vercel.app/api/data?collection=component', {
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
async function RelatedProducts({ component }) {
  // جلب المنتجات ذات الصلة مع تحسينات الأداء
  async function fetchRelatedProducts(component) {
    try {
      const promises = [];
      let relatedProducts = [];

      // إذا كان المنتج يحتوي على relatedProducts IDs محددة
      if (Array.isArray(component?.details?.relatedProducts) && component.details.relatedProducts.length > 0) {
        const relatedPromises = component.details.relatedProducts.slice(0, 8).map(async (id) => {
          try {
            const res = await fetch(
              `https://restaurant-back-end.vercel.app/api/data?collection=component&id=${id}`,
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
          .filter(product => product && product.id !== component.id)
          .slice(0, 8);
      }
      
      // إذا لم نحصل على عدد كافٍ، نجلب منتجات من نفس الفئة
      if (relatedProducts.length < 4 && component.category) {
        try {
          const categoryRes = await fetch(
            `https://restaurant-back-end.vercel.app/api/data?collection=component&category=${encodeURIComponent(component.category)}&limit=12`,
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
              .filter(product => product.id !== component.id)
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

  const relatedProducts = await fetchRelatedProducts(component);

  if (relatedProducts.length === 0) return null;

  return (
    <section className="bg-white rounded-3xl shadow-lg p-8 mb-8 fade-in">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">منتجات مشابهة</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {relatedProducts.map((product, index) => (
          <Link 
            key={`related-${product.id}-${index}`} 
            href={`/component/${product.id}`} 
            className="bg-gray-50 rounded-2xl p-4 card-hover border border-gray-200"
            prefetch={false} // تحسين الأداء
          >
            <div className="relative mb-4">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-40 object-contain"
                loading="lazy"
                decoding="async"
              />
              {product.discount && (
                <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  -{product.discount}%
                </span>
              )}
            </div>
            
            <h3 className="font-bold text-lg mb-2 text-gray-900 line-clamp-2">
              {product.name}
            </h3>
            
            <div className="flex items-center justify-between mb-2">
              <div className="text-xl font-bold text-purple-600">
                {formatPrice(product.price)} {product.currency || 'ج.م'}
              </div>
              {product.rating && (
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400 text-sm">★</span>
                  <span className="text-sm text-gray-600">{product.rating}</span>
                </div>
              )}
            </div>
            
            {product.originalPrice && (
              <div className="text-sm text-gray-500 line-through">
                {formatPrice(product.originalPrice)} {product.currency || 'ج.م'}
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

// Server Component للمواصفات التقنية
function TechnicalSpecs({ specs, detailedSpecs }) {
  if (!detailedSpecs || Object.keys(detailedSpecs).length === 0) return null;

  const specLabels = {
    generalInfo: 'المعلومات العامة',
    performance: 'الأداء',
    architecture: 'المعمارية',
    memory: 'الذاكرة',
    graphics: 'الرسوميات',
    connectivity: 'الاتصال',
    features: 'الميزات',
    packageInfo: 'معلومات الحزمة',
    compatibleChipsets: 'الشرائح المتوافقة',
    memorySupport: 'دعم الذاكرة',
    expansionSlots: 'فتحات التوسعة',
    audioSystem: 'النظام الصوتي',
    powerDelivery: 'توصيل الطاقة',
    cooling: 'التبريد',
    bios: 'البايوس',
    rgbLighting: 'الإضاءة RGB',
    specialFeatures: 'ميزات خاصة',
    compatibleCpus: 'المعالجات المتوافقة',
    displayOutputs: 'مخارج العرض',
    powerSpecs: 'مواصفات الطاقة',
    physicalSpecs: 'المواصفات الفيزيائية',
    supportedTechnologies: 'التقنيات المدعومة',
    gamingPerformance: 'أداء الألعاب',
    compatibility: 'التوافق',
    design: 'التصميم',
    testing: 'الاختبار',
    technology: 'التقنية',
    gaming: 'الألعاب',
    software: 'البرامج',
    reliability: 'الموثوقية',
    coolingRequirements: 'متطلبات التبريد'
  };

  const validSpecs = Object.entries(detailedSpecs).filter(([key, value]) => 
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
              ) : typeof value === 'object' && value !== null ? (
                <div className="space-y-2">
                  {Object.entries(value).map(([subKey, subValue]) => (
                    <div key={subKey} className="flex justify-between items-start">
                      <span className="text-gray-600 text-sm">{subKey}:</span>
                      <span className="font-medium text-right">{String(subValue)}</span>
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

// Server Component للمراجعات
function ReviewsSection({ reviews }) {
  if (!reviews || !reviews.count || reviews.count === 0) return null;

  return (
    <section className="bg-white rounded-3xl shadow-lg p-8 mb-8 fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">آراء العملاء</h2>
        <div className="flex items-center justify-center gap-4">
          <div className="flex text-yellow-400 text-2xl">
            {[...Array(5)].map((_, i) => (
              <span key={`star-${i}`}>{i < Math.floor(reviews.avgRating) ? '★' : '☆'}</span>
            ))}
          </div>
          <span className="text-2xl font-bold text-gray-900">{reviews.avgRating}</span>
          <span className="text-gray-600">({reviews.count} مراجعة)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.items?.slice(0, 6).map((review, index) => (
          <div key={`review-${review.user}-${index}`} className="review-card rounded-xl p-6 card-hover">
            <div className="flex items-center justify-between mb-3">
              <div className="font-bold text-lg text-purple-700">{review.user}</div>
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <span key={`review-star-${i}`}>{i < review.rating ? '★' : '☆'}</span>
                ))}
              </div>
            </div>
            <p className="text-gray-700 mb-3 leading-relaxed">{review.comment}</p>
            <div className="text-sm text-gray-500">{formatDate(review.date)}</div>
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

// دالة مساعدة لتنسيق التاريخ
function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-EG', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch {
    return dateStr;
  }
}

export default async function ComponentDetailsPage({ params }) {
  const resolvedParams = await params;

  // جلب المنتج الرئيسي مع تحسينات
  async function fetchComponentById(id) {
    try {
      const res = await fetch(
        `https://restaurant-back-end.vercel.app/api/data?collection=component&id=${id}`,
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
  const component = await fetchComponentById(resolvedParams.id);
  if (!component) notFound();

  // استخراج المواصفات
  const specs = component.specs || {};
  const detailedSpecs = component.detailedSpecs || {};

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
          padding: 1rem;
        }
        .lightbox:target { 
          display: flex; 
        }
        
        .lightbox-content {
          position: relative;
          max-width: 95vw;
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
          top: -30px;
          right: 0;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          font-size: 0.875rem;
        }
        
        .lightbox-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        
        .lightbox-prev { left: 10px; }
        .lightbox-next { right: 10px; }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }

        .spec-card {
          background: white;
          border-radius: 1rem;
          padding: 1rem;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }

        .review-card {
          background: #fafafa;
          border: 1px solid #e5e7eb;
          border-right: 4px solid #8b5cf6;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Mobile Responsive Styles */
        @media (max-width: 640px) {
          .max-w-7xl {
            padding-left: 1rem;
            padding-right: 1rem;
          }

          .grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3.xl\\:grid-cols-4 {
            grid-template-columns: repeat(1, minmax(0, 1fr));
          }

          .grid-cols-2 {
            grid-template-columns: 1fr;
          }

          .grid-cols-1.md\\:grid-cols-2 {
            grid-template-columns: 1fr;
          }

          .grid-cols-1.xl\\:grid-cols-5 {
            grid-template-columns: 1fr;
          }

          .info-grid {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }

          .text-4xl {
            font-size: 1.75rem;
            line-height: 2rem;
          }

          .text-3xl {
            font-size: 1.5rem;
            line-height: 1.75rem;
          }

          .text-2xl {
            font-size: 1.25rem;
            line-height: 1.5rem;
          }

          .text-xl {
            font-size: 1rem;
            line-height: 1.25rem;
          }

          .text-lg {
            font-size: 0.875rem;
            line-height: 1.25rem;
          }

          .text-sm {
            font-size: 0.75rem;
          }

          .p-8 {
            padding: 1rem;
          }

          .p-6 {
            padding: 0.75rem;
          }

          .p-4 {
            padding: 0.5rem;
          }

          .mb-8 {
            margin-bottom: 1.5rem;
          }

          .mb-6 {
            margin-bottom: 1rem;
          }

          .mb-4 {
            margin-bottom: 0.75rem;
          }

          .gap-8 {
            gap: 1rem;
          }

          .gap-6 {
            gap: 0.75rem;
          }

          .gap-4 {
            gap: 0.5rem;
          }

          .gap-3 {
            gap: 0.5rem;
          }

          .h-80 {
            height: 16rem;
          }

          .h-16 {
            height: 3rem;
          }

          .h-40 {
            height: 8rem;
          }

          .rounded-3xl {
            border-radius: 1rem;
          }

          .rounded-2xl {
            border-radius: 0.75rem;
          }

          .rounded-xl {
            border-radius: 0.5rem;
          }

          .px-8 {
            padding-left: 1rem;
            padding-right: 1rem;
          }

          .px-4 {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }

          .py-4 {
            padding-top: 0.75rem;
            padding-bottom: 0.75rem;
          }

          .py-2 {
            padding-top: 0.25rem;
            padding-bottom: 0.25rem;
          }

          .text-yellow-400.text-2xl {
            font-size: 1rem;
          }

          .flex.gap-4.pt-4 {
            flex-direction: column;
          }

          .flex-1 {
            width: 100%;
          }

          .px-8.py-4.border-2 {
            padding: 0.5rem;
          }

          .space-y-6 {
            margin-top: 0.75rem;
          }

          .space-y-3 {
            margin-top: 0.5rem;
          }

          .space-y-2 {
            margin-top: 0.5rem;
          }
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
                    src={component.image || component.images?.[0] || ''}
                    alt={component.name}
                    className="w-full h-80 object-contain"
                    loading="eager"
                    decoding="sync"
                  />
                  {component.badge && (
                    <span className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      {component.badge}
                    </span>
                  )}
                  {component.discount && (
                    <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      خصم {component.discount}%
                    </span>
                  )}
                </div>

                {/* معرض مصغر */}
                {Array.isArray(component.images) && component.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-3">
                    {component.images.slice(0, 4).map((src, i) => (
                      <a key={`gallery-thumb-${i}`} href={`#img-${i}`} className="bg-gray-50 rounded-xl p-2 card-hover relative">
                        <img 
                          src={src} 
                          alt={`${component.name} ${i + 1}`} 
                          className="w-full h-16 object-cover rounded-lg"
                          loading="lazy"
                          decoding="async"
                        />
                      </a>
                    ))}
                  </div>
                )}

                {/* معلومات سريعة */}
                {/* <aside className="bg-gray-50 rounded-2xl p-6 mt-6">
                  <h3 className="font-bold text-lg mb-4 text-gray-900">معلومات المنتج</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">الحالة</span>
                      <span className={`font-semibold ${component.details?.isAvailable ? 'text-green-600' : 'text-red-500'}`}>
                        {component.details?.isAvailable ? `متوفر (${component.details.stock})` : 'غير متوفر'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">رقم المنتج</span>
                      <span className="font-medium text-gray-900">{component.id || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">الضمان</span>
                      <span className="font-medium text-gray-900">
                        {detailedSpecs?.warranty || '—'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">تاريخ الإصدار</span>
                      <span className="font-medium text-gray-900">{detailedSpecs?.generalInfo?.releaseDate || '—'}</span>
                    </div>
                  </div>
                </aside> */}
              </div>
            </div>

            {/* تفاصيل المنتج */}
            <div className="xl:col-span-3 space-y-6">
              
              {/* اسم المنتج والسعر */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                    {component.category}
                  </span>
                  {component.rating && (
                    <div className="flex items-center gap-1">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={`product-star-${i}`} className="text-sm">
                            {i < Math.floor(component.rating) ? '★' : '☆'}
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({component.rating})</span>
                    </div>
                  )}
                </div>

                <h1 className="text-4xl font-bold text-gray-900 mb-4">{component.name}</h1>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-4xl font-bold text-purple-600">
                    {formatPrice(component.price)} {component.currency || 'ج.م'}
                  </div>
                  {component.originalPrice && (
                    <div className="text-xl text-gray-500 line-through">
                      {formatPrice(component.originalPrice)} {component.currency || 'ج.م'}
                    </div>
                  )}
                </div>
              </div>

              {/* مواصفات سريعة */}
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

              {/* أزرار الإجراء */}
              <div className="flex gap-4 pt-4">
                <button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  اطلب الآن
                </button>
                <button className="px-8 py-4 border-2 border-purple-600 text-purple-600 rounded-2xl font-bold hover:bg-purple-50 transition-colors">
                  المفضلة
                </button>
              </div>

              {/* الوصف */}
              {detailedSpecs?.generalInfo && (
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">وصف المنتج</h3>
                  <div className="space-y-2">
                    {Object.entries(detailedSpecs.generalInfo).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600">{key}:</span>
                        <span className="text-gray-900 font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* الميزات */}
              {detailedSpecs?.features && Array.isArray(detailedSpecs.features) && (
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">الميزات الرئيسية</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {detailedSpecs.features.map((feature, index) => (
                      <div key={`feature-${index}`} className="flex items-center gap-3 p-3 bg-white rounded-xl">
                        <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-700 font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* المواصفات التقنية */}
        <TechnicalSpecs specs={specs} detailedSpecs={detailedSpecs} />

        {/* المراجعات */}
        <ReviewsSection reviews={component.details?.reviews} />

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
          <RelatedProducts component={component} />
        </Suspense>

        {/* محتويات الصندوق */}
        {Array.isArray(detailedSpecs?.inTheBox) && detailedSpecs.inTheBox.length > 0 && (
          <section className="bg-white rounded-3xl shadow-lg p-8 fade-in">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">محتويات الصندوق</h3>
            <div className="flex flex-wrap gap-3">
              {detailedSpecs.inTheBox.map((item, index) => (
                <span key={`box-item-${index}`} className="px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full text-sm font-medium border border-purple-200">
                  {item}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* معرض الصور */}
      {Array.isArray(component.images) && component.images.map((src, i) => (
        <div key={`lightbox-img-${i}`} id={`img-${i}`} className="lightbox">
          <a href="#" className="absolute inset-0" aria-label="إغلاق"></a>
          
          <div className="lightbox-content">
            {i > 0 && (
              <a href={`#img-${i-1}`} className="lightbox-nav lightbox-prev" aria-label="الصورة السابقة">❮</a>
            )}
            
            <img 
              src={src} 
              alt={`${component.name} ${i + 1}`} 
              className="max-h-80vh w-auto max-w-full rounded-lg shadow-lg"
              loading="lazy"
              decoding="async"
            />
            
            {i < component.images.length - 1 && (
              <a href={`#img-${i+1}`} className="lightbox-nav lightbox-next" aria-label="الصورة التالية">❯</a>
            )}
            
            <a href="#" className="lightbox-close" aria-label="إغلاق">✕</a>
          </div>
        </div>
      ))}
    </main>
  );
}