"use client"

// app/about/AboutUsClient.jsx (Client Component)

import { useState, useEffect } from 'react';
import { Users, Loader, Target, Award, Heart, Star, ChevronRight, Eye, Lightbulb, Shield, Rocket, Globe, TrendingUp, Laptop, Truck, Package, Play, Check, Clock, MapPin, Phone, Mail, MessageCircle, Calendar, Zap } from 'lucide-react';
import Link from 'next/link';

function goToWatssap() {
  window.open('https://wa.me/+2001201061216');
}

const AboutUsClient = ({ initialData, error: serverError }) => {
  const [activeValue, setActiveValue] = useState(0);
  const [activeTab, setActiveTab] = useState('history');
  const [aboutData, setAboutData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData && !serverError);
  const [error, setError] = useState(serverError);
  const [countersStarted, setCountersStarted] = useState(false);

  // Counter animation effect
  useEffect(() => {
    const handleScroll = () => {
      const achievementsSection = document.getElementById('achievements-section');
      if (achievementsSection && !countersStarted) {
        const rect = achievementsSection.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          setCountersStarted(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [countersStarted]);

  // Fallback data fetching if server-side failed
  useEffect(() => {
    if (!initialData && !serverError) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const response = await fetch('https://restaurant-back-end.vercel.app/api/data');
          
          if (!response.ok) {
            throw new Error('فشل في تحميل البيانات');
          }
          
          const data = await response.json();
          
          if (data.aboutus && data.aboutus.length > 0) {
            const actualData = data.aboutus[0].aboutus[0].aboutus[0];
            setAboutData(actualData);
          } else {
            throw new Error('لا توجد بيانات متاحة');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'حدث خطأ في تحميل البيانات');
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [initialData, serverError]);

  const iconMap = {
    users: Users,
    target: Target,
    award: Award,
    heart: Heart,
    shield: Shield,
    lightbulb: Lightbulb,
    rocket: Rocket,
    globe: Globe,
    "trending-up": TrendingUp,
    eye: Eye,
    laptop: Laptop,
    truck: Truck,
    package: Package,
    play: Play,
    check: Check,
    clock: Clock,
    mapPin: MapPin,
    phone: Phone,
    mail: Mail,
    messageCircle: MessageCircle,
    calendar: Calendar,
    zap: Zap
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4" dir="rtl">
        <div className="text-center">
          <Loader className="w-8 h-8 sm:w-12 sm:h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-lg sm:text-xl text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4" dir="rtl">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg max-w-md mx-auto">
            <p className="text-lg sm:text-xl font-bold">خطأ في تحميل البيانات</p>
            <p className="mt-2 text-sm sm:text-base">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-purple-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!aboutData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4" dir="rtl">
        <div className="text-center">
          <p className="text-lg sm:text-xl text-gray-600">لا توجد بيانات متاحة</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Enhanced Hero Section */}
      <section className="relative h-screen overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${aboutData.hero.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-blue-900/20"></div>
          <div className="flex items-center justify-center h-full relative">
            <div className="text-center text-white max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-4 sm:mb-6 animate-fade-in-up">
                <span className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium">
                  {aboutData.hero.additionalContent?.welcomeMessage}
                </span>
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-4 sm:mb-6 animate-fade-in-up bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent leading-tight">
                {aboutData.hero.title}
              </h1>
              <p className="text-lg sm:text-2xl md:text-3xl mb-6 sm:mb-8 opacity-90 animate-fade-in-up animation-delay-200">
                {aboutData.hero.subtitle}
              </p>
              <p className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto opacity-80 animate-fade-in-up animation-delay-400 leading-relaxed px-2">
                {aboutData.hero.description}
              </p>
              
              <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center animate-fade-in-up animation-delay-600 px-4">
                <Link href='#ourStory'>
                  <button className="group bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center w-full sm:w-auto">
                    <Play className="w-4 sm:w-5 h-4 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    {aboutData.hero.additionalContent?.primaryButton?.text}
                  </button>
                </Link>
                <Link href={'/laptop'}>
                  <button className="border-2 border-white/50 backdrop-blur-sm text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold hover:bg-white hover:text-gray-900 transform hover:scale-105 transition-all duration-300 w-full sm:w-auto">
                    {aboutData.hero.additionalContent?.secondaryButton?.text}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 rotate-90" />
        </div>
      </section>

      {/* Story Section with Tabs */}
      <section id='ourStory' className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">{aboutData.story.title}</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-2">اكتشف رحلتنا عبر الزمن وكيف أصبحنا الخيار الأول</p>
          </div>

          <div className="flex flex-wrap justify-center mb-8 sm:mb-12 gap-2 sm:gap-4 px-2">
            {aboutData.story.tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 sm:px-8 py-2 sm:py-3 rounded-full font-bold transition-all duration-300 text-sm sm:text-base ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.title}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8 sm:gap-16 items-center">
            <div className="order-2 md:order-1 px-2">
              {aboutData.story.tabs.map((tab) => (
                activeTab === tab.id && (
                  <div key={tab.id} className="space-y-4 sm:space-y-6">
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">{tab.content.title}</h3>
                    {tab.id === 'history' && (
                      <>
                        <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                          {tab.content.description}
                        </p>
                        <div className="space-y-3 sm:space-y-4">
                          {tab.content.milestones?.map((milestone, index) => (
                            <div key={index} className="flex items-center gap-3 sm:gap-4">
                              <div className={`w-3 h-3 bg-${milestone.color}-600 rounded-full flex-shrink-0`}></div>
                              <span className="text-sm sm:text-base text-gray-700">{milestone.text}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    
                    {tab.id === 'milestones' && (
                      <div className="space-y-4 sm:space-y-6">
                        {tab.content.timeline?.map((item, index) => (
                          <div key={index} className={`border-r-4 border-${item.color}-600 pr-4 sm:pr-6`}>
                            <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{item.year} - {item.title}</h4>
                            <p className="text-sm sm:text-base text-gray-700">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {tab.id === 'future' && (
                      <>
                        <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                          {tab.content.description}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          {tab.content.features?.map((feature, index) => {
                            const IconComponent = iconMap[feature.icon] || Zap;
                            return (
                              <div key={index} className={`bg-gradient-to-br ${feature.gradient} p-3 sm:p-4 rounded-2xl`}>
                                <IconComponent className="w-6 sm:w-8 h-6 sm:h-8 text-purple-600 mb-2" />
                                <h4 className="font-bold text-gray-900 text-sm sm:text-base">{feature.title}</h4>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                    
                    <div className="mt-6 sm:mt-8">
                      <div className="bg-gradient-to-r from-purple-600 to-blue-600 w-16 sm:w-24 h-1 rounded"></div>
                    </div>
                  </div>
                )
              ))}
            </div>

            <div className="order-1 md:order-2 relative group px-2 md:px-0">
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
                <img 
                  src={aboutData.story.image}
                  alt="Our Story"
                  className="w-full h-64 sm:h-96 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20"></div>
                <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6">
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl px-3 sm:px-6 py-2 sm:py-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 sm:w-5 h-4 sm:h-5 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
            <div className="group bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-12 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-16 sm:w-20 h-16 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-300">
                <Target className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
              </div>
              <h3 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">{aboutData.mission.title}</h3>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-4 sm:mb-6">{aboutData.mission.content}</p>
            </div>
            
            <div className="group bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-12 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-16 sm:w-20 h-16 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-300">
                <Eye className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
              </div>
              <h3 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">{aboutData.vision.title}</h3>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-4 sm:mb-6">{aboutData.vision.content}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              {aboutData.sections?.valuesSection?.title || "قيمنا الأساسية"}
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              {aboutData.sections?.valuesSection?.subtitle || "المبادئ التي تقودنا نحو التميز والإبداع"}
            </p>
            <div className="mt-6 sm:mt-8 flex justify-center">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 w-20 sm:w-32 h-1 rounded"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {aboutData.values.map((value, index) => {
              const IconComponent = iconMap[value.icon] || Heart;
              return (
                <div 
                  key={value.id} 
                  className="group cursor-pointer"
                  onClick={() => setActiveValue(index)}
                >
                  <div className={`bg-gradient-to-br from-white to-gray-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-4 transition-all duration-500 relative overflow-hidden ${activeValue === index ? 'ring-4 ring-purple-400 scale-105' : ''}`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative z-10">
                      <div className="bg-gradient-to-br from-purple-500 to-blue-500 w-14 sm:w-18 h-14 sm:h-18 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        <IconComponent className="w-7 sm:w-9 h-7 sm:h-9 text-white" />
                      </div>
                      
                      <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-purple-600 transition-colors duration-300">
                        {value.title}
                      </h3>
                      
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-3 sm:mb-4">
                        {value.description}
                      </p>
                      
                      <div className="flex items-center text-purple-600 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <Check className="w-3 sm:w-4 h-3 sm:h-4 ml-1" />
                        <span className="text-xs sm:text-sm font-semibold">تطبق دائماً</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-gray-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6">{aboutData.sections?.whyChooseUsSection?.title}</h2>
            <p className="text-lg sm:text-xl opacity-80 px-2">{aboutData.sections?.whyChooseUsSection?.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {aboutData.whyChooseUs.map((item) => {
              const IconComponent = iconMap[item.icon] || Shield;
              return (
                <div key={item.id} className="text-center group">
                  <div className={`bg-gradient-to-br ${item.gradient} w-16 sm:w-20 h-16 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{item.title}</h3>
                  <p className="text-gray-300 text-sm sm:text-base px-2">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              {aboutData.sections?.brandsSection?.title}
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 px-2">
              {aboutData.sections?.brandsSection?.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-8">
            {aboutData.brands.map((brand, index) => (
              <div key={index} className="group">
                <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 h-24 sm:h-32 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  {brand.logo ? (
                    <img 
                      src={brand.logo} 
                      alt={brand.name} 
                      className="max-h-10 sm:max-h-16 max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-lg sm:text-2xl font-bold text-gray-700 group-hover:text-purple-600 transition-colors text-center">
                      {brand.name}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section id="achievements-section" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              {aboutData.sections?.achievementsSection?.title}
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 px-2">
              {aboutData.sections?.achievementsSection?.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {aboutData.achievements.map((achievement) => {
              const IconComponent = iconMap[achievement.icon] || Award;
              return (
                <div key={achievement.id} className="text-center group">
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-lg group-hover:shadow-2xl transform group-hover:scale-105 transition-all duration-500 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative z-10">
                      <div className="bg-gradient-to-br from-purple-500 to-blue-500 w-16 sm:w-20 h-16 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                        <IconComponent className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
                      </div>
                      
                      <div className={`text-3xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2 ${countersStarted ? 'animate-pulse' : ''}`}>
                        {achievement.number}
                      </div>
                      
                      <div className="text-gray-600 text-sm sm:text-lg font-semibold">
                        {achievement.label}
                      </div>
                      
                      <div className="mt-3 sm:mt-4 w-12 sm:w-16 h-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">{aboutData.sections?.reviewsSection?.title}</h2>
            <p className="text-lg sm:text-xl text-gray-600 px-2">{aboutData.sections?.reviewsSection?.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {aboutData.reviews.map((review) => (
              <div key={review.id} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center mb-4 sm:mb-6">
                  <img 
                    src={review.image} 
                    alt={review.name}
                    className="w-12 sm:w-16 h-12 sm:h-16 rounded-full object-cover ml-3 sm:ml-4"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 text-base sm:text-lg">{review.name}</h4>
                    <p className="text-gray-600 text-sm">{review.role}</p>
                  </div>
                </div>
                
                <div className="flex items-center mb-3 sm:mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-700 leading-relaxed italic text-sm sm:text-base">"{review.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-white/10 rounded-full -translate-x-32 sm:-translate-x-48 -translate-y-32 sm:-translate-y-48 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-white/10 rounded-full translate-x-32 sm:translate-x-48 translate-y-32 sm:translate-y-48 animate-pulse animation-delay-1000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center text-white">
            <h2 className="text-4xl sm:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              {aboutData.sections?.ctaSection?.title}
            </h2>
            <p className="text-lg sm:text-2xl mb-6 sm:mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed px-2">
              {aboutData.sections?.ctaSection?.subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-8 sm:mb-12 px-4">
              <Link href={'/laptop'}>
                <button className="group bg-white text-purple-600 px-8 sm:px-12 py-3 sm:py-4 rounded-full text-lg sm:text-xl font-bold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center w-full sm:w-auto">
                  <Laptop className="w-5 sm:w-6 h-5 sm:h-6 ml-2 sm:ml-3 group-hover:scale-110 transition-transform" />
                  {aboutData.sections?.ctaSection?.buttons?.primary?.text}
                </button>
              </Link>
              <button onClick={() => {goToWatssap()}} className="group border-2 border-white/50 backdrop-blur-sm text-white px-8 sm:px-12 py-3 sm:py-4 rounded-full text-lg sm:text-xl font-bold hover:bg-white hover:text-purple-600 transform hover:scale-105 transition-all duration-300 flex items-center justify-center w-full sm:w-auto">
                <MessageCircle className="w-5 sm:w-6 h-5 sm:h-6 ml-2 sm:ml-3 group-hover:scale-110 transition-transform" />
                {aboutData.sections?.ctaSection?.buttons?.secondary?.text}
              </button>
            </div>
            
            {/* Trust indicators */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto text-center">
              {aboutData.trustIndicators.map((indicator, index) => (
                <div key={index}>
                  <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">{indicator.number}</div>
                  <div className="text-xs sm:text-sm opacity-75">{indicator.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUsClient;