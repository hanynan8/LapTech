import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

export const dynamicParams = true;

// دالة إنشاء الصفحات الثابتة للمنتجات
export async function generateStaticParams() {
  try {
    const res = await fetch(
      'https://restaurant-back-end.vercel.app/api/data?collection=storage-devices',
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

// دالة لجلب منتج واحد مباشرة عن طريق ID
async function fetchProductById(id) {
  try {
    const res = await fetch(
      `https://restaurant-back-end.vercel.app/api/data?collection=storage-devices&id=${id}`,
      {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data[0] : data || null;
  } catch (error) {
    console.error('خطأ في جلب بيانات المنتج:', error);
    return null;
  }
}

// دالة لجلب المنتجات المشابهة لفئة معينة
async function fetchRelatedProducts(categoryId, excludeId, limit = 8) {
  try {
    const res = await fetch(
      `https://restaurant-back-end.vercel.app/api/data?collection=storage-devices&category=${encodeURIComponent(
        categoryId
      )}&limit=${limit}`,
      {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!res.ok) return [];

    const data = await res.json();
    let products = [];

    if (Array.isArray(data)) {
      if (data.length > 0 && data[0].products) {
        products = data[0].products;
      } else {
        products = data;
      }
    } else if (data && data.products) {
      products = data.products;
    }

    return products
      .filter(
        (product) => product.id !== excludeId && product.category === categoryId
      )
      .slice(0, limit);
  } catch (error) {
    console.error('خطأ في جلب المنتجات المشابهة:', error);
    return [];
  }
}

// دالة لجلب معلومات الفئة
async function fetchCategoryInfo(categoryId) {
  try {
    const res = await fetch(
      `https://restaurant-back-end.vercel.app/api/data?collection=storage-devices`,
      {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    let categories = [];

    if (Array.isArray(data)) {
      if (data.length > 0 && data[0].categories) {
        categories = data[0].categories;
      }
    } else if (data && data.categories) {
      categories = data.categories;
    }

    return categories.find((category) => category.id === categoryId) || null;
  } catch (error) {
    console.error('خطأ في جلب معلومات الفئة:', error);
    return null;
  }
}

// Server Component للمنتجات المشابهة
async function RelatedProducts({ product }) {
  const relatedProducts = await fetchRelatedProducts(
    product.category,
    product.id,
    8
  );

  if (!relatedProducts || relatedProducts.length === 0) return null;

  const categoryInfo = await fetchCategoryInfo(product.category);

  return (
    <section className="bg-white rounded-3xl shadow-lg p-4 sm:p-8 mb-8 fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          منتجات مشابهة
        </h2>
        {categoryInfo && (
          <p className="text-gray-600">من فئة {categoryInfo.name}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {relatedProducts.map((relatedProduct, index) => (
          <Link
            key={`related-${relatedProduct.id}-${index}`}
            href={`/storage/${relatedProduct.id}`}
            className="bg-gray-50 rounded-2xl p-4 card-hover border border-gray-200"
            prefetch={false}
          >
            <div className="relative mb-4">
              <img
                src={relatedProduct.image}
                alt={relatedProduct.name}
                className="w-full h-40 object-contain"
                loading="lazy"
                decoding="async"
              />
              {relatedProduct.badge && (
                <span className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                  {relatedProduct.badge}
                </span>
              )}
              {relatedProduct.discount && (
                <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  -{relatedProduct.discount}%
                </span>
              )}
            </div>

            <h3 className="font-bold text-base sm:text-lg mb-2 text-gray-900 line-clamp-2">
              {relatedProduct.name}
            </h3>

            <div className="flex items-center justify-between mb-2">
              <div className="text-lg sm:text-xl font-bold text-purple-600">
                {formatPrice(relatedProduct.price)}{' '}
                {relatedProduct.currency || 'ج.م'}
              </div>
              {relatedProduct.rating && (
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400 text-sm">★</span>
                  <span className="text-sm text-gray-600">
                    {relatedProduct.rating}
                  </span>
                </div>
              )}
            </div>

            {relatedProduct.originalPrice && (
              <div className="text-sm text-gray-500 line-through">
                {formatPrice(relatedProduct.originalPrice)}{' '}
                {product.currency || 'ج.م'}
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
  const allSpecs = { ...specs, ...detailedSpecs };

  if (!allSpecs || Object.keys(allSpecs).length === 0) return null;

  const validSpecs = Object.entries(allSpecs).filter(
    ([key, value]) =>
      value &&
      value !== '—' &&
      value !== 'غير محدد' &&
      !Array.isArray(value) &&
      typeof value !== 'object'
  );

  if (validSpecs.length === 0) return null;

  return (
    <section className="bg-white rounded-3xl shadow-lg p-4 sm:p-8 mb-8 fade-in">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">
        المواصفات التقنية الكاملة
      </h2>

      <div className="info-grid">
        {validSpecs.map(([key, value]) => (
          <div key={key} className="spec-card card-hover">
            <h4 className="font-bold text-base sm:text-lg text-purple-700 mb-3 border-b border-gray-200 pb-2">
              {key}
            </h4>
            <div className="text-gray-700 leading-relaxed text-sm sm:text-base">
              {String(value)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// دالة لعرض القائمة كـ HTML مع تحسينات ديناميكية
function renderArrayAsHTML(items, title, categoryInfo = null) {
  if (!Array.isArray(items) || items.length === 0) return null;

  const sectionStyles = {
    features: { bg: 'bg-gray-50', icon: '•', color: 'text-purple-500' },
    packageContents: { bg: 'bg-green-50', icon: '✓', color: 'text-green-500' },
    recommendedUse: {
      bg: 'bg-gradient-to-r from-blue-50 to-purple-50',
      icon: '→',
      color: 'text-blue-500',
    },
    default: { bg: 'bg-gray-50', icon: '•', color: 'text-purple-500' },
  };

  const sectionKey = title.toLowerCase().includes('ميزات')
    ? 'features'
    : title.toLowerCase().includes('محتويات')
    ? 'packageContents'
    : title.toLowerCase().includes('استخدام')
    ? 'recommendedUse'
    : 'default';

  const style = sectionStyles[sectionKey];

  return (
    <section className="bg-white rounded-3xl shadow-lg p-4 sm:p-8 mb-8 fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {title}
        </h2>
        {categoryInfo && (
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${categoryInfo.color} text-white text-sm font-medium`}
          >
            <span>{categoryInfo.name}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {items.map((item, index) => (
          <div
            key={`${title}-${index}`}
            className={`flex items-start gap-3 p-4 ${style.bg} rounded-xl card-hover border border-gray-100`}
          >
            <div
              className={`w-3 h-3 ${style.color} rounded-full mt-2 flex-shrink-0 flex items-center justify-center text-xs font-bold`}
            >
              {style.icon}
            </div>
            <span className="text-gray-700 font-medium leading-relaxed text-sm sm:text-base">
              {item}
            </span>
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

// دالة لحساب نسبة الخصم
function calculateSavings(originalPrice, currentPrice) {
  if (!originalPrice || !currentPrice) return null;
  const savings = originalPrice - currentPrice;
  return savings > 0 ? savings : null;
}

// دالة لعرض تقييم النجوم
function StarRating({ rating, size = 'sm' }) {
  if (!rating) return null;

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className="flex items-center gap-1">
      <div className={`flex text-yellow-400 ${sizeClasses[size]}`}>
        {[...Array(5)].map((_, i) => (
          <span key={`star-${i}`}>{i < Math.floor(rating) ? '★' : '☆'}</span>
        ))}
      </div>
      <span className={`${sizeClasses[size]} text-gray-600 font-medium`}>
        ({rating})
      </span>
    </div>
  );
}

export default async function ProductDetailsPage({ params }) {
  const resolvedParams = await params;
  const productId = resolvedParams.id;

  const product = await fetchProductById(productId);

  if (!product) {
    notFound();
  }

  const categoryInfo = product.category
    ? await fetchCategoryInfo(product.category)
    : null;
  const specs = product.specs || {};
  const detailedSpecs = product.detailedSpecs || {};
  const savings = calculateSavings(product.originalPrice, product.price);

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
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .category-gradient {
          background: linear-gradient(135deg, var(--from-color), var(--to-color));
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <nav className="mb-8 fade-in">
          <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
            <Link href="/" className="hover:text-purple-600 transition-colors">
              الرئيسية
            </Link>
            <span>›</span>
            <Link
              href="/storage"
              className="hover:text-purple-600 transition-colors"
            >
              وسائط التخزين
            </Link>
            <span>›</span>
            {categoryInfo && (
              <>
                <span className="text-purple-600">{categoryInfo.name}</span>
                <span>›</span>
              </>
            )}
            <span className="text-gray-900 font-medium truncate">
              {product.name}
            </span>
          </div>
        </nav>

        <header className="bg-white rounded-3xl shadow-lg overflow-hidden mb-8 fade-in">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 p-4 sm:p-8">
            <div className="xl:col-span-2">
              <div className="sticky top-8">
                <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 mb-6 relative">
                  <img
                    src={product.image || product.gallery?.[0] || ''}
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
                    <span className="absolute top-4 left-4 bg-red-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                      خصم {product.discount}%
                    </span>
                  )}
                </div>

                {Array.isArray(product.gallery) &&
                  product.gallery.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-6">
                      {product.gallery.slice(0, 4).map((src, i) => (
                        <a
                          key={`gallery-thumb-${i}`}
                          href={`#img-${i}`}
                          className="bg-gray-50 rounded-xl p-2 card-hover relative"
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

                <aside className="bg-gray-50 rounded-2xl p-4 sm:p-6 hidden xl:block">
                  <h3 className="font-bold text-base sm:text-lg mb-4 text-gray-900">
                    معلومات المنتج
                  </h3>
                  <div className="space-y-3">
                    {categoryInfo && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm sm:text-base">
                          الفئة
                        </span>
                        <span
                          className={`px-2 sm:px-3 py-1 rounded-full text-white text-xs sm:text-sm font-bold bg-gradient-to-r ${categoryInfo.color}`}
                        >
                          {categoryInfo.name}
                        </span>
                      </div>
                    )}
                    {Object.entries(specs)
                      .slice(0, 3)
                      .map(([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between items-center"
                        >
                          <span className="text-gray-600 text-sm sm:text-base">
                            {key}
                          </span>
                          <span
                            className="font-medium text-gray-900 truncate max-w-32 sm:max-w-48 text-sm sm:text-base"
                            title={value}
                          >
                            {value || '—'}
                          </span>
                        </div>
                      ))}
                  </div>
                </aside>
              </div>
            </div>

            <div className="xl:col-span-3 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  {categoryInfo && (
                    <span
                      className={`px-2 sm:px-3 py-1 rounded-full text-white text-xs sm:text-sm font-medium bg-gradient-to-r ${categoryInfo.color}`}
                    >
                      {categoryInfo.name}
                    </span>
                  )}
                  <StarRating rating={product.rating} size="sm" />
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>

                <div className="flex items-center gap-4 mb-6 flex-wrap">
                  <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                    {formatPrice(product.price)} {product.currency || 'ج.م'}
                  </div>
                  {product.originalPrice && (
                    <div className="text-base sm:text-xl text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}{' '}
                      {product.currency || 'ج.م'}
                    </div>
                  )}
                  {savings && (
                    <div className="bg-green-100 text-green-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                      توفير {formatPrice(savings)} {product.currency || 'ج.م'}
                    </div>
                  )}
                </div>
              </div>

              {Object.keys(specs).length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {Object.entries(specs)
                    .slice(0, 4)
                    .map(([key, value], i) => {
                      const colors = [
                        'bg-blue-50 text-blue-700 border-blue-200',
                        'bg-green-50 text-green-700 border-green-200',
                        'bg-purple-50 text-purple-700 border-purple-200',
                        'bg-orange-50 text-orange-700 border-orange-200',
                      ];
                      return (
                        <div
                          key={`quick-spec-${i}`}
                          className={`p-3 sm:p-4 rounded-xl border ${colors[i]} card-hover`}
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
                      );
                    })}
                </div>
              )}

              <div className="flex gap-3 sm:gap-4 pt-4 flex-wrap">
                <button className="flex-1 min-w-40 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-2xl font-bold text-base sm:text-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  اطلب الآن
                </button>
                <button className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-purple-600 text-purple-600 rounded-2xl font-bold hover:bg-purple-50 transition-colors text-sm sm:text-base">
                  المفضلة ♡
                </button>
              </div>

              <aside className="bg-gray-50 rounded-2xl p-4 sm:p-6 xl:hidden">
                <h3 className="font-bold text-base sm:text-lg mb-4 text-gray-900">
                  معلومات المنتج
                </h3>
                <div className="space-y-3">
                  {categoryInfo && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm sm:text-base">
                        الفئة
                      </span>
                      <span
                        className={`px-2 sm:px-3 py-1 rounded-full text-white text-xs sm:text-sm font-bold bg-gradient-to-r ${categoryInfo.color}`}
                      >
                        {categoryInfo.name}
                      </span>
                    </div>
                  )}
                  {Object.entries(specs)
                    .slice(0, 3)
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between items-center"
                      >
                        <span className="text-gray-600 text-sm sm:text-base">
                          {key}
                        </span>
                        <span
                          className="font-medium text-gray-900 truncate max-w-32 sm:max-w-48 text-sm sm:text-base"
                          title={value}
                        >
                          {value || '—'}
                        </span>
                      </div>
                    ))}
                </div>
              </aside>
            </div>
          </div>
        </header>

        <TechnicalSpecs specs={specs} detailedSpecs={detailedSpecs} />

        {detailedSpecs &&
          Object.entries(detailedSpecs).map(([key, value]) => {
            if (Array.isArray(value) && value.length > 0) {
              return (
                <div key={`detailed-${key}`}>
                  {renderArrayAsHTML(value, key, categoryInfo)}
                </div>
              );
            }
            return null;
          })}

        <Suspense
          fallback={
            <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-8 mb-8 fade-in">
              <div className="text-center">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded-lg w-1/3 mx-auto mb-8"></div>
                  <div className="grid grid-cols-1 gap-6">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={`skeleton-${i}`}
                        className="bg-gray-50 rounded-2xl p-4 border border-gray-200"
                      >
                        <div className="bg-gray-200 h-40 rounded-xl mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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
      </div>

      {Array.isArray(product.gallery) &&
        product.gallery.map((src, i) => (
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

              {i < product.gallery.length - 1 && (
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
