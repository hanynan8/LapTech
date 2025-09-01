// app/laptop/page.js (Server Component)
import React from 'react';
import ProductsClient from './_lapClient';
import BrettyButton from './brettybtn';

export const metadata = {
  title: 'اللابتوبات',
  description: 'اكتشف مجموعة واسعة من اللابتوبات: للألعاب، للعمل، والإنتاجية — مواصفات، مقارنة أسعار، ونصائح اختيار اللابتوب المناسب حسب الاستخدام والميزانية.',
  keywords: [
    'لابتوب', 'اللابتوبات', 'أجهزة محمولة', 'Gaming Laptop', 'محمول للعمل', 'Intel', 'AMD', 'M2', 'RAM', 'SSD', 'شاشة 144Hz', 'بطاقة رسومية'
  ],
  openGraph: {
    url: 'https://lap-tech-five.vercel.app/laptop',
    title: 'اللابتوبات',
    description: 'تصفح أفضل عروض اللابتوبات: مواصفات تفصيلية ومراجعات لمساعدتك في اختيار الجهاز الأمثل.',
    type: 'website'
  }
};



// Server Component - يتم تشغيله على الخادم
async function fetchProductsData() {
  try {
    const response = await fetch('https://restaurant-back-end.vercel.app/api/data', {
      next: { revalidate: 86000 } // 24 ساعة تقريباً
    });
    
    if (!response.ok) {
      throw new Error('فشل في جلب البيانات');
    }
    
    const apiData = await response.json();
    
    // استخراج البيانات من المصفوفة laptop
    if (apiData.laptop && apiData.laptop.length > 0) {
      return {
        success: true,
        data: apiData.laptop[0]
      };
    } else {
      throw new Error('هيكل البيانات غير متوقع');
    }
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

const ProductsServerPage = async () => {
  // جلب البيانات على الخادم
  const result = await fetchProductsData();

  if (!result.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">خطأ في تحميل البيانات: {result.error}</p>
          <BrettyButton />
        </div>
      </div>
    );
  }

  // تمرير البيانات للـ Client Component
  return <ProductsClient initialData={result.data} />;
};

export default ProductsServerPage;