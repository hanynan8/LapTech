// app/contact/page.js (Server Component)

// بنقرأ من قاعدة البيانات مباشرة (getCollectionData) بدل self-fetch لـ
// /api/data من غير collection، اللي كان بيجيب قاعدة البيانات كاملة (كل
// فئات المنتجات) بس عشان ياخد بيانات صفحة "اتصل بنا" الصغيرة.
import { getCollectionData } from '@/lib/serverData';
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

export const revalidate = 60;

// Fetch contact data directly from the DB
async function getContactData() {
  try {
    const result = await getCollectionData('contact');
    if (!result.success) {
      throw new Error(result.error || 'فشل في تحميل بيانات الاتصال');
    }

    const docs = result.data;
    const contactDoc = Array.isArray(docs) ? docs[0] : docs;

    if (!contactDoc) {
      throw new Error('لا توجد بيانات اتصال متاحة');
    }

    return contactDoc;
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