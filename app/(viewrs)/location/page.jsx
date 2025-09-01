import LocationPageClient from './_clientServer';

export const metadata = {
  title: 'موقعنا',
  description: 'تعرف على مواقعنا وكيفية الوصول إلينا. ساعات العمل، العناوين، وطرق التواصل مع جميع فروعنا.',
  keywords: [
    'موقعنا', 'العنوان', 'اتصل بنا', 'مواعيد العمل', 'فروعنا', 'كيفية الوصول',
    'خريطة الموقع', 'طرق التواصل', 'أرقام الهاتف', 'البريد الإلكتروني'
  ],
  authors: [{ name: 'Restaurant', url: 'https://restaurant-back-end.vercel.app' }],
  openGraph: {
    type: 'website',
    url: 'https://restaurant-back-end.vercel.app/location',
    title: 'موقعنا',
    description: 'تعرف على مواقعنا وكيفية الوصول إلينا. ساعات العمل، العناوين، وطرق التواصل مع جميع فروعنا.',
    siteName: 'Restaurant',
  }
};

export const revalidate = 86400;

// دالة محسنة للبحث السريع
function extractLocationData(data) {
  // البحث المباشر أولاً
  if (data.location) {
    // إذا كانت مصفوفة
    if (Array.isArray(data.location)) {
      const firstLocation = data.location[0];
      if (firstLocation) {
        // إذا كان العنصر الأول يحتوي على location أخرى
        if (firstLocation.location && Array.isArray(firstLocation.location)) {
          return firstLocation.location[0];
        }
        // إذا كان العنصر الأول هو البيانات المطلوبة
        if (firstLocation.pageTitle) {
          return firstLocation;
        }
      }
    } else {
      // إذا كانت كائن مباشر
      if (data.location.pageTitle) {
        return data.location;
      }
    }
  }

  // البحث في المستوى الأول من المفاتيح فقط
  const possibleKeys = ['locationData', 'locationInfo', 'locations', 'page'];
  for (const key of possibleKeys) {
    if (data[key] && data[key].pageTitle) {
      return data[key];
    }
  }

  // إذا لم نجد شيئاً، نبحث عن أي كائن يحتوي على pageTitle
  if (data.pageTitle) {
    return data;
  }

  return null;
}

async function getLocationData() {
  try {
    const response = await fetch('https://restaurant-back-end.vercel.app/api/data', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      next: { revalidate: 86400 }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const locationInfo = extractLocationData(data);
    
    if (!locationInfo) {
      throw new Error('No location data found');
    }
    
    return locationInfo;
    
  } catch (error) {
    console.error('Server error:', error);
    return null;
  }
}

export default async function LocationPage() {
  let locationData = null;
  let error = null;

  try {
    locationData = await getLocationData();
  } catch (err) {
    error = err instanceof Error ? err.message : 'حدث خطأ في تحميل بيانات الموقع';
  }

  return <LocationPageClient initialData={locationData} error={error} />;
}