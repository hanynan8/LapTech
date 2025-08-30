'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import {
  Search,
  Loader,
  Filter,
  Star,
  ShoppingCart,
  Heart,
  Eye,
  ArrowRight,
  Headphones,
  Mouse,
  Keyboard,
  Smartphone,
  Cable,
  Camera,
  Watch,
  Gamepad2,
} from 'lucide-react';

const AccessoriesPage = () => {
  const [data, setData] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // تحميل البيانات من API
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          'https://restaurant-back-end.vercel.app/api/data'
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const apiData = await response.json();
        console.log('API Data:', apiData);

        // تحويل بيانات API إلى الهيكل المطلوب
        const transformedData = transformApiData(apiData);
        setData(transformedData);
        setFilteredProducts(transformedData.products);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // دالة تحويل بيانات API المحدثة
  const transformApiData = (apiData) => {
    console.log('Raw API Data:', apiData);

    // الوصول الصحيح لبيانات الاكسسوارات
    let accessoriesData = null;
    let allProducts = [];

    // البحث عن بيانات الاكسسوارات في هيكل API
    if (apiData && apiData.accessories && Array.isArray(apiData.accessories)) {
      accessoriesData = apiData.accessories[0]; // أخذ العنصر الأول
      console.log('Accessories Data Found:', accessoriesData);

      if (
        accessoriesData &&
        accessoriesData.products &&
        Array.isArray(accessoriesData.products)
      ) {
        allProducts = accessoriesData.products;
      }
    }

    console.log('Products found:', allProducts.length, allProducts);

    // في حالة عدم وجود منتجات، استخدم بيانات تجريبية
    if (allProducts.length === 0) {
      console.log('No products found, using fallback data');
      allProducts = getFallbackProducts();
    }

    // استخدام الفئات من البيانات أو فئات افتراضية
    let categories = [];
    if (
      accessoriesData &&
      accessoriesData.categories &&
      Array.isArray(accessoriesData.categories)
    ) {
      categories = accessoriesData.categories;
    } else {
      categories = getDefaultCategories();
    }

    // تحويل المنتجات للهيكل المطلوب
    const transformedProducts = allProducts.map((product, index) => {
      return {
        id: product.id || index + 1,
        name: product.name || 'منتج غير محدد',
        category: product.category || 'headphones',
        price:
          typeof product.price === 'number'
            ? product.price
            : parseInt(product.price?.toString().replace(/[^\d]/g, '') || '0'),
        currency: product.currency || 'ر.س',
        originalPrice: product.originalPrice
          ? typeof product.originalPrice === 'number'
            ? product.originalPrice
            : parseInt(product.originalPrice.toString().replace(/[^\d]/g, ''))
          : null,
        discount: product.discount
          ? parseInt(product.discount.toString().replace('%', ''))
          : null,
        rating: parseFloat(product.rating) || 4.0,
        image:
          product.image ||
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
        badge: product.badge || null,
        specs: product.specs || {
          connectivity: 'متاح',
          battery: 'جيدة',
          features: 'متنوعة',
        },
      };
    });

    console.log('Transformed Products:', transformedProducts);

    return {
      pageTitle: accessoriesData?.pageTitle || 'عالم الاكسسوارات التقنية',
      pageSubtitle:
        accessoriesData?.pageSubtitle ||
        'اكتشف أحدث الاكسسوارات التقنية لتعزيز تجربتك الرقمية',
      categories: categories,
      filters: accessoriesData?.filters || {
        sortOptions: [
          { value: 'name', label: 'الاسم' },
          { value: 'price-low', label: 'السعر: من الأقل للأعلى' },
          { value: 'price-high', label: 'السعر: من الأعلى للأقل' },
          { value: 'rating', label: 'التقييم' },
        ],
      },
      products: transformedProducts,
    };
  };

  // فئات افتراضية
  const getDefaultCategories = () => [
    {
      id: 'all',
      name: 'جميع الاكسسوارات',
      icon: 'smartphone',
      color: 'from-purple-600 to-blue-600',
    },
    {
      id: 'headphones',
      name: 'سماعات',
      icon: 'headphones',
      color: 'from-blue-600 to-cyan-600',
    },
    {
      id: 'mouse',
      name: 'فأرة الكمبيوتر',
      icon: 'mouse',
      color: 'from-green-600 to-emerald-600',
    },
    {
      id: 'keyboard',
      name: 'لوحة المفاتيح',
      icon: 'keyboard',
      color: 'from-red-600 to-pink-600',
    },
    {
      id: 'cables',
      name: 'كابلات وشواحن',
      icon: 'cable',
      color: 'from-orange-600 to-yellow-600',
    },
    {
      id: 'gaming',
      name: 'اكسسوارات الألعاب',
      icon: 'gamepad2',
      color: 'from-pink-600 to-rose-600',
    },
  ];

  // منتجات تجريبية في حالة فشل التحميل
  const getFallbackProducts = () => [
    {
      id: 1,
      name: 'سماعة بلوتوث لاسلكية',
      category: 'headphones',
      price: 299,
      currency: 'ر.س',
      rating: 4.5,
      image:
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
      badge: 'جديد',
      specs: {
        connectivity: 'Bluetooth 5.0',
        battery: '20 ساعة',
        features: 'إلغاء الضوضاء',
      },
    },
    {
      id: 2,
      name: 'فأرة ألعاب احترافية',
      category: 'mouse',
      price: 199,
      currency: 'ر.س',
      rating: 4.7,
      image:
        'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=300&fit=crop',
      specs: {
        dpi: '16000 DPI',
        buttons: '8 أزرار',
        connectivity: 'سلكي/لاسلكي',
      },
    },
    {
      id: 3,
      name: 'لوحة مفاتيح ميكانيكية',
      category: 'keyboard',
      price: 399,
      currency: 'ر.س',
      rating: 4.6,
      image:
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop',
      specs: {
        switches: 'Cherry MX Blue',
        backlight: 'RGB',
        connectivity: 'USB',
      },
    },
  ];

  // فلترة المنتجات حسب الفئة والبحث
  useEffect(() => {
    if (!data || !data.products) return;

    let filtered = data.products;

    // فلترة حسب الفئة
    if (activeCategory !== 'all') {
      filtered = filtered.filter(
        (product) => product.category === activeCategory
      );
    }

    // فلترة حسب البحث
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.specs &&
            Object.values(product.specs).some((spec) =>
              spec.toString().toLowerCase().includes(searchQuery.toLowerCase())
            ))
      );
    }

    // ترتيب المنتجات
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [data, activeCategory, searchQuery, sortBy]);

  const toggleFavorite = (productId) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const iconMap = {
    headphones: Headphones,
    mouse: Mouse,
    keyboard: Keyboard,
    smartphone: Smartphone,
    cable: Cable,
    camera: Camera,
    watch: Watch,
    gamepad2: Gamepad2,
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-slate-50 flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-xl text-gray-600">جاري تحميل الاكسسوارات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gray-100"
        dir="rtl"
      >
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">خطأ في تحميل البيانات</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (!data || !data.products || data.products.length === 0) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gray-100"
        dir="rtl"
      >
        <div className="text-center">
          <Smartphone className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-600 mb-4">
            لا توجد بيانات اكسسوارات متاحة
          </p>
          <p className="text-sm text-gray-500">
            تم تحميل {data?.products?.length || 0} منتج
          </p>
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
      <section className="bg-white py-8 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ابحث عن الاكسسوار المطلوب..."
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
                const IconComponent = iconMap[category.icon] || Smartphone;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`group flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 ${
                      activeCategory === category.id
                        ? 'bg-gradient-to-r ' +
                          category.color +
                          ' text-white shadow-lg'
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
              <Smartphone className="w-24 h-24 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-400 mb-2">
                لا توجد اكسسوارات
              </h3>
              <p className="text-gray-500">جرب تغيير معايير البحث أو الفلترة</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <Link
                  href={`/accessories/${product.id}`}
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
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => {
                            e.target.src =
                              'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop';
                          }}
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
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                          {product.name}
                        </h3>

                        {/* Rating */}
                        <div className="flex items-center mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(product.rating)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-gray-600 text-sm mr-2">
                            ({product.rating})
                          </span>
                        </div>

                        {/* Specs */}
                        {product.specs &&
                          Object.keys(product.specs).length > 0 && (
                            <div className="space-y-1 text-xs text-gray-600 mb-4">
                              {Object.entries(product.specs)
                                .slice(0, 3)
                                .map(([key, value]) => (
                                  <div
                                    key={key}
                                    className="flex justify-between"
                                  >
                                    <span>{key}:</span>
                                    <span className="font-medium">{value}</span>
                                  </div>
                                ))}
                            </div>
                          )}

                        {/* Price */}
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="text-2xl font-bold text-purple-600">
                              {product.price.toLocaleString()}{' '}
                              {product.currency}
                            </span>
                            {product.originalPrice && (
                              <div className="text-sm text-gray-400 line-through">
                                {product.originalPrice.toLocaleString()}{' '}
                                {product.currency}
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
          <h2 className="text-4xl font-bold mb-6">تحتاج اكسسوار معين؟</h2>
          <p className="text-xl mb-8 opacity-90">
            تواصل معنا وسنساعدك في العثور على الاكسسوار المثالي لاحتياجاتك
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-purple-600 px-8 py-3 rounded-full font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
              تواصل معنا
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-purple-600 transition-all duration-300">
              عرض جميع الاكسسوارات
              <ArrowRight className="w-5 h-5 inline mr-2" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AccessoriesPage;
