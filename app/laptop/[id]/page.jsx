import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamicParams = true;

export default async function ProductDetailsPage({ params }) {
  // جلب المنتج حسب id
  async function fetchLaptopById(id) {
    const res = await fetch(
      `https://restaurant-back-end.vercel.app/api/data?collection=laptop&id=${id}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data[0] : data || null;
  }

  // جلب مجموعة منتجات حسب فئة (fallback) — API قد يتجاهل الباراميتر إذا غير مدعوم
  async function fetchByCategory(category, limit = 12) {
    try {
      const res = await fetch(
        `https://restaurant-back-end.vercel.app/api/data?collection=laptop&category=${encodeURIComponent(category)}&limit=${limit}`,
        { next: { revalidate: 60 } }
      );
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  const laptop = await fetchLaptopById(params.id);
  if (!laptop) notFound();

  // PRODUCTS RELATED: نجمع أولًا من الـ details.relatedProducts، وبعدين نكمل بفئة المنتج لو العدد قليل
  const DESIRED_RELATED_COUNT = 12;
  let relatedProducts = [];

  if (Array.isArray(laptop?.details?.relatedProducts) && laptop.details.relatedProducts.length > 0) {
    // نحاول جلب كل ID واحدًا واحدًا (بحرص)
    const ids = laptop.details.relatedProducts.slice(0, DESIRED_RELATED_COUNT);
    const promises = ids.map(async (id) => {
      try {
        return await fetchLaptopById(id);
      } catch (e) {
        return null;
      }
    });
    relatedProducts = (await Promise.all(promises)).filter(Boolean);
  }

  // لو لسه قليل نملأ من منتجات نفس الفئة (ونستبعد المنتج الحالي)
  if (relatedProducts.length < DESIRED_RELATED_COUNT && laptop.category) {
    const candidates = await fetchByCategory(laptop.category, DESIRED_RELATED_COUNT * 2);
    const filtered = Array.isArray(candidates)
      ? candidates.filter((p) => p && Number(p.id) !== Number(laptop.id) && !relatedProducts.find(r => Number(r.id) === Number(p.id)))
      : [];

    // نضيف حتى نصل للحد المطلوب
    for (const p of filtered) {
      if (relatedProducts.length >= DESIRED_RELATED_COUNT) break;
      relatedProducts.push(p);
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  function formatPrice(num) {
    if (num == null) return '—';
    try {
      return new Intl.NumberFormat('ar-EG').format(num);
    } catch {
      return String(num);
    }
  }

  // مرونة: تأكد من وجود الـ detailedSpecs كمجموعة مفتاحية
  const specs = laptop.details?.detailedSpecs || laptop.specs || {};

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6" dir="rtl">
      <style>{`
        /* lightbox بدون جافاسكربت: نستخدم :target لعرض العنصر */
        .lightbox { 
          display: none; 
          align-items: center; 
          justify-content: center; 
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          z-index: 1000;
          padding: 2rem;
        }
        .lightbox:target { 
          display: flex; 
        }
        /* تحسين الصورة داخل اللايت بوكس */
        .lightbox-content {
          position: relative;
          max-width: 90vw;
          max-height: 90vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .lightbox img { 
          max-height: 80vh; 
          width: auto; 
          max-width: 100%; 
          border-radius: 0.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        .lightbox-close {
          position: absolute;
          top: -40px;
          right: -10px;
          background: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          text-decoration: none;
          color: #333;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        }
        .lightbox-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.7);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          color: #333;
          font-weight: bold;
          font-size: 1.5rem;
          transition: all 0.2s ease;
        }
        .lightbox-nav:hover {
          background: rgba(255, 255, 255, 0.9);
        }
        .lightbox-prev {
          left: 20px;
        }
        .lightbox-next {
          right: 20px;
        }
        /* تأثير التكبير على الصور المصغرة */
        .thumbnail-container {
          overflow: hidden;
          border-radius: 0.75rem;
        }
        .thumbnail {
          transition: transform 0.3s ease;
        }
        .thumbnail:hover {
          transform: scale(1.05);
        }
      `}</style>
      <section className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">

            {/* العمود الأيسر: صور ومعلومات سريعة */}
            <aside className="lg:col-span-1 flex flex-col gap-4">
              <div className="relative bg-gray-100 rounded-2xl overflow-hidden shadow-inner">
                <img
                  src={laptop.image || laptop.details?.gallery?.[0] || ''}
                  alt={laptop.name}
                  className="w-full h-96 object-contain"
                />
              </div>

              {/* معرض مصغر */}
              {Array.isArray(laptop.details?.gallery) && laptop.details.gallery.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {laptop.details.gallery.map((src, i) => (
                    <div key={`thumbnail-${i}`} className="thumbnail-container h-28 overflow-hidden rounded-xl bg-gray-50 shadow-sm">
                      <a href={`#img-${i}`} className="block w-full h-full">
                        <img 
                          src={src} 
                          alt={`${laptop.name} ${i + 1}`} 
                          className="thumbnail w-full h-full object-cover" 
                        />
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {/* بطاقة الحالة */}
              <div className="p-4 rounded-2xl border bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">الحالة</span>
                  <span className={`text-sm font-semibold ${laptop.details?.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {laptop.details?.stock > 0 ? `متوفر (${laptop.details.stock})` : 'غير متوفر'}
                  </span>
                </div>

                <div className="text-sm text-gray-600 flex justify-between">
                  <span>SKU</span>
                  <span className="font-medium">{laptop.details?.sku || '—'}</span>
                </div>

                <div className="mt-3 border-t pt-3 text-sm text-gray-600 space-y-2">
                  <div className="flex justify-between"><span>الضمان</span><span className="font-medium">{laptop.details?.warrantyMonths ? `${laptop.details.warrantyMonths} شهر` : '—'}</span></div>
                  <div className="flex justify-between"><span>وزن الشحن</span><span className="font-medium">{laptop.details?.shippingWeightKg ? `${laptop.details.shippingWeightKg} كجم` : '—'}</span></div>
                  <div className="flex justify-between"><span>تاريخ الإصدار</span><span className="font-medium">{formatDate(laptop.details?.releaseDate)}</span></div>
                </div>
              </div>
            </aside>

            {/* العمود الأوسط واليمين: المحتوى الأساسي */}
            <div className="lg:col-span-2 flex flex-col gap-4">

              {/* رأس الصفحة: اسم، فئة، شارات، سعر */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-gray-900">{laptop.name}</h1>
                  <p className="text-sm text-gray-500 mt-1">{laptop.category ? laptop.category.charAt(0).toUpperCase() + laptop.category.slice(1) : '—'}</p>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end gap-3">
                    {laptop.badge && <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 text-white">{laptop.badge}</span>}
                    {laptop.discount && <span className="px-2 py-1 rounded-full text-sm font-semibold bg-red-500 text-white">خصم {laptop.discount}%</span>}
                    {laptop.rating && <span className="text-sm text-gray-600">⭐ {laptop.rating}</span>}
                  </div>

                  <div className="mt-3 text-right">
                    <div className="text-4xl font-extrabold text-purple-600">{formatPrice(laptop.price)} {laptop.currency || 'ج.م'}</div>
                    {laptop.originalPrice && <div className="text-sm text-gray-400 line-through">{formatPrice(laptop.originalPrice)} {laptop.currency || 'ج.م'}</div>}
                  </div>
                </div>
              </div>

              {/* وصف طويل */}
              {laptop.details?.longDescription && (
                <article className="bg-gray-50 p-4 rounded-2xl">
                  <h3 className="text-lg font-semibold mb-2">الوصف</h3>
                  <p className="text-gray-700 leading-relaxed">{laptop.details.longDescription}</p>
                </article>
              )}

              {/* بطاقات مواصفات مختصرة */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white p-3 rounded-xl shadow-sm">
                  <div className="text-xs text-gray-500">المعالج</div>
                  <div className="font-medium">{laptop.specs?.processor || specs.cpu || '—'}</div>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm">
                  <div className="text-xs text-gray-500">الذاكرة</div>
                  <div className="font-medium">{laptop.specs?.ram || specs.ram || '—'}</div>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm">
                  <div className="text-xs text-gray-500">التخزين</div>
                  <div className="font-medium">{laptop.specs?.storage || specs.storage || '—'}</div>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm">
                  <div className="text-xs text-gray-500">كارت الرسوميات</div>
                  <div className="font-medium">{laptop.specs?.graphics || specs.gpu || '—'}</div>
                </div>
              </div>

              {/* أزرار الإجراء ثابتة بشكل واضح */}
              <div className="sticky top-6 z-10 mt-4 flex gap-3">
                <button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-2xl font-bold hover:shadow-lg transition-transform transform hover:scale-105">اطلب المنتج</button>
                <button className="flex-1 border-2 border-purple-600 text-purple-600 py-3 rounded-2xl font-medium hover:bg-purple-50 transition">أضف إلى المفضلة</button>
              </div>

              {/* مواصفات تقنية مفصلة — عرض ديناميكي */}
              {specs && Object.keys(specs).length > 0 && (
                <div className="mt-6 bg-white p-6 rounded-2xl shadow-sm border">
                  <h3 className="text-2xl font-bold mb-4">المواصفات التقنية الكاملة</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(specs).map(([sectionKey, sectionValue]) => {
                      // إذا كانت القيمة سلسلة بسيطة أو رقم نعرضها كبطاقة واحدة
                      if (typeof sectionValue === 'string' || typeof sectionValue === 'number') {
                        return (
                          <div key={`spec-${sectionKey}`} className="p-4 bg-gray-50 rounded-xl">
                            <h4 className="font-semibold mb-2">{sectionKey}</h4>
                            <div className="text-sm text-gray-700">{String(sectionValue)}</div>
                          </div>
                        );
                      }

                      // إذا كانت object نعرض مفاتيحها
                      if (typeof sectionValue === 'object' && sectionValue !== null) {
                        return (
                          <div key={`spec-${sectionKey}`} className="p-4 bg-gray-50 rounded-xl">
                            <h4 className="font-semibold mb-2">{sectionKey}</h4>
                            {Object.entries(sectionValue).map(([k, v]) => (
                              <div key={`spec-${sectionKey}-${k}`} className="flex justify-between text-sm text-gray-600 mb-1">
                                <span className="capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                                <span className="font-medium">{String(v)}</span>
                              </div>
                            ))}
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>

                  {/* منافذ ووزن وأبعاد إذا متاحة */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border">
                      <h5 className="font-semibold mb-2">المنافذ</h5>
                      <div className="text-sm text-gray-600">{(specs.ports || specs.ports || laptop.details?.detailedSpecs?.ports || []).join(' • ') || '—'}</div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border">
                      <h5 className="font-semibold mb-2">الوزن والأبعاد</h5>
                      <div className="text-sm text-gray-600">{specs.weight || laptop.details?.detailedSpecs?.weight || '—'}</div>
                      <div className="text-sm text-gray-600 mt-1">{specs.dimensions_mm || laptop.details?.detailedSpecs?.dimensions_mm || '—'}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* المراجعات */}
              {laptop.details?.reviews && (
                <div className="mt-6 bg-white p-6 rounded-2xl shadow-sm border">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold">المراجعات ({laptop.details.reviews.count})</h3>
                    <div className="text-sm text-gray-600">متوسط التقييم: <span className="font-semibold">{laptop.details.reviews.avgRating}</span></div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {laptop.details.reviews.items.slice(0, 6).map((r, i) => (
                      <div key={`review-${i}`} className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium">{r.user}</div>
                          <div className="text-sm text-gray-600">{r.rating} ⭐</div>
                        </div>
                        <div className="text-sm text-gray-700">{r.comment}</div>
                        <div className="text-xs text-gray-400 mt-2">{formatDate(r.date)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* منتجات ذات صلة */}
              {relatedProducts.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-2xl font-bold mb-4">منتجات ذات صلة</h3>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    {relatedProducts.map((rp) => (
                      <Link key={`related-${rp.id}`} href={`/laptop/${rp.id}`} className="block bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition">
                        <img src={rp.image} alt={rp.name} className="w-full h-28 object-cover rounded-lg mb-3" />
                        <div className="font-medium">{rp.name}</div>
                        <div className="text-sm text-gray-500">{formatPrice(rp.price)} {rp.currency || 'ج.م'}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* اكسسوارات */}
              {Array.isArray(laptop.details?.accessories) && laptop.details.accessories.length > 0 && (
                <div className="mt-6 bg-white p-4 rounded-xl border">
                  <h4 className="font-semibold mb-2">الملحقات المقترحة</h4>
                  <div className="flex flex-wrap gap-2">
                    {laptop.details.accessories.map((a, i) => (
                      <span key={`accessory-${i}`} className="px-3 py-1 bg-gray-100 rounded-full text-sm">{a}</span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* معرض الصور الموسع مع أسهم التنقل */}
      {Array.isArray(laptop.details?.gallery) && laptop.details.gallery.map((src, i) => (
        <div key={`lightbox-${i}`} id={`img-${i}`} className="lightbox">
          <a href="#" className="absolute inset-0 bg-black/80" aria-label="إغلاق"></a>
          
          <div className="lightbox-content">
            {i > 0 && (
              <a href={`#img-${i-1}`} className="lightbox-nav lightbox-prev" aria-label="الصورة السابقة">❮</a>
            )}
            
            <img src={src} alt={`${laptop.name} ${i + 1}`} />
            
            {i < laptop.details.gallery.length - 1 && (
              <a href={`#img-${i+1}`} className="lightbox-nav lightbox-next" aria-label="الصورة التالية">❯</a>
            )}
            
            <a href="#" className="lightbox-close" aria-label="إغلاق">✕</a>
          </div>
        </div>
      ))}
    </main>
  );
}