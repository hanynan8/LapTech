// app/pc-builds/page.js - Server Component
import PCBuildsClient from './_pcClient';


// بنية metadata محسنة ومفصلة
export const metadata = {
  title: 'تجميعات الكمبيوتر',
  description: 'اكتشف مجموعة واسعة من تجميعات الكمبيوتر: للألعاب، للعمل، والإنتاجية — مواصفات مفصلة، مقارنة أسعار، ونصائح اختيار التجميعة المناسبة حسب الاستخدام والميزانية.',
  keywords: [
    'تجميعات كمبيوتر',
    'PC Build',
    'Gaming PC',
    'كمبيوتر ألعاب',
    'محطة عمل',
    'Intel',
    'AMD',
    'RTX',
    'تجميعة مخصصة',
    'معالج',
    'كارت رسوميات',
    'ذاكرة RAM',
    'SSD',
    'مزود طاقة',
    'لوحة أم',
    'تبريد',
    'كيسة كمبيوتر'
  ],
  openGraph: {
    url: 'https://lap-tech-five.vercel.app/pc-builds',
    title: 'تجميعات الكمبيوتر - أفضل الأسعار والمواصفات',
    description: 'تصفح أفضل تجميعات الكمبيوتر: مواصفات تفصيلية ومراجعات لمساعدتك في اختيار التجميعة الأمثل لاحتياجاتك.',
    type: 'website',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=1200',
        width: 1200,
        height: 630,
        alt: 'تجميعات الكمبيوتر المتخصصة',
      }
    ],
    site_name: 'متجر التقنية',
    locale: 'ar_EG',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'تجميعات الكمبيوتر - أفضل الأسعار والمواصفات',
    description: 'اكتشف أفضل تجميعات الكمبيوتر للألعاب والعمل بأسعار منافسة',
    images: ['https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=1200'],
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
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  category: 'technology',
  classification: 'business',
  referrer: 'origin-when-cross-origin',
  authors: [{ name: 'فريق متجر التقنية' }],
  creator: 'متجر التقنية',
  publisher: 'متجر التقنية',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://lap-tech-five.vercel.app'),
  alternates: {
    canonical: '/pc-builds',
    languages: {
      'ar-EG': '/pc-builds',
      'en-US': '/en/pc-builds',
    },
  },
  other: {
    'price-range': '5000-200000 EGP',
    'availability': 'in-stock',
    'shipping-area': 'Egypt',
    'warranty': '1-3 years',
  },
};





const PCBuildsPage = async () => {
  let data = null;
  let error = null;

  try {
    // جلب البيانات من الخادم
    const response = await fetch(
      'https://restaurant-back-end.vercel.app/api/data?collection=pc-build',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        cache: 'no-cache',
        next: {
          revalidate: 60, // إعادة التحقق كل دقيقة
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `خطأ في الشبكة: ${response.status} - ${response.statusText}`
      );
    }

    const apiData = await response.json();

    // معالجة البيانات
    let pcBuildsData = null;
    if (Array.isArray(apiData) && apiData.length > 0) {
      pcBuildsData = apiData[0];
    } else if (apiData && typeof apiData === 'object') {
      pcBuildsData = apiData;
    } else {
      throw new Error('لم يتم العثور على بيانات تجميعات الكمبيوتر في الاستجابة');
    }

    // تجهيز البيانات مع قيم افتراضية شاملة
    data = {
      _id: pcBuildsData._id || 'pc-builds-page',
      pageTitle: pcBuildsData.pageTitle || 'تجميعات الكمبيوتر',
      pageSubtitle:
        pcBuildsData.pageSubtitle ||
        'اختر من تجميعاتنا المتخصصة للألعاب، العمل، والاستخدام المنزلي بأفضل الأسعار والمواصفات',
      categories: pcBuildsData.categories || [
        {
          id: 'all',
          name: 'جميع التجميعات',
          icon: 'cpu',
          color: 'from-purple-600 to-blue-600',
        },
        {
          id: 'gaming',
          name: 'تجميعات الألعاب',
          icon: 'gamepad2',
          color: 'from-red-500 to-pink-600',
        },
        {
          id: 'workstation',
          name: 'محطات العمل',
          icon: 'monitor',
          color: 'from-blue-600 to-indigo-600',
        },
        {
          id: 'budget',
          name: 'اقتصادية',
          icon: 'zap',
          color: 'from-green-500 to-blue-600',
        },
        {
          id: 'premium',
          name: 'متميزة',
          icon: 'star',
          color: 'from-yellow-500 to-orange-600',
        },
        {
          id: 'office',
          name: 'مكتبية',
          icon: 'hard-drive',
          color: 'from-gray-500 to-gray-700',
        },
      ],
      filters: pcBuildsData.filters || {
        sortOptions: [
          { value: 'name', label: 'الاسم' },
          { value: 'price-low', label: 'السعر: من الأقل للأعلى' },
          { value: 'price-high', label: 'السعر: من الأعلى للأقل' },
          { value: 'rating', label: 'التقييم' },
          { value: 'performance', label: 'الأداء' },
          { value: 'power-efficiency', label: 'كفاءة الطاقة' },
          { value: 'popularity', label: 'الأكثر شعبية' },
        ],
        priceRanges: [
          { min: 0, max: 10000, label: 'أقل من 10,000 جنيه' },
          { min: 10000, max: 25000, label: '10,000 - 25,000 جنيه' },
          { min: 25000, max: 50000, label: '25,000 - 50,000 جنيه' },
          { min: 50000, max: 100000, label: '50,000 - 100,000 جنيه' },
          { min: 100000, max: Infinity, label: 'أكثر من 100,000 جنيه' },
        ],
      },
      products: pcBuildsData.products || [],
      metadata: {
        totalProducts: pcBuildsData.products?.length || 0,
        lastUpdated: new Date().toISOString(),
        version: '2.0',
        categories: pcBuildsData.categories?.length || 0,
      },
    };

    // إضافة معلومات إضافية للتجميعات
    if (data.products && data.products.length > 0) {
      data.products = data.products.map((product, index) => ({
        ...product,
        id: product.id || `build-${index}`,
        image: product.image || 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400',
        rating: product.rating || (4.0 + Math.random() * 1.0),
        specs: {
          processor: 'Intel Core i5',
          graphics: 'RTX 4060',
          memory: '16GB DDR4',
          storage: '500GB SSD',
          motherboard: 'B550',
          psu: '650W Gold',
          case: 'ATX Mid Tower',
          cooling: 'Stock Cooler',
          ...product.specs,
        },
        components: product.components || [
          'معالج Intel Core i5',
          'كارت رسوميات RTX 4060',
          'ذاكرة 16GB DDR4',
          'قرص SSD 500GB',
          'لوحة أم B550',
          'مزود طاقة 650W',
        ],
        features: product.features || [
          'أداء متميز للألعاب',
          'تبريد فعال',
          'ضمان شامل',
          'دعم فني مجاني',
        ],
        benchmarks: product.benchmarks || {
          '3DMark': '12000',
          'Cinebench': '15000',
          'PassMark': '18000',
        },
        powerConsumption: product.powerConsumption || '400W',
        warranty: product.warranty || 'ضمان سنتين',
        availability: product.availability || 'متوفر',
        assemblyTime: product.assemblyTime || '2-3 أيام عمل',
        category: product.category || 'gaming',
        performanceScore: product.performanceScore || Math.floor(Math.random() * 40) + 60,
        ...product,
      }));
    }

  } catch (err) {
    console.error('خطأ في جلب البيانات:', err);
    error = `فشل في تحميل البيانات: ${err.message}`;
  }

  return <PCBuildsClient initialData={data} error={error} />;
};

export default PCBuildsPage;
