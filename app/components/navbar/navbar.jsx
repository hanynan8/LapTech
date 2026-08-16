import Navbar from './_navClient';
import { getCollectionData } from '@/lib/serverData';

// ISR revalidation period (in seconds) for the page
export const revalidate = 60;

// جلب بيانات الـ navbar مباشرة من قاعدة البيانات بدل HTTP self-fetch
// لـ /api/data بدون فلتر (اللي كان بيجيب قاعدة البيانات كاملة!). الـ
// Navbar ده موجود في الـ layout الرئيسي، يعني بيترندر مع كل صفحة في
// الموقع - فالـ self-fetch القديم كان معناه "رحلة HTTP كاملة لجلب كل
// حاجة" بتتكرر مع كل نقلة صفحة، وده كان بيبطّئ الموقع كله مش بس صفحات
// المنتجات.
async function fetchNavbarData() {
  try {
    const result = await getCollectionData('navbar');
    if (!result.success) return null;

    const data = result.data;
    if (Array.isArray(data) && data.length > 0) return data[0];
    if (data && typeof data === 'object') return data;
    return null;
  } catch (err) {
    console.error('Error fetching navbar:', err);
    return null;
  }
}

export default async function Page() {
  const navbarData = await fetchNavbarData();

  return <Navbar navbarData={navbarData} />;
}