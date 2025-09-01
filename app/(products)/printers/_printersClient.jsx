// app/printers/_printersClient.js (Client Component)
'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Star, 
  ShoppingCart, 
  Heart, 
  Eye, 
  ArrowRight, 
  Printer,
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
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

// دالة WhatsApp المحدثة مع معلومات المنتج
function goToWatssap(product = null, phoneNumber = '+201201061216') {
  let message = 'السلام عليكم ورحمة الله وبركاته\n';

  if (product) {
    // رسالة مع معلومات المنتج
    message += `أريد الاستفسار عن هذا المنتج:\n\n`;
    message += `📱 *${product.name}*\n\n`;

    // المواصفات
    if (product.specs) {
      message += `📋 *المواصفات:*\n`;
      Object.entries(product.specs).forEach(([key, value]) => {
        message += `🔧 ${key}: ${value}\n`;
      });
      message += `\n`;
    }

    // السعر
    message += `💰 *السعر:* ${
      typeof product.price === 'number'
        ? product.price.toLocaleString()
        : product.price
    } ${product.currency || 'ر.س'}`;

    if (product.originalPrice && product.discount) {
      message += `\n🔥 *خصم ${product.discount}%* من ${
        typeof product.originalPrice === 'number'
          ? product.originalPrice.toLocaleString()
          : product.originalPrice
      } ${product.currency || 'ر.س'}`;
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
    message += 'أريد الاستفسار عن منتجاتكم\n';
    message += 'يرجى التواصل معي للمساعدة في اختيار المنتج المناسب';
  }

  // تشفير الرسالة للـ URL
  const encodedMessage = encodeURIComponent(message);

  // فتح WhatsApp مع الرسالة
  window.open(`https://wa.me/${phoneNumber.replace('+', '')}?text=${encodedMessage}`);
}

// Product Card Component محسن للأداء مع تحسينات خاصة بالطابعات
const ProductCard = React.memo(({ product, favorites, toggleFavorite, index, whatsappNumber }) => {
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
      printspeed: 'سرعة الطباعة',
      resolution: 'الدقة',
    };

    return (
      <div className="space-y-1 text-xs text-gray-600 mb-4">
        {Object.entries(specs)
          .slice(0, 3)
          .map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span>{specsTranslation[key.toLowerCase()] || key}:</span>
              <span className="font-medium text-purple-600">{value}</span>
            </div>
          ))}
      </div>
    );
  };

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
      <Link href={`/printers/${product.id}`} className="group block">
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
                <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
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
                    i < Math.floor(product.rating || 0) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="text-gray-600 text-sm mr-2">({product.rating || 0})</span>
            </div>

            {/* Specs */}
            {renderSpecs(product.specs)}

            {/* Price */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-2xl font-bold text-purple-600">
                  {typeof product.price === 'number' ? product.price.toLocaleString() : product.price} {product.currency || 'جنيه'}
                </span>
                {product.originalPrice && (
                  <div className="text-sm text-gray-400 line-through">
                    {typeof product.originalPrice === 'number' ? product.originalPrice.toLocaleString() : product.originalPrice} {product.currency || 'جنيه'}
                  </div>
                )}
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                goToWatssap(product, whatsappNumber);
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-bold hover:from-purple-700 hover:to-blue-700"
            >
              <ShoppingCart className="w-4 h-4 inline mr-2" />
              اطلب الان
            </button>
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
        عرض {startItem}-{endItem} من {totalItems} منتج
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

// Main Client Component
const PrintersClient = ({ initialData }) => {
  const [data] = useState(initialData);
  const [filteredProducts, setFilteredProducts] = useState(initialData?.products || []);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [favorites, setFavorites] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(24); // عدد المنتجات في كل صفحة

  // الحصول على رقم الواتساب من البيانات وتصحيحه
  const whatsappNumber = useMemo(() => {
    let number = data?.settings?.whatsappNumber || '+201201061216';
    // إضافة علامة + إذا لم تكن موجودة
    if (number && !number.startsWith('+')) {
      number = '+' + number;
    }
    return number;
  }, [data?.settings?.whatsappNumber]);

  // خريطة الأيقونات الموسعة
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

  // التصفية والبحث مع debouncing
  const debouncedSearch = useMemo(() => {
    const timeoutRef = { current: null };
    
    return (searchTerm, category, sort) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      setIsSearching(true);
      
      timeoutRef.current = setTimeout(() => {
        if (!data) return;

        let filtered = data.products || [];

        // فلترة حسب الفئة
        if (category !== 'all') {
          filtered = filtered.filter(product => product.category === category);
        }

        // فلترة حسب البحث (بحث محسّن في جميع الحقول)
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase();
          filtered = filtered.filter(product => {
            // البحث في الاسم
            if (product.name?.toLowerCase().includes(query)) return true;

            // البحث في المواصفات
            if (product.specs) {
              const specsValues = Object.values(product.specs).join(' ').toLowerCase();
              if (specsValues.includes(query)) return true;
            }

            // البحث في الباッج
            if (product.badge?.toLowerCase().includes(query)) return true;

            // البحث في الوصف
            if (product.description?.toLowerCase().includes(query)) return true;

            // البحث في الفئة
            if (product.category?.toLowerCase().includes(query)) return true;

            return false;
          });
        }

        // ترتيب المنتجات
        switch (sort) {
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
          case 'performance':
            filtered.sort((a, b) => (b.performanceScore || 0) - (a.performanceScore || 0));
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
      document.getElementById('products-section')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [totalPages]);

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
                placeholder="ابحث في الطابعات والمواصفات..."
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
                {filteredProducts.length} منتج متاح
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 justify-center">
            {data.categories && data.categories.map((category) => {
              const IconComponent = getIcon(category.icon);
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`group flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 ${
                    activeCategory === category.id
                      ? 'bg-gradient-to-r ' + (category.color || 'from-purple-600 to-blue-600') + ' text-white shadow-lg scale-105'
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

      {/* Products Grid */}
      <section id="products-section" className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isSearching ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">جاري البحث...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <Printer className="w-24 h-24 text-gray-300 mx-auto mb-4 animate-bounce" />
              <h3 className="text-2xl font-bold text-gray-400 mb-2">لا توجد منتجات</h3>
              <p className="text-gray-500">جرب تغيير معايير البحث أو الفلترة</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {currentProducts.map((product, index) => (
                  <ProductCard
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
          <h2 className="text-4xl font-bold mb-6">تحتاج طابعة مخصصة أو حزمة طباعة؟</h2>
          <p className="text-xl mb-8 opacity-90">
            أخبرنا نوع الاستخدام (متجر، مطعم، مكتب) وسنقترح أفضل الطابعات والحزم مع تركيب ودعم
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => {
                goToWatssap(null, whatsappNumber);
              }}
              className="bg-white text-purple-600 px-8 py-3 rounded-full font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              تواصل معنا عبر الواتساب
            </button>
            <button onClick={() => {
                goToWatssap(null, whatsappNumber);
              }}
              className="border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-purple-600 transition-all duration-300 transform hover:scale-105">
              استشارة فنية مجانية
              <ArrowRight className="w-5 h-5 inline mr-2" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrintersClient;