// app/components/page.js - Server Component

import ComputerComponentsClient from './_compClient';


export const metadata = {
  title: 'مكونات الكومبيوتر',
  description: 'استعرض أفضل مكونات الحاسوب: معالجات، بطاقات رسومية، ذاكرة، لوحات أم، تخزين SSD/HDD، ومبردات — مواصفات دقيقة، مراجعات، وأسعار منافسة لمختصّي الـPC وصانعي الأجهزة.',
  keywords: [
    'مكونات الحاسوب', 'CPU', 'GPU', 'معالج', 'بطاقة رسومية', 'لوحة أم', 'رام', 'ذاكرة', 'SSD', 'HDD',
    'تبريد', 'مزود طاقة', 'PSU', 'تصليح كمبيوتر', 'تركيب كمبيوتر', 'قطع كمبيوتر', 'PC components',
    'Build PC', 'تجميع جهاز', 'عُملية تبريد', 'عروض المكونات', 'مكونات الكمبيوتر الاحترافية', 'اختر أفضل قطع الكمبيوتر لتجميع جهازك المثالي بأعلى جودة وأفضل الأسعار'
  ],
  openGraph: {
    url: 'https://lap-tech-five.vercel.app/component',
    title: 'مكونات الكومبيوتر',
    description: 'دليل شامل لأفضل مكونات الحاسوب: مواصفات، مقارنة، ونصائح اختيار القطع المناسبة لتجميع جهازك أو ترقية الأداء.',
    type: 'website',
  },
};




// دالة جلب البيانات من الـ API على الخادم
async function fetchComponentsData() {
  try {
    const response = await fetch('https://restaurant-back-end.vercel.app/api/data?collection=component', {
      next: { revalidate: 86000 } // 24 ساعة تقريباً
    });
    
    if (!response.ok) {
      throw new Error(`خطأ في الشبكة: ${response.status}`);
    }
    
    const apiData = await response.json();
    
    // التعامل مع هياكل البيانات المختلفة
    let processedData = null;
    
    if (Array.isArray(apiData)) {
      const componentData = apiData.find(item => item.data || item.component);
      if (componentData) {
        processedData = componentData.data || componentData.component;
      }
    } else if (apiData.component) {
      processedData = apiData.component;
    } else if (apiData.data) {
      processedData = apiData.data;
    } else {
      processedData = apiData;
    }
    
    if (!processedData) {
      throw new Error('لا توجد بيانات للمكونات في الاستجابة');
    }
    
    return processedData;
    
  } catch (error) {
    console.error('Error fetching components data:', error);
    return null;
  }
}

// Server Component الرئيسي
export default async function ComputerComponentsPage() {
  const data = await fetchComponentsData();
  const error = data ? null : 'فشل في تحميل بيانات المكونات';

  return (
    <ComputerComponentsClient 
      initialData={data} 
      error={error} 
    />
  );
}