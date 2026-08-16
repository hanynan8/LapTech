// app/page.js - Server Component with ISR
import { Suspense } from 'react';
import HomePage from './_clientServer';
import { Loader } from 'lucide-react';
// بنقرأ من قاعدة البيانات مباشرة (getCollectionData) بدل self-fetch لـ
// /api/data. الصفحة الرئيسية دي أعلى صفحة زيارات في الموقع، وكانت بتعمل
// 5 رحلات HTTP self-fetch منفصلة على كل تحميل: واحدة لبيانات الصفحة
// الرئيسية (بجيب قاعدة البيانات كاملة من غير collection filter!) +
// 4 تانيين متوازيين لكل فئة منتجات مميزة. دلوقتي كلهم بيقروا من قاعدة
// البيانات مباشرة (ومن نفس الكاش المشترك اللي صفحات الفئات نفسها بتستخدمه).
import { getCollectionData } from '@/lib/serverData';

// ISR Configuration - revalidate every hour (3600 seconds)
export const revalidate = 60;

// Metadata for SEO
export const metadata = {
  title: 'الصفحة الرئيسية',
  description: 'اكتشف أفضل الأجهزة التقنية من لابتوبات ومكونات وإكسسوارات بأفضل الأسعار وجودة عالمية',
  keywords: [
    'تقنية', 'لابتوب', 'كمبيوتر', 'إكسسوارات', 'مكونات', 'TechLap', 'أجهزة', 'شراء أجهزة', 'أفضل الأسعار', 'جودة عالية', 'تسوق حسب الفئات', 'الاكسسوارات',
    'اللابتوبات', 'الشاشات', 'المكونات', 'أجهزة الكمبيوتر', 'أجهزة التخزين', 'الطابعات', 'نقاط البيع', 'أجهزة أخرى', 'عروض خاصة', 'منتجات مميزة', 'توصيل سريع', 'خدمة عملاء ممتازة'
  ],
  openGraph: {
    url: 'https://lap-tech-five.vercel.app/',
    title: 'الصفحة الرئيسية',
    description: 'اكتشف أفضل الأجهزة التقنية بأفضل الأسعار',
    type: 'website',
  },
};


// Server function to fetch initial data
async function getHomeData() {
  try {
    const result = await getCollectionData('home');
    if (!result.success) {
      console.error(`getCollectionData(home) failed: ${result.error}`);
      return null;
    }

    // Extract home data
    const data = result.data;
    let homeData = null;
    if (Array.isArray(data) && data.length > 0) {
      homeData = data[0];
    }

    return {
      homeData,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Server fetch error:', error);
    return null;
  }
}

// Server function to fetch featured products from all categories
async function getFeaturedProducts() {
  const categories = [
    'accessories', 'laptop', 'monitors', 'component',
    'other', 'pc-builds', 'pos', 'printers', 'storage-devices'
  ];

  try {
    // Fetch featured products from multiple categories in parallel - كلهم
    // بيقروا من نفس الكاش المشترك في lib/serverData.js بدل ما كل واحد
    // يعمل رحلة HTTP منفصلة لنفس السيرفر.
    const promises = categories.slice(0, 4).map(async (category) => {
      try {
        const result = await getCollectionData(category);
        if (!result.success) return { category, products: [] };

        const data = result.data;
        let products = [];
        if (Array.isArray(data) && data.length > 0 && data[0].products) {
          products = data[0].products;
        }

        // Filter available products and get top 2
        const availableProducts = products
          .filter(product => 
            product.details?.isAvailable !== false && 
            product.details?.stock !== 0
          )
          .slice(0, 2);

        return {
          category,
          products: availableProducts
        };
      } catch (err) {
        console.error(`Error fetching ${category}:`, err);
        return { category, products: [] };
      }
    });

    const results = await Promise.all(promises);
    return results;

  } catch (error) {
    console.error('Server featured products fetch error:', error);
    return [];
  }
}

// Loading component
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <Loader className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
        <p className="text-xl text-gray-600">جاري تحميل الصفحة الرئيسية...</p>
      </div>
    </div>
  );
}

// Main Server Component
export default async function Home() {
  // Fetch data on server
  const [homeResult, featuredProducts] = await Promise.all([
    getHomeData(),
    getFeaturedProducts()
  ]);

  const serverData = {
    homeData: homeResult?.homeData || null,
    featuredProducts: featuredProducts || [],
    timestamp: homeResult?.timestamp || new Date().toISOString(),
    // ده بيتبعت للـ Client Component عشان يكمل يجيب باقي الفئات في
    // المتصفح (اللي مش اتجابت هنا على السيرفر) - مسار نسبي كافي وآمن
    // لطلبات نفس الأصل (same-origin) من المتصفح.
    apiUrl: process.env.NEXT_PUBLIC_API_URL || '/api/data'
  };

  return (
    <Suspense fallback={<LoadingFallback />}>
      <HomePage 
        initialData={serverData}
        apiUrl={serverData.apiUrl}
      />
    </Suspense>
  );
}

// Generate static params for ISR (if needed for dynamic routes)
export async function generateStaticParams() {
  return [];
}

// Error boundary component
export function ErrorBoundary({ error, reset }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4" dir="rtl">
      <div className="text-red-500 text-xl mb-4">
        خطأ في تحميل الصفحة: {error.message}
      </div>
      <button
        onClick={reset}
        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300"
      >
        إعادة المحاولة
      </button>
    </div>
  );
}