import Footer from './_footClient';
// بنقرأ من قاعدة البيانات مباشرة (getCollectionData) بدل ما الفوتر - اللي
// بيترندر مع كل صفحة في الموقع بدون استثناء - يعمل self-fetch HTTP لـ
// /api/data من غير تحديد collection. ده كان معناه إن كل نقلة صفحة في
// الموقع كله كانت بتجيب قاعدة البيانات كاملة (كل المنتجات في كل الفئات)
// بس عشان يعرض نص الفوتر. دلوقتي بيقرأ الـ footer collection بس مباشرة.
import { getCollectionData } from '@/lib/serverData';

// ISR revalidation period (in seconds) for the page
export const revalidate = 60;

const FALLBACK_FOOTER_DATA = {
  company: {
    name: "اسم الشركة",
    subtitle: "",
    description: "",
    year: new Date().getFullYear()
  },
  socialLinks: [],
  sections: [],
  bottomLinks: []
};

// Fetch footer data directly from the DB (shared cache with navbar/pages)
async function fetchFooterData() {
  try {
    const result = await getCollectionData('footer');
    if (!result.success) return FALLBACK_FOOTER_DATA;

    const data = result.data;
    const footerData = Array.isArray(data) ? data[0] : data;

    return footerData || FALLBACK_FOOTER_DATA;
  } catch (err) {
    console.error('Error fetching footer data:', err);
    return FALLBACK_FOOTER_DATA;
  }
}

export default async function Page() {
  const footerData = await fetchFooterData();
  return <Footer footerData={footerData} loading={false} />;
}