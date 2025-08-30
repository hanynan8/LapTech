import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamicParams = true;

export default async function ProductDetailsPage({ params }) {
  // جلب المنتج حسب id
  async function fetchLaptopById(id) {
    const res = await fetch(
      `https://restaurant-back-end.vercel.app/api/data?collection=component&id=${id}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data[0] : data || null;
  }

  // جلب مجموعة منتجات حسب فئة (fallback)
  async function fetchByCategory(category, limit = 12) {
    try {
      const res = await fetch(
        `https://restaurant-back-end.vercel.app/api/data?collection=laptop&category=${encodeURIComponent(
          category
        )}&limit=${limit}`,
        { next: { revalidate: 60 } }
      );
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  const laptop = await fetchLaptopById(params.id);
  if (!laptop) notFound();

  // RELATED PRODUCTS
  const DESIRED_RELATED_COUNT = 12;
  let relatedProducts = [];

  if (
    Array.isArray(laptop?.details?.relatedProducts) &&
    laptop.details.relatedProducts.length > 0
  ) {
    const ids = laptop.details.relatedProducts.slice(0, DESIRED_RELATED_COUNT);
    const promises = ids.map(async (id) => {
      try {
        return await fetchLaptopById(id);
      } catch (e) {
        return null;
      }
    });
    relatedProducts = (await Promise.all(promises)).filter(Boolean);
  }

  if (relatedProducts.length < DESIRED_RELATED_COUNT && laptop.category) {
    const candidates = await fetchByCategory(
      laptop.category,
      DESIRED_RELATED_COUNT * 2
    );
    const filtered = Array.isArray(candidates)
      ? candidates.filter(
          (p) =>
            p &&
            Number(p.id) !== Number(laptop.id) &&
            !relatedProducts.find((r) => Number(r.id) === Number(p.id))
        )
      : [];

    for (const p of filtered) {
      if (relatedProducts.length >= DESIRED_RELATED_COUNT) break;
      relatedProducts.push(p);
    }
  }

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
                {key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase())}
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

  const specs = laptop.detailedSpecs || laptop.specs || {};
  const details = laptop.details || {};
  const isAvailable =
    details.isAvailable && (details.stock == null ? true : details.stock > 0);

  // تحديد مصفوفة الصور
  const images =
    Array.isArray(laptop.images) && laptop.images.length > 0
      ? laptop.images
      : Array.isArray(details.images) && details.images.length > 0
      ? details.images
      : laptop.image
      ? [laptop.image]
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

        /* move lightbox image styles to a class to avoid SSR/CSR mismatch */
        .lightbox-img {
          border-radius: 0;
          box-shadow: 0 12px 60px rgba(0,0,0,0.7);
          transition: transform 160ms ease;
          transform-origin: center center;
          cursor: grab;
          transform: scale(1) translate(0px, 0px);
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
            {laptop.name}
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            {details.description || laptop.category}
          </p>

          {laptop.rating && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center bg-purple-100 px-3 py-1 rounded-full">
                <span className="text-lg text-purple-700">⭐</span>
                <span className="font-semibold ml-1 text-purple-700">
                  {laptop.rating}
                </span>
              </div>
              <span className="text-gray-500 text-sm">(120 تقييم)</span>
            </div>
          )}

          <div className="mt-4">
            <div className="text-3xl font-extrabold text-purple-600">
              {formatPrice(laptop.price)} {laptop.currency || 'ج.م'}
            </div>
            {laptop.originalPrice && laptop.originalPrice > laptop.price && (
              <div className="text-lg text-gray-400 line-through">
                {formatPrice(laptop.originalPrice)} {laptop.currency || 'ج.م'}
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

                  <div
                    id="main-image-container"
                    className="w-full h-full flex items-center justify-center overflow-hidden"
                  >
                    <img
                      id="main-image"
                      src={images[0] || ''}
                      alt={laptop.name}
                      className="object-contain max-h-full max-w-full transition-transform duration-200 ease-in-out cursor-zoom-in"
                    />
                  </div>

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

                  {/* علامة الخصم */}
                  {laptop.discount && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                      خصم {laptop.discount}%
                    </div>
                  )}

                  {/* علامة التميز */}
                  {laptop.badge && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                      {laptop.badge}
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
                            alt={`${laptop.name} ${i + 1}`}
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
                        details.isAvailable && details.stock > 0
                          ? 'text-green-600'
                          : 'text-red-500'
                      }`}
                    >
                      {details.isAvailable && details.stock > 0
                        ? `متوفر (${details.stock})`
                        : 'غير متوفر'}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-gray-600 text-sm">SKU</span>
                    <span className="font-medium">
                      {details.sku || laptop.id || '—'}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-gray-600 text-sm">الفئة</span>
                    <span className="font-medium">
                      {laptop.category || '—'}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-gray-600 text-sm">العملة</span>
                    <span className="font-medium">
                      {laptop.currency || 'ج.م'}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-gray-600 text-sm">التقييم</span>
                    <span className="font-medium">
                      {laptop.rating ? `${laptop.rating} ⭐` : '—'}
                    </span>
                  </div>

                  {laptop.originalPrice && (
                    <div className="flex flex-col">
                      <span className="text-gray-600 text-sm">
                        السعر الأصلي
                      </span>
                      <span className="font-medium line-through text-red-500">
                        {formatPrice(laptop.originalPrice)}{' '}
                        {laptop.currency || 'ج.م'}
                      </span>
                    </div>
                  )}

                  {laptop.discount && (
                    <div className="flex flex-col">
                      <span className="text-gray-600 text-sm">نسبة الخصم</span>
                      <span className="font-medium text-green-600">
                        {laptop.discount}%
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
                    {laptop.name}
                  </h1>
                  <p className="text-lg text-gray-600 mb-2">
                    {details.description || laptop.category}
                  </p>
                  {laptop.rating && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center bg-purple-100 px-3 py-1 rounded-full">
                        <span className="text-lg text-purple-700">⭐</span>
                        <span className="font-semibold ml-1 text-purple-700">
                          {laptop.rating}
                        </span>
                      </div>
                      <span className="text-gray-500 text-sm">(120 تقييم)</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <div className="text-3xl md:text-4xl font-extrabold text-purple-600">
                    {formatPrice(laptop.price)} {laptop.currency || 'ج.م'}
                  </div>
                  {laptop.originalPrice &&
                    laptop.originalPrice > laptop.price && (
                      <div className="text-lg text-gray-400 line-through">
                        {formatPrice(laptop.originalPrice)}{' '}
                        {laptop.currency || 'ج.م'}
                      </div>
                    )}

                  {/* هنا ضفت زر "اطلب الآن" للشاشات الكبيرة */}
                  <div className="mt-4 flex items-center gap-3"></div>
                </div>
              </div>

              {/* المواصفات الأساسية */}
              {laptop.specs && (
                <div className="bg-gray-50 p-5 rounded-2xl">
                  <h3 className="font-bold text-lg mb-4 text-gray-800">
                    المواصفات الأساسية
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(laptop.specs).map(([key, value]) => (
                      <div
                        key={key}
                        className="bg-white p-3 rounded-xl shadow-xs border border-gray-100"
                      >
                        <div className="text-xs text-gray-500 mb-1">{key}</div>
                        <div className="font-medium text-sm">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

          {/* المواصفات الأساسية وأزرار الإجراء للجوال */}
          <div className="lg:hidden p-6">
            {/* المواصفات الأساسية للجوال */}
            {laptop.specs && (
              <div className="bg-gray-50 p-5 rounded-2xl mb-6">
                <h3 className="font-bold text-lg mb-4 text-gray-800">
                  المواصفات الأساسية
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(laptop.specs).map(([key, value]) => (
                    <div
                      key={key}
                      className="bg-white p-3 rounded-xl shadow-xs border border-gray-100"
                    >
                      <div className="text-xs text-gray-500 mb-1">{key}</div>
                      <div className="font-medium text-sm">{value}</div>
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
                <p>• توصيل سريع خلال 2-5 أيام عمل</p>
                <p>• شحن مجاني للطلبات فوق 5000 ج.م</p>
                <p>• إرجاع مجاني خلال 14 يوم</p>
              </div>
            </div>

            {/* أزرار الإجراء للجوال */}
            <div className="sticky-cta bg-white/90 p-4 flex gap-4 mt-4">
              <button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all transform hover:scale-[1.02] shadow-md">
                اطلب المنتج الآن
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
              {specs.generalInfo &&
                renderSpecCard(
                  'المعلومات العامة',
                  specs.generalInfo,
                  'bg-blue-50',
                  'text-blue-800'
                )}
              {specs.performance &&
                renderSpecCard(
                  'معلومات الأداء',
                  specs.performance,
                  'bg-red-50',
                  'text-red-800'
                )}
              {specs.architecture &&
                renderSpecCard(
                  'المعمارية والتقنية',
                  specs.architecture,
                  'bg-indigo-50',
                  'text-indigo-800'
                )}
              {specs.memory &&
                renderSpecCard(
                  'دعم الذاكرة',
                  specs.memory,
                  'bg-pink-50',
                  'text-pink-800'
                )}
              {specs.graphics &&
                renderSpecCard(
                  'الرسوميات المتكاملة',
                  specs.graphics,
                  'bg-teal-50',
                  'text-teal-800'
                )}
              {specs.connectivity &&
                renderSpecCard(
                  'خيارات الاتصال',
                  specs.connectivity,
                  'bg-cyan-50',
                  'text-cyan-800'
                )}
              {specs.displayOutputs &&
                renderSpecCard(
                  'مخرجات العرض',
                  specs.displayOutputs,
                  'bg-lime-50',
                  'text-lime-800'
                )}
              {specs.powerSpecs &&
                renderSpecCard(
                  'مواصفات الطاقة',
                  specs.powerSpecs,
                  'bg-amber-50',
                  'text-amber-800'
                )}
              {specs.cooling &&
                renderSpecCard(
                  'نظام التبريد',
                  specs.cooling,
                  'bg-sky-50',
                  'text-sky-800'
                )}
              {specs.physicalSpecs &&
                renderSpecCard(
                  'المواصفات الفيزيائية',
                  specs.physicalSpecs,
                  'bg-violet-50',
                  'text-violet-800'
                )}

              {/* معلومات العبوة */}
              {specs.packageInfo && (
                <div className="bg-green-50 p-6 rounded-2xl">
                  <h4 className="font-bold text-xl mb-4 text-green-700 flex items-center gap-2">
                    <div className="w-2 h-6 bg-green-500 rounded-full"></div>
                    معلومات العبوة
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(specs.packageInfo).map(([key, value]) => (
                      <div
                        key={key}
                        className="bg-white p-4 rounded-xl shadow-xs border border-gray-100"
                      >
                        <div className="text-sm font-medium text-gray-500 mb-1 capitalize">
                          {key
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, (str) => str.toUpperCase())}
                        </div>
                        <div className="font-semibold text-green-800">
                          {String(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* في العلبة */}
              {specs.inTheBox && Array.isArray(specs.inTheBox) && (
                <div className="bg-orange-50 p-6 rounded-2xl">
                  <h4 className="font-bold text-xl mb-4 text-orange-700 flex items-center gap-2">
                    <div className="w-2 h-6 bg-orange-500 rounded-full"></div>
                    محتويات العلبة
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {specs.inTheBox.map((item, i) => (
                      <div
                        key={i}
                        className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 flex items-center"
                      >
                        <div className="w-3 h-3 bg-orange-500 rounded-full ml-2"></div>
                        <span className="font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* معلومات الضمان */}
              {specs.warranty && (
                <div className="bg-yellow-50 p-6 rounded-2xl">
                  <h4 className="font-bold text-xl mb-4 text-yellow-700 flex items-center gap-2">
                    <div className="w-2 h-6 bg-yellow-500 rounded-full"></div>
                    معلومات الضمان
                  </h4>
                  <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100">
                    <p className="font-medium">{specs.warranty}</p>
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
                {relatedProducts.slice(0, 4).map((rp) => (
                  <Link
                    key={`related-${rp.id}`}
                    href={`/laptop/${rp.id}`}
                    className="block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 group border border-gray-100"
                  >
                    <div className="aspect-square bg-gray-100 rounded-xl mb-3 overflow-hidden">
                      <img
                        src={rp.image}
                        alt={rp.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="font-medium mb-1 text-sm line-clamp-2 h-10 overflow-hidden">
                      {rp.name}
                    </div>
                    <div className="text-purple-600 font-bold">
                      {formatPrice(rp.price)} {rp.currency || 'ج.م'}
                    </div>
                    {rp.rating && (
                      <div className="text-xs text-gray-500 mt-1 flex items-center">
                        ⭐ {rp.rating}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
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

          <img
            id="lightbox-image"
            src={images[0] || ''}
            alt={laptop.name}
            className="max-w-full max-h-full w-auto h-auto object-contain lightbox-img"
          />

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

          <button
            id="lb-close"
            className="absolute top-6 right-6 bg-white rounded-full w-10 h-10 flex items-center justify-center text-lg z-50 shadow-lg hover:bg-gray-100 transition"
          >
            ✕
          </button>
        </div>
      </div>

      {/* بيانات الصور */}
      <script
        id="gallery-images-data"
        type="application/json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(images) }}
      />

      {/* سكربت التحكم في المعرض (deferred init to avoid hydration mismatch) */}
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
        const lightboxInner = document.getElementById('custom-lightbox-inner');
        const lightboxImage = document.getElementById('lightbox-image');
        const lbClose = document.getElementById('lb-close');
        const lbPrev = document.getElementById('lb-prev');
        const lbNext = document.getElementById('lb-next');

        // gesture / transform state for lightbox
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
          // highlight thumbnail
          thumbButtons.forEach((btn) => btn.classList.remove('thumb-selected'));
          const selectedThumb = thumbButtons.find(b => Number(b.getAttribute('data-index')) === current);
          if (selectedThumb) selectedThumb.classList.add('thumb-selected');
          // update lightbox image too
          if (lightboxImage) {
            lightboxImage.src = images[current] || '';
            // reset transform when image changes
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

        if (prevBtn) {
          prevBtn.addEventListener('click', (e) => { e.preventDefault(); updateMain(current - 1); });
        }
        if (nextBtn) {
          nextBtn.addEventListener('click', (e) => { e.preventDefault(); updateMain(current + 1); });
        }

        // thumbnail clicks: open lightbox directly on that image
        thumbButtons.forEach((btn) => {
          const idx = Number(btn.getAttribute('data-index'));
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            showLightbox(idx);
          });
        });

        // click main image => open lightbox
        if (mainImage) {
          mainImage.addEventListener('click', () => showLightbox(current));
        }

        // lightbox controls
        if (lbClose) lbClose.addEventListener('click', closeLightbox);
        if (lightbox) lightbox.addEventListener('click', (e) => {
          if (e.target === lightbox || e.target.id === 'custom-lightbox-bg') closeLightbox();
        });
        if (lbPrev) lbPrev.addEventListener('click', (e) => { e.preventDefault(); updateMain(current - 1); });
        if (lbNext) lbNext.addEventListener('click', (e) => { e.preventDefault(); updateMain(current + 1); });

        // keyboard navigation when lightbox open
        document.addEventListener('keydown', (e) => {
          if (lightbox && lightbox.style.display === 'flex') {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') updateMain(current - 1);
            if (e.key === 'ArrowRight') updateMain(current + 1);
          }
        });

        // Hover zoom on main image (desktop)
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

        // Touch swipe support for main image container (mobile): swipe left/right to change image, tap to open lightbox
        let touchStartX = 0, touchStartY = 0, touchEndX = 0, touchEndY = 0;
        const swipeThreshold = 50; // px

        mainWrap && mainWrap.addEventListener('touchstart', function(e) {
          if (e.touches && e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
          }
        }, { passive: true });

        mainWrap && mainWrap.addEventListener('touchmove', function(e) {
          if (e.touches && e.touches.length === 1) {
            touchEndX = e.touches[0].clientX;
            touchEndY = e.touches[0].clientY;
          }
        }, { passive: true });

        mainWrap && mainWrap.addEventListener('touchend', function(e) {
          const dx = touchEndX - touchStartX;
          const dy = touchEndY - touchStartY;
          if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > swipeThreshold) {
            if (dx < 0) updateMain(current + 1);
            else updateMain(current - 1);
          } else {
            // if it's mostly a tap, open lightbox
            showLightbox(current);
          }
          touchStartX = touchStartY = touchEndX = touchEndY = 0;
        }, { passive: true });

        // Lightbox: pinch-to-zoom, pan, swipe to change images
        let isPanning = false, startPanX = 0, startPanY = 0, lastDist = 0;

        function applyTransform() {
          if (lightboxImage) {
            lightboxImage.style.transition = 'transform 0ms';
            lightboxImage.style.transform = 'scale(' + scale + ') translate(' + panX + 'px,' + panY + 'px)';
          }
        }

        // Touch handlers for lightbox image
        lightboxImage && lightboxImage.addEventListener('touchstart', function(e) {
          if (e.touches.length === 2) {
            // pinch start
            lastDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
          } else if (e.touches.length === 1) {
            isPanning = true;
            startPanX = e.touches[0].clientX;
            startPanY = e.touches[0].clientY;
          }
        }, { passive: false });

        lightboxImage && lightboxImage.addEventListener('touchmove', function(e) {
          if (e.touches.length === 2) {
            e.preventDefault();
            const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
            const delta = dist - lastDist;
            lastDist = dist;
            scale += delta * 0.005;
            scale = Math.max(1, Math.min(4, scale));
            applyTransform();
          } else if (e.touches.length === 1 && isPanning && scale > 1) {
            e.preventDefault();
            const dx = e.touches[0].clientX - startPanX;
            const dy = e.touches[0].clientY - startPanY;
            startPanX = e.touches[0].clientX;
            startPanY = e.touches[0].clientY;
            panX += dx;
            panY += dy;
            applyTransform();
          }
        }, { passive: false });

        lightboxImage && lightboxImage.addEventListener('touchend', function(e) {
          // if all touches ended, stop panning; if scale == 1, allow swipe to change images
          if ((e.touches && e.touches.length === 0) || !e.touches) {
            isPanning = false;
            // limit pan values a bit (simple clamping)
            panX = Math.max(-2000, Math.min(2000, panX));
            panY = Math.max(-2000, Math.min(2000, panY));
            applyTransform();
          }

          // detect quick swipe on lightbox to change images when not zoomed
          if (e.changedTouches && e.changedTouches.length === 1 && scale === 1) {
            const touch = e.changedTouches[0];
            const dx = touch.clientX - (touchStartX || touch.clientX);
            if (Math.abs(dx) > swipeThreshold) {
              if (dx < 0) updateMain(current + 1);
              else updateMain(current - 1);
            }
          }
        }, { passive: false });

        // mouse wheel zoom for desktop inside lightbox
        lightboxImage && lightboxImage.addEventListener('wheel', function(e) {
          if (e.deltaY) {
            e.preventDefault();
            const delta = -e.deltaY;
            scale += delta * 0.001;
            scale = Math.max(1, Math.min(4, scale));
            applyTransform();
          }
        }, { passive: false });

        // double click / double tap to toggle zoom
        let lastTap = 0;
        lightboxImage && lightboxImage.addEventListener('dblclick', function(e) {
          if (scale === 1) { scale = 2; } else { scale = 1; panX = 0; panY = 0; }
          applyTransform();
        });

        lightboxImage && lightboxImage.addEventListener('touchend', function(e) {
          const now = Date.now();
          if (now - lastTap < 300) {
            if (scale === 1) scale = 2; else { scale = 1; panX = 0; panY = 0; }
            applyTransform();
          }
          lastTap = now;
        });

        // initial highlight
        updateMain(0);
      } catch (errInit) {
        console.error('Gallery init error', errInit);
      }
    }

    // Defer initialization until load to avoid mutating DOM before React hydration
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
