
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamicParams = true;

export default async function ProductDetailsPage({ params }) {
  // ===== Helpers and data normalization =====
  async function fetchAllStorageDevices() {
    const res = await fetch(
      `https://restaurant-back-end.vercel.app/api/data?collection=storage-devices`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return { products: [] };
    const data = await res.json();

    if (!data) return { products: [] };

    // If API returns an array
    if (Array.isArray(data)) {
      // If first item is wrapper with .products
      if (data.length === 1 && Array.isArray(data[0].products)) {
        return { products: data[0].products };
      }
      // If looks like list of products (items have id or name)
      if (data.length > 0 && (data[0].id || data[0].name || data[0].title)) {
        return { products: data };
      }
      // Fallback: maybe object entries
      return { products: [] };
    }

    // If API returns an object
    if (typeof data === 'object') {
      if (Array.isArray(data.products)) return { products: data.products };
      if (Array.isArray(data.items)) return { products: data.items };
      // Single product object
      if (data.id || data.name || data.title) return { products: [data] };
    }

    return { products: [] };
  }

  function toNumber(val) {
    if (val == null || val === '') return NaN;
    if (typeof val === 'number') return val;
    const n = Number(String(val).replace(/[^\d.-]/g, ''));
    return isNaN(n) ? NaN : n;
  }

  function normalizeProduct(raw) {
    if (!raw) return null;
    const p = raw;

    const details = p.details || p.meta || {};
    const specs = p.specs || p.detailedSpecs || details.specs || details.detailedSpecs || {};

    // تحسين استخراج الصور من مصادر متعددة
    let imgs = [];

    // الصور الأساسية
    if (Array.isArray(p.images) && p.images.length > 0) {
      imgs = p.images;
    } else if (Array.isArray(p.gallery) && p.gallery.length > 0) {
      imgs = p.gallery;
    } else if (Array.isArray(details.images) && details.images.length > 0) {
      imgs = details.images;
    } else if (p.image) {
      imgs = Array.isArray(p.image) ? p.image : [p.image];
    } else if (details.image) {
      imgs = Array.isArray(details.image) ? details.image : [details.image];
    }

    // إضافة صور افتراضية إذا لم توجد صور
    if (imgs.length === 0) {
      // صور افتراضية بناءً على فئة المنتج
      const defaultImages = {
        ssd: [
          "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&h=400&fit=crop",
          "https://images.unsplash.com/photo-1604264849636-28f7f3219c1a?w=500&h=400&fit=crop",
          "https://images.unsplash.com/photo-1581318698502-4ad3e874d6c9?w=500&h=400&fit=crop"
        ],
        hdd: [
          "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&h=400&fit=crop",
          "https://images.unsplash.com/photo-1596526131083-e8a5c6fef5c0?w=500&h=400&fit=crop",
          "https://images.unsplash.com/photo-1626178790520-dd787cf60516?w=500&h=400&fit=crop"
        ],
        usb: [
          "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=500&h=400&fit=crop",
          "https://images.unsplash.com/photo-1581344898157-346ae2cdaa26?w=500&h=400&fit=crop",
          "https://images.unsplash.com/photo-1581344897883-4bfd4c2e6440?w=500&h=400&fit=crop"
        ],
        'sd-card': [
          "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=500&h=400&fit=crop",
          "https://images.unsplash.com/photo-1581344898157-346ae2cdaa26?w=500&h=400&fit=crop",
          "https://images.unsplash.com/photo-1581344897883-4bfd4c2e6440?w=500&h=400&fit=crop"
        ],
        external: [
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&h=400&fit=crop",
          "https://images.unsplash.com/photo-1599058917765-a780eda2e9e1?w=500&h=400&fit=crop",
          "https://images.unsplash.com/photo-1626178790520-dd787cf60516?w=500&h=400&fit=crop"
        ]
      };

      const category = typeof p.category === 'string' ? p.category : 
                      p.category && (p.category.id || p.category.name) ? 
                      p.category.id || p.category.name : '';

      imgs = defaultImages[category] || [
        "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&h=400&fit=crop",
        "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&h=400&fit=crop",
        "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=500&h=400&fit=crop"
      ];
    }

    // normalize category as string if possible
    const category =
      typeof p.category === 'string'
        ? p.category
        : p.category && (p.category.id || p.category.name)
        ? p.category.id || p.category.name
        : p.category;

    const priceNum = toNumber(p.price);
    const originalPriceNum =
      p.originalPrice != null
        ? toNumber(p.originalPrice)
        : p.oldPrice != null
        ? toNumber(p.oldPrice)
        : p.previousPrice != null
        ? toNumber(p.previousPrice)
        : undefined;

    // تعديل الصور: الصورة الرئيسية تكون p.image، والمعرض p.gallery
    let mainImage = p.image;
    let gallery = p.gallery || [];
    if (!mainImage && gallery.length > 0) {
      mainImage = gallery[0];
      gallery = gallery.slice(1);
    }
    if (!mainImage) {
      const defaultImages = {
        ssd: [
          "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&h=400&fit=crop",
          "https://images.unsplash.com/photo-1604264849636-28f7f3219c1a?w=500&h=400&fit=crop",
          "https://images.unsplash.com/photo-1581318698502-4ad3e874d6c9?w=500&h=400&fit=crop"
        ],
        hdd: [
          "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&h=400&fit=crop",
          "https://images.unsplash.com/photo-1596526131083-e8a5c6fef5c0?w=500&h=400&fit=crop",
          "https://images.unsplash.com/photo-1626178790520-dd787cf60516?w=500&h=400&fit=crop"
        ],
        usb: [
          "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=500&h=400&fit=crop",
          "https://images.unsplash.com/photo-1581344898157-346ae2cdaa26?w=500&h=400&fit=crop",
          "https://images.unsplash.com/photo-1581344897883-4bfd4c2e6440?w=500&h=400&fit=crop"
        ],
        'sd-card': [
          "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=500&h=400&fit=crop",
          "https://images.unsplash.com/photo-1581344898157-346ae2cdaa26?w=500&h=400&fit=crop",
          "https://images.unsplash.com/photo-1581344897883-4bfd4c2e6440?w=500&h=400&fit=crop"
        ],
        external: [
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&h=400&fit=crop",
          "https://images.unsplash.com/photo-1599058917765-a780eda2e9e1?w=500&h=400&fit=crop",
          "https://images.unsplash.com/photo-1626178790520-dd787cf60516?w=500&h=400&fit=crop"
        ]
      };
      const defaults = defaultImages[category] || [
        "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&h=400&fit=crop",
        "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&h=400&fit=crop",
        "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=500&h=400&fit=crop"
      ];
      mainImage = defaults[0];
      gallery = defaults.slice(1);
    }
    const allImages = [mainImage, ...gallery];

    return {
      ...p,
      id: p.id != null ? String(p.id) : undefined,
      name: p.name || p.title || p.label || 'بدون اسم',
      price: !isNaN(priceNum) ? priceNum : p.price,
      originalPrice: !isNaN(originalPriceNum) ? originalPriceNum : p.originalPrice,
      currency: p.currency || p.currencyCode || 'ج.م',
      rating: p.rating ?? p.score ?? undefined,
      details,
      specs,
      mainImage,
      gallery,
      allImages,
      category,
      badge: p.badge || p.label || p.highlight || undefined,
      discount: p.discount ?? p.salePercent ?? undefined,
    };
  }

  // fetch product by id - search inside fetched list (safe for multiple API shapes)
  async function fetchProductById(id) {
    try {
      const allData = await fetchAllStorageDevices();
      const arr = Array.isArray(allData.products) ? allData.products : [];
      const foundRaw = arr.find((p) => {
        if (!p) return false;
        const pid = p.id != null ? String(p.id) : undefined;
        const altSku = p.sku != null ? String(p.sku) : undefined;
        // match by id or sku
        return String(id) === pid || String(id) === altSku;
      });
      return normalizeProduct(foundRaw) || null;
    } catch (error) {
      console.error('Error fetching product by id:', error);
      return null;
    }
  }

  // fetch products by category for related items
  async function fetchProductsByCategory(category, limit = 12) {
    try {
      const allData = await fetchAllStorageDevices();
      const arr = Array.isArray(allData.products) ? allData.products : [];
      if (!category) return [];

      const catId = typeof category === 'string' ? category : String(category);

      const filtered = arr
        .filter((p) => {
          if (!p) return false;
          const pc =
            typeof p.category === 'string'
              ? p.category
              : p.category && (p.category.id || p.category.name)
              ? p.category.id || p.category.name
              : p.category;
          return pc && String(pc) === String(catId);
        })
        .slice(0, limit)
        .map(normalizeProduct)
        .filter(Boolean);

      return filtered;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  }

  // ===== Fetch product & related =====
  const product = await fetchProductById(params.id);
  if (!product) notFound();

  const DESIRED_RELATED_COUNT = 4;
  let relatedProducts = [];

  if (product.details?.relatedProducts && Array.isArray(product.details.relatedProducts) && product.details.relatedProducts.length > 0) {
    // try to fetch related by ids present in product.details.relatedProducts (if ids exist)
    const ids = product.details.relatedProducts.slice(0, DESIRED_RELATED_COUNT);
    const promises = ids.map(async (id) => {
      try {
        return await fetchProductById(id);
      } catch (e) {
        return null;
      }
    });
    relatedProducts = (await Promise.all(promises)).filter(Boolean);
  }

  if (relatedProducts.length < DESIRED_RELATED_COUNT && product.category) {
    const candidates = await fetchProductsByCategory(product.category, DESIRED_RELATED_COUNT * 2);
    const filtered =
      Array.isArray(candidates)
        ? candidates.filter((p) => p && String(p.id) !== String(product.id) && !relatedProducts.find((r) => String(r.id) === String(p.id)))
        : [];
    for (const p of filtered) {
      if (relatedProducts.length >= DESIRED_RELATED_COUNT) break;
      relatedProducts.push(p);
    }
  }

  // ===== Utility formatters =====
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
    if (num == null || num === '') return '—';
    try {
      const asNum = typeof num === 'string' ? Number(num.toString().replace(/[^\d.-]/g, '')) : num;
      if (!isNaN(asNum)) return new Intl.NumberFormat('ar-EG').format(asNum);
      return String(num);
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

  // ===== Product-derived vars used in JSX =====
  const specs = product.specs || {};
  const detailedSpecs = product.detailedSpecs || product.details?.detailedSpecs || {};
  const isAvailable = (() => {
    const stock = product.details?.stock ?? product.stock ?? null;
    const flag = product.details?.isAvailable ?? product.isAvailable ?? null;
    if (flag != null) return Boolean(flag);
    if (stock != null) return toNumber(stock) > 0;
    return true;
  })();

  const mainImageSrc = product.mainImage || '';
  const galleryImages = product.gallery || [];
  const allImages = product.allImages || [];

  // ===== JSX (kept design + scripts exactly as requested) =====
  return (
    <main
      className="min-h-screen bg-gradient-to-b from-slate-50 to-white"
      dir="rtl"
    >
      <style>{`...`}</style>

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
            {product.category}
          </p>

          {product.rating && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center bg-purple-100 px-3 py-1 rounded-full">
                <span className="text-lg text-purple-700">⭐</span>
                <span className="font-semibold ml-1 text-purple-700">
                  {product.rating}
                </span>
              </div>
              <span className="text-gray-500 text-sm">(120 تقييم)</span>
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
                  {allImages.length > 1 && (
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
                  )}

                  <div
                    id="main-image-container"
                    className="w-full h-full flex items-center justify-center overflow-hidden"
                  >
                    <img
                      id="main-image"
                      src={mainImageSrc}
                      alt={product.name}
                      className="object-contain max-h-full max-w-full transition-transform duration-200 ease-in-out cursor-zoom-in"
                    />
                  </div>

                  {allImages.length > 1 && (
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
                  )}

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
                {galleryImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 p-4">
                    {galleryImages.map((src, i) => (
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
                    <span className="font-semibold text-green-600">
                      {isAvailable ? 'متوفر' : 'غير متوفر'}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-gray-600 text-sm">SKU</span>
                    <span className="font-medium">
                      {product.id || '—'}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-gray-600 text-sm">الفئة</span>
                    <span className="font-medium">
                      {product.category || '—'}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-gray-600 text-sm">العملة</span>
                    <span className="font-medium">
                      {product.currency || 'ج.م'}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-gray-600 text-sm">التقييم</span>
                    <span className="font-medium">
                      {product.rating ? `${product.rating} ⭐` : '—'}
                    </span>
                  </div>

                  {product.originalPrice && (
                    <div className="flex flex-col">
                      <span className="text-gray-600 text-sm">
                        السعر الأصلي
                      </span>
                      <span className="font-medium line-through text-red-500">
                        {formatPrice(product.originalPrice)}{' '}
                        {product.currency || 'ج.م'}
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
                    {product.category}
                  </p>
                  {product.rating && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center bg-purple-100 px-3 py-1 rounded-full">
                        <span className="text-lg text-purple-700">⭐</span>
                        <span className="font-semibold ml-1 text-purple-700">
                          {product.rating}
                        </span>
                      </div>
                      <span className="text-gray-500 text-sm">(120 تقييم)</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <div className="text-3xl md:text-4xl font-extrabold text-purple-600">
                    {formatPrice(product.price)} {product.currency || 'ج.م'}
                  </div>
                  {product.originalPrice &&
                    product.originalPrice > product.price && (
                      <div className="text-lg text-gray-400 line-through">
                        {formatPrice(product.originalPrice)}{' '}
                        {product.currency || 'ج.م'}
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
                    {Object.entries(specs).map(([key, value]) => (
                      <div
                        key={key}
                        className="bg-white p-3 rounded-xl shadow-xs border border-gray-100"
                      >
                        <div className="text-xs text-gray-500 mb-1">{key}</div>
                        <div className="font-medium text-sm">{String(value)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* أزرار الإجراء للشاشات الكبيرة */}
              <div className="flex gap-4 mt-6">
                <button className="flex-1 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] shadow-md bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg">
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
          </div>

          {/* المواصفات الأساسية وأزرار الإجراء للجوال */}
          <div className="lg:hidden p-6">
            {/* المواصفات الأساسية للجوال */}
            {specs && Object.keys(specs).length > 0 && (
              <div className="bg-gray-50 p-5 rounded-2xl mb-6">
                <h3 className="font-bold text-lg mb-4 text-gray-800">
                  المواصفات الأساسية
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(specs).map(([key, value]) => (
                    <div
                      key={key}
                      className="bg-white p-3 rounded-xl shadow-xs border border-gray-100"
                    >
                      <div className="text-xs text-gray-500 mb-1">{key}</div>
                      <div className="font-medium text-sm">{String(value)}</div>
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
          {detailedSpecs && Object.keys(detailedSpecs).length > 0 && (
            <div className="p-6 md:p-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">
                المواصفات التفصيلية
              </h2>
              <div className="flex flex-col gap-6">
                {/* الأبعاد والوزن */}
                {(detailedSpecs.dimensions || detailedSpecs.weight) && (
                  <div className="bg-blue-50 p-6 rounded-2xl">
                    <h4 className="font-bold text-xl mb-4 text-blue-700 flex items-center gap-2">
                      <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
                      الأبعاد والوزن
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {detailedSpecs.dimensions && (
                        <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100">
                          <div className="text-sm font-medium text-gray-500 mb-1">الأبعاد</div>
                          <div className="font-semibold text-blue-800">{detailedSpecs.dimensions}</div>
                        </div>
                      )}
                      {detailedSpecs.weight && (
                        <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100">
                          <div className="text-sm font-medium text-gray-500 mb-1">الوزن</div>
                          <div className="font-semibold text-blue-800">{detailedSpecs.weight}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* درجات الحرارة */}
                {(detailedSpecs.operatingTemperature || detailedSpecs.storageTemperature) && (
                  <div className="bg-red-50 p-6 rounded-2xl">
                    <h4 className="font-bold text-xl mb-4 text-red-700 flex items-center gap-2">
                      <div className="w-2 h-6 bg-red-500 rounded-full"></div>
                      درجات الحرارة
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {detailedSpecs.operatingTemperature && (
                        <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100">
                          <div className="text-sm font-medium text-gray-500 mb-1">درجة حرارة التشغيل</div>
                          <div className="font-semibold text-red-800">{detailedSpecs.operatingTemperature}</div>
                        </div>
                      )}
                      {detailedSpecs.storageTemperature && (
                        <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100">
                          <div className="text-sm font-medium text-gray-500 mb-1">درجة حرارة التخزين</div>
                          <div className="font-semibold text-red-800">{detailedSpecs.storageTemperature}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* الميزات */}
                {detailedSpecs.features && Array.isArray(detailedSpecs.features) && (
                  <div className="bg-indigo-50 p-6 rounded-2xl">
                    <h4 className="font-bold text-xl mb-4 text-indigo-700 flex items-center gap-2">
                      <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
                      الميزات
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {detailedSpecs.features.map((feature, i) => (
                        <div
                          key={i}
                          className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 flex items-center"
                        >
                          <div className="w-3 h-3 bg-indigo-500 rounded-full ml-2"></div>
                          <span className="font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* محتويات العبوة */}
                {detailedSpecs.packageContents && Array.isArray(detailedSpecs.packageContents) && (
                  <div className="bg-orange-50 p-6 rounded-2xl">
                    <h4 className="font-bold text-xl mb-4 text-orange-700 flex items-center gap-2">
                      <div className="w-2 h-6 bg-orange-500 rounded-full"></div>
                      محتويات العلبة
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {detailedSpecs.packageContents.map((item, i) => (
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

                {/* الاستخدام الموصى به */}
                {detailedSpecs.recommendedUse && Array.isArray(detailedSpecs.recommendedUse) && (
                  <div className="bg-green-50 p-6 rounded-2xl">
                    <h4 className="font-bold text-xl mb-4 text-green-700 flex items-center gap-2">
                      <div className="w-2 h-6 bg-green-500 rounded-full"></div>
                      الاستخدام الموصى به
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {detailedSpecs.recommendedUse.map((use, i) => (
                        <div
                          key={i}
                          className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 flex items-center"
                        >
                          <div className="w-3 h-3 bg-green-500 rounded-full ml-2"></div>
                          <span className="font-medium">{use}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* مواصفات إضافية */}
                {Object.entries(detailedSpecs)
                  .filter(([key]) => ![
                    'dimensions', 'weight', 'operatingTemperature', 'storageTemperature', 
                    'features', 'packageContents', 'recommendedUse'
                  ].includes(key))
                  .length > 0 && (
                  <div className="bg-purple-50 p-6 rounded-2xl">
                    <h4 className="font-bold text-xl mb-4 text-purple-700 flex items-center gap-2">
                      <div className="w-2 h-6 bg-purple-500 rounded-full"></div>
                      مواصفات إضافية
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(detailedSpecs)
                        .filter(([key]) => ![
                          'dimensions', 'weight', 'operatingTemperature', 'storageTemperature', 
                          'features', 'packageContents', 'recommendedUse'
                        ].includes(key))
                        .map(([key, value]) => (
                        <div
                          key={key}
                          className="bg-white p-4 rounded-xl shadow-xs border border-gray-100"
                        >
                          <div className="text-sm font-medium text-gray-500 mb-1 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                          </div>
                          <div className="font-semibold text-purple-800">
                            {Array.isArray(value) ? value.join(', ') : String(value)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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
                    href={`/storage-devices/${rp.id}`}
                    className="block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 group border border-gray-100"
                  >
                    <div className="aspect-square bg-gray-100 rounded-xl mb-3 overflow-hidden">
                      <img
                        src={rp.mainImage}
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
      {allImages.length > 0 && (
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
            {allImages.length > 1 && (
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
            )}

            <img
              id="lightbox-image"
              src={allImages[0] || ''}
              alt={product.name}
              className="max-w-full max-h-full w-auto h-auto object-contain lightbox-img"
            />

            {allImages.length > 1 && (
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
            )}

            <button
              id="lb-close"
              className="absolute top-6 right-6 bg-white rounded-full w-10 h-10 flex items-center justify-center text-lg z-50 shadow-lg hover:bg-gray-100 transition"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* سكربت التحكم في المعرض */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
(function(){
  try {
    const images = ${JSON.stringify(allImages)};
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
          if (images.length === 0) return;
          current = (index + images.length) % images.length;
          if (mainImage) {
            mainImage.src = images[current] || '';
          }
          // highlight thumbnail
          thumbButtons.forEach((btn) => btn.classList.remove('thumb-selected'));
          if (current > 0) {
            const thumbIndex = current - 1;
            const selectedThumb = thumbButtons[thumbIndex];
            if (selectedThumb) selectedThumb.classList.add('thumb-selected');
          }
          // update lightbox image too
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

        // thumbnail clicks: open lightbox directly on that image
        thumbButtons.forEach((btn) => {
          const idx = Number(btn.getAttribute('data-index'));
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            showLightbox(idx + 1);
          });
        });

        // click main image => open lightbox
        if (mainImage && images.length > 0) {
          mainImage.addEventListener('click', () => showLightbox(0));
        }

        // lightbox controls
        if (lbClose) lbClose.addEventListener('click', closeLightbox);
        if (lightbox) lightbox.addEventListener('click', (e) => {
          if (e.target === lightbox || e.target.id === 'custom-lightbox-bg') closeLightbox();
        });
        if (lbPrev && images.length > 1) lbPrev.addEventListener('click', (e) => { e.preventDefault(); updateMain(current - 1); });
        if (lbNext && images.length > 1) lbNext.addEventListener('click', (e) => { e.preventDefault(); updateMain(current + 1); });

        // keyboard navigation when lightbox open
        document.addEventListener('keydown', (e) => {
          if (lightbox && lightbox.style.display === 'flex') {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft' && images.length > 1) updateMain(current - 1);
            if (e.key === 'ArrowRight' && images.length > 1) updateMain(current + 1);
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

        // Touch swipe support for main image container (mobile)
        let touchStartX = 0, touchStartY = 0, touchEndX = 0, touchEndY = 0;
        const swipeThreshold = 50;

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
          if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > swipeThreshold && images.length > 1) {
            if (dx < 0) updateMain(current + 1);
            else updateMain(current - 1);
          } else {
            showLightbox(current);
          }
          touchStartX = touchStartY = touchEndX = touchEndY = 0;
        }, { passive: true });

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