"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Search, Filter, Star, ShoppingCart, Heart, Eye, ArrowRight, 
  Cpu, HardDrive, MonitorSpeaker, Zap, Fan, MemoryStick, 
  Gamepad2, Wifi, Monitor, Headphones, ChevronLeft, ChevronRight,
  Settings, Thermometer, Activity
} from 'lucide-react';
import Link from 'next/link';

// مكون بطاقة التجميعة المحسن للأداء
const PCBuildCard = React.memo(({ product, favorites, toggleFavorite, index }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showSpecs, setShowSpecs] = useState(false);
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
        rootMargin: '200px 0px'
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

  // دالة حساب النجوم
  const renderStars = (rating = 0) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 transition-colors duration-200 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  // دالة تنسيق المواصفات مع ترجمة للعربية
  const renderSpecs = (specs) => {
    if (!specs || typeof specs !== 'object') return null;

    const specsTranslation = {
      processor: 'المعالج',
      graphics: 'كارت الرسوميات',
      memory: 'الذاكرة',
      storage: 'التخزين',
      motherboard: 'اللوحة الأم',
      psu: 'مزود الطاقة',
      case: 'الكيسة',
      cooling: 'نظام التبريد',
    };

    return (
      <div className="space-y-1 text-xs text-gray-600 mb-4">
        {Object.entries(specs)
          .slice(0, 4)
          .map(([key, value], idx) => (
            <div 
              key={key} 
              className="flex justify-between animate-fadeIn" 
              style={{ animationDelay: `${(idx + 2) * 100}ms` }}
            >
              <span className="capitalize">{specsTranslation[key.toLowerCase()] || key}:</span>
              <span className="font-medium text-purple-600">{String(value)}</span>
            </div>
          ))}
      </div>
    );
  };

  // دالة تحديد لون الأداء
  const getPerformanceColor = (score) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-500';
    if (score >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // دالة عرض المكونات الأساسية
  const renderComponents = (components) => {
    if (!components || !Array.isArray(components)) return null;
    
    return (
      <div className="bg-gray-50 rounded-xl p-3 mb-4">
        <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center">
          <Settings className="w-4 h-4 ml-1" />
          المكونات الأساسية:
        </h4>
        <div className="space-y-1 text-xs text-gray-600">
          {components.slice(0, 3).map((component, index) => (
            <div key={index} className="flex items-center">
              <div className="w-1 h-1 bg-purple-500 rounded-full ml-2"></div>
              <span>{component}</span>
            </div>
          ))}
          {components.length > 3 && (
            <div className="text-purple-600 font-medium">
              +{components.length - 3} مكونات أخرى
            </div>
          )}
        </div>
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
        transitionDelay: `${Math.min(index * 50, 300)}ms`
      }}
    >
      <Link href={`/pc-builds/${product.id}`} className="group block">
        <div className="bg-white rounded-3xl overflow-hidden shadow-lg group-hover:shadow-2xl transform group-hover:scale-105 transition-all duration-300">
          {/* صورة التجميعة */}
          <div className="relative overflow-hidden bg-gray-100">
            {/* Skeleton loader */}
            {!imageLoaded && isVisible && (
              <div className="w-full h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse"></div>
            )}
            
            {isVisible && (
              <img
                src={product.image || 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400'}
                alt={product.name || 'تجميعة كمبيوتر'}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400';
                }}
                className={`w-full h-48 object-cover group-hover:scale-110 transition-all duration-700 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'
                }`}
              />
            )}

            {/* الشارات */}
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

            {/* مؤشر الأداء */}
            {product.performanceScore && (
              <div className="absolute bottom-4 right-4">
                <div className={`${getPerformanceColor(product.performanceScore)} text-white px-2 py-1 rounded-full text-xs font-bold flex items-center`}>
                  <Activity className="w-3 h-3 ml-1" />
                  {product.performanceScore}%
                </div>
              </div>
            )}

            {/* استهلاك الطاقة */}
            {product.powerConsumption && (
              <div className="absolute bottom-4 left-4">
                <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                  <Zap className="w-3 h-3 ml-1" />
                  {product.powerConsumption}
                </div>
              </div>
            )}

            {/* أزرار التفاعل */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
              <button
                onClick={(e) => { 
                  e.preventDefault(); 
                  e.stopPropagation(); 
                  toggleFavorite(product.id); 
                }}
                className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 ${
                  favorites.includes(product.id)
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'bg-white/90 text-gray-700 hover:bg-white'
                }`}
              >
                <Heart className={`w-5 h-5 transition-all duration-300 ${
                  favorites.includes(product.id) ? 'fill-current scale-110' : ''
                }`} />
              </button>
              <button
                onClick={(e) => { 
                  e.preventDefault(); 
                  e.stopPropagation(); 
                  setShowSpecs(!showSpecs);
                }}
                className="p-3 bg-white/90 text-gray-700 rounded-full hover:bg-white transition-all duration-300 transform hover:scale-110"
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* معلومات التجميعة */}
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors duration-300">
              {product.name || 'اسم التجميعة غير متاح'}
            </h3>

            {/* التقييم */}
            {product.rating && (
              <div className="flex items-center mb-3">
                {renderStars(product.rating)}
                <span className="text-gray-600 text-sm mr-2">({product.rating.toFixed(1)})</span>
                <span className="text-xs text-gray-500 mr-2">
                  {product.reviewsCount || Math.floor(Math.random() * 100) + 50} مراجعة
                </span>
              </div>
            )}

            {/* المكونات الأساسية */}
            {showSpecs ? renderSpecs(product.specs) : renderComponents(product.components)}

            {/* البينشمارك */}
            {product.benchmarks && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-3 mb-4">
                <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center">
                  <Thermometer className="w-4 h-4 ml-1" />
                  نتائج الاختبارات:
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(product.benchmarks).slice(0, 2).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600">{key}:</span>
                      <span className="font-bold text-purple-600">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* السعر */}
            <div className="flex items-center justify-between mb-4">
              <div>
                {product.price ? (
                  <>
                    <span className="text-2xl font-bold text-purple-600">
                      {Number(product.price).toLocaleString()} {product.currency || 'جنيه'}
                    </span>
                    {product.originalPrice && (
                      <div className="text-sm text-gray-400 line-through">
                        {Number(product.originalPrice).toLocaleString()} {product.currency || 'جنيه'}
                      </div>
                    )}
                  </>
                ) : (
                  <span className="text-lg font-bold text-gray-500">السعر غير محدد</span>
                )}
              </div>
            </div>

            {/* معلومات إضافية */}
            <div className="flex items-center justify-between mb-4 text-xs text-gray-600">
              <span className="flex items-center">
                <Settings className="w-3 h-3 ml-1" />
                {product.assemblyTime || '2-3 أيام'}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                product.availability === 'متوفر' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {product.availability || 'متوفر'}
              </span>
            </div>

            {/* زر الإضافة للسلة */}
            <button
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-bold hover:from-purple-700 hover:to-blue-700"
            >
              <ShoppingCart className="w-4 h-4 inline mr-2" />
              أضف للسلة
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
});

// مكون الصفحات
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
      {/* معلومات النتائج */}
      <div className="text-gray-600 text-sm">
        عرض {startItem}-{endItem} من {totalItems} تجميعة
      </div>

      {/* أزرار التحكم في الصفحات */}
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

// مكون فلترة الأسعار
const PriceFilter = ({ priceRange, onPriceChange, filters }) => {
  if (!filters?.priceRanges) return null;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <h3 className="font-bold text-gray-800 mb-3">نطاق السعر</h3>
      <div className="space-y-2">
        {filters.priceRanges.map((range, index) => (
          <label key={index} className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="priceRange"
              checked={priceRange?.min === range.min && priceRange?.max === range.max}
              onChange={() => onPriceChange(range)}
              className="mr-2 text-purple-600"
            />
            <span className="text-sm text-gray-700">{range.label}</span>
          </label>
        ))}
        <button
          onClick={() => onPriceChange(null)}
          className="text-sm text-purple-600 hover:text-purple-800 mt-2"
        >
          مسح الفلتر
        </button>
      </div>
    </div>
  );
};

// المكون الرئيسي للعميل
const PCBuildsClient = ({ initialData, error }) => {
  const [data] = useState(initialData);
  const [filteredProducts, setFilteredProducts] = useState(initialData?.products || []);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // حالات الصفحات
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20); // عدد التجميعات في كل صفحة

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
    settings: Settings,
    default: Cpu,
  };

  // دالة للحصول على الأيقونة المناسبة
  const getIcon = (iconName) => {
    return iconMap[iconName?.toLowerCase()] || iconMap['default'];
  };

  // التصفية والبحث مع debouncing محسن
  const debouncedSearch = useMemo(() => {
    const timeoutRef = { current: null };
    
    return (searchTerm, category, sort, price) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      setIsSearching(true);
      
      timeoutRef.current = setTimeout(() => {
        if (!data || !data.products) return;

        let filtered = [...data.products];

        // فلترة حسب الفئة
        if (category !== 'all') {
          filtered = filtered.filter(product => product.category === category);
        }

        // فلترة حسب السعر
        if (price) {
          filtered = filtered.filter(product => {
            const productPrice = product.price || 0;
            return productPrice >= price.min && (price.max === Infinity || productPrice <= price.max);
          });
        }

        // فلترة حسب البحث المحسن
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase().trim();
          filtered = filtered.filter(product => {
            // البحث في الاسم
            if (product.name?.toLowerCase().includes(term)) return true;

            // البحث في المواصفات
            if (product.specs) {
              const specsValues = Object.values(product.specs)
                .join(' ')
                .toLowerCase();
              if (specsValues.includes(term)) return true;
            }

            // البحث في المكونات
            if (product.components && Array.isArray(product.components)) {
              if (product.components.some(component => 
                String(component).toLowerCase().includes(term)
              )) return true;
            }

            // البحث في الميزات
            if (product.features && Array.isArray(product.features)) {
              if (product.features.some(feature => 
                String(feature).toLowerCase().includes(term)
              )) return true;
            }

            // البحث في الشارات والوصف
            if (product.badge?.toLowerCase().includes(term)) return true;
            if (product.description?.toLowerCase().includes(term)) return true;
            if (product.category?.toLowerCase().includes(term)) return true;

            return false;
          });
        }

        // ترتيب المنتجات المحسن
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
          case 'power-efficiency':
            filtered.sort((a, b) => {
              const getEfficiency = (product) => {
                if (!product.powerConsumption) return 0;
                const power = parseInt(product.powerConsumption);
                const performance = product.performanceScore || 0;
                return power > 0 ? performance / power : 0;
              };
              return getEfficiency(b) - getEfficiency(a);
            });
            break;
          case 'popularity':
            filtered.sort((a, b) => {
              const popularityA = (a.rating || 0) * (a.reviewsCount || 1);
              const popularityB = (b.rating || 0) * (b.reviewsCount || 1);
              return popularityB - popularityA;
            });
            break;
          default:
            break;
        }

        setFilteredProducts(filtered);
        setCurrentPage(1);
        setIsSearching(false);
      }, 300);
    };
  }, [data]);

  useEffect(() => {
    debouncedSearch(searchQuery, activeCategory, sortBy, priceRange);
  }, [searchQuery, activeCategory, sortBy, priceRange, debouncedSearch]);

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
      document.getElementById('builds-section')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [totalPages]);

  const handlePriceChange = useCallback((range) => {
    setPriceRange(range);
  }, []);

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
          <Cpu className="w-24 h-24 text-gray-300 mx-auto mb-4 animate-bounce" />
          <p className="text-xl text-gray-600 mb-4">لا توجد بيانات تجميعات متاحة</p>
          <p className="text-sm text-gray-500">تم تحميل {data?.products?.length || 0} تجميعة</p>
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
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            {data.pageTitle || 'تجميعات الكمبيوتر'}
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
            {data.pageSubtitle || 'اختر من تجميعاتنا المتخصصة للألعاب والعمل والاستخدام المنزلي'}
          </p>
        </div>
      </section>

      {/* قسم البحث والفلترة */}
      <section className="bg-white py-8 shadow-sm sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* شريط البحث */}
            <div className="relative flex-1 max-w-2xl">
              <Search className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-all duration-300 ${
                isSearching ? 'animate-spin' : ''
              }`} />
              <input
                type="text"
                placeholder="ابحث في التجميعات والمكونات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-12 pl-4 py-3 rounded-full border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 focus:shadow-lg"
              />
            </div>

            <div className="flex items-center gap-4">
              {/* زر الفلاتر */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-3 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors duration-200 lg:hidden"
              >
                <Filter className="w-5 h-5 text-gray-400" />
              </button>

              {/* قائمة الترتيب */}
              <div className="flex items-center gap-4">
                <Filter className="text-gray-400 w-5 h-5" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 rounded-full border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-white transition-all duration-300 focus:shadow-lg"
                >
                  {data.filters && data.filters.sortOptions ? data.filters.sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  )) : (
                    <>
                      <option value="name">الاسم</option>
                      <option value="price-low">السعر: من الأقل للأعلى</option>
                      <option value="price-high">السعر: من الأعلى للأقل</option>
                      <option value="rating">التقييم</option>
                      <option value="performance">الأداء</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="text-gray-600 font-medium">
              <span className={`transition-all duration-300 ${isSearching ? 'opacity-50' : 'opacity-100'}`}>
                {filteredProducts.length} تجميعة متاحة
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* فلتر الفئات */}
      {data.categories && data.categories.length > 0 && (
        <section className="py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-4 justify-center">
              {data.categories.map(category => {
                const IconComponent = getIcon(category.icon);
                const productCount = category.id === 'all' 
                  ? data.products?.length || 0
                  : data.products?.filter(p => p.category === category.id).length || 0;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`group flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 ${
                      activeCategory === category.id
                        ? `bg-gradient-to-r ${category.color || 'from-purple-600 to-blue-600'} text-white shadow-lg scale-105`
                        : 'bg-white text-gray-700 hover:shadow-md border border-gray-200'
                    }`}
                  >
                    <IconComponent className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
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

      {/* المحتوى الرئيسي مع الفلاتر الجانبية */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* الفلاتر الجانبية */}
            <PriceFilter
              priceRange={priceRange}
              onPriceChange={handlePriceChange}
              filters={data.filters}
            />

          {/* شبكة التجميعات */}
          <div className="flex-1">
            <section id="builds-section">
              {isSearching ? (
                <div className="text-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">جاري البحث...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20">
                  <Cpu className="w-24 h-24 text-gray-300 mx-auto mb-4 animate-bounce" />
                  <h3 className="text-2xl font-bold text-gray-400 mb-2">لا توجد تجميعات</h3>
                  <p className="text-gray-500">
                    {searchQuery ? 'جرب تغيير كلمات البحث' : 'جرب تغيير معايير الفلترة'}
                  </p>
                  {(searchQuery || priceRange) && (
                    <div className="mt-4 space-x-2">
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="text-purple-600 hover:text-purple-800 font-medium mx-2"
                        >
                          مسح البحث
                        </button>
                      )}
                      {priceRange && (
                        <button
                          onClick={() => setPriceRange(null)}
                          className="text-purple-600 hover:text-purple-800 font-medium mx-2"
                        >
                          مسح فلتر السعر
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {currentProducts.map((product, index) => (
                      <PCBuildCard
                        key={`${product.id}-${currentPage}`}
                        product={product}
                        favorites={favorites}
                        toggleFavorite={toggleFavorite}
                        index={index}
                      />
                    ))}
                  </div>

                  {/* الصفحات */}
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
            </section>
          </div>
        </div>
      </div>

      {/* قسم الدعوة للعمل */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center text-white">
          <h2 className="text-4xl font-bold mb-6">تريد تجميعة مخصصة؟</h2>
          <p className="text-xl mb-8 opacity-90">
            دعنا نصمم لك التجميعة المثالية حسب احتياجاتك وميزانيتك مع ضمان التوافق الكامل
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-purple-600 px-8 py-3 rounded-full font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
              تجميعة مخصصة
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-purple-600 transition-all duration-300 transform hover:scale-105">
              استشارة فنية مجانية
              <ArrowRight className="w-5 h-5 inline mr-2" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

PCBuildCard.displayName = 'PCBuildCard';
export default PCBuildsClient;