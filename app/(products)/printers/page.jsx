// app/printers/page.js (Server Component)
import PrintersClient from './_printersClient';


// تصدير metadata للصفحة
export const metadata = {
  title: 'الطابعات',
  description: 'اكتشف مجموعة متنوعة من الطابعات: طابعات ليزر، نافثة للحبر، وحرارية — أسعار، مواصفات، ونصائح لاختيار الطابعة المثالية للمكتب أو المنزل.',
  keywords: [
    'طابعات', 'طابعة ليزر', 'طابعة نافثة للحبر', 'طابعة حرارية', 'طابعات مكتبية', 'طابعات تجارية', 'طابعة صور', 'طابعة ملصقات', 'أجهزة طباعة', 'ورق طباعة', 'حبر طابعات', 'ماسح ضوئي', 'طابعة متعددة الوظائف', 'طابعة إيصالات'
  ],
  openGraph: {
    url: 'https://lap-tech-five.vercel.app/printers',
    title: 'الطابعات',
    description: 'تصفح أحدث أنواع الطابعات: مواصفات تفصيلية وأسعار تنافسية لمساعدتك في اختيار الأنسب.',
    type: 'website'
  }
};




async function fetchPrintersData() {
  try {
    const response = await fetch(
      'https://restaurant-back-end.vercel.app/api/data?collection=printers',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        cache: 'no-store', // للحصول على أحدث البيانات
        next: { revalidate: 60 }, // إعادة التحقق كل 60 ثانية
      }
    );

    if (!response.ok) {
      throw new Error(`خطأ في الشبكة: ${response.status} - ${response.statusText}`);
    }

    const apiData = await response.json();

    // البحث عن بيانات الطابعات
    let printerData = null;

    if (Array.isArray(apiData) && apiData.length > 0) {
      printerData = apiData[0];
    } else if (apiData && typeof apiData === 'object') {
      printerData = apiData;
    } else {
      throw new Error('لم يتم العثور على بيانات الطابعات في الاستجابة');
    }

    // معالجة البيانات مع قيم افتراضية شاملة
    const processedData = {
      _id: printerData._id || 'printers-page',
      pageTitle: printerData.pageTitle || 'الطابعات المتقدمة',
      pageSubtitle: printerData.pageSubtitle || 'اكتشف أفضل الطابعات المكتبية والتجارية لجميع احتياجاتك مع ضمان الجودة والأداء العالي',
      categories: printerData.categories || [
        {
          id: 'all',
          name: 'جميع المنتجات',
          icon: 'printer',
          color: 'from-purple-600 to-blue-600',
        },
        {
          id: 'laser',
          name: 'طابعات ليزر',
          icon: 'zap',
          color: 'from-blue-600 to-cyan-600',
        },
        {
          id: 'inkjet',
          name: 'طابعات حبر',
          icon: 'printer',
          color: 'from-green-600 to-teal-600',
        },
        {
          id: 'thermal',
          name: 'طابعات حرارية',
          icon: 'monitor',
          color: 'from-orange-600 to-red-600',
        },
      ],
      filters: printerData.filters || {
        sortOptions: [
          { value: 'name', label: 'الاسم (أ-ي)' },
          { value: 'price-low', label: 'السعر: من الأقل للأعلى' },
          { value: 'price-high', label: 'السعر: من الأعلى للأقل' },
          { value: 'rating', label: 'الأعلى تقييماً' },
          { value: 'performance', label: 'الأفضل أداءً' },
        ],
      },
      products: printerData.products || [],
    };

    return processedData;

  } catch (error) {
    console.error('خطأ في جلب بيانات الطابعات:', error);
    
    // إرجاع بيانات افتراضية في حالة الخطأ
    return {
      _id: 'printers-fallback',
      pageTitle: 'الطابعات المتقدمة',
      pageSubtitle: 'اكتشف أفضل الطابعات المكتبية والتجارية لجميع احتياجاتك',
      categories: [
        {
          id: 'all',
          name: 'جميع المنتجات',
          icon: 'printer',
          color: 'from-purple-600 to-blue-600',
        },
      ],
      filters: {
        sortOptions: [
          { value: 'name', label: 'الاسم' },
          { value: 'price-low', label: 'السعر: من الأقل للأعلى' },
          { value: 'price-high', label: 'السعر: من الأعلى للأقل' },
          { value: 'rating', label: 'التقييم' },
        ],
      },
      products: [],
      error: error.message,
    };
  }
}

export default async function PrintersPage() {
  const data = await fetchPrintersData();

  return <PrintersClient initialData={data} />;
}

