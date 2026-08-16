// app/components/page.js - Server Component
import ComputerComponentsClient from './_compClient';
import { getCollectionData } from '@/lib/serverData';


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
    // قراءة مباشرة من قاعدة البيانات بدل عمل fetch لنفس الـ API route
    // (كانت بتعمل رحلة شبكة إضافية على كل تنقل بين الصفحات)
    const result = await getCollectionData('component');

    if (!result.success) {
      throw new Error(result.error || 'فشل في جلب البيانات');
    }

    const apiData = result.data;

    // الاستجابة عبارة عن مصفوفة فيها مستند واحد يحتوي مباشرة على
    // pageTitle / categories / products (نفس شكل بيانات باقي الصفحات
    // زي laptop و monitors)، مش متلفوف جوه مفتاح data أو component.
    const processedData =
      Array.isArray(apiData) && apiData.length > 0
        ? apiData[0]
        : apiData && typeof apiData === 'object'
        ? apiData
        : null;

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