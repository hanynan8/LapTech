// app/other-products/page.js - Server Component
import OtherProductsClient from './_otherClient';


export const metadata = {
  title: 'منتجات أخرى',
  description: 'اكتشف مجموعة واسعة من المنتجات التقنية والإلكترونية، الإكسسوارات، وحدات التخزين، والطرفيات بأفضل الأسعار.',
  keywords: 'إكسسوارات, طرفيات, تخزين, شبكات, كابلات, تقنية, إلكترونيات',
  openGraph: {
    title: 'منتجات أخرى',
    description: 'اكتشف مجموعة متنوعة من المنتجات التقنية بأسعار رائعة',
    url: 'https://lap-tech-five.vercel.app/other',
    type: 'website',
  },
};





const OtherProductsPage = async () => {
  let data = null;
  let error = null;

  try {
    // جلب البيانات من الخادم
    const response = await fetch(
      'https://restaurant-back-end.vercel.app/api/data?collection=other',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        cache: 'no-cache',
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
    let otherProductsData = null;
    if (Array.isArray(apiData) && apiData.length > 0) {
      otherProductsData = apiData[0];
    } else if (apiData && typeof apiData === 'object') {
      otherProductsData = apiData;
    } else {
      throw new Error('لم يتم العثور على بيانات المنتجات في الاستجابة');
    }

    // تجهيز البيانات مع قيم افتراضية شاملة
    data = {
      _id: otherProductsData._id || 'other-products-page',
      pageTitle: otherProductsData.pageTitle || 'منتجات أخرى',
      pageSubtitle:
        otherProductsData.pageSubtitle ||
        'اكتشف مجموعة واسعة من المنتجات التقنية والإلكترونية المختارة بعناية لتلبية جميع احتياجاتك',
      categories: otherProductsData.categories || [
        {
          id: 'all',
          name: 'جميع المنتجات',
          icon: 'cpu',
          color: 'from-purple-600 to-blue-600',
        },
        {
          id: 'accessories',
          name: 'الإكسسوارات',
          icon: 'headphones',
          color: 'from-green-500 to-blue-600',
        },
        {
          id: 'storage',
          name: 'وحدات التخزين',
          icon: 'hard-drive',
          color: 'from-blue-600 to-indigo-600',
        },
        {
          id: 'networking',
          name: 'الشبكات',
          icon: 'wifi',
          color: 'from-orange-500 to-red-600',
        },
        {
          id: 'peripherals',
          name: 'الطرفيات',
          icon: 'gamepad2',
          color: 'from-pink-500 to-purple-600',
        },
        {
          id: 'cables',
          name: 'الكابلات',
          icon: 'zap',
          color: 'from-yellow-500 to-orange-600',
        },
      ],
      filters: otherProductsData.filters || {
        sortOptions: [
          { value: 'name', label: 'الاسم' },
          { value: 'price-low', label: 'السعر: من الأقل للأعلى' },
          { value: 'price-high', label: 'السعر: من الأعلى للأقل' },
          { value: 'rating', label: 'التقييم' },
          { value: 'performance', label: 'الأداء' },
          { value: 'brand', label: 'العلامة التجارية' },
          { value: 'popularity', label: 'الأكثر شعبية' },
        ],
      },
      products: otherProductsData.products || [],
      metadata: {
        totalProducts: otherProductsData.products?.length || 0,
        lastUpdated: new Date().toISOString(),
        version: '2.0',
      },
    };

    // إضافة معلومات إضافية للمنتجات
    if (data.products && data.products.length > 0) {
      data.products = data.products.map((product, index) => ({
        ...product,
        id: product.id || `product-${index}`,
        image: product.image || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400',
        rating: product.rating || (3.5 + Math.random() * 1.5),
        specs: {
          brand: 'غير محدد',
          model: 'غير محدد',
          warranty: 'سنة واحدة',
          color: 'متعدد',
          ...product.specs,
        },
        features: product.features || ['جودة عالية', 'ضمان الجودة', 'دعم فني'],
        availability: product.availability || 'متوفر',
        warranty: product.warranty || 'ضمان سنة',
        brand: product.brand || 'غير محدد',
        category: product.category || 'other',
        performanceScore: product.performanceScore || Math.floor(Math.random() * 100) + 1,
        ...product,
      }));
    }

  } catch (err) {
    console.error('خطأ في جلب البيانات:', err);
    error = `فشل في تحميل البيانات: ${err.message}`;
  }

  return <OtherProductsClient initialData={data} error={error} />;
};

export default OtherProductsPage;

// إضافة metadata للصفحة
