// Server Code: app/accessories/page.tsx (No 'use client' - This is a Server Component)
import AccessoriesClient from './_accessClient'; // Adjust path as needed

// Metadata for SEO
export const metadata = {
  title: 'الاكسسوارات التقنية',
  description: 'اكتشف أحدث الاكسسوارات التقنية: سماعات، فارات، لوحات مفاتيح، شواحن وكابلات، وإكسسوارات الألعاب — جودة عالية وأسعار مناسبة وتوصيل سريع.',
  keywords: [
    'اكسسوارات', 'سماعات', 'فأرة', 'ماوس', 'لوحة مفاتيح', 'كابل', 'شاحن', 'اكسسوارات الألعاب', 'gamepad',
    'ملحقات', 'اكسسوارات لابتوب', 'اكسسوارات هاتف', 'اكسسوار', 'تسوق اكسسوارات', 'توصيل سريع', 'عروض الاكسسوارات',
    'تقنية', 'اللابتوبات', 'ملحقات الكمبيوتر', 'RGB', 'بلوتوث', 'USB', 'ملحقات صوت', 'عالم الاكسسوارات التقنية', 'اكتشف أحدث الاكسسوارات التقنية لتعزيز تجربتك الرقمية'
  ],
  openGraph: {
    url: 'https://lap-tech-five.vercel.app/accessories',
    title: 'الاكسسوارات التقنية',
    description: 'تسوق أحدث الاكسسوارات التقنية — سماعات، فارات، لوحات مفاتيح، كابلات وشواحن، وإكسسوارات الألعاب.',
    type: 'website',
  },
};


// دالة تحويل بيانات API (Moved to server)
const transformApiData = (apiData) => {
  console.log('Raw API Data:', apiData);

  // الوصول الصحيح لبيانات الاكسسوارات
  let accessoriesData = null;
  let allProducts = [];

  // البحث عن بيانات الاكسسوارات في هيكل API
  if (apiData && apiData.accessories && Array.isArray(apiData.accessories)) {
    accessoriesData = apiData.accessories[0]; // أخذ العنصر الأول
    console.log('Accessories Data Found:', accessoriesData);

    if (
      accessoriesData &&
      accessoriesData.products &&
      Array.isArray(accessoriesData.products)
    ) {
      allProducts = accessoriesData.products;
    }
  }

  console.log('Products found:', allProducts.length, allProducts);

  // في حالة عدم وجود منتجات، استخدم بيانات تجريبية
  if (allProducts.length === 0) {
    console.log('No products found, using fallback data');
    allProducts = getFallbackProducts();
  }

  // استخدام الفئات من البيانات أو فئات افتراضية
  let categories = [];
  if (
    accessoriesData &&
    accessoriesData.categories &&
    Array.isArray(accessoriesData.categories)
  ) {
    categories = accessoriesData.categories;
  } else {
    categories = getDefaultCategories();
  }

  // تحويل المنتجات للهيكل المطلوب
  const transformedProducts = allProducts.map((product, index) => {
    return {
      id: product.id || index + 1,
      name: product.name || 'منتج غير محدد',
      category: product.category || 'headphones',
      price:
        typeof product.price === 'number'
          ? product.price
          : parseInt(product.price?.toString().replace(/[^\d]/g, '') || '0'),
      currency: product.currency || 'ر.س',
      originalPrice: product.originalPrice
        ? typeof product.originalPrice === 'number'
          ? product.originalPrice
          : parseInt(product.originalPrice.toString().replace(/[^\d]/g, ''))
        : null,
      discount: product.discount
        ? parseInt(product.discount.toString().replace('%', ''))
        : null,
      rating: parseFloat(product.rating) || 4.0,
      image:
        product.image ||
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
      badge: product.badge || null,
      specs: product.specs || {
        connectivity: 'متاح',
        battery: 'جيدة',
        features: 'متنوعة',
      },
    };
  });

  console.log('Transformed Products:', transformedProducts);

  return {
    pageTitle: accessoriesData?.pageTitle || 'عالم الاكسسوارات التقنية',
    pageSubtitle:
      accessoriesData?.pageSubtitle ||
      'اكتشف أحدث الاكسسوارات التقنية لتعزيز تجربتك الرقمية',
    categories: categories,
    filters: accessoriesData?.filters || {
      sortOptions: [
        { value: 'name', label: 'الاسم' },
        { value: 'price-low', label: 'السعر: من الأقل للأعلى' },
        { value: 'price-high', label: 'السعر: من الأعلى للأقل' },
        { value: 'rating', label: 'التقييم' },
      ],
    },
    products: transformedProducts,
  };
};

// فئات افتراضية
const getDefaultCategories = () => [
  {
    id: 'all',
    name: 'جميع الاكسسوارات',
    icon: 'smartphone',
    color: 'from-purple-600 to-blue-600',
  },
  {
    id: 'headphones',
    name: 'سماعات',
    icon: 'headphones',
    color: 'from-blue-600 to-cyan-600',
  },
  {
    id: 'mouse',
    name: 'فأرة الكمبيوتر',
    icon: 'mouse',
    color: 'from-green-600 to-emerald-600',
  },
  {
    id: 'keyboard',
    name: 'لوحة المفاتيح',
    icon: 'keyboard',
    color: 'from-red-600 to-pink-600',
  },
  {
    id: 'cables',
    name: 'كابلات وشواحن',
    icon: 'cable',
    color: 'from-orange-600 to-yellow-600',
  },
  {
    id: 'gaming',
    name: 'اكسسوارات الألعاب',
    icon: 'gamepad2',
    color: 'from-pink-600 to-rose-600',
  },
];

// منتجات تجريبية في حالة فشل التحميل
const getFallbackProducts = () => [
  {
    id: 1,
    name: 'سماعة بلوتوث لاسلكية',
    category: 'headphones',
    price: 299,
    currency: 'ر.س',
    rating: 4.5,
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
    badge: 'جديد',
    specs: {
      connectivity: 'Bluetooth 5.0',
      battery: '20 ساعة',
      features: 'إلغاء الضوضاء',
    },
  },
  {
    id: 2,
    name: 'فأرة ألعاب احترافية',
    category: 'mouse',
    price: 199,
    currency: 'ر.س',
    rating: 4.7,
    image:
      'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=300&fit=crop',
    specs: {
      dpi: '16000 DPI',
      buttons: '8 أزرار',
      connectivity: 'سلكي/لاسلكي',
    },
  },
  {
    id: 3,
    name: 'لوحة مفاتيح ميكانيكية',
    category: 'keyboard',
    price: 399,
    currency: 'ر.س',
    rating: 4.6,
    image:
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop',
    specs: {
      switches: 'Cherry MX Blue',
      backlight: 'RGB',
      connectivity: 'USB',
    },
  },
];

export default async function AccessoriesPage() {
  let data = null;
  let error = null;

  try {
    const response = await fetch(
      'https://restaurant-back-end.vercel.app/api/data',{
        next: { revalidate: 86000 } // 24 ساعة تقريباً
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const apiData = await response.json();
    data = transformApiData(apiData);
  } catch (err) {
    console.error('Error loading data on server:', err);
    error = err.message;
    // استخدام البيانات الافتراضية في حال الخطأ
    data = {
      pageTitle: 'عالم الاكسسوارات التقنية',
      pageSubtitle: 'اكتشف أحدث الاكسسوارات التقنية لتعزيز تجربتك الرقمية',
      categories: getDefaultCategories(),
      filters: {
        sortOptions: [
          { value: 'name', label: 'الاسم' },
          { value: 'price-low', label: 'السعر: من الأقل للأعلى' },
          { value: 'price-high', label: 'السعر: من الأعلى للأقل' },
          { value: 'rating', label: 'التقييم' },
        ],
      },
      products: getFallbackProducts(),
    };
  }

  return <AccessoriesClient initialData={data} error={error} />;
}