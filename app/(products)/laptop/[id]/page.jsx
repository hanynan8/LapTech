
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamicParams = true;

export default async function ProductDetailsPage({ params }) {
  // جلب المنتج حسب id
  async function fetchLaptopById(id) {
    const res = await fetch(
      `https://restaurant-back-end.vercel.app/api/data?collection=laptop&id=${id}`,
      { next: { revalidate: 600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data[0] : data || null;
  }

  // جلب المنتجات ذات الصلة (فقط عند الحاجة) - نفس منطق الكود الأول
  async function fetchRelatedProducts(laptop) {
    try {
      // إذا كان المنتج يحتوي على relatedProducts IDs محددة
      if (Array.isArray(laptop?.details?.relatedProducts) && laptop.details.relatedProducts.length > 0) {
        const relatedPromises = laptop.details.relatedProducts.map(id => 
          fetch(`https://restaurant-back-end.vercel.app/api/data?collection=laptop&id=${id}`, 
                { next: { revalidate: 600 } })
            .then(res => res.ok ? res.json() : null)
            .catch(() => null)
        );
        
        const relatedResults = await Promise.all(relatedPromises);
        const validRelated = relatedResults.filter(product => product && product.id !== laptop.id);
        
        if (validRelated.length >= 8) {
          return validRelated.slice(0, 8);
        }
      }
      
      // إذا لم نحصل على عدد كافٍ، نجلب منتجات من نفس الفئة
      const categoryRes = await fetch(
        `https://restaurant-back-end.vercel.app/api/data?collection=laptop&category=${encodeURIComponent(laptop.category)}&limit=12`,
        { next: { revalidate: 600 } }
      );
      
      if (categoryRes.ok) {
        const categoryData = await categoryRes.json();
        let categoryProducts = [];
        
        // معالجة البيانات حسب البنية المتوقعة
        if (Array.isArray(categoryData) && categoryData.length > 0 && categoryData[0].products) {
          categoryProducts = categoryData[0].products;
        } else if (Array.isArray(categoryData)) {
          categoryProducts = categoryData;
        }
        
        // فلترة المنتج الحالي
        return categoryProducts.filter(product => product.id !== laptop.id).slice(0, 8);
      }
      
      return [];
    } catch (error) {
      console.error('خطأ في جلب المنتجات ذات الصلة:', error);
      return [];
    }
  }

  // جلب المنتج الرئيسي
  const laptop = await fetchLaptopById(params.id);
  if (!laptop) notFound();

  // جلب المنتجات ذات الصلة بشكل متوازي (غير مُحجِّم)
  const relatedProductsPromise = fetchRelatedProducts(laptop);

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

  // الحصول على المواصفات
  const specs = laptop.details?.detailedSpecs || laptop.specs || {};

  // انتظار المنتجات ذات الصلة
  const relatedProducts = await relatedProductsPromise;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white" dir="rtl">
      <style>{`
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15);
        }
        
        .fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .lightbox { 
          display: none; 
          align-items: center; 
          justify-content: center; 
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          z-index: 1000;
          padding: 2rem;
        }
        .lightbox:target { 
          display: flex; 
        }
        
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
        
        .lightbox-close, .lightbox-nav {
          background: white;
          color: #333;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        
        .lightbox-close:hover, .lightbox-nav:hover {
          background: #f3f4f6;
        }
        
        .lightbox-close {
          position: absolute;
          top: -40px;
          right: -10px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        
        .lightbox-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.5rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        
        .lightbox-prev { left: 20px; }
        .lightbox-next { right: 20px; }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .spec-card {
          background: white;
          border-radius: 1rem;
          padding: 1.5rem;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }

        .review-card {
          background: #fafafa;
          border: 1px solid #e5e7eb;
          border-right: 4px solid #8b5cf6;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header Section */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-8 fade-in">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 p-8">
            
            {/* صور المنتج */}
            <div className="xl:col-span-2">
              <div className="sticky top-8">
                {/* الصورة الرئيسية */}
                <div className="bg-gray-50 rounded-2xl p-6 mb-6 relative">
                  <img
                    src={laptop.image || laptop.details?.gallery?.[0] || ''}
                    alt={laptop.name}
                    className="w-full h-80 object-contain"
                  />
                  {laptop.badge && (
                    <span className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      {laptop.badge}
                    </span>
                  )}
                  {laptop.discount && (
                    <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      خصم {laptop.discount}%
                    </span>
                  )}
                </div>

                {/* معرض مصغر */}
                {Array.isArray(laptop.details?.gallery) && laptop.details.gallery.length > 0 && (
                  <div className="grid grid-cols-4 gap-3">
                    {laptop.details.gallery.slice(0, 4).map((src, i) => (
                      <a key={i} href={`#img-${i}`} className="bg-gray-50 rounded-xl p-2 card-hover">
                        <img 
                          src={src} 
                          alt={`${laptop.name} ${i + 1}`} 
                          className="w-full h-16 object-cover rounded-lg" 
                        />
                      </a>
                    ))}
                  </div>
                )}

                {/* معلومات سريعة */}
                <div className="bg-gray-50 rounded-2xl p-6 mt-6">
                  <h3 className="font-bold text-lg mb-4 text-gray-900">معلومات المنتج</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">الحالة</span>
                      <span className={`font-semibold ${laptop.details?.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {laptop.details?.stock > 0 ? `متوفر (${laptop.details.stock})` : 'غير متوفر'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">رقم المنتج</span>
                      <span className="font-medium text-gray-900">{laptop.details?.sku || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">الضمان</span>
                      <span className="font-medium text-gray-900">
                        {laptop.details?.warrantyMonths ? `${laptop.details.warrantyMonths} شهر` : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">تاريخ الإصدار</span>
                      <span className="font-medium text-gray-900">{formatDate(laptop.details?.releaseDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* تفاصيل المنتج */}
            <div className="xl:col-span-3 space-y-6">
              
              {/* اسم المنتج والسعر */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                    {laptop.category}
                  </span>
                  {laptop.rating && (
                    <div className="flex items-center gap-1">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-sm">
                            {i < Math.floor(laptop.rating) ? '★' : '☆'}
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({laptop.rating})</span>
                    </div>
                  )}
                </div>

                <h1 className="text-4xl font-bold text-gray-900 mb-4">{laptop.name}</h1>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-4xl font-bold text-purple-600">
                    {formatPrice(laptop.price)} {laptop.currency || 'ج.م'}
                  </div>
                  {laptop.originalPrice && (
                    <div className="text-xl text-gray-500 line-through">
                      {formatPrice(laptop.originalPrice)} {laptop.currency || 'ج.م'}
                    </div>
                  )}
                </div>
              </div>

              {/* مواصفات سريعة */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'المعالج', value: laptop.specs?.processor || specs.cpu, color: 'bg-blue-50 text-blue-700' },
                  { label: 'الذاكرة', value: laptop.specs?.ram || specs.ram, color: 'bg-green-50 text-green-700' },
                  { label: 'التخزين', value: laptop.specs?.storage || specs.storage, color: 'bg-purple-50 text-purple-700' },
                  { label: 'الرسوميات', value: laptop.specs?.graphics || specs.gpu, color: 'bg-orange-50 text-orange-700' }
                ].map((item, i) => (
                  <div key={i} className={`p-4 rounded-xl ${item.color}`}>
                    <div className="text-sm font-semibold mb-1">{item.label}</div>
                    <div className="text-xs font-medium truncate" title={item.value}>
                      {item.value || '—'}
                    </div>
                  </div>
                ))}
              </div>

              {/* أزرار الإجراء */}
              <div className="flex gap-4 pt-4">
                <button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  اطلب الآن
                </button>
                <button className="px-8 py-4 border-2 border-purple-600 text-purple-600 rounded-2xl font-bold hover:bg-purple-50 transition-colors">
                  المفضلة
                </button>
              </div>

              {/* الوصف */}
              {laptop.details?.longDescription && (
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">وصف المنتج</h3>
                  <p className="text-gray-700 leading-relaxed">{laptop.details.longDescription}</p>
                </div>
              )}

              {/* الميزات */}
              {laptop.features && laptop.features.length > 0 && (
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">الميزات الرئيسية</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {laptop.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-xl">
                        <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-700 font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* المواصفات التقنية */}
        {specs && Object.keys(specs).length > 0 && (
          <div className="bg-white rounded-3xl shadow-lg p-8 mb-8 fade-in">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">المواصفات التقنية الكاملة</h2>
            
            <div className="info-grid">
              {Object.entries(specs).map(([key, value]) => {
                if (!value || value === '—' || value === 'غير محدد') return null;
                
                let displayKey = key;
                switch(key) {
                  case 'cpu': displayKey = 'المعالج'; break;
                  case 'gpu': displayKey = 'كارت الرسوميات'; break;
                  case 'ram': displayKey = 'الذاكرة العشوائية'; break;
                  case 'storage': displayKey = 'وحدة التخزين'; break;
                  case 'display': displayKey = 'الشاشة'; break;
                  case 'resolution': displayKey = 'دقة الشاشة'; break;
                  case 'battery': displayKey = 'البطارية'; break;
                  case 'os': displayKey = 'نظام التشغيل'; break;
                  case 'weight': displayKey = 'الوزن'; break;
                  case 'dimensions_mm': displayKey = 'الأبعاد'; break;
                  case 'ports': displayKey = 'المنافذ'; break;
                }

                return (
                  <div key={key} className="spec-card card-hover">
                    <h4 className="font-bold text-lg text-purple-700 mb-3 border-b border-gray-200 pb-2">
                      {displayKey}
                    </h4>
                    <div className="text-gray-700">
                      {Array.isArray(value) ? (
                        <ul className="space-y-2">
                          {value.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="w-1 h-1 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                              <span className="leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="leading-relaxed">{String(value)}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* المراجعات */}
        {laptop.details?.reviews && laptop.details.reviews.count > 0 && (
          <div className="bg-white rounded-3xl shadow-lg p-8 mb-8 fade-in">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">آراء العملاء</h2>
              <div className="flex items-center justify-center gap-4">
                <div className="flex text-yellow-400 text-2xl">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>{i < Math.floor(laptop.details.reviews.avgRating) ? '★' : '☆'}</span>
                  ))}
                </div>
                <span className="text-2xl font-bold text-gray-900">{laptop.details.reviews.avgRating}</span>
                <span className="text-gray-600">({laptop.details.reviews.count} مراجعة)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {laptop.details.reviews.items?.slice(0, 6).map((review, index) => (
                <div key={index} className="review-card rounded-xl p-6 card-hover">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-bold text-lg text-purple-700">{review.user}</div>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3 leading-relaxed">{review.comment}</p>
                  <div className="text-sm text-gray-500">{formatDate(review.date)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* منتجات ذات صلة */}
        {relatedProducts.length > 0 && (
          <div className="bg-white rounded-3xl shadow-lg p-8 mb-8 fade-in">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">منتجات مشابهة</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 8).map((product) => (
                <Link key={product.id} href={`/laptop/${product.id}`} className="bg-gray-50 rounded-2xl p-4 card-hover border border-gray-200">
                  <div className="relative mb-4">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-40 object-contain" 
                    />
                    {product.discount && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        -{product.discount}%
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-lg mb-2 text-gray-900 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xl font-bold text-purple-600">
                      {formatPrice(product.price)} {product.currency || 'ج.م'}
                    </div>
                    {product.rating && (
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400 text-sm">★</span>
                        <span className="text-sm text-gray-600">{product.rating}</span>
                      </div>
                    )}
                  </div>
                  
                  {product.originalPrice && (
                    <div className="text-sm text-gray-500 line-through">
                      {formatPrice(product.originalPrice)} {product.currency || 'ج.م'}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* الملحقات */}
        {Array.isArray(laptop.details?.accessories) && laptop.details.accessories.length > 0 && (
          <div className="bg-white rounded-3xl shadow-lg p-8 fade-in">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">الملحقات المقترحة</h3>
            <div className="flex flex-wrap gap-3">
              {laptop.details.accessories.map((accessory, index) => (
                <span key={index} className="px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full text-sm font-medium border border-purple-200">
                  {accessory}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* معرض الصور */}
      {Array.isArray(laptop.details?.gallery) && laptop.details.gallery.map((src, i) => (
        <div key={`lightbox-${i}`} id={`img-${i}`} className="lightbox">
          <a href="#" className="absolute inset-0" aria-label="إغلاق"></a>
          
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