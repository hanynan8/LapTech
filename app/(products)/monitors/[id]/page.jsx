import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import WhatsAppButton from '../../_whatsdrect'; // Adjust the path based on your project structure


export const dynamicParams = true;




  // دالة إنشاء الصفحات الثابتة للمنتجات
export async function generateStaticParams() {
  try {
    const res = await fetch('https://restaurant-back-end.vercel.app/api/data?collection=monitors', {
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
              `https://restaurant-back-end.vercel.app/api/data?collection=monitors&id=${id}`,
              { 
                next: { revalidate: 86000 }, // تحسين مدة التخزين المؤقت
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
          .filter(prod => prod && prod.id !== product.id)
          .slice(0, 8);
      }
      
      // إذا لم نحصل على عدد كافٍ، نجلب منتجات من نفس الفئة
      if (relatedProducts.length < 4 && product.category) {
        try {
          const categoryRes = await fetch(
            `https://restaurant-back-end.vercel.app/api/data?collection=monitors&category=${encodeURIComponent(product.category)}&limit=12`,
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
              .filter(prod => prod.id !== product.id)
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
    <section className="bg-white rounded-3xl shadow-lg p-4 sm:p-8 mb-8 fade-in">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">منتجات مشابهة</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {relatedProducts.map((prod, index) => (
          <Link 
            key={`related-${prod.id}-${index}`} 
            href={`/monitors/${prod.id}`} 
            className="bg-gray-50 rounded-2xl p-3 sm:p-4 card-hover border border-gray-200"
            prefetch={false} // تحسين الأداء
          >
            <div className="relative mb-3 sm:mb-4">
              <img 
                src={prod.image || prod.detailedImages?.[0] || ''} 
                alt={prod.name} 
                className="w-full h-32 sm:h-40 object-contain"
                loading="lazy"
                decoding="async"
              />
              {prod.discount && (
                <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  -{prod.discount}%
                </span>
              )}
            </div>
            
            <h3 className="font-bold text-base sm:text-lg mb-2 text-gray-900 line-clamp-2">
              {prod.name}
            </h3>
            
            <div className="flex items-center justify-between mb-2">
              <div className="text-lg sm:text-xl font-bold text-purple-600">
                {formatPrice(prod.price)} {prod.currency || 'ج.م'}
              </div>
              {prod.rating && (
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400 text-sm">★</span>
                  <span className="text-sm text-gray-600">{prod.rating}</span>
                </div>
              )}
            </div>
            
            {prod.originalPrice && (
              <div className="text-sm text-gray-500 line-through">
                {formatPrice(prod.originalPrice)} {prod.currency || 'ج.م'}
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
    size: 'الحجم',
    resolution: 'الدقة',
    refreshRate: 'معدل التحديث',
    panel: 'نوع الشاشة',
    responseTime: 'زمن الاستجابة',
    contrastRatio: 'نسبة التباين',
    brightness: 'السطوع',
    viewingAngle: 'زاوية الرؤية',
    colorGamut: 'نطاق الألوان',
    colorDepth: 'عمق الألوان',
    hdr: 'HDR',
    adaptiveSync: 'التزامن التكيفي',
    mountVESA: 'تركيب VESA',
    coating: 'الطلاء',
    warranty: 'الضمان',
    powerConsumption: 'استهلاك الطاقة',
    weight: 'الوزن',
    curvature: 'انحناء',
    panelType: 'نوع اللوحة',
    backlight: 'الإضاءة الخلفية',
    energyClass: 'فئة الطاقة',
    ports: 'المنافذ',
    usbC: 'USB-C',
    dimensions_mm: 'الأبعاد'
  };

  const validSpecs = Object.entries(specs).filter(([key, value]) => 
    value && value !== '—' && value !== 'غير محدد'
  );

  if (validSpecs.length === 0) return null;

  return (
    <section className="bg-white rounded-3xl shadow-lg p-4 sm:p-8 mb-8 fade-in">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">المواصفات التقنية الكاملة</h2>
      
      <div className="info-grid">
        {validSpecs.map(([key, value]) => (
          <div key={key} className="spec-card card-hover">
            <h4 className="font-bold text-base sm:text-lg text-purple-700 mb-3 border-b border-gray-200 pb-2">
              {specLabels[key] || key}
            </h4>
            <div className="text-gray-700 text-sm sm:text-base">
              {Array.isArray(value) ? (
                <ul className="space-y-2">
                  {value.map((item, idx) => (
                    <li key={`spec-item-${idx}`} className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="leading-relaxed">{typeof item === 'object' ? JSON.stringify(item) : String(item)}</span>
                    </li>
                  ))}
                </ul>
              ) : typeof value === 'object' && value !== null ? (
                <div className="space-y-2">
                  {Object.entries(value).map(([subKey, subValue]) => (
                    <div key={subKey} className="bg-gray-50 p-3 rounded-lg">
                      <span className="font-semibold text-purple-600">{subKey}:</span> {String(subValue)}
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
  if (!features || !Array.isArray(features) || features.length === 0) return null;

  return (
    <section className="bg-white rounded-3xl shadow-lg p-4 sm:p-8 mb-8 fade-in">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">المميزات</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {features.map((feature, index) => (
          <div key={`feature-${index}`} className="bg-gradient-to-br from-blue-50 to-purple-50 p-3 sm:p-4 rounded-xl border border-blue-100 card-hover">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
              <span className="text-gray-800 font-medium text-sm sm:text-base">{feature}</span>
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


export default async function ProductDetailsPage({ params }) {
  
  const resolvedParams = await params;

  // جلب المنتج حسب id
  async function fetchProductById(id) {
    try {
      const res = await fetch(
        `https://restaurant-back-end.vercel.app/api/data?collection=monitors&id=${id}`,
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

  // استخراج البيانات بشكل صحيح
  const specs = product.specs || {};
  const details = product.details || {};
  const features = product.features || [];
  const benchmarks = product.benchmarks || {};
  const includedAccessories = product.includedAccessories || [];
  const certifications = product.certifications || [];
  const recommendedUse = product.recommendedUse || [];
  const isAvailable = product.details?.isAvailable !== false && product.details?.stock > 0;

  // تحديد مصفوفة الصور
  const images = product.detailedImages && product.detailedImages.length > 0
    ? product.detailedImages
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
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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
        
        @media (max-width: 639px) {
          .lightbox {
            padding: 0.5rem;
          }
          .lightbox-nav {
            width: 35px;
            height: 35px;
            font-size: 1.25rem;
          }
          .lightbox-prev { left: 10px; }
          .lightbox-next { right: 10px; }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        
        {/* Header Section */}
        <header className="bg-white rounded-3xl shadow-lg overflow-hidden mb-6 sm:mb-8 fade-in">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 sm:gap-8 p-4 sm:p-8">
            
            {/* صور المنتج */}
            <div className="xl:col-span-2">
              <div className="xl:sticky xl:top-8">
                {/* الصورة الرئيسية */}
                <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 relative">
                  <img
                    src={images[0] || product.image || ''}
                    alt={product.name}
                    className="w-full h-60 sm:h-80 object-contain"
                    loading="eager"
                    decoding="sync"
                  />
                  {product.badge && (
                    <span className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                      {product.badge}
                    </span>
                  )}
                  {product.discount && (
                    <span className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-red-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                      خصم {product.discount}%
                    </span>
                  )}
                </div>

                {/* معرض مصغر */}
                {Array.isArray(images) && images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
                    {images.slice(0, 4).map((src, i) => (
                      <a key={`gallery-thumb-${i}`} href={`#img-${i}`} className="bg-gray-50 rounded-xl p-2 card-hover relative">
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

                {/* معلومات سريعة - مخفية في الموبايل */}
                <aside className="bg-gray-50 rounded-2xl p-4 sm:p-6 hidden xl:block">
                  <h3 className="font-bold text-lg mb-4 text-gray-900">معلومات المنتج</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">الحالة</span>
                      <span className={`font-semibold ${
                        isAvailable
                          ? 'text-green-600'
                          : product.stockLevel === 'Limited'
                          ? 'text-yellow-600'
                          : 'text-red-500'
                      }`}>
                        {isAvailable
                          ? 'متوفر'
                          : product.stockLevel === 'Limited'
                          ? 'كمية محدودة'
                          : 'غير متوفر'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">رقم المنتج</span>
                      <span className="font-medium text-gray-900">{product.sku || product.id || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">الفئة</span>
                      <span className="font-medium text-gray-900">{product.category || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">الماركة</span>
                      <span className="font-medium text-gray-900">{product.brand || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">الموديل</span>
                      <span className="font-medium text-gray-900">{product.model || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">سنة الإصدار</span>
                      <span className="font-medium text-gray-900">{product.modelYear || '—'}</span>
                    </div>
                    {specs.warranty && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">الضمان</span>
                        <span className="font-medium text-gray-900">{specs.warranty}</span>
                      </div>
                    )}
                    {specs.weight && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">الوزن</span>
                        <span className="font-medium text-gray-900">{specs.weight}</span>
                      </div>
                    )}
                    {product.energyClass && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">فئة الطاقة</span>
                        <span className="font-medium text-gray-900">{product.energyClass}</span>
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
                  {/* حالة التوفر */}
                  <span
                    className={`availability-badge ${
                      isAvailable
                        ? 'available'
                        : product.stockLevel === 'Limited'
                        ? 'limited'
                        : 'unavailable'
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
                        متوفر
                      </>
                    ) : product.stockLevel === 'Limited' ? (
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
                        كمية محدودة
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
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                        غير متوفر
                      </>
                    )}
                  </span>
                  {product.rating && (
                    <div className="flex items-center gap-1">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={`product-star-${i}`} className="text-xs sm:text-sm">
                            {i < Math.floor(product.rating) ? '★' : '☆'}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs sm:text-sm text-gray-600">({product.rating})</span>
                    </div>
                  )}
                </div>

                <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">{product.name}</h1>
                
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="text-2xl sm:text-4xl font-bold text-purple-600">
                    {formatPrice(product.price)} {product.currency || 'ج.م'}
                  </div>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="text-lg sm:text-xl text-gray-500 line-through">
                      {formatPrice(product.originalPrice)} {product.currency || 'ج.م'}
                    </div>
                  )}
                </div>
              </div>

              {/* مواصفات سريعة */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  { label: 'الحجم', value: specs.size, color: 'bg-blue-50 text-blue-700' },
                  { label: 'الدقة', value: specs.resolution, color: 'bg-green-50 text-green-700' },
                  { label: 'معدل التحديث', value: specs.refreshRate, color: 'bg-purple-50 text-purple-700' },
                  { label: 'نوع الشاشة', value: specs.panel || specs.panelType, color: 'bg-orange-50 text-orange-700' }
                ].map((item, i) => (
                  <div key={`quick-spec-${i}`} className={`p-3 sm:p-4 rounded-xl ${item.color}`}>
                    <div className="text-xs sm:text-sm font-semibold mb-1">{item.label}</div>
                    <div className="text-xs font-medium truncate" title={item.value}>
                      {item.value || '—'}
                    </div>
                  </div>
                ))}
              </div>

              {/* أزرار الإجراء */}
              <div className="flex gap-3 sm:gap-4 pt-3 sm:pt-4">
                <WhatsAppButton
                  product={product}
                  className={`flex-1 py-3 sm:py-4 px-6 sm:px-8 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 transform hover:-translate-y-1 ${
                    isAvailable
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!isAvailable}
                >
                  {isAvailable ? 'اطلب الآن' : 'غير متوفر'}
                </WhatsAppButton >
              </div>

              {/* الوصف */}
              {product.detailedDescription && (
                <div className="bg-gray-50 rounded-2xl p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">وصف المنتج</h3>
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{product.detailedDescription}</p>
                </div>
              )}

              {/* معلومات الشحن والتوصيل */}
              <div className="bg-green-50 rounded-2xl p-4 sm:p-6 border border-green-200">
                <h3 className="text-lg sm:text-xl font-bold text-green-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 sm:h-5 sm:w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  الشحن والتوصيل
                </h3>
                <div className="text-green-700 space-y-2 text-sm sm:text-base">
                  {product.shipping ? (
                    <>
                      <p>• {product.shipping.free ? 'شحن مجاني' : `تكلفة الشحن: ${formatPrice(product.shipping.cost)} ج.م`}</p>
                      <p>• {product.shipping.estimatedDelivery}</p>
                    </>
                  ) : (
                    <>
                      <p>• توصيل سريع خلال 2-5 أيام عمل</p>
                      <p>• شحن مجاني للطلبات فوق 5000 ج.م</p>
                    </>
                  )}
                  <p>• {product.returnPolicy || 'إرجاع مجاني خلال 14 يوم'}</p>
                </div>
              </div>
              
              {/* معلومات المنتج - ظاهرة فقط في الموبايل */}
              <aside className="bg-gray-50 rounded-2xl p-4 sm:p-6 xl:hidden">
                <h3 className="font-bold text-lg mb-4 text-gray-900">معلومات المنتج</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">الحالة</span>
                    <span className={`font-semibold text-sm ${
                      isAvailable
                        ? 'text-green-600'
                        : product.stockLevel === 'Limited'
                        ? 'text-yellow-600'
                        : 'text-red-500'
                    }`}>
                      {isAvailable
                        ? 'متوفر'
                        : product.stockLevel === 'Limited'
                        ? 'كمية محدودة'
                        : 'غير متوفر'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">رقم المنتج</span>
                    <span className="font-medium text-gray-900 text-sm">{product.sku || product.id || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">الفئة</span>
                    <span className="font-medium text-gray-900 text-sm">{product.category || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">الماركة</span>
                    <span className="font-medium text-gray-900 text-sm">{product.brand || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">الموديل</span>
                    <span className="font-medium text-gray-900 text-sm">{product.model || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">سنة الإصدار</span>
                    <span className="font-medium text-gray-900 text-sm">{product.modelYear || '—'}</span>
                  </div>
                  {specs.warranty && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">الضمان</span>
                      <span className="font-medium text-gray-900 text-sm">{specs.warranty}</span>
                    </div>
                  )}
                  {specs.weight && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">الوزن</span>
                      <span className="font-medium text-gray-900 text-sm">{specs.weight}</span>
                    </div>
                  )}
                  {product.energyClass && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">فئة الطاقة</span>
                      <span className="font-medium text-gray-900 text-sm">{product.energyClass}</span>
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </header>

        {/* المواصفات التقنية */}
        <TechnicalSpecs specs={specs} />

        {/* الميزات */}
        <FeaturesSection features={features} />

        {/* معايير الأداء */}
        {benchmarks && Object.keys(benchmarks).length > 0 && (
          <section className="bg-white rounded-3xl shadow-lg p-4 sm:p-8 mb-6 sm:mb-8 fade-in">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">معايير الأداء</h2>
            <div className="info-grid">
              {Object.entries(benchmarks).map(([key, value]) => (
                <div key={key} className="spec-card card-hover bg-red-50">
                  <h4 className="font-bold text-base sm:text-lg text-red-700 mb-3 border-b border-red-200 pb-2">
                    {key}
                  </h4>
                  <div className="text-red-800 text-sm sm:text-base">
                    {Array.isArray(value) ? (
                      <ul className="space-y-2">
                        {value.map((item, idx) => (
                          <li key={`benchmark-item-${idx}`} className="flex items-start gap-2">
                            <span className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span className="leading-relaxed">{typeof item === 'object' ? JSON.stringify(item) : String(item)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : typeof value === 'object' && value !== null ? (
                      <div className="space-y-2">
                        {Object.entries(value).map(([subKey, subValue]) => (
                          <div key={subKey} className="bg-red-100 p-3 rounded-lg">
                            <span className="font-semibold text-red-600">{subKey}:</span> {String(subValue)}
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
        )}

        {/* الملحقات المرفقة */}
        {includedAccessories && includedAccessories.length > 0 && (
          <section className="bg-white rounded-3xl shadow-lg p-4 sm:p-8 mb-6 sm:mb-8 fade-in">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">الملحقات المرفقة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {includedAccessories.map((accessory, index) => (
                <div key={`accessory-${index}`} className="bg-orange-50 p-3 sm:p-4 rounded-xl border border-orange-100 card-hover">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                    <span className="text-orange-800 font-medium text-sm sm:text-base">{accessory}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* الشهادات والمعايير */}
        {certifications && certifications.length > 0 && (
          <section className="bg-white rounded-3xl shadow-lg p-4 sm:p-8 mb-6 sm:mb-8 fade-in">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">الشهادات والمعايير</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {certifications.map((cert, index) => (
                <div key={`cert-${index}`} className="bg-green-50 p-3 sm:p-4 rounded-xl border border-green-100 card-hover">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span className="text-green-800 font-medium text-sm sm:text-base">{cert}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* الاستخدام الموصى به */}
        {recommendedUse && recommendedUse.length > 0 && (
          <section className="bg-white rounded-3xl shadow-lg p-4 sm:p-8 mb-6 sm:mb-8 fade-in">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">الاستخدام الموصى به</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {recommendedUse.map((use, index) => (
                <div key={`use-${index}`} className="bg-yellow-50 p-3 sm:p-4 rounded-xl border border-yellow-100 card-hover">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0"></div>
                    <span className="text-yellow-800 font-medium text-sm sm:text-base">{use}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* الأبعاد المادية */}
        {specs.dimensions_mm && (
          <section className="bg-white rounded-3xl shadow-lg p-4 sm:p-8 mb-6 sm:mb-8 fade-in">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">الأبعاد المادية</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {specs.dimensions_mm.height && (
                <div className="bg-violet-50 p-4 sm:p-6 rounded-2xl border border-violet-100">
                  <h4 className="text-base sm:text-lg font-bold text-violet-700 mb-2">الارتفاع</h4>
                  <p className="text-xl sm:text-2xl font-bold text-violet-800">{specs.dimensions_mm.height} مم</p>
                </div>
              )}
              {specs.dimensions_mm.width && (
                <div className="bg-violet-50 p-4 sm:p-6 rounded-2xl border border-violet-100">
                  <h4 className="text-base sm:text-lg font-bold text-violet-700 mb-2">العرض</h4>
                  <p className="text-xl sm:text-2xl font-bold text-violet-800">{specs.dimensions_mm.width} مم</p>
                </div>
              )}
              {specs.dimensions_mm.depth && (
                <div className="bg-violet-50 p-4 sm:p-6 rounded-2xl border border-violet-100">
                  <h4 className="text-base sm:text-lg font-bold text-violet-700 mb-2">العمق</h4>
                  <p className="text-xl sm:text-2xl font-bold text-violet-800">{specs.dimensions_mm.depth} مم</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* معلومات إضافية */}
        <section className="bg-white rounded-3xl shadow-lg p-4 sm:p-8 mb-6 sm:mb-8 fade-in">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">معلومات إضافية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {product.brand && (
              <div className="bg-indigo-50 p-3 sm:p-4 rounded-xl border border-indigo-100">
                <div className="text-xs sm:text-sm font-medium text-indigo-600 mb-1">الماركة</div>
                <div className="font-semibold text-indigo-800 text-sm sm:text-base">{product.brand}</div>
              </div>
            )}
            {product.model && (
              <div className="bg-indigo-50 p-3 sm:p-4 rounded-xl border border-indigo-100">
                <div className="text-xs sm:text-sm font-medium text-indigo-600 mb-1">الموديل</div>
                <div className="font-semibold text-indigo-800 text-sm sm:text-base">{product.model}</div>
              </div>
            )}
            {product.modelYear && (
              <div className="bg-indigo-50 p-3 sm:p-4 rounded-xl border border-indigo-100">
                <div className="text-xs sm:text-sm font-medium text-indigo-600 mb-1">سنة الإصدار</div>
                <div className="font-semibold text-indigo-800 text-sm sm:text-base">{product.modelYear}</div>
              </div>
            )}
            {product.sku && (
              <div className="bg-indigo-50 p-3 sm:p-4 rounded-xl border border-indigo-100">
                <div className="text-xs sm:text-sm font-medium text-indigo-600 mb-1">رقم المنتج</div>
                <div className="font-semibold text-indigo-800 text-sm sm:text-base">{product.sku}</div>
              </div>
            )}
            {product.energyClass && (
              <div className="bg-indigo-50 p-3 sm:p-4 rounded-xl border border-indigo-100">
                <div className="text-xs sm:text-sm font-medium text-indigo-600 mb-1">فئة الطاقة</div>
                <div className="font-semibold text-indigo-800 text-sm sm:text-base">{product.energyClass}</div>
              </div>
            )}
            {product.stockLevel && (
              <div className="bg-indigo-50 p-3 sm:p-4 rounded-xl border border-indigo-100">
                <div className="text-xs sm:text-sm font-medium text-indigo-600 mb-1">مستوى المخزون</div>
                <div className="font-semibold text-indigo-800 text-sm sm:text-base">
                  {product.stockLevel === 'In Stock' ? 'متوفر' :
                   product.stockLevel === 'Limited' ? 'كمية محدودة' :
                   product.stockLevel === 'Good' ? 'متوفر بكثرة' :
                   product.stockLevel === 'Medium' ? 'متوسط' : product.stockLevel}
                </div>
              </div>
            )}
            {product.seller?.name && (
              <div className="bg-indigo-50 p-3 sm:p-4 rounded-xl border border-indigo-100">
                <div className="text-xs sm:text-sm font-medium text-indigo-600 mb-1">البائع</div>
                <div className="font-semibold text-indigo-800 text-sm sm:text-base">{product.seller.name}</div>
              </div>
            )}
            {product.performanceScore && (
              <div className="bg-indigo-50 p-3 sm:p-4 rounded-xl border border-indigo-100">
                <div className="text-xs sm:text-sm font-medium text-indigo-600 mb-1">نقاط الأداء</div>
                <div className="font-semibold text-indigo-800 text-sm sm:text-base">{product.performanceScore}/100</div>
              </div>
            )}
            {specs.usbC && (
              <div className="bg-indigo-50 p-3 sm:p-4 rounded-xl border border-indigo-100">
                <div className="text-xs sm:text-sm font-medium text-indigo-600 mb-1">USB-C</div>
                <div className="font-semibold text-indigo-800 text-sm sm:text-base">
                  {specs.usbC.supportsDisplay ? 'يدعم العرض' : 'لا يدعم العرض'}
                  {specs.usbC.pdWatts && ` - شحن ${specs.usbC.pdWatts}W`}
                </div>
              </div>
            )}
            {specs.releaseDate && (
              <div className="bg-indigo-50 p-3 sm:p-4 rounded-xl border border-indigo-100">
                <div className="text-xs sm:text-sm font-medium text-indigo-600 mb-1">تاريخ الإصدار</div>
                <div className="font-semibold text-indigo-800 text-sm sm:text-base">{formatDate(specs.releaseDate)}</div>
              </div>
            )}
          </div>
        </section>

        {/* منتجات ذات صلة مع Suspense لتحسين الأداء */}
        <Suspense fallback={
          <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-8 mb-6 sm:mb-8 fade-in">
            <div className="text-center">
              <div className="animate-pulse">
                <div className="h-6 sm:h-8 bg-gray-200 rounded-lg w-1/3 mx-auto mb-6 sm:mb-8"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={`skeleton-${i}`} className="bg-gray-50 rounded-2xl p-3 sm:p-4 border border-gray-200">
                      <div className="bg-gray-200 h-32 sm:h-40 rounded-xl mb-3 sm:mb-4"></div>
                      <div className="h-3 sm:h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
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