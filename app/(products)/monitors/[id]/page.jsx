import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamicParams = true;

export default async function ProductDetailsPage({ params }) {
  // جلب البيانات الكاملة من الـ API
  async function fetchAllData() {
    try {
      const res = await fetch(
        `https://restaurant-back-end.vercel.app/api/data?collection=monitors`,
        { next: { revalidate: 60 } }
      );
      if (!res.ok) return null;
      const data = await res.json();
      return Array.isArray(data) && data.length > 0 ? data[0] : data || null;
    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  }

  // جلب البيانات الكاملة
  const apiData = await fetchAllData();
  if (!apiData || !apiData.products) notFound();

  // العثور على المنتج المطلوب
  const product = apiData.products.find(p => p.id === params.id);
  if (!product) notFound();

  // جلب المنتجات ذات الصلة من نفس الفئة
  const relatedProducts = apiData.products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 12);

  function formatPrice(num) {
    if (num == null) return '—';
    try {
      return new Intl.NumberFormat('ar-EG').format(num);
    } catch {
      return String(num);
    }
  }

  function renderSpecCard(
    title,
    items,
    bgColor = 'bg-gray-50',
    textColor = 'text-gray-800'
  ) {
    if (!items || Object.keys(items).length === 0) return null;

    return (
      <div className={`p-6 rounded-2xl ${bgColor} shadow-sm`}>
        <h4 className="font-bold text-xl mb-4 text-purple-700 flex items-center gap-2">
          <div className="w-2 h-6 bg-purple-500 rounded-full"></div>
          {title}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(items).map(([key, value]) => (
            <div
              key={key}
              className="bg-white p-4 rounded-xl shadow-xs border border-gray-100"
            >
              <div className="text-sm font-medium text-gray-500 mb-1 capitalize">
                {key === 'size' ? 'الحجم' :
                 key === 'resolution' ? 'الدقة' :
                 key === 'refreshRate' ? 'معدل التحديث' :
                 key === 'panel' ? 'نوع الشاشة' :
                 key === 'responseTime' ? 'زمن الاستجابة' :
                 key === 'contrastRatio' ? 'نسبة التباين' :
                 key === 'brightness' ? 'السطوع' :
                 key === 'viewingAngle' ? 'زاوية الرؤية' :
                 key === 'colorGamut' ? 'نطاق الألوان' :
                 key === 'colorDepth' ? 'عمق الألوان' :
                 key === 'hdr' ? 'HDR' :
                 key === 'adaptiveSync' ? 'التزامن التكيفي' :
                 key === 'mountVESA' ? 'تركيب VESA' :
                 key === 'coating' ? 'الطلاء' :
                 key === 'warranty' ? 'الضمان' :
                 key === 'powerConsumption' ? 'استهلاك الطاقة' :
                 key === 'weight' ? 'الوزن' :
                 key === 'curvature' ? 'انحناء' :
                 key === 'panelType' ? 'نوع اللوحة' :
                 key === 'backlight' ? 'الإضاءة الخلفية' :
                 key === 'energyClass' ? 'فئة الطاقة' :
                 key}
              </div>
              <div className={`font-semibold ${textColor}`}>
                {Array.isArray(value) ? (
                  <ul className="space-y-1">
                    {value.map((item, i) => (
                      <li
                        key={i}
                        className="text-sm bg-gray-50 px-3 py-1.5 rounded-lg"
                      >
                        {typeof item === 'object'
                          ? JSON.stringify(item)
                          : String(item)}
                      </li>
                    ))}
                  </ul>
                ) : typeof value === 'object' && value !== null ? (
                  <div className="space-y-2">
                    {Object.entries(value).map(([subKey, subValue]) => (
                      <div
                        key={subKey}
                        className="text-sm bg-gray-50 px-3 py-1.5 rounded-lg"
                      >
                        <span className="font-medium">{subKey}:</span>{' '}
                        {String(subValue)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span>{String(value)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderListCard(
    title,
    items,
    bgColor = 'bg-gray-50',
    textColor = 'text-gray-800'
  ) {
    if (!items || !Array.isArray(items) || items.length === 0) return null;

    return (
      <div className={`p-6 rounded-2xl ${bgColor} shadow-sm`}>
        <h4 className="font-bold text-xl mb-4 text-purple-700 flex items-center gap-2">
          <div className="w-2 h-6 bg-purple-500 rounded-full"></div>
          {title}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 flex items-center"
            >
              <div className="w-3 h-3 bg-purple-500 rounded-full ml-2"></div>
              <span className="font-medium">{item}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
    <main
      className="min-h-screen bg-gradient-to-b from-slate-50 to-white"
      dir="rtl"
    >
      <style>{`
        .thumb-selected { 
          outline: 3px solid rgba(99,102,241,0.15); 
          transform: scale(1.03); 
          border-radius: 12px;
        }
        
        .gallery-arrow {
          background: rgba(255,255,255,0.95);
          width: 48px;
          height: 48px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(0,0,0,0.18);
          border: 1px solid rgba(0,0,0,0.06);
          font-weight: 700;
          color: rgba(34,34,34,0.95);
          cursor: pointer;
          user-select: none;
          transition: all 0.2s ease;
          z-index: 20;
        }
        
        .thumbnail-btn { 
          border: none; 
          background: transparent; 
          padding: 0; 
          cursor: pointer; 
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s ease;
        }
        
        .thumbnail-btn:hover {
          transform: translateY(-2px);
        }
        
        .sticky-cta {
          position: sticky;
          bottom: 24px;
          z-index: 30;
          box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }
        
        .specs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .lightbox-img {
          border-radius: 0;
          box-shadow: 0 12px 60px rgba(0,0,0,0.7);
          transition: transform 160ms ease;
          transform-origin: center center;
          cursor: grab;
          transform: scale(1) translate(0px, 0px);
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

        @media (max-width: 768px) {
          .specs-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* شريط التنقل العلوي */}
      <div className="bg-white shadow-sm py-4 px-6 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link
            href="/"
            className="text-purple-600 font-bold text-lg flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            العودة إلى المتجر
          </Link>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
            <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 py-8">
        {/* اسم المنتج - في الأعلى للجوال */}
        <div className="lg:hidden mb-6 bg-white p-6 rounded-2xl shadow-sm">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            {product.name}
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            {product.brand || product.category}
          </p>

          {/* حالة التوفر */}
          <div className="mb-4">
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
                    className="w-4 h-4"
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
                    className="w-4 h-4"
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
                    className="w-4 h-4"
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
          </div>

          {product.rating && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center bg-purple-100 px-3 py-1 rounded-full">
                <span className="text-lg text-purple-700">⭐</span>
                <span className="font-semibold ml-1 text-purple-700">
                  {product.rating}
                </span>
              </div>
            </div>
          )}

          <div className="mt-4">
            <div className="text-3xl font-extrabold text-purple-600">
              {formatPrice(product.price)} {product.currency || 'ج.م'}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-lg text-gray-400 line-through">
                {formatPrice(product.originalPrice)} {product.currency || 'ج.م'}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 p-6 md:p-8">
            {/* معرض الصور */}
            <div className="order-2 lg:order-1 flex flex-col gap-6">
              <div className="relative bg-gray-100 rounded-2xl overflow-hidden shadow-inner">
                {/* الصورة الرئيسية */}
                <div
                  id="main-image-wrap"
                  className="relative w-full h-80 md:h-96 flex items-center justify-center bg-gray-50 rounded-2xl"
                >
                  {images.length > 1 && (
                    <>
                      <button
                        id="prev-btn"
                        aria-label="السابق"
                        className="absolute left-4 gallery-arrow"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden
                        >
                          <path
                            d="M15 18L9 12L15 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>

                      <button
                        id="next-btn"
                        aria-label="التالي"
                        className="absolute right-4 gallery-arrow"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden
                        >
                          <path
                            d="M9 6L15 12L9 18"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </>
                  )}

                  <div
                    id="main-image-container"
                    className="w-full h-full flex items-center justify-center overflow-hidden"
                  >
                    <img
                      id="main-image"
                      src={images[0] || ''}
                      alt={product.name}
                      className="object-contain max-h-full max-w-full transition-transform duration-200 ease-in-out cursor-zoom-in"
                    />
                  </div>

                  {/* علامة الخصم */}
                  {product.discount && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                      خصم {product.discount}%
                    </div>
                  )}

                  {/* علامة التميز */}
                  {product.badge && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                      {product.badge}
                    </div>
                  )}
                </div>

                {/* الصور المصغرة */}
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-3 p-4">
                    {images.map((src, i) => (
                      <div
                        key={`thumbnail-${i}`}
                        className="thumbnail-container h-20 overflow-hidden rounded-xl bg-gray-50 shadow-sm"
                      >
                        <button
                          className={
                            'thumbnail-btn w-full h-full' +
                            (i === 0 ? ' thumb-selected' : '')
                          }
                          data-index={i}
                          title={`عرض الصورة ${i + 1}`}
                        >
                          <img
                            src={src}
                            alt={`${product.name} ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* معلومات سريعة */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-lg mb-4 text-gray-800">
                  معلومات سريعة
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-gray-600 text-sm">الحالة</span>
                    <span
                      className={`font-semibold ${
                        isAvailable
                          ? 'text-green-600'
                          : product.stockLevel === 'Limited'
                          ? 'text-yellow-600'
                          : 'text-red-500'
                      }`}
                    >
                      {isAvailable
                        ? 'متوفر'
                        : product.stockLevel === 'Limited'
                        ? 'كمية محدودة'
                        : 'غير متوفر'}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-gray-600 text-sm">SKU</span>
                    <span className="font-medium">
                      {product.sku || product.id || '—'}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-gray-600 text-sm">الفئة</span>
                    <span className="font-medium">
                      {product.category || '—'}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-gray-600 text-sm">الماركة</span>
                    <span className="font-medium">
                      {product.brand || '—'}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-gray-600 text-sm">الموديل</span>
                    <span className="font-medium">
                      {product.model || '—'}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-gray-600 text-sm">سنة الإصدار</span>
                    <span className="font-medium">
                      {product.modelYear || '—'}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-gray-600 text-sm">التقييم</span>
                    <span className="font-medium">
                      {product.rating ? `${product.rating} ⭐` : '—'}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-gray-600 text-sm">نقاط الأداء</span>
                    <span className="font-medium">
                      {product.performanceScore
                        ? `${product.performanceScore}/100`
                        : '—'}
                    </span>
                  </div>

                  {product.originalPrice && (
                    <div className="flex flex-col">
                      <span className="text-gray-600 text-sm">السعر الأصلي</span>
                      <span className="font-medium line-through text-red-500">
                        {formatPrice(product.originalPrice)} {product.currency || 'ج.م'}
                      </span>
                    </div>
                  )}

                  {product.discount && (
                    <div className="flex flex-col">
                      <span className="text-gray-600 text-sm">نسبة الخصم</span>
                      <span className="font-medium text-green-600">
                        {product.discount}%
                      </span>
                    </div>
                  )}

                  {specs.warranty && (
                    <div className="flex flex-col">
                      <span className="text-gray-600 text-sm">الضمان</span>
                      <span className="font-medium">
                        {specs.warranty}
                      </span>
                    </div>
                  )}

                  {specs.weight && (
                    <div className="flex flex-col">
                      <span className="text-gray-600 text-sm">الوزن</span>
                      <span className="font-medium">
                        {specs.weight}
                      </span>
                    </div>
                  )}

                  {product.energyClass && (
                    <div className="flex flex-col">
                      <span className="text-gray-600 text-sm">فئة الطاقة</span>
                      <span className="font-medium">
                        {product.energyClass}
                      </span>
                    </div>
                  )}

                  {product.stockLevel && (
                    <div className="flex flex-col">
                      <span className="text-gray-600 text-sm">مستوى المخزون</span>
                      <span className="font-medium">
                        {product.stockLevel === 'In Stock' ? 'متوفر' :
                         product.stockLevel === 'Limited' ? 'كمية محدودة' :
                         product.stockLevel === 'Good' ? 'متوفر بكثرة' :
                         product.stockLevel === 'Medium' ? 'متوسط' : product.stockLevel}
                      </span>
                    </div>
                  )}

                  {product.seller?.name && (
                    <div className="flex flex-col">
                      <span className="text-gray-600 text-sm">البائع</span>
                      <span className="font-medium">
                        {product.seller.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* معلومات المنتج - للشاشات الكبيرة فقط */}
            <div className="order-1 lg:order-2 hidden lg:flex flex-col gap-6">
              {/* العنوان والسعر */}
              <div className="flex flex-col gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                    {product.name}
                  </h1>
                  <p className="text-lg text-gray-600 mb-2">
                    {product.brand || product.category}
                  </p>

                  {/* حالة التوفر للشاشات الكبيرة */}
                  <div className="mb-2">
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
                            className="w-4 h-4"
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
                            className="w-4 h-4"
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
                            className="w-4 h-4"
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
                  </div>

                  {product.rating && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center bg-purple-100 px-3 py-1 rounded-full">
                        <span className="text-lg text-purple-700">⭐</span>
                        <span className="font-semibold ml-1 text-purple-700">
                          {product.rating}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <div className="text-3xl md:text-4xl font-extrabold text-purple-600">
                    {formatPrice(product.price)} {product.currency || 'ج.م'}
                  </div>
                  {product.originalPrice &&
                    product.originalPrice > product.price && (
                      <div className="text-lg text-gray-400 line-through">
                        {formatPrice(product.originalPrice)} {product.currency || 'ج.م'}
                      </div>
                    )}
                </div>
              </div>

              {/* المواصفات الأساسية */}
              {specs && Object.keys(specs).length > 0 && (
                <div className="bg-gray-50 p-5 rounded-2xl">
                  <h3 className="font-bold text-lg mb-4 text-gray-800">
                    المواصفات الأساسية
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {Object.entries(specs).slice(0, 8).map(([key, value]) => (
                      <div
                        key={key}
                        className="bg-white p-3 rounded-xl shadow-xs border border-gray-100 flex justify-between"
                      >
                        <div className="text-sm text-gray-500">
                          {key === 'size' ? 'الحجم' :
                           key === 'resolution' ? 'الدقة' :
                           key === 'refreshRate' ? 'معدل التحديث' :
                           key === 'panel' ? 'نوع الشاشة' :
                           key === 'responseTime' ? 'زمن الاستجابة' :
                           key === 'brightness' ? 'السطوع' :
                           key === 'contrastRatio' ? 'نسبة التباين' :
                           key === 'colorGamut' ? 'نطاق الألوان' :
                           key}
                        </div>
                        <div className="font-medium text-sm text-right">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* أزرار الإجراء للشاشات الكبيرة */}
              <div className="flex gap-4 mt-6">
                <button
                  className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] shadow-md ${
                    isAvailable
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!isAvailable}
                >
                  {isAvailable ? 'اطلب المنتج الآن' : 'غير متوفر'}
                </button>
                <button className="flex items-center justify-center w-14 border-2 border-purple-600 text-purple-600 rounded-xl font-medium hover:bg-purple-50 transition">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* الوصف التفصيلي والمعلومات الإضافية للجوال */}
          <div className="lg:hidden p-6">
            {/* الوصف التفصيلي */}
            {product.detailedDescription && (
              <div className="bg-blue-50 p-5 rounded-2xl mb-6">
                <h3 className="font-bold text-lg mb-3 text-blue-800 flex items-center gap-2">
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
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  وصف المنتج
                </h3>
                <p className="text-blue-700 leading-relaxed">
                  {product.detailedDescription}
                </p>
              </div>
            )}

            {/* المواصفات الأساسية للجوال */}
            {specs && Object.keys(specs).length > 0 && (
              <div className="bg-gray-50 p-5 rounded-2xl mb-6">
                <h3 className="font-bold text-lg mb-4 text-gray-800">
                  المواصفات الأساسية
                </h3>
                <div className="space-y-3">
                  {Object.entries(specs).map(([key, value]) => (
                    <div
                      key={key}
                      className="bg-white p-3 rounded-xl shadow-xs border border-gray-100 flex justify-between"
                    >
                      <div className="text-sm text-gray-500">
                        {key === 'size' ? 'الحجم' :
                         key === 'resolution' ? 'الدقة' :
                         key === 'refreshRate' ? 'معدل التحديث' :
                         key === 'panel' ? 'نوع الشاشة' :
                         key === 'responseTime' ? 'زمن الاستجابة' :
                         key === 'brightness' ? 'السطوع' :
                         key === 'contrastRatio' ? 'نسبة التباين' :
                         key === 'colorGamut' ? 'نطاق الألوان' :
                         key === 'colorDepth' ? 'عمق الألوان' :
                         key === 'hdr' ? 'HDR' :
                         key === 'adaptiveSync' ? 'التزامن التكيفي' :
                         key === 'viewingAngle' ? 'زاوية الرؤية' :
                         key === 'mountVESA' ? 'تركيب VESA' :
                         key === 'coating' ? 'الطلاء' :
                         key === 'warranty' ? 'الضمان' :
                         key === 'powerConsumption' ? 'استهلاك الطاقة' :
                         key === 'weight' ? 'الوزن' :
                         key === 'curvature' ? 'الانحناء' :
                         key === 'panelType' ? 'نوع اللوحة' :
                         key}
                      </div>
                      <div className="font-medium text-sm text-right max-w-[60%]">
                        {typeof value === 'object' && value !== null ? 
                          (Array.isArray(value) ? value.join(', ') : JSON.stringify(value)) : 
                          String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* معلومات الشحن والتوصيل للجوال */}
            <div className="bg-green-50 p-5 rounded-2xl border border-green-200 mb-6">
              <h3 className="font-bold text-lg mb-3 text-green-800 flex items-center gap-2">
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
              <div className="text-green-700">
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

            {/* أزرار الإجراء للجوال */}
            <div className="sticky-cta bg-white/90 p-4 flex gap-4 mt-4">
              <button
                className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] shadow-md ${
                  isAvailable
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!isAvailable}
              >
                {isAvailable ? 'اطلب المنتج الآن' : 'غير متوفر'}
              </button>
              <button className="flex items-center justify-center w-14 border-2 border-purple-600 text-purple-600 rounded-xl font-medium hover:bg-purple-50 transition">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* المواصفات التفصيلية */}
          <div className="p-6 md:p-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              المواصفات التفصيلية
            </h2>
            <div className="flex flex-col gap-6">
              {/* المميزات */}
              {features && features.length > 0 && 
                renderListCard(
                  'المميزات',
                  features,
                  'bg-blue-50',
                  'text-blue-800'
                )}

              {/* جميع المواصفات */}
              {specs && Object.keys(specs).length > 0 &&
                renderSpecCard(
                  'المواصفات التقنية',
                  specs,
                  'bg-purple-50',
                  'text-purple-800'
                )}

              {/* معايير الأداء */}
              {benchmarks && Object.keys(benchmarks).length > 0 &&
                renderSpecCard(
                  'معايير الأداء',
                  benchmarks,
                  'bg-red-50',
                  'text-red-800'
                )}

              {/* المنافذ والاتصالات */}
              {specs.ports && specs.ports.length > 0 &&
                renderListCard(
                  'المنافذ والاتصالات',
                  specs.ports,
                  'bg-cyan-50',
                  'text-cyan-800'
                )}

              {/* الملحقات المرفقة */}
              {includedAccessories && includedAccessories.length > 0 &&
                renderListCard(
                  'الملحقات المرفقة',
                  includedAccessories,
                  'bg-orange-50',
                  'text-orange-800'
                )}

              {/* الشهادات والمعايير */}
              {certifications && certifications.length > 0 &&
                renderListCard(
                  'الشهادات والمعايير',
                  certifications,
                  'bg-green-50',
                  'text-green-800'
                )}

              {/* الاستخدام الموصى به */}
              {recommendedUse && recommendedUse.length > 0 &&
                renderListCard(
                  'الاستخدام الموصى به',
                  recommendedUse,
                  'bg-yellow-50',
                  'text-yellow-800'
                )}

              {/* الأبعاد المادية */}
              {specs.dimensions_mm && (
                <div className="bg-violet-50 p-6 rounded-2xl">
                  <h4 className="font-bold text-xl mb-4 text-violet-700 flex items-center gap-2">
                    <div className="w-2 h-6 bg-violet-500 rounded-full"></div>
                    الأبعاد المادية
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {specs.dimensions_mm.height && (
                      <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100">
                        <div className="text-sm font-medium text-gray-500 mb-1">
                          الارتفاع
                        </div>
                        <div className="font-semibold text-violet-800">
                          {specs.dimensions_mm.height} مم
                        </div>
                      </div>
                    )}
                    {specs.dimensions_mm.width && (
                      <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100">
                        <div className="text-sm font-medium text-gray-500 mb-1">
                          العرض
                        </div>
                        <div className="font-semibold text-violet-800">
                          {specs.dimensions_mm.width} مم
                        </div>
                      </div>
                    )}
                    {specs.dimensions_mm.depth && (
                      <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100">
                        <div className="text-sm font-medium text-gray-500 mb-1">
                          العمق
                        </div>
                        <div className="font-semibold text-violet-800">
                          {specs.dimensions_mm.depth} مم
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* معلومات إضافية */}
              <div className="bg-indigo-50 p-6 rounded-2xl">
                <h4 className="font-bold text-xl mb-4 text-indigo-700 flex items-center gap-2">
                  <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
                  معلومات إضافية
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.brand && (
                    <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100">
                      <div className="text-sm font-medium text-gray-500 mb-1">الماركة</div>
                      <div className="font-semibold text-indigo-800">{product.brand}</div>
                    </div>
                  )}

                  {product.model && (
                    <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100">
                      <div className="text-sm font-medium text-gray-500 mb-1">الموديل</div>
                      <div className="font-semibold text-indigo-800">{product.model}</div>
                    </div>
                  )}

                  {product.modelYear && (
                    <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100">
                      <div className="text-sm font-medium text-gray-500 mb-1">سنة الإصدار</div>
                      <div className="font-semibold text-indigo-800">{product.modelYear}</div>
                    </div>
                  )}

                  {product.sku && (
                    <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100">
                      <div className="text-sm font-medium text-gray-500 mb-1">رقم المنتج</div>
                      <div className="font-semibold text-indigo-800">{product.sku}</div>
                    </div>
                  )}

                  {specs.releaseDate && (
                    <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100">
                      <div className="text-sm font-medium text-gray-500 mb-1">تاريخ الإصدار</div>
                      <div className="font-semibold text-indigo-800">
                        {new Date(specs.releaseDate).toLocaleDateString('ar-EG')}
                      </div>
                    </div>
                  )}

                  {product.energyClass && (
                    <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100">
                      <div className="text-sm font-medium text-gray-500 mb-1">فئة الطاقة</div>
                      <div className="font-semibold text-indigo-800">{product.energyClass}</div>
                    </div>
                  )}

                  {product.stockLevel && (
                    <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100">
                      <div className="text-sm font-medium text-gray-500 mb-1">مستوى المخزون</div>
                      <div className="font-semibold text-indigo-800">
                        {product.stockLevel === 'In Stock' ? 'متوفر' :
                         product.stockLevel === 'Limited' ? 'كمية محدودة' :
                         product.stockLevel === 'Good' ? 'متوفر بكثرة' :
                         product.stockLevel === 'Medium' ? 'متوسط' : product.stockLevel}
                      </div>
                    </div>
                  )}

                  {product.seller?.name && (
                    <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100">
                      <div className="text-sm font-medium text-gray-500 mb-1">البائع</div>
                      <div className="font-semibold text-indigo-800">{product.seller.name}</div>
                    </div>
                  )}

                  {specs.usbC && (
                    <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100">
                      <div className="text-sm font-medium text-gray-500 mb-1">USB-C</div>
                      <div className="font-semibold text-indigo-800">
                        {specs.usbC.supportsDisplay ? 'يدعم العرض' : 'لا يدعم العرض'}
                        {specs.usbC.pdWatts && ` - شحن ${specs.usbC.pdWatts}W`}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* الوصف التفصيلي */}
              {product.detailedDescription && (
                <div className="bg-blue-50 p-6 rounded-2xl">
                  <h4 className="font-bold text-xl mb-4 text-blue-700 flex items-center gap-2">
                    <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
                    وصف المنتج
                  </h4>
                  <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100">
                    <p className="text-blue-800 leading-relaxed">
                      {product.detailedDescription}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* منتجات ذات صلة */}
          {relatedProducts.length > 0 && (
            <div className="p-6 md:p-8 border-t border-gray-200">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">
                منتجات ذات صلة
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {relatedProducts.slice(0, 8).map((rp) => (
                  <Link
                    key={`related-${rp.id}`}
                    href={`/monitors/${rp.id}`}
                    className="block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 group border border-gray-100"
                  >
                    <div className="aspect-square bg-gray-100 rounded-xl mb-3 overflow-hidden">
                      <img
                        src={rp.image || rp.detailedImages?.[0] || ''}
                        alt={rp.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="font-medium mb-1 text-sm line-clamp-2 h-10 overflow-hidden">
                      {rp.name}
                    </div>
                    <div className="text-purple-600 font-bold text-sm">
                      {formatPrice(rp.price)} {rp.currency || 'ج.م'}
                    </div>
                    {rp.rating && (
                      <div className="text-xs text-gray-500 mt-1 flex items-center">
                        ⭐ {rp.rating}
                      </div>
                    )}
                    {rp.badge && (
                      <div className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full mt-1 inline-block">
                        {rp.badge}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
              {relatedProducts.length > 8 && (
                <div className="text-center mt-6">
                  <Link 
                    href={`/?category=${product.category}`}
                    className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                  >
                    عرض المزيد من منتجات {product.category}
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      <div
        id="custom-lightbox"
        style={{ display: 'none' }}
        className="fixed inset-0 z-50 flex items-center justify-center p-0"
      >
        <div
          id="custom-lightbox-bg"
          className="absolute inset-0 bg-black/95"
        ></div>
        <div
          id="custom-lightbox-inner"
          className="relative w-full h-full flex items-center justify-center"
        >
          {images.length > 1 && (
            <>
              <button
                id="lb-prev"
                className="absolute left-6 top-1/2 transform -translate-y-1/2 gallery-arrow z-50"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <button
                id="lb-next"
                className="absolute right-6 top-1/2 transform -translate-y-1/2 gallery-arrow z-50"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M9 6L15 12L9 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </>
          )}

          <img
            id="lightbox-image"
            src={images[0] || ''}
            alt={product.name}
            className="max-w-full max-h-full w-auto h-auto object-contain lightbox-img"
          />

          <button
            id="lb-close"
            className="absolute top-6 right-6 bg-white rounded-full w-10 h-10 flex items-center justify-center text-lg z-50 shadow-lg hover:bg-gray-100 transition"
          >
            ✕
          </button>
        </div>
      </div>

      {/* سكربت التحكم في المعرض */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
(function(){
  try {
    const images = ${JSON.stringify(images || [])};
    if (!images || images.length === 0) return;

    function initGallery() {
      try {
        let current = 0;
        const mainImage = document.getElementById('main-image');
        const mainWrap = document.getElementById('main-image-container');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const thumbButtons = Array.from(document.querySelectorAll('.thumbnail-btn'));
        const lightbox = document.getElementById('custom-lightbox');
        const lightboxImage = document.getElementById('lightbox-image');
        const lbClose = document.getElementById('lb-close');
        const lbPrev = document.getElementById('lb-prev');
        const lbNext = document.getElementById('lb-next');

        let panX = 0, panY = 0, scale = 1;

        function resetTransform() {
          panX = 0; panY = 0; scale = 1;
          if (lightboxImage) {
            lightboxImage.style.transition = 'transform 160ms ease';
            lightboxImage.style.transform = 'scale(1) translate(0px,0px)';
          }
        }

        function updateMain(index) {
          current = (index + images.length) % images.length;
          if (mainImage) {
            mainImage.src = images[current] || '';
          }
          thumbButtons.forEach((btn) => btn.classList.remove('thumb-selected'));
          const selectedThumb = thumbButtons.find(b => Number(b.getAttribute('data-index')) === current);
          if (selectedThumb) selectedThumb.classList.add('thumb-selected');
          if (lightboxImage) {
            lightboxImage.src = images[current] || '';
            resetTransform();
          }
        }

        function showLightbox(index) {
          updateMain(index);
          if (lightbox) lightbox.style.display = 'flex';
          document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
          if (lightbox) lightbox.style.display = 'none';
          document.body.style.overflow = '';
          resetTransform();
        }

        if (prevBtn && images.length > 1) {
          prevBtn.addEventListener('click', (e) => { e.preventDefault(); updateMain(current - 1); });
        }
        if (nextBtn && images.length > 1) {
          nextBtn.addEventListener('click', (e) => { e.preventDefault(); updateMain(current + 1); });
        }

        thumbButtons.forEach((btn) => {
          const idx = Number(btn.getAttribute('data-index'));
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            showLightbox(idx);
          });
        });

        if (mainImage) {
          mainImage.addEventListener('click', () => showLightbox(current));
        }

        if (lbClose) lbClose.addEventListener('click', closeLightbox);
        if (lightbox) lightbox.addEventListener('click', (e) => {
          if (e.target === lightbox || e.target.id === 'custom-lightbox-bg') closeLightbox();
        });
        if (lbPrev && images.length > 1) lbPrev.addEventListener('click', (e) => { e.preventDefault(); updateMain(current - 1); });
        if (lbNext && images.length > 1) lbNext.addEventListener('click', (e) => { e.preventDefault(); updateMain(current + 1); });

        document.addEventListener('keydown', (e) => {
          if (lightbox && lightbox.style.display === 'flex') {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft' && images.length > 1) updateMain(current - 1);
            if (e.key === 'ArrowRight' && images.length > 1) updateMain(current + 1);
          }
        });

        if (mainWrap && mainImage) {
          let isHover = false;
          mainWrap.addEventListener('mouseenter', () => {
            isHover = true;
            mainImage.style.transition = 'transform 120ms ease';
            mainImage.style.transform = 'scale(1.06)';
          });
          mainWrap.addEventListener('mousemove', (ev) => {
            if (!isHover) return;
            const rect = mainImage.getBoundingClientRect();
            const x = ((ev.clientX - rect.left) / rect.width) * 100;
            const y = ((ev.clientY - rect.top) / rect.height) * 100;
            mainImage.style.transformOrigin = x + '% ' + y + '%';
            mainImage.style.transform = 'scale(1.06)';
          });
          mainWrap.addEventListener('mouseleave', () => {
            isHover = false;
            mainImage.style.transform = 'scale(1)';
            mainImage.style.transformOrigin = 'center center';
          });
        }

        updateMain(0);
      } catch (errInit) {
        console.error('Gallery init error', errInit);
      }
    }

    if (document.readyState === 'complete') {
      setTimeout(initGallery, 50);
    } else {
      window.addEventListener('load', function onLoad() {
        window.removeEventListener('load', onLoad);
        setTimeout(initGallery, 50);
      });
    }

  } catch (e) {
    console.error('Gallery script error', e);
  }
})();
          `,
        }}
      />
    </main>
  );
}