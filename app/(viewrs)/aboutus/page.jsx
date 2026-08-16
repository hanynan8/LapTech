// app/about/page.js (Server Component)

// بنقرأ من قاعدة البيانات مباشرة (getCollectionData) بدل self-fetch لـ
// /api/data من غير collection، اللي كان بيجيب قاعدة البيانات كاملة (كل
// فئات المنتجات) بس عشان ياخد نص صفحة "من نحن".
import { getCollectionData } from '@/lib/serverData';
import AboutUsClient from './_clientServer';

export const metadata = {
  title: 'من نحن',
  description: 'تعرف على قصة TechLap ورحلتنا في تقديم أفضل أجهزة الكمبيوتر المحمولة. اكتشف رؤيتنا ومهمتنا وقيمنا الأساسية.',
  keywords: ['TechLap', 'من نحن', 'لابتوب', 'تكنولوجيا', 'أجهزة كمبيوتر', 'جيمينج', 'قصتنا', 'إنجازات مميزة', 'بداية الحلم', 'رؤية المستقبل', 'لماذا نحن مختلفون؟', 'إنجازاتنا بالأرقام', 'ابحث عن اللابتوب المثالي'],
  openGraph: {
    type: 'website',
    url: 'https://lap-tech-five.vercel.app/aboutus',
    title: 'من نحن',
    description: 'تعرف على قصة TechLap ورحلتنا في تقديم أفضل أجهزة الكمبيوتر المحمولة.',
    siteName: 'TechLap',
  }
};

export const revalidate = 86400;

// المستند في قاعدة البيانات متداخل بشكل غريب (aboutus.aboutus.aboutus...)
// عدة مستويات - بندور جوه المستوى المتداخل لحد ما نلاقي الأوبجيكت اللي
// فيه المحتوى الفعلي (بيتعرف بوجود hero/story/mission) بدل ما نفترض
// عدد ثابت من المستويات.
function unwrapAboutData(node, depth = 0) {
  if (!node || typeof node !== 'object' || depth > 10) return null;
  if (node.hero || node.story || node.mission) return node;
  if (Array.isArray(node.aboutus) && node.aboutus.length > 0) {
    return unwrapAboutData(node.aboutus[0], depth + 1);
  }
  return null;
}

// Fetch data function with revalidation
async function getAboutData() {
  try {
    const result = await getCollectionData('aboutus');
    if (!result.success) {
      throw new Error(result.error || 'فشل في تحميل بيانات الصفحة');
    }

    const docs = result.data;
    const firstDoc = Array.isArray(docs) ? docs[0] : docs;
    const content = unwrapAboutData(firstDoc);

    if (!content) {
      throw new Error('لا توجد بيانات متاحة');
    }

    return content;
  } catch (error) {
    console.error('Error fetching about data:', error);
    throw error;
  }
}

export default async function AboutUsPage() {
  let aboutData = null;
  let error = null;

  try {
    aboutData = await getAboutData();
  } catch (err) {
    error = err instanceof Error ? err.message : 'حدث خطأ في تحميل البيانات';
  }

  return <AboutUsClient initialData={aboutData} error={error} />;
}