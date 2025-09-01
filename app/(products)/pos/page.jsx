import POSClient from './_posClient';

// Metadata للصفحة
export const metadata = {
  title: 'أنظمة نقاط البيع - POS Systems',
  description: 'اكتشف أفضل أنظمة نقاط البيع والحاسبات المكتبية لنشاطك التجاري. أنظمة متطورة وموثوقة لإدارة المبيعات والمخزون',
  keywords: ['نقاط البيع', 'POS', 'حاسبات مكتبية', 'أنظمة الدفع', 'إدارة المبيعات', 'كاشير'],
  openGraph: {
    title: 'أنظمة نقاط البيع - POS Systems',
    description: 'اكتشف أفضل أنظمة نقاط البيع والحاسبات المكتبية لنشاطك التجاري',
    type: 'website',
    locale: 'ar_EG',
    images: [
      {
        url: 'https://lap-tech-five.vercel.app/images/pos-systems-og.jpg',
        width: 1200,
        height: 630,
        alt: 'أنظمة نقاط البيع',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'أنظمة نقاط البيع - POS Systems',
    description: 'اكتشف أفضل أنظمة نقاط البيع والحاسبات المكتبية لنشاطك التجاري',
    images: ['https://lap-tech-five.vercel.app/images/pos-systems-twitter.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/pos',
    languages: {
      'ar-EG': '/pos',
      'en-US': '/en/pos',
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

// دالة جلب البيانات من الخادم
async function fetchPOSData() {
  try {
    const response = await fetch(
      'https://restaurant-back-end.vercel.app/api/data?collection=pos',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        next: {
          revalidate: 86400, // تحديث كل 24 ساعة (ISR يومي)
          tags: ['pos-data'], // للتحكم في إعادة التحديث (optional)
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `خطأ في الشبكة: ${response.status} - ${response.statusText}`
      );
    }

    const apiData = await response.json();

    // أثناء التطوير فقط اطبع اللوجز
    if (process.env.NODE_ENV !== 'production') {
    }

    // البحث عن بيانات نقاط البيع
    let posData = null;

    if (Array.isArray(apiData) && apiData.length > 0) {
      posData = apiData[0];
    } else if (apiData && typeof apiData === 'object') {
      posData = apiData;
    } else {
      throw new Error('لم يتم العثور على بيانات نقاط البيع في الاستجابة');
    }

    // التأكد من وجود البيانات الأساسية مع قيم افتراضية شاملة
    const processedData = {
      _id: posData._id || 'pos-page',
      pageTitle: posData.pageTitle || 'أنظمة نقاط البيع',
      pageSubtitle:
        posData.pageSubtitle ||
        'اكتشف أفضل أنظمة نقاط البيع والحاسبات المكتبية لنشاطك التجاري',
      categories: posData.categories || [
        {
          id: 'all',
          name: 'جميع المنتجات',
          icon: 'cpu',
          color: 'from-purple-600 to-blue-600',
        },
        {
          id: 'desktop-pos',
          name: 'أنظمة مكتبية',
          icon: 'monitor',
          color: 'from-blue-600 to-cyan-600',
        },
        {
          id: 'tablet-pos',
          name: 'أنظمة لوحية',
          icon: 'monitor-speaker',
          color: 'from-green-600 to-emerald-600',
        },
        {
          id: 'mobile-pos',
          name: 'أنظمة محمولة',
          icon: 'smartphone',
          color: 'from-orange-600 to-red-600',
        },
        {
          id: 'accessories',
          name: 'الاكسسوارات',
          icon: 'gamepad2',
          color: 'from-purple-600 to-pink-600',
        },
      ],
      filters: posData.filters || {
        sortOptions: [
          { value: 'name', label: 'الاسم' },
          { value: 'price-low', label: 'السعر: من الأقل للأعلى' },
          { value: 'price-high', label: 'السعر: من الأعلى للأقل' },
          { value: 'rating', label: 'التقييم' },
          { value: 'performance', label: 'الأداء' },
          { value: 'newest', label: 'الأحدث' },
          { value: 'popular', label: 'الأكثر شهرة' },
        ],
        priceRanges: [
          { min: 0, max: 10000, label: 'أقل من 10,000 جنيه' },
          { min: 10000, max: 25000, label: '10,000 - 25,000 جنيه' },
          { min: 25000, max: 50000, label: '25,000 - 50,000 جنيه' },
          { min: 50000, max: 100000, label: '50,000 - 100,000 جنيه' },
          { min: 100000, max: Infinity, label: 'أكثر من 100,000 جنيه' },
        ],
        brands: ['HP', 'Dell', 'Lenovo', 'ASUS', 'Acer', 'MSI', 'Samsung', 'LG'],
        features: [
          'شاشة لمس',
          'واي فاي',
          'بلوتوث',
          'كاميرا',
          'طابعة حرارية',
          'قارئ باركود',
        ],
      },
      products: posData.products || [],
      totalCount: posData.products?.length || 0,
      lastUpdated: new Date().toISOString(),
    };

    return { data: processedData, error: null };
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('خطأ في جلب البيانات:', err);
    }
    return {
      data: null,
      error: `فشل في تحميل البيانات: ${err.message}`,
    };
  }
}

// دالة إنشاء JSON-LD للـ SEO
function generateJSONLD(data) {
  if (!data) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: data.pageTitle,
    description: data.pageSubtitle,
    url: 'https://lap-tech-five.vercel.app/pos',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: data.totalCount,
      itemListElement: (data.products || []).slice(0, 10).map((product, index) => ({
        '@type': 'Product',
        position: index + 1,
        name: product.name,
        image: product.image,
        description: product.description || product.name,
        offers: {
          '@type': 'Offer',
          price: product.price ?? undefined,
          priceCurrency: product.currency || 'EGP',
          availability:
            product.inStock || product.availability === 'متوفر'
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
        },
        aggregateRating: product.rating
          ? {
              '@type': 'AggregateRating',
              ratingValue: product.rating,
              ratingCount: product.reviewCount || 1,
              bestRating: 5,
              worstRating: 1,
            }
          : undefined,
        brand: {
          '@type': 'Brand',
          name: product.brand || 'POS Systems',
        },
      })),
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'الرئيسية',
          item: 'https://lap-tech-five.vercel.app',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'أنظمة نقاط البيع',
          item: 'https://lap-tech-five.vercel.app/pos',
        },
      ],
    },
  };
}

// المكون الرئيسي للخادم
export default async function POSPage() {
  // جلب البيانات من الخادم
  const { data, error } = await fetchPOSData();

  // إنشاء JSON-LD للـ SEO
  const jsonLd = generateJSONLD(data);

  return (
    <>
      {/* JSON-LD للـ SEO */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {/* مكون العميل */}
      <POSClient initialData={data} error={error} />
    </>
  );
}
