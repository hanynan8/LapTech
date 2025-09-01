"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, Star, Loader, Truck, Shield, Headphones, Award, ShoppingCart, ArrowRight, Zap, Cpu, MonitorSpeaker, Gamepad2, HardDrive, Smartphone, RefreshCw } from 'lucide-react';

// Icon mapping for features and categories
const iconMap = {
  truck: Truck,
  shield: Shield,
  headphones: Headphones,
  award: Award,
  smartphone: Smartphone,
  cpu: Cpu,
  monitorSpeaker: MonitorSpeaker,
  zap: Zap,
  gamepad2: Gamepad2,
  hardDrive: HardDrive
};

// Enhanced Skeleton Loader Component
const SkeletonLoader = ({ count = 2 }) => (
  <div className="grid md:grid-cols-2 gap-8 animate-pulse">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="bg-gray-100 rounded-3xl p-8">
        <div className="w-full h-64 bg-gray-200 rounded-2xl mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
        <div className="h-5 bg-gray-200 rounded w-1/2"></div>
      </div>
    ))}
  </div>
);

// Enhanced Product Card Component
const ProductCard = ({ product, categoryKey }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleAddToCart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    
    // Show success feedback
    const button = e.target.closest('button');
    const originalText = button.innerHTML;
    button.innerHTML = 'تم الإضافة ✓';
    button.classList.add('bg-green-500');
    
    setTimeout(() => {
      button.innerHTML = originalText;
      button.classList.remove('bg-green-500');
    }, 2000);
  }, [product]);

  return (
    <Link
      href={`/${categoryKey}/${product.id}`}
      className="group block"
      aria-label={`عرض تفاصيل ${product.name}`}
    >
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl overflow-hidden shadow-lg group-hover:shadow-2xl transform group-hover:scale-[1.02] transition-all duration-500">
        <div className="relative overflow-hidden">
          {!imageError ? (
            <>
              <img
                src={product.image}
                alt={product.name}
                width="400"
                height="256"
                className={`w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => setImageLoading(false)}
                onError={() => setImageError(true)}
                loading="lazy"
              />
              {imageLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                  <Loader className="w-8 h-8 text-gray-400 animate-spin" />
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-64 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <div className="text-gray-500 text-center">
                <div className="w-16 h-16 bg-gray-400 rounded-full mx-auto mb-2 opacity-50"></div>
                <span className="text-sm">صورة غير متاحة</span>
              </div>
            </div>
          )}
          
          <div className="absolute top-4 right-4">
            {product.badge && (
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                {product.badge}
              </span>
            )}
          </div>
          <div className="absolute top-4 left-4">
            {product.discount && (
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                خصم {product.discount}%
              </span>
            )}
          </div>
        </div>
        
        <div className="p-8">
          <h4 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2">{product.name}</h4>
          <p className="text-gray-600 mb-4 line-clamp-2">
            {product.description || product.specs?.processor || 'منتج عالي الجودة'}
          </p>
          
          {product.rating && (
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                />
              ))}
              <span className="text-gray-600 mr-2">({product.rating})</span>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-3xl font-bold text-purple-600">
                {typeof product.price === 'number' ? product.price.toLocaleString() : product.price}
                <span className="text-lg mr-1">{product.currency || 'ج.م'}</span>
              </span>
              {product.originalPrice && (
                <span className="text-xl text-gray-400 line-through mr-3">
                  {typeof product.originalPrice === 'number' ? product.originalPrice.toLocaleString() : product.originalPrice}
                  <span className="text-sm mr-1">{product.currency || 'ج.م'}</span>
                </span>
              )}
            </div>
          </div>
          
          <button 
            onClick={handleAddToCart}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-bold text-lg"
            aria-label={`إضافة ${product.name} إلى السلة`}
          >
            أضف للسلة
            <ShoppingCart className="w-5 h-5 inline mr-2" />
          </button>
        </div>
      </div>
    </Link>
  );
};

// Enhanced Category Section Component with better error handling
const CategorySection = ({ endpoint, apiUrl, initialProducts = [] }) => {
  const [categoryData, setCategoryData] = useState(initialProducts.length > 0 ? { 
    ...endpoint, 
    products: initialProducts 
  } : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const sectionRef = useRef(null);
  const hasLoadedRef = useRef(initialProducts.length > 0);

  const fetchCategoryData = useCallback(async () => {
    if (hasLoadedRef.current || loading) return;
    
    setLoading(true);
    setError(null);
    hasLoadedRef.current = true;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${apiUrl}?collection=${endpoint.key}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        
        let products = [];
        if (Array.isArray(result) && result.length > 0) {
          if (result[0].products) {
            products = result[0].products;
          } else if (result[0].data?.products) {
            products = result[0].data.products;
          }
        }

        const availableProducts = products.filter(product => 
          product.details?.isAvailable !== false && 
          product.details?.stock !== 0
        );
        
        setCategoryData({
          ...endpoint,
          products: availableProducts.slice(0, 2)
        });
      } else {
        throw new Error(`خطأ في الخادم: ${response.status}`);
      }
    } catch (err) {
      console.error(`Error fetching ${endpoint.key}:`, err);
      if (err.name === 'AbortError') {
        setError('انتهت مهلة الطلب، حاول مرة أخرى');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [endpoint.key, apiUrl, endpoint]);

  const cachedData = useMemo(() => categoryData, [categoryData]);

  useEffect(() => {
    if (initialProducts.length > 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasLoadedRef.current) {
            fetchCategoryData();
          }
        });
      },
      { rootMargin: '200px', threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [fetchCategoryData, initialProducts.length]);

  const IconComponent = endpoint.icon;

  const handleRetry = useCallback(() => {
    hasLoadedRef.current = false;
    setError(null);
    fetchCategoryData();
  }, [fetchCategoryData]);

  return (
    <div ref={sectionRef} className="mb-20">
      {/* Category Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className={`bg-gradient-to-r ${endpoint.color} w-12 h-12 rounded-xl flex items-center justify-center ml-4`}>
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{endpoint.name}</h3>
        </div>
        <Link 
          href={`/${endpoint.key}`} 
          className="text-purple-600 hover:text-purple-800 font-semibold flex items-center group"
          aria-label={`عرض جميع منتجات ${endpoint.name}`}
        >
          عرض الكل
          <ChevronRight className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Loading State */}
      {loading && <div className="py-12"><SkeletonLoader /></div>}

      {/* Products Grid */}
      {cachedData?.products && cachedData.products.length > 0 && !loading && (
        <div className="grid md:grid-cols-2 gap-8">
          {cachedData.products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              categoryKey={endpoint.key}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {cachedData?.products && cachedData.products.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-3xl p-12">
            <IconComponent className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">لا توجد منتجات متاحة في هذه الفئة حالياً</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12">
          <div className="bg-red-50 rounded-3xl p-8">
            <p className="text-red-500 mb-4">خطأ في تحميل منتجات {endpoint.name}: {error}</p>
            <button
              onClick={handleRetry}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center mx-auto"
            >
              <RefreshCw className="w-4 h-4 ml-2" />
              إعادة المحاولة
            </button>
          </div>
        </div>
      )}

      {/* Placeholder State */}
      {!cachedData && !loading && !error && (
        <div className="text-center py-12">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl p-12 opacity-50">
            <IconComponent className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">سيتم تحميل {endpoint.name} عند التمرير إليها</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Hero Section Component
const HeroSection = ({ heroData }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (heroData?.slides?.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % heroData.slides.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [heroData]);

  if (!heroData) {
    return (
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600">
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white max-w-4xl mx-auto px-4">
              <h1 className="text-6xl md:text-8xl font-bold mb-6 animate-fade-in-up">
                TechLap Elite
              </h1>
              <p className="text-2xl md:text-3xl mb-8 opacity-90 animate-fade-in-up animation-delay-200">
                أفضل الأجهزة التقنية
              </p>
              <button 
                className="bg-white text-purple-600 px-12 py-4 rounded-full text-xl font-bold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 animate-fade-in-up animation-delay-400"
              >
                تسوق الآن
                <ArrowRight className="w-6 h-6 inline mr-3" />
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-screen overflow-hidden">
      {heroData.slides?.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${slide.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white max-w-4xl mx-auto px-4">
              <h1 className="text-6xl md:text-8xl font-bold mb-6 animate-fade-in-up">
                {slide.title}
              </h1>
              <p className="text-2xl md:text-3xl mb-8 opacity-90 animate-fade-in-up animation-delay-200">
                {slide.subtitle}
              </p>
              <button 
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-12 py-4 rounded-full text-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 animate-fade-in-up animation-delay-400"
              >
                {heroData.buttonText || "تسوق الآن"}
                <ArrowRight className="w-6 h-6 inline mr-3" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {heroData.slides?.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
          {heroData.slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white' : 'bg-white/50'}`}
              aria-label={`الانتقال إلى الشريحة ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

// Main HomePage Component
const HomePage = ({ initialData, apiUrl }) => {
  const [homeData, setHomeData] = useState(initialData?.homeData);
  const [featuredProducts] = useState(initialData?.featuredProducts || []);
  
  // قائمة بجميع الـ endpoints
  const endpoints = [
    { key: 'accessories', name: 'الاكسسوارات', icon: iconMap.smartphone, color: 'from-purple-600 to-blue-600' },
    { key: 'laptop', name: 'اللابتوبات', icon: iconMap.cpu, color: 'from-blue-600 to-cyan-600' },
    { key: 'monitors', name: 'الشاشات', icon: iconMap.monitorSpeaker, color: 'from-green-600 to-emerald-600' },
    { key: 'component', name: 'المكونات', icon: iconMap.zap, color: 'from-red-600 to-pink-600' },
    { key: 'other', name: 'منتجات أخرى', icon: iconMap.hardDrive, color: 'from-orange-600 to-yellow-600' },
    { key: 'pc-build', name: 'تجميع الكمبيوتر', icon: iconMap.gamepad2, color: 'from-indigo-600 to-purple-600' },
    { key: 'pos', name: 'نقاط البيع', icon: iconMap.award, color: 'from-pink-600 to-rose-600' },
    { key: 'printers', name: 'الطابعات', icon: iconMap.truck, color: 'from-teal-600 to-cyan-600' },
    { key: 'storage-devices', name: 'أجهزة التخزين', icon: iconMap.hardDrive, color: 'from-gray-600 to-slate-600' }
  ];

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Hero Section */}
      <HeroSection heroData={homeData?.hero} />

      {/* Stats Section */}
      {homeData?.stats && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { count: homeData.stats.customersCount || "15,000+", label: "عميل" },
                { count: homeData.stats.productsCount || "500+", label: "منتج" },
                { count: `${homeData.stats.satisfactionPercentage || "98"}%`, label: "رضا العملاء" },
                { count: homeData.stats.avgShippingHours || "48", label: "ساعة للتوصيل" }
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl p-8 group-hover:shadow-2xl transform group-hover:scale-105 transition-all duration-300">
                    <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                      {typeof stat.count === 'number' ? stat.count.toLocaleString() : stat.count}
                    </div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      {/* Features Section */}
      {homeData?.features && (
        <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-gray-900 mb-4">لماذا تختارنا؟</h2>
              <p className="text-xl text-gray-600">نقدم أفضل الخدمات لضمان رضاكم التام</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {homeData.features.map((feature) => {
                const IconComponent = iconMap[feature.icon] || iconMap.truck;
                return (
                  <div key={feature.id} className="group">
                    <div className="bg-white rounded-2xl p-8 shadow-lg group-hover:shadow-2xl transform group-hover:-translate-y-2 transition-all duration-300">
                      <div className="bg-gradient-to-br from-purple-500 to-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Products by Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">تسوق حسب الفئات</h2>
            <p className="text-xl text-gray-600">اكتشف أفضل المنتجات من جميع الفئات</p>
          </div>
          {endpoints.map((endpoint) => (
            <CategorySection
              key={endpoint.key}
              endpoint={endpoint}
              apiUrl={apiUrl}
            />
          ))}
        </div>
      </section>

      {/* Categories Section */}
      {homeData?.categories && (
        <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-gray-900 mb-4">تسوق حسب الفئة</h2>
              <p className="text-xl text-gray-600">اختر الفئة المناسبة لاحتياجاتك</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {homeData.categories.map((category) => (
                <Link 
                  href={`/laptop`} 
                  key={category.id}
                  aria-label={`عرض فئة ${category.name}`}
                >
                  <div className="group cursor-pointer">
                    <div className="relative overflow-hidden rounded-3xl shadow-lg group-hover:shadow-2xl transform group-hover:scale-105 transition-all duration-500">
                      <img
                        src={category.image}
                        alt={category.imageAlt}
                        className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="absolute bottom-8 right-8 text-white">
                        <h3 className="text-3xl font-bold mb-2">{category.name}</h3>
                        <p className="text-lg opacity-90">{category.count} منتج متاح</p>
                      </div>
                      <div className="absolute top-6 left-6">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 group-hover:bg-white/30 transition-colors duration-300">
                          <ChevronRight className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {homeData?.testimonials && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-gray-900 mb-4">آراء عملائنا</h2>
              <p className="text-xl text-gray-600">اكتشف ما يقوله عملاؤنا عن خدماتنا</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {homeData.testimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-12 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-20 h-20 rounded-full ml-6"
                      loading="lazy"
                    />
                    <div>
                      <h4 className="text-2xl font-bold text-gray-900">{testimonial.name}</h4>
                      <p className="text-gray-600 text-lg">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center mb-6">
                    {[...Array(Math.floor(testimonial.rating || 0))].map((_, i) => (
                      <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 text-xl leading-relaxed italic">
                    "{testimonial.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center text-white">
            <h2 className="text-5xl font-bold mb-6">ابدأ رحلتك التقنية معنا</h2>
            <p className="text-2xl mb-12 opacity-90">اكتشف أفضل العروض واحصل على أجهزة بجودة عالمية</p>
            <button 
              className="bg-white text-purple-600 px-12 py-4 rounded-full text-xl font-bold hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              aria-label="تسوق الآن"
            >
              تسوق الآن
              <ShoppingCart className="w-6 h-6 inline mr-3" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;