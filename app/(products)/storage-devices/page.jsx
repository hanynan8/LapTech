// app/storage-devices/page.tsx - Server Component
import { Suspense } from 'react';
import StorageClient from './_storageClient';

// Server-side data fetching
async function getStorageData() {
  try {
    const response = await fetch(
      'https://restaurant-back-end.vercel.app/api/data',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        cache: 'force-cache', // Cache for performance
        next: { revalidate: 86000 }, // Revalidate every hour
      }
    );

    if (!response.ok) {
      throw new Error(`Network error: ${response.status}`);
    }

    const apiData = await response.json();

    // Extract storage data
    let storageData = null;
    if (apiData['storage-devices']?.[0]) {
      storageData = apiData['storage-devices'][0];
    }

    // Process and structure data
    const processedData = {
      _id: storageData?._id || 'storage-devices-page',
      pageTitle: storageData?.pageTitle || 'وسائط التخزين',
      pageSubtitle: storageData?.pageSubtitle || 'اكتشف أفضل حلول التخزين من أقراص صلبة، SSD، فلاش ميموري وأكثر',
      categories: storageData?.categories || [
        {
          id: 'all',
          name: 'جميع المنتجات',
          icon: 'hard-drive',
          color: 'from-purple-600 to-blue-600',
        },
        {
          id: 'ssd',
          name: 'أقراص SSD',
          icon: 'database',
          color: 'from-blue-500 to-indigo-600',
        },
        {
          id: 'hdd',
          name: 'أقراص HDD',
          icon: 'hard-drive',
          color: 'from-gray-600 to-gray-800',
        },
        {
          id: 'usb',
          name: 'فلاش ميموري',
          icon: 'usb',
          color: 'from-green-500 to-emerald-600',
        },
        {
          id: 'memory-card',
          name: 'بطاقات الذاكرة',
          icon: 'credit-card',
          color: 'from-orange-500 to-red-500',
        },
      ],
      filters: {
        sortOptions: [
          { value: 'name', label: 'الاسم' },
          { value: 'price-low', label: 'السعر: من الأقل للأعلى' },
          { value: 'price-high', label: 'السعر: من الأعلى للأقل' },
          { value: 'rating', label: 'التقييم' },
          { value: 'capacity', label: 'السعة: من الأكبر للأصغر' },
          { value: 'newest', label: 'الأحدث' },
        ],
      },
      products: storageData?.products || [],
      totalProducts: storageData?.products?.length || 0,
    };

    return processedData;
  } catch (error) {
    console.error('Error fetching storage data:', error);
    return {
      _id: 'storage-devices-page',
      pageTitle: 'وسائط التخزين',
      pageSubtitle: 'اكتشف أفضل حلول التخزين',
      categories: [],
      filters: { sortOptions: [] },
      products: [],
      totalProducts: 0,
      error: error.message,
    };
  }
}

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Hero Skeleton */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-pulse">
            <div className="h-12 bg-white/20 rounded w-1/2 mx-auto mb-6"></div>
            <div className="h-6 bg-white/20 rounded w-3/4 mx-auto"></div>
          </div>
        </div>
      </section>

      {/* Search Skeleton */}
      <section className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse flex gap-4">
            <div className="h-12 bg-gray-200 rounded-full flex-1"></div>
            <div className="h-12 bg-gray-200 rounded-full w-48"></div>
          </div>
        </div>
      </section>

      {/* Categories Skeleton */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse flex gap-4 justify-center">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded-full w-32"></div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Skeleton */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-lg">
                <div className="animate-pulse">
                  <div className="w-full h-48 bg-gray-300"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2 mb-3"></div>
                    <div className="space-y-1 mb-4">
                      <div className="h-3 bg-gray-300 rounded w-full"></div>
                      <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                    </div>
                    <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
                    <div className="h-12 bg-gray-300 rounded-2xl"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// Metadata for SEO
export const metadata = {
  title: 'وسائط التخزين - أقراص صلبة، SSD، فلاش ميموري',
  description: 'تسوق أفضل وسائط التخزين بأسعار مميزة. أقراص صلبة، SSD، فلاش ميموري، بطاقات ذاكرة وأكثر',
  keywords: 'وسائط تخزين, أقراص صلبة, SSD, فلاش ميموري, بطاقات ذاكرة',
};

export default async function StorageDevicesPage() {
  // Server-side data fetching
  const initialData = await getStorageData();

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <Suspense fallback={<LoadingSkeleton />}>
        <StorageClient initialData={initialData} />
      </Suspense>
    </div>
  );
}