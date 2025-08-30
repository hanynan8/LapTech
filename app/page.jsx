"use client"

import React, { useState, useEffect } from 'react';
import { ChevronRight, Star, Loader, Truck, Shield, Headphones, Award, ShoppingCart, ArrowRight, Play } from 'lucide-react';

const HomePage = ({ apiUrl = 'https://restaurant-back-end.vercel.app/api/data' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('API Error:', text);
        setErrorMsg(`خطأ في الخادم: ${response.status} ${response.statusText}`);
        setLoading(false);
        return;
      }

      const result = await response.json();
      console.log('API Response:', result);

      // استخراج بيانات الصفحة الرئيسية من الاستجابة
      if (result.home && Array.isArray(result.home) && result.home.length > 0) {
        setData(result.home[0]);
      } else {
        setErrorMsg('هيكلية البيانات غير متوقعة');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setErrorMsg('فشل في جلب البيانات: ' + err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (data?.hero?.slides?.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % data.hero.slides.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-xl text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="text-red-500 text-xl mb-4">{errorMsg || 'خطأ في تحميل البيانات'}</div>
        <button 
          onClick={fetchData}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const iconMap = {
    truck: Truck,
    shield: Shield,
    headphones: Headphones,
    award: Award
  };

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Header */}

      {/* Hero Section with Carousel */}
      <section className="relative h-screen overflow-hidden">
        {data.hero?.slides?.map((slide, index) => (
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
                <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-12 py-4 rounded-full text-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 animate-fade-in-up animation-delay-400">
                  {data.hero.buttonText}
                  <ArrowRight className="w-6 h-6 inline mr-3" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
          {data.hero?.slides?.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white' : 'bg-white/50'}`}
            />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats && (
              <>
                <div className="text-center group">
                  <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl p-8 group-hover:shadow-2xl transform group-hover:scale-105 transition-all duration-300">
                    <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                      {data.stats.customersCount.toLocaleString()}
                    </div>
                    <div className="text-gray-600">عميل</div>
                  </div>
                </div>
                <div className="text-center group">
                  <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl p-8 group-hover:shadow-2xl transform group-hover:scale-105 transition-all duration-300">
                    <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                      {data.stats.productsCount.toLocaleString()}
                    </div>
                    <div className="text-gray-600">منتج</div>
                  </div>
                </div>
                <div className="text-center group">
                  <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl p-8 group-hover:shadow-2xl transform group-hover:scale-105 transition-all duration-300">
                    <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                      {data.stats.satisfactionPercentage}%
                    </div>
                    <div className="text-gray-600">رضا العملاء</div>
                  </div>
                </div>
                <div className="text-center group">
                  <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl p-8 group-hover:shadow-2xl transform group-hover:scale-105 transition-all duration-300">
                    <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                      {data.stats.avgShippingHours}
                    </div>
                    <div className="text-gray-600">ساعة للتوصيل</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">لماذا تختارنا؟</h2>
            <p className="text-xl text-gray-600">نقدم أفضل الخدمات لضمان رضاكم التام</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {data.features?.map((feature) => {
              const IconComponent = iconMap[feature.icon] || Truck;
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

      {/* Products Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">منتجاتنا المميزة</h2>
            <p className="text-xl text-gray-600">اكتشف أحدث الأجهزة بأفضل الأسعار</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {data.products?.items?.map((product) => (
              <div key={product.id} className="group">
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl overflow-hidden shadow-lg group-hover:shadow-2xl transform group-hover:scale-[1.02] transition-all duration-500">
                  <div className="relative overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.imageAlt}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 right-4">
                      {product.badge && (
                        <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                          {product.badge}
                        </span>
                      )}
                    </div>
                    <div className="absolute top-4 left-4">
                      {product.discountPercent && (
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          خصم {product.discountPercent}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{product.name}</h3>
                    <p className="text-gray-600 mb-4">{product.description}</p>

                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-5 h-5 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                      <span className="text-gray-600 mr-2">({product.rating})</span>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <span className="text-3xl font-bold text-purple-600">{product.price.toLocaleString()} {product.currency}</span>
                        {product.originalPrice && (
                          <span className="text-xl text-gray-400 line-through mr-3">{product.originalPrice.toLocaleString()} {product.currency}</span>
                        )}
                      </div>
                    </div>

                    <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-bold text-lg">
                      أضف للسلة
                      <ShoppingCart className="w-5 h-5 inline mr-2" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">تسوق حسب الفئة</h2>
            <p className="text-xl text-gray-600">اختر الفئة المناسبة لاحتياجاتك</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {data.categories?.map((category) => (
              <div key={category.id} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-3xl shadow-lg group-hover:shadow-2xl transform group-hover:scale-105 transition-all duration-500">
                  <img 
                    src={category.image} 
                    alt={category.imageAlt}
                    className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700"
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
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">آراء عملائنا</h2>
            <p className="text-xl text-gray-600">اكتشف ما يقوله عملاؤنا عن خدماتنا</p>
          </div>

          <div className="grid md:grid-cols-1 max-w-4xl mx-auto">
            {data.testimonials?.map((testimonial) => (
              <div key={testimonial.id} className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-12 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center mb-6">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-20 h-20 rounded-full ml-6"
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

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center text-white">
            <h2 className="text-5xl font-bold mb-6">ابدأ رحلتك التقنية معنا</h2>
            <p className="text-2xl mb-12 opacity-90">اكتشف أفضل العروض واحصل على أجهزة بجودة عالمية</p>
            <button className="bg-white text-purple-600 px-12 py-4 rounded-full text-xl font-bold hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
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