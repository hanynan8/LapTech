import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import WhatsAppButton from '../../_whatsForDetails'; // Adjust the path based on your project structure

export const dynamicParams = true;

// دالة إنشاء الصفحات الثابتة للمنتجات
export async function generateStaticParams() {
  try {
    const res = await fetch('https://restaurant-back-end.vercel.app/api/data?collection=other', {
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
      let relatedProducts = [];

      // إذا كان المنتج يحتوي على relatedProducts IDs محددة
      if (Array.isArray(product?.details?.relatedProducts) && product.details.relatedProducts.length > 0) {
        const relatedPromises = product.details.relatedProducts.slice(0, 8).map(async (id) => {
          try {
            const res = await fetch(
              `https://restaurant-back-end.vercel.app/api/data?collection=other&id=${id}`,
              { 
                next: { revalidate: 86000 },
                signal: AbortSignal.timeout(5000)
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
            `https://restaurant-back-end.vercel.app/api/data?collection=other&category=${encodeURIComponent(product.category)}&limit=12`,
            { 
              next: { revalidate: 1800 },
              signal: AbortSignal.timeout(5000)
            }
          );
          
          if (categoryRes.ok) {
            const categoryData = await categoryRes.json();
            let categoryProducts = [];
            
            if (Array.isArray(categoryData)) {
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
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">منتجات مشابهة</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {relatedProducts.map((prod, index) => (
          <Link 
            key={`related-${prod.id}-${index}`} 
            href={`/other/${prod.id}`} 
            className="bg-gray-50 rounded-2xl p-4 card-hover border border-gray-200"
            prefetch={false}
          >
            <div className="relative mb-4">
              <img 
                src={prod.image || prod.detailedImages?.[0] || '/placeholder.jpg'} 
                alt={prod.name} 
                className="w-full h-40 object-contain"
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

  const validSpecs = Object.entries(specs).filter(([key, value]) => 
    value && value !== '—' && value !== 'غير محدد'
  );

  if (validSpecs.length === 0) return null;

  return (
    <section className="bg-white rounded-3xl shadow-lg p-4 sm:p-8 mb-8 fade-in">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">المواصفات التقنية الكاملة</h2>
      
      <div className="info-grid">
        {validSpecs.map(([key, value]) => (
          <div key={key} className="spec-card card-hover">
            <h4 className="font-bold text-base sm:text-lg text-purple-700 mb-3 border-b border-gray-200 pb-2">
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
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
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">المميزات</h2>
      
      <div className="grid grid-cols-1 gap-3">
        {features.map((feature, index) => (
          <div key={`feature-${index}`} className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100 card-hover">
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

// Server Component لمعايير الأداء
function BenchmarksSection({ benchmarks }) {
  if (!benchmarks || Object.keys(benchmarks).length === 0) return null;

  return (
    <section className="bg-white rounded-3xl shadow-lg p-4 sm:p-8 mb-8 fade-in">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">معايير الأداء</h2>
      
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
  );
}

// Server Component للمراجعات
function ReviewsSection({ customerReviews }) {
  if (!customerReviews || !Array.isArray(customerReviews) || customerReviews.length === 0) return null;

  return (
    <section className="bg-white rounded-3xl shadow-lg p-4 sm:p-8 mb-8 fade-in">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">تقييمات العملاء</h2>
      
      <div className="grid grid-cols-1 gap-3">
        {customerReviews.slice(0, 6).map((review, index) => (
          <div key={`review-${review.user}-${index}`} className="review-card rounded-xl p-4 sm:p-6 card-hover">
            <div className="flex items-center justify-between mb-3">
              <div className="font-bold text-base sm:text-lg text-purple-700">{review.user}</div>
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <span key={`review-star-${i}`} className="text-sm sm:text-base">{i < review.rating ? '★' : '☆'}</span>
                ))}
              </div>
            </div>
            {review.title && <div className="text-sm text-gray-600 mb-2 font-medium">{review.title}</div>}
            <p className="text-gray-700 mb-3 leading-relaxed text-sm sm:text-base">{review.comment}</p>
            <div className="text-sm text-gray-500">{formatDate(review.date)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// دالة مساعدة لتنسيق السعر
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
        `https://restaurant-back-end.vercel.app/api/data?collection=other&id=${id}`,
        { 
          next: { revalidate: 900 },
          signal: AbortSignal.timeout(8000)
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
  const features = product.features || [];
  const benchmarks = product.benchmarks || {};
  const description = product.description || '';
  const details = product.details || {};
  const meta = product.meta || {};
  const isAvailable = details.isAvailable || false;
  const stock = details.stock || 0;
  const sku = details.sku || '';
  const manufacturer = details.manufacturer || '';
  const warranty = details.warranty || '';
  const originCountry = details.originCountry || '';
  const releaseDate = details.releaseDate || '';
  const dimensions = details.dimensions || '';
  const weight = details.weight || '';
  const colors = details.colors || [];
  const ports = details.ports || [];
  const energyConsumption = details.energyConsumption || '';
  const packaging = details.packaging || {};
  const shippingInfo = details.shippingInfo || {};
  const returnPolicy = details.returnPolicy || {};
  const promotions = details.promotions || {};
  const customerReviews = details.customerReviews || [];
  const support = details.support || {};
  const tags = details.tags || [];
  const availabilityLocations = details.availabilityLocations || [];

  // تحديد مصفوفة الصور
  const images = Array.isArray(product.detailedImages) && product.detailedImages.length > 0
    ? [product.image, ...product.detailedImages]
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
          top: -40px;
          right: 0;
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
          width: 30px;
          height: 30px;
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
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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

        .availability-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 12px;
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
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 p-4 sm:p-8">
            
            {/* صور المنتج */}
            <div className="xl:col-span-2">
              <div className="sticky top-8">
                {/* الصورة الرئيسية */}
                <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 mb-6 relative">
                  <img
                    src={images[0] || '/placeholder.jpg'}
                    alt={product.name}
                    className="w-full h-64 sm:h-80 object-contain"
                    loading="eager"
                    decoding="sync"
                  />
                  {product.badge && (
                    <span className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                      {product.badge}
                    </span>
                  )}
                  {product.discount && (
                    <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                      خصم {product.discount}%
                    </span>
                  )}
                </div>

                {/* معرض مصغر */}
                {Array.isArray(images) && images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-6">
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

                {/* معلومات سريعة - تظهر في الشاشات الكبيرة فقط */}
                <aside className="bg-gray-50 rounded-2xl p-4 sm:p-6 mt-6 hidden xl:block">
                  <h3 className="font-bold text-base sm:text-lg mb-4 text-gray-900">معلومات المنتج</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm sm:text-base">الحالة</span>
                      <span className={`availability-badge text-sm sm:text-base ${
                        isAvailable ? 'available' : 'unavailable'
                      }`}>
                        {isAvailable ? (
                          <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            متوفر
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
                      <span className="text-gray-600 text-sm sm:text-base">المخزون</span>
                      <span className="font-medium text-gray-900 text-sm sm:text-base">{stock || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm sm:text-base">رقم المنتج</span>
                      <span className="font-medium text-gray-900 text-sm sm:text-base">{sku || product.id || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm sm:text-base">الفئة</span>
                      <span className="font-medium text-gray-900 text-sm sm:text-base">{product.category || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm sm:text-base">الشركة المصنعة</span>
                      <span className="font-medium text-gray-900 text-sm sm:text-base">{manufacturer || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm sm:text-base">الضمان</span>
                      <span className="font-medium text-gray-900 text-sm sm:text-base">{warranty || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm sm:text-base">بلد المنشأ</span>
                      <span className="font-medium text-gray-900 text-sm sm:text-base">{originCountry || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm sm:text-base">الأبعاد</span>
                      <span className="font-medium text-gray-900 text-sm sm:text-base">{dimensions || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm sm:text-base">الوزن</span>
                      <span className="font-medium text-gray-900 text-sm sm:text-base">{weight || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm sm:text-base">استهلاك الطاقة</span>
                      <span className="font-medium text-gray-900 text-sm sm:text-base">{energyConsumption || '—'}</span>
                    </div>
                  </div>
                </aside>
              </div>
            </div>

            {/* تفاصيل المنتج */}
            <div className="xl:col-span-3 space-y-6">
              
              {/* اسم المنتج والسعر */}
              <div>
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <span className="bg-purple-100 text-purple-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                    {product.category}
                  </span>
                  {product.rating && (
                    <div className="flex items-center gap-1">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={`product-star-${i}`} className="text-sm">{i < Math.floor(product.rating) ? '★' : '☆'}</span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({product.rating})</span>
                      {customerReviews.length > 0 && (
                        <span className="text-gray-500 text-sm ml-2">({customerReviews.length} تقييم)</span>
                      )}
                    </div>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
                
                <div className="flex items-center gap-4 mb-6 flex-wrap">
                  <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                    {formatPrice(product.price)} {product.currency || 'ج.م'}
                  </div>
                </div>
              </div>

              {/* مواصفات سريعة */}
              {Object.keys(specs).length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {Object.entries(specs).slice(0, 4).map(([key, value], i) => (
                    <div key={`quick-spec-${i}`} className={`p-3 sm:p-4 rounded-xl ${
                      i % 4 === 0 ? 'bg-blue-50 text-blue-700' :
                      i % 4 === 1 ? 'bg-green-50 text-green-700' :
                      i % 4 === 2 ? 'bg-purple-50 text-purple-700' :
                      'bg-orange-50 text-orange-700'
                    }`}>
                      <div className="text-xs sm:text-sm font-semibold mb-1">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                      </div>
                      <div className="text-xs font-medium truncate" title={String(value)}>
                        {String(value) || '—'}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* أزرار الإجراء */}
              <div className="flex gap-3 sm:gap-4 pt-4 flex-wrap">
                <WhatsAppButton 
                  product={product}
                  className={`flex-1 min-w-40 py-3 sm:py-4 px-6 sm:px-8 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 transform hover:-translate-y-1 ${
                    isAvailable
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!isAvailable}
                >
                  {isAvailable ? 'اطلب الآن' : 'غير متوفر'}
                </WhatsAppButton >
              </div>

              {/* معلومات سريعة - تظهر في الشاشات الصغيرة فقط */}
              <aside className="bg-gray-50 rounded-2xl p-4 sm:p-6 xl:hidden">
                <h3 className="font-bold text-base sm:text-lg mb-4 text-gray-900">معلومات المنتج</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm sm:text-base">الحالة</span>
                    <span className={`availability-badge text-sm sm:text-base ${
                      isAvailable ? 'available' : 'unavailable'
                    }`}>
                      {isAvailable ? (
                        <>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          متوفر
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
                    <span className="text-gray-600 text-sm sm:text-base">المخزون</span>
                    <span className="font-medium text-gray-900 text-sm sm:text-base">{stock || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm sm:text-base">رقم المنتج</span>
                    <span className="font-medium text-gray-900 text-sm sm:text-base">{sku || product.id || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm sm:text-base">الفئة</span>
                    <span className="font-medium text-gray-900 text-sm sm:text-base">{product.category || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm sm:text-base">الشركة المصنعة</span>
                    <span className="font-medium text-gray-900 text-sm sm:text-base">{manufacturer || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm sm:text-base">الضمان</span>
                    <span className="font-medium text-gray-900 text-sm sm:text-base">{warranty || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm sm:text-base">بلد المنشأ</span>
                    <span className="font-medium text-gray-900 text-sm sm:text-base">{originCountry || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm sm:text-base">الأبعاد</span>
                    <span className="font-medium text-gray-900 text-sm sm:text-base">{dimensions || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm sm:text-base">الوزن</span>
                    <span className="font-medium text-gray-900 text-sm sm:text-base">{weight || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm sm:text-base">استهلاك الطاقة</span>
                    <span className="font-medium text-gray-900 text-sm sm:text-base">{energyConsumption || '—'}</span>
                  </div>
                </div>
              </aside>

              {/* الوصف */}
              {description && (
                <div className="bg-gray-50 rounded-2xl p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">وصف المنتج</h3>
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{description}</p>
                </div>
              )}

              {/* معلومات الشحن والتوصيل */}
              {Object.keys(shippingInfo).length > 0 && (
                <div className="bg-green-50 rounded-2xl p-4 sm:p-6 border border-green-200">
                  <h3 className="text-lg sm:text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
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
                    <p>• من: {shippingInfo.shipsFrom || '—'}</p>
                    <p>• تقدير التوصيل: {shippingInfo.deliveryEstimation || '—'}</p>
                    <p>• شحن دولي: {shippingInfo.internationalShipping ? 'نعم' : 'لا'}</p>
                    <p>• {returnPolicy.period ? `إرجاع خلال ${returnPolicy.period}` : 'إرجاع مجاني خلال 14 يوم'}</p>
                  </div>
                </div>
              )}

              {/* الألوان المتاحة */}
              {colors && colors.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">الألوان المتاحة</h3>
                  <div className="flex flex-wrap gap-3">
                    {colors.map((color, index) => (
                      <span key={`color-${index}`} className="px-3 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full text-xs sm:text-sm font-medium border border-purple-200">
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* المنافذ */}
              {ports && ports.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">المنافذ والاتصالات</h3>
                  <div className="flex flex-wrap gap-3">
                    {ports.map((port, index) => (
                      <span key={`port-${index}`} className="px-3 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-cyan-100 to-teal-100 text-cyan-700 rounded-full text-xs sm:text-sm font-medium border border-cyan-200">
                        {port}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* العلامات */}
              {tags && tags.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">العلامات</h3>
                  <div className="flex flex-wrap gap-3">
                    {tags.map((tag, index) => (
                      <span key={`tag-${index}`} className="px-3 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 rounded-full text-xs sm:text-sm font-medium border border-yellow-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* المواصفات التقنية */}
        <TechnicalSpecs specs={specs} />

        {/* الميزات */}
        <FeaturesSection features={features} />

        {/* معايير الأداء */}
        <BenchmarksSection benchmarks={benchmarks} />

        {/* تقييمات العملاء */}
        <ReviewsSection customerReviews={customerReviews} />

        {/* التغليف */}
        {packaging && Object.keys(packaging).length > 0 && (
          <section className="bg-white rounded-3xl shadow-lg p-4 sm:p-8 mb-8 fade-in">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">معلومات التغليف</h2>
            <div className="info-grid">
              {Object.entries(packaging).map(([key, value]) => (
                <div key={key} className="spec-card card-hover bg-orange-50">
                  <h4 className="font-bold text-base sm:text-lg text-orange-700 mb-3 border-b border-orange-200 pb-2">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                  </h4>
                  <div className="text-orange-800 text-sm sm:text-base">
                    <div className="leading-relaxed">{String(value)}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* مواقع التوفر */}
        {availabilityLocations && availabilityLocations.length > 0 && (
          <section className="bg-white rounded-3xl shadow-lg p-4 sm:p-8 mb-8 fade-in">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">مواقع التوفر</h2>
            <div className="grid grid-cols-1 gap-3">
              {availabilityLocations.map((location, index) => (
                <div key={`location-${index}`} className="bg-green-50 p-4 rounded-xl border border-green-100 card-hover">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span className="text-green-800 font-medium text-sm sm:text-base">{location}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* معلومات إضافية */}
        {Object.keys(details).length > 0 && (
          <section className="bg-white rounded-3xl shadow-lg p-4 sm:p-8 mb-8 fade-in">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">معلومات إضافية</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <div className="text-xs sm:text-sm font-medium text-indigo-600 mb-1">الحالة</div>
                <div className="font-semibold text-indigo-800 text-sm sm:text-base">{isAvailable ? 'متوفر' : 'غير متوفر'}</div>
              </div>
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <div className="text-xs sm:text-sm font-medium text-indigo-600 mb-1">المخزون</div>
                <div className="font-semibold text-indigo-800 text-sm sm:text-base">{stock || '—'}</div>
              </div>
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <div className="text-xs sm:text-sm font-medium text-indigo-600 mb-1">رقم المنتج</div>
                <div className="font-semibold text-indigo-800 text-sm sm:text-base">{sku || product.id || '—'}</div>
              </div>
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <div className="text-xs sm:text-sm font-medium text-indigo-600 mb-1">الشركة المصنعة</div>
                <div className="font-semibold text-indigo-800 text-sm sm:text-base">{manufacturer || '—'}</div>
              </div>
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <div className="text-xs sm:text-sm font-medium text-indigo-600 mb-1">الضمان</div>
                <div className="font-semibold text-indigo-800 text-sm sm:text-base">{warranty || '—'}</div>
              </div>
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <div className="text-xs sm:text-sm font-medium text-indigo-600 mb-1">بلد المنشأ</div>
                <div className="font-semibold text-indigo-800 text-sm sm:text-base">{originCountry || '—'}</div>
              </div>
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <div className="text-xs sm:text-sm font-medium text-indigo-600 mb-1">تاريخ الإصدار</div>
                <div className="font-semibold text-indigo-800 text-sm sm:text-base">{releaseDate ? formatDate(releaseDate) : '—'}</div>
              </div>
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <div className="text-xs sm:text-sm font-medium text-indigo-600 mb-1">الأبعاد</div>
                <div className="font-semibold text-indigo-800 text-sm sm:text-base">{dimensions || '—'}</div>
              </div>
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <div className="text-xs sm:text-sm font-medium text-indigo-600 mb-1">الوزن</div>
                <div className="font-semibold text-indigo-800 text-sm sm:text-base">{weight || '—'}</div>
              </div>
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <div className="text-xs sm:text-sm font-medium text-indigo-600 mb-1">استهلاك الطاقة</div>
                <div className="font-semibold text-indigo-800 text-sm sm:text-base">{energyConsumption || '—'}</div>
              </div>
              {product.performanceScore && (
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                  <div className="text-xs sm:text-sm font-medium text-indigo-600 mb-1">نقاط الأداء</div>
                  <div className="font-semibold text-indigo-800 text-sm sm:text-base">{product.performanceScore}/100</div>
                </div>
              )}
              {meta.createdAt && (
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                  <div className="text-xs sm:text-sm font-medium text-indigo-600 mb-1">تاريخ الإنشاء</div>
                  <div className="font-semibold text-indigo-800 text-sm sm:text-base">{formatDate(meta.createdAt)}</div>
                </div>
              )}
              {meta.updatedAt && (
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                  <div className="text-xs sm:text-sm font-medium text-indigo-600 mb-1">تاريخ التحديث</div>
                  <div className="font-semibold text-indigo-800 text-sm sm:text-base">{formatDate(meta.updatedAt)}</div>
                </div>
              )}
              {meta.visibility && (
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                  <div className="text-xs sm:text-sm font-medium text-indigo-600 mb-1">الرؤية</div>
                  <div className="font-semibold text-indigo-800 text-sm sm:text-base">{meta.visibility}</div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* العروض الترويجية */}
        {promotions && Object.keys(promotions).length > 0 && (
          <section className="bg-white rounded-3xl shadow-lg p-4 sm:p-8 mb-8 fade-in">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">العروض الترويجية</h2>
            <div className="info-grid">
              {Object.entries(promotions).map(([key, value]) => (
                <div key={key} className="spec-card card-hover bg-yellow-50">
                  <h4 className="font-bold text-base sm:text-lg text-yellow-700 mb-3 border-b border-yellow-200 pb-2">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                  </h4>
                  <div className="text-yellow-800 text-sm sm:text-base">
                    <div className="leading-relaxed">{String(value)}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* معلومات الدعم */}
        {support && Object.keys(support).length > 0 && (
          <section className="bg-white rounded-3xl shadow-lg p-4 sm:p-8 mb-8 fade-in">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">معلومات الدعم</h2>
            <div className="info-grid">
              {Object.entries(support).map(([key, value]) => (
                <div key={key} className="spec-card card-hover bg-teal-50">
                  <h4 className="font-bold text-base sm:text-lg text-teal-700 mb-3 border-b border-teal-200 pb-2">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                  </h4>
                  <div className="text-teal-800 text-sm sm:text-base">
                    <div className="leading-relaxed">{String(value)}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* منتجات ذات صلة مع Suspense لتحسين الأداء */}
        <Suspense fallback={
          <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-8 mb-8 fade-in">
            <div className="text-center">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded-lg w-1/3 mx-auto mb-8"></div>
                <div className="grid grid-cols-1 gap-6">
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