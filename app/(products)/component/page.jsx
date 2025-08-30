"use client";

import React, { useState, useEffect } from 'react';
import { Search, Loader, Filter, Star, ShoppingCart, Heart, Eye, ArrowRight, Cpu, HardDrive, MonitorSpeaker, Zap, Fan, MemoryStick, Gamepad2, Wifi, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';


const ComputerComponentsPage = () => {
  const [data, setData] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // دالة جلب البيانات من الـ API
  const fetchComponentsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://restaurant-back-end.vercel.app/api/data?collection=component');
      
      if (!response.ok) {
        throw new Error(`خطأ في الشبكة: ${response.status}`);
      }
      
      const apiData = await response.json();
      
      // التعامل مع هياكل البيانات المختلفة
      let processedData = null;
      
      if (Array.isArray(apiData)) {
        // إذا كانت البيانات مصفوفة، ابحث عن العنصر الذي يحتوي على البيانات
        const componentData = apiData.find(item => item.data || item.component);
        if (componentData) {
          processedData = componentData.data || componentData.component;
        }
      } else if (apiData.component) {
        processedData = apiData.component;
      } else if (apiData.data) {
        processedData = apiData.data;
      } else {
        processedData = apiData;
      }
      
      if (processedData) {
        setData(processedData);
        setFilteredProducts(processedData.products || []);
        setActiveCategory('all');
      } else {
        throw new Error('لا توجد بيانات للمكونات في الاستجابة');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'حدث خطأ في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  // تحميل البيانات عند بدء تشغيل المكون
  useEffect(() => {
    fetchComponentsData();
  }, []);

  // فلترة المنتجات حسب الفئة والبحث
  useEffect(() => {
    if (!data || !data.products) return;

    let filtered = [...data.products];

    // فلترة حسب الفئة
    if (activeCategory !== 'all') {
      filtered = filtered.filter(product => product.category === activeCategory);
    }

    // فلترة حسب البحث
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => {
        const nameMatch = product.name?.toLowerCase().includes(query);
        const categoryMatch = product.category?.toLowerCase().includes(query);
        const specsMatch = product.specs && Object.values(product.specs).some(spec => 
          String(spec).toLowerCase().includes(query)
        );
        return nameMatch || categoryMatch || specsMatch;
      });
    }

    // ترتيب المنتجات
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ar'));
        break;
      case 'price-low':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [data, activeCategory, searchQuery, sortBy]);

  const toggleFavorite = (productId) => {
    setFavorites(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const iconMap = {
    cpu: Cpu,
    'hard-drive': HardDrive,
    'monitor-speaker': MonitorSpeaker,
    zap: Zap,
    fan: Fan,
    'memory-stick': MemoryStick,
    gamepad2: Gamepad2,
    wifi: Wifi
  };

  // شاشة التحميل
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-xl text-gray-600">جاري تحميل البيانات...</p>
          <p className="text-sm text-gray-400 mt-2">الرجاء الانتظار...</p>
        </div>
      </div>
    );
  }

  // شاشة الخطأ
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100" dir="rtl">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">خطأ في تحميل البيانات</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchComponentsData}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  // التحقق من وجود البيانات
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100" dir="rtl">
        <div className="text-center">
          <Cpu className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600 mb-4">لا توجد بيانات متاحة</p>
          <button 
            onClick={fetchComponentsData}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full font-bold"
          >
            تحديث البيانات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Hero Section - البيانات من API */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            {data.pageTitle || 'مكونات الكمبيوتر'}
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
            {data.pageSubtitle || 'اختر أفضل قطع الكمبيوتر لتجميع جهازك المثالي'}
          </p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="bg-white py-8 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ابحث عن مكونات الكمبيوتر..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-12 pl-4 py-3 rounded-full border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300"
              />
            </div>

            {/* Sort Dropdown - البيانات من API */}
            <div className="flex items-center gap-4">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 rounded-full border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-white"
              >
                {data.filters?.sortOptions?.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                )) || (
                  <>
                    <option value="name">الاسم</option>
                    <option value="price-low">السعر: من الأقل للأعلى</option>
                    <option value="price-high">السعر: من الأعلى للأقل</option>
                    <option value="rating">التقييم</option>
                  </>
                )}
              </select>
            </div>

            <div className="text-gray-600">
              عرض {filteredProducts.length} من {data.products?.length || 0} منتج
            </div>
          </div>
        </div>
      </section>

      {/* Categories Filter - البيانات من API */}
      {data.categories && data.categories.length > 0 && (
        <section className="py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-4 justify-center">
              {data.categories.map(category => {
                const IconComponent = iconMap[category.icon] || Cpu;
                const productCount = category.id === 'all' 
                  ? data.products?.length || 0
                  : data.products?.filter(p => p.category === category.id).length || 0;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`group flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 ${
                      activeCategory === category.id
                        ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                        : 'bg-white text-gray-700 hover:shadow-md border border-gray-200'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{category.name}</span>
                    {activeCategory === category.id && (
                      <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                        {productCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Products Grid - البيانات من API */}
<section className="py-12">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {filteredProducts.length === 0 ? (
      <div className="text-center py-20">
        <Cpu className="w-24 h-24 text-gray-300 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-400 mb-2">لا توجد منتجات</h3>
        <p className="text-gray-500">
          {searchQuery ? 'جرب تغيير كلمات البحث' : 'جرب تغيير معايير الفلترة'}
        </p>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="mt-4 text-purple-600 hover:text-purple-800 font-medium"
            type="button"
          >
            مسح البحث
          </button>
        )}
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredProducts.map(product => (
          <Link href={`/component/${product.id}`} key={product.id} className="group block">
            <div className="bg-white rounded-3xl overflow-hidden shadow-lg group-hover:shadow-2xl transform group-hover:scale-105 transition-all duration-500">
              {/* Product Image */}
              <div className="relative overflow-hidden">
                <img 
                  src={product.image || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400'} 
                  alt={product.name || 'منتج'}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400'; }}
                />
                
                {/* Badges */}
                <div className="absolute top-4 right-4">
                  {product.badge && (
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                      {product.badge}
                    </span>
                  )}
                </div>
                
                {product.discount && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      خصم {product.discount}%
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite(product.id);
                    }}
                    className={`p-3 rounded-full transition-all duration-300 ${
                      favorites.includes(product.id)
                        ? 'bg-red-500 text-white'
                        : 'bg-white/90 text-gray-700 hover:bg-white'
                    }`}
                    aria-label="إضافة للمفضلة"
                  >
                    <Heart className={`w-5 h-5 ${favorites.includes(product.id) ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // مثال: فتح مودال معاينة بدل التنقل
                      viewProduct(product.id);
                    }}
                    className="p-3 bg-white/90 text-gray-700 rounded-full hover:bg-white transition-all duration-300"
                    aria-label="عرض سريع"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {product.name || 'اسم المنتج غير متاح'}
                </h3>
                
                {/* Rating */}
                {product.rating && (
                  <div className="flex items-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                    <span className="text-gray-600 text-sm mr-2">({product.rating})</span>
                  </div>
                )}

                {/* Specs */}
                {product.specs && Object.keys(product.specs).length > 0 && (
                  <div className="space-y-1 text-xs text-gray-600 mb-4">
                    {Object.entries(product.specs).slice(0, 3).map(([key, value], index) => (
                      <div key={index} className="flex justify-between">
                        <span className="capitalize">{key}:</span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    {product.price ? (
                      <>
                        <span className="text-2xl font-bold text-purple-600">
                          {Number(product.price).toLocaleString()} {product.currency || 'ج.م'}
                        </span>
                        {product.originalPrice && (
                          <div className="text-sm text-gray-400 line-through">
                            {Number(product.originalPrice).toLocaleString()} {product.currency || 'ج.م'}
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-lg font-bold text-gray-500">السعر غير محدد</span>
                    )}
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addToCart(product);
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-bold"
                >
                  أضف للسلة
                  <ShoppingCart className="w-4 h-4 inline mr-2" />
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    )}
  </div>
</section>


      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center text-white">
          <h2 className="text-4xl font-bold mb-6">تريد جهاز كمبيوتر كامل؟</h2>
          <p className="text-xl mb-8 opacity-90">دعنا نساعدك في تجميع جهازك المثالي بأفضل المكونات والأسعار</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-purple-600 px-8 py-3 rounded-full font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
              استشارة مجانية
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-purple-600 transition-all duration-300">
              عرض جميع المكونات
              <ArrowRight className="w-5 h-5 inline mr-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Refresh Button */}
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={fetchComponentsData}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
          title="تحديث البيانات"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
};

export default ComputerComponentsPage;