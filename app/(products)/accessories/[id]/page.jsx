// pages/accessories/[id].jsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import AddToCartButton from '../../_addToTheCart'; // Adjust the path based on your project structure

export const dynamicParams = true;

// دالة إنشاء الصفحات الثابتة للمنتجات
export async function generateStaticParams() {
  try {
    const res = await fetch(
      'https://restaurant-back-end.vercel.app/api/data?collection=accessories',
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
  async function fetchRelatedProducts(product) {
    try {
      let relatedProducts = [];

      if (
        Array.isArray(product?.details?.relatedProducts) &&
        product.details.relatedProducts.length > 0
      ) {
        const relatedPromises = product.details.relatedProducts
          .slice(0, 8)
          .map(async (id) => {
            try {
              const res = await fetch(
                `https://restaurant-back-end.vercel.app/api/data?collection=accessories&id=${id}`,
                {
                  next: { revalidate: 86000 },
                  signal: AbortSignal.timeout(5000),
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
          .filter((result) => result.status === 'fulfilled' && result.value)
          .map((result) => result.value)
          .filter((prod) => prod && prod.id !== product.id)
          .slice(0, 8);
      }

      if (relatedProducts.length < 4 && product.category) {
        try {
          const categoryRes = await fetch(
            `https://restaurant-back-end.vercel.app/api/data?collection=accessories`,
            {
              next: { revalidate: 1800 },
              signal: AbortSignal.timeout(5000),
            }
          );

          if (categoryRes.ok) {
            const categoryData = await categoryRes.json();
            let categoryProducts = [];

            if (
              Array.isArray(categoryData) &&
              categoryData.length > 0 &&
              categoryData[0].products
            ) {
              categoryProducts = categoryData[0].products;
            } else if (Array.isArray(categoryData)) {
              categoryProducts = categoryData;
            }

            const additionalProducts = categoryProducts
              .filter(
                (prod) =>
                  prod.category === product.category && prod.id !== product.id
              )
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
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
        منتجات مشابهة
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
        {relatedProducts.map((prod, index) => (
          <Link
            key={`related-${prod.id}-${index}`}
            href={`/accessories/${prod.id}`}
            className="bg-gray-50 rounded-2xl p-3 sm:p-4 card-hover border border-gray-200"
            prefetch={false}
          >
            <div className="relative mb-3 sm:mb-4">
              <img
                src={prod.image}
                alt={prod.name}
                className="w-full h-24 sm:h-40 object-contain"
                loading="lazy"
                decoding="async"
              />
              {prod.discount && (
                <span className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-red-500 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-bold">
                  -{prod.discount}%
                </span>
              )}
            </div>

            <h3 className="font-bold text-sm sm:text-lg mb-1 sm:mb-2 text-gray-900 line-clamp-2">
              {prod.name}
            </h3>

            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <div className="text-sm sm:text-xl font-bold text-purple-600">
                {formatPrice(prod.price)} {prod.currency || 'ر.س'}
              </div>
              {prod.rating && (
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400 text-xs sm:text-sm">★</span>
                  <span className="text-xs sm:text-sm text-gray-600">
                    {prod.rating}
                  </span>
                </div>
              )}
            </div>

            {prod.originalPrice && (
              <div className="text-xs sm:text-sm text-gray-500 line-through">
                {formatPrice(prod.originalPrice)} {prod.currency || 'ر.س'}
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

// Server Component للمواصفات التقنية المحسّن
function TechnicalSpecs({ specs, details }) {
  const allSpecs = { ...specs, ...details };

  if (!allSpecs || Object.keys(allSpecs).length === 0) return null;

  const specLabels = {
    connectivity: 'الاتصال',
    battery: 'البطارية',
    features: 'المميزات',
    dpi: 'الدقة',
    buttons: 'الأزرار',
    switches: 'المفاتيح',
    backlight: 'الإضاءة',
    power: 'الطاقة',
    compatibility: 'التوافق',
    resolution: 'الدقة',
    fps: 'الإطارات',
    display: 'الشاشة',
    capacity: 'السعة',
    ports: 'المنافذ',
    devices: 'الأجهزة',
    brand: 'العلامة التجارية',
    model: 'الموديل',
    weight: 'الوزن',
    color: 'اللون',
    noiseCancellation: 'إلغاء الضوضاء',
    microphone: 'الميكروفون',
    bluetoothRange: 'مدى البلوتوث',
    chargingTime: 'وقت الشحن',
    standbyTime: 'وقت الاستعداد',
    warranty: 'الضمان',
    inTheBox: 'محتويات العلبة',
    sensor: 'المستشعر',
    pollingRate: 'معدل الاستجابة',
    lighting: 'الإضاءة',
    layout: 'التخطيط',
    keycaps: 'أغطية المفاتيح',
    batteryLife: 'عمر البطارية',
    input: 'الدخل',
    output: 'الخرج',
    efficiency: 'الكفاءة',
    cooling: 'التبريد',
    indicator: 'مؤشر الحالة',
    mount: 'التثبيت',
    connection: 'نوع الاتصال',
    dimensions: 'الأبعاد',
    focus: 'التركيز',
    vibration: 'الاهتزاز',
    audio: 'الصوت',
    range: 'المدى',
    processor: 'المعالج',
    storage: 'التخزين',
    waterResistance: 'مقاومة الماء',
    healthFeatures: 'الميزات الصحية',
    charging: 'الشحن',
    technology: 'التقنية',
    chargingSpeed: 'سرعة الشحن',
    driver: 'السائق',
    frequency: 'التردد',
    waterproof: 'مقاوم للماء',
    colors: 'الألوان',
    chargingPower: 'قوة الشحن',
    design: 'التصميم',
  };

  const validSpecs = Object.entries(allSpecs).filter(
    ([key, value]) =>
      value &&
      value !== '—' &&
      value !== 'غير محدد' &&
      key !== 'description' &&
      key !== 'additionalImages' &&
      key !== 'reviews'
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
            <h4 className="font-bold text-base sm:text-lg text-purple-700 mb-2 sm:mb-3 border-b border-gray-200 pb-2">
              {specLabels[key] || key}
            </h4>
            <div className="text-sm sm:text-base text-gray-700">
              {Array.isArray(value) ? (
                <ul className="space-y-1 sm:space-y-2">
                  {value.map((item, idx) => (
                    <li
                      key={`spec-item-${idx}`}
                      className="flex items-start gap-2"
                    >
                      <span className="w-1 h-1 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="leading-relaxed text-sm sm:text-base">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="leading-relaxed text-sm sm:text-base">
                  {String(value)}
                </div>
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
    <section className="bg-white rounded-3xl shadow-lg p-4 sm:p-8 mb-8 fade-in">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
          آراء العملاء
        </h2>
        <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
          <div className="flex text-yellow-400 text-xl sm:text-2xl">
            {[...Array(5)].map((_, i) => (
              <span key={`star-${i}`}>
                {i < Math.floor(reviews.avgRating) ? '★' : '☆'}
              </span>
            ))}
          </div>
          <span className="text-xl sm:text-2xl font-bold text-gray-900">
            {reviews.avgRating}
          </span>
          <span className="text-sm sm:text-base text-gray-600">
            ({reviews.count} مراجعة)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {reviews.items?.slice(0, 6).map((review, index) => (
          <div
            key={`review-${review.user}-${index}`}
            className="review-card rounded-xl p-4 sm:p-6 card-hover"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="font-bold text-base sm:text-lg text-purple-700">
                {review.user}
              </div>
              <div className="flex text-yellow-400 text-sm sm:text-base">
                {[...Array(5)].map((_, i) => (
                  <span key={`review-star-${i}`}>
                    {i < review.rating ? '★' : '☆'}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-gray-700 mb-2 sm:mb-3 leading-relaxed text-sm sm:text-base">
              {review.comment}
            </p>
            <div className="text-xs sm:text-sm text-gray-500">
              {formatDate(review.date)}
            </div>
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
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// دالة جلب البيانات من API المحسّنة
async function fetchAccessoriesData() {
  try {
    const res = await fetch(
      'https://restaurant-back-end.vercel.app/api/data?collection=accessories',
      {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('خطأ في جلب بيانات الإكسسوارات:', error);
    return null;
  }
}

// دالة البحث عن منتج بالـ ID المحسّنة
function findProductById(data, id) {
  if (!data) return null;

  const numericId = Number(id);

  if (Array.isArray(data)) {
    const product = data.find((product) => product.id === numericId);
    if (product) return product;

    for (const item of data) {
      if (item.products && Array.isArray(item.products)) {
        const product = item.products.find((p) => p.id === numericId);
        if (product) return product;
      }
    }
  }

  if (data.products && Array.isArray(data.products)) {
    return data.products.find((product) => product.id === numericId);
  }

  return null;
}

// دالة معلومات المنتج الإضافية
function ProductAdditionalInfo({ product, details }) {
  const additionalInfo = [];

  if (details.brand)
    additionalInfo.push({ label: 'العلامة التجارية', value: details.brand });
  if (details.model)
    additionalInfo.push({ label: 'الموديل', value: details.model });
  if (details.weight)
    additionalInfo.push({ label: 'الوزن', value: details.weight });
  if (details.color)
    additionalInfo.push({ label: 'اللون', value: details.color });
  if (details.warranty)
    additionalInfo.push({ label: 'الضمان', value: details.warranty });
  if (details.dimensions)
    additionalInfo.push({ label: 'الأبعاد', value: details.dimensions });

  if (additionalInfo.length === 0) return null;

  return (
    <aside className="bg-gray-50 rounded-2xl p-4 sm:p-6 mt-4 sm:mt-6">
      <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 text-gray-900">
        معلومات المنتج
      </h3>
      <div className="space-y-2 sm:space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm sm:text-base">الحالة</span>
          <span className="font-semibold text-green-600 text-sm sm:text-base">
            متوفر
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm sm:text-base">رقم المنتج</span>
          <span className="font-medium text-gray-900 text-sm sm:text-base">
            {product.id}
          </span>
        </div>
        {additionalInfo.map((info, index) => (
          <div
            key={`info-${index}`}
            className="flex justify-between items-center"
          >
            <span className="text-gray-600 text-sm sm:text-base">
              {info.label}
            </span>
            <span className="font-medium text-gray-900 text-sm sm:text-base">
              {info.value}
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default async function ProductDetailsPage({ params }) {
  const resolvedParams = await params;

  const accessoriesData = await fetchAccessoriesData();
  if (!accessoriesData) notFound();

  const product = findProductById(accessoriesData, resolvedParams.id);
  if (!product) notFound();

  const specs = product.details?.detailedSpecs || product.specs || {};
  const details = product.details || {};

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
          max-width: 95vw;
          max-height: 95vh;
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
          width: 35px;
          height: 35px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.2rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        
        .lightbox-prev { left: 10px; }
        .lightbox-next { right: 10px; }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
        }

        @media (max-width: 640px) {
          .info-grid {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
        }

        .spec-card {
          background: white;
          border-radius: 1rem;
          padding: 1rem;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 640px) {
          .spec-card {
            padding: 0.75rem;
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

        .quick-specs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 0.75rem;
        }

        @media (max-width: 640px) {
          .quick-specs-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.5rem;
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header Section */}
        <header className="bg-white rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden mb-6 sm:mb-8 fade-in">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 sm:gap-8 p-4 sm:p-8">
            {/* صور المنتج */}
            <div className="xl:col-span-2">
              <div className="xl:sticky xl:top-8">
                <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 relative">
                  <img
                    src={product.image || details.additionalImages?.[0] || ''}
                    alt={product.name}
                    className="w-full h-48 sm:h-80 object-contain"
                    loading="eager"
                    decoding="sync"
                  />
                  {product.badge && (
                    <span className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                      {product.badge}
                    </span>
                  )}
                  {product.discount && (
                    <span className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-red-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                      خصم {product.discount}%
                    </span>
                  )}
                </div>

                {Array.isArray(details.additionalImages) &&
                  details.additionalImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-0">
                      {[product.image, ...details.additionalImages]
                        .slice(0, 4)
                        .map((src, i) => (
                          <a
                            key={`gallery-thumb-${i}`}
                            href={`#img-${i}`}
                            className="bg-gray-50 rounded-lg sm:rounded-xl p-1 sm:p-2 card-hover relative"
                          >
                            <img
                              src={src}
                              alt={`${product.name} ${i + 1}`}
                              className="w-full h-12 sm:h-16 object-cover rounded-md sm:rounded-lg"
                              loading="lazy"
                              decoding="async"
                            />
                          </a>
                        ))}
                    </div>
                  )}

                <div className="hidden xl:block">
                  <ProductAdditionalInfo product={product} details={details} />
                </div>
              </div>
            </div>

            {/* تفاصيل المنتج */}
            <div className="xl:col-span-3 space-y-4 sm:space-y-6">
              <div>
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 flex-wrap">
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

                <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
                  {product.name}
                </h1>

                <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6 flex-wrap">
                  <div className="text-2xl sm:text-4xl font-bold text-purple-600">
                    {formatPrice(product.price)} {product.currency || 'ر.س'}
                  </div>
                  {product.originalPrice && (
                    <div className="text-lg sm:text-xl text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}{' '}
                      {product.currency || 'ر.س'}
                    </div>
                  )}
                  {product.originalPrice && product.price && (
                    <div className="text-xs sm:text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">
                      وفر {formatPrice(product.originalPrice - product.price)}{' '}
                      ر.س
                    </div>
                  )}
                </div>
              </div>

              <div className="quick-specs-grid">
                {Object.entries(specs)
                  .slice(0, 6)
                  .map(([key, value], i) => (
                    <div
                      key={`quick-spec-${i}`}
                      className={`p-2 sm:p-4 rounded-xl text-center ${
                        i === 0
                          ? 'bg-blue-50 text-blue-700'
                          : i === 1
                          ? 'bg-green-50 text-green-700'
                          : i === 2
                          ? 'bg-purple-50 text-purple-700'
                          : i === 3
                          ? 'bg-orange-50 text-orange-700'
                          : i === 4
                          ? 'bg-red-50 text-red-700'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      <div className="text-xs sm:text-sm font-semibold mb-1">
                        {key}
                      </div>
                      <div
                        className="text-xs font-medium truncate"
                        title={value}
                      >
                        {value || '—'}
                      </div>
                    </div>
                  ))}
              </div>

              <div>
                <AddToCartButton product={product}>اطلب الآن</AddToCartButton>
              </div>

              {details.description && (
                <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                    وصف المنتج
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                    {details.description}
                  </p>
                </div>
              )}

              {(specs.features || details.features) && (
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                    الميزات الرئيسية
                  </h3>
                  <div className="grid grid-cols-1 gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg sm:rounded-xl">
                      <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                      <span className="text-gray-700 font-medium text-sm sm:text-base">
                        {specs.features || details.features}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="xl:hidden">
                <ProductAdditionalInfo product={product} details={details} />
              </div>
            </div>
          </div>
        </header>

        <TechnicalSpecs specs={specs} details={details} />

        <ReviewsSection reviews={details.reviews} />

        <Suspense
          fallback={
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-8 mb-6 sm:mb-8 fade-in">
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
                        <div className="h-3 sm:h-4 bg-gray-200 rounded mb-1 sm:mb-2"></div>
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

        {details.inTheBox && (
          <section className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-8 mb-6 sm:mb-8 fade-in">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
              محتويات الصندوق
            </h3>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {details.inTheBox.split('،').map((item, index) => (
                <span
                  key={`accessory-${index}`}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full text-xs sm:text-sm font-medium border border-purple-200"
                >
                  {item.trim()}
                </span>
              ))}
            </div>
          </section>
        )}

        {(details.healthFeatures ||
          details.chargingSpeed ||
          details.waterproof) && (
          <section className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-8 mb-6 sm:mb-8 fade-in">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">
              ميزات متقدمة
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {details.healthFeatures && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center">
                  <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🏥</div>
                  <h4 className="font-bold text-base sm:text-lg text-green-700 mb-1 sm:mb-2">
                    الميزات الصحية
                  </h4>
                  <p className="text-green-600 text-xs sm:text-sm">
                    {details.healthFeatures}
                  </p>
                </div>
              )}
              {details.chargingSpeed && (
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center">
                  <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">⚡</div>
                  <h4 className="font-bold text-base sm:text-lg text-blue-700 mb-1 sm:mb-2">
                    الشحن السريع
                  </h4>
                  <p className="text-blue-600 text-xs sm:text-sm">
                    {details.chargingSpeed}
                  </p>
                </div>
              )}
              {details.waterproof && (
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center">
                  <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">💧</div>
                  <h4 className="font-bold text-base sm:text-lg text-cyan-700 mb-1 sm:mb-2">
                    مقاومة الماء
                  </h4>
                  <p className="text-cyan-600 text-xs sm:text-sm">
                    {details.waterproof}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {(details.technology || details.design || details.efficiency) && (
          <section className="bg-gradient-to-br from-gray-50 to-white rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-8 mb-6 sm:mb-8 fade-in">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">
              معلومات تقنية إضافية
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
              {details.technology && (
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                  <h4 className="font-bold text-base sm:text-lg text-purple-700 mb-2 sm:mb-3 flex items-center gap-2">
                    <span className="text-lg sm:text-xl">🔧</span>
                    التقنية المستخدمة
                  </h4>
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                    {details.technology}
                  </p>
                </div>
              )}
              {details.design && (
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                  <h4 className="font-bold text-base sm:text-lg text-blue-700 mb-2 sm:mb-3 flex items-center gap-2">
                    <span className="text-lg sm:text-xl">🎨</span>
                    التصميم
                  </h4>
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                    {details.design}
                  </p>
                </div>
              )}
              {details.efficiency && (
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                  <h4 className="font-bold text-base sm:text-lg text-green-700 mb-2 sm:mb-3 flex items-center gap-2">
                    <span className="text-lg sm:text-xl">⚡</span>
                    الكفاءة
                  </h4>
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                    {details.efficiency}
                  </p>
                </div>
              )}
              {details.cooling && (
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                  <h4 className="font-bold text-base sm:text-lg text-cyan-700 mb-2 sm:mb-3 flex items-center gap-2">
                    <span className="text-lg sm:text-xl">❄️</span>
                    التبريد
                  </h4>
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                    {details.cooling}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {(details.bluetoothRange ||
          details.pollingRate ||
          details.frequency) && (
          <section className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-8 mb-6 sm:mb-8 fade-in">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">
              مواصفات الاتصال والأداء
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {details.bluetoothRange && (
                <div className="text-center p-4 sm:p-6 bg-blue-50 rounded-xl sm:rounded-2xl">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1 sm:mb-2">
                    {details.bluetoothRange}
                  </div>
                  <div className="text-xs sm:text-sm text-blue-700">
                    مدى البلوتوث
                  </div>
                </div>
              )}
              {details.pollingRate && (
                <div className="text-center p-4 sm:p-6 bg-green-50 rounded-xl sm:rounded-2xl">
                  <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1 sm:mb-2">
                    {details.pollingRate}
                  </div>
                  <div className="text-xs sm:text-sm text-green-700">
                    معدل الاستجابة
                  </div>
                </div>
              )}
              {details.frequency && (
                <div className="text-center p-4 sm:p-6 bg-purple-50 rounded-xl sm:rounded-2xl">
                  <div className="text-xl sm:text-2xl font-bold text-purple-600 mb-1 sm:mb-2">
                    {details.frequency}
                  </div>
                  <div className="text-xs sm:text-sm text-purple-700">
                    نطاق التردد
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <section className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-8 text-white text-center fade-in">
          <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
            لماذا تختار {product.name}؟
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mt-4 sm:mt-8">
            <div className="bg-white/10 backdrop-blur rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <div className="text-lg sm:text-2xl mb-1 sm:mb-2">✅</div>
              <div className="font-bold mb-1 text-sm sm:text-base">
                جودة عالية
              </div>
              <div className="text-xs sm:text-sm opacity-90">
                منتج أصلي وموثوق
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <div className="text-lg sm:text-2xl mb-1 sm:mb-2">🚚</div>
              <div className="font-bold mb-1 text-sm sm:text-base">
                توصيل سريع
              </div>
              <div className="text-xs sm:text-sm opacity-90">
                وصول خلال 24-48 ساعة
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <div className="text-lg sm:text-2xl mb-1 sm:mb-2">🛡️</div>
              <div className="font-bold mb-1 text-sm sm:text-base">
                ضمان موثوق
              </div>
              <div className="text-xs sm:text-sm opacity-90">
                {details.warranty || 'ضمان الشركة'}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <div className="text-lg sm:text-2xl mb-1 sm:mb-2">💎</div>
              <div className="font-bold mb-1 text-sm sm:text-base">
                خدمة متميزة
              </div>
              <div className="text-xs sm:text-sm opacity-90">
                دعم فني على مدار الساعة
              </div>
            </div>
          </div>
        </section>
      </div>

      {details.additionalImages &&
        details.additionalImages.map((src, i) => (
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

              {i < details.additionalImages.length - 1 && (
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
