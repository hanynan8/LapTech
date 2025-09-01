'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
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
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
} from 'lucide-react';

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

// مكون كارت المنتج المحسن للأداء
const ProductCard = React.memo(({ product, favorites, toggleFavorite, index }) => {
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
        rootMargin: '200px 0px' // تحميل مبكر أكثر للأداء الأفضل
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

  // خريطة الأيقونات
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
    default: Cpu,
  };

  const getIcon = (iconName) => {
    return iconMap[iconName?.toLowerCase()] || iconMap['default'];
  };

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

  const renderSpecs = (specs) => {
    if (!specs || typeof specs !== 'object') return null;

    const specsTranslation = {
      processor: 'المعالج',
      memory: 'الذاكرة',
      storage: 'التخزين',
      display: 'الشاشة',
      type: 'النوع',
      interface: 'الواجهة',
      speed: 'السرعة',
      capacity: 'السعة',
      graphics: 'كرت الشاشة',
    };

    return (
      <div className="space-y-1 text-xs text-gray-600 mb-4">
        {Object.entries(specs)
          .slice(0, 3)
          .map(([key, value], idx) => (
            <div key={key} className="flex justify-between animate-fadeIn" style={{ animationDelay: `${(idx + 2) * 100}ms` }}>
              <span>{specsTranslation[key.toLowerCase()] || key}:</span>
              <span className="font-medium">{value}</span>
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
        transitionDelay: `${Math.min(index * 50, 300)}ms`
      }}
    >
      <Link href={`/pos/${product.id}`} className="group block">
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
                  e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop';
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
              {renderStars(product.rating)}
              <span className="text-gray-600 text-sm mr-2">({product.rating})</span>
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
                goToWatssap(product);
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

// مكون Pagination محسن للأعداد الكبيرة
const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 9; // زيادة عدد الصفحات المرئية
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 5) {
        for (let i = 1; i <= 7; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 4) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 6; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
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
      <div className="flex items-center gap-1 flex-wrap justify-center">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
        >
          الأولى
        </button>
        
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

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
        >
          الأخيرة
        </button>
      </div>

      {/* Page Size Selector */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>عدد المنتجات في الصفحة:</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onPageChange(1, parseInt(e.target.value))}
          className="px-2 py-1 border border-gray-300 rounded text-sm"
        >
          <option value={24}>24</option>
          <option value={48}>48</option>
          <option value={96}>96</option>
        </select>
      </div>
    </div>
  );
};

// مكون الفلاتر المتقدمة
const AdvancedFilters = ({ filters, onFiltersChange, isOpen, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const applyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const clearFilters = () => {
    const clearedFilters = {
      priceRange: null,
      brand: null,
      features: [],
      rating: null,
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">فلاتر متقدمة</h3>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3">نطاق السعر</h4>
          <div className="space-y-2">
            {/* Add price range options here */}
          </div>
        </div>

        {/* Brands */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3">الماركات</h4>
          <div className="space-y-2">
            {/* Add brand options here */}
          </div>
        </div>

        {/* Features */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3">المميزات</h4>
          <div className="space-y-2">
            {/* Add feature options here */}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={applyFilters}
            className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-semibold"
          >
            تطبيق الفلاتر
          </button>
          <button
            onClick={clearFilters}
            className="px-4 py-3 border border-gray-300 rounded-xl"
          >
            مسح
          </button>
        </div>
      </div>
    </div>
  );
};

// المكون الرئيسي للعميل
const POSClient = ({ initialData, error }) => {
  const [data] = useState(initialData);
  const [filteredProducts, setFilteredProducts] = useState(initialData?.products || []);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [favorites, setFavorites] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    priceRange: null,
    brand: null,
    features: [],
    rating: null,
  });
  
  // Pagination states - محسن للأعداد الكبيرة
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24); // يمكن تغييره حسب الحاجة

  // التصفية والبحث مع debouncing محسن
  const debouncedSearch = useMemo(() => {
    const timeoutRef = { current: null };
    
    return (searchTerm, category, sort, filters) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      setIsSearching(true);
      
      timeoutRef.current = setTimeout(() => {
        if (!data || !data.products) return;

        let filtered = [...data.products]; // نسخة من المصفوفة

        // فلترة حسب الفئة
        if (category !== 'all') {
          filtered = filtered.filter(product => product.category === category);
        }

        // فلترة حسب البحث المحسن
        if (searchTerm.trim()) {
          const terms = searchTerm.toLowerCase().trim().split(' ');
          filtered = filtered.filter(product => {
            const searchableText = [
              product.name,
              product.description,
              product.badge,
              product.category,
              product.brand,
              ...(product.features || []),
              ...Object.values(product.specs || {})
            ].join(' ').toLowerCase();

            return terms.every(term => searchableText.includes(term));
          });
        }

        // تطبيق الفلاتر المتقدمة
        if (filters.priceRange) {
          filtered = filtered.filter(product => {
            const price = product.price || 0;
            return price >= filters.priceRange.min && price <= filters.priceRange.max;
          });
        }

        if (filters.brand) {
          filtered = filtered.filter(product => 
            product.brand?.toLowerCase() === filters.brand.toLowerCase()
          );
        }

        if (filters.features.length > 0) {
          filtered = filtered.filter(product =>
            filters.features.every(feature =>
              product.features?.some(f => f.toLowerCase().includes(feature.toLowerCase()))
            )
          );
        }

        if (filters.rating) {
          filtered = filtered.filter(product => 
            (product.rating || 0) >= filters.rating
          );
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
          case 'newest':
            filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            break;
          case 'popular':
            filtered.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
            break;
          default:
            break;
        }

        setFilteredProducts(filtered);
        setCurrentPage(1); // العودة للصفحة الأولى بعد التصفية
        setIsSearching(false);
      }, 200); // تقليل وقت التأخير لاستجابة أسرع
    };
  }, [data]);

  useEffect(() => {
    debouncedSearch(searchQuery, activeCategory, sortBy, advancedFilters);
  }, [searchQuery, activeCategory, sortBy, advancedFilters, debouncedSearch]);

  const toggleFavorite = useCallback((productId) => {
    setFavorites(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  }, []);

  // حساب المنتجات للصفحة الحالية مع تحسين الذاكرة
  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handlePageChange = useCallback((page, newItemsPerPage) => {
    if (newItemsPerPage && newItemsPerPage !== itemsPerPage) {
      setItemsPerPage(newItemsPerPage);
      setCurrentPage(1);
    } else if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
    
    // التنقل إلى أعلى قسم المنتجات
    document.getElementById('pos-section')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }, [totalPages, itemsPerPage]);

  // خريطة الأيقونات
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
    default: Cpu,
  };

  const getIcon = (iconName) => {
    return iconMap[iconName?.toLowerCase()] || iconMap['default'];
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
          <Cpu className="w-24 h-24 text-gray-300 mx-auto mb-4 animate-bounce" />
          <p className="text-xl text-gray-600 mb-4">لا توجد بيانات متاحة</p>
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

        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
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
                placeholder="ابحث في أنظمة نقاط البيع والمواصفات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-12 pl-4 py-3 rounded-full border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 focus:shadow-lg"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAdvancedFilters(true)}
                className="flex items-center gap-2 px-4 py-3 rounded-full border border-gray-300 hover:border-purple-500 transition-all duration-300"
              >
                <SlidersHorizontal className="w-5 h-5" />
                فلاتر متقدمة
              </button>

              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 rounded-full border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-white transition-all duration-300 focus:shadow-lg"
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

            <div className="text-gray-600 font-medium">
              <span className={`transition-all duration-300 ${isSearching ? 'opacity-50' : 'opacity-100'}`}>
                {filteredProducts.length} من {data.products.length} منتج
              </span>
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
                const categoryCount = category.id === 'all' 
                  ? filteredProducts.length
                  : filteredProducts.filter(p => p.category === category.id).length;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`group flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 ${
                      activeCategory === category.id
                        ? `bg-gradient-to-r ${category.color} text-white shadow-lg scale-105`
                        : 'bg-white text-gray-700 hover:shadow-md border border-gray-200'
                    }`}
                  >
                    <IconComponent className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
                    <span className="font-medium">{category.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      activeCategory === category.id
                        ? 'bg-white/20'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {categoryCount}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section id="pos-section" className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isSearching ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">جاري البحث...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <Cpu className="w-24 h-24 text-gray-300 mx-auto mb-4 animate-bounce" />
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

      {/* Advanced Filters Modal */}
      <AdvancedFilters
        filters={advancedFilters}
        onFiltersChange={setAdvancedFilters}
        isOpen={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
      />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center text-white">
          <h2 className="text-4xl font-bold mb-6">تحتاج نظام نقاط بيع مخصص؟</h2>
          <p className="text-xl mb-8 opacity-90">
            أخبرنا نوع النشاط والحجم وسنقترح أفضل الحلول مع إعداد ودعم فني
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => {
                goToWatssap(null);
              }}
            className="bg-white text-purple-600 px-8 py-3 rounded-full font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
              تواصل معنا
            </button>
            <button onClick={() => {
                goToWatssap(null);
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

export default POSClient;