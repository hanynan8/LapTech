// app/contact/page.js (Server Component)

import ContactClient from './_clientServer';

export const metadata = {
  title: 'اتصل بنا',
  description: 'تواصل معنا في TechLap لأي استفسار عن المنتجات أو الدعم الفني أو طلب شراكات. فريقنا جاهز لمساعدتك عبر الهاتف، البريد الإلكتروني أو زيارة فرعنا.',
  keywords: [
    'TechLap', 'اتصل بنا', 'تواصل', 'دعم فني', 'خدمة العملاء', 'مبيعات', 'استفسار',
    'موقعنا', 'هاتف', 'بريد إلكتروني', 'مواعيد العمل', 'الشحن والإرجاع', 'أرسل لنا رسالة', 'الدردشة المباشرة', 'الدعم الفني', 'قاعدة المعرفة', 'الأسئلة الشائعة', 'تابعنا على وسائل التواصل'
  ],
  authors: [{ name: 'TechLap', url: 'https://lap-tech-five.vercel.app' }],
  openGraph: {
    type: 'website',
    url: 'https://lap-tech-five.vercel.app/contact',
    title: 'اتصل بنا',
    description: 'هل لديك سؤال أو تحتاج مساعدة؟ تواصل مع فريق TechLap عبر الهاتف أو البريد الإلكتروني أو زر أقرب فرع لنا.',
    siteName: 'TechLap',
  }
};

// Fetch contact data with revalidation
async function getContactData() {
  try {
    const response = await fetch('https://restaurant-back-end.vercel.app/api/data', {
      next: { 
        revalidate: 86400 // Revalidate every 30 minutes (contact info changes more frequently)
      },
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.contact && data.contact.length > 0) {
      return data.contact[0];
    } else {
      throw new Error('لا توجد بيانات اتصال متاحة');
    }
  } catch (error) {
    console.error('Error fetching contact data:', error);
    throw error;
  }
}

export default async function ContactPage() {
  let contactData = null;
  let error = null;

  try {
    contactData = await getContactData();
  } catch (err) {
    error = err instanceof Error ? err.message : 'حدث خطأ في تحميل بيانات الاتصال';
  }

  return <ContactClient initialData={contactData} error={error} />;
}