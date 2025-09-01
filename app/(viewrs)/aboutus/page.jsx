// app/about/page.js (Server Component)

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

// Fetch data function with revalidation
async function getAboutData() {
  try {
    const response = await fetch('https://restaurant-back-end.vercel.app/api/data', {
      next: { 
        revalidate: 86400 // Revalidate every hour
      },
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.aboutus && data.aboutus.length > 0) {
      return data.aboutus[0].aboutus[0].aboutus[0];
    } else {
      throw new Error('لا توجد بيانات متاحة');
    }
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