'use client';

import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Loader,
  Filter,
  Star,
  ShoppingCart,
  Heart,
  Eye,
  ArrowRight,
  Cpu,
  HardDrive,
  MonitorSpeaker,
  Zap,
  Fan,
  MemoryStick,
  Gamepad2,
  Wifi,
  Monitor,
  Headphones,
  Printer,
} from 'lucide-react';

const PrintersPage = () => {
  const [data, setData] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // خريطة الأيقونات الموسعة مع تغطية شاملة
  const iconMap = {
    cpu: Cpu,
    'hard-drive': HardDrive,
    'monitor-speaker': MonitorSpeaker,
    zap: Zap,
    fan: Fan,
    'memory-stick': MemoryStick,
    gamepad2: Gamepad2,
    wifi: Wifi,
    monitor: Monitor,
    headphones: Headphones,
    star: Star,
    printer: Printer,
    default: Printer,
  };

  // دالة للحصول على الأيقونة المناسبة
  const getIcon = (iconName) => {
    return iconMap[iconName?.toLowerCase()] || iconMap['default'];
  };

  // دالة جلب البيانات من API الفعلي
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        'https://restaurant-back-end.vercel.app/api/data?collection=printers',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          mode: 'cors',
          cache: 'no-cache',
        }
      );

      if (!response.ok) {
        throw new Error(
          `خطأ في الشبكة: ${response.status} - ${response.statusText}`
        );
      }

      const apiData = await response.json();
      console.log('البيانات المستلمة من API:', apiData);

      // البحث عن بيانات الطابعات
      let printerData = null;

      if (Array.isArray(apiData) && apiData.length > 0) {
        printerData = apiData[0];
      } else if (apiData && typeof apiData === 'object') {
        printerData = apiData;
      } else {
        throw new Error('لم يتم العثور على بيانات الطابعات في الاستجابة');
      }

      // التأكد من وجود البيانات الأساسية مع قيم افتراضية شاملة
      const processedData = {
        _id: printerData._id || 'printers-page',
        pageTitle: printerData.pageTitle || 'الطابعات',
        pageSubtitle:
          printerData.pageSubtitle ||
          'اكتشف أفضل الطابعات المكتبية والتجارية لجميع احتياجاتك',
        categories: printerData.categories || [
          {
            id: 'all',
            name: 'جميع المنتجات',
            icon: 'printer',
            color: 'from-purple-600 to-blue-600',
          },
        ],
        filters: printerData.filters || {
          sortOptions: [
            { value: 'name', label: 'الاسم' },
            { value: 'price-low', label: 'السعر: من الأقل للأعلى' },
            { value: 'price-high', label: 'السعر: من الأعلى للأقل' },
            { value: 'rating', label: 'التقييم' },
            { value: 'performance', label: 'الأداء' },
          ],
        },
        products: printerData.products || [],
      };

      setData(processedData);
      setFilteredProducts(processedData.products);
      setActiveCategory('all');
      setLoading(false);
      setRetryCount(0);
    } catch (err) {
      console.error('خطأ في جلب البيانات:', err);
      setError(`فشل في تحميل البيانات: ${err.message}`);
      setLoading(false);
    }
  };

  // تحميل البيانات عند بدء التطبيق
  useEffect(() => {
    fetchData();
  }, []);

  // دالة إعادة المحاولة
  const retryFetch = () => {
    if (retryCount < 5) {
      setRetryCount((prev) => prev + 1);
      fetchData();
    }
  };

  // حساب الفئات الديناميكية مع عدد المنتجات
  const categoriesWithCounts = useMemo(() => {
    if (!data || !data.categories || !data.products) return [];

    return data.categories.map((category) => ({
      ...category,
      count:
        category.id === 'all'
          ? data.products.length
          : data.products.filter((product) => product.category === category.id)
              .length,
    }));
  }, [data]);

  // فلترة وترتيب المنتجات بشكل متقدم
  useEffect(() => {
    if (!data || !data.products) return;

    let filtered = [...data.products];

    // فلترة حسب الفئة
    if (activeCategory !== 'all') {
      filtered = filtered.filter(
        (product) => product.category === activeCategory
      );
    }

    // فلترة حسب البحث (بحث محسّن في جميع الحقول)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((product) => {
        // البحث في الاسم
        if (product.name?.toLowerCase().includes(query)) return true;

        // البحث في المواصفات
        if (product.specs) {
          const specsValues = Object.values(product.specs)
            .join(' ')
            .toLowerCase();
          if (specsValues.includes(query)) return true;
        }

        // البحث في الباッج
        if (product.badge?.toLowerCase().includes(query)) return true;

        // البحث في الوصف
        if (product.description?.toLowerCase().includes(query)) return true;

        // البحث في الفئة
        if (product.category?.toLowerCase().includes(query)) return true;

        // البحث في المميزات
        if (product.features) {
          const featuresValues = product.features.join(' ').toLowerCase();
          if (featuresValues.includes(query)) return true;
        }

        return false;
      });
    }

    // ترتيب المنتجات
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) =>
          (a.name || '').localeCompare(b.name || '', 'ar')
        );
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
      case 'performance':
        filtered.sort(
          (a, b) => (b.performanceScore || 0) - (a.performanceScore || 0)
        );
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [data, activeCategory, searchQuery, sortBy]);

  // دالة تبديل المفضلة
  const toggleFavorite = (productId) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // دالة للحصول على لون التدرج
  const getGradientClasses = (colorString) => {
    if (!colorString) return 'from-purple-600 to-blue-600';
    return colorString;
  };

  // دالة تنسيق السعر المحسنة
  const formatPrice = (price, currency = 'جنيه') => {
    if (!price && price !== 0) return 'السعر غير متاح';
    try {
      return `${price.toLocaleString('ar-EG')} ${currency}`;
    } catch (e) {
      return `${price} ${currency}`;
    }
  };

  // دالة حساب التقييم بالنجوم
  const renderStars = (rating = 0) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  // دالة عرض المواصفات بشكل ديناميكي ومحسن
  const renderSpecs = (specs) => {
    if (!specs || typeof specs !== 'object') return null;

    // ترجمة مفاتيح المواصفات للعربية
    const specsTranslation = {
      type: 'النوع',
      speed: 'السرعة',
      connectivity: 'التوصيل',
      dpi: 'الدقة/DPI',
      capacity: 'السعة',
      interface: 'الواجهة',
      processor: 'المعالج',
      memory: 'الذاكرة',
      storage: 'التخزين',
      graphics: 'كرت الشاشة',
    };

    return (
      <div className="space-y-2 text-sm text-gray-600 mb-5">
        {Object.entries(specs)
          .slice(0, 3)
          .map(([key, value]) => (
            <div key={key} className="flex justify-between items-center">
              <span className="font-medium">{specsTranslation[key.toLowerCase()] || key}:</span>
              <span className="text-purple-600 font-semibold">{value}</span>
            </div>
          ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-slate-50 flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-xl text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">
            خطأ في تحميل البيانات: {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">خطأ في تحميل البيانات</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            {data.pageTitle}
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
            {data.pageSubtitle}
          </p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="bg-white py-8 shadow-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ابحث في الطابعات والمواصفات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-12 pl-4 py-3 rounded-full border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-4">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 rounded-full border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-white"
              >
                {data.filters &&
                  data.filters.sortOptions &&
                  data.filters.sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
              </select>
            </div>

            <div className="text-gray-600">
              عرض {filteredProducts.length} من {data.products.length} منتج
            </div>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 justify-center">
            {data.categories &&
              data.categories.map((category) => {
                const IconComponent = getIcon(category.icon);
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`group flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 ${
                      activeCategory === category.id
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:shadow-md border border-gray-200'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{category.name}</span>
                    {activeCategory === category.id && (
                      <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                        {category.id === 'all'
                          ? data.products.length
                          : data.products.filter(
                              (p) => p.category === category.id
                            ).length}
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <Printer className="w-24 h-24 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-400 mb-2">
                لا توجد منتجات
              </h3>
              <p className="text-gray-500">جرب تغيير معايير البحث أو الفلترة</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <Link
                  href={`/printers/${product.id}`}
                  key={product.id}
                  className="group block"
                >
                  <div key={product.id} className="group">
                    <div className="bg-white rounded-3xl overflow-hidden shadow-lg group-hover:shadow-2xl transform group-hover:scale-105 transition-all duration-500">
                      {/* Product Image */}
                      <div className="relative overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
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
                            onClick={() => toggleFavorite(product.id)}
                            className={`p-3 rounded-full transition-all duration-300 ${
                              favorites.includes(product.id)
                                ? 'bg-red-500 text-white'
                                : 'bg-white/90 text-gray-700 hover:bg-white'
                            }`}
                          >
                            <Heart
                              className={`w-5 h-5 ${
                                favorites.includes(product.id)
                                  ? 'fill-current'
                                  : ''
                              }`}
                            />
                          </button>
                          <button className="p-3 bg-white/90 text-gray-700 rounded-full hover:bg-white transition-all duration-300">
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
                          {product.name}
                        </h3>

                        {/* Rating */}
                        <div className="flex items-center mb-4">
                          {renderStars(product.rating)}
                          <span className="text-gray-600 text-sm mr-2">
                            ({product.rating})
                          </span>
                        </div>

                        {/* Specs */}
                        {renderSpecs(product.specs)}

                        {/* Price */}
                        <div className="flex items-center justify-between mb-5">
                          <div>
                            <span className="text-2xl font-bold text-purple-600">
                              {product.price
                                ? product.price.toLocaleString()
                                : 'السعر غير متاح'}{' '}
                              {product.currency || 'جنيه'}
                            </span>
                            {product.originalPrice && (
                              <div className="text-sm text-gray-400 line-through mt-1">
                                {product.originalPrice.toLocaleString()}{' '}
                                {product.currency || 'جنيه'}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-bold">
                          أضف للسلة
                          <ShoppingCart className="w-4 h-4 inline mr-2" />
                        </button>
                      </div>
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
          <h2 className="text-4xl font-bold mb-6">
            تحتاج طابعة مخصصة أو حزمة طباعة؟
          </h2>
          <p className="text-xl mb-8 opacity-90">
            اخبرنا نوع الاستخدام (متجر، مطعم، مكتب) وسنقترح أفضل الطابعات والحزم
            مع تركيب ودعم
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-purple-600 px-8 py-3 rounded-full font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
              طابعة مخصصة
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-purple-600 transition-all duration-300">
              استشارة فنية مجانية
              <ArrowRight className="w-5 h-5 inline mr-2" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrintersPage;