// app/page.js - Server Component with ISR
import { Suspense } from 'react';
import HomePage from './_clientServer';
import { Loader } from 'lucide-react';

// ISR Configuration - revalidate every hour (3600 seconds)
export const revalidate = 86400;

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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://restaurant-back-end.vercel.app/api/data';
  
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      // Next.js fetch with ISR
      next: { 
        revalidate: 86400,
        tags: ['home-data']
      }
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    
    // Extract home data
    let homeData = null;
    if (data.home && Array.isArray(data.home) && data.home.length > 0) {
      homeData = data.home[0];
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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://restaurant-back-end.vercel.app/api/data';
  
  const categories = [
    'accessories', 'laptop', 'monitors', 'component', 
    'other', 'pc-builds', 'pos', 'printers', 'storage-devices'
  ];

  try {
    // Fetch featured products from multiple categories in parallel
    const promises = categories.slice(0, 4).map(async (category) => {
      try {
        const response = await fetch(`${apiUrl}?collection=${category}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          },
          next: { 
            revalidate: 3600,
            tags: [`category-${category}`]
          }
        });

        if (!response.ok) return { category, products: [] };

        const result = await response.json();
        
        let products = [];
        if (Array.isArray(result) && result.length > 0) {
          if (result[0].products) {
            products = result[0].products;
          } else if (result[0].data && result[0].data.products) {
            products = result[0].data.products;
          }
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
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://restaurant-back-end.vercel.app/api/data'
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