import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import WhatsAppButton from '../../_whatsForDetails'; // Adjust the path based on your project structure


export const dynamicParams = true;


  // دالة إنشاء الصفحات الثابتة للمنتجات
export async function generateStaticParams() {
  try {
    const res = await fetch('https://restaurant-back-end.vercel.app/api/data?collection=laptop', {
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
async function RelatedProducts({ laptop }) {
  // جلب المنتجات ذات الصلة مع تحسينات الأداء
  async function fetchRelatedProducts(laptop) {
    try {
      const promises = [];
      let relatedProducts = [];

      // إذا كان المنتج يحتوي على relatedProducts IDs محددة
      if (Array.isArray(laptop?.details?.relatedProducts) && laptop.details.relatedProducts.length > 0) {
        const relatedPromises = laptop.details.relatedProducts.slice(0, 8).map(async (id) => {
          try {
            const res = await fetch(
              `https://restaurant-back-end.vercel.app/api/data?collection=laptop&id=${id}`,
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
          .filter(product => product && product.id !== laptop.id)
          .slice(0, 8);
      }
      
      // إذا لم نحصل على عدد كافٍ، نجلب منتجات من نفس الفئة
      if (relatedProducts.length < 4 && laptop.category) {
        try {
          const categoryRes = await fetch(
            `https://restaurant-back-end.vercel.app/api/data?collection=laptop&category=${encodeURIComponent(laptop.category)}&limit=12`,
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
              .filter(product => product.id !== laptop.id)
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

  const relatedProducts = await fetchRelatedProducts(laptop);

  if (relatedProducts.length === 0) return null;

  return (
    <section className="bg-white rounded-3xl shadow-lg p-4 md:p-8 mb-8 fade-in">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">منتجات مشابهة</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {relatedProducts.map((product, index) => (
          <Link 
            key={`related-${product.id}-${index}`} 
            href={`/laptop/${product.id}`} 
            className="bg-gray-50 rounded-2xl p-3 md:p-4 card-hover border border-gray-200"
            prefetch={false} // تحسين الأداء
          >
            <div className="relative mb-3 md:mb-4">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-32 md:h-40 object-contain"
                loading="lazy"
                decoding="async"
              />
              {product.discount && (
                <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  -{product.discount}%
                </span>
              )}
            </div>
            
            <h3 className="font-bold text-base md:text-lg mb-2 text-gray-900 line-clamp-2">
              {product.name}
            </h3>
            
            <div className="flex items-center justify-between mb-2">
              <div className="text-lg md:text-xl font-bold text-purple-600">
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
function TechnicalSpecs({ specs }) {
  if (!specs || Object.keys(specs).length === 0) return null;

  const specLabels = {
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
    ports: 'المنافذ'
  };

  const validSpecs = Object.entries(specs).filter(([key, value]) => 
    value && value !== '—' && value !== 'غير محدد'
  );

  if (validSpecs.length === 0) return null;

  return (
    <section className="bg-white rounded-3xl shadow-lg p-4 md:p-8 mb-8 fade-in">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">المواصفات التقنية الكاملة</h2>
      
      <div className="info-grid">
        {validSpecs.map(([key, value]) => (
          <div key={key} className="spec-card card-hover">
            <h4 className="font-bold text-base md:text-lg text-purple-700 mb-3 border-b border-gray-200 pb-2">
              {specLabels[key] || key}
            </h4>
            <div className="text-gray-700">
              {Array.isArray(value) ? (
                <ul className="space-y-2">
                  {value.map((item, idx) => (
                    <li key={`spec-item-${idx}`} className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="leading-relaxed text-sm md:text-base">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="leading-relaxed text-sm md:text-base">{String(value)}</div>
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
    <section className="bg-white rounded-3xl shadow-lg p-4 md:p-8 mb-8 fade-in">
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">آراء العملاء</h2>
        <div className="flex items-center justify-center gap-2 md:gap-4">
          <div className="flex text-yellow-400 text-xl md:text-2xl">
            {[...Array(5)].map((_, i) => (
              <span key={`star-${i}`}>{i < Math.floor(reviews.avgRating) ? '★' : '☆'}</span>
            ))}
          </div>
          <span className="text-xl md:text-2xl font-bold text-gray-900">{reviews.avgRating}</span>
          <span className="text-gray-600 text-sm md:text-base">({reviews.count} مراجعة)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        {reviews.items?.slice(0, 6).map((review, index) => (
          <div key={`review-${review.user}-${index}`} className="review-card rounded-xl p-4 md:p-6 card-hover">
            <div className="flex items-center justify-between mb-3">
              <div className="font-bold text-base md:text-lg text-purple-700">{review.user}</div>
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <span key={`review-star-${i}`} className="text-sm md:text-base">{i < review.rating ? '★' : '☆'}</span>
                ))}
              </div>
            </div>
            <p className="text-gray-700 mb-3 leading-relaxed text-sm md:text-base">{review.comment}</p>
            <div className="text-xs md:text-sm text-gray-500">{formatDate(review.date)}</div>
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

  // جلب المنتج الرئيسي مع تحسينات
  async function fetchLaptopById(id) {
    try {
      const res = await fetch(
        `https://restaurant-back-end.vercel.app/api/data?collection=laptop&id=${id}`,
        { 
          next: { revalidate: 3600 }, // تحسين مدة التخزين المؤقت
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
  const laptop = await fetchLaptopById(resolvedParams.id);
  if (!laptop) notFound();

  // استخراج المواصفات
  const specs = laptop.details?.detailedSpecs || laptop.specs || {};

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
          max-height: 95vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .lightbox img { 
          max-height: 85vh; 
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
        
        @media (min-width: 768px) {
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
        
        @media (min-width: 768px) {
          .spec-card {
            padding: 1.5rem;
          }
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
        
        @media (max-width: 640px) {
          .lightbox-nav {
            width: 35px;
            height: 35px;
            font-size: 1.2rem;
          }
          .lightbox-prev { left: 10px; }
          .lightbox-next { right: 10px; }
          .lightbox-close {
            top: -35px;
            right: -5px;
            width: 28px;
            height: 28px;
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-8">
        
        {/* Header Section */}
        <header className="bg-white rounded-3xl shadow-lg overflow-hidden mb-6 md:mb-8 fade-in">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 md:gap-8 p-4 md:p-8">
            
            {/* صور المنتج */}
            <div className="xl:col-span-2">
              <div className="xl:sticky xl:top-8">
                {/* الصورة الرئيسية */}
                <div className="bg-gray-50 rounded-2xl p-4 md:p-6 mb-4 md:mb-6 relative">
                  <img
                    src={laptop.image || laptop.details?.gallery?.[0] || ''}
                    alt={laptop.name}
                    className="w-full h-60 md:h-80 object-contain"
                    loading="eager"
                    decoding="sync"
                  />
                  {laptop.badge && (
                    <span className="absolute top-2 md:top-4 right-2 md:right-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm font-bold shadow-lg">
                      {laptop.badge}
                    </span>
                  )}
                  {laptop.discount && (
                    <span className="absolute top-2 md:top-4 left-2 md:left-4 bg-red-500 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold">
                      خصم {laptop.discount}%
                    </span>
                  )}
                </div>

                {/* معرض مصغر */}
                {Array.isArray(laptop.details?.gallery) && laptop.details.gallery.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 md:gap-3 mb-4 md:mb-0">
                    {laptop.details.gallery.slice(0, 4).map((src, i) => (
                      <a key={`gallery-thumb-${i}`} href={`#img-${i}`} className="bg-gray-50 rounded-xl p-1 md:p-2 card-hover relative">
                        <img 
                          src={src} 
                          alt={`${laptop.name} ${i + 1}`} 
                          className="w-full h-12 md:h-16 object-cover rounded-lg"
                          loading="lazy"
                          decoding="async"
                        />
                      </a>
                    ))}
                  </div>
                )}

                {/* معلومات سريعة - الشاشات الكبيرة فقط */}
                <aside className="bg-gray-50 rounded-2xl p-4 md:p-6 mt-4 md:mt-6 hidden xl:block">
                  <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4 text-gray-900">معلومات المنتج</h3>
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm md:text-base">الحالة</span>
                      <span className={`font-semibold text-sm md:text-base ${laptop.details?.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {laptop.details?.stock > 0 ? `متوفر (${laptop.details.stock})` : 'غير متوفر'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm md:text-base">رقم المنتج</span>
                      <span className="font-medium text-gray-900 text-sm md:text-base">{laptop.details?.sku || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm md:text-base">الضمان</span>
                      <span className="font-medium text-gray-900 text-sm md:text-base">
                        {laptop.details?.warrantyMonths ? `${laptop.details.warrantyMonths} شهر` : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm md:text-base">تاريخ الإصدار</span>
                      <span className="font-medium text-gray-900 text-sm md:text-base">{formatDate(laptop.details?.releaseDate)}</span>
                    </div>
                  </div>
                </aside>
              </div>
            </div>

            {/* تفاصيل المنتج */}
            <div className="xl:col-span-3 space-y-4 md:space-y-6">
              
              {/* اسم المنتج والسعر */}
              <div>
                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3 flex-wrap">
                  <span className="bg-purple-100 text-purple-700 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium">
                    {laptop.category}
                  </span>
                  {laptop.rating && (
                    <div className="flex items-center gap-1">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={`product-star-${i}`} className="text-xs md:text-sm">
                            {i < Math.floor(laptop.rating) ? '★' : '☆'}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs md:text-sm text-gray-600">({laptop.rating})</span>
                    </div>
                  )}
                </div>

                <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4 leading-tight">{laptop.name}</h1>
                
                <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6 flex-wrap">
                  <div className="text-2xl md:text-4xl font-bold text-purple-600">
                    {formatPrice(laptop.price)} {laptop.currency || 'ج.م'}
                  </div>
                  {laptop.originalPrice && (
                    <div className="text-lg md:text-xl text-gray-500 line-through">
                      {formatPrice(laptop.originalPrice)} {laptop.currency || 'ج.م'}
                    </div>
                  )}
                </div>
              </div>

              {/* مواصفات سريعة */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {[
                  { label: 'المعالج', value: laptop.specs?.processor || specs.cpu, color: 'bg-blue-50 text-blue-700' },
                  { label: 'الذاكرة', value: laptop.specs?.ram || specs.ram, color: 'bg-green-50 text-green-700' },
                  { label: 'التخزين', value: laptop.specs?.storage || specs.storage, color: 'bg-purple-50 text-purple-700' },
                  { label: 'الرسوميات', value: laptop.specs?.graphics || specs.gpu, color: 'bg-orange-50 text-orange-700' }
                ].map((item, i) => (
                  <div key={`quick-spec-${i}`} className={`p-3 md:p-4 rounded-xl ${item.color}`}>
                    <div className="text-xs md:text-sm font-semibold mb-1">{item.label}</div>
                    <div className="text-xs font-medium truncate" title={item.value}>
                      {item.value || '—'}
                    </div>
                  </div>
                ))}
              </div>

              {/* أزرار الإجراء */}
              <div className="flex gap-3 md:gap-4 pt-3 md:pt-4">
                <WhatsAppButton
                  product={laptop}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 md:py-4 px-4 md:px-8 rounded-2xl font-bold text-base md:text-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  اطلب الآن
                </WhatsAppButton >
              </div>

              {/* الوصف */}
              {laptop.details?.longDescription && (
                <div className="bg-gray-50 rounded-2xl p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">وصف المنتج</h3>
                  <p className="text-gray-700 leading-relaxed text-sm md:text-base">{laptop.details.longDescription}</p>
                </div>
              )}

              {/* الميزات */}
              {laptop.features && laptop.features.length > 0 && (
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">الميزات الرئيسية</h3>
                  <div className="grid grid-cols-1 gap-2 md:gap-3">
                    {laptop.features.map((feature, index) => (
                      <div key={`feature-${index}`} className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-white rounded-xl">
                        <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-700 font-medium text-sm md:text-base">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* معلومات سريعة - الشاشات الصغيرة فقط */}
              <aside className="bg-gray-50 rounded-2xl p-4 md:p-6 block xl:hidden">
                <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4 text-gray-900">معلومات المنتج</h3>
                <div className="space-y-2 md:space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm md:text-base">الحالة</span>
                    <span className={`font-semibold text-sm md:text-base ${laptop.details?.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {laptop.details?.stock > 0 ? `متوفر (${laptop.details.stock})` : 'غير متوفر'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm md:text-base">رقم المنتج</span>
                    <span className="font-medium text-gray-900 text-sm md:text-base">{laptop.details?.sku || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm md:text-base">الضمان</span>
                    <span className="font-medium text-gray-900 text-sm md:text-base">
                      {laptop.details?.warrantyMonths ? `${laptop.details.warrantyMonths} شهر` : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm md:text-base">تاريخ الإصدار</span>
                    <span className="font-medium text-gray-900 text-sm md:text-base">{formatDate(laptop.details?.releaseDate)}</span>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </header>

        {/* المواصفات التقنية */}
        <TechnicalSpecs specs={specs} />

        {/* المراجعات */}
        <ReviewsSection reviews={laptop.details?.reviews} />

        {/* منتجات ذات صلة مع Suspense لتحسين الأداء */}
        <Suspense fallback={
          <div className="bg-white rounded-3xl shadow-lg p-4 md:p-8 mb-6 md:mb-8 fade-in">
            <div className="text-center">
              <div className="animate-pulse">
                <div className="h-6 md:h-8 bg-gray-200 rounded-lg w-1/3 mx-auto mb-6 md:mb-8"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={`skeleton-${i}`} className="bg-gray-50 rounded-2xl p-3 md:p-4 border border-gray-200">
                      <div className="bg-gray-200 h-32 md:h-40 rounded-xl mb-3 md:mb-4"></div>
                      <div className="h-3 md:h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 md:h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        }>
          <RelatedProducts laptop={laptop} />
        </Suspense>

        {/* الملحقات */}
        {Array.isArray(laptop.details?.accessories) && laptop.details.accessories.length > 0 && (
          <section className="bg-white rounded-3xl shadow-lg p-4 md:p-8 fade-in">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">الملحقات المقترحة</h3>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {laptop.details.accessories.map((accessory, index) => (
                <span key={`accessory-${index}`} className="px-3 md:px-4 py-1 md:py-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full text-xs md:text-sm font-medium border border-purple-200">
                  {accessory}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* معرض الصور */}
      {Array.isArray(laptop.details?.gallery) && laptop.details.gallery.map((src, i) => (
        <div key={`lightbox-img-${i}`} id={`img-${i}`} className="lightbox">
          <a href="#" className="absolute inset-0" aria-label="إغلاق"></a>
          
          <div className="lightbox-content">
            {i > 0 && (
              <a href={`#img-${i-1}`} className="lightbox-nav lightbox-prev" aria-label="الصورة السابقة">❮</a>
            )}
            
            <img 
              src={src} 
              alt={`${laptop.name} ${i + 1}`} 
              className="max-h-80vh w-auto max-w-full rounded-lg shadow-lg"
              loading="lazy"
              decoding="async"
            />
            
            {i < laptop.details.gallery.length - 1 && (
              <a href={`#img-${i+1}`} className="lightbox-nav lightbox-next" aria-label="الصورة التالية">❯</a>
            )}
            
            <a href="#" className="lightbox-close" aria-label="إغلاق">✕</a>
          </div>
        </div>
      ))}
    </main>
  );
}