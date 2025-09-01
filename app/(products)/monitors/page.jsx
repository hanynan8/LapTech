// app/monitors/page.js - Server Component
import MonitorsClient from './_monClient';



export const metadata = {
  title: 'الشاشات التقنية',
  description: 'اكتشف مجموعة واسعة من شاشات العرض للألعاب والعمل والترفيه. شاشات عالية الجودة بأفضل الأسعار مع ضمان وخدمة عملاء ممتازة.',
  keywords: 'شاشات, مونيتور, شاشات ألعاب, شاشات مهنية, LED, LCD, 4K',
  openGraph: {
    title: 'االشاشات التقنية',
    description: 'اكتشف أفضل شاشات العرض بأسعار رائعة',
    url: 'https://lap-tech-five.vercel.app/monitors',
    type: 'website',
  },
};



const MonitorsPage = async () => {
  let data = null;
  let error = null;

  try {
    // جلب البيانات من الخادم
    const response = await fetch(
      'https://restaurant-back-end.vercel.app/api/data?collection=monitors',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        next: {
          revalidate: 86000, // إعادة التحقق كل دقيقة
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
    let monitorsData = null;
    if (Array.isArray(apiData) && apiData.length > 0) {
      monitorsData = apiData[0];
    } else if (apiData && typeof apiData === 'object') {
      monitorsData = apiData;
    } else {
      throw new Error('لم يتم العثور على بيانات الشاشات في الاستجابة');
    }

    // تجهيز البيانات مع قيم افتراضية شاملة
    data = {
      _id: monitorsData._id || 'monitors-page',
      pageTitle: monitorsData.pageTitle || 'الشاشات',
      pageSubtitle:
        monitorsData.pageSubtitle ||
        'اكتشف أفضل شاشات العرض للألعاب، العمل، والترفيه بأعلى جودة وأفضل الأسعار',
      categories: monitorsData.categories || [
        {
          id: 'all',
          name: 'جميع الشاشات',
          icon: 'monitor',
          color: 'from-purple-600 to-blue-600',
        },
        {
          id: 'gaming',
          name: 'شاشات الألعاب',
          icon: 'gamepad2',
          color: 'from-green-500 to-blue-600',
        },
        {
          id: 'professional',
          name: 'شاشات مهنية',
          icon: 'monitor',
          color: 'from-blue-600 to-indigo-600',
        },
        {
          id: 'curved',
          name: 'شاشات منحنية',
          icon: 'monitor-speaker',
          color: 'from-purple-600 to-pink-600',
        },
      ],
      filters: monitorsData.filters || {
        sortOptions: [
          { value: 'name', label: 'الاسم' },
          { value: 'price-low', label: 'السعر: من الأقل للأعلى' },
          { value: 'price-high', label: 'السعر: من الأعلى للأقل' },
          { value: 'rating', label: 'التقييم' },
          { value: 'performance', label: 'الأداء' },
          { value: 'size', label: 'الحجم' },
          { value: 'refresh-rate', label: 'معدل التحديث' },
        ],
      },
      products: monitorsData.products || [],
      metadata: {
        totalProducts: monitorsData.products?.length || 0,
        lastUpdated: new Date().toISOString(),
        version: '2.0',
      },
    };

    // إضافة معلومات إضافية للمنتجات
    if (data.products && data.products.length > 0) {
      data.products = data.products.map((product, index) => ({
        ...product,
        id: product.id || `monitor-${index}`,
        image: product.image || 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
        rating: product.rating || (3.5 + Math.random() * 1.5), // تقييم عشوائي إذا لم يكن موجود
        specs: {
          size: '24 بوصة',
          resolution: '1920x1080',
          refreshRate: '144Hz',
          panel: 'IPS',
          ...product.specs,
        },
        features: product.features || ['مقاومة الوهج', 'توصيل متعدد', 'ضبط الارتفاع'],
        availability: product.availability || 'متوفر',
        warranty: product.warranty || 'ضمان سنتين',
        ...product,
      }));
    }

  } catch (err) {
    console.error('خطأ في جلب البيانات:', err);
    error = `فشل في تحميل البيانات: ${err.message}`;
  }

  return <MonitorsClient initialData={data} error={error} />;
};

export default MonitorsPage;
