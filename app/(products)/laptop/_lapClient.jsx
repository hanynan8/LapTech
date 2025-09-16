'use client';

import AddToCartButton from '../../(products)/_addToTheCart'; // Adjust the path based on your project structure

import { useSession } from 'next-auth/react';
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {
  Search,
  Filter,
  Star,
  ShoppingCart,
  Heart,
  Eye,
  ArrowRight,
  Laptop,
  Cpu,
  HardDrive,
  MonitorSpeaker,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Menu,
  X,
  Home,
  Grid3X3,
  Headphones,
  Mouse,
  Keyboard,
  Cable,
  Camera,
  Gamepad2,
  Watch,
  Smartphone,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// دالة الواتساب مع رسالة مخصصة (تصحيح الاسم والإضافة)
const goToWhatsapp = (product, number) => {
  let message = 'مرحبا! أنا مهتم باللابتوبات والملحقات. ';
  if (product) {
    message += `أريد طلب: ${product.name} - السعر: ${product.price} ${
      product.currency || 'ج.م'
    }. `;
  }
  message += 'هل يمكنك مساعدتي؟';
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${number}?text=${encodedMessage}`;
  window.open(whatsappUrl, '_blank');
};

// Mobile Navigation Bar Component مع السلة
const MobileNavBar = ({ onMenuToggle, isMenuOpen, isVisible, cartCount }) => {
  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 md:hidden transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Home className="w-6 h-6 text-purple-600" />
          <span className="text-lg font-bold text-purple-600">الرئيسية</span>
        </Link>

        <div className="flex items-center gap-3">
          {/* السلة */}
          <Link
            href="/cart"
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ShoppingCart className="w-6 h-6 text-purple-600" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -left-1 w-5 h-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>

          {/* زر القائمة */}
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors duration-300"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Mobile Menu Component
const MobileMenu = ({
  isOpen,
  onClose,
  activeCategory,
  setActiveCategory,
  categories,
  iconMap,
  data,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 md:hidden">
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      <div className="fixed top-16 right-0 bottom-0 w-80 bg-white shadow-xl transform transition-transform duration-300">
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Grid3X3 className="w-5 h-5" />
            فئات المنتجات
          </h3>
          <div className="space-y-3">
            {data?.categories?.map((category, index) => {
              const IconComponent = iconMap[category.icon] || Smartphone;
              const productCount =
                category.id === 'all'
                  ? data.products?.length || 0
                  : data.products?.filter((p) => p.category === category.id)
                      .length || 0;

              // إنشاء مفتاح فريد يجمع بين id والفهرس
              const uniqueKey = category.id
                ? `category-${category.id}`
                : `category-index-${index}`;

              return (
                <button
                  key={uniqueKey}
                  onClick={() => {
                    setActiveCategory(category.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    activeCategory === category.id
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      activeCategory === category.id
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {productCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Product Card محسن للموبايل
const ProductCard = React.memo(
  ({ product, favorites, toggleFavorite, index, whatsappNumber }) => {
    const fallbackImage =
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400';

    // تحسين معالجة الصورة
    const getValidImageUrl = (imageUrl) => {
      if (!imageUrl) return fallbackImage;

      // التحقق من صحة الرابط
      try {
        // إذا كان الرابط نسبي، تحويله إلى مطلق
        if (imageUrl.startsWith('/')) {
          return imageUrl;
        }

        // التحقق من صحة URL
        new URL(imageUrl);
        return imageUrl;
      } catch (error) {
        console.warn('Invalid image URL:', imageUrl, error);
        return fallbackImage;
      }
    };

    const [currentSrc, setCurrentSrc] = useState(
      getValidImageUrl(product.image)
    );
    const [isVisible, setIsVisible] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const cardRef = useRef();
    const { data: session } = useSession();

    // تحديث الصورة عند تغيير المنتج
    useEffect(() => {
      setCurrentSrc(getValidImageUrl(product.image));
      setImageLoaded(false);
    }, [product.image]);

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
          rootMargin: '100px 0px',
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

    // معالجة أخطاء الصورة
    const handleImageError = useCallback(() => {
      console.warn('Image failed to load:', currentSrc);
      if (currentSrc !== fallbackImage) {
        setCurrentSrc(fallbackImage);
      }
    }, [currentSrc, fallbackImage]);

    const handleImageLoad = useCallback(() => {
      setImageLoaded(true);
    }, []);

    return (
      <div
        ref={cardRef}
        className={`transition-all duration-500 ease-out transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={{
          transitionDelay: `${Math.min(index * 50, 300)}ms`,
        }}
      >
        <Link href={`/laptop/${product.id}`} className="group block">
          <div className="bg-white rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transform group-hover:scale-105 transition-all duration-300 mx-2 sm:mx-0">
            {/* Product Image */}
            <div className="relative overflow-hidden bg-gray-100 h-36 sm:h-48">
              {/* Skeleton loader */}
              {!imageLoaded && isVisible && (
                <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse"></div>
              )}

              {isVisible && (
                <Image
                  src={currentSrc || fallbackImage}
                  alt={product.name || 'منتج'}
                  fill
                  className={`object-cover group-hover:scale-110 transition-all duration-700 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoadingComplete={() => setImageLoaded(true)}
                  onError={() => setCurrentSrc(fallbackImage)}
                />
              )}

              {/* Badges */}
              <div className="absolute top-2 right-2">
                {product.badge && (
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                    {product.badge}
                  </span>
                )}
              </div>

              {product.discount && (
                <div className="absolute top-2 left-2">
                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-bounce">
                    خصم {product.discount}%
                  </span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-3 sm:p-4">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors duration-300">
                {product.name || 'اسم المنتج غير متاح'}
              </h3>

              {/* Rating */}
              {product.rating && (
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 sm:w-4 sm:h-4 transition-colors duration-200 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-gray-600 text-xs mr-1">
                    ({product.rating})
                  </span>
                </div>
              )}

              {/* Specs - مخفية في الموبايل الصغير */}
              {product.specs && Object.keys(product.specs).length > 0 && (
                <div className="hidden sm:block space-y-1 text-xs text-gray-600 mb-3">
                  {Object.entries(product.specs)
                    .slice(0, 2)
                    .map(([key, value], idx) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize">{key}:</span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                </div>
              )}

              {/* Price */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  {product.price ? (
                    <>
                      <span className="text-lg sm:text-xl font-bold text-purple-600">
                        {Number(product.price).toLocaleString()}{' '}
                        {product.currency || 'ج.م'}
                      </span>
                      {product.originalPrice && (
                        <div className="text-xs text-gray-400 line-through">
                          {Number(product.originalPrice).toLocaleString()}{' '}
                          {product.currency || 'ج.م'}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-sm font-bold text-gray-500">
                      السعر غير محدد
                    </span>
                  )}
                </div>
              </div>

              {/* زر الطلب */}
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <AddToCartButton product={product}>
                  اضف الي السلة
                </AddToCartButton>
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  }
);

// Pagination Component محسن للموبايل
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = window.innerWidth < 640 ? 5 : 7; // أقل في الموبايل

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= Math.min(4, totalPages); i++) pages.push(i);
        if (totalPages > 4) {
          pages.push('...');
          pages.push(totalPages);
        }
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = Math.max(totalPages - 3, 2); i <= totalPages; i++)
          pages.push(i);
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
    <div className="flex flex-col items-center gap-4 py-6">
      {/* Results Info */}
      <div className="text-gray-600 text-xs sm:text-sm">
        عرض {startItem}-{endItem} من {totalItems} منتج
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 sm:p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-200 text-sm ${
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
          className="p-1.5 sm:p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Main Client Component
const ProductsClient = ({ initialData, error }) => {
  // معالجة البيانات إذا كانت array
  const processedData = Array.isArray(initialData)
    ? initialData[0]
    : initialData;
  const [data] = useState(processedData);

  const [filteredProducts, setFilteredProducts] = useState(
    data?.products || []
  );
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [favorites, setFavorites] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [cartCount, setCartCount] = useState(0); // إضافة عداد السلة

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20); // مناسب للموبايل

  // الحصول على رقم الواتساب من البيانات
  const whatsappNumber = data?.settings?.whatsappNumber || '2001201061216';

  // إضافة دالة تحديث عداد السلة
  const { data: session } = useSession();

  const fetchCartCount = async () => {
    try {
      if (session) {
        const res = await fetch(
          'https://restaurant-back-end.vercel.app/api/data?collection=carts'
        );
        if (res.ok) {
          const data = await res.json();
          const userCart = data.filter(
            (item) => item.email === session.user.email
          );
          const count = userCart.reduce(
            (sum, item) => sum + (item.quantity || 1),
            0
          );
          setCartCount(count);
        }
      } else {
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
        const count = localCart.reduce(
          (sum, item) => sum + (item.quantity || 1),
          0
        );
        setCartCount(count);
      }
    } catch (err) {
      console.error('Error fetching cart count:', err);
    }
  };

  // تحديث عداد السلة
  useEffect(() => {
    fetchCartCount();

    // استماع للأحداث المخصصة للتحديث الفوري
    const handleCartUpdate = () => {
      fetchCartCount();
    };
    const handleProductAdded = (event) => {
      const { quantity = 1 } = event.detail || {};
      setCartCount((prev) => prev + quantity);
    };
    const handleProductRemoved = (event) => {
      const { quantity = 1 } = event.detail || {};
      setCartCount((prev) => Math.max(0, prev - quantity));
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('productAddedToCart', handleProductAdded);
    window.addEventListener('productRemovedFromCart', handleProductRemoved);

    // استماع لتغييرات localStorage للمستخدمين غير المسجلين
    const handleStorageChange = (e) => {
      if (e.key === 'cart' && !session) {
        fetchCartCount();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // polling للمستخدمين المسجلين
    let interval;
    if (session) {
      interval = setInterval(fetchCartCount, 10000);
    }

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('productAddedToCart', handleProductAdded);
      window.removeEventListener(
        'productRemovedFromCart',
        handleProductRemoved
      );
      window.removeEventListener('storage', handleStorageChange);
      if (interval) clearInterval(interval);
    };
  }, [session]);

  // تتبع التمرير لإظهار/إخفاء الـ mobile nav
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const heroSection = document.getElementById('hero-section');

          if (heroSection) {
            const heroHeight = heroSection.offsetHeight;
            // إظهار الـ mobile nav عند تجاوز الهيدر الأساسي
            if (currentScrollY > heroHeight - 100) {
              setShowMobileNav(true);
            } else {
              setShowMobileNav(false);
            }
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
          filtered = filtered.filter(
            (product) => product.category === category
          );
        }

        // فلترة حسب البحث
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          filtered = filtered.filter((product) => {
            const nameMatch = product.name?.toLowerCase().includes(term);
            const categoryMatch = product.category
              ?.toLowerCase()
              .includes(term);
            const specsMatch =
              product.specs &&
              Object.values(product.specs).some((spec) =>
                String(spec).toLowerCase().includes(term)
              );
            return nameMatch || categoryMatch || specsMatch;
          });
        }

        // ترتيب المنتجات
        switch (sort) {
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
    debouncedSearch(searchQuery, activeCategory, sortBy);
  }, [searchQuery, activeCategory, sortBy, debouncedSearch]);

  const toggleFavorite = useCallback((productId) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
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

  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
        // التنقل إلى أعلى قسم المنتجات
        document.getElementById('products-section')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    },
    [totalPages]
  );

  const iconMap = {
    smartphone: Smartphone,
    headphones: Headphones,
    mouse: Mouse,
    keyboard: Keyboard,
    cable: Cable,
    camera: Camera,
    gamepad2: Gamepad2,
    watch: Watch,
    laptop: Laptop,
    cpu: Cpu,
    'hard-drive': HardDrive,
    'monitor-speaker': MonitorSpeaker,
  };

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gray-100 px-4"
        dir="rtl"
      >
        <div className="text-center">
          <p className="text-red-500 text-lg sm:text-xl mb-4">
            خطأ في تحميل البيانات
          </p>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-300"
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
        className="min-h-screen flex items-center justify-center bg-gray-100 px-4"
        dir="rtl"
      >
        <div className="text-center">
          <Smartphone className="w-20 h-20 sm:w-24 sm:h-24 text-gray-300 mx-auto mb-4 animate-bounce" />
          <p className="text-lg sm:text-xl text-gray-600 mb-4">
            لا توجد بيانات منتجات متاحة
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
      {/* CSS للتحكم في الأنيميشن */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* شاشات صغيرة (موبايل) */
        @media (max-width: 768px) {
          section {
            top: 64px;
            transition: top 0.3s ease;
          }
        }
        @media (min-width: 768px) {
          section {
            top: 0px;
            transition: top 0.3s ease;
          }
        }
        select {
          width: auto;
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

        /* تحسين التمرير للموبايل */
        html {
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }

        /* تأكد أن المحتوى لا يتداخل مع الـ mobile nav */
        @media (max-width: 768px) {
          .mobile-nav-space {
            padding-top: 0px;
            transition: padding-top 0.3s ease;
          }
        }
      `}</style>

      {/* Mobile Navigation */}
      <MobileNavBar
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMenuOpen={isMobileMenuOpen}
        isVisible={showMobileNav}
        cartCount={cartCount}
      />

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        categories={data?.categories}
        iconMap={iconMap}
        data={data}
      />

      {/* Hero Section */}
      <section
        id="hero-section"
        className="bg-gradient-to-r from-purple-600 to-blue-600 py-16 sm:py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            {data.pageTitle || 'اللابتوبات والملحقات'}
          </h1>
          <p className="text-base sm:text-lg md:text-xl opacity-90 max-w-3xl mx-auto">
            {data.pageSubtitle || 'اكتشف أحدث اللابتوبات والملحقات التقنية'}
          </p>
        </div>
      </section>

      {/* Search and Filter Section - محدث */}
      <section
        className={`bg-white/95 backdrop-blur-sm py-4 sm:py-6 shadow-sm sticky z-30 border-b border-gray-200 mobile-nav-space ${
          showMobileNav ? 'with-nav' : ''
        }`}
        style={{
          transition: 'top 0.3s ease',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4">
            {/* Desktop Layout - صف واحد */}
            <div className="hidden md:flex items-center justify-between gap-6">
              <Link href="/" className="flex-shrink-0">
                <button
                  title="عودة إلى الرئيسية"
                  className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors duration-300"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>

              {/* Search Bar - يأخذ أكبر مساحة */}
              <div className="relative flex-1 max-w-2xl">
                <Search
                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-all duration-300 ${
                    isSearching ? 'animate-spin' : ''
                  }`}
                />
                <input
                  type="text"
                  placeholder="ابحث عن الاكسسوار المناسب..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-12 pl-4 py-3 rounded-full border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 focus:shadow-lg"
                />
              </div>

              {/* Sort Dropdown - مساحة متوسطة */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <Filter className="text-gray-400 w-5 h-5" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 rounded-full border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-white transition-all duration-300 focus:shadow-lg min-w-48"
                >
                  {data.filters && data.filters.sortOptions ? (
                    data.filters.sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="name">الاسم</option>
                      <option value="price-low">السعر: من الأقل للأعلى</option>
                      <option value="price-high">السعر: من الأعلى للأقل</option>
                      <option value="rating">التقييم</option>
                    </>
                  )}
                </select>
              </div>

              {/* Results Count - مساحة صغيرة */}
              <div className="text-gray-600 font-medium bg-gray-100 px-4 py-3 rounded-full flex-shrink-0">
                <span
                  className={`transition-all duration-300 ${
                    isSearching ? 'opacity-50' : 'opacity-100'
                  }`}
                >
                  {filteredProducts.length} منتج
                </span>
              </div>

              {/* إضافة السلة في Desktop */}
              <Link
                href="/cart"
                className="relative p-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:text-purple-600 transition-all duration-300 group flex-shrink-0"
              >
                <ShoppingCart
                  size={22}
                  className="group-hover:scale-110 transition-transform duration-200"
                />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -left-2 min-w-[22px] h-[22px] bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-pulse">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile Layout - صف واحد للكل */}
            <div
              className="md:hidden"
              style={{
                paddingTop: showMobileNav ? '0px' : '0px',
              }}
            >
              <div className="flex items-center gap-2">
                {/* شريط البحث - أكبر مساحة */}
                <div className="relative flex-1">
                  <Search
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 ${
                      isSearching ? 'animate-spin' : ''
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="ابحث..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 text-sm"
                  />
                </div>

                {/* فلتر التصنيف - متوسط */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-28 px-2 py-2.5 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-white transition-all duration-300 text-xs"
                >
                  {data.filters && data.filters.sortOptions ? (
                    data.filters.sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="name">الاسم</option>
                      <option value="price-low">سعر ↑</option>
                      <option value="price-high">سعر ↓</option>
                      <option value="rating">تقييم</option>
                    </>
                  )}
                </select>

                {/* عدد المنتجات - أصغر مساحة */}
                <div className="text-gray-600 text-xs font-medium bg-gray-100 px-2 py-2.5 rounded-xl whitespace-nowrap">
                  <span
                    className={`transition-all duration-300 ${
                      isSearching ? 'opacity-50' : 'opacity-100'
                    }`}
                  >
                    {filteredProducts.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Desktop Categories Filter - Fixed Version */}
      {data.categories && data.categories.length > 0 && (
        <section className="py-4 sm:py-6 bg-gray-50 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-3 justify-center">
              {data.categories?.map((category, index) => {
                const IconComponent = iconMap[category.icon] || Smartphone;
                const productCount =
                  category.id === 'all'
                    ? data.products?.length || 0
                    : data.products?.filter((p) => p.category === category.id)
                        .length || 0;

                // إنشاء مفتاح فريد يجمع بين id والفهرس
                const uniqueKey = category.id
                  ? `desktop-category-${category.id}`
                  : `desktop-category-index-${index}`;

                return (
                  <button
                    key={uniqueKey}
                    onClick={() => setActiveCategory(category.id)}
                    className={`group flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300 transform hover:scale-105 ${
                      activeCategory === category.id
                        ? `bg-gradient-to-r ${category.color} text-white shadow-lg scale-105`
                        : 'bg-white text-gray-700 hover:shadow-md border border-gray-200'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
                    <span className="font-medium text-sm">{category.name}</span>
                    {activeCategory === category.id && (
                      <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
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

      {/* Products Grid */}
      <section id="products-section" className="py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          {isSearching ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">جاري البحث...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 px-4">
              <Smartphone className="w-20 h-20 sm:w-24 sm:h-24 text-gray-300 mx-auto mb-4 animate-bounce" />
              <h3 className="text-xl sm:text-2xl font-bold text-gray-400 mb-2">
                لا توجد منتجات
              </h3>
              <p className="text-gray-500 text-sm sm:text-base">
                {searchQuery
                  ? 'جرب تغيير كلمات البحث'
                  : 'جرب تغيير معايير الفلترة'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-purple-600 hover:text-purple-800 font-medium text-sm sm:text-base"
                >
                  مسح البحث
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
      <section className="py-12 sm:py-16 bg-gradient-to-r from-purple-600 to-blue-600 relative overflow-hidden mx-0 rounded-2xl sm:rounded-none mb-4 sm:mb-0">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
            لم تجد ما تبحث عليه؟
          </h2>
          <p className="text-base sm:text-lg mb-6 sm:mb-8 opacity-90">
            تواصل معنا وسنساعدك في العثور على الاكسسوار المثالي
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={() => goToWhatsapp(null, whatsappNumber)}
              className="bg-white text-purple-600 px-6 sm:px-8 py-3 rounded-full font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-sm sm:text-base"
            >
              تواصل معنا عبر الواتساب
            </button>
            <Link href="/laptop">
              <button className="border-2 border-white text-white px-6 sm:px-8 py-3 rounded-full font-bold hover:bg-white hover:text-purple-600 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base">
                عرض جميع المنتجات
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Mobile Bottom Spacing */}
      <div className="h-4 md:hidden"></div>
    </div>
  );
};

export default ProductsClient;
