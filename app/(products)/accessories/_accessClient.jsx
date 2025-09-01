"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Search, Filter, Star, ShoppingCart, Heart, Eye, ArrowRight, Headphones, Mouse, Keyboard, Smartphone, Cable, Camera, Watch, Gamepad2, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// دالة WhatsApp المحدثة مع معلومات الاكسسوار
function goToWatssap(product = null, phoneNumber = '+2001201061216') {
  let message = 'السلام عليكم ورحمة الله وبركاته\n';

  if (product) {
    // رسالة مع معلومات الاكسسوار
    message += `أريد الاستفسار عن هذا الاكسسوار:\n\n`;
    message += `🎧 *${product.name}*\n\n`;

    // المواصفات (إذا كانت متاحة)
    if (product.specs && Object.keys(product.specs).length > 0) {
      message += `📋 *المواصفات:*\n`;
      Object.entries(product.specs).forEach(([key, value]) => {
        message += `• ${key}: ${value}\n`;
      });
      message += `\n`;
    }

    // السعر
    message += `💰 *السعر:* ${
      typeof product.price === 'number'
        ? product.price.toLocaleString()
        : product.price
    } ${product.currency}`;

    if (product.originalPrice && product.discount) {
      message += `\n🔥 *خصم ${product.discount}%* من ${
        typeof product.originalPrice === 'number'
          ? product.originalPrice.toLocaleString()
          : product.originalPrice
      } ${product.currency}`;
    }

    message += `\n\n⭐ *التقييم:* ${product.rating}/5\n\n`;

    // صورة المنتج (رابط)
    if (product.image) {
      message += `🖼️ *صورة المنتج:*\n${product.image}\n\n`;
    }

    message += `🛒 أرغب في الحصول على مزيد من التفاصيل والطلب\n`;
    message += `📞 يرجى التواصل معي في أقرب وقت ممكن`;
  } else {
    // رسالة عامة
    message += 'أريد الاستفسار عن الاكسسوارات المتاحة\n';
    message += 'يرجى التواصل معي للمساعدة في اختيار الاكسسوار المناسب';
  }

  // تشفير الرسالة للـ URL
  const encodedMessage = encodeURIComponent(message);

  // فتح WhatsApp مع الرسالة
  window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`);
}

// Accessory Card Component محسن للأداء
const AccessoryCard = React.memo(({ product, favorites, toggleFavorite, index, whatsappNumber }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '100px 0px' // تحميل مبكر أكثر
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`transition-all duration-500 ease-out transform ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-4'
      }`}
      style={{ 
        transitionDelay: `${Math.min(index * 50, 300)}ms` // حد أقصى 300ms
      }}
    >
      <Link href={`/accessories/${product.id}`} className="group block">
        <div className="bg-white rounded-3xl overflow-hidden shadow-lg group-hover:shadow-2xl transform group-hover:scale-105 transition-all duration-300">
          {/* Product Image */}
          <div className="relative overflow-hidden bg-gray-100">
            {/* Skeleton loader */}
            {!imageLoaded && isVisible && (
              <div className="w-full h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse"></div>
            )}
            
            {isVisible && (
              <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop';
                }}
                className={`w-full h-48 object-cover group-hover:scale-110 transition-all duration-700 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'
                }`}
              />
            )}

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
                <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-bounce">
                  خصم {product.discount}%
                </span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors duration-300">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center mb-3">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 transition-colors duration-200 ${
                    i < Math.floor(product.rating) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="text-gray-600 text-sm mr-2">({product.rating})</span>
            </div>

            {/* Specs */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="space-y-1 text-xs text-gray-600 mb-4">
                {Object.entries(product.specs)
                  .slice(0, 3)
                  .map(([key, value], idx) => (
                    <div key={key} className="flex justify-between animate-fadeIn" style={{ animationDelay: `${(idx + 2) * 100}ms` }}>
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
                  {typeof product.price === 'number' ? product.price.toLocaleString() : product.price} {product.currency}
                </span>
                {product.originalPrice && (
                  <div className="text-sm text-gray-400 line-through">
                    {typeof product.originalPrice === 'number' ? product.originalPrice.toLocaleString() : product.originalPrice} {product.currency}
                  </div>
                )}
              </div>
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex gap-2">
              {/* زر الطلب الرئيسي */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goToWatssap(product, whatsappNumber); // تمرير معلومات الاكسسوار
                }}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-bold hover:from-purple-700 hover:to-blue-700"
              >
                <ShoppingCart className="w-4 h-4 inline mr-2" />
                اطلب الان
              </button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
});

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      {/* Results Info */}
      <div className="text-gray-600 text-sm">
        عرض {startItem}-{endItem} من {totalItems} اكسسوار
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            className={`px-3 py-2 rounded-lg transition-all duration-200 ${
              page === currentPage
                ? 'bg-purple-600 text-white shadow-lg'
                : page === '...'
                ? 'cursor-default text-gray-400'
                : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
            }`}
            disabled={page === '...'}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Main Accessories Client Component
const AccessoriesClient = ({ initialData, error }) => {
  const [data] = useState(initialData);
  const [filteredProducts, setFilteredProducts] = useState(initialData?.products || []);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [favorites, setFavorites] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(24); // عدد الاكسسوارات في كل صفحة

  // الحصول على رقم الواتساب من البيانات
  const whatsappNumber = data?.settings?.whatsappNumber || '+2001201061216';

  // التصفية والبحث مع debouncing
  const debouncedSearch = useMemo(() => {
    const timeoutRef = { current: null };
    
    return (searchTerm, category, sort) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      setIsSearching(true);
      
      timeoutRef.current = setTimeout(() => {
        if (!data || !data.products) return;

        let filtered = data.products;

        // فلترة حسب الفئة
        if (category !== 'all') {
          filtered = filtered.filter(product => product.category === category);
        }

        // فلترة حسب البحث
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          filtered = filtered.filter(product =>
            product.name.toLowerCase().includes(term) ||
            (product.specs && Object.values(product.specs).some(spec =>
              spec.toString().toLowerCase().includes(term)
            ))
          );
        }

        // ترتيب المنتجات
        switch (sort) {
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
        setCurrentPage(1); // العودة للصفحة الأولى بعد التصفية
        setIsSearching(false);
      }, 300);
    };
  }, [data]);

  useEffect(() => {
    debouncedSearch(searchQuery, activeCategory, sortBy);
  }, [searchQuery, activeCategory, sortBy, debouncedSearch]);

  const toggleFavorite = useCallback((productId) => {
    setFavorites(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  }, []);

  // حساب المنتجات للصفحة الحالية
  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handlePageChange = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // التنقل إلى أعلى قسم المنتجات
      document.getElementById('accessories-section')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [totalPages]);

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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100" dir="rtl">
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
      <div className="min-h-screen flex items-center justify-center bg-gray-100" dir="rtl">
        <div className="text-center">
          <Smartphone className="w-24 h-24 text-gray-300 mx-auto mb-4 animate-bounce" />
          <p className="text-xl text-gray-600 mb-4">لا توجد بيانات اكسسوارات متاحة</p>
          <p className="text-sm text-gray-500">تم تحميل {data?.products?.length || 0} منتج</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* CSS للتحكم في الأنيميشن */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>

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
      <section className="bg-white py-8 shadow-sm sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-2xl">
              <Search className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-all duration-300 ${
                isSearching ? 'animate-spin' : ''
              }`} />
              <input
                type="text"
                placeholder="ابحث عن الاكسسوار المطلوب..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-12 pl-4 py-3 rounded-full border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 focus:shadow-lg"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-4">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 rounded-full border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-white transition-all duration-300 focus:shadow-lg"
              >
                {data.filters && data.filters.sortOptions && data.filters.sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-gray-600 font-medium">
              <span className={`transition-all duration-300 ${isSearching ? 'opacity-50' : 'opacity-100'}`}>
                {filteredProducts.length} اكسسوار متاح
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 justify-center">
            {data.categories && data.categories.map((category, index) => {
              const IconComponent = iconMap[category.icon] || Smartphone;
              return (
                <button
                  key={category.id || `category-${index}`}
                  onClick={() => setActiveCategory(category.id)}
                  className={`group flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 ${
                    activeCategory === category.id
                      ? 'bg-gradient-to-r ' + category.color + ' text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 hover:shadow-md border border-gray-200'
                  }`}
                >
                  <IconComponent className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
                  <span className="font-medium">{category.name}</span>
                  {activeCategory === category.id && (
                    <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                      {category.id === 'all' 
                        ? filteredProducts.length
                        : filteredProducts.filter(p => p.category === category.id).length
                      }
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Accessories Grid */}
      <section id="accessories-section" className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isSearching ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">جاري البحث...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <Smartphone className="w-24 h-24 text-gray-300 mx-auto mb-4 animate-bounce" />
              <h3 className="text-2xl font-bold text-gray-400 mb-2">لا توجد اكسسوارات</h3>
              <p className="text-gray-500">جرب تغيير معايير البحث أو الفلترة</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {currentProducts.map((product, index) => (
                  <AccessoryCard
                    key={`${product.id}-${currentPage}`}
                    product={product}
                    favorites={favorites}
                    toggleFavorite={toggleFavorite}
                    index={index}
                    whatsappNumber={whatsappNumber}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  totalItems={filteredProducts.length}
                  itemsPerPage={itemsPerPage}
                />
              )}
            </>
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
            <button
              onClick={() => {
                goToWatssap(null, whatsappNumber); // رسالة عامة مع الرقم الديناميكي
              }}
              className="bg-white text-purple-600 px-8 py-3 rounded-full font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              تواصل معنا
            </button>
            <Link href="/accessories">
              <button className="border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-purple-600 transition-all duration-300 transform hover:scale-105">
                عرض جميع الاكسسوارات
                <ArrowRight className="w-5 h-5 inline mr-2" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AccessoriesClient;